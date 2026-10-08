/**
 * Yerel paneli (SQLite + /media klasörü) canlı veritabanına ve Vercel
 * Blob'a taşır. Kayıt kimlikleri aynen korunur; ilişkiler, görseller,
 * kullanıcılar (parolalarıyla) ve taslak geçmişi olduğu gibi aktarılır.
 *
 *   npm run panel:tasi                 hedef boşsa taşır
 *   npm run panel:tasi -- --uzerine-yaz hedefteki tüm içeriği siler, yeniden taşır
 *   npm run panel:tasi -- --medya-atla  yalnız veritabanı
 *
 * .env.local içinde:
 *   CANLI_DATABASE_URL           canlı Postgres adresi (zorunlu)
 *   CANLI_BLOB_READ_WRITE_TOKEN  canlı Blob anahtarı (görseller için)
 *
 * Gizli değerler hiçbir zaman ekrana yazılmaz.
 */
import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { createClient } from "@libsql/client";
import { put } from "@vercel/blob";
import pg from "pg";

const ROOT = path.resolve(import.meta.dirname, "..");
try {
  process.loadEnvFile(path.join(ROOT, ".env.local"));
} catch {
  /* dosya yoksa ortam değişkenleri kullanılır */
}

const args = new Set(process.argv.slice(2));
const OVERWRITE = args.has("--uzerine-yaz");
const SKIP_MEDIA = args.has("--medya-atla");

const TARGET = process.env.CANLI_DATABASE_URL || "";
const BLOB_TOKEN = process.env.CANLI_BLOB_READ_WRITE_TOKEN || "";
const SOURCE = /^file:/.test(process.env.DATABASE_URL || "") ? process.env.DATABASE_URL : "file:./data/guru.db";

/* Taşınmayan tablolar: şema geçmişi hedefin kendisinde, oturum ve kilitler geçici */
const SKIP_TABLES = new Set(["payload_migrations", "users_sessions", "payload_locked_documents", "payload_locked_documents_rels"]);

const fail = (msg) => {
  console.error(`\n✗ ${msg}`);
  process.exit(1);
};

