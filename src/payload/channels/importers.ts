import { lookup } from "dns/promises";
import { isIP } from "net";
import type { PayloadHandler, PayloadRequest } from "payload";
import { addDataAndFileToRequest } from "payload";
import { canReq } from "../business/roles";
import { currentTenantId } from "../crm/tenant";
import { resetKnowledge } from "../chat/knowledge";
import { siteConnectionOf } from "./collections";

/**
 * Bilgi tabanını doldurma:
 *   POST /api/knowledge/site-tara   işletmenin kayıtlı site adreslerini tarar (site haritası, yoksa ana sayfa bağlantıları)
 *   POST /api/knowledge/belge       PDF, TXT ya da MD belgesinden metin çıkarır
 * Yalnız Chatbot modülü olan kullanıcı, seçili işletme için. Tarama yalnız
 * "Site bağlantısı"ndaki adreslere gider; yerel ve iç ağ adresleri engellenir.
 */

const MAX_PAGES = 25;
const MAX_PAGE_CHARS = 6000;
const MAX_DOC_CHARS = 60000;
const CHUNK = 5000;

const json = (body: Record<string, unknown>, status = 200) => Response.json(body, { status, headers: { "Cache-Control": "no-store" } });

/* İç ağ, yerel ve bulut üst veri adresleri (SSRF koruması) */
function privateIp(ip: string) {
  if (ip.includes(":")) {
    const v = ip.toLowerCase();
    return v === "::1" || v.startsWith("fc") || v.startsWith("fd") || v.startsWith("fe80") || v.startsWith("::ffff:127.") || v === "::";
  }
  const [a, b] = ip.split(".").map(Number);
  return a === 10 || a === 127 || a === 0 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || (a === 100 && b >= 64 && b <= 127) || a >= 224;
}
async function safeHost(host: string) {
  if (!host || host === "localhost" || host.endsWith(".local") || host.endsWith(".internal") || isIP(host)) return false;
  try {
    const addrs = await lookup(host, { all: true });
    return addrs.length > 0 && addrs.every((a) => !privateIp(a.address));
  } catch {
    return false;
  }
}

/* Yönlendirmeler elle izlenir: her adımda adres yeniden denetlenir (iç ağa yönlendirme okunmaz) */
async function fetchText(url: string, accept: string, maxBytes = 1_500_000): Promise<string | null> {
  try {
    let current = new URL(url);
    for (let hop = 0; hop < 4; hop++) {
      if (!/^https?:$/.test(current.protocol) || !(await safeHost(current.hostname))) return null;
      const r = await fetch(current, { headers: { accept, "user-agent": "GuruPanel-BilgiTabani/1.0" }, redirect: "manual", signal: AbortSignal.timeout(8000) });
      if (r.status >= 300 && r.status < 400 && r.headers.get("location")) {
        current = new URL(r.headers.get("location")!, current);
        continue;
      }
      if (!r.ok) return null;
      /* Sayfa beklenirken yalnız HTML; site haritası beklenirken XML */
      const type = r.headers.get("content-type") ?? "";
      if (accept.startsWith("text/html") && !type.includes("html")) return null;
      const len = Number(r.headers.get("content-length") ?? 0);
      if (len > maxBytes) return null;
      const text = await r.text();
      return text.length > maxBytes ? text.slice(0, maxBytes) : text;
    }
    return null;
  } catch {
    return null;
  }
}

const ENTITIES: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", ccedil: "ç", Ccedil: "Ç", ouml: "ö", Ouml: "Ö", uuml: "ü", Uuml: "Ü" };
const decode = (s: string) =>
  s.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (m, e: string) => {
    if (e[0] === "#") {
      const n = e[1]?.toLowerCase() === "x" ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
      return Number.isFinite(n) ? String.fromCodePoint(n) : m;
    }
    return ENTITIES[e] ?? m;
  });

