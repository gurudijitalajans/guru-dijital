"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/components/fx/usePrefersReducedMotion";

/**
 * ManifestoBand: delucks tarzı dev, oyunbaz kelime akışı.
 * Tek cümlelik manifesto; kelimeler scroll ile sırayla dolar (scrub),
 * hover'da yeşile dolar, hafif eğilir ve yükselir. Bazı kelimeler
 * kalıcı outline/yeşil olarak ritim kurar. Az metin, büyük etki.
 *
 * Hydration: SSR ve istemcinin ilk render'ı aynıdır (scroll ilerlemesi 0,
 * reduced-motion sunucu anlık görüntüsü false). Reduced-motion'da kelimeler
 * tam opak durur; hover hareketi kapanır.
 */

type Word = { t: string; tone?: "outline" | "green"; group?: string };

const WORDS: Word[] = [
  { t: "Strateji," },
  { t: "tasarım,", tone: "outline" },
  { t: "içerik" },
  { t: "ve" },
  { t: "performans:" },
  /* "tek çatıda." dar ekranda ayrı satırlara düşmesin: tek grup */
  { t: "tek", tone: "green", group: "cati" },
  { t: "çatıda.", tone: "green", group: "cati" },
];

/** Ardışık aynı gruptaki kelimeler nowrap sarmalayıcıda birlikte basılır. */
const CHUNKS: { words: Word[]; start: number }[] = WORDS.reduce<
  { words: Word[]; start: number }[]
>((acc, w, i) => {
  const last = acc[acc.length - 1];
  if (last && w.group && last.words[0]?.group === w.group) last.words.push(w);
  else acc.push({ words: [w], start: i });
  return acc;
}, []);

function ManifestoWord({
  word,
  index,
  progress,
  reduce,
}: {
  word: Word;
  index: number;
  progress: MotionValue<number>;
  reduce: boolean;
}) {
  const n = WORDS.length;
  /* Girdi aralığı [0,1] içinde ve artan: kelime i, ilerlemenin i/n..(i+1)/n
     diliminde 0.22 → 1 dolar. */
  const opacity = useTransform(
    progress,
    [index / n, Math.min(1, (index + 1) / n)],
    [0.22, 1]
  );

  return (
    <motion.span
      style={{ opacity: reduce ? 1 : opacity }}
      whileHover={reduce ? undefined : { y: -8, skewX: -6, transition: { duration: 0.25 } }}
      className={cn(
        "inline-block cursor-default transition-colors duration-300",
        word.tone === "green"
          ? "text-guru-text drop-shadow-[0_0_24px_rgb(16_216_108/0.3)]"
          : word.tone === "outline"
            ? "headline-outline-light hover:text-guru hover:[-webkit-text-stroke:0px]"
            : "text-fg hover:text-guru"
      )}
    >
      {word.t}
    </motion.span>
  );
}

export function ManifestoBand({ className }: { className?: string }) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const reduce = usePrefersReducedMotion();
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start 85%", "end 45%"],
  });

  return (
    <section
      ref={sectionRef}
      className={cn("relative overflow-hidden bg-band py-20 md:py-28", className)}
      aria-label="Manifesto"
    >
      <div className="grain-blob right-[-10%] top-[-30%] h-72 w-72 opacity-20 md:h-96 md:w-96" aria-hidden />

      <div className="container-g">
        <p className="flex flex-wrap items-baseline gap-x-[0.32em] gap-y-2 text-balance font-extrabold leading-[1.02] tracking-[-0.04em] text-[clamp(2rem,7vw,5.5rem)]">
          {CHUNKS.map((chunk) =>
            chunk.words.length > 1 ? (
              <span
                key={chunk.start}
                className="inline-flex items-baseline gap-x-[0.32em] whitespace-nowrap"
              >
                {chunk.words.map((w, j) => (
                  <ManifestoWord
                    key={chunk.start + j}
                    word={w}
                    index={chunk.start + j}
                    progress={scrollYProgress}
                    reduce={reduce}
                  />
                ))}
              </span>
            ) : (
              <ManifestoWord
                key={chunk.start}
                word={chunk.words[0]}
                index={chunk.start}
                progress={scrollYProgress}
                reduce={reduce}
              />
            )
          )}
        </p>
      </div>
    </section>
  );
}
