import type { PayloadRequest } from "payload";
import { isGuruTenant } from "./crm/tenant";
import { can, isAdminUser, type Module } from "./business/roles";

/**
 * Siteden gelen talep ve randevuları ekibe, Operation görevlerini sorumlusuna
 * e-postayla bildirir. Ekip alıcısı: BILDIRIM_EPOSTA ortam değişkeni, yoksa Site Ayarları > İletişim e-postası.
 * E-posta servisi (Resend) bağlı değilse Payload iletiyi yalnız sunucu
 * günlüğüne yazar. Gönderim hatası formu asla bozmaz: kayıt zaten panelde.
 */

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] ?? c);

/* Guru Dijital: BILDIRIM_EPOSTA ya da site e-postası. Müşteri işletmesi: kendi bildirim adresi, yoksa işletme yöneticileri */
async function recipient(req: PayloadRequest, tenant?: number | string): Promise<string> {
  if (tenant !== undefined && !(await isGuruTenant(req, tenant))) {
    const t = await req.payload.findByID({ collection: "tenants", id: tenant, depth: 0, req, overrideAccess: true }).catch(() => null);
    if (t?.profile?.notifyEmail) return t.profile.notifyEmail;
    const admins = await req.payload.find({ collection: "users", where: { and: [{ "tenants.tenant": { equals: tenant } }, { "tenants.role": { equals: "yonetici" } }] }, depth: 0, limit: 20, pagination: false, req, overrideAccess: true });
    return admins.docs
      .filter((u) => (u.tenants ?? []).some((r) => String(typeof r.tenant === "object" ? r.tenant?.id : r.tenant) === String(tenant) && r.role === "yonetici"))
      .map((u) => u.email)
      .filter((e) => e && !/\.test$/i.test(e))
      .join(",");
  }
  if (process.env.BILDIRIM_EPOSTA) return process.env.BILDIRIM_EPOSTA;
  try {
    const settings = await req.payload.findGlobal({ slug: "site-settings", depth: 0, overrideAccess: true });
    return settings.contact?.email || "";
  } catch {
    return "";
  }
}

/** Bildirim türü: kişisel tercihlerin (Hesabım > Bildirimler) anahtarı */
export type NoticeKind = "talep" | "randevu" | "sohbet" | "gorev" | "kontrol" | "bahsetme";
/* Türün açılması için gereken modül: modülü olmayan ekip üyesine bildirim gitmez */
const KIND_MODULE: Record<NoticeKind, Module> = { talep: "crm", randevu: "crm", sohbet: "chat", gorev: "ops", kontrol: "ops", bahsetme: "chat" };

type Notice = { subject: string; intro: string; rows: [string, string | null | undefined][]; replyTo?: string; /** Panelde açılacak yol (ör. /panel/gelen?...) */ path: string; tenant?: number | string; kind?: NoticeKind };
type Prefs = Partial<Record<`${NoticeKind}${"Panel" | "Eposta"}`, boolean | null>>;
const wants = (prefs: unknown, kind: NoticeKind | undefined, channel: "Panel" | "Eposta") => !kind || (prefs as Prefs | null | undefined)?.[`${kind}${channel}`] !== false;

export async function notifyTeam(req: PayloadRequest, opts: Notice) {
  await inApp(req, opts).catch((err) => req.payload.logger.warn({ err }, "Panel bildirimi yazılamadı"));
  const to = await recipient(req, opts.tenant);
  if (!to) return;
  await sendNotice(req, to, opts, { skipInApp: true });
}

/**
 * Panel içi bildirim (zil). Alıcı verilmezse işletmenin ekibi: o işletmeye bağlı
 * herkes; Guru Dijital'de ayrıca Guru yöneticileri. Bildirimi tetikleyen kişiye yazılmaz.
 */
export async function inApp(req: PayloadRequest, opts: Pick<Notice, "subject" | "intro" | "path" | "tenant" | "kind">, users?: (number | string)[]) {
  const tenant = opts.tenant !== undefined ? Number(opts.tenant) : undefined;
  const guru = tenant === undefined || (await isGuruTenant(req, tenant));
  const r = await req.payload.find({
    collection: "users",
    where: users
      ? { id: { in: users.map(Number) } }
      : { or: [...(tenant !== undefined ? [{ "tenants.tenant": { equals: tenant } }] : []), ...(guru ? [{ role: { equals: "admin" } }] : [])] },
    depth: 0,
    limit: 200,
    pagination: false,
    select: { role: true, tenants: true, notifyPrefs: true },
    req,
    overrideAccess: true,
  });
  const me = req.user?.id;
  for (const u of r.docs) {
    if (me !== undefined && String(me) === String(u.id)) continue;
    /* Kişi bu bildirimi panelde istemiyor ya da işletmede ilgili modülü yok */
    if (!wants(u.notifyPrefs, opts.kind, "Panel")) continue;
    if (!users && opts.kind && tenant !== undefined && !isAdminUser(u) && !can(u, KIND_MODULE[opts.kind], tenant)) continue;
    /* Aynı kayıt için okunmamış bildirim varsa yenisi açılmaz: sayı artar, üste çıkar */
    const open = await req.payload.find({ collection: "notifications", where: { and: [{ user: { equals: u.id } }, { href: { equals: opts.path } }, { read: { equals: false } }] }, limit: 1, depth: 0, req, overrideAccess: true });
    const prev = open.docs[0];
    const data = { title: opts.subject.slice(0, 160), body: opts.intro.slice(0, 300) };
    if (prev) await req.payload.update({ collection: "notifications", id: prev.id, data: { ...data, ...(opts.kind ? { kind: opts.kind } : {}), count: (prev.count ?? 1) + 1 }, req, overrideAccess: true });
    else await req.payload.create({ collection: "notifications", data: { ...data, user: u.id, tenant, kind: opts.kind, href: opts.path, read: false, count: 1 } as never, req, overrideAccess: true });
  }
}

