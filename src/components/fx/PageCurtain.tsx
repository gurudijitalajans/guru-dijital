"use client";

import { motion } from "motion/react";
import { useState, type ReactNode } from "react";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion";
import { useCoarsePointer } from "./useCoarsePointer";

const EASE = [0.22, 1, 0.36, 1] as const;

type PageCurtainProps = {
  children: ReactNode;
};

/**
 * Rota geçiş sarmalayıcısı: app/template.tsx içinde kullanılmak üzere.
 * Yalnızca giriş yönlü tasarlandı (App Router template'te çıkış animasyonu
 * güvenilir değildir):
 * - İçerik girişi (hafif yukarı kayma + opaklık) globals.css'teki `.page-enter`
 *   CSS animasyonuyla oynar: JS'siz de çalışır (SSR'da opacity:0 inline stil
 *   kalmaz), dokunmatikte kısa/gecikmesiz, reduced-motion'da kapalı. Template
 *   her rotada yeniden mount olduğundan animasyon her geçişte tekrar oynar.
 * - Üstten inen yeşil→siyah iki katmanlı perde süpürmesi (~0.7s) yalnız
 *   masaüstünde (ince işaretçi) ve motion serbestken oynar.
 *
 * Hydration notu: reduced-motion ve kaba işaretçi tercihleri useSyncExternalStore
 * üzerinden okunur (sunucu anlık görüntüsü false): ilk render herkes için SSR
 * ile birebir aynı, tercihler hydration sonrası devreye girer ve perdeler o
 * karede kaldırılır (perde ilk karede zaten ekran dışındadır, flaş olmaz).
 */
export function PageCurtain({ children }: PageCurtainProps) {
  const reduce = usePrefersReducedMotion();
  const coarse = useCoarsePointer();
  const [sweepDone, setSweepDone] = useState(false);
  const hideCurtain = sweepDone || reduce || coarse;

  return (
    <>
      {!hideCurtain && (
        <>
          {/* Siyah katman: yeşilin hemen arkasından süpürür */}
          <motion.div
            aria-hidden
            className="pointer-events-none fixed inset-0 z-[97] bg-page"
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
      <div className="page-enter">{children}</div>
    </>
  );
}
