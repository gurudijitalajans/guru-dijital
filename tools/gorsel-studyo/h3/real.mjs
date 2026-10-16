// Gerçek iş görselleri: katalog PSD katmanlarından ve yayındaki sitelerden çıkarılan HAM malzeme,
// ürün görselleriyle aynı tasarım diliyle (lacivert ışık zemini, cihazlar, yüzen kartlar) sıfırdan kurulur.
import { brandIcon, fileUrl, floatCard, grainLayer, icon, iphone, macbook, page, ROOT, serviceTile, THEME, themeBg } from "../lib.mjs";

const K = (f) => fileUrl(`${ROOT}/tools/gorsel-studyo/kaynak/katalog/${f}`);
const T = THEME.business;
const glow = (x, y, w, h, c = "rgb(68 161 241 / .45)") =>
  `<div style="position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px;border-radius:50%;background:radial-gradient(closest-side,${c},transparent);filter:blur(10px)"></div>`;
const floor = (x, y, w, h, op = 0.55) =>
  `<div style="position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px;border-radius:50%;background:radial-gradient(closest-side,rgb(0 6 26 / ${op}),transparent);filter:blur(6px)"></div>`;
/* Hizmet imzası: sitedeki hizmet karosu + hizmet adı (ürünlerde uygulama simgesi) */
const SERVICE_GLYPH = { "Web Tasarım": "monitor", "Dijital Reklam": "megaphone", SEO: "search", "Özel Yazılım": "code", "Mobil Uygulama": "smartphone", "Marka Tescil": "badge-check", "E-Ticaret": "cart", "Grafik Tasarım": "palette", "Sosyal Medya Yönetimi": "share" };
const lockup = (name, size = 30) =>
  `<div class="row" style="gap:${size * 0.46}px;color:#fff">${serviceTile(SERVICE_GLYPH[name], Math.round(size * 1.6), "box-shadow:inset 0 0 0 1px rgb(255 255 255/.2),0 0 0 1px rgb(255 255 255/.14),0 14px 28px -12px rgb(0 6 26/.7)")}<span style="font-size:${size}px;font-weight:500;letter-spacing:-.02em;line-height:1">${name}</span></div>`;
/* Ekran: ham ekran görüntüsü cihaz ekranını doldurur */
const shot = (f, w, h) => `<div style="width:${w}px;height:${h}px;background:#fff url('${K(f)}') 50% 0/100% auto no-repeat"></div>`;
const siteCard = (domain, what) =>
  `<div class="row" style="gap:14px"><span style="width:50px;height:50px;border-radius:15px;background:#e6f6ec;display:grid;place-items:center">${icon("globe", { size: 25, color: "#12873f", stroke: 2 })}</span>
   <div><div style="font-size:14px;font-weight:600;letter-spacing:.06em;color:#12873f">YAYINDA</div><div style="font-size:22px;font-weight:600;margin-top:2px">${domain}</div></div></div>
   <div style="margin-top:14px;font-size:16px;color:#3b4763">${what}</div>`;

/* Web Tasarım hero 1600x1000: eğik dizüstü + telefon + yayında kartı (ürün hero'su ile aynı kurgu) */
export function webHero({ name = "rimasis", domain = "rimasis.com", what = "Kurumsal web sitesi · masaüstü ve mobil" } = {}) {
  const body = `
  ${glow(120, 300, 1250, 700)}
  <div style="position:absolute;left:68px;top:60px">${lockup("Web Tasarım")}</div>
  ${floor(110, 900, 1100, 100)}
  <div style="position:absolute;left:70px;top:250px;perspective:3200px">
    ${macbook(shot(`ekran-${name}.png`, 1440, 900), { width: 1100, style: "transform:rotateY(13deg) rotateX(4deg) rotateZ(-.6deg);transform-origin:0% 50%" })}
  </div>
  ${floor(1100, 935, 330, 60, 0.6)}
  <div style="position:absolute;left:1130px;top:330px;perspective:2400px">
    ${iphone(shot(`ekran-${name}-m.png`, 390, 844), { width: 300, style: "transform:rotateY(-10deg) rotateZ(1.5deg);filter:drop-shadow(0 50px 50px rgb(0 6 26/.55))" })}
  </div>
  ${floatCard(siteCard(domain, what), "left:1010px;top:110px;width:460px")}
  ${grainLayer(0.06)}`;
  return page({ w: 1600, h: 1000, bg: themeBg(T), body });
}

export const realScenes = () => [];
export { glow, floor, lockup };

/* ---------- Hikâyemiz kolajı: Guru'yu anlatan üç karo ---------- */
const P = (f) => K(`gonderiler/${f}.jpg`);
const REF = (f) => fileUrl(`${ROOT}/public/references/${f}.png`);
const navyBg = themeBg(THEME.chatbot);

/* Dikey karo 1000x1600: marka */
const storyBrand = () => page({
  w: 1000, h: 1600, bg: navyBg,
  body: `${glow(40, 380, 920, 900, "rgb(110 175 255 / .35)")}
  <div style="position:absolute;left:0;right:0;top:560px;display:grid;justify-items:center;gap:46px">
    <img src="${fileUrl(`${ROOT}/public/brand/logo-white.svg`)}" style="width:560px">
    <div style="display:inline-flex;align-items:center;height:76px;padding:0 38px;border-radius:999px;background:rgb(255 255 255/.1);box-shadow:inset 0 0 0 1.5px rgb(255 255 255/.24);color:#fff;font:500 38px Outfit;letter-spacing:-.01em">Grow with Guru</div>
  </div>
  ${grainLayer(0.05)}`,
});

