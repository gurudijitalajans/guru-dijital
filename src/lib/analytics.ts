/**
 * Umami özel olayları (istemci). Betik yüklü değilse (sayım kapalı, reklam
 * engelleyici, yerel ortam) sessizce hiçbir şey yapmaz.
 *
 * Olay adları panelde "Olaylar" listesinde bu adlarla görünür.
 */
export const EVENTS = {
  leadSent: "talep-gonderildi",
  bookingSent: "randevu-alindi",
  quoteClick: "teklif-al",
  meetingClick: "toplanti-planla",
  whatsappClick: "whatsapp",
  emailClick: "e-posta",
  phoneClick: "telefon",
} as const;

type UmamiWindow = Window & { umami?: { track: (event: string, data?: Record<string, string | number>) => void } };

export function track(event: string, data?: Record<string, string | number>) {
  try {
    (window as UmamiWindow).umami?.track(event, data);
  } catch {
    /* sayım yoksa yok say */
  }
}

/** Paneldeki "Olaylar" listesinde okunur adlar (data-umami-event değerleri dahil) */
export const EVENT_LABELS: Record<string, string> = {
  "talep-gonderildi": "Talep gönderildi",
  "randevu-alindi": "Randevu alındı",
  "teklif-al": "Teklif Al tıklaması",
  "toplanti-planla": "Toplantı Planla tıklaması",
  tanisalim: "Tanışalım (menü)",
  "bize-yazin": "Bize Yazın (yan sekme)",
  whatsapp: "WhatsApp tıklaması",
  "e-posta": "E-posta tıklaması",
  telefon: "Telefon tıklaması",
  instagram: "Instagram tıklaması",
  adres: "Adres (harita) tıklaması",
  "giris-ana-buton": "Giriş: ana buton",
  "giris-ikinci-buton": "Giriş: ikinci buton",
  "kapanis-ana-buton": "Kapanış: ana buton",
  "kapanis-ikinci-buton": "Kapanış: ikinci buton",
  "video-izlendi": "Video oynatıldı",
  "urun-menu": "Ürün sayfası menüsü",
};

export const eventLabel = (name: string) =>
  EVENT_LABELS[name] ?? name.replace(/-/g, " ").replace(/^./, (c) => c.toLocaleUpperCase("tr-TR"));
