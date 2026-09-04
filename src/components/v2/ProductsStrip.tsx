"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/ui/Reveal";
import { GButton } from "@/components/ui/Button";
import { Spotlight } from "@/components/fx/Spotlight";
import { products } from "@/lib/data";

/**
 * Ana sayfa ürün şeridi: ajansın işletmeye yönelik 4 yazılım ürünü.
 * Her kart ürün mockup'ıyla açılır ve kendi ürün sayfasına bağlanır.
 */
export function ProductsStrip() {
  return (
    <section className="relative overflow-hidden border-y border-fg/10 bg-band py-20 md:py-28">
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
              className="border-fg/25 text-fg hover:border-fg hover:bg-fg hover:text-page"
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
                    href={`/urunler/${p.slug}`}
                    data-cursor
                    className="group flex h-full flex-col rounded-2xl border border-fg/10 bg-card p-4 transition-colors duration-300 hover:border-guru/40 sm:p-5"
                  >
                    {/* Mockup önizleme */}
                    <div className="relative overflow-hidden rounded-xl border border-fg/10 bg-band">
                      <Image
                        src={p.image}
                        alt={p.imageAlt}
                        width={1600}
                        height={1100}
                        sizes="(min-width: 1024px) 280px, (min-width: 640px) 50vw, 100vw"
                        className="block h-auto w-full transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                      />
                    </div>

                    <div className="mt-5 flex items-center gap-3">
                      <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-guru/12 text-guru transition-colors duration-300 group-hover:bg-guru group-hover:text-ink">
                        <Icon className="size-5" strokeWidth={2} />
                      </span>
                      <h3 className="text-lg font-bold tracking-tight text-fg">
                        {p.name}
                      </h3>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-fg/55">
                      {p.tagline}
                    </p>
                    <span className="mt-auto inline-flex items-center gap-1.5 pt-5 text-sm font-semibold text-fg/70 transition-colors group-hover:text-guru">
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
            className="w-full border-fg/25 text-fg"
          >
            Ürünleri İncele
          </GButton>
        </Reveal>
      </div>
    </section>
  );
}
