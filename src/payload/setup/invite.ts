import { randomBytes } from "crypto";
import type { PayloadHandler, PayloadRequest } from "payload";
import { addDataAndFileToRequest } from "payload";
import { isAdminUser, MODULES, tenantRow } from "../business/roles";
import { currentTenantId, idOf } from "../crm/tenant";

/**
 * Ekip daveti. İşletme yöneticisi (ya da Guru yöneticisi) ad ve e-posta yazar;
 * hesap rastgele parolayla açılır ve davetliye parolasını kendisinin
 * belirlediği bir bağlantı gider (Payload'un parola sıfırlama akışı, 3 gün
 * geçerli). E-posta servisi bağlı değilse bağlantı davet edene gösterilir;
 * bu yalnız henüz hiç giriş yapmamış davetlide olur, var olan bir hesabın
 * parolası bu yolla ele geçirilemez.
 *   POST /api/users/davet           { name, email, role: "yonetici" | "uye", modules }
 *   POST /api/users/:id/davet-yenile
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const json = (b: Record<string, unknown>, status = 200) => Response.json(b, { status, headers: { "Cache-Control": "no-store" } });
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string);

export const panelOrigin = (req?: PayloadRequest) => {
  const h = req?.headers;
  const host = h?.get("x-forwarded-host") ?? h?.get("host");
  if (host) return `${h?.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https")}://${host}`;
  return process.env.NEXT_PUBLIC_SERVER_URL || "";
};

/* Users > auth.forgotPassword: davet bağlamında davet metni, değilse parola sıfırlama metni */
type Ctx = { davet?: { by: string; tenant: string } };
export const resetEmailSubject = ({ req }: { req?: PayloadRequest } = {}) => {
  const d = (req?.context as Ctx | undefined)?.davet;
  return d ? `${d.tenant} sizi Guru Panel'e davet etti` : "Guru Panel parolanızı yenileyin";
};
export const resetEmailHTML = ({ req, token, user }: { req?: PayloadRequest; token?: string; user?: { name?: string } } = {}) => {
  const d = (req?.context as Ctx | undefined)?.davet;
  const link = `${panelOrigin(req)}/admin/reset/${token}`;
  const hello = `Merhaba${user?.name ? ` ${esc(user.name)}` : ""},`;
  const intro = d
    ? `${esc(d.by)}, sizi ${esc(d.tenant)} ekibine Guru Panel'de ekledi. Aşağıdaki bağlantıdan parolanızı belirleyip giriş yapabilirsiniz. Bağlantı 3 gün geçerlidir.`
    : "Parolanızı yenilemek için aşağıdaki bağlantıyı kullanın. Bu isteği siz yapmadıysanız e-postayı yok sayabilirsiniz.";
  return `<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.55;color:#111">
<p>${hello}</p><p>${intro}</p>
<p><a href="${esc(link)}" style="display:inline-block;background:#011441;color:#fff;padding:12px 20px;border-radius:999px;text-decoration:none">${d ? "Parolamı belirle" : "Parolamı yenile"}</a></p>
<p style="color:#555;font-size:13px">Düğme çalışmazsa bu adresi tarayıcınıza yapıştırın: ${esc(link)}</p></div>`;
};

const emailReady = () => Boolean(process.env.RESEND_API_KEY);

async function sendInvite(req: PayloadRequest, email: string, tenantName: string) {
  const by = (req.user as { name?: string } | null)?.name ?? "Guru Panel";
  req.context = { ...req.context, davet: { by, tenant: tenantName } };
  const token = await req.payload.forgotPassword({ collection: "users", data: { email }, req, disableEmail: false, expiration: 3 * 86400000 });
  return token as string | null;
}

function canManage(req: PayloadRequest, tenant: number | string) {
  return isAdminUser(req.user) || tenantRow(req.user, tenant)?.role === "yonetici";
}

