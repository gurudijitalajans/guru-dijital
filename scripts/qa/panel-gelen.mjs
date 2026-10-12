/**
 * Yeni panel Gelen kutusu testi. Yerel geliştirme sunucusunda:
 *   node scripts/qa/panel-gelen.mjs
 * Deneme Klinik yöneticisiyle (QA_B_*) sohbete yanıt verir, talep durumunu
 * değiştirir, başka işletmenin sohbetini açmayı dener ve telefon görünümünü
 * denetler. Yerel deneme verisine yazar.
 */
import { readFileSync } from "node:fs";
import { parseEnv } from "node:util";
import { withPage, sleep, OUT } from "./cdp.mjs";
const env = parseEnv(readFileSync(new URL("../../.env.local", import.meta.url), "utf8"));
const j = (o) => JSON.stringify(o);
let fails = 0;
const check = (name, ok, extra = "") => { if (!ok) fails++; console.log(`${ok ? "✓" : "✗"} ${name}${extra ? "  " + extra : ""}`); };

await withPage({ width: 1440, height: 900 }, async (p) => {
  const api = (method, url, body) => p.evalJs(`fetch(${j(url)},{method:${j(method)},headers:{"Content-Type":"application/json"},body:${body ? j(j(body)) : "undefined"}}).then(async r=>({s:r.status,b:await r.json().catch(()=>null)}))`);
  await p.goto("/admin/login", 4000);
  await api("POST", "/api/users/login", { email: env.SEED_ADMIN_EMAIL, password: env.SEED_ADMIN_PASSWORD });
  const tenants = (await api("GET", "/api/tenants?limit=50&depth=0")).b.docs;
  const guru = tenants.find((t) => t.slug === "guru"), klinik = tenants.find((t) => t.slug === "deneme-klinik");
  /* Deneme verisi: Klinik'te yanıt bekleyen bir sohbet ve yeni bir talep */
  const ts = Date.now();
  const conv = (await api("POST", "/api/conversations", { tenant: klinik.id, label: `Gelen deneme ${ts}`, status: "ekip", needsReply: true, lastText: "Fiyat alabilir miyim?", lastMessageAt: new Date().toISOString() })).b.doc;
  await api("POST", "/api/users/logout");
  const guruConv = (await (async () => { await api("POST", "/api/users/login", { email: env.SEED_ADMIN_EMAIL, password: env.SEED_ADMIN_PASSWORD }); return (await api("GET", `/api/conversations?where[tenant][equals]=${guru.id}&limit=1&depth=0`)).b.docs[0]; })());
  const lead = (await api("POST", "/api/leads", { tenant: klinik.id, name: `Talep Deneme ${ts}`, email: `talep-${ts}@example.com`, message: "İmplant için randevu almak istiyorum.", status: "yeni" })).b.doc;
  await api("POST", "/api/users/logout");
  check("Deneme verisi hazır", Boolean(conv?.id && lead?.id), j({ conv: conv?.id, lead: lead?.id }));

  await api("POST", "/api/users/login", { email: env.QA_B_EMAIL, password: env.QA_B_PASSWORD });
  await p.goto("/panel/gelen", 8000);
  const list = JSON.parse(await p.evalJs(`JSON.stringify([...document.querySelectorAll('aside[aria-label="Gelen kutusu"] li button')].map(b=>b.innerText.split("\\n")[0]))`));
  /* Sohbetin adı kendiliğinden verilir (ziyaretçi bilgi bırakınca adıyla) */
  const convLabel = (await api("GET", `/api/conversations/${conv.id}?depth=0`)).b?.label;
  check("Bekleyen listesinde yeni sohbet ve talep var", list.includes(convLabel) && list.includes(`Talep Deneme ${ts}`), j({ convLabel, list: list.slice(0, 6) }));
  const badge = await p.evalJs(`document.querySelector('nav[aria-label="Ana menü"] a[href="/panel/gelen"] [aria-label$="bekleyen"]')?.innerText`);
  check("Menüde bekleyen sayısı görünüyor", Number(badge) > 0, String(badge));

  /* Sohbete yanıt */
  await p.goto(`/panel/gelen?s=s${conv.id}`, 7000);
  await p.evalJs(`document.querySelector("#gelen-yanit").focus()`);
  await p.s("Input.insertText", { text: `Merhaba, fiyat listemizi iletiyorum ${ts}` });
  await sleep(300);
  await p.evalJs(`document.querySelector('form button[type="submit"]').click()`);
  await sleep(3500);
  const msgs = JSON.parse(await p.evalJs(`JSON.stringify([...document.querySelectorAll('[aria-live="polite"] div > div')].map(d=>d.innerText))`));
  check("Yanıt yazışmada görünüyor", msgs.some((m) => m.includes(`fiyat listemizi iletiyorum ${ts}`)), j(msgs.slice(-2)));
  const after = (await api("GET", `/api/conversations/${conv.id}?depth=0`)).b;
  check("Yanıttan sonra sohbet yanıt beklemiyor", after.needsReply === false && after.status === "ekip", j({ needsReply: after.needsReply, status: after.status }));
  await p.screenshot(`${OUT}/gelen-sohbet.png`);

  /* Talep durumu */
  await p.goto(`/panel/gelen?s=t${lead.id}`, 7000);
  await p.evalJs(`[...document.querySelectorAll('[role="group"][aria-label="Durum"] button')].find(b=>b.innerText.includes("İletişime geçildi"))?.click()`);
  await sleep(3000);
  const l2 = (await api("GET", `/api/leads/${lead.id}?depth=0`)).b;
  check("Talep durumu İletişime geçildi oldu", l2.status === "iletisim", l2.status);
  const deal = l2.deal ? (await api("GET", `/api/deals/${typeof l2.deal === "object" ? l2.deal.id : l2.deal}?depth=0`)).b : null;
  check("Bağlı fırsat Görüşme aşamasına geçti", !deal || deal.stage === "gorusme", deal?.stage ?? "fırsat yok");
  await p.screenshot(`${OUT}/gelen-talep.png`);

  /* Başka işletmenin sohbeti */
  if (guruConv) {
    await p.goto(`/panel/gelen?s=s${guruConv.id}`, 6000);
    const head = await p.evalJs(`document.querySelector('section[aria-label="Ayrıntı"] h2')?.innerText ?? null`);
    check("Klinik, Guru'nun sohbetini açamıyor", head === null, j(head));
  }
});

