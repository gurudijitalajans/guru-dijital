"use client";

import { useId, useState } from "react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export type FaqItem = { q: string; a: string };

/**
 * İki sütunlu SSS ızgarası (EDME düzeni). Her soru ince halkalı beyaz kart;
 * tıklayınca cevap aynı kartın içinde açılır. Hydration güvenli: başlangıçta hepsi kapalı.
 */
export function FaqGrid({ items, className }: { items: FaqItem[]; className?: string }) {
  const [open, setOpen] = useState<number | null>(null);
  const base = useId();
  return (
    <div className={cn("grid items-start gap-3 md:grid-cols-2 md:gap-x-4", className)}>
      {items.map((it, i) => {
        const isOpen = open === i;
        const pid = `${base}-p${i}`;
        return (
          <div
            key={it.q}
            className={cn(
              "rounded-xl bg-white text-left shadow-[0_0_0_1px_rgb(1_20_65/0.09)] transition-shadow",
              isOpen && "shadow-[0_0_0_1px_rgb(42_106_202/0.45)]"
            )}
          >
            <h3 className="m-0">
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={pid}
                onClick={() => setOpen(isOpen ? null : i)}
                className="flex min-h-12 w-full items-center justify-between gap-4 px-4 py-3 text-left text-[14.5px] font-normal text-body sm:px-5"
              >
                <span className={cn(isOpen && "text-heading")}>{it.q}</span>
                <Plus
                  aria-hidden
                  className={cn("size-[18px] shrink-0 text-heading transition-transform duration-300", isOpen && "rotate-45")}
                  strokeWidth={2}
                />
              </button>
            </h3>
            <div id={pid} hidden={!isOpen} className="px-4 pb-4 text-[14px] leading-relaxed text-muted sm:px-5">
              {it.a}
            </div>
          </div>
        );
      })}
    </div>
  );
}
