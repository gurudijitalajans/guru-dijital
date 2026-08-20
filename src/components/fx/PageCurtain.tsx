"use client";

import { motion } from "motion/react";
import { useEffect, useState, type ReactNode } from "react";

const EASE = [0.22, 1, 0.36, 1] as const;

type PageCurtainProps = {
  children: ReactNode;
};

/**
 * Rota geçiş sarmalayıcısı — app/template.tsx içinde kullanılmak üzere.
 * Yalnızca giriş yönlü tasarlandı (App Router template'te çıkış animasyonu
 * güvenilir değildir): içerik hafif yukarı kayarak/opaklaşarak girer ve üstten
 * inen yeşil→siyah iki katmanlı perde süpürmesi (~0.7s) oynar.
 *
 * Hydration notu: reduced-motion tercihi İLK render'da DOM'u dallandıramaz —
 * useReducedMotion SSR'da null, istemcide true döndüğünden yapısal mismatch
 * yaratır. Bu yüzden tercih mount SONRASI matchMedia ile okunur; ilk render
 * herkes için birebir aynıdır, reduce kullanıcılarında perde mount'ta kaldırılır
 * ve içerik geçişi süresizleştirilir.
 */
export function PageCurtain({ children }: PageCurtainProps) {
  const [reduce, setReduce] = useState(false);
  const [sweepDone, setSweepDone] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setReduce(true);
      setSweepDone(true);
    }
  }, []);

  return (
    <>
      {!sweepDone && (
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
        initial={{ opacity: 0, y: 26 }}
        animate={{ opacity: 1, y: 0 }}
        transition={
          reduce
            ? { duration: 0 }
            : { duration: 0.7, delay: 0.12, ease: EASE }
        }
      >
        {children}
      </motion.div>
    </>
  );
}
