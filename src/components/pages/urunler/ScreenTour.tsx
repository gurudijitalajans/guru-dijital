"use client";

import { useRef, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { MoveDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { TiltCard } from "@/components/ui/TiltCard";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/ui/Reveal";
import { usePrefersReducedMotion } from "@/components/fx/usePrefersReducedMotion";

const EASE = [0.22, 1, 0.36, 1] as const;

/* Mockup SVG'leri 1600x1100 (public/products/*.svg) */
const MOCKUP_W = 1600;
const MOCKUP_H = 1100;
const MOCKUP_RATIO = MOCKUP_H / MOCKUP_W;

export type ScreenTourFeature = { title: string; desc: string };
export type ScreenTourHotspot = { x: number; y: number };

export type ScreenTourProps = {
  /** Ürün adı (İngilizce marka adı; büyük harf dönüşümünde noktalı İ olmasın diye lang="en" ile basılır). */
  name: string;
  image: string;
  imageAlt: string;
  /** Turda anlatılan özellikler (ürünün ilk üç özelliği). */
  features: ScreenTourFeature[];
  /** Mockup'a oransal (0-1) nokta konumları; sırasıyla features ile eşleşir. */
  hotspots?: ScreenTourHotspot[];
};

const DEFAULT_HOTSPOTS: ScreenTourHotspot[] = [
  { x: 0.2, y: 0.3 },
  { x: 0.62, y: 0.45 },
  { x: 0.8, y: 0.78 },
];

const pad = (n: number) => String(n).padStart(2, "0");

/* lg breakpoint izleyici, hydration güvenli (ProcessRail deseni):
   SSR anlık görüntüsü true → PinnedTour SSR'da render edilir, CSS (hidden
   lg:block) mobilde gizler; hydration sonrası gerçek matchMedia değeriyle
   mobilde bileşen tamamen unmount edilir (useScroll aboneliği taşınmaz). */
const LG_QUERY = "(min-width: 1024px)";

function subscribeLg(onChange: () => void) {
  const mq = window.matchMedia(LG_QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

function useIsLg(): boolean {
  return useSyncExternalStore(
    subscribeLg,
    () => window.matchMedia(LG_QUERY).matches,
    () => true
  );
}

/**
 * ScreenTour: ürün mockup'ı üzerinde üç özelliği anlatan ekran turu.
 *
 * - lg+ (ve reduced-motion yoksa): 260vh'lik pinned bölüm; kaydırdıkça
 *   mockup üstündeki numaralı noktalar sırayla aktifleşir, sol alttaki
 *   açıklama kartı değişir, altta ince ilerleme çizgisi dolar.
 * - md..lg ve reduced-motion: tam mockup + numaralı noktalar + 3 sütunlu liste.
 * - md altı: her özellik için mockup'ın ilgili bölgesine 3x yakınlaşan kadraj
 *   (panel metinleri okunur boyuta gelir), altında numara + başlık + açıklama.
 *
 * Hydration: SSR ve istemci ilk render birebir aynıdır (idx başlangıcı 0,
 * reduced-motion/lg okumaları useSyncExternalStore; effect'te setState yok).
 */
export function ScreenTour({
  name,
  image,
  imageAlt,
  features,
  hotspots = DEFAULT_HOTSPOTS,
}: ScreenTourProps) {
  const staticOnly = usePrefersReducedMotion();
  const isLg = useIsLg();
  /* Nokta ve özellik sayısı eşit tutulur; eksik nokta varsayılandan tamamlanır. */
  const spots = features.map((_, i) => hotspots[i] ?? DEFAULT_HOTSPOTS[i] ?? { x: 0.5, y: 0.5 });

  return (
    <section className="relative" aria-label={`${name} ekran turu`}>
      {!staticOnly && isLg && (
        <PinnedTour
          name={name}
          image={image}
          imageAlt={imageAlt}
          features={features}
          spots={spots}
          className="hidden lg:block"
        />
      )}
      <StaticTour
        name={name}
        image={image}
        imageAlt={imageAlt}
        features={features}
        spots={spots}
        className={staticOnly ? undefined : "lg:hidden"}
      />
    </section>
  );
}

type VariantProps = {
  name: string;
  image: string;
  imageAlt: string;
  features: ScreenTourFeature[];
  spots: ScreenTourHotspot[];
  className?: string;
};

/* ------------------------------------------------------------------ */
/*  Masaüstü: pinned tur                                               */
/* ------------------------------------------------------------------ */

function PinnedTour({ name, image, imageAlt, features, spots, className }: VariantProps) {
  const targetRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end end"],
  });
  const n = features.length;
  const [idx, setIdx] = useState(0);

  /* Aktif adım: ilerleme n eşit dilime bölünür. Yalnız değer değişince
     setState (kaydırma olayı), render sırasında değil. */
  useMotionValueEvent(scrollYProgress, "change", (p) => {
    const next = Math.min(n - 1, Math.max(0, Math.floor(p * n)));
    setIdx(next);
  });

  const active = features[idx];

  return (
    <div ref={targetRef} className={cn("relative h-[260vh]", className)}>
      <div className="sticky top-0 flex h-screen flex-col overflow-hidden">
        <div className="grain-blob left-1/2 top-1/2 h-[40rem] w-[40rem] -translate-x-1/2 -translate-y-1/2 opacity-25" aria-hidden />

        {/* Üst şerit: eyebrow + kaydırma ipucu */}
        <div className="container-g relative flex items-end justify-between gap-6 pb-5 pt-24">
          <div>
            <p className="inline-flex items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.18em] text-fg/60">
              <span className="inline-block size-2 bg-guru" aria-hidden />
              Ekran Turu
            </p>
            <h2 className="mt-2 text-lg font-extrabold tracking-[-0.04em] text-fg">
              <span lang="en">{name}</span> panelinde <span className="text-guru">üç özellik</span>
            </h2>
          </div>
          <p className="flex items-center gap-2 pb-1 text-xs font-semibold uppercase tracking-[0.16em] text-fg/40">
            Kaydırmaya devam
            <MoveDown className="size-4 animate-bounce text-guru" strokeWidth={2} aria-hidden />
          </p>
        </div>

        {/* Mockup: kalan yüksekliğe sığacak genişlik (en-boy 16:11) */}
        <div className="container-g relative flex min-h-0 flex-1 items-center justify-center pb-6">
          <div className="group relative w-full max-w-[min(100%,calc((100vh-15rem)*1.4545))] [perspective:1400px]">
            {/* Yumuşak yeşil glow: görselin arkasında, hafifçe aşağı kaymış */}
            <div
              className="pointer-events-none absolute inset-x-10 -bottom-3 top-8 rounded-[2.5rem] bg-guru/20 blur-3xl"
              aria-hidden
            />
            <TiltCard max={3} className="rounded-3xl">
              {/* SVG kaynak: next/image olduğu gibi sunar; LCP adayı olduğu için preload */}
              <Image
                src={image}
                alt={imageAlt}
                width={MOCKUP_W}
                height={MOCKUP_H}
                preload
                sizes="(min-width: 1280px) 1216px, 100vw"
                className="h-auto w-full rounded-3xl border border-fg/10 bg-card shadow-[0_0_80px_rgba(16,216,108,0.14)]"
              />
              {spots.map((spot, i) => (
                <Hotspot key={i} index={i} x={spot.x} y={spot.y} active={i === idx} />
              ))}

              {/* Sol alt açıklama kartı: aktif adımla değişir */}
              <div className="absolute bottom-5 left-5 z-10 w-[min(22rem,calc(100%-2.5rem))]">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.35, ease: EASE }}
                    className="rounded-2xl border border-fg/10 bg-page/90 p-5 shadow-[0_20px_50px_rgba(0,0,0,0.25)] backdrop-blur-md"
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-guru-text">
                      {pad(idx + 1)} / {pad(n)}
                    </p>
                    <h3 className="mt-2 text-xl font-bold tracking-tight text-fg xl:text-2xl">
                      {active.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-fg/60">{active.desc}</p>
                  </motion.div>
                </AnimatePresence>
              </div>
            </TiltCard>
          </div>
        </div>

        {/* Alt ilerleme çizgisi */}
        <div className="container-g relative pb-8">
          <div className="h-px w-full overflow-hidden">
            <motion.div
              className="h-full origin-left bg-guru"
              style={{ scaleX: scrollYProgress }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function Hotspot({
  index,
  x,
  y,
  active,
}: {
  index: number;
  x: number;
  y: number;
  active: boolean;
}) {
  return (
    <motion.span
      aria-hidden
      className="absolute z-10 grid size-8 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-guru text-[11px] font-bold text-ink shadow-[0_0_20px_rgb(16_216_108/0.7)]"
      style={{ left: `${x * 100}%`, top: `${y * 100}%` }}
      initial={false}
      animate={{ opacity: active ? 1 : 0.45, scale: active ? 1 : 0.7 }}
      transition={{ duration: 0.4, ease: EASE }}
    >
      {active && (
        <span className="absolute inset-0 rounded-full bg-guru/60 animate-ping motion-reduce:animate-none" />
      )}
      <span className="relative">{pad(index + 1)}</span>
    </motion.span>
  );
}

/* ------------------------------------------------------------------ */
/*  Mobil / tablet / reduced-motion: statik tur                        */
/* ------------------------------------------------------------------ */

/* Mobil kadraj: kart genişliğinin ZOOM katı büyüklükte mockup, kart en-boy
   16:10. Nokta merkeze alınır; kenarlara taşmaması için sıkıştırılır. */
const ZOOM = 3;
const CARD_RATIO = 10 / 16;
const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

function cropStyle(spot: ScreenTourHotspot) {
  const imgH = ZOOM * MOCKUP_RATIO; // kart genişliği birimiyle görsel yüksekliği
  const left = clamp(0.5 - ZOOM * spot.x, 1 - ZOOM, 0);
  const top = clamp(CARD_RATIO / 2 - spot.y * imgH, CARD_RATIO - imgH, 0);
  return { left: `${left * 100}%`, top: `${(top / CARD_RATIO) * 100}%` };
}

function StaticTour({ name, image, imageAlt, features, spots, className }: VariantProps) {
  return (
    <div className={cn("relative overflow-hidden pb-14 pt-10 md:pb-28 md:pt-16", className)}>
      <div className="grain-blob -right-32 top-10 h-80 w-80 opacity-20" aria-hidden />
      <div className="container-g relative">
        <Reveal y={16}>
          <p className="inline-flex items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.18em] text-fg/60">
            <span className="inline-block size-2 bg-guru" aria-hidden />
            Ekran Turu
          </p>
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="mt-4 text-3xl font-bold leading-[1.06] tracking-[-0.03em] text-fg sm:text-4xl">
            <span lang="en">{name}</span> panelinde <span className="text-guru">üç özellik</span>
          </h2>
        </Reveal>

        {/* md+: tam mockup + numaralı noktalar */}
        <Reveal className="mt-10 hidden md:block">
          <div className="relative">
            <div
              className="pointer-events-none absolute inset-x-14 -bottom-4 top-8 rounded-[2.5rem] bg-guru/20 blur-3xl"
              aria-hidden
            />
            <div className="relative">
              <Image
                src={image}
                alt={imageAlt}
                width={MOCKUP_W}
                height={MOCKUP_H}
                sizes="(min-width: 1280px) 1216px, 100vw"
                className="h-auto w-full rounded-3xl border border-fg/10 bg-card shadow-[0_0_80px_rgba(16,216,108,0.14)]"
              />
              {spots.map((spot, i) => (
                <span
                  key={i}
                  aria-hidden
                  className="absolute grid size-8 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-guru text-[11px] font-bold text-ink shadow-[0_0_20px_rgb(16_216_108/0.7)]"
                  style={{ left: `${spot.x * 100}%`, top: `${spot.y * 100}%` }}
                >
                  {pad(i + 1)}
                </span>
              ))}
            </div>
          </div>
        </Reveal>

        {/* md altı: özellik başına yakınlaştırılmış kadraj */}
        <StaggerGroup className="mt-8 grid gap-6 md:hidden" stagger={0.1}>
          {features.map((feature, i) => {
            const crop = cropStyle(spots[i]);
            return (
              <StaggerItem key={feature.title}>
                <article className="min-w-0">
                  <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-fg/10 bg-card">
                    {/* İlk kadraj mobilde LCP adayı: eager; diğerleri lazy */}
                    <Image
                      src={image}
                      alt=""
                      aria-hidden
                      width={MOCKUP_W}
                      height={MOCKUP_H}
                      sizes="300vw"
                      loading={i === 0 ? "eager" : "lazy"}
                      className="absolute h-auto w-[300%] max-w-none"
                      style={crop}
                    />
                    {/* Numara rozeti köşede: kadrajın ortasındaki panel metnini örtmez */}
                    <span
                      aria-hidden
                      className="absolute left-3 top-3 grid size-8 place-items-center rounded-full bg-guru text-[11px] font-bold text-ink shadow-[0_0_20px_rgb(16_216_108/0.7)]"
                    >
                      {pad(i + 1)}
                    </span>
                  </div>
                  <div className="mt-4 flex gap-4">
                    <span className="text-xs font-semibold uppercase tracking-[0.18em] text-guru-text">
                      {pad(i + 1)}
                    </span>
                    <div className="min-w-0">
                      <h3 className="text-lg font-bold tracking-tight text-fg">{feature.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-fg/60">{feature.desc}</p>
                    </div>
                  </div>
                </article>
              </StaggerItem>
            );
          })}
        </StaggerGroup>

        {/* md+: 3 sütunlu numaralı liste */}
        <StaggerGroup className="mt-10 hidden gap-6 md:grid md:grid-cols-3" stagger={0.1}>
          {features.map((feature, i) => (
            <StaggerItem key={feature.title} className="h-full">
              <div className="flex h-full gap-4 pt-5">
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-guru text-[11px] font-bold text-ink">
                  {pad(i + 1)}
                </span>
                <div className="min-w-0">
                  <h3 className="text-lg font-bold tracking-tight text-fg">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-fg/60 md:text-[15px]">
                    {feature.desc}
                  </p>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </div>
    </div>
  );
}
