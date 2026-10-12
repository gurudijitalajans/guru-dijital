/**
 * Yeni panel Projeler ve Teklifler testi. Yerel geliştirme sunucusunda:
 *   node scripts/qa/panel-proje-teklif.mjs
 * Klinik yöneticisiyle fırsattan teklif hazırlar (toplam, numara, durumla
 * fırsat aşaması); Guru yöneticisiyle şablonlu proje açar, görev ekler,
 * durum değiştirir; başka işletmenin kaydını açmayı dener; telefon görünümü.
 * Yerel veriye yazar.
 */
import { readFileSync } from "node:fs";
import { parseEnv } from "node:util";
import { withPage, sleep, OUT } from "./cdp.mjs";
const env = parseEnv(readFileSync(new URL("../../.env.local", import.meta.url), "utf8"));
const j = (o) => JSON.stringify(o);
let fails = 0;
const check = (name, ok, extra = "") => { if (!ok) fails++; console.log(`${ok ? "✓" : "✗"} ${name}${extra ? "  " + extra : ""}`); };
const click = (p, sel, text) => p.evalJs(`(() => { const b = [...document.querySelectorAll(${j(sel)})].find(e => e.innerText.trim().startsWith(${j(text)})); if (!b) return false; b.click(); return true; })()`);
const setVal = (p, sel, v) => p.evalJs(`(() => { const i = document.querySelector(${j(sel)}); const proto = i.tagName === "SELECT" ? HTMLSelectElement.prototype : HTMLInputElement.prototype; Object.getOwnPropertyDescriptor(proto, "value").set.call(i, ${j(v)}); i.dispatchEvent(new Event("input", { bubbles: true })); i.dispatchEvent(new Event("change", { bubbles: true })); })()`);

