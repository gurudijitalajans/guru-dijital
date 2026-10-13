import type { Module } from "@/payload/business/roles";

/**
 * Panel düzenleyicisinde açılan içerik türleri: başlık, modül, sitede hangi
 * adreste önizleneceği ve geri dönülecek liste. Taşındıkça buraya eklenir.
 */
export type EntityDef = {
  type: "global" | "collection";
  label: string;
  module: Module;
  adminOnly?: boolean;
  back: string;
  /** Kaydın sitedeki adresi (canlı önizleme) */
  preview?: (doc: Record<string, unknown>) => string | null;
  /** Koleksiyonda kaydın adı */
  titleField?: string;
};

export const ENTITIES: Record<string, EntityDef> = {
  "home-page": { type: "global", label: "Ana Sayfa", module: "site", back: "/panel/icerik", preview: () => "/" },
  "about-page": { type: "global", label: "Hakkımızda", module: "site", back: "/panel/icerik", preview: () => "/hakkimizda" },
  "site-settings": { type: "global", label: "Site Ayarları", module: "site", back: "/panel/icerik", preview: () => "/iletisim" },
  services: { type: "collection", label: "Hizmet", module: "site", back: "/panel/icerik?tur=hizmetler", titleField: "title", preview: (d) => (d.slug ? `/hizmetler/${d.slug}` : null) },
  products: { type: "collection", label: "Ürün", module: "site", back: "/panel/icerik?tur=urunler", titleField: "name", preview: (d) => (d.slug ? `/urunler/${d.slug}` : null) },
  posts: { type: "collection", label: "Blog yazısı", module: "site", back: "/panel/icerik?tur=blog", titleField: "title", preview: (d) => (d.slug ? `/blog/${d.slug}` : null) },
};

export const editorHref = (slug: string, id?: number | string | null) => `/panel/duzenle/${slug}${id ? `/${id}` : ""}`;
