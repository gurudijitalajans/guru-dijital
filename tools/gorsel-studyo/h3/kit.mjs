// Ortak teslim bileşenleri: arama sonucu sayfası, sosyal medya gönderisi/akışı,
// reklam kreatifleri, bildirimler. Markasız, genel arayüzler (gerçek platform logosu yok).
import { blobs, bottle, cup, towels, tooth } from "./art.mjs";
import { icon, SANS2, SERIF, statusBar } from "./common.mjs";

/* ---------------- Arama motoru sonuç sayfası (genel) ---------------- */
const resRow = ({ site, url, title, desc, fav = "#2f6bff", favTxt = "N", hi = false, ad = false, rating, sitelinks }) => `
  <div style="padding:${hi ? "18px 20px" : "4px 0"};margin:${hi ? "0 -20px" : "0"};border-radius:16px;${hi ? "background:#f1f6ff;box-shadow:inset 0 0 0 2px #2f6bff" : ""}">
    ${ad ? `<div style="font:700 13px Outfit;color:#0c1a3a;margin-bottom:6px">Sponsorlu</div>` : ""}
    <div class="row" style="gap:12px"><span style="width:30px;height:30px;border-radius:50%;background:#f1f3f6;display:grid;place-items:center"><span style="width:20px;height:20px;border-radius:6px;background:${fav};color:#fff;display:grid;place-items:center;font:700 12px Outfit">${favTxt}</span></span><div><div style="font-size:15px;color:#202124">${site}</div><div style="font-size:13px;color:#5f6368">${url}</div></div></div>
    <div style="font-size:22px;color:#1a0dab;margin-top:8px;letter-spacing:-.01em">${title}</div>
    ${rating ? `<div class="row" style="gap:6px;margin-top:4px;font-size:14px;color:#5f6368"><span style="color:#f2a600">★★★★★</span>${rating}</div>` : ""}
    <div style="font-size:15.5px;line-height:1.55;color:#4d5156;margin-top:4px">${desc}</div>
    ${sitelinks ? `<div class="row" style="gap:10px;margin-top:12px">${sitelinks.map((x) => `<span style="padding:8px 14px;border-radius:999px;background:#fff;box-shadow:inset 0 0 0 1px #dadce0;font-size:14px;color:#1a0dab">${x}</span>`).join("")}</div>` : ""}
  </div>`;

export function serp({ q, results, ai, tabs = true, width = 1000 }) {
  const PL = 164;
  return `<div style="width:${width}px;background:#fff;font-family:Arial,${SANS2};color:#202124;padding-bottom:40px">
    <div class="row" style="gap:28px;padding:26px 36px 0">
      <span style="font:700 28px Outfit;letter-spacing:-.03em;color:#2f6bff">ara<span style="color:#0c1a3a">bul</span></span>
      <div class="row" style="flex:1;max-width:720px;height:50px;border-radius:999px;box-shadow:0 1px 6px rgb(32 33 36/.2);padding:0 22px;gap:14px;font-size:17px">${q}<span style="margin-left:auto;color:#2f6bff">${icon("search", { size: 20 })}</span></div>
    </div>
    ${tabs ? `<div class="row" style="gap:26px;padding:18px 0 0 ${PL}px;font-size:14px;color:#5f6368;border-bottom:1px solid #ebebeb">${["Tümü", "Haritalar", "Görseller", "Haberler", "Videolar"].map((x, i) => `<span style="padding-bottom:12px;${i === 0 ? "color:#1a73e8;border-bottom:3px solid #1a73e8" : ""}">${x}</span>`).join("")}</div>` : ""}
    <div style="padding:22px 0 0 ${PL}px;width:${PL + 760}px;display:grid;gap:30px">
      ${ai ? `<div style="padding:22px 24px;border-radius:20px;background:linear-gradient(135deg,#f3f7ff,#f7f3ff)"><div class="row" style="gap:10px;font:600 15px Outfit;color:#3b2fd6">${icon("sparkles", { size: 18 })}Yapay zekâ özeti</div><div style="font-size:16px;line-height:1.6;margin-top:10px;color:#202124">${ai.text}</div><div class="row" style="gap:10px;margin-top:14px">${ai.sources.map((s, i) => `<span class="row" style="gap:8px;padding:8px 12px;border-radius:12px;background:#fff;font-size:13.5px;${i === 0 ? "box-shadow:inset 0 0 0 2px #2f6bff;font-weight:600" : "box-shadow:inset 0 0 0 1px #e3e6ee"}">${s}</span>`).join("")}</div></div>` : ""}
      ${results.map(resRow).join("")}
    </div>
  </div>`;
}

