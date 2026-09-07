"use client";

import { useRef, useSyncExternalStore } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { ArrowDown } from "lucide-react";
import { DotField } from "@/components/fx/DotField";
import { AuroraCanvas } from "@/components/fx/AuroraCanvas";
import { Sparkles } from "@/components/fx/Sparkles";
import { ShimmerText } from "@/components/fx/ShimmerText";
import { Scramble } from "@/components/fx/Scramble";
import { usePrefersReducedMotion } from "@/components/fx/usePrefersReducedMotion";
import { GButton } from "@/components/ui/Button";
import { Magnetic } from "@/components/ui/Magnetic";
import { HeroCollage } from "@/components/v2/HeroCollage";
import { products, references, services, site } from "@/lib/data";
import { cn } from "@/lib/utils";

/**
 * HeroV2: ana sayfanın "Dark Neon Studio" hero deneyimi.
 *
 * Arkada interaktif DotField, önde karakter bazlı maske reveal ile açılan
 * dev display tipografi; lg+'da sağ sütunda yüzen iş kolajı. Scroll'da içerik
 * yukarı kayıp fade olur (parallax), DotField sabit kalır.
 *
 * Hydration: initial değerleri sabittir (dallanma yok); transform
 * animasyonlarını layout'taki MotionConfig reducedMotion="user" atlar.
 * Scroll'a bağlı style ve sonsuz döngüler usePrefersReducedMotion ile
 * (SSR anlık görüntüsü false) kapatılır. Dokunmatik cihazlarda giriş
 * gecikmeleri kısalır: pointer:coarse useSyncExternalStore ile okunur,
 * animasyonlu bloklar key ile yeniden başlatılır (ilk kare zaten gizli).
 */

const EASE = [0.22, 1, 0.36, 1] as const;
const H1_TEXT = "Markanızı bir üst seviyeye taşıyoruz";

