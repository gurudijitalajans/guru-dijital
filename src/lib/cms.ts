import "server-only";
import { cache } from "react";
import { getPayload } from "payload";
import config from "@payload-config";
import { announcement as defaultAnnouncement, announcementMore, site } from "@/lib/data";

/**
 * Site tarafının panelle tek temas noktası. Veritabanına ulaşılamazsa
 * (ör. henüz bağlanmamış bir ortamda) site data.ts varsayılanlarıyla
 * çalışmaya devam eder; hiçbir sayfa panel yüzünden kırılmaz.
 */
export const cms = cache(() => getPayload({ config }));

export type SiteInfo = {
  /** messages[0] ana metin; sonrakiler sırayla döner */
  announcement: { enabled: boolean; messages: string[] };
  email: string;
  phone: string;
  /** Doğrudan arama hattı (cep); boşsa arama kartı ve Ara düğmesi görünmez */
  mobile: string;
  whatsapp: string;
  address: string;
  instagram: string;
  /** Site Ayarları > İzleme kodları: yalnız dolu alanlar; hiçbiri yoksa null */
  izleme: Izleme | null;
};

export type Izleme = {
  metaPixelId?: string;
  googleAdsId?: string;
  adsTalep?: string;
  adsRandevu?: string;
  adsIletisim?: string;
  ga4Id?: string;
  gtmId?: string;
  tiktokPixelId?: string;
  linkedinPartnerId?: string;
  clarityId?: string;
  customHead?: string;
  customHeadConsent?: "pazarlama" | "analitik";
};

export const getSiteInfo = cache(async (): Promise<SiteInfo> => {
  const fallback: SiteInfo = {
    announcement: { enabled: true, messages: [defaultAnnouncement, ...announcementMore] },
    email: site.email,
    phone: site.phone,
    mobile: site.mobile,
    whatsapp: site.whatsapp,
    address: site.address,
    instagram: site.instagram,
    izleme: null,
  };
  try {
    const payload = await cms();
    const s = await payload.findGlobal({ slug: "site-settings", depth: 0 });
    const c = s.contact ?? {};
    return {
      announcement: {
        enabled: s.announcement?.enabled ?? true,
        messages: [
          s.announcement?.text?.trim() || defaultAnnouncement,
          ...(s.announcement?.more ?? []).map((m) => m.text?.trim()).filter((t): t is string => Boolean(t)),
        ],
      },
      email: c.email?.trim() || fallback.email,
      phone: c.phone?.trim() || fallback.phone,
      mobile: c.mobile?.trim() || fallback.mobile,
      whatsapp: c.whatsapp?.trim() || fallback.whatsapp,
      address: c.address?.trim() || fallback.address,
      instagram: c.instagram?.trim() || fallback.instagram,
      izleme: (() => {
        const z = (s as { izleme?: Record<string, unknown> | null }).izleme ?? {};
        const out = Object.fromEntries(Object.entries(z).filter(([k, v]) => k !== "id" && typeof v === "string" && v.trim()).map(([k, v]) => [k, String(v).trim()])) as Izleme;
        const any = Object.keys(out).some((k) => k !== "customHeadConsent");
        return any ? out : null;
      })(),
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
    /* Sitedeki balon Guru Dijital işletmesinin sohbet ayarıyla çalışır */
    const s = (await payload.find({ collection: "chatbot-config", where: { "tenant.slug": { equals: "guru" } }, limit: 1, depth: 0 })).docs[0];
    if (!s?.enabled) return null;
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
