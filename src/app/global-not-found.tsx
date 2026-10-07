import type { Metadata } from "next";
import { NotFoundContent } from "@/components/site/NotFoundContent";
import { SiteShell } from "@/components/site/SiteShell";
import "./globals.css";

/* Site ve panel ayrı kök layout'lara sahip olduğu için eşleşmeyen her adres
   buraya düşer (next.config: experimental.globalNotFound). Layout atlandığı
   için kabuk ve stiller burada yeniden yüklenir. */
export const metadata: Metadata = {
  title: "Sayfa Bulunamadı | Guru Dijital Ajans",
  description:
    "Aradığınız sayfa bulunamadı ya da adresi değişti. Ana sayfaya dönün veya projenizi konuşmak için bize ulaşın.",
  robots: { index: false },
};

export default function GlobalNotFound() {
  return (
    <SiteShell>
      <NotFoundContent />
    </SiteShell>
  );
}
