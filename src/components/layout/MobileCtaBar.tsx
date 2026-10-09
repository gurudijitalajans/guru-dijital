"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { Btn } from "@/components/site/Btn";

const EASE = [0.22, 1, 0.36, 1] as const;

/* Bu öğelerden biri görünürken bar gizlenir: sayfanın kendi formu/kapanış
   CTA'sı ve footer zaten eylem noktasıdır; üst üste binme olmaz. */
const BLOCKER_SELECTOR = "footer, form, [data-hide-cta-bar]";

/**
 * Mobil/tablet için başparmak bölgesinde kalıcı dönüşüm girişi.
 * - Hero (main içindeki ilk section) ekrandan çıkınca alttan gelir.
 * - Footer, form ya da [data-hide-cta-bar] görünümdeyken gizlenir.
 * - /iletisim'de (hedefi zaten o sayfa) ve ürün detayında (yapışkan alt menüde
 *   Demo düğmesi var) hiç render edilmez.
 * - /iletisim'e gider; hizmet sayfasında hizmet ön seçili olarak.
 * Hydration: SSR'da hiçbir şey basılmaz (show=false); görünürlük yalnız
 * IntersectionObserver callback'lerinde güncellenir.
 */
export function MobileCtaBar() {
  const pathname = usePathname();
  const [heroOut, setHeroOut] = useState(false);
  const [blocked, setBlocked] = useState(false);
  /* İletişimde hedef zaten o sayfa; ürün detayında yapışkan alt menüdeki Demo düğmesi bu işi görür (ekranda üç sabit çubuk olmasın) */
  const enabled = pathname !== "/iletisim" && !pathname.startsWith("/urunler/");

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

  /* Hizmet sayfasında form o hizmet seçili açılır (sayfadaki Teklif Al düğmeleri gibi) */
  const service = pathname.match(/^\/hizmetler\/([^/]+)$/)?.[1];
  const href = service ? `/iletisim?hizmet=${service}` : "/iletisim";
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
          className="fixed inset-x-0 bottom-0 z-40 bg-white/95 shadow-[0_-10px_30px_-18px_rgb(1_20_65/0.32)] backdrop-blur-md lg:hidden"
        >
          <div className="container-g flex items-center justify-between gap-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
            <span className="min-w-0 text-[13px] font-medium text-muted">
              Aynı gün dönüş
            </span>
            <Btn href={href} variant="primary" size="md" className="shrink-0" data-umami-event="teklif-al" data-umami-event-konum="mobil-bar">
              Teklif Al
            </Btn>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
