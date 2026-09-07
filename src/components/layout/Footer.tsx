import Link from "next/link";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { Mail } from "lucide-react";
import { InstagramIcon } from "@/components/ui/icons";
import { FooterWordmark } from "@/components/v2/FooterWordmark";
import { awards, navLinks, products, services, site } from "@/lib/data";

/* Liste linkleri: 44px dokunma hedefi (py-3 + 20px satır), negatif dikey
   marjla görsel sıklık korunur. */
const listLinkCls = "-my-1 block py-3 text-sm text-fg/70 transition-colors hover:text-guru";
const headingCls = "mb-3 text-sm font-semibold uppercase tracking-[0.16em] text-fg/60";

export default function Footer() {
  const year = new Date().getFullYear();
  const partnerYear = awards.find((a) => a.title === "Google Partner")?.year;

  return (
    <footer className="relative overflow-hidden border-t border-fg/10 bg-page text-fg">
      <div className="grain-blob -left-32 top-10 h-80 w-80 opacity-30" aria-hidden />

      {/* Columns: mobilde iki kolon; "Sayfalar" mobil menüyle birebir aynı
          olduğundan yalnız lg+ ekranda gösterilir. */}
      <div className="container-g grid grid-cols-2 gap-x-6 gap-y-10 py-12 md:py-16 lg:grid-cols-[1.4fr_1fr_1fr_1fr_1.2fr] lg:gap-12">
        <div className="col-span-2 lg:col-span-1">
          <BrandLogo className="h-10 w-auto" />
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-fg/60">
            Stratejik iletişimden performans pazarlamasına; markanızı dijitalde
            büyüten entegre çözümler.
          </p>
          <div className="mt-6 flex gap-3">
            <a
              href={site.instagram}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="flex size-11 items-center justify-center rounded-full bg-fg/10 transition-colors hover:bg-guru hover:text-ink"
            >
              <InstagramIcon className="size-4" />
            </a>
            <a
              href={`mailto:${site.email}`}
              aria-label="E-posta"
              className="flex size-11 items-center justify-center rounded-full bg-fg/10 transition-colors hover:bg-guru hover:text-ink"
            >
              <Mail className="size-4" />
            </a>
          </div>
        </div>

        <nav aria-label="Hizmetler" className="min-w-0">
          <h3 className={headingCls}>Hizmetler</h3>
          <ul className="space-y-1">
            {services.map((s) => (
              <li key={s.slug}>
                <Link href={`/hizmetler/${s.slug}`} className={listLinkCls}>
                  {s.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Ürünler" className="min-w-0">
          <h3 className={headingCls}>Ürünler</h3>
          <ul className="space-y-1">
            {products.map((p) => (
              <li key={p.slug}>
                <Link href={`/urunler/${p.slug}`} className={listLinkCls}>
                  {p.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Sayfalar" className="hidden min-w-0 lg:block">
          <h3 className={headingCls}>Sayfalar</h3>
          <ul className="space-y-1">
            {navLinks.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className={listLinkCls}>
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="col-span-2 min-w-0 lg:col-span-1">
          <h3 className={headingCls}>İletişim</h3>
          <ul className="space-y-1 text-sm text-fg/70">
            <li>
              <a href={`mailto:${site.email}`} className="-my-1 block break-all py-3 transition-colors hover:text-guru">
                {site.email}
              </a>
            </li>
            <li>
              <a
                href={site.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="-my-1 block py-3 transition-colors hover:text-guru"
              >
                instagram/@gurudijital
              </a>
            </li>
            <li className="py-1 text-fg/60">gurudijital.com.tr</li>
          </ul>
          <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-fg/15 px-4 py-2 text-xs text-fg/70">
            <span className="size-1.5 bg-guru" aria-hidden />
            Google Partner{partnerYear ? ` · ${partnerYear}` : ""}
          </div>
        </div>
      </div>

      {/* Giant interactive wordmark: alt bara taşmadan, nefes payıyla oturur */}
      <FooterWordmark className="mb-10 mt-8 md:mt-[calc(72px-4.65vw)] md:mb-[calc(72px+3.4vw)]" />

      <div className="border-t border-fg/10">
        <div className="container-g flex flex-col items-center justify-between gap-2 py-5 text-xs text-fg/60 sm:flex-row">
          <p>© {year} {site.name}. Tüm hakları saklıdır.</p>
          <p>Unlock the next level</p>
        </div>
      </div>
    </footer>
  );
}
