"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { CONSENT_EVENT, consentOf } from "./CookieConsent";
import type { Izleme } from "@/lib/cms";
import type { OlayDetail } from "@/lib/analytics";

/**
 * Reklam ve ölçüm etiketleri (Site Ayarları > İzleme kodları). Hiçbiri onaydan
 * önce yüklenmez (KVKK: pazarlama çerezleri açık rızaya bağlı): Meta, Google Ads,
 * GA4, GTM, TikTok ve LinkedIn "pazarlama", Clarity "analitik" onayıyla.
 * Sitenin tek olay yolu (track() → "guru-olay") her yüklü etikete aynı olay
 * kimliğiyle iletilir: talep → Lead, randevu → Schedule, iletişim → Contact.
 */
type W = Window & {
  dataLayer?: unknown[];
  gtag?: (...a: unknown[]) => void;
  fbq?: ((...a: unknown[]) => void) & { callMethod?: unknown; queue?: unknown[]; loaded?: boolean; version?: string; push?: unknown };
  _fbq?: unknown;
  ttq?: { track: (n: string, d?: unknown, o?: unknown) => void; page: () => void; load: (id: string) => void } & Record<string, unknown>;
  _linkedin_partner_id?: string;
  _linkedin_data_partner_ids?: string[];
  lintrk?: (...a: unknown[]) => void;
  clarity?: (...a: unknown[]) => void;
};
const w = () => window as W;
const loaded = new Set<string>();

function script(id: string, src: string) {
  if (loaded.has(id) || document.getElementById(id)) return;
  loaded.add(id);
  const s = document.createElement("script");
  s.id = id;
  s.async = true;
  s.src = src;
  document.head.appendChild(s);
}

function loadMarketing(z: Izleme) {
  const g = w();
  if ((z.googleAdsId || z.ga4Id) && !loaded.has("gtag")) {
    g.dataLayer = g.dataLayer || [];
    g.gtag = function gtag() {
      // eslint-disable-next-line prefer-rest-params -- gtag arguments nesnesini bekler
      g.dataLayer!.push(arguments);
    };
    g.gtag("consent", "default", { ad_storage: "granted", ad_user_data: "granted", ad_personalization: "granted", analytics_storage: "granted" });
    g.gtag("js", new Date());
    if (z.googleAdsId) g.gtag("config", z.googleAdsId);
    if (z.ga4Id) g.gtag("config", z.ga4Id);
    script("gtag", `https://www.googletagmanager.com/gtag/js?id=${z.googleAdsId || z.ga4Id}`);
  }
  if (z.gtmId && !loaded.has("gtm")) {
    g.dataLayer = g.dataLayer || [];
    g.dataLayer.push({ "gtm.start": Date.now(), event: "gtm.js" });
    script("gtm", `https://www.googletagmanager.com/gtm.js?id=${z.gtmId}`);
  }
  if (z.metaPixelId && !g.fbq) {
    const f = function fbq(...a: unknown[]) {
      if (f.callMethod) (f.callMethod as (...x: unknown[]) => void)(...a);
      else f.queue!.push(a);
    } as NonNullable<W["fbq"]>;
    f.push = f;
    f.loaded = true;
    f.version = "2.0";
    f.queue = [];
    g.fbq = f;
    g._fbq = f;
    script("fbq", "https://connect.facebook.net/en_US/fbevents.js");
    g.fbq("init", z.metaPixelId);
    g.fbq("track", "PageView");
  }
  if (z.tiktokPixelId && !g.ttq) {
    const q: unknown[] = [];
    const ttq = { _q: q } as unknown as NonNullable<W["ttq"]>;
    for (const m of ["page", "track", "identify", "load"]) (ttq as Record<string, unknown>)[m] = (...a: unknown[]) => q.push([m, ...a]);
    g.ttq = ttq;
    script("ttq", `https://analytics.tiktok.com/i18n/pixel/events.js?sdkid=${z.tiktokPixelId}&lib=ttq`);
    ttq.page();
  }
  if (z.linkedinPartnerId && !loaded.has("li")) {
    g._linkedin_partner_id = z.linkedinPartnerId;
    g._linkedin_data_partner_ids = [...(g._linkedin_data_partner_ids ?? []), z.linkedinPartnerId];
    script("li", "https://snap.licdn.com/li.lms-analytics/insight.min.js");
  }
}

