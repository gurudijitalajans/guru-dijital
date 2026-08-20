"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { cn, parseAccent } from "@/lib/utils";

/**
 * Word-by-word masked reveal. Wrap accent words with *stars* to paint them
 * brand green: "unlock the *next* level"
 *
 * In-view detection lives on the WRAPPER (not the clipped words): a word
 * translated fully out of its overflow-hidden mask has zero visible area,
 * so observing the word itself would never fire.
 */
export function SplitText({
  text,
  className,
  delay = 0,
  stagger = 0.055,
  accentClassName = "text-guru",
}: {
  text: string;
  className?: string;
  delay?: number;
  stagger?: number;
  accentClassName?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-8% 0px" });
  const reduce = useReducedMotion();
  const parts = parseAccent(text);
  const words: { w: string; accent: boolean }[] = [];
  for (const p of parts) {
    for (const w of p.t.split(" ")) {
      if (w.trim() !== "") words.push({ w, accent: p.accent });
    }
  }

  return (
    <span
      ref={ref}
      className={cn("inline-flex flex-wrap gap-x-[0.28em]", className)}
      aria-label={text.replaceAll("*", "")}
    >
      {words.map((word, i) => (
        <span key={i} className="overflow-hidden pb-[0.08em] -mb-[0.08em]" aria-hidden>
          <motion.span
            className={cn("inline-block will-change-transform", word.accent && accentClassName)}
            initial={{ y: reduce ? 0 : "115%" }}
            animate={{ y: inView || reduce ? 0 : "115%" }}
            transition={{
              duration: 0.75,
              delay: delay + i * stagger,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            {word.w}
          </motion.span>
        </span>
      ))}
    </span>
  );
}
