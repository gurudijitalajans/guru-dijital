/**
 * Panel düzenleyicisi 2. aşama testi: hizmet, ürün, blog (metin editörü),
 * kategori. Yerel geliştirme sunucusunda:  node scripts/qa/panel-duzenle2.mjs
 * Taslağın yayındakini değiştirmediğini, blog metninin Payload biçiminde
 * bozulmadan kaydedildiğini ve sitede çizildiğini denetler. Açtığı kayıtları
 * siler, değiştirdiklerini geri alır.
 */
import { readFileSync } from "node:fs";
import { parseEnv } from "node:util";
import { withPage, OUT, sleep } from "./cdp.mjs";
const env = parseEnv(readFileSync(new URL("../../.env.local", import.meta.url), "utf8"));
const j = (o) => JSON.stringify(o);
let fails = 0;
const check = (name, ok, extra = "") => { if (!ok) fails++; console.log(`${ok ? "✓" : "✗"} ${name}${extra ? "  " + extra : ""}`); };
/* Lexical kaydını karşılaştırmak için: yalnız anlamlı alanlar */
const norm = (n) => ({ type: n.type, text: n.text, format: n.format || 0, tag: n.tag, listType: n.listType, fields: n.fields, value: n.value, children: (n.children ?? []).map(norm) });

