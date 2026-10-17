// Videoları Vercel Blob'a yükler: node scripts/video-blob.mjs <klasör ya da dosya ...>
// Örnek: node scripts/video-blob.mjs video-yeni/services/v3/seo.mp4  →  Blob'da /video/services/v3/seo.mp4
// Yol, ilk "video/" parçasından itibaren korunur (src/lib/video.ts aynı yolu okur). Yeni video eklenirse
// src/lib/video.ts içindeki listeye de yazılır. Dosyalar 1 yıl önbellekte kalır: içerik değişince yeni adla yükleyin
// (ör. services/v4/...). Anahtar: BLOB_READ_WRITE_TOKEN ortam değişkeni ya da .env.canli.
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { put } from "@vercel/blob";

const fromFile = existsSync(".env.canli") ? (readFileSync(".env.canli", "utf8").match(/^BLOB_READ_WRITE_TOKEN=["']?([^"'\n]+)/m) || [])[1] : undefined;
const token = process.env.BLOB_READ_WRITE_TOKEN || fromFile;
if (!token) throw new Error("BLOB_READ_WRITE_TOKEN bulunamadı");
const walk = (p) => (statSync(p).isDirectory() ? readdirSync(p).flatMap((f) => walk(join(p, f))) : [p]);
const files = process.argv.slice(2).flatMap(walk).filter((f) => /\.(mp4|jpg|webm)$/i.test(f));
for (const f of files) {
  const i = f.replace(/\\/g, "/").indexOf("video/");
  if (i < 0) throw new Error(`yol "video/" içermeli: ${f}`);
  const pathname = f.replace(/\\/g, "/").slice(i);
  const contentType = f.endsWith(".mp4") ? "video/mp4" : f.endsWith(".webm") ? "video/webm" : "image/jpeg";
  const r = await put(pathname, readFileSync(f), { access: "public", token, addRandomSuffix: false, allowOverwrite: true, contentType, cacheControlMaxAge: 31536000 });
  console.log("yüklendi", r.url);
}