await withPage({ width: 1440, height: 900 }, async (p) => {
  const api = (method, url, body) => p.evalJs(`fetch(${j(url)},{method:${j(method)},headers:{"Content-Type":"application/json"},body:${body ? j(j(body)) : "undefined"}}).then(async r=>({s:r.status,b:await r.json().catch(()=>null)}))`);
  await p.goto("/admin/login", 4000);
  await api("POST", "/api/users/login", { email: env.SEED_ADMIN_EMAIL, password: env.SEED_ADMIN_PASSWORD });
  const tenants = (await api("GET", "/api/tenants?limit=50&depth=0")).b.docs;
  const guru = tenants.find((t) => t.slug === "guru"), klinik = tenants.find((t) => t.slug === "deneme-klinik"), demo = tenants.find((t) => t.slug === "demo");
  const guruQuote = (await api("GET", `/api/quotes?where[tenant][equals]=${guru.id}&limit=1&depth=0`)).b.docs[0];
  const ts = Date.now();
  const kDeal = (await api("POST", "/api/deals", { tenant: klinik.id, title: `Teklif fırsatı ${ts}`, stage: "gorusme", value: 20000, service: "İmplant" })).b.doc;
  await api("POST", "/api/users/logout");

  /* ---- Teklif: Klinik yöneticisi ---- */
  await api("POST", "/api/users/login", { email: env.QA_B_EMAIL, password: env.QA_B_PASSWORD });
  await p.goto(`/panel/teklifler/yeni?firsat=${kDeal.id}`, 8000);
  const title = await p.evalJs(`document.querySelector("#teklif-konu").value`);
  check("Fırsattan yeni teklif: konu ve fırsat dolu", title.includes("İmplant") && (await p.evalJs(`document.querySelector("#teklif-firsat").value`)) === String(kDeal.id), j(title));
  await setVal(p, "#kalem-0-miktar", "2");
  await setVal(p, "#kalem-0-fiyat", "10000");
  await sleep(400);
  const shownTotal = await p.evalJs(`[...document.querySelectorAll("aside dd")].pop()?.innerText`);
  check("Ekrandaki genel toplam KDV dahil 24.000", shownTotal === "₺24.000,00", String(shownTotal));
  await click(p, "form button[type=submit]", "Kaydet");
  await sleep(5000);
  const path = await p.evalJs("location.pathname");
  const qid = Number(path.split("/").pop());
  let qt = qid ? (await api("GET", `/api/quotes/${qid}?depth=0`)).b : null;
  check("Teklif kaydedildi: numara DK-, toplam 24000, fırsata bağlı, Klinik'te", qt && /^DK-\d{4}-\d{3}$/.test(qt.number ?? "") && qt.total === 24000 && qt.deal === kDeal.id && qt.tenant === klinik.id, j(qt && { number: qt.number, total: qt.total, deal: qt.deal, tenant: qt.tenant }));
  await click(p, '[aria-label="Durum"] button', "Gönderildi");
  await sleep(3500);
  let dl = (await api("GET", `/api/deals/${kDeal.id}?depth=0`)).b;
  check("Gönderildi: fırsat Teklif aşamasına geçti", dl.stage === "teklif", dl.stage);
  await click(p, '[aria-label="Durum"] button', "Kabul");
  await sleep(3500);
  dl = (await api("GET", `/api/deals/${kDeal.id}?depth=0`)).b;
  check("Kabul: fırsat Kazanıldı oldu", dl.stage === "kazanildi", dl.stage);
  await p.screenshot(`${OUT}/teklif-duzen.png`);
  await p.goto("/panel/teklifler", 7000);
  const listed = await p.evalJs(`document.querySelector("main tbody")?.innerText.includes(${j(qt?.number ?? "yok")})`);
  check("Teklif listede", listed === true);
  if (guruQuote) {
    await p.goto(`/panel/teklifler/${guruQuote.id}`, 6000);
    const h1 = await p.evalJs(`document.querySelector("main h1")?.innerText ?? ""`);
    check("Klinik, Guru'nun teklifini açamıyor", !h1.startsWith("Teklif "), j(h1));
  }
  await p.goto("/panel/projeler", 6000);
  check("Klinik (Operasyon yok): Projeler ana sayfaya döner", (await p.evalJs("location.pathname")) === "/panel");
  await api("POST", "/api/users/logout");

  /* ---- Proje: Guru yöneticisi ---- */
  await api("POST", "/api/users/login", { email: env.SEED_ADMIN_EMAIL, password: env.SEED_ADMIN_PASSWORD });
  await p.evalJs(`document.cookie="payload-tenant=${guru.id}; path=/"`);
  const tpl = (await api("GET", `/api/templates?where[tenant][equals]=${guru.id}&limit=1&depth=0`)).b.docs[0];
  await p.goto("/panel/projeler?yeni=1", 8000);
  await p.evalJs(`document.querySelector("#yeni-proje-ad").focus()`);
  await p.s("Input.insertText", { text: `Proje deneme ${ts}` });
  if (tpl) await setVal(p, "#yeni-proje-sablon", String(tpl.id));
  await click(p, '[role="dialog"] button[type="submit"]', "Projeyi aç");
  await sleep(6000);
  const pid = Number(new URLSearchParams(await p.evalJs("location.search")).get("proje"));
  const ptasks = pid ? (await api("GET", `/api/tasks?where[project][equals]=${pid}&limit=100&depth=0`)).b.docs : [];
  check("Şablonlu proje açıldı, adımlar görev oldu", pid > 0 && (!tpl || ptasks.length === (tpl.steps?.length ?? 0)), j({ pid, tasks: ptasks.length, steps: tpl?.steps?.length }));
  await p.evalJs(`document.querySelector("#proje-yeni-gorev").focus()`);
  await p.s("Input.insertText", { text: `Hızlı görev ${ts}` });
  await click(p, '[role="dialog"] form button[type="submit"]', "Ekle");
  await sleep(3500);
  const added = (await api("GET", `/api/tasks?where[project][equals]=${pid}&where[title][equals]=${encodeURIComponent(`Hızlı görev ${ts}`)}&depth=0`)).b.docs[0];
  check("Projeden hızlı görev eklendi (sorumlu proje sorumlusu)", Boolean(added?.assignee), j(added && { assignee: added.assignee }));
  await click(p, '[role="dialog"] [aria-label="Durum"] button', "Beklemede");
  await sleep(3000);
  const pr = (await api("GET", `/api/projects/${pid}?depth=0`)).b;
  check("Proje durumu Beklemede", pr.status === "beklemede", pr.status);
  await p.screenshot(`${OUT}/proje-ayrinti.png`);
  if (demo) {
    await p.evalJs(`document.cookie="payload-tenant=${demo.id}; path=/"`);
    await p.goto(`/panel/projeler?proje=${pid}`, 6000);
    const h = await p.evalJs(`document.querySelector('[role="dialog"] h2')?.innerText ?? null`);
    check("Demo seçiliyken Guru'nun projesi açılmıyor", h === null, j(h));
  }
});

await withPage({ width: 390, height: 844, mobile: true }, async (p) => {
  const api = (method, url, body) => p.evalJs(`fetch(${j(url)},{method:${j(method)},headers:{"Content-Type":"application/json"},body:${body ? j(j(body)) : "undefined"}}).then(async r=>({s:r.status,b:await r.json().catch(()=>null)}))`);
  await p.goto("/admin/login", 4000);
  await api("POST", "/api/users/login", { email: env.SEED_ADMIN_EMAIL, password: env.SEED_ADMIN_PASSWORD });
  const guru = (await api("GET", "/api/tenants?where[slug][equals]=guru&depth=0")).b.docs[0];
  await p.evalJs(`document.cookie="payload-tenant=${guru.id}; path=/"`);
  for (const u of ["/panel/teklifler", "/panel/teklifler/yeni", "/panel/projeler"]) {
    await p.goto(u, 8000);
    check(`Telefon: ${u} yatay kaymıyor`, !(await p.evalJs("document.documentElement.scrollWidth > innerWidth")));
  }
  await p.goto("/panel/teklifler/yeni", 6000);
  await p.screenshot(`${OUT}/teklif-telefon.png`);
});
console.log(fails ? `\n${fails} kontrol başarısız` : "\nTüm kontroller geçti");
process.exit(fails ? 1 : 0);
