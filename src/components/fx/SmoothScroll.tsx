"use client";

import Lenis from "lenis";
import { usePathname } from "next/navigation";
import { useEffect, useRef, type ReactNode } from "react";

type SmoothScrollProps = {
  children: ReactNode;
};

/** Sabit navbar yüksekliği: hash hedeflerindeki scroll-mt-28 (7rem) ile aynı. */
const HASH_OFFSET = -112;

/**
 * Lenis tabanlı smooth-scroll sağlayıcısı.
 * - Yalnız ince işaretçi + hover destekli ortamda (masaüstü) başlatılır;
 *   dokunmatikte ve prefers-reduced-motion: reduce'da native scroll kullanılır
 *   (Lenis dokunmatikte zaten native scroll'a bırakır; rAF döngüsü boşa dönmesin).
 * - Aktifken <html data-lenis="on"> attribute'u eklenir; CSS tarafında
 *   `html[data-lenis] { scroll-behavior: auto }` ile çakışma önlenir.
 * - Rota değişiminde: URL'de hash varsa hedef öğeye (navbar payıyla) gidilir,
 *   yoksa sayfa anında en üste alınır. (Önceki sürüm hash'e bakmadan tepeye
 *   sarıyor ve /urunler/x#demo gibi çapraz sayfa linklerini eziyordu.)
 */
export function SmoothScroll({ children }: SmoothScrollProps) {
  const lenisRef = useRef<Lenis | null>(null);
  const pathname = usePathname();
  const firstRender = useRef(true);

  useEffect(() => {
    const reducedMq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const fineMq = window.matchMedia("(hover: hover) and (pointer: fine)");
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
      if (reducedMq.matches || !fineMq.matches) stop();
      else start();
    };

    sync();
    reducedMq.addEventListener("change", sync);
    fineMq.addEventListener("change", sync);

    return () => {
      reducedMq.removeEventListener("change", sync);
      fineMq.removeEventListener("change", sync);
      stop();
    };
  }, []);

  useEffect(() => {
    // İlk yüklemede tarayıcının scroll-restoration / hash davranışına karışma.
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }

    const hash = window.location.hash;
    if (hash.length > 1) {
      let target: Element | null = null;
      try {
        target = document.querySelector(hash);
      } catch {
        target = document.getElementById(decodeURIComponent(hash.slice(1)));
      }
      if (target) {
        // Yeni sayfa commit edildi; bir kare sonra hedefe git ki Next'in kendi
        // hash kaydırması ve layout yerleşsin, sonra Lenis'in iç durumu senkronlansın.
        const id = requestAnimationFrame(() => {
          const lenis = lenisRef.current;
          if (lenis) {
            // Lenis'in limit'i (eski sayfa yüksekliği) ResizeObserver'la gecikmeli
            // güncellenir; hedef kırpılmasın diye önce ölçüleri tazele ve mutlak
            // belge konumunu (viewport + scrollY) sayı olarak ver.
            lenis.resize();
            const top =
              target.getBoundingClientRect().top + window.scrollY + HASH_OFFSET;
            lenis.scrollTo(Math.max(0, top), { immediate: true, force: true });
          } else {
            // scroll-margin-top hedefte tanımlı; native scrollIntoView onu uygular.
            target.scrollIntoView({ block: "start", behavior: "instant" });
          }
        });
        return () => cancelAnimationFrame(id);
      }
    }

    const lenis = lenisRef.current;
    if (lenis) {
      lenis.scrollTo(0, { immediate: true, force: true });
    } else {
      // html { scroll-behavior: smooth } dokunmatikte aktif: geçiş anlık olsun.
      window.scrollTo({ top: 0, behavior: "instant" });
    }
  }, [pathname]);

  return <>{children}</>;
}
