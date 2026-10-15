// Ödül kartı görselleri (1600x1131): katalog PSD'lerinden ayrılan kupa ve Partner logosu,
// sitenin lacivert ışık diliyle; görselde yazı yok (başlık ve açıklama kartta).
import { asset, glow, grainLayer, page, ROOT } from "./common.mjs";

const K = (f) => asset(`${ROOT}/tools/gorsel-studyo/kaynak/katalog/${f}`);
const navy = `background-color:#011441;background-image:radial-gradient(60% 50% at 50% 112%, rgb(61 139 242 / .55) 0%, rgb(23 71 168 / .3) 45%, transparent 75%),radial-gradient(45% 45% at 0% 100%, rgb(159 210 255 / .28) 0%, transparent 70%),conic-gradient(from 180deg at 104% -4%, #1747a8 0deg, #011441 14deg, #011441 34deg, #1747a8 39deg, #3d8bf2 41deg, #d9efff 42.6deg, #9fd2ff 45deg, #3d8bf2 50deg, #1747a8 58deg, #011441 72deg, #011441 90deg);`;

export const awardScenes = () => [
  {
    name: "odul2-partner",
    w: 1600,
    h: 1131,
    html: page({
      w: 1600,
      h: 1131,
      bg: navy,
      body: `
      ${glow(300, 180, 1000, 800, "rgb(120 180 255 / .35)")}
      <div class="abs" style="left:50%;top:50%;width:780px;height:560px;transform:translate(-50%,-58%);border-radius:48px;background:linear-gradient(160deg,#ffffff,#eef4ff);box-shadow:0 0 0 1px rgb(255 255 255/.7),0 80px 140px -50px rgb(0 6 26/.85),0 30px 60px -30px rgb(0 6 26/.5);display:grid;place-items:center">
        <img src="${K("google-partner-logo.png")}" style="width:580px;display:block">
      </div>
      <div class="abs" style="left:50%;top:860px;transform:translateX(-50%);display:flex;gap:14px">
        ${["2025", "2026"].map((y) => `<span style="height:58px;padding:0 28px;border-radius:999px;background:rgb(255 255 255/.12);box-shadow:inset 0 0 0 1.5px rgb(255 255 255/.28);color:#fff;font:600 26px Outfit;display:grid;place-items:center">${y}</span>`).join("")}
      </div>
      ${grainLayer(0.05)}`,
    }),
  },
  {
    name: "odul2-impact",
    w: 1600,
    h: 1131,
    html: page({
      w: 1600,
      h: 1131,
      bg: navy,
      body: `
      ${glow(420, 120, 760, 900, "rgb(160 210 255 / .45)")}
      <div class="abs" style="left:50%;bottom:120px;width:640px;height:90px;transform:translateX(-46%);border-radius:50%;background:radial-gradient(closest-side,rgb(0 6 26/.75),transparent);filter:blur(8px)"></div>
      <img class="abs" src="${K("kupa-impact-awards.png")}" style="left:50%;top:70px;height:960px;transform:translateX(-50%);filter:drop-shadow(0 50px 60px rgb(0 6 26/.6))">
      ${grainLayer(0.05)}`,
    }),
  },
];

/* Hakkımızda mozaiği: dikey karo (kimlik seti, lacivert zeminde, Photoshop gölgeleriyle) */
export const aboutScenes = () => [
  {
    name: "hakk2-kimlik",
    w: 1000,
    h: 1600,
    html: page({
      w: 1000,
      h: 1600,
      bg: navy,
      body: `${glow(60, 300, 900, 1100, "rgb(120 180 255 / .32)")}
      <img class="abs" src="${K("kimlik-self-respect.png")}" style="left:50%;top:50%;width:900px;transform:translate(-50%,-50%)">
      ${grainLayer(0.04)}`,
    }),
  },
];

/* Web Tasarım kapağı (4:5): iki gerçek site, katalog laptop mockup'ında (Photoshop çıktısı) */
export const webCoverScenes = () => [
  {
    name: "kat-web-tasarim-kapak",
    w: 1200,
    h: 1500,
    html: page({
      w: 1200,
      h: 1500,
      bg: navy,
      body: `${glow(100, 500, 1000, 900, "rgb(120 180 255 / .3)")}
      <div class="abs" style="left:0;right:0;top:96px;text-align:center;color:#fff">
        <div style="display:inline-flex;align-items:center;height:52px;padding:0 24px;border-radius:999px;background:rgb(255 255 255/.1);box-shadow:inset 0 0 0 1px rgb(255 255 255/.2);font:500 24px Outfit">Web Tasarım</div>
        <h1 style="font:600 92px/1.02 Outfit;letter-spacing:-.045em;margin-top:30px">Markanızın<br><span style="color:#9fd2ff">dijital</span> yüzü</h1>
      </div>
      ${[["laptop-askahotels.jpg", 560], ["laptop-esdoinsaat.jpg", 1010]].map(([f, y]) => `<div class="abs" style="left:60px;top:${y}px;width:1080px;height:440px;border-radius:28px;overflow:hidden;box-shadow:0 50px 90px -40px rgb(0 6 26/.8)"><div style="width:100%;height:100%;background:#1c1c1c url('${K(f)}') 58% 62%/150% auto no-repeat"></div></div>`).join("")}
      ${grainLayer(0.04)}`,
    }),
  },
];

/* Web Tasarım karoları (4:3): laptop çıktısı alta, üstte alan adı ve sektör */
const SITES = [
  ["askahotels", "askahotels.com", "Otel"],
  ["secengross", "secengross.com", "Perakende"],
  ["esdoinsaat", "esdoinsaat.com", "İnşaat"],
  ["ekoda", "ekoda.com.tr", "Depolama"],
  ["usreokullari", "usreokullari.com", "Eğitim"],
  ["rimasis", "rimasis.com", "Mühendislik"],
];
export const webTileScenes = () =>
  SITES.map(([f, domain, sector], i) => ({
    name: `kat-web-tasarim-${i + 1}`,
    w: 1200,
    h: 900,
    html: page({
      w: 1200,
      h: 900,
      bg: "background:#1c1c1c;",
      body: `<div class="abs" style="left:0;top:0;width:1200px;height:900px;background:url('${K(`laptop-${f}.jpg`)}') 52% 100%/1500px auto no-repeat"></div>
      <div class="abs" style="left:0;right:0;top:0;height:260px;background:linear-gradient(180deg,#1c1c1c 40%,rgb(28 28 28/0))"></div>
      <div class="abs row" style="left:56px;top:52px;gap:14px">
        <span style="display:inline-flex;align-items:center;gap:10px;height:52px;padding:0 22px;border-radius:999px;background:rgb(255 255 255/.08);box-shadow:inset 0 0 0 1px rgb(255 255 255/.16);color:#fff;font:500 22px Outfit"><span style="width:9px;height:9px;border-radius:50%;background:#34d399"></span>${domain}</span>
        <span style="font:500 20px Outfit;color:rgb(255 255 255/.55)">${sector}</span>
      </div>
      ${grainLayer(0.03)}`,
    }),
  }));
