import type { PayloadRequest } from "payload";
import { cms } from "@/lib/cms";
import { brandOf } from "@/payload/crm/brand";
import { quoteHtml } from "@/payload/crm/quote-print";
import { logActivity } from "@/payload/crm/automation";
import { notifyTeam } from "@/payload/notify";
import type { Quote } from "@/payload-types";
import { sql } from "@payloadcms/db-postgres";

/**
 * Müşteriye açık teklif bağlantısı: /teklif/<anahtar>. Anahtar tahmin
 * edilemez (panelden "Müşteriye gönder" ya da "Bağlantıyı kopyala" üretir).
 * GET belgeyi açar ve ilk açılışı kaydeder; POST Kabul ya da Red yanıtını yazar.
 */
export const dynamic = "force-dynamic";
const TOKEN = /^[A-Za-z0-9_-]{24,64}$/;
const idOf = (v: unknown) => (v && typeof v === "object" ? ((v as { id?: number }).id ?? null) : ((v as number | null | undefined) ?? null));
const headers = { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow", "Referrer-Policy": "no-referrer" };

async function load(token: string) {
  if (!TOKEN.test(token)) return null;
  const payload = await cms();
  const r = await payload.find({ collection: "quotes", where: { publicToken: { equals: token } }, limit: 1, depth: 1, overrideAccess: true });
  return r.docs[0] ? { payload, q: r.docs[0] as Quote } : null;
}

/* Bağlantı önizleme botları (WhatsApp, Slack, Outlook…) ve paneldeki ekip "açıldı" saymaz */
const PREVIEW_BOT = /bot|crawl|spider|facebookexternalhit|whatsapp|slack|telegram|discord|skype|microsoft office|outlook|preview|curl|wget|headless/i;

const notFound = () => new Response("<!doctype html><meta charset=utf-8><title>Teklif bulunamadı</title><p style=\"font-family:system-ui;padding:40px\">Bu teklif bağlantısı geçerli değil ya da teklif kaldırıldı.</p>", { status: 404, headers });

export async function GET(request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const found = await load(token);
  if (!found) return notFound();
  const { payload, q } = found;
  const req = { payload } as PayloadRequest;
  /* İlk açılış: fırsatın akışına "Müşteri teklifi açtı" */
  const team = /(?:^|;\s*)payload-token=/.test(request.headers.get("cookie") ?? "");
  if (!q.viewedAt && !team && !PREVIEW_BOT.test(request.headers.get("user-agent") ?? "")) {
    const now = new Date().toISOString();
    await payload.update({ collection: "quotes", id: q.id, data: { viewedAt: now }, overrideAccess: true, context: { crmSkip: true } }).catch(() => null);
    await logActivity(req, { type: "sistem", title: `Müşteri teklifi açtı: ${q.number ?? ""}`.trim(), deal: idOf(q.deal) ?? undefined, contact: idOf(q.contact) ?? undefined, company: idOf(q.company) ?? undefined });
  }
  const brand = await brandOf(req, q.tenant);
  return new Response(quoteHtml(q, brand, { token, status: q.status, respondedAt: q.respondedAt, customerNote: q.customerNote }), { headers });
}

export async function POST(req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const found = await load(token);
  if (!found) return Response.json({ error: "Teklif bulunamadı" }, { status: 404 });
  const { payload, q } = found;
  const body = (await req.json().catch(() => ({}))) as { karar?: string; not?: string };
  if (body.karar !== "kabul" && body.karar !== "red") return Response.json({ error: "Geçersiz yanıt" }, { status: 400 });
  if (q.status === "kabul" || q.status === "red") return Response.json({ error: "Bu teklif zaten yanıtlandı" }, { status: 409 });
  const note = String(body.not ?? "").trim().slice(0, 2000);
  /* Çift tık ya da iki sekme: yanıtı yalnız ilk istek alır (koşullu tek satır güncelleme) */
  const claim = (await payload.db.drizzle.execute(sql`UPDATE "quotes" SET "responded_at" = now() WHERE "id" = ${q.id} AND "responded_at" IS NULL RETURNING "id"`)) as unknown as { rows?: unknown[] };
  if (!claim.rows?.length) return Response.json({ error: "Bu teklif zaten yanıtlandı" }, { status: 409 });
  /* Durum kancası: Kabul fırsatı Kazanıldı'ya taşır */
  try {
    await payload.update({ collection: "quotes", id: q.id, data: { status: body.karar, respondedAt: new Date().toISOString(), customerNote: note || null }, overrideAccess: true });
  } catch (err) {
    /* Yazılamadıysa yanıt hakkı geri verilir */
    await payload.db.drizzle.execute(sql`UPDATE "quotes" SET "responded_at" = NULL WHERE "id" = ${q.id}`).catch(() => null);
    payload.logger.error({ err }, "Teklif yanıtı kaydedilemedi");
    return Response.json({ error: "Yanıt kaydedilemedi, lütfen tekrar deneyin" }, { status: 500 });
  }
  const preq = { payload } as PayloadRequest;
  const ok = body.karar === "kabul";
  await logActivity(preq, { type: "sistem", title: `Müşteri teklifi ${ok ? "kabul etti" : "reddetti"}: ${q.number ?? ""}`.trim(), body: note ? `Müşterinin notu: ${note}` : undefined, deal: idOf(q.deal) ?? undefined, contact: idOf(q.contact) ?? undefined, company: idOf(q.company) ?? undefined });
  const who = (q.company && typeof q.company === "object" ? q.company.name : null) ?? (q.contact && typeof q.contact === "object" ? q.contact.name : null) ?? "Müşteri";
  await notifyTeam(preq, {
    subject: `Teklif ${ok ? "kabul edildi" : "reddedildi"}: ${q.number ?? q.title}`,
    intro: `${who}, ${q.number ?? ""} numaralı teklifi ${ok ? "kabul etti. Fırsat Kazanıldı'ya taşındı." : "reddetti."}`,
    rows: [
      ["Teklif", `${q.number ?? ""} ${q.title}`.trim()],
      ["Tutar", new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(q.total ?? 0)],
      ["Müşterinin notu", note],
    ],
    path: `/panel/teklifler/${q.id}`,
    tenant: idOf(q.tenant) ?? undefined,
  }).catch((err) => payload.logger.warn({ err }, "Teklif yanıtı bildirilemedi"));
  return Response.json({ ok: true });
}
