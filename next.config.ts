import path from "path";
import { fileURLToPath } from "url";
import type { NextConfig } from "next";
import { withPayload } from "@payloadcms/next/withPayload";

const dirname = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  /* Site ve panel iki ayrı kök layout kullanır; eşleşmeyen adresler için
     tek 404 sayfası app/global-not-found.tsx'te. */
  experimental: { globalNotFound: true },
  /* Canlıda panel görselleri Vercel Blob adresinden gelir */
  images: { remotePatterns: [{ protocol: "https", hostname: "*.public.blob.vercel-storage.com" }] },
  turbopack: { root: path.resolve(dirname) },
  /* PDF metni (bilgi tabanına belge) sunucuda paketlenmeden yüklenir */
  serverExternalPackages: ["unpdf"],
  /* Geliştirme simgesi gömülü sohbet çerçevesinde balonun üstüne biniyordu */
  devIndicators: false,
  /* Günlük işler yeni panelde (/panel): eski ekranlar ve listeler oraya gider.
     Kişi ve firma düzenleme formu, ayar ve içerik ekranları Payload'da kalır. */
  async redirects() {
    const to = (source: string, destination: string) => ({ source, destination, permanent: false });
    const id = ":id(\\d+)";
    return [
      to("/admin/satis-hatti", "/panel/firsatlar"),
      to("/admin/operasyon", "/panel/gorevler"),
      to("/admin/ekip-plani", "/panel/ekip-yuku"),
      to("/admin/sohbetler", "/panel/gelen?f=sohbet"),
      to("/admin/sohbet-raporu", "/panel/sohbet-raporu"),
      to("/admin/yonetici", "/panel/ozet"),
      to("/admin/analiz", "/panel/ziyaretci"),
      to("/admin/collections/leads", "/panel/gelen?f=talep"),
      to(`/admin/collections/leads/${id}`, "/panel/gelen?f=tumu&s=t:id"),
      to("/admin/collections/bookings", "/panel/gelen?f=randevu"),
      to(`/admin/collections/bookings/${id}`, "/panel/gelen?f=tumu&s=r:id"),
      to("/admin/collections/conversations", "/panel/gelen?f=sohbet"),
      to(`/admin/collections/conversations/${id}`, "/panel/gelen?f=tumu&s=s:id"),
      to("/admin/collections/deals", "/panel/firsatlar"),
      to(`/admin/collections/deals/${id}`, "/panel/firsatlar?firsat=:id"),
      to("/admin/collections/contacts", "/panel/kisiler"),
      to("/admin/collections/companies", "/panel/kisiler?gorunum=firmalar"),
      to("/admin/collections/quotes", "/panel/teklifler"),
      to("/admin/collections/quotes/create", "/panel/teklifler/yeni"),
      to(`/admin/collections/quotes/${id}`, "/panel/teklifler/:id"),
      to("/admin/collections/projects", "/panel/projeler"),
      to(`/admin/collections/projects/${id}`, "/panel/projeler?proje=:id"),
      to("/admin/collections/tasks", "/panel/gorevler"),
      to(`/admin/collections/tasks/${id}`, "/panel/gorevler?gorev=:id"),
      to("/admin/collections/activities", "/panel/takvim"),
      to("/admin/collections/media", "/panel/medya"),
      to("/admin/globals/home-page", "/panel/duzenle/home-page"),
      to("/admin/globals/about-page", "/panel/duzenle/about-page"),
      to("/admin/globals/site-settings", "/panel/duzenle/site-settings"),
      to("/admin/collections/services", "/panel/icerik?tur=hizmetler"),
      to("/admin/collections/products", "/panel/icerik?tur=urunler"),
      to("/admin/collections/posts", "/panel/icerik?tur=blog"),
      ...(
        [
          ["team", "ekip"],
          ["references", "referanslar"],
          ["testimonials", "yorumlar"],
          ["case-studies", "vakalar"],
        ] as const
      ).flatMap(([slug, tur]) => [
        to(`/admin/collections/${slug}`, `/panel/icerik?tur=${tur}`),
        to(`/admin/collections/${slug}/create`, `/panel/icerik?tur=${tur}&kayit=yeni`),
        to(`/admin/collections/${slug}/${id}`, `/panel/icerik?tur=${tur}&kayit=:id`),
      ]),
    ];
  },
  webpack: (config) => {
    config.resolve.extensionAlias = {
      ".cjs": [".cts", ".cjs"],
      ".js": [".ts", ".tsx", ".js", ".jsx"],
      ".mjs": [".mts", ".mjs"],
    };
    return config;
  },
};

export default withPayload(nextConfig, { devBundleServerPackages: false });
