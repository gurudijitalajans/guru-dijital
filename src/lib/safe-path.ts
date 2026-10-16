/**
 * Yönlendirme için yalnız site içi yol. "//başka-site", "/\başka-site" (tarayıcı
 * bunu https://başka-site olarak çözer), tam adres ve kontrol karakterleri
 * reddedilir; şüpheli her değer ana sayfaya döner.
 */
export function sitePath(raw: string | null | undefined, fallback = "/"): string {
  if (!raw || !raw.startsWith("/") || /[\\\u0000-\u001f]/.test(raw)) return fallback;
  try {
    const base = "https://guru.invalid";
    const u = new URL(raw, base);
    return u.origin === base ? `${u.pathname}${u.search}${u.hash}` : fallback;
  } catch {
    return fallback;
  }
}
