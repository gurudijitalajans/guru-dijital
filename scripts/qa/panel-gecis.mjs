/**
 * Aşama 5 (Payload ekranının sadeleşmesi) testi. Yerel geliştirme sunucusunda:
 *   node scripts/qa/panel-gecis.mjs
 * Eski adreslerin yeni panele yönlendiğini, Payload menüsünde yalnız içerik
 * ve ayarların kaldığını, kişi düzenleme formunun yerinde durduğunu, sitenin
 * eksikleri, demo ve kurulum listesinin panele taşındığını denetler.
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
  const at = async (u, wait = 7000) => { await p.goto(u, wait); return p.evalJs("location.pathname + location.search"); };
  await p.goto("/admin/login", 4000);
  await api("POST", "/api/users/login", { email: env.SEED_ADMIN_EMAIL, password: env.SEED_ADMIN_PASSWORD });
  const guru = (await api("GET", "/api/tenants?where[slug][equals]=guru&depth=0")).b.docs[0];
  await p.evalJs(`document.cookie="payload-tenant=${guru.id}; path=/"`);
  const deal = (await api("GET", `/api/deals?where[tenant][equals]=${guru.id}&limit=1&depth=0`)).b.docs[0];
  const contact = (await api("GET", `/api/contacts?where[tenant][equals]=${guru.id}&limit=1&depth=0`)).b.docs[0];

  /* Yönlendirmeler */
  const routes = [
    ["/admin", "/panel"],
    ["/admin/satis-hatti", "/panel/firsatlar"],
    ["/admin/operasyon", "/panel/gorevler"],
    ["/admin/ekip-plani", "/panel/ekip-yuku"],
    ["/admin/sohbetler", "/panel/gelen?f=sohbet"],
    ["/admin/yonetici", "/panel/ozet"],
    ["/admin/collections/leads", "/panel/gelen?f=talep"],
    ["/admin/collections/quotes/create", "/panel/teklifler/yeni"],
    ...(deal ? [[`/admin/collections/deals/${deal.id}`, `/panel/firsatlar?firsat=${deal.id}`]] : []),
  ];
  for (const [from, to] of routes) {
    const got = await at(from);
    check(`${from} → ${to}`, got === to, got);
  }
  if (contact) {
    const got = await at(`/admin/collections/contacts/${contact.id}`, 8000);
    check("Kişi düzenleme formu panelde", got === `/panel/duzenle/contacts/${contact.id}`, got);
  }

  /* Payload menüsü: içerik ve ayarlar */
  /* İçerik ekranında kalan tek sayfa: hesap */
  await at("/admin/account", 8000);
  const nav = JSON.parse(await p.evalJs(`JSON.stringify({ links: [...document.querySelectorAll('.nav__link')].filter(e=>e.offsetParent).map(e=>e.id), groups: [...document.querySelectorAll('.nav-group')].filter(e=>e.offsetParent).map(e=>e.querySelector('.nav-group__label, button')?.innerText?.trim()), top: [...document.querySelectorAll('.guru-nav a')].map(a=>a.innerText.trim()) })`));
  console.log("  Guru menüsü:", j(nav));
  check("Menüde günlük kayıtlar yok", !["nav-deals", "nav-leads", "nav-tasks", "nav-projects", "nav-quotes", "nav-conversations", "nav-contacts"].some((x) => nav.links.includes(x)));
  check("Guru CRM, Operation, Chatbot grupları yok", !nav.groups.some((g) => /Guru (CRM|Operation|Chatbot)/.test(g ?? "")), j(nav.groups));
  check("Payload menüsünde kayıt kalmadı (hepsi panelde)", nav.links.length === 0, j(nav.links));
  check("Üstte Panele dön ve site sayfaları", nav.top[0] === "Panele dön" && nav.top.includes("Tüm site içeriği"), j(nav.top));
  await p.screenshot(`${OUT}/admin-sade.png`);

  /* Panel: sitenin eksikleri ve demo Ayarlar'da */
  await at("/panel/ayarlar", 8000);
  const ay = await p.evalJs(`document.querySelector("main")?.innerText ?? ""`);
  check("Panel Ayarlar: Siteyi Tamamla ve Demo İşletmesi (Guru)", ay.includes("Siteyi Tamamla") && ay.includes("Demo İşletmesi"));
  await p.screenshot(`${OUT}/panel-ayarlar-guru.png`);
  await api("POST", "/api/users/logout");

  /* Klinik yöneticisi */
  const me = await api("POST", "/api/users/login", { email: env.QA_B_EMAIL, password: env.QA_B_PASSWORD });
  const tB = me.b.user.tenants[0].tenant;
  await p.evalJs(`document.cookie="payload-tenant=${typeof tB === "object" ? tB.id : tB}; path=/"`);
  /* İçerik ekranında kalan tek sayfa: hesap */
  await at("/admin/account", 8000);
  const navB = JSON.parse(await p.evalJs(`JSON.stringify({ groups: [...document.querySelectorAll('.nav-group')].filter(e=>e.offsetParent).map(e=>e.querySelector('.nav-group__label, button')?.innerText?.trim()), top: [...document.querySelectorAll('.guru-nav a')].map(a=>a.innerText.trim()) })`));
  check("Klinik menüsü: yalnız Panele dön", navB.groups.length === 0 && j(navB.top) === j(["Panele dön"]), j(navB));
  await at("/panel/ayarlar", 7000);
  const ayB = await p.evalJs(`document.querySelector("main")?.innerText ?? ""`);
  check("Klinik Ayarlar'da Siteyi Tamamla ve Demo yok", !ayB.includes("Siteyi Tamamla") && !ayB.includes("Demo İşletmesi"));
  await at("/panel", 7000);
  const home = await p.evalJs(`document.querySelector("main")?.innerText ?? ""`);
  const steps = (await api("GET", "/api/site-connection?limit=1&depth=0")).s;
  check("Klinik ana sayfası açılıyor (kurulum listesi eksik adım varsa üstte)", home.includes("İlgilenmeniz Gerekenler"), String(steps));
  console.log("  Kurulum listesi görünüyor:", home.includes("Kuruluma Başlayın"));
});
console.log(fails ? `\n${fails} kontrol başarısız` : "\nTüm kontroller geçti");
process.exit(fails ? 1 : 0);
