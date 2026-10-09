"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Btn } from "@/components/site/Btn";

/** cta: mobilde dolu düğme olarak basılır (alt eylem çubuğunun yerini alır), masaüstünde sağdaki düğme var */
export type SubnavItem = { id: string; label: string; cta?: boolean };

/**
 * Ürün sayfasının yapışkan bölüm menüsü: üst menünün hemen altında durur,
 * görünürdeki bölümü vurgular. Mobilde yatay kayar; vurgulanan sekme şeride
 * kendiliğinden girer. Çizgi yok: sabitlendiğinde yalnız yumuşak gölge; üst menü
 * gölgesini o sırada kapatır (html[data-subnav]), iki çubuk tek çubuk gibi durur.
 * Menüde olmayan bir bölümdeyken hiçbir sekme vurgulanmaz.
 */
export function ProductSubnav({ items, ctaLabel }: { items: SubnavItem[]; ctaLabel: string }) {
  const [active, setActive] = useState(items[0]?.id ?? "");
  const [stuck, setStuck] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const sections = items
      .map((i) => document.getElementById(i.id))
      .filter((el): el is HTMLElement => Boolean(el));
    /* Okuma bandındaki (ekranın %40-45'i) bölümler; band menüde olmayan bir bölümdeyse küme boşalır */
    const inBand = new Set<string>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) inBand.add(e.target.id);
          else inBand.delete(e.target.id);
        }
        setActive(sections.find((s) => inBand.has(s.id))?.id ?? "");
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );
    sections.forEach((s) => io.observe(s));

    /* Sabitlendiğinde gölge: çubuğun üstünde 1px'lik gözcü */
    const bar = barRef.current;
    const sentinel = bar?.previousElementSibling;
    /* Yalnız gözcü üst kenarın üstüne çıktığında (aşağıdayken değil) sabitlenmiş sayılır */
    const so = new IntersectionObserver(
      ([e]) => setStuck(!e.isIntersecting && e.boundingClientRect.top < (e.rootBounds?.top ?? 80)),
      { rootMargin: "-80px 0px 0px 0px" }
    );
    if (sentinel) so.observe(sentinel);
    return () => {
      io.disconnect();
      so.disconnect();
    };
  }, [items]);

  /* Sabitlenmişken üst menünün gölgesi kalkar (SiteHeader bu özniteliği okur) */
  useEffect(() => {
    const root = document.documentElement;
    if (stuck) root.dataset.subnav = "1";
    else delete root.dataset.subnav;
    return () => {
      delete root.dataset.subnav;
    };
  }, [stuck]);

  /* Vurgulanan sekme mobil şeritte görünür kalsın (yalnız yatay kaydırma) */
  useEffect(() => {
    const list = listRef.current;
    const el = list?.querySelector<HTMLElement>(`[data-id="${active}"]`);
    if (!list || !el) return;
    const left = el.offsetLeft - list.clientWidth / 2 + el.clientWidth / 2;
    list.scrollTo({ left, behavior: "smooth" });
  }, [active]);

  return (
    <>
      <div aria-hidden className="h-px" />
      <div
        ref={barRef}
        className={cn(
          "sticky top-[68px] z-40 bg-white/95 backdrop-blur-md transition-shadow duration-300 lg:top-[76px]",
          stuck && "shadow-[0_14px_28px_-22px_rgb(1_20_65/0.45)]"
        )}
      >
        <nav aria-label="Sayfa bölümleri" className="container-g flex items-center gap-4 py-2.5">
          <ul
            ref={listRef}
            className="-mx-4 flex min-w-0 flex-1 gap-1 overflow-x-auto px-4 [scrollbar-width:none] max-lg:[mask-image:linear-gradient(to_right,transparent,black_16px,black_calc(100%_-_24px),transparent)] [&::-webkit-scrollbar]:hidden lg:mx-0 lg:px-0"
          >
            {items.map((i) => (
              <li key={i.id} data-id={i.id} className={cn("shrink-0", i.cta && "lg:hidden")}>
                <a
                  href={`#${i.id}`}
                  aria-current={active === i.id ? "true" : undefined}
                  data-umami-event="urun-menu"
                  data-umami-event-bolum={i.label}
                  className={cn(
                    "inline-flex min-h-11 items-center rounded-full px-4 text-[14.5px] font-medium transition-colors",
                    i.cta
                      ? "bg-navy text-white hover:bg-brand"
                      : active === i.id
                        ? "bg-chip text-heading"
                        : "text-muted hover:text-heading"
                  )}
                >
                  {i.label}
                </a>
              </li>
            ))}
          </ul>
          <Btn href="#demo" variant="primary" size="md" arrow className="hidden shrink-0 lg:inline-flex" data-umami-event="teklif-al" data-umami-event-konum="urun-menu">
            {ctaLabel}
          </Btn>
        </nav>
      </div>
    </>
  );
}
