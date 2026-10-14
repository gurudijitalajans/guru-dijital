// Guru hizmet görselleri (v2): her hizmetin müşteriye nasıl sunulduğunu gösteren
// gerçekçi, Türkçe, açık temalı arayüz ekranları. Ürün ekranlarıyla (screens-*.mjs)
// aynı kit: Outfit, lucide ikonları, çizgisiz açık tema. Markalar kurgusaldır.
//   Masaüstü ekranlar 1440x900, telefon ekranları 390x844 CSS px.
// Kompozisyonlar: scenes-hizmet2.mjs
import { av, bars, donut, dot, icon, line, mark, ring, sidebar, tag } from "./lib.mjs";
import { kpi, tabBar } from "./screens-common.mjs";
import { statusBar } from "./screens-chatbot.mjs";

/* ---------------- Ortak yardımcılar ---------------- */
export const ELL = "white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0";
const app = (side, main) => `<div class="app">${side}<main class="main">${main}</main></div>`;
const head = (title, sub, right = "") =>
  `<div class="top"><div style="min-width:0"><h1>${title}</h1><div class="sub">${sub}</div></div><div class="row" style="margin-left:auto;gap:12px">${right}</div></div>`;
const btn = (t, ic, kind = "sec", extra = "") => `<span class="btn ${kind}" style="${extra}">${ic ? icon(ic, { size: 16, stroke: 2.2 }) : ""}${t}</span>`;
const sel = (t, ic) => `<span class="btn sec">${ic ? icon(ic, { size: 16 }) : ""}${t}${icon("chevron-down", { size: 15, color: "#8a95ad" })}</span>`;
export const ibox = (ic, bg = "#eaf2ff", fg = "#2a6aca", d = 36, r = 11) =>
  `<span style="width:${d}px;height:${d}px;border-radius:${r}px;background:${bg};display:grid;place-items:center;flex-shrink:0">${icon(ic, { size: Math.round(d * 0.5), color: fg, stroke: 2.1 })}</span>`;
export const meter = (p, c = "#2a6aca", h = 6, track = "#e8eef7") =>
  `<div style="height:${h}px;border-radius:9px;background:${track};overflow:hidden"><div style="width:${p}%;height:100%;border-radius:9px;background:${c}"></div></div>`;
const cardHead = (t, sub, right = "") =>
  `<div class="row" style="gap:12px"><div style="min-width:0"><div class="h3">${t}</div>${sub ? `<div class="lbl" style="margin-top:2px">${sub}</div>` : ""}</div>${right ? `<div style="margin-left:auto;gap:10px" class="row">${right}</div>` : ""}</div>`;
const IC = { blue: ["#eaf2ff", "#2a6aca"], green: ["#e6f6ec", "#12873f"], amber: ["#fff3dc", "#b45f06"], red: ["#feecec", "#c9363b"], violet: ["#f0ecff", "#5b3fd6"], teal: ["#e0f6f5", "#0b7d7d"], gray: ["#eef1f6", "#55617b"], navy: ["#12419b", "#fff"] };
const ib = (ic, tone = "blue", d = 36) => ibox(ic, IC[tone][0], IC[tone][1], d, Math.round(d * 0.31));
const up = (t) => `<span class="row up" style="gap:4px;font-weight:600;display:inline-flex">${icon("trending-up", { size: 14, stroke: 2.4 })}${t}</span>`;

/* Tablo: grid sütunlu, satırlar tek satır ve ellipsis ile biter */
function table(cols, headers, rows, { rh = 50, fs = 14.5, hfs = 12.5, gap = 16, pad = "0 12px" } = {}) {
  const g = `display:grid;grid-template-columns:${cols};gap:${gap}px;align-items:center;padding:${pad}`;
  return `<div style="${g};height:34px;font-size:${hfs}px;font-weight:500;color:#8a95ad;border-radius:10px;background:#f5f8fd">${headers.map((h, i) => `<span style="${ELL}${i && /^r/.test(h) ? ";text-align:right" : ""}">${h.replace(/^r:/, "")}</span>`).join("")}</div>
    ${rows.map((r) => `<div style="${g};height:${rh}px;font-size:${fs}px">${r.map((c, i) => `<span style="${ELL};${headers[i].startsWith("r:") ? "text-align:right;" : ""}">${c}</span>`).join("")}</div>`).join("")}`;
}

/* Guru müşteri paneli kenar çubuğu: hesap yöneticisi kartı + kullanıcı */
function guruSide(product, items, user, manager) {
  const s = sidebar({ product, items, user });
  if (!manager) return s;
  const [ini, name, role, k] = manager;
  return s.replace(
    '<div class="foot">',
    `<div style="margin-top:auto;margin-bottom:12px;padding:14px;border-radius:16px;background:linear-gradient(150deg,#eaf2ff,#f5f9ff)">
      <div style="font-size:11.5px;font-weight:600;letter-spacing:.08em;color:#2a6aca">GURU EKİBİNİZ</div>
      <div class="row" style="gap:10px;margin-top:10px">${av(ini, 34, k)}<div style="min-width:0;flex:1"><div style="font-size:14px;font-weight:600;${ELL}">${name}</div><div style="font-size:12.5px;color:#7f8aa3;${ELL}">${role}</div></div>
      <span style="width:32px;height:32px;border-radius:10px;background:#fff;display:grid;place-items:center">${icon("message-circle", { size: 16, color: "#12419b", stroke: 2.1 })}</span></div>
    </div><div class="foot" style="margin-top:0">`
  );
}

/* Müşteriye özel yazılımlar için kenar çubuğu: müşterinin kendi markası */
function clientSide({ logo, name, items, user, foot = "" }) {
  return `<aside class="side">
    <div class="brand" style="gap:12px">${logo}<span style="font-size:17px;font-weight:600;letter-spacing:-.01em;color:#0c1a3a">${name}</span></div>
    <nav class="nav">${items.map(([ic, label, on, ct]) => `<div class="ni${on ? " on" : ""}">${icon(ic, { size: 19, stroke: on ? 2.2 : 1.9 })}<span>${label}</span>${ct ? `<span class="ct">${ct}</span>` : ""}</div>`).join("")}</nav>
    ${foot}
    <div class="foot" ${foot ? 'style="margin-top:12px"' : ""}>${av(user[0], 36, user[3])}<div style="min-width:0"><div style="font-size:14px;font-weight:600">${user[1]}</div><div style="font-size:12.5px;color:#7f8aa3">${user[2]}</div></div>${icon("chevrons-up-down", { size: 16, color: "#a0aac0", style: "margin-left:auto" })}</div>
  </aside>`;
}
const monogram = (t, bg = "linear-gradient(140deg,#12419b,#44a1f1)", d = 34) =>
  `<span style="width:${d}px;height:${d}px;border-radius:${d * 0.3}px;background:${bg};display:grid;place-items:center;color:#fff;font-weight:700;font-size:${d * 0.46}px;letter-spacing:-.02em;flex-shrink:0">${t}</span>`;

/* Telefon ekranı iskeleti (390x844) */
export function phoneScreen(body, tabs, bg = "#f3f6fb") {
  return `<div style="width:390px;height:844px;background:${bg};font-family:Outfit;color:#0c1a3a;display:flex;flex-direction:column;overflow:hidden">${statusBar()}
    <div style="flex:1;min-height:0;display:flex;flex-direction:column;gap:12px;padding:4px 18px 14px">${body}</div>${tabs ? tabBar(tabs) : ""}</div>`;
}
const mHead = (title, sub, right = icon("bell", { size: 22, color: "#3b4763" })) =>
  `<div class="row" style="gap:12px;padding:6px 2px 4px"><div style="min-width:0"><div style="font-size:24px;font-weight:600;letter-spacing:-.02em">${title}</div><div style="font-size:13.5px;color:#7f8aa3;margin-top:1px">${sub}</div></div><span style="margin-left:auto;position:relative">${right}</span></div>`;
const mRow = (ic, tone, t, s, right = "") =>
  `<div class="row" style="gap:12px;min-width:0">${ib(ic, tone, 38)}<div style="min-width:0;flex:1"><div style="font-size:14.5px;font-weight:600;${ELL}">${t}</div><div style="font-size:12.5px;color:#8a95ad;${ELL}">${s}</div></div>${right ? `<span style="flex-shrink:0;font-size:12.5px;color:#8a95ad">${right}</span>` : ""}</div>`;

/* Bildirim kartı (yüzen kartlarda ve telefon kilit ekranında) */
export const notifCard = (app, ic, title, text, time = "şimdi", { fs = 1 } = {}) => `
  <div class="row" style="gap:10px;font-size:${14 * fs}px;color:#7f8aa3"><span style="width:${26 * fs}px;height:${26 * fs}px;border-radius:${8 * fs}px;background:#12419b;display:grid;place-items:center">${icon(ic, { size: 15 * fs, color: "#fff", stroke: 2.2 })}</span><span style="font-weight:600;color:#3b4763;letter-spacing:.04em">${app}</span><span style="margin-left:auto">${time}</span></div>
  <div style="font-size:${19 * fs}px;font-weight:600;margin-top:${10 * fs}px">${title}</div>
  <div style="font-size:${16.5 * fs}px;color:#3b4763;margin-top:3px;line-height:1.4">${text}</div>`;

/* ======================================================================
   1. DİJİTAL REKLAM YÖNETİMİ · müşteri: Lavin Kozmetik
   ====================================================================== */
