// E-Ticaret v4: BK Collection'ın GERÇEK ürün görselleri (ham ürün fotoğrafı ve mağaza görseli) ve mağaza
// listeleme ekranı; sonuçlarda yalnız e-ticaret vakalarının (Dijital Reklam ve SEO) rakamları.
import { fileUrl, floatCard, grainLayer, icon, page, ROOT, themeBg } from "../lib.mjs";
import { T } from "./common.mjs";
import { floor, glow, lockup } from "./real.mjs";
import { reportTile } from "./reklam.mjs";

const E = (f) => fileUrl(`${ROOT}/tools/gorsel-studyo/kaynak/katalog/eticaret/${f}`);
const LOGO = fileUrl(`${ROOT}/public/references/bk-collection.png`);
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
/* Tarayıcı penceresi: mağaza listeleme ekranı */
const browser = (f, x, y, w, ratio = 543 / 1588, r = 0) => `${floor(x, y + w * ratio + 40, w, 60, 0.55)}<div style="position:absolute;left:${x}px;top:${y}px;width:${w}px;transform:rotate(${r}deg);border-radius:18px;background:#fff;overflow:hidden;box-shadow:0 0 0 1px rgb(255 255 255/.6),0 60px 90px -40px rgb(0 6 26/.8)">
  <div class="row" style="height:44px;padding:0 18px;gap:8px;background:#f1f3f7;border-bottom:1px solid #e4e8ef">${["#ff5f57", "#febc2e", "#28c840"].map((c) => `<span style="width:12px;height:12px;border-radius:50%;background:${c}"></span>`).join("")}<span class="row" style="margin-left:18px;height:28px;flex:1;max-width:60%;border-radius:8px;background:#fff;padding:0 12px;gap:8px;font:13px Outfit;color:#7a849b">${icon("lock", { size: 13, color: "#7a849b", stroke: 2 })}Ürünler</span></div>
  <div style="height:${Math.round(w * ratio)}px;background:#fff url('${E(f)}') 50% 0/100% auto no-repeat"></div></div>`;
const RATIO_ITEM = 458 / 380;
/* Listeleme ekranındaki gerçek ürün adları */
const NAMES = { 1: "Bahçeşehir EST 94 Eşofman Altı 2 İplik Yeni Sezon", 2: "Bahçeşehir Siyah Yaka Kırmızı Logolu Beyaz T-Shirt", 3: "Bahçeşehir Yeni Sezon Sweatshirt", 4: "Bahçeşehir Yeni Sezon Kolej Ceketi 3 İplik %100 Pamuk" };
const nameLabel = (n) => `<span style="font:500 14px/1.35 Outfit;color:#3b4763">${NAMES[n]}</span>`;

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
  /* 2) Aynı ürün: stantta ve modelde */
  tile(`${photo("urun-3.jpg", 90, 250, 400, 540, -3, tag("shirt", "Stant görseli", "#7a849b"), "50% 30%")}${photo("model-sweatshirt.jpg", 530, 140, 420, 690, 3, tag("sparkles", "Model görseli"), "50% 20%")}
    ${floatCard(infoCard("layers", "Ürün görseli", "Aynı ürün, iki vitrin görseli", "Bahçeşehir Yeni Sezon Sweatshirt"), "left:60px;top:50px;width:470px")}`),
  /* 3) Mağaza listeleme ekranı */
  tile(`${browser("listeleme.jpg", 60, 270, 1080)}
    ${floatCard(infoCard("store", "Mağaza vitrini", "İndirim rozetli ürün listesi", "", true), "left:60px;top:56px;width:440px")}`),
  /* 4) Ürün kartları ve kampanya fiyatı */
  tile(`${[1, 2, 4].map((n, i) => photo(`urun-${n}.jpg`, 50 + i * 238, 320 + (i % 2) * 30, 226, 226 * RATIO_ITEM + 70, [-4, 2, -2][i], nameLabel(n), "50% 0")).join("")}
    ${photo("urun-3.jpg", 770, 190, 360, 360 * RATIO_ITEM + 64, 3, nameLabel(3), "50% 0")}
    ${floatCard(`<div style="font-size:13px;font-weight:600;letter-spacing:.08em;color:${ACC}">KAMPANYA FİYATI</div><div class="row" style="gap:14px;margin-top:8px;align-items:baseline"><span style="font-size:24px;color:#8a93a8;text-decoration:line-through">2.400 TL</span><span style="font-size:44px;font-weight:600;letter-spacing:-.02em;color:#d6403a">1.199 TL</span></div><div style="margin-top:6px;font-size:15px;color:#3b4763">Bahçeşehir Yeni Sezon Sweatshirt · %50 indirim</div>`, "left:70px;top:70px;width:470px", "22px 26px")}`),
  /* 5-6) E-ticaret vakalarının sonuçları: reklam ve SEO */
  reportTile(TE, ADS, ACC),
  reportTile(TE, ORG, ACC),
];

export function eticaretHero() {
  const body = `
  ${glow(160, 300, 1280, 700)}
  <div style="position:absolute;left:68px;top:60px">${lockup("E-Ticaret")}</div>
  ${browser("listeleme.jpg", 70, 250, 1000, 543 / 1588, -1.5)}
  ${photo("model-ceket.jpg", 1110, 300, 400, 560, 3, tag("sparkles", "Mağaza görseli"), "50% 20%")}
  ${photo("ham-ceket.jpg", 760, 650, 300, 250, -4, tag("camera", "Ham fotoğraf", "#7a849b"))}
  ${floatCard(infoCard("shopping-cart", "E-ticaret", "Ürün görselleri ve mağaza vitrini", "", true), "left:1060px;top:60px;width:440px")}
  ${grainLayer(0.06)}`;
  return page({ w: 1600, h: 1000, bg: themeBg(TE), body });
}

function eticaretCover() {
  const body = `
  <div style="position:absolute;left:150px;top:560px;width:900px;height:1000px;border-radius:50%;background:radial-gradient(closest-side,${TE.hi}88,transparent);filter:blur(20px)"></div>
  <div style="position:absolute;left:0;right:0;top:96px;display:grid;justify-items:center;text-align:center;color:#fff">
    ${lockup("E-Ticaret", 30)}
    <h1 style="margin-top:40px;font-size:96px;line-height:1.02;font-weight:600;letter-spacing:-.045em">Mağazanız<br><span style="color:${TE.glow}">satışa</span> hazır</h1>
    <p style="margin-top:22px;font-size:28px;color:rgb(255 255 255/.8)">Ürün fotoğrafından vitrine</p>
  </div>
  ${photo("ham-ceket.jpg", 70, 760, 420, 360, -5, tag("camera", "Ham fotoğraf", "#7a849b"))}
  ${photo("model-ceket.jpg", 560, 640, 560, 760, 3, tag("sparkles", "Mağaza görseli"), "50% 20%")}
  ${grainLayer(0.06)}`;
  return page({ w: 1200, h: 1500, bg: themeBg(TE), body });
}

export const eticaretScenesReal = () => [
  { name: "real-e-ticaret-yonetimi-hero", w: 1600, h: 1000, html: eticaretHero() },
  { name: "real-e-ticaret-yonetimi-kapak", w: 1200, h: 1500, html: eticaretCover() },
  ...tiles().map((html, i) => ({ name: `real-e-ticaret-yonetimi-${i + 1}`, w: 1200, h: 900, html })),
];