/* Mobil arama sonucu */
export function serpMobile({ q, results }) {
  return `<div style="width:390px;background:#fff;font-family:Arial,${SANS2}">${statusBar()}
    <div style="padding:6px 16px 12px"><div style="text-align:center;font:700 24px Outfit;color:#2f6bff;letter-spacing:-.03em">ara<span style="color:#0c1a3a">bul</span></div>
    <div class="row" style="margin-top:12px;height:48px;border-radius:999px;box-shadow:0 1px 6px rgb(32 33 36/.22);padding:0 18px;gap:10px;font-size:15.5px">${icon("search", { size: 18, color: "#5f6368" })}${q}</div></div>
    <div style="display:grid;gap:12px;padding:6px 12px 20px;background:#f1f3f4">${results
      .map((r) => `<div style="background:#fff;border-radius:16px;padding:16px;${r.hi ? "box-shadow:inset 0 0 0 2px #2f6bff" : ""}">${r.ad ? `<div style="font:700 12px Outfit;margin-bottom:6px">Sponsorlu</div>` : ""}<div class="row" style="gap:10px"><span style="width:26px;height:26px;border-radius:7px;background:${r.fav || "#2f6bff"};color:#fff;display:grid;place-items:center;font:700 12px Outfit">${r.favTxt || "N"}</span><div><div style="font-size:14px">${r.site}</div><div style="font-size:12px;color:#5f6368">${r.url}</div></div></div><div style="font-size:18px;color:#1a0dab;margin-top:8px;line-height:1.3">${r.title}</div><div style="font-size:14px;line-height:1.5;color:#4d5156;margin-top:6px">${r.desc}</div></div>`)
      .join("")}</div></div>`;
}

/* ---------------- Sosyal medya ---------------- */
export const avatar = (txt, bg, d = 36, fg = "#fff", font = "Outfit") =>
  `<span style="width:${d}px;height:${d}px;border-radius:50%;padding:2px;background:linear-gradient(45deg,#f9a03f,#e1306c 55%,#833ab4);display:inline-grid;flex-shrink:0"><span style="border-radius:50%;background:${bg};color:${fg};display:grid;place-items:center;font:600 ${d * 0.38}px ${font};box-shadow:0 0 0 2px #fff">${txt}</span></span>`;

/* Gönderi kartı (genel akış görünümü); art: 390x? kreatif */
export function feedPost({ handle, av, art, artH = 390, sponsored = false, likes = "1.284", caption = "", cta }) {
  return `<div style="width:390px;background:#fff;font-family:Outfit;color:#0c1a3a">
    <div class="row" style="gap:10px;padding:10px 14px">${av}<div><div style="font-size:14px;font-weight:600">${handle}</div>${sponsored ? `<div style="font-size:12px;color:#7f8aa3">Sponsorlu</div>` : ""}</div><span style="margin-left:auto">${icon("ellipsis", { size: 20 })}</span></div>
    <div style="height:${artH}px;overflow:hidden">${art}</div>
    ${cta ? `<div class="row" style="justify-content:space-between;padding:12px 14px;background:#eef4ff;font-size:14.5px;font-weight:600;color:#12419b">${cta}${icon("chevron-right", { size: 18 })}</div>` : ""}
    <div class="row" style="gap:16px;padding:12px 14px 6px">${icon("heart", { size: 24 })}${icon("message-circle", { size: 24 })}${icon("send", { size: 22 })}<span style="margin-left:auto">${icon("bookmark", { size: 22 })}</span></div>
    <div style="padding:0 14px 14px;font-size:14px;line-height:1.45"><b>${likes} beğenme</b><div style="margin-top:4px"><b>${handle}</b> ${caption}</div></div>
  </div>`;
}

/* Hikâye/Reels çerçevesi 390x844 */
export function storyFrame({ handle, av, art, sponsored = false, cta = "Daha fazla bilgi", reels = false }) {
  return `<div style="position:relative;width:390px;height:844px;overflow:hidden;font-family:Outfit;color:#fff;background:#000">
    <div style="position:absolute;inset:0">${art}</div>
    <div style="position:absolute;left:0;right:0;top:0;height:180px;background:linear-gradient(180deg,rgb(0 0 0/.45),transparent)"></div>
    <div style="position:absolute;left:0;right:0;bottom:0;height:260px;background:linear-gradient(0deg,rgb(0 0 0/.55),transparent)"></div>
    ${reels ? "" : `<div class="row" style="position:absolute;left:12px;right:12px;top:58px;gap:4px">${[1, 0.4, 0.4].map((o, i) => `<span style="flex:1;height:3px;border-radius:2px;background:#fff;opacity:${i === 0 ? 1 : o}"></span>`).join("")}</div>`}
    <div class="row" style="position:absolute;left:14px;top:${reels ? 64 : 74}px;gap:10px">${av}<div><div style="font-size:15px;font-weight:600">${handle}</div>${sponsored ? `<div style="font-size:12.5px;opacity:.85">Sponsorlu</div>` : ""}</div></div>
    ${reels ? `<div style="position:absolute;right:14px;bottom:150px;display:grid;gap:22px;justify-items:center;font-size:13px;font-weight:600">${[["heart", "18,2B"], ["message-circle", "412"], ["send", "1,1B"]].map(([ic, n]) => `<div style="display:grid;justify-items:center;gap:4px">${icon(ic, { size: 30 })}${n}</div>`).join("")}</div>` : ""}
    ${cta ? `<div style="position:absolute;left:24px;right:24px;bottom:44px;height:52px;border-radius:14px;background:#fff;color:#0c1a3a;display:grid;place-items:center;font-size:16px;font-weight:600">${cta}</div>` : ""}
  </div>`;
}

/* Profil ızgarası */
export function profile({ handle, name, bio, av, stats, tiles }) {
  return `<div style="width:390px;background:#fff;font-family:Outfit;color:#0c1a3a">${statusBar()}
    <div class="row" style="padding:2px 16px 10px;gap:8px;font-size:19px;font-weight:600">${icon("lock", { size: 15 })}${handle}${icon("chevron-down", { size: 16 })}<span style="margin-left:auto" class="row">${icon("plus-square", { size: 24 })}<span style="width:16px"></span>${icon("menu", { size: 24 })}</span></div>
    <div class="row" style="padding:6px 16px;gap:22px">${av}<div class="row" style="flex:1;justify-content:space-around;text-align:center">${stats.map(([a, b]) => `<div><div style="font-size:18px;font-weight:600">${a}</div><div style="font-size:13px">${b}</div></div>`).join("")}</div></div>
    <div style="padding:8px 16px 12px;font-size:14px;line-height:1.45"><b>${name}</b><div>${bio}</div></div>
    <div class="row" style="gap:8px;padding:0 16px 14px">${["Takip et", "Mesaj"].map((x, i) => `<span style="flex:1;height:34px;border-radius:9px;display:grid;place-items:center;font-size:14px;font-weight:600;${i === 0 ? "background:#2f6bff;color:#fff" : "background:#eef0f4"}">${x}</span>`).join("")}</div>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:2px">${tiles.map((x) => `<div style="aspect-ratio:4/5;overflow:hidden">${x}</div>`).join("")}</div>
  </div>`;
}

/* ---------------- Kurgusal markaların kreatifleri ---------------- */
/* Lya Skin (kozmetik) — w x h kreatif */
export function lyaPost(w, h, { v = 1 } = {}) {
  const bgs = ["linear-gradient(160deg,#f7e8df,#ecd2c4)", "linear-gradient(160deg,#e9e4f5,#d4cbe8)", "linear-gradient(160deg,#e3efe8,#c9ded2)", "linear-gradient(160deg,#fbefe2,#f1d9bd)"];
  const heads = ["Cildiniz için<br>3 adımlı rutin", "Yeni: C vitamini serumu", "Hassas ciltlere özel", "Kasım'a özel %25"];
  const k = (v - 1) % 4;
  const u = Math.min(w, h / 1.25);
  const pu = u * (h / w > 1.6 ? 1.45 : 1);
  const top = h / w > 1.6 ? h * 0.2 : h * 0.09;
  return `<div style="position:relative;width:${w}px;height:${h}px;background:${bgs[k]};overflow:hidden;font-family:${SERIF};color:#3a2a2a">
    <div style="position:absolute;left:50%;bottom:${h * 0.05}px;width:${u * 1.1}px;height:${u * 0.06}px;transform:translateX(-30%);border-radius:50%;background:rgb(80 40 30/.16);filter:blur(${u * 0.012}px)"></div>
    <div style="position:absolute;right:${w * 0.1}px;bottom:${h * 0.06}px">${bottle(pu * 0.66, { glass: ["#f9efe8", "#efeaf8", "#eaf3ed", "#fff4e7"][k], cap: "#3a2a2a", text: "LYA" })}</div>
    <div style="position:absolute;right:${w * 0.1 + pu * 0.3}px;bottom:${h * 0.06}px">${bottle(pu * 0.44, { glass: "#ffffff", cap: "#c49a7c", text: "LYA" })}</div>
    <div style="position:absolute;left:${w * 0.08}px;top:${top}px;width:${w * 0.75}px">
      <div style="font:600 ${u * 0.032}px ${SANS2};letter-spacing:.3em">LYA SKIN</div>
      <div style="font-size:${u * 0.088}px;line-height:1.05;margin-top:${u * 0.035}px">${heads[k]}</div>
    </div>
  </div>`;
}
/* Kahve Durağı (kafe) */
export function kahvePost(w, h, { v = 1 } = {}) {
  const k = (v - 1) % 3;
  const bg = ["#1f3b2d", "#c65d3b", "#f1e3cf"][k];
  const fg = k === 2 ? "#1f3b2d" : "#f6ead8";
  const head = ["Sabahın ilk<br>yudumu", "2. kahve<br>bizden", "Yeni: fıstıklı latte"][k];
  const u = Math.min(w, h / 1.25);
  const pu = u * (h / w > 1.6 ? 1.45 : 1);
  const top = h / w > 1.6 ? h * 0.2 : h * 0.08;
  return `<div style="position:relative;width:${w}px;height:${h}px;background:${bg};overflow:hidden;font-family:Outfit;color:${fg}">
    <div style="position:absolute;left:50%;bottom:${h * 0.04}px;transform:translateX(-38%)">${cup(pu * 0.82, { body: k === 2 ? "#fff" : "#f6ead8", coffee: k === 2 ? "#9bb07a" : "#6b3f2a", saucer: k === 2 ? "#e6d5bd" : "rgb(255 255 255/.18)" })}</div>
    <div style="position:absolute;left:${w * 0.08}px;top:${top}px"><div style="font:700 ${u * 0.035}px Outfit;letter-spacing:.2em">KAHVE DURAĞI</div><div style="font:600 ${u * 0.1}px/1 Outfit;letter-spacing:-.03em;margin-top:${u * 0.04}px">${head}</div></div>
  </div>`;
}
/* Nova Diş */
export function novaPost(w, h, { v = 1 } = {}) {
  const head = ["Gülüşünüze<br>yatırım yapın", "Ücretsiz<br>ön muayene", "Şeffaf plak ile<br>görünmez tedavi"][(v - 1) % 3];
  const u = Math.min(w, h / 1.25);
  const pu = u * (h / w > 1.6 ? 1.45 : 1);
  const top = h / w > 1.6 ? h * 0.2 : h * 0.08;
  return `<div style="position:relative;width:${w}px;height:${h}px;overflow:hidden;font-family:Outfit;color:#0d2340">
    <div style="position:absolute;inset:0">${blobs(w, h, { bg: "#eaf3ff" })}</div>
    <div style="position:absolute;right:${w * 0.1}px;bottom:${h * 0.16}px">${tooth(pu * 0.5, "#fff", "#9cc0ff")}</div>
    <div style="position:absolute;left:${w * 0.08}px;top:${top}px;width:${w * 0.8}px"><div style="font:600 ${u * 0.036}px Outfit;color:#2f6bff">nova diş</div><div style="font:600 ${u * 0.09}px/1.04 Outfit;letter-spacing:-.035em;margin-top:${u * 0.03}px">${head}</div></div>
    <div style="position:absolute;left:${w * 0.08}px;bottom:${h * 0.07}px;padding:${u * 0.025}px ${u * 0.05}px;border-radius:999px;background:#2f6bff;color:#fff;font:600 ${u * 0.038}px Outfit">Randevu al</div>
  </div>`;
}
/* Pamuk Sokağı (ev tekstili) */
export function pamukPost(w, h, { v = 1 } = {}) {
  const k = (v - 1) % 3;
  const head = ["Yumuşacık<br>bir sonbahar", "Bambu havlu seti", "Kasım indirimi<br>%30"][k];
  const u = Math.min(w, h / 1.25);
  const pu = u * (h / w > 1.6 ? 1.45 : 1);
  const top = h / w > 1.6 ? h * 0.2 : h * 0.08;
  return `<div style="position:relative;width:${w}px;height:${h}px;background:${["#efe6da", "#dfe7ee", "#ecdcd3"][k]};overflow:hidden;font-family:${SANS2};color:#3b3330">
    <div style="position:absolute;left:50%;bottom:${h * 0.06}px;transform:translateX(-50%)">${towels(Math.min(w * 0.92, pu * 0.86), [["#f8efe4", "#cfdbe6", "#e6cfc4"], ["#d5e1ea", "#f4ece2", "#b9cad8"], ["#e9d3c7", "#f6efe6", "#d9b9aa"]][k])}</div>
    <div style="position:absolute;left:${w * 0.08}px;top:${top}px"><div style="font:600 ${u * 0.032}px ${SANS2};letter-spacing:.28em">PAMUK SOKAĞI</div><div style="font:400 ${u * 0.092}px/1.05 ${SERIF};margin-top:${u * 0.03}px">${head}</div></div>
  </div>`;
}

/* Kilit ekranı bildirimi */
export const notif = ({ app, color, letter, title, text, time = "şimdi" }) =>
  `<div style="border-radius:22px;background:rgb(255 255 255/.86);backdrop-filter:blur(20px);padding:14px 16px;font-family:Outfit;color:#0c1a3a;box-shadow:0 20px 40px -20px rgb(0 0 0/.4)"><div class="row" style="gap:12px"><span style="width:38px;height:38px;border-radius:10px;background:${color};color:#fff;display:grid;place-items:center;font:700 17px Outfit;flex-shrink:0">${letter}</span><div style="min-width:0;flex:1"><div class="row" style="justify-content:space-between;font-size:13px;color:#55617b"><b style="color:#0c1a3a;font-size:14px">${app}</b>${time}</div><div style="font-size:15px;font-weight:600;margin-top:2px">${title}</div><div style="font-size:14px;color:#3b4763;line-height:1.35">${text}</div></div></div></div>`;
