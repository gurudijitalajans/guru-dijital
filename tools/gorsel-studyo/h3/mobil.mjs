// Mobil Uygulama v4: Guru Panel telefona uygulama olarak kurulur (PWA, public/panel.webmanifest). Ekranlar
// panelin GERÇEK mobil görüntüleri; ana ekran ve mağaza sayfaları TEMSİLİ (Apple/Google logosu, puan,
// indirme sayısı, yorum yok).
import { fileUrl, floatCard, grainLayer, icon, iphone, page, ROOT, themeBg } from "../lib.mjs";
import { T } from "./common.mjs";
import { floor, glow, lockup } from "./real.mjs";

const Y = (f) => fileUrl(`${ROOT}/tools/gorsel-studyo/kaynak/katalog/yazilim/${f}.jpg`);
const ICON = fileUrl(`${ROOT}/public/panel-app/icon-512.png`);
const MARK = fileUrl(`${ROOT}/public/brand/mark-white.svg`);
const TM = T["mobil-uygulama"];
const ACC = "#4b5be0";
const shot = (f) => `<div style="width:390px;height:844px;background:#fff url('${Y(f)}') 50% 0/100% auto no-repeat"></div>`;
const status = (c = "#fff") => `<div class="row" style="height:54px;padding:0 30px;justify-content:space-between;font:600 16px Outfit;color:${c}"><span>9:41</span><span class="row" style="gap:6px">${icon("signal", { size: 16, color: c, stroke: 2.4 })}${icon("wifi", { size: 16, color: c, stroke: 2.4 })}${icon("battery-full", { size: 21, color: c, stroke: 2 })}</span></div>`;
const phoneAt = (screen, x, y, w, r = 0) => `${floor(x - 10, y + w * 2.0 - 34, w + 20, 54, 0.5)}<div style="position:absolute;left:${x}px;top:${y}px;transform:rotate(${r}deg)">${iphone(screen, { width: w, style: "filter:drop-shadow(0 46px 46px rgb(0 6 26/.55))" })}</div>`;
const tempNote = `<div class="row" style="gap:7px;margin-top:12px;font-size:13px;color:#7a849b">${icon("info", { size: 14, color: "#7a849b", stroke: 2 })}Temsili görsel</div>`;
const card = (ic, kind, title, desc = "", note = false) => `<div class="row" style="gap:14px"><span style="width:50px;height:50px;border-radius:15px;background:#eceeff;display:grid;place-items:center">${icon(ic, { size: 25, color: ACC, stroke: 2 })}</span>
   <div><div style="font-size:13px;font-weight:600;letter-spacing:.08em;color:${ACC}">${kind.toLocaleUpperCase("tr-TR")}</div><div style="font-size:22px;font-weight:600;margin-top:2px;line-height:1.2">${title}</div></div></div>
   ${desc ? `<div style="margin-top:12px;font-size:16px;color:#3b4763;line-height:1.4">${desc}</div>` : ""}${note ? tempNote : ""}`;
const tile = (body) => page({ w: 1200, h: 900, bg: themeBg(TM), body: `${glow(80, 220, 1040, 640)}${body}${grainLayer(0.06)}` });

