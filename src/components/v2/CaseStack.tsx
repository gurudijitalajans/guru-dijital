"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";
import { ArrowDown } from "lucide-react";
import { caseStudies, type CaseStudy } from "@/lib/data";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { RollingCounter } from "@/components/fx/RollingCounter";
import { Spotlight } from "@/components/fx/Spotlight";
import { cn } from "@/lib/utils";

export type CaseStackProps = {
  className?: string;
};

/**
 * Vaka çalışmaları sticky yığını: her vaka tam genişlik dev bir kart,
 * desktop'ta position sticky ile üst üste yığılır; sonraki kart öncekinin
 * üzerine kayarken alttaki hafifçe küçülür ve kararır.
 * Mobilde kartlar sticky olmadan alt alta sıralanır.
 */
export function CaseStack({ className }: CaseStackProps) {
  const stackRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const { scrollYProgress } = useScroll({
    target: stackRef,
    offset: ["start start", "end end"],
  });

  const fx = isDesktop && !reduce;
  const total = caseStudies.length;

  return (
    // DİKKAT: sticky çalışsın diye bu section'a overflow-hidden VERİLMEZ.
    <section className={cn("bg-page py-24 md:py-32", className)}>
      <div className="container-g">
        <SectionHeading
          dark
          eyebrow="Vaka Çalışmaları"
          title="Nasıl *başardık*?"
          sub="Rakamlar bizden daha iyi anlatıyor: strateji değişince aynı bütçe bambaşka sonuçlar üretiyor."
        />
      </div>

      <div
        ref={stackRef}
        className="container-g mt-14 flex flex-col gap-8 md:mt-20 md:gap-[10vh]"
      >
        {caseStudies.map((cs, i) => (
          <CaseCard
            key={cs.id}
            cs={cs}
            index={i}
            total={total}
            progress={scrollYProgress}
            fx={fx}
          />
        ))}
      </div>
    </section>
  );
}

function CaseCard({
  cs,
  index,
  total,
  progress,
  fx,
}: {
  cs: CaseStudy;
  index: number;
  total: number;
  progress: MotionValue<number>;
  fx: boolean;
}) {
  const isLast = index === total - 1;
  const start = index / total;
  const end = (index + 1) / total;

  // Sonraki kart üzerine kayarken alttaki kart küçülür + kararır.
  const scale = useTransform(progress, [start, end], [1, isLast ? 1 : 0.92]);
  const dim = useTransform(progress, [start, end], [0, isLast ? 0 : 0.45]);

  return (
    /* Kısa viewport'ta (alçak laptop/zoom) 92vh'lik alan karta yetmeyip alt
       istatistik satırını kalıcı gizleyebilir — sticky yalnız >=600px yükseklikte */
    <div
      className="md:[@media(min-height:600px)]:sticky md:[@media(min-height:600px)]:top-[8vh]"
      style={{ zIndex: index + 1 }}
    >
      <motion.article
        style={fx ? { scale, transformOrigin: "center top" } : undefined}
        className="relative flex overflow-hidden rounded-[2rem] border border-fg/10 bg-card shadow-[inset_0_1px_0_color-mix(in_oklab,var(--color-fg)_6%,transparent),inset_0_0_120px_rgb(16_216_108/0.05)] md:min-h-[86vh]"
      >
        {/* Spotlight: kart zemininde fareyle gezen yeşil ışık.
           Karartma katmanı (dim) sarmalayıcının DIŞINDA kalır ki stack
           efekti ışığın üzerinde çalışmaya devam etsin. */}
        <Spotlight className="flex w-full" size={520} opacity={0.08}>
        {/* iç glow */}
        <div
          aria-hidden
          className="grain-blob -right-24 -top-24 h-72 w-72 opacity-25 md:h-96 md:w-96"
        />
        <div
          aria-hidden
          className="grain-blob -bottom-32 -left-28 h-64 w-64 opacity-15 md:h-80 md:w-80"
        />

        {/* kart no */}
        <span
          aria-hidden
          className="absolute right-6 top-6 text-sm font-semibold tracking-[0.2em] text-fg/30 md:right-10 md:top-10"
        >
          0{index + 1} / 0{total}
        </span>

        <div className="relative grid w-full items-center gap-10 p-6 py-12 sm:p-8 sm:py-14 md:grid-cols-2 md:gap-12 md:p-12 lg:p-16">
          {/* sol: sektör + başlık + özet + not */}
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-fg/15 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-fg/60">
              <span aria-hidden className="inline-block size-1.5 rounded-full bg-guru" />
              {cs.sector}
            </span>
            <h3 className="mt-6 text-balance text-3xl font-extrabold leading-[1.02] tracking-[-0.04em] text-fg sm:text-4xl lg:text-5xl">
              {cs.title}
            </h3>
            <p className="mt-5 max-w-md text-sm leading-relaxed text-fg/65 md:text-base">
              {cs.summary}
            </p>
            <p className="mt-7 inline-flex max-w-full items-start gap-2 rounded-2xl border border-guru/25 bg-guru/10 px-4 py-2 text-xs font-medium text-guru md:items-center md:rounded-full md:text-sm">
              <span aria-hidden className="mt-[5px] inline-block size-1.5 shrink-0 rounded-full bg-guru md:mt-0" />
              {cs.note}
            </p>
          </div>

          {/* sağ: istatistik ızgarası */}
          <div className="grid grid-cols-2 gap-3 md:gap-4">
            {cs.stats.map((s) => (
              <div
                key={s.label}
                className="relative rounded-2xl border border-fg/10 bg-page/50 p-4 md:p-5"
              >
                {/* Ok rozeti satır akışının dışında (absolute sağ-üst):
                   dar ekranda sayaçla aynı satır genişliğini paylaşmaz */}
                {s.down && (
                  <span
                    className="absolute right-3 top-3 inline-flex size-6 items-center justify-center rounded-full bg-guru/15 text-guru md:right-4 md:top-4 md:size-7"
                    aria-label="düşüş"
                    title="Düşüş"
                  >
                    <ArrowDown className="size-3.5 md:size-4" strokeWidth={2.5} />
                  </span>
                )}
                <RollingStat
                  value={s.value}
                  prefix={s.prefix}
                  suffix={s.suffix}
                  down={s.down}
                />
                <p className="mt-2 text-xs leading-snug text-fg/55 md:text-sm">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
        </Spotlight>

        {/* karartma katmanı (stack efekti) */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[2rem] bg-page"
          style={fx ? { opacity: dim } : { opacity: 0 }}
        />
      </motion.article>
    </div>
  );
}

function RollingStat({
  value,
  prefix,
  suffix,
  down,
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  down?: boolean;
}) {
  return (
    <RollingCounter
      value={value}
      prefix={prefix}
      suffix={suffix}
      className={cn(
        "text-2xl font-extrabold tracking-[-0.04em] sm:text-3xl md:text-4xl lg:text-[2.6rem]",
        down ? "text-guru" : "text-fg"
      )}
    />
  );
}
