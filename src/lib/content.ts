import "server-only";
import { cache } from "react";
import { cms } from "@/lib/cms";
import {
  caseStudies as staticCases,
  products as staticProducts,
  references as staticReferences,
  services as staticServices,
  team as staticTeam,
  testimonials as staticTestimonials,
} from "@/lib/data";
import { ABOUT_DEFAULTS, type AboutContent } from "@/lib/about-defaults";
import { HOME_DEFAULTS, type HomeContent } from "@/lib/home-defaults";
import { productDetails } from "@/lib/products-content";
import { productExtras } from "@/lib/product-extras";
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
  /* Ürün sayfası ek bölümleri (panel > Ürünler; yedek: product-extras.ts) */
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

const PRODUCT_IMAGE = { w: 1600, h: 1000 };

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
      ...extrasView(p.slug, p.name, { src: p.image, alt: p.imageAlt, ...PRODUCT_IMAGE }),
    };
  });
}

/** product-extras.ts yedeğini görünüme çevirir */
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
    trust: texts(p.hero?.trust),
    heroVisual: toImage(p.heroVisual, `${p.name} paneli`) ?? image,
    ogImage: (typeof p.ogImage === "object" && p.ogImage?.url) || productExtras[p.slug ?? ""]?.ogImage || "/og.jpg",
    tour:
      p.tour?.show !== false && p.tour?.videoUrl
        ? {
            title: p.tour.title || `${p.name} Ürün Turu`,
            src: p.tour.videoUrl,
            poster: (typeof p.tour.poster === "object" && p.tour.poster?.url) || productExtras[p.slug ?? ""]?.video.poster || "",
          }
        : null,
    showcase: (p.showcase ?? [])
      .map((x) => {
        const img = toImage(x.image, x.title);
        return img
          ? { eyebrow: x.eyebrow ?? "", title: x.title, desc: x.desc, bullets: texts(x.bullets), image: img }
          : null;
      })
      .filter((x): x is NonNullable<typeof x> => Boolean(x)),
    comparison: { before: texts(p.comparison?.before), after: texts(p.comparison?.after) },
    included: (p.included ?? []).map((i) => ({ icon: iconOf(i.icon), title: i.title, desc: i.desc })),
    bundle: (p.bundle ?? [])
      .map((b) => (typeof b === "object" && b ? b.slug : null))
      .filter((b): b is string => Boolean(b)),
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

/* ------------------------------------------------------------------ */
/*  Ana sayfa, ekip, referanslar                                       */
/* ------------------------------------------------------------------ */

export type TeamView = { name: string; role: string; linkedin: string | null; photo: WorkImage | null; showOnHome: boolean };
export type ReferenceView = { name: string; logo: WorkImage | null };

/**
 * Kaydedilmiş değeri varsayılanın üstüne yazar. Yalnız null/undefined
 * varsayılana düşer; bilerek boşaltılan metin boş kalır.
 */
function overlay<T>(base: T, saved: unknown): T {
  if (saved === null || saved === undefined) return base;
  if (Array.isArray(base)) return (Array.isArray(saved) ? saved : base) as T;
  if (typeof base === "object" && base !== null) {
    const out: Record<string, unknown> = { ...(base as Record<string, unknown>) };
    for (const key of Object.keys(out)) out[key] = overlay(out[key], (saved as Record<string, unknown>)[key]);
    return out as T;
  }
  return saved as T;
}

export const getHome = cache(async (): Promise<HomeContent> => {
  try {
    const payload = await cms();
    const doc = await payload.findGlobal({ slug: "home-page", depth: 0 });
    /* Hiç kaydedilmemişse varsayılanlar; kaydedildiyse panel değerleri */
    if (!doc?.updatedAt) return HOME_DEFAULTS;
    const merged = overlay(HOME_DEFAULTS, doc);
    merged.faq.items = (merged.faq.items ?? []).map((f) => ({ q: f.q, a: f.a }));
    return merged;
  } catch {
    return HOME_DEFAULTS;
  }
});

export const getTeam = cache(async (): Promise<TeamView[]> => {
  try {
    const payload = await cms();
    const res = await payload.find({ collection: "team", sort: "order", depth: 1, limit: 100, pagination: false });
    if (res.docs.length > 0)
      return res.docs.map((m) => ({
        name: m.name,
        role: m.role,
        linkedin: m.linkedin || null,
        photo: toImage(m.photo, m.name),
        showOnHome: m.showOnHome !== false,
      }));
  } catch {
    /* panel yok: varsayılan içerik */
  }
  return staticTeam.map((m) => ({ name: m.name, role: m.role, linkedin: m.linkedin ?? null, photo: null, showOnHome: true }));
});

