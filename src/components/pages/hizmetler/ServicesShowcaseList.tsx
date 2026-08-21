"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { services } from "@/lib/data";
import { cn } from "@/lib/utils";
import { StaggerGroup, StaggerItem } from "@/components/ui/Reveal";

const EASE = [0.22, 1, 0.36, 1] as const;

/** Yüzen önizleme boyutları (px) */
const PREVIEW_W = 316;
const PREVIEW_H = 222;

/**
 * /hizmetler dizini — ana sayfadaki ServicesIndex dokusunun sayfaya özel,
 * başlıksız uyarlaması (ortak component'e dokunmadan aynı desen).
 *
 * Desktop (pointer:fine + motion serbest): imleci yumuşak spring ile takip
 * eden TEK yüzen görsel önizleme (section seviyesinde tek container,
 * services[].images[0] crossfade) + hover'da satır kayması ve yeşil başlık.
 * Mobil / kaba işaretçi: sade dev tipografili liste.
 *
 * Hydration güvenliği: finePointer yalnız mount sonrası useEffect'te dolar;
 * SSR ile istemcinin ilk render'ı birebir aynıdır (yüzen katman ikisinde de
 * yoktur, satır sınıfları da aynıdır).
 */
export function ServicesShowcaseList() {
  const reduce = useReducedMotion();
  const [finePointer, setFinePointer] = useState(false);
  const [active, setActive] = useState<number | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  /* İnce işaretçi tespiti — yalnızca client'ta */
  useEffect(() => {
    const mq = window.matchMedia("(pointer: fine)");
    const update = () => setFinePointer(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const hoverEnabled = finePointer && !reduce;

  /* İmleç takibi — tek floating container, liste seviyesinde */
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
    <div
      ref={listRef}
      className="relative"
      onMouseMove={hoverEnabled ? handleMouseMove : undefined}
      onMouseLeave={hoverEnabled ? () => setActive(null) : undefined}
    >
      <StaggerGroup stagger={0.07}>
        {services.map((service, i) => (
          <StaggerItem
            key={service.slug}
            className="border-t border-paper/10 last:border-b"
          >
            <Link
              href={`/hizmetler/${service.slug}`}
              data-cursor="view"
              aria-label={`${service.title} hizmet detayı`}
              onMouseEnter={hoverEnabled ? () => setActive(i) : undefined}
              className={cn(
                "group relative z-10 flex items-center justify-between gap-4 py-7 transition-all duration-500 md:py-10",
                hoverEnabled && "lg:hover:pl-6"
              )}
            >
              {/* Sol: numara + hizmet adı */}
              <span className="flex min-w-0 items-baseline gap-4 md:gap-7">
                <span
                  className="shrink-0 text-xs font-semibold tabular-nums tracking-[0.12em] text-paper/30 md:text-sm"
                  aria-hidden
                >
                  {service.no}
                </span>
                <span className="text-3xl font-bold tracking-[-0.03em] text-paper transition-colors duration-500 group-hover:text-guru sm:text-4xl md:text-5xl lg:text-6xl">
                  {service.title}
                </span>
              </span>

              {/* Sağ: kısa açıklama (yalnız lg) + dairesel ok */}
              <span className="flex shrink-0 items-center gap-6">
                <span className="hidden max-w-[16rem] text-sm leading-relaxed text-paper/45 lg:block">
                  {service.short}
                </span>
                <span
                  className="grid size-10 shrink-0 place-items-center rounded-full border border-paper/15 text-paper/70 transition-all duration-500 group-hover:rotate-45 group-hover:border-guru group-hover:bg-guru group-hover:text-ink md:size-13"
                  aria-hidden
                >
                  <ArrowUpRight className="size-4 md:size-5" strokeWidth={2} />
                </span>
              </span>
            </Link>
          </StaggerItem>
        ))}
      </StaggerGroup>

      {/* Yüzen görsel önizleme — yalnızca ince işaretçide, tek container */}
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
              rotate: active !== null ? -4 : 0,
            }}
            transition={{ duration: 0.5, ease: EASE }}
            className="relative -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-paper/10 bg-carbon shadow-[0_24px_80px_-24px_rgb(16_216_108/0.35)]"
            style={{ width: PREVIEW_W, height: PREVIEW_H }}
          >
            {services.map((service, i) => (
              <Image
                key={service.slug}
                src={service.images[0].src}
                alt=""
                fill
                sizes={`${PREVIEW_W}px`}
                className={cn(
                  "object-cover transition-opacity duration-500",
                  active === i ? "opacity-100" : "opacity-0"
                )}
              />
            ))}
            {/* Alt bilgi şeridi */}
            <span className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-ink/80 to-transparent px-4 pb-3 pt-8 text-[11px] font-semibold uppercase tracking-[0.14em] text-paper/80">
              {active !== null ? services[active].no : ""}
              <span className="text-guru">İncele</span>
            </span>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
