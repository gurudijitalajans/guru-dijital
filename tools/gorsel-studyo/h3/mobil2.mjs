// Mobil Uygulama v5 (örnek kareler): "tek kod tabanı, iki mağaza, sorunsuz yayın". Markasız tek örnek uygulama
// (stüdyo randevu ve üyelik), iPhone ve Android'de; resmî mağaza rozetleri ve teknoloji logoları (Wikimedia
// Commons, kaynak/katalog/mobil/logo). Puan, indirme sayısı, yorum yok; ekranlar "Temsili arayüz".
import { fileUrl, grainLayer, icon, iphone, page, ROOT, themeBg } from "../lib.mjs";
import { T } from "./common.mjs";
import { floor, glow, lockup } from "./real.mjs";

const L = (f) => fileUrl(`${ROOT}/tools/gorsel-studyo/kaynak/katalog/mobil/logo/${f}.svg`);
const TM = T["mobil-uygulama"];
const ACC = "#4b5be0";
const INK = "#101523";
/* Örnek uygulamanın kendi rengi: lacivert zeminde öne çıkan sıcak mercan */
const APP = "#ff6a3d";
const APP2 = "#ff9a62";
const logoImg = (f, h, extra = "") => `<img src="${L(f)}" style="height:${h}px;width:auto;display:block;${extra}">`;

