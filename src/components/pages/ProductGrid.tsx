"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { products, services } from "@/lib/data";
import { TiltCard } from "@/components/ui/TiltCard";
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
      {/* Filtre çipleri */}
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
                "rounded-full border px-4 py-2 text-sm font-semibold tracking-tight transition-all duration-300 active:scale-[0.97]",
                isActive
                  ? "border-ink bg-ink text-paper"
                  : "border-ink/10 bg-white text-smoke hover:border-ink/30 hover:text-ink"
              )}
            >
              {f.label}
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
                <article className="flex h-full flex-col overflow-hidden rounded-3xl border border-ink/8 bg-white shadow-card">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Image
                      src={p.image}
                      alt={p.imageAlt}
                      fill
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
                      sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                    />
                  </div>
                  <div className="flex flex-1 flex-col p-6 md:p-7">
                    <h3 className="text-lg font-bold tracking-tight text-ink">{p.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-smoke">{p.desc}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {p.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-mist/70 px-3 py-1 text-xs font-medium text-ink/70"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <Link
                      href={`/hizmetler/${p.serviceSlug}`}
                      className="mt-auto inline-flex items-center gap-1.5 pt-5 text-sm font-semibold text-ink transition-colors hover:text-guru-deep"
                    >
                      İlgili hizmet: {serviceTitleBySlug.get(p.serviceSlug)}
                      <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </Link>
                  </div>
                </article>
              </TiltCard>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
