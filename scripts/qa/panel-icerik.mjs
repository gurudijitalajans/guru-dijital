/**
 * Panel site içeriği testi. Yerel geliştirme sunucusunda:
 *   node scripts/qa/panel-icerik.mjs
 * Eski liste adreslerinin yönlendiğini, blog yazısının yayından kaldırılıp
 * geri alındığını (bekleyen taslak kaybolmadan), ekip üyesi ve vakanın
 * panelde eklenip düzenlenip silindiğini, telefonda taşma olmadığını ve
 * site modülü olmayan kullanıcının giremediğini denetler. Açtığı kayıtları
 * siler, değiştirdiklerini geri alır.
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
  const at = async (u, wait = 7000) => { await p.goto(u, wait); return p.evalJs("location.pathname + location.search"); };
  const text = () => p.evalJs(`document.body.innerText`);
  const click = (sel, label, starts = false) => p.evalJs(`(()=>{const b=[...document.querySelectorAll(${j(sel)})].find(e=>${starts ? `e.innerText.trim().startsWith(${j(label)})` : `e.innerText.trim()===${j(label)}`}); if(!b) return false; b.click(); return true})()`);
  /* Etiketi verilen alanı doldurur (input ya da textarea) */
  const fill = (label, value) => p.evalJs(`(()=>{const l=[...document.querySelectorAll('[role=dialog] label')].find(e=>e.querySelector('span')?.innerText.replace(" *","").trim()===${j(label)}); const i=l?.querySelector('input,textarea'); if(!i) return false; const proto=i.tagName==="TEXTAREA"?HTMLTextAreaElement.prototype:HTMLInputElement.prototype; Object.getOwnPropertyDescriptor(proto,"value").set.call(i,${j(value)}); i.dispatchEvent(new Event("input",{bubbles:true})); return true})()`);
  const kayit = async () => new URLSearchParams(await p.evalJs("location.search")).get("kayit");
  await p.goto("/admin/login", 4000);
  await fn({ p, api, at, text, click, fill, kayit });
});
const login = async (api, email, password) => api("POST", "/api/users/login", { email, password });

