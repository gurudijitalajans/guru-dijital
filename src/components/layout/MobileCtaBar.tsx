"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { GButton } from "@/components/ui/Button";

const EASE = [0.22, 1, 0.36, 1] as const;

/* Bu öğelerden biri görünürken bar gizlenir: sayfanın kendi formu/kapanış
   CTA'sı ve footer zaten eylem noktasıdır; üst üste binme olmaz. */
const BLOCKER_SELECTOR = "footer, form, [data-hide-cta-bar]";

/**
 * Mobil/tablet için başparmak bölgesinde kalıcı dönüşüm girişi.
 * - Hero (main içindeki ilk section) ekrandan çıkınca alttan gelir.
 * - Footer, form ya da [data-hide-cta-bar] görünümdeyken gizlenir.
 * - /iletisim'de hiç render edilmez (hedefi zaten o sayfa).
 * - Ürün detayında "#demo" çapasına, diğer sayfalarda /iletisim'e gider.
 * Hydration: SSR'da hiçbir şey basılmaz (show=false); görünürlük yalnız
 * IntersectionObserver callback'lerinde güncellenir.
 */
export function MobileCtaBar() {
  const pathname = usePathname();
  const [heroOut, setHeroOut] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const enabled = pathname !== "/iletisim";

  useEffect(() => {
    if (!enabled) return;
    let heroIO: IntersectionObserver | undefined;
    let blockIO: IntersectionObserver | undefined;

    // Yeni sayfa DOM'a oturduktan sonra gözlemle (rota geçişinde de çalışır).
    const rafId = requestAnimationFrame(() => {
      const hero = document.querySelector("main section");
      if (!hero) {
        setHeroOut(false);
        return;
      }
      heroIO = new IntersectionObserver(
        ([entry]) => setHeroOut(!entry.isIntersecting),
        { threshold: 0 }
      );
      heroIO.observe(hero);

      const visible = new Set<Element>();
      blockIO = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            if (e.isIntersecting) visible.add(e.target);
            else visible.delete(e.target);
          }
          setBlocked(visible.size > 0);
        },
        { threshold: 0 }
      );
      document.querySelectorAll(BLOCKER_SELECTOR).forEach((el) => blockIO?.observe(el));
    });

    return () => {
      cancelAnimationFrame(rafId);
      heroIO?.disconnect();
      blockIO?.disconnect();
    };
  }, [pathname, enabled]);

  if (!enabled) return null;

  const isProduct = pathname.startsWith("/urunler/");
  const href = isProduct ? "#demo" : "/iletisim";
  const label = isProduct ? "Demo Talep Et" : "Teklif Al";
  const show = heroOut && !blocked;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="mobile-cta-bar"
          initial={{ y: "110%" }}
          animate={{ y: 0 }}
          exit={{ y: "110%" }}
          transition={{ duration: 0.35, ease: EASE }}
          className="fixed inset-x-0 bottom-0 z-40 border-t border-fg/10 bg-page/85 backdrop-blur-xl lg:hidden"
        >
          <div className="container-g flex items-center justify-between gap-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
            <span className="min-w-0 text-xs font-semibold uppercase tracking-[0.18em] text-fg/60">
              Aynı gün dönüş
            </span>
            <GButton href={href} variant="green" size="md" className="min-h-11 shrink-0">
              {label}
            </GButton>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
