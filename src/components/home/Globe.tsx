"use client";

import { useEffect, useRef } from "react";
import createGlobe from "cobe";
import { cn } from "@/lib/utils";

/* cobe yönlendirmesi: verilen enlem/boylamı izleyiciye döndüren açılar */
const toAngles = (lat: number, lng: number): [number, number] => [
  Math.PI - ((lng * Math.PI) / 180 - Math.PI / 2),
  (lat * Math.PI) / 180,
];

/* Türkiye işaretleri: İstanbul büyük, diğer şehirler küçük */
const MARKERS: { location: [number, number]; size: number }[] = [
  { location: [41.01, 28.97], size: 0.075 },
  { location: [39.93, 32.86], size: 0.045 },
  { location: [38.42, 27.14], size: 0.04 },
  { location: [36.9, 30.7], size: 0.035 },
  { location: [38.64, 34.83], size: 0.035 },
  { location: [37.0, 35.32], size: 0.03 },
];

export type GlobeProps = { className?: string };

/**
 * EDME'deki nokta küresinin Guru karşılığı (açık kaynak cobe, ~5 KB WebGL).
 * Beyaz küre, lacivert noktalar, mavi Türkiye işaretleri. Yavaşça döner;
 * fareyle/parmakla çevrilebilir. Ekran dışındayken ve hareket azaltma
 * tercihinde dönüş durur. WebGL yoksa aynı açıdan alınmış durağan kare
 * (public/brand/globe-still.webp) CSS arka planı olarak gösterilir; yalnız o durumda indirilir.
 */
export function Globe({ className }: GlobeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; phi: number } | null>(null);
  const offset = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let size = wrap.clientWidth;
    /* Türkiye biraz soldan başlar, yavaşça merkeze ve öteye döner */
    let [phi, theta] = toAngles(39, 33);
    phi -= 0.35;
    theta = 0.32;
    let visible = true;
    let globe: ReturnType<typeof createGlobe> | null = null;
    /* data-fallback CSS ile kareyi açar; effect içinde setState yok */
    const fallback = () => {
      wrap.dataset.fallback = "1";
    };
    if (!document.createElement("canvas").getContext("webgl")) {
      fallback();
      return;
    }

    try {
      globe = createGlobe(canvas, {
        devicePixelRatio: dpr,
        width: size * dpr,
        height: size * dpr,
        phi,
        theta,
        dark: 0,
        diffuse: 1.15,
        scale: 1,
        mapSamples: coarse ? 12000 : 20000,
        mapBrightness: 5.5,
        mapBaseBrightness: 0,
        baseColor: [1, 1, 1],
        markerColor: [0.165, 0.416, 0.792],
        glowColor: [0.93, 0.96, 1],
        opacity: 0.95,
        markers: MARKERS,
        onRender: (state) => {
          if (!drag.current && !reduce && visible) phi += 0.0011;
          state.phi = phi + offset.current;
          state.theta = theta;
          state.width = size * dpr;
          state.height = size * dpr;
        },
      });
    } catch {
      fallback();
      return;
    }

    requestAnimationFrame(() => {
      if (canvasRef.current) canvasRef.current.style.opacity = "1";
    });

    const ro = new ResizeObserver(() => {
      size = wrap.clientWidth;
    });
    ro.observe(wrap);
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
    });
    io.observe(wrap);

    return () => {
      ro.disconnect();
      io.disconnect();
      globe?.destroy();
    };
  }, []);

  return (
    <div ref={wrapRef} className={cn("group relative aspect-square w-full", className)}>
      {/* CSS arka planı yalnız kural eşleşince indirilir: WebGL olan ziyaretçiye yük yok */}
      <div
        aria-hidden
        className="hidden aspect-[2/1] w-full bg-[url(/brand/globe-still.webp)] bg-contain bg-top bg-no-repeat group-data-[fallback=1]:block"
      />
      <canvas
        ref={canvasRef}
        aria-hidden
        className="size-full cursor-grab opacity-0 transition-opacity duration-1000 [contain:layout_paint_size] active:cursor-grabbing group-data-[fallback=1]:hidden"
        onPointerDown={(e) => {
          drag.current = { x: e.clientX, phi: offset.current };
          (e.currentTarget as HTMLCanvasElement).setPointerCapture(e.pointerId);
        }}
        onPointerMove={(e) => {
          if (!drag.current) return;
          offset.current = drag.current.phi + (e.clientX - drag.current.x) / 180;
        }}
        onPointerUp={() => {
          drag.current = null;
        }}
        onPointerCancel={() => {
          drag.current = null;
        }}
      />
    </div>
  );
}
