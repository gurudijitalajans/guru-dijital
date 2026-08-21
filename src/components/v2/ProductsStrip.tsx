"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/ui/Reveal";
import { GButton } from "@/components/ui/Button";
import { Spotlight } from "@/components/fx/Spotlight";
import { products } from "@/lib/data";

/**
 * Ana sayfa ürün şeridi: ajansın işletmeye yönelik 4 yazılım ürünü.
 * Kompakt kartlar; detay sayfası /urunler.
 */
export function ProductsStrip() {
  return (
    <section className="relative overflow-hidden border-y border-paper/10 bg-ink py-20 md:py-28">
      <div className="grain-blob right-[-8%] top-[-30%] h-72 w-72 opacity-20" aria-hidden />

      <div className="container-g">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading
            dark
            eyebrow="Ürünlerimiz"
            title="İşletmeler için *yazılım* da üretiyoruz"
            sub="Ajans hizmetlerimizin yanında; işletmenizi büyüten dört ürün."
          />
          <Reveal delay={0.15} className="hidden md:block">
            <GButton
              href="/urunler"
              variant="outline"
              className="border-paper/25 text-paper hover:border-paper hover:bg-paper hover:text-ink"
            >
              Ürünleri İncele
            </GButton>
          </Reveal>
        </div>

        <StaggerGroup className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4" stagger={0.07}>
          {products.map((p) => {
            const Icon = p.icon;
            return (
              <StaggerItem key={p.slug} className="h-full">
                <Spotlight className="h-full overflow-hidden rounded-2xl" opacity={0.08}>
                  <Link
                    href="/urunler"
                    data-cursor
                    className="group flex h-full flex-col rounded-2xl border border-paper/10 bg-carbon p-6 transition-colors duration-300 hover:border-guru/40"
                  >
                    <div className="flex items-center justify-between">
                      <span className="grid size-12 place-items-center rounded-xl bg-guru/12 text-guru transition-colors duration-300 group-hover:bg-guru group-hover:text-ink">
                        <Icon className="size-6" strokeWidth={2} />
                      </span>
                      {p.comingSoon && (
                        <span className="rounded-full border border-guru/40 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-guru">
                          Yakında
                        </span>
                      )}
                    </div>
                    <h3 className="mt-5 text-lg font-bold tracking-tight text-paper">
                      {p.name}
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-paper/55">
                      {p.tagline}
                    </p>
                    <span className="mt-auto inline-flex items-center gap-1.5 pt-5 text-sm font-semibold text-paper/70 transition-colors group-hover:text-guru">
                      İncele
                      <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </span>
                  </Link>
                </Spotlight>
              </StaggerItem>
            );
          })}
        </StaggerGroup>

        <Reveal className="mt-8 md:hidden">
          <GButton
            href="/urunler"
            variant="outline"
            className="w-full border-paper/25 text-paper"
          >
            Ürünleri İncele
          </GButton>
        </Reveal>
      </div>
    </section>
  );
}
