/**
 * Panel 3. aşama testi: ayar ekranları. Yerel geliştirme sunucusunda:
 *   node scripts/qa/panel-ayarlar.mjs
 * Sohbet asistanı, site bağlantısı, yönetim özeti (işletme başına tek kayıt),
 * bilgi tabanı ve şablon listeleri, işletmeler, kullanıcılar, kullanım ve
 * işlem geçmişi, ekip, veri aktarma, görsel odak noktası, kişi formu; klinik
 * yöneticisinin yalnız kendi işletmesini gördüğü. Değişiklikleri geri alır.
 */
import { readFileSync } from "node:fs";
import { parseEnv } from "node:util";
import { withPage, OUT, sleep } from "./cdp.mjs";
const env = parseEnv(readFileSync(new URL("../../.env.local", import.meta.url), "utf8"));
const j = (o) => JSON.stringify(o);
let fails = 0;
let foreignKnowledge = null;
const check = (name, ok, extra = "") => { if (!ok) fails++; console.log(`${ok ? "✓" : "✗"} ${name}${extra ? "  " + extra : ""}`); };

const run = (fn) => withPage({ width: 1440, height: 1000 }, async (p) => {
  const api = (method, url, body) => p.evalJs(`fetch(${j(url)},{method:${j(method)},headers:{"Content-Type":"application/json"},body:${body ? j(j(body)) : "undefined"}}).then(async r=>({s:r.status,b:await r.json().catch(()=>null)}))`);
  const at = async (u, wait = 9000) => { await p.goto(u, wait); return p.evalJs("location.pathname + location.search"); };
  const text = () => p.evalJs(`document.querySelector("main")?.innerText ?? ""`);
  const click = (sel, label) => p.evalJs(`(()=>{const b=[...document.querySelectorAll(${j(sel)})].find(e=>e.innerText.trim()===${j(label)}); if(!b) return false; b.click(); return true})()`);
  const val = (id) => p.evalJs(`document.getElementById(${j(id)})?.value ?? null`);
  const fill = (id, v) => p.evalJs(`(()=>{const i=document.getElementById(${j(id)}); if(!i) return false; const proto=i.tagName==="TEXTAREA"?HTMLTextAreaElement.prototype:HTMLInputElement.prototype; Object.getOwnPropertyDescriptor(proto,"value").set.call(i,${j(v)}); i.dispatchEvent(new Event("input",{bubbles:true})); return true})()`);
  const rows = () => p.evalJs(`document.querySelectorAll("main table tbody tr").length`);
  await p.goto("/admin/login", 4000);
  await fn({ p, api, at, text, click, val, fill, rows });
});

