import type { PayloadRequest } from "payload";

/**
 * Asistanın bilgi tabanı: sitenin kendi içeriğinden (hizmetler, ürünler, SSS,
 * iletişim bilgileri) ve paneldeki Bilgi tabanı kayıtlarından derlenir.
 * Panelde içerik değişince birkaç dakika içinde (ya da bilgi kaydedilince
 * hemen) yenilenir. Yanıtlar yalnız bu metne dayanır.
 */

let cache: { at: number; text: string; topics: string[] } | null = null;
const TTL = 5 * 60 * 1000;
export const resetKnowledge = () => {
  cache = null;
};

const clean = (s: string) => s.replace(/\*/g, "").replace(/\{sayı\}/g, "").trim();
const faq = (items: { q: string; a: string }[]) => items.map((f) => `S: ${clean(f.q)}\nC: ${clean(f.a)}`).join("\n");

export async function getKnowledge(req: PayloadRequest): Promise<{ text: string; topics: string[] }> {
  if (cache && Date.now() - cache.at < TTL) return cache;
  /* Site içerik katmanı yalnız istek anında yüklenir: Payload komut satırı (tür üretimi, geçiş) onu yükleyemez */
  const [{ getSiteInfo }, { getHome, getProducts, getServices }, { site }] = await Promise.all([import("@/lib/cms"), import("@/lib/content"), import("@/lib/data")]);
  const [info, services, products, home, extra] = await Promise.all([
    getSiteInfo(),
    getServices(),
    getProducts(),
    getHome(),
    req.payload.find({ collection: "knowledge", where: { active: { equals: true } }, limit: 200, depth: 0, pagination: false, req, overrideAccess: true }),
  ]);

  const parts: string[] = [];
  parts.push(
    [
      `## ${site.name}`,
      clean(site.description),
      `Web sitesi: ${site.url}`,
      `E-posta: ${info.email}`,
      info.phone ? `Telefon: ${info.phone}` : "Telefon numarası sitede yayımlanmadı.",
      info.whatsapp ? `WhatsApp: ${info.whatsapp}` : "",
      info.address ? `Adres: ${info.address}` : "Açık adres sitede yayımlanmadı.",
      info.instagram ? `Instagram: ${info.instagram}` : "",
      "İletişim formu ve toplantı planlayıcısı: /iletisim (toplantılar hafta içi 10:00, 11:00, 13:00, 14:00, 15:00, 16:00 saatlerinde, Türkiye saatiyle).",
    ]
      .filter(Boolean)
      .join("\n"),
  );

  parts.push(
    "## Hizmetler\n" +
      services
        .map((s) =>
          [
            `### ${s.title} (sayfa: /hizmetler/${s.slug})`,
            clean(s.headline),
            clean(s.short),
            ...s.intro.map(clean),
            s.offerings.length ? `${clean(s.offeringsTitle)}: ${s.offerings.map(clean).join("; ")}` : "",
            s.faq.length ? `Sık sorulanlar:\n${faq(s.faq)}` : "",
          ]
            .filter(Boolean)
            .join("\n"),
        )
        .join("\n\n"),
  );

  parts.push(
    "## Yazılım ürünleri\n" +
      products
        .map((p) =>
          [
            `### ${p.name} (sayfa: /urunler/${p.slug})`,
            `${clean(p.tagline)}. ${clean(p.desc)}`,
            clean(p.hero.sub),
            p.trust.length ? `Öne çıkanlar: ${p.trust.join("; ")}` : "",
            p.features.length ? `Özellikler:\n${p.features.map((f) => `- ${clean(f.title)}: ${clean(f.desc)}`).join("\n")}` : "",
            p.steps.length ? `Nasıl çalışır:\n${p.steps.map((s, i) => `${i + 1}. ${clean(s.title)}: ${clean(s.desc)}`).join("\n")}` : "",
            p.integrations.length ? `Entegrasyonlar: ${p.integrations.join(", ")}` : "",
            p.faq.length ? `Sık sorulanlar:\n${faq(p.faq)}` : "",
          ]
            .filter(Boolean)
            .join("\n"),
        )
        .join("\n\n"),
  );

  const homeFaq = (home.faq?.items ?? []) as { q: string; a: string }[];
  if (homeFaq.length) parts.push(`## Genel sık sorulan sorular\n${faq(homeFaq)}`);

  const docs = extra.docs as { title: string; content: string }[];
  if (docs.length) parts.push(`## Ek bilgiler (panelden)\n${docs.map((d) => `### ${d.title}\n${d.content}`).join("\n\n")}`);

  const topics = [...services.map((s) => s.title), ...products.map((p) => p.name), "Fiyat ve teklif", "Toplantı", "İletişim", "Diğer"];
  cache = { at: Date.now(), text: parts.join("\n\n"), topics };
  return cache;
}
