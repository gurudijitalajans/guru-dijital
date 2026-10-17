import type { Module } from "@/payload/business/roles";

/**
 * Panel düzenleyicisinde açılan içerik türleri: başlık, yetki, sitede hangi
 * adreste önizleneceği, geri dönülecek sayfa ve (varsa) liste ayarları.
 */
export type EntityDef = {
  type: "global" | "collection";
  label: string;
  /** Biri açıksa (seçili işletmede ve kullanıcıda) */
  modules?: Module[];
  /** Yalnız Guru yöneticisi */
  adminOnly?: boolean;
  /** Yalnız işletme yöneticisi (Guru yöneticisi dahil) */
  tenantAdmin?: boolean;
  back: string;
  /** Kaydın sitedeki adresi (canlı önizleme) */
  preview?: (doc: Record<string, unknown>) => string | null;
  /** Koleksiyonda kaydın adı */
  titleField?: string;
  /** Kayıt seçili işletmeye bağlı (liste ve kayıt işletmeye göre süzülür) */
  tenanted?: boolean;
  /** İşletme başına tek kayıt: adres kimliksiz açılır, işletmenin kaydı bulunur */
  singleton?: boolean;
  /** Yalnız görüntülenir (kayıtları sistem yazar) */
  readOnly?: boolean;
  /** Liste sayfası (/panel/kayitlar/[slug]) */
  list?: { title: string; description?: string; columns: string[]; search?: string[]; sort?: string; canCreate?: boolean; adminOnly?: boolean };
};

const site: Module[] = ["site"];

