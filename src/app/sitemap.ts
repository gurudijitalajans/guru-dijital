import type { MetadataRoute } from "next";
import { site } from "@/lib/data";
import { getProducts, getServices } from "@/lib/content";
import { getPublishedPosts } from "@/lib/blog";

/* Sabit sayfaların lastmod tarihi elle güncellenir; her istekte "bugün"
   yazmak lastmod sinyalini anlamsızlaştırırdı. Hizmet, ürün ve blog
   adresleri panelden gelir. */
const CONTENT_UPDATED = "2026-09-07";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date(CONTENT_UPDATED);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: site.url, lastModified, changeFrequency: "monthly", priority: 1 },
    { url: `${site.url}/hizmetler`, lastModified, changeFrequency: "monthly", priority: 0.9 },
    { url: `${site.url}/urunler`, lastModified, changeFrequency: "weekly", priority: 0.8 },
    { url: `${site.url}/hakkimizda`, lastModified, changeFrequency: "yearly", priority: 0.6 },
    { url: `${site.url}/iletisim`, lastModified, changeFrequency: "yearly", priority: 0.8 },
  ];

  const [services, products] = await Promise.all([getServices(), getProducts()]);
  const serviceRoutes: MetadataRoute.Sitemap = services.map((s) => ({
    url: `${site.url}/hizmetler/${s.slug}`,
    lastModified,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const productRoutes: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${site.url}/urunler/${p.slug}`,
    lastModified,
    changeFrequency: "monthly",
    priority: 0.85,
  }));

  /* Blog: panelden; yazı yoksa liste sayfası da eklenmez */
  const posts = await getPublishedPosts();
  const blogRoutes: MetadataRoute.Sitemap = posts.length
    ? [
        { url: `${site.url}/blog`, lastModified: new Date(posts[0].updatedAt), changeFrequency: "weekly", priority: 0.7 },
        ...posts.map((p) => ({
          url: `${site.url}/blog/${p.slug}`,
          lastModified: new Date(p.updatedAt),
          changeFrequency: "monthly" as const,
          priority: 0.6,
        })),
      ]
    : [];

  return [...staticRoutes, ...serviceRoutes, ...productRoutes, ...blogRoutes];
}
