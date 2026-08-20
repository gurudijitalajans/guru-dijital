"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { StaggerGroup, StaggerItem, Reveal } from "@/components/ui/Reveal";
import { GButton } from "@/components/ui/Button";
import { services } from "@/lib/data";
import { cn } from "@/lib/utils";

/** bento layout: which cards span 2 columns and carry an image */
const WIDE: Record<string, string | undefined> = {
  "sosyal-medya-yonetimi": "/work/instagram-postlar.webp",
  "web-tasarim": "/work/web-siteleri.webp",
};

export function ServicesBento() {
  return (
    <section id="hizmetler" className="scroll-mt-24 bg-paper py-20 md:py-28">
      <div className="container-g">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading
            eyebrow="Neler Yapıyoruz"
            title="Tek merkezden *entegre* dijital çözümler"
            sub="Altı uzmanlık alanı, tek strateji: markanızın ihtiyacına göre kurgulanan uçtan uca dijital iletişim."
          />
          <Reveal delay={0.15} className="hidden md:block">
            <GButton href="/hizmetler" variant="outline">
              Tüm Hizmetler
            </GButton>
          </Reveal>
        </div>

        <StaggerGroup className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3" stagger={0.07}>
          {services.map((s) => {
            const wideImg = WIDE[s.slug];
            const Icon = s.icon;
            return (
              <StaggerItem key={s.slug} className={cn(wideImg && "sm:col-span-2")}>
                <Link
                  href={`/hizmetler/${s.slug}`}
                  className={cn(
                    "group relative flex h-full min-h-[240px] flex-col justify-between overflow-hidden rounded-3xl border border-ink/8 bg-white p-7 shadow-card transition-all duration-500 hover:-translate-y-1 hover:border-guru/40 hover:shadow-soft",
                    wideImg && "md:flex-row md:items-stretch md:gap-8"
                  )}
                >
                  <div className={cn("relative z-10 flex flex-col", wideImg && "md:max-w-[55%]")}>
                    <div className="flex items-center justify-between gap-4">
                      <span className="grid size-12 place-items-center rounded-2xl bg-guru/12 text-guru transition-colors duration-300 group-hover:bg-guru group-hover:text-ink">
                        <Icon className="size-6" strokeWidth={2} />
                      </span>
                      <span className="text-sm font-bold tracking-widest text-ink/20">
                        {s.no}
                      </span>
                    </div>
                    <h3 className="mt-6 text-xl font-bold tracking-tight text-ink md:text-2xl">
                      {s.title}
                    </h3>
                    <p className="mt-2.5 text-sm leading-relaxed text-smoke md:text-[15px]">
                      {s.short}
                    </p>
                    <div className="mt-auto flex flex-wrap gap-2 pt-6">
                      {s.keywords.slice(0, 3).map((k) => (
                        <span
                          key={k}
                          className="rounded-full border border-ink/10 px-3 py-1 text-[11px] font-medium text-smoke"
                        >
                          {k}
                        </span>
                      ))}
                      <span className="ml-auto grid size-8 place-items-center rounded-full border border-ink/10 text-ink transition-all duration-300 group-hover:border-guru group-hover:bg-guru">
                        <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                      </span>
                    </div>
                  </div>

                  {wideImg && (
                    <div className="relative mt-6 hidden overflow-hidden rounded-2xl md:mt-0 md:block md:w-[45%]">
                      <Image
                        src={wideImg}
                        alt={`${s.title} çalışmalarından örnek`}
                        fill
                        sizes="(min-width: 768px) 360px, 0px"
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>
                  )}
                </Link>
              </StaggerItem>
            );
          })}
        </StaggerGroup>

        <Reveal className="mt-8 md:hidden">
          <GButton href="/hizmetler" variant="outline" className="w-full">
            Tüm Hizmetler
          </GButton>
        </Reveal>
      </div>
    </section>
  );
}
