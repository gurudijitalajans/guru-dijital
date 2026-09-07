"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { motion, useScroll, useTransform } from "motion/react";
import { cn } from "@/lib/utils";
import { services, works, type Work } from "@/lib/data";
import { LiquidImage } from "@/components/fx/LiquidImage";
import { usePrefersReducedMotion } from "@/components/fx/usePrefersReducedMotion";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/ui/Reveal";
import { GButton } from "@/components/ui/Button";

/* ------------------------------------------------------------------ */
/*  Öne çıkan işler + editorial grid yerleşimi                         */
/* ------------------------------------------------------------------ */

const FEATURED = [
  "ambalaj-etiket",
  "sosyal-medya-icerikleri",
  "web-siteleri",
  "logo-marka-kimligi",
] as const;

type CardLayout = {
  /** Grid kolon davranışı (desktop 12 kolon; lg altı yatay ray). */
  span: string;
  /** Görsel/medya oran sınıfları (kart yüksekliğini belirler). */
  media: string;
  /** next/image responsive sizes. */
  sizes: string;
  /**
   * Görsel kutuya sığdırılır (object-contain) ve aynı görselin bulanık kopyası
   * zemin olur: geniş logo kolajı gibi kırpılmaması gereken işler için
   * (object-cover kenar sütunlardaki markaları kesiyordu).
   */
  contain?: boolean;
};

/* Üst satır: büyük 7 + 5; alt satır aynalanmış: 5 + büyük 7 */
const LAYOUT: CardLayout[] = [
  {
    span: "lg:col-span-7",
    media: "aspect-[4/3] lg:aspect-[16/10]",
    sizes: "(min-width: 1024px) 56vw, (min-width: 768px) 46vw, 80vw",
  },
  {
    span: "lg:col-span-5",
    media: "aspect-[4/3] lg:aspect-auto lg:h-full",
    sizes: "(min-width: 1024px) 40vw, (min-width: 768px) 46vw, 80vw",
  },
  {
    span: "lg:col-span-5",
    media: "aspect-[4/3] lg:aspect-auto lg:h-full",
    sizes: "(min-width: 1024px) 40vw, (min-width: 768px) 46vw, 80vw",
  },
  {
    span: "lg:col-span-7",
    media: "aspect-[4/3] lg:aspect-[16/10]",
    sizes: "(min-width: 1024px) 56vw, (min-width: 768px) 46vw, 80vw",
    contain: true,
  },
];

/* ------------------------------------------------------------------ */
/*  İnce işaretçi tespiti (hover şeridi yalnızca fine pointer'da       */
/*  gizlenip kayarak açılır; dokunmatikte hep görünür kalır)           */
/* ------------------------------------------------------------------ */

