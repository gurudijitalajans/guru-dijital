// E-Ticaret v4: pazar yerleri (Trendyol, Hepsiburada, n11, Amazon, Etsy) ve altyapılar (Shopify, ikas) resmî
// logolarıyla; ortaklıklar (Shopify Partner, ikas İş Ortağı, Trendyol Çözüm Ortağı) müşteri teyidiyle. Ayrıca
// BK Collection ham fotoğraftan vitrine karosu ve yalnız e-ticaret vakalarının (Reklam, SEO) rakamları.
import { fileUrl, floatCard, grainLayer, icon, page, ROOT, themeBg } from "../lib.mjs";
import { T } from "./common.mjs";
import { floor, glow, lockup } from "./real.mjs";
import { reportTile } from "./reklam.mjs";

const E = (f) => fileUrl(`${ROOT}/tools/gorsel-studyo/kaynak/katalog/eticaret/${f}`);
const LOGO = fileUrl(`${ROOT}/public/references/bk-collection.png`);
const PL = (f) => fileUrl(`${ROOT}/tools/gorsel-studyo/kaynak/katalog/eticaret/logo/${f}.svg`);
/* Platformlar: [dosya, ad, logo yüksekliği, ortaklık] */
const MARKETS = [["trendyol", "Trendyol", 38, "Çözüm Ortağı"], ["hepsiburada", "Hepsiburada", 30, ""], ["n11", "n11", 50, ""], ["amazon", "Amazon", 46, ""], ["etsy", "Etsy", 44, ""]];
const STACKS = [["shopify", "Shopify", 56, "Partner"], ["ikas", "ikas", 34, "İş Ortağı"]];
const badge = (t, fs = 13) => `<span class="row" style="gap:6px;height:${fs * 2.2}px;padding:0 ${fs}px;border-radius:999px;background:#e5f6ee;color:#11704b;font:600 ${fs}px Outfit;white-space:nowrap">${icon("badge-check", { size: fs + 3, color: "#11704b", stroke: 2.2 })}${t}</span>`;
/* Logo ve rozet kart boyuyla ölçeklenir (240 px genişlik temel) */
const logoCard = ([f, name, lh, partner], w = 240, h = 120, extra = "") => {
  const k = w / 240, fs = Math.round(13 * Math.max(1, k * 0.85));
  return `<div style="position:relative;width:${w}px;height:${h}px;border-radius:${Math.round(22 * Math.min(k, 1.4))}px;background:#fff;display:grid;place-items:center;box-shadow:0 0 0 1px rgb(255 255 255/.6),0 30px 60px -28px rgb(0 6 26/.7);${extra}"><img src="${PL(f)}" alt="${name}" style="height:${lh * k}px;width:auto;max-width:${w * 0.66}px;object-fit:contain">${partner ? `<div style="position:absolute;left:50%;bottom:-${fs * 1.1}px;transform:translateX(-50%)">${badge(`${name} ${partner}`, fs)}</div>` : ""}</div>`;
};
const checklist = (items) => items.map(([ic, t]) => `<div class="row" style="gap:14px;padding:13px 0;border-top:1px solid #eef1f6"><span style="width:38px;height:38px;border-radius:12px;background:#dff6fa;display:grid;place-items:center;flex-shrink:0">${icon(ic, { size: 19, color: ACC, stroke: 2 })}</span><span style="font-size:17px;color:#1f2b46">${t}</span></div>`).join("");
const TE = T["e-ticaret-yonetimi"];
const ACC = "#0d8aa6";
const tile = (body) => page({ w: 1200, h: 900, bg: themeBg(TE), body: `${glow(80, 220, 1040, 640)}${body}${grainLayer(0.06)}` });
/* Fotoğraf kartı: beyaz çerçeve, etiket, gölge */
const photo = (f, x, y, w, h, r = 0, label = "", pos = "50% 50%") => `${floor(x, y + h - 10, w, 50, 0.5)}<div style="position:absolute;left:${x}px;top:${y}px;width:${w}px;transform:rotate(${r}deg);border-radius:24px;background:#fff;padding:12px;box-shadow:0 0 0 1px rgb(255 255 255/.6),0 50px 80px -34px rgb(0 6 26/.75)">
  <div style="height:${h - 24 - (label ? 44 : 0)}px;border-radius:16px;background:#f4f6f9 url('${E(f)}') ${pos}/cover no-repeat"></div>
  ${label ? `<div class="row" style="min-height:44px;padding:6px 8px 0;gap:8px;font:600 16px/1.3 Outfit;color:#2b3a5c">${label}</div>` : ""}</div>`;
