import type { MetadataRoute } from "next";
import { products, services, site } from "@/lib/data";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: site.url, lastModified, changeFrequency: "monthly", priority: 1 },
    { url: `${site.url}/hizmetler`, lastModified, changeFrequency: "monthly", priority: 0.9 },
    { url: `${site.url}/urunler`, lastModified, changeFrequency: "weekly", priority: 0.8 },
    { url: `${site.url}/hakkimizda`, lastModified, changeFrequency: "yearly", priority: 0.6 },
    { url: `${site.url}/iletisim`, lastModified, changeFrequency: "yearly", priority: 0.8 },
  ];

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

  return [...staticRoutes, ...serviceRoutes, ...productRoutes];
}
