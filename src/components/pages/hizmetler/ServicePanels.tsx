"use client";

import { useRef, useSyncExternalStore } from "react";
import Link from "next/link";
import {
  motion,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";
import { services, type Service } from "@/lib/data";
import { GButton } from "@/components/ui/Button";
import { Magnetic } from "@/components/ui/Magnetic";
import { Spotlight } from "@/components/fx/Spotlight";
import { LiquidImage } from "@/components/fx/LiquidImage";
import { usePrefersReducedMotion } from "@/components/fx/usePrefersReducedMotion";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Sticky yığın koşulu: md+ genişlik VE karta yetecek yükseklik. Aşağıdaki
 * Tailwind varyantlarıyla (md + min-height:600px) birebir aynı sorgu; böylece
 * ölçek/karartma efekti yalnız kartlar gerçekten yığılırken çalışır.
 */
const STACK_QUERY = "(min-width: 768px) and (min-height: 600px)";

function subscribeStack(onChange: () => void) {
  const mq = window.matchMedia(STACK_QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

/** SSR anlık görüntüsü false: sunucu ve istemcinin ilk render'ı efektsiz ve birebir aynı. */
function useStackLayout(): boolean {
  return useSyncExternalStore(
    subscribeStack,
    () => window.matchMedia(STACK_QUERY).matches,
    () => false
  );
}

/**
 * /hizmetler: her hizmet için tam genişlik bir panel. Desktop'ta (md+ ve
 * yeterli yükseklikte) paneller sticky olarak üst üste yığılır; sonraki panel
 * öncekinin üzerine kayarken alttaki hafifçe küçülür ve kararır (CaseStack
 * ile aynı dil). Mobilde sade dikey kartlar: görsel üstte, metin ve buton altta.
 *
 * Hydration güvenliği: matchMedia ve reduced-motion useSyncExternalStore ile
 * okunur (sunucu anlık görüntüsü false); efekt stilleri yalnız mount sonrası
 * eklenir, DOM yapısı değişmez.
 */
export function ServicePanels() {
  const stackRef = useRef<HTMLDivElement>(null);
  const stack = useStackLayout();
  const reduce = usePrefersReducedMotion();

  const { scrollYProgress } = useScroll({
    target: stackRef,
    offset: ["start start", "end end"],
  });

  const fx = stack && !reduce;
  const total = services.length;

  return (
    // relative: mobilde (sticky yokken) section'daki dekoratif blob'un üstünde kalsın
    <div
      ref={stackRef}
      className="container-g relative flex flex-col gap-6 md:gap-[8vh]"
    >
      {services.map((service, i) => (
        <Panel
          key={service.slug}
          service={service}
          index={i}
          total={total}
          progress={scrollYProgress}
          fx={fx}
        />
      ))}
    </div>
  );
}

function Panel({
  service,
  index,
  total,
  progress,
  fx,
}: {
  service: Service;
  index: number;
  total: number;
  progress: MotionValue<number>;
  fx: boolean;
}) {
  const isLast = index === total - 1;
  const start = index / total;
  const end = (index + 1) / total;

  // Sonraki panel üzerine kayarken alttaki küçülür + kararır; son panel sabit.
  const scale = useTransform(progress, [start, end], [1, isLast ? 1 : 0.92]);
  const dim = useTransform(progress, [start, end], [0, isLast ? 0 : 0.45]);

  const Icon = service.icon;
  const href = `/hizmetler/${service.slug}`;
  const cover = service.images[0];
  const headingId = `hizmet-${service.slug}`;

  return (
    /* Sticky yalnız md+ ve >=600px yükseklikte; kısa viewport'ta kartlar akar. */
    <div
      className="md:[@media(min-height:600px)]:sticky md:[@media(min-height:600px)]:top-[8vh]"
      style={{ zIndex: index + 1 }}
    >
      <motion.article
        aria-labelledby={headingId}
        style={fx ? { scale, transformOrigin: "center top" } : undefined}
        className="relative flex overflow-hidden rounded-3xl border border-fg/10 bg-card shadow-[inset_0_1px_0_color-mix(in_oklab,var(--color-fg)_6%,transparent)] md:min-h-[84vh] md:rounded-[2rem]"
      >
        {/* Spotlight: panel zemininde fareyle gezen yeşil ışık (pointer:fine). */}
        <Spotlight
          className="grid w-full md:grid-cols-[1fr_1.05fr]"
          size={520}
          opacity={0.08}
        >
          {/* Sol: numara, ikon, başlık, özet, anahtar kelimeler, CTA */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10% 0px" }}
            transition={{ duration: 0.7, ease: EASE }}
            className="relative flex min-w-0 flex-col justify-between p-6 sm:p-10 lg:p-14"
          >
            <div>
              <div className="flex items-start justify-between gap-4">
                <span
                  aria-hidden
                  className="headline-outline-light text-[3.5rem] font-extrabold leading-none tracking-[-0.04em] sm:text-[5rem] md:text-[6.5rem] lg:text-[8rem]"
                >
                  {service.no}
                </span>
                <span
                  aria-hidden
                  className="mt-1 grid size-11 shrink-0 place-items-center rounded-full border border-fg/15 bg-page/60 text-guru-text md:size-12"
                >
                  <Icon className="size-5" strokeWidth={1.8} />
                </span>
              </div>

              <h2
                id={headingId}
                className="mt-5 text-balance text-3xl font-extrabold leading-[1.04] tracking-[-0.04em] text-fg [overflow-wrap:anywhere] sm:text-4xl md:mt-6 md:text-5xl xl:text-6xl"
              >
                {service.title}
              </h2>
              <p className="mt-4 max-w-md text-base leading-relaxed text-fg/60 md:text-lg">
                {service.short}
              </p>

              <ul className="mt-6 flex flex-wrap gap-2" aria-label="Öne çıkan başlıklar">
                {service.keywords.slice(0, 3).map((keyword) => (
                  <li
                    key={keyword}
                    className="rounded-full border border-fg/15 px-3.5 py-1.5 text-xs font-medium text-fg/60"
                  >
                    {keyword}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-8 md:mt-10">
              <Magnetic>
                <GButton href={href} variant="green" size="lg">
                  İncele
                  <span className="sr-only">: {service.title}</span>
                </GButton>
              </Magnetic>
            </div>
          </motion.div>

          {/* Sağ: kapak görseli. Mobilde kartın üstünde (order-first), md+ sağ sütunu doldurur. */}
          <Link
            href={href}
            data-cursor="view"
            aria-label={`${service.title} detayı`}
            className="group relative order-first block aspect-[4/3] md:order-none md:aspect-auto md:min-h-[24rem]"
          >
            <LiquidImage
              src={cover.src}
              alt=""
              sizes="(min-width: 768px) 50vw, 100vw"
              priority={index === 0}
              className="absolute inset-0"
              imgClassName="transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
            />
          </Link>
        </Spotlight>

        {/* Karartma katmanı (yığın efekti); ışığın üstünde, Spotlight'ın dışında */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[inherit] bg-page"
          style={fx ? { opacity: dim } : { opacity: 0 }}
        />
      </motion.article>
    </div>
  );
}
