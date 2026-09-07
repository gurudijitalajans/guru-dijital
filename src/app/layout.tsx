import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Poppins } from "next/font/google";
import { MotionConfig } from "motion/react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { MobileCtaBar } from "@/components/layout/MobileCtaBar";
import { SmoothScroll } from "@/components/fx/SmoothScroll";
import { CustomCursor } from "@/components/fx/CustomCursor";
import { GooDefs } from "@/components/fx/GooDefs";
import { GooTrail } from "@/components/fx/GooTrail";
import { Preloader } from "@/components/fx/Preloader";
import { GrainOverlay } from "@/components/fx/GrainOverlay";
import { ScrollProgress } from "@/components/fx/ScrollProgress";
import { site } from "@/lib/data";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

/* Site geneli varsayılanlar. og:title / og:url / twitter:title BİLEREK
   verilmez: Next bunları her sayfanın çözümlenmiş başlığından türetir; sabit
   string verilseydi iç sayfalarda ana sayfa başlığı görünürdü. Sayfalar
   canonical + OG için src/lib/seo.ts pageMetadata() kullanır. */
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
    apple: [{ url: "/icon.png" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#f6f7f6",
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

/* Hydration öncesi çalışan tema/preloader hazırlığı:
   - Varsayılan gündüz; yalnız kayıtlı "dark" tercihi geceyi açar.
   - Tarayıcı çubuğu rengi (meta theme-color) temayla eşlenir.
   - Bu oturumda preloader zaten oynatıldıysa html[data-preloaded] ile perde
     hydration beklenmeden gizlenir (tekrar ziyaretlerde perde flaşı yok). */
const themeInit = `try{var d=document.documentElement,t=localStorage.getItem("guru-theme");if(t!=="dark")d.classList.add("light");var m=document.querySelector('meta[name="theme-color"]');if(m)m.setAttribute("content",t==="dark"?"#0e100f":"#f6f7f6")}catch(e){document.documentElement.classList.add("light")}try{if(sessionStorage.getItem("guru-preloaded")==="1")document.documentElement.setAttribute("data-preloaded","")}catch(e){}`;

/* Preloader perdesi: JS yokken ve tekrar ziyaretlerde (data-preloaded) gizli. */
const preloaderCss = "html[data-preloaded] #guru-preloader{display:none}";

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="tr" suppressHydrationWarning className={`${poppins.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <Script id="guru-theme-init" strategy="beforeInteractive">
          {themeInit}
        </Script>
        <noscript>
          <style>{"#guru-preloader{display:none}"}</style>
        </noscript>
        <style>{preloaderCss}</style>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {/* Klavye kullanıcıları için ilk odaklanabilir öğe */}
        <a
          href="#icerik"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-full focus:bg-guru focus:px-5 focus:py-3 focus:text-sm focus:font-semibold focus:text-ink focus:shadow-soft"
        >
          İçeriğe geç
        </a>
        {/* reducedMotion="user": transform/layout animasyonları tercihe göre
            motion tarafından atlanır (opacity kalır); SSR çıktısı değişmez,
            bileşenlerde initial dallanması gerekmez (hydration güvenli). */}
        <MotionConfig reducedMotion="user">
          <Preloader />
          <GooDefs />
          <GooTrail />
          <CustomCursor />
          <ScrollProgress />
          <GrainOverlay />
          <SmoothScroll>
            <Navbar />
            <main id="icerik" tabIndex={-1} className="flex-1 outline-none">
              {children}
            </main>
            <Footer />
            <MobileCtaBar />
          </SmoothScroll>
        </MotionConfig>
      </body>
    </html>
  );
}
