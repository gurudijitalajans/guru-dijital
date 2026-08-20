"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

/**
 * DotField — koyu zemin üzerinde interaktif nokta alanı.
 *
 * - İnce işaretçide (pointer: fine): noktalar imlece yaklaşınca parlar ve
 *   hafifçe imlece çekilir; imleç uzaklaşınca yumuşak lerp ile yerine döner.
 * - Kaba işaretçide (dokunmatik): etkileşimsiz, hafif parlaklık dalgası.
 * - prefers-reduced-motion: reduce → tamamen statik tek kare.
 * - devicePixelRatio duyarlı, ResizeObserver'lı; IntersectionObserver ile
 *   ekran dışındayken rAF tamamen durur. Noktalar settle olunca da döngü
 *   durur, pointer hareketiyle yeniden başlar (gereksiz çizim yok).
 */

type Dot = {
  bx: number;
  by: number;
  x: number;
  y: number;
  a: number;
  ba: number;
  phase: number;
};

type Mode = "interactive" | "wave" | "static";

export type DotFieldProps = {
  className?: string;
  /** Nokta ızgara aralığı (px). Küçüldükçe yoğunluk artar. Varsayılan: 28 */
  density?: number;
  /** Nokta renginin RGB bileşenleri, "r, g, b" biçiminde. Varsayılan: marka yeşili */
  colorNear?: string;
};

const TWO_PI = Math.PI * 2;
const RADIUS = 150; // imleç etki yarıçapı (px)
const PULL = 12; // imlece maksimum çekilme (px)
const LERP = 0.12;

export function DotField({
  className,
  density = 28,
  colorNear = "16, 216, 108",
}: DotFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reducedMq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const fineMq = window.matchMedia("(pointer: fine)");
    const computeMode = (): Mode =>
      reducedMq.matches ? "static" : fineMq.matches ? "interactive" : "wave";

    let mode: Mode = computeMode();
    let dots: Dot[] = [];
    let w = 0;
    let h = 0;
    let rafId: number | null = null;
    let visible = true;
    let disposed = false;
    const pointer = { x: -9999, y: -9999, active: false };
    const fill = `rgb(${colorNear})`;
    const gap = Math.max(16, density);

    /* ---- nokta dizisini önceden hesapla ---- */
    const build = () => {
      dots = [];
      if (w <= 0 || h <= 0) return;
      const cols = Math.ceil(w / gap) + 1;
      const rows = Math.ceil(h / gap) + 1;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const bx = c * gap;
          const by = r * gap;
          const ba = 0.07 + Math.random() * 0.1; // sönük taban parlaklık
          dots.push({ bx, by, x: bx, y: by, a: ba, ba, phase: (bx + by) * 0.02 });
        }
      }
    };

    const drawStatic = () => {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = fill;
      for (const d of dots) {
        d.x = d.bx;
        d.y = d.by;
        d.a = d.ba;
        ctx.globalAlpha = d.ba;
        ctx.beginPath();
        ctx.arc(d.bx, d.by, 1.2, 0, TWO_PI);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };

    /** Bir kare çizer; hâlâ hareket varsa true döner. */
    const drawFrame = (now: number): boolean => {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = fill;
      let moving = false;

      for (const d of dots) {
        if (mode === "wave") {
          // dokunmatik: etkileşimsiz, hafif parlaklık dalgası
          d.x = d.bx;
          d.y = d.by;
          d.a = d.ba + 0.1 * (0.5 + 0.5 * Math.sin(now * 0.0012 + d.phase));
        } else {
          let tx = d.bx;
          let ty = d.by;
          let ta = d.ba;
          if (pointer.active) {
            const dx = pointer.x - d.bx;
            const dy = pointer.y - d.by;
            const dist2 = dx * dx + dy * dy;
            if (dist2 < RADIUS * RADIUS) {
              const dist = Math.sqrt(dist2);
              const t = 1 - dist / RADIUS;
              const e = t * t * (3 - 2 * t); // smoothstep
              tx = d.bx + (dx / (dist || 1)) * e * PULL;
              ty = d.by + (dy / (dist || 1)) * e * PULL;
              ta = d.ba + (0.9 - d.ba) * e;
            }
          }
          d.x += (tx - d.x) * LERP;
          d.y += (ty - d.y) * LERP;
          d.a += (ta - d.a) * LERP;
          if (Math.abs(tx - d.x) > 0.05 || Math.abs(ta - d.a) > 0.003) moving = true;
        }

        ctx.globalAlpha = d.a;
        ctx.beginPath();
        ctx.arc(d.x, d.y, 0.9 + d.a * 1.4, 0, TWO_PI);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      return moving;
    };

    /* ---- rAF döngüsü: yalnız gerektiğinde çalışır ---- */
    const tick = (now: number) => {
      rafId = null;
      if (disposed || !visible || mode === "static") return;
      const moving = drawFrame(now);
      // wave sürekli akar; interactive settle olunca durur (pointermove yeniden başlatır)
      if (mode === "wave" || moving) schedule();
    };
    const schedule = () => {
      if (rafId == null && visible && mode !== "static") {
        rafId = requestAnimationFrame(tick);
      }
    };
    const stop = () => {
      if (rafId != null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    };

    /* ---- boyutlandırma ---- */
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      if (w <= 0 || h <= 0) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(w * dpr));
      canvas.height = Math.max(1, Math.round(h * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      build();
      if (mode === "static") drawStatic();
      else {
        drawFrame(performance.now());
        schedule();
      }
    };

    /* ---- pointer (yalnız ince işaretçi modunda) ---- */
    const onPointerMove = (e: PointerEvent) => {
      if (mode !== "interactive") return;
      const rect = canvas.getBoundingClientRect();
      pointer.x = e.clientX - rect.left;
      pointer.y = e.clientY - rect.top;
      pointer.active = true;
      schedule();
    };
    const deactivatePointer = () => {
      pointer.active = false;
      schedule(); // noktalar yerine dönerken animasyon sürsün
    };

    /* ---- gözlemciler ---- */
    const io = new IntersectionObserver(
      (entries) => {
        visible = entries[0]?.isIntersecting ?? true;
        if (visible) schedule();
        else stop();
      },
      { rootMargin: "120px" }
    );
    io.observe(canvas);

    const ro = new ResizeObserver(() => resize());
    ro.observe(canvas);

    const onMediaChange = () => {
      mode = computeMode();
      pointer.active = false;
      if (mode === "static") {
        stop();
        drawStatic();
      } else {
        schedule();
      }
    };
    reducedMq.addEventListener("change", onMediaChange);
    fineMq.addEventListener("change", onMediaChange);

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("blur", deactivatePointer);
    document.documentElement.addEventListener("mouseleave", deactivatePointer);

    resize();

    return () => {
      disposed = true;
      stop();
      io.disconnect();
      ro.disconnect();
      reducedMq.removeEventListener("change", onMediaChange);
      fineMq.removeEventListener("change", onMediaChange);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("blur", deactivatePointer);
      document.documentElement.removeEventListener("mouseleave", deactivatePointer);
    };
  }, [density, colorNear]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={cn("pointer-events-none", className)}
    />
  );
}