function loadAnalytics(z: Izleme) {
  if (z.clarityId && !loaded.has("clarity")) {
    const g = w();
    const c = ((...a: unknown[]) => {
      (c as unknown as { q: unknown[] }).q.push(a);
    }) as NonNullable<W["clarity"]> & { q?: unknown[] };
    c.q = [];
    g.clarity = c;
    script("clarity", `https://www.clarity.ms/tag/${z.clarityId}`);
  }
}

/* Özel head kodu: <script> etiketleri yeniden oluşturulur (innerHTML ile eklenen betik çalışmaz) */
function loadCustom(html: string) {
  if (loaded.has("custom")) return;
  loaded.add("custom");
  const doc = new DOMParser().parseFromString(`<head>${html}</head>`, "text/html");
  for (const node of Array.from(doc.head.childNodes)) {
    if (node.nodeName === "SCRIPT") {
      const old = node as HTMLScriptElement;
      const s = document.createElement("script");
      for (const a of Array.from(old.attributes)) s.setAttribute(a.name, a.value);
      s.text = old.text;
      document.head.appendChild(s);
    } else if (node.nodeType === 1) document.head.appendChild(document.importNode(node, true));
  }
}

const rid = () => `${Date.now().toString(36)}${Math.floor(Math.random() * 1e8).toString(36)}`;

export function Etiketler({ z }: { z: Izleme }) {
  const path = usePathname();

  useEffect(() => {
    const apply = () => {
      const c = consentOf() ?? [];
      if (c.includes("pazarlama")) loadMarketing(z);
      if (c.includes("analitik")) loadAnalytics(z);
      if (z.customHead && c.includes(z.customHeadConsent ?? "pazarlama")) loadCustom(z.customHead);
    };
    apply();
    window.addEventListener(CONSENT_EVENT, apply);

    const onOlay = (ev: Event) => {
      const d = (ev as CustomEvent<OlayDetail>).detail;
      if (!d?.name) return;
      const g = w();
      const eventID = rid();
      const kind = d.name === "talep-gonderildi" ? "talep" : d.name === "randevu-alindi" ? "randevu" : ["telefon", "whatsapp", "e-posta"].includes(d.name) ? "iletisim" : null;
      if (g.fbq) {
        if (kind === "talep") g.fbq("track", "Lead", {}, { eventID });
        else if (kind === "randevu") g.fbq("track", "Schedule", {}, { eventID });
        else if (kind === "iletisim") g.fbq("track", "Contact", { method: d.name }, { eventID });
        else g.fbq("trackCustom", d.name, d.data ?? {}, { eventID });
      }
      if (g.gtag) {
        const label = kind === "talep" ? z.adsTalep : kind === "randevu" ? z.adsRandevu : kind === "iletisim" ? z.adsIletisim : undefined;
        if (z.googleAdsId && label) g.gtag("event", "conversion", { send_to: `${z.googleAdsId}/${label}`, transaction_id: eventID });
        if (z.ga4Id) g.gtag("event", kind === "talep" ? "generate_lead" : d.name.replace(/-/g, "_"), { ...(d.data ?? {}), send_to: z.ga4Id });
      }
      if (g.ttq && kind) g.ttq.track(kind === "iletisim" ? "Contact" : "SubmitForm", {}, { event_id: eventID });
      if (g.dataLayer && z.gtmId) g.dataLayer.push({ event: d.name, olay_kimligi: eventID, ...(d.data ?? {}) });
    };
    window.addEventListener("guru-olay", onOlay);
    return () => {
      window.removeEventListener(CONSENT_EVENT, apply);
      window.removeEventListener("guru-olay", onOlay);
    };
  }, [z]);

  /* Tek sayfa gezinmesinde sayfa görüntülemesi (ilk yüklemeyi etiketlerin kendisi sayar) */
  useEffect(() => {
    const g = w();
    if (!loaded.size) return;
    if (g.fbq) g.fbq("track", "PageView");
    if (g.gtag && z.ga4Id) g.gtag("event", "page_view", { page_path: path, send_to: z.ga4Id });
    if (g.ttq) g.ttq.page();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- yalnız adres değişiminde
  }, [path]);

  return null;
}
