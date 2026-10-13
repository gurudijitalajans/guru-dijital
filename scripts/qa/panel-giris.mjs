/**
 * Panel 4. aşama testi: giriş, parola, hesap, davet, /admin'in kapanması.
 * Yerel geliştirme sunucusunda:  node scripts/qa/panel-giris.mjs
 * Deneme hesabını (davetle) kendisi açar ve sonunda siler; yöneticinin
 * adını değiştirip geri alır. Parolası değişen tek hesap deneme hesabıdır.
 */
import { readFileSync } from "node:fs";
import { parseEnv } from "node:util";
import { withPage, OUT, sleep } from "./cdp.mjs";
const env = parseEnv(readFileSync(new URL("../../.env.local", import.meta.url), "utf8"));
const j = (o) => JSON.stringify(o);
let fails = 0;
const check = (name, ok, extra = "") => { if (!ok) fails++; console.log(`${ok ? "✓" : "✗"} ${name}${extra ? "  " + extra : ""}`); };
const QA_EMAIL = "qa-davet@ornek.test";
const QA_PASS = `Qa-${Date.now().toString(36)}-deneme`;

const run = (size, fn) => withPage(size, async (p) => {
  const api = (method, url, body) => p.evalJs(`fetch(${j(url)},{method:${j(method)},headers:{"Content-Type":"application/json"},body:${body ? j(j(body)) : "undefined"}}).then(async r=>({s:r.status,b:await r.json().catch(()=>null)}))`);
  const at = async (u, wait = 7000) => { await p.goto(u, wait); return p.evalJs("location.pathname + location.search"); };
  const text = () => p.evalJs(`document.body.innerText`);
  const click = (sel, label) => p.evalJs(`(()=>{const b=[...document.querySelectorAll(${j(sel)})].find(e=>e.innerText.trim()===${j(label)}); if(!b) return false; b.click(); return true})()`);
  /* Etiketiyle alan doldur (n: aynı etiketin kaçıncısı) */
  const fill = (label, v, n = 0) => p.evalJs(`(()=>{const l=[...document.querySelectorAll('label')].filter(e=>e.querySelector('span')?.innerText.trim()===${j(label)})[${n}]; const i=l?.querySelector('input'); if(!i) return false; Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,"value").set.call(i,${j(v)}); i.dispatchEvent(new Event("input",{bubbles:true})); return true})()`);
  /* Koşul sağlanana kadar bekle (ilk istekte geliştirme sunucusu derler, yavaş olabilir) */
  const until = async (expr, ms = 20000) => { for (let t = 0; t < ms; t += 500) { if (await p.evalJs(expr)) return true; await sleep(500); } return false; };
  await fn({ p, api, at, text, click, fill, until });
});

await run({ width: 1440, height: 900 }, async ({ p, api, at, text, click, fill, until }) => {
  /* Oturumsuz */
  check("/admin → giriş ekranı", (await at("/admin", 8000)) === "/giris");
  check("Derin bağlantı girişten sonra korunur", (await at("/panel/gelen?f=talep", 8000)) === `/giris?sonra=${encodeURIComponent("/panel/gelen?f=talep")}`);
  await p.screenshot(`${OUT}/giris.png`);
  await fill("E-posta", env.SEED_ADMIN_EMAIL);
  await fill("Parola", "yanlis-parola-qa");
  await click("button", "Giriş yap");
  check("Hatalı parola: açık hata mesajı", await until(`document.body.innerText.includes("E-posta ya da parola hatalı.")`));
  await fill("Parola", env.SEED_ADMIN_PASSWORD);
  await click("button", "Giriş yap");
  await until(`location.pathname === "/panel/gelen"`);
  await sleep(1500);
  check("Giriş: istenen sayfaya dönüldü", (await p.evalJs("location.pathname + location.search")) === "/panel/gelen?f=talep");
  check("Girişliyken /giris panele", (await at("/giris", 6000)) === "/panel");

  /* /admin kapandı */
  const svc = (await api("GET", "/api/services?limit=1&depth=0")).b.docs[0];
  check("/admin/collections/services/:id → panel düzenleyicisi", (await at(`/admin/collections/services/${svc.id}`, 9000)) === `/panel/duzenle/services/${svc.id}`);
  check("/admin/herhangi → panel", (await at("/admin/collections/payload-preferences", 7000)) === "/panel");
  check("/admin/account → Hesabım", (await at("/admin/account", 7000)) === "/panel/hesap");

  /* Hesabım */
  const me = (await api("GET", "/api/users/me")).b.user;
  await fill("Ad Soyad", me.name + " QA");
  await click("button", "Kaydet");
  await sleep(3000);
  check("Hesabım: ad kaydedildi", (await api("GET", "/api/users/me")).b.user.name === me.name + " QA");
  await api("PATCH", `/api/users/${me.id}`, { name: me.name });
  await fill("Yeni parola", "abcdefgh1");
  await fill("Yeni parola (tekrar)", "abcdefgh2");
  await click("button", "Parolayı değiştir");
  await sleep(800);
  check("Hesabım: farklı parolalar reddedilir", (await text()).includes("İki parola aynı değil."));
  await p.screenshot(`${OUT}/hesap.png`);

  /* Davet: bağlantı panelin parola ekranına */
  for (const d of (await api("GET", `/api/users?where[email][equals]=${QA_EMAIL}&depth=0`)).b?.docs ?? []) await api("DELETE", `/api/users/${d.id}`);
  const guru = (await api("GET", "/api/tenants?where[slug][equals]=guru&depth=0")).b.docs[0];
  await p.evalJs(`document.cookie="payload-tenant=${guru.id}; path=/"`);
  const inv = await api("POST", "/api/users/davet", { name: "QA Davetli", email: QA_EMAIL, role: "uye", modules: ["crm"] });
  const link = inv.b?.link ?? "";
  check("Davet bağlantısı panelin parola ekranı", /\/parola\/[^/]+$/.test(link), link.replace(/\/parola\/.+$/, "/parola/…"));
  globalThis.__link = link;

  /* Klasik ekran kapısı */
  check("Acil durum kapısı: /klasik → içerik ekranı açılır", (await at("/klasik", 12000)) === "/admin" && (await text()).includes("Klasik içerik ekranı"));
  check("Kapı kapanınca /admin yine panele", (await at("/klasik?kapat=1", 7000)) === "/panel/ayarlar" && (await at("/admin", 7000)) === "/panel");

  /* Çıkış */
  await p.evalJs(`document.querySelector('[aria-label="Hesap menüsü"]').dispatchEvent(new PointerEvent("pointerdown",{bubbles:true}))`);
  await sleep(600);
  await click("[role=menuitem]", "Çıkış yap");
  await sleep(3000);
  check("Çıkış: giriş ekranına", (await p.evalJs("location.pathname")) === "/giris" && (await api("GET", "/api/users/me")).b?.user === null);
});

