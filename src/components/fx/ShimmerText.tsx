"use client";

import { useEffect, useState, type ReactNode } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

/**
 * ShimmerText — büyük başlıklarda periyodik parlama süpürmesi.
 *
 * Teknik: asıl metin olduğu gibi render edilir (rengi ASLA değişmez);
 * üzerine aynı metnin aria-hidden bir kopyası absolute overlay olarak biner.
 * Overlay'de background-clip:text + (şeffaf → paper parlak → şeffaf)
 * linear-gradient vardır; motion backgroundPosition'ı animate ederek
 * parlamayı belirli aralıklarla soldan sağa süpürür.
 *
 * Hydration güvenliği: SSR ve istemcinin ilk render'ı birebir aynıdır —
 * overlay statik gradyan pozisyonuyla (parlama ekran dışında, görünmez)
 * render edilir; süpürme yalnız mount SONRASI, matchMedia useEffect'te
 * okunduktan sonra state ile başlar. Reduced-motion'da süpürme hiç başlamaz.
 */

export type ShimmerTextProps = {
  children: ReactNode;
  className?: string;
  /** İki süpürme arası bekleme (saniye). Varsayılan: 4 */
  interval?: number;
};

// background-size %250 iken pozisyon %150 → parlama sağda ekran dışı (görünmez),
// %-50 → solda ekran dışı; 150 → -50 animasyonu soldan sağa süpürme verir.
const SWEEP_REST = "150% 0%";
const SWEEP_END = "-50% 0%";

export function ShimmerText({ children, className, interval = 4 }: ShimmerTextProps) {
  // Süpürme yalnız mount sonrası ve motion-serbest ortamda açılır (SSR'da false)
  const [sweep, setSweep] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setSweep(!mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return (
    <span className={cn("relative inline-block", className)}>
      {/* asıl metin — ana rengi değişmez */}
      <span>{children}</span>

      {/* parlama katmanı: aynı metnin clip'li aria-hidden kopyası */}
      <motion.span
        aria-hidden
        className="pointer-events-none absolute inset-0 select-none text-transparent will-change-[background-position] [&_*]:text-transparent!"
        style={{
          backgroundImage:
            "linear-gradient(105deg, transparent 42%, rgba(245, 246, 245, 0.9) 50%, transparent 58%)",
          backgroundSize: "250% 100%",
          backgroundRepeat: "no-repeat",
          backgroundPosition: SWEEP_REST,
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
        }}
        animate={sweep ? { backgroundPosition: [SWEEP_REST, SWEEP_END] } : undefined}
        transition={{
          duration: 1.3,
          ease: "easeInOut",
          repeat: Infinity,
          repeatDelay: interval,
          delay: 0.8,
        }}
      >
        {children}
      </motion.span>
    </span>
  );
}
