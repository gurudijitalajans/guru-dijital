"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

const EASE = [0.22, 1, 0.36, 1] as const;

export type ProductFaqItem = { q: string; a: string };

export type ProductFaqProps = {
  items: ProductFaqItem[];
  /** Panel id ön eki; aynı sayfada birden fazla SSS varsa çakışmayı önler. */
  idPrefix?: string;
  className?: string;
};

/**
 * ProductFaq: ürün sayfaları için genel SSS akordeonu (ContactFaq deseni).
 *
 * - İçerik prop'la gelir; ilk madde açık başlar (SSR ve istemci ilk render
 *   birebir aynı: useState başlangıç değeri sabit, effect yok).
 * - Her tetikleyici min 44px (min-h-11) dokunma hedefi.
 * - aria-expanded / aria-controls ile erişilebilir; açılış animasyonu
 *   AnimatePresence ile yükseklik üzerinden yapılır.
 */
export function ProductFaq({ items, idPrefix = "product-faq", className }: ProductFaqProps) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div
      className={cn(
        "mx-auto max-w-3xl divide-y divide-fg/10 rounded-3xl border border-fg/10 bg-card px-6 md:px-8",
        className
      )}
    >
      {items.map((item, i) => {
        const isOpen = open === i;
        const panelId = `${idPrefix}-panel-${i}`;
        return (
          <div key={item.q}>
            <h3 className="m-0">
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : i)}
                aria-expanded={isOpen}
                aria-controls={panelId}
                className="group relative flex min-h-11 w-full items-center justify-between gap-4 py-5 text-left md:py-6"
              >
                {/* Hover'da solda beliren ince yeşil çizgi */}
                <span
                  aria-hidden
                  className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 scale-y-50 rounded-full bg-guru opacity-0 shadow-[0_0_12px_rgba(16,216,108,0.6)] transition-all duration-300 group-hover:scale-y-100 group-hover:opacity-100"
                />
                <span
                  className={cn(
                    "text-[15px] font-semibold tracking-tight transition-all duration-300 group-hover:translate-x-3 md:text-base",
                    isOpen ? "text-fg" : "text-fg/80 group-hover:text-fg"
                  )}
                >
                  {item.q}
                </span>
                <motion.span
                  animate={{ rotate: isOpen ? 45 : 0 }}
                  transition={{ duration: 0.3, ease: EASE }}
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-full transition-[background-color,color,scale] duration-300 group-hover:scale-110",
                    isOpen
                      ? "bg-guru text-ink"
                      : "bg-fg/10 text-fg/70 group-hover:bg-fg/20 group-hover:text-fg"
                  )}
                  aria-hidden
                >
                  <Plus className="size-4" strokeWidth={2.4} />
                </motion.span>
              </button>
            </h3>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  id={panelId}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.4, ease: EASE }}
                  className="overflow-hidden"
                >
                  <p className="pb-5 pr-2 text-sm leading-relaxed text-fg/60 md:pb-6 md:pr-12 md:text-[15px]">
                    {item.a}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
