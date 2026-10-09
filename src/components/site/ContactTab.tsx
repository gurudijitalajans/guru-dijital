"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageCircle } from "lucide-react";

/**
 * Sağ kenarda dikey iletişim sekmesi (EDME'deki WhatsApp sekmesinin karşılığı).
 * WhatsApp numarası tanımlıysa doğrudan WhatsApp'a, değilse iletişim sayfasına gider.
 * 1280px ve üstünde görünür: daha dar ekranda kenar boşluğu sekmeden dar kalır ve
 * sekme içeriğe biner (orada header'daki Tanışalım, mobilde alt eylem çubuğu var).
 * İletişim sayfasında, aynı sayfaya götüreceği için gizlenir.
 * Numara panelin Site Ayarları'ndan gelir.
 */
export function ContactTab({ whatsapp, chat = false }: { whatsapp?: string; chat?: boolean }) {
  const pathname = usePathname();
  const wa = whatsapp?.replace(/\D/g, "");
  if (!wa && pathname === "/iletisim") return null;
  /* Sohbet balonu açıkken "Bize Yazın" sekmesi aynı işi görür; WhatsApp yoksa gösterilmez */
  if (!wa && chat) return null;
  const href = wa ? `https://wa.me/${wa}` : "/iletisim";
  const label = wa ? "WhatsApp Destek" : "Bize Yazın";
  /* Sekmenin tamamı dikey yazı yönünde döner: yazı aşağıdan yukarı okunur,
     ikon yazının başında (altta) ve yazıyla aynı yöne bakar. 180° dönüş
     köşeleri ve gölgeyi de çevirdiği için yuvarlatma sağda, gölge yukarıda
     tanımlanır; ekranda solda ve aşağıda görünür. Genişlik ~36px: 1280'de
     kenar boşluğu 40px. */
  const cls =
    "fixed right-0 top-1/2 z-40 hidden -translate-y-1/2 rotate-180 items-center gap-2.5 rounded-r-xl bg-brand px-2.5 py-4 text-[13px] font-semibold leading-none tracking-[0.02em] text-white shadow-[0_-10px_30px_-12px_rgb(42_106_202/0.8)] transition-colors [writing-mode:vertical-rl] hover:bg-navy xl:inline-flex";
  const inner = (
    <>
      <MessageCircle aria-hidden className="size-4 shrink-0 rotate-90" strokeWidth={2.2} />
      <span>{label}</span>
    </>
  );
  return wa ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className={cls} data-umami-event="whatsapp" data-umami-event-konum="yan-sekme">
      {inner}
    </a>
  ) : (
    <Link href={href} className={cls} data-umami-event="bize-yazin" data-umami-event-konum="yan-sekme">
      {inner}
    </Link>
  );
}
