/**
 * Tarayıcı bilgisinden kaba cihaz, tarayıcı ve işletim sistemi (kendi küçük
 * ayrıştırıcımız; ua-parser-js v2 AGPL olduğu için kullanılmıyor). Botlar ayrı.
 */
export const BOT_RE = /bot|crawl|spider|slurp|bingpreview|facebookexternalhit|embedly|quora link|whatsapp|telegrambot|discordbot|preview|headless|lighthouse|pagespeed|gtmetrix|pingdom|uptime|monitor|curl|wget|python-requests|axios|node-fetch|go-http|java\/|okhttp|scrapy|semrush|ahrefs|mj12|dotbot|petalbot|bytespider|gptbot|claudebot|ccbot|perplexitybot|amazonbot|applebot|yandex(bot|images)|baiduspider/i;

export function cihazOf(ua: string): { device: string; browser: string; os: string } {
  const u = ua || "";
  const os = /iphone|ipad|ipod/i.test(u) ? "iOS" : /android/i.test(u) ? "Android" : /windows/i.test(u) ? "Windows" : /mac os x|macintosh/i.test(u) ? "macOS" : /cros/i.test(u) ? "ChromeOS" : /linux/i.test(u) ? "Linux" : "Diğer";
  const device = /ipad|tablet|(android(?!.*mobile))/i.test(u) ? "tablet" : /mobi|iphone|ipod|android/i.test(u) ? "mobil" : "masaustu";
  const browser = /edg\//i.test(u)
    ? "Edge"
    : /opr\/|opera/i.test(u)
      ? "Opera"
      : /yabrowser/i.test(u)
        ? "Yandex"
        : /samsungbrowser/i.test(u)
          ? "Samsung"
          : /fxios|firefox/i.test(u)
            ? "Firefox"
            : /crios|chrome/i.test(u)
              ? "Chrome"
              : /safari/i.test(u)
                ? "Safari"
                : "Diğer";
  return { device, browser, os };
}
