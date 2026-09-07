/**
 * Hizmet detay sayfalarının "vitrin anı" yapılandırması (ServiceSignature).
 *
 * Her hizmetin kendine özgü bir gösterim biçimi vardır; görseller yalnız
 * public/work altındaki mevcut dosyalardır. Piksel boyutları (w/h) gerçek
 * dosya boyutlarıdır: aspect-ratio ve `sizes` bunlardan türetilir (CLS yok).
 *
 * Video türü hazırdır ancak müşteriden mp4 gelene kadar hiçbir hizmet
 * kullanmaz; dosya geldiğinde ilgili kayıt tek satırla
 * `{ kind: "video", src: "/work/<dosya>.mp4", poster: "/work/....webp", alt }`
 * yapılır.
 */

export type ShowcaseImage = {
  src: string;
  alt: string;
  /** Gerçek piksel genişliği */
  w: number;
  /** Gerçek piksel yüksekliği */
  h: number;
};

/** Dar kesitlerde (telefon akışı, poster duvarı) görselin hangi kenarı korunur */
export type CropPosition = "left" | "center" | "right";

export type CroppedImage = ShowcaseImage & {
  position?: CropPosition;
  /** "contain": logo sayfası gibi kesilmemesi gereken görseller açık zemin üstünde tam görünür */
  fit?: "cover" | "contain";
};

export type LiveSite = { name: string; url: string };

export type Showcase =
  /** Scroll'a bağlı akan telefon ekranı (gönderi kareleri) */
  | { kind: "phone-feed"; items: CroppedImage[] }
  /** Basamaklı poster duvarı, tilt kartlar */
  | { kind: "poster-wall"; items: CroppedImage[] }
  /** Tarayıcı penceresi mockup'ları; her pencere içindeki canlı sitelere bağlanır */
  | { kind: "browser-grid"; items: (ShowcaseImage & { sites: LiveSite[] })[] }
  /** Tam genişlik yavaş akan kare bandı */
  | { kind: "reel"; items: ShowcaseImage[] }
  /** Vaka istatistikleri sayfadan gelir; burada yalnız ödül/rozet çifti */
  | { kind: "stat-band"; items: ShowcaseImage[] }
  /** Scroll'la büyüyen sessiz video (reduced-motion: kontroller açık, autoplay yok) */
  | { kind: "video"; src: string; poster: string; alt: string };

export type ServiceShowcase = {
  /** Hero sağ kolonu + mobil kapak; verilmezse service.images[0] kullanılır */
  hero?: ShowcaseImage;
  showcase: Showcase;
};

/* ------------------------------------------------------------------ */
/*  Görsel kütüphanesi (public/work)                                   */
/* ------------------------------------------------------------------ */

const IMG = {
  postKare: {
    src: "/work/instagram-post-kare.webp",
    alt: "Sosyal medya gönderi tasarımları",
    w: 1600,
    h: 1131,
  },
  postlar: {
    src: "/work/instagram-postlar.webp",
    alt: "Instagram gönderi akışı",
    w: 1600,
    h: 471,
  },
  cita: {
    src: "/work/sosyal-icerik-cita.webp",
    alt: "Çita temalı hareketli içerik kreatifi",
    w: 1600,
    h: 1131,
  },
  logo: {
    src: "/work/logo-tasarimlari.webp",
    alt: "Logo tasarımı örnekleri",
    w: 1600,
    h: 620,
  },
  ambalajEtiket: {
    src: "/work/ambalaj-etiket.webp",
    alt: "Ambalaj ve etiket tasarımları",
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
    alt: "Kavanoz ambalaj tasarımı",
    w: 1600,
    h: 1131,
  },
  aycekirdek: {
    src: "/work/ambalaj-aycekirdek.webp",
    alt: "Ay çekirdeği ambalaj tasarımı",
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
    alt: "Koyu temalı kurumsal web sitesi laptop mockup",
    w: 1600,
    h: 1396,
  },
  kolaj: {
    src: "/work/dijital-pazarlama.webp",
    alt: "Dijital pazarlama kreatif kolaj",
    w: 1600,
    h: 1605,
  },
  odulPartner: {
    src: "/work/odul-partner.webp",
    alt: "2025 yılında Google Partner olduk",
    w: 1600,
    h: 1131,
  },
  odulImpact: {
    src: "/work/odul-impact.webp",
    alt: "Google Ads Impact Awards 2025, Data Innovation kategorisi adayı",
    w: 1600,
    h: 1131,
  },
} satisfies Record<string, ShowcaseImage>;

/* ------------------------------------------------------------------ */
/*  Hizmet bazlı yapılandırma                                          */
/* ------------------------------------------------------------------ */

export const serviceShowcase: Record<string, ServiceShowcase> = {
  "sosyal-medya-yonetimi": {
    showcase: {
      kind: "phone-feed",
      items: [
        { ...IMG.postKare, position: "left" },
        IMG.cita,
        { ...IMG.postlar, position: "right" },
        { ...IMG.postKare, position: "right" },
      ],
    },
  },
  "grafik-tasarim": {
    showcase: {
      kind: "poster-wall",
      items: [
        { ...IMG.logo, fit: "contain" },
        IMG.ambalajEtiket,
        IMG.katalog,
        IMG.kavanoz,
        IMG.aycekirdek,
        { ...IMG.postKare, position: "left" },
      ],
    },
  },
  "icerik-uretimi": {
    showcase: {
      kind: "reel",
      items: [IMG.postlar, IMG.cita, IMG.katalog, IMG.aycekirdek],
    },
  },
  "web-tasarim": {
    hero: IMG.webMockupDark,
    showcase: {
      kind: "browser-grid",
      items: [
        {
          ...IMG.webSiteleri2,
          sites: [
            { name: "Ekoda", url: "ekoda.com.tr" },
            { name: "Jaecoo İnoto", url: "jaecoo.inoto.com.tr" },
            { name: "USRE Okulları", url: "usreokullari.com" },
          ],
        },
        {
          ...IMG.webSiteleri,
          sites: [
            { name: "Secen Gross", url: "secengross.com" },
            { name: "Aska Hotels", url: "askahotels.com" },
            { name: "Esdo İnşaat", url: "esdoinsaat.com" },
          ],
        },
      ],
    },
  },
  "dijital-pazarlama": {
    showcase: {
      kind: "stat-band",
      items: [IMG.odulPartner, IMG.odulImpact],
    },
  },
  "video-tasarimi": {
    showcase: {
      kind: "reel",
      items: [IMG.postlar, IMG.postKare, IMG.kolaj],
    },
  },
};

/** Vitrin içinde kullanılan görsel yolları; galeri bu kaynakları tekrar basmaz. */
export function showcaseSources(showcase: Showcase | undefined): string[] {
  if (!showcase) return [];
  if (showcase.kind === "video") return [showcase.poster];
  return showcase.items.map((item) => item.src);
}
