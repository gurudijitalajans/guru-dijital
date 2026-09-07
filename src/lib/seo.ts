import type { Metadata } from "next";
import { site } from "@/lib/data";

export type PageMetadataInput = {
  /** Sayfa başlığı; absoluteTitle değilse kök şablon "| Guru Dijital Ajans" ekler */
  title: string;
  /** 140-160 karakter hedeflenir */
  description: string;
  /** "/" ile başlayan yol; canonical ve og:url buradan türer */
  path: string;
  absoluteTitle?: boolean;
  /** Varsayılan /og.jpg; ürün/hizmet sayfaları özel görsel verebilir */
  image?: { url: string; width?: number; height?: number; alt?: string };
};

/**
 * Sayfa bazlı metadata: canonical + Open Graph + Twitter alanlarını tek yerden,
 * tutarlı üretir. Kök layout metadataBase'i site.url olduğundan yollar görelidir.
 */
export function pageMetadata({ title, description, path, absoluteTitle, image }: PageMetadataInput): Metadata {
  const fullTitle = absoluteTitle ? title : `${title} | ${site.name}`;
  const img = image ?? { url: "/og.jpg", width: 1200, height: 630, alt: site.name };
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      locale: "tr_TR",
      siteName: site.name,
      url: path,
      title: fullTitle,
      description,
      images: [img],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [img.url],
    },
  };
}
