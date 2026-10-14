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
    const v = (name: string, w: number, h: number): WorkImage => ({ src: `/services/v3/${slug}-${name}.webp`, alt: "Guru Dijital hizmet görseli", w, h });
    const card = v("hero", 1600, 1000);
    return [slug, { card, gallery: [card, v("kapak", 1200, 1500), ...[1, 2, 3, 4, 5, 6].map((i) => v(String(i), 1200, 900))] }];
  })
);
