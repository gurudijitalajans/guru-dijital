"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import { cn, parseAccent } from "@/lib/utils";

const EASE = [0.22, 1, 0.36, 1] as const;

export type PageHeroV2Props = {
  eyebrow: string;
  /** *Yıldız* işaretli kelimeler marka yeşiline boyanır. */
  title: string;
  sub?: string;
  children?: ReactNode;
  /** lg+ ekranlarda sağ kolonda gösterilen görsel/rozet slotu (tam genişlik kullanımı) */
  aside?: ReactNode;
  className?: string;
  /** Daha kısa padding'li kompakt varyant. */
  minimal?: boolean;
};

/**
 * Tüm iç sayfaların koyu (bg-page) hero'su. Başlık kelime bazlı maske
 * reveal ile MOUNT anında animasyonlanır — hero her zaman sayfanın en
 * üstünde göründüğü için whileInView'e gerek yoktur.
 */
export function PageHeroV2({
  eyebrow,
  title,
  sub,
  children,
  aside,
  className,
  minimal = false,
}: PageHeroV2Props) {
  const reduce = useReducedMotion();

  /* "*yeşil* kelime" işaretlerini kelime listesine aç */
  const words: { w: string; accent: boolean }[] = [];
  for (const part of parseAccent(title)) {
    for (const w of part.t.split(" ")) {
      if (w.trim() !== "") words.push({ w, accent: part.accent });
    }
  }

  const wordStagger = 0.05;
  const subDelay = 0.3 + Math.min(words.length * wordStagger, 0.35);

  return (
    <section
      className={cn(
        "relative overflow-hidden border-b border-fg/10 bg-page",
        minimal
          ? "pb-10 pt-28 md:pb-14 md:pt-36"
          : "pb-16 pt-36 md:pb-24 md:pt-44",
        className
      )}
    >
      {/* Çok hafif nokta deseni (CSS radial-gradient — canvas yok) */}
      <div
        className="absolute inset-0 bg-[radial-gradient(color-mix(in_oklab,var(--color-fg)_5%,transparent)_1px,transparent_1px)] bg-[size:26px_26px] [mask-image:linear-gradient(to_bottom,black,transparent_88%)]"
        aria-hidden
      />
      {/* Sağ üstte sönük yeşil radial glow */}
      <div
        className="grain-blob -right-32 -top-32 h-96 w-96 opacity-25 md:-right-24 md:h-[30rem] md:w-[30rem]"
        aria-hidden
      />

      <div className="container-g relative grid items-center gap-10 lg:grid-cols-[1fr_auto]">
        {/* min-w-0: uzun tek kelimeler grid hücresini viewport dışına genişletmesin */}
        <div className="min-w-0">
        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: reduce ? 0 : 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE }}
          className="mb-5 inline-flex items-center gap-2.5 text-[13px] font-semibold uppercase tracking-[0.22em] text-fg/60"
        >
          <span
            className="inline-block size-2 bg-guru shadow-[0_0_14px_rgb(16_216_108/0.8)]"
            aria-hidden
          />
          {eyebrow}
        </motion.div>

        {/* Başlık — kelime bazlı maske reveal (mount'ta) */}
        {/* overflow-wrap:anywhere: dar ekranda sığmayan tek kelime kırpılmak yerine bölünür */}
        <h1
          className="max-w-4xl text-[2.75rem] font-extrabold leading-[1.04] tracking-[-0.04em] text-fg [overflow-wrap:anywhere] sm:text-6xl lg:text-7xl"
          aria-label={title.replaceAll("*", "")}
        >
          <span className="inline-flex flex-wrap gap-x-[0.26em]" aria-hidden>
            {words.map((word, i) => (
              <span
                key={i}
                className="-mb-[0.1em] overflow-hidden pb-[0.1em]"
              >
                <motion.span
                  className={cn(
                    "inline-block will-change-transform",
                    word.accent && "text-guru"
                  )}
                  initial={{ y: reduce ? 0 : "115%" }}
                  animate={{ y: 0 }}
                  transition={{
                    duration: 0.8,
                    delay: 0.15 + i * wordStagger,
                    ease: EASE,
                  }}
                >
                  {word.w}
                </motion.span>
              </span>
            ))}
          </span>
        </h1>

        {/* Alt metin */}
        {sub && (
          <motion.p
            initial={{ opacity: 0, y: reduce ? 0 : 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: subDelay, ease: EASE }}
            className="mt-6 max-w-2xl text-base leading-relaxed text-fg/65 md:text-lg"
          >
            {sub}
          </motion.p>
        )}

        {/* Slot */}
        {children && (
          <motion.div
            initial={{ opacity: 0, y: reduce ? 0 : 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: subDelay + 0.1, ease: EASE }}
            className="mt-8"
          >
            {children}
          </motion.div>
        )}
        </div>

        {aside && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.5, ease: EASE }}
            className="hidden lg:block"
          >
            {aside}
          </motion.div>
        )}
      </div>
    </section>
  );
}
