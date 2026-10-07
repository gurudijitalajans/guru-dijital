/**
 * Tek seferlik güncelleme: panelde zaten kayıtlı ürünlere yeni ürün sayfası
 * alanlarını (giriş görseli, paylaşım görseli, güven ifadeleri, ürün turu,
 * öne çıkan ekranlar, karşılaştırma, neler dahil, paket içeriği) doldurur.
 * Yalnız boş olan ürünlere dokunur; panelde düzenlenmiş içerik korunur.
 * Çalıştırma: npm run payload run src/payload/update-products.ts
 */
import path from "path";
import { fileURLToPath } from "url";
import { getPayload } from "payload";
import config from "@payload-config";
import { productExtrasData } from "./product-extras-data";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.resolve(dirname, "../../public");

const payload = await getPayload({ config });
const uploaded = new Map<string, number>();
const mediaFor = async (img: { src: string; alt: string }) => {
  const hit = uploaded.get(img.src);
  if (hit) return hit;
  const doc = await payload.create({ collection: "media", data: { alt: img.alt }, filePath: path.join(publicDir, img.src) });
  uploaded.set(img.src, doc.id);
  return doc.id;
};

const { docs } = await payload.find({ collection: "products", limit: 50, depth: 0, pagination: false });
const idBySlug = Object.fromEntries(docs.map((d) => [d.slug, d.id])) as Record<string, number>;
let changed = 0;
for (const p of docs) {
  if ((p.showcase ?? []).length > 0 || p.heroVisual) continue;
  const data = await productExtrasData(p.slug ?? "", mediaFor, idBySlug);
  if (!data) continue;
  const { trust, ...rest } = data;
  await payload.update({
    collection: "products",
    id: p.id,
    data: { ...rest, hero: { ...p.hero, headline: p.hero?.headline ?? p.name, sub: p.hero?.sub ?? p.desc, trust }, _status: "published" },
  });
  changed++;
}
payload.logger.info(`ürün sayfaları: ${changed} ürün güncellendi`);
process.exit(0);
