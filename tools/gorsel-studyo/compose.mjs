import { BG, appWindow, floatCard, grainLayer, iceBg, icon, iphone, macbook, mark, page, themeBg } from "./lib.mjs";

/* Ürün imzası: g işareti + ürün adı */
export const lockup = (name, { tone = "white", size = 34 } = {}) =>
  `<div class="row" style="gap:${size * 0.42}px;color:${tone === "white" ? "#fff" : "#011441"}">${mark(tone, size * 1.3)}<span style="font-size:${size}px;font-weight:500;letter-spacing:-.02em;line-height:1">Guru <span style="font-weight:400;opacity:.92">${name}</span></span></div>`;

/* Cihazın arkasındaki yumuşak ışık */
const glow = (x, y, w, h, c = "rgb(68 161 241 / .45)") =>
  `<div style="position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px;border-radius:50%;background:radial-gradient(closest-side,${c},transparent);filter:blur(10px)"></div>`;
const floorShadow = (x, y, w, h, op = 0.55) =>
  `<div style="position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px;border-radius:50%;background:radial-gradient(closest-side,rgb(0 6 26 / ${op}),transparent);filter:blur(6px)"></div>`;

/**
 * Giriş görseli 1600x1200: lacivert ışık zemini, eğik dizüstü + önde telefon + bildirim kartı
 */
export function hero({ name, theme, desktop, mobile, card, cardPos = "left:930px;top:150px;width:520px" }) {
  const body = `
  ${glow(120, 360, 1250, 760)}
  <div style="position:absolute;left:68px;top:66px">${lockup(name)}</div>
  ${floorShadow(110, 1040, 1180, 110)}
  <div style="position:absolute;left:70px;top:300px;perspective:3200px">
    ${macbook(desktop, { width: 1240, style: "transform:rotateY(13deg) rotateX(4deg) rotateZ(-.6deg);transform-origin:0% 50%" })}
  </div>
  ${floorShadow(1110, 1085, 360, 70, 0.6)}
  <div style="position:absolute;left:1135px;top:430px;perspective:2400px">
    ${iphone(mobile, { width: 330, style: "transform:rotateY(-10deg) rotateZ(1.5deg);filter:drop-shadow(0 50px 50px rgb(0 6 26/.55))" })}
  </div>
  ${card ? floatCard(card, cardPos) : ""}
  ${grainLayer(0.06)}`;
  return page({ w: 1600, h: 1200, bg: theme ? themeBg(theme) : BG.navy, body });
}

/**
 * Özellik görseli 1200x900: açık zemin, ekrandan bir bölge pencere içinde + büyütülmüş öğe(ler)
 * win: { crop, scale, style }  floats: [{ html, style, pad }]  phone: { html, style }
 */
export function feature({ name, theme, desktop, win, floats = [], phone, bg = "ice", chips = "" }) {
  const dark = bg === "navy";
  const body = `
  ${dark ? glow(150, 200, 1000, 700) : glow(200, 160, 900, 700, "rgb(255 255 255 / .9)")}
  ${win ? `<div style="position:absolute;inset:0;${win.dim ? "filter:blur(1.6px) saturate(.9);opacity:.9" : ""}">${appWindow(desktop, { ...win, title: `Guru ${name}` })}</div>` : ""}
  ${phone ? `<div style="position:absolute;${phone.style}">${iphone(phone.html, { width: phone.width ?? 300, style: "filter:drop-shadow(0 40px 40px rgb(1 12 40/.45))" })}</div>` : ""}
  ${floats.map((f) => floatCard(f.html, f.style, f.pad)).join("")}
  ${chips}
  ${grainLayer(dark ? 0.06 : 0.035)}`;
  return page({ w: 1200, h: 900, bg: theme ? (dark ? themeBg(theme) : iceBg(theme)) : BG[bg], body });
}

/**
 * Paylaşım görseli 1200x630: solda ürün ve başlık, sağda cihazlar
 */
