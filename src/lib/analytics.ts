/**
 * Sitenin olay sözlüğü (istemci). track() olayı tarayıcıda "guru-olay"
 * adlı bir CustomEvent olarak yayınlar; bir ölçüm aracı bağlandığında bu
 * olayı dinler. Şu an dinleyen yok, çağrı sessizce hiçbir şey yapmaz.
 * Tıklama olayları bileşenlerde data-olay (+ data-olay-<özellik>) özniteliğiyle
 * işaretlidir.
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

export type OlayDetail = { name: string; data?: Record<string, string | number> };

export function track(event: string, data?: Record<string, string | number>) {
  try {
    window.dispatchEvent(new CustomEvent<OlayDetail>("guru-olay", { detail: { name: event, data } }));
  } catch {
    /* tarayıcı dışında yok say */
  }
}

/** Olayların okunur adları (data-olay değerleri dahil) */
export const EVENT_LABELS: Record<string, string> = {
  "talep-gonderildi": "Talep gönderildi",
  "randevu-alindi": "Randevu alındı",
  "teklif-al": "Teklif Al tıklaması",
  "toplanti-planla": "Toplantı Planla tıklaması",
  iletisim: "İletişim (menü)",
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
  "form-basladi": "Form başlatıldı",
  "sohbet-ac": "Sohbet açıldı",
};

export const eventLabel = (name: string) =>
  EVENT_LABELS[name] ?? name.replace(/-/g, " ").replace(/^./, (c) => c.toLocaleUpperCase("tr-TR"));