/** Sayfanın başlığı ve okunur metni (menü, alt bilgi, betik ve stiller atılır) */
export function htmlToText(html: string): { title: string; text: string } {
  const title = decode(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? "").replace(/\s+/g, " ").trim();
  const main = html.match(/<main[\s\S]*?<\/main>/i)?.[0] ?? html.match(/<body[\s\S]*?<\/body>/i)?.[0] ?? html;
  const text = decode(
    main
      .replace(/<(script|style|noscript|svg|template|iframe|nav|footer|header|form)[\s\S]*?<\/\1>/gi, " ")
      .replace(/<(br|\/p|\/div|\/li|\/h[1-6]|\/tr|\/section|\/article)[^>]*>/gi, "\n")
      .replace(/<[^>]+>/g, " "),
  )
    .replace(/[ \t\f\v]+/g, " ")
    .replace(/\n\s*\n+/g, "\n")
    .trim();
  return { title, text };
}

async function sitemapUrls(origin: string): Promise<string[]> {
  const xml = await fetchText(`${origin}/sitemap.xml`, "application/xml,text/xml");
  if (!xml) return [];
  const locs = [...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/gi)].map((m) => decode(m[1]));
  /* Site haritası dizini: bir seviye içine bakılır */
  if (/<sitemapindex/i.test(xml)) {
    const nested: string[] = [];
    for (const sm of locs.slice(0, 5)) {
      const x = await fetchText(sm, "application/xml,text/xml");
      if (x) nested.push(...[...x.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/gi)].map((m) => decode(m[1])));
    }
    return nested;
  }
  return locs;
}

async function homepageLinks(origin: string): Promise<string[]> {
  const html = await fetchText(origin, "text/html");
  if (!html) return [];
  const out = new Set<string>([origin + "/"]);
  for (const m of html.matchAll(/href=["']([^"'#]+)["']/gi)) {
    try {
      const u = new URL(m[1], origin);
      if (u.origin === origin && !/\.(jpe?g|png|gif|webp|svg|pdf|zip|mp4|css|js)$/i.test(u.pathname)) out.add(u.origin + u.pathname);
    } catch {
      /* geçersiz bağlantı */
    }
  }
  return [...out];
}

async function upsert(req: PayloadRequest, tenant: number, entry: { title: string; content: string; source: "site" | "belge"; sourceUrl: string }) {
  const found = await req.payload.find({ collection: "knowledge", where: { and: [{ tenant: { equals: tenant } }, { sourceUrl: { equals: entry.sourceUrl } }] }, limit: 1, depth: 0, req, overrideAccess: true });
  if (found.docs[0]) {
    await req.payload.update({ collection: "knowledge", id: found.docs[0].id, data: { title: entry.title, content: entry.content }, req, overrideAccess: true });
    return "guncellendi";
  }
  await req.payload.create({ collection: "knowledge", data: { ...entry, active: true, tenant }, req, overrideAccess: true });
  return "eklendi";
}

