import type { Module } from "@/payload/business/roles";

/**
 * Yeni panelin menüsü: işe göre gruplar, en çok iki seviye. Henüz yeni panele
 * taşınmamış ekranlar mevcut ekrana (/admin) gider ve menüde "mevcut ekran"
 * işaretiyle görünür; taşındıkça href /panel altına alınır.
 */
export type NavIcon = "home" | "inbox" | "calendar" | "deals" | "people" | "quotes" | "projects" | "tasks" | "load" | "report" | "chat" | "web" | "media" | "settings";
export type NavItem = {
  id: string;
  label: string;
  href: string;
  icon: NavIcon;
  /** Biri açıksa görünür */
  modules?: Module[];
  /** Yalnız işletme yöneticisi (Guru yöneticisi dahil) */
  tenantAdmin?: boolean;
  legacy?: boolean;
  /** Komut paletinde aranacak ek kelimeler */
  keywords?: string;
  /** Menüde sayı rozeti (ör. bekleyen kayıt) */
  count?: number;
};
export type NavGroup = { label: string; items: NavItem[] };

export const NAV: NavGroup[] = [
  {
    label: "Bugün",
    items: [
      { id: "home", label: "Ana sayfa", href: "/panel", icon: "home", keywords: "pano özet" },
      { id: "inbox", label: "Gelen kutusu", href: "/panel/gelen", icon: "inbox", modules: ["chat", "crm"], keywords: "sohbet mesaj talep form başvuru randevu" },
      { id: "bookings", label: "Randevular", href: "/admin/collections/bookings", icon: "calendar", modules: ["crm"], legacy: true, keywords: "toplantı takvim" },
    ],
  },
  {
    label: "Satış",
    items: [
      { id: "deals", label: "Fırsatlar", href: "/panel/firsatlar", icon: "deals", modules: ["crm"], keywords: "satış hattı pano" },
      { id: "people", label: "Kişiler ve firmalar", href: "/panel/kisiler", icon: "people", modules: ["crm"], keywords: "müşteri rehber" },
      { id: "quotes", label: "Teklifler", href: "/admin/collections/quotes", icon: "quotes", modules: ["crm"], legacy: true },
    ],
  },
  {
    label: "Operasyon",
    items: [
      { id: "projects", label: "Projeler", href: "/admin/collections/projects", icon: "projects", modules: ["ops"], legacy: true, keywords: "iş" },
      { id: "tasks", label: "Görevler", href: "/admin/operasyon", icon: "tasks", modules: ["ops"], legacy: true, keywords: "görev panosu" },
      { id: "load", label: "Ekip yükü", href: "/admin/ekip-plani", icon: "load", modules: ["ops"], legacy: true, keywords: "kapasite plan" },
    ],
  },
  {
    label: "Raporlar",
    items: [
      { id: "exec", label: "Yönetim özeti", href: "/admin/yonetici", icon: "report", modules: ["business"], tenantAdmin: true, legacy: true, keywords: "yönetici panosu rapor" },
      { id: "chatreport", label: "Sohbet raporu", href: "/admin/sohbet-raporu", icon: "chat", modules: ["chat"], legacy: true },
      { id: "analytics", label: "Ziyaretçi analizi", href: "/admin/analiz", icon: "report", modules: ["site"], legacy: true, keywords: "umami ziyaret" },
    ],
  },
  {
    label: "Web sitesi",
    items: [
      { id: "pages", label: "Sayfalar ve blog", href: "/admin/globals/home-page", icon: "web", modules: ["site"], legacy: true, keywords: "içerik ana sayfa hizmet ürün blog" },
      { id: "media", label: "Medya", href: "/admin/collections/media", icon: "media", modules: ["site"], legacy: true, keywords: "görsel resim" },
    ],
  },
  {
    label: "",
    items: [{ id: "settings", label: "Ayarlar", href: "/panel/ayarlar", icon: "settings", keywords: "ekip kullanıcı davet bağlantı asistan" }],
  },
];

export type Access = { has: (m: Module) => boolean; isTenantAdmin: boolean };
export const itemVisible = (it: NavItem, a: Access) => (!it.modules || it.modules.some(a.has)) && (!it.tenantAdmin || a.isTenantAdmin);

/** İstemciye giden sade menü: yalnız görünen öğeler */
export function visibleNav(a: Access): NavGroup[] {
  /* Kopya: istek başına sayı rozeti yazılır, ortak tanım değişmez */
  return NAV.map((g) => ({ ...g, items: g.items.filter((it) => itemVisible(it, a)).map((it) => ({ ...it })) })).filter((g) => g.items.length);
}
