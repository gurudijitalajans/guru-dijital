// Hizmet görselleri v3: teslim edilen işin kendisi (müşteri sitesi, reklam kreatifi,
// arama sonucu, uygulama, ambalaj, tescil belgesi...). Guru paneli yok; sahneler
// müşteri markalarıyla kurulur. Ortak bileşenler.
import { fileUrl, FONT_CSS, grainLayer, icon, iphone, macbook, ROOT, UI_CSS } from "../lib.mjs";

export { icon, iphone, macbook, grainLayer, fileUrl, ROOT };
export const work = (name) => fileUrl(`${ROOT}/public/work/${name}`);
export const asset = (p) => fileUrl(p);

/* Hizmet tonları (v2 ile aynı aile) */
export const T = {
  "dijital-reklam-yonetimi": { deep: "#011441", mid: "#1747a8", hi: "#3d8bf2", glow: "#9fd2ff", ice: "#d9efff" },
  "web-tasarim": { deep: "#021338", mid: "#10508f", hi: "#2f9be0", glow: "#9be0ff", ice: "#dcf5ff" },
  seo: { deep: "#01183f", mid: "#0e5c8a", hi: "#27a2d6", glow: "#a6e6ff", ice: "#dff6ff" },
  "ozel-yazilim": { deep: "#0b0f3f", mid: "#2a35a0", hi: "#5f6ff0", glow: "#aeb7ff", ice: "#e4e7ff" },
  "mobil-uygulama": { deep: "#0b1250", mid: "#3646c0", hi: "#7d8bff", glow: "#c3caff", ice: "#ebedff" },
  "marka-tescil": { deep: "#000c2e", mid: "#12419b", hi: "#2c74d8", glow: "#bcecff", ice: "#eef8ff" },
  "e-ticaret-yonetimi": { deep: "#011a3d", mid: "#0b4f7a", hi: "#1aa9c4", glow: "#8fe6f2", ice: "#d4f6fa" },
  "grafik-tasarim": { deep: "#0d0f45", mid: "#3530a8", hi: "#6d78f2", glow: "#c3c6ff", ice: "#e8e9ff" },
  "sosyal-medya-yonetimi": { deep: "#04163f", mid: "#1a4fb0", hi: "#4a9df5", glow: "#b5dcff", ice: "#e4f2ff" },
};
export const darkBg = (t) =>
  `background-color:${t.deep};background-image:radial-gradient(60% 45% at 50% 108%, ${t.hi}99 0%, ${t.mid}55 45%, transparent 75%),radial-gradient(48% 40% at 0% 100%, ${t.glow}55 0%, transparent 70%),conic-gradient(from 180deg at 104% -4%, ${t.mid} 0deg, ${t.deep} 14deg, ${t.deep} 34deg, ${t.mid} 39deg, ${t.hi} 41deg, ${t.ice} 42.6deg, ${t.glow} 45deg, ${t.hi} 50deg, ${t.mid} 58deg, ${t.deep} 72deg, ${t.deep} 90deg);`;
export const lightBg = (t) =>
  `background-color:${t.ice};background-image:radial-gradient(60% 55% at 12% 8%, rgb(255 255 255 / .95), rgb(255 255 255 / 0) 70%),radial-gradient(55% 60% at 100% 100%, ${t.hi}55, transparent 70%),linear-gradient(160deg,#ffffff 0%,${t.ice} 55%,${t.glow}66 100%);`;

/* Sistem yazı tipleri (macOS): müşteri markalarında çeşitlilik için */
/* Tek tırnak: style="" özniteliğinin içinde kullanılır */
export const SERIF = `'Didot','Bodoni 72','Baskerville',serif`;
export const SERIF2 = `'Baskerville','Hoefler Text',Georgia,serif`;
export const SANS2 = `'Avenir Next','Helvetica Neue',Arial,sans-serif`;
export const GEO = `'Futura','Avenir Next',sans-serif`;

export function page({ w, h, bg, body, css = "" }) {
  return `<!doctype html><html><head><meta charset="utf-8"><style>${FONT_CSS}${UI_CSS}
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:${w}px;height:${h}px;overflow:hidden}
body{position:relative;font-family:Outfit,sans-serif;-webkit-font-smoothing:antialiased;${bg}}
.abs{position:absolute}
.row{display:flex;align-items:center}
.sh{box-shadow:0 0 0 1px rgb(255 255 255/.5),0 40px 70px -30px rgb(1 12 40/.5),0 14px 30px -18px rgb(1 12 40/.3)}
.shd{filter:drop-shadow(0 40px 44px rgb(0 6 26/.5))}
${css}</style></head><body>${body}</body></html>`;
}

export const glow = (x, y, w, h, c = "rgb(68 161 241 / .45)") =>
  `<div class="abs" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px;border-radius:50%;background:radial-gradient(closest-side,${c},transparent);filter:blur(10px)"></div>`;
export const floor = (x, y, w, h, op = 0.55) =>
  `<div class="abs" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px;border-radius:50%;background:radial-gradient(closest-side,rgb(0 6 26 / ${op}),transparent);filter:blur(6px)"></div>`;