/* İş duvarı 1250x1000: farklı sektörlerden gerçek gönderiler, eğik ızgara */
const WALL = ["Medipunto_ISP", "WCT_POST_8", "VEGGY_POST_5", "Ekran_Resmi_2025-06-25_18.53.24", "avrupa_dis_ilkbahar", "wct_post_3", "Didem_Coban2", "zeytin_post", "Ekran_Resmi_2025-06-25_19.13.04", "WCT11", "Ekran_Resmi_2025-06-25_18.54.18", "Ekran_Resmi_2025-06-25_18.52.35"];
const storyWall = () => page({
  w: 1250, h: 1000, bg: navyBg,
  body: `<div style="position:absolute;left:50%;top:50%;width:1700px;transform:translate(-50%,-50%) rotate(-12deg);display:grid;grid-template-columns:repeat(4,1fr);gap:28px">
    ${WALL.map((f, i) => `<div style="aspect-ratio:4/5;border-radius:24px;overflow:hidden;box-shadow:0 30px 60px -28px rgb(0 6 26/.75);transform:translateY(${(i % 4) % 2 ? 90 : 0}px)"><div style="width:100%;height:100%;background:url('${P(f)}') 50% 0/cover no-repeat"></div></div>`).join("")}
  </div>
  <div style="position:absolute;inset:0;background:radial-gradient(70% 70% at 50% 50%,transparent 55%,rgb(1 20 65/.55))"></div>
  ${grainLayer(0.04)}`,
});

/* Logo duvarı 1250x1000: gerçek müşteri logoları, açık zemin */
const LOGOS = ["academic-hospital", "aska-hotels", "telkoturk", "medipunto-clinic", "navelli-home", "veggy-snacky", "konum-kapadokya", "lionklinker", "espina", "bulbulogullari", "elf-industrial-automation", "sofra-turke", "umaysa", "smella", "kontrol-market", "galata-estetik"];
const storyLogos = () => page({
  w: 1250, h: 1000, bg: "background:linear-gradient(160deg,#ffffff,#eaf3ff 60%,#d6e8ff);",
  body: `${glow(300, 200, 800, 700, "rgb(255 255 255 / .9)")}
  <div style="position:absolute;left:70px;right:70px;top:90px;bottom:90px;display:grid;grid-template-columns:repeat(4,1fr);gap:22px">
    ${LOGOS.map((f) => `<div style="border-radius:22px;background:#fff;box-shadow:0 0 0 1px rgb(1 20 65/.06),0 18px 36px -22px rgb(1 20 65/.35);display:grid;place-items:center;padding:26px"><img src="${REF(f)}" style="max-width:100%;max-height:96px;object-fit:contain"></div>`).join("")}
  </div>
  ${grainLayer(0.03)}`,
});

export const storyScenes = () => [
  { name: "hikaye-marka", w: 1000, h: 1600, html: storyBrand() },
  { name: "hikaye-isler", w: 1250, h: 1000, html: storyWall() },
  { name: "hikaye-logolar", w: 1250, h: 1000, html: storyLogos() },
];

/* ---------- Web Tasarım: 6 gerçek site, ürün görseli dilinde ---------- */
export const SITES = [
  { name: "askahotels", domain: "askahotels.com", what: "Otel web sitesi · rezervasyon odaklı" },
  { name: "secengross", domain: "secengross.com", what: "Perakende web sitesi · kampanya ve bültenler" },
  { name: "esdoinsaat", domain: "esdoinsaat.com", what: "İnşaat firması web sitesi · proje vitrini" },
  { name: "ekoda", domain: "ekoda.com.tr", what: "Depolama hizmeti web sitesi · online teklif" },
  { name: "usreokullari", domain: "usreokullari.com", what: "Özel okul web sitesi · ön kayıt" },
  { name: "rimasis", domain: "rimasis.com", what: "Kurumsal web sitesi · mühendislik" },
];

/* 4:3 karo 1200x900: eğik dizüstü + telefon + yayında kartı */
function webTile({ name, domain, what }) {
  const body = `
  ${glow(90, 260, 960, 560)}
  ${floor(80, 790, 820, 80)}
  <div style="position:absolute;left:50px;top:250px;perspective:2600px">
    ${macbook(shot(`ekran-${name}.png`, 1440, 900), { width: 820, style: "transform:rotateY(13deg) rotateX(4deg) rotateZ(-.6deg);transform-origin:0% 50%" })}
  </div>
  ${floor(840, 815, 260, 46, 0.6)}
  <div style="position:absolute;left:860px;top:300px;perspective:2000px">
    ${iphone(shot(`ekran-${name}-m.png`, 390, 844), { width: 240, style: "transform:rotateY(-10deg) rotateZ(1.5deg);filter:drop-shadow(0 40px 40px rgb(0 6 26/.55))" })}
  </div>
  ${floatCard(siteCard(domain, what), "left:56px;top:56px;width:500px", "18px 22px")}
  ${grainLayer(0.06)}`;
  return page({ w: 1200, h: 900, bg: themeBg(T), body });
}

/* Kapak 1200x1500: başlık + üç sitenin mobil hali */
function webCover() {
  const phones = [["esdoinsaat", 120, 760, -7], ["askahotels", 430, 700, 0], ["secengross", 740, 760, 7]];
  const body = `
  <div style="position:absolute;left:150px;top:560px;width:900px;height:1000px;border-radius:50%;background:radial-gradient(closest-side,${T.hi}88,transparent);filter:blur(20px)"></div>
  <div style="position:absolute;left:0;right:0;top:96px;display:grid;justify-items:center;text-align:center;color:#fff">
    ${lockup("Web Tasarım", 30)}
    <h1 style="margin-top:40px;font-size:96px;line-height:1.02;font-weight:600;letter-spacing:-.045em">Markanızın<br><span style="color:${T.glow}">dijital</span> yüzü</h1>
    <p style="margin-top:22px;font-size:28px;color:rgb(255 255 255/.8)">Yayındaki sitelerimizden</p>
  </div>
  ${phones.map(([n, x, y, r]) => `<div style="position:absolute;left:${x}px;top:${y}px;transform:rotate(${r}deg)">${iphone(shot(`ekran-${n}-m.png`, 390, 844), { width: 330, style: "filter:drop-shadow(0 50px 60px rgb(0 6 26/.6))" })}</div>`).join("")}
  ${grainLayer(0.06)}`;
  return page({ w: 1200, h: 1500, bg: themeBg(T), body });
}

