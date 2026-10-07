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
