/**
 * Panel yöneticisinin parolasını doğrudan veritabanında yeniler (e-posta
 * gerekmez). Kendi terminalinizde çalıştırın; bağlantı adresi ve parola
 * yalnız sizin bilgisayarınızda kalır:
 *   DATABASE_URL='postgres://...' npx payload run scripts/parola-yenile.ts
 * E-postayı sorar; kullanıcı yoksa kayıtlı yönetici adreslerini listeler.
 * Varsa hesap kilidini açar ve yeni parolayı (yazarken görünmez) kaydeder.
 */
import { createInterface } from "node:readline";
import { getPayload } from "payload";
import config from "@payload-config";

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

const payload = await getPayload({ config });
const email = (await ask("Yönetici e-postası: ")).toLowerCase();
const found = await payload.find({ collection: "users", where: { email: { equals: email } }, limit: 1, depth: 0, overrideAccess: true });
const user = found.docs[0];
if (!user) {
  const admins = await payload.find({ collection: "users", where: { role: { equals: "admin" } }, limit: 20, depth: 0, overrideAccess: true });
  console.log(`\n"${email}" adresiyle kullanıcı yok. Kayıtlı Guru yöneticileri:`);
  for (const a of admins.docs) console.log(`  - ${a.email}`);
  console.log("\nDoğru adresle yeniden çalıştırın.");
  process.exit(1);
}
console.log(`Bulundu: ${user.name} (${user.role === "admin" ? "Guru yöneticisi" : "kullanıcı"})`);
const pw = await ask("Yeni parola (en az 12 karakter): ", true);
const again = await ask("Yeni parola (tekrar): ", true);
if (pw.length < 12) {
  console.log("Parola en az 12 karakter olmalı.");
  process.exit(1);
}
if (pw !== again) {
  console.log("İki parola aynı değil.");
  process.exit(1);
}
await payload.unlock({ collection: "users", data: { email } as never, overrideAccess: true });
await payload.update({ collection: "users", id: user.id, data: { password: pw }, overrideAccess: true, context: { tenantSync: true } });
console.log("Parola yenilendi ve hesap kilidi açıldı. Panele yeni parolayla girebilirsiniz.");
process.exit(0);
