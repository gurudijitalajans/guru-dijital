import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import Script from "next/script";
import { MotionConfig } from "motion/react";
import { AnnounceBar } from "@/components/site/AnnounceBar";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { ContactTab } from "@/components/site/ContactTab";
import { MobileCtaBar } from "@/components/layout/MobileCtaBar";
import { site, umami } from "@/lib/data";
import "./globals.css";

/* Outfit: ücretsiz, Türkçe karakter destekli; sabit ağırlık dosyaları yerelden.
   (EDME'nin Nexa'sına en yakın açık lisanslı yazı tipi.) */
const outfit = localFont({
  variable: "--font-outfit",
  display: "swap",
  src: [
    { path: "../fonts/Outfit-Light.ttf", weight: "300", style: "normal" },
    { path: "../fonts/Outfit-Regular.ttf", weight: "400", style: "normal" },
    { path: "../fonts/Outfit-Medium.ttf", weight: "500", style: "normal" },
    { path: "../fonts/Outfit-SemiBold.ttf", weight: "600", style: "normal" },
    { path: "../fonts/Outfit-Bold.ttf", weight: "700", style: "normal" },
  ],
});

/* Site geneli varsayılanlar. og:title / og:url / twitter:title BİLEREK
   verilmez: Next bunları her sayfanın çözümlenmiş başlığından türetir.
   Sayfalar canonical + OG için src/lib/seo.ts pageMetadata() kullanır. */
export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} | ${site.tagline}`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  openGraph: {
    type: "website",
    locale: "tr_TR",
    siteName: site.name,
    description: site.description,
    images: [{ url: "/og.jpg", width: 1200, height: 630, alt: site.name }],
  },
  twitter: {
    card: "summary_large_image",
    description: site.description,
    images: ["/og.jpg"],
  },
  icons: {
    icon: [{ url: "/icon.png", type: "image/png" }],
    apple: [{ url: "/apple-icon.png" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: site.name,
  url: site.url,
  logo: `${site.url}/icon.png`,
  email: site.email,
  sameAs: [site.instagram],
  description: site.description,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="tr" className={`${outfit.variable} h-full`}>
      <body className="flex min-h-full flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
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
          <AnnounceBar />
          <SiteHeader />
          <main id="icerik" tabIndex={-1} className="flex-1 outline-none">
            {children}
          </main>
          <SiteFooter />
          <ContactTab />
          <MobileCtaBar />
        </MotionConfig>
        {/* Umami ziyaretçi sayımı: tarayıcının "takip etme" tercihine uyar */}
        <Script
          src={umami.scriptUrl}
          data-website-id={umami.websiteId}
          data-domains={umami.domains}
          data-do-not-track="true"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
