/**
 * Yeni panel Fırsatlar testi. Yerel geliştirme sunucusunda:
 *   node scripts/qa/panel-firsatlar.mjs
 * Deneme Klinik yöneticisiyle (QA_B_*) yeni fırsat açar, aşamasını değiştirir,
 * kaybedildi nedenini yazar, not ve arama ekler; başka işletmenin fırsatını
 * açmayı dener; liste ve telefon görünümünü denetler. Yerel veriye yazar.
 */
import { readFileSync } from "node:fs";
import { parseEnv } from "node:util";
import { withPage, sleep, OUT } from "./cdp.mjs";
const env = parseEnv(readFileSync(new URL("../../.env.local", import.meta.url), "utf8"));
const j = (o) => JSON.stringify(o);
let fails = 0;
const check = (name, ok, extra = "") => { if (!ok) fails++; console.log(`${ok ? "✓" : "✗"} ${name}${extra ? "  " + extra : ""}`); };
const click = (p, sel, text) => p.evalJs(`(() => { const b = [...document.querySelectorAll(${j(sel)})].find(e => e.innerText.trim().startsWith(${j(text)})); if (!b) return false; b.click(); return true; })()`);

await withPage({ width: 1440, height: 900 }, async (p) => {
  const api = (method, url, body) => p.evalJs(`fetch(${j(url)},{method:${j(method)},headers:{"Content-Type":"application/json"},body:${body ? j(j(body)) : "undefined"}}).then(async r=>({s:r.status,b:await r.json().catch(()=>null)}))`);
  await p.goto("/admin/login", 4000);
  await api("POST", "/api/users/login", { email: env.SEED_ADMIN_EMAIL, password: env.SEED_ADMIN_PASSWORD });
  const guru = (await api("GET", "/api/tenants?where[slug][equals]=guru&depth=0")).b.docs[0];
  const guruDeal = (await api("GET", `/api/deals?where[tenant][equals]=${guru.id}&limit=1&depth=0`)).b.docs[0];
  await api("POST", "/api/users/logout");

  await api("POST", "/api/users/login", { email: env.QA_B_EMAIL, password: env.QA_B_PASSWORD });
  await p.goto("/panel/firsatlar", 8000);
  const cols = JSON.parse(await p.evalJs(`JSON.stringify([...document.querySelectorAll("main section[aria-label] h2")].map(h=>h.innerText))`));
  check("Pano üç açık aşamayla açılıyor", j(cols.slice(0, 3)) === j(["Aday", "Görüşme", "Teklif"]), j(cols));

  /* Yeni fırsat */
  const ts = Date.now();
  await click(p, "main button", "Yeni fırsat");
  await sleep(700);
  await p.evalJs(`document.querySelector("#yeni-firsat-ad").focus()`);
  await p.s("Input.insertText", { text: `Fırsat deneme ${ts}` });
  await p.evalJs(`document.querySelector("#yeni-firsat-tutar").focus()`);
  await p.s("Input.insertText", { text: "45000" });
  await click(p, '[role="dialog"] button[type="submit"]', "Fırsatı aç");
  await sleep(4500);
  let s = JSON.parse(await p.evalJs(`JSON.stringify({ q: location.search, title: document.querySelector('[role="dialog"] h2')?.innerText })`));
  check("Yeni fırsat açılıp ayrıntısı geliyor", s.title === `Fırsat deneme ${ts}` && /firsat=\d+/.test(s.q), j(s));
  const id = Number(new URLSearchParams(s.q).get("firsat"));
  let d = (await api("GET", `/api/deals/${id}?depth=0`)).b;
  check("Fırsat Klinik'te, Aday aşamasında ve tutarı doğru", d.stage === "aday" && d.value === 45000, j({ stage: d.stage, value: d.value, tenant: d.tenant }));

  /* Aşama, not, arama */
  await click(p, '[role="dialog"] [aria-label="Aşama"] button', "Teklif");
  await sleep(3500);
  d = (await api("GET", `/api/deals/${id}?depth=0`)).b;
  check("Ayrıntıdan aşama Teklif oldu", d.stage === "teklif", d.stage);
  await p.evalJs(`document.querySelector("#firsat-not").focus()`);
  await p.s("Input.insertText", { text: `Fiyat konuşuldu ${ts}` });
  await click(p, '[role="dialog"] button[type="submit"]', "Ekle");
  await sleep(3500);
  await click(p, '[role="dialog"] button', "Arama planla");
  await sleep(3500);
  const acts = (await api("GET", `/api/activities?where[deal][equals]=${id}&limit=20&depth=0`)).b.docs;
  check("Not ve arama görevi kaydedildi", acts.some((a) => a.type === "not" && a.body?.includes(`Fiyat konuşuldu ${ts}`)) && acts.some((a) => a.type === "arama" && a.done === false && a.dueAt), j(acts.map((a) => a.type)));
  const tl = await p.evalJs(`document.querySelector('[role="dialog"]').innerText.includes("Fiyat konuşuldu ${ts}")`);
  check("Not geçmişte görünüyor", tl === true);
  await p.screenshot(`${OUT}/firsat-ayrinti.png`);

  /* Kaybedildi nedeni */
  await click(p, '[role="dialog"] [aria-label="Aşama"] button', "Kaybedildi");
  await sleep(800);
  await p.evalJs(`document.querySelector("#kayip-neden").focus()`);
  await p.s("Input.insertText", { text: "Bütçe ertelendi" });
  await click(p, '[role="dialog"] button', "Kaybedildi olarak işaretle");
  await sleep(3500);
  d = (await api("GET", `/api/deals/${id}?depth=0`)).b;
  check("Kaybedildi ve neden kaydedildi", d.stage === "kaybedildi" && d.lostReason === "Bütçe ertelendi" && Boolean(d.closedAt), j({ stage: d.stage, lostReason: d.lostReason }));

  /* Başka işletmenin fırsatı */
  if (guruDeal) {
    await p.goto(`/panel/firsatlar?firsat=${guruDeal.id}`, 6000);
    const t = await p.evalJs(`document.querySelector('[role="dialog"] h2')?.innerText ?? null`);
    check("Klinik, Guru'nun fırsatını açamıyor", t === null, j(t));
    const r = await p.evalJs(`fetch("/api/deals/${guruDeal.id}").then(r=>r.status)`);
    check("Klinik, Guru'nun fırsatını API'den de okuyamıyor", r === 403 || r === 404, String(r));
  }

  /* Liste */
  await p.goto("/panel/firsatlar?gorunum=liste", 7000);
  const rows = await p.evalJs(`document.querySelectorAll("main tbody tr").length`);
  check("Liste görünümü satırlarla açılıyor", rows > 0, String(rows));
  await p.goto("/panel/firsatlar", 7000);
  await p.screenshot(`${OUT}/firsat-pano.png`);
});

await withPage({ width: 390, height: 844, mobile: true }, async (p) => {
  const api = (method, url, body) => p.evalJs(`fetch(${j(url)},{method:${j(method)},headers:{"Content-Type":"application/json"},body:${body ? j(j(body)) : "undefined"}}).then(async r=>({s:r.status,b:await r.json().catch(()=>null)}))`);
  await p.goto("/admin/login", 4000);
  await api("POST", "/api/users/login", { email: env.QA_B_EMAIL, password: env.QA_B_PASSWORD });
  await p.goto("/panel/firsatlar", 8000);
  const ov = await p.evalJs("document.documentElement.scrollWidth > innerWidth");
  check("Telefon: pano yatay kaymıyor", !ov);
  await p.screenshot(`${OUT}/firsat-telefon.png`);
});
console.log(fails ? `\n${fails} kontrol başarısız` : "\nTüm kontroller geçti");
process.exit(fails ? 1 : 0);
