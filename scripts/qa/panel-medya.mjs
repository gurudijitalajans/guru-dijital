/**
 * Panel medya ekranı testi. Yerel geliştirme sunucusunda:
 *   node scripts/qa/panel-medya.mjs
 * Görsel yükler, açıklamasını değiştirir, klasör açar, görseli siler;
 * kullanılan görselin silinemediğini, eski adresin yönlendiğini, telefonda
 * taşma olmadığını ve site modülü olmayan kullanıcının giremediğini denetler.
 * Açtığı kayıtları sonunda siler.
 */
import { readFileSync } from "node:fs";
import { parseEnv } from "node:util";
import { withPage, OUT, sleep } from "./cdp.mjs";
const env = parseEnv(readFileSync(new URL("../../.env.local", import.meta.url), "utf8"));
const j = (o) => JSON.stringify(o);
let fails = 0;
const check = (name, ok, extra = "") => { if (!ok) fails++; console.log(`${ok ? "✓" : "✗"} ${name}${extra ? "  " + extra : ""}`); };

const run = async (size, fn) => withPage(size, async (p) => {
  const api = (method, url, body) => p.evalJs(`fetch(${j(url)},{method:${j(method)},headers:{"Content-Type":"application/json"},body:${body ? j(j(body)) : "undefined"}}).then(async r=>({s:r.status,b:await r.json().catch(()=>null)}))`);
  const at = async (u, wait = 7000) => { await p.goto(u, wait); return p.evalJs("location.pathname + location.search"); };
  const text = () => p.evalJs(`document.body.innerText`);
  const click = (sel, label) => p.evalJs(`(()=>{const b=[...document.querySelectorAll(${j(sel)})].find(e=>e.innerText.trim()===${j(label)}); if(!b) return false; b.click(); return true})()`);
  await p.goto("/admin/login", 4000);
  await fn({ p, api, at, text, click });
});

const login = async ({ api, p }, email, password) => {
  const me = await api("POST", "/api/users/login", { email, password });
  const t = me.b?.user?.tenants?.[0]?.tenant;
  return { me, t: typeof t === "object" ? t?.id : t };
};

