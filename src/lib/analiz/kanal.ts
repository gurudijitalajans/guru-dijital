/**
 * Ziyaretin kanalı: UTM, reklam tıklama kimlikleri ve yönlendiren siteye göre.
 * Türkiye'ye özgü kaynaklar (WhatsApp, QR, Ekşi Sözlük, yapay zekâ asistanları)
 * ayrı tutulur. Hem toplama ucunda (giriş sayfası) hem talep kaydında kullanılır.
 */
export type Atif = {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  gclid?: string;
  gbraid?: string;
  wbraid?: string;
  fbclid?: string;
  msclkid?: string;
  ttclid?: string;
  /** Yönlendiren sitenin alan adı (kendi alan adımız hariç) */
  ref?: string;
  /** Giriş sayfası (yol) */
  giris?: string;
};

export const ATIF_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "gclid", "gbraid", "wbraid", "fbclid", "msclkid", "ttclid", "ref", "giris"] as const;

export const KANALLAR = {
  "reklam-google": "Google Ads",
  "reklam-meta": "Meta reklamları",
  reklam: "Diğer reklamlar",
  "organik-arama": "Organik arama",
  sosyal: "Sosyal medya",
  "yapay-zeka": "Yapay zekâ asistanları",
  "e-posta": "E-posta",
  whatsapp: "WhatsApp",
  qr: "QR ve basılı",
  yonlendirme: "Diğer siteler",
  dogrudan: "Doğrudan",
} as const;
export type Kanal = keyof typeof KANALLAR;
export const kanalAdi = (k?: string | null) => (k && k in KANALLAR ? KANALLAR[k as Kanal] : "Bilinmiyor");

const ARAMA = /(^|\.)(google|bing|yandex|duckduckgo|yahoo|ecosia|brave|search\.brave|qwant|startpage|baidu|naver|seznam)\./;
const SOSYAL = /(^|\.)(facebook|fb|instagram|linkedin|lnkd|twitter|x|t|tiktok|youtube|youtu|pinterest|reddit|threads|snapchat|telegram|t\.me|eksisozluk|vk|tumblr|medium)\.(com|net|co|me|in|be|org|com\.tr)$|^t\.co$|^lm\.facebook\.com$|^l\.instagram\.com$/;
const YAPAY_ZEKA = /(^|\.)(chatgpt\.com|chat\.openai\.com|perplexity\.ai|gemini\.google\.com|claude\.ai|copilot\.microsoft\.com|you\.com|deepseek\.com|grok\.com|meta\.ai)$/;
const EPOSTA = /(^|\.)(mail\.google\.com|outlook\.(live|office)\.com|mail\.yahoo\.com|mail\.yandex\.(com|ru|com\.tr)|webmail\.|mail\.)/;
const PAID = /^(cpc|ppc|paid|paidsearch|paid_search|paid-social|paidsocial|paid_social|cpm|display|ads?|retargeting|remarketing)$/;

export function kanalOf(a: Atif): Kanal {
  const src = (a.utm_source ?? "").toLowerCase();
  const med = (a.utm_medium ?? "").toLowerCase();
  const ref = (a.ref ?? "").toLowerCase();
  if (a.gclid || a.gbraid || a.wbraid) return "reklam-google";
  if (PAID.test(med)) {
    if (/google|adwords|youtube/.test(src)) return "reklam-google";
    if (/facebook|instagram|meta|fb|ig/.test(src)) return "reklam-meta";
    return "reklam";
  }
  if (a.msclkid || a.ttclid) return "reklam";
  if (med === "qr" || src === "qr" || med === "print" || med === "kartvizit") return "qr";
  if (/whatsapp|wa/.test(src) || med === "whatsapp" || /(^|\.)(wa\.me|whatsapp\.com)$/.test(ref)) return "whatsapp";
  if (med === "email" || med === "e-posta" || med === "newsletter" || EPOSTA.test(ref)) return "e-posta";
  if (med === "social" || med === "sosyal" || a.fbclid || SOSYAL.test(ref) || /facebook|instagram|linkedin|tiktok|twitter|youtube/.test(src)) return "sosyal";
  if (YAPAY_ZEKA.test(ref) || /chatgpt|perplexity|gemini|claude|copilot/.test(src)) return "yapay-zeka";
  if (med === "organic" || ARAMA.test(ref)) return "organik-arama";
  if (src || ref) return "yonlendirme";
  return "dogrudan";
}
