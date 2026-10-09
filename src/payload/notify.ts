import type { PayloadRequest } from "payload";
import { isGuruTenant } from "./crm/tenant";

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

type Notice = { subject: string; intro: string; rows: [string, string | null | undefined][]; replyTo?: string; adminPath: string; tenant?: number | string };

export async function notifyTeam(req: PayloadRequest, opts: Notice) {
  const to = await recipient(req, opts.tenant);
  if (!to) return;
  await sendNotice(req, to, opts);
}

/** Tek kişiye bildirim (ör. görev atanınca sorumluya) */
export async function sendNotice(req: PayloadRequest, to: string, opts: Notice) {
  const rows = opts.rows.filter((r): r is [string, string] => Boolean(r[1]?.trim()));
  const base = process.env.NEXT_PUBLIC_SERVER_URL || "";
  const link = `${base}/admin${opts.adminPath}`;

  const html = `<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.55;color:#111">
<p>${esc(opts.intro)}</p>
<table cellpadding="6" style="border-collapse:collapse">${rows
    .map(
      ([k, v]) =>
        `<tr><td style="color:#555;vertical-align:top;white-space:nowrap">${esc(k)}</td><td style="white-space:pre-wrap">${esc(v)}</td></tr>`
    )
    .join("")}</table>
${base ? `<p><a href="${esc(link)}" style="color:#12419b">Panelde aç</a></p>` : ""}
</div>`;
  const text = [opts.intro, "", ...rows.map(([k, v]) => `${k}: ${v}`), ...(base ? ["", `Panelde aç: ${link}`] : [])].join("\n");

  try {
    await req.payload.sendEmail({ to, subject: opts.subject, html, text, ...(opts.replyTo ? { replyTo: opts.replyTo } : {}) });
  } catch (err) {
    req.payload.logger.error({ err, msg: "Bildirim e-postası gönderilemedi" });
  }
}