await run({ width: 1440, height: 900 }, async (h) => {
  const { p, api, at, text, click } = h;
  await login(h, env.SEED_ADMIN_EMAIL, env.SEED_ADMIN_PASSWORD);
  const guru = (await api("GET", "/api/tenants?where[slug][equals]=guru&depth=0")).b.docs[0];
  await p.evalJs(`document.cookie="payload-tenant=${guru.id}; path=/"`);

  check("/admin/collections/media → /panel/medya", (await at("/admin/collections/media", 9000)) === "/panel/medya");
  const grid = await p.evalJs(`document.querySelectorAll("main ul li button img").length`);
  check("Görsel ızgarası dolu", grid > 0, String(grid));
  const nav = await p.evalJs(`JSON.stringify([...document.querySelectorAll('nav[aria-label="Ana menü"] a')].map(a=>[a.innerText.trim(), a.getAttribute("href")]))`);
  check("Menüde Medya yeni panelde, 'mevcut ekran' yazısı yok", nav.includes('["Medya","/panel/medya"]') && !nav.includes("mevcut ekran"), nav);
  await p.screenshot(`${OUT}/medya.png`);

  /* Yükleme: sayfada küçük bir PNG üretip dosya alanına verilir */
  await p.evalJs(`(async()=>{const c=document.createElement("canvas");c.width=64;c.height=48;const x=c.getContext("2d");x.fillStyle="#2a78d6";x.fillRect(0,0,64,48);const b=await new Promise(r=>c.toBlob(r,"image/png"));const f=new File([b],"qa-deneme_gorsel.png",{type:"image/png"});const dt=new DataTransfer();dt.items.add(f);const i=document.querySelector('input[type=file]');i.files=dt.files;i.dispatchEvent(new Event("change",{bubbles:true}));return true})()`);
  let id = null;
  for (let i = 0; i < 20 && !id; i++) { await sleep(1000); id = Number(new URLSearchParams(await p.evalJs("location.search")).get("gorsel")) || null; }
  check("Görsel yüklendi ve ayrıntısı açıldı", Boolean(id), String(id));
  if (!id) return;
  await sleep(2500);
  const doc = (await api("GET", `/api/media/${id}?depth=0`)).b;
  check("İlk açıklama dosya adından", doc?.alt === "Qa deneme gorsel", doc?.alt);
  check("Ayrıntıda 'Sitede kullanılmıyor'", (await text()).includes("Sitede kullanılmıyor"));

  /* Açıklamayı değiştir */
  await p.evalJs(`(()=>{const i=[...document.querySelectorAll('[role=dialog] input')][0];const set=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,"value").set;set.call(i,"QA deneme görseli");i.dispatchEvent(new Event("input",{bubbles:true}));return true})()`);
  await click("[role=dialog] button", "Kaydet");
  await sleep(2500);
  check("Açıklama kaydedildi", (await api("GET", `/api/media/${id}?depth=0`)).b?.alt === "QA deneme görseli");
  await p.screenshot(`${OUT}/medya-ayrinti.png`);

  /* Sil (iki adımlı) */
  await click("[role=dialog] button", "Görseli sil");
  await sleep(400);
  await click("[role=dialog] button", "Evet, sil");
  await sleep(3000);
  check("Görsel silindi", (await api("GET", `/api/media/${id}?depth=0`)).s === 404);

  /* Klasör aç */
  await at("/panel/medya", 6000);
  await click("main button", "Yeni klasör");
  await sleep(300);
  await p.evalJs(`(()=>{const i=document.querySelector('input[aria-label="Klasör adı"]');const set=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,"value").set;set.call(i,"QA Klasörü");i.dispatchEvent(new Event("input",{bubbles:true}));return true})()`);
  await click("main button", "Aç");
  await sleep(3500);
  const fid = Number(new URLSearchParams(await p.evalJs("location.search")).get("klasor"));
  check("Klasör açıldı ve seçildi", Boolean(fid) && (await text()).includes("QA Klasörü"), String(fid));
  if (fid) await api("DELETE", `/api/payload-folders/${fid}`);

  /* Kullanılan görsel silinemez */
  let used = null;
  for (const [c, f] of [["posts", "cover"], ["services", "cardImage"], ["products", "cover"], ["references", "logo"], ["team", "photo"]]) {
    used = (await api("GET", `/api/${c}?where[${f}][exists]=true&limit=1&depth=0`)).b?.docs?.[0]?.[f];
    if (used) break;
  }
  if (used) {
    await at(`/panel/medya?gorsel=${used}`, 7000);
    const t = await text();
    check("Kullanılan görselde yerler listeleniyor, silme yok", !t.includes("Sitede kullanılmıyor") && t.includes("Kullanılan görsel silinemez") && !t.includes("Görseli sil"));
  } else console.log("  (kullanılan görsel bulunamadı, bu kontrol atlandı)");

  /* Arama */
  await at("/panel/medya?q=zzzyokboyle", 6000);
  check("Arama: sonuç yoksa boş durum", (await text()).includes("Bu aramaya uyan görsel yok."));
  await api("POST", "/api/users/logout");
});

await run({ width: 390, height: 844, mobile: true }, async (h) => {
  const { p, api, at } = h;
  await login(h, env.SEED_ADMIN_EMAIL, env.SEED_ADMIN_PASSWORD);
  await at("/panel/medya", 8000);
  const ov = await p.evalJs(`document.documentElement.scrollWidth - innerWidth`);
  check("Telefon: /panel/medya yatay kaymıyor", ov <= 0, String(ov));
  await p.screenshot(`${OUT}/medya-telefon.png`);
  await api("POST", "/api/users/logout");
  await login(h, env.QA_B_EMAIL, env.QA_B_PASSWORD);
  check("Klinik (site modülü yok): medya açılmaz", (await at("/panel/medya", 6000)) === "/panel");
});

console.log(fails ? `\n${fails} kontrol başarısız` : "\nTüm kontroller geçti");
process.exit(fails ? 1 : 0);
