"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft } from "lucide-react";

/**
 * Sağ kenarda dikey "Teklif Alın" sekmesi: iletişim sayfasına gider. WhatsApp
 * sağ alttaki düğmede. 1280px ve üstünde görünür (daha dar ekranda içeriğe
 * biner; orada header'daki İletişim ve mobilde alt eylem çubuğu var).
 * İletişim sayfasında gizlenir. Üzerine gelince sola doğru açılan kısa bir
 * bilgi kartı gösterir.
 */
export function ContactTab() {
  const pathname = usePathname();
  if (pathname === "/iletisim") return null;
  return (
    <Link
      href="/iletisim"
      data-float=""
      aria-label="Teklif alın: ücretsiz ön görüşme, aynı gün dönüş"
      className="group fixed right-0 top-1/2 z-40 hidden -translate-y-1/2 xl:block"
      data-umami-event="teklif-al"
      data-umami-event-konum="yan-sekme"
    >
      {/* Açılan bilgi kartı */}
      <span
        aria-hidden
        className="pointer-events-none absolute right-full top-1/2 mr-3 w-64 -translate-y-1/2 translate-x-2 rounded-2xl bg-white p-4 text-left opacity-0 shadow-[0_0_0_1px_rgb(1_20_65/0.06),0_24px_48px_-20px_rgb(1_20_65/0.45)] transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100"
      >
        <span className="flex items-center gap-2 text-[12.5px] font-medium text-emerald-700">
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
          </span>
          Aynı gün dönüş
        </span>
        <span className="mt-1.5 block text-[15px] font-medium leading-snug text-heading">Ücretsiz ön görüşme ve teklif</span>
        <span className="mt-1 block text-[13px] leading-relaxed text-muted">Projenizi anlatın, size özel planı birlikte çıkaralım.</span>
      </span>
      {/* Sekme */}
      <span className="flex flex-col items-center gap-3 rounded-l-2xl bg-[linear-gradient(180deg,#2a6aca,#12419b_55%,#011441)] px-2.5 py-4 text-white shadow-[inset_1px_0_0_rgb(255_255_255/0.18),0_18px_40px_-14px_rgb(18_65_155/0.75)] transition-[padding] duration-300 group-hover:pl-3.5 group-focus-visible:outline-2 group-focus-visible:outline-offset-2 group-focus-visible:outline-brand">
        <span className="rotate-180 text-[13.5px] font-semibold leading-none tracking-[0.04em] [writing-mode:vertical-rl]">Teklif Alın</span>
        <ArrowLeft aria-hidden className="size-3.5 opacity-70 transition-transform duration-300 group-hover:-translate-x-0.5" strokeWidth={2.4} />
      </span>
    </Link>
  );
}
