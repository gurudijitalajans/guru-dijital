"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageCircle } from "lucide-react";

/**
 * Sağ kenarda dikey "Teklif Alın" sekmesi: iletişim sayfasına gider. WhatsApp
 * sağ alttaki düğmede. 1280px ve üstünde görünür (daha dar ekranda içeriğe
 * biner; orada header'daki İletişim ve mobilde alt eylem çubuğu var).
 * İletişim sayfasında gizlenir.
 */
export function ContactTab() {
  const pathname = usePathname();
  if (pathname === "/iletisim") return null;
  const cls =
    "fixed right-0 top-1/2 z-40 hidden -translate-y-1/2 rotate-180 items-center gap-2.5 rounded-r-xl bg-brand px-2.5 py-4 text-[13px] font-semibold leading-none tracking-[0.02em] text-white shadow-[0_-10px_30px_-12px_rgb(42_106_202/0.8)] transition-colors [writing-mode:vertical-rl] hover:bg-navy xl:inline-flex";
  return (
    <Link href="/iletisim" className={cls} data-umami-event="teklif-al" data-umami-event-konum="yan-sekme">
      <MessageCircle aria-hidden className="size-4 shrink-0 rotate-90" strokeWidth={2.2} />
      <span>Teklif Alın</span>
    </Link>
  );
}
