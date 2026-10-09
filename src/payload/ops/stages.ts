/** Görev panosu aşamaları (sıra panodaki sütun sırasıdır). İstemci bileşenleri de kullanır. */
export const TASK_STAGES = [
  { value: "yapilacak", label: "Yapılacak" },
  { value: "devam", label: "Devam" },
  { value: "kontrol", label: "Kontrol" },
  { value: "tamam", label: "Tamam" },
] as const;
export type TaskStage = (typeof TASK_STAGES)[number]["value"];
export const taskStageLabel = (v: string) => TASK_STAGES.find((s) => s.value === v)?.label ?? v;

export const PRIORITIES = [
  { value: "dusuk", label: "Düşük" },
  { value: "normal", label: "Normal" },
  { value: "yuksek", label: "Yüksek" },
  { value: "acil", label: "Acil" },
] as const;
export const priorityLabel = (v: string) => PRIORITIES.find((s) => s.value === v)?.label ?? v;

export const PROJECT_STATUS = [
  { value: "aktif", label: "Sürüyor" },
  { value: "beklemede", label: "Beklemede" },
  { value: "tamamlandi", label: "Tamamlandı" },
  { value: "iptal", label: "İptal" },
];

export const taskCode = (seq?: number | null) => (seq ? `G-${seq}` : "");
