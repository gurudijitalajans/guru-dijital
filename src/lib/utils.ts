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