export const ENTITIES: Record<string, EntityDef> = {
  "home-page": { type: "global", label: "Ana Sayfa", modules: site, back: "/panel/icerik", preview: () => "/" },
  "about-page": { type: "global", label: "Hakkımızda", modules: site, back: "/panel/icerik", preview: () => "/hakkimizda" },
  "site-settings": { type: "global", label: "Site Ayarları", modules: site, back: "/panel/icerik", preview: () => "/iletisim" },
  services: { type: "collection", label: "Hizmet", modules: site, back: "/panel/icerik?tur=hizmetler", titleField: "title", preview: (d) => (d.slug ? `/hizmetler/${d.slug}` : null) },
  products: { type: "collection", label: "Ürün", modules: site, back: "/panel/icerik?tur=urunler", titleField: "name", preview: (d) => (d.slug ? `/urunler/${d.slug}` : null) },
  posts: { type: "collection", label: "Blog yazısı", modules: site, back: "/panel/icerik?tur=blog", titleField: "title", preview: (d) => (d.slug ? `/blog/${d.slug}` : null) },

  /* Ayarlar */
  "chatbot-config": { type: "collection", label: "Sohbet asistanı", modules: ["chat"], back: "/panel/ayarlar", tenanted: true, singleton: true },
  "business-config": { type: "collection", label: "Yönetim özeti ayarları", modules: ["business"], tenantAdmin: true, back: "/panel/ayarlar", tenanted: true, singleton: true },
  "work-calendar": { type: "collection", label: "Çalışma saatleri ve tatiller", modules: ["crm", "chat", "ops"], tenantAdmin: true, back: "/panel/ayarlar", tenanted: true, singleton: true },
  leaves: {
    type: "collection",
    label: "İzin",
    modules: ["ops", "crm"],
    back: "/panel/kayitlar/leaves",
    titleField: "not",
    tenanted: true,
    list: { title: "İzinler", description: "Yıllık izin, rapor ve yarım günler. Ekip yükü bu günlerde kapasiteyi düşürür.", columns: ["kisi", "baslangic", "bitis", "tur"], sort: "-baslangic", canCreate: true },
  },
  automations: {
    type: "collection",
    label: "Otomasyon",
    modules: ["crm"],
    tenantAdmin: true,
    back: "/panel/kayitlar/automations",
    titleField: "name",
    tenanted: true,
    list: {
      title: "Aşama otomasyonları",
      description: "Fırsat bir aşamaya girince görev açılır, sorumlu değişir, kişiye e-posta ya da ekibe bildirim gider. Siteden gelen yeni talepler Aday aşamasında başlar.",
      columns: ["name", "stage", "action", "active"],
      search: ["name"],
      sort: "stage",
      canCreate: true,
    },
  },
  "site-connection": { type: "collection", label: "Site bağlantısı", modules: ["crm", "chat"], back: "/panel/ayarlar", tenanted: true, singleton: true },
  knowledge: {
    type: "collection",
    label: "Bilgi kaydı",
    modules: ["chat"],
    back: "/panel/kayitlar/knowledge",
    titleField: "title",
    tenanted: true,
    list: { title: "Bilgi tabanı", description: "Asistanın bildikleri: site taraması, belgeler ve elle yazılanlar.", columns: ["title", "active", "updatedAt"], search: ["title", "content"], sort: "-updatedAt", canCreate: true },
  },
  templates: {
    type: "collection",
    label: "Süreç şablonu",
    modules: ["ops"],
    back: "/panel/kayitlar/templates",
    titleField: "name",
    tenanted: true,
    list: { title: "Süreç şablonları", description: "Projeye açılınca görev olan adımlar, süreler ve sorumlular.", columns: ["name", "description"], search: ["name"], sort: "name", canCreate: true },
  },
  tenants: {
    type: "collection",
    label: "İşletme",
    adminOnly: true,
    back: "/panel/kayitlar/tenants",
    titleField: "name",
    list: { title: "İşletmeler", description: "Müşteri işletmeleri, açık modüller ve durum.", columns: ["name", "status", "modules"], search: ["name", "slug"], sort: "name", canCreate: true },
  },
  /* İşletme yöneticisi kendi ekibinin yetkisini düzenler (Payload kuralı); tüm kullanıcı listesi yalnız Guru'da */
  users: {
    type: "collection",
    label: "Kullanıcı",
    tenantAdmin: true,
    back: "/panel/ayarlar/ekip",
    titleField: "name",
    list: { title: "Kullanıcılar", description: "Tüm hesaplar ve hesap türleri. Yeni kişiyi Ekip ve yetkiler ekranından davet edin.", columns: ["name", "email", "role"], search: ["name", "email"], sort: "name", adminOnly: true },
  },
  usage: {
    type: "collection",
    label: "Kullanım",
    adminOnly: true,
    back: "/panel/kayitlar/usage",
    titleField: "month",
    tenanted: true,
    readOnly: true,
    list: { title: "Kullanım", description: "Seçili işletmenin aylık sohbet ve yapay zekâ kullanımı.", columns: ["month", "conversations", "visitorMessages", "aiCalls", "inputTokens", "outputTokens"], sort: "-month" },
  },
  "audit-log": {
    type: "collection",
    label: "İşlem kaydı",
    adminOnly: true,
    back: "/panel/kayitlar/audit-log",
    titleField: "summary",
    tenanted: true,
    readOnly: true,
    list: { title: "İşlem geçmişi", description: "Seçili işletmede kim neyi ne zaman değiştirdi.", columns: ["summary", "user", "createdAt"], search: ["summary"], sort: "-createdAt" },
  },
  leads: { type: "collection", label: "Talep", modules: ["crm"], back: "/panel/gelen?f=talep", titleField: "name", tenanted: true },
  bookings: { type: "collection", label: "Randevu", modules: ["crm"], back: "/panel/gelen?f=randevu", titleField: "name", tenanted: true },
  activities: { type: "collection", label: "Not ve görev", modules: ["crm"], back: "/panel/takvim", titleField: "title", tenanted: true },
  contacts: { type: "collection", label: "Kişi", modules: ["crm"], back: "/panel/kisiler", titleField: "name", tenanted: true },
  companies: { type: "collection", label: "Firma", modules: ["crm"], back: "/panel/kisiler?gorunum=firmalar", titleField: "name", tenanted: true },
};

export const editorHref = (slug: string, id?: number | string | null) => `/panel/duzenle/${slug}${id ? `/${id}` : ""}`;

/** Kullanıcı bu türü açabilir mi */
export const canOpen = (def: EntityDef, ctx: { has: (m: Module) => boolean; isGuruAdmin: boolean; isTenantAdmin: boolean }) =>
  (!def.modules || def.modules.some(ctx.has)) && (!def.adminOnly || ctx.isGuruAdmin) && (!def.tenantAdmin || ctx.isTenantAdmin);
