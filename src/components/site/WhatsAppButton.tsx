"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/** WhatsApp'ın resmi balon simgesi (tek renk) */
function WaIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden className={className} fill="currentColor">
      <path d="M16.04 3C8.86 3 3.03 8.82 3.03 16c0 2.3.6 4.53 1.74 6.5L3 29l6.68-1.75A12.96 12.96 0 0 0 16.04 29C23.2 29 29 23.18 29 16S23.2 3 16.04 3Zm0 23.7c-2 0-3.96-.54-5.67-1.56l-.4-.24-3.97 1.04 1.06-3.86-.27-.4A10.62 10.62 0 0 1 5.4 16c0-5.87 4.77-10.64 10.64-10.64 5.86 0 10.62 4.77 10.62 10.64 0 5.86-4.76 10.7-10.62 10.7Zm5.83-7.97c-.32-.16-1.89-.93-2.18-1.04-.3-.1-.5-.16-.72.16-.21.32-.82 1.04-1 1.25-.19.21-.37.24-.69.08-.32-.16-1.35-.5-2.57-1.59-.95-.85-1.59-1.9-1.78-2.22-.18-.32-.02-.49.14-.65.15-.14.32-.37.48-.56.16-.18.21-.32.32-.53.1-.21.05-.4-.03-.56-.08-.16-.72-1.73-.98-2.37-.26-.62-.52-.53-.72-.54h-.61c-.21 0-.56.08-.85.4-.29.32-1.12 1.09-1.12 2.66 0 1.57 1.14 3.09 1.3 3.3.16.21 2.25 3.43 5.44 4.81.76.33 1.35.52 1.81.67.76.24 1.46.2 2 .12.61-.09 1.89-.77 2.15-1.52.27-.74.27-1.38.19-1.52-.08-.13-.29-.21-.61-.37Z" />
    </svg>
  );
}

/**
 * Sağ altta WhatsApp düğmesi: sohbet balonunun üstünde, mobilde alt eylem
 * çubuğunun da üstünde. Üzerine gelince ya da odaklanınca etiket açılır;
 * mesaj, bulunulan sayfaya göre hazır yazılı gelir.
 */
export function WhatsAppButton({ number, chat }: { number: string; chat: boolean }) {
  const pathname = usePathname();
  const wa = number.replace(/\D/g, "");
  /* 1280px altında form ekrandayken düğme çekilir: tarih seçici gibi alanların üstüne binmesin */
  const [overForm, setOverForm] = useState(false);
  useEffect(() => {
    const seen = new Set<Element>();
    const io = new IntersectionObserver((es) => {
      for (const e of es) {
        if (e.isIntersecting) seen.add(e.target);
        else seen.delete(e.target);
      }
      setOverForm(seen.size > 0 && window.innerWidth < 1280);
    });
    const t = window.setTimeout(() => document.querySelectorAll("main form, [data-hide-floats]").forEach((el) => io.observe(el)), 300);
    return () => {
      window.clearTimeout(t);
      io.disconnect();
    };
  }, [pathname]);
  if (!wa) return null;
  const text = `Merhaba Guru Dijital, ${pathname === "/" ? "web sitenizden" : `sitenizdeki ${pathname} sayfasından`} yazıyorum.`;
  return (
    <a
      href={`https://wa.me/${wa}?text=${encodeURIComponent(text)}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="WhatsApp'tan yazın"
      data-umami-event="whatsapp"
      data-umami-event-konum="balon"
      data-float=""
      className={cn(
        "group fixed right-4 z-[45] inline-flex h-14 items-center overflow-hidden rounded-full bg-[#25D366] text-white shadow-[0_14px_32px_-12px_rgb(18_140_74/0.7)] transition-[background-color,transform,opacity] duration-300 hover:bg-[#1ebe5b] active:scale-95 lg:right-6",
        overForm && "pointer-events-none translate-x-24 opacity-0",
        chat ? "bottom-[160px] lg:bottom-[96px]" : "bottom-[88px] lg:bottom-6"
      )}
    >
      <span className="grid size-14 shrink-0 place-items-center">
        <WaIcon className="size-7" />
      </span>
      <span className="max-w-0 whitespace-nowrap pr-0 text-[15px] font-semibold opacity-0 transition-[max-width,opacity,padding] duration-300 group-hover:max-w-[200px] group-hover:pr-5 group-hover:opacity-100 group-focus-visible:max-w-[200px] group-focus-visible:pr-5 group-focus-visible:opacity-100">
        WhatsApp&apos;tan yazın
      </span>
    </a>
  );
}
