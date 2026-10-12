/**
 * Yeni panel Görevler ve Ekip yükü testi. Yerel geliştirme sunucusunda:
 *   node scripts/qa/panel-gorevler.mjs
 * Guru yöneticisiyle (Guru Dijital seçili) görev açar, Tamam kuralını ve
 * kontrol listesini dener, ekip yükünü okur; demo işletmesinden Guru'nun
 * görevini açmayı dener; Operasyon'u olmayan işletme yöneticisinin
 * giremediğini ve telefon görünümünü denetler. Yerel veriye yazar.
 */
import { readFileSync } from "node:fs";
import { parseEnv } from "node:util";
import { withPage, sleep, OUT } from "./cdp.mjs";
const env = parseEnv(readFileSync(new URL("../../.env.local", import.meta.url), "utf8"));
const j = (o) => JSON.stringify(o);
let fails = 0;
const check = (name, ok, extra = "") => { if (!ok) fails++; console.log(`${ok ? "✓" : "✗"} ${name}${extra ? "  " + extra : ""}`); };
const click = (p, sel, text) => p.evalJs(`(() => { const b = [...document.querySelectorAll(${j(sel)})].find(e => e.innerText.trim().startsWith(${j(text)})); if (!b) return false; b.click(); return true; })()`);
const type = async (p, sel, text) => { await p.evalJs(`document.querySelector(${j(sel)}).focus()`); await p.s("Input.insertText", { text }); };
const plusDays = (n) => new Date(Date.now() + n * 86400000).toISOString().slice(0, 10);

