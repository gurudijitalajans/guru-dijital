"use client";

import { motion, useReducedMotion } from "motion/react";
import { useState, type ReactNode } from "react";

const EASE = [0.22, 1, 0.36, 1] as const;

type PageCurtainProps = {
  children: ReactNode;
};

/**
 * Rota geçiş sarmalayıcısı — app/template.tsx içinde kullanılmak üzere.
 * Yalnızca giriş yönlü tasarlandı (App Router template'te çıkış animasyonu
 * güvenilir değildir): içerik hafif yukarı kayarak/opaklaşarak girer ve üstten
 * inen yeşil→siyah iki katmanlı perde süpürmesi (~0.7s) oynar.
 * Perdeler animasyon bitince DOM'dan kaldırılır.
 */
export function PageCurtain({ children }: PageCurtainProps) {
  const reduce = useReducedMotion();
  const [sweepDone, setSweepDone] = useState(false);

  return (
    <>
      {!reduce && !sweepDone && (
        <>
          {/* Siyah katman — yeşilin hemen arkasından süpürür */}
          <motion.div
            aria-hidden
            className="pointer-events-none fixed inset-0 z-[97] bg-coal"
            initial={{ y: "-100%" }}
            animate={{ y: "100%" }}
            transition={{ duration: 0.62, delay: 0.07, ease: EASE }}
            onAnimationComplete={() => setSweepDone(true)}
          />
          {/* Yeşil öncü katman */}
          <motion.div
            aria-hidden
            className="pointer-events-none fixed inset-0 z-[98] bg-guru"
            initial={{ y: "-100%" }}
            animate={{ y: "100%" }}
            transition={{ duration: 0.55, ease: EASE }}
          />
        </>
      )}
      <motion.div
        initial={reduce ? { opacity: 0 } : { opacity: 0, y: 26 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: reduce ? 0 : 0.12, ease: EASE }}
      >
        {children}
      </motion.div>
    </>
  );
}
