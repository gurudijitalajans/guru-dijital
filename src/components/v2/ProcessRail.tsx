"use client";

import { useRef, useSyncExternalStore } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import { MoveRight } from "lucide-react";
import { process as processSteps } from "@/lib/data";
import { cn } from "@/lib/utils";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/ui/Reveal";
import { LiquidImage } from "@/components/fx/LiquidImage";
import { usePrefersReducedMotion } from "@/components/fx/usePrefersReducedMotion";

type ProcessStep = (typeof processSteps)[number];

/* Her adım için görsel (data.ts'e dokunulmaz) */
const RAIL_IMAGES: Record<string, { src: string; alt: string }> = {
  "01": { src: "/work/dijital-pazarlama.webp", alt: "Dijital pazarlama analiz ekranları" },
  "02": { src: "/work/kurumsal-kimlik.webp", alt: "Kurumsal kimlik tasarımı" },
  "03": { src: "/work/ambalaj-kavanoz.webp", alt: "Ambalaj tasarımı uygulaması" },
  "04": { src: "/work/web-mockup-dark.webp", alt: "Web sitesi arayüzü" },
};

/* lg breakpoint izleyici, hydration güvenli (useSyncExternalStore):
   SSR anlık görüntüsü false → DesktopRail SSR HTML'ine hiç yazılmaz, yalnız
   istemcide lg'de mount olur (mobil HTML'de 4 panel basılıp sökülmez).
   Hydration'a kadar VerticalSteps her genişlikte görünür; DesktopRail
   mount olunca lg'de gizlenir. Effect'te setState yok. */
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
    () => false
  );
}

export type ProcessRailProps = {
  className?: string;
};

/**
 * Süreç bölümü: desktop'ta dikey scroll'u yatay panel yolculuğuna çeviren
 * sticky ray; mobil ve prefers-reduced-motion'da sade dikey kartlar.
 */
