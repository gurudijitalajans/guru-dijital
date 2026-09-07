"use client";

import { useRef } from "react";
import { motion, useInView } from "motion/react";
import { cn, parseAccent } from "@/lib/utils";
import { Reveal } from "@/components/ui/Reveal";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Eyebrow + display heading. Wrap accent words in *stars* to paint them green.
 *
 * Başlık, hero'daki gibi kelime bazlı maske reveal ile görünüme girer
 * (bölüm geçişleri düz fade yerine tipografik bir vurgu kazanır).
 * Görünürlük SARMALAYICIDA izlenir: maskenin dışına ötelenmiş bir kelimenin
 * görünür alanı sıfırdır, kendisini gözlemlemek hiç tetiklenmezdi.
 * Hydration: initial sabittir; reduced-motion layout'taki MotionConfig ile
 * uygulanır (transform atlanır, kelimeler anında yerine oturur).
 */
export function SectionHeading({
  eyebrow,
  title,
  sub,
  dark = false,
  center = false,
  className,
  as: Tag = "h2",
}: {
  eyebrow?: string;
  title: string;
  sub?: string;
  dark?: boolean;
  center?: boolean;
  className?: string;
  as?: "h1" | "h2" | "h3";
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-8% 0px" });

  const words: { w: string; accent: boolean }[] = [];
  for (const part of parseAccent(title)) {
    for (const w of part.t.split(" ")) {
      if (w.trim() !== "") words.push({ w, accent: part.accent });
    }
  }
  const plainTitle = title.replaceAll("*", "");

  return (
    <div className={cn("max-w-3xl", center && "mx-auto text-center", className)}>
      {eyebrow && (
        <Reveal y={16}>
          <div
            className={cn(
              "mb-4 inline-flex items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.18em]",
              dark ? "text-fg/60" : "text-smoke"
            )}
          >
            <span className="inline-block size-2 bg-guru" aria-hidden />
            {eyebrow}
          </div>
        </Reveal>
      )}
      <Tag
        className={cn(
          "font-bold leading-[1.06] tracking-[-0.03em]",
          Tag === "h1"
            ? "text-4xl sm:text-5xl md:text-6xl"
            : "text-3xl sm:text-4xl md:text-5xl",
          /* Başlık her zaman tema tokenı: zeminler (page/band/card) tema ile
             döndüğü için sabit ink burada gece modunda görünmez kalırdı.
             dark prop'u yalnız eyebrow/sub tonunu seçer. */
          "text-fg"
        )}
      >
        <span className="sr-only">{plainTitle}</span>
        <span
          ref={ref}
          aria-hidden
          className={cn(
            "inline-flex max-w-full flex-wrap gap-x-[0.26em] [overflow-wrap:anywhere]",
            center && "justify-center"
          )}
        >
          {words.map((word, i) => (
            <span key={i} className="-mb-[0.12em] overflow-hidden pb-[0.12em]">
              <motion.span
                className={cn(
                  "inline-block will-change-transform",
                  word.accent && "text-guru-text"
                )}
                initial={{ y: "115%" }}
                animate={{ y: inView ? 0 : "115%" }}
                transition={{ duration: 0.75, delay: 0.05 + i * 0.05, ease: EASE }}
              >
                {word.w}
              </motion.span>
            </span>
          ))}
        </span>
      </Tag>
      {sub && (
        <Reveal delay={0.12}>
          <p
            className={cn(
              "mt-5 text-base leading-relaxed md:text-lg",
              dark ? "text-fg/70" : "text-smoke"
            )}
          >
            {sub}
          </p>
        </Reveal>
      )}
    </div>
  );
}
