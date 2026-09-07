"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from "motion/react";
import { VelocityMarquee } from "@/components/fx/VelocityMarquee";
import { cn } from "@/lib/utils";

/**
 * Showreel: tam genişlik "işlerden kareler" bandı.
 *
 * - İki sıra kesintisiz görsel şeridi: üst sıra sola, alt sıra sağa akar
 *   (VelocityMarquee scroll hızıyla akışı zaten hızlandırır).
 * - Ek katman: scroll velocity'ye bağlı hafif skewX (±4deg clamp); kendi
 *   useScroll + useVelocity + useSpring zinciriyle, fonksiyon formunda
 *   useTransform (aralık/offset kuralı riski yok).
 * - Ortada bandın üstüne binen dev outline yazı, kendi yavaş CSS marquee'siyle
 *   ters yönde (sağa) akar; IntersectionObserver ile ekran dışında durdurulur.
 *   Gece: mix-blend-difference (açık stroke zemini tersler). Gündüz: blend yok,
 *   koyu fg stroke (difference açık zeminde yazıyı görünmez kılıyordu).
 * - Reduced-motion: tek statik grid satırı + statik başlık (zarif fallback).
 *
 * Hydration güvenliği: reduced/inView state'leri false başlar, matchMedia ve
 * IO yalnız useEffect'te okunur → SSR ile ilk istemci render'ı birebir aynı.
 */

type Frame = {
  src: string;
  alt: string;
  /** Gerçek piksel boyutları; aspect-ratio bunlardan türetilir (CLS yok). */
  w: number;
  h: number;
};

/* Üst sıra: sola akar */
const ROW_TOP: Frame[] = [
  { src: "/work/sosyal-medya-telefon.webp", alt: "Telefonda Guru Dijital Instagram hesabı", w: 1600, h: 2559 },
  { src: "/work/ambalaj-etiket.webp", alt: "Ambalaj ve etiket tasarımları", w: 1600, h: 806 },
  { src: "/work/kurumsal-kimlik.webp", alt: "Kurumsal kimlik mockup seti", w: 1600, h: 2530 },
  { src: "/work/web-siteleri.webp", alt: "Yayında olan web siteleri", w: 1600, h: 758 },
  { src: "/work/instagram-postlar.webp", alt: "Instagram gönderi tasarımları", w: 1600, h: 471 },
  { src: "/work/katalog-brosur.webp", alt: "Katalog ve broşür tasarımları", w: 1600, h: 829 },
  { src: "/tiles/aurora-genis.webp", alt: "Guru aurora deseni", w: 1600, h: 1200 },
];

/* Alt sıra: sağa akar */
const ROW_BOTTOM: Frame[] = [
  { src: "/work/web-mockup-dark.webp", alt: "Koyu temalı web arayüzü laptop mockup", w: 1600, h: 1396 },
  { src: "/work/ambalaj-kavanoz.webp", alt: "Kavanoz ambalaj tasarımı", w: 1600, h: 1131 },
  { src: "/work/logo-tasarimlari.webp", alt: "Logo tasarım koleksiyonu", w: 1600, h: 620 },
  { src: "/work/dijital-pazarlama.webp", alt: "Dijital pazarlama kreatif kolaj", w: 1600, h: 1605 },
  { src: "/work/ambalaj-aycekirdek.webp", alt: "Ay çekirdeği ambalaj tasarımı", w: 1600, h: 1131 },
  { src: "/work/sosyal-icerik-cita.webp", alt: "Çita temalı kreatif içerik", w: 1600, h: 1131 },
  { src: "/tiles/marka.webp", alt: "Guru marka deseni", w: 1600, h: 1200 },
];

/* Reduced-motion fallback: tek statik satır */
const STATIC_ROW: Frame[] = [ROW_TOP[0], ROW_TOP[1], ROW_TOP[3], ROW_BOTTOM[0]];

/* Bölüme gelindiğinde görünür ilk kareler lazy beklemesin: her sıranın ilk
   EAGER_FRAMES karesi eager (marquee kopyaları aynı URL'i paylaşır, tarayıcı
   tekilleştirir → sıra başına 4 ek indirme). */
const EAGER_FRAMES = 4;
/* Marquee kopya sayısı: 3 kopya en geniş ekranda da sarmaya yeter (4 → 3,
   sıra başına 7 daha az <img>). */
const MARQUEE_COPIES = 3;

const TICKER_TEXT = "Showreel ✦ Guru Dijital";

/* ------------------------------------------------------------------ */
/*  Görsel şeridi (bir marquee kopyasının içeriği)                     */
/* ------------------------------------------------------------------ */

