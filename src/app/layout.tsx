import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { site } from "@/lib/data";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "Guru Dijital Ajans — unlock the next level",
    template: "%s | Guru Dijital Ajans",
  },
  description: site.description,
  keywords: [
    "dijital ajans",
    "sosyal medya yönetimi",
    "grafik tasarım",
    "web tasarım",
    "dijital pazarlama",
    "içerik üretimi",
    "video tasarımı",
  ],
  openGraph: {
    type: "website",
    locale: "tr_TR",
    url: site.url,
    siteName: site.name,
    title: "Guru Dijital Ajans — unlock the next level",
    description: site.description,
    images: [{ url: "/og.jpg", width: 1200, height: 630, alt: "Guru Dijital Ajans" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Guru Dijital Ajans",
    description: site.description,
    images: ["/og.jpg"],
  },
  icons: {
    icon: [{ url: "/icon.png", type: "image/png" }],
    apple: [{ url: "/icon.png" }],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#0e100f",
  width: "device-width",
  initialScale: 1,
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
    <html lang="tr" className={`${poppins.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