/* Ana ekran (temsili): adsız yer tutucu simgeler, ortada Guru Panel */
const homeScreen = () => {
  const tiles = ["#5b8def", "#f2a541", "#56c27a", "#e76f8a", "#8c6cf0", "#3cbfd4", "#f07b4f", "#9aa7c2", "#61a0ff", "#c26cf0", "#4cc38a", "#f5c04a"];
  const ph = (c) => `<div style="display:grid;justify-items:center;gap:7px"><div style="width:62px;height:62px;border-radius:15px;background:linear-gradient(160deg,${c},${c}bb);opacity:.9"></div><div style="width:44px;height:7px;border-radius:4px;background:rgb(255 255 255/.45)"></div></div>`;
  return `<div style="width:390px;height:844px;position:relative;overflow:hidden;background:radial-gradient(90% 60% at 20% 0%,#3a4fd6 0%,transparent 60%),radial-gradient(80% 60% at 100% 100%,#1aa9c4 0%,transparent 55%),linear-gradient(180deg,#141c6b,#0a1145);font-family:Outfit">
    ${status()}
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:26px 0;padding:26px 18px 0">${tiles.slice(0, 5).map(ph).join("")}
      <div style="display:grid;justify-items:center;gap:7px"><img src="${ICON}" style="width:62px;height:62px;border-radius:15px;box-shadow:0 0 0 3px rgb(255 255 255/.85),0 10px 24px rgb(0 0 0/.35)"><div style="font:500 12.5px Outfit;color:#fff;text-shadow:0 1px 3px rgb(0 0 0/.4)">Guru Panel</div></div>
      ${tiles.slice(5, 12).map(ph).join("")}</div>
    <div style="position:absolute;left:14px;right:14px;bottom:18px;height:92px;border-radius:32px;background:rgb(255 255 255/.22);backdrop-filter:blur(20px);display:flex;justify-content:space-around;align-items:center">${["#5b8def", "#56c27a", "#f2a541", "#8c6cf0"].map((c) => `<div style="width:62px;height:62px;border-radius:15px;background:${c};opacity:.85"></div>`).join("")}</div>
  </div>`;
};
/* Açılış ekranı: manifest'teki zemin rengi ve simge */
const splash = () => `<div style="width:390px;height:844px;background:#011441;display:grid;place-items:center;position:relative">${status()}<div style="position:absolute;inset:0;display:grid;place-items:center"><div style="display:grid;justify-items:center;gap:22px"><img src="${ICON}" style="width:120px;height:120px;border-radius:28px"><div style="font:600 22px Outfit;color:#fff">Guru Panel</div></div></div></div>`;
/* Mağaza sayfası (temsili, iki düzen); puan/indirme/yorum yok */
const storeA = () => `<div style="width:390px;height:844px;background:#fff;font-family:Outfit;color:#111;position:relative;overflow:hidden">${status("#111")}
  <div class="row" style="padding:4px 16px 0;color:${ACC};font-size:16px;gap:4px">${icon("chevron-left", { size: 22, color: ACC, stroke: 2.4 })}Ara</div>
  <div class="row" style="gap:16px;padding:16px 18px 0;align-items:flex-start"><img src="${ICON}" style="width:112px;height:112px;border-radius:26px;box-shadow:0 0 0 1px #eee"><div style="flex:1;padding-top:6px"><div style="font-size:23px;font-weight:600">Guru Panel</div><div style="font-size:15px;color:#888;margin-top:2px">Guru Dijital</div><div class="row" style="justify-content:space-between;margin-top:18px"><span style="height:32px;padding:0 22px;border-radius:999px;background:${ACC};color:#fff;font:600 15px Outfit;display:grid;place-items:center">Yükle</span>${icon("share", { size: 22, color: ACC, stroke: 2 })}</div></div></div>
  <div class="row" style="margin:22px 18px 0;padding:12px 0;border-top:1px solid #eee;border-bottom:1px solid #eee;justify-content:space-around;font-size:13px;color:#888;text-align:center">${[["KATEGORİ", "İş"], ["DİL", "TR"], ["GELİŞTİRİCİ", "Guru"]].map(([a, b]) => `<div><div style="font-size:11px;letter-spacing:.04em">${a}</div><div style="font-size:18px;font-weight:600;color:#555;margin-top:4px">${b}</div></div>`).join("")}</div>
  <div class="row" style="gap:12px;padding:18px 18px 0;overflow:hidden">${["ozet-m", "firsatlar-m", "gorevler-m"].map((f) => `<div style="flex-shrink:0;width:150px;height:325px;border-radius:18px;background:#f4f5fb url('${Y(f)}') 50% 0/100% auto;box-shadow:0 0 0 1px #e7e9f2"></div>`).join("")}</div>
  <div style="padding:18px 18px 0;font-size:15px;line-height:1.45;color:#333">Satış, operasyon, sohbet ve raporlar tek panelde.</div></div>`;