const tag = (ic, t, c = ACC) => `${icon(ic, { size: 18, color: c, stroke: 2.2 })}<span>${t}</span>`;
const infoCard = (ic, kind, title, desc, logo = false) => `${logo ? `<img src="${LOGO}" style="height:46px;display:block;margin-bottom:14px">` : ""}<div class="row" style="gap:14px"><span style="width:50px;height:50px;border-radius:15px;background:#dff6fa;display:grid;place-items:center">${icon(ic, { size: 25, color: ACC, stroke: 2 })}</span>
   <div><div style="font-size:13px;font-weight:600;letter-spacing:.08em;color:${ACC}">${kind.toLocaleUpperCase("tr-TR")}</div><div style="font-size:22px;font-weight:600;margin-top:2px;line-height:1.2">${title}</div></div></div>
   ${desc ? `<div style="margin-top:12px;font-size:16px;color:#3b4763;line-height:1.4">${desc}</div>` : ""}`;
/* Sonuçlar yalnız hizmetteki e-ticaret vakalarından (Dijital Reklam ve SEO) */
const ADS = { sector: "E-ticaret · Dijital Reklam", title: "Reklamla e-ticarette ölçülen sonuçlar", big: "3,41 → 8,62", bigLabel: "ROAS, giyim e-ticaret markası",
  rows: [["Ciro artışı (giyim e-ticaret)", 74, "%74", true], ["Kampanya dönemi ciro artışı (e-ticaret)", 96, "%96", true], ["Ciro artışı (e-ticaret)", 60, "%60", false]], max: 96,
  side: [["%42", "Alışveriş başına maliyette azalma (giyim)"], ["%37,5", "Sonuç başına maliyette azalma (e-ticaret)"]] };
const ORG = { sector: "E-ticaret · SEO", title: "Organik aramayla e-ticarette büyüme", big: "%325", bigLabel: "Organik trafik artışı, e-ticaret markası",
  rows: [["Organik trafik (SEO / E-Ticaret)", 325, "%325", true], ["Organik gelir (SEO / Doğrudan Satış)", 215, "%215", true], ["Organik dönüşüm oranı (Doğrudan Satış)", 90, "%90", false]], max: 325,
  side: [["%35", "Organik kanaldan ciro artışı"], ["%50", "Müşteri edinim maliyetinde azalma"]], note: "Ek reklam maliyeti olmadan, 6 ayda kalıcı sıralama" };

