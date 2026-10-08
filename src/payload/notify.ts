import type { PayloadRequest } from "payload";

/**
 * Siteden gelen talep ve randevuları ekibe e-postayla bildirir. Alıcı:
 * BILDIRIM_EPOSTA ortam değişkeni, yoksa Site Ayarları > İletişim e-postası.
 * E-posta servisi (Resend) bağlı değilse Payload iletiyi yalnız sunucu
 * günlüğüne yazar. Gönderim hatası formu asla bozmaz: kayıt zaten panelde.
 */

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] ?? c);

async function recipient(req: PayloadRequest) {
  if (process.env.BILDIRIM_EPOSTA) return process.env.BILDIRIM_EPOSTA;
  try {
    const settings = await req.payload.findGlobal({ slug: "site-settings", depth: 0, overrideAccess: true });
    return settings.contact?.email || "";
  } catch {
    return "";
  }
}

export async function notifyTeam(
  req: PayloadRequest,
  opts: { subject: string; intro: string; rows: [string, string | null | undefined][]; replyTo?: string; adminPath: string }
) {
  const to = await recipient(req);
  if (!to) return;
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
