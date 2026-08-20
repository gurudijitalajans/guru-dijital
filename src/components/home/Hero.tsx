"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { ArrowDown, TrendingUp, BadgeCheck } from "lucide-react";
import { SplitText } from "@/components/ui/SplitText";
import { GButton } from "@/components/ui/Button";
import { Magnetic } from "@/components/ui/Magnetic";
import { Marquee } from "@/components/ui/Marquee";
import { services } from "@/lib/data";

const EASE = [0.22, 1, 0.36, 1] as const;

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-paper">
      {/* ambient blobs */}
      <div className="grain-blob -left-40 top-24 h-[420px] w-[420px]" aria-hidden />
      <div className="grain-blob -right-52 bottom-10 h-[520px] w-[520px] opacity-30" aria-hidden />

      <div className="container-g flex min-h-[92svh] flex-col justify-center pb-24 pt-32 md:pt-36">
        <div className="grid items-center gap-14 lg:grid-cols-[1.15fr_0.85fr] lg:gap-8">
          {/* copy */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: EASE }}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-ink/10 bg-white/70 px-4 py-2 text-[13px] font-semibold text-ink/80 shadow-card backdrop-blur"
            >
              <BadgeCheck className="size-4 text-guru" strokeWidth={2.4} />
              2025 Google Partner&apos;ı
            </motion.div>

            <h1 className="text-[13.5vw] font-extrabold lowercase leading-[0.98] tracking-[-0.045em] text-ink sm:text-7xl md:text-8xl lg:text-[6.2rem]">
              <SplitText text="unlock the" delay={0.05} />
              <br />
              <SplitText text="*next level*" delay={0.28} />
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.55, ease: EASE }}
              className="mt-6 max-w-xl text-base leading-relaxed text-smoke md:text-lg"
            >
              Guru Dijital; sosyal medyadan performans pazarlamasına, tasarımdan
              web&apos;e markanızı bir üst seviyeye taşıyan entegre dijital çözümler
              üretir. Strateji bizden, sahne markanızın.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.7, ease: EASE }}
              className="mt-9 flex flex-wrap items-center gap-4"
            >
              <Magnetic>
                <GButton href="/iletisim" size="lg" variant="green">
                  Teklif Al
                </GButton>
              </Magnetic>
              <Magnetic>
                <GButton href="/hizmetler" size="lg" variant="outline">
                  Hizmetlerimiz
                </GButton>
              </Magnetic>
            </motion.div>
          </div>

          {/* visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 26 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.35, ease: EASE }}
            className="relative mx-auto hidden w-full max-w-[380px] sm:block lg:max-w-[420px]"
          >
            <div className="animate-float">
              <div className="relative overflow-hidden rounded-[2rem] border border-ink/8 bg-white shadow-soft">
                <Image
                  src="/work/sosyal-medya-telefon.webp"
                  alt="Guru Dijital sosyal medya çalışması — Instagram hesabı telefon görünümü"
                  width={760}
                  height={870}
                  priority
                  sizes="(min-width: 1024px) 420px, (min-width: 640px) 380px, 90vw"
                  className="h-auto w-full object-cover"
                />
              </div>
            </div>

            {/* floating chips */}
            <motion.div
              initial={{ opacity: 0, x: -18 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.9, ease: EASE }}
              className="absolute -left-10 top-10 hidden rounded-2xl border border-ink/8 bg-white/90 px-4 py-3 shadow-card backdrop-blur md:block"
            >
              <div className="flex items-center gap-2.5">
                <span className="grid size-9 place-items-center rounded-xl bg-guru/15 text-guru">
                  <TrendingUp className="size-4.5" strokeWidth={2.4} />
                </span>
                <div>
                  <div className="text-lg font-bold leading-none text-ink">+%350</div>
                  <div className="mt-1 text-[11px] font-medium text-smoke">
                    hasta sayısı artışı*
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 18 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 1.05, ease: EASE }}
              className="absolute -bottom-5 -right-4 rounded-2xl bg-ink px-4 py-3 text-paper shadow-soft md:-right-10"
            >
              <div className="text-[13px] font-semibold leading-tight">
                30+ marka ile
                <br />
                <span className="text-guru">yol arkadaşlığı</span>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* scroll cue */}
        <motion.a
          href="#hizmetler"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.8 }}
          className="group absolute bottom-24 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-smoke md:flex"
          aria-label="Aşağı kaydır"
        >
          keşfet
          <span className="grid size-9 place-items-center rounded-full border border-ink/15 transition-colors group-hover:border-guru group-hover:bg-guru group-hover:text-ink">
            <ArrowDown className="size-4 animate-bounce" strokeWidth={2} />
          </span>
        </motion.a>
      </div>

      {/* keyword marquee band */}
      <div className="border-y border-ink/8 bg-ink py-4 text-paper">
        <Marquee slow>
          {services.map((s) => (
            <span
              key={s.slug}
              className="flex items-center gap-6 pr-6 text-sm font-semibold uppercase tracking-[0.16em] text-paper/80"
            >
              {s.title}
              <span className="text-guru" aria-hidden>
                ✦
              </span>
            </span>
          ))}
        </Marquee>
      </div>
    </section>
  );
}
