import type { Metadata, Viewport } from "next";
import { Toaster } from "sonner";
import { outfit } from "@/lib/fonts";
import "./panel.css";

/** Yeni panelin kök yerleşimi: sitenin ve Payload'un stillerinden ayrı */
export const metadata: Metadata = { title: { default: "Guru Panel", template: "%s · Guru Panel" }, robots: { index: false, follow: false } };
export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover" };

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