export const getReferences = cache(async (): Promise<ReferenceView[]> => {
  try {
    const payload = await cms();
    const res = await payload.find({ collection: "references", sort: "order", depth: 1, limit: 200, pagination: false });
    if (res.docs.length > 0) return res.docs.map((r) => ({ name: r.name, logo: toImage(r.logo, r.name) }));
  } catch {
    /* panel yok: varsayılan içerik */
  }
  return staticReferences.map((name) => ({ name, logo: null }));
});

/* ------------------------------------------------------------------ */
/*  Vaka çalışmaları, müşteri yorumları, hakkımızda                    */
/* ------------------------------------------------------------------ */

type StatView = { label: string; value: number; prefix: string; suffix: string };
export type CaseView = {
  id: string;
  sector: string;
  title: string;
  summary: string;
  note: string;
  /** Kartta gösterilecek en çok üç sonuç */
  featured: StatView[];
  showOnHome: boolean;
};
export type TestimonialView = {
  /** Yalnız yayın izni işaretliyse dolu */
  quote: string | null;
  name: string;
  title: string;
  company: string;
  photo: WorkImage | null;
};

/* Kod içindeki vakalarda kartta gösterilen sonuçlar (önceki sayfa düzeni) */
const STATIC_FEATURED: Record<string, number[]> = { klinik: [0, 1, 5], eticaret: [0, 1, 2] };

function pickFeatured(stats: (StatView & { featured?: boolean | null })[]): StatView[] {
  const chosen = stats.filter((s) => s.featured);
  return (chosen.length > 0 ? chosen : stats).slice(0, 3).map(({ label, value, prefix, suffix }) => ({ label, value, prefix, suffix }));
}

export const getCases = cache(async (): Promise<CaseView[]> => {
  try {
    const payload = await cms();
    const res = await payload.find({ collection: "case-studies", sort: "order", depth: 0, limit: 50, pagination: false });
    if (res.docs.length > 0)
      return res.docs.map((c) => ({
        id: String(c.id),
        sector: c.sector,
        title: c.title,
        summary: c.summary,
        note: c.note ?? "",
        featured: pickFeatured(
          (c.stats ?? []).map((s) => ({ label: s.label, value: s.value, prefix: s.prefix ?? "", suffix: s.suffix ?? "", featured: s.featured }))
        ),
        showOnHome: c.showOnHome !== false,
      }));
  } catch {
    /* panel yok: varsayılan içerik */
  }
  return staticCases.map((c) => ({
    id: c.id,
    sector: c.sector,
    title: c.title,
    summary: c.summary,
    note: c.note,
    featured: (STATIC_FEATURED[c.id] ?? [0, 1, 2])
      .map((i) => c.stats[i])
      .filter(Boolean)
      .map((s) => ({ label: s.label, value: s.value, prefix: s.prefix ?? "", suffix: s.suffix })),
    showOnHome: true,
  }));
});

export const getTestimonials = cache(async (): Promise<TestimonialView[]> => {
  try {
    const payload = await cms();
    const res = await payload.find({ collection: "testimonials", sort: "order", depth: 1, limit: 50, pagination: false });
    if (res.docs.length > 0)
      return res.docs.map((t) => ({
        quote: t.consent && t.quote?.trim() ? t.quote.trim() : null,
        name: t.name,
        title: t.title ?? "",
        company: t.company ?? "",
        photo: toImage(t.photo, t.name),
      }));
  } catch {
    /* panel yok: varsayılan içerik */
  }
  return staticTestimonials.map((t) => ({ quote: null, name: t.name, title: t.title, company: t.company, photo: null }));
});

export const getAbout = cache(async (): Promise<AboutContent> => {
  try {
    const payload = await cms();
    const doc = await payload.findGlobal({ slug: "about-page", depth: 1 });
    if (!doc?.updatedAt) return ABOUT_DEFAULTS;
    const merged = overlay(ABOUT_DEFAULTS, doc);
    /* Listeler panel biçiminden site biçimine */
    merged.story.paragraphs = doc.story?.paragraphs
      ? doc.story.paragraphs.map((p) => p.text).filter(Boolean)
      : ABOUT_DEFAULTS.story.paragraphs;
    merged.story.values = doc.story?.values
      ? doc.story.values.map((v) => ({ icon: iconOf(v.icon), title: v.title, desc: v.desc }))
      : ABOUT_DEFAULTS.story.values;
    merged.awards.items = doc.awards?.items
      ? doc.awards.items.map((a) => ({
          title: a.title,
          year: a.year,
          desc: a.desc,
          badge: a.badge ?? "",
          icon: iconOf(a.icon),
          image: toImage(a.image, a.title),
        }))
      : ABOUT_DEFAULTS.awards.items;
    return merged;
  } catch {
    return ABOUT_DEFAULTS;
  }
});