await withPage({ width: 1440, height: 900 }, async (p) => {
  const api = (method, url, body) => p.evalJs(`fetch(${j(url)},{method:${j(method)},headers:{"Content-Type":"application/json"},body:${body ? j(j(body)) : "undefined"}}).then(async r=>({s:r.status,b:await r.json().catch(()=>null)}))`);
  const toast = () => p.evalJs(`[...document.querySelectorAll("[data-sonner-toast]")].map(t=>t.innerText).join(" | ")`);
  await p.goto("/admin/login", 4000);
  await api("POST", "/api/users/login", { email: env.SEED_ADMIN_EMAIL, password: env.SEED_ADMIN_PASSWORD });
  const tenants = (await api("GET", "/api/tenants?limit=50&depth=0")).b.docs;
  const guru = tenants.find((t) => t.slug === "guru"), demo = tenants.find((t) => t.slug === "demo");
  await p.evalJs(`document.cookie="payload-tenant=${guru.id}; path=/"`);
  await p.goto("/panel/gorevler", 8000);
  const cols = JSON.parse(await p.evalJs(`JSON.stringify([...document.querySelectorAll("main section[aria-label] h2")].map(h=>h.innerText))`));
  check("Pano dört aşamayla açılıyor", j(cols) === j(["Yapılacak", "Devam", "Kontrol", "Tamam"]), j(cols));

  /* Yeni görev: kendime, 6 saat, iki maddelik liste */
  const ts = Date.now();
  await click(p, "main button", "Yeni görev");
  await sleep(700);
  await type(p, "#yeni-gorev-ad", `Görev deneme ${ts}`);
  await type(p, "#yeni-gorev-saat", "6");
  await p.evalJs(`(() => { const i = document.querySelector("#yeni-gorev-teslim"); const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set; set.call(i, ${j(plusDays(2))}); i.dispatchEvent(new Event("input", { bubbles: true })); i.dispatchEvent(new Event("change", { bubbles: true })); })()`);
  await type(p, "#yeni-gorev-liste", "Taslak hazır\nMüşteri onayı");
  await click(p, '[role="dialog"] button[type="submit"]', "Görevi aç");
  await sleep(4500);
  const q = await p.evalJs("location.search");
  const id = Number(new URLSearchParams(q).get("gorev"));
  let t = id ? (await api("GET", `/api/tasks/${id}?depth=0`)).b : null;
  check("Görev açıldı: Guru'da, Yapılacak, 6 saat, 2 madde, sorumlu ben", t && t.stage === "yapilacak" && t.hours === 6 && t.checklist?.length === 2 && t.tenant === guru.id && t.assignee, j(t && { stage: t.stage, hours: t.hours, n: t.checklist?.length, tenant: t.tenant, assignee: t.assignee, due: t.dueDate }));

  /* Tamam kuralı */
  await click(p, '[role="dialog"] [aria-label="Aşama"] button', "Tamam");
  await sleep(1200);
  t = (await api("GET", `/api/tasks/${id}?depth=0`)).b;
  check("Yapılacak'tan Tamam'a geçmez", t.stage === "yapilacak", t.stage);
  check("Kural mesajı gösteriliyor", /Kontrol aşamasından/.test(await toast()));
  await click(p, '[role="dialog"] [aria-label="Aşama"] button', "Kontrol");
  await sleep(3500);
  await click(p, '[role="dialog"] [aria-label="Aşama"] button', "Tamam");
  await sleep(1500);
  t = (await api("GET", `/api/tasks/${id}?depth=0`)).b;
  check("Liste açıkken Kontrol'den Tamam'a geçmez", t.stage === "kontrol", t.stage);
  for (let i = 0; i < 2; i++) {
    await p.evalJs(`document.querySelectorAll('[role="dialog"] input[type="checkbox"]')[${i}].click()`);
    await sleep(2500);
  }
  t = (await api("GET", `/api/tasks/${id}?depth=0`)).b;
  check("Kontrol listesi işaretlendi", t.checklist.every((c) => c.done), j(t.checklist.map((c) => c.done)));
  await click(p, '[role="dialog"] [aria-label="Aşama"] button', "Tamam");
  await sleep(3500);
  t = (await api("GET", `/api/tasks/${id}?depth=0`)).b;
  check("Liste bitince Tamam'a geçti", t.stage === "tamam" && Boolean(t.completedAt), t.stage);
  await p.screenshot(`${OUT}/gorev-ayrinti.png`);

  /* Ekip yükü: açık bir görev daha (bu hafta, 8 saat) */
  const me = (await api("GET", "/api/users/me")).b.user;
  const load = (await api("POST", "/api/tasks", { tenant: guru.id, title: `Yük deneme ${ts}`, assignee: me.id, hours: 8, startDate: `${plusDays(0)}T12:00:00.000Z`, dueDate: `${plusDays(0)}T12:00:00.000Z`, stage: "yapilacak", priority: "normal" })).b.doc;
  await p.goto("/panel/ekip-yuku", 8000);
  const row = JSON.parse(await p.evalJs(`JSON.stringify([...document.querySelectorAll("main details")].map(d=>d.querySelector("summary").innerText.replace(/\\n/g," | ")).find(t=>t.includes(${j(me.name)})) ?? null)`));
  check("Ekip yükünde benim satırım ve saatim var", Boolean(row) && !/^\D*0 \/ /.test(row.split(" | ")[2] ?? ""), j(row));
  await p.evalJs(`[...document.querySelectorAll("main details")].find(d=>d.innerText.includes(${j(me.name)}))?.setAttribute("open","")`);
  await sleep(500);
  const listed = await p.evalJs(`document.querySelector("main details[open]")?.innerText.includes(${j(`Yük deneme ${ts}`)})`);
  check("Satırı açınca görev listeleniyor", listed === true);
  await p.screenshot(`${OUT}/ekip-yuku.png`);
  await api("DELETE", `/api/tasks/${load.id}`);

  /* Demo işletmesi seçiliyken Guru'nun görevi */
  if (demo) {
    await p.evalJs(`document.cookie="payload-tenant=${demo.id}; path=/"`);
    await p.goto(`/panel/gorevler?gorev=${id}`, 6000);
    const h = await p.evalJs(`document.querySelector('[role="dialog"] h2')?.innerText ?? null`);
    check("Başka işletme seçiliyken Guru'nun görevi açılmıyor", h === null, j(h));
  }
  await api("POST", "/api/users/logout");

  /* Operasyon'u olmayan işletme yöneticisi */
  await api("POST", "/api/users/login", { email: env.QA_B_EMAIL, password: env.QA_B_PASSWORD });
  await p.goto("/panel/gorevler", 6000);
  check("Klinik (Operasyon yok): Görevler ana sayfaya döner", (await p.evalJs("location.pathname")) === "/panel");
  await p.goto("/panel/ekip-yuku", 6000);
  check("Klinik (Operasyon yok): Ekip yükü ana sayfaya döner", (await p.evalJs("location.pathname")) === "/panel");
});

await withPage({ width: 390, height: 844, mobile: true }, async (p) => {
  const api = (method, url, body) => p.evalJs(`fetch(${j(url)},{method:${j(method)},headers:{"Content-Type":"application/json"},body:${body ? j(j(body)) : "undefined"}}).then(async r=>({s:r.status,b:await r.json().catch(()=>null)}))`);
  await p.goto("/admin/login", 4000);
  await api("POST", "/api/users/login", { email: env.SEED_ADMIN_EMAIL, password: env.SEED_ADMIN_PASSWORD });
  const guru = (await api("GET", "/api/tenants?where[slug][equals]=guru&depth=0")).b.docs[0];
  await p.evalJs(`document.cookie="payload-tenant=${guru.id}; path=/"`);
  for (const u of ["/panel/gorevler", "/panel/ekip-yuku"]) {
    await p.goto(u, 8000);
    check(`Telefon: ${u} sayfası yatay kaymıyor`, !(await p.evalJs("document.documentElement.scrollWidth > innerWidth")));
  }
  await p.screenshot(`${OUT}/ekip-yuku-telefon.png`);
});
console.log(fails ? `\n${fails} kontrol başarısız` : "\nTüm kontroller geçti");
process.exit(fails ? 1 : 0);