export const webScenesReal = () => [
  { name: "real-web-tasarim-hero", w: 1600, h: 1000, html: webHero() },
  { name: "real-web-tasarim-kapak", w: 1200, h: 1500, html: webCover() },
  ...SITES.map((s, i) => ({ name: `real-web-tasarim-${i + 1}`, w: 1200, h: 900, html: webTile(s) })),
];

/* ---------- Hikâyemiz konseptleri (ajansı anlatır, iş göstermez) ---------- */
const glassIcon = (ic, s = 220) => `<div style="width:${s}px;height:${s}px;border-radius:${s * 0.28}px;background:linear-gradient(150deg,rgb(255 255 255/.28),rgb(255 255 255/.06));box-shadow:inset 0 0 0 1.5px rgb(255 255 255/.32),inset 0 ${s * 0.04}px ${s * 0.1}px rgb(255 255 255/.25),0 ${s * 0.25}px ${s * 0.5}px -${s * 0.18}px rgb(0 6 26/.75);backdrop-filter:blur(8px);display:grid;place-items:center">${icon(ic, { size: s * 0.46, color: "#fff", stroke: 1.6 })}</div>`;
const pill = (t, fs = 30) => `<span style="display:inline-flex;align-items:center;height:${fs * 2}px;padding:0 ${fs * 1.1}px;border-radius:999px;background:rgb(255 255 255/.1);box-shadow:inset 0 0 0 1.5px rgb(255 255 255/.24);color:#fff;font:500 ${fs}px Outfit">${t}</span>`;
const ring = (x, y, d, op = 0.18) => `<div style="position:absolute;left:${x}px;top:${y}px;width:${d}px;height:${d}px;border-radius:50%;box-shadow:inset 0 0 0 2px rgb(159 210 255/${op})"></div>`;

/* Konsept A: üç disiplin (strateji, tasarım, teknoloji) cam simgelerle */
const discTile = (w, h, ic, title, sub) => page({
  w, h, bg: navyBg,
  body: `${glow(w * 0.1, h * 0.15, w * 0.8, h * 0.8, "rgb(110 175 255 / .38)")}
  ${ring(w / 2 - h * 0.42, h * 0.08, h * 0.84)}${ring(w / 2 - h * 0.3, h * 0.2, h * 0.6, 0.12)}
  <div style="position:absolute;left:0;right:0;top:${h * 0.2}px;display:grid;justify-items:center;gap:${h * 0.07}px;text-align:center">
    ${glassIcon(ic, h * 0.3)}
    <div><div style="font:600 ${h * 0.085}px Outfit;letter-spacing:-.035em;color:#fff">${title}</div><div style="font:400 ${h * 0.036}px Outfit;color:rgb(255 255 255/.72);margin-top:${h * 0.015}px">${sub}</div></div>
  </div>${grainLayer(0.05)}`,
});
const conceptA = () => [
  { name: "hikayeA-1", w: 1000, h: 1600, html: page({ w: 1000, h: 1600, bg: navyBg, body: `${glow(40, 420, 920, 900, "rgb(110 175 255 / .38)")}${ring(150, 430, 700)}${ring(250, 530, 500, 0.12)}
    <div style="position:absolute;left:0;right:0;top:520px;display:grid;justify-items:center;gap:60px">${glassIcon("sparkles", 300)}<div style="text-align:center"><div style="font:600 92px/1 Outfit;letter-spacing:-.04em;color:#fff">Tek ekip</div><div style="font:400 36px Outfit;color:rgb(255 255 255/.75);margin-top:20px">Fikirden yayına</div></div>${pill("Grow with Guru", 34)}</div>${grainLayer(0.05)}` }) },
  { name: "hikayeA-2", w: 1250, h: 1000, html: discTile(1250, 1000, "compass", "Strateji", "Veriyle karar, ölçülen sonuç") },
  { name: "hikayeA-3", w: 1250, h: 1000, html: discTile(1250, 1000, "code-xml", "Teknoloji", "Kendi yazılımlarımızı geliştiriyoruz") },
];

/* Konsept B: tek geniş anahtar görsel (5:4): büyük g işareti ışık yelpazesinde, etrafında cam etiketler */
const conceptB = () => [
  { name: "hikayeB", w: 2000, h: 1600, html: page({ w: 2000, h: 1600, bg: navyBg, body: `
    ${glow(400, 300, 1200, 1100, "rgb(120 185 255 / .45)")}
    ${ring(560, 360, 880, 0.2)}${ring(700, 500, 600, 0.14)}${ring(420, 220, 1160, 0.1)}
    <img src="${fileUrl(`${ROOT}/public/brand/mark-white.svg`)}" style="position:absolute;left:50%;top:50%;height:520px;transform:translate(-50%,-56%);filter:drop-shadow(0 40px 80px rgb(60 140 255/.55))">
    <div style="position:absolute;left:50%;top:1170px;transform:translateX(-50%)">${pill("Grow with Guru", 40)}</div>
    ${[["compass", "Strateji", 250, 300], ["pen-tool", "Tasarım", 1460, 380], ["code-xml", "Teknoloji", 300, 1020], ["badge-check", "Google Partner", 1380, 1060]].map(([ic, t, x, y]) => `<div style="position:absolute;left:${x}px;top:${y}px;display:flex;align-items:center;gap:20px;height:112px;padding:0 36px 0 18px;border-radius:999px;background:rgb(255 255 255/.1);box-shadow:inset 0 0 0 1.5px rgb(255 255 255/.24),0 30px 60px -30px rgb(0 6 26/.7);backdrop-filter:blur(10px);color:#fff;font:500 40px Outfit"><span style="width:76px;height:76px;border-radius:50%;background:rgb(255 255 255/.16);display:grid;place-items:center">${icon(ic, { size: 38, color: "#fff", stroke: 1.8 })}</span>${t}</div>`).join("")}
    ${grainLayer(0.05)}` }) },
];
export const storyConcepts = () => [...conceptA(), ...conceptB()];

