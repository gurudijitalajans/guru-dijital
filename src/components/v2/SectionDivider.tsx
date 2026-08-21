"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { cn } from "@/lib/utils";

/**
 * SectionDivider — bölümler arası kavisli geçiş bandı.
 *
 * Üstteki bölümün rengi (from) zemin, alttaki bölümün rengi (to) kavisli
 * path olarak dolar; kavisin sırtında ince yeşil stroke vurgusu (halo + çizgi).
 * Scroll'a bağlı hafif morph: iki sabit path d string'i arasında useTransform
 * interpolasyonu — girdi aralığı kesinlikle [0,1] içinde ve artan.
 *
 * Hydration güvenliği: SSR'da MotionValue'nun ilk değeri (progress 0 → FILL_A)
 * render edilir, istemcinin ilk render'ı ile birebir aynıdır. Reduced-motion
 * tercihi useEffect'te okunur; morph yerine statik kavis attribute'u ancak
 * mount SONRASI devreye girer (DOM yapısı hiç değişmez).
 */

export type SectionTone = "coal" | "ink" | "carbon";

export type SectionDividerProps = {
  /** Üstteki bölümün zemin tonu. Varsayılan: "coal" */
  from?: SectionTone;
  /** Alttaki bölümün zemin tonu. Varsayılan: "ink" */
  to?: SectionTone;
  /** Kavisi yatayda aynala */
  flip?: boolean;
  className?: string;
};

/** Tema token hex'leri (globals.css ile senkron) */
const TONE_HEX: Record<SectionTone, string> = {
  coal: "#0e100f",
  ink: "#0a0b0a",
  carbon: "#181b19",
};

// İki morph durumu — komut yapıları birebir aynı (M L C C L Z),
// motion d string'lerindeki sayıları güvenle interpolate eder.
// Dikiş sızıntısı önlemi: fill, viewBox alt/yan kenarlarını 1-2px TAŞAR
// (y=91, x=-2/1442). Kenarla çakışan path antialiasing'i divider'ın son
// piksel sırasında `from` zeminini hairline olarak sızdırıyordu; taşan
// geometri viewport'ta kırpılır ve alt sıra saf `to` rengiyle dolar.
const FILL_A =
  "M-2,91 L-2,58 C240,12 480,72 720,42 C960,12 1200,60 1442,30 L1442,91 Z";
const FILL_B =
  "M-2,91 L-2,40 C240,72 480,14 720,52 C960,84 1200,24 1442,56 L1442,91 Z";
const LINE_A = "M0,58 C240,12 480,72 720,42 C960,12 1200,60 1440,30";
const LINE_B = "M0,40 C240,72 480,14 720,52 C960,84 1200,24 1440,56";

export function SectionDivider({
  from = "coal",
  to = "ink",
  flip = false,
  className,
}: SectionDividerProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  // Girdi aralığı [0,1] içinde ve artan — kural gereği
  const fillD = useTransform(scrollYProgress, [0, 1], [FILL_A, FILL_B]);
  const lineD = useTransform(scrollYProgress, [0, 1], [LINE_A, LINE_B]);

  return (
    <div
      ref={ref}
      aria-hidden
      /* -mb-px: alt kenar sonraki bölümle 1px örtüşür; fill hex'i bölüm
         zeminiyle birebir aynı olduğundan örtüşme görünmez, kesirli zoom
         kaynaklı zemin hairline'ı da kapanır. Üstte -mt-px YOK: bazı
         sayfalarda divider'dan önceki bölümün bilinçli border-b çizgisi
         var, örtüşme o çizgiyi ezerdi. */
      className={cn("relative -mb-px h-[90px] w-full overflow-hidden", className)}
      style={{ backgroundColor: TONE_HEX[from] }}
    >
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 1440 90"
        preserveAspectRatio="none"
        style={{ transform: flip ? "scaleX(-1)" : undefined }}
      >
        {/* alttaki bölümün rengine kavisli dolgu */}
        <motion.path d={reduced ? FILL_A : fillD} fill={TONE_HEX[to]} />
        {/* kavis sırtında yeşil vurgu: sönük geniş halo + ince keskin çizgi */}
        <motion.path
          d={reduced ? LINE_A : lineD}
          fill="none"
          stroke="#10d86c"
          strokeOpacity={0.14}
          strokeWidth={5}
          vectorEffect="non-scaling-stroke"
        />
        <motion.path
          d={reduced ? LINE_A : lineD}
          fill="none"
          stroke="#10d86c"
          strokeOpacity={0.55}
          strokeWidth={1.5}
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  );
}
