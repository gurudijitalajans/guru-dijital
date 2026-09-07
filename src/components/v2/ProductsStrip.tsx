"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, animate, motion, useMotionValue } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/ui/Reveal";
import { GButton } from "@/components/ui/Button";
import { TiltCard } from "@/components/ui/TiltCard";
import { Spotlight } from "@/components/fx/Spotlight";
import { usePrefersReducedMotion } from "@/components/fx/usePrefersReducedMotion";
import { products } from "@/lib/data";
import { cn } from "@/lib/utils";

/**
 * Ana sayfa ürün rayı: ajansın işletmeye yönelik 4 yazılım ürünü.
 *
 * - lg+: solda ürün listesi, sağda dev mockup sahnesi. Aktif ürün 7 sn'de bir
 *   ilerler (yavaş slider); hover/focus'ta, bölüm ekran dışındayken ve
 *   reduced-motion'da durur. Aktif ürün yeşil ikon rozetiyle belli olur.
 * - < lg: yatay snap rayı (kullanıcı kaydırır, otomatik akış yok) + nokta
 *   navigasyonu (dokunma hedefi 44px).
 *
 * Hydration: SSR ve ilk istemci render'ı aynıdır (active 0, ilerleme 0,
 * reduced-motion sunucu anlık görüntüsü false). Zamanlayıcı yalnız
 * IntersectionObserver görünürlük bildirdikten sonra çalışır.
 */

const AUTO_MS = 7000;
const EASE = [0.22, 1, 0.36, 1] as const;