export const crawlSite: PayloadHandler = async (req) => {
  if (!canReq(req, "chat")) return json({ ok: false, error: "Yetki yok." }, 403);
  const tenant = await currentTenantId(req);
  if (!tenant) return json({ ok: false, error: "İşletme seçili değil." }, 400);
  const conn = await siteConnectionOf(req.payload, tenant, req);
  const origins = (conn.allowedOrigins ?? []).map((o) => o.origin).filter(Boolean) as string[];
  if (!origins.length) return json({ ok: false, error: "Önce Ayarlar > Site bağlantısı'na sitenizin adresini ekleyin." }, 400);

  const pages: string[] = [];
  const skipped: string[] = [];
  for (const origin of origins) {
    const host = new URL(origin).hostname;
    if (!(await safeHost(host))) {
      skipped.push(`${origin} (erişilemiyor ya da iç ağ adresi)`);
      continue;
    }
    let urls = (await sitemapUrls(origin)).filter((u) => {
      try {
        return new URL(u).origin === origin;
      } catch {
        return false;
      }
    });
    if (!urls.length) urls = await homepageLinks(origin);
    for (const u of urls) if (pages.length < MAX_PAGES && !pages.includes(u)) pages.push(u);
  }
  if (!pages.length) return json({ ok: false, error: `Sayfa bulunamadı. ${skipped.join(", ")}`.trim() }, 400);

  let added = 0;
  let updated = 0;
  let empty = 0;
  for (let i = 0; i < pages.length; i += 4) {
    const batch = await Promise.all(pages.slice(i, i + 4).map(async (u) => ({ u, html: await fetchText(u, "text/html") })));
    for (const { u, html } of batch) {
      if (!html) {
        empty++;
        continue;
      }
      const { title, text } = htmlToText(html);
      if (text.length < 200) {
        empty++;
        continue;
      }
      const r = await upsert(req, tenant, { title: (title || new URL(u).pathname).slice(0, 120), content: text.slice(0, MAX_PAGE_CHARS), source: "site", sourceUrl: u });
      if (r === "eklendi") added++;
      else updated++;
    }
  }
  resetKnowledge();
  return json({ ok: true, pages: pages.length, added, updated, empty, skipped });
};

export const importDocument: PayloadHandler = async (req) => {
  if (!canReq(req, "chat")) return json({ ok: false, error: "Yetki yok." }, 403);
  const tenant = await currentTenantId(req);
  if (!tenant) return json({ ok: false, error: "İşletme seçili değil." }, 400);
  await addDataAndFileToRequest(req);
  const file = req.file;
  if (!file) return json({ ok: false, error: "Dosya seçin." }, 400);
  if (file.size > 4 * 1024 * 1024) return json({ ok: false, error: "Dosya en çok 4 MB olabilir." }, 400);
  const name = file.name || "Belge";
  let text = "";
  if (/\.pdf$/i.test(name) || file.mimetype === "application/pdf") {
    try {
      /* Geliştirmede şema aracı (drizzle-kit) dizilere numaralanabilir "random" ekliyor; PDF motoru bunu
         görünce duruyor. Özellik korunur, yalnız numaralanmaz yapılır. */
      const extra = Object.getOwnPropertyDescriptor(Array.prototype, "random");
      if (extra?.enumerable) Object.defineProperty(Array.prototype, "random", { ...extra, enumerable: false });
      const { extractText, getDocumentProxy } = await import("unpdf");
      const pdf = await getDocumentProxy(new Uint8Array(file.data));
      const r = await extractText(pdf, { mergePages: true });
      text = Array.isArray(r.text) ? r.text.join("\n") : r.text;
    } catch (err) {
      req.payload.logger.error({ err }, "Bilgi tabanı: PDF okunamadı");
      return json({ ok: false, error: "PDF okunamadı. Şifreli ya da bozuk olabilir; metni TXT olarak deneyin." }, 400);
    }
  } else if (/\.(txt|md)$/i.test(name) || file.mimetype?.startsWith("text/")) {
    text = file.data.toString("utf8");
  } else {
    return json({ ok: false, error: "PDF, TXT ya da MD dosyası yükleyin." }, 400);
  }
  text = text.replace(/[ \t]+/g, " ").replace(/\n\s*\n+/g, "\n").trim().slice(0, MAX_DOC_CHARS);
  if (text.length < 50) return json({ ok: false, error: "Belgede okunur metin bulunamadı (taranmış görüntü olabilir)." }, 400);
  const parts = Math.ceil(text.length / CHUNK);
  const base = name.replace(/\.[a-z0-9]+$/i, "");
  for (let i = 0; i < parts; i++) {
    await upsert(req, tenant, {
      title: parts > 1 ? `${base} (${i + 1}/${parts})` : base,
      content: text.slice(i * CHUNK, (i + 1) * CHUNK),
      source: "belge",
      sourceUrl: `belge:${base}:${i + 1}`,
    });
  }
  resetKnowledge();
  return json({ ok: true, parts, chars: text.length });
};
