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

const IMG = {
  postKare: {
    src: "/work/instagram-post-kare.webp",
    alt: "Kampanya ve ürün odaklı sosyal medya gönderi tasarımları",
    w: 1580,
    h: 1131,
  },
  /* Dört gönderilik şerit (tam genişlikte basılmak için) */
  postlar: {
    src: "/work/instagram-postlar.webp",
    alt: "Instagram gönderi akışı tasarımları",
    w: 1250,
    h: 387,
  },
  /* Şeridin son iki gönderisi: yan karede kırpılmadan görünür; ilk ikisi postKare'de zaten var */
  postlarIkili: {
    src: "/work/instagram-postlar-ikili.webp",
    alt: "Kozmetik ve gıda markaları için Instagram gönderi tasarımları",
    w: 631,
    h: 387,
  },
  cita: {
    src: "/work/sosyal-icerik-cita.webp",
    alt: "Çita temalı sosyal medya içerik kreatifi",
    w: 1600,
    h: 1131,
  },
  logo: {
    src: "/work/logo-tasarimlari.webp",
    alt: "Farklı markalar için logo tasarımı örnekleri",
    w: 1600,
    h: 440,
  },
  ambalajEtiket: {
    src: "/work/ambalaj-etiket.webp",
    alt: "Ürün ailesi için ambalaj ve etiket tasarımları",
    w: 1600,
    h: 806,
  },
  katalog: {
    src: "/work/katalog-brosur.webp",
    alt: "Katalog ve broşür tasarımları",
    w: 1600,
    h: 829,
  },
  kavanoz: {
    src: "/work/ambalaj-kavanoz.webp",
    alt: "Kakaolu fındık kreması kavanoz ambalaj tasarımı",
    w: 1600,
    h: 1131,
  },
  aycekirdek: {
    src: "/work/ambalaj-aycekirdek.webp",
    alt: "Ay çekirdeği ambalajı ürün tanıtım kreatifi",
    w: 1600,
    h: 1131,
  },
  webSiteleri: {
    src: "/work/web-siteleri.webp",
    alt: "Secen Gross, Aska Hotels ve Esdo İnşaat web siteleri laptop mockupları",
    w: 1600,
    h: 758,
  },
  webSiteleri2: {
    src: "/work/web-siteleri-2.webp",
    alt: "Ekoda, Jaecoo İnoto ve USRE Okulları web siteleri laptop mockupları",
    w: 1600,
    h: 758,
  },
  webMockupDark: {
    src: "/work/web-mockup-dark.webp",
    alt: "Kurumsal web sitesi laptop mockup",
    w: 1600,
    h: 1396,
  },
  webLaptop: {
    src: "/work/web-laptop-kare.webp",
    alt: "Aska Hotels ve Esdo İnşaat web siteleri laptop mockupları",
    w: 1600,
    h: 1597,
  },
  kolaj: {
    src: "/work/dijital-pazarlama.webp",
    alt: "Dijital pazarlama kampanyası kreatif kolajı",
    w: 1600,
    h: 1605,
    position: "50% 10%",
  },
} satisfies Record<string, WorkImage>;

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

export const serviceVisuals: Record<string, ServiceVisual> = {
  "sosyal-medya-yonetimi": {
    card: IMG.postKare,
    gallery: [IMG.postKare, IMG.cita, IMG.postlarIkili],
  },
  "grafik-tasarim": {
    card: IMG.kavanoz,
    gallery: [IMG.kavanoz, IMG.katalog, IMG.ambalajEtiket, IMG.logo],
  },
  "icerik-uretimi": {
    card: IMG.cita,
    gallery: [IMG.cita, IMG.katalog, IMG.postlarIkili],
  },
  "web-tasarim": {
    card: IMG.webMockupDark,
    gallery: [IMG.webMockupDark, IMG.webSiteleri2, IMG.webSiteleri],
  },
  "dijital-pazarlama": {
    card: IMG.kolaj,
    gallery: [IMG.kolaj, IMG.postKare, IMG.webLaptop],
  },
  "video-tasarimi": {
    card: IMG.aycekirdek,
    gallery: [IMG.aycekirdek, IMG.cita, IMG.kavanoz],
  },
};
