import type { Metadata, Viewport } from "next";
import { SiteShell } from "@/components/site/SiteShell";
import { site } from "@/lib/data";
import "../globals.css";

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

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return <SiteShell>{children}</SiteShell>;
}
