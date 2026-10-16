import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { LEGAL_PAGES } from "@/lib/legal";
import { InstagramIcon, WhatsAppIcon } from "@/components/ui/icons";
import { partnerBadges, site } from "@/lib/data";
import { cn, shortServiceTitle } from "@/lib/utils";
import { CookiePrefsButton } from "./CookieConsent";
import { Glyph } from "./Glyph";
import { Logo } from "./Logo";
import { iconBoxCls } from "./styles";

const headCls = "mb-3 text-[15px] font-medium text-heading";
/* mobilde 44px dokunma alanı, masaüstünde sık liste */
const linkCls = "block py-2.5 text-[14px] text-body transition-colors hover:text-brand md:py-1.5 pointer-coarse:py-2.5";
const allCls = "inline-flex items-center gap-1.5 py-2.5 text-[14px] font-medium text-brand transition-colors hover:text-navy md:py-1.5 pointer-coarse:py-2.5";

/** "https://www.instagram.com/gurudijital/" → "gurudijital" */
const handleOf = (url: string) => url.replace(/\/+$/, "").split("/").pop() || "gurudijital";

type SiteFooterProps = {
  email: string;
  instagram: string;
  phone?: string;
  /** Doğrudan arama hattı (cep) */
  mobile?: string;
  whatsapp?: string;
  showBlog?: boolean;
  services: { title: string; slug: string }[];
  products: { name: string; slug: string }[];
  /** Hakkımızda > Ödüller listesindeki ilk ödül, ör. "2025 Google Partner" */
  badge?: string;
};

type Channel = { label: string; value: string; href: string; event: string; external?: boolean; icon: ReactNode };

/**
 * Alt bilgi: solda marka ve iş ortaklıkları, sağda dengeli bağlantı sütunları (hizmetler iki
 * alt sütunda), altında iletişim kanalları şeridi ve en altta
 * telif + Blog + yasal bağlantılar. İletişim bilgileri, hizmet ve ürün listeleri panelden gelir.
 */