/* ---------- Örnek uygulama: stüdyo randevu ve üyelik (markasız) ---------- */
const art = (a, b, c) => `background:radial-gradient(60% 70% at 78% 18%,${c} 0%,transparent 60%),radial-gradient(70% 80% at 10% 100%,${b} 0%,transparent 65%),linear-gradient(150deg,${a},${b})`;
const CLASSES = [
  ["Reformer Pilates", "18:30 · 50 dk", "3 yer", art("#ff8a5c", "#e8452d", "#ffd2a8")],
  ["Yoga Flow", "19:45 · 60 dk", "6 yer", art("#7b8cff", "#4351d6", "#c9d0ff")],
  ["Mobilite", "20:00 · 40 dk", "Dolu", art("#4fd1b5", "#1e9c88", "#c4f5ea")],
];
const DAYS = [["Pzt", 13], ["Sal", 14], ["Çar", 15], ["Per", 16], ["Cum", 17], ["Cmt", 18], ["Paz", 19]];
const ring = (pct, d, w, c, track) => {
  const r = (d - w) / 2, C = 2 * Math.PI * r;
  return `<svg width="${d}" height="${d}" style="transform:rotate(-90deg)"><circle cx="${d / 2}" cy="${d / 2}" r="${r}" fill="none" stroke="${track}" stroke-width="${w}"/><circle cx="${d / 2}" cy="${d / 2}" r="${r}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-dasharray="${(C * pct).toFixed(1)} ${C.toFixed(1)}"/></svg>`;
};
function appScreen(os) {
  const ios = os === "ios";
  const bar = ios
    ? `<div class="row" style="height:54px;padding:0 30px;justify-content:space-between;font:600 16px Outfit"><span>9:41</span><span class="row" style="gap:6px">${icon("signal", { size: 15, stroke: 2.4 })}${icon("wifi", { size: 15, stroke: 2.4 })}${icon("battery-full", { size: 21, stroke: 2 })}</span></div>`
    : `<div class="row" style="height:40px;padding:0 24px;justify-content:space-between;font:500 14px Outfit"><span>9:41</span><span class="row" style="gap:6px">${icon("wifi", { size: 15, stroke: 2.4 })}${icon("signal", { size: 15, stroke: 2.4 })}${icon("battery-full", { size: 19, stroke: 2 })}</span></div>`;
  const head = `<div class="row" style="padding:${ios ? 6 : 12}px 22px 0;gap:12px">
      <div><div style="font-size:14.5px;color:#7b8194">Perşembe, 16 Ekim</div><div style="font-size:${ios ? 30 : 26}px;font-weight:${ios ? 700 : 600};letter-spacing:-.025em;margin-top:2px">Günaydın</div></div>
      <span style="margin-left:auto;width:46px;height:46px;border-radius:50%;background:linear-gradient(150deg,${APP2},${APP});display:grid;place-items:center;color:#fff;font:600 16px Outfit;box-shadow:0 8px 18px -8px ${APP}">DA</span></div>`;
  const next = `<div style="margin:18px 18px 0;border-radius:26px;padding:20px;${art("#2a2f45", "#141826", "#ff6a3d55")};color:#fff;position:relative;overflow:hidden">
      <div class="row" style="gap:16px">
        <div style="position:relative;width:76px;height:76px;flex-shrink:0">${ring(5 / 8, 76, 8, APP, "rgb(255 255 255/.14)")}<div style="position:absolute;inset:0;display:grid;place-items:center;text-align:center;line-height:1"><div><div style="font-size:21px;font-weight:700">5/8</div><div style="font-size:10.5px;color:rgb(255 255 255/.6);margin-top:3px">ders</div></div></div></div>
        <div style="min-width:0"><div style="font-size:12.5px;font-weight:600;letter-spacing:.06em;color:${APP2}">SIRADAKİ DERSİN</div><div style="font-size:21px;font-weight:600;margin-top:4px;line-height:1.15">Reformer Pilates</div><div style="font-size:14px;color:rgb(255 255 255/.66);margin-top:4px">Bugün 18:30 · Stüdyo 2</div></div></div>
      <div class="row" style="gap:10px;margin-top:16px"><span style="flex:1;height:42px;border-radius:14px;background:${APP};display:grid;place-items:center;font:600 15px Outfit">Giriş kartı</span><span style="width:42px;height:42px;border-radius:14px;background:rgb(255 255 255/.12);display:grid;place-items:center">${icon("map-pin", { size: 19, color: "#fff", stroke: 2 })}</span></div></div>`;
  const week = `<div class="row" style="gap:6px;padding:18px 18px 0">${DAYS.map(([d, n], i) => `<div style="flex:1;height:64px;border-radius:18px;display:grid;place-items:center;align-content:center;gap:3px;${i === 3 ? `background:${INK};color:#fff` : "background:#f3f4f8;color:#5b6274"}"><span style="font-size:11.5px">${d}</span><span style="font-size:17px;font-weight:600">${n}</span></div>`).join("")}</div>`;
  const list = `<div class="row" style="padding:20px 20px 10px;justify-content:space-between"><span style="font-size:18px;font-weight:600">Bu akşam</span><span style="font-size:14px;color:${APP};font-weight:600">Tümü</span></div>
    <div style="display:grid;gap:10px;padding:0 18px">${CLASSES.map(([n, t, s, bg]) => `<div class="row" style="gap:14px;padding:10px;border-radius:20px;background:#f6f7fa"><span style="width:62px;height:62px;border-radius:16px;${bg};flex-shrink:0;box-shadow:inset 0 0 0 1px rgb(255 255 255/.25)"></span><div style="flex:1;min-width:0"><div style="font-size:16px;font-weight:600">${n}</div><div style="font-size:13.5px;color:#7b8194;margin-top:2px">${t}</div></div><span style="height:30px;padding:0 12px;border-radius:999px;font:600 12.5px Outfit;display:grid;place-items:center;${s === "Dolu" ? "background:#eceef3;color:#8a90a2" : `background:#fff1ec;color:${APP}`}">${s}</span></div>`).join("")}</div>`;
  const tabs = [["house", "Bugün"], ["calendar-days", "Takvim"], ["ticket", "Üyelik"], ["user-round", "Profil"]];
  const nav = ios
    ? `<div class="row" style="position:absolute;left:0;right:0;bottom:0;height:88px;padding:10px 20px 28px;background:rgb(250 250 252/.94);backdrop-filter:blur(20px);box-shadow:0 -1px 0 #eceef3;justify-content:space-around">${tabs.map(([ic, t], i) => `<div style="display:grid;justify-items:center;gap:3px;font-size:11px;font-weight:500;color:${i ? "#9097a8" : APP}">${icon(ic, { size: 25, color: i ? "#9097a8" : APP, stroke: 2 })}${t}</div>`).join("")}</div>`
    : `<div class="row" style="position:absolute;left:0;right:0;bottom:0;height:86px;padding:12px 10px 22px;background:#f4f2f6;justify-content:space-around">${tabs.map(([ic, t], i) => `<div style="display:grid;justify-items:center;gap:4px;font-size:12px;font-weight:${i ? 500 : 600};color:${i ? "#4e5464" : INK}"><span style="width:64px;height:32px;border-radius:16px;display:grid;place-items:center;background:${i ? "transparent" : "#ffe3d8"}">${icon(ic, { size: 22, color: i ? "#4e5464" : "#c2401c", stroke: 2 })}</span>${t}</div>`).join("")}</div>`;
  return `<div style="width:390px;height:844px;background:#fff;font-family:Outfit;color:${INK};position:relative;overflow:hidden">${bar}${head}${next}${week}${list}${nav}</div>`;
}

/* Android çerçevesi: ince düz kenar, ortada kamera deliği */
function android(screen, { width = 330, style = "" } = {}) {
  const frame = width * 0.02, bez = width * 0.026;
  const inner = width - (frame + bez) * 2;
  const s = inner / 390;
  const R = width * 0.1;
  return `<div style="position:relative;width:${width}px;${style}">
    <div style="padding:${frame}px;border-radius:${R}px;background:linear-gradient(135deg,#7a808b,#2a2d33 30%,#41464f 70%,#868c97);box-shadow:inset 0 0 0 1px rgb(255 255 255/.2)">
      <div style="padding:${bez}px;border-radius:${R - frame}px;background:#07080a">
        <div style="position:relative;width:${inner}px;height:${844 * s}px;overflow:hidden;border-radius:${R - frame - bez}px;background:#fff">
          <div style="width:390px;height:844px;transform:scale(${s});transform-origin:0 0">${screen}</div>
          <div style="position:absolute;left:50%;top:${inner * 0.022}px;transform:translateX(-50%);width:${inner * 0.04}px;height:${inner * 0.04}px;border-radius:50%;background:#07080a;box-shadow:0 0 0 2px #1a1c20"></div>
          <div style="position:absolute;inset:0;background:linear-gradient(118deg,rgb(255 255 255/.12) 0%,rgb(255 255 255/0) 28%)"></div>
        </div></div></div>
    <span style="position:absolute;right:${-width * 0.009}px;top:${width * 0.38}px;width:${width * 0.013}px;height:${width * 0.16}px;border-radius:2px;background:#5a5f68"></span>
    <span style="position:absolute;right:${-width * 0.009}px;top:${width * 0.6}px;width:${width * 0.013}px;height:${width * 0.09}px;border-radius:2px;background:#5a5f68"></span></div>`;
}

