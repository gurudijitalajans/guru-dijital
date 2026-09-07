"use client";

import { BrandLogo } from "@/components/ui/BrandLogo";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

const EASE = [0.22, 1, 0.36, 1] as const;
const STORAGE_KEY = "guru-preloaded";
/** Sayaç süresi (ms): masaüstü / dokunmatik (dokunmatikte atlanmaz, kısalır). */
const COUNT_MS = { fine: 950, coarse: 450 } as const;
/** Perde açılış süresi (ms): masaüstü / dokunmatik. */
const EXIT_MS = { fine: 700, coarse: 450 } as const;
/** Hydration bu eşikten geç gelirse (yavaş ağ) sayaç hiç oynatılmaz. */
const SLOW_HYDRATION_MS = 1500;

type Phase = "idle" | "count" | "exit" | "done";

/**
 * Oturum başına bir kez gösterilen açılış perdesi.
 * - sessionStorage("guru-preloaded") ile tekrarı engellenir. Tekrar ziyarette
 *   perde flaşı olmasın diye layout'taki beforeInteractive script
 *   html[data-preloaded] yazar; globals.css bu durumda #guru-preloader'ı gizler.
 * - JS kapalıysa layout'taki <noscript> stili overlay'i gizler (id ile).
 * - prefers-reduced-motion: reduce ve geç hydration (yavaş ağ) durumunda
 *   hiç oynatılmaz; dokunmatikte süreler kısalır (450 ms sayaç + 450 ms perde).
 * - Hydration öncesi (phase idle) sayaç rakamı gizli, ilerleme çubuğu CSS-only
 *   belirsiz (pulse) animasyonla nefes alır: donmuş "0" görünmez.
 * - Görünürken body scroll kilitlenir; bitince iki parçalı perde dikey açılır.
 */
export function Preloader() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [progress, setProgress] = useState(0);
  // Kaba işaretçi (dokunmatik) mount sonrası rAF içinde okunur; SSR'a sızmaz.
  const [coarse, setCoarse] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const countMs = coarse ? COUNT_MS.coarse : COUNT_MS.fine;
  const exitMs = coarse ? EXIT_MS.coarse : EXIT_MS.fine;

  useEffect(() => {
    // Faz kararı bir sonraki kareye ertelenir: hem overlay'in en az bir kez
    // boyanması garantilenir hem de effect içinde senkron setState kaskadı
    // (react-hooks/set-state-in-effect) oluşmaz.
    const rafId = requestAnimationFrame(() => {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const isCoarse = window.matchMedia("(pointer: coarse)").matches;
      const slow = performance.now() > SLOW_HYDRATION_MS;
      let seen = false;
      try {
        seen = sessionStorage.getItem(STORAGE_KEY) === "1";
        sessionStorage.setItem(STORAGE_KEY, "1");
      } catch {
        // sessionStorage erişilemezse (gizli mod vb.) preloader'ı atla.
        seen = true;
      }
      setCoarse(isCoarse);
      setPhase(seen || reduced || slow ? "done" : "count");
    });
    return () => cancelAnimationFrame(rafId);
  }, []);

  // 0 → 100 sayaç (rAF, ease-out)
  useEffect(() => {
    if (phase !== "count") return;
    let rafId = 0;
    const t0 = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / countMs);
      const eased = 1 - Math.pow(1 - p, 3);
      setProgress(Math.round(eased * 100));
      if (p < 1) {
        rafId = requestAnimationFrame(tick);
      } else {
        setPhase("exit");
      }
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [phase, countMs]);

  // Perde açılışı bitince kaldır
  useEffect(() => {
    if (phase !== "exit") return;
    const id = window.setTimeout(() => setPhase("done"), exitMs);
    return () => window.clearTimeout(id);
  }, [phase, exitMs]);

  // Body scroll kilidi
  useEffect(() => {
    if (phase !== "count" && phase !== "exit") return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    // iOS Safari body overflow kilidini tek başına tanımaz: preloader
    // görünürken overlay üzerindeki touchmove da engellenir. React'in
    // onTouchMove'u passive bağlandığından native listener şart (passive: false).
    const overlay = overlayRef.current;
    const onTouchMove = (e: TouchEvent) => e.preventDefault();
    overlay?.addEventListener("touchmove", onTouchMove, { passive: false });
    return () => {
      document.body.style.overflow = prev;
      overlay?.removeEventListener("touchmove", onTouchMove);
    };
  }, [phase]);

  if (phase === "done") return null;

  const idle = phase === "idle";
  const exiting = phase === "exit";
  // Perde parçaları toplam çıkış süresinin biraz altında açılır (dokunmatikte kısa).
  const curtainSec = (exitMs / 1000) * 0.86;

  return (
    <div
      ref={overlayRef}
      id="guru-preloader"
      aria-hidden
      className="fixed inset-0 z-[100]"
    >
      {/* Üst perde: %50.5 ile olası 1px dikiş çizgisi önlenir */}
      <motion.div
        className="absolute inset-x-0 top-0 h-[50.5%] bg-band"
        initial={false}
        animate={exiting ? { y: "-101%" } : { y: 0 }}
        transition={{ duration: curtainSec, ease: EASE }}
      />
      {/* Alt perde */}
      <motion.div
        className="absolute inset-x-0 bottom-0 h-[50.5%] bg-band"
        initial={false}
        animate={exiting ? { y: "101%" } : { y: 0 }}
        transition={{ duration: curtainSec, ease: EASE }}
      />

      {/* Orta içerik: wordmark + sayaç + ilerleme çizgisi */}
      <motion.div
        className="absolute inset-0 flex flex-col items-center justify-center gap-7 px-6"
        initial={false}
        animate={exiting ? { opacity: 0, y: -18 } : { opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: EASE }}
      >
        <span className="inline-flex">
          <BrandLogo className="h-auto w-36 md:w-44" />
        </span>
        <div className="w-56 max-w-full">
          <div className="h-px w-full overflow-hidden rounded-full bg-fg/15">
            {idle ? (
              /* Hydration öncesi: CSS-only belirsiz ilerleme (JS gerekmez) */
              <div
                className="h-full w-[30%] animate-pulse bg-guru"
                style={{ boxShadow: "0 0 12px rgb(16 216 108 / 0.7)" }}
              />
            ) : (
              <div
                className="h-full bg-guru"
                style={{
                  width: `${progress}%`,
                  boxShadow: "0 0 12px rgb(16 216 108 / 0.7)",
                }}
              />
            )}
          </div>
          <div className="mt-3 flex items-baseline justify-between text-xs text-smoke">
            <span className="uppercase tracking-[0.3em]">yükleniyor</span>
            <span className="font-semibold tabular-nums text-fg">
              {idle ? "" : progress}
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
