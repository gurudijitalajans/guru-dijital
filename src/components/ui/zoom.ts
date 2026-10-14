/* Lightbox ile büyütülebilir görseller: sunucu bileşenlerinde de kullanılabilir (istemci kodu değil) */

/** Büyütülebilir görselin sarmalayıcısına konacak öznitelikler (sunucu bileşenlerinden kullanılır) */
export function zoomProps(img: { src: string; alt: string; w?: number; h?: number }) {
  return {
    "data-zoom": img.src,
    "data-zoom-alt": img.alt,
    "data-zoom-w": img.w ?? 1600,
    "data-zoom-h": img.h ?? 1000,
    role: "button",
    tabIndex: 0,
    "aria-label": `Görseli büyüt: ${img.alt}`,
  } as const;
}

/** Büyütülebilir sarmalayıcının sınıfı */
export const zoomCls = "cursor-zoom-in focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand";
