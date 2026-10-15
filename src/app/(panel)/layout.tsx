import type { Metadata, Viewport } from "next";
import { Toaster } from "sonner";
import { outfit } from "@/lib/fonts";
import "./panel.css";

/** Yeni panelin kök yerleşimi: sitenin ve Payload'un stillerinden ayrı. Telefona
    "Ana ekrana ekle" ile uygulama olarak kurulur (public/panel.webmanifest). */
export const metadata: Metadata = {
  title: { default: "Guru Panel", template: "%s · Guru Panel" },
  robots: { index: false, follow: false },
  manifest: "/panel.webmanifest",
  applicationName: "Guru Panel",
  appleWebApp: { capable: true, title: "Guru Panel", statusBarStyle: "default" },
  icons: { icon: [{ url: "/panel-app/icon-192.png", type: "image/png" }], apple: [{ url: "/panel-app/apple-icon-180.png" }] },
};
export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover", themeColor: "#ffffff" };

export default function PanelRoot({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className={outfit.variable}>
      <body>
        {children}
        <Toaster position="bottom-right" toastOptions={{ style: { fontFamily: "var(--font-sans)" } }} />
      </body>
    </html>
  );
}
