"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

const EASE = [0.22, 1, 0.36, 1] as const;
const DIGITS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"] as const;

export type RollingCounterProps = {
  value: number;
  prefix?: string;
  suffix?: string;
  className?: string;
};

/**
 * Odometre stili sayaç: her rakam için 0-9 şeridi dikey kayarak yerine oturur.
 * Görünüme girince bir kez oynar; ondalık değerleri destekler (54,5).
 * Reduced-motion tercihi varsa animasyonsuz, direkt değer gösterilir.
 */
export function RollingCounter({
  value,
  prefix = "",
  suffix = "",
  className,
}: RollingCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  // ÖNEMLİ: şeritler overflow-hidden sütunların içinde kaydığı için görünürlük
  // gözlemcisi kayan şeride değil, bu DIŞ sarmalayıcıya bağlanır.
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const reduce = useReducedMotion();

  const decimals = value % 1 === 0 ? 0 : 1;
  const formatted = value.toLocaleString("tr-TR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  const label = `${prefix}${formatted}${suffix}`;

  // Hydration notu: reduced-motion'da farklı (düz) bir ağaç render etmek SSR ile
  // istemcinin ilk render'ını ayrıştırır (useReducedMotion SSR'da null, istemcide
  // true). Ağaç her durumda aynı kalır; reduce yalnızca animasyonu süresizleştirir.
  return (
    <span
      ref={ref}
      role="img"
      aria-label={label}
      className={cn("inline-flex leading-none tabular-nums", className)}
    >
      {prefix && (
        <span aria-hidden className="inline-block h-[1em] leading-[1]">
          {prefix}
        </span>
      )}
      <span aria-hidden className="inline-flex">
        {formatted.split("").map((ch, i) =>
          /\d/.test(ch) ? (
            <span key={i} className="inline-block h-[1em] overflow-hidden">
              <motion.span
                className="flex flex-col"
                initial={{ y: 0 }}
                animate={inView || reduce ? { y: `-${Number(ch)}em` } : { y: 0 }}
                transition={
                  reduce
                    ? { duration: 0 }
                    : { duration: 0.9, delay: 0.15 + i * 0.08, ease: EASE }
                }
              >
                {DIGITS.map((d) => (
                  <span key={d} className="block h-[1em] text-center leading-[1]">
                    {d}
                  </span>
                ))}
              </motion.span>
            </span>
          ) : (
            <span key={i} className="inline-block h-[1em] leading-[1]">
              {ch}
            </span>
          )
        )}
      </span>
      {suffix && (
        <span aria-hidden className="inline-block h-[1em] leading-[1]">
          {suffix}
        </span>
      )}
    </span>
  );
}
