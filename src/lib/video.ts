/**
 * Videolar ve kapak kareleri Vercel Blob'da, sitedeki yol adıyla (/video/...). Depoda tutulmuyorlar:
 * her dağıtım 76 MB'lık kopyayı yeniden saklıyordu. Yeni video eklenince Blob'a aynı yolla yüklenir
 * ve VIDEOS listesine yazılır. Panelde "/video/..." yazan eski adresler de buradan çözülür.
 */
export const VIDEO_HOST = "https://rbxf3gkfef8hbjud.public.blob.vercel-storage.com";

const SERVICES = ["dijital-reklam-yonetimi", "e-ticaret-yonetimi", "grafik-tasarim", "marka-tescil", "mobil-uygulama", "ozel-yazilim", "seo", "sosyal-medya-yonetimi", "web-tasarim"];
const PRODUCTS = ["guru-business", "guru-chatbot", "guru-crm", "guru-operation"];

/** Blob'daki videolar (kapakları aynı adla .jpg) */
const VIDEOS = new Set([
  "/video/guru-tanitim-v2.mp4",
  ...SERVICES.map((s) => `/video/services/v3/${s}.mp4`),
  ...PRODUCTS.map((p) => `/video/products/${p}.mp4`),
]);

/** "/video/..." → Blob adresi; tam adresler olduğu gibi kalır */
export const videoUrl = (src: string) => (src.startsWith("/video/") ? `${VIDEO_HOST}${src}` : src);

/** Video oynatılabilir mi: tam adres ya da Blob'a yüklenmiş site yolu */
export const hasVideo = (src: string) => /^https:\/\//.test(src) || VIDEOS.has(src);