/* Cam kart (koyu zeminde yarı saydam beyaz) ve beyaz kart */
const glass = (html, style, pad = "18px 20px") => `<div style="position:absolute;${style};padding:${pad};border-radius:24px;background:linear-gradient(150deg,rgb(255 255 255/.2),rgb(255 255 255/.07));backdrop-filter:blur(18px);box-shadow:inset 0 0 0 1px rgb(255 255 255/.28),0 30px 60px -30px rgb(0 6 26/.7);color:#fff;font-family:Outfit">${html}</div>`;
const white = (html, style, pad = "20px 22px") => `<div style="position:absolute;${style};padding:${pad};border-radius:24px;background:#fff;box-shadow:0 0 0 1px rgb(255 255 255/.7),0 40px 80px -34px rgb(0 6 26/.75);color:${INK};font-family:Outfit">${html}</div>`;
const note = `<div class="row" style="gap:7px;font:400 13px Outfit;color:rgb(255 255 255/.55)">${icon("info", { size: 14, color: "rgb(255 255 255/.55)", stroke: 2 })}Temsili arayüz</div>`;
/* Kilit ekranı bildirimi (iOS bildirim kartı biçimi) */
const push = (title, text, time = "şimdi") => `<div class="row" style="gap:14px;align-items:flex-start"><span style="width:44px;height:44px;border-radius:12px;background:linear-gradient(150deg,${APP2},${APP});display:grid;place-items:center;flex-shrink:0;box-shadow:0 8px 18px -8px ${APP}">${icon("calendar-check", { size: 22, color: "#fff", stroke: 2.2 })}</span><div style="min-width:0;flex:1"><div class="row" style="font-size:14.5px;font-weight:600">${title}<span style="margin-left:auto;font-weight:400;font-size:13px;color:rgb(255 255 255/.7)">${time}</span></div><div style="font-size:14.5px;line-height:1.35;color:rgb(255 255 255/.86);margin-top:2px">${text}</div></div></div>`;

/* ---------- 1) Hero 1600x1000 ---------- */
export function mobil2Hero({ bare = false } = {}) {
  /* bare: paylaşım görseli karesi; sol metin bloğu yok, telefonlar ortada */
  if (bare) return page({ w: 1600, h: 1000, bg: themeBg(TM), body: `${glow(300, 80, 1000, 860, "rgb(125 139 255 / .45)")}${floor(780, 960, 400, 60, 0.6)}<div style="position:absolute;left:880px;top:170px">${android(appScreen("android"), { width: 360, style: "filter:drop-shadow(0 50px 60px rgb(0 6 26/.6)) brightness(.97)" })}</div><div style="position:absolute;left:520px;top:110px">${iphone(appScreen("ios"), { width: 400, style: "filter:drop-shadow(0 60px 70px rgb(0 6 26/.65))" })}</div>${grainLayer(0.06)}` });
  const body = `
  ${glow(420, 120, 1000, 860, "rgb(125 139 255 / .45)")}
  <div style="position:absolute;left:68px;top:60px">${lockup("Mobil Uygulama")}</div>
  <div style="position:absolute;left:68px;top:250px;width:440px;color:#fff;font-family:Outfit">
    <div style="font-size:54px;line-height:1.04;font-weight:600;letter-spacing:-.04em">Tek uygulama,<br><span style="color:#c3caff">iki mağaza</span></div>
    <div style="font-size:19px;line-height:1.5;color:rgb(255 255 255/.72);margin-top:20px">iOS ve Android'de aynı deneyim; tasarımdan mağaza onayına kadar tek ekip.</div>
    <div class="row" style="gap:12px;margin-top:30px">${logoImg("appstore", 50)}${logoImg("googleplay", 50)}</div>
    <div class="row" style="gap:18px;margin-top:34px;padding-top:24px;border-top:1px solid rgb(255 255 255/.16)">
      <span class="row" style="gap:10px;font:500 16px Outfit;color:rgb(255 255 255/.85)">${logoImg("react", 26)}React Native</span>
      <span style="width:1px;height:22px;background:rgb(255 255 255/.2)"></span>
      <span class="row" style="gap:10px">${logoImg("flutter", 21, "filter:brightness(0) invert(1);opacity:.85")}</span></div></div>
  ${floor(1060, 935, 380, 56, 0.55)}${floor(700, 960, 400, 60, 0.6)}
  <div style="position:absolute;left:1075px;top:150px">${android(appScreen("android"), { width: 360, style: "filter:drop-shadow(0 50px 60px rgb(0 6 26/.6)) brightness(.97)" })}</div>
  <div style="position:absolute;left:700px;top:110px">${iphone(appScreen("ios"), { width: 400, style: "filter:drop-shadow(0 60px 70px rgb(0 6 26/.65))" })}</div>
  <div class="row" style="position:absolute;left:820px;top:66px;gap:8px;font:600 14px Outfit;color:rgb(255 255 255/.85)">${logoImg("apple", 16, "filter:invert(1)")}iOS</div>
  <div class="row" style="position:absolute;left:1210px;top:106px;gap:8px;font:600 14px Outfit;color:rgb(255 255 255/.85)">${logoImg("android", 18)}Android</div>
  ${glass(push("Rezervasyon onaylandı", "Reformer Pilates · Bugün 18:30, Stüdyo 2"), "left:68px;top:690px;width:440px")}
  <div style="position:absolute;left:68px;bottom:44px">${note}</div>
  ${grainLayer(0.06)}`;
  return page({ w: 1600, h: 1000, bg: themeBg(TM), body });
}

