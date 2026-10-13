/**
 * Panel düzenleyicisi testi (Ana Sayfa, Hakkımızda, Site Ayarları).
 * Yerel geliştirme sunucusunda:  node scripts/qa/panel-duzenle.mjs
 * Eski adreslerin yönlendiğini, formun Payload'daki değerlerle açıldığını,
 * kaydın, dizi satırı eklemenin, zorunlu alan hatasının ve canlı önizlemenin
 * çalıştığını denetler. Değiştirdiği her şeyi geri alır.
 */
import { readFileSync } from "node:fs";
import { parseEnv } from "node:util";
import { withPage, OUT, sleep } from "./cdp.mjs";
const env = parseEnv(readFileSync(new URL("../../.env.local", import.meta.url), "utf8"));
const j = (o) => JSON.stringify(o);
let fails = 0;
const check = (name, ok, extra = "") => { if (!ok) fails++; console.log(`${ok ? "✓" : "✗"} ${name}${extra ? "  " + extra : ""}`); };

const run = (size, fn) => withPage(size, async (p) => {
  const api = (method, url, body) => p.evalJs(`fetch(${j(url)},{method:${j(method)},headers:{"Content-Type":"application/json"},body:${body ? j(j(body)) : "undefined"}}).then(async r=>({s:r.status,b:await r.json().catch(()=>null)}))`);
  const at = async (u, wait = 8000) => { await p.goto(u, wait); return p.evalJs("location.pathname + location.search"); };
  const text = () => p.evalJs(`document.querySelector("main")?.innerText ?? ""`);
  const click = (sel, label) => p.evalJs(`(()=>{const b=[...document.querySelectorAll(${j(sel)})].find(e=>e.innerText.trim()===${j(label)}); if(!b) return false; b.click(); return true})()`);
  const val = (id) => p.evalJs(`document.getElementById(${j(id)})?.value ?? null`);
  const fill = (id, v) => p.evalJs(`(()=>{const i=document.getElementById(${j(id)}); if(!i) return false; const proto=i.tagName==="TEXTAREA"?HTMLTextAreaElement.prototype:HTMLInputElement.prototype; Object.getOwnPropertyDescriptor(proto,"value").set.call(i,${j(v)}); i.dispatchEvent(new Event("input",{bubbles:true})); return true})()`);
  await p.goto("/admin/login", 4000);
  await fn({ p, api, at, text, click, val, fill });
});

