"use client";

import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * ManifestoBand — delucks tarzı dev, oyunbaz kelime akışı.
 * Tek cümlelik manifesto; her kelime ayrı bir etkileşim birimi:
 * hover'da yeşile dolar, hafif eğilir ve yükselir. Bazı kelimeler
 * kalıcı outline/yeşil olarak ritim kurar. Az metin, büyük etki.
 */

type Word = { t: string; tone?: "outline" | "green" };

const WORDS: Word[] = [
  { t: "Strateji," },
  { t: "tasarım,", tone: "outline" },
  { t: "içerik" },
  { t: "ve" },
  { t: "performans:" },
  { t: "tek", tone: "green" },
  { t: "çatıda.", tone: "green" },
];

export function ManifestoBand({ className }: { className?: string }) {
  const reduce = useReducedMotion();

  return (
    <section
      className={cn(
        "relative overflow-hidden bg-ink py-20 md:py-28",
        className
      )}
      aria-label="Manifesto"
    >
      <div className="grain-blob right-[-10%] top-[-30%] h-72 w-72 opacity-20 md:h-96 md:w-96" aria-hidden />

      <div className="container-g">
        <p className="flex flex-wrap items-baseline gap-x-[0.32em] gap-y-2 font-extrabold leading-[1.02] tracking-[-0.04em] text-[clamp(2.2rem,7vw,5.5rem)]">
          {WORDS.map((w, i) => (
            <motion.span
              key={i}
              initial={reduce ? undefined : { opacity: 0, y: 34 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-12% 0px" }}
              transition={{ duration: 0.6, delay: i * 0.055, ease: EASE }}
              whileHover={
                reduce
                  ? undefined
                  : { y: -8, skewX: -6, transition: { duration: 0.25 } }
              }
              className={cn(
                "inline-block cursor-default transition-colors duration-300",
                w.tone === "green"
                  ? "text-guru drop-shadow-[0_0_24px_rgb(16_216_108/0.3)]"
                  : w.tone === "outline"
                    ? "headline-outline-light hover:text-guru hover:[-webkit-text-stroke:0px]"
                    : "text-paper hover:text-guru"
              )}
            >
              {w.t}
            </motion.span>
          ))}
        </p>
      </div>
    </section>
  );
}
