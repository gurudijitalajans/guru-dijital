"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import { MoveRight } from "lucide-react";
import { process as processSteps } from "@/lib/data";
import { cn } from "@/lib/utils";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/ui/Reveal";
import { usePrefersReducedMotion } from "@/components/fx/usePrefersReducedMotion";

type ProcessStep = (typeof processSteps)[number];

export type ProcessRailProps = {
  className?: string;
};

/**
 * Süreç bölümü — desktop'ta dikey scroll'u yatay panel yolculuğuna çeviren
 * sticky ray; mobil ve prefers-reduced-motion'da sade dikey kartlar.
 */
export function ProcessRail({ className }: ProcessRailProps) {
  /* SSR anlık görüntüsü false olduğundan hydration güvenli; tercih hydration
     sonrası tek re-render ile uygulanır (effect + setState kaskadı yok). */
  const staticOnly = usePrefersReducedMotion();

  return (
    <section id="surec" className={cn("relative bg-ink", className)}>
      {!staticOnly && <DesktopRail className="hidden lg:block" />}
      <VerticalSteps className={staticOnly ? undefined : "lg:hidden"} />
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
    <div ref={targetRef} className={cn("relative h-[320vh]", className)}>
      <div className="sticky top-0 h-screen overflow-hidden">
        {/* Arka plan: dev sönük outline yazı */}
        <span
          aria-hidden
          className="headline-outline-light pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 select-none whitespace-nowrap text-[24vw] font-extrabold tracking-[-0.04em] opacity-35"
        >
          Süreç
        </span>

        {/* Üst şerit: eyebrow + kaydırma ipucu */}
        <div className="absolute inset-x-0 top-0 z-10 flex items-start justify-between px-10 pt-9 md:px-16">
          <div>
            <p className="inline-flex items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.18em] text-paper/60">
              <span className="inline-block size-2 bg-guru" aria-hidden />
              Nasıl Çalışıyoruz
            </p>
            <p className="mt-2 text-lg font-extrabold tracking-[-0.04em] text-paper">
              Dört adımda <span className="text-guru">sonuç</span>
            </p>
          </div>
          <p className="flex items-center gap-2 pt-1 text-xs font-semibold uppercase tracking-[0.16em] text-paper/40">
            kaydırmaya devam
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

        {/* Alt ilerleme çizgisi */}
        <div className="absolute inset-x-0 bottom-0 z-10 px-10 pb-9 md:px-16">
          <div className="h-px w-full overflow-hidden bg-paper/10">
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
     Girdi aralığı [0,1] içinde ve artan kalmalı — taşan offset'ler WAAPI
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

  return (
    <div className="relative flex h-full w-screen shrink-0 flex-col justify-center border-l border-paper/10 px-12 first:border-l-0 md:px-20">
      <div className="relative w-fit leading-none" aria-hidden>
        <span className="headline-outline-light block text-[8rem] font-extrabold tracking-[-0.04em] xl:text-[11rem]">
          {step.no}
        </span>
        <motion.span
          className="absolute inset-0 block text-[8rem] font-extrabold tracking-[-0.04em] text-guru xl:text-[11rem]"
          style={{
            opacity: fill,
            textShadow: "0 0 48px rgb(16 216 108 / 0.45)",
          }}
        >
          {step.no}
        </motion.span>
      </div>
      <h3 className="mt-7 max-w-xl text-3xl font-extrabold tracking-[-0.04em] text-paper md:text-5xl">
        {step.title}
      </h3>
      <p className="mt-5 max-w-md text-base leading-relaxed text-paper/60 md:text-lg">
        {step.desc}
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Mobil / reduced-motion: dikey kartlar                              */
/* ------------------------------------------------------------------ */

function VerticalSteps({ className }: { className?: string }) {
  return (
    <div className={cn("relative overflow-hidden py-20 md:py-24", className)}>
      <span
        aria-hidden
        className="headline-outline-light pointer-events-none absolute right-[-4%] top-6 select-none text-[5.5rem] font-extrabold tracking-[-0.04em] opacity-40 sm:text-[8rem]"
      >
        Süreç
      </span>

      <div className="container-g relative">
        <Reveal y={16}>
          <p className="mb-4 inline-flex items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.18em] text-paper/60">
            <span className="inline-block size-2 bg-guru" aria-hidden />
            Nasıl Çalışıyoruz
          </p>
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="text-3xl font-extrabold leading-[1.05] tracking-[-0.04em] text-paper sm:text-4xl">
            Dört adımda <span className="text-guru">sonuç</span>
          </h2>
        </Reveal>

        <StaggerGroup className="mt-10 grid gap-4 sm:grid-cols-2" stagger={0.09}>
          {processSteps.map((step) => (
            <StaggerItem key={step.no} className="h-full">
              <article className="h-full rounded-2xl border border-paper/10 bg-carbon/50 p-6">
                <span
                  className="block text-4xl font-extrabold tracking-[-0.04em] text-guru"
                  aria-hidden
                >
                  {step.no}
                </span>
                <h3 className="mt-4 text-xl font-bold tracking-[-0.02em] text-paper">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-paper/60">
                  {step.desc}
                </p>
              </article>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </div>
    </div>
  );
}
