/**
 * Ürün görselleri yeniden üretildiğinde panel medyasını günceller: giriş
 * görseli, öne çıkan ekran görselleri ve ekran görüntüsü public/products
 * altındaki yeni dosyalarla değiştirilir, alt metinler koddaki içerikle
 * eşitlenir. Panelde elle başka bir görsel seçilmişse ona dokunulmaz
 * (yalnız dosya adı beklenen görselle başlayan medya güncellenir).
 * Çalıştırma: npm run payload run src/payload/refresh-product-visuals.ts
 */
import { copyFileSync, mkdtempSync } from "fs";
import os from "os";
import path from "path";
import { fileURLToPath } from "url";
import { getPayload } from "payload";
import config from "@payload-config";
import { products } from "@/lib/data";
import { productExtras } from "@/lib/product-extras";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.resolve(dirname, "../../public");
const payload = await getPayload({ config });

/* Medya dosya adları benzersiz: gerekirse dosya başka adla yüklenir */
const tmp = mkdtempSync(path.join(os.tmpdir(), "guru-gorsel-"));
const copyTo = (src: string, name: string) => {
  const dest = path.join(tmp, name);
  copyFileSync(path.join(publicDir, src), dest);
  return dest;
};
const stem = (src: string) => path.basename(src).replace(/\.[a-z]+$/i, "");
let updated = 0;
let skipped = 0;

async function replace(ref: unknown, img: { src: string; alt: string }, previousStem: string, uploadName?: string) {
  const id = typeof ref === "object" && ref ? (ref as { id: number }).id : (ref as number | null | undefined);
  if (!id) return;
  const media = await payload.findByID({ collection: "media", id, depth: 0 });
  if (!media.filename?.startsWith(previousStem)) {
    skipped++;
    return;
  }
  await payload.update({
    collection: "media",
    id,
    data: { alt: img.alt },
    filePath: uploadName ? copyTo(img.src, uploadName) : path.join(publicDir, img.src),
    overwriteExistingFiles: true,
  });
  updated++;
}

const { docs } = await payload.find({ collection: "products", limit: 50, depth: 0, pagination: false });
for (const p of docs) {
  const slug = p.slug ?? "";
  const x = productExtras[slug];
  const base = products.find((b) => b.slug === slug);
  if (!x || !base) continue;
  await replace(p.heroVisual, x.heroVisual, stem(x.heroVisual.src));
  for (const [i, s] of (p.showcase ?? []).entries()) {
    if (x.showcase[i]) await replace(s.image, x.showcase[i].image, stem(x.showcase[i].image.src));
  }
  /* Ekran görüntüsü eski SVG'den yeni webp'ye geçti: eski dosya adı ürün adresiyle başlar */
  await replace(p.screenshot, { src: base.image, alt: base.imageAlt }, slug, `${slug}-ekran.webp`);
}
payload.logger.info(`Ürün görselleri: ${updated} medya güncellendi, ${skipped} elle seçilmiş görsele dokunulmadı`);
process.exit(0);