const storeB = () => `<div style="width:390px;height:844px;background:#fff;font-family:Outfit;color:#1f1f1f;position:relative;overflow:hidden">${status("#1f1f1f")}
  <div class="row" style="padding:6px 18px 0;justify-content:space-between">${icon("arrow-left", { size: 22, color: "#444", stroke: 2 })}<span class="row" style="gap:18px">${icon("search", { size: 21, color: "#444", stroke: 2 })}${icon("ellipsis-vertical", { size: 21, color: "#444", stroke: 2 })}</span></div>
  <div class="row" style="gap:18px;padding:20px 22px 0"><img src="${ICON}" style="width:76px;height:76px;border-radius:18px;box-shadow:0 1px 4px rgb(0 0 0/.18)"><div><div style="font-size:24px;font-weight:600">Guru Panel</div><div style="font-size:15px;color:#1a7f5a;margin-top:2px;font-weight:500">Guru Dijital</div></div></div>
  <div style="margin:22px 22px 0;height:44px;border-radius:12px;background:#1a7f5a;color:#fff;display:grid;place-items:center;font:600 16px Outfit">Yükle</div>
  <div class="row" style="gap:10px;padding:20px 22px 0;overflow:hidden">${["teklifler-m", "ekip-yuku-m", "takvim-m"].map((f) => `<div style="flex-shrink:0;width:140px;height:300px;border-radius:12px;background:#f4f5fb url('${Y(f)}') 50% 0/100% auto;box-shadow:0 0 0 1px #e7e9f2"></div>`).join("")}</div>
  <div style="padding:20px 22px 0"><div style="font-size:19px;font-weight:600">Uygulama hakkında</div><div style="margin-top:8px;font-size:15px;line-height:1.45;color:#444">Satış, operasyon, sohbet ve raporlar tek panelde.</div></div>
  <div class="row" style="gap:8px;padding:14px 22px 0">${["İş", "Verimlilik"].map((c) => `<span style="height:32px;padding:0 14px;border-radius:9px;box-shadow:inset 0 0 0 1px #d6d9e0;font-size:14px;display:grid;place-items:center;color:#444">${c}</span>`).join("")}</div></div>`;
/* Mağaza görseli seti: başlık + ekran */
const promo = (title, f, bg) => `<div style="width:300px;height:620px;border-radius:30px;overflow:hidden;background:${bg};position:relative;box-shadow:0 40px 70px -30px rgb(0 6 26/.7)">
  <div style="padding:34px 26px 0;font:600 30px/1.12 Outfit;color:#fff;letter-spacing:-.02em">${title}</div>
  <div style="position:absolute;left:38px;top:150px">${iphone(shot(f), { width: 224 })}</div></div>`;

const STEPS = [["search", "Keşif", "İhtiyaç ve kapsam"], ["pen-tool", "Tasarım", "Ekranlar ve akış"], ["code", "Geliştirme", "Uygulama ve panel"], ["bug", "Test", "Cihazlarda deneme"], ["rocket", "Mağaza yayını", "App Store ve Google Play"]];