export function og({ name, theme, headline, desktop, mobile }) {
  const h = headline.replace(/\*([^*]+)\*/g, `<b style="font-weight:600;color:${theme ? theme.ice : "#bfeaff"}">$1</b>`);
  const body = `
  ${glow(560, 120, 700, 520)}
  <div style="position:absolute;left:64px;top:62px">${lockup(name, { size: 28 })}</div>
  <h1 style="position:absolute;left:64px;top:168px;width:520px;font-size:52px;line-height:1.1;font-weight:400;letter-spacing:-.035em;color:#fff">${h}</h1>
  <div style="position:absolute;left:64px;bottom:58px" class="row"><span style="display:inline-flex;align-items:center;gap:10px;height:46px;padding:0 20px;border-radius:999px;background:#fff;color:#011441;font-size:17px;font-weight:500">Demo talep edin${icon("arrow-up-right", { size: 18, stroke: 2.2 })}</span></div>
  ${floorShadow(600, 560, 640, 60)}
  <div style="position:absolute;left:610px;top:150px;perspective:2600px">
    ${macbook(desktop, { width: 700, style: "transform:rotateY(14deg) rotateX(3deg);transform-origin:0% 50%" })}
  </div>
  <div style="position:absolute;left:1010px;top:250px;perspective:2000px">
    ${iphone(mobile, { width: 170, style: "transform:rotateY(-10deg) rotateZ(1.5deg);filter:drop-shadow(0 30px 30px rgb(0 6 26/.55))" })}
  </div>
  ${grainLayer(0.06)}`;
  return page({ w: 1200, h: 630, bg: theme ? themeBg(theme) : BG.navy, body });
}

/**
 * App Store tarzı kapak 1200x1500: ürün tonunda zemin, üstte imza + büyük başlık,
 * altta kenardan taşan telefon ve telefonun yanına binen tek bir yüzen kart.
 */
export function cover({ theme, name, headline, sub, mobile, card, cardStyle = "left:64px;top:1010px;width:480px;transform:rotate(-3deg)" }) {
  const h = headline.replace(/\*([^*]+)\*/g, `<span style="color:${theme.ice}">$1</span>`);
  const body = `
  <div style="position:absolute;left:150px;top:520px;width:900px;height:1100px;border-radius:50%;background:radial-gradient(closest-side,${theme.hi}88,transparent);filter:blur(20px)"></div>
  <div style="position:absolute;left:0;right:0;top:0;height:760px;background:linear-gradient(180deg,${theme.deep} 0%,${theme.deep}e6 42%,${theme.deep}00 100%)"></div>
  <div style="position:absolute;left:0;right:0;top:96px;display:grid;justify-items:center;text-align:center;padding:0 80px">
    <div class="row" style="gap:14px;padding:10px 22px 10px 12px;border-radius:999px;background:rgb(255 255 255/.10);box-shadow:inset 0 0 0 1px rgb(255 255 255/.18)">${mark("white", 40)}<span style="font-size:28px;font-weight:500;color:#fff;letter-spacing:-.01em">Guru ${name}</span></div>
    <h1 style="margin-top:36px;max-width:900px;font-size:104px;line-height:1.02;font-weight:600;letter-spacing:-.045em;color:#fff;text-wrap:balance">${h}</h1>
    <p style="margin-top:26px;font-size:32px;line-height:1.35;color:rgb(255 255 255/.8);max-width:900px;text-wrap:balance">${sub}</p>
  </div>
  <div style="position:absolute;left:280px;top:700px">${iphone(mobile, { width: 640, style: "filter:drop-shadow(0 60px 70px rgb(0 6 26/.6))" })}</div>
  ${card ? floatCard(card, cardStyle, "24px 26px") : ""}
  ${grainLayer(0.06)}`;
  return page({ w: 1200, h: 1500, bg: themeBg(theme), body });
}

/**
 * Ürün turu videosunun kapağı 1920x1080: ortada dizüstü (oynat düğmesi ekranın
 * üstüne gelir), sağda telefon, üstte imza ve süre etiketi.
 */
export function poster({ theme, name, desktop, mobile }) {
  const body = `
  <div style="position:absolute;left:260px;top:180px;width:1400px;height:900px;border-radius:50%;background:radial-gradient(closest-side,${theme.hi}77,transparent);filter:blur(20px)"></div>
  <div style="position:absolute;left:0;right:0;top:0;height:300px;background:linear-gradient(180deg,${theme.deep} 0%,${theme.deep}cc 45%,${theme.deep}00 100%)"></div>
  <div style="position:absolute;left:72px;top:64px">${lockup(name, { size: 36 })}</div>
  <div style="position:absolute;right:72px;top:68px;display:inline-flex;align-items:center;gap:12px;height:54px;padding:0 24px;border-radius:999px;background:rgb(255 255 255/.12);box-shadow:inset 0 0 0 1px rgb(255 255 255/.2);color:#fff;font-size:22px;font-weight:500">${icon("play", { size: 20, stroke: 2.2 })}Ürün turu · 1 dk</div>
  ${floorShadow(380, 1000, 1160, 90)}
  <div style="position:absolute;left:370px;top:200px">${macbook(desktop, { width: 1180 })}</div>
  <div style="position:absolute;left:1440px;top:390px">${iphone(mobile, { width: 300, style: "filter:drop-shadow(0 40px 40px rgb(0 6 26/.55))" })}</div>
  ${grainLayer(0.06)}`;
  return page({ w: 1920, h: 1080, bg: themeBg(theme), body });
}