await withPage({ width: 390, height: 844, mobile: true }, async (p) => {
  const api = (method, url, body) => p.evalJs(`fetch(${j(url)},{method:${j(method)},headers:{"Content-Type":"application/json"},body:${body ? j(j(body)) : "undefined"}}).then(async r=>({s:r.status,b:await r.json().catch(()=>null)}))`);
  await p.goto("/admin/login", 4000);
  await api("POST", "/api/users/login", { email: env.QA_B_EMAIL, password: env.QA_B_PASSWORD });
  await p.goto("/panel/gelen?f=tumu", 8000);
  const ov1 = await p.evalJs("document.documentElement.scrollWidth > innerWidth");
  await p.evalJs(`document.querySelector('aside[aria-label="Gelen kutusu"] li button')?.click()`);
  await sleep(3500);
  const st = JSON.parse(await p.evalJs(`JSON.stringify({ listHidden: getComputedStyle(document.querySelector('aside[aria-label="Gelen kutusu"]')).display === "none", head: document.querySelector('section[aria-label="Ayrıntı"] h2')?.innerText, back: !!document.querySelector('button[aria-label="Listeye dön"]'), overflow: document.documentElement.scrollWidth > innerWidth })`));
  check("Telefon: listeden kayda geçiyor, geri düğmesi var", st.listHidden && Boolean(st.head) && st.back, j(st));
  check("Telefon: yatay kayma yok", !ov1 && !st.overflow);
  await p.screenshot(`${OUT}/gelen-telefon.png`);
});
console.log(fails ? `\n${fails} kontrol başarısız` : "\nTüm kontroller geçti");
process.exit(fails ? 1 : 0);
