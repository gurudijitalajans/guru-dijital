"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import { cn } from "@/lib/utils";
import { works, type Work } from "@/lib/data";
import { LiquidImage } from "@/components/fx/LiquidImage";
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
  /** Grid kolon davranışı (desktop 12 kolon; mobil tek sütun). */
  span: string;
  /** Görsel/medya oran sınıfları (kart yüksekliğini belirler). */
  media: string;
  /** next/image responsive sizes. */
  sizes: string;
};

/* Üst satır: büyük 7 + 5 — alt satır aynalanmış: 5 + büyük 7 */
const LAYOUT: CardLayout[] = [
  {
    span: "lg:col-span-7",
    media: "aspect-[4/3] lg:aspect-[16/10]",
    sizes: "(min-width: 1024px) 56vw, 100vw",
  },
  {
    span: "lg:col-span-5",
    media: "aspect-[4/3] lg:aspect-auto lg:h-full",
    sizes: "(min-width: 1024px) 40vw, 100vw",
  },
  {
    span: "lg:col-span-5",
    media: "aspect-[4/3] lg:aspect-auto lg:h-full",
    sizes: "(min-width: 1024px) 40vw, 100vw",
  },
  {
    span: "lg:col-span-7",
    media: "aspect-[4/3] lg:aspect-[16/10]",
    sizes: "(min-width: 1024px) 56vw, 100vw",
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
  product,
  index,
  layout,
  fine,
}: {
  product: Work;
  index: number;
  layout: CardLayout;
  fine: boolean;
}) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();

  /* Kart viewport'tan geçerken görsel dikeyde ±%8 kayar (iç parallax). */
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);

  return (
    <Link
      href="/urunler"
      data-cursor="view"
      aria-label={`${product.title}: tüm ürünleri gör`}
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
        {/* Parallax katmanı — görsel scale-110 olduğundan kenar açığı vermez.
            LiquidImage kendi relative sarmalayıcısını ve object-cover'ı getirir;
            hover zoom sınıfları imgClassName ile iç <img>'e aktarılır. */}
        <motion.div
          style={{ y: reduce ? 0 : y }}
          className="absolute inset-0 will-change-transform"
          aria-hidden
        >
          <LiquidImage
            src={product.image}
            alt={product.imageAlt}
            sizes={layout.sizes}
            className="absolute inset-0"
            imgClassName="scale-110 transition-transform duration-700 ease-out group-hover:scale-[1.17] motion-reduce:transition-none motion-reduce:group-hover:scale-110"
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
            <h3 className="truncate text-base font-bold tracking-tight text-fg md:text-lg">
              {product.title}
            </h3>
            <div className="mt-1 flex flex-wrap gap-x-2.5 gap-y-0.5">
              {product.tags.slice(0, 3).map((tag) => (
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
    <section className="relative overflow-hidden bg-band py-20 md:py-28">
      {/* Sönük yeşil ambiyans */}
      <div className="grain-blob -right-48 top-8 h-96 w-96 opacity-20" aria-hidden />

      <div className="container-g relative">
        {/* Başlık satırı */}
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading
            dark
            eyebrow="Ürünlerimiz"
            title="Somut işler, *görünür* sonuçlar"
            sub="Logodan ambalaja, kataloğdan web sitesine; hizmetlerimizin rafta ve ekranda duran çıktıları."
          />
          <Reveal delay={0.15} className="hidden md:block">
            <GButton
              href="/urunler"
              variant="outline"
              className="border-fg/25 text-fg hover:border-fg hover:bg-fg hover:text-page"
            >
              Tüm Ürünler
            </GButton>
          </Reveal>
        </div>

        {/* Asimetrik editorial grid */}
        <StaggerGroup
          className="mt-12 grid grid-cols-1 gap-5 md:mt-16 lg:grid-cols-12"
          stagger={0.1}
        >
          {items.map((product, i) => (
            <StaggerItem key={product.slug} className={LAYOUT[i].span}>
              <ShowcaseCard
                product={product}
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
            href="/urunler"
            variant="outline"
            className="w-full border-fg/25 text-fg hover:border-fg hover:bg-fg hover:text-page"
          >
            Tüm Ürünler
          </GButton>
        </Reveal>
      </div>
    </section>
  );
}