await withPage({ width: 1600, height: 1000 }, async (p) => {
  const api = (method, url, body) => p.evalJs(`fetch(${j(url)},{method:${j(method)},headers:{"Content-Type":"application/json"},body:${body ? j(j(body)) : "undefined"}}).then(async r=>({s:r.status,b:await r.json().catch(()=>null)}))`);
  const at = async (u, wait = 9000) => { await p.goto(u, wait); return p.evalJs("location.pathname + location.search"); };
  const text = () => p.evalJs(`document.querySelector("main")?.innerText ?? ""`);
  const click = (sel, label) => p.evalJs(`(()=>{const b=[...document.querySelectorAll(${j(sel)})].find(e=>e.innerText.trim()===${j(label)}); if(!b) return false; b.click(); return true})()`);
  const fill = (id, v) => p.evalJs(`(()=>{const i=document.getElementById(${j(id)}); if(!i) return false; const proto=i.tagName==="TEXTAREA"?HTMLTextAreaElement.prototype:HTMLInputElement.prototype; Object.getOwnPropertyDescriptor(proto,"value").set.call(i,${j(v)}); i.dispatchEvent(new Event("input",{bubbles:true})); return true})()`);
  const unsupported = () => p.evalJs(`[...document.querySelectorAll("main p")].filter(e=>e.innerText.includes("şimdilik panelde düzenlenemiyor")).length`);

  await p.goto("/admin/login", 4000);
  await api("POST", "/api/users/login", { email: env.SEED_ADMIN_EMAIL, password: env.SEED_ADMIN_PASSWORD });
  const guru = (await api("GET", "/api/tenants?where[slug][equals]=guru&depth=0")).b.docs[0];
  await p.evalJs(`document.cookie="payload-tenant=${guru.id}; path=/"`);

  /* Önceki yarım kalmış denemenin kayıtları */
  for (const d of (await api("GET", "/api/posts?where[title][like]=QA%20panel&depth=0&draft=true&limit=20")).b?.docs ?? []) await api("DELETE", `/api/posts/${d.id}`);

  /* Hizmet: taslak yayındakini değiştirmez */
  const svc = (await api("GET", "/api/services?limit=1&depth=0&where[_status][equals]=published&sort=order")).b.docs[0];
  check("Eski hizmet formu adresi panele", (await at(`/admin/collections/services/${svc.id}`, 11000)) === `/panel/duzenle/services/${svc.id}`);
  const tabs = await p.evalJs(`JSON.stringify([...document.querySelectorAll('[role=tab]')].map(t=>t.innerText.trim()))`);
  check("Hizmet sekmeleri ve Ayarlar kutusu (adres, sıra)", JSON.parse(tabs).length >= 4 && (await text()).toLocaleLowerCase("tr-TR").includes("ayarlar") && (await p.evalJs(`!!document.getElementById("f-slug")`)), tabs);
  check("Hizmet: desteklenmeyen alan yok", (await unsupported()) === 0, String(await unsupported()));
  await fill("f-short", svc.short + " QA");
  await click("button", "Taslak kaydet");
  await sleep(4000);
  const pub = (await api("GET", `/api/services/${svc.id}?depth=0`)).b;
  const dr = (await api("GET", `/api/services/${svc.id}?depth=0&draft=true`)).b;
  check("Taslak kaydedildi, yayındaki hâl değişmedi", pub.short === svc.short && dr.short === svc.short + " QA");
  await fill("f-short", svc.short);
  await click("button", "Değişiklikleri yayınla");
  await sleep(4500);
  const back = (await api("GET", `/api/services/${svc.id}?depth=0&draft=true`)).b;
  check("Geri alınıp yayınlandı", back.short === svc.short && back._status === "published");
  await p.screenshot(`${OUT}/duzenle-hizmet.png`);

  /* Ürün: karmaşık form açılıyor */
  const prod = (await api("GET", "/api/products?limit=1&depth=0&sort=order")).b.docs[0];
  await at(`/panel/duzenle/products/${prod.id}`, 11000);
  const ptabs = await p.evalJs(`document.querySelectorAll('[role=tab]').length`);
  check("Ürün formu sekmeleriyle açılıyor", ptabs >= 5, String(ptabs));
  check("Ürün: sayfa krokisi var", (await text()).includes("Sayfada nerede") || (await text()).includes("Giriş"));
  check("Ürün: desteklenmeyen alan yok", (await unsupported()) === 0, String(await unsupported()));
  await p.screenshot(`${OUT}/duzenle-urun.png`);

  /* Blog: var olan yazı bozulmadan geri kaydedilir */
  const post = (await api("GET", "/api/posts?limit=1&depth=0&where[_status][equals]=published")).b.docs[0];
  await at(`/panel/duzenle/posts/${post.id}`, 12000);
  await sleep(2500);
  const firstText = post.content.root.children.find((c) => c.children?.[0]?.text)?.children[0].text.slice(0, 40);
  check("Metin editörü yazının metniyle açılıyor", (await p.evalJs(`document.querySelector('[contenteditable=true]')?.innerText ?? ""`)).includes(firstText), firstText);
  await p.evalJs(`(()=>{const el=document.querySelector('[contenteditable=true]'); const ed=el.__lexicalEditor; ed.update(()=>{}, {discrete:true}); return true})()`);
  await fill("f-title", post.title + " ");
  await fill("f-title", post.title);
  await click("button", "Taslak kaydet");
  await sleep(4000);
  const pd = (await api("GET", `/api/posts/${post.id}?depth=0&draft=true`)).b;
  check("Kaydedilen metin Payload biçiminde birebir aynı", j(norm(pd.content.root)) === j(norm(post.content.root)));
  await api("PATCH", `/api/posts/${post.id}`, { title: post.title, _status: "published" });
  await p.screenshot(`${OUT}/duzenle-blog.png`);

  /* Blog: yeni yazı, bağlantı ve görselle; sitede çizilir */
  const media = (await api("GET", "/api/media?limit=1&depth=0")).b.docs[0];
  check("Yeni yazı formu", (await at("/panel/duzenle/posts", 11000)) === "/panel/duzenle/posts" && (await text()).includes("Yeni blog yazısı"));
  await fill("f-title", "QA panel yazısı");
  await fill("f-excerpt", "Panel editörüyle yazılmış deneme yazısı.");
  await click("button", "Yayınla");
  await sleep(3500);
  check("Boş metinle yayınlanmaz: zorunlu alan hatası", (await p.evalJs(`[...document.querySelectorAll('[role=alert]')].map(e=>e.innerText).join(" | ")`)).length > 0);
  const content = { root: { type: "root", format: "", indent: 0, version: 1, direction: "ltr", children: [
    { type: "heading", tag: "h2", format: "", indent: 0, version: 1, direction: "ltr", children: [{ type: "text", text: "QA başlığı", format: 0, style: "", mode: "normal", detail: 0, version: 1 }] },
    { type: "paragraph", format: "", indent: 0, version: 1, direction: "ltr", textFormat: 0, textStyle: "", children: [
      { type: "text", text: "Bağlantılı ", format: 1, style: "", mode: "normal", detail: 0, version: 1 },
      { type: "link", format: "", indent: 0, version: 3, direction: "ltr", fields: { linkType: "custom", url: "https://example.com/qa", newTab: true }, id: "qa0000000000000000000001", children: [{ type: "text", text: "örnek", format: 0, style: "", mode: "normal", detail: 0, version: 1 }] },
    ] },
    { type: "upload", version: 3, format: "", relationTo: "media", value: media.id, fields: null, id: "qa0000000000000000000002" },
  ] } };
  await p.evalJs(`(()=>{const ed=document.querySelector('[contenteditable=true]').__lexicalEditor; ed.setEditorState(ed.parseEditorState(${j(j(content))})); return true})()`);
  await sleep(800);
  check("Görsel düğümü editörde çiziliyor", await p.evalJs(`!!document.querySelector('[contenteditable=true] figure img, [contenteditable=true] figure svg')`));
  await click("button", "Yayınla");
  await sleep(5000);
  const nid = Number((await p.evalJs("location.pathname")).split("/").pop());
  const nd = nid ? (await api("GET", `/api/posts/${nid}?depth=0`)).b : null;
  const link = nd?.content?.root?.children?.[1]?.children?.[1];
  const up = nd?.content?.root?.children?.[2];
  check("Yeni yazı yayında, bağlantı ve görsel Payload biçiminde", nd?._status === "published" && link?.type === "link" && link?.fields?.url === "https://example.com/qa" && up?.type === "upload" && up?.value === media.id, String(nid));
  if (nd?.slug) {
    const html = await p.evalJs(`fetch("/blog/${nd.slug}").then(r=>r.text())`);
    check("Sitede çiziliyor: başlık, bağlantı, görsel", html.includes("QA başlığı") && html.includes('href="https://example.com/qa"') && /<img[^>]+(blob|media)/.test(html));
  }
  if (nid) {
    await at(`/panel/duzenle/posts/${nid}`, 10000);
    await click("button", "Sil");
    await sleep(400);
    await click("button", "Evet, sil");
    await sleep(4000);
    check("Yazı editörden silindi, listeye dönüldü", (await api("GET", `/api/posts/${nid}?depth=0`)).s === 404 && (await p.evalJs("location.pathname")) === "/panel/icerik");
  }

  /* Editörde klavyeyle yazma ve araç çubuğu: kalın, bağlantı, başlık */
  await at("/panel/duzenle/posts", 11000);
  await sleep(1500);
  await fill("f-title", "QA panel klavye");
  await fill("f-excerpt", "Klavye denemesi.");
  const tap = async (sel) => {
    const r = JSON.parse(await p.evalJs(`(()=>{const e=document.querySelector(${j(sel)}); e.scrollIntoView({block:"center"}); const b=e.getBoundingClientRect(); return JSON.stringify({x:b.x+20,y:b.y+20})})()`));
    for (const type of ["mousePressed", "mouseReleased"]) await p.s("Input.dispatchMouseEvent", { type, x: r.x, y: r.y, button: "left", clickCount: 1 });
  };
  await tap("[contenteditable=true]");
  await sleep(300);
  await p.s("Input.insertText", { text: "Kalın bağlantı" });
  const selectAll = async () => {
    await p.s("Input.dispatchKeyEvent", { type: "keyDown", key: "a", code: "KeyA", modifiers: 4, windowsVirtualKeyCode: 65 });
    await p.s("Input.dispatchKeyEvent", { type: "keyUp", key: "a", code: "KeyA", modifiers: 4, windowsVirtualKeyCode: 65 });
  };
  await selectAll();
  await sleep(200);
  await p.evalJs(`document.querySelector('button[aria-label="Kalın"]').click()`);
  await sleep(300);
  await p.evalJs(`document.querySelector('button[aria-label="Bağlantı"]').click()`);
  await sleep(300);
  await p.evalJs(`(()=>{const i=document.querySelector('input[aria-label="Bağlantı adresi"]'); Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,"value").set.call(i,"guru.com.tr/deneme"); i.dispatchEvent(new Event("input",{bubbles:true})); return true})()`);
  await click("button", "Uygula");
  await sleep(300);
  await tap("[contenteditable=true]");
  await selectAll();
  await p.evalJs(`(()=>{const s=document.querySelector('select[aria-label="Paragraf türü"]'); Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype,"value").set.call(s,"h2"); s.dispatchEvent(new Event("change",{bubbles:true})); return true})()`);
  await sleep(500);
  const st = JSON.parse(await p.evalJs(`JSON.stringify(document.querySelector('[contenteditable=true]').__lexicalEditor.getEditorState().toJSON())`));
  const h = st.root.children[0];
  const lk = h?.children?.find((c) => c.type === "link");
  check("Klavye + araç çubuğu: başlık, kalın, bağlantı", h?.type === "heading" && h.tag === "h2" && lk?.fields?.url === "https://guru.com.tr/deneme" && lk.children?.[0]?.format === 1, j(h).slice(0, 220));
  await click("button", "Taslak kaydet");
  await sleep(4000);
  const kid = Number((await p.evalJs("location.pathname")).split("/").pop());
  const kd = kid ? (await api("GET", `/api/posts/${kid}?depth=0&draft=true`)).b : null;
  check("Klavyeyle yazılan metin kaydedildi", kd?.content?.root?.children?.[0]?.children?.some((c) => c.type === "link" && c.fields?.url === "https://guru.com.tr/deneme"), String(kid));
  if (kid) await api("DELETE", `/api/posts/${kid}`);

  /* İçerik merkezinden düzenleyiciye; kategori */
  await at("/panel/icerik?tur=blog", 8000);
  check("Blog listesindeki Düzenle panelin düzenleyicisine gidiyor", await p.evalJs(`[...document.querySelectorAll("main a")].some(a=>a.getAttribute("href")?.startsWith("/panel/duzenle/posts/"))`));
  check("Kategoriler sekmesi", (await at("/admin/collections/categories", 8000)) === "/panel/icerik?tur=kategoriler" && (await text()).includes("Blog kategorileri"));
  await api("POST", "/api/users/logout");
  await api("POST", "/api/users/login", { email: env.QA_B_EMAIL, password: env.QA_B_PASSWORD });
  check("Klinik: hizmet düzenleyicisi açılmaz", (await at(`/panel/duzenle/services/${svc.id}`, 7000)) === "/panel");
});
console.log(fails ? `\n${fails} kontrol başarısız` : "\nTüm kontroller geçti");
process.exit(fails ? 1 : 0);
