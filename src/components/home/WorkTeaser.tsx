"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/ui/Reveal";
import { GButton } from "@/components/ui/Button";
import { TiltCard } from "@/components/ui/TiltCard";
import { products } from "@/lib/data";

const FEATURED = [
  "ambalaj-etiket",
  "sosyal-medya-icerikleri",
  "web-siteleri",
] as const;

export function WorkTeaser() {
  const items = FEATURED.map((slug) => products.find((p) => p.slug === slug)!).filter(
    Boolean
  );

  return (
    <section className="bg-paper py-20 md:py-28">
      <div className="container-g">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading
            eyebrow="Ürünlerimiz"
            title="Somut işler, *görünür* sonuçlar"
            sub="Logodan ambalaja, kataloğdan web sitesine — hizmetlerimizin rafta ve ekranda duran çıktıları."
          />
          <Reveal delay={0.15} className="hidden md:block">
            <GButton href="/urunler" variant="outline">
              Tüm Ürünler
            </GButton>
          </Reveal>
        </div>

        <StaggerGroup className="mt-12 grid gap-5 md:grid-cols-3" stagger={0.09}>
          {items.map((p) => (
            <StaggerItem key={p.slug}>
              <TiltCard className="h-full">
                <Link
                  href="/urunler"
                  className="group block h-full overflow-hidden rounded-3xl border border-ink/8 bg-white shadow-card transition-shadow duration-500 hover:shadow-soft"
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Image
                      src={p.image}
                      alt={p.imageAlt}
                      fill
                      sizes="(min-width: 768px) 33vw, 100vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink/40 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                  </div>
                  <div className="flex items-center justify-between gap-4 p-6">
                    <div>
                      <h3 className="text-base font-bold tracking-tight text-ink md:text-lg">
                        {p.title}
                      </h3>
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {p.tags.slice(0, 2).map((t) => (
                          <span key={t} className="text-xs font-medium text-smoke">
                            #{t}
                          </span>
                        ))}
                      </div>
                    </div>
                    <span className="grid size-9 shrink-0 place-items-center rounded-full border border-ink/10 transition-all duration-300 group-hover:border-guru group-hover:bg-guru">
                      <ArrowUpRight className="size-4" />
                    </span>
                  </div>
                </Link>
              </TiltCard>
            </StaggerItem>
          ))}
        </StaggerGroup>

        <Reveal className="mt-8 md:hidden">
          <GButton href="/urunler" variant="outline" className="w-full">
            Tüm Ürünler
          </GButton>
        </Reveal>
      </div>
    </section>
  );
}
