"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Spotlight — fare konumunu takip eden radial highlight sarmalayıcısı.
 *
 * Overlay konumu CSS değişkenleriyle (--mx/--my) doğrudan style.setProperty
 * üzerinden güncellenir; React state kullanılmaz → mousemove'da re-render yok.
 * İlk render'da overlay opacity 0'dır (SSR ile istemci birebir aynı DOM),
 * efekt yalnız mount sonrası, pointer:fine + motion-serbest ortamda aktifleşir.
 * pointer:coarse veya prefers-reduced-motion'da listener hiç takılmaz;
 * kart kendi statik görünümüyle kalır (zarif fallback).
 */

export type SpotlightProps = {
  children: ReactNode;
  className?: string;
  /** Işık dairesinin çapı (px). Varsayılan: 420 */
  size?: number;
  /** "r, g, b" biçiminde renk kanalları. Varsayılan: "16, 216, 108" (guru yeşili) */
  color?: string;
  /** Işığın tepe opaklığı. Varsayılan: 0.10 */
  opacity?: number;
};

export function Spotlight({
  children,
  className,
  size = 420,
  color = "16, 216, 108",
  opacity = 0.1,
}: SpotlightProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const overlay = overlayRef.current;
    if (!wrap || !overlay) return;

    const fine = window.matchMedia("(pointer: fine)");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    let attached = false;

    const onMove = (e: MouseEvent) => {
      // Konum kart sınırlarına göre hesaplanır; sadece CSS değişkeni yazılır.
      const r = wrap.getBoundingClientRect();
      overlay.style.setProperty("--mx", `${e.clientX - r.left}px`);
      overlay.style.setProperty("--my", `${e.clientY - r.top}px`);
    };
    const onEnter = (e: MouseEvent) => {
      onMove(e);
      overlay.style.opacity = "1";
    };
    const onLeave = () => {
      // transition-opacity sayesinde yumuşak söner.
      overlay.style.opacity = "0";
    };

    const attach = () => {
      if (attached) return;
      wrap.addEventListener("mouseenter", onEnter);
      wrap.addEventListener("mousemove", onMove);
      wrap.addEventListener("mouseleave", onLeave);
      attached = true;
    };
    const detach = () => {
      if (!attached) return;
      wrap.removeEventListener("mouseenter", onEnter);
      wrap.removeEventListener("mousemove", onMove);
      wrap.removeEventListener("mouseleave", onLeave);
      overlay.style.opacity = "0";
      attached = false;
    };

    // pointer:coarse'ta overlay hiç aktifleşmez; tercih değişirse senkronlanır.
    const sync = () => {
      if (fine.matches && !reduce.matches) attach();
      else detach();
    };
    sync();
    fine.addEventListener("change", sync);
    reduce.addEventListener("change", sync);

    return () => {
      fine.removeEventListener("change", sync);
      reduce.removeEventListener("change", sync);
      detach();
    };
  }, []);

  return (
    <div ref={wrapRef} className={cn("relative", className)}>
      {children}
      {/* Işık katmanı: pointer-events-none, ilk render'da görünmez (hydration nötr) */}
      <div
        ref={overlayRef}
        aria-hidden
        className="pointer-events-none absolute inset-0 transition-opacity duration-500 ease-out"
        style={{
          opacity: 0,
          background: `radial-gradient(${size}px circle at var(--mx, 50%) var(--my, 50%), rgba(${color}, ${opacity}), transparent 70%)`,
        }}
      />
    </div>
  );
}