/* Tarayıcı penceresi: 1440 genişlikte sayfa, görünür yükseklik vh; scale ile küçültülür */
export function browser(content, { url = "", scale = 0.6, vh = 900, y = 0, style = "", radius = 16, dark = false, cw = 1440 } = {}) {
  const bar = 46;
  return `<div class="abs" style="width:${cw * scale}px;border-radius:${radius}px;overflow:hidden;background:#fff;box-shadow:0 0 0 1px rgb(12 26 58/.08),0 50px 100px -40px rgb(1 12 40/.6),0 18px 40px -24px rgb(1 12 40/.4);${style}">
    <div class="row" style="height:${bar * scale * 1.25}px;gap:${8 * scale * 1.3}px;padding:0 ${18 * scale * 1.3}px;background:${dark ? "#1b1f27" : "#f4f6fa"}">
      ${["#ff5f57", "#febc2e", "#28c840"].map((c) => `<span style="width:${12 * scale * 1.3}px;height:${12 * scale * 1.3}px;border-radius:50%;background:${c}"></span>`).join("")}
      <div class="row" style="margin:0 auto;gap:${7 * scale * 1.3}px;height:${28 * scale * 1.3}px;padding:0 ${16 * scale * 1.3}px;min-width:${360 * scale}px;justify-content:center;border-radius:${9 * scale * 1.3}px;background:${dark ? "#2a2f3a" : "#e8ecf3"};font:500 ${13 * scale * 1.3}px Outfit;color:${dark ? "#aeb5c4" : "#55617b"}">${icon("lock", { size: 11 * scale * 1.3, stroke: 2.4, color: dark ? "#8a93a6" : "#8a95ad" })}${url}</div>
      <span style="width:${52 * scale * 1.3}px"></span>
    </div>
    <div style="position:relative;width:${cw * scale}px;height:${vh * scale}px;overflow:hidden">
      <div style="position:absolute;left:0;top:${-y * scale}px;width:${cw}px;transform:scale(${scale});transform-origin:0 0">${content}</div>
    </div>
  </div>`;
}

/* Telefon (ekran 390 genişlik; içerik uzun olabilir, üstten kırpılır) */
export const phone = (screen, width, style = "", y = 0) =>
  `<div class="abs" style="${style}">${iphone(`<div style="position:relative;width:390px;height:844px;overflow:hidden"><div style="position:absolute;left:0;top:${-y}px;width:390px">${screen}</div></div>`, { width, style: "filter:drop-shadow(0 44px 44px rgb(0 6 26/.5))" })}</div>`;

/* Telefonun üst durum çubuğu */
export const statusBar = (dark = false) =>
  `<div class="row" style="height:50px;padding:0 30px 0 34px;justify-content:space-between;font:600 15px Outfit;color:${dark ? "#fff" : "#0c1a3a"}"><span>9:41</span><span class="row" style="gap:6px">${icon("signal", { size: 16, stroke: 2.4 })}${icon("wifi", { size: 16, stroke: 2.4 })}${icon("battery-full", { size: 20, stroke: 2 })}</span></div>`;

/* Görsel kutusu (dosyadan), cover kırpma */
export const pic = (src, style = "", pos = "center") =>
  `<div style="background:url('${src}') ${pos}/cover no-repeat;${style}"></div>`;

/* Başlıklı öne çıkan görsel 1200x900: üstte başlık ve tek satır alt metin, altında gövde (1072x638) */
export function feature({ t, dark = false, title, sub, body }) {
  return page({
    w: 1200,
    h: 900,
    bg: dark ? darkBg(t) : lightBg(t),
    body: `
    ${dark ? glow(150, 260, 1000, 640) : glow(200, 200, 900, 700, "rgb(255 255 255 / .9)")}
    ${dark ? `<div class="abs" style="left:0;right:0;top:0;height:330px;background:linear-gradient(180deg,${t.deep}f2 0%,${t.deep}cc 45%,${t.deep}00 100%)"></div>` : ""}
    <div class="abs" style="left:64px;top:56px;right:64px;color:${dark ? "#fff" : "#0c1a3a"}">
      <div style="font-size:44px;font-weight:600;letter-spacing:-.035em;line-height:1.08">${title}</div>
      <div style="font-size:20px;line-height:1.4;margin-top:12px;color:${dark ? "rgb(255 255 255/.78)" : "#3b4763"};white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${sub}</div>
    </div>
    <div class="abs" style="left:64px;top:206px;width:1072px;height:638px">${body}</div>
    ${grainLayer(dark ? 0.06 : 0.035)}`,
  });
}

