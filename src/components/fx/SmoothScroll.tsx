"use client";

import Lenis from "lenis";
import { usePathname } from "next/navigation";
import { useEffect, useRef, type ReactNode } from "react";

type SmoothScrollProps = {
  children: ReactNode;
};

/**
 * Lenis tabanlı smooth-scroll sağlayıcısı.
 * - prefers-reduced-motion: reduce ise Lenis hiç başlatılmaz (native scroll).
 * - Aktifken <html data-lenis="on"> attribute'u eklenir; CSS tarafında
 *   `html[data-lenis="on"] { scroll-behavior: auto; }` ile çakışma önlenir (entegratör).
 * - Rota değişiminde sayfa anında en üste alınır.
 */
export function SmoothScroll({ children }: SmoothScrollProps) {
  const lenisRef = useRef<Lenis | null>(null);
  const pathname = usePathname();
  const firstRender = useRef(true);

  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    let rafId = 0;

    const start = () => {
      if (lenisRef.current) return;
      const lenis = new Lenis({ lerp: 0.1, anchors: true });
      lenisRef.current = lenis;
      document.documentElement.setAttribute("data-lenis", "on");

      const raf = (time: number) => {
        lenis.raf(time);
        rafId = requestAnimationFrame(raf);
      };
      rafId = requestAnimationFrame(raf);
    };

    const stop = () => {
      cancelAnimationFrame(rafId);
      rafId = 0;
      lenisRef.current?.destroy();
      lenisRef.current = null;
      document.documentElement.removeAttribute("data-lenis");
    };

    const sync = () => {
      if (mql.matches) stop();
      else start();
    };

    sync();
    mql.addEventListener("change", sync);

    return () => {
      mql.removeEventListener("change", sync);
      stop();
    };
  }, []);

  useEffect(() => {
    // İlk yüklemede tarayıcının scroll-restoration / hash davranışına karışma.
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    const lenis = lenisRef.current;
    if (lenis) {
      lenis.scrollTo(0, { immediate: true, force: true });
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname]);

  return <>{children}</>;
}