/* pointer:coarse izleyici, hydration güvenli (sunucu anlık görüntüsü false). */
const COARSE_QUERY = "(pointer: coarse)";
function subscribeCoarse(onChange: () => void) {
  const mq = window.matchMedia(COARSE_QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}
function useCoarsePointer(): boolean {
  return useSyncExternalStore(
    subscribeCoarse,
    () => window.matchMedia(COARSE_QUERY).matches,
    () => false
  );
}

/** Karakter bazlı maskeli reveal: mount'ta oynar (whileInView değil). */
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
  const chars = Array.from(text);

  return (
    <span className={cn("block whitespace-nowrap", className)} aria-hidden>
      {chars.map((ch, i) => (
        <span
          key={i}
          className="inline-block overflow-hidden align-top pb-[0.1em] -mb-[0.1em]"
        >
          <motion.span
            className="inline-block will-change-transform"
            initial={{ y: "112%" }}
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
  const reduce = usePrefersReducedMotion();
  const coarse = useCoarsePointer();

  /* Dokunmatikte kısa gecikmeler: CTA ilk ziyarette ~1,4 sn'de dokunulabilir. */
  const t = coarse
    ? { stagger: 0.025, line2: 0.3, sub: 0.5, cta: 0.6, motto: 0.9 }
    : { stagger: 0.045, line2: 0.44, sub: 0.95, cta: 1.1, motto: 1.35 };
  /* key değişince animasyonlu bloklar yeni gecikmelerle yeniden başlar */
  const motionKey = coarse ? "coarse" : "fine";

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const contentY = useTransform(scrollYProgress, [0, 1], [0, -160]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.65], [1, 0]);

  const proofChips = [
    `${references.length} marka`,
    `${services.length} disiplin`,
    `${products.length} ürün`,
  ];

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-[100svh] flex-col overflow-hidden bg-page text-fg"
    >
      {/* ---- arka plan: WebGL aurora + interaktif nokta alanı ---- */}
      <div className="absolute inset-0" aria-hidden>
        <AuroraCanvas className="fx-aurora absolute inset-0 h-full w-full" intensity={0.7} />
        <DotField className="fx-dots absolute inset-0 h-full w-full opacity-60" />
        <div className="grain-blob left-[-14%] top-[-12%] h-64 w-64 md:h-[26rem] md:w-[26rem]" />
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-b from-transparent to-band/60" />
      </div>

      {/* ---- içerik (scroll parallax ile kayar, DotField sabit kalır) ----
          Mobil: başparmak düzeni (içerik alta yaslı); lg+: metin + kolaj ızgarası */}
      <motion.div
        style={reduce ? undefined : { y: contentY, opacity: contentOpacity }}
        className="container-g relative z-10 flex flex-1 flex-col justify-end pb-24 pt-32 md:justify-center md:pb-32 md:pt-36 lg:grid lg:grid-cols-[1.25fr_0.75fr] lg:items-center lg:gap-10 lg:pb-24 lg:pt-32"
      >
        <div className="min-w-0">
          {/* mobil kanıt çipleri */}
          <motion.ul
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05, ease: EASE }}
            className="mb-6 flex flex-wrap gap-2 md:hidden"
            aria-label="Rakamlarla Guru"
          >
            {proofChips.map((chip) => (
              <li
                key={chip}
                className="rounded-full border border-fg/15 px-3 py-1 text-xs font-medium text-fg/70"
              >
                {chip}
              </li>
            ))}
          </motion.ul>

          {/* rozet */}
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.05, ease: EASE }}
            className="flex flex-wrap items-center gap-2.5 text-[13px] font-medium tracking-wide text-fg/70 md:text-sm"
          >
            <span className="relative flex size-2 shrink-0" aria-hidden>
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-guru opacity-60 motion-reduce:animate-none" />
              <span className="relative inline-flex size-2 rounded-full bg-guru shadow-[0_0_12px_rgb(16_216_108/0.8)]" />
            </span>
            {/* Mobilde kısa statik metin: scramble'ın rastgele karakter
               genişlikleri dar ekranda satır-kırılım zıplaması yapıyordu */}
            <span className="sm:hidden">2025 Google Partner&apos;ı</span>
            <span className="hidden sm:inline">
              <Scramble
                text="2025 Google Partner'ı · Google Ads Impact Awards adayı"
                delay={0.4}
                duration={1.1}
              />
            </span>
          </motion.p>

          {/* dev display başlık: erişilebilir ad h1'de, karakterler dekoratif */}
          <h1
            aria-label={H1_TEXT}
            className="relative mt-6 w-fit font-extrabold leading-[0.95] tracking-[-0.04em]"
          >
            <Sparkles className="absolute -inset-x-10 -inset-y-8" density={coarse ? 5 : 12} />
            <CharReveal
              key={`l1-${motionKey}`}
              text="Markanızı bir üst"
              delay={0.12}
              stagger={t.stagger}
              className="text-fg text-[clamp(1.8rem,8.4vw,6.8rem)] lg:text-[clamp(2.5rem,5.7vw,4.9rem)]"
            />
            <ShimmerText interval={5}>
              <CharReveal
                key={`l2-${motionKey}`}
                text="seviyeye taşıyoruz"
                delay={t.line2}
                stagger={t.stagger}
                className="text-guru-text text-[clamp(1.8rem,8.4vw,6.8rem)] lg:text-[clamp(2.5rem,5.7vw,4.9rem)] drop-shadow-[0_0_22px_rgb(16_216_108/0.28)]"
              />
            </ShimmerText>
          </h1>

          {/* değer cümlesi */}
          <motion.p
            key={`sub-${motionKey}`}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: t.sub, ease: EASE }}
            className="mt-6 max-w-xl text-[15px] leading-relaxed text-fg/75 md:mt-8 md:text-lg"
          >
            {"Markanız için ajans hizmetleri, işletmeniz için yazılım ürünleri."}
          </motion.p>

          {/* aksiyonlar */}
          <motion.div
            key={`cta-${motionKey}`}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: t.cta, ease: EASE }}
            className="mt-9 flex flex-wrap items-center gap-4 md:mt-10"
          >
            <Magnetic>
              <GButton
                href="/iletisim"
                variant="green"
                size="lg"
                className="shadow-[0_0_36px_-6px_rgb(16_216_108/0.4)] hover:bg-fg hover:text-page"
              >
                Teklif Al
              </GButton>
            </Magnetic>
            <Magnetic>
              <GButton
                href="/hizmetler"
                variant="outline"
                size="lg"
                className="border-fg/25 text-fg hover:border-fg hover:bg-fg hover:text-page"
              >
                Hizmetleri İncele
              </GButton>
            </Magnetic>
          </motion.div>

          {/* motto: bilinçli olarak küçük ve sakin; footer'da zaten okunuyor */}
          <motion.p
            key={`motto-${motionKey}`}
            aria-hidden
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: t.motto, ease: EASE }}
            className="mt-10 text-[11px] font-semibold uppercase tracking-[0.34em] text-fg/35"
          >
            Unlock the next level
          </motion.p>
        </div>

        {/* ---- sağ sütun: yüzen iş kolajı + dönen rozet (lg+) ---- */}
        <HeroCollage className="hidden lg:block" />
      </motion.div>

      {/* ---- sol altta dikey instagram etiketi ---- */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 1.4, ease: EASE }}
        className="absolute bottom-8 left-2 z-10 hidden flex-col items-center gap-3 md:flex lg:left-5"
      >
        <a
          href={site.instagram}
          target="_blank"
          rel="noopener noreferrer"
          className="rotate-180 px-3 py-2 text-[11px] font-medium tracking-[0.28em] text-smoke transition-colors duration-300 [writing-mode:vertical-rl] hover:text-guru"
        >
          @gurudijital
        </a>
      </motion.div>

      {/* ---- sağ altta scroll ipucu: gerçek bağlantı ---- */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 1.4, ease: EASE }}
        className="absolute bottom-6 right-3 z-10 md:right-6"
      >
        <a
          href="#hizmetler"
          aria-label="Hizmetlere kaydır"
          className="flex min-h-11 items-center gap-2.5 px-2 text-[11px] font-medium uppercase tracking-[0.28em] text-smoke transition-colors duration-300 hover:text-guru"
        >
          Kaydır
          <motion.span
            animate={reduce ? undefined : { y: [0, 6, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            className="text-guru"
            aria-hidden
          >
            <ArrowDown className="size-4" strokeWidth={2.2} />
          </motion.span>
        </a>
      </motion.div>
    </section>
  );
}