await run({ width: 1440, height: 900 }, async ({ p, api, at, text, click, fill, kayit }) => {
  await login(api, env.SEED_ADMIN_EMAIL, env.SEED_ADMIN_PASSWORD);
  const guru = (await api("GET", "/api/tenants?where[slug][equals]=guru&depth=0")).b.docs[0];
  await p.evalJs(`document.cookie="payload-tenant=${guru.id}; path=/"`);

  /* Yönlendirmeler */
  const team0 = (await api("GET", "/api/team?limit=1&depth=0&sort=order")).b.docs[0];
  for (const [from, to] of [["/admin/collections/posts", "/panel/icerik?tur=blog"], ["/admin/collections/services", "/panel/icerik?tur=hizmetler"], ["/admin/collections/references", "/panel/icerik?tur=referanslar"], ["/admin/collections/team/create", "/panel/icerik?tur=ekip&kayit=yeni"], ...(team0 ? [[`/admin/collections/team/${team0.id}`, `/panel/icerik?tur=ekip&kayit=${team0.id}`]] : [])]) {
    const got = await at(from, 7000);
    check(`${from} → ${to}`, got === to, got);
  }
  const post0 = (await api("GET", "/api/posts?limit=1&depth=0&where[_status][equals]=published")).b.docs[0];
  if (post0) {
    const got = await at(`/admin/collections/posts/${post0.id}`, 9000);
    check("Blog yazısı editörü içerik ekranında kalıyor", got === `/admin/collections/posts/${post0.id}`, got);
  }

  /* Sayfalar */
  await at("/panel/icerik", 8000);
  let t = await text();
  check("Sayfalar: Ana sayfa ve Hakkımızda kartları", t.includes("Ana Sayfa") && t.includes("Hakkımızda") && t.includes("Site Ayarları"));
  const nav = await p.evalJs(`JSON.stringify([...document.querySelectorAll('nav[aria-label="Ana menü"] a')].map(a=>[a.innerText.trim(), a.getAttribute("href")]))`);
  check("Menüde Site içeriği yeni panelde", nav.includes('["Site içeriği","/panel/icerik"]'), "");
  await p.screenshot(`${OUT}/icerik-sayfalar.png`);

  /* Blog: yayından kaldır, geri al; bekleyen taslak korunur */
  if (post0) {
    await at("/panel/icerik?tur=blog", 8000);
    const rows = await p.evalJs(`document.querySelectorAll("main ul > li").length`);
    const total = (await api("GET", "/api/posts?limit=0&depth=0")).b.totalDocs;
    check("Blog listesi tüm yazıları gösteriyor", rows === total, `${rows}/${total}`);
    await p.screenshot(`${OUT}/icerik-blog.png`);
    const rowBtn = (label) => p.evalJs(`(()=>{const li=[...document.querySelectorAll("main ul > li")].find(l=>l.innerText.includes(${j(post0.title)})); const b=li&&[...li.querySelectorAll("button")].find(x=>x.innerText.trim()===${j(label)}); if(!b) return false; b.click(); return true})()`);
    check("Yayından kaldır düğmesi", await rowBtn("Yayından kaldır"));
    await sleep(4000);
    check("Yazı taslağa döndü", (await api("GET", `/api/posts/${post0.id}?depth=0`)).b?._status === "draft");
    await rowBtn("Yayınla");
    await sleep(4000);
    const back = (await api("GET", `/api/posts/${post0.id}?depth=0`)).b;
    check("Yazı yeniden yayında, metni aynı", back?._status === "published" && back?.title === post0.title && back?.slug === post0.slug);
    /* İçerik ekranında kaydedilmiş taslak */
    await api("PATCH", `/api/posts/${post0.id}?draft=true`, { title: post0.title + " QA" });
    await at("/panel/icerik?tur=blog", 8000);
    check("Bekleyen değişiklik rozeti", (await text()).includes("yayınlanmamış değişiklik var"));
    await rowBtn("Değişiklikleri yayınla");
    await sleep(4000);
    check("Değişiklik yayınlandı", (await api("GET", `/api/posts/${post0.id}?depth=0`)).b?.title === post0.title + " QA");
    await api("PATCH", `/api/posts/${post0.id}`, { title: post0.title, _status: "published" });
    check("Başlık geri alındı", (await api("GET", `/api/posts/${post0.id}?depth=0`)).b?.title === post0.title);
  }

  /* Ekip: ekle (görsel seçerek), hatalı LinkedIn, düzenle, sil */
  await at("/panel/icerik?tur=ekip&kayit=yeni", 8000);
  await fill("Ad Soyad", "QA Deneme Kişi");
  await fill("Unvan", "Test Uzmanı");
  await fill("LinkedIn adresi", "linkedin.com/qa");
  await click("[role=dialog] button", "Görsel seç");
  await sleep(2500);
  const picked = await p.evalJs(`(()=>{const b=document.querySelector('[role=dialog] ul li button[title]'); if(!b) return null; const t=b.title; b.click(); return t})()`);
  await sleep(600);
  check("Görsel seçiciden görsel seçildi", Boolean(picked) && (await p.evalJs(`!!document.querySelector('[role=dialog] img[alt]')`)), picked ?? "");
  await click("[role=dialog] button", "Ekle");
  await sleep(3000);
  check("Hatalı LinkedIn kaydedilmiyor", !(await kayit())?.match(/^\d+$/) && (await api("GET", "/api/team?where[name][equals]=QA%20Deneme%20Ki%C5%9Fi&depth=0")).b.totalDocs === 0);
  await fill("LinkedIn adresi", "https://www.linkedin.com/in/qa-deneme");
  await click("[role=dialog] button", "Ekle");
  await sleep(4000);
  const tid = Number(await kayit());
  const tdoc = tid ? (await api("GET", `/api/team/${tid}?depth=0`)).b : null;
  check("Ekip üyesi eklendi, fotoğraflı", Boolean(tdoc?.photo) && tdoc?.role === "Test Uzmanı", String(tid));
  await p.screenshot(`${OUT}/icerik-ekip.png`);
  if (tid) {
    await fill("Unvan", "Kıdemli Test Uzmanı");
    await click("[role=dialog] button", "Kaydet");
    await sleep(3500);
    check("Düzenleme kaydedildi", (await api("GET", `/api/team/${tid}?depth=0`)).b?.role === "Kıdemli Test Uzmanı");
    await click("[role=dialog] button", "Sil");
    await sleep(400);
    await click("[role=dialog] button", "Evet, sil");
    await sleep(3500);
    check("Ekip üyesi silindi", (await api("GET", `/api/team/${tid}?depth=0`)).s === 404);
  }

  /* Vaka: sonuç satırıyla */
  await at("/panel/icerik?tur=vakalar&kayit=yeni", 8000);
  await fill("Sektör", "Test");
  await fill("Başlık", "QA vaka");
  await fill("Özet", "Deneme özeti");
  await click("[role=dialog] button", "Sonuç ekle", true);
  await sleep(300);
  await p.evalJs(`(()=>{const set=(sel,v)=>{const i=document.querySelector(sel);Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,"value").set.call(i,v);i.dispatchEvent(new Event("input",{bubbles:true}))}; set('[aria-label="Sonuç 1 etiketi"]',"Randevu artışı"); set('[aria-label="Sonuç 1 değer"]',"42"); set('[aria-label="Sonuç 1 ek"]',"%"); return true})()`);
  await click("[role=dialog] button", "Ekle");
  await sleep(4000);
  const vid = Number(await kayit());
  const vdoc = vid ? (await api("GET", `/api/case-studies/${vid}?depth=0`)).b : null;
  check("Vaka sonuçla eklendi", vdoc?.stats?.[0]?.value === 42 && vdoc?.stats?.[0]?.suffix === "%", String(vid));
  if (vid) await api("DELETE", `/api/case-studies/${vid}`);
  await api("POST", "/api/users/logout");
});

await run({ width: 390, height: 844, mobile: true }, async ({ p, api, at }) => {
  await login(api, env.SEED_ADMIN_EMAIL, env.SEED_ADMIN_PASSWORD);
  for (const u of ["/panel/icerik", "/panel/icerik?tur=blog", "/panel/icerik?tur=ekip"]) {
    await at(u, 7000);
    const ov = await p.evalJs(`document.documentElement.scrollWidth - innerWidth`);
    check(`Telefon: ${u} yatay kaymıyor`, ov <= 0, String(ov));
  }
  await p.screenshot(`${OUT}/icerik-telefon.png`);
  await api("POST", "/api/users/logout");
  await login(api, env.QA_B_EMAIL, env.QA_B_PASSWORD);
  check("Klinik (site modülü yok): site içeriği açılmaz", (await at("/panel/icerik", 6000)) === "/panel");
});

console.log(fails ? `\n${fails} kontrol başarısız` : "\nTüm kontroller geçti");
process.exit(fails ? 1 : 0);
