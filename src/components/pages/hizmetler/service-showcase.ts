/**
 * Hizmet sayfalarının görsel yapılandırması: VARSAYILAN/YEDEK. Canlıda
 * görseller paneldeki Hizmetler > Görseller sekmesinden gelir; npm run seed
 * bu yapılandırmayı panele aktarır.
 *
 * Görseller yalnız public/work altındaki gerçek iş görselleridir (public/tiles
 * eski yeşil soyut karolardır, kullanılmaz). w/h gerçek piksel boyutlarıdır;
 * tam genişlikte doğal oranla basılan görsellerde aspect-ratio bunlardan türer.
 */

export type WorkImage = {
  src: string;
  alt: string;
  /** Gerçek piksel genişliği */
  w: number;
  /** Gerçek piksel yüksekliği */
  h: number;
  /** Kırpmada korunacak odak (CSS object-position), varsayılan merkez */
  position?: string;
};

/* ------------------------------------------------------------------ */
/*  Görsel kütüphanesi (public/work)                                   */
/* ------------------------------------------------------------------ */



/* ------------------------------------------------------------------ */
/*  Hizmet bazlı yapılandırma                                          */
/* ------------------------------------------------------------------ */

export type ServiceVisual = {
  /** /hizmetler kartındaki görsel */
  card: WorkImage;
  /**
   * Detay sayfası galerisi: [ana, yan 1, yan 2, ...ek].
   * Ana görsel solda büyük, iki yan görsel sağda üst üste; ek görseller
   * altta tam genişlikte, doğal oranlarıyla basılır.
   */
  gallery: WorkImage[];
};

export const serviceVisuals: Record<string, ServiceVisual> = Object.fromEntries(
  (["dijital-reklam-yonetimi", "web-tasarim", "seo", "ozel-yazilim", "mobil-uygulama", "marka-tescil", "e-ticaret-yonetimi", "grafik-tasarim", "sosyal-medya-yonetimi"] as const).map((slug) => {
    const card: WorkImage = { src: `/services/${slug}.webp`, alt: "Guru Dijital hizmet görseli", w: 1600, h: 1000 };
    const poster: WorkImage = { src: `/services/${slug}-poster.webp`, alt: "Guru Dijital hizmet afişi", w: 1200, h: 1500 };
    return [slug, { card, gallery: [card, poster] }];
  })
);