/** Tek kişiye bildirim (ör. görev atanınca sorumluya); panelde de zile düşer */
export async function sendNotice(req: PayloadRequest, to: string, opts: Notice, o: { skipInApp?: boolean } = {}) {
  if (!o.skipInApp && !to.includes(",")) {
    const u = await req.payload.find({ collection: "users", where: { email: { equals: to.toLowerCase() } }, limit: 1, depth: 0, req, overrideAccess: true }).catch(() => null);
    const person = u?.docs[0];
    if (person) await inApp(req, opts, [person.id]).catch(() => null);
    /* Kişi bu türü e-postayla istemiyor: yalnız panel bildirimi */
    if (person && !wants(person.notifyPrefs, opts.kind, "Eposta")) return { ok: true, skipped: true };
  }
  const rows = opts.rows.filter((r): r is [string, string] => Boolean(r[1]?.trim()));
  const base = process.env.NEXT_PUBLIC_SERVER_URL || "";
  const link = `${base}${opts.path}`;
  const html = brandedEmail({ title: opts.subject, intro: opts.intro, rows, link: base ? link : null, base });
  const text = [opts.intro, "", ...rows.map(([k, v]) => `${k}: ${v}`), ...(base ? ["", `Panelde aç: ${link}`] : [])].join("\n");

  /* Deneme hesapları (.test) e-posta almaz */
  if (/\.test$/i.test(to)) return { ok: true, skipped: true };
  /* E-posta servisi yoksa Payload iletiyi yalnız günlüğe yazar: bunu "gönderildi" saymıyoruz */
  if (!emailConfigured()) return { ok: false, error: "E-posta servisi bağlı değil (RESEND_API_KEY)." };
  try {
    await req.payload.sendEmail({ to, subject: opts.subject, html, text, ...(opts.replyTo ? { replyTo: opts.replyTo } : {}) });
    return { ok: true };
  } catch (err) {
    req.payload.logger.error({ err, msg: "Bildirim e-postası gönderilemedi" });
    return { ok: false, error: err instanceof Error ? err.message : "Gönderilemedi." };
  }
}

/** Gerçek e-posta servisi (Resend) bağlı mı */
export const emailConfigured = () => Boolean(process.env.RESEND_API_KEY);

/**
 * Markalı e-posta: üstte markanın ışık bandı ve beyaz logo (PNG; e-posta
 * istemcileri gradyan ve SVG göstermez), başlık, açıklama, bilgi satırları,
 * lacivert "Panelde aç" düğmesi. Tablo düzeni: Outlook dahil her istemcide aynı.
 */
export function brandedEmail({ title, intro, rows = [], link, base, button = "Panelde aç" }: { title: string; intro: string; rows?: [string, string][]; link: string | null; base: string; button?: string }) {
  const header = base ? `<tr><td style="padding:0"><img src="${esc(base)}/brand/eposta-baslik.png" width="560" height="100" alt="Guru Dijital" style="display:block;width:100%;max-width:560px;height:auto;border:0;border-radius:14px 14px 0 0"></td></tr>` : "";
  const table = rows.length
    ? `<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse;margin:18px 0 6px">${rows
        .map(([k, v]) => `<tr><td style="padding:8px 12px 8px 0;color:#646d80;font-size:14px;vertical-align:top;white-space:nowrap">${esc(k)}</td><td style="padding:8px 0;color:#011441;font-size:15px;white-space:pre-wrap">${esc(v)}</td></tr>`)
        .join("")}</table>`
    : "";
  const btn = link ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:22px 0 4px"><tr><td style="background:#011441;border-radius:999px"><a href="${esc(link)}" style="display:inline-block;padding:13px 26px;color:#ffffff;font-size:15px;font-weight:bold;text-decoration:none;font-family:Arial,Helvetica,sans-serif">${esc(button)}</a></td></tr></table>` : "";
  return `<!doctype html><html lang="tr"><body style="margin:0;padding:0;background:#f5f7fb">
<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#f5f7fb;padding:24px 12px"><tr><td align="center">
<table role="presentation" cellpadding="0" cellspacing="0" width="560" style="max-width:560px;width:100%;background:#ffffff;border-radius:14px;font-family:Arial,Helvetica,sans-serif">
${header}
<tr><td style="padding:26px 28px 28px">
<h1 style="margin:0 0 10px;font-size:21px;line-height:1.3;color:#011441">${esc(title)}</h1>
<p style="margin:0;font-size:15px;line-height:1.6;color:#33405e;white-space:pre-wrap">${esc(intro)}</p>
${table}${btn}
</td></tr>
</table>
<p style="margin:16px 0 0;font-size:12px;color:#8a93a6;font-family:Arial,Helvetica,sans-serif">Guru Panel · Guru Dijital Ajans</p>
</td></tr></table></body></html>`;
}