export function ProductsStrip() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const railRef = useRef<HTMLDivElement | null>(null);
  const reduce = usePrefersReducedMotion();

  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [inView, setInView] = useState(false);
  /* mobil ray: görünen kart */
  const [railIndex, setRailIndex] = useState(0);

  /* Kalan süre çizgisi: 0 → 1, motion value (re-render yok) */
  const fill = useMotionValue(0);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => setInView(entries[0]?.isIntersecting ?? false),
      { threshold: 0.25 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  /* Ürün değişince çizgi sıfırlanır */
  useEffect(() => {
    fill.set(0);
  }, [active, fill]);

  /* Otomatik ilerleme: çizgi 7 sn'de dolar, dolunca sıradaki ürüne geçer.
     Duraklatınca kaldığı yerde bekler, sürünce kalan süreyle devam eder. */
  useEffect(() => {
    if (!inView || paused || reduce) return;
    const remaining = Math.max(0.4, (AUTO_MS / 1000) * (1 - fill.get()));
    const controls = animate(fill, 1, {
      duration: remaining,
      ease: "linear",
      onComplete: () => setActive((a) => (a + 1) % products.length),
    });
    return () => controls.stop();
  }, [active, inView, paused, reduce, fill]);

  const activeProduct = products[active];

  const onRailScroll = () => {
    const rail = railRef.current;
    const first = rail?.firstElementChild as HTMLElement | null;
    if (!rail || !first) return;
    const step = first.getBoundingClientRect().width + 16; // gap-4
    setRailIndex(Math.max(0, Math.min(products.length - 1, Math.round(rail.scrollLeft / step))));
  };

  const scrollRailTo = (i: number) => {
    const rail = railRef.current;
    const first = rail?.firstElementChild as HTMLElement | null;
    if (!rail || !first) return;
    const step = first.getBoundingClientRect().width + 16;
    rail.scrollTo({ left: i * step, behavior: reduce ? "auto" : "smooth" });
  };

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-band py-20 md:py-28"
    >
      <div className="grain-blob right-[-8%] top-[-30%] h-72 w-72 opacity-20" aria-hidden />

      <div className="container-g">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading
            dark
            eyebrow="Ürünlerimiz"
            title="İşletmeler için *yazılım* da üretiyoruz"
            sub="Ajans hizmetlerimizin yanında, işletmenizi büyüten dört ürün."
          />
          <Reveal delay={0.15} className="hidden md:block">
            <GButton
              href="/urunler"
              variant="outline"
              className="border-fg/25 text-fg hover:border-fg hover:bg-fg hover:text-page"
            >
              Ürünleri İncele
            </GButton>
          </Reveal>
        </div>

        {/* ---------------- lg+: liste + mockup sahnesi ---------------- */}
        <div
          className="mt-14 hidden lg:grid lg:grid-cols-[0.42fr_0.58fr] lg:items-center lg:gap-12"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocusCapture={() => setPaused(true)}
          onBlurCapture={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setPaused(false);
          }}
        >
          <Reveal>
            <ul>
              {products.map((p, i) => {
                const Icon = p.icon;
                const isActive = i === active;
                return (
                  <li key={p.slug} className="relative">
                    <Link
                      href={`/urunler/${p.slug}`}
                      onMouseEnter={() => setActive(i)}
                      onFocus={() => setActive(i)}
                      aria-current={isActive ? "true" : undefined}
                      className={cn(
                        "group flex items-center gap-5 py-5 transition-colors duration-500",
                        isActive ? "text-guru-text" : "text-fg"
                      )}
                    >
                      <span className="w-6 text-xs tabular-nums text-fg/40">0{i + 1}</span>
                      <span
                        className={cn(
                          "grid size-10 shrink-0 place-items-center rounded-lg transition-colors duration-500",
                          isActive ? "bg-guru text-ink" : "bg-guru/12 text-guru-text"
                        )}
                      >
                        <Icon className="size-5" strokeWidth={2} />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-2xl font-bold tracking-[-0.03em]">
                          {p.name}
                        </span>
                        <span className="block text-sm text-fg/55">{p.tagline}</span>
                      </span>
                      <ArrowUpRight
                        className={cn(
                          "ml-auto size-5 shrink-0 transition-all duration-500",
                          isActive ? "opacity-100" : "opacity-0 -translate-x-2"
                        )}
                        aria-hidden
                      />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </Reveal>

          <Reveal delay={0.1} className="relative">
            <div
              className="grain-blob left-1/2 top-1/2 h-[28rem] w-[28rem] -translate-x-1/2 -translate-y-1/2 opacity-30"
              aria-hidden
            />
            <div className="group relative [perspective:1400px]">
              <TiltCard max={4} className="rounded-3xl">
                <Spotlight opacity={0.08} className="overflow-hidden rounded-3xl">
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                      key={activeProduct.slug}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.5, ease: EASE }}
                    >
                      <Link
                        href={`/urunler/${activeProduct.slug}`}
                        data-cursor
                        aria-label={`${activeProduct.name}: ürün sayfasına git`}
                        className="block"
                      >
                        <Image
                          src={activeProduct.image}
                          alt={activeProduct.imageAlt}
                          width={1600}
                          height={1100}
                          sizes="(min-width: 1024px) 680px, 100vw"
                          className="block h-auto w-full rounded-3xl border border-fg/10 bg-card"
                        />
                      </Link>
                    </motion.div>
                  </AnimatePresence>
                </Spotlight>
              </TiltCard>
            </div>
          </Reveal>
        </div>

        {/* ---------------- < lg: yatay snap rayı ---------------- */}
        <div className="lg:hidden">
          <StaggerGroup className="mt-10" stagger={0.07}>
            <div
              ref={railRef}
              onScroll={onRailScroll}
              className="-mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain px-5 pb-2 [scrollbar-width:none] md:-mx-8 md:px-8 [&::-webkit-scrollbar]:hidden"
            >
              {products.map((p) => {
                const Icon = p.icon;
                return (
                  <StaggerItem
                    key={p.slug}
                    className="w-[80vw] max-w-[320px] shrink-0 snap-start"
                  >
                    <Spotlight className="h-full overflow-hidden rounded-2xl" opacity={0.08}>
                      <Link
                        href={`/urunler/${p.slug}`}
                        data-cursor
                        className="group flex h-full flex-col rounded-2xl border border-fg/10 bg-card p-4 transition-colors duration-300 hover:border-guru/40 sm:p-5"
                      >
                        <div className="relative overflow-hidden rounded-xl border border-fg/10 bg-band">
                          <Image
                            src={p.image}
                            alt={p.imageAlt}
                            width={1600}
                            height={1100}
                            sizes="(min-width: 640px) 320px, 80vw"
                            className="block h-auto w-full transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                          />
                        </div>

                        <div className="mt-5 flex items-center gap-3">
                          <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-guru/12 text-guru-text transition-colors duration-300 group-hover:bg-guru group-hover:text-ink">
                            <Icon className="size-5" strokeWidth={2} />
                          </span>
                          <h3 className="text-lg font-bold tracking-tight text-fg">{p.name}</h3>
                        </div>
                        <p className="mt-2 text-sm leading-relaxed text-fg/55">{p.tagline}</p>
                        <span className="mt-auto inline-flex items-center gap-1.5 pt-5 text-sm font-semibold text-fg/70 transition-colors group-hover:text-guru">
                          İncele
                          <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                        </span>
                      </Link>
                    </Spotlight>
                  </StaggerItem>
                );
              })}
            </div>
          </StaggerGroup>

          {/* nokta navigasyonu */}
          <div className="mt-2 flex justify-center" role="group" aria-label="Ürün kartları">
            {products.map((p, i) => (
              <button
                key={p.slug}
                type="button"
                onClick={() => scrollRailTo(i)}
                aria-label={`${p.name} kartına git`}
                aria-current={i === railIndex ? "true" : undefined}
                className="grid size-11 place-items-center"
              >
                <span
                  className={cn(
                    "block h-1.5 rounded-full transition-all duration-300",
                    i === railIndex ? "w-5 bg-guru" : "w-1.5 bg-fg/25"
                  )}
                />
              </button>
            ))}
          </div>
        </div>

        <Reveal className="mt-6 md:hidden">
          <GButton href="/urunler" variant="outline" className="w-full border-fg/25 text-fg">
            Ürünleri İncele
          </GButton>
        </Reveal>
      </div>
    </section>
  );
}