export function ProcessRail({ className }: ProcessRailProps) {
  /* SSR anlık görüntüsü false olduğundan hydration güvenli; tercih hydration
     sonrası tek re-render ile uygulanır (effect + setState kaskadı yok). */
  const staticOnly = usePrefersReducedMotion();
  const isLg = useIsLg();
  const railMounted = !staticOnly && isLg;

  return (
    <section id="surec" className={cn("relative bg-band", className)}>
      {railMounted && <DesktopRail className="hidden lg:block" />}
      <VerticalSteps className={railMounted ? "lg:hidden" : undefined} />
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Desktop: sticky yatay ray                                          */
/* ------------------------------------------------------------------ */

function DesktopRail({ className }: { className?: string }) {
  const targetRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end end"],
  });
  /* 4 panel × 100vw'lik ray; dikey ilerleme 3 ekran sola kaydırır */
  const x = useTransform(scrollYProgress, [0, 1], ["0%", "-75%"]);

  return (
    <div ref={targetRef} className={cn("relative h-[260vh]", className)}>
      <div className="sticky top-0 h-screen overflow-hidden">
        {/* Arka plan: dev sönük outline yazı */}
        <span
          aria-hidden
          className="headline-outline-light pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 select-none whitespace-nowrap text-[28vw] font-extrabold tracking-[-0.04em] opacity-55"
        >
          Süreç
        </span>

        {/* Üst şerit: sabit navbar'ın (h-20) altında başlar */}
        <div className="absolute inset-x-0 top-20 z-10 flex items-start justify-between px-10 pt-5 md:px-16">
          <div>
            <p className="inline-flex items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.18em] text-fg/60">
              <span className="inline-block size-2 bg-guru" aria-hidden />
              Nasıl Çalışıyoruz
            </p>
            <h2 className="mt-2 text-3xl font-extrabold tracking-[-0.04em] text-fg md:text-4xl">
              Dört adımda <span className="text-guru-text">sonuç</span>
            </h2>
          </div>
          <p className="flex items-center gap-2 pt-1 text-xs font-semibold uppercase tracking-[0.16em] text-fg/40">
            Kaydırmaya devam
            <MoveRight
              className="size-4 animate-pulse text-guru motion-reduce:animate-none"
              strokeWidth={2}
              aria-hidden
            />
          </p>
        </div>

        {/* Yatay ray */}
        <motion.div style={{ x }} className="flex h-full w-[400vw]">
          {processSteps.map((step, i) => (
            <RailPanel
              key={step.no}
              step={step}
              index={i}
              progress={scrollYProgress}
            />
          ))}
        </motion.div>

        {/* Alt ilerleme çizgisi + 4 adım noktası */}
        <div className="absolute inset-x-0 bottom-0 z-10 px-10 pb-9 md:px-16">
          <div className="relative h-px w-full">
            <motion.div
              className="h-full origin-left bg-guru"
              style={{ scaleX: scrollYProgress }}
            />
            <div className="absolute inset-x-0 inset-y-0 flex items-center justify-between">
              {processSteps.map((step, i) => (
                <RailDot key={step.no} index={i} progress={scrollYProgress} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function RailDot({ index, progress }: { index: number; progress: MotionValue<number> }) {
  const threshold = index / (processSteps.length - 1) - 0.02;
  const opacity = useTransform(progress, (p) => (p >= threshold ? 1 : 0.25));
  return (
    <motion.span
      aria-hidden
      className="size-2 rounded-full bg-guru"
      style={{ opacity }}
    />
  );
}

function RailPanel({
  step,
  index,
  progress,
}: {
  step: ProcessStep;
  index: number;
  progress: MotionValue<number>;
}) {
  /* Panel merkezdeyken numara yeşile dolar; uzaklaştıkça outline'a döner.
     Girdi aralığı [0,1] içinde ve artan kalmalı: taşan offset'ler WAAPI
     keyframe'lerinde "monotonically non-decreasing" hatası veriyor. */
  const center = index / (processSteps.length - 1);
  const isLast = index === processSteps.length - 1;
  const input: number[] = [];
  const output: number[] = [];
  if (center > 0) {
    input.push(Math.max(0, center - 0.18));
    output.push(0);
  }
  input.push(center);
  output.push(1);
  if (center < 1) {
    input.push(Math.min(1, center + 0.18));
    output.push(isLast ? 1 : 0);
  }
  const fill = useTransform(progress, input, output);
  const imgScale = useTransform(fill, [0, 1], [0.9, 1]);
  const imgOpacity = useTransform(fill, [0, 1], [0.4, 1]);
  const image = RAIL_IMAGES[step.no];

  return (
    <div className="grid h-full w-screen shrink-0 grid-cols-[1fr_0.8fr] items-center gap-12 px-12 md:px-20">
      <div className="relative">
        <div className="relative w-fit leading-none" aria-hidden>
          <span className="headline-outline-light block text-[8rem] font-extrabold tracking-[-0.04em] xl:text-[11rem]">
            {step.no}
          </span>
          <motion.span
            className="absolute inset-0 block text-[8rem] font-extrabold tracking-[-0.04em] text-guru xl:text-[11rem]"
            style={{
              opacity: fill,
              textShadow: "0 0 48px rgb(16 216 108 / 0.3)",
            }}
          >
            {step.no}
          </motion.span>
        </div>
        <h3 className="mt-7 max-w-xl text-3xl font-extrabold tracking-[-0.04em] text-fg md:text-5xl">
          {step.title}
        </h3>
        <p className="mt-5 max-w-md text-base leading-relaxed text-fg/60 md:text-lg">
          {step.desc}
        </p>
      </div>

      {/* Sağ sütun: adım görseli; panel merkezdeyken dolar.
          Genişlik ekran yüksekliğine de bağlı (4/5 oran üst şeridin altında kalır). */}
      <motion.div
        style={{ scale: imgScale, opacity: imgOpacity }}
        className="w-[min(400px,calc((100vh_-_22rem)*0.8))] justify-self-end xl:w-[min(480px,calc((100vh_-_22rem)*0.8))]"
      >
        <LiquidImage
          src={image.src}
          alt={image.alt}
          sizes="480px"
          className="aspect-[4/5] rounded-3xl border border-fg/10 shadow-[0_30px_80px_-30px_color-mix(in_oklab,var(--color-ink)_45%,transparent)]"
        />
      </motion.div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Mobil / reduced-motion: dikey kartlar                              */
/* ------------------------------------------------------------------ */

function VerticalSteps({ className }: { className?: string }) {
  return (
    <div className={cn("relative overflow-hidden py-20 md:py-24", className)}>
      {/* Outline yazı: mobilde başlıkla çakıştığı için yalnız sm+ ve kartların arkasında */}
      <span
        aria-hidden
        className="headline-outline-light pointer-events-none absolute bottom-4 right-[-4%] hidden select-none text-[8rem] font-extrabold tracking-[-0.04em] opacity-25 sm:block"
      >
        Süreç
      </span>

      <div className="container-g relative">
        <Reveal y={16}>
          <p className="mb-4 inline-flex items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.18em] text-fg/60">
            <span className="inline-block size-2 bg-guru" aria-hidden />
            Nasıl Çalışıyoruz
          </p>
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="text-3xl font-extrabold leading-[1.05] tracking-[-0.04em] text-fg sm:text-4xl">
            Dört adımda <span className="text-guru-text">sonuç</span>
          </h2>
        </Reveal>

        <StaggerGroup className="mt-10 grid gap-4 sm:grid-cols-2" stagger={0.09}>
          {processSteps.map((step) => {
            const image = RAIL_IMAGES[step.no];
            return (
              <StaggerItem key={step.no} className="h-full">
                <article className="h-full rounded-2xl border border-fg/10 bg-card/50 p-6">
                  {/* Görsel yalnız sm+ (mobil uzunluğu artmaz) */}
                  <div className="relative mb-5 hidden aspect-[4/3] overflow-hidden rounded-xl border border-fg/10 sm:block">
                    <Image
                      src={image.src}
                      alt={image.alt}
                      fill
                      sizes="(min-width: 1024px) 480px, 50vw"
                      className="object-cover"
                    />
                  </div>
                  <span
                    className="block text-4xl font-extrabold tracking-[-0.04em] text-guru-text"
                    aria-hidden
                  >
                    {step.no}
                  </span>
                  <h3 className="mt-4 text-xl font-bold tracking-[-0.02em] text-fg">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-fg/60">
                    {step.desc}
                  </p>
                </article>
              </StaggerItem>
            );
          })}
        </StaggerGroup>
      </div>
    </div>
  );
}
