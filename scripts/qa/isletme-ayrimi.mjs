/**
 * İşletme ayrımı testi (çok kiracılı yapı). Yerel geliştirme sunucusunda çalışır:
 *   node scripts/qa/isletme-ayrimi.mjs
 * Gerekenler: çalışan `npm run dev`, Chrome, .env.local'da SEED_ADMIN_* ile
 * QA_B_EMAIL, QA_B_PASSWORD, QA_B2_PASSWORD (yerel deneme hesapları).
 * Deneme Klinik işletmesini ve yöneticisini yoksa açar; o yöneticinin Guru
 * Dijital'in hiçbir kaydını okuyamadığını, değiştiremediğini ve kendi
 * kayıtlarına bağlayamadığını denetler. Müşteri işletmesi açmadan önce ve
 * yetkiyle ilgili her değişiklikten sonra çalıştırılmalı.
 * Tekrar tekrar çalıştırılabilir (her çalıştırmada yeni deneme kayıtları açar).
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
  const login = (email, password) => api("POST", "/api/users/login", { email, password });
  const logout = () => api("POST", "/api/users/logout");
  await p.goto("/admin/login", 4000);

  // --- Kurulum (Guru yöneticisi)
  await login(env.SEED_ADMIN_EMAIL, env.SEED_ADMIN_PASSWORD);
  let B = (await api("GET", "/api/tenants?where[slug][equals]=deneme-klinik&depth=0")).b.docs[0];
  if (!B) B = (await api("POST", "/api/tenants", { name: "Deneme Klinik", slug: "deneme-klinik", modules: ["crm", "chat"], quotePrefix: "DK", profile: { legalName: "Deneme Klinik Ltd.", email: "info@klinik.test", address: "Deneme Cad. 5\nİzmir" } })).b.doc;
  check("B işletmesi", Boolean(B?.id), `id=${B?.id}`);
  let ub = (await api("GET", `/api/users?where[email][equals]=${env.QA_B_EMAIL}&depth=0`)).b.docs[0];
  if (!ub) ub = (await api("POST", "/api/users", { name: "Klinik Yönetici", email: env.QA_B_EMAIL, password: env.QA_B_PASSWORD, role: "editor", tenants: [{ tenant: B.id, role: "yonetici" }] })).b?.doc;
  check("B yöneticisi", Boolean(ub?.id), `modüller=${j(ub?.tenants?.[0]?.modules)}`);
  const guruCounts = {};
  for (const c of ["leads", "contacts", "deals", "quotes", "activities", "conversations"]) guruCounts[c] = (await api("GET", `/api/${c}?limit=1&where[tenant][equals]=1`)).b.totalDocs;
  await logout();

  // --- B yöneticisi
  check("B giriş", (await login(env.QA_B_EMAIL, env.QA_B_PASSWORD)).s === 200);
  for (const c of ["leads", "contacts", "deals", "quotes", "activities", "conversations", "companies"]) {
    const r = await api("GET", `/api/${c}?limit=50&depth=0`);
    const leak = (r.b?.docs ?? []).filter((d) => String(d.tenant) !== String(B.id)).length;
    check(`B /api/${c} Guru kaydı görmüyor`, r.s === 200 && leak === 0, `toplam=${r.b?.totalDocs} sızıntı=${leak} (Guru'da ${guruCounts[c] ?? "?"})`);
  }
  for (const [c, id] of [["contacts", 1], ["deals", 1], ["leads", 1], ["quotes", 1]]) {
    const r = await api("GET", `/api/${c}/${id}?depth=0`);
    check(`B Guru ${c}/${id} okuyamıyor`, r.s === 404 || r.s === 403, `durum=${r.s}`);
    const u = await api("PATCH", `/api/${c}/${id}`, { notes: "sızma denemesi" });
    check(`B Guru ${c}/${id} değiştiremiyor`, u.s === 404 || u.s === 403, `durum=${u.s}`);
  }
  const cB = await api("POST", "/api/contacts", { name: "Klinik Hasta", email: "deneme@guru.test" });
  check("B kişi açar, işletmesi B", cB.s === 201 && String(cB.b.doc.tenant?.id ?? cB.b.doc.tenant) === String(B.id), `durum=${cB.s}`);
  const cX = await api("POST", "/api/contacts", { name: "Sızma", email: "x@x.test", tenant: 1 });
  check("B Guru işletmesine kişi açamıyor", cX.s >= 400, `durum=${cX.s}`);
  const dX = await api("POST", "/api/deals", { title: "Sızma fırsatı", contact: 1 });
  check("B Guru kişisine fırsat bağlayamıyor", dX.s >= 400, `durum=${dX.s}`);
  const dB = await api("POST", "/api/deals", { title: "Klinik web sitesi", contact: cB.b.doc.id, value: 30000 });
  check("B fırsat açar", dB.s === 201, `durum=${dB.s}`);
  const qB = await api("POST", "/api/quotes", { title: "Klinik teklifi", deal: dB.b.doc.id, items: [{ description: "Tasarım", qty: 1, unitPrice: 30000, vatRate: "20" }] });
  check("B teklif numarası kendi ön ekiyle", qB.s === 201 && /^DK-\d{4}-\d{3}$/.test(qB.b?.doc?.number ?? ""), `no=${qB.b?.doc?.number}`);
  const lB = await api("POST", "/api/leads", { name: "Klinik Aday", email: "deneme@guru.test", message: "Panelden talep" });
  check("B panelden talep → CRM aynı işletmede", lB.s === 201, `durum=${lB.s}`);
  await sleep(500);
  const lBd = (await api("GET", `/api/leads/${lB.b.doc.id}?depth=1`)).b;
  check("  talebin kişisi B'de (Guru'daki aynı e-postayla birleşmedi)", lBd?.contact && String(lBd.contact.tenant?.id ?? lBd.contact.tenant) === String(B.id) && lBd.contact.id !== 1, `kişi=${lBd?.contact?.id}`);
  check("B görevlere erişemiyor (Operation kapalı)", (await api("GET", "/api/tasks")).s === 403);
  check("B işlem geçmişini göremiyor", (await api("GET", "/api/audit-log")).s === 403);
  const tl = (await api("GET", "/api/tenants?depth=0")).b;
  check("B yalnız kendi işletmesini görüyor", tl.docs.length === 1 && tl.docs[0].id === B.id, `n=${tl.docs.length}`);
  const ul = (await api("GET", "/api/users?depth=0&limit=50")).b;
  check("B yalnız kendi işletmesinin kullanıcılarını görüyor", ul.docs.every((u) => (u.tenants ?? []).some((r) => String(r.tenant) === String(B.id))), `n=${ul.docs.length}`);
  const nu = await api("POST", "/api/users", { name: "Klinik Üye", email: `uye${Date.now()}@klinik.test`, password: env.QA_B2_PASSWORD, role: "admin", tenants: [{ tenant: B.id, role: "uye", modules: ["crm", "ops", "site"] }, { tenant: 1, role: "yonetici" }] });
  const nd = nu.b?.doc;
  check("B yöneticisi üye ekler; Guru yöneticisi yapamaz, Guru'ya ekleyemez, kapalı modül veremez", nu.s === 201 && nd.role === "editor" && nd.tenants.length === 1 && j(nd.tenants[0].modules) === j(["crm"]), `durum=${nu.s} rol=${nd?.role} satırlar=${j(nd?.tenants?.map((r) => [r.tenant, r.role, r.modules]))}`);
  const pr = await p.evalJs(`fetch("/api/quotes/1/yazdir").then(r=>r.status)`);
  check("B Guru'nun teklif belgesini açamıyor", pr === 404 || pr === 403, `durum=${pr}`);
  const myq = await p.evalJs(`fetch("/api/quotes/${qB.b.doc.id}/yazdir").then(async r=>r.status+" "+((await r.text()).includes("Deneme Klinik Ltd.")))`);
  check("B kendi teklif belgesinde kendi unvanı", myq === "200 true", myq);
  await p.goto("/admin/satis-hatti", 8000);
  const cards = await p.evalJs(`[...document.querySelectorAll('.guru-pipe__title')].map(a=>a.textContent)`);
  const ownTitles = new Set(((await api("GET", "/api/deals?limit=500&depth=0")).b?.docs ?? []).filter((d) => String(d.tenant) === String(B.id)).map((d) => d.title));
  check("B satış hattında yalnız kendi fırsatları", cards.length >= 1 && cards.every((t) => ownTitles.has(t)), `${cards.length} kart`);
  await p.screenshot(`${OUT}/mt-b-hat.png`);
  await p.goto("/admin", 8000);
  const home = await p.evalJs(`document.querySelector('.guru-home')?.innerText.slice(0,400)`);
  check("B panosunda site içeriği yok", !/Siteyi tamamla|Hızlı düzenle|Son değişiklikler/.test(home ?? ""), "");
  await p.screenshot(`${OUT}/mt-b-pano.png`);
  await p.goto("/admin/operasyon", 8000);
  check("B Operation ekranına giremiyor", (await p.evalJs("location.pathname")) === "/admin");
  await p.goto("/admin/yonetici", 8000);
  check("B (Business kapalı) yönetici panosuna giremiyor", (await p.evalJs("location.pathname")) === "/admin");
  await logout();

  // --- Guru yöneticisi: işletme seçimi
  await login(env.SEED_ADMIN_EMAIL, env.SEED_ADMIN_PASSWORD);
  await p.evalJs(`document.cookie = "payload-tenant=${B.id}; path=/"`);
  await p.goto("/admin/satis-hatti", 8000);
  const aCards = await p.evalJs(`[...document.querySelectorAll('.guru-pipe__title')].map(a=>a.textContent)`);
  check("Guru yöneticisi B seçince B'nin fırsatlarını görüyor", aCards.some((t) => t.includes("Klinik")) && !aCards.some((t) => t.includes("Deneme Talebi")), j(aCards));
  await p.evalJs(`document.cookie = "payload-tenant=1; path=/"`);
  await p.goto("/admin/satis-hatti", 8000);
  const gCards = await p.evalJs(`[...document.querySelectorAll('.guru-pipe__title')].map(a=>a.textContent)`);
  check("Guru seçince Guru'nun fırsatları", !gCards.some((t) => t.includes("Klinik")), j(gCards));
  await p.goto("/admin", 8000);
  await p.screenshot(`${OUT}/mt-admin-pano.png`);
  await logout();

  // --- Site (oturumsuz): form ve sohbet Guru işletmesine
  const f = await api("POST", "/api/leads/gonder", { name: "Site Ziyaretçi", email: "site.ziyaretci@guru.test", message: "Çok kiracılı form denemesi", source: "/iletisim" });
  check("Site formu çalışıyor", f.s === 200 && f.b?.ok, `durum=${f.s} ${j(f.b)}`);
  const ch = await api("POST", "/api/conversations/mesaj", { text: "Merhaba", page: "/" });
  check("Sohbet balonu çalışıyor", ch.s === 200 && ch.b?.ok, `durum=${ch.s} ${j(ch.b)?.slice(0, 120)}`);
  console.log(fails ? `\n${fails} kontrol başarısız` : "\nTüm kontroller geçti");
});
