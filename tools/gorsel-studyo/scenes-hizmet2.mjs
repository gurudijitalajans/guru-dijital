// Hizmet görselleri v2: ürün görselleri tarzında (cihaz + gerçekçi arayüz) kompozisyonlar.
// Ekranlar: screens-hizmet.mjs · Ad öneki: hizmet2-
//   node tools/gorsel-studyo/render.mjs hizmet2- && python3 tools/gorsel-studyo/export-hizmet2.py
import { appWindow, floatCard, grainLayer, icon, iphone, macbook, mark, page } from "./lib.mjs";
import { kpi } from "./screens-common.mjs";
import * as H from "./screens-hizmet.mjs";

/* Hizmet tonları: hepsi marka lacivertinden çıkar (lib.mjs THEME ile aynı yapı) */
export const THEME2 = {
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
const themeBg = (t) =>
  `background-color:${t.deep};background-image:radial-gradient(60% 45% at 50% 108%, ${t.hi}99 0%, ${t.mid}55 45%, transparent 75%),radial-gradient(48% 40% at 0% 100%, ${t.glow}55 0%, transparent 70%),conic-gradient(from 180deg at 104% -4%, ${t.mid} 0deg, ${t.deep} 14deg, ${t.deep} 34deg, ${t.mid} 39deg, ${t.hi} 41deg, ${t.ice} 42.6deg, ${t.glow} 45deg, ${t.hi} 50deg, ${t.mid} 58deg, ${t.deep} 72deg, ${t.deep} 90deg);`;
const iceBg = (t) =>
  `background-color:${t.ice};background-image:radial-gradient(60% 55% at 12% 8%, rgb(255 255 255 / .95), rgb(255 255 255 / 0) 70%),radial-gradient(55% 60% at 100% 100%, ${t.hi}55, transparent 70%),linear-gradient(160deg,#ffffff 0%,${t.ice} 55%,${t.glow}66 100%);`;
/* Yüzen kartlarda daha belirgin gölge */
const CSS = `.fl .card{border-radius:20px;box-shadow:0 0 0 1px rgb(255 255 255/.6),0 40px 70px -30px rgb(1 12 40/.5),0 14px 30px -18px rgb(1 12 40/.3)}`;

const glow = (x, y, w, h, c = "rgb(68 161 241 / .45)") =>
  `<div style="position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px;border-radius:50%;background:radial-gradient(closest-side,${c},transparent);filter:blur(10px)"></div>`;
const floorShadow = (x, y, w, h, op = 0.55) =>
  `<div style="position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px;border-radius:50%;background:radial-gradient(closest-side,rgb(0 6 26 / ${op}),transparent);filter:blur(6px)"></div>`;
/* İmza: g işareti + GURU DİJİTAL + hizmet adı */
const lockup = (name, { size = 30, tone = "white" } = {}) =>
  `<div class="row" style="gap:${size * 0.5}px;color:${tone === "white" ? "#fff" : "#011441"}">${mark(tone, size * 1.45)}<div><div style="font-size:${size * 0.42}px;font-weight:600;letter-spacing:.16em;opacity:.72">GURU DİJİTAL</div><div style="font-size:${size}px;font-weight:500;letter-spacing:-.02em;line-height:1.1;margin-top:${size * 0.08}px">${name}</div></div></div>`;
/* Yazı bölgesinde ışık şeridini sakinleştiren koyu geçiş */
const calm = (t, h, op = "f2") => `<div style="position:absolute;left:0;right:0;top:0;height:${h}px;background:linear-gradient(180deg,${t.deep}${op} 0%,${t.deep}cc 45%,${t.deep}00 100%)"></div>`;

/* ---------- 1) Hero 1600x1000: eğik dizüstü + telefon + yüzen kart ---------- */
function hero({ t, name, desktop, mobile, card }) {
  const body = `
  ${glow(100, 320, 1250, 700)}
  ${calm(t, 300, "c0")}
  <div style="position:absolute;left:68px;top:60px">${lockup(name)}</div>
  ${floorShadow(100, 900, 1120, 100)}
  <div style="position:absolute;left:64px;top:262px;perspective:3200px">
    ${macbook(desktop, { width: 1040, style: "transform:rotateY(13deg) rotateX(4deg) rotateZ(-.6deg);transform-origin:0% 50%" })}
  </div>
  ${floorShadow(1120, 935, 340, 60, 0.6)}
  <div style="position:absolute;left:1150px;top:336px;perspective:2400px">
    ${iphone(mobile, { width: 300, style: "transform:rotateY(-10deg) rotateZ(1.5deg);filter:drop-shadow(0 50px 50px rgb(0 6 26/.55))" })}
  </div>
  ${floatCard(card, "left:990px;top:52px;width:540px;padding:22px 24px")}
  ${grainLayer(0.06)}`;
  return page({ w: 1600, h: 1000, bg: themeBg(t), body, css: CSS });
}

/* ---------- 2) Kart 1200x900 (4:3): kırpmaya gerek kalmadan tam sığar ---------- */
function kart({ t, name, desktop, mobile }) {
  const body = `
  ${glow(60, 230, 1000, 620)}
  ${calm(t, 230, "c0")}
  <div style="position:absolute;left:64px;top:58px">${lockup(name, { size: 28 })}</div>
  ${floorShadow(80, 760, 860, 80)}
  <div style="position:absolute;left:64px;top:206px;perspective:2800px">
    ${macbook(desktop, { width: 840, style: "transform:rotateY(11deg) rotateX(3deg);transform-origin:0% 50%" })}
  </div>
  ${floorShadow(860, 812, 270, 44, 0.6)}
  <div style="position:absolute;left:880px;top:276px;perspective:2000px">
    ${iphone(mobile, { width: 254, style: "transform:rotateY(-9deg) rotateZ(1.2deg);filter:drop-shadow(0 40px 40px rgb(0 6 26/.55))" })}
  </div>
  ${grainLayer(0.06)}`;
  return page({ w: 1200, h: 900, bg: themeBg(t), body, css: CSS });
}

/* ---------- 3) Öne çıkan ekran 1200x900: üstte başlık + tek satır açıklama ---------- */
function feature({ t, dark = false, title, sub, body: inner }) {
  const body = `
  ${dark ? glow(150, 260, 1000, 640) : glow(200, 200, 900, 700, "rgb(255 255 255 / .9)")}
  ${dark ? calm(t, 330) : ""}
  <div style="position:absolute;left:64px;top:56px;right:64px;color:${dark ? "#fff" : "#0c1a3a"}">
    <div style="font-size:44px;font-weight:600;letter-spacing:-.035em;line-height:1.08">${title}</div>
    <div style="font-size:20px;line-height:1.4;margin-top:12px;color:${dark ? "rgb(255 255 255/.78)" : "#3b4763"};white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${sub}</div>
  </div>
  <div class="fl" style="position:absolute;left:64px;top:206px;width:1072px;height:638px" data-durak="govde">${inner}</div>
  ${grainLayer(dark ? 0.06 : 0.035)}`;
  return page({ w: 1200, h: 900, bg: dark ? themeBg(t) : iceBg(t), body, css: CSS });
}
/* düzen yardımcıları (feature gövdesi 1072x638) */
const row = (items, { gap = 24, align = "stretch", h = "100%", just = "flex-start" } = {}) => `<div style="display:flex;gap:${gap}px;align-items:${align};justify-content:${just};height:${h};min-height:0">${items.join("")}</div>`;
const col = (items, { gap = 24, w, flex = 1, just = "flex-start" } = {}) => `<div style="display:flex;flex-direction:column;gap:${gap}px;justify-content:${just};${w ? `width:${w}px;flex-shrink:0` : `flex:${flex};min-width:0`};min-height:0">${items.join("")}</div>`;
const z = (html, zoom = 1, style = "") => `<div style="zoom:${zoom};min-width:0;${style}">${html}</div>`;
const phone = (screen, w, style = "") => `<div style="flex-shrink:0;${style}">${iphone(screen, { width: w, style: "filter:drop-shadow(0 40px 40px rgb(1 12 40/.45))" })}</div>`;
const darkStat = (ic, label, value, unit, noteText, style = "") => `<div class="card" style="padding:26px 30px;background:linear-gradient(150deg,#011441,#12419b 60%,#2a6aca);color:#fff;${style}">
  <div class="row" style="gap:10px;font-size:16px;color:#bfe0ff">${icon(ic, { size: 19, color: "#bfe0ff", stroke: 2.1 })}${label}</div>
  <div style="font-size:72px;font-weight:600;letter-spacing:-.04em;line-height:1;margin-top:16px">${value}${unit ? `<span style="font-size:28px;font-weight:500;margin-left:8px;letter-spacing:0;color:#cfe6ff">${unit}</span>` : ""}</div>
  <div class="row" style="gap:6px;margin-top:18px;display:inline-flex;padding:7px 12px;border-radius:999px;background:rgb(255 255 255/.14);font-size:14.5px;font-weight:500">${icon("trending-up", { size: 15, stroke: 2.4 })}${noteText}</div></div>`;
const lightStat = (ic, label, value, noteText, style = "") => `<div class="card" style="padding:26px 30px;${style}">
  <div class="row" style="gap:10px;font-size:16px;color:#55617b">${icon(ic, { size: 19, color: "#2a6aca", stroke: 2.1 })}${label}</div>
  <div style="font-size:64px;font-weight:600;letter-spacing:-.04em;line-height:1;margin-top:14px">${value}</div>
  <div class="row" style="gap:6px;margin-top:16px;display:inline-flex;padding:7px 12px;border-radius:999px;background:#e6f6ec;color:#12873f;font-size:14.5px;font-weight:500">${icon("trending-up", { size: 15, stroke: 2.4 })}${noteText}</div></div>`;
const cardWrap = (inner, style = "") => `<div class="card" style="padding:22px 24px;${style}">${inner}</div>`;
const cHead = (tt, s, right = "") => `<div class="row" style="gap:12px"><div><div class="h3" style="font-size:19px">${tt}</div>${s ? `<div class="lbl" style="font-size:14px;margin-top:3px">${s}</div>` : ""}</div>${right ? `<div style="margin-left:auto">${right}</div>` : ""}</div>`;
const checks = (items, fs = 15) => `<div style="display:grid;gap:13px;margin-top:16px">${items.map((t) => `<div class="row" style="gap:11px;font-size:${fs}px"><span style="width:22px;height:22px;border-radius:7px;background:#16a34a;display:grid;place-items:center;flex-shrink:0">${icon("check", { size: 14, color: "#fff", stroke: 3 })}</span>${t}</div>`).join("")}</div>`;

/* ---------- 4) Kapak 1200x1500 (App Store tarzı) ---------- */
function cover({ t, name, headline, sub, mobile, card, cardStyle, phoneLeft = 110, phoneWidth = 560 }) {
  const h = headline.replace(/\*([^*]+)\*/g, `<span style="color:${t.ice}">$1</span>`);
  const body = `
  <div style="position:absolute;left:150px;top:520px;width:900px;height:1100px;border-radius:50%;background:radial-gradient(closest-side,${t.hi}88,transparent);filter:blur(20px)"></div>
  <div style="position:absolute;left:0;right:0;top:0;height:780px;background:linear-gradient(180deg,${t.deep} 0%,${t.deep}e6 45%,${t.deep}00 100%)"></div>
  <div style="position:absolute;left:0;right:0;top:96px;display:grid;justify-items:center;text-align:center;padding:0 80px">
    <div class="row" style="gap:14px;padding:10px 24px 10px 12px;border-radius:999px;background:rgb(255 255 255/.10);box-shadow:inset 0 0 0 1px rgb(255 255 255/.18)">${mark("white", 40)}<span style="font-size:26px;font-weight:500;color:#fff;letter-spacing:-.01em">Guru Dijital<span style="opacity:.55;margin:0 10px">·</span>${name}</span></div>
    <h1 style="margin-top:36px;max-width:960px;font-size:100px;line-height:1.02;font-weight:600;letter-spacing:-.045em;color:#fff;text-wrap:balance">${h}</h1>
    <p style="margin-top:26px;font-size:31px;line-height:1.35;color:rgb(255 255 255/.8);max-width:920px;text-wrap:balance">${sub}</p>
  </div>
  <div style="position:absolute;left:${phoneLeft}px;top:720px">${iphone(mobile, { width: phoneWidth, style: "filter:drop-shadow(0 60px 70px rgb(0 6 26/.6))" })}</div>
  ${card ? floatCard(card, cardStyle, "24px 26px") : ""}
  ${grainLayer(0.06)}`;
  return page({ w: 1200, h: 1500, bg: themeBg(t), body, css: CSS });
}

/* ---------- 5) Paylaşım 1200x630 ---------- */
function og({ t, name, headline, desktop, mobile }) {
  const h = headline.replace(/\*([^*]+)\*/g, `<b style="font-weight:600;color:${t.ice}">$1</b>`);
  const body = `
  ${glow(560, 120, 700, 520)}
  ${calm(t, 220, "b0")}
  <div style="position:absolute;left:64px;top:58px">${lockup(name, { size: 24 })}</div>
  <h1 style="position:absolute;left:64px;top:182px;width:520px;font-size:50px;line-height:1.1;font-weight:400;letter-spacing:-.035em;color:#fff">${h}</h1>
  <div style="position:absolute;left:64px;bottom:58px" class="row"><span style="display:inline-flex;align-items:center;gap:10px;height:46px;padding:0 20px;border-radius:999px;background:#fff;color:#011441;font-size:17px;font-weight:500">Teklif alın${icon("arrow-up-right", { size: 18, stroke: 2.2 })}</span></div>
  ${floorShadow(600, 560, 640, 60)}
  <div style="position:absolute;left:610px;top:150px;perspective:2600px">${macbook(desktop, { width: 700, style: "transform:rotateY(14deg) rotateX(3deg);transform-origin:0% 50%" })}</div>
  <div style="position:absolute;left:1010px;top:250px;perspective:2000px">${iphone(mobile, { width: 170, style: "transform:rotateY(-10deg) rotateZ(1.5deg);filter:drop-shadow(0 30px 30px rgb(0 6 26/.55))" })}</div>
  ${grainLayer(0.06)}`;
  return page({ w: 1200, h: 630, bg: themeBg(t), body, css: CSS });
}

/* Bildirim tarzı yüzen kart */
const note = (app, ic, title, text, time, extra = "") => H.notifCard(app, ic, title, text, time) + extra;
const stats = (items) => `<div class="row" style="gap:10px;margin-top:16px">${items.map(([a, b]) => `<div style="flex:1;min-width:0;padding:11px 13px;border-radius:13px;background:#f3f6fb"><div style="font-size:13px;color:#7f8aa3;white-space:nowrap">${a}</div><div style="font-size:21px;font-weight:600;letter-spacing:-.02em;margin-top:2px;white-space:nowrap">${b}</div></div>`).join("")}</div>`;

/* ======================================================================
   Hizmet tanımları
   ====================================================================== */
const S = {};

/* 1. Dijital reklam */
{
  const D = [H.reklamDesktop(), H.reklamTestDesktop(), H.reklamReportDesktop()];
  S["dijital-reklam-yonetimi"] = {
    name: "Dijital Reklam Yönetimi", D, M: [H.reklamMobile()],
    card: note("GURU DİJİTAL · REKLAM", "trophy", "Kreatif testi sonuçlandı", "B varyantı %38 daha fazla dönüşüm getirdi", "09:12", stats([["ROAS", "5,8x"], ["Dönüşüm", "2.418"], ["Maliyet", "−%11"]])),
    cover: { headline: "Her lira *ölçülür*", sub: "Google, Meta ve TikTok kampanyaları dönüşüm takibiyle tek panoda" },
    og: "Reklam bütçeniz *ölçülebilir* sonuca dönüşsün",
    feats: [
      { title: "Tüm kanallar tek panoda", sub: "Harcama, dönüşüm ve ROAS her gün güncel; bütçe sonuç getiren kanala kayar.",
        body: row([z(H.rekChannels({ rows: 6 }), 1.16, "flex:1"), col([darkStat("chart-spline", "ROAS", "5,8", "x", "Hedef 4,5x · +0,9"), z(kpi("Dönüşüm", "2.418", "+%21", "shopping-bag", { big: true, note: "geçen aya göre" }), 1, "display:flex;flex:1"), z(kpi("Dönüşüm başı maliyet", "₺77,1", "%11", "receipt", { big: true, tone: "gooddown", note: "daha düşük" }), 1, "display:flex;flex:1")], { w: 400, gap: 20 })]) },
      { title: "Kreatifleri test ederek ilerliyoruz", sub: "A/B testinde kazanan reklam, bütçenin büyük kısmını alır.", dark: true,
        body: row([z(H.rekVariant("A", { h: 330 }), 1, "flex:1"), z(H.rekVariant("B", { h: 330 }), 1, "flex:1"), col([H.rekTestResult(), cardWrap(`${cHead("Sıradaki test", "6 Ekim'de başlar")}<div style="font-size:15px;line-height:1.5;color:#3b4763;margin-top:12px">Fiyat avantajı ile cilt faydası vurgusunun karşılaştırması</div>`)], { w: 330, gap: 18 })], { gap: 18, align: "flex-start" }) },
      { title: "Her ay anlaşılır bir rapor", sub: "Ne yaptığımızı, ne getirdiğini ve sıradaki adımı tek sayfada görürsünüz.",
        body: row([cardWrap(`${cHead("Aylık dönüşüm", "Son 6 ay · tüm kanallar")}<div style="margin-top:36px">${H.rekReportBars({ w: 556, h: 470, fs: 15 })}</div>`, "flex:1;min-width:0;padding:28px 32px"), col([z(H.rekGoals(), 1.08), z(H.rekPlan(), 1.08), `<div class="card" style="flex:1;padding:22px 26px;background:linear-gradient(150deg,#011441,#12419b 70%,#2a6aca);color:#fff"><div style="font-size:14px;color:#bfe0ff">Uzman notu · Selin Yurt</div><div style="font-size:17px;line-height:1.5;margin-top:10px">Yorum odaklı kreatifler en iyi sonucu verdi. Ekimde bu dili video reklamlara taşıyoruz.</div></div>`], { w: 420, gap: 20 })]) },
    ],
  };
}
/* 2. Web tasarım */
{
  const D = [H.webDesktop(), H.webPerfDesktop(), H.webSiteDesktop()];
  S["web-tasarim"] = {
    name: "Web Tasarım", D, M: [H.webMobile()],
    card: note("DEFNEKOY.COM.TR", "rocket", "Yeni site yayında", "Mobil hız puanı 98 · rezervasyon formu aktif", "10:00", stats([["Performans", "98"], ["Erişilebilirlik", "100"], ["Yüklenme", "1,2 sn"]])),
    cover: { headline: "Markanızın *dijital* yüzü", sub: "Hızlı açılan, telefonda rahat kullanılan ve yayından sonra da bakımı süren siteler" },
    og: "Hızlı, mobil uyumlu ve *size ait* web siteleri",
    feats: [
      { title: "Her ekranda aynı özen", sub: "Site masaüstünde, tablette ve telefonda rahat kullanılır.", dark: true,
        body: `${appWindow(D[0], { crop: [0, 46, 1440, 854], scale: 0.53, title: "defnekoy.com.tr", style: "left:0;top:60px" })}<div style="position:absolute;left:800px;top:12px">${iphone(H.webMobile(), { width: 272, style: "filter:drop-shadow(0 40px 40px rgb(0 6 26/.55))" })}</div>` },
      { title: "Hız ve erişilebilirlik ölçülür", sub: "Her yayından önce ölçüyor, sonuçları sizinle paylaşıyoruz.",
        body: col([H.webScores(), row([z(H.webVitals({ n: 3 }), 1, "flex:1"), col([H.webDevices(), cardWrap(`${cHead("Sayfa ağırlığı", "Ana sayfa")}<div class="row" style="align-items:flex-end;gap:10px;margin-top:12px"><span style="font-size:40px;font-weight:600;letter-spacing:-.03em">640 KB</span><span class="up" style="font-size:14px;font-weight:600;padding-bottom:8px">%62 daha hafif</span></div>`, "flex:1")], { w: 400, gap: 16 })], { gap: 16, h: "auto" })], { gap: 16 }).replace('<div style="display:flex;flex-direction:column', '<div style="zoom:.97;display:flex;flex-direction:column') },
      { title: "Ziyaretçiyi hedefe taşıyan yapı", sub: "Sayfa haritası, rezervasyon yolu ve yayın listesi baştan planlanır.",
        body: col([H.webPhases(), row([cardWrap(`${cHead("Sayfa haritası", "18 sayfa · 2 dil")}<div style="margin-top:22px">${H.webSitemap({ w: 594 })}</div>`, "flex:1;min-width:0"), z(H.webChecklist(), 1, "width:380px;flex-shrink:0")], { gap: 20, h: "auto" })], { gap: 20 }) },
    ],
  };
}
/* 3. SEO */
{
  const D = [H.seoDesktop(), H.seoAuditDesktop(), H.seoLangDesktop()];
  S.seo = {
    name: "SEO", D, M: [H.seoMobile()],
    card: note("GURU DİJİTAL · SEO", "trending-up", "“implant tedavisi kadıköy” 3. sırada", "Bu ay 5 sıra yükseldi · ilk 10'da 86 kelime", "Pzt", stats([["Organik tık", "+%46"], ["Ort. sıra", "8,4"], ["Site sağlığı", "92"]])),
    cover: { headline: "Sizi arayan *sizi bulsun*", sub: "Teknik SEO, içerik planı ve şeffaf aylık raporlar" },
    og: "Google'da *daha görünür* bir site",
    feats: [
      { title: "Organik görünürlük raporu", sub: "Tıklama, sıralama ve yükselen kelimeler her ay takipte.",
        body: col([row([z(H.seoTrend({ w: 654, h: 200 }), 1, "flex:1"), z(H.seoDist(), 1, "width:350px;flex-shrink:0")], { gap: 20, h: "320px" }), cardWrap(`${cHead("Yükselen kelimeler", "Son 30 gün")}<div style="margin-top:14px">${H.seoKwTable({ n: 3, rh: 52 })}</div>`)], { gap: 20 }) },
      { title: "Teknik denetim, öncelik sırasıyla", sub: "Hız, taranabilirlik ve dizine ekleme sorunları adım adım çözülür.", dark: true,
        body: row([cardWrap(`${cHead("Kontrol listesi", "Öncelik sırasına göre")}<div style="margin-top:14px">${H.seoAuditList({ n: 7, rh: 68 })}</div>`, "flex:1;min-width:0"), col([z(H.seoHealth(), 1.05)], { w: 400 })], { align: "flex-start" }) },
      { title: "Çok dilli sayfalar doğru ülkede", sub: "hreflang kurgusuyla her dil kendi arama sonuçlarında görünür.",
        body: col([H.seoLangCards(), H.seoLangMatrix({ n: 6, rh: 52 })], { gap: 20 }) },
    ],
  };
}
/* 4. Özel yazılım */
{
  const D = [H.ozelDesktop(), H.ozelFlowDesktop(), H.ozelApiDesktop()];
  S["ozel-yazilim"] = {
    name: "Özel Yazılım", D, M: [H.ozelMobile()],
    card: note("ATLAS SEVKİYAT", "zap", "Otomasyon 4.812 kez çalıştı", "Siparişten sevkiyata elle işlem gerekmedi", "Bu ay", stats([["Başarı", "%99,6"], ["Kazanılan", "640 saat"], ["Teslim", "%97,2"]])),
    cover: { headline: "İşinize göre *yazılım*", sub: "Yönetim panelleri, entegrasyonlar ve otomasyonlar; kaynak kodu sizin" },
    og: "İşinize göre yazılmış *yazılım*",
    feats: [
      { title: "İşinize özel yönetim paneli", sub: "Sevkiyattan depoya tüm süreç tek ekranda, sizin iş akışınıza göre.",
        body: row([cardWrap(`${cHead("Sevkiyat listesi", "Son güncelleme 1 dk önce")}<div style="margin-top:14px">${H.atlTable({ n: 7, rh: 68, compact: true })}</div>`, "flex:1;min-width:0"), col([z(H.atlRouteCard(), 1.02), cardWrap(`${cHead("Depo doluluğu", "Anlık")}<div style="display:grid;gap:14px;margin-top:16px">${[["Tuzla", 82, "#e8a33a"], ["Gebze", 64, "#2a6aca"], ["Kemalpaşa", 47, "#2a6aca"]].map(([a, p, c]) => `<div><div class="row" style="font-size:15px"><span>${a}</span><span style="margin-left:auto;font-weight:600">%${p}</span></div><div style="margin-top:7px">${H.meter(p, c, 8)}</div></div>`).join("")}</div>`, "flex:1")], { w: 360, gap: 20 })]) },
      { title: "Tekrarlayan işler kendiliğinden ilerler", sub: "Sipariş geldiğinde stok, kargo ve müşteri bildirimi otomatik çalışır.", dark: true,
        body: row([`<div class="card" style="padding:12px;flex-shrink:0">${z(H.flowCanvas({ w: 780, h: 752 }), 0.8)}</div>`, col([H.flowStats(), z(H.flowRuns(), 1, "flex:1")], { gap: 20 })], { gap: 20, align: "flex-start" }) },
      { title: "Kullandığınız sistemlerle konuşur", sub: "ERP, muhasebe, kargo ve ödeme sistemleri API ile bağlanır.",
        body: col([`<div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px">${H.INTEG.map(H.integCard).join("")}</div>`, z(H.codePanel({ fs: 13 }), 1, "flex:1;min-height:0")], { gap: 16 }).replace('<div style="display:flex;flex-direction:column', '<div style="zoom:.96;display:flex;flex-direction:column') },
    ],
  };
}
/* 5. Mobil uygulama */
{
  const D = [H.mobilDesktop(), H.mobilPushDesktop(), H.mobilFlowDesktop()];
  const M = [H.patiHome(), H.patiBook(), H.patiDone()];
  S["mobil-uygulama"] = {
    name: "Mobil Uygulama", D, M,
    card: note("GURU DİJİTAL · UYGULAMA", "rocket", "Sürüm 2.4.0 mağazada", "Google Play'de yayında, App Store incelemesi sürüyor", "12:40", stats([["Aktif kullanıcı", "8.940"], ["Çökmesiz", "%99,8"], ["Puan", "4,8"]])),
    cover: { headline: "Müşterinizin *cebinde*", sub: "iOS ve Android için tek kod tabanı, mağaza yayını ve bakım" },
    og: "Müşterinizin *cebinde* yer alın",
    feats: [
      { title: "Kullanıcının elinde sade bir deneyim", sub: "Randevu üç adımda; hatırlatmalar ve aşı karnesi uygulamada.", dark: true,
        body: row(M.map((m) => phone(m, 294)), { gap: 44, align: "flex-start", just: "center" }) },
      { title: "Mağaza yayınını biz yürütürüz", sub: "App Store ve Google Play süreçleri, sürüm notları ve inceleme takibi.",
        body: col([row([z(H.storeCard("ios"), 1.15, "flex:1;display:flex"), z(H.storeCard("android"), 1.15, "flex:1;display:flex")], { gap: 20, h: "auto" }), row([cardWrap(`${cHead("Yayın kontrol listesi", "2.4.0")}${checks(["Mağaza görselleri ve açıklama", "Gizlilik etiketleri", "8 test cihazında deneme", "Kademeli dağıtım planı"])}`, "flex:1;min-width:0"), cardWrap(`${cHead("Sürüm notları", "2.4.0")}<div style="display:grid;gap:16px;margin-top:18px">${[["sparkles", "Üç adımda randevu"], ["syringe", "Aşı karnesi ve hatırlatma"], ["message-circle", "Hekime fotoğraflı mesaj"], ["zap", "%30 daha hızlı açılış"]].map(([ic, tt]) => `<div class="row" style="gap:12px;font-size:16px">${H.ibox(ic, "#eaf2ff", "#2a6aca", 34, 10)}${tt}</div>`).join("")}</div>`, "flex:1;min-width:0"), darkStat("users", "Aktif kullanıcı", "8.940", "", "+%14 · çökmesiz %99,8", "width:300px;flex-shrink:0")], { gap: 20, h: "auto;flex:1" })], { gap: 20 }) },
      { title: "Bildirimlerle geri getirin", sub: "Doğru anda giden hatırlatma, randevuya dönüşür.",
        body: row([phone(H.lockScreen(), 294), col([["send", "Gönderilen", "6.120", "son 30 gün"], ["mouse-pointer-click", "Açılma oranı", "%18,4", "sektör ortalaması %7"], ["calendar-check", "Oluşan randevu", "214", "bildirimden sonra"]].map(([ic, a, b, c]) => cardWrap(`<div class="row" style="gap:12px"><span class="lbl" style="font-size:16px">${a}</span><span style="margin-left:auto">${H.ibox(ic, "#eaf2ff", "#2a6aca", 40, 12)}</span></div><div style="font-size:46px;font-weight:600;letter-spacing:-.03em;margin-top:4px">${b}</div><div style="font-size:14.5px;color:#8a95ad">${c}</div>`, "flex:1;padding:22px 28px")), { gap: 20 })], { gap: 48 }) },
    ],
  };
}
/* 6. Marka tescil */
{
  const D = [H.markaDesktop(), H.markaSearchDesktop(), H.markaClassDesktop()];
  S["marka-tescil"] = {
    name: "Marka Tescil", D, M: [H.markaMobile()],
    card: note("GURU DİJİTAL · MARKA", "newspaper", "ZEYDA bültende yayımlandı", "İtiraz süresi 2 ay · süreci sizin için izliyoruz", "2 Eyl", stats([["Sınıf", "29 · 30 · 35"], ["Kalan süre", "18 gün"], ["İtiraz", "Yok"]])),
    cover: { headline: "Emeğiniz *adınızla* korunsun", sub: "Araştırma, başvuru, bülten ve tescil adımları tek yerden takipte" },
    og: "Markanızı *adınızla* koruma altına alın",
    feats: [
      { title: "Başvurunuz adım adım takipte", sub: "Araştırmadan tescile her aşamayı ve kalan süreleri görürsünüz.",
        body: col([cardWrap(`<div class="row" style="gap:18px;margin-bottom:26px"><div style="padding:12px 18px;border-radius:14px;background:#f5f8fd">${H.ZEYDA(0.9)}</div><div><div style="font-size:19px;font-weight:600">ZEYDA · şekil ve kelime markası</div><div class="lbl" style="font-size:14px;margin-top:3px">Başvuru 2026/014582 · sınıf 29, 30, 35</div></div></div>${H.mrkTimeline({ big: true })}`, "padding:26px 30px"), row([z(H.mrkLog(), 1, "flex:1"), col([z(H.mrkCountdown(), 1.05)], { w: 400 })], { gap: 20, h: "auto" })], { gap: 20 }) },
      { title: "Önce benzer markaları araştırırız", sub: "Riskli bir başvuruyu yapmadan önce görür, gerekirse adı birlikte değiştiririz.", dark: true,
        body: row([cardWrap(`${cHead("Benzer kayıtlar", "“ZEYDA” için ses, yazım ve anlam benzerliği")}<div style="margin-top:14px">${H.mrkSimTable({ n: 6, rh: 62 })}</div>`, "flex:1;min-width:0"), col([z(H.mrkVerdict(), 1)], { w: 360 })], { gap: 20, align: "flex-start" }) },
      { title: "Doğru sınıf, sağlam koruma", sub: "Nice sınıfları ve mal/hizmet listesi işinize göre seçilir.",
        body: row([col([cardWrap(`${cHead("Sınıflar", "Seçili: 29, 30, 35 · önerilen: 32, 43")}<div style="margin-top:18px">${H.niceGrid({ cell: 60 })}</div>`), z(H.niceDetail({ cols: true }), 1, "flex:1")], { gap: 20 }), `<div style="flex-shrink:0;display:grid;place-items:center">${H.certificate({ w: 330 })}</div>`], { gap: 28 }) },
    ],
  };
}
/* 7. E-ticaret */
{
  const D = [H.eticaretDesktop(), H.eticaretProductDesktop(), H.eticaretOpsDesktop()];
  S["e-ticaret-yonetimi"] = {
    name: "E-Ticaret Yönetimi", D, M: [H.eticaretMobile()],
    card: note("PAMUK SOKAĞI · MAĞAZA", "shopping-bag", "Bugün 214 sipariş", "Kendi site, Trendyol, Hepsiburada ve Amazon tek listede", "18:00", stats([["Ciro", "₺168.240"], ["Dönüşüm", "%2,9"], ["Aynı gün", "%96"]])),
    cover: { headline: "Mağazanız *tek* panelde", sub: "Kendi site ve pazaryerleri; ürün, stok, kampanya ve kargo aynı yerde" },
    og: "Mağazanız satışa hazır, *düzenli* ve büyüyor",
    feats: [
      { title: "Tüm kanallar tek mağaza panelinde", sub: "Kendi site ve pazaryeri siparişleri, stokları ve cirosu bir arada.",
        body: col([row([z(H.etkChannels(), 1.05, "flex:1"), z(H.etkStock(), 1.05, "width:362px;flex-shrink:0")], { gap: 20, h: "auto" }), cardWrap(`${cHead("Son siparişler", "Tüm kanallar tek listede")}<div style="margin-top:14px">${H.etkOrders({ n: 3, rh: 50 })}</div>`)], { gap: 20 }) },
      { title: "Ürün içeriği bir kez, her kanalda", sub: "Fiyat, stok ve açıklama tüm satış kanallarına aynı anda gider.", dark: true,
        body: row([z(H.etkProductEditor(), 0.94, "flex:1"), col([z(H.etkSync(), 1.05), cardWrap(`${cHead("Son 30 gün", "Bu ürün · tüm kanallar")}<div class="row" style="gap:10px;margin-top:14px">${[["Satış", "318"], ["İade", "%1,8"]].map(([a, b]) => `<div style="flex:1;padding:10px 12px;border-radius:12px;background:#f5f8fd"><div style="font-size:12.5px;color:#7f8aa3">${a}</div><div style="font-size:21px;font-weight:600">${b}</div></div>`).join("")}</div>`, "flex:1")], { w: 320, gap: 20 })], { gap: 20 }) },
      { title: "Kargo ve operasyon takipte", sub: "Siparişler hazırlıktan teslime kadar aşama aşama ilerler.",
        body: col([z(H.etkPipeline({ cards: 2 }), 1), row([cardWrap(`${cHead("Günlük gönderi", "Son 14 gün · tüm kanallar")}<div style="margin-top:20px">${H.etkBars({ w: 626, h: 262 })}</div>`, "flex:1;min-width:0"), col([H.etkShipStats(), cardWrap(`${cHead("İade nedenleri", "")}<div style="display:grid;gap:12px;margin-top:14px">${[["Beden ve ölçü", 44], ["Renk beklentisi", 27]].map(([a, p]) => `<div><div class="row" style="font-size:14px"><span>${a}</span><span style="margin-left:auto;font-weight:600">%${p}</span></div><div style="margin-top:6px">${H.meter(p * 2, "#2a6aca", 6)}</div></div>`).join("")}</div>`, "flex:1")], { w: 360, gap: 20 })], { gap: 20, h: "auto" })], { gap: 20 }) },
    ],
  };
}
/* 8. Grafik tasarım */
{
  const D = [H.grafikDesktop(), H.grafikSocialDesktop(), H.grafikPackDesktop()];
  S["grafik-tasarim"] = {
    name: "Grafik Tasarım", D, M: [H.grafikMobile()],
    card: note("GURU DİJİTAL · TASARIM", "gem", "Ada Fırın kimlik sunumu hazır", "Logo, renk paleti ve ambalaj uygulamaları onayınızda", "10:24", `<div class="row" style="gap:10px;margin-top:16px">${[H.ADA.navy, H.ADA.cream, H.ADA.crust, H.ADA.sky].map((c) => `<span style="flex:1;height:40px;border-radius:12px;background:${c};${c === H.ADA.cream ? "box-shadow:inset 0 0 0 1px #e7dccb" : ""}"></span>`).join("")}</div>`),
    cover: { headline: "Markanıza *değer* katan tasarım", sub: "Logo, kurumsal kimlik, ambalaj ve sosyal medya aynı görsel dilde" },
    og: "Markanıza *değer* katan tasarımlar",
    feats: [
      { title: "Marka kimliğiniz tek sunumda", sub: "Logo, renk ve tipografi kuralları birlikte tasarlanır.",
        body: col([row([`<div class="card" style="flex:1;min-width:0;display:grid;place-items:center;background:${H.ADA.cream}">${H.adaLogo(1.25)}</div>`, col([cardWrap(`${cHead("Logo varyantları", "Koyu, açık ve tek renk")}<div style="margin-top:16px">${H.adaVariants()}</div>`), z(H.adaType(), 1, "flex:1")], { w: 410, gap: 20 })], { gap: 20, h: "430px" }), cardWrap(H.adaPalette(), "padding:16px")], { gap: 20 }) },
      { title: "Sosyal medyaya hazır şablonlar", sub: "Ekibiniz marka diliyle hızlıca yeni içerik üretir.", dark: true,
        body: row([`<div style="width:640px;display:grid;grid-template-columns:repeat(3,1fr);gap:16px;align-content:center">${[0, 1, 2, 3, 4, 5].map((i) => `<div style="filter:drop-shadow(0 24px 30px rgb(0 6 26/.35))">${H.adaPost(i, { s: 1.1 })}</div>`).join("")}</div>`, `<div style="width:300px;flex-shrink:0;filter:drop-shadow(0 30px 40px rgb(0 6 26/.45))">${H.adaStory({ s: 1.4 })}</div>`], { gap: 48, align: "center", just: "center" }) },
      { title: "Ambalaj ve baskıya hazır dosyalar", sub: "Kese, kutu ve katalog aynı karakteri taşır; matbaaya hazır teslim edilir.",
        body: row([`<div class="card" style="flex:1;min-width:0;position:relative;overflow:hidden;background:radial-gradient(80% 70% at 40% 40%,#ffffff,#eaf0f8)"><div style="position:absolute;left:24px;bottom:60px;filter:drop-shadow(0 30px 26px rgb(1 12 40/.25))">${H.adaBag(290)}</div><div style="position:absolute;left:316px;bottom:56px;filter:drop-shadow(0 30px 26px rgb(1 12 40/.3))">${H.adaBox(300)}</div></div>`, col([cardWrap(`${cHead("Katalog · 12 sayfa", "Sayfa 1-2")}<div style="margin-top:16px">${H.adaCatalog()}</div>`), cardWrap(`${cHead("Baskı kontrolü", "")}${checks(["CMYK renk profili", "3 mm taşma payı", "300 dpi görseller", "PDF/X-4 çıktısı"])}`, "flex:1")], { w: 410, gap: 20 })], { gap: 20 }) },
    ],
  };
}
/* 9. Sosyal medya */
{
  const D = [H.sosyalDesktop(), H.sosyalReportDesktop(), H.sosyalCommunityDesktop()];
  S["sosyal-medya-yonetimi"] = {
    name: "Sosyal Medya Yönetimi", D, M: [H.sosyalMobile()],
    card: note("GURU DİJİTAL · SOSYAL", "calendar-days", "Ekim takvimi onayınızda", "14 içerik planlandı · 2 gönderi onay bekliyor", "09:00", stats([["Erişim", "248K"], ["Etkileşim", "%5,4"], ["Takipçi", "+1.920"]])),
    cover: { headline: "Markanız *öne* çıksın", sub: "İçerik takvimi, tasarım, topluluk yönetimi ve aylık rapor" },
    og: "Markanızı sosyal medyada *öne* çıkarın",
    feats: [
      { title: "Aylık içerik takvimi", sub: "Her gönderi yayından önce onayınıza gelir.",
        body: row([cardWrap(`<div class="row" style="gap:10px;margin-bottom:12px"><span class="h3" style="font-size:19px">Ekim 2026</span>${["6 yayınlandı", "2 onay bekliyor"].map((tt, i) => `<span class="tag" style="background:${i ? "#fff3dc" : "#e6f6ec"};color:${i ? "#b45f06" : "#12873f"};font-size:13px">${tt}</span>`).join("")}</div>${H.calendarGrid({ ch: 94, compact: true })}`, "flex:1;min-width:0;padding:20px"), col([z(H.postApproval(), 1)], { w: 320 })], { gap: 20, align: "flex-start" }) },
      { title: "Gönderiyi yayından önce görürsünüz", sub: "Görsel, metin ve yayın saati telefonda onaylanır.", dark: true,
        body: row([phone(H.sosyalMobile(), 294), col([lightStat("eye", "Aylık erişim", "248K", "+%34 geçen aya göre"), cardWrap(`${cHead("İçerik türüne göre etkileşim", "Eylül")}<div style="display:grid;gap:16px;margin-top:18px">${[["Reels", "%7,9", 100, "#5b3fd6"], ["Karusel gönderi", "%5,1", 64, "#12419b"], ["Tek görsel", "%3,2", 40, "#2a6aca"]].map(([a, b, p, c]) => `<div><div class="row" style="font-size:15px"><span>${a}</span><span style="margin-left:auto;font-weight:600">${b}</span></div><div style="margin-top:8px">${H.meter(p, c, 9, "#eef3fa")}</div></div>`).join("")}</div>`, "flex:1")], { gap: 20 })], { gap: 48 }) },
      { title: "Topluluk mesajları yanıtsız kalmaz", sub: "Yorum ve mesajlar tek kutuda toplanır, marka dilinde yanıtlanır.",
        body: row([cardWrap(`<div style="display:grid;gap:4px">${H.SOS_MSG.map((m, i) => H.msgRow(m, i, { active: i === 3 })).join("")}</div>`, "width:500px;flex-shrink:0;padding:14px 10px;align-self:flex-start"), z(H.replyPanel(), 1, "flex:1")], { gap: 20 }) },
    ],
  };
}

/* Kapakta telefon ve kartın yeri: kart telefon ekranındaki yazının üstüne binmez,
   telefona yalnız çerçevesinden değer */
const COVER_POS = [
  { phoneLeft: 110, cardStyle: "left:642px;top:1020px;width:440px;transform:rotate(3deg) scale(1.15);transform-origin:0 0" },
  { phoneLeft: 530, cardStyle: "left:50px;top:1060px;width:440px;transform:rotate(-3deg) scale(1.15);transform-origin:0 0" },
];

export const SERVICES2 = S;
const out = [];
Object.entries(S).forEach(([slug, s], k) => {
  const t = THEME2[slug];
  s.D.forEach((html, i) => out.push({ name: `hizmet2-raw-${slug}${i ? `-${i + 1}` : ""}`, w: 1440, h: 900, html: page({ w: 1440, h: 900, bg: "", body: html }) }));
  s.M.forEach((html, i) => out.push({ name: `hizmet2-raw-${slug}-mobile${i ? `-${i + 1}` : ""}`, w: 390, h: 844, html: page({ w: 390, h: 844, bg: "", body: html }) }));
  out.push({ name: `hizmet2-${slug}-hero`, w: 1600, h: 1000, html: hero({ t, name: s.name, desktop: s.D[0], mobile: s.M[0], card: s.card }) });
  out.push({ name: `hizmet2-${slug}-kart`, w: 1200, h: 900, html: kart({ t, name: s.name, desktop: s.D[0], mobile: s.M[0] }) });
  s.feats.forEach((f, i) => out.push({ name: `hizmet2-${slug}-${i + 1}`, w: 1200, h: 900, html: feature({ t, ...f }) }));
  out.push({ name: `hizmet2-${slug}-kapak`, w: 1200, h: 1500, html: cover({ t, name: s.name, headline: s.cover.headline, sub: s.cover.sub, mobile: s.M[0], card: s.card, ...COVER_POS[k % 2] }) });
  out.push({ name: `hizmet2-${slug}-og`, w: 1200, h: 630, html: og({ t, name: s.name, headline: s.og, desktop: s.D[0], mobile: s.M[0] }) });
});
export const HIZMET2_SCENES = out;
