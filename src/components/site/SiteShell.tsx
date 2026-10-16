import { MotionConfig } from "motion/react";
import { AnnounceBar } from "@/components/site/AnnounceBar";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { ContactTab } from "@/components/site/ContactTab";
import { WhatsAppButton } from "@/components/site/WhatsAppButton";
import { CookieConsentBanner } from "@/components/site/CookieConsent";
import { ScrollReset } from "@/components/site/ScrollReset";
import { HyphenGuard } from "@/components/site/HyphenGuard";
import { MobileCtaBar } from "@/components/layout/MobileCtaBar";
import { PanelBar } from "@/components/site/PanelBar";
import { ChatWidget } from "@/components/site/ChatWidget";
import { getChatInfo, getPublishedPostCount, getSiteInfo } from "@/lib/cms";
import { getAbout, getProducts, getServices } from "@/lib/content";
import { outfit } from "@/lib/fonts";
import { buildNavMenu, site } from "@/lib/data";
import { isPreview } from "@/lib/preview";

/**
 * Sitenin html/body iskeleti: duyuru bandı, üst menü, içerik, alt bilgi ve
 * sabit iletişim öğeleri (sohbet balonu panelde açıksa). Site layout'u ve global 404 aynı kabuğu kullanır.
 * Duyuru metni, iletişim bilgileri, menüdeki hizmet ve ürünler panelden gelir; blog
 * bağlantısı yayında yazı varken alt bilgide görünür.
 */
export async function SiteShell({ children }: { children: React.ReactNode }) {
  const [info, postCount, services, products, about, preview, chat] = await Promise.all([
    getSiteInfo(),
    getPublishedPostCount(),
    getServices(),
    getProducts(),
    getAbout(),
    isPreview(),
    getChatInfo(),
  ]);
  const firstAward = about.awards.items[0];
  const footerBadge = firstAward ? `${firstAward.year} ${firstAward.title}` : undefined;
  const showBlog = postCount > 0;
  /* Blog üst menüde yok (kullanıcı isteği): alt bilgide yasal bağlantıların solunda */
  const menu = buildNavMenu(services, products);
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
    <html lang="tr" className={`${outfit.variable} h-full`} data-scroll-behavior="smooth">
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
          {info.announcement.enabled && <AnnounceBar messages={info.announcement.messages} />}
          <SiteHeader menu={menu} />
          <main id="icerik" tabIndex={-1} className="flex-1 outline-none">
            {children}
          </main>
          <SiteFooter
            email={info.email}
            instagram={info.instagram}
            phone={info.phone}
            mobile={info.mobile}
            whatsapp={info.whatsapp}
            showBlog={showBlog}
            services={footerServices}
            products={footerProducts}
            badge={footerBadge}
          />
          <ContactTab />
          <WhatsAppButton number={info.whatsapp} chat={Boolean(chat)} />
          <MobileCtaBar mobile={info.mobile} />
          <PanelBar preview={preview} />
          {chat && <ChatWidget info={chat} />}
          <CookieConsentBanner />
          <ScrollReset />
          <HyphenGuard />
        </MotionConfig>
      </body>
    </html>
  );
}
