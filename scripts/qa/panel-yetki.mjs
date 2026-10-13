/**
 * Yeni panel (/panel) yetki ve ekran testi. Yerel geliştirme sunucusunda:
 *   node scripts/qa/panel-yetki.mjs
 * Gerekenler: çalışan `npm run dev`, Chrome, .env.local'da SEED_ADMIN_*,
 * QA_B_* (Deneme Klinik yöneticisi) ve QA_UYE_* (Guru'da yalnız Operasyon).
 * Oturumsuz erişimi, işletme ayrımını (başka işletmenin kaydı ve çerezi),
 * modül yetkisini, menüyü, aramayı ve telefon görünümünü denetler.
 */
import { readFileSync } from "node:fs";
import { parseEnv } from "node:util";
import { withPage, sleep, OUT } from "./cdp.mjs";
const env = parseEnv(readFileSync(new URL("../../.env.local", import.meta.url), "utf8"));
const j = (o) => JSON.stringify(o);
let fails = 0;
const check = (name, ok, extra = "") => { if (!ok) fails++; console.log(`${ok ? "✓" : "✗"} ${name}${extra ? "  " + extra : ""}`); };

for (const [w, h] of [[1440, 900], [390, 844]]) {
  await withPage({ width: w, height: h, mobile: w < 600 }, async (p) => {
    const api = (method, url, body) => p.evalJs(`fetch(${j(url)},{method:${j(method)},headers:{"Content-Type":"application/json"},body:${body ? j(j(body)) : "undefined"}}).then(async r=>({s:r.status,b:await r.json().catch(()=>null)}))`);
    const login = (email, password) => api("POST", "/api/users/login", { email, password });
    const logout = () => api("POST", "/api/users/logout");
    const cookie = (id) => p.evalJs(`document.cookie="payload-tenant=${id}; path=/"`);
    const state = async () => JSON.parse(await p.evalJs(`JSON.stringify({ path: location.pathname, search: location.search, h1: document.querySelector("main h1")?.innerText, tenant: document.querySelector('[aria-label^="İşletme"]')?.getAttribute("aria-label") ?? document.querySelector("aside")?.innerText.split("\\n").slice(1,2).join(""), nav: [...document.querySelectorAll('nav[aria-label="Ana menü"] a')].map(a=>a.innerText.split("\\n")[0].trim()), rows: (innerWidth < 768 ? [...document.querySelectorAll("[data-mobile-list] li button > span > span:first-child")] : [...document.querySelectorAll("main tbody tr td:first-child")]).map(e=>e.innerText.split("\\n")[0]), dialog: document.querySelector('[role="dialog"] h2')?.innerText ?? null, overflow: document.documentElement.scrollWidth > innerWidth })`));
    const mobile = w < 600;
    const tag = mobile ? "telefon" : "masaüstü";
    await p.goto("/admin/login", 4000);

    if (!mobile) {
      await logout();
      await p.goto("/panel", 6000);
      const s0 = await state();
      check("Oturum yoksa giriş ekranına yönlendirir", s0.path === "/giris", s0.path + s0.search);
    }

    /* Guru yöneticisi */
    await login(env.SEED_ADMIN_EMAIL, env.SEED_ADMIN_PASSWORD);
    const tenants = (await api("GET", "/api/tenants?limit=50&depth=0")).b.docs;
    const guru = tenants.find((t) => t.slug === "guru"), klinik = tenants.find((t) => t.slug === "deneme-klinik");
    const guruContact = (await api("GET", `/api/contacts?where[tenant][equals]=${guru.id}&limit=1&depth=0`)).b.docs[0];
    const klinikContacts = (await api("GET", `/api/contacts?where[tenant][equals]=${klinik.id}&limit=500&depth=0`)).b.docs.map((c) => c.name);
    await cookie(guru.id);
    await p.goto("/panel", 7000);
    let s = await state();
    check(`[${tag}] Guru: ana sayfa açılıyor`, s.path === "/panel" && /Günaydın|İyi günler|İyi akşamlar/.test(s.h1 ?? ""), s.h1);
    if (!mobile) check("Guru: menüde Operasyon ve Web sitesi var", s.nav.includes("Görevler") && s.nav.includes("Site içeriği"), j(s.nav));
    check(`[${tag}] Sayfa yatay kaymıyor`, !s.overflow);
    await p.screenshot(`${OUT}/panel-ana-${tag}.png`);

    await cookie(klinik.id);
    await p.goto("/panel", 6000);
    s = await state();
    if (!mobile) check("Guru, Klinik seçince menü Klinik'in modülleriyle (Operasyon ve site yok)", !s.nav.includes("Görevler") && !s.nav.includes("Site içeriği") && s.nav.includes("Kişiler ve firmalar"), j(s.nav));

    if (!mobile) {
      /* Arama (Cmd+K) */
      await p.evalJs(`document.querySelector('button[aria-label="Ara ya da sayfaya git"]').click()`);
      await sleep(800);
      const first = klinikContacts[0] ?? "";
      await p.s("Input.insertText", { text: first.slice(0, 5) });
      await sleep(2500);
      const hits = JSON.parse(await p.evalJs(`JSON.stringify([...document.querySelectorAll('[cmdk-item]')].map(e=>e.innerText.split("\\n")[0]))`));
      check("Arama Klinik kişisini buluyor", hits.some((x) => x === first), j(hits.slice(0, 6)));
      await p.screenshot(`${OUT}/panel-arama.png`);
      await p.evalJs(`document.dispatchEvent(new KeyboardEvent("keydown",{key:"Escape",bubbles:true}))`);
    }
    await logout();

    /* Klinik yöneticisi: yalnız kendi işletmesi */
    await login(env.QA_B_EMAIL, env.QA_B_PASSWORD);
    await cookie(guru.id); /* başka işletmenin çerezi: yok sayılmalı */
    await p.goto("/panel/kisiler", 7000);
    s = await state();
    check(`[${tag}] Klinik: başka işletmenin çerezi yok sayılır, kendi kişileri listelenir`, s.path === "/panel/kisiler" && s.rows.length > 0 && s.rows.every((n) => klinikContacts.includes(n)), `${s.rows.length} satır`);
    check(`[${tag}] Klinik: kişiler sayfası yatay kaymıyor`, !s.overflow);
    await p.screenshot(`${OUT}/panel-kisiler-${tag}.png`);
    if (!mobile) {
      await p.goto(`/panel/kisiler?kisi=${guruContact.id}`, 6000);
      s = await state();
      check("Klinik: Guru'nun kişisini adres satırından açamıyor", s.dialog === null, j(s.dialog));
      await p.evalJs(`document.querySelector("main tbody tr")?.click()`);
      await sleep(3500);
      s = await state();
      check("Klinik: satıra tıklayınca kendi kişisinin ayrıntısı açılıyor", Boolean(s.dialog) && klinikContacts.includes(s.dialog), j(s.dialog));
      await p.screenshot(`${OUT}/panel-kisi-ayrinti.png`);
      await p.goto("/panel/ayarlar", 6000);
      s = await state();
      const settings = JSON.parse(await p.evalJs(`JSON.stringify([...document.querySelectorAll("main a .font-semibold")].map(e=>e.innerText))`));
      check("Klinik: ayarlarda Guru'ya özel bölüm yok", !settings.includes("İşletmeler") && !settings.includes("Kullanım") && settings.includes("Ekip ve yetkiler"), j(settings));
    }
    await logout();

    /* Guru'da yalnız Operasyon yetkisi olan üye: CRM sayfası açılmaz */
    if (!mobile) {
      await login(env.QA_UYE_EMAIL, env.QA_UYE_PASSWORD);
      await p.goto("/panel/kisiler", 6000);
      s = await state();
      check("Üye (CRM yetkisi yok): kişiler sayfası ana sayfaya döner", s.path === "/panel", s.path);
      check("Üye: menüde Satış yok, Görevler var", !s.nav.includes("Kişiler ve firmalar") && s.nav.includes("Görevler"), j(s.nav));
      const settings = JSON.parse(await p.evalJs(`(async()=>{ const r = await fetch("/panel/ayarlar"); const t = await r.text(); return JSON.stringify({ ekip: t.includes("Ekip ve yetkiler"), isletmeler: t.includes(">İşletmeler<") }); })()`));
      check("Üye: ayarlarda Ekip ve yetkiler yok", !settings.ekip && !settings.isletmeler, j(settings));
      await logout();
    }
  });
}
console.log(fails ? `\n${fails} kontrol başarısız` : "\nTüm kontroller geçti");
process.exit(fails ? 1 : 0);
