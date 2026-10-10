import { APIError, type Access, type ArrayField, type CollectionConfig, type Field } from "payload";
import { tenantsArrayField } from "@payloadcms/plugin-multi-tenant/fields";
import { isAdmin, isAdminField } from "../access";
import { isAdminUser, isTenantAdmin, MODULES, tenantRow } from "../business/roles";
import { defaultTenantId, idOf } from "../crm/tenant";
import { inviteUser, resendInvite, resetEmailHTML, resetEmailSubject } from "../setup/invite";

/**
 * Panel kullanıcıları. Guru yöneticisi tüm işletmeleri yönetir. İşletme
 * kullanıcısının her işletmede bir satırı vardır: rolü (yönetici ya da üye)
 * ve modülleri. İşletme yöneticisi kendi işletmesine kullanıcı ekler ve
 * modül verir; başka işletmeye ya da Guru yöneticiliğine dokunamaz. Hangi
 * kullanıcıları görebileceğini çok kiracılı eklenti işletmeye göre süzer.
 */

type Row = { id?: string; tenant: unknown; role?: string | null; modules?: string[] | null };
/* Eklentinin satırdaki işletme alanına Türkçe etiket */
const withTenantLabel = (f: ArrayField): ArrayField => ({
  ...f,
  fields: f.fields.map((x) => ("name" in x && x.name === "tenant" ? ({ ...x, label: "İşletme" } as typeof x) : x)),
});
const managerOrAdmin: Access = ({ req }) => isAdminUser(req.user) || isTenantAdmin(req.user);
const selfOrManager: Access = ({ req }) => {
  if (!req.user) return false;
  if (isAdminUser(req.user) || isTenantAdmin(req.user)) return true;
  return { id: { equals: req.user.id } };
};

