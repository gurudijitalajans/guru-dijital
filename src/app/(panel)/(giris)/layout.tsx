import Link from "next/link";
import { ClipboardCheck, Inbox, Kanban } from "lucide-react";
import { Brand } from "@/panel/auth/Brand";

const FEATURES: [React.ComponentType<{ className?: string }>, string, string][] = [
  [Inbox, "Gelen kutusu", "Site sohbeti, WhatsApp, form ve randevular tek listede"],
  [Kanban, "Satış", "Fırsatlar, teklifler ve takip görevleri bir arada"],
  [ClipboardCheck, "Operasyon", "Projeler, görevler ve ekibin haftalık yükü"],
];

/**
 * Giriş, parola sıfırlama, parola belirleme: geniş ekranda solda markanın
 * ışık zemini ve panelin kısa tanıtımı, sağda form. Telefonda ışık ince bir
 * üst bant olur, form altında kart olarak durur.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="grid min-h-dvh bg-bg lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
      <section className="guru-beam relative flex h-[208px] flex-col justify-between overflow-hidden px-6 pt-9 sm:h-[240px] sm:px-10 lg:h-auto lg:min-h-dvh lg:px-14 lg:py-12">
        {/* Işık şeridi yazının altından geçerken okunurluk için soldan koyu geçiş (yalnız geniş ekran) */}
        <div className="pointer-events-none absolute inset-0 hidden bg-gradient-to-r from-[#011441]/70 via-[#011441]/25 to-transparent lg:block" aria-hidden />
        <div className="relative flex justify-center lg:justify-start">
          <Brand />
        </div>
        <div className="relative hidden max-w-[440px] lg:block">
          <h1 className="m-0 text-[34px] leading-[1.15] font-semibold tracking-[-0.01em] text-balance text-white xl:text-[40px]">Talepler, sohbetler ve işler tek yerde.</h1>
          <ul className="mt-8 grid list-none gap-4 p-0">
            {FEATURES.map(([Icon, title, text]) => (
              <li key={title} className="flex items-start gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-[10px] bg-white/10 ring-1 ring-white/20">
                  <Icon className="size-[18px] text-white" />
                </span>
                <span>
                  <span className="block font-medium text-white">{title}</span>
                  <span className="block text-[14px] text-white/75">{text}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
        <p className="relative m-0 hidden text-[13px] text-white/60 lg:block">
          Guru Dijital Ajans ·{" "}
          <Link href="/" className="text-white/80 underline underline-offset-2 hover:text-white">
            Siteye dön
          </Link>
        </p>
      </section>

      <section className="relative -mt-16 flex justify-center px-4 pb-10 lg:mt-0 lg:items-center lg:px-10 lg:py-12">
        <div className="w-full max-w-[400px]">
          <div className="rounded-[18px] border border-line bg-surface p-6 shadow-[0_24px_60px_-24px_rgb(1_20_65/0.45)] sm:p-7 lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none">{children}</div>
          <p className="mt-6 text-center text-[12px] text-muted lg:hidden">
            Guru Dijital Ajans ·{" "}
            <Link href="/" className="text-muted underline underline-offset-2">
              Siteye dön
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