/* Kapak 1200x1500: üstte büyük başlık, altta kompozisyon (1200x800 alan, top 700) */
export function cover({ t, eyebrow, headline, sub, art }) {
  const h = headline.replace(/\*([^*]+)\*/g, `<span style="color:${t.glow}">$1</span>`);
  return page({
    w: 1200,
    h: 1500,
    bg: darkBg(t),
    body: `
    <div class="abs" style="left:150px;top:560px;width:900px;height:1000px;border-radius:50%;background:radial-gradient(closest-side,${t.hi}88,transparent);filter:blur(20px)"></div>
    <div class="abs" style="left:0;right:0;top:0;height:760px;background:linear-gradient(180deg,${t.deep} 0%,${t.deep}e6 45%,${t.deep}00 100%)"></div>
    <div class="abs" style="left:0;right:0;top:100px;display:grid;justify-items:center;text-align:center;padding:0 80px">
      <div style="display:inline-flex;align-items:center;gap:10px;height:52px;padding:0 24px;border-radius:999px;background:rgb(255 255 255/.10);box-shadow:inset 0 0 0 1px rgb(255 255 255/.2);font-size:24px;font-weight:500;color:#fff">${eyebrow}</div>
      <h1 style="margin-top:34px;max-width:980px;font-size:96px;line-height:1.02;font-weight:600;letter-spacing:-.045em;color:#fff;text-wrap:balance">${h}</h1>
      <p style="margin-top:24px;font-size:30px;line-height:1.35;color:rgb(255 255 255/.8);max-width:900px;text-wrap:balance">${sub}</p>
    </div>
    <div class="abs" style="left:0;top:640px;width:1200px;height:860px">${art}</div>
    ${grainLayer(0.06)}`,
  });
}

/* Hero 1600x1000: önemli içerik ortadaki 1334 genişlikte (4:3 kart buradan kırpılır) */
export function hero({ t, dark = true, art }) {
  return page({
    w: 1600,
    h: 1000,
    bg: dark ? darkBg(t) : lightBg(t),
    body: `${dark ? glow(160, 300, 1280, 720) : glow(200, 200, 1200, 800, "rgb(255 255 255 / .9)")}${art}${grainLayer(dark ? 0.06 : 0.035)}`,
  });
}

/* Paylaşım 1200x630: solda başlık, sağda hero'dan bir kesit (hero png'si) */
export function og({ t, title, heroPng }) {
  const h = title.replace(/\*([^*]+)\*/g, `<span style="color:${t.glow}">$1</span>`);
  return page({
    w: 1200,
    h: 630,
    bg: darkBg(t),
    body: `
    <div class="abs" style="left:520px;top:40px;width:760px;height:550px;border-radius:26px;overflow:hidden;box-shadow:0 40px 80px -30px rgb(0 6 26/.7)">${pic(heroPng, "width:100%;height:100%", "center")}</div>
    <div class="abs" style="left:0;top:0;width:640px;height:630px;background:linear-gradient(90deg,${t.deep} 60%,${t.deep}00)"></div>
    <img class="abs" src="${fileUrl(`${ROOT}/public/brand/logo-white.svg`)}" style="left:64px;top:60px;height:40px">
    <h1 class="abs" style="left:64px;top:180px;width:480px;font-size:52px;line-height:1.08;font-weight:500;letter-spacing:-.035em;color:#fff">${h}</h1>
    <div class="abs row" style="left:64px;bottom:60px;gap:10px;height:48px;padding:0 22px;border-radius:999px;background:#fff;color:#011441;font-size:18px;font-weight:500">Teklif alın${icon("arrow-up-right", { size: 18, stroke: 2.2 })}</div>
    ${grainLayer(0.05)}`,
  });
}

/* Küçük yüzen bilgi kartı (beyaz) */
export const chip = (html, style = "", pad = "16px 20px") =>
  `<div class="abs sh" style="background:#fff;border-radius:20px;padding:${pad};color:#0c1a3a;${style}">${html}</div>`;
/* Koyu cam kart */
export const glass = (html, style = "", pad = "16px 20px") =>
  `<div class="abs" style="background:rgb(8 22 64/.62);backdrop-filter:blur(14px);border-radius:20px;padding:${pad};color:#fff;box-shadow:inset 0 0 0 1px rgb(255 255 255/.16),0 30px 60px -30px rgb(0 6 26/.7);${style}">${html}</div>`;

/* Tek satırlık sonuç rozeti */
export const metric = (ic, label, value, tone = "#12873f") =>
  `<div class="row" style="gap:12px"><span style="width:40px;height:40px;border-radius:12px;background:#eaf2ff;display:grid;place-items:center">${icon(ic, { size: 20, color: "#2a6aca", stroke: 2.1 })}</span><div><div style="font-size:13.5px;color:#7f8aa3">${label}</div><div style="font-size:24px;font-weight:600;letter-spacing:-.02em;color:${tone === "dark" ? "#0c1a3a" : "#0c1a3a"}">${value}</div></div></div>`;

/* Kaba metin satırları (yer tutucu çizgi yerine gerçek metin tercih edilir) */
export const lines = (n, { w = "100%", h = 10, gap = 9, c = "#e6ebf3", last = 0.6 } = {}) =>
  `<div style="display:grid;gap:${gap}px;width:${w}">${Array.from({ length: n }, (_, i) => `<span style="height:${h}px;border-radius:${h}px;background:${c};width:${i === n - 1 ? last * 100 : 100}%"></span>`).join("")}</div>`;
