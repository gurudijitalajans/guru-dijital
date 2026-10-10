/** Satış hattı aşamaları (sıra panodaki sütun sırasıdır). İstemci bileşenleri de kullanır. */
export const DEAL_STAGES = [
  { value: "aday", label: "Aday" },
  { value: "gorusme", label: "Görüşme" },
  { value: "teklif", label: "Teklif" },
  { value: "kazanildi", label: "Kazanıldı" },
  { value: "kaybedildi", label: "Kaybedildi" },
] as const;
export type DealStage = (typeof DEAL_STAGES)[number]["value"];
export const OPEN_STAGES: DealStage[] = ["aday", "gorusme", "teklif"];
export const stageLabel = (v: string) => DEAL_STAGES.find((s) => s.value === v)?.label ?? v;

export const ACTIVITY_TYPES = [
  { value: "not", label: "Not" },
  { value: "arama", label: "Arama" },
  { value: "eposta", label: "E-posta" },
  { value: "toplanti", label: "Toplantı" },
  { value: "gorev", label: "Görev" },
  { value: "sistem", label: "Kayıt" },
] as const;
export const activityLabel = (v: string) => ACTIVITY_TYPES.find((s) => s.value === v)?.label ?? v;

export const SOURCES = [
  { value: "form", label: "Site formu" },
  { value: "randevu", label: "Toplantı talebi" },
  { value: "chatbot", label: "Chatbot" },
  { value: "referans", label: "Referans" },
  { value: "manuel", label: "Elle eklendi" },
  { value: "aktarim", label: "Excel'den aktarıldı" },
];

export const QUOTE_STATUS = [
  { value: "taslak", label: "Taslak" },
  { value: "gonderildi", label: "Gönderildi" },
  { value: "kabul", label: "Kabul edildi" },
  { value: "red", label: "Reddedildi" },
];
