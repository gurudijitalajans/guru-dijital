import { cache } from "react";
import { products as staticProducts } from "@/lib/data";
import { productDetails } from "@/lib/products-content";
import { productExtras } from "@/lib/product-extras";
import { iconNameOf } from "@/lib/icons";
import type { IconName } from "@/lib/icon-names";
import type { WorkImage } from "@/components/pages/hizmetler/service-showcase";
import type { FaqItem } from "@/components/site/FaqGrid";

/**
 * Ürün içeriğinin tek okuma noktası. Bu sürümde içerik koddan gelir
 * (data.ts, products-content.ts, product-extras.ts); panel bağlandığında
 * aynı ProductView biçimini panelden doldurur, sayfalar değişmez.
 */

export type ProductView = {
  slug: string;
  name: string;
  tagline: string;
  desc: string;
  highlights: string[];
  icon: IconName;
  image: WorkImage;
  seo: { title: string; description: string; keywords: string[] };
  hero: { eyebrow: string; headline: string; sub: string; ctaLabel: string };
  features: { icon: IconName; title: string; desc: string }[];
  steps: { title: string; desc: string }[];
  useCases: { title: string; desc: string }[];
  stats: { value: number; suffix: string; label: string }[];
  faq: FaqItem[];
  integrations: string[];
  trust: string[];
  /** Giriş görseli; yoksa ekran görüntüsü */
  heroVisual: WorkImage;
  /** Paylaşım görseli adresi; yoksa sitenin genel görseli */
  ogImage: string;
  tour: { title: string; src: string; poster: string } | null;
  showcase: { eyebrow: string; title: string; desc: string; bullets: string[]; image: WorkImage }[];
  comparison: { before: string[]; after: string[] };
  included: { icon: IconName; title: string; desc: string }[];
  /** Paket ürünlerde içerdiği ürünlerin adresleri */
  bundle: string[];
};

const PRODUCT_IMAGE = { w: 1600, h: 1100 };

/** product-extras.ts içeriğini görünüme çevirir */
function extrasView(slug: string, name: string, screenshot: WorkImage) {
  const x = productExtras[slug];
  if (!x) {
    return {
      trust: [],
      heroVisual: screenshot,
      ogImage: "/og.jpg",
      tour: null,
      showcase: [],
      comparison: { before: [], after: [] },
      included: [],
      bundle: [],
    };
  }
  return {
    trust: x.trust,
    heroVisual: x.heroVisual,
    ogImage: x.ogImage,
    tour: { title: x.video.title || `${name} Ürün Turu`, src: x.video.src, poster: x.video.poster },
    showcase: x.showcase,
    comparison: x.comparison,
    included: x.included,
    bundle: x.bundle ?? [],
  };
}

export const getProducts = cache(async (): Promise<ProductView[]> =>
  staticProducts.map((p) => {
    const d = productDetails[p.slug];
    const screenshot = { src: p.image, alt: p.imageAlt, ...PRODUCT_IMAGE };
    return {
      slug: p.slug,
      name: p.name,
      tagline: p.tagline,
      desc: p.desc,
      highlights: p.features,
      icon: iconNameOf(p.icon),
      image: screenshot,
      seo: d.seo,
      hero: d.hero,
      features: d.features.map((f) => ({ icon: iconNameOf(f.icon), title: f.title, desc: f.desc })),
      steps: d.steps,
      useCases: d.useCases,
      stats: d.stats,
      faq: d.faq,
      integrations: d.integrations,
      ...extrasView(p.slug, p.name, screenshot),
    };
  })
);

export async function getProduct(slug: string) {
  return (await getProducts()).find((p) => p.slug === slug) ?? null;
}
