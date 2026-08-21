"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

/**
 * Sparkles — bir alanın üzerinde yumuşakça beliren/sönen minik ışıltı partikülleri.
 *
 * - Partiküller rastgele konum/boyut/faz ile doğar, sinüs zarfıyla parlar ve söner;
 *   çoğunluk yumuşak yuvarlak glow noktası, ara sıra 4 uçlu çapraz parıltı.
 * - TÜM rastgelelik useEffect içinde üretilir — SSR çıktısına asla sızmaz
 *   (ilk render boş bir canvas'tır, iki tarafta da birebir aynı).
 * - Performans: glow/çapraz sprite'ları bir kez offscreen canvas'a çizilir,
 *   her karede yalnız drawImage yapılır (karede gradient/obje alloc yok).
 *   DPR ≤ 2, IntersectionObserver ekran dışında rAF'ı tamamen durdurur.
 * - prefers-reduced-motion: reduce → animasyon yok; tek karede 6 statik
 *   sönük nokta çizilir (zarif degrade, boş değil).
 */

export type SparklesProps = {
  className?: string;
  /** Eşzamanlı partikül sayısı. Varsayılan: 14 */
  density?: number;
  /** Işıltı renginin RGB bileşenleri, "r, g, b" biçiminde. Varsayılan: marka yeşili */
  color?: string;
};

type Particle = {
  x: number;
  y: number;
  /** taban ölçek (px, yarıçap benzeri) */
  size: number;
  /** doğum zamanı (performance.now ms) — gelecekte olabilir (gecikmeli doğum) */
  birth: number;
  /** yaşam süresi (ms) */
  dur: number;
  /** true → 4 uçlu çapraz parıltı, false → yumuşak glow noktası */
  cross: boolean;
  /** çapraz parıltının küçük rastgele dönüşü (radyan) */
  rot: number;
};

const SPRITE = 64; // sprite dokusunun piksel boyutu
const STATIC_COUNT = 6; // reduced-motion'da çizilecek statik nokta sayısı