const REK_NAV = (on) => [["layout-dashboard", "Genel Bakış"], ["megaphone", "Kampanyalar", false, 12], ["images", "Kreatifler"], ["target", "Dönüşümler"], ["file-chart-column", "Raporlar"], ["wallet", "Bütçe"], ["settings", "Ayarlar"]].map((x, i) => (i === on ? [x[0], x[1], true, x[3]] : x));
const REK_USER = ["DA", "Deniz Aksoy", "Lavin Kozmetik", 2];
const REK_MAN = ["SY", "Selin Yurt", "Reklam uzmanı", 4];
export const REK_CH = [
  ["search", "blue", "Google Arama", "₺62.300", "6,9x", 82],
  ["shopping-cart", "teal", "Google Alışveriş", "₺48.900", "7,4x", 88],
  ["sparkles", "violet", "Performance Max", "₺24.600", "5,1x", 61],
  ["users-round", "navy", "Meta", "₺31.200", "4,6x", 55],
  ["clapperboard", "gray", "TikTok", "₺14.900", "3,4x", 40],
  ["play", "red", "YouTube", "₺4.500", "2,8x", 33],
];
export function rekChannels({ rows = 6 } = {}) {
  return `<div class="card" style="padding:20px 22px;height:100%;display:flex;flex-direction:column">
    ${cardHead("Kanallara göre", "Harcama ve ROAS · Eylül", tag("6 kanal", "blue"))}
    <div style="display:grid;gap:13px;margin-top:16px">${REK_CH.slice(0, rows).map(([ic, tone, n, sp, roas, p]) => `<div class="row" style="gap:12px;min-width:0">${ib(ic, tone, 34)}
      <div style="flex:1;min-width:0"><div class="row" style="gap:10px"><span style="font-size:14.5px;font-weight:500;${ELL}">${n}</span><span style="margin-left:auto;font-size:14.5px;font-weight:600;flex-shrink:0">${roas}</span></div>
      <div class="row" style="gap:10px;margin-top:6px"><div style="flex:1">${meter(p, "#2a6aca", 5)}</div><span style="width:70px;text-align:right;font-size:12.5px;color:#8a95ad;flex-shrink:0">${sp}</span></div></div></div>`).join("")}</div>
  </div>`;
}
export const REK_REV = [520, 610, 580, 690, 760, 820, 880, 960, 1080];
export const REK_SP = [110, 120, 118, 130, 142, 150, 160, 172, 186];
const MONTHS9 = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl"];
export function rekTrend({ w = 640, h = 210, fs = 13 } = {}) {
  return `<div class="card" style="padding:20px 24px;height:100%;display:flex;flex-direction:column">
    ${cardHead("Reklam geliri ve harcama", "Yıl başından bu yana · ₺6,90M gelir", `<span class="row" style="gap:7px;font-size:13px;color:#55617b"><span style="width:18px;height:4px;border-radius:9px;background:#2a6aca"></span>Gelir</span><span class="row" style="gap:7px;font-size:13px;color:#55617b"><span style="width:18px;height:4px;border-radius:9px;background:#b9c7e0"></span>Harcama</span>`)}
    <div style="position:relative;margin-top:auto;padding-top:26px">${line([REK_REV, REK_SP], { w, h, min: 0, max: 1200 })}
      <div style="position:absolute;right:-8px;top:-6px;padding:6px 11px;border-radius:10px;background:#011441;color:#fff;font-size:13.5px;font-weight:600;white-space:nowrap">Eyl · ₺1,08M</div>
      <div class="row" style="justify-content:space-between;margin-top:12px;font-size:${fs}px;color:#8a95ad">${MONTHS9.map((m, i) => `<span style="${i === 8 ? "color:#0c1a3a;font-weight:600" : ""}">${m}</span>`).join("")}</div></div>
  </div>`;
}
export function rekCampaigns() {
  const st = (t) => (t === "Aktif" ? tag(`${dot("#16a34a", 6)}Aktif`, "green") : tag(`${dot("#e8a33a", 6)}Öğreniyor`, "amber"));
  return `<div class="card" style="padding:18px 20px 8px">
    ${cardHead("Kampanyalar", "En çok harcayan 4 kampanya", `<span class="lbl">Tümünü gör</span>${icon("chevron-right", { size: 16, color: "#8a95ad" })}`)}
    <div style="margin-top:12px">${table("minmax(0,2.3fr) 1.2fr 1fr .9fr .8fr .6fr", ["Kampanya", "Kanal", "Durum", "r:Harcama", "r:Dönüşüm", "r:ROAS"], [
      ["<b style='font-weight:600'>Sonbahar Cilt Bakımı</b> · Arama", "Google Arama", st("Aktif"), "₺38.200", "612", "<b>7,2x</b>"],
      ["<b style='font-weight:600'>Serum Yeniden Pazarlama</b>", "Meta", st("Aktif"), "₺21.400", "388", "<b>6,1x</b>"],
      ["<b style='font-weight:600'>Yeni Sezon Ruj</b> · Video", "TikTok", st("Öğreniyor"), "₺14.900", "142", "<b>3,4x</b>"],
      ["<b style='font-weight:600'>Marka Araması</b>", "Google Arama", st("Aktif"), "₺9.800", "296", "<b>9,8x</b>"],
    ], { rh: 48 })}</div>
  </div>`;
}
export function rekKpis() {
  return `<div class="row" style="gap:14px">
    ${kpi("Harcama", "₺186.400", "+%8", "wallet", { note: "bütçenin %93'ü" })}
    ${kpi("Dönüşüm", "2.418", "+%21", "shopping-bag", { note: "geçen aya göre" })}
    ${kpi("Dönüşüm başı maliyet", "₺77,1", "%11", "receipt", { tone: "gooddown", note: "daha düşük" })}
    ${kpi("ROAS", "5,8x", "+0,9", "chart-spline", { note: "hedef 4,5x" })}
  </div>`;
}
export function reklamDesktop() {
  return app(guruSide("REKLAM", REK_NAV(0), REK_USER, REK_MAN), `
    ${head("Reklam Performansı", "Lavin Kozmetik · 1-30 Eylül 2026 · 6 kanal", sel("Son 30 gün", "calendar") + btn("Raporu indir", "download", "pri"))}
    <div data-durak="kpi">${rekKpis()}</div>
    <div style="flex:1;min-height:0;display:flex;gap:14px">
      <div style="flex:1;min-width:0" data-durak="trend">${rekTrend()}</div>
      <div style="width:390px;flex-shrink:0" data-durak="kanal">${rekChannels({ rows: 5 })}</div>
    </div>
    <div data-durak="kampanya">${rekCampaigns()}</div>`);
}

/* Reklam önizlemesi (genel tasarım, gerçek bir platform arayüzü değildir) */
const bottle = (w = 120, c1 = "#ffffff", c2 = "#cfe3ff") => `<svg width="${w}" height="${w * 1.7}" viewBox="0 0 100 170">
  <defs><linearGradient id="bt" x1="0" x2="1"><stop offset="0" stop-color="${c1}"/><stop offset=".55" stop-color="${c2}"/><stop offset="1" stop-color="${c1}" stop-opacity=".8"/></linearGradient></defs>
  <rect x="38" y="4" width="24" height="30" rx="9" fill="#0b2a66"/><rect x="34" y="30" width="32" height="14" rx="3" fill="#163f8e"/>
  <rect x="14" y="44" width="72" height="122" rx="18" fill="url(#bt)" opacity=".96"/><rect x="24" y="86" width="52" height="40" rx="6" fill="#fff" opacity=".9"/>
  <rect x="31" y="96" width="38" height="5" rx="2.5" fill="#12419b"/><rect x="35" y="107" width="30" height="4" rx="2" fill="#8fb4ea"/><rect x="22" y="52" width="8" height="70" rx="4" fill="#fff" opacity=".55"/></svg>`;
function adPreview(v, { h = 250 } = {}) {
  const A = v === "A";
  const img = A
    ? `<div style="height:${h}px;border-radius:14px;background:radial-gradient(70% 80% at 30% 20%,#e6f1ff,#a9cdfb 60%,#6fa6ef);position:relative;overflow:hidden;display:grid;place-items:center">${bottle(h * 0.42)}
        <div style="position:absolute;left:18px;top:16px;font-size:13px;font-weight:600;letter-spacing:.08em;color:#12419b">YENİ</div>
        <div style="position:absolute;left:18px;bottom:16px;right:18px;font-size:22px;font-weight:600;letter-spacing:-.02em;color:#0b2a66;line-height:1.1">%15 C vitamini<br>aydınlatıcı serum</div></div>`
    : `<div style="height:${h}px;border-radius:14px;background:linear-gradient(160deg,#0b2a66,#12419b 55%,#3c8be8);position:relative;overflow:hidden">
        <div style="position:absolute;right:-6px;bottom:-14px;opacity:.95">${bottle(h * 0.38, "#e9f3ff", "#9cc4f7")}</div>
        <div style="position:absolute;left:20px;top:22px;right:${h * 0.42}px;color:#fff">
          <div class="row" style="gap:3px">${Array(5).fill(icon("star", { size: 16, color: "#ffd36b", stroke: 0, style: "fill:#ffd36b" })).join("")}</div>
          <div style="font-size:20px;font-weight:500;line-height:1.3;margin-top:12px">“İki haftada cildimdeki farkı arkadaşlarım fark etti.”</div>
          <div style="font-size:13.5px;opacity:.75;margin-top:10px">Ece K. · doğrulanmış alıcı</div></div></div>`;
  return `<div style="padding:12px;border-radius:18px;background:#f5f8fd">
    <div class="row" style="gap:10px;padding:2px 2px 10px">${monogram("L", "linear-gradient(140deg,#12419b,#6aa8f2)", 32)}<div><div style="font-size:14px;font-weight:600">Lavin Kozmetik</div><div style="font-size:12px;color:#8a95ad">Sponsorlu</div></div>${icon("ellipsis", { size: 18, color: "#8a95ad", style: "margin-left:auto" })}</div>
    ${img}
    <div class="row" style="margin-top:10px;padding:10px 12px;border-radius:12px;background:#fff;gap:10px"><div style="min-width:0;flex:1"><div style="font-size:13.5px;font-weight:600;${ELL}">lavinkozmetik.com</div><div style="font-size:12.5px;color:#8a95ad;${ELL}">${A ? "Ücretsiz kargo, 2 gün içinde teslim" : "4.800+ değerlendirme · 4,8 puan"}</div></div><span class="btn pri" style="height:34px;padding:0 13px;font-size:13px;border-radius:10px">Satın al</span></div>
  </div>`;
}
export function rekVariant(v, { h = 250 } = {}) {
  const A = v === "A";
  const m = A ? [["Tıklama oranı", "%1,9", ""], ["Dönüşüm oranı", "%2,6", ""], ["Dönüşüm başı", "₺94", ""]] : [["Tıklama oranı", "%2,7", "+%42"], ["Dönüşüm oranı", "%3,6", "+%38"], ["Dönüşüm başı", "₺68", "−%28"]];
  return `<div class="card" style="padding:18px;${A ? "" : "box-shadow:0 0 0 2px #2a6aca,0 18px 40px -20px rgb(18 65 155/.5)"}">
    <div class="row" style="gap:10px;padding:0 4px 14px"><span style="width:30px;height:30px;border-radius:9px;background:${A ? "#eef1f6" : "#12419b"};color:${A ? "#55617b" : "#fff"};display:grid;place-items:center;font-weight:700;font-size:15px">${v}</span><div><div style="font-size:16px;font-weight:600">${A ? "Ürün odaklı" : "Kullanıcı yorumu"}</div><div class="lbl" style="font-size:12.5px">${A ? "Ürün görseli ve fayda" : "Gerçek alıcı yorumu"}</div></div>
      ${A ? tag("Kontrol", "gray", "margin-left:auto") : tag(`${icon("trophy", { size: 12, stroke: 2.4 })}Kazanan`, "green", "margin-left:auto")}</div>
    ${adPreview(v, { h })}
    <div class="row" style="gap:10px;margin-top:14px">${m.map(([l, val, d]) => `<div style="flex:1;min-width:0;padding:11px 12px;border-radius:12px;background:${A ? "#f5f8fd" : "#eef5ff"}"><div style="font-size:12px;color:#7f8aa3;${ELL}">${l}</div><div class="row" style="gap:6px;margin-top:3px"><span style="font-size:19px;font-weight:600;letter-spacing:-.02em">${val}</span>${d ? `<span style="font-size:12px;font-weight:600;color:#12873f">${d}</span>` : ""}</div></div>`).join("")}</div>
  </div>`;
}
export function rekTestResult() {
  return `<div class="card" style="padding:20px 22px">
    <div class="h3">Test sonucu</div>
    <div class="row" style="gap:18px;margin-top:14px"><div style="position:relative;width:98px;height:98px;flex-shrink:0">${ring(95, { d: 98, thick: 11, color: "#16a34a", track: "#e3f3e8" })}<div style="position:absolute;inset:0;display:grid;place-items:center;text-align:center;line-height:1.05"><div><div style="font-size:23px;font-weight:600">%95</div><div style="font-size:11px;color:#7f8aa3">güven</div></div></div></div>
      <div style="font-size:14.5px;line-height:1.45;color:#3b4763"><b style="color:#0c1a3a">B varyantı</b> %38 daha fazla dönüşüm getirdi. Bütçenin %80'i B'ye aktarılır.</div></div>
    <div style="margin-top:18px"><div class="row lbl" style="font-size:12.5px">Bütçe dağılımı<span style="margin-left:auto">A %20 · B %80</span></div>
      <div class="row" style="gap:4px;margin-top:8px;height:10px"><span style="width:20%;height:100%;border-radius:9px;background:#b9c7e0"></span><span style="flex:1;height:100%;border-radius:9px;background:linear-gradient(90deg,#12419b,#44a1f1)"></span></div></div>
  </div>`;
}
export function reklamTestDesktop() {
  return app(guruSide("REKLAM", REK_NAV(2), REK_USER, REK_MAN), `
    ${head("Kreatif Testi", "Serum Yeniden Pazarlama · Meta · 14 gün · 186.000 gösterim", tag(`${icon("circle-check", { size: 13, stroke: 2.4 })}Test tamamlandı`, "green", "font-size:13px;padding:6px 12px") + btn("Kazananı uygula", "check", "pri"))}
    <div style="flex:1;min-height:0;display:flex;gap:14px">
      <div style="flex:1;min-width:0" data-durak="a">${rekVariant("A", { h: 300 })}</div>
      <div style="flex:1;min-width:0" data-durak="b">${rekVariant("B", { h: 300 })}</div>
      <div style="width:320px;flex-shrink:0;display:flex;flex-direction:column;gap:14px">
        <div data-durak="sonuc">${rekTestResult()}</div>
        <div class="card" style="padding:18px 20px" data-durak="sirada">
          <div class="row" style="gap:12px">${ib("flask-conical", "violet", 38)}<div><div style="font-size:15px;font-weight:600">Sıradaki test</div><div class="lbl" style="font-size:12.5px">6 Ekim'de başlar</div></div></div>
          <div style="font-size:14px;color:#3b4763;line-height:1.45;margin-top:12px">Başlık: <b>fiyat avantajı</b> ile <b>cilt faydası</b> karşılaştırması</div>
          <div class="row" style="gap:8px;margin-top:12px">${tag("Meta", "blue")}${tag("TikTok", "gray")}${tag("₺6.000 bütçe", "amber")}</div>
        </div>
        <div class="card" style="padding:16px 20px;flex:1;min-height:0">
          <div class="h3" style="font-size:15px">Test geçmişi</div>
          <div style="display:grid;gap:11px;margin-top:12px">${[["Video ilk 3 saniye", "+%24 izlenme"], ["Ücretsiz kargo vurgusu", "+%11 tıklama"], ["Karusel ve tek görsel", "Fark yok"]].map(([a, b], i) => `<div class="row" style="gap:10px;font-size:13.5px;min-width:0">${dot(i < 2 ? "#16a34a" : "#a0aac0", 7)}<span style="flex:1;${ELL}">${a}</span><span style="flex-shrink:0;font-weight:600;color:${i < 2 ? "#12873f" : "#7f8aa3"}">${b}</span></div>`).join("")}</div>
        </div>
      </div>
    </div>`);
}
export const REK_MONTH = [1240, 1410, 1530, 1690, 2010, 2418];
export function rekReportBars({ w = 560, h = 230, fs = 13 } = {}) {
  return bars(REK_MONTH, { w, h, hi: 5, labels: ["Nis", "May", "Haz", "Tem", "Ağu", "Eyl"], showVals: true, fs, r: 9 }).replace(/>(\d)(\d{3})</g, ">$1.$2<");
}
export function rekGoals() {
  return `<div class="card" style="padding:20px 22px">
    <div class="h3">Hedefler</div>
    <div style="display:grid;gap:15px;margin-top:14px">${[["Dönüşüm", "2.418 / 2.200", 100, "#16a34a", "%110"], ["ROAS", "5,8x / 4,5x", 100, "#16a34a", "%129"], ["Bütçe kullanımı", "₺186.400 / ₺200.000", 93, "#2a6aca", "%93"]].map(([a, b, p, c, r]) => `<div><div class="row" style="font-size:14px"><span style="font-weight:500">${a}</span><span style="margin-left:auto;font-weight:600;color:${c === "#16a34a" ? "#12873f" : "#12419b"}">${r}</span></div><div class="lbl" style="font-size:12.5px;margin:2px 0 7px">${b}</div>${meter(p, c, 6)}</div>`).join("")}</div>
  </div>`;
}
export function rekPlan() {
  return `<div class="card" style="padding:20px 22px">
    ${cardHead("Ekim planı", "", tag("3 adım", "blue"))}
    <div style="display:grid;gap:12px;margin-top:14px">${["Kasım indirimleri için ön kampanya", "TikTok için 3 yeni video kreatifi", "Alışveriş ürün başlıklarının iyileştirilmesi"].map((t, i) => `<div class="row" style="gap:11px;font-size:14px;min-width:0"><span style="width:22px;height:22px;border-radius:7px;background:${i === 0 ? "#12419b" : "#eaf2ff"};color:${i === 0 ? "#fff" : "#12419b"};display:grid;place-items:center;font-size:12px;font-weight:700;flex-shrink:0">${i + 1}</span><span style="${ELL}">${t}</span></div>`).join("")}</div>
  </div>`;
}
export function reklamReportDesktop() {
  return app(guruSide("REKLAM", REK_NAV(4), REK_USER, REK_MAN), `
    ${head("Eylül 2026 Raporu", "Hazırlayan: Selin Yurt · 2 Ekim 2026", btn("PDF olarak indir", "file-down") + btn("Toplantı planla", "calendar-plus", "pri"))}
    <div style="flex:1;min-height:0;display:flex;gap:14px">
      <div style="flex:1;min-width:0;display:flex;flex-direction:column;gap:14px">
        <div class="card" style="padding:20px 24px" data-durak="ozet">
          <div class="h3">Ayın özeti</div>
          <div class="row" style="gap:12px;margin-top:14px">${[["trending-up", "green", "Dönüşüm", "+%21", "2.418 satış"], ["receipt", "blue", "Dönüşüm başı", "₺77,1", "%11 düştü"], ["chart-spline", "violet", "ROAS", "5,8x", "hedef 4,5x"]].map(([ic, t, a, b, c]) => `<div style="flex:1;padding:14px 16px;border-radius:14px;background:#f5f8fd"><div class="row" style="gap:10px">${ib(ic, t, 32)}<span style="font-size:13.5px;color:#55617b">${a}</span></div><div style="font-size:26px;font-weight:600;letter-spacing:-.02em;margin-top:8px">${b}</div><div style="font-size:12.5px;color:#8a95ad">${c}</div></div>`).join("")}</div>
        </div>
        <div class="card" style="padding:20px 24px;flex:1;min-height:0;display:flex;flex-direction:column" data-durak="aylik">
          ${cardHead("Aylık dönüşüm", "Son 6 ay · tüm kanallar", tag(`${icon("trending-up", { size: 12, stroke: 2.4 })}%95 artış`, "green"))}
          <div style="margin-top:auto">${rekReportBars({ w: 700, h: 300 })}</div>
        </div>
      </div>
      <div style="width:370px;flex-shrink:0;display:flex;flex-direction:column;gap:14px">
        <div data-durak="hedef">${rekGoals()}</div>
        <div data-durak="plan">${rekPlan()}</div>
        <div class="card" style="padding:18px 22px;flex:1;min-height:0;background:linear-gradient(150deg,#011441,#12419b 70%,#2a6aca);color:#fff">
          <div class="row" style="gap:10px">${av("SY", 34, 4)}<div><div style="font-size:14px;font-weight:600">Selin Yurt</div><div style="font-size:12.5px;opacity:.7">Uzman notu</div></div></div>
          <div style="font-size:14.5px;line-height:1.5;margin-top:12px;opacity:.92">Yorum odaklı kreatifler en iyi sonucu verdi. Ekimde bu dili video reklamlara taşıyoruz.</div>
        </div>
      </div>
    </div>`);
}
export function reklamMobile() {
  return phoneScreen(`
    ${mHead("Günaydın, Deniz", "Lavin Kozmetik · Reklam", `${icon("bell", { size: 22, color: "#3b4763" })}<span style="position:absolute;right:-2px;top:-2px;width:9px;height:9px;border-radius:50%;background:#e5484d;border:2px solid #f3f6fb"></span>`)}
    <div style="padding:18px;border-radius:20px;background:linear-gradient(150deg,#011441,#12419b 65%,#2a6aca);color:#fff">
      <div class="row" style="font-size:13.5px;opacity:.8">Dün · 30 Eylül<span style="margin-left:auto" class="row">${icon("chart-spline", { size: 15, color: "#bfe0ff" })}</span></div>
      <div class="row" style="gap:10px;margin-top:10px;align-items:flex-end"><div><div style="font-size:12.5px;opacity:.7">Reklam geliri</div><div style="font-size:32px;font-weight:600;letter-spacing:-.03em">₺38.900</div></div><div style="margin-left:auto;text-align:right"><div style="font-size:12.5px;opacity:.7">ROAS</div><div style="font-size:24px;font-weight:600">6,3x</div></div></div>
      <div class="row" style="gap:8px;margin-top:14px">${[["Harcama", "₺6.180"], ["Dönüşüm", "94"], ["Tıklama", "3.120"]].map(([a, b]) => `<div style="flex:1;padding:9px 10px;border-radius:12px;background:rgb(255 255 255/.12)"><div style="font-size:11.5px;opacity:.75">${a}</div><div style="font-size:16px;font-weight:600">${b}</div></div>`).join("")}</div>
    </div>
    <div class="card" style="padding:16px 18px">
      <div class="row"><span class="h3" style="font-size:15.5px">Bildirimler</span>${tag("3 yeni", "blue", "margin-left:auto")}</div>
      <div style="display:grid;gap:14px;margin-top:14px">
        ${mRow("trophy", "green", "Kreatif testi sonuçlandı", "B varyantı %38 daha fazla dönüşüm", "09:12")}
        ${mRow("target", "blue", "Aylık dönüşüm hedefi aşıldı", "2.418 / 2.200 dönüşüm", "Dün")}
        ${mRow("wallet", "amber", "Bütçenin %93'ü kullanıldı", "Kalan ₺13.600 · 1 gün", "Dün")}
      </div>
    </div>
    <div class="card" style="padding:16px 18px">
      <div class="row"><span class="h3" style="font-size:15.5px">Son 7 gün dönüşüm</span><span style="margin-left:auto;font-size:13px;font-weight:600;color:#12873f">+%18</span></div>
      <div style="margin-top:12px">${bars([62, 71, 68, 80, 77, 88, 94], { w: 318, h: 112, hi: 6, labels: ["Prş", "Cum", "Cmt", "Paz", "Pzt", "Sal", "Çar"], fs: 11.5, r: 6 })}</div>
    </div>`, [["layout-dashboard", "Özet", true], ["megaphone", "Kampanyalar"], ["file-chart-column", "Raporlar"], ["message-circle", "Mesajlar"]]);
}

/* ======================================================================
   2. WEB TASARIM · kurgusal müşteri: Defne Koy Otel
   ====================================================================== */
/* Ege koyu illüstrasyonu (fotoğraf yerine vektör) */
export function landscape(w, h, { id = "ls" } = {}) {
  return `<svg width="${w}" height="${h}" viewBox="0 0 1200 600" preserveAspectRatio="xMidYMid slice" style="display:block">
    <defs>
      <linearGradient id="${id}s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8ec2f5"/><stop offset=".55" stop-color="#d3e8ff"/><stop offset="1" stop-color="#fbe9d6"/></linearGradient>
      <linearGradient id="${id}w" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3f8fe0"/><stop offset="1" stop-color="#0e3f8f"/></linearGradient>
      <radialGradient id="${id}g" cx=".72" cy=".42" r=".35"><stop offset="0" stop-color="#fff6e3" stop-opacity=".95"/><stop offset="1" stop-color="#fff6e3" stop-opacity="0"/></radialGradient>
    </defs>
    <rect width="1200" height="600" fill="url(#${id}s)"/><rect width="1200" height="600" fill="url(#${id}g)"/>
    <circle cx="860" cy="250" r="46" fill="#fff4dc"/>
    <path d="M0 330 C140 270 260 300 380 282 C520 262 600 300 720 292 C860 282 960 250 1200 300 L1200 360 L0 360Z" fill="#a9c9ee"/>
    <path d="M0 350 C160 318 300 334 430 326 C560 318 680 344 820 336 C960 328 1080 312 1200 330 L1200 380 L0 380Z" fill="#7aa7de"/>
    <rect y="356" width="1200" height="244" fill="url(#${id}w)"/>
    ${[[420, 392, 160], [610, 418, 90], [760, 380, 220], [300, 448, 120], [880, 470, 140], [520, 500, 70]].map(([x, y, l]) => `<rect x="${x}" y="${y}" width="${l}" height="3" rx="1.5" fill="#fff" opacity=".35"/>`).join("")}
    <path d="M0 600 L0 420 C80 400 150 380 230 392 C300 402 340 440 400 470 C460 500 470 560 520 600Z" fill="#163a72"/>
    <path d="M0 600 L0 470 C70 452 140 440 200 456 C260 472 300 520 330 600Z" fill="#0d2a58"/>
    <g fill="#fff">${[[96, 392, 70, 34], [170, 380, 56, 46], [236, 398, 44, 30]].map(([x, y, w2, h2]) => `<rect x="${x}" y="${y}" width="${w2}" height="${h2}" rx="2"/>`).join("")}</g>
    <g fill="#8fb6e6">${[[108, 404], [130, 404], [182, 394], [204, 394], [182, 410], [204, 410], [246, 408]].map(([x, y]) => `<rect x="${x}" y="${y}" width="12" height="10" rx="1.5"/>`).join("")}</g>
    <g fill="#24508f">${[[60, 410, 22], [290, 412, 18], [330, 430, 24], [40, 448, 28]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}"/>`).join("")}</g>
    <path d="M1200 600 L1200 430 C1130 420 1080 440 1040 470 C1000 500 980 560 940 600Z" fill="#163a72"/>
    <path d="M760 470 l18 -40 l18 40 Z" fill="#fff" opacity=".9"/><rect x="777" y="430" width="2" height="44" fill="#0d2a58"/>
  </svg>`;
}
const roomArt = (i) => {
  const g = [["#dce9fb", "#9cc0ee"], ["#e9f1ff", "#b8d3f5"], ["#d6ecf7", "#86bce0"]][i];
  return `<svg width="100%" height="100%" viewBox="0 0 300 180" preserveAspectRatio="xMidYMid slice" style="display:block"><rect width="300" height="180" fill="${g[0]}"/>
    <rect x="${[170, 30, 190][i]}" y="24" width="${[100, 90, 80][i]}" height="84" rx="4" fill="#fff" opacity=".85"/><rect x="${[178, 38, 198][i]}" y="32" width="${[84, 74, 64][i]}" height="56" rx="2" fill="${g[1]}"/>
    <rect x="0" y="122" width="300" height="58" fill="#f6efe6"/><rect x="${[40, 120, 30][i]}" y="96" width="140" height="44" rx="10" fill="#fff"/><rect x="${[48, 128, 38][i]}" y="88" width="56" height="20" rx="8" fill="#e6eefb"/><rect x="${[110, 190, 100][i]}" y="88" width="56" height="20" rx="8" fill="#e6eefb"/>
    <rect x="${[40, 120, 30][i]}" y="118" width="140" height="22" rx="6" fill="#12419b" opacity=".85"/><circle cx="${[250, 60, 260][i]}" cy="128" r="14" fill="#2a6aca" opacity=".5"/></svg>`;
};
const browserBar = (url) => `<div class="row" style="height:46px;padding:0 18px;gap:8px;background:#eef2f8;flex-shrink:0">
  ${["#ff5f57", "#febc2e", "#28c840"].map((c) => `<span style="width:12px;height:12px;border-radius:50%;background:${c}"></span>`).join("")}
  <span style="margin-left:16px">${icon("chevron-left", { size: 18, color: "#8a95ad" })}</span>${icon("chevron-right", { size: 18, color: "#c0c8d8" })}${icon("rotate-cw", { size: 15, color: "#8a95ad", style: "margin-left:6px" })}
  <div class="row" style="margin:0 auto;gap:8px;height:30px;width:520px;justify-content:center;border-radius:9px;background:#fff;font-size:13.5px;color:#55617b">${icon("lock", { size: 12, stroke: 2.4, color: "#8a95ad" })}${url}</div><span style="width:110px"></span></div>`;
const DK_LOGO = (c = "#0b2a66", s = 1) => `<div class="row" style="gap:${10 * s}px;color:${c}"><svg width="${30 * s}" height="${30 * s}" viewBox="0 0 30 30"><circle cx="15" cy="15" r="14" fill="none" stroke="currentColor" stroke-width="2"/><path d="M6 19 C10 15 13 15 15 17 C17 19 20 19 24 15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M15 6 C12 9 12 12 15 14 C18 12 18 9 15 6Z" fill="currentColor"/></svg><span style="font-size:${17 * s}px;font-weight:600;letter-spacing:.22em">DEFNE KOY</span></div>`;
export const DK_ROOMS = [["Deniz Manzaralı Oda", "2 kişi · 28 m²", "₺6.400"], ["Bahçe Süit", "3 kişi · 42 m²", "₺8.900"], ["Koy Evi", "4 kişi · 64 m²", "₺12.600"]];
export function webDesktop() {
  return `<div style="width:1440px;height:900px;display:flex;flex-direction:column;background:#fff;font-family:Outfit;color:#0c1a3a;overflow:hidden">
    ${browserBar("defnekoy.com.tr")}
    <div style="position:relative;height:560px;flex-shrink:0" data-durak="hero">
      <div style="position:absolute;inset:0">${landscape(1440, 560, { id: "wd" })}</div>
      <div style="position:absolute;inset:0;background:linear-gradient(90deg,rgb(4 22 60/.55),rgb(4 22 60/.12) 55%,rgb(4 22 60/0))"></div>
      <div class="row" style="position:absolute;left:64px;right:64px;top:28px;gap:34px;color:#fff;font-size:15.5px">${DK_LOGO("#fff")}<span style="margin-left:auto">Odalar</span><span>Deneyimler</span><span>Restoran</span><span>Galeri</span><span>İletişim</span><span class="row" style="gap:6px;opacity:.85">${icon("globe", { size: 15 })}TR</span><span class="btn" style="height:42px;background:#fff;color:#0b2a66">Rezervasyon</span></div>
      <div style="position:absolute;left:64px;top:150px;width:640px;color:#fff">
        <div style="font-size:14px;font-weight:600;letter-spacing:.2em;opacity:.85">BOZCAADA · 18 ODA</div>
        <div style="font-size:62px;line-height:1.04;font-weight:500;letter-spacing:-.035em;margin-top:16px">Ege'nin sakin koyunda, size ait bir gün</div>
        <div style="font-size:19px;line-height:1.5;opacity:.88;margin-top:18px;width:520px">Denize sıfır odalar, bağ evinden kahvaltı ve gün batımına bakan teras.</div>
      </div>
    </div>
    <div style="position:relative;margin:-58px 64px 0;padding:18px;border-radius:20px;background:#fff;box-shadow:0 24px 50px -24px rgb(1 20 65/.35);display:flex;gap:12px;align-items:center" data-durak="rezervasyon">
      ${[["calendar", "Giriş", "17 Ekim, Cum"], ["calendar", "Çıkış", "19 Ekim, Paz"], ["users", "Misafir", "2 yetişkin"], ["bed-double", "Oda", "Tümü"]].map(([ic, a, b]) => `<div class="row" style="flex:1;gap:12px;padding:10px 14px;border-radius:14px;background:#f5f8fd">${icon(ic, { size: 20, color: "#2a6aca" })}<div><div style="font-size:12.5px;color:#7f8aa3">${a}</div><div style="font-size:16px;font-weight:600">${b}</div></div></div>`).join("")}
      <span class="btn pri" style="height:58px;padding:0 26px;font-size:16px;border-radius:14px;background:#0b2a66">${icon("search", { size: 18, stroke: 2.2 })}Uygun oda ara</span>
    </div>
    <div style="padding:30px 64px 0;display:flex;gap:22px" data-durak="odalar">
      ${DK_ROOMS.map(([n, s, p], i) => `<div style="flex:1;display:flex;gap:16px;align-items:center;padding:12px;border-radius:18px;background:#f5f8fd"><div style="width:118px;height:84px;border-radius:12px;overflow:hidden;flex-shrink:0">${roomArt(i)}</div><div style="min-width:0"><div style="font-size:16.5px;font-weight:600;${ELL}">${n}</div><div style="font-size:13.5px;color:#7f8aa3">${s}</div><div style="font-size:15px;margin-top:6px"><b style="color:#0b2a66">${p}</b> <span style="color:#8a95ad;font-size:13px">/ gece</span></div></div></div>`).join("")}
    </div>
  </div>`;
}
export function webMobile() {
  return `<div style="width:390px;height:844px;background:#fff;font-family:Outfit;color:#0c1a3a;display:flex;flex-direction:column;overflow:hidden">
    <div style="position:relative;height:470px;flex-shrink:0">
      <div style="position:absolute;inset:0">${landscape(390, 470, { id: "wm" })}</div>
      <div style="position:absolute;inset:0;background:linear-gradient(180deg,rgb(4 22 60/.45),rgb(4 22 60/.05) 45%,rgb(4 22 60/.5))"></div>
      <div style="position:relative">${statusBar("#fff")}</div>
      <div class="row" style="position:relative;padding:6px 22px;color:#fff">${DK_LOGO("#fff", 0.85)}<span style="margin-left:auto">${icon("menu", { size: 24, color: "#fff" })}</span></div>
      <div style="position:absolute;left:22px;right:22px;bottom:30px;color:#fff">
        <div style="font-size:12px;font-weight:600;letter-spacing:.2em;opacity:.85">BOZCAADA · 18 ODA</div>
        <div style="font-size:36px;line-height:1.06;font-weight:500;letter-spacing:-.03em;margin-top:10px">Ege'nin sakin koyunda, size ait bir gün</div>
      </div>
    </div>
    <div style="padding:18px 18px 0;display:flex;flex-direction:column;gap:12px;flex:1;min-height:0">
      <div class="row" style="gap:10px">${[["Giriş", "17 Eki"], ["Çıkış", "19 Eki"], ["Misafir", "2"]].map(([a, b]) => `<div style="flex:1;padding:10px 12px;border-radius:14px;background:#f5f8fd"><div style="font-size:12px;color:#7f8aa3">${a}</div><div style="font-size:15.5px;font-weight:600">${b}</div></div>`).join("")}</div>
      <span class="btn pri" style="height:52px;justify-content:center;border-radius:14px;font-size:16px;background:#0b2a66">${icon("search", { size: 18, stroke: 2.2 })}Uygun oda ara</span>
      <div class="row" style="padding-top:6px"><span style="font-size:18px;font-weight:600">Odalar</span><span style="margin-left:auto;font-size:14px;color:#2a6aca">Tümü</span></div>
      <div style="display:flex;gap:12px;align-items:center;padding:10px;border-radius:16px;background:#f5f8fd"><div style="width:96px;height:72px;border-radius:12px;overflow:hidden;flex-shrink:0">${roomArt(0)}</div><div style="min-width:0"><div style="font-size:15.5px;font-weight:600;${ELL}">${DK_ROOMS[0][0]}</div><div style="font-size:13px;color:#7f8aa3">${DK_ROOMS[0][1]}</div><div style="font-size:14.5px;margin-top:4px"><b style="color:#0b2a66">${DK_ROOMS[0][2]}</b> <span style="color:#8a95ad;font-size:12.5px">/ gece</span></div></div></div>
    </div>
    <div class="row" style="gap:10px;padding:12px 18px 28px;box-shadow:0 -10px 30px -24px rgb(12 26 58/.4)"><span class="btn sec" style="flex:1;justify-content:center;height:48px">${icon("phone", { size: 16 })}Ara</span><span class="btn pri" style="flex:1.4;justify-content:center;height:48px;background:#0b2a66">${icon("message-circle", { size: 16 })}Bize yazın</span></div>
  </div>`;
}
const WEB_NAV = (on) => [["layout-dashboard", "Proje Özeti"], ["network", "Site Yapısı"], ["gauge", "Performans"], ["square-pen", "İçerikler"], ["list-checks", "Yayın Listesi"], ["life-buoy", "Bakım ve Destek"], ["settings", "Ayarlar"]].map((x, i) => (i === on ? [x[0], x[1], true, x[3]] : x));
const WEB_USER = ["MÇ", "Melis Çınar", "Defne Koy Otel", 6];
const WEB_MAN = ["KA", "Kerem Alp", "Proje yöneticisi", 0];
export function webScores({ big = false } = {}) {
  const S = [["Performans", 98], ["Erişilebilirlik", 100], ["Teknik uygunluk", 100], ["Arama uyumu", 100]];
  const d = big ? 116 : 104;
  return `<div class="card" style="padding:22px 24px">
    ${cardHead("Sayfa puanları", "Ana sayfa · mobil ölçüm · 12 Ekim", tag(`${icon("circle-check", { size: 12, stroke: 2.4 })}Tümü yeşil`, "green"))}
    <div class="row" style="gap:12px;margin-top:20px">${S.map(([n, v]) => `<div style="flex:1;display:grid;justify-items:center;gap:10px;padding:16px 8px;border-radius:16px;background:#f5f8fd"><div style="position:relative;width:${d}px;height:${d}px">${ring(v, { d, thick: 10, color: "#16a34a", track: "#dff1e5" })}<div style="position:absolute;inset:0;display:grid;place-items:center;font-size:${big ? 32 : 29}px;font-weight:600;letter-spacing:-.03em;color:#12873f">${v}</div></div><div style="font-size:14px;font-weight:500;color:#3b4763">${n}</div></div>`).join("")}</div>
  </div>`;
}
export function webVitals() {
  return `<div class="card" style="padding:20px 22px">
    ${cardHead("Gerçek kullanıcı ölçümleri", "Son 28 gün · mobil")}
    <div style="display:grid;gap:16px;margin-top:16px">${[["En büyük içerik yüklemesi", "1,2 sn", 24, "2,5 sn altı iyi"], ["Etkileşim gecikmesi", "90 ms", 18, "200 ms altı iyi"], ["Görsel kayma", "0,01", 8, "0,1 altı iyi"]].map(([a, b, p, c]) => `<div><div class="row" style="font-size:14px;gap:10px"><span style="${ELL}">${a}</span><span style="margin-left:auto;font-weight:600;flex-shrink:0">${b}</span></div>
      <div style="position:relative;height:8px;border-radius:9px;background:linear-gradient(90deg,#c7ecd3 0 40%,#ffe7b8 40% 70%,#ffd0d0 70%);margin-top:8px"><span style="position:absolute;left:${p}%;top:50%;width:16px;height:16px;margin:-8px 0 0 -8px;border-radius:50%;background:#16a34a;border:3px solid #fff;box-shadow:0 2px 6px rgb(0 0 0/.2)"></span></div><div class="lbl" style="font-size:12px;margin-top:6px">${c}</div></div>`).join("")}</div>
  </div>`;
}
export function webDevices() {
  return `<div class="card" style="padding:20px 22px">
    ${cardHead("Cihaz testleri", "Son yayından sonra · 24 kontrol")}
    <div class="row" style="gap:10px;margin-top:16px">${[["smartphone", "Telefon", "8/8"], ["tablet-smartphone", "Tablet", "8/8"], ["monitor", "Masaüstü", "8/8"]].map(([ic, a, b]) => `<div style="flex:1;padding:14px;border-radius:14px;background:#f5f8fd;display:grid;justify-items:center;gap:6px">${icon(ic, { size: 24, color: "#2a6aca" })}<div style="font-size:13.5px;color:#55617b">${a}</div><div style="font-size:17px;font-weight:600;color:#12873f">${b}</div></div>`).join("")}</div>
  </div>`;
}
export function webPerfDesktop() {
  return app(guruSide("WEB", WEB_NAV(2), WEB_USER, WEB_MAN), `
    ${head("Performans ve Erişilebilirlik", "defnekoy.com.tr · 14 sayfa · her hafta ölçülür", sel("Ana sayfa", "file") + btn("Yeniden ölç", "refresh-cw", "pri"))}
    <div data-durak="puan">${webScores()}</div>
    <div style="flex:1;min-height:0;display:flex;gap:14px">
      <div style="flex:1;min-width:0" data-durak="vitals">${webVitals()}</div>
      <div style="width:400px;flex-shrink:0;display:flex;flex-direction:column;gap:14px">
        <div data-durak="cihaz">${webDevices()}</div>
        <div class="card" style="padding:18px 22px;flex:1;min-height:0">
          <div class="h3" style="font-size:15px">Sayfa ağırlığı</div>
          <div class="row" style="align-items:flex-end;gap:8px;margin-top:8px"><span style="font-size:30px;font-weight:600;letter-spacing:-.02em">640 KB</span><span class="up" style="font-size:13px;font-weight:600;padding-bottom:6px">%62 daha hafif</span></div>
          <div class="row" style="gap:4px;margin-top:12px;height:10px">${[["#2a6aca", 46], ["#44a1f1", 22], ["#8fc4f7", 18], ["#c9ddf6", 14]].map(([c, p]) => `<span style="width:${p}%;height:100%;border-radius:9px;background:${c}"></span>`).join("")}</div>
          <div class="row" style="gap:14px;margin-top:10px;font-size:12.5px;color:#55617b">${["Görsel", "Kod", "Yazı tipi", "Diğer"].map((t, i) => `<span class="row" style="gap:6px">${dot(["#2a6aca", "#44a1f1", "#8fc4f7", "#c9ddf6"][i], 7)}${t}</span>`).join("")}</div>
        </div>
      </div>
    </div>`);
}
export const SITEMAP = [["Ana sayfa", "house", 0], ["Odalar", "bed-double", 4], ["Deneyimler", "sailboat", 3], ["Restoran", "utensils", 1], ["Blog", "newspaper", 6], ["İletişim", "map-pin", 0]];
export function webSitemap({ w = 760 } = {}) {
  const kids = SITEMAP.slice(1);
  const cw = (w - 4 * 12) / 5;
  return `<div style="position:relative">
    <div style="display:flex;justify-content:center"><div class="row" style="gap:10px;padding:12px 18px;border-radius:14px;background:#12419b;color:#fff;font-size:15px;font-weight:600">${icon("house", { size: 17 })}Ana sayfa</div></div>
    <svg width="${w}" height="44" viewBox="0 0 ${w} 44" style="display:block">${kids.map((_, i) => { const x = i * (cw + 12) + cw / 2; return `<path d="M${w / 2} 0 V18 Q${w / 2} 22 ${w / 2 + (x > w / 2 ? 4 : x < w / 2 ? -4 : 0)} 22 H${x} Q${x} 22 ${x} 26 V44" fill="none" stroke="#b9cbe6" stroke-width="2"/>`; }).join("")}</svg>
    <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:12px">${kids.map(([n, ic, c]) => `<div style="display:grid;gap:8px"><div style="padding:12px;border-radius:14px;background:#fff;box-shadow:0 1px 2px rgb(12 26 58/.05),0 8px 20px -14px rgb(12 26 58/.3)"><div class="row" style="gap:8px">${icon(ic, { size: 16, color: "#2a6aca" })}<span style="font-size:14.5px;font-weight:600;${ELL}">${n}</span></div><div style="font-size:12px;color:#8a95ad;margin-top:4px">${c ? `${c} alt sayfa` : "Tek sayfa"}</div></div>
      ${Array.from({ length: Math.min(c, 3) }, (_, k) => `<div style="height:30px;border-radius:9px;background:#eef3fa;margin-left:12px;display:flex;align-items:center;padding:0 10px;font-size:12px;color:#55617b;${ELL}">${[["Deniz Manzaralı Oda", "Bahçe Süit", "Koy Evi"], ["Tekne turu", "Bağ gezisi", "Yoga"], ["Menü"], [], ["Bozcaada rehberi", "Gün batımı", "Bağ bozumu"]][SITEMAP.findIndex((s) => s[0] === n) - 1][k] ?? ""}</div>`).join("")}${c > 3 ? `<div style="font-size:12px;color:#8a95ad;margin-left:14px">+${c - 3} sayfa</div>` : ""}</div>`).join("")}</div>
  </div>`;
}
export function webChecklist() {
  const L = [["SSL sertifikası ve güvenli bağlantı", 1], ["Eski adreslerden yönlendirmeler", 1], ["Rezervasyon formu testi", 1], ["Görsellerin sıkıştırılması", 1], ["Arama motoru doğrulaması", 0], ["Yayın sonrası yedekleme", 0]];
  return `<div class="card" style="padding:20px 22px">
    ${cardHead("Yayın kontrol listesi", "", tag("4/6", "blue"))}
    <div style="display:grid;gap:12px;margin-top:14px">${L.map(([t, ok]) => `<div class="row" style="gap:11px;font-size:14px;min-width:0">${ok ? `<span style="width:22px;height:22px;border-radius:7px;background:#16a34a;display:grid;place-items:center;flex-shrink:0">${icon("check", { size: 14, color: "#fff", stroke: 3 })}</span>` : `<span style="width:22px;height:22px;border-radius:7px;background:#fff;box-shadow:inset 0 0 0 2px #cfd8e6;flex-shrink:0"></span>`}<span style="${ELL};${ok ? "color:#55617b" : "font-weight:500"}">${t}</span></div>`).join("")}</div>
  </div>`;
}
export function webPhases() {
  const P = [["Keşif", "Tamamlandı", 1], ["Tasarım", "Tamamlandı", 1], ["Geliştirme", "Tamamlandı", 1], ["Test", "Sürüyor", 0.6], ["Yayın", "20 Ekim", 0]];
  return `<div class="card" style="padding:18px 22px">
    <div class="row" style="gap:0">${P.map(([n, s, p], i) => `<div style="flex:1;min-width:0"><div class="row" style="gap:0"><span style="width:26px;height:26px;border-radius:50%;flex-shrink:0;display:grid;place-items:center;${p === 1 ? "background:#12419b" : p ? "background:#fff;box-shadow:inset 0 0 0 3px #2a6aca" : "background:#e3eaf5"}">${p === 1 ? icon("check", { size: 14, color: "#fff", stroke: 3 }) : ""}</span>${i < 4 ? `<span style="flex:1;height:3px;margin:0 8px;border-radius:9px;background:${p === 1 ? "#12419b" : "#e3eaf5"}"></span>` : ""}</div><div style="font-size:14.5px;font-weight:600;margin-top:8px">${n}</div><div style="font-size:12.5px;color:${p && p < 1 ? "#2a6aca" : "#8a95ad"}">${s}</div></div>`).join("")}</div>
  </div>`;
}
export function webSiteDesktop() {
  return app(guruSide("WEB", WEB_NAV(1), WEB_USER, WEB_MAN), `
    ${head("Site Yapısı", "defnekoy.com.tr · 18 sayfa · 2 dil", sel("Türkçe", "languages") + btn("Sayfa ekle", "plus", "pri"))}
    <div data-durak="asama">${webPhases()}</div>
    <div style="flex:1;min-height:0;display:flex;gap:14px">
      <div class="card" style="flex:1;min-width:0;padding:22px 24px" data-durak="harita">
        ${cardHead("Sayfa haritası", "Ziyaretçinin rezervasyona ulaştığı yol", tag("18 sayfa", "blue"))}
        <div style="margin-top:22px">${webSitemap({ w: 712 })}</div>
      </div>
      <div style="width:350px;flex-shrink:0" data-durak="liste">${webChecklist()}</div>
    </div>`);
}

/* ======================================================================
   3. SEO · müşteri: Ekin Diş Kliniği
   ====================================================================== */
const SEO_NAV = (on) => [["layout-dashboard", "Görünürlük"], ["key-round", "Anahtar Kelimeler", false, 86], ["wrench", "Teknik Denetim"], ["languages", "Diller"], ["map-pin", "Yerel SEO"], ["file-chart-column", "Raporlar"], ["settings", "Ayarlar"]].map((x, i) => (i === on ? [x[0], x[1], true, x[3]] : x));
const SEO_USER = ["EK", "Dr. Ekin Kara", "Ekin Diş Kliniği", 3];
const SEO_MAN = ["OB", "Onur Baysal", "SEO uzmanı", 5];
export const SEO_CLICKS = [6.2, 6.8, 7.4, 8.1, 9.6, 10.8, 11.9, 13.2, 14.6, 15.4, 16.9, 18.4];
export function seoTrend({ w = 640, h = 220 } = {}) {
  const L = ["Eki", "Kas", "Ara", "Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl"];
  return `<div class="card" style="padding:20px 24px;height:100%;display:flex;flex-direction:column">
    ${cardHead("Organik tıklama", "Son 12 ay · arama sonuçlarından gelen ziyaret", `<span class="row" style="gap:7px;font-size:13px;color:#55617b"><span style="width:18px;height:4px;border-radius:9px;background:#2a6aca"></span>Tıklama</span><span class="row" style="gap:7px;font-size:13px;color:#55617b"><span style="width:18px;height:4px;border-radius:9px;background:#b9c7e0"></span>Önceki yıl</span>`)}
    <div style="position:relative;margin-top:auto;padding-top:26px">${line([SEO_CLICKS, [5.1, 5.3, 5.2, 5.6, 6.0, 6.1, 5.9, 6.4, 6.6, 6.5, 6.9, 7.1]], { w, h, min: 0, max: 21 })}
      <div style="position:absolute;right:-8px;top:-8px;padding:6px 11px;border-radius:10px;background:#011441;color:#fff;font-size:13.5px;font-weight:600;white-space:nowrap">Eyl · 18,4B</div>
      <div class="row" style="justify-content:space-between;margin-top:12px;font-size:13px;color:#8a95ad">${L.map((m, i) => `<span style="${i === 11 ? "color:#0c1a3a;font-weight:600" : ""}">${m}</span>`).join("")}</div></div>
  </div>`;
}
export function seoDist() {
  const D = [["1-3. sıra", 24, "#12419b"], ["4-10. sıra", 62, "#2a6aca"], ["11-20. sıra", 41, "#8fc4f7"], ["21-50. sıra", 37, "#c9ddf6"]];
  return `<div class="card" style="padding:20px 22px;height:100%;display:flex;flex-direction:column">
    ${cardHead("Sıralama dağılımı", "164 takip edilen kelime")}
    <div style="display:grid;gap:14px;margin-top:18px">${D.map(([a, v, c]) => `<div><div class="row" style="font-size:14px"><span>${a}</span><span style="margin-left:auto;font-weight:600">${v}</span></div><div style="margin-top:7px">${meter((v / 62) * 100, c, 10, "#eef3fa")}</div></div>`).join("")}</div>
    <div class="row" style="gap:10px;margin-top:auto;padding:12px 14px;border-radius:14px;background:#e6f6ec;font-size:13.5px;color:#12873f;font-weight:500">${icon("trending-up", { size: 16, stroke: 2.4 })}İlk 10'da 86 kelime · 3 ayda +24</div>
  </div>`;
}
export const SEO_KW = [["implant tedavisi kadıköy", "1.900", 3, 5, "/implant-tedavisi"], ["diş beyazlatma fiyatları", "4.400", 6, 2, "/dis-beyazlatma"], ["zirkonyum kaplama", "2.900", 4, 7, "/zirkonyum-kaplama"], ["çocuk diş hekimi kadıköy", "880", 2, 1, "/cocuk-dis-hekimi"], ["acil diş hekimi istanbul", "1.300", 9, 12, "/acil-dis-hekimi"], ["diş teli tedavisi süresi", "1.600", 7, 4, "/blog/dis-teli-suresi"]];
export function seoKwTable({ n = 5, rh = 46 } = {}) {
  const pos = (p, d) => `<span class="row" style="gap:8px;justify-content:flex-end"><b style="font-size:15px">${p}</b><span class="row" style="gap:2px;font-size:12.5px;font-weight:600;color:#12873f">${icon("arrow-up", { size: 13, stroke: 2.6 })}${d}</span></span>`;
  return table("minmax(0,2.2fr) .8fr 1fr minmax(0,1.6fr)", ["Anahtar kelime", "r:Aylık arama", "r:Sıra", "Sayfa"], SEO_KW.slice(0, n).map(([k, v, p, d, u]) => [`<b style="font-weight:500">${k}</b>`, v, pos(p, d), `<span style="color:#2a6aca">${u}</span>`]), { rh });
}
export function seoDesktop() {
  return app(guruSide("SEO", SEO_NAV(0), SEO_USER, SEO_MAN), `
    ${head("Organik Görünürlük", "ekindis.com.tr · Eylül 2026 · Türkiye", sel("Son 12 ay", "calendar") + btn("Aylık rapor", "file-down", "pri"))}
    <div class="row" style="gap:14px" data-durak="kpi">
      ${kpi("Organik tıklama", "18.420", "+%46", "mouse-pointer-click", { note: "geçen yıla göre" })}
      ${kpi("Gösterim", "612 B", "+%38", "eye", { note: "geçen yıla göre" })}
      ${kpi("Ortalama sıra", "8,4", "3,1 sıra", "list-ordered", { note: "yükseldi" })}
      ${kpi("İlk 10'daki kelime", "86", "+24", "key-round", { note: "son 3 ay" })}
    </div>
    <div style="flex:1;min-height:0;display:flex;gap:14px">
      <div style="flex:1;min-width:0" data-durak="trend">${seoTrend()}</div>
      <div style="width:340px;flex-shrink:0" data-durak="dagilim">${seoDist()}</div>
    </div>
    <div class="card" style="padding:18px 20px 8px" data-durak="kelime">
      ${cardHead("Yükselen kelimeler", "Son 30 gün", `<span class="lbl">86 kelime</span>${icon("chevron-right", { size: 16, color: "#8a95ad" })}`)}
      <div style="margin-top:12px">${seoKwTable({ n: 4, rh: 46 })}</div>
    </div>`);
}
export const SEO_AUDIT = [
  ["Core Web Vitals", "Tüm sayfalar iyi aralıkta", "ok"],
  ["Kırık bağlantılar", "3 bağlantı düzeltildi", "ok"],
  ["Site haritası ve robots.txt", "Güncel, 48 adres", "ok"],
  ["Eksik meta açıklaması", "5 sayfa · içerik ekibinde", "warn"],
  ["Görsel alt metinleri", "12 görsel · bu hafta", "warn"],
  ["Yönlendirme zinciri", "2 adres · tek adıma indirilecek", "warn"],
  ["Yapılandırılmış veri", "Klinik ve SSS işaretlemesi eklendi", "ok"],
];
export function seoAuditList({ n = 7, rh = 54 } = {}) {
  return `<div style="display:grid;gap:4px">${SEO_AUDIT.slice(0, n).map(([t, s, st]) => `<div class="row" style="gap:14px;height:${rh}px;padding:0 12px;border-radius:12px;min-width:0">${st === "ok" ? ib("circle-check", "green", 34) : ib("triangle-alert", "amber", 34)}<div style="flex:1;min-width:0"><div style="font-size:14.5px;font-weight:600;${ELL}">${t}</div><div style="font-size:12.5px;color:#8a95ad;${ELL}">${s}</div></div>${st === "ok" ? tag("Tamam", "green") : tag("Sürüyor", "amber")}</div>`).join("")}</div>`;
}
export function seoHealth() {
  return `<div class="card" style="padding:22px 24px">
    <div class="row" style="gap:22px"><div style="position:relative;width:128px;height:128px;flex-shrink:0">${ring(92, { d: 128, thick: 13, color: "#16a34a", track: "#dff1e5" })}<div style="position:absolute;inset:0;display:grid;place-items:center;text-align:center;line-height:1.05"><div><div style="font-size:34px;font-weight:600;letter-spacing:-.03em">92</div><div style="font-size:12px;color:#7f8aa3">/ 100</div></div></div></div>
      <div><div style="font-size:18px;font-weight:600">Site sağlığı</div><div class="lbl" style="font-size:13.5px;margin-top:3px;line-height:1.4">Taranan 48 sayfa<br>Son tarama: bugün 06:00</div><div style="margin-top:10px">${up("Ağustostan 17 puan")}</div></div></div>
    <div class="row" style="gap:10px;margin-top:18px">${[["Kritik", "0", "green"], ["Uyarı", "7", "amber"], ["Bilgi", "14", "blue"]].map(([a, b, t]) => `<div style="flex:1;padding:10px 12px;border-radius:12px;background:${IC[t][0]}"><div style="font-size:12.5px;color:${IC[t][1]}">${a}</div><div style="font-size:21px;font-weight:600;color:${IC[t][1]}">${b}</div></div>`).join("")}</div>
  </div>`;
}
export function seoAuditDesktop() {
  return app(guruSide("SEO", SEO_NAV(2), SEO_USER, SEO_MAN), `
    ${head("Teknik Denetim", "ekindis.com.tr · 48 sayfa tarandı · bugün 06:00", btn("Tarama geçmişi", "history") + btn("Yeniden tara", "refresh-cw", "pri"))}
    <div style="flex:1;min-height:0;display:flex;gap:14px">
      <div class="card" style="flex:1;min-width:0;padding:20px 20px 12px" data-durak="liste">
        ${cardHead("Kontrol listesi", "Öncelik sırasına göre", tag("4 tamam · 3 sürüyor", "blue"))}
        <div style="margin-top:12px">${seoAuditList({ rh: 60 })}</div>
        <div class="row" style="gap:10px;margin:8px 12px 0;padding:12px 14px;border-radius:12px;background:#f5f8fd;font-size:13.5px;color:#55617b">${icon("info", { size: 16, color: "#2a6aca" })}Uyarılar bu ayın iş planında; bitince rapora işlenir.</div>
      </div>
      <div style="width:400px;flex-shrink:0;display:flex;flex-direction:column;gap:14px">
        <div data-durak="saglik">${seoHealth()}</div>
        <div class="card" style="padding:20px 22px;flex:1;min-height:0" data-durak="hiz">
          ${cardHead("Sayfa hızı", "Mobil · en büyük içerik yüklemesi")}
          <div style="margin-top:16px">${bars([3.9, 3.4, 2.6, 2.1, 1.6, 1.3], { w: 352, h: 150, hi: 5, labels: ["Nis", "May", "Haz", "Tem", "Ağu", "Eyl"], showVals: true, fs: 12, r: 8 }).replace(/>(\d)\.(\d)</g, ">$1,$2<")}</div>
          <div class="lbl" style="font-size:12.5px;margin-top:10px">saniye · 2,5 sn altı iyi kabul edilir</div>
        </div>
      </div>
    </div>`);
}
export const SEO_LANG = [["TR", "Türkçe", 48, 48, "Kaynak dil", 9.6], ["EN", "İngilizce", 32, 31, "hreflang tamam", 5.1], ["DE", "Almanca", 18, 18, "hreflang tamam", 2.4], ["AR", "Arapça", 12, 10, "2 sayfa bekliyor", 1.3]];
export function seoLangCards() {
  return `<div class="row" style="gap:14px">${SEO_LANG.map(([c, n, p, idx, st, cl]) => `<div class="card" style="flex:1;min-width:0;padding:18px 20px">
    <div class="row" style="gap:10px"><span style="width:40px;height:40px;border-radius:12px;background:#12419b;color:#fff;display:grid;place-items:center;font-weight:700;font-size:15px;letter-spacing:.04em">${c}</span><div><div style="font-size:16px;font-weight:600">${n}</div><div class="lbl" style="font-size:12.5px">${p} sayfa</div></div></div>
    <div class="row" style="margin-top:14px;font-size:13px;color:#55617b">Dizinde<span style="margin-left:auto;font-weight:600;color:#0c1a3a">${idx}/${p}</span></div><div style="margin-top:6px">${meter((idx / p) * 100, idx === p ? "#16a34a" : "#e8a33a", 6)}</div>
    <div class="row" style="gap:8px;margin-top:12px">${idx === p ? tag(st, c === "TR" ? "gray" : "green") : tag(st, "amber")}<span style="margin-left:auto;font-size:13px;color:#55617b">${String(cl).replace(".", ",")}B tık</span></div></div>`).join("")}</div>`;
}
export function seoLangMatrix() {
  const R = [["Ana sayfa", [1, 1, 1, 1]], ["İmplant tedavisi", [1, 1, 1, 1]], ["Zirkonyum kaplama", [1, 1, 1, 0]], ["Diş beyazlatma", [1, 1, 1, 1]], ["Sağlık turizmi", [1, 1, 1, 0]], ["İletişim ve ulaşım", [1, 1, 1, 1]]];
  return `<div class="card" style="padding:20px 22px">
    ${cardHead("Sayfa eşleşmeleri", "Her sayfanın dil karşılıkları ve hreflang bağlantısı")}
    <div style="margin-top:12px">${table("minmax(0,2fr) repeat(4,.7fr)", ["Sayfa", "TR", "EN", "DE", "AR"], R.map(([n, a]) => [`<b style="font-weight:500">${n}</b>`, ...a.map((v) => (v ? icon("circle-check", { size: 19, color: "#16a34a", stroke: 2.2 }) : icon("clock", { size: 19, color: "#e8a33a", stroke: 2.2 })))]), { rh: 44 })}</div>
  </div>`;
}
export function seoLangDesktop() {
  return app(guruSide("SEO", SEO_NAV(3), SEO_USER, SEO_MAN), `
    ${head("Çok Dilli Sayfalar", "4 dil · 110 sayfa · uluslararası hasta trafiği", sel("Tüm ülkeler", "globe") + btn("Dil ekle", "plus", "pri"))}
    <div data-durak="diller">${seoLangCards()}</div>
    <div style="flex:1;min-height:0;display:flex;gap:14px">
      <div style="flex:1;min-width:0" data-durak="matris">${seoLangMatrix()}</div>
      <div class="card" style="width:360px;flex-shrink:0;padding:20px 22px" data-durak="ulke">
        ${cardHead("Ülkelere göre tıklama", "Eylül · Türkiye hariç")}
        <div style="display:grid;gap:13px;margin-top:16px">${[["Almanya", 2140, 100], ["Birleşik Krallık", 1630, 76], ["Hollanda", 980, 46], ["Suudi Arabistan", 760, 36], ["Azerbaycan", 520, 24], ["Fransa", 410, 19]].map(([a, v, p]) => `<div><div class="row" style="font-size:14px"><span>${a}</span><span style="margin-left:auto;font-weight:600">${v.toLocaleString("tr-TR")}</span></div><div style="margin-top:6px">${meter(p, "#2a6aca", 6)}</div></div>`).join("")}</div>
      </div>
    </div>`);
}
export function seoMobile() {
  return phoneScreen(`
    ${mHead("Eylül raporu", "ekindis.com.tr · SEO")}
    <div style="padding:18px;border-radius:20px;background:linear-gradient(150deg,#011441,#12419b 65%,#2a6aca);color:#fff">
      <div style="font-size:13px;opacity:.75">Organik tıklama</div>
      <div class="row" style="align-items:flex-end;gap:10px;margin-top:4px"><span style="font-size:34px;font-weight:600;letter-spacing:-.03em">18.420</span><span style="font-size:13px;font-weight:600;padding:4px 9px;border-radius:999px;background:rgb(255 255 255/.15);margin-bottom:6px">+%46</span></div>
      <div style="margin-top:10px">${line([SEO_CLICKS], { w: 318, h: 70, min: 4, max: 20, colors: ["#bfe0ff"], dots: [true], dash: [false], width: [3] }).replace(/fill="#fff" stroke="#bfe0ff"/, 'fill="#12419b" stroke="#fff"')}</div>
    </div>
    <div class="card" style="padding:16px 18px">
      <div class="row"><span class="h3" style="font-size:15.5px">En çok yükselenler</span><span style="margin-left:auto;font-size:13px;color:#2a6aca">Tümü</span></div>
      <div style="display:grid;gap:12px;margin-top:12px">${SEO_KW.slice(0, 4).map(([k, , p, d]) => `<div class="row" style="gap:12px;min-width:0"><span style="width:36px;height:36px;border-radius:11px;background:#eaf2ff;color:#12419b;display:grid;place-items:center;font-weight:700;font-size:15px;flex-shrink:0">${p}</span><span style="flex:1;font-size:14px;font-weight:500;${ELL}">${k}</span><span class="row" style="gap:2px;font-size:12.5px;font-weight:600;color:#12873f;flex-shrink:0">${icon("arrow-up", { size: 13, stroke: 2.6 })}${d}</span></div>`).join("")}</div>
    </div>
    <div class="card" style="padding:16px 18px" class="row">
      <div class="row" style="gap:14px"><div style="position:relative;width:64px;height:64px;flex-shrink:0">${ring(92, { d: 64, thick: 8, color: "#16a34a", track: "#dff1e5" })}<div style="position:absolute;inset:0;display:grid;place-items:center;font-size:18px;font-weight:600">92</div></div><div style="min-width:0"><div style="font-size:15px;font-weight:600">Site sağlığı</div><div style="font-size:12.5px;color:#8a95ad">0 kritik · 7 uyarı · bugün tarandı</div></div></div>
    </div>`, [["layout-dashboard", "Özet", true], ["key-round", "Kelimeler"], ["wrench", "Denetim"], ["message-circle", "Mesajlar"]]);
}
