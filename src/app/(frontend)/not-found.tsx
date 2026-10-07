import { NotFoundContent } from "@/components/site/NotFoundContent";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sayfa Bulunamadı",
  description:
    "Aradığınız sayfa bulunamadı ya da adresi değişti. Ana sayfaya dönün veya projenizi konuşmak için bize ulaşın.",
};

export default function NotFound() {
  return <NotFoundContent />;
}
