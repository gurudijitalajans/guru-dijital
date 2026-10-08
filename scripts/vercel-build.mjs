/**
 * Vercel derleme komutu (vercel.json > buildCommand).
 *
 * Canlı (production) derlemede veritabanı Postgres ise önce bekleyen şema
 * geçişleri (src/migrations) uygulanır, sonra site derlenir. Önizleme
 * derlemeleri canlı veritabanının şemasına asla dokunmaz.
 */
import { spawnSync } from "node:child_process";

const env = { ...process.env, NODE_OPTIONS: "--no-deprecation" };
const run = (args) => {
  const r = spawnSync("npx", args, { stdio: "inherit", env });
  if (r.status !== 0) process.exit(r.status ?? 1);
};

const isPostgres = /^postgres(ql)?:\/\//.test(process.env.DATABASE_URL || "");
const isProduction = process.env.VERCEL_ENV === "production";

if (isPostgres && isProduction) {
  console.log("Veritabanı şeması güncelleniyor (payload migrate)");
  run(["payload", "migrate"]);
} else {
  console.log(`Şema geçişi atlandı (${isPostgres ? "önizleme derlemesi" : "Postgres adresi yok"})`);
}

run(["next", "build"]);
