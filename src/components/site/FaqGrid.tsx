"use client";

import { useId, useState } from "react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export type FaqItem = { q: string; a: string };

/**
 * İki sütunlu SSS (EDME düzeni). Her soru ince halkalı beyaz kart; tıklayınca
 * cevap aynı kartın içinde açılır. Sütunlar birbirinden bağımsızdır: bir soru
 * açılınca yalnız kendi sütunu uzar, yandaki sütunda boşluk açılmaz. Sorular
 * ilk yarı solda, ikinci yarı sağda dizilir; mobilde sütun kapsayıcıları
 * görünmez olur ve sıra okunuş sırasıyla aynı kalır.
 * Hydration güvenli: başlangıçta hepsi kapalı.
 */
export function FaqGrid({ items, className }: { items: FaqItem[]; className?: string }) {
  const [open, setOpen] = useState<number | null>(null);
  const base = useId();
  const half = Math.ceil(items.length / 2);
  const columns = [items.slice(0, half), items.slice(half)].filter((c) => c.length > 0);
  return (
    <div className={cn("flex flex-col gap-3 md:flex-row md:items-start md:gap-4", className)}>
      {columns.map((col, c) => (
        <div key={c} className="contents md:flex md:min-w-0 md:flex-1 md:flex-col md:gap-3">
          {col.map((it, j) => {
            const i = c * half + j;
            const isOpen = open === i;
            const pid = `${base}-p${i}`;
            return (
              <div
                key={it.q}
                className={cn(
                  "group rounded-xl bg-white text-left shadow-[0_0_0_1px_rgb(1_20_65/0.09)] transition-shadow duration-300",
                  isOpen ? "shadow-[0_0_0_1px_rgb(42_106_202/0.45)]" : "hover:shadow-[0_0_0_1px_rgb(42_106_202/0.3)]"
                )}
              >
                <h3 className="m-0">
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={pid}
                    onClick={() => setOpen(isOpen ? null : i)}
                    /* md'de sütunlar dar: iki satırlık soru ile tek satırlık soru aynı boyda dursun */
                    className="flex min-h-12 w-full items-center justify-between gap-4 rounded-xl px-4 py-3 text-left text-[14.5px] font-normal text-body sm:px-5 md:min-h-[74px] lg:min-h-12"
                  >
                    <span className={cn("text-pretty transition-colors", isOpen ? "text-heading" : "group-hover:text-heading")}>{it.q}</span>
                    <Plus
                      aria-hidden
                      className={cn("size-[18px] shrink-0 text-heading transition-transform duration-300", isOpen && "rotate-45")}
                      strokeWidth={2}
                    />
                  </button>
                </h3>
                <div id={pid} hidden={!isOpen} className="text-pretty px-4 pb-4 text-[14px] leading-relaxed text-muted sm:px-5">
                  {it.a}
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
