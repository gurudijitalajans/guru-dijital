"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { useEffect, useState } from "react";

const EASE = [0.22, 1, 0.36, 1] as const;
const STORAGE_KEY = "guru-preloaded";
const COUNT_DURATION_MS = 950;

type Phase = "idle" | "count" | "exit" | "done";

/**
 * Oturum başına bir kez gösterilen açılış perdesi (~1.6s).
 * - sessionStorage("guru-preloaded") ile tekrarı engellenir.
 * - prefers-reduced-motion: reduce ise hiç oynatılmaz.
 * - Görünürken body scroll kilitlenir; bitince iki parçalı perde dikey açılır.
 */
export function Preloader() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Faz kararı bir sonraki kareye ertelenir: hem overlay'in en az bir kez
    // boyanması garantilenir hem de effect içinde senkron setState kaskadı
    // (react-hooks/set-state-in-effect) oluşmaz.
    const rafId = requestAnimationFrame(() => {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      let seen = false;
      try {
        seen = sessionStorage.getItem(STORAGE_KEY) === "1";
        sessionStorage.setItem(STORAGE_KEY, "1");
      } catch {
        // sessionStorage erişilemezse (gizli mod vb.) preloader'ı atla.
        seen = true;
      }
      setPhase(seen || reduced ? "done" : "count");
    });
    return () => cancelAnimationFrame(rafId);
  }, []);

  // 0 → 100 sayaç (rAF, ease-out)
  useEffect(() => {
    if (phase !== "count") return;
    let rafId = 0;
    const t0 = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / COUNT_DURATION_MS);
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
  }, [phase]);

  // Perde açılışı bitince kaldır
  useEffect(() => {
    if (phase !== "exit") return;
    const id = window.setTimeout(() => setPhase("done"), 700);
    return () => window.clearTimeout(id);
  }, [phase]);

  // Body scroll kilidi
  useEffect(() => {
    if (phase !== "count" && phase !== "exit") return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [phase]);

  if (phase === "done") return null;

  const exiting = phase === "exit";

  return (
    <div aria-hidden className="fixed inset-0 z-[100]">
      {/* Üst perde — %50.5 ile olası 1px dikiş çizgisi önlenir */}
      <motion.div
        className="absolute inset-x-0 top-0 h-[50.5%] bg-ink"
        initial={false}
        animate={exiting ? { y: "-101%" } : { y: 0 }}
        transition={{ duration: 0.6, ease: EASE }}
      />
      {/* Alt perde */}
      <motion.div
        className="absolute inset-x-0 bottom-0 h-[50.5%] bg-ink"
        initial={false}
        animate={exiting ? { y: "101%" } : { y: 0 }}
        transition={{ duration: 0.6, ease: EASE }}
      />

      {/* Orta içerik: wordmark + sayaç + ilerleme çizgisi */}
      <motion.div
        className="absolute inset-0 flex flex-col items-center justify-center gap-7 px-6"
        initial={false}
        animate={exiting ? { opacity: 0, y: -18 } : { opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: EASE }}
      >
        <Image
          src="/logo-light.png"
          alt="Guru Dijital"
          width={720}
          height={306}
          priority
          className="h-auto w-36 md:w-44"
        />
        <div className="w-56 max-w-full">
          <div className="h-px w-full overflow-hidden rounded-full bg-paper/15">
            <div
              className="h-full bg-guru"
              style={{
                width: `${progress}%`,
                boxShadow: "0 0 12px rgb(16 216 108 / 0.7)",
              }}
            />
          </div>
          <div className="mt-3 flex items-baseline justify-between text-xs text-smoke">
            <span className="uppercase tracking-[0.3em]">yükleniyor</span>
            <span className="font-semibold tabular-nums text-paper">
              {progress}
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
