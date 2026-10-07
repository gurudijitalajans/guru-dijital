/**
 * Panelde seçilebilen ikonlar. Yalnız adlar burada (panel yapılandırması
 * ikon bileşenlerini yüklemesin diye); ad → bileşen eşlemesi src/lib/icons.ts.
 * Yeni ikon eklerken iki dosyaya da eklenir; tsc eksik eşlemeyi yakalar.
 */
export const ICON_OPTIONS = [
  { value: "share", label: "Paylaşım (sosyal medya)" },
  { value: "palette", label: "Palet (tasarım)" },
  { value: "pen", label: "Kalem (içerik)" },
  { value: "monitor", label: "Ekran ve telefon (web)" },
  { value: "chart-bar", label: "Sütun grafik (pazarlama)" },
  { value: "clapperboard", label: "Klaket (video)" },
  { value: "bot", label: "Robot (chatbot)" },
  { value: "users", label: "Kişiler" },
  { value: "workflow", label: "İş akışı" },
  { value: "briefcase", label: "Çanta (işletme)" },
  { value: "message", label: "Mesaj" },
  { value: "brain", label: "Yapay zeka" },
  { value: "languages", label: "Diller" },
  { value: "bell", label: "Bildirim" },
  { value: "calendar", label: "Takvim" },
  { value: "clipboard", label: "Görev listesi" },
  { value: "database", label: "Veri tabanı" },
  { value: "file", label: "Belge" },
  { value: "gauge", label: "Gösterge" },
  { value: "handshake", label: "El sıkışma" },
  { value: "kanban", label: "Pano" },
  { value: "dashboard", label: "Kontrol paneli" },
  { value: "layers", label: "Katmanlar" },
  { value: "link", label: "Bağlantı" },
  { value: "pie", label: "Pasta grafik" },
  { value: "shield", label: "Kalkan (güvenlik)" },
  { value: "sparkles", label: "Parıltı" },
  { value: "target", label: "Hedef" },
  { value: "rocket", label: "Roket" },
  { value: "megaphone", label: "Megafon" },
  { value: "camera", label: "Kamera" },
  { value: "globe", label: "Dünya" },
  { value: "cart", label: "Alışveriş sepeti" },
  { value: "search", label: "Arama" },
  { value: "mail", label: "E-posta" },
  { value: "zap", label: "Şimşek (hız)" },
  { value: "trending", label: "Yükselen grafik" },
  { value: "code", label: "Kod" },
  { value: "lightbulb", label: "Ampul (fikir)" },
  { value: "award", label: "Ödül" },
] as const;

export type IconName = (typeof ICON_OPTIONS)[number]["value"];
export const DEFAULT_ICON: IconName = "sparkles";

export const isIconName = (v: unknown): v is IconName =>
  typeof v === "string" && ICON_OPTIONS.some((o) => o.value === v);