export const inviteUser: PayloadHandler = async (req) => {
  const tenant = await currentTenantId(req);
  if (!tenant || !canManage(req, tenant)) return json({ ok: false, error: "Ekibe yalnız işletme yöneticisi kişi ekleyebilir." }, 403);
  await addDataAndFileToRequest(req);
  const b = (req.data ?? {}) as { name?: string; email?: string; role?: string; modules?: string[] };
  const name = String(b.name ?? "").trim().slice(0, 120);
  const email = String(b.email ?? "").trim().toLowerCase();
  if (!name || !EMAIL_RE.test(email)) return json({ ok: false, error: "Ad ve geçerli bir e-posta yazın." }, 400);
  const role = b.role === "yonetici" ? "yonetici" : "uye";
  const valid = new Set(MODULES.map((m) => m.value as string));
  const modules = (b.modules ?? []).filter((m) => valid.has(m));
  const t = await req.payload.findByID({ collection: "tenants", id: tenant, depth: 0, req, overrideAccess: true });

  const existing = (await req.payload.find({ collection: "users", where: { email: { equals: email } }, limit: 1, depth: 0, req, overrideAccess: true })).docs[0];
  if (existing) {
    if ((existing.tenants ?? []).some((r) => String(idOf(r.tenant)) === String(tenant))) return json({ ok: false, error: "Bu kişi zaten ekipte." }, 400);
    if (existing.role === "admin") return json({ ok: false, error: "Bu adres bir Guru yöneticisine ait." }, 400);
    /* Başka işletmede hesabı olan kişi: yalnız bu işletmeye eklenir; parolası değişmez */
    await req.payload.update({
      collection: "users",
      id: existing.id,
      data: { tenants: [...(existing.tenants ?? []), { tenant: Number(tenant), role, modules: modules as never }] },
      req,
      /* Yetki yukarıda denetlendi; satır kuralları (yalnız yönettiği işletme, açık modüller) Users kancasında */
      overrideAccess: true,
    });
    return json({ ok: true, existing: true, message: `${existing.name} ekibe eklendi; mevcut parolasıyla giriş yapabilir.` });
  }

  const user = await req.payload.create({
    collection: "users",
    data: { name, email, password: randomBytes(24).toString("base64url"), role: "editor", invitePending: true, tenants: [{ tenant: Number(tenant), role, modules: modules as never }] },
    req,
    /* "Davet bekliyor" alanı yalnız buradan yazılır (alan erişimi kapalı) */
    overrideAccess: true,
  });
  const token = await sendInvite(req, email, t.name);
  return json({
    ok: true,
    id: user.id,
    emailSent: emailReady(),
    /* E-posta servisi yoksa bağlantı davet edene gösterilir (yalnız yeni, hiç giriş yapmamış hesap) */
    ...(emailReady() || !token ? {} : { link: `${panelOrigin(req)}/admin/reset/${token}` }),
  });
};

export const resendInvite: PayloadHandler = async (req) => {
  const tenant = await currentTenantId(req);
  if (!tenant || !canManage(req, tenant)) return json({ ok: false, error: "Yetki yok." }, 403);
  const id = req.routeParams?.id as string;
  const u = await req.payload.findByID({ collection: "users", id, depth: 0, req, overrideAccess: true }).catch(() => null);
  if (!u || !(u.tenants ?? []).some((r) => String(idOf(r.tenant)) === String(tenant))) return json({ ok: false, error: "Kullanıcı bu ekipte değil." }, 404);
  if (!u.invitePending) return json({ ok: false, error: "Bu kişi hesabını zaten kullanıyor; parolasını giriş ekranındaki \"Parolamı unuttum\" ile kendisi yenileyebilir." }, 400);
  const t = await req.payload.findByID({ collection: "tenants", id: tenant, depth: 0, req, overrideAccess: true });
  const token = await sendInvite(req, u.email, t.name);
  /* Payload aynı hesaba 15 saniyede bir sıfırlama bağlantısı üretir */
  if (!token) return json({ ok: false, error: "Davet az önce gönderildi. Birkaç saniye sonra tekrar deneyin." }, 429);
  return json({ ok: true, emailSent: emailReady(), ...(emailReady() ? {} : { link: `${panelOrigin(req)}/admin/reset/${token}` }) });
};
