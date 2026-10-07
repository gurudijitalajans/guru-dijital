import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { site } from "@/lib/data";

/**
 * Sağ kenarda dikey iletişim sekmesi (EDME'deki WhatsApp sekmesinin karşılığı).
 * WhatsApp numarası tanımlıysa doğrudan WhatsApp'a, değilse iletişim sayfasına gider.
 * Yalnız masaüstünde görünür; mobilde alt eylem çubuğu bu işi üstlenir.
 */
export function ContactTab() {
  const wa = site.whatsapp?.replace(/\D/g, "");
  const href = wa ? `https://wa.me/${wa}` : "/iletisim";
  const label = wa ? "WhatsApp Destek" : "Bize Yazın";
  const cls =
    "fixed right-0 top-1/2 z-40 hidden -translate-y-1/2 rounded-l-xl bg-brand px-2.5 py-4 text-[13px] font-semibold tracking-[0.02em] text-white shadow-[0_10px_30px_-12px_rgb(42_106_202/0.8)] transition-colors hover:bg-navy lg:flex lg:flex-col lg:items-center lg:gap-2";
  const inner = (
    <>
      <MessageCircle aria-hidden className="size-4" strokeWidth={2.2} />
      <span className="[writing-mode:vertical-rl] rotate-180">{label}</span>
    </>
  );
  return wa ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
      {inner}
    </a>
  ) : (
    <Link href={href} className={cls}>
      {inner}
    </Link>
  );
}