/* ---------- 2) Tek kod, iki platform 1200x900 ---------- */
const K = (c, t) => `<span style="color:${c}">${t}</span>`;
const CODE = [
  [K("#c792ea", "export function"), " ", K("#82aaff", "SiradakiDers"), "() {"],
  ["  ", K("#c792ea", "const"), " ders = ", K("#82aaff", "useDers"), "();"],
  ["  ", K("#c792ea", "return"), " ("],
  ["    &lt;", K("#ffcb6b", "Kart"), " ", K("#addb67", "baslik"), "=", K("#ecc48d", "{ders.ad}"), "&gt;"],
  ["      &lt;", K("#ffcb6b", "Ilerleme"), " ", K("#addb67", "deger"), "=", K("#ecc48d", "{5 / 8}"), " /&gt;"],
  ["      &lt;", K("#ffcb6b", "Dugme"), " ", K("#addb67", "onPress"), "=", K("#ecc48d", "{girisKarti}"), "&gt;"],
  ["        Giriş kartı"],
  ["      &lt;/", K("#ffcb6b", "Dugme"), "&gt;"],
  ["    &lt;/", K("#ffcb6b", "Kart"), "&gt;"],
  ["  );"],
  ["}"],
];
function techTile() {
  const editor = `<div style="position:absolute;left:60px;top:200px;width:560px;border-radius:22px;overflow:hidden;background:#0f1324;box-shadow:inset 0 0 0 1px rgb(255 255 255/.1),0 60px 100px -40px rgb(0 6 26/.85);font-family:Outfit">
    <div class="row" style="height:46px;padding:0 16px;gap:8px;background:#0b0e1b">${["#ff5f57", "#febc2e", "#28c840"].map((c) => `<span style="width:11px;height:11px;border-radius:50%;background:${c}"></span>`).join("")}
      <span class="row" style="margin-left:14px;gap:8px;height:30px;padding:0 12px;border-radius:9px;background:#151a30;color:#d7dcf5;font-size:13px">${logoImg("react", 15)}SiradakiDers.tsx</span></div>
    <div style="padding:20px 0 22px;font:500 15.5px/1.75 ui-monospace,SFMono-Regular,Menlo,monospace;color:#c8cee8">${CODE.map((l, i) => `<div class="row" style="gap:18px"><span style="width:26px;text-align:right;color:#4b5375">${i + 1}</span><span style="white-space:pre">${l.join("")}</span></div>`).join("")}</div></div>`;
  const arrow = (x, y) => `<path d="M 640 470 C 690 470, ${x - 50} ${y}, ${x} ${y}" fill="none" stroke="rgb(195 202 255/.7)" stroke-width="2.5" stroke-dasharray="7 8"/><circle cx="${x}" cy="${y}" r="5" fill="#c3caff"/>`;
  const body = `${glow(300, 120, 900, 760, "rgb(125 139 255 / .4)")}
  <div style="position:absolute;left:60px;top:58px;color:#fff;font-family:Outfit"><div style="font-size:13px;font-weight:600;letter-spacing:.1em;color:#c3caff">TEK KOD TABANI</div><div style="font-size:38px;font-weight:600;letter-spacing:-.03em;margin-top:6px;line-height:1.1">Bir kez yazılır,<br>iki platformda çalışır</div></div>
  ${editor}
  <svg width="1200" height="900" style="position:absolute;inset:0">${arrow(735, 300)}${arrow(955, 640)}</svg>
  ${floor(745, 545, 200, 30, 0.5)}${floor(965, 850, 200, 30, 0.5)}
  <div style="position:absolute;left:740px;top:90px">${iphone(appScreen("ios"), { width: 210, style: "filter:drop-shadow(0 30px 40px rgb(0 6 26/.6))" })}</div>
  <div style="position:absolute;left:965px;top:420px">${android(appScreen("android"), { width: 196, style: "filter:drop-shadow(0 30px 40px rgb(0 6 26/.6))" })}</div>
  <div class="row" style="position:absolute;left:60px;top:705px;gap:10px;flex-wrap:wrap;width:600px">${[["flutter", 22, ""], ["swift", 24, ""], ["kotlin", 22, "Kotlin"], ["firebase", 26, ""]].map(([f, h, t]) => `<span class="row" style="gap:10px;height:56px;padding:0 20px;border-radius:16px;background:#fff;box-shadow:0 20px 40px -24px rgb(0 6 26/.7)">${logoImg(f, h)}${t ? `<span style="font:600 17px Outfit;color:${INK}">${t}</span>` : ""}</span>`).join("")}</div>
  <div style="position:absolute;left:62px;top:782px;font:400 14.5px Outfit;color:rgb(255 255 255/.66)">Projeye göre çapraz platform ya da yerel geliştirme; bildirim ve veri için Firebase</div>
  <div style="position:absolute;right:60px;bottom:40px">${note}</div>
  ${grainLayer(0.06)}`;
  return page({ w: 1200, h: 900, bg: themeBg(TM), body });
}