const tiles = () => [
  /* 1) Ham ürün fotoğrafından mağaza görseline */
  tile(`${photo("ham-ceket.jpg", 60, 250, 470, 400, -4, tag("camera", "Ham ürün fotoğrafı", "#7a849b"))}
    <div style="position:absolute;left:545px;top:420px;width:64px;height:64px;border-radius:50%;background:#fff;display:grid;place-items:center;box-shadow:0 20px 40px -16px rgb(0 6 26/.6)">${icon("arrow-right", { size: 30, color: ACC, stroke: 2.4 })}</div>
    ${photo("model-ceket.jpg", 630, 120, 470, 640, 3, tag("sparkles", "Mağaza görseli"), "50% 20%")}
    ${floatCard(infoCard("image", "Ürün görseli", "Masada çekilen fotoğraftan vitrine", ""), "left:60px;top:60px;width:470px")}`),
  /* 2) Pazar yeri mağaza kurulumu */
  tile(`<div style="position:absolute;left:90px;top:215px;display:grid;grid-template-columns:repeat(2,240px);gap:30px 24px">${MARKETS.map((m, i) => logoCard(m, 240, 118, i === 4 ? "grid-column:1/3;justify-self:center" : "")).join("")}</div>
    <div style="position:absolute;left:640px;top:205px;width:480px;border-radius:26px;background:#fff;padding:30px 32px;box-shadow:0 60px 100px -40px rgb(1 12 40/.7);font-family:Outfit;color:#0c1a3a">
      ${infoCard("store", "Pazar yerleri", "Mağaza kurulumu", "")}
      <div style="margin-top:18px">${checklist([["file-check", "Mağaza başvurusu ve açılış"], ["tags", "Kategori ve marka eşleştirme"], ["upload", "Toplu ürün yükleme"], ["truck", "Kargo, iade ve fatura ayarları"], ["calendar-days", "Kampanya takvimi"]])}</div></div>`),
  /* 3) Pazar yeri optimizasyonu: örnek ürün sayfası üzerinde iyileştirilen alanlar */
  tile(`<div style="position:absolute;left:330px;top:90px;width:540px;height:720px;border-radius:28px;background:#fff;overflow:hidden;box-shadow:0 60px 100px -40px rgb(1 12 40/.75);font-family:Outfit">
      <div style="height:330px;background:linear-gradient(160deg,#eef6f8,#dff1f5);display:grid;place-items:center;position:relative">${icon("package", { size: 120, color: "#7fb8c6", stroke: 1.2 })}<div class="row" style="position:absolute;left:18px;bottom:16px;gap:8px">${[0, 1, 2, 3, 4].map((i) => `<span style="width:54px;height:54px;border-radius:12px;background:${i ? "#fff" : "#fff"};box-shadow:${i ? "0 0 0 1px #d8e6ea" : `0 0 0 2px ${ACC}`}"></span>`).join("")}</div></div>
      <div style="padding:22px 26px"><div style="font-size:13px;font-weight:600;letter-spacing:.06em;color:#7a849b">ÖRNEK ÜRÜN SAYFASI</div>
        <div style="margin-top:10px;height:16px;width:88%;border-radius:8px;background:#1f2b46"></div><div style="margin-top:9px;height:16px;width:62%;border-radius:8px;background:#1f2b46"></div>
        <div class="row" style="gap:10px;margin-top:20px">${["S", "M", "L", "XL"].map((v, i) => `<span style="width:52px;height:40px;border-radius:10px;display:grid;place-items:center;font:600 15px Outfit;${i === 1 ? `box-shadow:inset 0 0 0 2px ${ACC};color:${ACC}` : "box-shadow:inset 0 0 0 1px #d6dce6;color:#3b4763"}">${v}</span>`).join("")}</div>
        <div class="row" style="gap:12px;margin-top:22px;align-items:baseline"><span style="height:22px;width:110px;border-radius:7px;background:#e3e7ee"></span><span style="height:30px;width:140px;border-radius:8px;background:#f2b8a6"></span></div>
        <div style="margin-top:22px;height:52px;border-radius:14px;background:${ACC}"></div></div></div>
    ${[["Görsel standartları ve çoklu açı", "images", 50, 170], ["Anahtar kelimeli başlık", "type", 50, 420], ["Pazar yeri reklamları", "megaphone", 900, 150], ["Varyant ve özellik alanları", "list-tree", 900, 380], ["Kampanya ve fiyat", "badge-percent", 900, 560]].map(([t, ic, x, y]) => floatCard(`<div class="row" style="gap:12px"><span style="width:40px;height:40px;border-radius:12px;background:#dff6fa;display:grid;place-items:center">${icon(ic, { size: 20, color: ACC, stroke: 2 })}</span><span style="font:600 17px Outfit;color:#1f2b46;max-width:190px;line-height:1.25">${t}</span></div>`, `left:${x}px;top:${y}px;width:260px`, "14px 16px")).join("")}
    ${floatCard(infoCard("sparkles", "Pazar yerleri", "Ürün sayfası optimizasyonu", ""), "left:880px;top:720px;width:290px", "16px 18px")}`),
  /* 4) E-ticaret altyapıları: Shopify ve ikas, ortaklık rozetleriyle */
  tile(`<div style="position:absolute;left:100px;top:225px;display:grid;gap:56px">${STACKS.map((m) => logoCard(m, 420, 190)).join("")}</div>
    <div style="position:absolute;left:600px;top:250px;width:510px;border-radius:26px;background:#fff;padding:30px 32px;box-shadow:0 60px 100px -40px rgb(1 12 40/.7);font-family:Outfit;color:#0c1a3a">
      ${infoCard("layers", "E-ticaret altyapıları", "Kurulum ve yönetim", "")}
      <div style="margin-top:18px">${checklist([["palette", "Mağaza kurulumu ve tema"], ["credit-card", "Ödeme ve kargo entegrasyonu"], ["boxes", "Ürün, stok ve sipariş yönetimi"], ["chart-no-axes-column", "Günlük yönetim ve raporlama"]])}</div></div>`),
  /* 5-6) E-ticaret vakalarının sonuçları: reklam ve SEO */
  reportTile(TE, ADS, ACC),
  reportTile(TE, ORG, ACC),
];

/* Hero: ortada mağaza, çevresinde pazar yerleri ve altyapılar; bağlantı çizgileri */
export function eticaretHero() {
  const C = [800, 560];
  const spots = [[...MARKETS[0], 330, 290], [...MARKETS[1], 270, 520], [...MARKETS[2], 400, 760], [...MARKETS[3], 1120, 780], [...MARKETS[4], 1290, 560], [...STACKS[0], 1200, 330], [...STACKS[1], 770, 870]];
  const body = `
  ${glow(160, 300, 1280, 700)}
  <div style="position:absolute;left:68px;top:60px">${lockup("E-Ticaret")}</div>
  <svg style="position:absolute;inset:0" width="1600" height="1000">${spots.map(([, , , , x, y]) => `<line x1="${C[0]}" y1="${C[1]}" x2="${x}" y2="${y}" stroke="rgb(159 230 242/.55)" stroke-width="2" stroke-dasharray="6 8"/>`).join("")}</svg>
  <div style="position:absolute;left:${C[0] - 170}px;top:${C[1] - 110}px;width:340px;height:220px;border-radius:30px;background:linear-gradient(160deg,#0d8aa6,#0b4f7a);display:grid;place-items:center;text-align:center;color:#fff;box-shadow:0 0 0 1px rgb(255 255 255/.25),0 60px 100px -40px rgb(0 6 26/.85)"><div>${icon("shopping-bag", { size: 46, color: "#fff", stroke: 1.8 })}<div style="font:600 30px Outfit;margin-top:10px">Mağazanız</div><div style="font:400 17px Outfit;opacity:.85;margin-top:4px">Tek ekip, tüm satış kanalları</div></div></div>
  ${spots.map(([f, name, lh, partner, x, y]) => `<div style="position:absolute;left:${x - 140}px;top:${y - 62}px">${logoCard([f, name, lh * 0.9, partner], 280, 124)}</div>`).join("")}
  ${floatCard(`<div style="font-size:13px;font-weight:600;letter-spacing:.08em;color:${ACC}">PAZAR YERLERİ VE ALTYAPILAR</div><div style="font-size:22px;font-weight:600;margin-top:4px">Resmî iş ortaklıklarımız</div><div class="row" style="gap:8px;margin-top:14px;flex-wrap:wrap">${badge("Shopify Partner", 15)}${badge("ikas İş Ortağı", 15)}${badge("Trendyol Çözüm Ortağı", 15)}</div>`, "left:1010px;top:50px;width:520px")}
  ${grainLayer(0.06)}`;
  return page({ w: 1600, h: 1000, bg: themeBg(TE), body });
}

function eticaretCover() {
  const body = `
  <div style="position:absolute;left:150px;top:560px;width:900px;height:1000px;border-radius:50%;background:radial-gradient(closest-side,${TE.hi}88,transparent);filter:blur(20px)"></div>
  <div style="position:absolute;left:0;right:0;top:96px;display:grid;justify-items:center;text-align:center;color:#fff">
    ${lockup("E-Ticaret", 30)}
    <h1 style="margin-top:40px;font-size:96px;line-height:1.02;font-weight:600;letter-spacing:-.045em">Mağazanız<br><span style="color:${TE.glow}">satışa</span> hazır</h1>
    <p style="margin-top:22px;font-size:28px;color:rgb(255 255 255/.8)">Pazar yerleri ve e-ticaret altyapıları</p>
  </div>
  <div style="position:absolute;left:0;right:0;top:600px;display:grid;grid-template-columns:repeat(2,440px);justify-content:center;gap:44px 36px">${[...MARKETS.slice(0, 4), ...STACKS].map((m) => logoCard(m, 440, 168)).join("")}</div>
  ${grainLayer(0.06)}`;
  return page({ w: 1200, h: 1500, bg: themeBg(TE), body });
}

export const eticaretScenesReal = () => [
  { name: "real-e-ticaret-yonetimi-hero", w: 1600, h: 1000, html: eticaretHero() },
  { name: "real-e-ticaret-yonetimi-kapak", w: 1200, h: 1500, html: eticaretCover() },
  ...tiles().map((html, i) => ({ name: `real-e-ticaret-yonetimi-${i + 1}`, w: 1200, h: 900, html })),
];
