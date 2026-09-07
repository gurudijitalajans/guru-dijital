"use client";

import { useRef } from "react";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { motion, useScroll, useTransform } from "motion/react";
import { cn } from "@/lib/utils";
import { LiquidImage } from "@/components/fx/LiquidImage";
import { VelocityMarquee } from "@/components/fx/VelocityMarquee";
import { usePrefersReducedMotion } from "@/components/fx/usePrefersReducedMotion";
import { TiltCard } from "@/components/ui/TiltCard";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/ui/Reveal";
import type { CropPosition, CroppedImage, LiveSite, Showcase, ShowcaseImage } from "./service-showcase";

/**
 * ServiceSignature: hizmet detayının hero'dan hemen sonra gelen, hizmete
 * özgü "vitrin anı": tek cümlelik manifesto + anahtar kelimeler ve türüne
 * göre telefon akışı / poster duvarı / tarayıcı pencereleri / kare bandı /
 * ödül çifti / video.
 *
 * Hydration güvenliği:
 * - Scroll'a bağlı MotionValue'lar SSR'da ve istemcinin ilk render'ında aynı
 *   başlangıç değerini (progress 0) taşır.
 * - Reduced-motion tercihi useSyncExternalStore ile okunur (SSR anlık
 *   görüntüsü false) → ilk render birebir aynı, gerçek tercih mount sonrası.
 * - Rastgelelik yok; tüm ölçüler yapılandırmadan deterministik türer.
 */

export type ServiceSignatureProps = {
  showcase?: Showcase;
  /** Tek cümlelik giriş (intro[0]'ın ilk cümlesi) */
  manifesto: string;
  keywords: string[];
  /** lg altı kapak görseli; hero aside'ı lg+ ekranlarda aynı görseli gösterir */
  cover?: { src: string; alt: string; sizes: string } | null;
};

const POSITION_CLASS: Record<CropPosition, string> = {
  left: "object-left",
  center: "object-center",
  right: "object-right",
};

/* ------------------------------------------------------------------ */
/*  Manifesto + anahtar kelimeler                                      */
/* ------------------------------------------------------------------ */

