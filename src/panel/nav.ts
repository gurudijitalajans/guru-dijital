import type { Module } from "@/payload/business/roles";

/**
 * Yeni panelin menüsü: işe göre gruplar, en çok iki seviye. İçerik
 * ekranında (/admin) açılan bir öğe olursa `legacy` ile küçük bir ok
 * işaretiyle görünür.
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
  /** İçerik ekranında (/admin) açılır */
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
      { id: "calendar", label: "Takvim", href: "/panel/takvim", icon: "calendar", modules: ["crm", "ops"], keywords: "randevu toplantı arama teslim ajanda" },
    ],
  },
  {
    label: "Satış",
    items: [
      { id: "deals", label: "Fırsatlar", href: "/panel/firsatlar", icon: "deals", modules: ["crm"], keywords: "satış hattı pano" },
      { id: "people", label: "Kişiler ve firmalar", href: "/panel/kisiler", icon: "people", modules: ["crm"], keywords: "müşteri rehber" },
      { id: "quotes", label: "Teklifler", href: "/panel/teklifler", icon: "quotes", modules: ["crm"], keywords: "teklif fiyat belge pdf" },
    ],
  },
  {
    label: "Operasyon",
    items: [
      { id: "projects", label: "Projeler", href: "/panel/projeler", icon: "projects", modules: ["ops"], keywords: "iş müşteri işi" },
      { id: "tasks", label: "Görevler", href: "/panel/gorevler", icon: "tasks", modules: ["ops"], keywords: "görev panosu" },
      { id: "load", label: "Ekip yükü", href: "/panel/ekip-yuku", icon: "load", modules: ["ops"], keywords: "kapasite plan ekip planı" },
    ],
  },
  {
    label: "Raporlar",
    items: [
      { id: "exec", label: "Yönetim özeti", href: "/panel/ozet", icon: "report", modules: ["business"], tenantAdmin: true, keywords: "yönetici panosu rapor hedef" },
      { id: "chatreport", label: "Sohbet raporu", href: "/panel/sohbet-raporu", icon: "chat", modules: ["chat"], keywords: "asistan konu yanıtlanamayan" },
      { id: "analytics", label: "Ziyaretçi analizi", href: "/panel/ziyaretci", icon: "report", modules: ["site"], keywords: "umami ziyaret trafik" },
    ],
  },
  {
    label: "Web sitesi",
    items: [
      { id: "content", label: "Site içeriği", href: "/panel/icerik", icon: "web", modules: ["site"], keywords: "sayfalar ana sayfa hakkımızda hizmet ürün blog yazı ekip referans yorum vaka" },
      { id: "media", label: "Medya", href: "/panel/medya", icon: "media", modules: ["site"], keywords: "görsel resim fotoğraf logo klasör yükle" },
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
