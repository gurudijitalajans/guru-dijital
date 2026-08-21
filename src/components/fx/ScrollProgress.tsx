"use client";

import { motion, useReducedMotion, useScroll, useSpring } from "motion/react";

/**
 * Sayfanın en üstünde 2px yeşil scroll ilerleme çizgisi.
 * Reduced-motion'da spring yumuşatması kapatılır, ham progress kullanılır.
 */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const smooth = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 26,
    mass: 0.4,
  });
  const reduce = useReducedMotion();

  return (
    <motion.div
      aria-hidden
      className="fixed inset-x-0 top-0 z-[95] h-0.5 origin-left rounded-r-full bg-gradient-to-r from-guru-deep to-guru"
      style={{
        scaleX: reduce ? scrollYProgress : smooth,
        boxShadow: "0 0 12px rgb(16 216 108 / 0.45)",
      }}
    />
  );
}
