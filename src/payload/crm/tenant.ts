import type { CollectionConfig, PayloadRequest } from "payload";
import { getTenantFromCookie } from "@payloadcms/plugin-multi-tenant/utilities";
import { isAdmin, isLoggedIn } from "../access";

/**
 * İşletmeler (çok kiracılı yapı). CRM, Operation ve Chatbot kayıtlarının her
 * biri bir işletmeye bağlıdır; erişimi Payload'un çok kiracılı eklentisi
 * süzer (payload.config.ts). Guru Dijital ilk işletmedir ve sitenin içeriği
 * yalnız onda yönetilir. Müşteri işletmesi açıldığında verileri ayrı kalır.
 */
export const DEFAULT_TENANT = { name: "Guru Dijital", slug: "guru" };

/* İşletmeye satılabilen modüller (site içeriği yalnız Guru'nun) */
export const TENANT_MODULES = [
  { label: "Guru CRM", value: "crm" },
  { label: "Guru Chatbot", value: "chat" },
  { label: "Guru Operation", value: "ops" },
  { label: "Guru Business (yönetici panosu ve raporlar)", value: "business" },
] as const;
export type TenantModule = (typeof TENANT_MODULES)[number]["value"];
export const ALL_TENANT_MODULES: TenantModule[] = TENANT_MODULES.map((m) => m.value);

type Id = number | string;
export const idOf = (v: unknown): Id | undefined => (v && typeof v === "object" ? (v as { id?: Id }).id : ((v as Id | null) ?? undefined));

export const Tenants: CollectionConfig = {
  slug: "tenants",
  labels: { singular: "İşletme", plural: "İşletmeler" },
  admin: {
    useAsTitle: "name",
    group: "Ayarlar",
    defaultColumns: ["name", "status", "modules"],
    description: "Paneli kullanan işletmeler. Her işletmenin kaydı ayrıdır; kullanıcılar Kullanıcılar ekranından işletmeye eklenir.",
    hidden: ({ user }) => (user as { role?: string } | null)?.role !== "admin",
  },
  access: { read: isLoggedIn, create: isAdmin, update: isAdmin, delete: isAdmin },
  hooks: {
    /* Yeni işletmenin teklif ön eki adının baş harflerinden (Deneme Klinik → DK) */
    beforeChange: [
      ({ data, operation }) => {
        if (operation === "create" && data.slug !== DEFAULT_TENANT.slug && (!data.quotePrefix || data.quotePrefix === "GD")) {
          const initials = String(data.name ?? "")
            .toLocaleUpperCase("tr-TR")
            .split(/\s+/)
            .map((w: string) => w.replace(/[^A-ZÇĞİÖŞÜ0-9]/g, "")[0] ?? "")
            .join("")
            .replace(/[ÇĞİÖŞÜ]/g, (c: string) => ({ Ç: "C", Ğ: "G", İ: "I", Ö: "O", Ş: "S", Ü: "U" })[c] ?? c)
            .slice(0, 3);
          data.quotePrefix = initials || "TK";
        }
        return data;
      },
    ],
    /* İşletmenin modülleri daralınca kullanıcılarının modülleri de daralır; yöneticisi hepsini alır */
    afterChange: [
      async ({ doc, previousDoc, req }) => {
        if (JSON.stringify(doc.modules ?? []) === JSON.stringify(previousDoc?.modules ?? [])) return;
        const allowed: string[] = doc.modules ?? [];
        const users = await req.payload.find({ collection: "users", where: { "tenants.tenant": { equals: doc.id } }, limit: 1000, depth: 0, pagination: false, req, overrideAccess: true });
        for (const u of users.docs) {
          const rows = (u.tenants ?? []).map((r) => {
            if (String(idOf(r.tenant)) !== String(doc.id)) return r;
            const modules = r.role === "yonetici" ? allowed : (r.modules ?? []).filter((m) => allowed.includes(m));
            return { ...r, modules: modules as never };
          });
          await req.payload.update({ collection: "users", id: u.id, data: { tenants: rows }, req, overrideAccess: true, context: { tenantSync: true } });
        }
      },
    ],
  },
  fields: [
    {
      type: "row",
      fields: [
        { name: "name", type: "text", label: "İşletme adı", required: true },
        { name: "slug", type: "text", label: "Kısa ad", required: true, unique: true, index: true, admin: { width: "30%", description: "Küçük harf, boşluksuz (ör. ornek-klinik)." } },
      ],
    },
    {
      name: "modules",
      type: "select",
      hasMany: true,
      label: "Açık modüller",
      defaultValue: ["crm", "chat"],
      options: [...TENANT_MODULES],
      admin: { description: "Aboneliğe dahil modüller. İşletmenin kullanıcıları yalnız bunları görebilir." },
    },
    {
      name: "profile",
      type: "group",
      label: "Belge ve e-posta bilgileri",
      admin: { description: "Teklif belgesinde, raporlarda ve bildirim e-postalarında işletmenin kendi bilgisi olarak görünür." },
      fields: [
        {
          type: "row",
          fields: [
            { name: "legalName", type: "text", label: "Ticari unvan", admin: { description: "Boşsa işletme adı." } },
            { name: "logo", type: "upload", relationTo: "media", label: "Logo", admin: { description: "Yatay, açık zeminde okunur logo." } },
          ],
        },
        {
          type: "row",
          fields: [
            { name: "email", type: "email", label: "E-posta" },
            { name: "phone", type: "text", label: "Telefon" },
            { name: "website", type: "text", label: "Web sitesi", admin: { placeholder: "https://" } },
          ],
        },
        { name: "address", type: "textarea", label: "Adres" },
        {
          type: "row",
          fields: [
            { name: "taxOffice", type: "text", label: "Vergi dairesi" },
            { name: "taxNumber", type: "text", label: "Vergi numarası" },
          ],
        },
        { name: "notifyEmail", type: "email", label: "Bildirim e-postası", admin: { description: "Yeni talep, randevu ve ekibe aktarılan sohbet buraya bildirilir. Boşsa işletme yöneticilerine." } },
      ],
    },
    {
      type: "row",
      fields: [
        { name: "quotePrefix", type: "text", label: "Teklif numarası ön eki", defaultValue: "GD", admin: { width: "30%", description: "Ör. GD: GD-2026-001" } },
        {
          name: "status",
          type: "select",
          label: "Durum",
          defaultValue: "aktif",
          options: [
            { label: "Aktif", value: "aktif" },
            { label: "Pilot", value: "pilot" },
            { label: "Askıda", value: "askida" },
          ],
        },
      ],
    },
    { name: "notes", type: "textarea", label: "İç notlar", admin: { description: "Yalnız Guru yöneticileri görür: sözleşme, paket, iletişim kişisi." } },
  ],
};

