import type { Metadata, Viewport } from "next";
import { outfit } from "@/lib/fonts";
import "../globals.css";

/**
 * Müşteri sitelerine gömülen çerçeveler (sohbet balonu, talep formu) için
 * yalın kök yerleşim: sitenin menüsü, alt bilgisi ve analiz betiği yok;
 * zemin saydam, arama motorlarına kapalı.
 */
export const metadata: Metadata = { robots: { index: false, follow: false } };
export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover" };

export default function EmbedLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className={outfit.variable} style={{ background: "transparent" }}>
      <body style={{ background: "transparent" }}>{children}</body>
    </html>
  );
}
