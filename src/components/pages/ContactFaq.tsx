"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

const EASE = [0.22, 1, 0.36, 1] as const;

const faqs = [
  {
    q: "Hangi şehirlerle çalışıyorsunuz?",
    a: "Türkiye genelinde ve global ölçekte çalışıyoruz. Süreçlerimiz tamamen uzaktan yürütülebiliyor; toplantıları online yapıyor, işleri şeffaf araçlar üzerinden birlikte takip ediyoruz.",
  },
  {
    q: "Süreç nasıl başlıyor?",
    a: "Ücretsiz bir keşif görüşmesiyle başlıyoruz. Markanızı, hedeflerinizi ve mevcut durumunuzu dinliyor; ardından size özel bir yol haritası ve teklif sunuyoruz.",
  },
  {
    q: "Raporlama nasıl işliyor?",
    a: "Düzenli ve veri odaklı raporlama yapıyoruz. Neyin işe yaradığını, neyin geliştirilmesi gerektiğini net metriklerle görürsünüz; kararları birlikte veriyoruz.",
  },
  {
    q: "Sözleşme ve paket modeliniz nasıl?",
    a: "İhtiyaca göre esnek bir model uyguluyoruz: proje bazlı ya da aylık iş birliği şeklinde çalışabiliyoruz. Kapsamı ve bütçeyi keşif görüşmesinde birlikte netleştiriyoruz.",
  },
];

export function ContactFaq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="mx-auto max-w-3xl divide-y divide-paper/10 rounded-3xl border border-paper/10 bg-carbon px-6 md:px-8">
      {faqs.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={item.q}>
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen}
              aria-controls={`faq-panel-${i}`}
              className="group relative flex w-full items-center justify-between gap-4 py-5 text-left md:py-6"
            >
              {/* Hover'da solda beliren ince yeşil çizgi */}
              <span
                aria-hidden
                className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 scale-y-50 rounded-full bg-guru opacity-0 shadow-[0_0_12px_rgba(16,216,108,0.6)] transition-all duration-300 group-hover:scale-y-100 group-hover:opacity-100"
              />
              <span
                className={cn(
                  "text-[15px] font-semibold tracking-tight transition-all duration-300 group-hover:translate-x-3 md:text-base",
                  isOpen ? "text-paper" : "text-paper/80 group-hover:text-paper"
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
                    : "bg-paper/10 text-paper/70 group-hover:bg-paper/20 group-hover:text-paper"
                )}
                aria-hidden
              >
                <Plus className="size-4" strokeWidth={2.4} />
              </motion.span>
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  id={`faq-panel-${i}`}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.4, ease: EASE }}
                  className="overflow-hidden"
                >
                  <p className="pb-6 pr-10 text-sm leading-relaxed text-paper/60 md:text-[15px]">
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
