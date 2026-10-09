import "server-only";
import { cache } from "react";
import { getPayload } from "payload";
import config from "@payload-config";
import { announcement as defaultAnnouncement, site, umami } from "@/lib/data";

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
  /** Umami betiği: yalnız açık ve site kimliği doluysa */
  analytics: { websiteId: string; scriptUrl: string; domains: string } | null;
};

export const getSiteInfo = cache(async (): Promise<SiteInfo> => {
  const fallback: SiteInfo = {
    announcement: { enabled: true, text: defaultAnnouncement },
    email: site.email,
    phone: site.phone,
    whatsapp: site.whatsapp,
    address: site.address,
    instagram: site.instagram,
    /* Panele ulaşılamazsa sayım canlı sitedeki gibi sürer */
    analytics: { ...umami },
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
      analytics:
        s.analytics?.enabled && s.analytics.websiteId && s.analytics.scriptUrl
          ? { websiteId: s.analytics.websiteId, scriptUrl: s.analytics.scriptUrl, domains: s.analytics.domains?.trim() ?? "" }
          : null,
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

/** Sitedeki sohbet balonu: yalnız panelde açıksa (Chatbot ayarları), kişisel veri içermez */
export type ChatInfo = { botName: string; greeting: string; suggestions: string[]; notice: string };
export const getChatInfo = cache(async (): Promise<ChatInfo | null> => {
  try {
    const payload = await cms();
    const s = await payload.findGlobal({ slug: "chatbot-settings", depth: 0 });
    if (!s.enabled) return null;
    return {
      botName: s.botName || "Guru Asistan",
      greeting: s.greeting ?? "",
      suggestions: (s.suggestions ?? []).map((x) => x.text).filter(Boolean),
      notice: s.notice ?? "",
    };
  } catch {
    return null;
  }
});