function Statement({
  manifesto,
  keywords,
  compact = false,
}: {
  manifesto: string;
  keywords: string[];
  compact?: boolean;
}) {
  return (
    <div className="min-w-0">
      <Reveal>
        <p
          className={cn(
            "max-w-4xl text-2xl font-semibold leading-snug tracking-tight text-fg sm:text-3xl",
            compact ? "lg:text-4xl" : "md:text-4xl"
          )}
        >
          {manifesto}
        </p>
      </Reveal>
      <Reveal delay={0.12}>
        <div className="mt-8 flex flex-wrap gap-2">
          {keywords.map((k) => (
            <span
              key={k}
              className="inline-flex items-center gap-2 rounded-full border border-fg/15 px-3.5 py-1.5 text-xs font-medium text-fg/60"
            >
              <span className="size-1.5 bg-guru" aria-hidden />
              {k}
            </span>
          ))}
        </div>
      </Reveal>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Telefon akışı: gönderi kareleri scroll ile ekranda yukarı kayar    */
/* ------------------------------------------------------------------ */

function PhoneFeed({ items }: { items: CroppedImage[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = usePrefersReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  // Girdi aralığı [0,1] ve artan; akış otomatik değil, yalnız scroll'a bağlı.
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "-52%"]);

  return (
    <div ref={ref} className="relative mx-auto w-[260px] sm:w-[290px]">
      <div
        className="pointer-events-none absolute -inset-8 rounded-full bg-guru/15 blur-3xl"
        aria-hidden
      />
      <div className="relative aspect-[9/19] overflow-hidden rounded-[2.6rem] border-[6px] border-fg/15 bg-card shadow-[0_40px_90px_-40px_rgb(0_0_0/0.55)]">
        <motion.div
          style={{ y: reduce ? 0 : y }}
          className="absolute inset-x-0 top-0 flex flex-col gap-2 p-2 will-change-transform"
        >
          {items.map((item, i) => (
            <div
              key={`${item.src}-${i}`}
              className="relative aspect-[4/5] w-full overflow-hidden rounded-xl bg-band"
            >
              <Image
                src={item.src}
                alt={item.alt}
                fill
                sizes="290px"
                loading={i < 2 ? "eager" : undefined}
                className={cn("object-cover", POSITION_CLASS[item.position ?? "center"])}
              />
            </div>
          ))}
        </motion.div>
        {/* Dynamic island: her temada koyu (cihaz detayı) */}
        <div
          className="absolute left-1/2 top-2.5 h-5 w-20 -translate-x-1/2 rounded-full bg-ink"
          aria-hidden
        />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Poster duvarı: 2/3 sütun, tek indeksliler md'de aşağı basamaklı    */
/* ------------------------------------------------------------------ */

function PosterWall({ items }: { items: CroppedImage[] }) {
  return (
    <div className="container-g">
      <StaggerGroup className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-5 md:pb-10">
        {items.map((item, i) => {
          const contain = item.fit === "contain";
          return (
            <StaggerItem key={`${item.src}-${i}`} className={cn(i % 2 === 1 && "md:translate-y-10")}>
              <TiltCard max={6} className="group rounded-2xl">
                <LiquidImage
                  src={item.src}
                  alt={item.alt}
                  sizes="(min-width: 1216px) 384px, (min-width: 768px) 33vw, 50vw"
                  className={cn(
                    "aspect-[4/5] rounded-2xl border border-fg/10",
                    /* Logo sayfası: görselin kendi açık zemini; her temada sabit paper */
                    contain ? "bg-paper" : "bg-card"
                  )}
                  imgClassName={cn(
                    contain ? "object-contain p-5" : POSITION_CLASS[item.position ?? "center"],
                    "transition-transform duration-700 ease-out group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                  )}
                />
              </TiltCard>
            </StaggerItem>
          );
        })}
      </StaggerGroup>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tarayıcı pencereleri: mockup + içindeki canlı sitelere bağlantı    */
/* ------------------------------------------------------------------ */

function BrowserGrid({ items }: { items: (ShowcaseImage & { sites: LiveSite[] })[] }) {
  return (
    <div className="container-g">
      <StaggerGroup className="grid gap-6 md:grid-cols-2">
        {items.map((item) => (
          /* min-w-0: adres şeridindeki nowrap metin grid hücresini genişletmesin */
          <StaggerItem key={item.src} className="h-full min-w-0">
            <article className="flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-fg/10 bg-card">
              {/* Tarayıcı şeridi: dekoratif; adresler aşağıdaki bağlantılarda tekrar eder */}
              <div className="flex items-center gap-1.5 border-b border-fg/10 px-3.5 py-2.5" aria-hidden>
                <span className="size-2 rounded-full bg-fg/15" />
                <span className="size-2 rounded-full bg-fg/15" />
                <span className="size-2 rounded-full bg-fg/15" />
                <span className="ml-2 min-w-0 truncate rounded-md bg-band px-2.5 py-1 text-xs text-fg/60">
                  {item.sites.map((s) => s.url).join(" · ")}
                </span>
              </div>
              <LiquidImage
                src={item.src}
                alt={item.alt}
                sizes="(min-width: 1216px) 592px, (min-width: 768px) 50vw, 100vw"
                className="aspect-[2/1] bg-band"
              />
              <ul className="flex flex-wrap gap-2 p-3 md:p-4">
                {item.sites.map((site) => (
                  <li key={site.url}>
                    <a
                      href={`https://${site.url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${site.name} web sitesini yeni sekmede aç`}
                      className="group inline-flex min-h-11 items-center gap-1.5 rounded-full border border-fg/15 px-4 text-sm font-medium text-fg/70 transition-colors duration-300 hover:border-guru hover:text-guru-text"
                    >
                      {site.url}
                      <ArrowUpRight
                        className="size-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                        strokeWidth={2.2}
                      />
                    </a>
                  </li>
                ))}
              </ul>
            </article>
          </StaggerItem>
        ))}
      </StaggerGroup>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Kare bandı: gerçek oranlı kareler, tam genişlik, yavaş akış        */
/* ------------------------------------------------------------------ */

const REEL_H_MOBILE = 208; // h-52
const REEL_H_DESKTOP = 288; // md:h-72

function Reel({ items }: { items: ShowcaseImage[] }) {
  return (
    <VelocityMarquee baseVelocity={0.7}>
      <div className="flex items-center gap-4 pr-4 md:gap-6 md:pr-6">
        {items.map((item, i) => {
          const ratio = item.w / item.h;
          return (
            <div
              key={`${item.src}-${i}`}
              className="relative h-52 shrink-0 overflow-hidden rounded-2xl border border-fg/10 bg-card md:h-72"
              style={{ aspectRatio: `${item.w} / ${item.h}` }}
            >
              <Image
                src={item.src}
                alt={item.alt}
                fill
                sizes={`(min-width: 768px) ${Math.round(REEL_H_DESKTOP * ratio)}px, ${Math.round(REEL_H_MOBILE * ratio)}px`}
                loading={i < 3 ? "eager" : undefined}
                className="object-cover"
              />
            </div>
          );
        })}
      </div>
    </VelocityMarquee>
  );
}

/* ------------------------------------------------------------------ */
/*  Ödül/rozet çifti (stat-band): istatistik bandı sayfadan gelir      */
/* ------------------------------------------------------------------ */

function AwardPair({ items }: { items: ShowcaseImage[] }) {
  if (items.length === 0) return null;
  return (
    <div className="container-g">
      <StaggerGroup className="grid gap-5 sm:grid-cols-2 md:gap-6">
        {items.map((item) => (
          <StaggerItem key={item.src}>
            <LiquidImage
              src={item.src}
              alt={item.alt}
              sizes="(min-width: 1216px) 592px, (min-width: 640px) 50vw, 100vw"
              className="rounded-3xl border border-fg/10 bg-card"
              style={{ aspectRatio: `${item.w} / ${item.h}` }}
            />
          </StaggerItem>
        ))}
      </StaggerGroup>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Video: scroll'la 0.92 → 1 büyür; reduced-motion'da kontrollü,      */
/*  autoplay yok                                                       */
/* ------------------------------------------------------------------ */

function VideoFrame({ src, poster, alt }: { src: string; poster: string; alt: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = usePrefersReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "center center"],
  });
  const scale = useTransform(scrollYProgress, [0, 1], [0.92, 1]);
  const borderRadius = useTransform(scrollYProgress, [0, 1], ["2rem", "1rem"]);

  return (
    <div ref={ref} className="container-g">
      <motion.div
        style={reduce ? undefined : { scale, borderRadius }}
        className="overflow-hidden rounded-2xl border border-fg/10 bg-card"
      >
        <video
          autoPlay={!reduce}
          controls={reduce}
          muted
          loop
          playsInline
          poster={poster}
          preload="metadata"
          aria-label={alt}
          className="aspect-video w-full object-cover"
        >
          <source src={src} type="video/mp4" />
        </video>
      </motion.div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tür seçici                                                         */
/* ------------------------------------------------------------------ */

function ShowcaseBody({ showcase }: { showcase: Showcase }) {
  switch (showcase.kind) {
    case "poster-wall":
      return <PosterWall items={showcase.items} />;
    case "browser-grid":
      return <BrowserGrid items={showcase.items} />;
    case "reel":
      return <Reel items={showcase.items} />;
    case "stat-band":
      return <AwardPair items={showcase.items} />;
    case "video":
      return <VideoFrame src={showcase.src} poster={showcase.poster} alt={showcase.alt} />;
    default:
      return null;
  }
}

/* ------------------------------------------------------------------ */
/*  Bileşen                                                            */
/* ------------------------------------------------------------------ */

export function ServiceSignature({ showcase, manifesto, keywords, cover }: ServiceSignatureProps) {
  const split = showcase?.kind === "phone-feed";
  const hasBody =
    !!showcase && !split && (showcase.kind === "video" || showcase.items.length > 0);

  return (
    <section className="overflow-x-clip pb-20 pt-14 md:pb-28 md:pt-20">
      <div className="container-g">
        {cover && (
          <Reveal className="mb-10 lg:hidden">
            <LiquidImage
              src={cover.src}
              alt={cover.alt}
              priority
              sizes={cover.sizes}
              className="aspect-[4/3] rounded-3xl border border-fg/10 bg-card"
            />
          </Reveal>
        )}

        {split ? (
          <div className="grid items-center gap-12 md:grid-cols-[1.1fr_0.9fr] md:gap-16">
            <Statement manifesto={manifesto} keywords={keywords} compact />
            <Reveal delay={0.1}>
              <PhoneFeed items={showcase.items} />
            </Reveal>
          </div>
        ) : (
          <Statement manifesto={manifesto} keywords={keywords} />
        )}
      </div>

      {hasBody && (
        <div className="mt-12 md:mt-16">
          <ShowcaseBody showcase={showcase} />
        </div>
      )}
    </section>
  );
}