/* ---------- 3) Mağaza onayı 1200x900 ---------- */
const STEPS = ["Gönderildi", "İncelemede", "Onaylandı"];
const statusCard = (badge, label) => `<div class="row" style="justify-content:space-between">${logoImg(badge, 42)}<span class="row" style="gap:7px;height:32px;padding:0 13px;border-radius:999px;background:#e6f7ee;color:#11704b;font:600 13.5px Outfit">${icon("circle-check", { size: 16, color: "#11704b", stroke: 2.4 })}${label}</span></div>
  <div class="row" style="margin-top:20px;gap:0">${STEPS.map((s, i) => `<div style="flex:1;position:relative"><div class="row" style="gap:0">${i ? `<span style="flex:1;height:3px;background:#3bb273"></span>` : `<span style="flex:1"></span>`}<span style="width:26px;height:26px;border-radius:50%;background:#3bb273;display:grid;place-items:center;flex-shrink:0">${icon("check", { size: 15, color: "#fff", stroke: 3 })}</span>${i < 2 ? `<span style="flex:1;height:3px;background:#3bb273"></span>` : `<span style="flex:1"></span>`}</div><div style="text-align:center;font-size:13.5px;color:#5b6274;margin-top:8px">${s}</div></div>`).join("")}</div>`;
const RULES = [
  ["shield-check", "Gizlilik bilgileri", "Gizlilik etiketleri ve veri güvenliği formu"],
  ["user-x", "Uygulama içinden hesap silme", "Hesap açılan uygulamalarda iki mağazanın şartı"],
  ["image", "Simge ve ekran görüntüleri", "Her mağazanın ölçü ve sayısında"],
  ["key-round", "İnceleme için test hesabı", "Girişli uygulamalarda incelemeciye verilir"],
  ["flask-conical", "Test dağıtımı", "TestFlight ve Google Play iç test kanalı"],
];
function reviewTile() {
  const body = `${glow(80, 160, 1040, 700, "rgb(125 139 255 / .38)")}
  <div style="position:absolute;left:60px;top:58px;color:#fff;font-family:Outfit"><div style="font-size:13px;font-weight:600;letter-spacing:.1em;color:#c3caff">MAĞAZA ONAYI</div><div style="font-size:38px;font-weight:600;letter-spacing:-.03em;margin-top:6px;line-height:1.1">İncelemeye hazır gider</div></div>
  ${white(statusCard("appstore", "Onaylandı"), "left:60px;top:200px;width:470px", "22px 24px 20px")}
  ${white(statusCard("googleplay", "Onaylandı"), "left:60px;top:395px;width:470px", "22px 24px 20px")}
  ${white(`<div class="row" style="gap:12px"><span style="width:44px;height:44px;border-radius:13px;background:#eceeff;display:grid;place-items:center">${icon("list-checks", { size: 22, color: ACC, stroke: 2 })}</span><div style="font-size:20px;font-weight:600">Göndermeden önce kontrol</div></div>
    <div style="margin-top:12px">${RULES.map(([ic, t, d]) => `<div class="row" style="gap:14px;padding:14px 0;border-top:1px solid #eef1f6"><span style="width:26px;height:26px;border-radius:50%;background:#e6f7ee;display:grid;place-items:center;flex-shrink:0">${icon("check", { size: 15, color: "#11704b", stroke: 3 })}</span><div style="min-width:0"><div style="font-size:17px;font-weight:600">${t}</div><div style="font-size:14px;color:#6b7590;margin-top:2px">${d}</div></div><span style="margin-left:auto;flex-shrink:0;opacity:.55">${icon(ic, { size: 20, color: INK, stroke: 1.8 })}</span></div>`).join("")}</div>`, "left:580px;top:200px;width:560px", "24px 26px 12px")}
  ${glass(push("Yeni sürüm yayında", "Sürüm 1.1 App Store ve Google Play'de güncellendi"), "left:60px;top:600px;width:470px")}
  <div style="position:absolute;left:62px;bottom:40px">${note}</div>
  ${grainLayer(0.06)}`;
  return page({ w: 1200, h: 900, bg: themeBg(TM), body });
}