await run(async ({ p, api, at, text, click, val, fill, rows }) => {
  await api("POST", "/api/users/login", { email: env.SEED_ADMIN_EMAIL, password: env.SEED_ADMIN_PASSWORD });
  const guru = (await api("GET", "/api/tenants?where[slug][equals]=guru&depth=0")).b.docs[0];
  await p.evalJs(`document.cookie="payload-tenant=${guru.id}; path=/"`);

  /* Sohbet asistanı: işletmenin tek kaydı */
  const cfg = (await api("GET", `/api/chatbot-config?where[tenant][equals]=${guru.id}&depth=0`)).b.docs[0];
  check("/admin/collections/chatbot-config → panel", (await at("/admin/collections/chatbot-config", 11000)) === "/panel/duzenle/chatbot-config");
  check("Sohbet asistanı formu işletmenin kaydıyla açılıyor", (await val("f-greeting")) === cfg.greeting && (await text()).includes("Bilgi Tabanını Doldurun"));
  await fill("f-greeting", cfg.greeting + " QA");
  await click("button", "Kaydet");
  await sleep(3500);
  check("Sohbet asistanı kaydedildi", (await api("GET", `/api/chatbot-config/${cfg.id}?depth=0`)).b.greeting === cfg.greeting + " QA");
  await fill("f-greeting", cfg.greeting);
  await click("button", "Kaydet");
  await sleep(3500);
  check("Geri alındı", (await api("GET", `/api/chatbot-config/${cfg.id}?depth=0`)).b.greeting === cfg.greeting);
  await p.screenshot(`${OUT}/ayar-sohbet.png`);

  /* Site bağlantısı: yerleştirme kodu */
  await at("/panel/duzenle/site-connection", 10000);
  const sc = (await api("GET", `/api/site-connection?where[tenant][equals]=${guru.id}&depth=0`)).b.docs[0];
  check("Site bağlantısı: kod site anahtarıyla", (await text()).includes(`data-key="${sc.siteKey}"`));
  await p.screenshot(`${OUT}/ayar-site.png`);
  check("Yönetim özeti ayarları açılıyor", (await at("/admin/collections/business-config", 10000)) === "/panel/duzenle/business-config" && (await p.evalJs(`document.querySelectorAll("main form section").length`)) > 0);

  /* Bilgi tabanı: liste, yeni kayıt, silme */
  const kTotal = (await api("GET", `/api/knowledge?where[tenant][equals]=${guru.id}&limit=0`)).b.totalDocs;
  check("/admin/collections/knowledge → liste", (await at("/admin/collections/knowledge", 9000)) === "/panel/kayitlar/knowledge");
  check("Bilgi tabanı listesi işletmenin kayıtları", (await rows()) === Math.min(kTotal, 50), `${await rows()}/${kTotal}`);
  await click("main a", "Yeni bilgi kaydı");
  await sleep(6000);
  await fill("f-title", "QA bilgi");
  await fill("f-content", "QA deneme bilgisi.");
  await click("button", "Kaydet");
  await sleep(4000);
  const kid = Number((await p.evalJs("location.pathname")).split("/").pop());
  const kdoc = kid ? (await api("GET", `/api/knowledge/${kid}?depth=0`)).b : null;
  check("Yeni bilgi kaydı seçili işletmede", String(kdoc?.tenant) === String(guru.id), String(kid));
  if (kid) {
    await click("button", "Sil");
    await sleep(400);
    await click("button", "Evet, sil");
    await sleep(4000);
    check("Bilgi kaydı silindi", (await api("GET", `/api/knowledge/${kid}?depth=0`)).s === 404);
  }

  /* Şablon, işletme, kullanıcı */
  await at("/panel/kayitlar/templates", 9000);
  const tHref = await p.evalJs(`document.querySelector("main table tbody a")?.getAttribute("href") ?? ""`);
  if (tHref) {
    await at(tHref, 10000);
    check("Süreç şablonu formu (adımlar dizisi)", (await text()).includes("ekle"), tHref);
  } else console.log("  (şablon yok, atlandı)");
  check("İşletmeler listesi", (await at("/admin/collections/tenants", 9000)) === "/panel/kayitlar/tenants" && (await rows()) > 0);
  await at(`/panel/duzenle/tenants/${guru.id}`, 10000);
  check("İşletme formu: modül seçimi", (await text()).includes("Guru CRM"));
  check("Kullanıcılar listesi", (await at("/admin/collections/users", 9000)) === "/panel/kayitlar/users" && (await rows()) > 0);
  const me = (await api("GET", "/api/users/me")).b.user;
  await at(`/panel/duzenle/users/${me.id}`, 10000);
  check("Kullanıcı formu açılıyor", (await val("f-email")) === me.email || (await text()).includes(me.name));

  /* Kullanım ve işlem geçmişi: yalnız görüntüleme */
  check("Kullanım listesi", (await at("/admin/collections/usage", 9000)) === "/panel/kayitlar/usage");
  await at("/panel/kayitlar/audit-log", 9000);
  const aHref = await p.evalJs(`document.querySelector("main table tbody a")?.getAttribute("href") ?? ""`);
  if (aHref) {
    await at(aHref, 10000);
    check("İşlem kaydı yalnız görüntülenir", (await text()).includes("Yalnız görüntüleme") && !(await p.evalJs(`[...document.querySelectorAll("button")].some(b=>b.innerText.trim()==="Kaydet")`)));
  }

  /* Ekip ve veri aktarma */
  check("/admin/ekip → panel", (await at("/admin/ekip", 9000)) === "/panel/ayarlar/ekip");
  check("Ekip: kendiniz ve davet formu", (await text()).includes("(siz)") && (await text()).includes("Davet et"));
  check("/admin/veri-aktar → panel", (await at("/admin/veri-aktar", 9000)) === "/panel/ayarlar/veri-aktar");
  await p.evalJs(`(()=>{const f=new File(["Ad Soyad;E-posta;Firma\\nQA Aktarım;qa-aktarim@ornek.test;QA Firma\\n"],"qa.csv",{type:"text/csv"}); const dt=new DataTransfer(); dt.items.add(f); const i=document.querySelector('input[type=file]'); i.files=dt.files; i.dispatchEvent(new Event("change",{bubbles:true})); return true})()`);
  await sleep(1500);
  check("Veri aktarma: sütunlar kendiliğinden eşleşti", (await text()).includes("2. Sütunları Eşleştirin") && (await text()).includes("qa-aktarim@ornek.test"));
  await click("button", "Önizle");
  await sleep(4000);
  check("Veri aktarma önizlemesi (aktarmadan)", (await text()).includes("Önizleme: Aktarınca Olacaklar") && (await api("GET", "/api/contacts?where[email][equals]=qa-aktarim@ornek.test&limit=0")).b.totalDocs === 0);
  await p.screenshot(`${OUT}/ayar-aktar.png`);

  /* Görsel odak noktası */
  const media = (await api("GET", "/api/media?limit=1&depth=0")).b.docs[0];
  check("/admin/collections/media/:id → medya ayrıntısı", (await at(`/admin/collections/media/${media.id}`, 9000)) === `/panel/medya?gorsel=${media.id}`);
  await sleep(1000);
  await p.evalJs(`(()=>{const b=document.querySelector('button[aria-label="Odak noktasını seçin"]'); const r=b.getBoundingClientRect(); b.dispatchEvent(new MouseEvent("click",{bubbles:true,clientX:r.left+r.width*0.25,clientY:r.top+r.height*0.75})); return true})()`);
  await sleep(300);
  await click("[role=dialog] button", "Kaydet");
  await sleep(4000);
  const fm = (await api("GET", `/api/media/${media.id}?depth=0`)).b;
  check("Odak noktası kaydedildi", fm.focalX === 25 && fm.focalY === 75, `${fm.focalX},${fm.focalY}`);
  await api("PATCH", `/api/media/${media.id}`, { focalX: media.focalX ?? 50, focalY: media.focalY ?? 50 });

  /* Klinik denemesi için Guru'ya ait bir bilgi kaydı (sonda silinir) */
  foreignKnowledge = (await api("POST", "/api/knowledge", { title: "QA yabancı kayıt", content: "x", tenant: guru.id })).b?.doc?.id ?? null;

  /* Kişi formu */
  const c = (await api("GET", `/api/contacts?where[tenant][equals]=${guru.id}&limit=1&depth=0`)).b.docs[0];
  if (c) {
    check("Eski kişi formu adresi panele", (await at(`/admin/collections/contacts/${c.id}`, 11000)) === `/panel/duzenle/contacts/${c.id}`);
    check("Kişi formu kayıtlı adla", (await val("f-name")) === c.name);
  }
  await api("POST", "/api/users/logout");
});

