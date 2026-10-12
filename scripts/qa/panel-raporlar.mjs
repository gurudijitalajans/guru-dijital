/**
 * Yeni panel Sohbet raporu ve Ziyaretçi analizi testi. Yerel geliştirme
 * sunucusunda (ziyaretçi verisi için sahte Umami ile: UMAMI_API_URL):
 *   node scripts/qa/panel-raporlar.mjs
 * Ekranların açıldığını, dönem seçimini, modül ve işletme yetkisini, telefon
 * görünümünü denetler. Umami bağlı değilse kurulum adımlarının çıktığını
 * kabul eder.
 */
import { readFileSync } from "node:fs";
import { parseEnv } from "node:util";
import { withPage, OUT } from "./cdp.mjs";
const env = parseEnv(readFileSync(new URL("../../.env.local", import.meta.url), "utf8"));
const j = (o) => JSON.stringify(o);
let fails = 0;
const check = (name, ok, extra = "") => { if (!ok) fails++; console.log(`${ok ? "✓" : "✗"} ${name}${extra ? "  " + extra : ""}`); };

await withPage({ width: 1440, height: 900 }, async (p) => {
  const api = (method, url, body) => p.evalJs(`fetch(${j(url)},{method:${j(method)},headers:{"Content-Type":"application/json"},body:${body ? j(j(body)) : "undefined"}}).then(async r=>({s:r.status,b:await r.json().catch(()=>null)}))`);
  const path = () => p.evalJs("location.pathname");
  await p.goto("/admin/login", 4000);
  await api("POST", "/api/users/login", { email: env.SEED_ADMIN_EMAIL, password: env.SEED_ADMIN_PASSWORD });
  const tenants = (await api("GET", "/api/tenants?limit=50&depth=0")).b.docs;
  const guru = tenants.find((t) => t.slug === "guru"), klinik = tenants.find((t) => t.slug === "deneme-klinik");
  await p.evalJs(`document.cookie="payload-tenant=${guru.id}; path=/"`);

  await p.goto("/panel/sohbet-raporu", 8000);
  const stats = await p.evalJs(`document.querySelectorAll("main .grid > .rounded-card").length`);
  check("Sohbet raporu dört göstergeyle açılıyor", stats >= 4, String(stats));
  const usage = await p.evalJs(`document.querySelector("main")?.innerText.includes("Bu ayın kullanımı")`);
  check("Bu ayın kullanımı görünüyor", usage === true);
  await p.goto("/panel/sohbet-raporu?gun=7", 6000);
  check("Dönem seçimi: 7 gün", (await p.evalJs(`document.querySelector('[aria-label="Dönem"] [aria-current="page"]')?.innerText`)) === "7 gün");
  await p.screenshot(`${OUT}/sohbet-raporu.png`);

  await p.goto("/panel/ziyaretci", 9000);
  const v = JSON.parse(await p.evalJs(`JSON.stringify({ setup: document.querySelector("main")?.innerText.includes("Ziyaretçi Analizini Bağlayın"), bars: document.querySelectorAll('main svg[aria-label^="Günlük"] rect').length, stats: document.querySelectorAll("main .xl\\\\:grid-cols-6 > div").length, lists: [...document.querySelectorAll("main ul")].filter(u=>u.children.length).length })`));
  if (v.setup) check("Ziyaretçi analizi: Umami bağlı değil, kurulum adımları görünüyor", true);
  else {
    check("Ziyaretçi analizi: 30 günlük grafik çiziliyor", v.bars === 60, j(v));
    check("Ziyaretçi analizi: altı gösterge ve dolu listeler", v.stats === 6 && v.lists >= 3, j(v));
  }
  await p.screenshot(`${OUT}/ziyaretci.png`);

  await p.evalJs(`document.cookie="payload-tenant=${klinik.id}; path=/"`);
  await p.goto("/panel/ziyaretci", 6000);
  check("Guru yöneticisi Klinik seçince ziyaretçi analizi açılmaz (site yalnız Guru'nun)", (await path()) === "/panel");
  await api("POST", "/api/users/logout");

  await api("POST", "/api/users/login", { email: env.QA_B_EMAIL, password: env.QA_B_PASSWORD });
  await p.goto("/panel/sohbet-raporu", 7000);
  check("Klinik (Sohbet var): sohbet raporu açılıyor", (await path()) === "/panel/sohbet-raporu");
  await p.goto("/panel/ziyaretci", 6000);
  check("Klinik: ziyaretçi analizi açılmaz", (await path()) === "/panel");
  await api("POST", "/api/users/logout");

  await api("POST", "/api/users/login", { email: env.QA_UYE_EMAIL, password: env.QA_UYE_PASSWORD });
  await p.goto("/panel/sohbet-raporu", 6000);
  check("Üye (Sohbet yetkisi yok): sohbet raporu açılmaz", (await path()) === "/panel");
});

await withPage({ width: 390, height: 844, mobile: true }, async (p) => {
  const api = (method, url, body) => p.evalJs(`fetch(${j(url)},{method:${j(method)},headers:{"Content-Type":"application/json"},body:${body ? j(j(body)) : "undefined"}}).then(async r=>({s:r.status,b:await r.json().catch(()=>null)}))`);
  await p.goto("/admin/login", 4000);
  await api("POST", "/api/users/login", { email: env.SEED_ADMIN_EMAIL, password: env.SEED_ADMIN_PASSWORD });
  const guru = (await api("GET", "/api/tenants?where[slug][equals]=guru&depth=0")).b.docs[0];
  await p.evalJs(`document.cookie="payload-tenant=${guru.id}; path=/"`);
  for (const u of ["/panel/sohbet-raporu", "/panel/ziyaretci"]) {
    await p.goto(u, 8000);
    check(`Telefon: ${u} yatay kaymıyor`, !(await p.evalJs("document.documentElement.scrollWidth > innerWidth")));
  }
  await p.screenshot(`${OUT}/ziyaretci-telefon.png`);
});
console.log(fails ? `\n${fails} kontrol başarısız` : "\nTüm kontroller geçti");
process.exit(fails ? 1 : 0);