/* ---------- Hikâyemiz v3: cam sahneler (ekip, yaratıcılık, teknoloji) ---------- */
const DEEP = "#011441";
/* Derinlikli cam yüzey: gradyan dolgu, ince parlak kenar, üst ışık, yumuşak gölge */
const glass = (w, h, r, inner = "", style = "") => `<div style="position:absolute;width:${w}px;height:${h}px;border-radius:${r}px;background:linear-gradient(155deg,rgb(255 255 255/.26) 0%,rgb(255 255 255/.08) 45%,rgb(160 205 255/.12) 100%);box-shadow:inset 0 0 0 1.5px rgb(255 255 255/.30),inset 0 2px 0 rgb(255 255 255/.45),inset 0 -30px 60px -40px rgb(120 180 255/.5),0 40px 80px -36px rgb(0 6 26/.8);backdrop-filter:blur(16px) saturate(1.3);overflow:hidden;${style}"><div style="position:absolute;left:-30%;top:-60%;width:160%;height:90%;background:radial-gradient(closest-side,rgb(255 255 255/.22),transparent);transform:rotate(-12deg)"></div>${inner}</div>`;
const blob = (x, y, d, c) => `<div style="position:absolute;left:${x}px;top:${y}px;width:${d}px;height:${d}px;border-radius:50%;background:radial-gradient(circle at 35% 30%,${c},transparent 70%);filter:blur(4px)"></div>`;
const orb = (x, y, d, c1, c2) => `<div style="position:absolute;left:${x}px;top:${y}px;width:${d}px;height:${d}px;border-radius:50%;background:radial-gradient(circle at 32% 28%,rgb(255 255 255/.95),${c1} 38%,${c2} 100%);box-shadow:0 ${d * 0.25}px ${d * 0.5}px -${d * 0.2}px rgb(0 6 26/.7),inset 0 -${d * 0.08}px ${d * 0.2}px rgb(0 0 0/.25)"></div>`;
const label = (title, sub, x, y, align = "left", fs = 96) => `<div style="position:absolute;left:${x}px;top:${y}px;${align === "center" ? "transform:translateX(-50%);text-align:center" : ""}"><div style="font:600 ${fs}px/1 Outfit;letter-spacing:-.04em;color:#fff">${title}</div><div style="font:400 ${fs * 0.4}px/1.3 Outfit;color:rgb(255 255 255/.78);margin-top:${fs * 0.2}px;max-width:${fs * 5.2}px">${sub}</div></div>`;
const sceneBg = `background-color:${DEEP};background-image:radial-gradient(70% 55% at 50% 115%,rgb(61 139 242/.55) 0%,rgb(23 71 168/.25) 45%,transparent 75%),radial-gradient(50% 45% at 0% 0%,rgb(42 106 202/.35),transparent 70%),conic-gradient(from 180deg at 104% -4%,#1747a8 0deg,${DEEP} 14deg,${DEEP} 34deg,#1747a8 39deg,#3d8bf2 41deg,#d9efff 42.6deg,#9fd2ff 45deg,#3d8bf2 50deg,#1747a8 58deg,${DEEP} 72deg,${DEEP} 90deg);`;

/* 1) Tek ekip 1000x1600: ortada cam kart içinde g işareti, etrafında ekibin baş harfleri (gerçek ekip) */
const TEAM = [["AC", "Reklam · SEO", -320, -330, "#5aa0ff", "#1747a8"], ["F", "Web · Yazılım", 300, -270, "#7d8bff", "#3646c0"], ["O", "Mobil · E-ticaret", -300, 230, "#35c2e0", "#0b6f8f"], ["Y", "Tasarım · Sosyal", 290, 260, "#9b8cff", "#4b3fc0"]];
const storyTeam = () => {
  const cx = 500, cy = 640;
  return page({ w: 1000, h: 1600, bg: sceneBg, body: `
  ${blob(120, 300, 760, "rgb(90 160 255/.45)")}
  <svg style="position:absolute;left:0;top:0" width="1000" height="1600">${TEAM.map(([, , dx, dy]) => `<line x1="${cx}" y1="${cy}" x2="${cx + dx}" y2="${cy + dy}" stroke="rgb(159 210 255/.35)" stroke-width="2" stroke-dasharray="6 10"/>`).join("")}
    <circle cx="${cx}" cy="${cy}" r="440" fill="none" stroke="rgb(159 210 255/.14)" stroke-width="2"/><circle cx="${cx}" cy="${cy}" r="300" fill="none" stroke="rgb(159 210 255/.1)" stroke-width="2"/></svg>
  ${glass(300, 300, 84, `<img src="${fileUrl(`${ROOT}/public/brand/mark-white.svg`)}" style="position:absolute;left:50%;top:50%;height:150px;transform:translate(-50%,-50%);filter:drop-shadow(0 12px 30px rgb(80 160 255/.6))">`, `left:${cx - 150}px;top:${cy - 150}px`)}
  ${TEAM.map(([ini, role, dx, dy, c1, c2]) => `${orb(cx + dx - 70, cy + dy - 70, 140, c1, c2)}<div style="position:absolute;left:${cx + dx - 70}px;top:${cy + dy - 70}px;width:140px;height:140px;display:grid;place-items:center;font:600 46px Outfit;color:#fff;text-shadow:0 2px 10px rgb(0 0 0/.25)">${ini}</div><div style="position:absolute;left:${cx + dx}px;top:${cy + dy + 84}px;transform:translateX(-50%);white-space:nowrap;font:500 30px Outfit;color:rgb(255 255 255/.82)">${role}</div>`).join("")}
  ${label("Tek ekip", "Fikirden yayına", 500, 1150, "center", 104)}
  ${grainLayer(0.05)}` });
};

