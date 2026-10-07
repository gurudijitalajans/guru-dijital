import "server-only";
import { cache } from "react";
import { cms } from "@/lib/cms";
import { products as staticProducts, services as staticServices } from "@/lib/data";
import { productDetails } from "@/lib/products-content";
import { iconNameOf } from "@/lib/icons";
import { DEFAULT_ICON, isIconName, type IconName } from "@/lib/icon-names";
import { serviceVisuals, type WorkImage } from "@/components/pages/hizmetler/service-showcase";
import { serviceFaq } from "@/components/pages/hizmetler/service-faq";
import type { FaqItem } from "@/components/site/FaqGrid";
import type { Media, Product, Service } from "@/payload-types";

/**
 * Hizmet ve ürün içeriğinin tek kaynağı: panel (Payload). Panel
 * ulaşılamıyorsa ya da henüz içerik girilmemişse site, kodda duran
 * varsayılan içerikle (data.ts, products-content.ts) çalışır; böylece
 * veritabanı bağlanmamış bir ortamda da hiçbir sayfa kırılmaz.
 */

export type ServiceView = {
  slug: string;
  /** Sıra numarası: "01", "02"… */
  no: string;
  title: string;
  headline: string;
  short: string;
  icon: IconName;
  intro: string[];
  offeringsTitle: string;
  offerings: string[];
  keywords: string[];
  card: WorkImage | null;
  gallery: WorkImage[];
  faq: FaqItem[];
  seoDescription?: string;
  sections: { cases: boolean; webProjects: boolean };
};

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
};

const pad = (n: number) => String(n).padStart(2, "0");
const texts = (rows?: { text?: string | null }[] | null) =>
  (rows ?? []).map((r) => r.text?.trim() ?? "").filter(Boolean);
const iconOf = (v: unknown): IconName => (isIconName(v) ? v : DEFAULT_ICON);

/** Medya kaydı → görsel; odak noktası CSS object-position olur */
function toImage(m: number | Media | null | undefined, fallbackAlt = ""): WorkImage | null {
  if (!m || typeof m !== "object" || !m.url) return null;
  const focal = m.focalX != null && m.focalY != null ? `${m.focalX}% ${m.focalY}%` : undefined;
  return {
    src: m.url,
    alt: m.alt || fallbackAlt,
    w: m.width ?? 1600,
    h: m.height ?? 1100,
    ...(focal && focal !== "50% 50%" ? { position: focal } : {}),
  };
}

/* ------------------------------------------------------------------ */
/*  Kod içindeki varsayılan içerik                                     */
/* ------------------------------------------------------------------ */

const PRODUCT_IMAGE = { w: 1600, h: 1100 };

export function fallbackServices(): ServiceView[] {
  return staticServices.map((s, i) => ({
    slug: s.slug,
    no: pad(i + 1),
    title: s.title,
    headline: s.headline,
    short: s.short,
    icon: iconNameOf(s.icon),
    intro: s.intro,
    offeringsTitle: s.offeringsTitle,
    offerings: s.offerings,
    keywords: s.keywords,
    card: serviceVisuals[s.slug]?.card ?? null,
    gallery: serviceVisuals[s.slug]?.gallery ?? [],
    faq: serviceFaq[s.slug] ?? [],
    seoDescription: s.seoDescription,
    sections: { cases: s.slug === "dijital-pazarlama", webProjects: s.slug === "web-tasarim" },
  }));
}

export function fallbackProducts(): ProductView[] {
  return staticProducts.map((p) => {
    const d = productDetails[p.slug];
    return {
      slug: p.slug,
      name: p.name,
      tagline: p.tagline,
      desc: p.desc,
      highlights: p.features,
      icon: iconNameOf(p.icon),
      image: { src: p.image, alt: p.imageAlt, ...PRODUCT_IMAGE },
      seo: d.seo,
      hero: d.hero,
      features: d.features.map((f) => ({ icon: iconNameOf(f.icon), title: f.title, desc: f.desc })),
      steps: d.steps,
      useCases: d.useCases,
      stats: d.stats,
      faq: d.faq,
      integrations: d.integrations,
    };
  });
}

/* ------------------------------------------------------------------ */
/*  Panelden okuma                                                     */
/* ------------------------------------------------------------------ */

function fromService(s: Service, i: number): ServiceView {
  return {
    slug: s.slug ?? String(s.id),
    no: pad(i + 1),
    title: s.title,
    headline: s.headline,
    short: s.short,
    icon: iconOf(s.icon),
    intro: texts(s.intro),
    offeringsTitle: s.offeringsTitle,
    offerings: texts(s.offerings),
    keywords: texts(s.keywords),
    card: toImage(s.cardImage, s.title),
    gallery: (s.gallery ?? []).map((g) => toImage(g.image, s.title)).filter((g): g is WorkImage => Boolean(g)),
    faq: (s.faq ?? []).map((f) => ({ q: f.q, a: f.a })),
    seoDescription: s.seoDescription || undefined,
    sections: { cases: Boolean(s.showCases), webProjects: Boolean(s.showWebProjects) },
  };
}

function fromProduct(p: Product): ProductView {
  const image = toImage(p.screenshot, `${p.name} paneli`) ?? { src: "/og.jpg", alt: p.name, w: 1200, h: 630 };
  return {
    slug: p.slug ?? String(p.id),
    name: p.name,
    tagline: p.tagline,
    desc: p.desc,
    highlights: texts(p.highlights),
    icon: iconOf(p.icon),
    image,
    seo: {
      title: p.seo?.title || `${p.name} | ${p.tagline}`,
      description: p.seo?.description || p.desc,
      keywords: (p.seo?.keywords ?? []).map((k) => k.text ?? "").filter(Boolean),
    },
    hero: {
      eyebrow: p.hero?.eyebrow || p.name,
      headline: p.hero?.headline || p.name,
      sub: p.hero?.sub || p.desc,
      ctaLabel: p.hero?.ctaLabel || "Demo Talep Et",
    },
    features: (p.features ?? []).map((f) => ({ icon: iconOf(f.icon), title: f.title, desc: f.desc })),
    steps: (p.steps ?? []).map((s) => ({ title: s.title, desc: s.desc })),
    useCases: (p.useCases ?? []).map((u) => ({ title: u.title, desc: u.desc })),
    stats: (p.stats ?? []).map((s) => ({ value: s.value, suffix: s.suffix ?? "", label: s.label })),
    faq: (p.faq ?? []).map((f) => ({ q: f.q, a: f.a })),
    integrations: texts(p.integrations),
  };
}

export const getServices = cache(async (): Promise<ServiceView[]> => {
  try {
    const payload = await cms();
    const res = await payload.find({
      collection: "services",
      where: { _status: { equals: "published" } },
      sort: "order",
      depth: 1,
      limit: 50,
      pagination: false,
    });
    if (res.docs.length > 0) return res.docs.map(fromService);
  } catch {
    /* panel yok: varsayılan içerik */
  }
  return fallbackServices();
});

export const getProducts = cache(async (): Promise<ProductView[]> => {
  try {
    const payload = await cms();
    const res = await payload.find({
      collection: "products",
      where: { _status: { equals: "published" } },
      sort: "order",
      depth: 1,
      limit: 50,
      pagination: false,
    });
    if (res.docs.length > 0) return res.docs.map(fromProduct);
  } catch {
    /* panel yok: varsayılan içerik */
  }
  return fallbackProducts();
});

export async function getService(slug: string) {
  return (await getServices()).find((s) => s.slug === slug) ?? null;
}

export async function getProduct(slug: string) {
  return (await getProducts()).find((p) => p.slug === slug) ?? null;
}