/* ---------- Kapak 1200x1500 ---------- */
function coverTile() {
  const body = `
  <div style="position:absolute;left:150px;top:560px;width:900px;height:1000px;border-radius:50%;background:radial-gradient(closest-side,${TM.hi}88,transparent);filter:blur(20px)"></div>
  <div style="position:absolute;left:0;right:0;top:96px;display:grid;justify-items:center;text-align:center;color:#fff;font-family:Outfit">
    ${lockup("Mobil Uygulama", 30)}
    <h1 style="margin-top:40px;font-size:96px;line-height:1.02;font-weight:600;letter-spacing:-.045em">Cebinizdeki<br><span style="color:${TM.glow}">markanız</span></h1>
    <div class="row" style="gap:12px;margin-top:34px">${logoImg("appstore", 50)}${logoImg("googleplay", 50)}</div>
  </div>
  <div style="position:absolute;left:640px;top:760px">${android(appScreen("android"), { width: 390, style: "filter:drop-shadow(0 50px 60px rgb(0 6 26/.6)) brightness(.97)" })}</div>
  <div style="position:absolute;left:200px;top:700px">${iphone(appScreen("ios"), { width: 440, style: "filter:drop-shadow(0 60px 70px rgb(0 6 26/.65))" })}</div>
  ${grainLayer(0.06)}`;
  return page({ w: 1200, h: 1500, bg: themeBg(TM), body });
}

const tileHead = (k, t) => `<div style="position:absolute;left:60px;top:58px;color:#fff;font-family:Outfit"><div style="font-size:13px;font-weight:600;letter-spacing:.1em;color:#c3caff">${k}</div><div style="font-size:38px;font-weight:600;letter-spacing:-.03em;margin-top:6px;line-height:1.1">${t}</div></div>`;
const tileBg = (body) => page({ w: 1200, h: 900, bg: themeBg(TM), body: `${glow(80, 160, 1040, 700, "rgb(125 139 255 / .38)")}${body}${grainLayer(0.06)}` });

/* ---------- Süreç: fikirden mağazaya ---------- */
const PROCESS = [
  ["search", "Keşif", "Kapsam, kullanıcılar ve ekran akışı"],
  ["pen-tool", "Tasarım", "Figma'da tıklanabilir prototip"],
  ["code-xml", "Geliştirme", "iOS ve Android tek kod tabanında"],
  ["flask-conical", "Test", "TestFlight ve Google Play iç test"],
  ["rocket", "Yayın", "App Store ve Google Play"],
];
function processTile() {
  const body = `${tileHead("FİKİRDEN MAĞAZAYA", "Beş adımda yayında")}
  ${white(`${PROCESS.map(([ic, t, d], i) => `<div class="row" style="gap:16px;align-items:flex-start;position:relative;padding:${i ? 18 : 0}px 0 0">
      ${i < PROCESS.length - 1 ? `<span style="position:absolute;left:23px;top:${i ? 66 : 48}px;width:2px;height:40px;background:#dfe3fb"></span>` : ""}
      <span style="width:48px;height:48px;border-radius:15px;background:${i === 4 ? `linear-gradient(150deg,${APP2},${APP})` : "#eceeff"};display:grid;place-items:center;flex-shrink:0">${icon(ic, { size: 23, color: i === 4 ? "#fff" : ACC, stroke: 2 })}</span>
      <div style="min-width:0;padding-top:2px"><div class="row" style="gap:10px"><span style="font-size:13px;font-weight:600;color:#9aa2b8">0${i + 1}</span><span style="font-size:20px;font-weight:600">${t}</span></div><div style="font-size:15px;color:#6b7590;margin-top:2px">${d}</div></div></div>`).join("")}`, "left:60px;top:190px;width:540px", "28px 30px 30px")}
  ${floor(760, 860, 330, 40, 0.5)}
  <div style="position:absolute;left:700px;top:130px">${iphone(appScreen("ios"), { width: 340, style: "filter:drop-shadow(0 50px 60px rgb(0 6 26/.6))" })}</div>
  ${glass(`<div class="row" style="gap:10px;font-size:15px;font-weight:600">${icon("rocket", { size: 18, color: "#fff", stroke: 2 })}Yayında</div><div class="row" style="gap:10px;margin-top:10px">${logoImg("appstore", 34)}${logoImg("googleplay", 34)}</div>`, "left:60px;top:640px;width:330px", "18px 20px")}
  <div style="position:absolute;left:62px;bottom:40px">${note}</div>`;
  return tileBg(body);
}