export function SiteFooter({ email, instagram, phone, mobile, whatsapp, showBlog = false, services, products, badge }: SiteFooterProps) {
  const year = new Date().getFullYear();
  const badges = [...(badge ? [badge] : []), ...partnerBadges];
  /* "Tüm Hizmetler" ve "Tüm Ürünler" satırlarıyla sütunlar aynı boyda biter (9 hizmet + 1 → 5/5, 4 ürün + 1, kurumsal 5) */
  const rows = Math.ceil((services.length + 1) / 2);

  /* WhatsApp yoksa telefon; panelde boş bırakılan kanal görünmez */
  const channels: Channel[] = [];
  if (whatsapp) channels.push({ label: "WhatsApp", value: phone || whatsapp, href: `https://wa.me/${whatsapp.replace(/\D/g, "")}`, event: "whatsapp", external: true, icon: <WhatsAppIcon className="size-[17px]" /> });
  else if (phone) channels.push({ label: "Telefon", value: phone, href: `tel:${phone.replace(/\s/g, "")}`, event: "telefon", icon: <Glyph name="phone" className="size-5" strokeWidth={1.7} /> });
  if (mobile) channels.push({ label: "Hemen arayın", value: mobile, href: `tel:${mobile.replace(/[^\d+]/g, "")}`, event: "telefon-cep", icon: <Glyph name="phone" className="size-5" strokeWidth={1.7} /> });
  channels.push(
    { label: "E-posta", value: email, href: `mailto:${email}`, event: "e-posta", icon: <Glyph name="mail" className="size-5" strokeWidth={1.7} /> },
    { label: "Instagram", value: `@${handleOf(instagram)}`, href: instagram, event: "instagram", external: true, icon: <InstagramIcon className="size-[17px]" /> },
    { label: "Görüntülü görüşme", value: "Toplantı planlayın", href: "/iletisim#toplanti", event: "toplanti-planla", icon: <Glyph name="calendar-clock" className="size-5" strokeWidth={1.7} /> }
  );

  return (
    <footer className="bg-soft pb-8 pt-12 md:pt-16">
      <div className="container-g">
        {/* 12 sütunluk ızgara, sütun araları eşit: geniş ekranda marka 4 + hizmetler 4 + ürünler 2 + kurumsal 2;
            tablette marka üstte tam satır (rozetler sağda), altında 6 + 3 + 3 */}
        <div className="grid grid-cols-2 gap-x-8 gap-y-10 md:grid-cols-12">
          <div className="col-span-2 md:col-span-12 md:flex md:items-start md:justify-between md:gap-10 xl:col-span-4 xl:block">
            <div>
              <Logo height={30} />
              <p className="mt-4 max-w-[320px] text-pretty text-[14px] leading-relaxed text-muted">
                Markanızı dijitalde büyüten entegre ajans hizmetleri ve işletme yazılımları.
              </p>
            </div>
            {badges.length > 0 && (
              <ul className="mt-6 flex max-w-[360px] flex-wrap gap-2 md:mt-1 md:max-w-[420px] md:justify-end xl:mt-6 xl:max-w-[360px] xl:justify-start" aria-label="İş ortaklıkları">
                {badges.map((b) => (
                  <li
                    key={b}
                    className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-[12.5px] font-medium text-heading shadow-[0_0_0_1px_rgb(1_20_65/0.07)]"
                  >
                    <span className="size-1.5 rounded-full bg-brand" aria-hidden />
                    {b}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Hizmetler iki alt sütunda (sütun sütun dolar); "Tüm …" satırlarıyla üç sütun aynı satırda biter */}
          <nav aria-label="Hizmetler" className="col-span-2 md:col-span-6 xl:col-span-4">
            <h2 className={headCls}>Hizmetler</h2>
            <ul className="grid grid-flow-col grid-cols-2 gap-x-8" style={{ gridTemplateRows: `repeat(${rows}, auto)` }}>
              {services.map((s) => (
                <li key={s.slug} className="min-w-0">
                  <Link href={`/hizmetler/${s.slug}`} className={linkCls}>
                    {shortServiceTitle(s.title)}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/hizmetler" className={allCls}>
                  Tüm Hizmetler
                  <ArrowRight aria-hidden className="size-3.5" strokeWidth={2.2} />
                </Link>
              </li>
            </ul>
          </nav>

          <nav aria-label="Ürünler" className="md:col-span-3 xl:col-span-2">
            <h2 className={headCls}>Ürünler</h2>
            <ul>
              {products.map((p) => (
                <li key={p.slug}>
                  <Link href={`/urunler/${p.slug}`} className={linkCls}>
                    {p.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/urunler" className={allCls}>
                  Tüm Ürünler
                  <ArrowRight aria-hidden className="size-3.5" strokeWidth={2.2} />
                </Link>
              </li>
            </ul>
          </nav>

          <nav aria-label="Kurumsal" className="md:col-span-3 xl:col-span-2">
            <h2 className={headCls}>Kurumsal</h2>
            <ul>
              <li><Link href="/hakkimizda" className={linkCls}>Hakkımızda</Link></li>
              <li><Link href="/hakkimizda#ekip" className={linkCls}>Ekibimiz</Link></li>
              <li><Link href="/hakkimizda#oduller" className={linkCls}>Ödüllerimiz</Link></li>
              <li><Link href="/referanslar" className={linkCls}>Referanslarımız</Link></li>
              <li><Link href="/iletisim" className={linkCls}>İletişim</Link></li>
            </ul>
          </nav>
        </div>

        {/* İletişim kanalları: tek satırda kartlar (mobilde alt alta) */}
        <ul className={cn("mt-12 grid gap-3 sm:grid-cols-2", channels.length === 5 ? "lg:grid-cols-5" : "lg:grid-cols-4")} aria-label="İletişim kanalları">
          {channels.map((c) => (
            <li key={c.label} className="min-w-0">
              <a
                href={c.href}
                {...(c.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                data-umami-event={c.event}
                data-umami-event-konum="footer"
                className="group flex min-h-16 items-center gap-3.5 rounded-2xl bg-white p-3 pr-4 shadow-[0_0_0_1px_rgb(1_20_65/0.07)] transition-shadow duration-300 hover:shadow-[0_0_0_1px_rgb(42_106_202/0.35),0_14px_30px_-20px_rgb(1_20_65/0.35)]"
              >
                <span aria-hidden className={cn(iconBoxCls, "size-10 shrink-0")}>
                  {c.icon}
                </span>
                <span className="min-w-0 leading-tight">
                  <span className="block text-[12.5px] text-muted">{c.label}</span>
                  <span className="block truncate text-[14.5px] font-medium text-heading transition-colors group-hover:text-brand">{c.value}</span>
                </span>
              </a>
            </li>
          ))}
        </ul>

        <div className="mt-10 grid gap-4 border-t border-[rgb(1_20_65/0.08)] pt-6 text-[13px] text-muted xl:flex xl:items-center xl:justify-between">
          <p>
            © {year} {site.name}. Tüm hakları saklıdır. <span className="whitespace-nowrap">{site.tagline}</span>
          </p>
          {/* Blog bilerek burada, yasal bağlantıların solunda: menüde öne çıkmaz */}
          <nav aria-label="Alt bağlantılar">
            <ul className="flex flex-wrap gap-x-5 gap-y-1">
              {showBlog && (
                <li>
                  <Link href="/blog" className="inline-flex min-h-9 items-center transition-colors hover:text-brand">
                    Blog
                  </Link>
                </li>
              )}
              {LEGAL_PAGES.map((p) => (
                <li key={p.slug}>
                  <Link href={`/yasal/${p.slug}`} className="inline-flex min-h-9 items-center transition-colors hover:text-brand">
                    {p.label}
                  </Link>
                </li>
              ))}
              <li>
                <CookiePrefsButton className="inline-flex min-h-9 cursor-pointer items-center transition-colors hover:text-brand" />
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </footer>
  );
}
