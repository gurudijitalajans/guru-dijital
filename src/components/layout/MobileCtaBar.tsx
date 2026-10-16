"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { Btn } from "@/components/site/Btn";
import { Glyph } from "@/components/site/Glyph";

const EASE = [0.22, 1, 0.36, 1] as const;

/* Bu öğelerden biri görünürken bar gizlenir: sayfanın kendi formu/kapanış
   CTA'sı ve footer zaten eylem noktasıdır; üst üste binme olmaz. */
const BLOCKER_SELECTOR = "footer, form, [data-hide-cta-bar]";

/* Kısa ekran (yatay telefon): sunucuda false, istemcide gerçek değer */
const SHORT = "(max-height: 500px)";
const subscribeShort = (cb: () => void) => {
  const mq = window.matchMedia(SHORT);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};
const getShort = () => window.matchMedia(SHORT).matches;

/**
 * Mobil/tablet için başparmak bölgesinde kalıcı dönüşüm girişi.
 * - Hero (main içindeki [data-hero] ya da ilk section/header) ekrandan çıkınca alttan gelir.
 * - Footer, form ya da [data-hide-cta-bar] görünümdeyken gizlenir.
 * - /iletisim'de (hedefi zaten o sayfa) ve ürün detayında (yapışkan alt menüde
 *   Demo düğmesi var) hiç render edilmez.
 * - /iletisim'e gider; hizmet sayfasında hizmet ön seçili olarak.
 * - Kısa (yatay telefon) ekranda gösterilmez: yapışkan menüyle birlikte görünür alanın
 *   üçte birinden fazlasını kaplıyordu.
 * - Görünürken html'e data-cta-bar konur: yüzen düğmeler (WhatsApp, sohbet) çubuğun
 *   üstüne çıkar, çubuk yokken ekranın altına iner (bkz. floatPos).
 * - Yüzen düğmeler de mobilde hero geçilince belirir (html[data-floats]): hero'nun tam
 *   genişlik Teklif Al / Toplantı Planla düğmelerinin ve ilk kartların üstüne biniyorlardı.
 *   Çubuğun gösterilmediği sayfalarda da aynı kural; hero bulunamazsa hemen görünürler.
 * Hydration: SSR'da hiçbir şey basılmaz (show=false); görünürlük yalnız
 * IntersectionObserver callback'lerinde güncellenir.
 */
/** mobile: doluysa çubukta Teklif Al'ın yanında doğrudan arama düğmesi (Ara) */
export function MobileCtaBar({ mobile }: { mobile?: string }) {
  const pathname = usePathname();
  const [heroOut, setHeroOut] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [noHero, setNoHero] = useState(false);
  const short = useSyncExternalStore(subscribeShort, getShort, () => false);
  /* İletişimde hedef zaten o sayfa; ürün detayında yapışkan alt menüdeki Demo düğmesi bu işi görür (ekranda üç sabit çubuk olmasın) */
  const enabled = pathname !== "/iletisim" && !pathname.startsWith("/urunler/");

  useEffect(() => {
    let heroIO: IntersectionObserver | undefined;
    let blockIO: IntersectionObserver | undefined;

    // Yeni sayfa DOM'a oturduktan sonra gözlemle (rota geçişinde de çalışır).
    const rafId = requestAnimationFrame(() => {
      /* Blog yazısı ve yasal sayfada giriş alanı <header>: ilk section sayfanın dibindeki bölüm olurdu */
      const hero = document.querySelector("main [data-hero]") ?? document.querySelector("main :is(section, header)");
      setNoHero(!hero);
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
  }, [pathname]);

  const show = enabled && heroOut && !blocked && !short;
  /* Çubuğun olmadığı sayfalarda da (iletişim, ürün detayı) hero kuralı geçerli: ilk ekrandaki
     kanal kartlarının ve düğmelerin üstüne binmesinler */
  const floats = heroOut || noHero;
  useEffect(() => {
    const root = document.documentElement;
    root.toggleAttribute("data-cta-bar", show);
    root.toggleAttribute("data-floats", floats);
    return () => {
      root.removeAttribute("data-cta-bar");
      root.removeAttribute("data-floats");
    };
  }, [show, floats]);

  if (!enabled) return null;

  /* Hizmet sayfasında form o hizmet seçili açılır (sayfadaki Teklif Al düğmeleri gibi) */
  const service = pathname.match(/^\/hizmetler\/([^/]+)$/)?.[1];
  const href = service ? `/iletisim?hizmet=${service}` : "/iletisim";

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          data-float=""
          key="mobile-cta-bar"
          initial={{ y: "110%" }}
          animate={{ y: 0 }}
          exit={{ y: "110%" }}
          transition={{ duration: 0.35, ease: EASE }}
          className="fixed inset-x-0 bottom-0 z-40 bg-white/95 shadow-[0_-10px_30px_-18px_rgb(1_20_65/0.32)] backdrop-blur-md lg:hidden"
        >
          <div className="container-g flex items-center justify-between gap-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
            {mobile ? (
              /* Çubuğun boyu değişmez (tek satır, aynı düğme boyu): yüzen düğmelerin floatPos değerleri geçerli */
              <a
                href={`tel:${mobile.replace(/[^\d+]/g, "")}`}
                data-umami-event="telefon-cep"
                data-umami-event-konum="mobil-bar"
                className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full bg-white px-4 text-[15px] font-medium text-heading shadow-[0_0_0_1px_rgb(1_20_65/0.14)]"
              >
                <Glyph name="phone" className="size-[18px] text-[#0a2463]" strokeWidth={1.8} />
                Ara
              </a>
            ) : (
              <span className="min-w-0 text-[13px] font-medium text-muted">Aynı gün dönüş</span>
            )}
            <Btn href={href} variant="primary" size="md" className={mobile ? "flex-1 justify-center" : "shrink-0"} data-umami-event="teklif-al" data-umami-event-konum="mobil-bar">
              Teklif Al
            </Btn>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
