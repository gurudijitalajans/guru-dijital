import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** "unlock the *next* level" → [{t:"unlock the ",accent:false},{t:"next",accent:true},...] */
export function parseAccent(text: string): { t: string; accent: boolean }[] {
  return text
    .split(/(\*[^*]+\*)/g)
    .filter(Boolean)
    .map((part) =>
      part.startsWith("*") && part.endsWith("*")
        ? { t: part.slice(1, -1), accent: true }
        : { t: part, accent: false }
    );
}

const TR_COUNT = ["sıfır", "bir", "iki", "üç", "dört", "beş", "altı", "yedi", "sekiz", "dokuz", "on"];
/** 6 → "altı" (paneldeki kayıt sayısı değişince metinler de doğru kalsın); 10 üstü rakamla */
export const countWord = (n: number) => TR_COUNT[n] ?? String(n);

/** Türkçe yüzde ve sayı yazımı: 300 + "%" → "%300", 54.5 + "%" → "%54,5", 3 + " gün" → "3 gün" */
export function formatStat({ value, prefix, suffix }: { value: number; prefix?: string | null; suffix?: string | null }) {
  const num = value.toLocaleString("tr-TR", { maximumFractionDigits: 1 });
  if (suffix === "%") return `${prefix ?? ""}%${num}`;
  return `${prefix ?? ""}${num}${suffix ?? ""}`;
}