/* ---------- Mağaza sayfası tasarımı: simge ve ekran görüntüsü seti ---------- */
const appIconBig = (s) => `<span style="width:${s}px;height:${s}px;border-radius:${s * 0.226}px;display:grid;place-items:center;background:radial-gradient(70% 70% at 25% 10%,rgb(255 255 255/.45),transparent 55%),linear-gradient(150deg,${APP2},${APP} 55%,#c93a17);box-shadow:inset 0 0 0 1px rgb(255 255 255/.25),0 20px 40px -18px rgb(201 58 23/.8)">${icon("calendar-check", { size: s * 0.5, color: "#fff", stroke: 2 })}</span>`;
const promo = (title, sub, bg, x, rot = 0) => `<div style="position:absolute;left:${x}px;top:250px;width:240px;height:500px;border-radius:26px;overflow:hidden;${bg};transform:rotate(${rot}deg);box-shadow:0 40px 70px -30px rgb(0 6 26/.75),inset 0 0 0 1px rgb(255 255 255/.2)">
  <div style="padding:26px 22px 0;font-family:Outfit;color:#fff"><div style="font-size:24px;font-weight:600;line-height:1.12;letter-spacing:-.02em">${title}</div><div style="font-size:13.5px;color:rgb(255 255 255/.78);margin-top:6px">${sub}</div></div>
  <div style="position:absolute;left:30px;top:150px">${iphone(appScreen("ios"), { width: 180 })}</div></div>`;
function storeTile() {
  const body = `${tileHead("MAĞAZA SAYFASI", "Simge ve ekran görüntüleri")}
  ${promo("Dersini saniyeler içinde ayır", "Takvimden seç, onayla", art("#ff8a5c", "#e8452d", "#ffd2a8"), 60, -3)}
  ${promo("Üyeliğin hep cebinde", "Kalan ders ve giriş kartı", art("#7b8cff", "#4351d6", "#c9d0ff"), 320, 0)}
  ${promo("Dersten önce hatırlatma", "Bildirimle kaçırma", art("#2a2f45", "#141826", "#ff6a3d66"), 580, 3)}
  ${white(`<div style="display:grid;justify-items:center;text-align:center">${appIconBig(120)}<div style="font-size:19px;font-weight:600;margin-top:18px">Uygulama simgesi</div><div style="font-size:14.5px;color:#6b7590;margin-top:4px;line-height:1.4">iOS ve Android'in istediği tüm boyutlarda</div></div>
    <div style="margin-top:20px;padding-top:16px;border-top:1px solid #eef1f6;display:grid;gap:10px;font-size:14.5px;color:#3b4763">${["Ekran görüntüsü seti", "Mağaza açıklaması ve anahtar kelimeler", "Tanıtım görseli"].map((t) => `<div class="row" style="gap:10px">${icon("circle-check", { size: 18, color: "#16a34a", stroke: 2.4 })}${t}</div>`).join("")}</div>`, "left:860px;top:250px;width:280px", "28px 24px 22px")}
  <div class="row" style="position:absolute;left:62px;bottom:40px;gap:24px">${note}</div>`;
  return tileBg(body);
}

/* ---------- Entegrasyonlar: kilit ekranı bildirimleri ve bağlı servisler ---------- */
const lockScreen = () => `<div style="width:390px;height:844px;position:relative;overflow:hidden;font-family:Outfit;color:#fff;background:radial-gradient(80% 60% at 20% 10%,#ff8a5c 0%,transparent 60%),radial-gradient(90% 70% at 100% 100%,#4351d6 0%,transparent 60%),linear-gradient(180deg,#2a2f45,#141826)">
  <div class="row" style="height:54px;padding:0 30px;justify-content:space-between;font:600 16px Outfit"><span></span><span class="row" style="gap:6px">${icon("signal", { size: 15, color: "#fff", stroke: 2.4 })}${icon("wifi", { size: 15, color: "#fff", stroke: 2.4 })}${icon("battery-full", { size: 21, color: "#fff", stroke: 2 })}</span></div>
  <div style="text-align:center;margin-top:20px"><div style="font-size:19px;font-weight:500;color:rgb(255 255 255/.85)">Perşembe 16 Ekim</div><div style="font-size:92px;font-weight:600;letter-spacing:-.04em;line-height:1">9:41</div></div>
  <div style="display:grid;gap:10px;padding:0 14px;margin-top:300px">${[["Dersine 1 saat kaldı", "Reformer Pilates · 18:30, Stüdyo 2", "1 sa önce"], ["Ödeme alındı", "8 derslik paket · Apple Pay", "şimdi"]].map(([t, d, tm]) => `<div style="padding:13px 14px;border-radius:22px;background:rgb(255 255 255/.18);backdrop-filter:blur(20px)">${push(t, d, tm)}</div>`).join("")}</div></div>`;
