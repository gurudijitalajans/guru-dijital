/**
 * Blog kapaklarını tools/gorsel-studyo ile üretilen 16:9 görsellerle değiştirir
 * (public/work/blog-*.webp). Yalnız kapağı hâlâ eski varsayılan görsel olan
 * yazılar değişir; panelde elle başka kapak seçilmişse dokunulmaz.
 * Çalıştırma: npm run payload run src/payload/set-blog-covers.ts
 */
import path from "path";
import { fileURLToPath } from "url";
import { getPayload } from "payload";
import config from "@payload-config";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const workDir = path.resolve(dirname, "../../public/work");
const payload = await getPayload({ config });

const COVERS = [
  {
    slug: "sosyal-medya-icerik-takvimi-nasil-hazirlanir",
    previous: "instagram-postlar.webp",
    file: "blog-icerik-takvimi.webp",
    alt: "Haftalık sosyal medya içerik takvimi: gönderi, Reels ve hikâye planı",
  },
];

let updated = 0;
for (const c of COVERS) {
  const { docs } = await payload.find({ collection: "posts", where: { slug: { equals: c.slug } }, depth: 1, limit: 1 });
  const post = docs[0];
  if (!post) continue;
  const current = typeof post.cover === "object" && post.cover ? post.cover.filename : null;
  if (current !== c.previous) continue;
  const found = await payload.find({ collection: "media", where: { filename: { equals: c.file } }, depth: 0, limit: 1 });
  const media = found.docs[0] ?? (await payload.create({ collection: "media", data: { alt: c.alt }, filePath: path.join(workDir, c.file) }));
  await payload.update({ collection: "posts", id: post.id, data: { cover: media.id, _status: "published" } });
  updated++;
}
payload.logger.info(`Blog kapakları: ${updated} yazı güncellendi`);
process.exit(0);
