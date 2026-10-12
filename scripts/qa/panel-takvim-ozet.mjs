/**
 * Yeni panel Takvim ve Yönetim özeti testi. Yerel geliştirme sunucusunda:
 *   node scripts/qa/panel-takvim-ozet.mjs
 * Takvime arama görevi düşer ve işaretlenir; özetteki kazanılan iş bu ayın
 * kazanılan fırsatlarıyla karşılaştırılır; yetkisi olmayanların giremediği ve
 * telefon görünümü denetlenir. Yerel veriye yazar.
 */
import { readFileSync } from "node:fs";
import { parseEnv } from "node:util";
import { withPage, sleep, OUT } from "./cdp.mjs";
const env = parseEnv(readFileSync(new URL("../../.env.local", import.meta.url), "utf8"));
const j = (o) => JSON.stringify(o);
let fails = 0;
const check = (name, ok, extra = "") => { if (!ok) fails++; console.log(`${ok ? "✓" : "✗"} ${name}${extra ? "  " + extra : ""}`); };
const istToday = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Istanbul" }).format(new Date());

await withPage({ width: 1440, height: 900 }, async (p) => {
  const api = (method, url, body) => p.evalJs(`fetch(${j(url)},{method:${j(method)},headers:{"Content-Type":"application/json"},body:${body ? j(j(body)) : "undefined"}}).then(async r=>({s:r.status,b:await r.json().catch(()=>null)}))`);
  await p.goto("/admin/login", 4000);
  await api("POST", "/api/users/login", { email: env.SEED_ADMIN_EMAIL, password: env.SEED_ADMIN_PASSWORD });
  const guru = (await api("GET", "/api/tenants?where[slug][equals]=guru&depth=0")).b.docs[0];
  await p.evalJs(`document.cookie="payload-tenant=${guru.id}; path=/"`);
  const ts = Date.now();
  const deal = (await api("GET", `/api/deals?where[tenant][equals]=${guru.id}&limit=1&depth=0`)).b.docs[0];
  const act = (await api("POST", "/api/activities", { tenant: guru.id, type: "arama", title: `Takvim deneme ${ts}`, deal: deal?.id, dueAt: new Date(`${istToday}T15:00:00+03:00`).toISOString(), done: false })).b.doc;

  await p.goto("/panel/takvim", 8000);
  const days = await p.evalJs(`document.querySelectorAll("main section[aria-label]").length`);
  check("Takvim yedi günle açılıyor", days === 7, String(days));
  const todayText = await p.evalJs(`[...document.querySelectorAll("main section[aria-label]")].find(s=>s.querySelector("header")?.innerText.includes("Bugün"))?.innerText ?? ""`);
  check("Arama görevi bugünün sütununda, saatiyle", todayText.includes(`Takvim deneme ${ts}`) && todayText.includes("15:00"), todayText.slice(0, 120));
  await p.evalJs(`document.querySelector('input[aria-label^="Takvim deneme ${ts}"]').click()`);
  await sleep(3000);
  const a2 = (await api("GET", `/api/activities/${act.id}?depth=0`)).b;
  check("Takvimden yapıldı olarak işaretlendi", a2.done === true, String(a2.done));
  await p.screenshot(`${OUT}/takvim.png`);
  await api("DELETE", `/api/activities/${act.id}`);

  /* Yönetim özeti: kazanılan iş bu ayın kazanılan fırsatlarıyla aynı */
  await p.goto("/panel/ozet", 9000);
  const shown = await p.evalJs(`[...document.querySelectorAll("main .tabular")].map(e=>e.innerText)[0] ?? ""`);
  const monthStart = new Date(`${istToday.slice(0, 7)}-01T00:00:00+03:00`).toISOString();
  const won = (await api("GET", `/api/deals?where[tenant][equals]=${guru.id}&where[stage][equals]=kazanildi&where[closedAt][greater_than_equal]=${encodeURIComponent(monthStart)}&limit=500&depth=0`)).b.docs;
  const sum = won.reduce((a, d) => a + (d.value ?? 0), 0);
  const expect = new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 }).format(sum);
  check("Özetteki kazanılan iş bu ayın kazanılan fırsatlarıyla aynı", shown === expect, j({ shown, expect }));
  const bars = await p.evalJs(`document.querySelectorAll('main svg[aria-label^="Aylara göre"] rect').length`);
  check("Altı aylık grafik çiziliyor", bars === 6, String(bars));
  await p.screenshot(`${OUT}/ozet.png`);
  await p.goto("/panel/ozet?donem=gecen-ay", 7000);
  const cur = await p.evalJs(`document.querySelector('[aria-label="Dönem"] [aria-current="page"]')?.innerText`);
  check("Dönem seçimi: Geçen ay", cur === "Geçen ay", String(cur));
  await api("POST", "/api/users/logout");

  /* Yetki: Business'ı olmayan işletme yöneticisi, yönetici olmayan üye */
  await api("POST", "/api/users/login", { email: env.QA_B_EMAIL, password: env.QA_B_PASSWORD });
  await p.goto("/panel/ozet", 6000);
  check("Klinik (Business yok): özet ana sayfaya döner", (await p.evalJs("location.pathname")) === "/panel");
  await p.goto("/panel/takvim", 6000);
  const legend = await p.evalJs(`document.querySelector("main")?.innerText ?? ""`);
  check("Klinik (CRM var, Operasyon yok): takvim açılıyor, teslimler yok", (await p.evalJs("location.pathname")) === "/panel/takvim" && !legend.includes("Görev teslimi"), "");
  await api("POST", "/api/users/logout");
  await api("POST", "/api/users/login", { email: env.QA_UYE_EMAIL, password: env.QA_UYE_PASSWORD });
  await p.goto("/panel/ozet", 6000);
  check("Üye (yönetici değil): özet ana sayfaya döner", (await p.evalJs("location.pathname")) === "/panel");
});

await withPage({ width: 390, height: 844, mobile: true }, async (p) => {
  const api = (method, url, body) => p.evalJs(`fetch(${j(url)},{method:${j(method)},headers:{"Content-Type":"application/json"},body:${body ? j(j(body)) : "undefined"}}).then(async r=>({s:r.status,b:await r.json().catch(()=>null)}))`);
  await p.goto("/admin/login", 4000);
  await api("POST", "/api/users/login", { email: env.SEED_ADMIN_EMAIL, password: env.SEED_ADMIN_PASSWORD });
  for (const u of ["/panel/takvim", "/panel/ozet"]) {
    await p.goto(u, 8000);
    check(`Telefon: ${u} yatay kaymıyor`, !(await p.evalJs("document.documentElement.scrollWidth > innerWidth")));
    await p.screenshot(`${OUT}/${u.split("/").pop()}-telefon.png`);
  }
});
console.log(fails ? `\n${fails} kontrol başarısız` : "\nTüm kontroller geçti");
process.exit(fails ? 1 : 0);