const INTEG = [
  ["bell-ring", "Anlık bildirim", "Apple ve Google bildirim servisleri", 60, 190],
  ["credit-card", "Ödeme", "Apple Pay, Google Pay ve kart", 60, 380],
  ["log-in", "Kolay giriş", "Apple ile giriş, Google ile giriş", 60, 570],
  ["globe", "Web sitesi ve e-ticaret", "Ürün, sipariş ve stok aynı veriden", 820, 190],
  ["layout-dashboard", "Yönetim paneli", "İçerik, kullanıcı ve raporlar", 820, 380],
  ["chart-line", "Analitik", "Firebase ile kullanım ölçümü", 820, 570],
];
function integTile() {
  const body = `${tileHead("ENTEGRASYONLAR", "Uygulama tek başına kalmaz")}
  ${INTEG.map(([ic, t, d, x, y]) => white(`<div class="row" style="gap:14px"><span style="width:46px;height:46px;border-radius:14px;background:#eceeff;display:grid;place-items:center;flex-shrink:0">${icon(ic, { size: 22, color: ACC, stroke: 2 })}</span><div style="min-width:0"><div style="font-size:17px;font-weight:600">${t}</div><div style="font-size:14px;color:#6b7590;margin-top:2px;line-height:1.35">${d}</div></div></div>`, `left:${x}px;top:${y}px;width:320px`, "18px 18px")).join("")}
  ${floor(450, 870, 300, 36, 0.5)}
  <div style="position:absolute;left:440px;top:150px">${iphone(lockScreen(), { width: 320, style: "filter:drop-shadow(0 50px 60px rgb(0 6 26/.65))" })}</div>
  <div style="position:absolute;left:62px;bottom:40px">${note}</div>`;
  return tileBg(body);
}

/* ---------- Yayından sonra: sürümler ve kararlılık ---------- */
const RELEASES = [
  ["1.0", "İlk yayın", "App Store ve Google Play", "rocket"],
  ["1.1", "Bekleme listesi", "Dolu derse sıraya girme", "sparkles"],
  ["1.2", "iOS 26 uyumu", "Yeni arayüz ve izinler", "smartphone"],
  ["1.3", "Android 16 uyumu", "Hedef API güncellemesi", "smartphone"],
];
function careTile() {
  const bars = [62, 70, 66, 78, 74, 82, 88, 86, 92, 90, 95, 96];
  const body = `${tileHead("YAYINDAN SONRA", "Bakım ve yeni sürümler")}
  ${white(`<div class="row" style="gap:12px"><span style="width:44px;height:44px;border-radius:13px;background:#eceeff;display:grid;place-items:center">${icon("git-branch", { size: 21, color: ACC, stroke: 2 })}</span><div style="font-size:20px;font-weight:600">Sürüm geçmişi</div></div>
    <div style="margin-top:14px">${RELEASES.map(([v, t, d, ic], i) => `<div class="row" style="gap:14px;padding:14px 0;border-top:1px solid #eef1f6"><span style="width:52px;height:30px;border-radius:9px;background:${i === 3 ? `linear-gradient(150deg,${APP2},${APP})` : "#f1f3f9"};color:${i === 3 ? "#fff" : INK};display:grid;place-items:center;font:600 14px Outfit;flex-shrink:0">${v}</span><div style="min-width:0"><div style="font-size:17px;font-weight:600">${t}</div><div style="font-size:14px;color:#6b7590;margin-top:1px">${d}</div></div><span style="margin-left:auto;opacity:.5">${icon(ic, { size: 19, color: INK, stroke: 1.8 })}</span></div>`).join("")}</div>`, "left:60px;top:190px;width:520px", "24px 26px 12px")}
  ${white(`<div class="row" style="justify-content:space-between">${logoImg("firebase", 30)}<span style="height:28px;padding:0 12px;border-radius:999px;background:#e6f7ee;color:#11704b;font:600 12.5px Outfit;display:grid;place-items:center">Crashlytics</span></div>
    <div style="font-size:20px;font-weight:600;margin-top:18px">Hata izleme</div><div style="font-size:14.5px;color:#6b7590;margin-top:3px">Çökmeler sürüm sürüm izlenir, düzeltme yeni sürümle gelir</div>
    <div class="row" style="gap:7px;align-items:flex-end;height:200px;margin-top:24px">${bars.map((b, i) => `<span style="flex:1;height:${b}%;border-radius:6px 6px 3px 3px;background:${i > 8 ? `linear-gradient(180deg,${APP2},${APP})` : "#dfe3fb"}"></span>`).join("")}</div>
    <div class="row" style="justify-content:space-between;margin-top:8px;font-size:12.5px;color:#9aa2b8"><span>1.0</span><span>1.1</span><span>1.2</span><span>1.3</span></div>`, "left:620px;top:190px;width:520px", "24px 26px 20px")}
  ${glass(push("Sürüm 1.3 yayında", "Android 16 uyumu ve küçük iyileştirmeler"), "left:60px;top:640px;width:520px")}
  <div style="position:absolute;left:62px;bottom:40px">${note}</div>`;
  return tileBg(body);
}

/* Galeri sırası: hero, kapak, 1 tek kod, 2 süreç, 3 mağaza onayı, 4 mağaza sayfası, 5 entegrasyonlar, 6 yayından sonra */
export const mobil2Scenes = () => [
  { name: "real-mobil-uygulama-hero", w: 1600, h: 1000, html: mobil2Hero() },
  { name: "real-mobil-uygulama-ogkare", w: 1600, h: 1000, html: mobil2Hero({ bare: true }) },
  { name: "real-mobil-uygulama-kapak", w: 1200, h: 1500, html: coverTile() },
  ...[techTile(), processTile(), reviewTile(), storeTile(), integTile(), careTile()].map((html, k) => ({ name: `real-mobil-uygulama-${k + 1}`, w: 1200, h: 900, html })),
];