export function Sparkles({
  className,
  density = 14,
  color = "16, 216, 108",
}: SparklesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reducedMq = window.matchMedia("(prefers-reduced-motion: reduce)");
    let reduced = reducedMq.matches;

    let w = 0;
    let h = 0;
    let rafId: number | null = null;
    let visible = true;
    let disposed = false;

    const count = Math.max(1, Math.round(density));
    const particles: Particle[] = [];

    /* ---- sprite'lar: bir kez üretilir, her karede yalnız drawImage ---- */
    const makeSprite = (
      paint: (c: CanvasRenderingContext2D, size: number) => void
    ): HTMLCanvasElement => {
      const off = document.createElement("canvas");
      off.width = SPRITE;
      off.height = SPRITE;
      const c = off.getContext("2d");
      if (c) paint(c, SPRITE);
      return off;
    };

    // Yumuşak yuvarlak glow: renkli hale + beyazımsı minik çekirdek
    const glowSprite = makeSprite((c, size) => {
      const half = size / 2;
      const halo = c.createRadialGradient(half, half, 0, half, half, half);
      halo.addColorStop(0, `rgba(${color}, 0.95)`);
      halo.addColorStop(0.3, `rgba(${color}, 0.4)`);
      halo.addColorStop(1, `rgba(${color}, 0)`);
      c.fillStyle = halo;
      c.fillRect(0, 0, size, size);
      const core = c.createRadialGradient(half, half, 0, half, half, size * 0.12);
      core.addColorStop(0, "rgba(245, 246, 245, 0.9)");
      core.addColorStop(1, "rgba(245, 246, 245, 0)");
      c.fillStyle = core;
      c.fillRect(0, 0, size, size);
    });

    // 4 uçlu çapraz parıltı: incelerek biten iki elmas kol + parlak merkez
    const crossSprite = makeSprite((c, size) => {
      const half = size / 2;
      const arm = half * 0.92;
      const thick = size * 0.045;
      c.fillStyle = `rgba(${color}, 0.85)`;
      c.beginPath(); // yatay kol
      c.moveTo(half - arm, half);
      c.lineTo(half, half - thick);
      c.lineTo(half + arm, half);
      c.lineTo(half, half + thick);
      c.closePath();
      c.fill();
      c.beginPath(); // dikey kol
      c.moveTo(half, half - arm);
      c.lineTo(half + thick, half);
      c.lineTo(half, half + arm);
      c.lineTo(half - thick, half);
      c.closePath();
      c.fill();
      const core = c.createRadialGradient(half, half, 0, half, half, size * 0.2);
      core.addColorStop(0, "rgba(245, 246, 245, 0.95)");
      core.addColorStop(0.4, `rgba(${color}, 0.5)`);
      core.addColorStop(1, `rgba(${color}, 0)`);
      c.fillStyle = core;
      c.fillRect(0, 0, size, size);
    });

    /* ---- partikül yaşam döngüsü ---- */
    const spawn = (p: Particle, now: number, initial: boolean) => {
      p.x = Math.random() * w;
      p.y = Math.random() * h;
      p.size = 2.5 + Math.random() * 6.5;
      p.dur = 1800 + Math.random() * 2600;
      // İlk dolumda fazlar dağınık başlasın; sonrakiler kısa rastgele gecikmeyle doğsun
      p.birth = initial ? now - Math.random() * p.dur : now + Math.random() * 900;
      p.cross = Math.random() < 0.22;
      p.rot = (Math.random() - 0.5) * 0.9;
    };

    const initParticles = (now: number) => {
      particles.length = 0;
      for (let i = 0; i < count; i++) {
        const p: Particle = { x: 0, y: 0, size: 0, birth: 0, dur: 1, cross: false, rot: 0 };
        spawn(p, now, true);
        particles.push(p);
      }
    };

    /* ---- çizim ---- */
    const drawFrame = (now: number) => {
      ctx.clearRect(0, 0, w, h);
      for (const p of particles) {
        const t = (now - p.birth) / p.dur;
        if (t >= 1) {
          spawn(p, now, false);
          continue;
        }
        if (t <= 0) continue; // henüz doğmadı
        // Sinüs zarfı: yumuşak beliriş → tepe → sönüş
        const env = Math.sin(Math.PI * t);
        if (p.cross) {
          // Çapraz parıltı: daha keskin tepe, hafif dönerek büyür
          const a = env * env;
          const d = p.size * 4.2 * (0.7 + 0.3 * a);
          ctx.globalAlpha = a * 0.9;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(Math.PI / 4 + p.rot + t * 0.35);
          ctx.drawImage(crossSprite, -d / 2, -d / 2, d, d);
          ctx.restore();
        } else {
          const d = p.size * 2.6 * (0.75 + 0.25 * env);
          ctx.globalAlpha = env * 0.85;
          ctx.drawImage(glowSprite, p.x - d / 2, p.y - d / 2, d, d);
        }
      }
      ctx.globalAlpha = 1;
    };

    // Reduced-motion: tek karede 5-6 sönük statik nokta (animasyon yok)
    const drawStatic = () => {
      ctx.clearRect(0, 0, w, h);
      for (let i = 0; i < STATIC_COUNT; i++) {
        const d = 10 + Math.random() * 14;
        const x = Math.random() * w;
        const y = Math.random() * h;
        ctx.globalAlpha = 0.16 + Math.random() * 0.1;
        ctx.drawImage(glowSprite, x - d / 2, y - d / 2, d, d);
      }
      ctx.globalAlpha = 1;
    };

    /* ---- rAF döngüsü ---- */
    const tick = (now: number) => {
      rafId = null;
      if (disposed || !visible || reduced) return;
      drawFrame(now);
      schedule();
    };
    const schedule = () => {
      if (rafId == null && visible && !reduced && !disposed) {
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
      const now = performance.now();
      if (particles.length === 0) {
        initParticles(now);
      } else {
        // Küçük yeniden boyutlanmalarda (mobil adres çubuğu) sıçrama olmasın: klample
        for (const p of particles) {
          p.x = Math.min(p.x, w);
          p.y = Math.min(p.y, h);
        }
      }
      if (reduced) drawStatic();
      else {
        drawFrame(now);
        schedule();
      }
    };

    /* ---- gözlemciler & medya tercihi ---- */
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

    const onReducedChange = () => {
      reduced = reducedMq.matches;
      if (reduced) {
        stop();
        drawStatic();
      } else {
        initParticles(performance.now());
        schedule();
      }
    };
    reducedMq.addEventListener("change", onReducedChange);

    resize();

    return () => {
      disposed = true;
      stop();
      io.disconnect();
      ro.disconnect();
      reducedMq.removeEventListener("change", onReducedChange);
    };
  }, [density, color]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 h-full w-full", className)}
    />
  );
}