function useFinePointer(): boolean {
  const [fine, setFine] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(pointer: fine)");
    const update = () => setFine(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return fine;
}

/* ------------------------------------------------------------------ */
/*  Kart: iç parallax + hover zoom + alttan kayan başlık şeridi        */
/* ------------------------------------------------------------------ */

function ShowcaseCard({
  work,
  index,
  layout,
  fine,
}: {
  work: Work;
  index: number;
  layout: CardLayout;
  fine: boolean;
}) {
  const ref = useRef<HTMLElement>(null);
  /* SSR anlık görüntüsü false → SSR ve ilk istemci render'ı birebir aynı;
     gerçek tercih hydration sonrası tek re-render ile devreye girer. */
  const reduce = usePrefersReducedMotion();

  /* Kart viewport'tan geçerken görsel dikeyde ±%8 kayar (iç parallax). */
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);

  /* İş, ait olduğu hizmetin sayfasına gider (ürünler sayfasına değil). */
  const serviceTitle =
    services.find((s) => s.slug === work.serviceSlug)?.title ?? "Hizmet";

  return (
    <Link
      href={`/hizmetler/${work.serviceSlug}`}
      data-cursor="view"
      aria-label={`${work.title}: ${serviceTitle} sayfasına git`}
      className="group block h-full"
    >
      <article
        ref={ref}
        className={cn(
          "relative h-full overflow-hidden rounded-[1.75rem] border border-fg/10 bg-card",
          "transition-shadow duration-500 group-hover:shadow-[0_0_70px_-24px_rgb(16_216_108/0.4)]",
          layout.media
        )}
      >
        {/* Parallax katmanı. Cover kartlarda görsel scale-110 olduğundan kenar
            açığı vermez; contain kartta bulanık zemin kopyası scale-125 ile
            kenarları kapatır. LiquidImage kendi relative sarmalayıcısını getirir;
            hover zoom sınıfları imgClassName ile iç <img>'e aktarılır. */}
        <motion.div
          style={reduce ? undefined : { y }}
          className="absolute inset-0 will-change-transform"
          aria-hidden
        >
          {layout.contain && (
            <Image
              src={work.image}
              alt=""
              fill
              sizes={layout.sizes}
              className="scale-125 object-cover blur-2xl"
            />
          )}
          <LiquidImage
            src={work.image}
            alt={work.imageAlt}
            sizes={layout.sizes}
            className="absolute inset-0"
            imgClassName={
              layout.contain
                ? "object-contain p-3 transition-transform duration-700 ease-out group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100 md:p-5"
                : "scale-110 transition-transform duration-700 ease-out group-hover:scale-[1.17] motion-reduce:transition-none motion-reduce:group-hover:scale-110"
            }
          />
        </motion.div>

        {/* Okunabilirlik için sabit, çok hafif alt gradyan */}
        <div
          className="absolute inset-0 bg-gradient-to-t from-ink/45 via-transparent to-transparent"
          aria-hidden
        />

        {/* Sıra numarası rozeti */}
        <span className="absolute left-4 top-4 rounded-full border border-fg/15 bg-band/50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-fg/80 backdrop-blur-sm">
          {String(index + 1).padStart(2, "0")}
        </span>

        {/* Alttan kayan başlık şeridi */}
        <div
          className={cn(
            "absolute inset-x-3 bottom-3 flex items-center justify-between gap-4 rounded-[1.25rem] border border-fg/10 bg-band/70 px-5 py-4 backdrop-blur-md",
            fine &&
              "translate-y-[115%] opacity-0 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-y-0 group-hover:opacity-100 motion-reduce:translate-y-0 motion-reduce:opacity-100 motion-reduce:transition-none"
          )}
        >
          <div className="min-w-0">
            <h3 className="line-clamp-2 text-[15px] font-bold tracking-tight text-fg md:text-lg">
              {work.title}
            </h3>
            <div className="mt-1 flex flex-wrap gap-x-2.5 gap-y-0.5">
              {work.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="text-[11px] font-medium uppercase tracking-[0.12em] text-fg/55"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-guru text-ink transition-transform duration-300 group-hover:rotate-45">
            <ArrowUpRight className="size-5" strokeWidth={2.2} />
          </span>
        </div>
      </article>
    </Link>
  );
}

/* ------------------------------------------------------------------ */
/*  Bölüm                                                              */
/* ------------------------------------------------------------------ */

export function WorkShowcase() {
  const fine = useFinePointer();
  const items = FEATURED.map((slug) =>
    works.find((p) => p.slug === slug)
  ).filter((p): p is Work => Boolean(p));

  return (
    <section className="relative overflow-hidden bg-band py-14 md:py-28">
      {/* Sönük yeşil ambiyans */}
      <div className="grain-blob -right-48 top-8 h-96 w-96 opacity-20" aria-hidden />

      <div className="container-g relative">
        {/* Başlık satırı */}
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading
            dark
            eyebrow="İşlerimiz"
            title="Somut işler, *görünür* sonuçlar"
            sub="Logodan ambalaja, katalogdan web sitesine: hizmetlerimizin rafta ve ekranda duran çıktıları."
          />
          <Reveal delay={0.15} className="hidden md:block">
            <GButton
              href="/hizmetler"
              variant="outline"
              className="border-fg/25 text-fg hover:border-fg hover:bg-fg hover:text-page"
            >
              Hizmetleri İncele
            </GButton>
          </Reveal>
        </div>

        {/* lg altı: yatay snap rayı (dikey yığın yerine, sayfa ~1.400px kısalır);
            lg+: asimetrik editorial grid. Ray, container dolgusunu -mx ile
            iptal edip px ile geri verir; scroll-pl ile kartlar dolgu hizasına
            oturur. Yatay trackpad/dokunma jestleri Lenis'e takılmaz. */}
        <StaggerGroup
          className={cn(
            "mt-12 flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain",
            "-mx-5 scroll-pl-5 px-5 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
            "md:mt-16 md:-mx-8 md:scroll-pl-8 md:px-8",
            "lg:mx-0 lg:grid lg:grid-cols-12 lg:gap-5 lg:overflow-visible lg:px-0 lg:pb-0"
          )}
          stagger={0.1}
        >
          {items.map((work, i) => (
            <StaggerItem
              key={work.slug}
              className={cn(
                "w-[80vw] shrink-0 snap-start sm:w-[58vw] md:w-[46vw] lg:w-auto",
                LAYOUT[i].span
              )}
            >
              <ShowcaseCard
                work={work}
                index={i}
                layout={LAYOUT[i]}
                fine={fine}
              />
            </StaggerItem>
          ))}
        </StaggerGroup>

        {/* Mobil CTA */}
        <Reveal className="mt-8 md:hidden">
          <GButton
            href="/hizmetler"
            variant="outline"
            className="w-full border-fg/25 text-fg hover:border-fg hover:bg-fg hover:text-page"
          >
            Hizmetleri İncele
          </GButton>
        </Reveal>
      </div>
    </section>
  );
}
