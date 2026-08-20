"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { ArrowDown } from "lucide-react";
import { DotField } from "@/components/fx/DotField";
import { GButton } from "@/components/ui/Button";
import { Magnetic } from "@/components/ui/Magnetic";
import { site } from "@/lib/data";
import { cn } from "@/lib/utils";

/**
 * HeroV2 — ana sayfanın "Dark Neon Studio" hero deneyimi.
 *
 * Arkada interaktif DotField, önde karakter bazlı maske reveal ile açılan
 * dev display tipografi. Scroll'da içerik yukarı kayıp fade olur (parallax),
 * DotField sabit kalır. Reduced-motion'da tüm hareketler kapanır.
 */

const EASE = [0.22, 1, 0.36, 1] as const;

/** Karakter bazlı maskeli reveal — mount'ta oynar (whileInView değil). */
function CharReveal({
  text,
  className,
  delay = 0,
  stagger = 0.045,
}: {
  text: string;
  className?: string;
  delay?: number;
  stagger?: number;
}) {
  const reduce = useReducedMotion();
  const chars = Array.from(text);

  return (
    <span className={cn("block whitespace-nowrap", className)} aria-label={text}>
      {chars.map((ch, i) => (
        <span
          key={i}
          aria-hidden
          className="inline-block overflow-hidden align-top pb-[0.1em] -mb-[0.1em]"
        >
          <motion.span
            className="inline-block will-change-transform"
            initial={{ y: reduce ? 0 : "112%" }}
            animate={{ y: 0 }}
            transition={{ duration: 0.8, delay: delay + i * stagger, ease: EASE }}
          >
            {ch === " " ? "\u00A0" : ch}
          </motion.span>
        </span>
      ))}
    </span>
  );
}

export function HeroV2() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const reduce = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const contentY = useTransform(scrollYProgress, [0, 1], [0, -160]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.65], [1, 0]);

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-[100svh] flex-col overflow-hidden bg-coal text-paper"
    >
      {/* ---- arka plan: interaktif nokta alanı + neon glow ---- */}
      <div className="absolute inset-0" aria-hidden>
        <DotField className="absolute inset-0 h-full w-full" />
        <div className="grain-blob left-[-14%] top-[-12%] h-64 w-64 md:h-[26rem] md:w-[26rem]" />
        <div className="grain-blob bottom-[-16%] right-[-10%] h-56 w-56 opacity-25 md:h-96 md:w-96" />
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-b from-transparent to-ink/60" />
      </div>

      {/* ---- içerik (scroll parallax ile kayar, DotField sabit kalır) ---- */}
      <motion.div
        style={reduce ? undefined : { y: contentY, opacity: contentOpacity }}
        className="container-g relative z-10 flex flex-1 flex-col justify-center pb-28 pt-32 md:pb-32 md:pt-36"
      >
        {/* rozet */}
        <motion.p
          initial={{ opacity: 0, y: reduce ? 0 : 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.05, ease: EASE }}
          className="flex flex-wrap items-center gap-2.5 text-xs font-medium tracking-wide text-mist/70 md:text-sm"
        >
          <span className="relative flex size-2 shrink-0" aria-hidden>
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-guru opacity-60 motion-reduce:animate-none" />
            <span className="relative inline-flex size-2 rounded-full bg-guru shadow-[0_0_12px_rgb(16_216_108/0.8)]" />
          </span>
          {"2025 Google Partner'ı · Google Ads Impact Awards adayı"}
        </motion.p>

        {/* dev display başlık */}
        <h1 className="mt-6 font-extrabold lowercase leading-[0.95] tracking-[-0.04em]">
          <CharReveal
            text="unlock the"
            delay={0.12}
            className="headline-outline-light text-[clamp(3rem,15vw,9rem)]"
          />
          <CharReveal
            text="next level"
            delay={0.44}
            className="text-guru text-[clamp(3rem,15vw,9rem)] drop-shadow-[0_0_28px_rgb(16_216_108/0.35)]"
          />
        </h1>

        {/* değer cümlesi */}
        <motion.p
          initial={{ opacity: 0, y: reduce ? 0 : 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.95, ease: EASE }}
          className="mt-6 max-w-xl text-[15px] leading-relaxed text-mist/75 md:mt-8 md:text-lg"
        >
          {
            "Sosyal medyadan performans pazarlamasına, tasarımdan web'e — markanızı bir üst seviyeye taşıyan entegre dijital çözümler üretiyoruz."
          }
        </motion.p>

        {/* aksiyonlar */}
        <motion.div
          initial={{ opacity: 0, y: reduce ? 0 : 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 1.1, ease: EASE }}
          className="mt-9 flex flex-wrap items-center gap-4 md:mt-10"
        >
          <Magnetic>
            <GButton
              href="/iletisim"
              variant="green"
              size="lg"
              className="shadow-[0_0_36px_-6px_rgb(16_216_108/0.55)] hover:bg-paper hover:text-ink"
            >
              Teklif Al
            </GButton>
          </Magnetic>
          <Magnetic>
            <GButton
              href="/hizmetler"
              variant="outline"
              size="lg"
              className="border-paper/25 text-paper hover:border-paper hover:bg-paper hover:text-ink"
            >
              Hizmetlerimiz
            </GButton>
          </Magnetic>
        </motion.div>
      </motion.div>

      {/* ---- sol altta dikey instagram etiketi ---- */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 1.4, ease: EASE }}
        className="absolute bottom-8 left-5 z-10 hidden flex-col items-center gap-3 md:flex lg:left-8"
      >
        <a
          href={site.instagram}
          target="_blank"
          rel="noopener noreferrer"
          className="rotate-180 text-[11px] font-medium tracking-[0.28em] text-smoke transition-colors duration-300 [writing-mode:vertical-rl] hover:text-guru"
        >
          @gurudijital
        </a>
        <span
          className="h-12 w-px bg-gradient-to-b from-smoke/50 to-transparent"
          aria-hidden
        />
      </motion.div>

      {/* ---- sağ altta scroll ipucu ---- */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 1.4, ease: EASE }}
        className="absolute bottom-8 right-5 z-10 flex items-center gap-2.5 md:right-8"
        aria-hidden
      >
        <span className="text-[11px] font-medium uppercase tracking-[0.28em] text-smoke">
          kaydır
        </span>
        <motion.span
          animate={reduce ? undefined : { y: [0, 6, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          className="text-guru"
        >
          <ArrowDown className="size-4" strokeWidth={2.2} />
        </motion.span>
      </motion.div>
    </section>
  );
}
