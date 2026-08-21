"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { products, services } from "@/lib/data";
import { TiltCard } from "@/components/ui/TiltCard";
import { LiquidImage } from "@/components/fx/LiquidImage";
import { Spotlight } from "@/components/fx/Spotlight";
import { cn } from "@/lib/utils";

const EASE = [0.22, 1, 0.36, 1] as const;

/** Hizmet slug'ı → hizmet adı eşlemesi (filtre etiketleri için). */
const serviceTitleBySlug = new Map(services.map((s) => [s.slug, s.title]));

/** Ürünlerde gerçekten kullanılan hizmetlerden filtre listesi üret. */
const filters: { slug: string; label: string }[] = [
  { slug: "tumu", label: "Tümü" },
  ...services
    .filter((s) => products.some((p) => p.serviceSlug === s.slug))
    .map((s) => ({ slug: s.slug, label: s.title })),
];

export function ProductGrid() {
  const [active, setActive] = useState("tumu");
  const visible =
    active === "tumu" ? products : products.filter((p) => p.serviceSlug === active);

  return (
    <div>
      {/* Filtre çipleri — aktif çipin yeşil hapı layoutId ile çipler arasında süzülür */}
      <div className="flex flex-wrap gap-2.5" role="group" aria-label="Ürünleri hizmete göre filtrele">
        {filters.map((f) => {
          const isActive = active === f.slug;
          return (
            <button
              key={f.slug}
              type="button"
              onClick={() => setActive(f.slug)}
              aria-pressed={isActive}
              className={cn(
                "relative rounded-full border px-4 py-2 text-sm font-semibold tracking-tight transition-all duration-300 active:scale-[0.97]",
                isActive
                  ? "border-guru text-ink"
                  : "border-paper/15 bg-transparent text-paper/60 hover:border-paper/40 hover:text-paper"
              )}
            >
              {isActive && (
                <motion.span
                  layoutId="product-filter-pill"
                  className="absolute inset-0 rounded-full bg-guru"
                  transition={{ type: "spring", bounce: 0.18, duration: 0.5 }}
                  initial={false}
                  aria-hidden
                />
              )}
              <span className="relative">{f.label}</span>
            </button>
          );
        })}
      </div>

      {/* Grid — keyed by active filter so cards remount with a soft fade */}
      <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {visible.map((p, i) => (
          <motion.div
            key={`${active}-${p.slug}`}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.05, ease: EASE }}
          >
            <TiltCard className="group h-full rounded-3xl">
              <Spotlight className="h-full overflow-hidden rounded-3xl" opacity={0.07}>
                <article className="flex h-full flex-col overflow-hidden rounded-3xl border border-paper/10 bg-carbon transition-colors duration-300 group-hover:border-guru/40">
                  {/* Görsel — hover'da sıvı dalgalanma; alttaki metin linkinin
                      görsel ikizi olduğundan tab sırasından çıkarılır. */}
                  <Link
                    href={`/hizmetler/${p.serviceSlug}`}
                    tabIndex={-1}
                    data-cursor="view"
                    className="relative block"
                  >
                    <LiquidImage
                      src={p.image}
                      alt={p.imageAlt}
                      sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                      className="aspect-[4/3]"
                      priority={i < 3}
                      imgClassName="transition-transform duration-700 ease-out group-hover:scale-[1.05] motion-reduce:transition-none"
                    />
                    <div
                      className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-ink/60 to-transparent"
                      aria-hidden
                    />
                  </Link>
                  <div className="flex flex-1 flex-col p-6 md:p-7">
                    <h3 className="text-lg font-bold tracking-tight text-paper">{p.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-paper/60">{p.desc}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {p.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-paper/10 px-3 py-1 text-xs font-medium text-paper/70"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <Link
                      href={`/hizmetler/${p.serviceSlug}`}
                      className="mt-auto inline-flex items-center gap-1.5 pt-5 text-sm font-semibold text-paper transition-colors hover:text-guru"
                    >
                      İlgili hizmet: {serviceTitleBySlug.get(p.serviceSlug)}
                      <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </Link>
                  </div>
                </article>
              </Spotlight>
            </TiltCard>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