/* 2) Yaratıcılık 1250x1000: üst üste cam tasarım kartları (renk paleti, tipografi, kalem) */
const storyCreative = () => page({ w: 1250, h: 1000, bg: sceneBg, body: `
  ${blob(500, 60, 640, "rgb(140 120 255/.38)")}${blob(760, 260, 420, "rgb(60 190 255/.32)")}
  ${glass(420, 300, 40, `<div style="position:absolute;left:36px;top:36px;font:500 22px Outfit;color:rgb(255 255 255/.75)">Renk</div><div style="position:absolute;left:36px;bottom:40px;display:flex;gap:14px">${["#011441", "#1747a8", "#3d8bf2", "#9fd2ff", "#ffffff"].map((c) => `<span style="width:56px;height:56px;border-radius:50%;background:${c};box-shadow:inset 0 0 0 1.5px rgb(255 255 255/.35)"></span>`).join("")}</div>`, "left:640px;top:110px;transform:rotate(6deg)")}
  ${glass(380, 330, 40, `<div style="position:absolute;left:36px;top:36px;font:500 22px Outfit;color:rgb(255 255 255/.75)">Tipografi</div><div style="position:absolute;left:36px;bottom:30px;font:600 150px/1 Outfit;letter-spacing:-.05em;color:#fff">Aa</div>`, "left:820px;top:420px;transform:rotate(-5deg)")}
  ${glass(250, 250, 70, `<div style="position:absolute;inset:0;display:grid;place-items:center">${icon("pen-tool", { size: 112, color: "#fff", stroke: 1.5 })}</div>`, "left:560px;top:520px;transform:rotate(-8deg)")}
  ${label("Yaratıcılık", "Markanıza özgün bir dil", 80, 380)}
  ${grainLayer(0.05)}` });

