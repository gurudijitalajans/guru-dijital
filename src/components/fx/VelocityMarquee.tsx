"use client";

import { useRef, type ReactNode } from "react";
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from "motion/react";
import { cn } from "@/lib/utils";

/**
 * VelocityMarquee — scroll hızına tepki veren sonsuz akış bandı.
 *
 * Klasik framer velocity-marquee deseni: useScroll → useVelocity → useSpring
 * → useAnimationFrame. Scroll hızlandıkça bant hızlanır, yön scroll yönüne
 * uyar. İçerik 4x tekrar edilir; track %-25..0 aralığında sarılarak (wrap)
 * hiç boşluk bırakmaz. Reduced-motion'da sabit yavaş akış.
 */

const COPIES = 4;

/** v değerini [min, max) aralığına sarar (negatifler dahil). */
function wrap(min: number, max: number, v: number): number {
  const range = max - min;
  return ((((v - min) % range) + range) % range) + min;
}

export type VelocityMarqueeProps = {
  children: ReactNode;
  /** Temel akış hızı (%/sn). Negatif değer başlangıç yönünü ters çevirir. Varsayılan: 3 */
  baseVelocity?: number;
  className?: string;
};

export function VelocityMarquee({
  children,
  baseVelocity = 3,
  className,
}: VelocityMarqueeProps) {
  const reduce = useReducedMotion();
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, {
    damping: 50,
    stiffness: 400,
  });
  // Scroll ivmesinin katkısı bilinçli düşük: bant sakin akmalı.
  const velocityFactor = useTransform(smoothVelocity, [0, 1000], [0, 1.2], {
    clamp: false,
  });
  const directionFactor = useRef(1);

  // Track 4 kopyadan oluşur → bir kopya genişliği = track'in %25'i.
  const x = useTransform(baseX, (v) => `${wrap(-100 / COPIES, 0, v)}%`);

  useAnimationFrame((_time, delta) => {
    const dt = Math.min(delta, 64) / 1000; // sekme arka plana düşünce sıçramayı önle

    if (reduce) {
      // Reduced-motion: scroll'a bağlanmadan sabit, yavaş akış
      baseX.set(baseX.get() + baseVelocity * 0.35 * dt);
      return;
    }

    let moveBy = directionFactor.current * baseVelocity * dt;
    const vf = velocityFactor.get();
    if (vf < 0) directionFactor.current = -1;
    else if (vf > 0) directionFactor.current = 1;
    moveBy += directionFactor.current * moveBy * vf;

    baseX.set(baseX.get() + moveBy);
  });

  return (
    <div className={cn("overflow-hidden", className)}>
      <motion.div className="flex w-max flex-nowrap will-change-transform" style={{ x }}>
        {Array.from({ length: COPIES }, (_, i) => (
          <div key={i} className="flex shrink-0 items-center" aria-hidden={i > 0}>
            {children}
          </div>
        ))}
      </motion.div>
    </div>
  );
}