/* Klinik yöneticisi: yalnız kendi işletmesi */
await run(async ({ p, api, at, text, val }) => {
  const me = (await api("POST", "/api/users/login", { email: env.QA_B_EMAIL, password: env.QA_B_PASSWORD })).b.user;
  const t = me.tenants[0].tenant;
  const tid = typeof t === "object" ? t.id : t;
  await p.evalJs(`document.cookie="payload-tenant=${tid}; path=/"`);
  const own = (await api("GET", `/api/chatbot-config?where[tenant][equals]=${tid}&depth=0`)).b.docs[0];
  await at("/panel/duzenle/chatbot-config", 10000);
  check("Klinik: sohbet asistanı kendi kaydıyla", own ? (await val("f-greeting")) === own.greeting : true);
  check("Klinik: ekip ekranı kendi işletmesi", (await at("/panel/ayarlar/ekip", 9000)) === "/panel/ayarlar/ekip" && (await text()).includes("Deneme Klinik"));
  check("Klinik: işletmeler listesi açılmaz", (await at("/panel/kayitlar/tenants", 7000)) === "/panel");
  check("Klinik: tüm kullanıcılar listesi açılmaz", (await at("/panel/kayitlar/users", 7000)) === "/panel");
  check("Klinik: kullanım açılmaz", (await at("/panel/kayitlar/usage", 7000)) === "/panel");
  /* Okuma yetkisi yok: sayfa "bulunamadı" ya da listeye döner; kaydın içeriği hiç görünmez */
  await at(`/panel/duzenle/knowledge/${foreignKnowledge}`, 8000);
  check("Klinik: başka işletmenin bilgi kaydı açılmaz", Boolean(foreignKnowledge) && !(await p.evalJs(`document.body.innerText.includes("QA yabancı kayıt") || !!document.getElementById("f-title")`)), String(foreignKnowledge));
});

if (foreignKnowledge) await run(async ({ api }) => {
  await api("POST", "/api/users/login", { email: env.SEED_ADMIN_EMAIL, password: env.SEED_ADMIN_PASSWORD });
  await api("DELETE", `/api/knowledge/${foreignKnowledge}`);
});

console.log(fails ? `\n${fails} kontrol başarısız` : "\nTüm kontroller geçti");
process.exit(fails ? 1 : 0);
