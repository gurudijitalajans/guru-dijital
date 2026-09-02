"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * GlowBorder — dönen conic-gradient neon çerçeve.
 *
 * @property ile --angle kaydı globals'a eklenemediği için açı, rAF döngüsünde
 * doğrudan style.setProperty("--angle", ...) ile güncellenir; SSR'da statik
 * 0deg fallback'i vardır ve dönen katman opacity 0 ile başlar (hydration nötr).
 * Altta her zaman görünen nötr çerçeve zemini durur (bg-fg/10 = kart
 * standardı border-fg/10 tonu) → idle'da tek görünür çizgi GlowBorder'dan
 * gelir; sarılan içerik kendi border'ını TAŞIMAMALIDIR (çift halka yasak).
 * reduced-motion / pointer:coarse ortamında statik ama BOŞ olmayan çerçeve kalır.
 * IntersectionObserver ekran dışında rAF'ı durdurur; her karede alloc yok
 * (yalnız tek string üretimi), tüm listener/observer'lar cleanup'lıdır.
 */

export type GlowBorderProps = {
  children: ReactNode;
  className?: string;
  /** Köşe yarıçapı (CSS uzunluk değeri). Varsayılan: "2rem" */
  radius?: string;
  /** Bir tam turun süresi (saniye). Varsayılan: 6 */
  speed?: number;
  /** true: görünür olduğu sürece döner; false: yalnız hover'da döner. Varsayılan: false */
  always?: boolean;
};

export function GlowBorder({
  children,
  className,
  radius = "2rem",
  speed = 6,
  always = false,
}: GlowBorderProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const angleRef = useRef(0);
  const lastRef = useRef(0);
  const hoverRef = useRef(false);
  const inViewRef = useRef(false);

  useEffect(() => {
    const wrap = wrapRef.current;
    const glow = glowRef.current;
    if (!wrap || !glow) return;

    const secs = Math.max(0.5, speed);
    const fine = window.matchMedia("(pointer: fine)");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

    const step = (t: number) => {
      // Sekme arka plana düşüp dönünce delta sıçramasını sınırla.
      const dt = Math.min(t - lastRef.current, 64);
      lastRef.current = t;
      angleRef.current = (angleRef.current + (360 / secs) * (dt / 1000)) % 360;
      glow.style.setProperty("--angle", `${angleRef.current.toFixed(2)}deg`);
      rafRef.current = requestAnimationFrame(step);
    };

    // Aktivasyon: ince işaretçi + motion serbest; always=false ise ayrıca hover şart.
    // rAF yalnız görünürken (IntersectionObserver) çalışır.
    const sync = () => {
      const allowed = fine.matches && !reduce.matches;
      const visible = allowed && (always || hoverRef.current);
      glow.style.opacity = visible ? "1" : "0";

      const running = visible && inViewRef.current;
      if (running && rafRef.current === null) {
        lastRef.current = performance.now();
        rafRef.current = requestAnimationFrame(step);
      } else if (!running && rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };

    const onEnter = () => {
      hoverRef.current = true;
      sync();
    };
    const onLeave = () => {
      hoverRef.current = false;
      sync();
    };
    wrap.addEventListener("mouseenter", onEnter);
    wrap.addEventListener("mouseleave", onLeave);

    const io = new IntersectionObserver(
      (entries) => {
        inViewRef.current = entries[0]?.isIntersecting ?? false;
        sync();
      },
      { threshold: 0 }
    );
    io.observe(wrap);

    fine.addEventListener("change", sync);
    reduce.addEventListener("change", sync);
    sync();

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      io.disconnect();
      wrap.removeEventListener("mouseenter", onEnter);
      wrap.removeEventListener("mouseleave", onLeave);
      fine.removeEventListener("change", sync);
      reduce.removeEventListener("change", sync);
    };
  }, [speed, always]);

  // Custom property (--angle) CSSProperties tipinde olmadığı için cast gerekli.
  const glowStyle = {
    borderRadius: radius,
    opacity: 0,
    "--angle": "0deg",
    background:
      "conic-gradient(from var(--angle, 0deg), transparent 70%, var(--color-guru), transparent)",
  } as CSSProperties;

  return (
    <div
      ref={wrapRef}
      className={cn("relative p-px", className)}
      style={{ borderRadius: radius }}
    >
      {/* Statik nötr çerçeve zemini — kart standardı border-fg/10 tonunda
         (reduced-motion / coarse fallback'te de tek görünür çizgi budur) */}
      <div
        aria-hidden
        className="absolute inset-0 bg-fg/10"
        style={{ borderRadius: radius }}
      />
      {/* Dönen neon katman — ilk render'da görünmez, mount sonrası açılır */}
      <div
        ref={glowRef}
        aria-hidden
        className="absolute inset-0 transition-opacity duration-700 ease-out"
        style={glowStyle}
      />
      {/* İç içerik: bg-card zemin gradyanın ortasını maskeler */}
      <div
        className="relative h-full bg-card"
        style={{ borderRadius: `calc(${radius} - 1px)` }}
      >
        {children}
      </div>
    </div>
  );
}
