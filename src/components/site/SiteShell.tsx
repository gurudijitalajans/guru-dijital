import { MotionConfig } from "motion/react";
import { AnnounceBar } from "@/components/site/AnnounceBar";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { ContactTab } from "@/components/site/ContactTab";
import { MobileCtaBar } from "@/components/layout/MobileCtaBar";
import { getPublishedPostCount, getSiteInfo } from "@/lib/cms";
import { getProducts, getServices } from "@/lib/content";
import { outfit } from "@/lib/fonts";
import { buildNavMenu, site } from "@/lib/data";

/**
 * Sitenin html/body iskeleti: duyuru bandı, üst menü, içerik, alt bilgi ve
 * sabit iletişim öğeleri. Site layout'u ve global 404 aynı kabuğu kullanır.
 * Duyuru metni, iletişim bilgileri, menüdeki hizmet ve ürünler ile blog
 * bağlantısı panelden gelir.
 */
export async function SiteShell({ children }: { children: React.ReactNode }) {
  const [info, postCount, services, products] = await Promise.all([
    getSiteInfo(),
    getPublishedPostCount(),
    getServices(),
    getProducts(),
  ]);
  const showBlog = postCount > 0;
  const menu = buildNavMenu(services, products);
  if (showBlog) menu.push({ label: "Blog", href: "/blog" });
  const footerServices = services.map((s) => ({ title: s.title, slug: s.slug }));
  const footerProducts = products.map((p) => ({ name: p.name, slug: p.slug }));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: site.name,
    url: site.url,
    logo: `${site.url}/icon.png`,
    email: info.email,
    ...(info.phone ? { telephone: info.phone } : {}),
    sameAs: [info.instagram],
    description: site.description,
  };

  return (
    <html lang="tr" className={`${outfit.variable} h-full`}>
      <body className="flex min-h-full flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
        />
        {/* Klavye kullanıcıları için ilk odaklanabilir öğe */}
        <a
          href="#icerik"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-full focus:bg-navy focus:px-5 focus:py-3 focus:text-sm focus:font-medium focus:text-white"
        >
          İçeriğe geç
        </a>
        {/* reducedMotion="user": hareket azaltma tercihinde transform animasyonları
            atlanır; SSR çıktısı değişmez (hydration güvenli). */}
        <MotionConfig reducedMotion="user">
          {info.announcement.enabled && <AnnounceBar text={info.announcement.text} />}
          <SiteHeader menu={menu} />
          <main id="icerik" tabIndex={-1} className="flex-1 outline-none">
            {children}
          </main>
          <SiteFooter
            email={info.email}
            instagram={info.instagram}
            showBlog={showBlog}
            services={footerServices}
            products={footerProducts}
          />
          <ContactTab whatsapp={info.whatsapp} />
          <MobileCtaBar />
        </MotionConfig>
      </body>
    </html>
  );
}
