import type { Field } from "payload";
import { ATIF_KEYS, KANALLAR, kanalOf, type Atif } from "../lib/analiz/kanal";

/**
 * Talep ve randevunun geldiği kanal: sitedeki sayaç girişteki UTM, reklam
 * tıklama kimliği ve yönlendiren siteyi formla birlikte gönderir. Böylece
 * "hangi reklam kaç iş getirdi" CRM'den cevaplanır; gclid/fbclid ileride
 * Google Ads ve Meta'ya çevrimdışı dönüşüm olarak yüklenebilir.
 */
export const kaynakField: Field = {
  name: "kaynak",
  type: "group",
  label: "Kaynak",
  admin: { position: "sidebar", readOnly: true, description: "Ziyaretin geldiği kanal (siteden otomatik)." },
  fields: [
    { name: "kanal", type: "select", label: "Kanal", options: Object.entries(KANALLAR).map(([value, label]) => ({ label, value })) },
    { name: "utmSource", type: "text", label: "utm_source" },
    { name: "utmMedium", type: "text", label: "utm_medium" },
    { name: "utmCampaign", type: "text", label: "Kampanya (utm_campaign)" },
    { name: "utmTerm", type: "text", label: "utm_term" },
    { name: "utmContent", type: "text", label: "utm_content" },
    { name: "ref", type: "text", label: "Yönlendiren site" },
    { name: "giris", type: "text", label: "Giriş sayfası" },
    { name: "gclid", type: "text", label: "Google tıklama kimliği (gclid)" },
    { name: "gbraid", type: "text", label: "gbraid" },
    { name: "wbraid", type: "text", label: "wbraid" },
    { name: "fbclid", type: "text", label: "Meta tıklama kimliği (fbclid)" },
    { name: "msclkid", type: "text", label: "msclkid" },
    { name: "oturum", type: "text", label: "Oturum kimliği" },
  ],
};

const S = (v: unknown, max = 150) => (typeof v === "string" && v.trim() ? v.trim().slice(0, max) : undefined);

/** Formdan gelen kaynak özeti → kayıt alanı (yoksa undefined) */
export function kaynakOf(raw: unknown) {
  if (!raw || typeof raw !== "object") return undefined;
  const r = raw as Record<string, unknown>;
  const a = Object.fromEntries(ATIF_KEYS.map((k) => [k, S(r[k], k === "giris" ? 300 : 150)]).filter(([, v]) => v)) as Atif;
  const sid = S(r.sid, 24);
  return {
    kanal: kanalOf(a),
    utmSource: a.utm_source,
    utmMedium: a.utm_medium,
    utmCampaign: a.utm_campaign,
    utmTerm: a.utm_term,
    utmContent: a.utm_content,
    ref: a.ref,
    giris: a.giris,
    gclid: a.gclid,
    gbraid: a.gbraid,
    wbraid: a.wbraid,
    fbclid: a.fbclid,
    msclkid: a.msclkid,
    oturum: sid && /^[a-z0-9]+$/.test(sid) ? sid : undefined,
  };
}
