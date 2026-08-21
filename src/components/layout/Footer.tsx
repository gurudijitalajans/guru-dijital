import Link from "next/link";
import Image from "next/image";
import { Mail, ArrowUpRight } from "lucide-react";
import { InstagramIcon } from "@/components/ui/icons";
import { FooterWordmark } from "@/components/v2/FooterWordmark";
import { RotatingBadge } from "@/components/fx/RotatingBadge";
import { navLinks, services, site } from "@/lib/data";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="relative overflow-hidden bg-coal text-paper">
      <div className="grain-blob -left-32 top-10 h-80 w-80 opacity-30" aria-hidden />

      {/* CTA band */}
      <div className="container-g flex flex-col items-start justify-between gap-8 border-b border-paper/10 py-16 md:flex-row md:items-center md:py-20">
        <p className="max-w-xl text-3xl font-bold leading-tight tracking-tight md:text-4xl">
          Markanızı bir <span className="text-guru">sonraki seviyeye</span> taşıyalım.
        </p>
        <div className="flex items-center gap-8">
          <RotatingBadge size={116} className="hidden lg:inline-block" />
          <Link
            href="/iletisim"
            className="group inline-flex items-center gap-2 rounded-full bg-guru px-7 py-3.5 font-semibold text-ink transition-all duration-300 hover:bg-paper active:scale-[0.98]"
          >
            Projenizi Konuşalım
            <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>

      {/* Columns */}
      <div className="container-g grid gap-12 py-14 md:grid-cols-[1.4fr_1fr_1fr_1.2fr] md:py-16">
        <div>
          <Image
            src="/logo-light.png"
            alt="Guru Dijital Ajans"
            width={720}
            height={306}
            className="h-10 w-auto"
          />
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-paper/60">
            Stratejik iletişimden performans pazarlamasına; markanızı dijitalde
            büyüten entegre çözümler.
          </p>
          <div className="mt-6 flex gap-3">
            <a
              href={site.instagram}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="flex size-10 items-center justify-center rounded-full bg-paper/10 transition-colors hover:bg-guru hover:text-ink"
            >
              <InstagramIcon className="size-4" />
            </a>
            <a
              href={`mailto:${site.email}`}
              aria-label="E-posta"
              className="flex size-10 items-center justify-center rounded-full bg-paper/10 transition-colors hover:bg-guru hover:text-ink"
            >
              <Mail className="size-4" />
            </a>
          </div>
        </div>

        <nav aria-label="Hizmetler">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.16em] text-paper/40">
            Hizmetler
          </h3>
          <ul className="space-y-2.5">
            {services.map((s) => (
              <li key={s.slug}>
                <Link
                  href={`/hizmetler/${s.slug}`}
                  className="text-sm text-paper/70 transition-colors hover:text-guru"
                >
                  {s.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Sayfalar">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.16em] text-paper/40">
            Sayfalar
          </h3>
          <ul className="space-y-2.5">
            {navLinks.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="text-sm text-paper/70 transition-colors hover:text-guru"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.16em] text-paper/40">
            İletişim
          </h3>
          <ul className="space-y-2.5 text-sm text-paper/70">
            <li>
              <a href={`mailto:${site.email}`} className="transition-colors hover:text-guru">
                {site.email}
              </a>
            </li>
            <li>
              <a
                href={site.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-guru"
              >
                instagram/@gurudijital
              </a>
            </li>
            <li className="text-paper/40">gurudijital.com.tr</li>
          </ul>
          <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-paper/15 px-4 py-2 text-xs text-paper/60">
            <span className="size-1.5 bg-guru" aria-hidden />
            Google Partner · 2025
          </div>
        </div>
      </div>

      {/* Giant interactive wordmark: alt bara taşmadan, nefes payıyla oturur */}
      <FooterWordmark className="mb-8 mt-4 md:mb-12" />

      <div className="border-t border-paper/10">
        <div className="container-g flex flex-col items-center justify-between gap-2 py-6 text-xs text-paper/40 sm:flex-row">
          <p>© {year} {site.name}. Tüm hakları saklıdır.</p>
          <p>Unlock the next level</p>
        </div>
      </div>
    </footer>
  );
}