/* 3) Teknoloji 1250x1000: cam kod penceresi + kendi ürünlerimizin uygulama simgeleri */
const PRODUCTS = [["bot", "Chatbot", "#3c95ee", "#0f3a8c"], ["users", "CRM", "#6d7cf6", "#2b3aa8"], ["workflow", "Operation", "#1aa9c4", "#0b4f7a"], ["briefcase", "Business", "#2c74d8", "#12419b"]];
const storyTech = () => page({ w: 1250, h: 1000, bg: sceneBg, body: `
  ${blob(560, 120, 620, "rgb(60 150 255/.42)")}
  ${glass(560, 380, 36, `<div style="position:absolute;left:28px;top:26px;display:flex;gap:10px">${["#ff5f57", "#febc2e", "#28c840"].map((c) => `<span style="width:16px;height:16px;border-radius:50%;background:${c}"></span>`).join("")}</div>
    <div style="position:absolute;left:40px;top:84px;font:500 24px/1.75 Menlo,monospace;color:rgb(255 255 255/.88);white-space:pre"><span style="color:#9fd2ff">const</span> ekip = <span style="color:#ffd27a">"Guru"</span>;
<span style="color:#9fd2ff">build</span>(<span style="color:#ffd27a">"CRM"</span>, <span style="color:#ffd27a">"Chatbot"</span>);
<span style="color:#9fd2ff">deploy</span>(markanız);  <span style="color:rgb(255 255 255/.45)">// büyüt</span></div>`, "left:620px;top:120px;transform:rotate(4deg)")}
  <div style="position:absolute;left:600px;top:560px;display:flex;gap:26px">${PRODUCTS.map(([ic, n, c1, c2], i) => `<div style="display:grid;justify-items:center;gap:14px;transform:translateY(${i % 2 ? 26 : 0}px)"><div style="width:130px;height:130px;border-radius:36px;background:linear-gradient(150deg,${c1},${c2});box-shadow:inset 0 2px 0 rgb(255 255 255/.35),0 30px 60px -26px rgb(0 6 26/.8);display:grid;place-items:center">${icon(ic, { size: 60, color: "#fff", stroke: 1.8 })}</div><span style="font:500 22px Outfit;color:rgb(255 255 255/.8)">${n}</span></div>`).join("")}</div>
  ${label("Teknoloji", "Kendi yazılımlarımız", 80, 380)}
  ${grainLayer(0.05)}` });

export const storyV3 = () => [
  { name: "hikayeC-ekip", w: 1000, h: 1600, html: storyTeam() },
  { name: "hikayeC-yaraticilik", w: 1250, h: 1000, html: storyCreative() },
  { name: "hikayeC-teknoloji", w: 1250, h: 1000, html: storyTech() },
];

/* ---------- Sosyal Medya: gerçek gönderiler, kendi çizdiğimiz arayüz çerçevelerinde ---------- */
const TS = THEME.crm;
/* Telefon ekranı 390x844: sade akış gönderisi (marka adı + görsel + simgeler; uydurma sayı yok) */
const feedScreen = (brand, initial, color, post, next) => `<div style="width:390px;height:844px;background:#fff;font-family:Outfit;color:#0c1a3a;position:relative">
  <div class="row" style="height:50px;padding:0 26px;justify-content:space-between;font:600 15px Outfit"><span>9:41</span><span class="row" style="gap:6px">${icon("signal", { size: 15, stroke: 2.4 })}${icon("wifi", { size: 15, stroke: 2.4 })}${icon("battery-full", { size: 19, stroke: 2 })}</span></div>
  <div class="row" style="gap:10px;padding:8px 14px 10px"><span style="width:36px;height:36px;border-radius:50%;padding:2px;background:linear-gradient(45deg,#f9a03f,#e1306c 55%,#833ab4)"><span style="display:grid;place-items:center;width:100%;height:100%;border-radius:50%;background:${color};color:#fff;font:600 14px Outfit;box-shadow:0 0 0 2px #fff">${initial}</span></span><b style="font-size:15px">${brand}</b><span style="margin-left:auto">${icon("ellipsis", { size: 20 })}</span></div>
  <div style="height:488px;background:url('${P(post)}') 50% 0/cover no-repeat"></div>
  <div class="row" style="gap:16px;padding:12px 14px">${icon("heart", { size: 25 })}${icon("message-circle", { size: 25 })}${icon("send", { size: 23 })}<span style="margin-left:auto">${icon("bookmark", { size: 23 })}</span></div>
  <div style="padding:0 14px"><div style="height:10px;width:62%;border-radius:6px;background:#e9edf4"></div><div style="height:10px;width:44%;border-radius:6px;background:#eef1f6;margin-top:8px"></div></div>
  ${next ? `<div class="row" style="gap:10px;padding:18px 14px 10px"><span style="width:36px;height:36px;border-radius:50%;background:${color};display:grid;place-items:center;color:#fff;font:600 14px Outfit">${initial}</span><b style="font-size:15px">${brand}</b></div><div style="height:300px;background:url('${P(next)}') 50% 0/cover no-repeat"></div>` : ""}
</div>`;
/* Tam ekran gönderi (hikâye/Reels çerçevesi) */
const storyScreen = (brand, initial, color, post) => `<div style="width:390px;height:844px;position:relative;overflow:hidden;background:#000;font-family:Outfit;color:#fff">
  <div style="position:absolute;inset:-40px;background:url('${P(post)}') 50% 50%/cover no-repeat;filter:blur(28px) brightness(.75)"></div>
  <div style="position:absolute;left:0;right:0;top:50%;height:488px;transform:translateY(-46%);background:url('${P(post)}') 50% 50%/contain no-repeat;box-shadow:0 20px 40px -20px rgb(0 0 0/.6)"></div>
  <div style="position:absolute;left:0;right:0;top:0;height:170px;background:linear-gradient(180deg,rgb(0 0 0/.5),transparent)"></div>
  <div class="row" style="position:absolute;left:12px;right:12px;top:56px;gap:4px">${[1, 0.4, 0.4].map((o) => `<span style="flex:1;height:3px;border-radius:2px;background:#fff;opacity:${o}"></span>`).join("")}</div>
  <div class="row" style="position:absolute;left:14px;top:70px;gap:10px"><span style="width:34px;height:34px;border-radius:50%;background:${color};display:grid;place-items:center;font:600 14px Outfit;box-shadow:0 0 0 2px #fff">${initial}</span><b style="font-size:15px">${brand}</b></div>
</div>`;
const reelsScreen = (brand, initial, color, post) => `<div style="width:390px;height:844px;position:relative;overflow:hidden;background:#000 url('${P(post)}') 50% 50%/100% auto no-repeat;font-family:Outfit;color:#fff">
  <div style="position:absolute;left:0;right:0;bottom:0;height:300px;background:linear-gradient(0deg,rgb(0 0 0/.6),transparent)"></div>
  <div style="position:absolute;left:16px;top:58px;font:600 20px Outfit">Reels</div>
  <div style="position:absolute;right:14px;bottom:130px;display:grid;gap:26px;justify-items:center">${["heart", "message-circle", "send"].map((ic) => icon(ic, { size: 30, color: "#fff", stroke: 2 })).join("")}</div>
  <div class="row" style="position:absolute;left:14px;bottom:74px;gap:10px"><span style="width:34px;height:34px;border-radius:50%;background:${color};display:grid;place-items:center;font:600 14px Outfit;box-shadow:0 0 0 2px #fff">${initial}</span><b style="font-size:15px">${brand}</b></div>
</div>`;
const socialCard = () => `<div class="row" style="gap:14px"><span style="width:50px;height:50px;border-radius:15px;background:linear-gradient(45deg,#f9a03f,#e1306c 55%,#833ab4);display:grid;place-items:center">${brandIcon.instagram(24)}</span>
   <div><div style="font-size:14px;font-weight:600;letter-spacing:.06em;color:#c13584">GERÇEK İŞLER</div><div style="font-size:22px;font-weight:600;margin-top:2px">Gönderi · Reels · Kampanya</div></div></div>
   <div style="margin-top:14px;font-size:16px;color:#3b4763">Markalarımız için hazırladığımız gönderiler</div>`;

export function socialHero() {
  const phones = [
    [feedScreen("Medipunto Clinic", "M", "#1aa0d8", "Medipunto_ISP", "medipunto_bilgi_post_sac"), 250, 250, -8, 300],
    [feedScreen("WCTLife", "W", "#6b2fb3", "WCT_POST_8", "wct_post_3"), 640, 170, 0, 330],
    [reelsScreen("Medipunto Clinic", "M", "#1aa0d8", "reels_kapak"), 1050, 250, 8, 300],
  ];
  const body = `
  ${glow(160, 300, 1280, 700)}
  <div style="position:absolute;left:68px;top:60px">${lockup("Sosyal Medya Yönetimi")}</div>
  ${phones.map(([s, x, y, r, w]) => `${floor(x - 10, y + w * 2.06 - 30, w + 20, 50, 0.5)}<div style="position:absolute;left:${x}px;top:${y}px;transform:rotate(${r}deg)">${iphone(s, { width: w, style: "filter:drop-shadow(0 50px 50px rgb(0 6 26/.55))" })}</div>`).join("")}
  ${floatCard(socialCard(), "left:1040px;top:60px;width:470px")}
  ${grainLayer(0.06)}`;
  return page({ w: 1600, h: 1000, bg: themeBg(TS), body });
}
export const socialSample = () => [{ name: "real-sosyal-hero", w: 1600, h: 1000, html: socialHero() }];

/* ---------- Sosyal Medya galerisi: marka başına bir karo; kartta gerçek logo, sektör ve içerik türü ---------- */
const LOGO = (f) => REF(f.replace(/\.png$/, ""));
const ES = "Ekran_Resmi_2025-06-25_";
/* Profil ekranı: kendi çizdiğimiz sade profil (uydurma takipçi/gönderi sayısı yok), 3 sütun gönderi ızgarası */
const profileScreen = (brand, initial, color, posts) => `<div style="width:390px;height:844px;background:#fff;font-family:Outfit;color:#0c1a3a;position:relative;overflow:hidden">
  <div class="row" style="height:50px;padding:0 26px;justify-content:space-between;font:600 15px Outfit"><span>9:41</span><span class="row" style="gap:6px">${icon("signal", { size: 15, stroke: 2.4 })}${icon("wifi", { size: 15, stroke: 2.4 })}${icon("battery-full", { size: 19, stroke: 2 })}</span></div>
  <div class="row" style="padding:4px 16px 0;justify-content:space-between"><b style="font-size:20px">${brand}</b><span class="row" style="gap:18px">${icon("square-plus", { size: 24 })}${icon("menu", { size: 24 })}</span></div>
  <div class="row" style="gap:16px;padding:16px 16px 0"><span style="width:84px;height:84px;border-radius:50%;padding:3px;background:linear-gradient(45deg,#f9a03f,#e1306c 55%,#833ab4);flex-shrink:0"><span style="display:grid;place-items:center;width:100%;height:100%;border-radius:50%;background:${color};color:#fff;font:600 30px Outfit;box-shadow:0 0 0 3px #fff">${initial}</span></span>
    <div style="flex:1"><div style="height:11px;width:70%;border-radius:6px;background:#e9edf4"></div><div style="height:11px;width:52%;border-radius:6px;background:#eef1f6;margin-top:9px"></div><div style="height:11px;width:60%;border-radius:6px;background:#eef1f6;margin-top:9px"></div></div></div>
  <div class="row" style="gap:8px;padding:16px 16px 0">${["Takip et", "Mesaj"].map((t, i) => `<span style="flex:1;height:34px;border-radius:9px;display:grid;place-items:center;font:600 14px Outfit;${i ? "background:#eef1f6" : "background:#0a66ff;color:#fff"}">${t}</span>`).join("")}</div>
  <div class="row" style="margin-top:16px;border-top:1px solid #eef1f6;justify-content:space-around;height:46px">${["grid-3x3", "clapperboard", "contact"].map((ic, i) => `<span style="height:100%;display:grid;place-items:center;flex:1;${i ? "color:#9aa3b5" : "box-shadow:inset 0 -2px 0 #0c1a3a"}">${icon(ic, { size: 22, stroke: 2 })}</span>`).join("")}</div>
  <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:2px">${posts.map((f) => `<div style="aspect-ratio:3/4;background:#eef1f6 url('${P(f)}') 50% 0/cover no-repeat"></div>`).join("")}</div>
</div>`;
/* Telefon yerleştirme: zemin gölgesi + eğim */
const phoneAt = (screen, x, y, w, r = 0) =>
  `${floor(x - 10, y + w * 2.0 - 34, w + 20, 54, 0.5)}<div style="position:absolute;left:${x}px;top:${y}px;transform:rotate(${r}deg)">${iphone(screen, { width: w, style: "filter:drop-shadow(0 46px 46px rgb(0 6 26/.55))" })}</div>`;
/* Düz gönderi kartı (telefon dışında, yüzen) */
const postAt = (f, x, y, w, r = 0, ratio = 1.25) =>
  `<div style="position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${Math.round(w * ratio)}px;border-radius:${w * 0.05}px;background:#fff url('${P(f)}') 50% 0/cover no-repeat;transform:rotate(${r}deg);box-shadow:0 0 0 1px rgb(255 255 255/.5),0 40px 70px -30px rgb(0 6 26/.75)"></div>`;
/* Marka kartı: gerçek logo + sektör + içerik türü (+ isteğe bağlı etiketler) */
const brandCard = (logo, sector, what, chips = [], lh = 40) => `<img src="${LOGO(logo)}" style="height:${lh}px;display:block;max-width:300px;object-fit:contain">
   <div style="margin-top:16px;font-size:13px;font-weight:600;letter-spacing:.08em;color:#c13584">${sector.toLocaleUpperCase("tr-TR")}</div>
   <div style="margin-top:4px;font-size:21px;font-weight:600;line-height:1.25">${what}</div>
   ${chips.length ? `<div class="row" style="gap:8px;margin-top:14px;flex-wrap:wrap">${chips.map((c) => `<span style="height:32px;padding:0 14px;border-radius:999px;background:#f1f3fb;font:500 14px Outfit;color:#2b3a5c;display:inline-flex;align-items:center">${c}</span>`).join("")}</div>` : ""}`;
const tile = (body) => page({ w: 1200, h: 900, bg: themeBg(TS), body: `${glow(80, 220, 1040, 640)}${body}${grainLayer(0.06)}` });

const WCT = ["wct_post_3", "wct_post_3_2", "wct_post_4", "wct_post_5_2", "wct_post_2", "WCT11", "WCT_POST_8", "WCT_Reklam_3", "w1", "Post2", "wct_post_3", "WCT11"];
const socialTiles = () => [
  /* 1) WCTLife: tutarlı gönderi serisi, profil ızgarasında */
  tile(`${phoneAt(profileScreen("WCTLife", "W", "#6b2fb3", WCT.slice(0, 12)), 110, 150, 310, -5)}
    ${phoneAt(feedScreen("WCTLife", "W", "#6b2fb3", "wct_post_4", "WCT11"), 470, 210, 280, 5)}
    ${floatCard(brandCard("wctlife.png", "Gayrimenkul", "Profilde bütünlük kuran gönderi serisi", ["Seri tasarım", "Proje tanıtımı"]), "left:800px;top:250px;width:340px")}`),
  /* 2) Medipunto Clinic: çok dilli kampanya ve Reels */
  tile(`${phoneAt(feedScreen("Medipunto Clinic", "M", "#1aa0d8", "mediounto_reklam", "Medipunto_ISP"), 120, 170, 300, -5)}
    ${phoneAt(feedScreen("Medipunto Clinic", "M", "#1aa0d8", "medipunto_bilgi_post_sac", "Medipunto_ISP"), 470, 130, 300, 4)}
    ${floatCard(brandCard("medipunto-clinic.png", "Sağlık turizmi", "Çok dilli kampanya ve bilgilendirici içerik", ["İngilizce", "İspanyolca", "Sık sorulanlar"]), "left:820px;top:280px;width:320px")}`),
  /* 3) DC: aynı kampanya üç dilde */
  tile(`${phoneAt(feedScreen("DC", "DC", "#35b8cf", "didem_coban_reklam_5"), 50, 230, 260, -7)}
    ${phoneAt(feedScreen("DC", "DC", "#35b8cf", "Didcem_Coban_Reklam8"), 315, 170, 270, 0)}
    ${phoneAt(feedScreen("DC", "DC", "#35b8cf", "Didem_Coban2"), 585, 230, 260, 7)}
    ${floatCard(brandCard("dc.png", "Diş kliniği", "Kampanya gönderileri, üç dilde", ["Türkçe", "İngilizce", "Almanca"], 64), "left:890px;top:300px;width:270px")}`),
  /* 4) Classy & Sheen: ürün tanıtım gönderileri */
  tile(`${phoneAt(feedScreen("Classy & Sheen", "CS", "#2f5d50", `${ES}18.53.24`, `${ES}19.13.04`), 130, 160, 300, -4)}
    ${postAt(`${ES}18.52.35`, 500, 230, 300, 5, 1.25)}
    ${floatCard(brandCard("classy-sheen.png", "Cilt bakımı", "Ürün tanıtım gönderileri", ["Ürün tanıtımı", "İçerik serisi"], 36), "left:850px;top:120px;width:310px")}`),
  /* 5) Veggy Snacky: ürün lansmanı */
  tile(`${phoneAt(feedScreen("Veggy Snacky", "V", "#d6232a", "VEGGY_POST_5", "VEGGY_SAYFA_2"), 150, 160, 300, -4)}
    ${postAt("VEGGY_SAYFA_2", 520, 230, 300, 5, 1.414)}
    ${floatCard(brandCard("veggy-snacky.png", "Atıştırmalık", "Ürün lansmanı gönderileri", ["Ürün tanıtımı", "Lansman"], 70), "left:870px;top:110px;width:290px")}`),
  /* 6) Sektörler: farklı markaların gönderileri, eğik ızgara */
  page({ w: 1200, h: 900, bg: themeBg(TS), body: `${glow(60, 120, 1080, 760)}
    <div style="position:absolute;left:50%;top:50%;width:1500px;transform:translate(-50%,-50%) perspective(2400px) rotateX(24deg) rotateZ(-14deg);display:grid;grid-template-columns:repeat(5,1fr);gap:22px">
      ${["avrupa_dis_ilkbahar", `${ES}18.54.18`, "WCT11", "Medipunto_ISP", "VEGGY_POST_5", "didem_coban_reklam_5", `${ES}19.13.04`, "WCT_Reklam_3", "zeytin_post", "medipunto_bilgi_post_sac", "Didem_Coban2", "wct_post_3", `${ES}18.53.24`, "Didcem_Coban_Reklam8", "WCT_POST_8"].map((f) => `<div style="aspect-ratio:4/5;border-radius:16px;background:#fff url('${P(f)}') 50% 0/cover no-repeat;box-shadow:0 30px 50px -24px rgb(0 6 26/.7)"></div>`).join("")}
    </div>
    <div style="position:absolute;inset:0;background:radial-gradient(60% 60% at 50% 50%,transparent 55%,rgb(10 17 69/.55) 100%)"></div>
    ${floatCard(`<div class="row" style="gap:14px"><span style="width:50px;height:50px;border-radius:15px;background:linear-gradient(45deg,#f9a03f,#e1306c 55%,#833ab4);display:grid;place-items:center">${brandIcon.instagram(24)}</span><div><div style="font-size:13px;font-weight:600;letter-spacing:.08em;color:#c13584">FARKLI SEKTÖRLER</div><div style="font-size:21px;font-weight:600;margin-top:2px">Sağlıktan gayrimenkule</div></div></div><div style="margin-top:12px;font-size:16px;color:#3b4763">Kozmetikten gıdaya, markalarımız için hazırladığımız gönderiler</div>`, "left:60px;top:60px;width:430px")}
    ${grainLayer(0.06)}` }),
];

/* Kapak 1200x1500: başlık + üç markanın akış gönderisi */
function socialCover() {
  const phones = [
    [feedScreen("DC", "DC", "#35b8cf", "didem_coban_reklam_5"), 110, 770, -7],
    [feedScreen("WCTLife", "W", "#6b2fb3", "wct_post_3"), 435, 700, 0],
    [feedScreen("Classy & Sheen", "CS", "#2f5d50", `${ES}18.53.24`), 760, 770, 7],
  ];
  const body = `
  <div style="position:absolute;left:150px;top:560px;width:900px;height:1000px;border-radius:50%;background:radial-gradient(closest-side,${TS.hi}88,transparent);filter:blur(20px)"></div>
  <div style="position:absolute;left:0;right:0;top:96px;display:grid;justify-items:center;text-align:center;color:#fff">
    ${lockup("Sosyal Medya Yönetimi", 30)}
    <h1 style="margin-top:40px;font-size:96px;line-height:1.02;font-weight:600;letter-spacing:-.045em">Markanız<br><span style="color:${TS.glow}">her gün</span> akışta</h1>
    <p style="margin-top:22px;font-size:28px;color:rgb(255 255 255/.8)">Markalarımız için hazırladığımız gönderilerden</p>
  </div>
  ${phones.map(([sc, x, y, r]) => `<div style="position:absolute;left:${x}px;top:${y}px;transform:rotate(${r}deg)">${iphone(sc, { width: 330, style: "filter:drop-shadow(0 50px 60px rgb(0 6 26/.6))" })}</div>`).join("")}
  ${grainLayer(0.06)}`;
  return page({ w: 1200, h: 1500, bg: themeBg(TS), body });
}

export const socialScenesReal = () => [
  { name: "real-sosyal-medya-yonetimi-hero", w: 1600, h: 1000, html: socialHero() },
  { name: "real-sosyal-medya-yonetimi-kapak", w: 1200, h: 1500, html: socialCover() },
  ...socialTiles().map((html, i) => ({ name: `real-sosyal-medya-yonetimi-${i + 1}`, w: 1200, h: 900, html })),
];