function FrameStrip({ frames }: { frames: Frame[] }) {
  return (
    <div className="flex items-center gap-4 pr-4 md:gap-6 md:pr-6">
      {frames.map((f, i) => (
        /* Kutu zemini bant tonunda (bg-band/60): görsel gelene kadar gündüzde
           beyaz delik yerine yumuşak koyu tint akar */
        <div
          key={f.src}
          className="relative h-40 shrink-0 overflow-hidden rounded-xl border border-fg/10 bg-band/60 md:h-56"
          style={{ aspectRatio: `${f.w} / ${f.h}` }}
        >
          <Image
            src={f.src}
            alt={f.alt}
            fill
            loading={i < EAGER_FRAMES ? "eager" : "lazy"}
            /* Genişlik = satır yüksekliği × oran (mobil 160px, md 224px);
               deterministik, SSR güvenli */
            sizes={`(min-width: 768px) ${Math.round(224 * (f.w / f.h))}px, ${Math.round(160 * (f.w / f.h))}px`}
            className="object-cover"
          />
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Bandın üstüne binen dev outline yazı (ters yönde yavaş akış)       */
/* ------------------------------------------------------------------ */

function OutlineTicker({ playState }: { playState: "running" | "paused" }) {
  return (
    <div className="marquee marquee-slow w-full" aria-hidden>
      {/* animationDirection: reverse → görsel sıraların tersine (sağa) akar */}
      <div
        className="marquee-track items-center"
        style={{ animationDirection: "reverse", animationPlayState: playState }}
      >
        {[0, 1].map((copy) => (
          <div key={copy} className="flex shrink-0 items-center">
            {Array.from({ length: 3 }, (_, i) => (
              /* Gece: sabit açık (paper) stroke, sarmalayıcıdaki difference
                 blend ile zemini tersler. Gündüz: blend yok, koyu fg stroke
                 (%45) görselin üstünde okunur bir kontur verir. ✦ da aynı
                 konturu miras alır (dolgu yeşil olsaydı difference katmanında
                 magentaya dönüyordu). */
              <span
                key={i}
                className="whitespace-nowrap px-8 text-[15vw] font-extrabold uppercase leading-none tracking-tight text-transparent [-webkit-text-stroke:1.5px_color-mix(in_oklab,var(--color-paper)_34%,transparent)] md:text-[10vw] [html.light_&]:[-webkit-text-stroke:1.5px_color-mix(in_oklab,var(--color-fg)_45%,transparent)]"
              >
                {TICKER_TEXT}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Bölüm                                                              */
/* ------------------------------------------------------------------ */

export function Showreel() {
  const sectionRef = useRef<HTMLElement>(null);

  /* Hydration güvenli varsayılanlar: her ikisi de false başlar */
  const [reduced, setReduced] = useState(false);
  const [inView, setInView] = useState(false);

  /* Reduced-motion tercihi yalnız mount sonrası okunur */
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  /* Ekran dışındayken outline yazı animasyonu duraklatılır */
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin: "120px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  /* Scroll velocity → hafif skewX (±4deg clamp). Fonksiyon formunda
     useTransform kullanılır; scroll-progress offset aralığı söz konusu değil. */
  const { scrollY } = useScroll();
  const velocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(velocity, {
    damping: 55,
    stiffness: 320,
    mass: 0.6,
  });
  const skewX = useTransform(smoothVelocity, (v) =>
    `${Math.max(-4, Math.min(4, v / 350)).toFixed(2)}deg`
  );

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-band py-16 md:py-24"
      aria-label="Showreel: İşlerimizden kareler"
    >
      <h2 className="sr-only">Showreel: İşlerimizden kareler</h2>

      {reduced ? (
        /* ---- Reduced-motion: statik başlık + tek grid satırı ---- */
        <div className="container-g">
          <p
            className="headline-outline-light text-[13vw] font-extrabold uppercase leading-none tracking-tight md:text-[8vw]"
            aria-hidden
          >
            {TICKER_TEXT}
          </p>
          <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
            {STATIC_ROW.map((f) => (
              <div
                key={f.src}
                className="relative aspect-[4/3] overflow-hidden rounded-xl border border-fg/10 bg-band/60"
              >
                <Image
                  src={f.src}
                  alt={f.alt}
                  fill
                  sizes="(min-width: 768px) 25vw, 50vw"
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* ---- Tam deneyim: çift yönlü marquee + skew + binen yazı ---- */
        <div className="relative">
          <motion.div
            style={{ skewX }}
            className={cn(
              "flex flex-col gap-4 will-change-transform md:gap-6",
              "[mask-image:linear-gradient(to_right,transparent,black_5%,black_95%,transparent)]",
              "[-webkit-mask-image:linear-gradient(to_right,transparent,black_5%,black_95%,transparent)]"
            )}
          >
            <VelocityMarquee baseVelocity={-0.8} copies={MARQUEE_COPIES}>
              <FrameStrip frames={ROW_TOP} />
            </VelocityMarquee>
            <VelocityMarquee baseVelocity={0.8} copies={MARQUEE_COPIES}>
              <FrameStrip frames={ROW_BOTTOM} />
            </VelocityMarquee>
          </motion.div>

          {/* Bandın üstüne binen dev outline yazı: difference blend yalnız gecede */}
          <div className="pointer-events-none absolute inset-0 z-10 flex select-none items-center [html:not(.light)_&]:mix-blend-difference">
            <OutlineTicker playState={inView ? "running" : "paused"} />
          </div>
        </div>
      )}
    </section>
  );
}
