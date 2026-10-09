/**
 * Tek seferlik yazım düzeltmesi (TDK): panelde kayıtlı metinlerde "yurt dışı /
 * yurt içi", "kâğıt", "hâle/hâline getirmek", "hikâye" yazımları ve Google
 * Partner cümleleri düzeltilir. Koddaki varsayılan metinler aynı kurallarla
 * güncellendi; bu betik panelde zaten kayıtlı olanları eşitler.
 * Adres, dosya adı ve kimlik alanlarına dokunulmaz.
 * Çalıştırma: npm run payload run src/payload/fix-texts.ts
 */
import { getPayload, type CollectionSlug, type GlobalSlug } from "payload";
import config from "@payload-config";

const PARTNER_DESC =
  "Google'ın performans, reklam harcaması ve yetkinlik kriterlerini karşılayan ajanslara verilen rozet; reklam hesaplarınız bu standartlarla yönetilir.";

const RULES: [RegExp, string][] = [
  [/\bYurtdışı/g, "Yurt dışı"],
  [/\byurtdışı/g, "yurt dışı"],
  [/\bYurtiçi/g, "Yurt içi"],
  [/\byurtiçi/g, "yurt içi"],
  [/kağıt/g, "kâğıt"],
  [/\bhale (getir|gel)/g, "hâle $1"],
  [/\bhaline (getir|gel)/g, "hâline $1"],
  [/Hikaye/g, "Hikâye"],
  [/hikaye/g, "hikâye"],
  [/^2025 yılında Google Partner'ı olduk; kampanyalarımız Google'ın performans ve yetkinlik standartlarını karşılıyor\.$/, PARTNER_DESC],
  [/Google Partner'ı olduk/g, "Google Partner olduk"],
  [/Google Partner'ıyız\./g, "Google Partner rozetine sahibiz."],
  /* Hizmet sayısı panelden değişebilir: sabit "Altı" yazılmaz */
  [/Altı hizmetimizin tamamını/g, "Hizmetlerimizin tamamını"],
  /* Ürün sayfaları: "siz" hitabı, tek terim, tipografik tırnak, isim öbeği rozet */
  [/^Demo Talep Et$/, "Demo Talep Edin"],
  [/pipeline değeri/g, "satış hattı değeri"],
  [/"Ekibe Aktar"/g, "“Ekibe Aktar”"],
  [/^İlk gün görev takibiyle başlayın$/, "İlk gün görev takibi"],
];

/* Ürün sayıları (etikete göre): 7/24 yazımı sitedeki diğer yerlerle aynı; kaynaksız
   performans rakamı ürün gerçeğiyle değişir; "14 gün" SSS'deki "iki hafta" ile eşitlenir */
const STATS: Record<string, { value: number; suffix: string; label: string }> = {
  "Kesintisiz müşteri yanıtı": { value: 7, suffix: "/24", label: "Kesintisiz müşteri yanıtı" },
  "Haftalık rapor hazırlığı": { value: 1, suffix: "", label: "Kartta tüm müşteri geçmişi" },
  "İçinde ilk modül canlıda": { value: 2, suffix: "\u00A0hafta", label: "İlk modülün canlıya geçişi" },
};
const SKIP = new Set(["id", "slug", "url", "href", "filename", "mimeType", "email", "phone", "whatsapp", "createdAt", "updatedAt", "_status"]);

const fix = (t: string) => RULES.reduce((s, [re, to]) => s.replace(re, to), t);
function walk(v: unknown, key = ""): unknown {
  if (typeof v === "string") return SKIP.has(key) ? v : fix(v);
  if (Array.isArray(v)) return v.map((x) => walk(x));
  if (v && typeof v === "object") {
    const o = Object.fromEntries(Object.entries(v).map(([k, x]) => [k, walk(x, k)])) as Record<string, unknown>;
    const fixed = typeof o.label === "string" && typeof o.value === "number" ? STATS[o.label] : undefined;
    return fixed ? { ...o, ...fixed } : o;
  }
  return v;
}
const strip = (doc: Record<string, unknown>) => {
  const { id: _i, createdAt: _c, updatedAt: _u, ...rest } = doc;
  void _i; void _c; void _u;
  return rest;
};

const payload = await getPayload({ config });
const DRAFTS = new Set<CollectionSlug>(["services", "posts", "products"]);
const COLLECTIONS: CollectionSlug[] = ["services", "case-studies", "products", "posts", "team", "references", "testimonials"];
const GLOBALS: GlobalSlug[] = ["about-page", "home-page", "site-settings"];
let changed = 0;

for (const collection of COLLECTIONS) {
  const { docs } = await payload.find({ collection, limit: 200, depth: 0, pagination: false });
  for (const doc of docs) {
    const next = walk(doc) as Record<string, unknown>;
    if (JSON.stringify(next) === JSON.stringify(doc)) continue;
    const data = { ...strip(next), ...(DRAFTS.has(collection) ? { _status: "published" } : {}) };
    await payload.update({ collection, id: doc.id, data: data as never });
    payload.logger.info(`düzeltildi: ${collection} #${doc.id}`);
    changed++;
  }
}
for (const slug of GLOBALS) {
  const doc = (await payload.findGlobal({ slug, depth: 0 })) as unknown as Record<string, unknown>;
  const next = walk(doc) as Record<string, unknown>;
  if (JSON.stringify(next) === JSON.stringify(doc)) continue;
  await payload.updateGlobal({ slug, data: strip(next) as never });
  payload.logger.info(`düzeltildi: ${slug}`);
  changed++;
}
payload.logger.info(`yazım düzeltmesi: ${changed} kayıt güncellendi`);
process.exit(0);
