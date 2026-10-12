/**
 * Panel yöneticisinin parolasını doğrudan veritabanında yeniler (e-posta
 * gerekmez). Bağlantı adresi ve parola yalnız sizin bilgisayarınızda kalır.
 *
 * Dosyayla (önerilen): proje klasöründeki .env.parola dosyasına
 *   DATABASE_URL=postgresql://...
 *   EMAIL=yonetici@guru.test
 *   PAROLA=yeni-parola
 * yazıp kaydedin, sonra çalıştırın:
 *   npx payload run scripts/parola-yenile.ts
 * Dosya iş bitince (başarılı ya da değil) silinir.
 *
 * Dosya yoksa terminalde sorar (DATABASE_URL ortamda olmalı).
 */
import { existsSync, readFileSync, rmSync } from "node:fs";
import { createInterface } from "node:readline";
import { getPayload } from "payload";

const FILE = new URL("../.env.parola", import.meta.url);

/* Düz metin dosyası: ANAHTAR=değer; tırnaklar (akıllı tırnak dahil) ve boşluklar atılır */
function readFile(): Record<string, string> {
  const out: Record<string, string> = {};
  for (const line of readFileSync(FILE, "utf8").split(/\r?\n/)) {
    const i = line.indexOf("=");
    if (i < 1) continue;
    out[line.slice(0, i).trim().toUpperCase()] = line
      .slice(i + 1)
      .trim()
      .replace(/^["'“”‘’]+|["'“”‘’]+$/g, "");
  }
  return out;
}

function ask(question: string, hidden = false): Promise<string> {
  const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: true });
  if (hidden) {
    const r = rl as unknown as { _writeToOutput: (s: string) => void; output: NodeJS.WriteStream };
    r._writeToOutput = (s: string) => {
      if (s.includes(question)) r.output.write(s);
      else if (s !== "\r\n" && s !== "\n") r.output.write("*");
    };
  }
  return new Promise((done) =>
    rl.question(question, (a) => {
      rl.close();
      if (hidden) process.stdout.write("\n");
      done(a.trim());
    }),
  );
}

const fromFile = existsSync(FILE);
const end = (code: number, msg: string) => {
  if (fromFile) rmSync(FILE, { force: true });
  console.log(msg + (fromFile ? "\n(.env.parola dosyası silindi.)" : ""));
  process.exit(code);
};

let email = "";
let pw = "";
let again = "";
if (fromFile) {
  const raw = readFileSync(FILE, "utf8");
  const f = readFile();
  /* Adres satırın neresinde olursa olsun alınır (örnek metnin yanına yapıştırılmış olabilir) */
  const url = (f.DATABASE_URL ?? "").match(/postgres(ql)?:\/\/\S+/)?.[0] ?? f.DATABASE_URL ?? "";
  f.DATABASE_URL = url;
  f.PAROLA = (f.PAROLA ?? "").replace(/BURAYA_YENI_PAROLANIZI_YAZIN/g, "").trim();
  /* Ne olduğunu içeriği yazmadan söyler */
  if (!/^postgres(ql)?:\/\//.test(url)) {
    const why = raw.trimStart().startsWith("{\\rtf")
      ? "Dosya zengin metin (RTF) olarak kaydedilmiş. TextEdit'te Biçim > Düz Metin Yap seçip kaydedin."
      : !url || url.startsWith("BURAYA")
        ? "DATABASE_URL= satırında adres yok: adresi satırın sonuna yapıştırıp Cmd+S ile kaydedin."
          : `DATABASE_URL değeri postgresql:// ile başlamıyor (ilk ${Math.min(url.length, 4)} karakter farklı; ${url.length} karakter).`;
    end(1, why);
  }
  process.env.DATABASE_URL = f.DATABASE_URL;
  email = (f.EMAIL ?? "").toLowerCase();
  pw = again = f.PAROLA ?? "";
}
if (!/^postgres(ql)?:\/\//.test(process.env.DATABASE_URL ?? "")) end(1, "Canlı veritabanı adresi yok (.env.parola dosyası ya da DATABASE_URL).");

/* Ayar dosyası adres ortama yazıldıktan sonra yüklenir */
const { default: config } = await import("@payload-config");
const payload = await getPayload({ config });
if (!email) email = (await ask("Yönetici e-postası: ")).toLowerCase();
const found = await payload.find({ collection: "users", where: { email: { equals: email } }, limit: 1, depth: 0, overrideAccess: true });
const user = found.docs[0];
if (!user) {
  const admins = await payload.find({ collection: "users", where: { role: { equals: "admin" } }, limit: 20, depth: 0, overrideAccess: true });
  end(1, `\n"${email}" adresiyle kullanıcı yok. Kayıtlı Guru yöneticileri:\n${admins.docs.map((a) => `  - ${a.email}`).join("\n")}\n\nDoğru adresle yeniden deneyin.`);
}
console.log(`Bulundu: ${user!.name} (${user!.role === "admin" ? "Guru yöneticisi" : "kullanıcı"})`);
if (!pw) {
  pw = await ask("Yeni parola (en az 12 karakter): ", true);
  again = await ask("Yeni parola (tekrar): ", true);
}
if (pw.length < 12) end(1, "Parola en az 12 karakter olmalı.");
if (pw !== again) end(1, "İki parola aynı değil.");
await payload.unlock({ collection: "users", data: { email } as never, overrideAccess: true });
await payload.update({ collection: "users", id: user!.id, data: { password: pw }, overrideAccess: true, context: { tenantSync: true } });
end(0, "Parola yenilendi ve hesap kilidi açıldı. Panele yeni parolayla girebilirsiniz.");
