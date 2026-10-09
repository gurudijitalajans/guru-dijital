/**
 * Portföy görselleri (public/work) yeniden işlendiğinde panel medyasındaki
 * kopyalarını günceller. Yalnız dosya adı listedeki adla birebir eşleşen medya
 * değişir; panelde başka adla yüklenmiş görsellere dokunulmaz, alt metinler korunur.
 * Çalıştırma: npm run payload run src/payload/refresh-work-visuals.ts
 */
import { copyFileSync, existsSync, mkdtempSync } from "fs";
import os from "os";
import path from "path";
import { fileURLToPath } from "url";
import { getPayload } from "payload";
import config from "@payload-config";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const workDir = path.resolve(dirname, "../../public/work");
const payload = await getPayload({ config });

/* [public/work dosyası, paneldeki medya dosya adı]. Kaynaklar:
   tools/gorsel-studyo/yesil-mavi.py (eski yeşil parıltı maviye) ve
   tools/gorsel-studyo/portfoy-duzelt.py (leke, şablon gönderi, boş zemin kırpımı). */
const TARGETS: [string, string][] = [
  ...[
    "ambalaj-etiket",
    "dijital-pazarlama",
    "instagram-post-kare",
    "instagram-postlar",
    "katalog-brosur",
    "kurumsal-kimlik",
    "logo-tasarimlari",
    "odul-impact",
    "odul-partner",
    "sosyal-icerik-cita",
    "sosyal-medya-telefon",
    "web-laptop-kare",
    "web-siteleri",
    "web-siteleri-2",
  ].map((n): [string, string] => [n, `${n}.webp`]),
  /* Galerideki ikinci kopya: şeridin tamamı yerine yan kareye uyan iki gönderilik kırpım */
  ["instagram-postlar-ikili", "instagram-postlar-1.webp"],
];

const tmp = mkdtempSync(path.join(os.tmpdir(), "guru-portfoy-"));
let updated = 0;

for (const [file, filename] of TARGETS) {
  const src = path.join(workDir, `${file}.webp`);
  if (!existsSync(src)) continue;
  const { docs } = await payload.find({ collection: "media", where: { filename: { equals: filename } }, depth: 0, limit: 5 });
  for (const m of docs) {
    /* Yükleme adı paneldeki adla aynı olsun: dosya yerinde değişir, yeni ad üretilmez */
    const upload = path.join(tmp, filename);
    copyFileSync(src, upload);
    await payload.update({ collection: "media", id: m.id, data: { alt: m.alt }, filePath: upload, overwriteExistingFiles: true });
    updated++;
  }
}
payload.logger.info(`Portföy görselleri: ${updated} medya güncellendi`);
process.exit(0);