/** Guru Dijital işletmesinin kimliği; yoksa oluşturur */
export async function defaultTenantId(req: PayloadRequest): Promise<number> {
  const found = await req.payload.find({ collection: "tenants", where: { slug: { equals: DEFAULT_TENANT.slug } }, limit: 1, depth: 0, req, overrideAccess: true });
  if (found.docs[0]) return found.docs[0].id;
  const created = await req.payload.create({ collection: "tenants", data: { ...DEFAULT_TENANT, modules: ALL_TENANT_MODULES }, req, overrideAccess: true });
  return created.id;
}

type U = { role?: string | null; tenants?: { tenant: unknown }[] | null } | null | undefined;

/**
 * Panelde seçili işletme: işletme seçicisinin çerezi (kullanıcı o işletmenin
 * üyesiyse ya da Guru yöneticisiyse), yoksa kullanıcının ilk işletmesi; Guru
 * yöneticisinde hiçbiri yoksa Guru Dijital.
 */
export async function currentTenantId(req: PayloadRequest): Promise<number | null> {
  const user = req.user as U;
  if (!user) return null;
  const mine = (user.tenants ?? []).map((r) => Number(idOf(r.tenant))).filter(Boolean);
  const cookie = getTenantFromCookie(req.headers, "number") as number | null;
  if (cookie && (user.role === "admin" || mine.includes(Number(cookie)))) return Number(cookie);
  if (mine[0]) return mine[0];
  return user.role === "admin" ? defaultTenantId(req) : null;
}

/** Seçili işletmeye göre süzgeç: sunucu tarafı sorgular yetkiyi atlar, işletmeyi açıkça vermek gerekir */
export async function tenantWhere(req: PayloadRequest) {
  const id = await currentTenantId(req);
  return { tenant: { equals: id ?? -1 } };
}

export const isGuruTenant = async (req: PayloadRequest, tenant: unknown) => String(idOf(tenant)) === String(await defaultTenantId(req));

/* Üst kayıttan işletme: alan adı → koleksiyon */
const PARENTS: Record<string, string> = {
  deal: "deals",
  contact: "contacts",
  company: "companies",
  project: "projects",
  conversation: "conversations",
  lead: "leads",
  booking: "bookings",
};

/* Kullanıcı bu işletmeye kayıt açabilir mi (oturumsuz sunucu işlemi, Guru yöneticisi ya da işletmenin üyesi) */
const mayUse = (req: PayloadRequest, tenant: Id) => {
  const user = req.user as U;
  return !user || user.role === "admin" || (user.tenants ?? []).some((r) => String(idOf(r.tenant)) === String(tenant));
};

/**
 * Yeni kayda işletme: üst kaydın işletmesi (fırsatın notu fırsatın
 * işletmesinde açılır), yoksa paneldeki seçili işletme, oturum yoksa (site
 * formu, sohbet) Guru Dijital. Eklentinin işletme doğrulamasından önce çalışır.
 * Üst kayıt, seçili işletmeden gelen varsayılanın da önündedir: panelde başka
 * işletme seçiliyken açılan alt kayıt (ör. demo kurulumunun görevleri) üst
 * kaydın işletmesinde kalır.
 */
export const fillTenant =
  (parents: (keyof typeof PARENTS)[] = []) =>
  async ({ data, originalDoc, req }: { data?: Record<string, unknown>; originalDoc?: Record<string, unknown>; req: PayloadRequest }) => {
    if (!data || idOf(originalDoc?.tenant)) return data;
    for (const p of parents) {
      const id = idOf(data[p]);
      if (!id) continue;
      const parent = await req.payload.findByID({ collection: PARENTS[p] as never, id, depth: 0, req, overrideAccess: true }).catch(() => null);
      const t = idOf((parent as { tenant?: unknown } | null)?.tenant);
      if (t) {
        if (!idOf(data.tenant) || mayUse(req, t)) data.tenant = t;
        return data;
      }
    }
    if (!idOf(data.tenant)) data.tenant = (await currentTenantId(req)) ?? (await defaultTenantId(req));
    return data;
  };
