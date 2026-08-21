"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { cn } from "@/lib/utils";

const LETTERS = ["g", "u", "r", "u"] as const;

export type FooterWordmarkProps = {
  className?: string;
};

/**
 * Footer'ın en altındaki dev interaktif "guru" yazısı.
 * pointer:fine cihazlarda her harf imleç yakınında hafifçe yukarı kayar
 * ve outline'dan yeşile dolar; mobilde / reduced-motion'da statiktir.
 */
export function FooterWordmark({ className }: FooterWordmarkProps) {
  const [interactive, setInteractive] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setInteractive(fine.matches && !reduce.matches);
    update();
    fine.addEventListener("change", update);
    reduce.addEventListener("change", update);
    return () => {
      fine.removeEventListener("change", update);
      reduce.removeEventListener("change", update);
    };
  }, []);

  return (
    <div className={cn("relative select-none overflow-x-clip", className)}>
      <span className="sr-only">guru</span>
      <div aria-hidden className="flex items-end justify-center pb-[0.06em] leading-none">
        {LETTERS.map((ch, i) => (
          <WordmarkLetter key={i} char={ch} interactive={interactive} />
        ))}
      </div>
    </div>
  );
}

function WordmarkLetter({
  char,
  interactive,
}: {
  char: string;
  interactive: boolean;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const raw = useMotionValue(0); // imlece yakınlık: 0 (uzak) → 1 (üstünde)
  const prox = useSpring(raw, { stiffness: 150, damping: 20, mass: 0.6 });
  const y = useTransform(prox, (p) => `${p * -7}%`);
  const color = useTransform(prox, (p) => `rgb(16 216 108 / ${p.toFixed(3)})`);

  useEffect(() => {
    if (!interactive) {
      raw.set(0);
      return;
    }
    const onMove = (e: PointerEvent) => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const radius = Math.max(rect.width * 1.6, 160);
      const dist = Math.hypot(e.clientX - cx, e.clientY - cy);
      raw.set(Math.max(0, 1 - dist / radius));
    };
    const onReset = () => raw.set(0);

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("blur", onReset);
    document.documentElement.addEventListener("pointerleave", onReset);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("blur", onReset);
      document.documentElement.removeEventListener("pointerleave", onReset);
    };
  }, [interactive, raw]);

  return (
    <motion.span
      ref={ref}
      className="headline-outline-light inline-block text-[20vw] font-extrabold lowercase leading-[0.9] tracking-[-0.06em]"
      style={interactive ? { y, color } : undefined}
    >
      {char}
    </motion.span>
  );
}
