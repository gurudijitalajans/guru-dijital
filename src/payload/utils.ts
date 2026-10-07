import { revalidatePath } from "next/cache";

const TR_MAP: Record<string, string> = { ç: "c", ğ: "g", ı: "i", ö: "o", ş: "s", ü: "u", â: "a", î: "i", û: "u" };

/** "Sosyal Medya'da İçerik Takvimi" → "sosyal-medyada-icerik-takvimi" */
export function slugify(input: string): string {
  return input
    .toLocaleLowerCase("tr-TR")
    .replace(/[çğıöşüâîû]/g, (c) => TR_MAP[c] ?? c)
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/**
 * Panelde yapılan değişiklikten sonra ilgili sayfaları yeniler. Seed betiği
 * gibi Next isteği dışında çalışan kodda revalidatePath hata fırlatır; o
 * durumda sessizce geçilir (sayfalar zaten bir sonraki derlemede güncellenir).
 */
export function revalidate(paths: string[], type?: "layout" | "page") {
  for (const p of paths) {
    try {
      revalidatePath(p, type);
    } catch {
      /* Next bağlamı yok */
    }
  }
}

/** Europe/Istanbul saat diliminde "YYYY-MM-DD" (randevu çakışma anahtarı). */
export function dayKey(value: string | Date): string {
  const d = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Istanbul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

/** Basit bellek içi hız sınırı: aynı IP'den pencere başına en çok `max` istek. */
const hits = new Map<string, number[]>();
export function rateLimited(key: string, max = 5, windowMs = 10 * 60 * 1000): boolean {
  const now = Date.now();
  const list = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  list.push(now);
  hits.set(key, list);
  return list.length > max;
}

export function clientIp(headers: Headers): string {
  return (
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headers.get("x-real-ip") ||
    "yerel"
  );
}