if (!/^postgres(ql)?:\/\//.test(TARGET)) fail("CANLI_DATABASE_URL .env.local içinde yok ya da postgres:// ile başlamıyor.");
const sourceFile = path.resolve(ROOT, SOURCE.replace(/^file:/, ""));
if (!existsSync(sourceFile)) fail(`Yerel veritabanı bulunamadı: ${path.relative(ROOT, sourceFile)}`);

const targetHost = new URL(TARGET).hostname;
console.log(`Kaynak: ${path.relative(ROOT, sourceFile)}`);
console.log(`Hedef:  ${targetHost}`);

/* 1. Hedef şemayı güncel hale getir */
console.log("\n1) Hedefte şema geçişleri uygulanıyor");
const mig = spawnSync("npx", ["payload", "migrate"], {
  cwd: ROOT,
  stdio: ["ignore", "inherit", "inherit"],
  env: { ...process.env, DATABASE_URL: TARGET, NODE_OPTIONS: "--no-deprecation" },
});
if (mig.status !== 0) fail("Şema geçişi başarısız; yukarıdaki hatayı inceleyin.");

const src = createClient({ url: `file:${sourceFile}` });
const db = new pg.Client({ connectionString: TARGET });
await db.connect();

try {
  /* 2. Hedef boş mu */
  const count = async (t) => Number((await db.query(`SELECT count(*)::int AS n FROM "${t}"`)).rows[0].n);
  const existing = (await count("users")) + (await count("leads")) + (await count("services"));
  if (existing > 0 && !OVERWRITE) {
    fail(
      `Hedefte zaten ${existing} kayıt var (kullanıcı, talep ya da hizmet). Canlı paneldeki verinin üzerine yazmamak için durdum.\n` +
        "  Bilerek baştan taşımak isterseniz: npm run panel:tasi -- --uzerine-yaz"
    );
  }

  /* 3. Tablolar, sütun tipleri ve yabancı anahtar sırası */
  const tables = (
    await db.query(`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE'`)
  ).rows
    .map((r) => r.table_name)
    .filter((t) => !SKIP_TABLES.has(t));

  const colRows = (
    await db.query(
      `SELECT table_name, column_name, data_type, udt_name FROM information_schema.columns WHERE table_schema = 'public'`
    )
  ).rows;
  const columns = new Map();
  for (const r of colRows) {
    if (!columns.has(r.table_name)) columns.set(r.table_name, new Map());
    columns.get(r.table_name).set(r.column_name, r.data_type === "USER-DEFINED" ? "enum" : r.data_type);
  }

  const fkRows = (
    await db.query(
      `SELECT conrelid::regclass::text AS child, confrelid::regclass::text AS parent
         FROM pg_constraint WHERE contype = 'f' AND connamespace = 'public'::regnamespace`
    )
  ).rows;
  const deps = new Map(tables.map((t) => [t, new Set()]));
  for (const { child, parent } of fkRows) {
    const c = child.replace(/"/g, "");
    const p = parent.replace(/"/g, "");
    if (c !== p && deps.has(c) && deps.has(p)) deps.get(c).add(p);
  }
  const order = [];
  const done = new Set();
  while (order.length < tables.length) {
    const ready = tables.filter((t) => !done.has(t) && [...deps.get(t)].every((p) => done.has(p)));
    if (ready.length === 0) fail("Tablolar arasında döngüsel bağımlılık var; taşıma yapılamadı.");
    for (const t of ready.sort()) {
      order.push(t);
      done.add(t);
    }
  }

  const srcTables = new Set(
    (await src.execute(`SELECT name FROM sqlite_master WHERE type = 'table'`)).rows.map((r) => String(r.name))
  );

  /* 4. Kopyalama: tek işlem; hata olursa hedef hiç değişmez */
  console.log("\n2) Kayıtlar aktarılıyor");
  await db.query("BEGIN");
  await db.query(`TRUNCATE ${tables.map((t) => `"${t}"`).join(", ")} RESTART IDENTITY CASCADE`);

  const convert = (v, type) => {
    if (v === null || v === undefined) return null;
    if (type === "boolean") return v === true || v === 1 || v === 1n || v === "1" || v === "true";
    if (typeof v === "bigint") return Number(v);
    if (v instanceof ArrayBuffer) return Buffer.from(v);
    return v;
  };

  const report = [];
  for (const t of order) {
    if (!srcTables.has(t)) continue;
    const res = await src.execute(`SELECT * FROM "${t}"`);
    if (res.rows.length === 0) continue;
    const targetCols = columns.get(t);
    const cols = res.columns.filter((c) => targetCols.has(c));
    const dropped = res.columns.filter((c) => !targetCols.has(c));
    if (dropped.length) console.log(`   ${t}: hedefte olmayan sütunlar atlandı (${dropped.join(", ")})`);

    const perBatch = Math.max(1, Math.min(500, Math.floor(60000 / cols.length)));
    for (let i = 0; i < res.rows.length; i += perBatch) {
      const chunk = res.rows.slice(i, i + perBatch);
      const values = [];
      const tuples = chunk.map((row) => {
        const ph = cols.map((c) => {
          values.push(convert(row[c], targetCols.get(c)));
          return `$${values.length}`;
        });
        return `(${ph.join(", ")})`;
      });
      await db.query(`INSERT INTO "${t}" (${cols.map((c) => `"${c}"`).join(", ")}) VALUES ${tuples.join(", ")}`, values);
    }
    report.push([t, res.rows.length]);
  }

  /* 5. Otomatik numaraları en büyük kimliğin ardına al */
  const seqs = (
    await db.query(
      `SELECT table_name, column_name FROM information_schema.columns
        WHERE table_schema = 'public' AND column_default LIKE 'nextval(%'`
    )
  ).rows;
  for (const { table_name: t, column_name: c } of seqs) {
    await db.query(
      `SELECT setval(pg_get_serial_sequence('"${t}"', '${c}'), COALESCE((SELECT max("${c}") FROM "${t}"), 0) + 1, false)`
    );
  }
  await db.query("COMMIT");

  const total = report.reduce((n, [, k]) => n + k, 0);
  const KEY = ["users", "media", "services", "products", "posts", "team", "references", "case_studies", "testimonials", "leads", "bookings"];
  console.log(`   ${report.length} tabloda ${total} satır aktarıldı`);
  console.log(`   ${report.filter(([t]) => KEY.includes(t)).map(([t, n]) => `${t}: ${n}`).join(", ")}`);
} catch (err) {
  await db.query("ROLLBACK").catch(() => {});
  fail(`Aktarım geri alındı, hedef değişmedi. Hata: ${err.message}`);
} finally {
  await db.end();
}

/* 6. Görseller */
if (SKIP_MEDIA) {
  console.log("\n3) Görseller atlandı (--medya-atla)");
} else if (!BLOB_TOKEN) {
  console.log("\n3) CANLI_BLOB_READ_WRITE_TOKEN yok: görseller yüklenmedi. Ekledikten sonra komutu --uzerine-yaz ile tekrar çalıştırın.");
} else {
  const mediaDir = path.join(ROOT, "media");
  const files = existsSync(mediaDir) ? readdirSync(mediaDir).filter((f) => !f.startsWith(".")) : [];
  const TYPES = { webp: "image/webp", png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", gif: "image/gif", svg: "image/svg+xml", avif: "image/avif" };

  /* Kayıtlı her dosya klasörde var mı */
  const mediaCols = (await src.execute(`SELECT * FROM "media"`)).rows;
  const referenced = new Set();
  for (const row of mediaCols) for (const [k, v] of Object.entries(row)) if (/(^|_)filename$/.test(k) && v) referenced.add(String(v));
  const missing = [...referenced].filter((f) => !files.includes(f));
  if (missing.length) console.log(`   Uyarı: ${missing.length} kayıtlı dosya /media klasöründe yok (${missing.slice(0, 5).join(", ")})`);

  console.log(`\n3) ${files.length} görsel dosyası Blob'a yükleniyor`);
  let ok = 0;
  const queue = [...files];
  await Promise.all(
    Array.from({ length: 4 }, async () => {
      while (queue.length) {
        const f = queue.shift();
        await put(f, readFileSync(path.join(mediaDir, f)), {
          access: "public",
          token: BLOB_TOKEN,
          addRandomSuffix: false,
          allowOverwrite: true,
          contentType: TYPES[f.split(".").pop().toLowerCase()] || "application/octet-stream",
        });
        ok++;
        if (ok % 25 === 0) console.log(`   ${ok}/${files.length}`);
      }
    })
  );
  console.log(`   ${ok} dosya yüklendi`);
}

console.log("\n✓ Taşıma tamamlandı.");
