"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useMotionValue, useSpring } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { services } from "@/lib/data";
import { cn } from "@/lib/utils";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/ui/Reveal";
import { usePrefersReducedMotion } from "@/components/fx/usePrefersReducedMotion";

const EASE = [0.22, 1, 0.36, 1] as const;

/** Yüzen önizleme boyutları (px) */
const PREVIEW_W = 300;
const PREVIEW_H = 210;

export type ServicesIndexProps = {
  className?: string;
};

/**
 * Ana sayfa hizmet indeksi: dev satır listesi.
 * Desktop (pointer: fine): imleci yumuşak spring ile takip eden yüzen görsel
 * önizleme + hover'da satır kayması. Mobil/tablet: satır başında hizmetin
 * çıktısını gösteren 56px küçük görsel (hover olmayan cihazda önizleme karşılığı).
 */
export function ServicesIndex({ className }: ServicesIndexProps) {
  const reduce = usePrefersReducedMotion();
  const [finePointer, setFinePointer] = useState(false);
  /* Aktif + bir önceki satır: önizleme katmanı yalnız bu iki görseli render
     eder (crossfade için yeterli; 6 görsel hover olmadan inmez). */
  const [hover, setHover] = useState<{
    active: number | null;
    prev: number | null;
  }>({ active: null, prev: null });
  const active = hover.active;
  const listRef = useRef<HTMLDivElement>(null);

  const select = (i: number | null) =>
    setHover((h) => ({
      active: i,
      prev: h.active !== null && h.active !== i ? h.active : h.prev,
    }));
  const previewIdx = Array.from(
    new Set([hover.prev, active].filter((v): v is number => v !== null))
  );

  /* İnce işaretçi tespiti: yalnızca client'ta */
  useEffect(() => {
    const mq = window.matchMedia("(pointer: fine)");
    const update = () => setFinePointer(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const hoverEnabled = finePointer && !reduce;

  /* İmleç takibi: tek floating container, section seviyesinde */
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 160, damping: 22, mass: 0.55 });
  const sy = useSpring(my, { stiffness: 160, damping: 22, mass: 0.55 });

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!hoverEnabled || !listRef.current) return;
    const rect = listRef.current.getBoundingClientRect();
    mx.set(e.clientX - rect.left);
    my.set(e.clientY - rect.top);
  };

  return (
    <section
      id="hizmetler"
      className={cn(
        "relative overflow-hidden bg-page py-24 md:py-32",
        className
      )}
    >
      {/* Sönük neon zemin lekesi */}
      <div
        className="grain-blob left-[-10%] top-[10%] h-[26rem] w-[26rem] opacity-25"
        aria-hidden
      />

      <div className="container-g relative">
        {/* Başlık bloğu */}
        <div className="mb-14 flex flex-col gap-6 md:mb-20 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <Reveal y={16}>
              <p className="mb-4 inline-flex items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.18em] text-fg/60">
                <span className="inline-block size-2 bg-guru" aria-hidden />
                Neler Yapıyoruz
              </p>
            </Reveal>
            <Reveal delay={0.05}>
              <h2 className="text-balance text-4xl font-extrabold leading-[1.02] tracking-[-0.04em] text-fg sm:text-5xl md:text-6xl">
                Markanızı büyüten{" "}
                <span className="text-guru">altı</span> disiplin
              </h2>
            </Reveal>
          </div>
          <Reveal delay={0.12} className="shrink-0">
            <Link
              href="/hizmetler"
              className="group inline-flex items-center gap-2 py-3 -my-3 text-sm font-semibold text-fg/60 transition-colors duration-300 hover:text-guru"
            >
              Tüm Hizmetleri İncele
              <ArrowUpRight
                className="size-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                strokeWidth={2.2}
              />
            </Link>
          </Reveal>
        </div>

        {/* İndeks listesi */}
        <div
          ref={listRef}
          className="relative"
          onMouseMove={hoverEnabled ? handleMouseMove : undefined}
          onMouseLeave={hoverEnabled ? () => select(null) : undefined}
        >
          <StaggerGroup stagger={0.07}>
            {services.map((service, i) => (
              <StaggerItem
                key={service.slug}
                className="border-t border-fg/10 last:border-b"
              >
                <Link
                  href={`/hizmetler/${service.slug}`}
                  data-cursor="view"
                  aria-label={`${service.title} hizmet detayı`}
                  onMouseEnter={hoverEnabled ? () => select(i) : undefined}
                  className={cn(
                    "group relative z-10 flex items-center justify-between gap-4 py-6 transition-all duration-500 md:py-8",
                    hoverEnabled && "lg:hover:pl-6"
                  )}
                >
                  {/* Sol: küçük görsel (lg altı) / numara (lg) + hizmet adı */}
                  <span className="flex min-w-0 items-start gap-4 lg:items-baseline lg:gap-7">
                    <span
                      className="relative mt-1 size-14 shrink-0 overflow-hidden rounded-xl border border-fg/10 bg-card lg:hidden"
                      aria-hidden
                    >
                      <Image
                        src={service.images[0].src}
                        alt=""
                        fill
                        sizes="56px"
                        className="object-cover"
                      />
                    </span>
                    <span
                      className="hidden shrink-0 text-sm font-semibold tabular-nums tracking-[0.12em] text-fg/30 lg:block"
                      aria-hidden
                    >
                      {service.no}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-2xl font-bold tracking-[-0.03em] text-fg transition-colors duration-500 group-hover:text-guru sm:text-3xl md:text-4xl lg:text-5xl">
                        {service.title}
                      </span>
                      {/* Kısa açıklama mobil/tablet'te başlık altında görünür */}
                      <span className="mt-1 block text-[13px] leading-relaxed text-fg/60 lg:hidden">
                        {service.short}
                      </span>
                    </span>
                  </span>

                  {/* Sağ: kısa açıklama (yalnız lg) + dairesel ok */}
                  <span className="flex shrink-0 items-center gap-6">
                    <span className="hidden max-w-[16rem] text-sm leading-relaxed text-fg/60 lg:block">
                      {service.short}
                    </span>
                    <span
                      className="grid size-10 shrink-0 place-items-center rounded-full border border-fg/15 text-fg/70 transition-all duration-500 group-hover:rotate-45 group-hover:border-guru group-hover:bg-guru group-hover:text-ink md:size-13"
                      aria-hidden
                    >
                      <ArrowUpRight className="size-4 md:size-5" strokeWidth={2} />
                    </span>
                  </span>
                </Link>
              </StaggerItem>
            ))}
          </StaggerGroup>

          {/* Yüzen görsel önizleme: yalnızca ince işaretçide, tek container */}
          {hoverEnabled && (
            <motion.div
              className="pointer-events-none absolute left-0 top-0 z-20 hidden lg:block"
              style={{ x: sx, y: sy }}
              aria-hidden
            >
              <motion.div
                initial={false}
                animate={{
                  opacity: active !== null ? 1 : 0,
                  scale: active !== null ? 1 : 0.82,
                  rotate: active !== null ? 4 : 0,
                }}
                transition={{ duration: 0.5, ease: EASE }}
                className="relative -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-fg/10 bg-card shadow-[0_24px_80px_-24px_rgb(16_216_108/0.35)]"
                style={{ width: PREVIEW_W, height: PREVIEW_H }}
              >
                {previewIdx.map((i) => (
                  <Image
                    key={services[i].slug}
                    src={services[i].images[0].src}
                    alt=""
                    fill
                    sizes={`${PREVIEW_W}px`}
                    className={cn(
                      "object-cover transition-opacity duration-500",
                      active === i ? "opacity-100" : "opacity-0"
                    )}
                  />
                ))}
                {/* Alt bilgi şeridi. Zemin gradyanı bilerek sabit koyu (from-ink),
                   bu yüzden üzerindeki metin de sabit açık kalır (text-paper):
                   text-fg gündüz modunda koyulaşıp koyu-üstü-koyu kalırdı. */}
                <span className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-ink/80 to-transparent px-4 pb-3 pt-8 text-[11px] font-semibold uppercase tracking-[0.14em] text-paper/80">
                  {active !== null ? services[active].no : ""}
                  <span className="text-guru">İncele</span>
                </span>
              </motion.div>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}
