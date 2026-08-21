"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
} from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * LiquidImage — hover'da sıvı gibi dalgalanan görsel.
 *
 * Çalışma prensibi:
 * - next/image, relative bir sarmalayıcı içinde `fill` ile render edilir.
 * - Hover başlayınca (yalnız pointer:fine + motion serbest ortamda) instance'a
 *   özel bir SVG filtresi (feTurbulence fractalNoise + feDisplacementMap)
 *   DOM'a eklenir ve rAF döngüsüyle displacement scale 0 → ~26'ya, turbulence
 *   frekansı da zamanla salınarak "akan dalga" hissine lerp'lenir.
 * - Hover bitince zarf (envelope) sıfıra iner, filtre tamamen kaldırılır →
 *   idle durumda maliyet 0.
 *
 * Hydration güvenliği:
 * - SSR ve istemcinin ilk render'ı filtresiz düz görseldir; filtre yalnızca
 *   mount sonrası hover state'iyle eklenir. matchMedia yalnız useEffect'te okunur.
 * - pointer:coarse veya prefers-reduced-motion'da efekt hiç devreye girmez;
 *   görsel düz kalır (dıştan gelen hover zoom sınıfları çalışmaya devam eder).
 *
 * Kullanım: sarmalayıcının boyutu dışarıdan gelir (aspect-* sınıfı veya
 * `absolute inset-0`); `data-cursor="view"` gibi ekstra attribute'lar
 * ...rest ile sarmalayıcıya geçirilir.
 */

/** Maksimum displacement (px) — hover zarfı 1'e ulaşınca uygulanan değer. */
const MAX_SCALE = 26;
/** Zarf yaklaşım hızı (saniye başına üstel katsayı). */
const EASE_RATE = 7;

export type LiquidImageProps = {
  src: string;
  alt: string;
  /** next/image responsive sizes. */
  sizes?: string;
  /** Sarmalayıcı div sınıfları (boyut/oran buradan gelir). */
  className?: string;
  /** LCP görseli işareti — Next 16'da `preload` prop'una çevrilir. */
  priority?: boolean;
  /** İç <img> için ek sınıflar (ör. mevcut hover zoom davranışı). */
  imgClassName?: string;
} & Omit<ComponentPropsWithoutRef<"div">, "children" | "className">;

export function LiquidImage({
  src,
  alt,
  sizes,
  className,
  priority,
  imgClassName,
  onPointerEnter,
  onPointerLeave,
  ...rest
}: LiquidImageProps) {
  // useId çıktısındaki özel karakterler CSS url(#...) için temizlenir.
  const rawId = useId();
  const filterId = `liquid-${rawId.replace(/[^a-zA-Z0-9_-]/g, "")}`;

  const mediaRef = useRef<HTMLDivElement>(null);
  const turbRef = useRef<SVGFETurbulenceElement>(null);
  const dispRef = useRef<SVGFEDisplacementMapElement>(null);

  /** Efekt izni: pointer:fine && !reduced-motion — yalnız mount sonrası dolar. */
  const enabledRef = useRef(false);
  /** Hedef zarf: hover'da 1, ayrılınca 0. */
  const targetRef = useRef(0);
  /** Mevcut zarf değeri (0..1) — render tetiklemeden rAF içinde güncellenir. */
  const envRef = useRef(0);

  /** SVG filtresi yalnız aktifken DOM'da bulunur (idle maliyet 0). */
  const [active, setActive] = useState(false);

  /* --- Ortam tespiti: matchMedia yalnız useEffect'te (hydration güvenli) --- */
  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      enabledRef.current = fine.matches && !reduce.matches;
    };
    update();
    fine.addEventListener("change", update);
    reduce.addEventListener("change", update);
    return () => {
      fine.removeEventListener("change", update);
      reduce.removeEventListener("change", update);
    };
  }, []);

  /* --- rAF döngüsü: yalnız aktifken çalışır, cleanup'lı --- */
  useEffect(() => {
    if (!active) return;

    let raf = 0;
    let last = performance.now();
    let t = 0; // dalga fazı (sn)

    const tick = (now: number) => {
      const dt = Math.min(now - last, 64) / 1000; // arka plan sekmesi sıçramasını önle
      last = now;
      t += dt;

      // Ortam koşulu hover sırasında bozulursa (ör. reduce açıldı) zarif geri çekil.
      if (!enabledRef.current) targetRef.current = 0;

      // Kare hızından bağımsız üstel lerp.
      const env =
        envRef.current +
        (targetRef.current - envRef.current) * (1 - Math.exp(-dt * EASE_RATE));
      envRef.current = env;

      // Zarf söndü → filtreyi tamamen kaldır ve döngüyü durdur.
      if (targetRef.current === 0 && env < 0.004) {
        envRef.current = 0;
        const media = mediaRef.current;
        if (media) {
          media.style.filter = "";
          media.style.transform = "";
        }
        setActive(false);
        return;
      }

      const turb = turbRef.current;
      const disp = dispRef.current;
      const media = mediaRef.current;
      if (turb && disp && media) {
        // Frekansların x/y farklı fazlarla salınması dalgayı "akıtır".
        const bfX = 0.011 + 0.005 * Math.sin(t * 0.9);
        const bfY = 0.017 + 0.005 * Math.cos(t * 0.7);
        turb.setAttribute("baseFrequency", `${bfX.toFixed(4)} ${bfY.toFixed(4)}`);
        disp.setAttribute("scale", (MAX_SCALE * env).toFixed(2));
        media.style.filter = `url("#${filterId}")`;
        // Displacement'ın kenarda açtığı boşluğu gizlemek için hafif zoom.
        media.style.transform = `scale(${(1 + 0.045 * env).toFixed(4)})`;
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, filterId]);

  return (
    <div
      {...rest}
      className={cn("relative overflow-hidden", className)}
      onPointerEnter={(e) => {
        onPointerEnter?.(e);
        if (!enabledRef.current) return;
        targetRef.current = 1;
        setActive(true);
      }}
      onPointerLeave={(e) => {
        onPointerLeave?.(e);
        targetRef.current = 0;
      }}
    >
      {/* Filtre bu katmana uygulanır; img'in kendi transition'ları bozulmaz */}
      <div ref={mediaRef} className="absolute inset-0 will-change-transform">
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          preload={priority}
          className={cn("object-cover", imgClassName)}
        />
      </div>

      {/* Instance'a özel SVG filtresi — yalnız hover aktifken DOM'da */}
      {active && (
        <svg aria-hidden className="pointer-events-none absolute h-0 w-0">
          <defs>
            <filter
              id={filterId}
              x="-25%"
              y="-25%"
              width="150%"
              height="150%"
              colorInterpolationFilters="sRGB"
            >
              <feTurbulence
                ref={turbRef}
                type="fractalNoise"
                baseFrequency="0.011 0.017"
                numOctaves="2"
                seed="7"
                stitchTiles="stitch"
                result="liquid-noise"
              />
              <feDisplacementMap
                ref={dispRef}
                in="SourceGraphic"
                in2="liquid-noise"
                scale="0"
                xChannelSelector="R"
                yChannelSelector="G"
              />
            </filter>
          </defs>
        </svg>
      )}
    </div>
  );
}
