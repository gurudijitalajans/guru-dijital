import "server-only";
import { cache } from "react";
import { getPayload } from "payload";
import config from "@payload-config";
import { announcement as defaultAnnouncement, site } from "@/lib/data";

/**
 * Site tarafının panelle tek temas noktası. Veritabanına ulaşılamazsa
 * (ör. henüz bağlanmamış bir ortamda) site data.ts varsayılanlarıyla
 * çalışmaya devam eder; hiçbir sayfa panel yüzünden kırılmaz.
 */
export const cms = cache(() => getPayload({ config }));

export type SiteInfo = {
  announcement: { enabled: boolean; text: string };
  email: string;
  phone: string;
  whatsapp: string;
  address: string;
  instagram: string;
};

export const getSiteInfo = cache(async (): Promise<SiteInfo> => {
  const fallback: SiteInfo = {
    announcement: { enabled: true, text: defaultAnnouncement },
    email: site.email,
    phone: site.phone,
    whatsapp: site.whatsapp,
    address: site.address,
    instagram: site.instagram,
  };
  try {
    const payload = await cms();
    const s = await payload.findGlobal({ slug: "site-settings", depth: 0 });
    const c = s.contact ?? {};
    return {
      announcement: {
        enabled: s.announcement?.enabled ?? true,
        text: s.announcement?.text?.trim() || fallback.announcement.text,
      },
      email: c.email?.trim() || fallback.email,
      phone: c.phone?.trim() || fallback.phone,
      whatsapp: c.whatsapp?.trim() || fallback.whatsapp,
      address: c.address?.trim() || fallback.address,
      instagram: c.instagram?.trim() || fallback.instagram,
    };
  } catch {
    return fallback;
  }
});

/** Yayındaki yazı sayısı: blog bağlantısı yalnız en az bir yazı varken görünür. */
export const getPublishedPostCount = cache(async (): Promise<number> => {
  try {
    const payload = await cms();
    const { totalDocs } = await payload.count({ collection: "posts", where: { _status: { equals: "published" } } });
    return totalDocs;
  } catch {
    return 0;
  }
});