/* Davetli: parolasını belirler, panele girer */
await run({ width: 390, height: 844, mobile: true }, async ({ p, api, at, text, click, fill, until }) => {
  const path = new URL(globalThis.__link).pathname;
  await at(path, 7000);
  const ov = await p.evalJs(`document.documentElement.scrollWidth - innerWidth`);
  check("Telefon: parola ekranı taşmıyor", ov <= 0, String(ov));
  await fill("Yeni parola", "kisa");
  await fill("Yeni parola (tekrar)", "kisa");
  await click("button", "Parolayı kaydet ve giriş yap");
  await sleep(600);
  check("Kısa parola reddedilir", (await text()).includes("en az 8 karakter"));
  await fill("Yeni parola", QA_PASS);
  await fill("Yeni parola (tekrar)", QA_PASS);
  await click("button", "Parolayı kaydet ve giriş yap");
  await until(`location.pathname === "/panel"`, 25000);
  await sleep(1500);
  const me = (await api("GET", "/api/users/me")).b?.user;
  check("Davetli parolasını belirledi ve panele girdi", (await p.evalJs("location.pathname")) === "/panel" && me?.email === QA_EMAIL);
  await p.screenshot(`${OUT}/davet-panel.png`);
  await api("POST", "/api/users/logout");
  await at(path, 6000);
  await fill("Yeni parola", QA_PASS);
  await fill("Yeni parola (tekrar)", QA_PASS);
  await click("button", "Parolayı kaydet ve giriş yap");
  check("Kullanılmış bağlantı: süresi doldu ekranı", await until(`document.body.innerText.includes("Bağlantının süresi dolmuş")`));
  check("/admin/logout → oturum kapatıldı mesajı", (await at("/admin/logout", 7000)) === "/giris?cikis=1" && (await text()).includes("Oturumunuz kapatıldı."));
  await at("/parola-sifirla", 6000);
  await fill("E-posta", QA_EMAIL);
  await click("button", "Bağlantı gönder");
  check("Parola sıfırlama: hesabın varlığını söylemeyen mesaj", await until(`document.body.innerText.includes("Bu adres bir hesaba aitse")`));
});

/* Temizlik */
await run({ width: 800, height: 600 }, async ({ api, p }) => {
  await p.goto("/giris", 3000);
  await api("POST", "/api/users/login", { email: env.SEED_ADMIN_EMAIL, password: env.SEED_ADMIN_PASSWORD });
  for (const d of (await api("GET", `/api/users?where[email][equals]=${QA_EMAIL}&depth=0`)).b?.docs ?? []) await api("DELETE", `/api/users/${d.id}`);
  check("Deneme hesabı silindi", (await api("GET", `/api/users?where[email][equals]=${QA_EMAIL}&depth=0`)).b?.totalDocs === 0);
});

console.log(fails ? `\n${fails} kontrol başarısız` : "\nTüm kontroller geçti");
process.exit(fails ? 1 : 0);
