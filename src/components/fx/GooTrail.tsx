"use client";

import {
  motion,
  useMotionValue,
  useSpring,
  type MotionValue,
} from "motion/react";
import { useEffect, useRef, useState } from "react";

/** Blob çapları (px) — imlece en yakın olan en büyük, kademeli küçülür. */
const SIZES = [36, 30, 25, 21, 17, 14] as const;

/**
 * Zincirdeki her halka için yay ayarı: sıra ilerledikçe sertlik düşer,
 * kütle artar → her blob bir öncekini artan gecikmeyle takip eder.
 */
const springCfg = (i: number) => ({
  stiffness: 300 - i * 30,
  damping: 26,
  mass: 0.65 + i * 0.12,
});

/** İmleç bu süre (ms) hareketsiz kalırsa bloblar tek noktada birleşip küçülür. */
const IDLE_MS = 200;

/**
 * GooTrail — imlecin arkasından akan sıvı yeşil damla izi.
 * - 6 blob, useMotionValue → useSpring zinciriyle birbirini takip eder.
 * - Kapsayıcıya GooDefs'teki #guru-goo filtresi uygulanır; bloblar birbirine
 *   yapışıp akışkan damla gibi ayrılır.
 * - HYDRATION: SSR ve ilk istemci render'ı her zaman AYNI boş kapsayıcı div'dir;
 *   bloblar mount sonrası yalnızca pointer:fine + reduced-motion kapalıysa eklenir.
 * - z-[110]: CustomCursor'ın (z-[120]) altında kalır; pointer-events-none.
 * - Not: Blob bazlı yarı saydamlık goo filtresinin alfa kontrastında (18x)
 *   kaybolacağı için ~0.5 opaklık filtre SONRASI etki etsin diye kapsayıcıya verilir.
 */
export function GooTrail() {
  // Efekt kapısı: yalnız ince işaretçi + motion-serbest ortamda aktif.
  const [enabled, setEnabled] = useState(false);
  // İlk mousemove'a kadar gizli; pencereden çıkınca tekrar gizlenir.
  const [visible, setVisible] = useState(false);
  // İmleç durunca bloblar küçülür (birleşme hissi).
  const [idle, setIdle] = useState(false);

  // setState fırtınasını önlemek için ayna ref'ler (her mousemove'da render yok).
  const visibleRef = useRef(false);
  const idleRef = useRef(false);
  const idleTimer = useRef<number | undefined>(undefined);

  // İmleç kaynağı — ekran dışında başlar (SSR'a rastgelelik sızmaz, sabit değer).
  const mx = useMotionValue(-200);
  const my = useMotionValue(-200);

  // Yay zinciri: her blob bir önceki yayın ÇIKIŞINI takip eder → akan kuyruk.
  const x0 = useSpring(mx, springCfg(0));
  const y0 = useSpring(my, springCfg(0));
  const x1 = useSpring(x0, springCfg(1));
  const y1 = useSpring(y0, springCfg(1));
  const x2 = useSpring(x1, springCfg(2));
  const y2 = useSpring(y1, springCfg(2));
  const x3 = useSpring(x2, springCfg(3));
  const y3 = useSpring(y2, springCfg(3));
  const x4 = useSpring(x3, springCfg(4));
  const y4 = useSpring(y3, springCfg(4));
  const x5 = useSpring(x4, springCfg(5));
  const y5 = useSpring(y4, springCfg(5));

  const xs: MotionValue<number>[] = [x0, x1, x2, x3, x4, x5];
  const ys: MotionValue<number>[] = [y0, y1, y2, y3, y4, y5];

  // matchMedia yalnızca mount sonrası okunur (hydration güvenliği).
  useEffect(() => {
    const finePointer = window.matchMedia("(pointer: fine)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setEnabled(finePointer.matches && !reducedMotion.matches);
    sync();
    finePointer.addEventListener("change", sync);
    reducedMotion.addEventListener("change", sync);
    return () => {
      finePointer.removeEventListener("change", sync);
      reducedMotion.removeEventListener("change", sync);
    };
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const onMove = (e: MouseEvent) => {
      mx.set(e.clientX);
      my.set(e.clientY);
      if (!visibleRef.current) {
        visibleRef.current = true;
        setVisible(true);
      }
      if (idleRef.current) {
        idleRef.current = false;
        setIdle(false);
      }
      window.clearTimeout(idleTimer.current);
      idleTimer.current = window.setTimeout(() => {
        idleRef.current = true;
        setIdle(true);
      }, IDLE_MS);
    };

    const onLeave = () => {
      visibleRef.current = false;
      setVisible(false);
    };

    document.addEventListener("mousemove", onMove, { passive: true });
    document.documentElement.addEventListener("mouseleave", onLeave);

    return () => {
      document.removeEventListener("mousemove", onMove);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      window.clearTimeout(idleTimer.current);
    };
  }, [enabled, mx, my]);

  // SSR + ilk istemci render'ı: bloblarsız sabit kapsayıcı (null DEĞİL).
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[110] mix-blend-screen transition-opacity duration-300"
      style={{
        filter: "url(#guru-goo)",
        opacity: enabled && visible ? 0.5 : 0,
      }}
    >
      {enabled &&
        SIZES.map((size, i) => (
          <motion.div
            key={i}
            className="absolute left-0 top-0 rounded-full bg-guru mix-blend-screen"
            style={{
              x: xs[i],
              y: ys[i],
              width: size,
              height: size,
              marginLeft: -size / 2,
              marginTop: -size / 2,
            }}
            // İmleç durunca tek noktada birleşip küçülür; hareket edince geri büyür.
            animate={{ scale: idle ? 0.3 : 1 }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 24,
              delay: i * 0.02,
            }}
          />
        ))}
    </div>
  );
}
