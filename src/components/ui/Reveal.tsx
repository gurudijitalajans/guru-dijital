"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Görünüme girince yumuşak yukarı kayma + opaklık.
 * Hydration notu: initial SABİT (reduce'a göre dallanmaz); reduced-motion'da
 * transform animasyonunu layout'taki MotionConfig reducedMotion="user" atlar.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 28,
  once = true,
  margin = "0px 0px -6% 0px",
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  once?: boolean;
  /** Görünüm sınırı: varsayılan yalnız alttan %6 (en dipteki öğe boş alan bırakmasın) */
  margin?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: margin as never }}
      transition={{ duration: 0.7, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerGroup({
  children,
  className,
  stagger = 0.08,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  stagger?: number;
  delay?: number;
}) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "0px 0px -6% 0px" }}
      transition={{ staggerChildren: stagger, delayChildren: delay }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
  y = 26,
}: {
  children: ReactNode;
  className?: string;
  y?: number;
}) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y },
        show: { opacity: 1, y: 0, transition: { duration: 0.65, ease: EASE } },
      }}
    >
      {children}
    </motion.div>
  );
}