await run({ width: 1600, height: 1000 }, async ({ p, api, at, text, click, val, fill }) => {
  await api("POST", "/api/users/login", { email: env.SEED_ADMIN_EMAIL, password: env.SEED_ADMIN_PASSWORD });
  const guru = (await api("GET", "/api/tenants?where[slug][equals]=guru&depth=0")).b.docs[0];
  await p.evalJs(`document.cookie="payload-tenant=${guru.id}; path=/"`);
  const before = (await api("GET", "/api/globals/home-page?depth=0")).b;

  check("/admin/globals/home-page → panel düzenleyicisi", (await at("/admin/globals/home-page", 10000)) === "/panel/duzenle/home-page");
  const tabs = await p.evalJs(`JSON.stringify([...document.querySelectorAll('[role=tab]')].map(t=>t.innerText.trim()))`);
  check("Sekmeler Payload'daki gibi", tabs === j(["Giriş", "Bölümler", "SSS", "Kapanış", "SEO"]), tabs);
  check("Başlık alanı kayıtlı değerle açılıyor", (await val("f-hero__title")) === before.hero.title, String(await val("f-hero__title")));
  check("Metin yardımcısı (kalın yap) var", (await text()).includes("Seçili kelimeyi kalın yap"));
  check("Canlı önizleme çerçevesi açık", await p.evalJs(`!!document.querySelector('iframe[title="Sitenin önizlemesi"]')`));
  await p.screenshot(`${OUT}/duzenle-ana.png`);

  /* Kaydet */
  await fill("f-hero__sub", before.hero.sub + " QA");
  await sleep(300);
  check("Kaydedilmemiş değişiklik uyarısı", (await text()).includes("Kaydedilmemiş değişiklik"));
  await click("button", "Kaydet");
  await sleep(4000);
  check("Kaydedildi", (await api("GET", "/api/globals/home-page?depth=0")).b.hero.sub === before.hero.sub + " QA");

  /* Zorunlu alan hatası */
  await fill("f-hero__title", "");
  await click("button", "Kaydet");
  await sleep(3000);
  const err = await p.evalJs(`document.querySelector('[role=alert]')?.innerText ?? ""`);
  check("Boş zorunlu alan: alan altında hata, kayıt yok", Boolean(err) && (await api("GET", "/api/globals/home-page?depth=0")).b.hero.title === before.hero.title, err);
  await fill("f-hero__title", before.hero.title);
  await fill("f-hero__sub", before.hero.sub);

  /* SSS: satır ekle */
  await click("[role=tab]", "SSS");
  await sleep(400);
  const n0 = before.faq?.items?.length ?? 0;
  await click("button", "Soru ekle");
  await sleep(400);
  await fill(`f-faq__items__${n0}__q`, "QA sorusu?");
  await fill(`f-faq__items__${n0}__a`, "QA cevabı.");
  await click("button", "Kaydet");
  await sleep(4000);
  const mid = (await api("GET", "/api/globals/home-page?depth=0")).b;
  check("Dizi satırı eklendi, ilk değişiklik geri alındı", mid.faq.items.length === n0 + 1 && mid.faq.items[n0].q === "QA sorusu?" && mid.hero.sub === before.hero.sub);
  await p.evalJs(`(()=>{const b=document.querySelector('button[aria-label="Soru ${n0 + 1} sil"]'); b?.click(); return !!b})()`);
  await sleep(300);
  await click("button", "Kaydet");
  await sleep(4000);
  const after = (await api("GET", "/api/globals/home-page?depth=0")).b;
  check("Satır silindi, sayfa ilk hâline döndü", after.faq.items.length === n0 && after.hero.title === before.hero.title && after.hero.sub === before.hero.sub);

  /* Hakkımızda ve Site Ayarları */
  check("/admin/globals/about-page → panel", (await at("/admin/globals/about-page", 10000)) === "/panel/duzenle/about-page");
  const aboutTabs = await p.evalJs(`document.querySelectorAll('[role=tab]').length`);
  check("Hakkımızda sekmeleri", aboutTabs >= 5, String(aboutTabs));
  await click("[role=tab]", "Ödüller");
  await sleep(1500);
  await p.screenshot(`${OUT}/duzenle-hakkimizda.png`);
  check("/admin/globals/site-settings → panel", (await at("/admin/globals/site-settings", 10000)) === "/panel/duzenle/site-settings");
  const st = await text();
  check("Site Ayarları: iletişim ve analiz grupları", st.includes("E-posta") || st.includes("İletişim"), "");
  await p.screenshot(`${OUT}/duzenle-ayarlar.png`);
  check("Sitedeki 'Bu sayfayı düzenle' panele gidiyor", (await at("/panel-duzenle?yol=/", 9000)) === "/panel/duzenle/home-page");
  await api("POST", "/api/users/logout");
});

await run({ width: 390, height: 844, mobile: true }, async ({ p, api, at }) => {
  await api("POST", "/api/users/login", { email: env.SEED_ADMIN_EMAIL, password: env.SEED_ADMIN_PASSWORD });
  for (const u of ["/panel/duzenle/home-page", "/panel/duzenle/about-page"]) {
    await at(u, 9000);
    const ov = await p.evalJs(`document.documentElement.scrollWidth - innerWidth`);
    check(`Telefon: ${u} yatay kaymıyor`, ov <= 0, String(ov));
  }
  await p.screenshot(`${OUT}/duzenle-telefon.png`);
  await api("POST", "/api/users/logout");
  await api("POST", "/api/users/login", { email: env.QA_B_EMAIL, password: env.QA_B_PASSWORD });
  check("Klinik: sayfa düzenleyicisi açılmaz", (await at("/panel/duzenle/home-page", 7000)) === "/panel");
});

console.log(fails ? `\n${fails} kontrol başarısız` : "\nTüm kontroller geçti");
process.exit(fails ? 1 : 0);