const tiles = () => [
  /* 1) Ana ekranda Guru Panel */
  tile(`${phoneAt(homeScreen(), 140, 110, 330, -4)}
    ${floatCard(card("smartphone", "Kurulum", "Ana ekranda Guru Panel", "Telefona uygulama olarak eklenir; kendi simgesiyle, tam ekran açılır"), "left:600px;top:330px;width:500px")}`),
  /* 2) Açılış ve uygulama ekranları */
  tile(`${phoneAt(splash(), 70, 150, 290, -6)}${phoneAt(shot("ozet-m"), 400, 110, 300, 0)}${phoneAt(shot("gorevler-m"), 740, 150, 290, 6)}
    ${floatCard(card("layout-dashboard", "Uygulama", "Açılış ekranı ve tam ekran uygulama"), "left:70px;top:48px;width:470px")}`),
  /* 3) Mağaza sayfası, birinci düzen (temsili) */
  tile(`${phoneAt(storeA(), 160, 100, 340, -3)}
    ${floatCard(card("store", "Mağaza sayfası", "Uygulama mağazası görünümü", "Simge, ekran görüntüleri ve açıklama", true), "left:620px;top:320px;width:460px")}`),
  /* 4) Mağaza sayfası, ikinci düzen (temsili) */
  tile(`${phoneAt(storeB(), 700, 100, 340, 3)}
    ${floatCard(card("store", "Mağaza sayfası", "İki mağaza, iki düzen", "Her mağazanın kendi ölçülerinde görsel seti", true), "left:90px;top:320px;width:460px")}`),
  /* 5) Mağaza görseli seti */
  tile(`<div class="row" style="position:absolute;left:0;right:0;top:170px;gap:28px;justify-content:center">${[["Satış hattınız cebinizde", "firsatlar-m", "linear-gradient(170deg,#3646c0,#0b1250)"], ["Görevler tek panoda", "gorevler-m", "linear-gradient(170deg,#1747a8,#011441)"], ["Ekip yükü bir bakışta", "ekip-yuku-m", "linear-gradient(170deg,#0b4f7a,#011a3d)"]].map(([t, f, bg]) => promo(t, f, bg)).join("")}</div>
    ${floatCard(card("images", "Mağaza görselleri", "Ekran görüntüsü seti", "", true), "left:60px;top:40px;width:420px")}`),
  /* 6) Süreç */
  tile(`<div style="position:absolute;left:70px;top:50%;transform:translateY(-50%);width:1060px;border-radius:30px;background:#fff;box-shadow:0 60px 100px -40px rgb(1 12 40/.7);font-family:Outfit;color:#0c1a3a;padding:42px 46px">
    ${card("route", "Süreç", "Fikirden mağazaya beş adım")}
    <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:14px;margin-top:32px">${STEPS.map(([ic, t, d], i) => `<div style="border-radius:20px;background:${i === 4 ? "#eceeff" : "#f4f6fd"};padding:22px 18px;min-height:200px;${i === 4 ? `box-shadow:inset 0 0 0 2px ${ACC}` : ""}"><div style="font-size:14px;font-weight:600;color:${ACC}">${i + 1}</div><div style="margin-top:12px">${icon(ic, { size: 30, color: "#0b1250", stroke: 1.8 })}</div><div style="margin-top:14px;font-size:20px;font-weight:600">${t}</div><div style="margin-top:6px;font-size:15px;color:#5a6680;line-height:1.35">${d}</div></div>`).join("")}</div></div>`),
];

export function mobilHero() {
  const body = `
  ${glow(160, 300, 1280, 700)}
  <div style="position:absolute;left:68px;top:60px">${lockup("Mobil Uygulama")}</div>
  ${phoneAt(homeScreen(), 230, 240, 300, -7)}${phoneAt(shot("ozet-m"), 600, 170, 330, 0)}${phoneAt(storeA(), 1000, 240, 300, 7)}
  ${floatCard(card("smartphone", "Kendi uygulamamız", "Guru Panel telefonda", "Ana ekrana kurulur, tam ekran çalışır"), "left:1060px;top:60px;width:450px")}
  ${grainLayer(0.06)}`;
  return page({ w: 1600, h: 1000, bg: themeBg(TM), body });
}

function mobilCover() {
  const body = `
  <div style="position:absolute;left:150px;top:560px;width:900px;height:1000px;border-radius:50%;background:radial-gradient(closest-side,${TM.hi}88,transparent);filter:blur(20px)"></div>
  <div style="position:absolute;left:0;right:0;top:96px;display:grid;justify-items:center;text-align:center;color:#fff">
    ${lockup("Mobil Uygulama", 30)}
    <h1 style="margin-top:40px;font-size:96px;line-height:1.02;font-weight:600;letter-spacing:-.045em">Cebinizdeki<br><span style="color:${TM.glow}">markanız</span></h1>
  </div>
  ${[[homeScreen(), 110, 700, -7], [splash(), 435, 640, 0], [shot("gorevler-m"), 760, 700, 7]].map(([sc, x, y, r]) => `<div style="position:absolute;left:${x}px;top:${y}px;transform:rotate(${r}deg)">${iphone(sc, { width: 330, style: "filter:drop-shadow(0 50px 60px rgb(0 6 26/.6))" })}</div>`).join("")}
  ${grainLayer(0.06)}`;
  return page({ w: 1200, h: 1500, bg: themeBg(TM), body });
}

export const mobilScenesReal = () => [
  { name: "real-mobil-uygulama-hero", w: 1600, h: 1000, html: mobilHero() },
  { name: "real-mobil-uygulama-kapak", w: 1200, h: 1500, html: mobilCover() },
  ...tiles().map((html, i) => ({ name: `real-mobil-uygulama-${i + 1}`, w: 1200, h: 900, html })),
];
