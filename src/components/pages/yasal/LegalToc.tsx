"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export type TocItem = { id: string; n: string; label: string };

/**
 * Yasal metnin içindekiler listesi: geniş ekranda solda yapışkan, okunan bölümü vurgular;
 * dar ekranda metnin üstünde açılır liste. Bağlantılar düz çapa (bölüm payı scroll-mt ile).
 */
export function LegalToc({ items }: { items: TocItem[] }) {
  const [active, setActive] = useState(items[0]?.id ?? "");

  useEffect(() => {
    const sections = items.map((i) => document.getElementById(i.id)).filter((el): el is HTMLElement => Boolean(el));
    /* Okuma bandı ekranın üst üçte biri: band içindeki ilk bölüm vurgulanır */
    const visible = new Set<string>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) visible.add(e.target.id);
          else visible.delete(e.target.id);
        }
        const first = sections.find((s) => visible.has(s.id));
        if (first) setActive(first.id);
      },
      { rootMargin: "-20% 0px -65% 0px" }
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, [items]);

  const list = (
    <ol className="grid gap-0.5">
      {items.map((i) => (
        <li key={i.id}>
          <a
            href={`#${i.id}`}
            aria-current={active === i.id ? "true" : undefined}
            className={cn(
              "flex min-h-10 items-baseline gap-2.5 rounded-xl px-3 py-2 text-[14px] leading-snug transition-colors",
              active === i.id ? "bg-white font-medium text-heading shadow-[0_0_0_1px_rgb(1_20_65/0.07)]" : "text-muted hover:text-heading"
            )}
          >
            <span className={cn("w-4 shrink-0 text-[12.5px] tabular-nums", active === i.id ? "text-brand" : "text-muted/70")}>{i.n}</span>
            {i.label}
          </a>
        </li>
      ))}
    </ol>
  );

  return (
    <>
      <details className="group rounded-2xl bg-soft p-2 lg:hidden">
        <summary className="flex min-h-11 list-none items-center justify-between px-3 text-[14.5px] font-medium text-heading [&::-webkit-details-marker]:hidden">
          Bu sayfada
          <span aria-hidden className="text-[18px] leading-none text-muted transition-transform group-open:rotate-45">+</span>
        </summary>
        <div className="pb-1 pt-1">{list}</div>
      </details>
      <nav aria-label="Bu sayfada" className="sticky top-[calc(var(--header-h)+24px)] hidden rounded-2xl bg-soft p-2 lg:block">
        <p className="px-3 pb-2 pt-2.5 text-[13px] font-medium text-muted">Bu sayfada</p>
        {list}
      </nav>
    </>
  );
}