export const Users: CollectionConfig = {
  slug: "users",
  labels: { singular: "Kullanıcı", plural: "Kullanıcılar" },
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "email", "role"],
    group: "Ayarlar",
    /* Ekip üyesi kendi hesabını sağ üstten açar; kullanıcı listesi Guru ve işletme yöneticisinde */
    hidden: ({ user }) => !isTenantAdmin(user),
  },
  endpoints: [
    { path: "/davet", method: "post", handler: inviteUser },
    { path: "/:id/davet-yenile", method: "post", handler: resendInvite },
  ],
  auth: {
    /* Davet ve parola sıfırlama aynı akış: davet bağlamında davet metni gider */
    forgotPassword: { expiration: 3 * 86400000, generateEmailSubject: resetEmailSubject as never, generateEmailHTML: resetEmailHTML as never },
    tokenExpiration: 60 * 60 * 8,
    maxLoginAttempts: 5,
    lockTime: 10 * 60 * 1000,
  },
  access: {
    admin: ({ req }) => Boolean(req.user),
    read: ({ req }) => Boolean(req.user),
    create: managerOrAdmin,
    update: selfOrManager,
    delete: isAdmin,
  },
  hooks: {
    /* Erişim kaydı: kim, ne zaman giriş yaptı (Ayarlar > İşlem geçmişi) */
    afterLogin: [
      /* İlk giriş: davet tamamlandı */
      async ({ user, req }) => {
        if (user.invitePending) await req.payload.update({ collection: "users", id: user.id, data: { invitePending: false }, req, overrideAccess: true, context: { tenantSync: true } }).catch(() => {});
      },
      /* Giriş kaydı girişin işleminde (req) yazılır: ayrı bağlantıdan yazınca Postgres'te kullanıcı satırının kilidini bekleyip girişi kilitliyordu */
      async ({ user, req }) => {
        const tenant = idOf((user.tenants as Row[] | undefined)?.[0]?.tenant) ?? (await defaultTenantId(req));
        await req.payload
          .create({ collection: "audit-log", data: { user: user.id, tenant: tenant as number, action: "giris", target: "Oturum", docId: String(user.id), summary: `${user.name ?? user.email} giriş yaptı` }, req, overrideAccess: true })
          .catch(() => {});
      },
    ],
    beforeValidate: [
      /* İlk hesap her zaman Guru yöneticisi olur (panelin "ilk kullanıcı" ekranı dahil) */
      async ({ data, operation, req }) => {
        if (operation !== "create" || !data) return data;
        const { totalDocs } = await req.payload.count({ collection: "users", overrideAccess: true });
        if (totalDocs === 0) data.role = "admin";
        return data;
      },
    ],
    beforeChange: [
      async ({ data, originalDoc, req, context }) => {
        if (context.tenantSync || !data.tenants) return data;
        const me = req.user;
        /* İşletme yöneticisi: Guru yöneticisine dokunamaz; yalnız yönettiği işletmelerin satırlarını değiştirir */
        if (me && !isAdminUser(me) && String(me.id) !== String(originalDoc?.id ?? "")) {
          if (originalDoc?.role === "admin") throw new APIError("Guru yöneticisinin hesabını yalnız Guru yöneticileri değiştirebilir.", 403, undefined, true);
          const managed = (t: unknown) => tenantRow(me, t)?.role === "yonetici";
          const kept = ((originalDoc?.tenants ?? []) as Row[]).filter((r) => !managed(r.tenant));
          const mine = (data.tenants as Row[]).filter((r) => managed(r.tenant));
          data.tenants = [...kept, ...mine];
        }
        /* Kendi satırını kimse büyütemez (yönetici olmayan biri kendi modülünü ya da rolünü değiştiremez) */
        if (me && !isAdminUser(me) && String(me.id) === String(originalDoc?.id ?? "")) data.tenants = originalDoc?.tenants;

        /* Modüller işletmenin açık modülleriyle sınırlı; yönetici satırı hepsini alır; site içeriği yalnız Guru Dijital'de */
        const guru = String(await defaultTenantId(req));
        const rows: Row[] = [];
        for (const r of (data.tenants ?? []) as Row[]) {
          const t = idOf(r.tenant);
          if (!t) continue;
          const tenant = await req.payload.findByID({ collection: "tenants", id: t, depth: 0, req, overrideAccess: true }).catch(() => null);
          if (!tenant) continue;
          const open: string[] = [...(tenant.modules ?? []), ...(String(t) === guru ? ["site"] : [])];
          const modules = r.role === "yonetici" ? open : (r.modules ?? []).filter((m) => open.includes(m));
          rows.push({ ...r, modules: modules as never });
        }
        data.tenants = rows;
        return data;
      },
    ],
  },
  fields: [
    { name: "name", type: "text", label: "Ad Soyad", required: true },
    { name: "invitePending", type: "checkbox", label: "Davet bekliyor", defaultValue: false, access: { create: () => false, update: () => false }, admin: { position: "sidebar", readOnly: true, condition: (d) => Boolean(d?.invitePending), description: "Henüz giriş yapmadı. Ekibim ekranından daveti yeniden gönderebilirsiniz." } },
    {
      name: "weeklyHours",
      type: "number",
      label: "Haftalık çalışma saati",
      defaultValue: 40,
      min: 0,
      admin: { position: "sidebar", description: "Guru Operation ekip planındaki doluluk yüzdesi bu saate göre hesaplanır." },
    },
    {
      name: "role",
      type: "select",
      label: "Hesap türü",
      required: true,
      defaultValue: "editor",
      saveToJWT: true,
      options: [
        { label: "Guru yöneticisi (tüm işletmeler)", value: "admin" },
        { label: "İşletme kullanıcısı", value: "editor" },
      ],
      access: { create: isAdminField, update: isAdminField },
      admin: {
        position: "sidebar",
        description: "Guru yöneticisi tüm işletmeleri görür. İşletme kullanıcısı yalnız aşağıdaki işletmelerde, işaretli modüllerle çalışır.",
      },
    },
    {
      ...withTenantLabel(tenantsArrayField({
        tenantsArrayFieldName: "tenants",
        tenantsArrayTenantFieldName: "tenant",
        tenantsCollectionSlug: "tenants",
        arrayFieldAccess: { create: ({ req }) => isTenantAdmin(req.user), update: ({ req }) => isTenantAdmin(req.user) },
        rowFields: [
          {
            name: "role",
            type: "select",
            label: "Bu işletmedeki rolü",
            required: true,
            defaultValue: "uye",
            saveToJWT: true,
            options: [
              { label: "İşletme yöneticisi (tüm açık modüller, ekibi yönetir)", value: "yonetici" },
              { label: "Ekip üyesi (işaretli modüller)", value: "uye" },
            ],
          },
          {
            name: "modules",
            type: "select",
            hasMany: true,
            label: "Modüller",
            saveToJWT: true,
            options: [...MODULES],
            admin: {
              condition: (_, sibling) => sibling?.role !== "yonetici",
              description: "Örnek: satış ekibine Guru CRM ve Guru Chatbot, tasarım ekibine Guru Operation. İşletmede açık olmayan modül kaydedilmez.",
            },
          },
        ],
      })),
      label: "İşletmeler",
      labels: { singular: "İşletme", plural: "İşletmeler" },
      admin: { condition: (data) => data?.role !== "admin", description: "Kullanıcının çalıştığı işletmeler ve her birindeki yetkisi." },
    } as Field,
  ],
};
