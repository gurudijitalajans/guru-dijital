import type { JSX } from "react";

/**
 * Goo (sıvı damla) SVG filtre tanımı — Server Component.
 * Layout'a BİR KEZ konur; görünmez (0x0, absolute) bir SVG içinde durur.
 * Kullanım: herhangi bir elemana style={{ filter: "url(#guru-goo)" }}.
 *
 * Nasıl çalışır:
 * 1. feGaussianBlur  → şekilleri bulanıklaştırıp alfa kanallarını birbirine akıtır.
 * 2. feColorMatrix   → alfa kanalına yüksek kontrast (18x, -7 ofset) uygular;
 *                      bulanık alfa keskin bir "damla" siluetine dönüşür, yakın
 *                      şekiller köprü kurarak birbirine yapışır.
 * 3. feComposite     → orijinal grafik goo siluetinin üstüne (atop) bindirilir;
 *                      böylece damlalar hem akışkan hem de merkezde net kalır.
 */
export function GooDefs(): JSX.Element {
  return (
    <svg
      aria-hidden
      focusable="false"
      width="0"
      height="0"
      className="absolute h-0 w-0 overflow-hidden"
    >
      <defs>
        <filter
          id="guru-goo"
          x="-50%"
          y="-50%"
          width="200%"
          height="200%"
          colorInterpolationFilters="sRGB"
        >
          <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur" />
          <feColorMatrix
            in="blur"
            type="matrix"
            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7"
            result="goo"
          />
          <feComposite in="SourceGraphic" in2="goo" operator="atop" />
        </filter>
      </defs>
    </svg>
  );
}
