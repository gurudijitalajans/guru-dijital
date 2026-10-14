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
export function rekCampaigns({ n = 3 } = {}) {
  const st = (t) => (t === "Aktif" ? tag(`${dot("#16a34a", 6)}Aktif`, "green") : tag(`${dot("#e8a33a", 6)}Öğreniyor`, "amber"));
  return `<div class="card" style="padding:18px 20px 8px">
    ${cardHead("Kampanyalar", "En çok harcayan 3 kampanya", `<span class="lbl">Tümünü gör</span>${icon("chevron-right", { size: 16, color: "#8a95ad" })}`)}
    <div style="margin-top:12px">${table("minmax(0,2.3fr) 1.2fr 1fr .9fr .8fr .6fr", ["Kampanya", "Kanal", "Durum", "r:Harcama", "r:Dönüşüm", "r:ROAS"], [
      ["<b style='font-weight:600'>Sonbahar Cilt Bakımı</b> · Arama", "Google Arama", st("Aktif"), "₺38.200", "612", "<b>7,2x</b>"],
      ["<b style='font-weight:600'>Serum Yeniden Pazarlama</b>", "Meta", st("Aktif"), "₺21.400", "388", "<b>6,1x</b>"],
      ["<b style='font-weight:600'>Yeni Sezon Ruj</b> · Video", "TikTok", st("Öğreniyor"), "₺14.900", "142", "<b>3,4x</b>"],
    ].slice(0, n), { rh: 46 })}</div>
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
      <div style="flex:1;min-width:0" data-durak="trend">${rekTrend({ w: 684, h: 200 })}</div>
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
export function rekVariant(v, { h = 250, fill = false } = {}) {
  const A = v === "A";
  const m = A ? [["Tıklama", "%1,9", ""], ["Dönüşüm", "%2,6", ""], ["Maliyet", "₺94", ""]] : [["Tıklama", "%2,7", "+%42"], ["Dönüşüm", "%3,6", "+%38"], ["Maliyet", "₺68", "−%28"]];
  const m2 = A ? [["Gösterim", "93.400"], ["Tıklama", "1.775"], ["Dönüşüm", "46"]] : [["Gösterim", "92.600"], ["Tıklama", "2.500"], ["Dönüşüm", "90"]];
  return `<div class="card" style="padding:18px;${fill ? "height:100%;display:flex;flex-direction:column;" : ""}${A ? "" : "box-shadow:0 0 0 2px #2a6aca,0 18px 40px -20px rgb(18 65 155/.5)"}">
    <div class="row" style="gap:10px;padding:0 4px 14px"><span style="width:30px;height:30px;border-radius:9px;background:${A ? "#eef1f6" : "#12419b"};color:${A ? "#55617b" : "#fff"};display:grid;place-items:center;font-weight:700;font-size:15px">${v}</span><div><div style="font-size:16px;font-weight:600">${A ? "Ürün odaklı" : "Kullanıcı yorumu"}</div><div class="lbl" style="font-size:12.5px">${A ? "Ürün görseli ve fayda" : "Gerçek alıcı yorumu"}</div></div>
      ${A ? tag("Kontrol", "gray", "margin-left:auto") : tag(`${icon("trophy", { size: 12, stroke: 2.4 })}Kazanan`, "green", "margin-left:auto")}</div>
    ${adPreview(v, { h })}
    <div class="row" style="gap:10px;margin-top:14px">${m.map(([l, val, d]) => `<div style="flex:1;min-width:0;padding:11px 12px;border-radius:12px;background:${A ? "#f5f8fd" : "#eef5ff"}"><div style="font-size:12px;color:#7f8aa3;${ELL}">${l}</div><div class="row" style="gap:6px;margin-top:3px"><span style="font-size:19px;font-weight:600;letter-spacing:-.02em">${val}</span>${d ? `<span style="font-size:12px;font-weight:600;color:#12873f">${d}</span>` : ""}</div></div>`).join("")}</div>
    ${fill ? `<div class="row" style="gap:10px;margin-top:10px">${m2.map(([l, val]) => `<div style="flex:1;min-width:0;padding:9px 12px;border-radius:12px;background:#f5f8fd"><div style="font-size:12px;color:#7f8aa3">${l}</div><div style="font-size:16px;font-weight:600;margin-top:2px">${val}</div></div>`).join("")}</div>` : ""}
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
      <div style="flex:1;min-width:0" data-durak="a">${rekVariant("A", { h: 400, fill: true })}</div>
      <div style="flex:1;min-width:0" data-durak="b">${rekVariant("B", { h: 400, fill: true })}</div>
      <div style="width:320px;flex-shrink:0;display:flex;flex-direction:column;gap:14px">
        <div data-durak="sonuc">${rekTestResult()}</div>
        <div class="card" style="padding:18px 20px" data-durak="sirada">
          <div class="row" style="gap:12px">${ib("flask-conical", "violet", 38)}<div><div style="font-size:15px;font-weight:600">Sıradaki test</div><div class="lbl" style="font-size:12.5px">6 Ekim'de başlar</div></div></div>
          <div style="font-size:14px;color:#3b4763;line-height:1.45;margin-top:12px">Başlık: <b>fiyat avantajı</b> ile <b>cilt faydası</b> karşılaştırması</div>
          <div class="row" style="gap:8px;margin-top:12px">${tag("Meta", "blue")}${tag("TikTok", "gray")}${tag("₺6.000 bütçe", "amber")}</div>
        </div>
        <div class="card" style="padding:16px 20px;flex:1;min-height:0">
          <div class="h3" style="font-size:15px">Test geçmişi</div>
          <div style="display:grid;gap:11px;margin-top:12px">${[["Video ilk 3 saniye", "+%24 izlenme", "Eylül"], ["Ücretsiz kargo vurgusu", "+%11 tıklama", "Ağustos"], ["Karusel ve tek görsel", "Fark yok", "Ağustos"], ["Fiyat etiketi görünürlüğü", "+%9 dönüşüm", "Temmuz"], ["Kısa ve uzun metin", "+%6 tıklama", "Temmuz"]].map(([a, b, c], i) => `<div class="row" style="gap:10px;font-size:13.5px;min-width:0;padding:4px 0">${dot(i !== 2 ? "#16a34a" : "#a0aac0", 7)}<div style="flex:1;min-width:0"><div style="${ELL}">${a}</div><div style="font-size:12px;color:#8a95ad">${c}</div></div><span style="flex-shrink:0;font-weight:600;color:${i !== 2 ? "#12873f" : "#7f8aa3"}">${b}</span></div>`).join("")}</div>
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
          <div style="margin-top:auto">${rekReportBars({ w: 700, h: 400 })}</div>
        </div>
      </div>
      <div style="width:370px;flex-shrink:0;display:flex;flex-direction:column;gap:14px">
        <div data-durak="hedef">${rekGoals()}</div>
        <div data-durak="plan">${rekPlan()}</div>
        <div class="card" style="padding:18px 22px;flex:1;min-height:0" data-durak="pay">
          ${cardHead("Harcama payı", "Kanallara göre · Eylül")}
          <div class="row" style="gap:18px;margin-top:12px"><div style="position:relative;width:108px;height:108px;flex-shrink:0">${donut([{ v: 111, c: "#12419b" }, { v: 31, c: "#2a6aca" }, { v: 15, c: "#8fc4f7" }, { v: 29, c: "#c9ddf6" }], { d: 108, thick: 16 })}<div style="position:absolute;inset:0;display:grid;place-items:center;font-size:16px;font-weight:600">₺186K</div></div>
            <div style="display:grid;gap:8px;flex:1;min-width:0">${[["Google", "%60", "#12419b"], ["Meta", "%17", "#2a6aca"], ["TikTok", "%8", "#8fc4f7"], ["Diğer", "%15", "#c9ddf6"]].map(([a, b, c]) => `<div class="row" style="gap:8px;font-size:13.5px">${dot(c, 8)}<span>${a}</span><span style="margin-left:auto;font-weight:600">${b}</span></div>`).join("")}</div></div>
        </div>
        <div class="card" style="padding:18px 22px;background:linear-gradient(150deg,#011441,#12419b 70%,#2a6aca);color:#fff">
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
    <g transform="translate(1200 0) scale(-1 1)">
    <path d="M0 600 L0 420 C80 400 150 380 230 392 C300 402 340 440 400 470 C460 500 470 560 520 600Z" fill="#163a72"/>
    <path d="M0 600 L0 470 C70 452 140 440 200 456 C260 472 300 520 330 600Z" fill="#0d2a58"/>
    <g fill="#fff">${[[96, 392, 70, 34], [170, 380, 56, 46], [236, 398, 44, 30]].map(([x, y, w2, h2]) => `<rect x="${x}" y="${y}" width="${w2}" height="${h2}" rx="2"/>`).join("")}</g>
    <g fill="#8fb6e6">${[[108, 404], [130, 404], [182, 394], [204, 394], [182, 410], [204, 410], [246, 408]].map(([x, y]) => `<rect x="${x}" y="${y}" width="12" height="10" rx="1.5"/>`).join("")}</g>
    <g fill="#24508f">${[[60, 410, 22], [290, 412, 18], [330, 430, 24], [40, 448, 28]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}"/>`).join("")}</g>
    </g>
    <path d="M0 600 L0 500 C70 490 120 510 160 540 C190 565 200 590 210 600Z" fill="#163a72"/>
    <path d="M560 470 l18 -40 l18 40 Z" fill="#fff" opacity=".9"/><rect x="577" y="430" width="2" height="44" fill="#0d2a58"/>
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
    <div class="row" style="margin:26px 64px 0;gap:22px;padding-top:22px;box-shadow:inset 0 1px 0 #edf1f7">${[["waves-horizontal", "Denize sıfır", "Özel iskele ve şezlong"], ["coffee", "Bağ evi kahvaltısı", "Yerel üreticiden"], ["calendar-check", "Ücretsiz iptal", "Girişten 7 gün önceye kadar"], ["car", "Transfer", "İskeleden otele"]].map(([ic, a, b]) => `<div class="row" style="flex:1;gap:12px;min-width:0">${ib(ic, "blue", 40)}<div style="min-width:0"><div style="font-size:15px;font-weight:600">${a}</div><div style="font-size:13px;color:#7f8aa3;${ELL}">${b}</div></div></div>`).join("")}</div>
  </div>`;
}
export function webMobile() {
  return `<div style="width:390px;height:844px;background:#fff;font-family:Outfit;color:#0c1a3a;display:flex;flex-direction:column;overflow:hidden">
    <div style="position:relative;height:446px;flex-shrink:0">
      <div style="position:absolute;inset:0">${landscape(390, 446, { id: "wm" })}</div>
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
export function webVitals({ n = 4 } = {}) {
  return `<div class="card" style="padding:20px 22px;height:100%">
    ${cardHead("Gerçek kullanıcı ölçümleri", "Son 28 gün · mobil")}
    <div style="display:grid;gap:26px;margin-top:22px">${[["En büyük içerik yüklemesi", "1,2 sn", 24, "2,5 sn altı iyi"], ["Etkileşim gecikmesi", "90 ms", 18, "200 ms altı iyi"], ["Görsel kayma", "0,01", 8, "0,1 altı iyi"], ["Sunucu yanıt süresi", "180 ms", 15, "800 ms altı iyi"]].slice(0, n).map(([a, b, p, c]) => `<div><div class="row" style="font-size:14px;gap:10px"><span style="${ELL}">${a}</span><span style="margin-left:auto;font-weight:600;flex-shrink:0">${b}</span></div>
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
        <div class="card" style="padding:18px 22px;flex:1;min-height:0" data-durak="erisim">
          ${cardHead("Erişilebilirlik kontrolleri", "Her yayından önce", tag("4/4", "green"))}
          <div style="display:grid;gap:13px;margin-top:14px">${["Renk kontrastı yeterli", "Tüm görsellerde alternatif metin", "Klavye ile gezinme", "Form alanlarında etiket"].map((t) => `<div class="row" style="gap:11px;font-size:14px"><span style="width:22px;height:22px;border-radius:7px;background:#16a34a;display:grid;place-items:center;flex-shrink:0">${icon("check", { size: 14, color: "#fff", stroke: 3 })}</span>${t}</div>`).join("")}</div>
        </div>
        <div style="display:none">
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
    <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:12px;align-items:start">${kids.map(([n, ic, c]) => `<div style="display:grid;gap:8px;align-content:start"><div style="padding:12px;border-radius:14px;background:#fff;box-shadow:0 1px 2px rgb(12 26 58/.05),0 8px 20px -14px rgb(12 26 58/.3)"><div class="row" style="gap:8px">${icon(ic, { size: 16, color: "#2a6aca" })}<span style="font-size:14.5px;font-weight:600;${ELL}">${n}</span></div><div style="font-size:12px;color:#8a95ad;margin-top:4px">${c ? `${c} alt sayfa` : "Tek sayfa"}</div></div>
      ${Array.from({ length: Math.min(c, 3) }, (_, k) => `<div style="height:30px;border-radius:9px;background:#eef3fa;margin-left:12px;display:flex;align-items:center;padding:0 10px;font-size:12px;color:#55617b;${ELL}">${[["Deniz Manzaralı", "Bahçe Süit", "Koy Evi"], ["Tekne turu", "Bağ gezisi", "Yoga"], ["Menü"], ["Bozcaada rehberi", "Gün batımı", "Bağ bozumu"], []][SITEMAP.findIndex((s) => s[0] === n) - 1][k] ?? ""}</div>`).join("")}${c > 3 ? `<div style="font-size:12px;color:#8a95ad;margin-left:14px">+${c - 3} sayfa</div>` : ""}</div>`).join("")}</div>
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
        <div style="margin-top:26px;padding:16px 18px;border-radius:16px;background:#f5f8fd" data-durak="yol">
          <div class="row" style="font-size:14px;font-weight:600">Rezervasyon yolu<span class="lbl" style="margin-left:auto;font-weight:400">test ortamı · son 7 gün</span></div>
          <div class="row" style="gap:8px;margin-top:12px">${[["Ana sayfa", "100%"], ["Odalar", "%64"], ["Oda detayı", "%41"], ["Rezervasyon", "%12"]].map(([a, b], i) => `${i ? icon("chevron-right", { size: 18, color: "#a0aac0" }) : ""}<div style="flex:1;padding:10px 12px;border-radius:12px;background:#fff"><div style="font-size:13px;color:#55617b">${a}</div><div style="font-size:18px;font-weight:600;color:${i === 3 ? "#12419b" : "#0c1a3a"}">${b.replace("100%", "%100")}</div></div>`).join("")}</div>
        </div>
      </div>
      <div style="width:350px;flex-shrink:0;display:flex;flex-direction:column;gap:14px">
        <div data-durak="liste">${webChecklist()}</div>
        <div class="card" style="flex:1;min-height:0;padding:20px 22px;background:linear-gradient(150deg,#011441,#12419b 70%,#2a6aca);color:#fff" data-durak="yayin">
          <div class="row" style="gap:10px;font-size:14px;color:#bfe0ff">${icon("rocket", { size: 18, color: "#bfe0ff" })}Yayın tarihi</div>
          <div style="font-size:40px;font-weight:600;letter-spacing:-.03em;margin-top:12px">6 gün</div>
          <div style="font-size:14.5px;opacity:.8">20 Ekim Salı · 10:00</div>
          <div style="display:grid;gap:9px;margin-top:16px;font-size:13.5px">${["12 ay bakım ve güncelleme", "Aylık yedek ve güvenlik kontrolü", "Alan adı ve SSL sizin adınıza", "İçerik paneli eğitimi"].map((t) => `<div class="row" style="gap:9px">${icon("shield-check", { size: 16, color: "#bfe0ff" })}${t}</div>`).join("")}</div>
        </div>
      </div>
    </div>`);
}

/* ======================================================================
   3. SEO · müşteri: Ekin Diş Kliniği
   ====================================================================== */
const SEO_NAV = (on) => [["layout-dashboard", "Görünürlük"], ["key-round", "Kelimeler", false, 86], ["wrench", "Teknik Denetim"], ["languages", "Diller"], ["map-pin", "Yerel SEO"], ["file-chart-column", "Raporlar"], ["settings", "Ayarlar"]].map((x, i) => (i === on ? [x[0], x[1], true, x[3]] : x));
const SEO_USER = ["EK", "Dr. Ekin Kara", "Ekin Diş Kliniği", 3];
const SEO_MAN = ["OB", "Onur Baysal", "SEO uzmanı", 5];
export const SEO_CLICKS = [6.2, 6.8, 7.4, 8.1, 9.6, 10.8, 11.9, 13.2, 14.6, 15.4, 16.9, 18.4];
export function seoTrend({ w = 640, h = 220 } = {}) {
  const L = ["Eki", "Kas", "Ara", "Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl"];
  return `<div class="card" style="padding:20px 24px;height:100%;display:flex;flex-direction:column">
    ${cardHead("Organik tıklama", "Son 12 ay · arama sonuçlarından gelen ziyaret", `<span class="row" style="gap:7px;font-size:13px;color:#55617b"><span style="width:18px;height:4px;border-radius:9px;background:#2a6aca"></span>Tıklama</span><span class="row" style="gap:7px;font-size:13px;color:#55617b"><span style="width:18px;height:4px;border-radius:9px;background:#b9c7e0"></span>Önceki yıl</span>`)}
    <div style="position:relative;margin-top:auto;padding-top:26px">${line([SEO_CLICKS, [5.1, 5.3, 5.2, 5.6, 6.0, 6.1, 5.9, 6.4, 6.6, 6.5, 6.9, 7.1]], { w, h, min: 0, max: 21 })}
      <div style="position:absolute;right:-8px;top:-8px;padding:6px 11px;border-radius:10px;background:#011441;color:#fff;font-size:13.5px;font-weight:600;white-space:nowrap">Eyl · 18,4K</div>
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
      ${kpi("Gösterim", "612K", "+%38", "eye", { note: "geçen yıla göre" })}
      ${kpi("Ortalama sıra", "8,4", "3,1 sıra", "list-ordered", { note: "yükseldi" })}
      ${kpi("İlk 10'daki kelime", "86", "+24", "key-round", { note: "son 3 ay" })}
    </div>
    <div style="flex:1;min-height:0;display:flex;gap:14px">
      <div style="flex:1;min-width:0" data-durak="trend">${seoTrend({ w: 734, h: 200 })}</div>
      <div style="width:340px;flex-shrink:0" data-durak="dagilim">${seoDist()}</div>
    </div>
    <div class="card" style="padding:18px 20px 8px" data-durak="kelime">
      ${cardHead("Yükselen kelimeler", "Son 30 gün", `<span class="lbl">86 kelime</span>${icon("chevron-right", { size: 16, color: "#8a95ad" })}`)}
      <div style="margin-top:12px">${seoKwTable({ n: 3, rh: 46 })}</div>
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
  ["Kanonik etiketler", "Yinelenen 4 sayfa birleştirildi", "ok"],
  ["Mobil uyumluluk", "48 sayfanın tamamı uyumlu", "ok"],
];
export function seoAuditList({ n = 6, rh = 54 } = {}) {
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
    ${head("Teknik Denetim", "ekindis.com.tr · 48 sayfa tarandı · bugün 06:00", btn("Tarama geçmişi", "clock") + btn("Yeniden tara", "refresh-cw", "pri"))}
    <div style="flex:1;min-height:0;display:flex;gap:14px">
      <div class="card" style="flex:1;min-width:0;padding:20px 20px 12px" data-durak="liste">
        ${cardHead("Kontrol listesi", "Öncelik sırasına göre", tag("6 tamam · 3 sürüyor", "blue"))}
        <div style="margin-top:12px">${seoAuditList({ n: 9, rh: 62 })}</div>
        <div class="row" style="gap:10px;margin:8px 12px 0;padding:12px 14px;border-radius:12px;background:#f5f8fd;font-size:13.5px;color:#55617b">${icon("info", { size: 16, color: "#2a6aca" })}Uyarılar bu ayın iş planında; bitince rapora işlenir.</div>
      </div>
      <div style="width:400px;flex-shrink:0;display:flex;flex-direction:column;gap:14px">
        <div data-durak="saglik">${seoHealth()}</div>
        <div class="card" style="padding:20px 22px;flex:1;min-height:0" data-durak="hiz">
          ${cardHead("Sayfa hızı", "Mobil · en büyük içerik yüklemesi")}
          <div style="margin-top:22px">${bars([3.9, 3.4, 2.6, 2.1, 1.6, 1.3], { w: 352, h: 290, hi: 5, labels: ["Nis", "May", "Haz", "Tem", "Ağu", "Eyl"], showVals: true, fs: 12, r: 8 }).replace(/>(\d)\.(\d)</g, ">$1,$2<")}</div>
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
    <div class="row" style="gap:8px;margin-top:12px">${idx === p ? tag(st, c === "TR" ? "gray" : "green") : tag(st, "amber")}<span style="margin-left:auto;font-size:13px;color:#55617b">${String(cl).replace(".", ",")}K tık</span></div></div>`).join("")}</div>`;
}
export function seoLangMatrix({ n = 9, rh = 50 } = {}) {
  const R = [["Ana sayfa", [1, 1, 1, 1]], ["İmplant tedavisi", [1, 1, 1, 1]], ["Zirkonyum kaplama", [1, 1, 1, 0]], ["Diş beyazlatma", [1, 1, 1, 1]], ["Sağlık turizmi", [1, 1, 1, 0]], ["Ortodonti", [1, 1, 1, 1]], ["Hekimlerimiz", [1, 1, 1, 1]], ["Fiyat ve ödeme", [1, 1, 1, 1]], ["İletişim ve ulaşım", [1, 1, 1, 1]]].slice(0, n);
  return `<div class="card" style="padding:20px 22px">
    ${cardHead("Sayfa eşleşmeleri", "Her sayfanın dil karşılıkları ve hreflang bağlantısı")}
    <div style="margin-top:12px">${table("minmax(0,2fr) repeat(4,.7fr)", ["Sayfa", "TR", "EN", "DE", "AR"], R.map(([n, a]) => [`<b style="font-weight:500">${n}</b>`, ...a.map((v) => (v ? icon("circle-check", { size: 19, color: "#16a34a", stroke: 2.2 }) : icon("clock", { size: 19, color: "#e8a33a", stroke: 2.2 })))]), { rh })}</div>
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
        <div style="display:grid;gap:19px;margin-top:20px">${[["Almanya", 2140, 100], ["Birleşik Krallık", 1630, 76], ["Hollanda", 980, 46], ["Suudi Arabistan", 760, 36], ["Azerbaycan", 520, 24], ["Fransa", 410, 19], ["Belçika", 330, 15], ["Avusturya", 290, 13]].map(([a, v, p]) => `<div><div class="row" style="font-size:14px"><span>${a}</span><span style="margin-left:auto;font-weight:600">${v.toLocaleString("tr-TR")}</span></div><div style="margin-top:6px">${meter(p, "#2a6aca", 6)}</div></div>`).join("")}</div>
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
      <div style="display:grid;gap:12px;margin-top:12px">${SEO_KW.slice(0, 5).map(([k, , p, d]) => `<div class="row" style="gap:12px;min-width:0"><span style="width:36px;height:36px;border-radius:11px;background:#eaf2ff;color:#12419b;display:grid;place-items:center;font-weight:700;font-size:15px;flex-shrink:0">${p}</span><span style="flex:1;font-size:14px;font-weight:500;${ELL}">${k}</span><span class="row" style="gap:2px;font-size:12.5px;font-weight:600;color:#12873f;flex-shrink:0">${icon("arrow-up", { size: 13, stroke: 2.6 })}${d}</span></div>`).join("")}</div>
    </div>
    <div class="card" style="padding:16px 18px" class="row">
      <div class="row" style="gap:14px"><div style="position:relative;width:64px;height:64px;flex-shrink:0">${ring(92, { d: 64, thick: 8, color: "#16a34a", track: "#dff1e5" })}<div style="position:absolute;inset:0;display:grid;place-items:center;font-size:18px;font-weight:600">92</div></div><div style="min-width:0"><div style="font-size:15px;font-weight:600">Site sağlığı</div><div style="font-size:12.5px;color:#8a95ad">0 kritik · 7 uyarı · bugün tarandı</div></div></div>
    </div>`, [["layout-dashboard", "Özet", true], ["key-round", "Kelimeler"], ["wrench", "Denetim"], ["message-circle", "Mesajlar"]]);
}

/* ======================================================================
   4. ÖZEL YAZILIM · müşteriye özel panel: Atlas Lojistik
   ====================================================================== */
const ATL_LOGO = monogram("A", "linear-gradient(140deg,#0b2a66,#2a6aca)", 34);
const atlSide = (on) => clientSide({
  logo: ATL_LOGO, name: "Atlas Sevkiyat",
  items: [["layout-dashboard", "Panel"], ["truck", "Sevkiyatlar", false, 148], ["warehouse", "Depolar"], ["users", "Müşteriler"], ["workflow", "Otomasyonlar"], ["plug", "Entegrasyonlar"], ["chart-column", "Raporlar"], ["settings", "Ayarlar"]].map((x, i) => (i === on ? [x[0], x[1], true, x[3]] : x)),
  user: ["HE", "Hakan Er", "Operasyon Müdürü", 5],
  foot: `<div style="margin-top:auto;padding:12px 14px;border-radius:14px;background:#f5f8fd;font-size:12.5px;color:#7f8aa3;line-height:1.45"><div class="row" style="gap:8px;color:#12419b;font-weight:600;font-size:13px">${mark("navy", 16)}Guru Dijital</div>Özel yazılım · sürüm 3.2</div>`,
});
export const ATL_ROWS = [
  ["SV-24118", "Kuzey Market", "İstanbul → Kocaeli", "34 AT 118", "Yolda", "11:40"],
  ["SV-24117", "Demir Yapı", "İstanbul → Bursa", "34 AT 204", "Yükleniyor", "14:15"],
  ["SV-24116", "Ege Gıda", "İzmir → Manisa", "35 AT 072", "Teslim edildi", "09:52"],
  ["SV-24115", "Mavi Eczane Deposu", "Ankara → Eskişehir", "06 AT 331", "Gecikmeli", "12:30"],
  ["SV-24114", "Lidya Tekstil", "İstanbul → Tekirdağ", "34 AT 090", "Yolda", "13:05"],
  ["SV-24113", "Bora Elektrik", "Kocaeli → Sakarya", "41 AT 512", "Teslim edildi", "08:47"],
  ["SV-24112", "Orion Otomotiv", "Bursa → Balıkesir", "16 AT 260", "Yolda", "15:20"],
];
const atlSt = (s) => ({ Yolda: tag(`${dot("#2a6aca", 6)}Yolda`, "blue"), Yükleniyor: tag(`${dot("#7c5cff", 6)}Yükleniyor`, "violet"), "Teslim edildi": tag(`${icon("check", { size: 11, stroke: 3 })}Teslim edildi`, "green"), Gecikmeli: tag(`${dot("#e5484d", 6)}Gecikmeli`, "red") })[s];
export function atlTable({ n = 7, rh = 52, compact = false } = {}) {
  if (compact) return table(".8fr minmax(0,1.5fr) minmax(0,1.5fr) 1.15fr .55fr", ["Sevkiyat", "Müşteri", "Rota", "Durum", "r:Varış"], ATL_ROWS.slice(0, n).map(([a, b, c, d, e, f]) => [`<span style="color:#55617b;font-weight:500">${a}</span>`, `<b style="font-weight:600">${b.replace(" Deposu", "")}</b>`, c, atlSt(e), `<b style="font-weight:600">${f}</b>`]), { rh, fs: 14, gap: 12 });
  return table(".9fr minmax(0,1.4fr) minmax(0,1.5fr) .9fr 1.1fr .6fr", ["Sevkiyat", "Müşteri", "Rota", "Araç", "Durum", "r:Varış"], ATL_ROWS.slice(0, n).map(([a, b, c, d, e, f]) => [`<span style="color:#55617b;font-weight:500">${a}</span>`, `<b style="font-weight:600">${b}</b>`, c, `<span style="color:#55617b">${d}</span>`, atlSt(e), `<b style="font-weight:600">${f}</b>`]), { rh, fs: 14 });
}
/* Stilize rota haritası (gerçek bir harita servisi değildir) */
export function routeMap(w = 312, h = 230) {
  return `<svg width="${w}" height="${h}" viewBox="0 0 312 230" style="display:block;border-radius:14px;background:#eef4fb">
    <path d="M0 160 C60 150 90 120 150 128 C210 136 250 100 312 92" fill="none" stroke="#dbe6f4" stroke-width="14"/>
    <path d="M40 0 C60 60 50 120 90 230" fill="none" stroke="#e4ecf7" stroke-width="10"/><path d="M230 0 C210 70 240 150 220 230" fill="none" stroke="#e4ecf7" stroke-width="10"/>
    <path d="M0 60 H312" stroke="#e4ecf7" stroke-width="6"/><path d="M0 200 C100 190 200 210 312 196" fill="none" stroke="#e4ecf7" stroke-width="6"/>
    <path d="M30 70 C30 70 110 50 150 128 S270 170 282 120" fill="none" stroke="#2a6aca" stroke-width="5" stroke-linecap="round"/>
    <path d="M150 128 S270 170 282 120" fill="none" stroke="#9fc1ec" stroke-width="5" stroke-linecap="round" stroke-dasharray="2 9"/>
    ${[[30, 70, "#12419b"], [96, 66, "#12419b"], [282, 120, "#fff"]].map(([x, y, c]) => `<circle cx="${x}" cy="${y}" r="8" fill="${c}" stroke="#12419b" stroke-width="3"/>`).join("")}
    <g transform="translate(136 112)"><rect width="30" height="30" rx="10" fill="#12419b"/><path d="M8 11h9v8H8zM17 14h3l2 3v2h-5z" fill="#fff"/><circle cx="11" cy="21" r="2" fill="#fff"/><circle cx="19" cy="21" r="2" fill="#fff"/></g>
  </svg>`;
}
export function atlRouteCard() {
  return `<div class="card" style="padding:18px 20px">
    ${cardHead("Canlı rota", "SV-24118 · 34 AT 118", tag(`${dot("#2a6aca", 6)}Yolda`, "blue"))}
    <div style="margin-top:14px">${routeMap(312, 200)}</div>
    <div class="row" style="gap:10px;margin-top:14px">${[["Kalan", "38 km"], ["Varış", "11:40"], ["Durak", "3 / 5"]].map(([a, b]) => `<div style="flex:1;padding:9px 12px;border-radius:12px;background:#f5f8fd"><div style="font-size:12px;color:#7f8aa3">${a}</div><div style="font-size:16px;font-weight:600">${b}</div></div>`).join("")}</div>
  </div>`;
}
export function ozelDesktop() {
  return app(atlSide(1), `
    ${head("Sevkiyatlar", "Bugün · 14 Ekim 2026 · 3 depo", `<div class="search" style="width:220px">${icon("search", { size: 17, color: "#a0aac0" })}Sevkiyat, plaka ara</div>` + btn("Yeni sevkiyat", "plus", "pri"))}
    <div class="row" style="gap:14px" data-durak="kpi">
      ${kpi("Bugünkü sevkiyat", "148", "+12", "package", { note: "düne göre" })}
      ${kpi("Yolda", "63", "21", "truck", { tone: "flat", note: "araç sahada" })}
      ${kpi("Geciken", "4", "3", "clock", { tone: "gooddown", note: "düne göre az" })}
      ${kpi("Zamanında teslim", "%97,2", "+1,4 puan", "circle-check", { note: "bu ay" })}
    </div>
    <div style="flex:1;min-height:0;display:flex;gap:14px">
      <div class="card" style="flex:1;min-width:0;padding:18px 20px" data-durak="tablo">
        ${cardHead("Sevkiyat listesi", "Son güncelleme 1 dk önce · otomatik", `<span class="btn sec" style="height:36px;font-size:13.5px;box-shadow:none;background:#f3f6fb">${icon("list-filter", { size: 15 })}Filtre</span>`)}
        <div style="margin-top:12px">${atlTable({ n: 7, rh: 68 })}</div>
      </div>
      <div style="width:352px;flex-shrink:0;display:flex;flex-direction:column;gap:14px">
        <div data-durak="rota">${atlRouteCard()}</div>
        <div class="card" style="padding:18px 20px;flex:1;min-height:0" data-durak="depo">
          ${cardHead("Depo doluluğu", "Anlık")}
          <div style="display:grid;gap:16px;margin-top:16px">${[["Tuzla", 82, "#e8a33a"], ["Gebze", 64, "#2a6aca"], ["Kemalpaşa", 47, "#2a6aca"], ["Esenboğa", 58, "#2a6aca"]].map(([a, p, c]) => `<div><div class="row" style="font-size:14px"><span>${a}</span><span style="margin-left:auto;font-weight:600">%${p}</span></div><div style="margin-top:6px">${meter(p, c, 7)}</div></div>`).join("")}</div>
        </div>
      </div>
    </div>`);
}
/* İş akışı düğümleri */
const node = (x, y, w, ic, tone, kind, title, sub, extra = "") =>
  `<div style="position:absolute;left:${x}px;top:${y}px;width:${w}px;padding:14px 16px;border-radius:16px;background:#fff;box-shadow:0 1px 2px rgb(12 26 58/.06),0 14px 30px -18px rgb(12 26 58/.35);${extra}">
    <div class="row" style="gap:11px">${ib(ic, tone, 36)}<div style="min-width:0"><div style="font-size:11.5px;font-weight:600;letter-spacing:.06em;color:${IC[tone][1]}">${kind}</div><div style="font-size:15px;font-weight:600;${ELL}">${title}</div></div></div>
    <div style="font-size:12.5px;color:#7f8aa3;margin-top:8px;${ELL}">${sub}</div></div>`;
export function flowCanvas({ w = 800, h = 600 } = {}) {
  const W = 240, Y = [40, 220, 400, 590], NH = 98;
  return `<div style="position:relative;width:${w}px;height:${h}px;border-radius:16px;background-color:#f5f8fd;background-image:radial-gradient(#d3deee 1.2px,transparent 1.2px);background-size:22px 22px">
    <svg width="${w}" height="${h}" style="position:absolute;inset:0">
      <g fill="none" stroke="#9fb8de" stroke-width="2.5">
        <path d="M150 ${Y[0] + NH} V${Y[1] - 4}"/><path d="M150 ${Y[1] + NH} V${Y[2] - 4}"/>
        <path d="M150 ${Y[2] + NH} V${Y[3] + 49} H${w / 2 + 86}"/>
        <path d="M270 ${Y[2] + 49} H${w / 2 + 30} V${Y[0] + 49} H${w / 2 + 86}"/>
        <path d="M${w / 2 + 210} ${Y[0] + NH} V${Y[1] - 4}"/><path d="M${w / 2 + 210} ${Y[1] + NH} V${Y[2] - 4}"/>
      </g>
      <g fill="#9fb8de">${[[150, Y[1]], [150, Y[2]], [w / 2 + 210, Y[1]], [w / 2 + 210, Y[2]]].map(([x, y]) => `<path d="M${x - 6} ${y - 8} L${x} ${y} L${x + 6} ${y - 8}Z"/>`).join("")}${[Y[0], Y[3]].map((y) => `<path d="M${w / 2 + 82} ${y + 43} L${w / 2 + 90} ${y + 49} L${w / 2 + 82} ${y + 55}Z"/>`).join("")}</g>
    </svg>
    ${node(30, Y[0], W, "shopping-cart", "violet", "TETİKLEYİCİ", "Yeni sipariş geldi", "ERP · her siparişte")}
    ${node(30, Y[1], W, "warehouse", "blue", "ADIM", "Stok kontrolü", "Depo sistemi · en yakın depo")}
    ${node(30, Y[2], W, "split", "amber", "KOŞUL", "Stok yeterli mi?", "Evet: sevkiyat · Hayır: satın alma")}
    <div style="position:absolute;left:${w / 2 + 6}px;top:${Y[1] + 30}px;padding:4px 10px;border-radius:999px;background:#e6f6ec;color:#12873f;font-size:12px;font-weight:600">Evet</div>
    <div style="position:absolute;left:164px;top:${Y[2] + NH + 30}px;padding:4px 10px;border-radius:999px;background:#feecec;color:#c9363b;font-size:12px;font-weight:600">Hayır</div>
    ${node(w / 2 + 90, Y[0], W, "tag", "blue", "ADIM", "Kargo etiketi oluştur", "Kargo entegrasyonu · otomatik")}
    ${node(w / 2 + 90, Y[1], W, "message-square-text", "teal", "ADIM", "Müşteriye SMS gönder", "Takip bağlantısıyla")}
    ${node(w / 2 + 90, Y[2], W, "circle-check", "green", "SON", "Sevkiyat planlandı", "Ortalama 1,2 saniye")}
    ${node(w / 2 + 90, Y[3], W, "list-todo", "red", "ADIM", "Satın almaya görev aç", "Eksik ürün ve tedarikçi bilgisi")}
  </div>`;
}
export function flowRuns() {
  return `<div class="card" style="padding:18px 20px;height:100%">
    ${cardHead("Son çalışmalar", "Canlı", tag(`${dot("#16a34a", 6)}Aktif`, "green"))}
    <div style="display:grid;gap:12px;margin-top:14px">${[["SP-88214", "11:42", "1,1 sn", 1], ["SP-88213", "11:41", "1,3 sn", 1], ["SP-88212", "11:39", "Satın alma", 0], ["SP-88211", "11:36", "1,0 sn", 1], ["SP-88210", "11:34", "1,2 sn", 1], ["SP-88209", "11:31", "1,4 sn", 1]].map(([a, b, c, ok]) => `<div class="row" style="gap:11px;font-size:14px">${ok ? ib("check", "green", 30) : ib("list-todo", "amber", 30)}<div style="flex:1;min-width:0"><div style="font-weight:600">${a}</div><div style="font-size:12px;color:#8a95ad">${b}</div></div><span style="font-size:13px;color:${ok ? "#55617b" : "#b45f06"};font-weight:500">${c}</span></div>`).join("")}</div>
  </div>`;
}
export function flowStats() {
  return `<div class="card" style="padding:20px 22px;background:linear-gradient(150deg,#011441,#12419b 70%,#2a6aca);color:#fff">
    <div class="row" style="gap:10px;font-size:14px;color:#bfe0ff">${icon("zap", { size: 17, color: "#bfe0ff" })}Bu ay</div>
    <div style="font-size:40px;font-weight:600;letter-spacing:-.03em;margin-top:10px">4.812<span style="font-size:17px;font-weight:500;opacity:.8;margin-left:8px;letter-spacing:0">çalışma</span></div>
    <div class="row" style="gap:10px;margin-top:14px">${[["Başarı", "%99,6"], ["Kazanılan süre", "640 saat"]].map(([a, b]) => `<div style="flex:1;padding:10px 12px;border-radius:12px;background:rgb(255 255 255/.12)"><div style="font-size:12px;opacity:.75">${a}</div><div style="font-size:18px;font-weight:600">${b}</div></div>`).join("")}</div>
  </div>`;
}
export function ozelFlowDesktop() {
  return app(atlSide(4), `
    ${head("Sipariş → Sevkiyat akışı", "Her yeni siparişte çalışır · son değişiklik 9 Ekim", tag(`${dot("#16a34a", 6)}Yayında`, "green", "font-size:13px;padding:6px 12px") + btn("Akışı düzenle", "pencil", "pri"))}
    <div style="flex:1;min-height:0;display:flex;gap:14px">
      <div class="card" style="flex:1;min-width:0;padding:14px" data-durak="akis">${flowCanvas({ w: 780, h: 752 })}</div>
      <div style="width:320px;flex-shrink:0;display:flex;flex-direction:column;gap:14px">
        <div data-durak="istatistik">${flowStats()}</div>
        <div style="flex:1;min-height:0" data-durak="calisma">${flowRuns()}</div>
      </div>
    </div>`);
}
export const INTEG = [["database", "blue", "ERP", "Sipariş ve stok", "2 dk önce", 1], ["receipt", "teal", "Muhasebe ve e-fatura", "Fatura ve cari", "5 dk önce", 1], ["truck", "violet", "Kargo firmaları", "3 firma · etiket ve takip", "1 dk önce", 1], ["credit-card", "navy", "Ödeme altyapısı", "Tahsilat ve iade", "12 dk önce", 1], ["store", "amber", "E-ticaret sitesi", "Sipariş aktarımı", "3 dk önce", 1], ["message-square-text", "green", "SMS servisi", "Bildirim gönderimi", "Kota %80", 0]];
export function integCard([ic, tone, n, d, t, ok]) {
  return `<div class="card" style="padding:16px 18px;min-width:0">
    <div class="row" style="gap:12px">${ib(ic, tone, 40)}<div style="min-width:0;flex:1"><div style="font-size:15.5px;font-weight:600;${ELL}">${n}</div><div style="font-size:12.5px;color:#7f8aa3;${ELL}">${d}</div></div></div>
    <div class="row" style="gap:8px;margin-top:14px">${ok ? tag(`${dot("#16a34a", 6)}Bağlı`, "green") : tag(`${dot("#e8a33a", 6)}Uyarı`, "amber")}<span style="margin-left:auto;font-size:12.5px;color:#8a95ad">${t}</span></div>
  </div>`;
}
const code = (lines) => lines.map((l, i) => `<div style="display:flex;gap:16px"><span style="width:20px;text-align:right;color:#4d5d85;flex-shrink:0">${i + 1}</span><span style="white-space:pre">${l}</span></div>`).join("");
const K = (t) => `<span style="color:#8fc4ff">${t}</span>`, V = (t) => `<span style="color:#a7e3b5">${t}</span>`, N = (t) => `<span style="color:#ffcf8a">${t}</span>`, M = (t) => `<span style="color:#d3b8ff">${t}</span>`;
export function codePanel({ fs = 14 } = {}) {
  return `<div style="height:100%;border-radius:16px;background:#0b1633;color:#dce6f7;overflow:hidden;box-shadow:0 18px 40px -22px rgb(1 12 40/.7)">
    <div class="row" style="gap:10px;height:42px;padding:0 16px;background:#0f1d42;font-size:13px">${[["İstek", 1], ["Yanıt", 0], ["Webhook", 0]].map(([t, on]) => `<span style="padding:5px 12px;border-radius:8px;${on ? "background:#1d2f5e;color:#fff" : "color:#8796bd"}">${t}</span>`).join("")}<span style="margin-left:auto;font-size:12.5px;color:#7fe0a0" class="row">${dot("#3ad07a", 7)}&nbsp;201 Oluşturuldu · 184 ms</span></div>
    <div style="padding:16px 18px;font:400 ${fs}px/1.65 Menlo,Monaco,monospace">${code([
      `${M("POST")} /api/v3/sevkiyatlar`,
      `{`,
      `  ${K('"siparis"')}: ${V('"SP-88214"')},`,
      `  ${K('"depo"')}: ${V('"tuzla"')},`,
      `  ${K('"teslimat"')}: { ${K('"il"')}: ${V('"Kocaeli"')}, ${K('"saat"')}: ${V('"11:40"')} },`,
      `  ${K('"paket"')}: ${N("6")}, ${K('"desi"')}: ${N("42")},`,
      `  ${K('"bildirim"')}: [${V('"sms"')}, ${V('"eposta"')}]`,
      `}`,
      ``,
      `<span style="color:#6f80a8">// Yanıt · 201</span>`,
      `{`,
      `  ${K('"id"')}: ${V('"SV-24118"')}, ${K('"durum"')}: ${V('"planlandi"')},`,
      `  ${K('"kargo_takip"')}: ${V('"AT118-6K42"')},`,
      `  ${K('"tahmini_varis"')}: ${V('"2026-10-14T11:40"')}`,
      `}`,
    ])}</div>
  </div>`;
}
export function ozelApiDesktop() {
  return app(atlSide(5), `
    ${head("Entegrasyonlar", "6 bağlı sistem · API v3 · bugün 18.240 istek", btn("API anahtarları", "key-round") + btn("Entegrasyon ekle", "plus", "pri"))}
    <div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px" data-durak="sistemler">${INTEG.map(integCard).join("")}</div>
    <div style="flex:1;min-height:0;display:flex;gap:14px">
      <div style="flex:1;min-width:0" data-durak="kod">${codePanel()}</div>
      <div class="card" style="width:330px;flex-shrink:0;padding:18px 20px" data-durak="istek">
        ${cardHead("API istekleri", "Son 7 gün · bin istek")}
        <div style="margin-top:16px">${bars([14.2, 15.8, 16.1, 13.9, 17.4, 16.6, 18.2], { w: 290, h: 170, hi: 6, labels: ["Prş", "Cum", "Cmt", "Paz", "Pzt", "Sal", "Çar"], fs: 12, r: 7 })}</div>
        <div class="row" style="gap:10px;margin-top:14px">${[["Başarı", "%99,9"], ["Ort. yanıt", "142 ms"]].map(([a, b]) => `<div style="flex:1;padding:9px 12px;border-radius:12px;background:#f5f8fd"><div style="font-size:12px;color:#7f8aa3">${a}</div><div style="font-size:16px;font-weight:600">${b}</div></div>`).join("")}</div>
      </div>
    </div>`);
}
export function ozelMobile() {
  return phoneScreen(`
    ${mHead("Bugünkü rota", "34 AT 118 · Murat Kaya", `<span style="width:40px;height:40px;border-radius:12px;background:#fff;display:grid;place-items:center;box-shadow:0 4px 14px -8px rgb(12 26 58/.3)">${icon("map", { size: 20, color: "#12419b" })}</span>`)}
    <div class="card" style="padding:16px 18px">
      <div class="row" style="font-size:14px"><span style="font-weight:600">9 / 14 durak</span><span style="margin-left:auto;color:#7f8aa3">Tahmini bitiş 17:20</span></div>
      <div class="row" style="gap:4px;margin-top:10px">${Array.from({ length: 14 }, (_, i) => `<span style="flex:1;height:7px;border-radius:9px;background:${i < 9 ? "#2a6aca" : i === 9 ? "#9fc1ec" : "#e3eaf5"}"></span>`).join("")}</div>
    </div>
    <div style="padding:18px;border-radius:20px;background:linear-gradient(150deg,#011441,#12419b 65%,#2a6aca);color:#fff">
      <div class="row" style="font-size:12.5px;font-weight:600;letter-spacing:.06em;color:#bfe0ff">SIRADAKİ DURAK<span style="margin-left:auto;font-weight:500;letter-spacing:0">11:40</span></div>
      <div style="font-size:22px;font-weight:600;margin-top:8px">Kuzey Market</div>
      <div style="font-size:14px;opacity:.8;margin-top:2px">Yenimahalle Cd. No: 24, İzmit</div>
      <div class="row" style="gap:8px;margin-top:12px">${[["package", "6 paket"], ["scale", "42 desi"], ["phone", "Ara"]].map(([ic, t]) => `<span class="row" style="gap:6px;padding:7px 10px;border-radius:10px;background:rgb(255 255 255/.12);font-size:13px">${icon(ic, { size: 14 })}${t}</span>`).join("")}</div>
      <div class="row" style="gap:8px;margin-top:14px"><span class="btn" style="flex:1;justify-content:center;height:44px;background:rgb(255 255 255/.16);color:#fff">${icon("navigation", { size: 16 })}Yol tarifi</span><span class="btn" style="flex:1.3;justify-content:center;height:44px;background:#fff;color:#011441">${icon("circle-check", { size: 16 })}Teslim edildi</span></div>
    </div>
    <div class="card" style="padding:16px 18px">
      <div class="h3" style="font-size:15.5px">Sonraki duraklar</div>
      <div style="display:grid;gap:13px;margin-top:12px">
        ${mRow("map-pin", "blue", "Bora Elektrik", "Körfez · 3 paket", "12:15")}
        ${mRow("map-pin", "blue", "Lidya Tekstil Deposu", "Gebze · 8 paket", "13:05")}
        ${mRow("map-pin", "gray", "Demir Yapı Şantiye", "Dilovası · 2 paket", "13:50")}
        ${mRow("map-pin", "gray", "Ege Gıda Bayi", "Darıca · 4 paket", "14:30")}
      </div>
    </div>`, [["route", "Rota", true], ["package", "Paketler"], ["scan-line", "Tara"], ["user-round", "Profil"]]);
}

/* ======================================================================
   5. MOBİL UYGULAMA · kurgusal uygulama: Pati Klinik (veteriner randevu)
   ====================================================================== */
const PATI = (d = 40) => `<span style="width:${d}px;height:${d}px;border-radius:${d * 0.32}px;background:linear-gradient(140deg,#12419b,#44a1f1);display:grid;place-items:center;flex-shrink:0">${icon("paw-print", { size: d * 0.52, color: "#fff", stroke: 2.1 })}</span>`;
const petAv = (d = 56, c = "#ffe2c2") => `<span style="width:${d}px;height:${d}px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#fff,${c});display:grid;place-items:center;flex-shrink:0;box-shadow:inset 0 0 0 3px #fff">${icon("cat", { size: d * 0.5, color: "#b06a2a", stroke: 1.9 })}</span>`;
export function patiHome() {
  return phoneScreen(`
    <div class="row" style="gap:12px;padding:6px 2px 2px">${PATI(40)}<div><div style="font-size:13px;color:#7f8aa3">Merhaba Aylin</div><div style="font-size:20px;font-weight:600;letter-spacing:-.02em">Pati Klinik</div></div><span style="margin-left:auto;position:relative">${icon("bell", { size: 22, color: "#3b4763" })}<span style="position:absolute;right:-2px;top:-2px;width:9px;height:9px;border-radius:50%;background:#e5484d;border:2px solid #f3f6fb"></span></span></div>
    <div class="card" style="padding:16px;display:flex;gap:14px;align-items:center">${petAv(58)}<div style="min-width:0;flex:1"><div style="font-size:18px;font-weight:600">Pamuk</div><div style="font-size:13px;color:#7f8aa3">Kedi · British Shorthair · 3 yaş</div><div class="row" style="gap:6px;margin-top:7px">${tag("4,2 kg", "blue")}${tag("Aşıları tam", "green")}</div></div>${icon("chevron-right", { size: 20, color: "#a0aac0" })}</div>
    <div style="padding:18px;border-radius:20px;background:linear-gradient(150deg,#011441,#12419b 65%,#2a6aca);color:#fff">
      <div class="row" style="font-size:12.5px;font-weight:600;letter-spacing:.06em;color:#bfe0ff">YAKLAŞAN RANDEVU</div>
      <div class="row" style="gap:14px;margin-top:12px"><div style="width:58px;padding:8px 0;border-radius:14px;background:#fff;color:#011441;text-align:center;flex-shrink:0"><div style="font-size:12px;font-weight:600;color:#2a6aca">EKİ</div><div style="font-size:24px;font-weight:700;line-height:1.05">17</div></div><div style="min-width:0"><div style="font-size:18px;font-weight:600">Karma aşı ve kontrol</div><div style="font-size:13.5px;opacity:.8;margin-top:2px">Cuma 10:30 · Vet. Hekim Elif Su</div></div></div>
      <div class="row" style="gap:8px;margin-top:14px"><span class="btn" style="flex:1;justify-content:center;height:40px;background:rgb(255 255 255/.16);color:#fff;font-size:14px">Ertele</span><span class="btn" style="flex:1;justify-content:center;height:40px;background:#fff;color:#011441;font-size:14px">${icon("map-pin", { size: 15 })}Yol tarifi</span></div>
    </div>
    <div class="row" style="gap:10px">${[["calendar-plus", "Randevu al"], ["syringe", "Aşı karnesi"], ["message-circle", "Hekime yaz"], ["shopping-bag", "Mama siparişi"]].map(([ic, t]) => `<div style="flex:1;display:grid;justify-items:center;gap:7px;padding:12px 4px;border-radius:16px;background:#fff;box-shadow:0 1px 2px rgb(12 26 58/.05),0 8px 20px -14px rgb(12 26 58/.25)">${ib(ic, "blue", 38)}<span style="font-size:11.5px;font-weight:500;text-align:center;line-height:1.2">${t}</span></div>`).join("")}</div>
    <div class="card" style="padding:15px 16px">
      ${mRow("pill", "amber", "Parazit damlası zamanı", "Bugün akşam · aylık hatırlatma", "")}
    </div>
    <div class="card" style="padding:15px 16px">
      ${mRow("stethoscope", "blue", "Son ziyaret: genel kontrol", "2 Eylül · Vet. Hekim Can Aksu", "")}
    </div>`, [["house", "Ana sayfa", true], ["calendar", "Randevular"], ["paw-print", "Dostlarım"], ["user-round", "Profil"]]);
}
export function patiBook() {
  const days = [["Pzt", 13], ["Sal", 14], ["Çar", 15], ["Prş", 16], ["Cum", 17], ["Cmt", 18]];
  const slots = ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "14:00", "14:30", "15:00"];
  const off = [1, 5, 7];
  return phoneScreen(`
    <div class="row" style="gap:10px;padding:4px 0 2px">${icon("chevron-left", { size: 24, color: "#12419b" })}<span style="font-size:19px;font-weight:600">Randevu al</span><span style="margin-left:auto;font-size:13px;color:#7f8aa3">Adım 2 / 3</span></div>
    <div class="card" style="padding:14px 16px;display:flex;gap:12px;align-items:center">${petAv(44)}<div style="min-width:0;flex:1"><div style="font-size:15px;font-weight:600">Pamuk · Karma aşı</div><div style="font-size:12.5px;color:#7f8aa3">Yaklaşık 20 dakika</div></div><span style="font-size:13px;color:#2a6aca;font-weight:500">Değiştir</span></div>
    <div><div class="row" style="font-size:15.5px;font-weight:600">Ekim 2026<span style="margin-left:auto" class="row">${icon("chevron-left", { size: 18, color: "#a0aac0" })}${icon("chevron-right", { size: 18, color: "#3b4763", style: "margin-left:10px" })}</span></div>
      <div class="row" style="gap:7px;margin-top:10px">${days.map(([d, n]) => `<div style="flex:1;padding:9px 0;border-radius:14px;text-align:center;${n === 17 ? "background:#12419b;color:#fff;box-shadow:0 8px 18px -8px rgb(18 65 155/.7)" : "background:#fff;color:#0c1a3a"}"><div style="font-size:12px;${n === 17 ? "opacity:.8" : "color:#8a95ad"}">${d}</div><div style="font-size:18px;font-weight:600;margin-top:2px">${n}</div></div>`).join("")}</div></div>
    <div><div style="font-size:15.5px;font-weight:600">Uygun saatler</div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:10px">${slots.map((t, i) => `<div style="height:42px;border-radius:12px;display:grid;place-items:center;font-size:14.5px;font-weight:500;${t === "10:30" ? "background:#eaf2ff;color:#12419b;box-shadow:inset 0 0 0 2px #2a6aca;font-weight:600" : off.includes(i) ? "background:#eef1f6;color:#b3bccd;text-decoration:line-through" : "background:#fff"}">${t}</div>`).join("")}</div></div>
    <div><div style="font-size:15.5px;font-weight:600">Hekim</div>
      <div class="row" style="gap:8px;margin-top:10px">${[["ES", "Elif Su", 1, 4], ["CA", "Can Aksu", 0, 2]].map(([i, n, on, k]) => `<div class="row" style="flex:1;gap:10px;padding:10px 12px;border-radius:14px;background:${on ? "#eaf2ff" : "#fff"};${on ? "box-shadow:inset 0 0 0 2px #2a6aca" : ""}">${av(i, 32, k)}<span style="font-size:14px;font-weight:600">${n}</span></div>`).join("")}</div></div>
    <span class="btn pri" style="margin-top:auto;height:52px;justify-content:center;border-radius:15px;font-size:16px">Cuma 10:30'u onayla${icon("arrow-right", { size: 18, stroke: 2.2 })}</span>
  `, null);
}
export function patiDone() {
  return phoneScreen(`
    <div class="row" style="padding:4px 0 2px">${icon("x", { size: 24, color: "#3b4763" })}</div>
    <div style="display:grid;justify-items:center;text-align:center;padding:8px 10px 0">
      <span style="width:92px;height:92px;border-radius:50%;background:radial-gradient(circle,#e6f6ec 60%,#d2efdc);display:grid;place-items:center">${icon("circle-check", { size: 50, color: "#16a34a", stroke: 2 })}</span>
      <div style="font-size:26px;font-weight:600;letter-spacing:-.02em;margin-top:16px">Randevunuz hazır</div>
      <div style="font-size:15px;color:#55617b;margin-top:6px;line-height:1.45">Bir gün önce ve randevudan 2 saat önce hatırlatma göndereceğiz.</div>
    </div>
    <div class="card" style="padding:18px;margin-top:6px">
      <div class="row" style="gap:12px">${petAv(46)}<div><div style="font-size:16px;font-weight:600">Pamuk · Karma aşı</div><div style="font-size:13px;color:#7f8aa3">Pati Klinik Moda</div></div></div>
      <div style="display:grid;gap:12px;margin-top:16px">${[["calendar", "17 Ekim Cuma, 10:30"], ["user-round", "Vet. Hekim Elif Su"], ["map-pin", "Moda Cd. No: 112, Kadıköy"], ["wallet", "Ödeme klinikte"]].map(([ic, t]) => `<div class="row" style="gap:12px;font-size:14.5px">${icon(ic, { size: 18, color: "#2a6aca" })}${t}</div>`).join("")}</div>
    </div>
    <div class="card" style="padding:14px 16px">${mRow("syringe", "green", "Aşı karnesine eklenecek", "Bir sonraki doz: Ekim 2027", "")}</div>
    <div style="margin-top:auto;display:grid;gap:10px"><span class="btn pri" style="height:52px;justify-content:center;border-radius:15px;font-size:16px">${icon("calendar-plus", { size: 18 })}Takvime ekle</span><span class="btn sec" style="height:48px;justify-content:center;border-radius:15px;box-shadow:none;background:transparent;color:#12419b">Ana sayfaya dön</span></div>
  `, null);
}
export function patiLogin() {
  return `<div style="width:390px;height:844px;font-family:Outfit;color:#fff;display:flex;flex-direction:column;background:linear-gradient(170deg,#011441,#12419b 60%,#44a1f1);overflow:hidden">${statusBar("#fff")}
    <div style="flex:1;display:grid;place-items:center;align-content:center;gap:18px;text-align:center;padding:0 30px">${PATI(92)}<div style="font-size:34px;font-weight:600;letter-spacing:-.02em">Pati Klinik</div><div style="font-size:16px;opacity:.8;line-height:1.45">Dostunuzun randevuları, aşıları ve hekim mesajları tek yerde.</div></div>
    <div style="padding:0 24px 40px;display:grid;gap:10px"><span class="btn" style="height:54px;justify-content:center;border-radius:16px;background:#fff;color:#011441;font-size:16px">${icon("smartphone", { size: 18 })}Telefon numarasıyla giriş</span><span style="text-align:center;font-size:14px;opacity:.8">Hesabınız yok mu? <b>Kaydolun</b></span></div></div>`;
}
/* Masaüstü içinde küçük telefon önizlemesi */
export function miniPhone(screen, w = 170) {
  const s = (w - 12) / 390;
  return `<div style="width:${w}px;padding:6px;border-radius:${w * 0.16}px;background:#0b0d12;box-shadow:0 18px 30px -18px rgb(1 12 40/.6);flex-shrink:0"><div style="width:${w - 12}px;height:${844 * s}px;border-radius:${w * 0.13}px;overflow:hidden;position:relative"><div style="width:390px;height:844px;transform:scale(${s});transform-origin:0 0">${screen}</div></div></div>`;
}
const APP_NAV = (on) => [["layout-dashboard", "Genel Bakış"], ["smartphone", "Ekranlar"], ["rocket", "Sürümler"], ["bell-ring", "Bildirimler"], ["chart-column", "Kullanım"], ["star", "Yorumlar", false, 6], ["settings", "Ayarlar"]].map((x, i) => (i === on ? [x[0], x[1], true, x[3]] : x));
const APP_USER = ["AT", "Aylin Tan", "Pati Klinik", 1];
const APP_MAN = ["BY", "Barış Yıldız", "Mobil ekip lideri", 3];
export function storeCard(kind) {
  const ios = kind === "ios";
  return `<div class="card" style="padding:18px 20px;flex:1;min-width:0">
    <div class="row" style="gap:12px">${ibox(ios ? "smartphone" : "tablet-smartphone", "#0c1a3a", "#fff", 42, 13)}<div style="min-width:0;flex:1"><div style="font-size:16px;font-weight:600">${ios ? "App Store" : "Google Play"}</div><div style="font-size:12.5px;color:#7f8aa3">${ios ? "iOS 16 ve üzeri" : "Android 9 ve üzeri"}</div></div>${ios ? tag(`${dot("#e8a33a", 6)}İncelemede`, "amber") : tag(`${dot("#16a34a", 6)}Yayında`, "green")}</div>
    <div class="row" style="gap:10px;margin-top:14px">${(ios ? [["Sürüm", "2.4.0"], ["Gönderim", "12 Eki"], ["Puan", "4,8"]] : [["Sürüm", "2.4.0"], ["Dağıtım", "%20"], ["Puan", "4,7"]]).map(([a, b]) => `<div style="flex:1;padding:9px 12px;border-radius:12px;background:#f5f8fd"><div style="font-size:12px;color:#7f8aa3">${a}</div><div style="font-size:16px;font-weight:600">${b}</div></div>`).join("")}</div>
  </div>`;
}
export function mobilDesktop() {
  return app(guruSide("UYGULAMA", APP_NAV(0), APP_USER, APP_MAN), `
    ${head("Pati Klinik Uygulaması", "Sürüm 2.4 · iOS ve Android · tek kod tabanı", btn("Test sürümü", "flask-conical") + btn("Yayına gönder", "rocket", "pri"))}
    <div class="row" style="gap:14px" data-durak="magaza">${storeCard("ios")}${storeCard("android")}
      <div class="card" style="padding:18px 20px;width:300px;flex-shrink:0"><div class="row" style="gap:10px"><span class="lbl">Aktif kullanıcı</span>${ib("users", "blue", 32)}</div><div style="font-size:30px;font-weight:600;letter-spacing:-.03em;line-height:1.1;margin-top:2px">8.940</div><div class="row" style="gap:8px;font-size:12.5px;margin-top:6px">${up("+%14")}<span style="color:#8a95ad">çökmesiz oturum %99,8</span></div></div>
    </div>
    <div style="flex:1;min-height:0;display:flex;gap:14px">
      <div class="card" style="flex:1;min-width:0;padding:20px 22px" data-durak="ekranlar">
        ${cardHead("Sürüm 2.4 ekranları", "Tasarım onaylandı · 3 yeni ekran", tag("Tasarımla birebir", "blue"))}
        <div class="row" style="gap:26px;justify-content:center;margin-top:18px">${[[patiHome(), "Ana sayfa"], [patiBook(), "Randevu al"], [patiDone(), "Onay"]].map(([s, t]) => `<div style="display:grid;justify-items:center;gap:10px">${miniPhone(s, 186)}<span style="font-size:13.5px;font-weight:500;color:#55617b">${t}</span></div>`).join("")}</div>
      </div>
      <div style="width:330px;flex-shrink:0;display:flex;flex-direction:column;gap:14px">
        <div class="card" style="padding:18px 20px" data-durak="notlar">
          ${cardHead("Sürüm notları", "2.4.0")}
          <div style="display:grid;gap:11px;margin-top:12px">${[["sparkles", "Üç adımda randevu"], ["syringe", "Aşı karnesi ve hatırlatma"], ["message-circle", "Hekime fotoğraflı mesaj"], ["zap", "%30 daha hızlı açılış"]].map(([ic, t]) => `<div class="row" style="gap:10px;font-size:14px">${ib(ic, "blue", 28)}${t}</div>`).join("")}</div>
        </div>
        <div class="card" style="padding:18px 20px;flex:1;min-height:0" data-durak="kullanim">
          ${cardHead("Uygulamadan randevu", "Son 6 ay")}
          <div style="margin-top:14px">${bars([420, 560, 690, 820, 1040, 1284], { w: 290, h: 150, hi: 5, labels: ["Nis", "May", "Haz", "Tem", "Ağu", "Eyl"], fs: 12, r: 7 })}</div>
        </div>
      </div>
    </div>`);
}
export function lockScreen({ w = 390 } = {}) {
  return `<div style="width:390px;height:844px;font-family:Outfit;color:#fff;background:radial-gradient(90% 60% at 30% 10%,#3c8be8,#12419b 50%,#011441);display:flex;flex-direction:column;overflow:hidden">${statusBar("#fff")}
    <div style="text-align:center;margin-top:40px"><div style="font-size:18px;font-weight:500;opacity:.85">Perşembe, 16 Ekim</div><div style="font-size:92px;font-weight:600;letter-spacing:-.03em;line-height:1">18:30</div></div>
    <div style="margin:auto 14px 120px;padding:14px 16px;border-radius:22px;background:rgb(255 255 255/.86);color:#0c1a3a;box-shadow:0 20px 40px -20px rgb(0 0 0/.5)">
      <div class="row" style="gap:10px;font-size:13px;color:#55617b">${PATI(24)}<span style="font-weight:600;letter-spacing:.04em">PATİ KLİNİK</span><span style="margin-left:auto">şimdi</span></div>
      <div style="font-size:16px;font-weight:600;margin-top:8px">Pamuk'un aşı günü yarın</div><div style="font-size:14.5px;color:#3b4763;margin-top:2px">Cuma 10:30 · Saati değiştirmek için dokunun.</div>
    </div></div>`;
}
export function mobilPushDesktop() {
  return app(guruSide("UYGULAMA", APP_NAV(3), APP_USER, APP_MAN), `
    ${head("Bildirim Kampanyası", "Aşı hatırlatma · otomatik · her gün 18:30", tag(`${dot("#16a34a", 6)}Çalışıyor`, "green", "font-size:13px;padding:6px 12px") + btn("Yeni bildirim", "plus", "pri"))}
    <div style="flex:1;min-height:0;display:flex;gap:14px">
      <div class="card" style="flex:1;min-width:0;padding:20px 22px;display:flex;flex-direction:column;gap:16px" data-durak="metin">
        <div class="h3">Bildirim içeriği</div>
        ${[["Başlık", "{dost_adı}'un aşı günü yarın"], ["Mesaj", "{gün} {saat} · Saati değiştirmek için dokunun."], ["Açılacak ekran", "Randevu ayrıntısı"], ["Gönderim zamanı", "Her gün 18:30 · sessiz saatlerde gönderilmez"]].map(([a, b]) => `<div><div class="lbl" style="font-size:12.5px;margin-bottom:6px">${a}</div><div style="padding:12px 14px;border-radius:12px;background:#f5f8fd;font-size:14.5px;${ELL}">${b.replace(/\{([^}]+)\}/g, '<span style="padding:1px 7px;border-radius:6px;background:#eaf2ff;color:#12419b;font-weight:500">$1</span>')}</div></div>`).join("")}
        <div><div class="lbl" style="font-size:12.5px;margin-bottom:8px">Hedef kitle</div><div class="row" style="gap:8px;flex-wrap:wrap">${tag("Aşısı 7 gün içinde olanlar", "blue", "font-size:13px;padding:6px 11px")}${tag("Bildirim izni açık", "blue", "font-size:13px;padding:6px 11px")}${tag("Türkçe", "gray", "font-size:13px;padding:6px 11px")}</div></div>
        <div class="row" style="gap:10px;margin-top:auto;padding:14px 16px;border-radius:14px;background:#eaf2ff;color:#12419b;font-size:14px;font-weight:500">${icon("users", { size: 17 })}Bugün 214 kişiye gönderilecek</div>
      </div>
      <div class="card" style="width:300px;flex-shrink:0;padding:20px;display:grid;justify-items:center;align-content:start;gap:12px" data-durak="onizleme">
        <div class="h3" style="justify-self:start">Önizleme</div>${miniPhone(lockScreen(), 240)}
      </div>
      <div style="width:290px;flex-shrink:0;display:flex;flex-direction:column;gap:14px" data-durak="sonuc">
        ${[["send", "blue", "Gönderilen", "6.120", "son 30 gün"], ["mouse-pointer-click", "violet", "Açılma oranı", "%18,4", "sektör ort. %7"], ["calendar-check", "green", "Oluşan randevu", "214", "bildirimden sonra"]].map(([ic, t, a, b, c]) => `<div class="card" style="padding:18px 20px;flex:1"><div class="row" style="gap:10px"><span class="lbl">${a}</span><span style="margin-left:auto">${ib(ic, t, 34)}</span></div><div style="font-size:32px;font-weight:600;letter-spacing:-.03em;margin-top:4px">${b}</div><div style="font-size:12.5px;color:#8a95ad">${c}</div></div>`).join("")}
      </div>
    </div>`);
}
export function mobilFlowDesktop() {
  const S = [[patiLogin(), "Giriş"], [patiHome(), "Ana sayfa"], [patiBook(), "Randevu al"], [patiDone(), "Onay"]];
  return app(guruSide("UYGULAMA", APP_NAV(1), APP_USER, APP_MAN), `
    ${head("Ekran Akışı", "Randevu yolculuğu · 4 ekran · tasarım onaylandı", btn("Prototipi aç", "play") + btn("Yorum ekle", "message-square-plus", "pri"))}
    <div class="card" style="flex:1;min-height:0;padding:0;position:relative;overflow:hidden;background-color:#f5f8fd;background-image:radial-gradient(#d3deee 1.2px,transparent 1.2px);background-size:22px 22px" data-durak="akis">
      <div class="row" style="position:absolute;left:0;right:0;top:40px;justify-content:center;gap:56px">${S.map(([s, t], i) => `<div style="position:relative;display:grid;justify-items:center;gap:12px"><div class="row" style="gap:8px;font-size:14px;font-weight:600"><span style="width:24px;height:24px;border-radius:8px;background:#12419b;color:#fff;display:grid;place-items:center;font-size:12px">${i + 1}</span>${t}</div>${miniPhone(s, 232)}</div>`).join("")}</div>
      <svg width="1136" height="200" style="position:absolute;left:0;top:250px">${[0, 1, 2].map((i) => { const x = (1136 - 4 * 232 - 3 * 56) / 2 + 232 + 288 * i + 4; return `<path d="M${x} 100 H${x + 40}" stroke="#2a6aca" stroke-width="2.5" stroke-dasharray="5 6"/><path d="M${x + 38} 94 L${x + 46} 100 L${x + 38} 106" fill="none" stroke="#2a6aca" stroke-width="2.5" stroke-linecap="round"/>`; }).join("")}</svg>
      <div class="row" style="position:absolute;left:24px;right:24px;bottom:22px;gap:12px">${[["BY", "Barış Yıldız", "Onay ekranına takvime ekle düğmesi eklendi.", 3], ["AT", "Aylin Tan", "Randevu saatleri klinik sistemiyle aynı olsun.", 1], ["KA", "Kerem Alp", "Giriş ekranı tek adıma indirildi.", 0]].map(([i, n, t, k]) => `<div class="row" style="flex:1;min-width:0;gap:10px;padding:12px 14px;border-radius:14px;background:#fff;box-shadow:0 10px 24px -16px rgb(12 26 58/.35)">${av(i, 30, k)}<div style="min-width:0"><div style="font-size:13px;font-weight:600">${n}</div><div style="font-size:12.5px;color:#55617b;${ELL}">${t}</div></div></div>`).join("")}</div>
    </div>`);
}

/* ======================================================================
   6. MARKA TESCİL · müşteri: Zeyda Gıda (kurgusal; resmi kurum arayüzü değildir)
   ====================================================================== */
export const ZEYDA = (s = 1, c = "#0b2a66") => `<div class="row" style="gap:${10 * s}px;color:${c}"><svg width="${34 * s}" height="${34 * s}" viewBox="0 0 34 34"><path d="M17 31 C17 22 17 14 21 6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><path d="M19 13 C12 12 8 7 9 2 C15 3 19 7 19 13Z" fill="currentColor"/><path d="M18 20 C25 20 29 15 29 10 C23 10 18 14 18 20Z" fill="currentColor" opacity=".55"/></svg><span style="font-size:${22 * s}px;font-weight:600;letter-spacing:.18em">ZEYDA</span></div>`;
const MRK_NAV = (on) => [["layout-dashboard", "Başvurularım"], ["search", "Marka Araştırma"], ["shapes", "Sınıf Seçimi"], ["folder", "Belgeler"], ["bell", "Bülten Takibi"], ["refresh-cw", "Yenilemeler"], ["settings", "Ayarlar"]].map((x, i) => (i === on ? [x[0], x[1], true, x[3]] : x));
const MRK_USER = ["SÖ", "Sinan Özer", "Zeyda Gıda", 0];
const MRK_MAN = ["NG", "Nazlı Gür", "Marka danışmanı", 4];
export const MRK_STEPS = [["search", "Araştırma", "3 Mart", 1], ["file-text", "Başvuru", "12 Mart", 1], ["scan-search", "İnceleme", "28 Mayıs", 1], ["newspaper", "Bülten yayını", "İtiraz süresi", 0.5], ["badge-check", "Tescil", "Bekleniyor", 0]];
export function mrkTimeline({ big = false } = {}) {
  const d = big ? 50 : 44;
  return `<div class="row" style="align-items:flex-start;gap:0">${MRK_STEPS.map(([ic, n, s, p], i) => `<div style="flex:1;min-width:0;display:grid;gap:10px">
    <div class="row">${p === 1 ? ibox("check", "#12419b", "#fff", d, d / 2) : p ? ibox(ic, "#fff", "#12419b", d, d / 2).replace("background:#fff", "background:#fff;box-shadow:inset 0 0 0 3px #2a6aca,0 0 0 6px #dbe9fd") : ibox(ic, "#eef1f6", "#a0aac0", d, d / 2)}
      ${i < 4 ? `<span style="flex:1;height:4px;margin:0 10px;border-radius:9px;background:${p === 1 ? "#12419b" : p ? "linear-gradient(90deg,#2a6aca 40%,#e3eaf5 40%)" : "#e3eaf5"}"></span>` : ""}</div>
    <div><div style="font-size:${big ? 17 : 15}px;font-weight:600">${n}</div><div style="font-size:${big ? 14 : 12.5}px;color:${p && p < 1 ? "#2a6aca" : "#8a95ad"};font-weight:${p && p < 1 ? 600 : 400}">${s}</div></div></div>`).join("")}</div>`;
}
export function mrkCountdown() {
  return `<div class="card" style="padding:20px 22px;background:linear-gradient(150deg,#011441,#12419b 70%,#2a6aca);color:#fff">
    <div class="row" style="gap:10px;font-size:14px;color:#bfe0ff">${icon("hourglass", { size: 17, color: "#bfe0ff" })}Bülten itiraz süresi</div>
    <div class="row" style="gap:18px;margin-top:14px"><div style="position:relative;width:104px;height:104px;flex-shrink:0">${ring(70, { d: 104, thick: 11, color: "#fff", track: "rgb(255 255 255/.18)" })}<div style="position:absolute;inset:0;display:grid;place-items:center;text-align:center;line-height:1.05"><div><div style="font-size:30px;font-weight:600">18</div><div style="font-size:12px;opacity:.75">gün kaldı</div></div></div></div>
      <div style="font-size:14px;line-height:1.5;opacity:.9">Yayın 2 Eylül · süre 2 ay. Şu ana kadar <b>itiraz yok</b>.</div></div>
  </div>`;
}
export function mrkDocs() {
  return `<div class="card" style="padding:18px 20px;height:100%">
    ${cardHead("Belgeler", "6 dosya")}
    <div style="display:grid;gap:14px;margin-top:16px">${[["Başvuru formu", "PDF · 12 Mart", "file-text"], ["Vekaletname", "PDF · imzalı", "file-pen-line"], ["Logo örneği", "PNG · 2000 px", "image"], ["Ön araştırma raporu", "PDF · 3 Mart", "file-search"], ["Mal ve hizmet listesi", "PDF · 3 sınıf", "list-checks"], ["Bülten sayfası", "PDF · 2 Eylül", "newspaper"]].map(([a, b, ic]) => `<div class="row" style="gap:11px;min-width:0">${ib(ic, "blue", 34)}<div style="flex:1;min-width:0"><div style="font-size:14px;font-weight:500;${ELL}">${a}</div><div style="font-size:12px;color:#8a95ad">${b}</div></div>${icon("download", { size: 16, color: "#8a95ad" })}</div>`).join("")}</div>
  </div>`;
}
export function mrkLog() {
  return `<div class="card" style="padding:18px 20px;height:100%">
    ${cardHead("Süreç kayıtları", "Nazlı Gür tarafından takip ediliyor")}
    <div style="display:grid;gap:16px;margin-top:16px">${[["eye", "blue", "Bülten itirazları izleniyor", "Her hafta · son kontrol 12 Ekim"], ["newspaper", "blue", "Resmi bültende yayımlandı", "2 Eylül 2026"], ["scan-search", "green", "Şekli inceleme olumlu", "28 Mayıs 2026"], ["file-text", "green", "Başvuru yapıldı, ücret ödendi", "12 Mart 2026"], ["shapes", "green", "Sınıf listesi onaylandı", "8 Mart 2026"], ["search", "green", "Ön araştırma: düşük-orta risk", "3 Mart 2026"]].map(([ic, t, a, b]) => `<div class="row" style="gap:12px;min-width:0">${ib(ic, t, 34)}<div style="min-width:0;flex:1"><div style="font-size:14px;font-weight:500;${ELL}">${a}</div><div style="font-size:12px;color:#8a95ad">${b}</div></div></div>`).join("")}</div>
  </div>`;
}
export function markaDesktop() {
  return app(guruSide("MARKA", MRK_NAV(0), MRK_USER, MRK_MAN), `
    ${head("Başvuru Takibi", "ZEYDA · başvuru no 2026/014582 · 3 sınıf", btn("Belgeleri indir", "download") + btn("Danışmana yaz", "message-circle", "pri"))}
    <div class="card" style="padding:22px 26px" data-durak="zaman">
      <div class="row" style="gap:18px;margin-bottom:22px"><div style="padding:12px 18px;border-radius:14px;background:#f5f8fd">${ZEYDA(0.9)}</div><div><div style="font-size:18px;font-weight:600">ZEYDA · şekil ve kelime markası</div><div class="row" style="gap:8px;margin-top:6px">${["29", "30", "35"].map((c) => tag(`Sınıf ${c}`, "blue")).join("")}${tag(`${dot("#2a6aca", 6)}Bülten aşamasında`, "violet")}</div></div></div>
      ${mrkTimeline({ big: true })}
    </div>
    <div style="flex:1;min-height:0;display:flex;gap:14px">
      <div style="flex:1;min-width:0" data-durak="kayit">${mrkLog()}</div>
      <div style="width:300px;flex-shrink:0" data-durak="belge">${mrkDocs()}</div>
      <div style="width:300px;flex-shrink:0;display:flex;flex-direction:column;gap:14px">
        <div data-durak="sure">${mrkCountdown()}</div>
        <div class="card" style="padding:16px 20px;flex:1;min-height:0"><div class="row" style="gap:12px">${ib("shield-check", "green", 36)}<div><div style="font-size:14.5px;font-weight:600">Koruma süresi</div><div style="font-size:12.5px;color:#8a95ad">Tescilden itibaren 10 yıl</div></div></div><div style="font-size:13px;color:#55617b;margin-top:10px;line-height:1.45">Yenileme tarihi otomatik takip edilir.</div></div>
      </div>
    </div>`);
}
export const MRK_SIM = [["ZEYDAN", "29", "Tescilli", 72, "Orta"], ["ZEYNA", "30", "Başvuru", 58, "Orta"], ["ZEYTUNA", "29", "Tescilli", 41, "Düşük"], ["ZEYDE", "43", "Tescilli", 38, "Düşük"], ["SEYDA", "3", "Tescilli", 34, "Düşük"], ["ZEYDA KAFE", "43", "Reddedildi", 30, "Düşük"]];
export function mrkSimTable({ n = 6, rh = 54 } = {}) {
  const risk = (r) => (r === "Orta" ? tag(`${dot("#e8a33a", 6)}Orta`, "amber") : tag(`${dot("#16a34a", 6)}Düşük`, "green"));
  return table("minmax(0,1.4fr) .6fr .9fr minmax(0,1.5fr) .8fr", ["Marka", "Sınıf", "Durum", "Benzerlik", "Risk"], MRK_SIM.slice(0, n).map(([a, b, c, p, r]) => [`<b style="font-weight:600;letter-spacing:.06em">${a}</b>`, b, `<span style="color:#55617b">${c}</span>`, `<span class="row" style="gap:10px"><span style="flex:1">${meter(p, p > 50 ? "#e8a33a" : "#2a6aca", 6)}</span><b style="width:36px;text-align:right">%${p}</b></span>`, risk(r)]), { rh });
}
export function mrkVerdict() {
  return `<div class="card" style="padding:20px 22px">
    <div class="row" style="gap:12px">${ib("shield-check", "green", 42)}<div><div style="font-size:12.5px;font-weight:600;letter-spacing:.06em;color:#12873f">DANIŞMAN DEĞERLENDİRMESİ</div><div style="font-size:18px;font-weight:600">Başvuruya uygun</div></div></div>
    <div style="font-size:14px;line-height:1.5;color:#3b4763;margin-top:12px">29. sınıfta “ZEYDAN” ile görsel fark yeterli. Şekil unsuru ile birlikte başvurmanızı öneriyoruz.</div>
    <div class="row" style="gap:10px;margin-top:14px">${[["Taranan", "1.240"], ["Benzer", "6"], ["Yüksek risk", "0"]].map(([a, b]) => `<div style="flex:1;padding:9px 12px;border-radius:12px;background:#f5f8fd"><div style="font-size:12px;color:#7f8aa3">${a}</div><div style="font-size:17px;font-weight:600">${b}</div></div>`).join("")}</div>
  </div>`;
}
export function markaSearchDesktop() {
  return app(guruSide("MARKA", MRK_NAV(1), MRK_USER, MRK_MAN), `
    ${head("Benzer Marka Araştırması", "Ön araştırma raporu · 3 Mart 2026", btn("Raporu indir", "file-down") + btn("Başvuruya geç", "arrow-right", "pri"))}
    <div class="card" style="padding:16px 18px" data-durak="arama"><div class="row" style="gap:12px"><div class="row" style="flex:1;gap:10px;height:50px;padding:0 16px;border-radius:14px;background:#f5f8fd;font-size:17px;font-weight:600;letter-spacing:.08em">${icon("search", { size: 19, color: "#2a6aca" })}ZEYDA<span style="margin-left:auto;font-size:13px;font-weight:400;letter-spacing:0;color:#8a95ad">ses, yazım ve anlam benzerliği</span></div>${["29", "30", "35"].map((c) => tag(`Sınıf ${c}`, "blue", "font-size:13px;padding:8px 12px")).join("")}</div></div>
    <div style="flex:1;min-height:0;display:flex;gap:14px">
      <div class="card" style="flex:1;min-width:0;padding:18px 20px" data-durak="sonuc">
        ${cardHead("Benzer kayıtlar", "Benzerlik oranına göre", tag("6 sonuç", "blue"))}
        <div style="margin-top:12px">${mrkSimTable({ rh: 62 })}</div>
      </div>
      <div style="width:350px;flex-shrink:0;display:flex;flex-direction:column;gap:14px">
        <div data-durak="karar">${mrkVerdict()}</div>
        <div class="card" style="padding:18px 20px;flex:1;min-height:0" data-durak="risk">
          ${cardHead("Risk dağılımı", "Sınıflara göre")}
          <div style="display:grid;gap:14px;margin-top:14px">${[["Sınıf 29 · gıda ürünleri", 34, "#e8a33a"], ["Sınıf 30 · kahvaltılıklar", 22, "#2a6aca"], ["Sınıf 35 · perakende", 8, "#16a34a"]].map(([a, p, c]) => `<div><div class="row" style="font-size:13.5px"><span>${a}</span><span style="margin-left:auto;font-weight:600">%${p}</span></div><div style="margin-top:6px">${meter(p * 2, c, 7)}</div></div>`).join("")}</div>
          <div class="row" style="gap:10px;margin-top:18px;padding:12px 14px;border-radius:12px;background:#f5f8fd;font-size:13px;color:#55617b;line-height:1.4">${icon("info", { size: 16, color: "#2a6aca" })}Oranlar ses, yazım ve anlam benzerliğinin ortalamasıdır.</div>
        </div>
      </div>
    </div>`);
}
export const NICE_SEL = { 29: ["Zeytinyağı ve yemeklik yağlar", "İşlenmiş zeytin", "Zeytin ezmesi"], 30: ["Kahvaltılık soslar", "Baharat karışımları"], 35: ["Çevrim içi perakende satış", "Pazarlama hizmetleri"] };
export function niceGrid({ cell = 52 } = {}) {
  return `<div style="display:grid;grid-template-columns:repeat(9,${cell}px);gap:8px">${Array.from({ length: 45 }, (_, i) => { const n = i + 1; const on = NICE_SEL[n]; const sug = [32, 43].includes(n); return `<div style="height:${cell * 0.8}px;border-radius:11px;display:grid;place-items:center;font-size:15px;font-weight:600;${on ? "background:#12419b;color:#fff;box-shadow:0 8px 16px -8px rgb(18 65 155/.7)" : sug ? "background:#eaf2ff;color:#12419b;box-shadow:inset 0 0 0 2px #9fc1ec" : n > 34 ? "background:#f5f8fd;color:#8a95ad" : "background:#f5f8fd;color:#55617b"}">${n}</div>`; }).join("")}</div>`;
}
export function niceDetail({ cols = false } = {}) {
  return `<div class="card" style="padding:20px 22px;height:100%">
    ${cardHead("Seçilen mal ve hizmetler", "3 sınıf · 7 kalem")}
    <div style="display:grid;gap:16px;margin-top:14px;${cols ? "grid-template-columns:repeat(3,minmax(0,1fr))" : ""}">${Object.entries(NICE_SEL).map(([c, items]) => `<div><div class="row" style="gap:8px">${tag(`Sınıf ${c}`, "blue")}<span style="font-size:13px;color:#7f8aa3">${{ 29: "Gıda ürünleri", 30: "Kahvaltılık ve baharat", 35: "Perakende ve reklam" }[c]}</span></div>
      <div style="display:grid;gap:7px;margin-top:9px">${items.map((t) => `<div class="row" style="gap:10px;font-size:14px"><span style="width:20px;height:20px;border-radius:6px;background:#12419b;display:grid;place-items:center;flex-shrink:0">${icon("check", { size: 13, color: "#fff", stroke: 3 })}</span>${t}</div>`).join("")}</div></div>`).join("")}</div>
  </div>`;
}
/* Tescil belgesi önizlemesi: genel tasarım, resmi belge değildir */
export function certificate({ w = 330 } = {}) {
  return `<div style="width:${w}px;padding:22px;border-radius:14px;background:linear-gradient(180deg,#ffffff,#f7faff);box-shadow:0 0 0 1px #e3eaf5,0 24px 50px -24px rgb(1 12 40/.45);position:relative;overflow:hidden">
    <div style="position:absolute;inset:10px;border-radius:9px;box-shadow:inset 0 0 0 1.5px #c9d8ee"></div>
    <div style="position:relative;text-align:center">
      <div style="font-size:11px;font-weight:600;letter-spacing:.2em;color:#2a6aca">ÖRNEK BELGE</div>
      <div style="font-size:20px;font-weight:600;margin-top:6px">Marka Tescil Belgesi</div>
      <div style="display:flex;justify-content:center;margin:16px 0 12px;padding:14px;border-radius:12px;background:#f1f6fd">${ZEYDA(0.95)}</div>
      ${[["Sınıflar", "29 · 30 · 35"], ["Koruma", "10 yıl"], ["Sahibi", "Zeyda Gıda A.Ş."]].map(([a, b]) => `<div class="row" style="font-size:13px;padding:6px 4px"><span style="color:#7f8aa3">${a}</span><span style="margin-left:auto;font-weight:600">${b}</span></div>`).join("")}
      <div class="row" style="margin-top:12px;justify-content:space-between;align-items:flex-end"><div style="width:96px;height:2px;background:#c9d8ee"></div><span style="width:58px;height:58px;border-radius:50%;background:radial-gradient(circle,#2a6aca,#12419b);display:grid;place-items:center;box-shadow:0 0 0 4px #dbe9fd">${icon("badge-check", { size: 28, color: "#fff" })}</span></div>
    </div></div>`;
}
export function markaClassDesktop() {
  return app(guruSide("MARKA", MRK_NAV(2), MRK_USER, MRK_MAN), `
    ${head("Sınıf Seçimi", "Nice sınıflandırması · 45 sınıf", btn("Sınıf rehberi", "book-open") + btn("Listeyi onayla", "check", "pri"))}
    <div style="flex:1;min-height:0;display:flex;gap:14px">
      <div style="flex:1;min-width:0;display:flex;flex-direction:column;gap:14px">
        <div class="card" style="padding:20px 22px" data-durak="siniflar">
          ${cardHead("Sınıflar", "Mallar 1-34 · Hizmetler 35-45", `<span class="row" style="gap:6px;font-size:12.5px;color:#55617b">${dot("#12419b", 8)}Seçili</span><span class="row" style="gap:6px;font-size:12.5px;color:#55617b">${dot("#9fc1ec", 8)}Önerilen</span>`)}
          <div style="margin-top:16px">${niceGrid({ cell: 76 })}</div>
        </div>
        <div style="flex:1;min-height:0" data-durak="liste">${niceDetail({ cols: true })}</div>
      </div>
      <div style="width:330px;flex-shrink:0;display:flex;flex-direction:column;gap:14px">
        <div class="card" style="padding:18px 20px" data-durak="oneri"><div class="row" style="gap:12px;align-items:flex-start">${ib("lightbulb", "amber", 38)}<div style="min-width:0"><div style="font-size:15px;font-weight:600">Önerilen ek sınıflar: 32 ve 43</div><div style="font-size:13px;color:#7f8aa3;line-height:1.4;margin-top:3px">İçecek ürünleri ve kafe açma planı varsa korumayı genişletir.</div></div></div></div>
        <div class="card" style="padding:20px;flex:1;min-height:0;display:grid;place-items:center;background:linear-gradient(160deg,#f5f9ff,#e6effb)" data-durak="belge">${certificate({ w: 280 })}</div>
      </div>
    </div>`);
}
export function markaMobile() {
  return phoneScreen(`
    ${mHead("ZEYDA", "Başvuru 2026/014582")}
    <div style="padding:16px 18px;border-radius:18px;background:#fff;box-shadow:0 0 0 2px #2a6aca,0 14px 30px -18px rgb(18 65 155/.6)">
      <div class="row" style="gap:10px;font-size:12.5px;color:#7f8aa3"><span style="width:24px;height:24px;border-radius:8px;background:#12419b;display:grid;place-items:center">${icon("newspaper", { size: 14, color: "#fff" })}</span><span style="font-weight:600;color:#3b4763;letter-spacing:.04em">MARKA TAKİBİ</span><span style="margin-left:auto">2 Eyl</span></div>
      <div style="font-size:16px;font-weight:600;margin-top:8px">Markanız bültende yayımlandı</div><div style="font-size:13.5px;color:#3b4763;margin-top:2px">İtiraz süresi 2 ay. Gelişmeleri sizin için izliyoruz.</div>
    </div>
    <div class="card" style="padding:18px">
      <div style="display:grid;gap:0">${MRK_STEPS.map(([ic, n, s, p], i) => `<div class="row" style="gap:14px;align-items:flex-start"><div style="display:grid;justify-items:center">${p === 1 ? ibox("check", "#12419b", "#fff", 32, 16) : p ? ibox(ic, "#eaf2ff", "#12419b", 32, 16).replace("background:#eaf2ff", "background:#fff;box-shadow:inset 0 0 0 2.5px #2a6aca") : ibox(ic, "#eef1f6", "#a0aac0", 32, 16)}${i < 4 ? `<span style="width:3px;height:22px;border-radius:9px;background:${p === 1 ? "#12419b" : "#e3eaf5"}"></span>` : ""}</div><div style="padding-top:5px"><div style="font-size:15px;font-weight:600">${n}</div><div style="font-size:12.5px;color:${p && p < 1 ? "#2a6aca" : "#8a95ad"}">${s}</div></div></div>`).join("")}</div>
    </div>
    <div class="card" style="padding:14px 16px">${mRow("file-text", "blue", "Başvuru belgeleri", "6 dosya · indirmeye hazır", "")}</div>
    <div class="row" style="gap:10px">${[["Sınıf", "29 · 30 · 35"], ["Kalan süre", "18 gün"]].map(([a, b]) => `<div class="card" style="flex:1;padding:12px 14px"><div style="font-size:12px;color:#7f8aa3">${a}</div><div style="font-size:17px;font-weight:600">${b}</div></div>`).join("")}</div>
  `, [["layout-dashboard", "Başvurular", true], ["search", "Araştır"], ["folder", "Belgeler"], ["message-circle", "Danışman"]]);
}

/* ======================================================================
   7. E-TİCARET YÖNETİMİ · müşteri: Pamuk Sokağı (ev tekstili)
   Pazaryeri adları yalnız metin; logo ya da arayüz kullanılmaz.
   ====================================================================== */
const ETK_NAV = (on) => [["layout-dashboard", "Mağaza Özeti"], ["shopping-bag", "Siparişler", false, 38], ["package", "Ürünler"], ["store", "Kanallar"], ["truck", "Kargo ve İade"], ["badge-percent", "Kampanyalar"], ["settings", "Ayarlar"]].map((x, i) => (i === on ? [x[0], x[1], true, x[3]] : x));
const ETK_USER = ["İB", "İpek Bulut", "Pamuk Sokağı", 7];
const ETK_MAN = ["CD", "Cem Duran", "E-ticaret uzmanı", 2];
const chTile = (l, bg, d = 30) => `<span style="width:${d}px;height:${d}px;border-radius:${d * 0.3}px;background:${bg};color:#fff;display:grid;place-items:center;font-size:${d * 0.42}px;font-weight:700;flex-shrink:0">${l}</span>`;
export const ETK_CH = [["Kendi site", "S", "#12419b", "₺71.300", 92, 84], ["Trendyol", "T", "#2a6aca", "₺52.800", 68, 70], ["Hepsiburada", "H", "#5b8fd8", "₺29.400", 34, 41], ["Amazon", "A", "#8fb4e6", "₺14.700", 20, 22]];
export function etkChannels() {
  return `<div class="card" style="padding:20px 22px;height:100%">
    ${cardHead("Kanallara göre bugün", "214 sipariş · ₺168.240", tag("4 kanal", "blue"))}
    <div style="display:grid;gap:15px;margin-top:16px">${ETK_CH.map(([n, l, c, v, o, p]) => `<div class="row" style="gap:12px;min-width:0">${chTile(l, c, 34)}<div style="flex:1;min-width:0"><div class="row" style="gap:10px"><span style="font-size:14.5px;font-weight:500;${ELL}">${n}</span><span style="margin-left:auto;font-size:14.5px;font-weight:600;flex-shrink:0">${v}</span></div><div class="row" style="gap:10px;margin-top:6px"><div style="flex:1">${meter(p, c, 5)}</div><span style="width:74px;text-align:right;font-size:12.5px;color:#8a95ad;flex-shrink:0">${o} sipariş</span></div></div></div>`).join("")}</div>
  </div>`;
}
export const ETK_ORD = [["#PS-48213", "Elif Yaman", "Kendi site", "₺1.890", "Hazırlanıyor"], ["#PS-48212", "Murat Sezer", "Trendyol", "₺1.240", "Kargoda"], ["#PS-48211", "Derya Koç", "Hepsiburada", "₺2.460", "Hazırlanıyor"], ["#PS-48210", "Hande Polat", "Kendi site", "₺780", "Teslim edildi"], ["#PS-48209", "Okan Uslu", "Amazon", "₺3.150", "Kargoda"]];
const etkSt = (s) => ({ Hazırlanıyor: tag(`${dot("#7c5cff", 6)}Hazırlanıyor`, "violet"), Kargoda: tag(`${dot("#2a6aca", 6)}Kargoda`, "blue"), "Teslim edildi": tag(`${icon("check", { size: 11, stroke: 3 })}Teslim edildi`, "green") })[s];
export function etkOrders({ n = 5, rh = 48 } = {}) {
  return table(".9fr minmax(0,1.3fr) minmax(0,1.1fr) .7fr 1.1fr", ["Sipariş", "Müşteri", "Kanal", "r:Tutar", "Durum"], ETK_ORD.slice(0, n).map(([a, b, c, d, e]) => [`<span style="color:#55617b;font-weight:500">${a}</span>`, `<b style="font-weight:600">${b}</b>`, `<span class="row" style="gap:8px">${chTile(ETK_CH.find((x) => x[0] === c)[1], ETK_CH.find((x) => x[0] === c)[2], 22)}${c}</span>`, `<b>${d}</b>`, etkSt(e)]), { rh });
}
export function etkStock() {
  return `<div class="card" style="padding:18px 20px;height:100%">
    ${cardHead("Stok uyarıları", "Tüm kanallarda eşitlenir", tag("4", "amber"))}
    <div style="display:grid;gap:13px;margin-top:14px">${[["Organik nevresim · çift", "12 adet", "amber"], ["Waffle pike · gri", "6 adet", "red"], ["Bambu havlu seti", "18 adet", "amber"], ["Keten masa örtüsü", "24 adet", "amber"]].map(([a, b, t]) => `<div class="row" style="gap:11px;min-width:0">${ib("package", t, 32)}<span style="flex:1;font-size:14px;${ELL}">${a}</span><span style="flex-shrink:0;font-size:13px;font-weight:600;color:${IC[t][1]}">${b}</span></div>`).join("")}</div>
  </div>`;
}
export function eticaretDesktop() {
  return app(guruSide("E-TİCARET", ETK_NAV(0), ETK_USER, ETK_MAN), `
    ${head("Mağaza Özeti", "Pamuk Sokağı · bugün 14 Ekim · 4 satış kanalı", sel("Bugün", "calendar") + btn("Kampanya kur", "badge-percent", "pri"))}
    <div class="row" style="gap:14px" data-durak="kpi">
      ${kpi("Bugünkü sipariş", "214", "+%18", "shopping-bag", { note: "geçen haftaya göre" })}
      ${kpi("Ciro", "₺168.240", "+%22", "wallet", { note: "geçen haftaya göre" })}
      ${kpi("Dönüşüm oranı", "%2,9", "+0,4 puan", "mouse-pointer-click", { note: "kendi site" })}
      ${kpi("Ortalama sepet", "₺786", "+₺42", "shopping-cart", { note: "bu ay" })}
    </div>
    <div style="flex:1;min-height:0;display:flex;gap:14px">
      <div style="flex:1;min-width:0" data-durak="kanal">${etkChannels()}</div>
      <div style="width:390px;flex-shrink:0" data-durak="stok">${etkStock()}</div>
    </div>
    <div class="card" style="padding:18px 20px 8px" data-durak="siparis">
      ${cardHead("Son siparişler", "Tüm kanallar tek listede", `<span class="lbl">38 bekleyen</span>${icon("chevron-right", { size: 16, color: "#8a95ad" })}`)}
      <div style="margin-top:12px">${etkOrders({ n: 4, rh: 46 })}</div>
    </div>`);
}
/* Ürün görseli: katlanmış nevresim illüstrasyonu */
export function linenArt(w = 300, h = 300) {
  return `<svg width="${w}" height="${h}" viewBox="0 0 300 300" style="display:block"><defs><linearGradient id="lb" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f3f7fd"/><stop offset="1" stop-color="#dbe8f8"/></linearGradient><pattern id="lp" width="14" height="14" patternUnits="userSpaceOnUse"><rect width="14" height="14" fill="#ffffff"/><rect width="7" height="14" fill="#eaf1fb"/></pattern></defs>
    <rect width="300" height="300" fill="url(#lb)"/><ellipse cx="150" cy="248" rx="112" ry="14" fill="#c4d6ee"/>
    <rect x="52" y="176" width="196" height="66" rx="12" fill="#12419b"/><rect x="52" y="176" width="196" height="14" rx="7" fill="#2a5bb8"/>
    <rect x="62" y="124" width="176" height="58" rx="12" fill="url(#lp)"/><rect x="62" y="124" width="176" height="12" rx="6" fill="#fff"/>
    <rect x="72" y="80" width="156" height="50" rx="12" fill="#8fb6e6"/><rect x="72" y="80" width="156" height="11" rx="5.5" fill="#a9c7ee"/>
    <rect x="196" y="80" width="10" height="162" fill="#f6efe2" opacity=".9"/><rect x="118" y="196" width="64" height="22" rx="4" fill="#fff"/><rect x="128" y="204" width="44" height="5" rx="2.5" fill="#12419b"/></svg>`;
}
export function etkSync() {
  return `<div class="card" style="padding:18px 20px">
    ${cardHead("Kanal eşitleme", "Fiyat, stok ve içerik")}
    <div style="display:grid;gap:12px;margin-top:14px">${ETK_CH.map(([n, l, c], i) => `<div class="row" style="gap:11px;font-size:14px">${chTile(l, c, 28)}<span style="flex:1">${n}</span>${i === 2 ? tag(`${dot("#e8a33a", 6)}Görsel onayı`, "amber") : tag(`${icon("check", { size: 11, stroke: 3 })}Eşit`, "green")}</div>`).join("")}</div>
  </div>`;
}
export function etkProductEditor() {
  return `<div class="card" style="padding:22px 24px;height:100%;display:flex;gap:24px">
    <div style="width:330px;flex-shrink:0"><div style="border-radius:16px;overflow:hidden">${linenArt(330, 330)}</div>
      <div class="row" style="gap:8px;margin-top:10px">${[0, 1, 2, 3].map((i) => `<div style="flex:1;height:62px;border-radius:10px;overflow:hidden;${i === 0 ? "box-shadow:0 0 0 2px #2a6aca" : "opacity:.75"}">${linenArt(76, 62)}</div>`).join("")}</div></div>
    <div style="flex:1;min-width:0;display:flex;flex-direction:column;gap:14px">
      <div><div class="lbl" style="font-size:12.5px">Ürün adı</div><div style="font-size:22px;font-weight:600;letter-spacing:-.02em;margin-top:4px;line-height:1.2">Organik Pamuk Nevresim Takımı · Çift Kişilik</div></div>
      <div class="row" style="gap:10px">${[["Satış fiyatı", "₺1.890"], ["İndirimli", "₺1.590"], ["Stok", "142"]].map(([a, b]) => `<div style="flex:1;padding:11px 14px;border-radius:12px;background:#f5f8fd"><div style="font-size:12px;color:#7f8aa3">${a}</div><div style="font-size:19px;font-weight:600">${b}</div></div>`).join("")}</div>
      <div><div class="lbl" style="font-size:12.5px;margin-bottom:8px">Renk</div><div class="row" style="gap:8px;flex-wrap:wrap">${[["Lacivert", "#12419b", 1], ["Buz mavisi", "#a9c7ee"], ["Krem", "#efe6d6"], ["Gri", "#b6bfcc"]].map(([n, c, on]) => `<span class="row" style="gap:8px;white-space:nowrap;padding:6px 12px 6px 6px;border-radius:999px;background:${on ? "#eaf2ff" : "#f5f8fd"};font-size:13.5px;${on ? "box-shadow:inset 0 0 0 2px #2a6aca;font-weight:600;color:#12419b" : ""}"><span style="width:22px;height:22px;border-radius:50%;background:${c};box-shadow:inset 0 0 0 1px rgb(0 0 0/.08)"></span>${n}</span>`).join("")}</div></div>
      <div><div class="lbl" style="font-size:12.5px;margin-bottom:6px">Açıklama</div><div style="padding:12px 14px;border-radius:12px;background:#f5f8fd;font-size:14px;line-height:1.5;color:#3b4763">%100 organik pamuk, 200 iplik sıklığı. Nevresim, çarşaf ve iki yastık kılıfı. 40 derecede yıkanabilir.</div></div>
      <div><div class="lbl" style="font-size:12.5px;margin-bottom:6px">Arama başlığı</div><div style="padding:12px 14px;border-radius:12px;background:#f5f8fd;font-size:14px;color:#3b4763;${ELL}">Organik Pamuk Nevresim Takımı Çift Kişilik | Pamuk Sokağı</div></div>
      <div class="row" style="gap:8px;flex-wrap:wrap">${["Nevresim", "Organik", "Çift kişilik", "Yatak odası"].map((t) => tag(t, "gray", "font-size:12.5px;padding:5px 10px")).join("")}</div>
      <div class="row" style="gap:10px;margin-top:auto;padding:12px 14px;border-radius:12px;background:#e6f6ec;color:#12873f;font-size:13.5px;font-weight:500">${icon("sparkles", { size: 16 })}İçerik puanı 92 · arama başlığı ve 8 görsel tamam</div>
    </div>
  </div>`;
}
export function eticaretProductDesktop() {
  return app(guruSide("E-TİCARET", ETK_NAV(2), ETK_USER, ETK_MAN), `
    ${head("Ürün Düzenle", "Ürünler / Nevresim takımları · SKU PS-NV-201", btn("Önizle", "eye") + btn("Tüm kanallarda yayınla", "upload", "pri"))}
    <div style="flex:1;min-height:0;display:flex;gap:14px">
      <div style="flex:1;min-width:0" data-durak="urun">${etkProductEditor()}</div>
      <div style="width:330px;flex-shrink:0;display:flex;flex-direction:column;gap:14px">
        <div data-durak="esitleme">${etkSync()}</div>
        <div class="card" style="padding:18px 20px;flex:1;min-height:0" data-durak="performans">
          ${cardHead("Son 30 gün", "Bu ürün")}
          <div class="row" style="gap:10px;margin-top:14px">${[["Satış", "318"], ["İade", "%1,8"]].map(([a, b]) => `<div style="flex:1;padding:10px 12px;border-radius:12px;background:#f5f8fd"><div style="font-size:12px;color:#7f8aa3">${a}</div><div style="font-size:19px;font-weight:600">${b}</div></div>`).join("")}</div>
          <div style="margin-top:16px">${bars([38, 44, 41, 52, 61, 82], { w: 290, h: 150, hi: 5, labels: ["1. h", "2. h", "3. h", "4. h", "5. h", "Bu h"], fs: 11.5, r: 7 })}</div>
        </div>
      </div>
    </div>`);
}
export const ETK_FLOW = [["Yeni", 24, "#8a95ad", [["#PS-48213", "Elif Yaman", "2 ürün"], ["#PS-48211", "Derya Koç", "3 ürün"]]], ["Hazırlanıyor", 38, "#7c5cff", [["#PS-48206", "Ayşe Gül", "1 ürün"], ["#PS-48204", "Can Er", "4 ürün"]]], ["Kargoya verildi", 61, "#2a6aca", [["#PS-48198", "Murat Sezer", "Takip: 7281"], ["#PS-48195", "Okan Uslu", "Takip: 7264"]]], ["Teslim edildi", 412, "#16a34a", [["#PS-48170", "Hande Polat", "Bugün 10:12"], ["#PS-48168", "Selim Ak", "Bugün 09:40"]]]];
export function etkPipeline({ cards = 2 } = {}) {
  return `<div class="row" style="gap:12px;align-items:stretch">${ETK_FLOW.map(([t, n, c, items]) => `<div style="flex:1;min-width:0;padding:12px;border-radius:16px;background:#eaf0f8">
    <div class="row" style="gap:8px;padding:2px 4px 10px">${dot(c, 9)}<span style="font-size:14.5px;font-weight:600;${ELL}">${t}</span><span style="margin-left:auto;font-size:13px;font-weight:600;color:#3b4763">${n}</span></div>
    <div style="display:grid;gap:8px">${items.slice(0, cards).map(([a, b, d]) => `<div class="card" style="padding:11px 13px;border-radius:12px"><div class="row" style="font-size:12.5px;color:#7f8aa3">${a}</div><div style="font-size:14.5px;font-weight:600;margin-top:2px;${ELL}">${b}</div><div style="font-size:12.5px;color:#55617b;margin-top:2px">${d}</div></div>`).join("")}</div></div>`).join("")}</div>`;
}
export function etkShipStats() {
  return `<div class="card" style="padding:20px 22px;background:linear-gradient(150deg,#011441,#12419b 70%,#2a6aca);color:#fff">
    <div class="row" style="gap:10px;font-size:14px;color:#bfe0ff">${icon("timer", { size: 17, color: "#bfe0ff" })}Aynı gün kargo</div>
    <div style="font-size:48px;font-weight:600;letter-spacing:-.03em;margin-top:8px">%96</div>
    <div style="font-size:14px;opacity:.8">14:00'e kadar gelen siparişler</div>
    <div class="row" style="gap:10px;margin-top:14px">${[["Ort. hazırlık", "2,4 saat"], ["İade oranı", "%2,1"]].map(([a, b]) => `<div style="flex:1;padding:10px 12px;border-radius:12px;background:rgb(255 255 255/.12)"><div style="font-size:12px;opacity:.75">${a}</div><div style="font-size:17px;font-weight:600">${b}</div></div>`).join("")}</div>
  </div>`;
}
export function eticaretOpsDesktop() {
  return app(guruSide("E-TİCARET", ETK_NAV(4), ETK_USER, ETK_MAN), `
    ${head("Kargo ve Operasyon", "Bugün · 535 sipariş akışta · 2 anlaşmalı kargo", btn("Toplu etiket", "printer") + btn("Kargo çağır", "truck", "pri"))}
    <div data-durak="akis">${etkPipeline({ cards: 2 })}</div>
    <div style="flex:1;min-height:0;display:flex;gap:14px">
      <div class="card" style="flex:1;min-width:0;padding:20px 22px" data-durak="gunluk">
        ${cardHead("Günlük gönderi", "Son 14 gün · tüm kanallar", tag(`${icon("trending-up", { size: 12, stroke: 2.4 })}%22`, "green"))}
        <div style="margin-top:18px">${bars([148, 162, 171, 158, 180, 194, 176, 188, 201, 196, 214, 208, 222, 241], { w: 704, h: 250, hi: 13, labels: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14"], fs: 12, r: 7, gap: 0.36 })}</div>
      </div>
      <div style="width:350px;flex-shrink:0;display:flex;flex-direction:column;gap:14px">
        <div data-durak="hiz">${etkShipStats()}</div>
        <div class="card" style="padding:18px 20px;flex:1;min-height:0" data-durak="iade">
          ${cardHead("İade nedenleri", "Bu ay · 41 iade")}
          <div style="display:grid;gap:12px;margin-top:14px">${[["Beden ve ölçü", 44], ["Renk beklentisi", 27], ["Hasarlı teslimat", 12]].map(([a, p]) => `<div><div class="row" style="font-size:13.5px"><span>${a}</span><span style="margin-left:auto;font-weight:600">%${p}</span></div><div style="margin-top:6px">${meter(p * 2, "#2a6aca", 6)}</div></div>`).join("")}</div>
        </div>
      </div>
    </div>`);
}
export function eticaretMobile() {
  return phoneScreen(`
    ${mHead("Bugün", "Pamuk Sokağı · mağaza")}
    <div style="padding:18px;border-radius:20px;background:linear-gradient(150deg,#011441,#12419b 65%,#2a6aca);color:#fff">
      <div class="row" style="font-size:13px;opacity:.8">Ciro<span style="margin-left:auto">214 sipariş</span></div>
      <div class="row" style="align-items:flex-end;gap:10px;margin-top:4px"><span style="font-size:34px;font-weight:600;letter-spacing:-.03em">₺168.240</span><span style="font-size:13px;font-weight:600;padding:4px 9px;border-radius:999px;background:rgb(255 255 255/.15);margin-bottom:6px">+%22</span></div>
      <div class="row" style="gap:4px;margin-top:12px;height:8px">${ETK_CH.map(([, , , , o]) => `<span style="flex:${o};height:100%;border-radius:9px;background:${["#fff", "#bfe0ff", "#7fb6f2", "#4d8fe0"][ETK_CH.findIndex((x) => x[4] === o)]}"></span>`).join("")}</div>
      <div class="row" style="justify-content:space-between;margin-top:8px;font-size:11.5px;opacity:.8">${ETK_CH.map(([n]) => `<span>${n}</span>`).join("")}</div>
    </div>
    <div style="padding:14px 16px;border-radius:18px;background:#fff;box-shadow:0 0 0 2px #2a6aca,0 14px 30px -18px rgb(18 65 155/.6)">
      <div class="row" style="gap:10px;font-size:12.5px;color:#7f8aa3">${chTile("T", "#2a6aca", 24)}<span style="font-weight:600;color:#3b4763;letter-spacing:.04em">YENİ SİPARİŞ</span><span style="margin-left:auto">şimdi</span></div>
      <div class="row" style="margin-top:8px"><span style="font-size:16px;font-weight:600">Trendyol · #PS-48214</span><span style="margin-left:auto;font-size:16px;font-weight:600;color:#12419b">₺1.240</span></div><div style="font-size:13px;color:#55617b;margin-top:2px">Waffle pike takımı · 1 adet</div>
    </div>
    <div class="card" style="padding:16px 18px">
      <div class="row"><span class="h3" style="font-size:15.5px">Bekleyen işler</span>${tag("38", "violet", "margin-left:auto")}</div>
      <div style="display:grid;gap:13px;margin-top:13px">
        ${mRow("package", "violet", "Hazırlanacak sipariş", "24 sipariş · 14:00'e kadar", "")}
        ${mRow("printer", "blue", "Kargo etiketi bekleyen", "14 sipariş", "")}
        ${mRow("rotate-ccw", "amber", "İade onayı", "3 talep", "")}
        ${mRow("package-x", "red", "Stoğu azalan ürün", "Waffle pike · gri", "")}
      </div>
    </div>`, [["layout-dashboard", "Özet", true], ["shopping-bag", "Siparişler"], ["package", "Ürünler"], ["message-circle", "Mesajlar"]]);
}

/* ======================================================================
   8. GRAFİK TASARIM · müşteri: Ada Fırın (kurgusal)
   ====================================================================== */
export const ADA = { navy: "#12305f", cream: "#f4ecdf", crust: "#c98d4f", sky: "#7aa8de" };
export const adaMark = (d = 120, bg = ADA.navy, fg = ADA.cream) => `<svg width="${d}" height="${d}" viewBox="0 0 120 120"><circle cx="60" cy="60" r="58" fill="${bg}"/><circle cx="60" cy="60" r="49" fill="none" stroke="${fg}" stroke-width="2" opacity=".45"/>
  <path d="M60 86 V40" stroke="${fg}" stroke-width="4" stroke-linecap="round"/>${[0, 1, 2].map((i) => `<path d="M60 ${78 - i * 13} C50 ${74 - i * 13} 46 ${66 - i * 13} 47 ${58 - i * 13} C55 ${60 - i * 13} 59 ${68 - i * 13} 60 ${78 - i * 13}Z" fill="${fg}"/><path d="M60 ${78 - i * 13} C70 ${74 - i * 13} 74 ${66 - i * 13} 73 ${58 - i * 13} C65 ${60 - i * 13} 61 ${68 - i * 13} 60 ${78 - i * 13}Z" fill="${fg}"/>`).join("")}<path d="M60 40 C55 34 56 28 60 24 C64 28 65 34 60 40Z" fill="${fg}"/></svg>`;
export const adaLogo = (s = 1, c = ADA.navy, bg = ADA.navy, fg = ADA.cream) => `<div class="row" style="gap:${16 * s}px;color:${c}">${adaMark(64 * s, bg, fg)}<div><div style="font-size:${34 * s}px;font-weight:600;letter-spacing:.14em;line-height:1">ADA FIRIN</div><div style="font-size:${12.5 * s}px;font-weight:500;letter-spacing:.42em;margin-top:${8 * s}px;opacity:.75">TAŞ FIRIN · 1987</div></div></div>`;
const TAS_NAV = (on) => [["layout-dashboard", "Projeler"], ["gem", "Marka Kimliği"], ["layout-grid", "Sosyal Şablonlar"], ["package-open", "Ambalaj ve Baskı"], ["book-open", "Marka Kılavuzu"], ["message-square", "Onaylar", false, 2], ["folder-down", "Dosyalar"]].map((x, i) => (i === on ? [x[0], x[1], true, x[3]] : x));
const TAS_USER = ["GA", "Gökhan Ada", "Ada Fırın", 3];
const TAS_MAN = ["DE", "Duru Eren", "Kreatif direktör", 6];
export function adaPalette({ big = false } = {}) {
  const P = [["Gece laciverti", ADA.navy, "#12305F", "#fff"], ["Un beyazı", ADA.cream, "#F4ECDF", ADA.navy], ["Taş fırın", ADA.crust, "#C98D4F", "#fff"], ["Ada mavisi", ADA.sky, "#7AA8DE", "#fff"]];
  return `<div class="row" style="gap:10px">${P.map(([n, c, h, t]) => `<div style="flex:1;min-width:0;height:${big ? 150 : 128}px;border-radius:16px;background:${c};color:${t};padding:14px;display:flex;flex-direction:column;justify-content:flex-end;${c === ADA.cream ? "box-shadow:inset 0 0 0 1px #e7dccb" : ""}"><div style="font-size:${big ? 15 : 14}px;font-weight:600;${ELL}">${n}</div><div style="font-size:12.5px;opacity:.8;margin-top:2px">${h}</div></div>`).join("")}</div>`;
}
export function adaType() {
  return `<div class="card" style="padding:20px 22px;height:100%;display:flex;flex-direction:column;justify-content:space-between">
    ${cardHead("Tipografi", "Outfit · tek aile, 3 ağırlık")}
    <div class="row" style="gap:20px;margin-top:14px;align-items:flex-end"><span style="font-size:92px;font-weight:600;letter-spacing:-.04em;line-height:.9;color:${ADA.navy}">Aa</span>
      <div style="display:grid;gap:6px;padding-bottom:6px;color:${ADA.navy}"><span style="font-size:22px;font-weight:600">Başlık · SemiBold</span><span style="font-size:17px;font-weight:500">Ara başlık · Medium</span><span style="font-size:14px;font-weight:400;color:#55617b">Metin · Regular, 14-16 pt</span></div></div>
  </div>`;
}
export function adaVariants() {
  return `<div class="row" style="gap:10px">${[[ADA.navy, ADA.cream, ADA.navy], [ADA.cream, ADA.navy, ADA.cream], ["#fff", ADA.navy, "#fff"]].map(([bg, fg, mb], i) => `<div style="flex:1;height:120px;border-radius:16px;background:${bg};display:grid;place-items:center;${bg !== ADA.navy ? "box-shadow:inset 0 0 0 1px #e7dccb" : ""}">${i === 2 ? adaMark(72) : adaMark(72, fg, mb)}</div>`).join("")}</div>`;
}
export function grafikDesktop() {
  return app(guruSide("TASARIM", TAS_NAV(1), TAS_USER, TAS_MAN), `
    ${head("Marka Kimliği Sunumu", "Ada Fırın · sürüm 2 · 9 Ekim", tag(`${dot("#e8a33a", 6)}Onay bekliyor`, "amber", "font-size:13px;padding:6px 12px") + btn("Onayla", "check", "pri"))}
    <div style="flex:1;min-height:0;display:flex;gap:14px">
      <div style="flex:1;min-width:0;display:flex;flex-direction:column;gap:14px">
        <div class="card" style="flex:1;min-height:0;padding:0;overflow:hidden;position:relative;background:${ADA.cream}" data-durak="logo">
          <div style="position:absolute;inset:0;display:grid;place-items:center">${adaLogo(1.6)}</div>
          <div class="row" style="position:absolute;left:22px;top:18px;gap:8px">${tag("Ana logo", "gray", "background:#fff")}${tag("Yatay kullanım", "gray", "background:#fff")}</div>
          <div style="position:absolute;right:22px;bottom:18px;font-size:12.5px;color:#8a7c66">Koruma alanı: işaret yüksekliğinin ½'si</div>
        </div>
        <div class="card" style="padding:20px 22px" data-durak="renk">${cardHead("Renk paleti", "Baskıda ve dijitalde aynı karşılık")}<div style="margin-top:14px">${adaPalette()}</div></div>
      </div>
      <div style="width:370px;flex-shrink:0;display:flex;flex-direction:column;gap:14px">
        <div class="card" style="padding:20px 22px" data-durak="varyant">${cardHead("Logo varyantları", "Koyu, açık ve tek renk")}<div style="margin-top:14px">${adaVariants()}</div></div>
        <div style="flex:1;min-height:0" data-durak="tipo">${adaType()}</div>
        <div class="card" style="padding:16px 20px" data-durak="yorum">
          <div class="row" style="gap:10px">${av("GA", 32, 3)}<div style="min-width:0;flex:1"><div style="font-size:14px;font-weight:600">Gökhan Ada</div><div style="font-size:12px;color:#8a95ad">Bugün 10:24</div></div></div>
          <div style="font-size:14px;line-height:1.45;color:#3b4763;margin-top:10px">Başak motifi çok iyi oldu. Krem zemini ambalajda da görelim.</div>
        </div>
      </div>
    </div>`);
}
/* Sosyal medya şablonu (illüstrasyonlu) */
export function adaPost(i, { s = 1 } = {}) {
  const T = [
    [ADA.navy, ADA.cream, "TAZE ÇIKTI", "Ekşi mayalı köy ekmeği", "wheat", ADA.crust],
    [ADA.cream, ADA.navy, "HAFTA SONU", "Kahvaltı tabağı", "croissant", ADA.crust],
    [ADA.crust, "#fff", "YENİ", "Tarçınlı çörek", "cake-slice", ADA.cream],
    [ADA.sky, "#fff", "ÖNERİ", "Sıcak simit ve çay", "coffee", ADA.cream],
    ["#fff", ADA.navy, "1987'DEN BERİ", "Aynı taş fırın, aynı tarif", "flame", ADA.crust],
    [ADA.navy, "#fff", "SİPARİŞ", "Doğum günü pastası", "cake", ADA.sky],
  ][i];
  const [bg, fg, ey, t, ic, acc] = T;
  return `<div style="position:relative;width:100%;aspect-ratio:1;border-radius:${14 * s}px;background:${bg};color:${fg};overflow:hidden;${bg === "#fff" || bg === ADA.cream ? "box-shadow:inset 0 0 0 1px #e7dccb" : ""}">
    <div style="position:absolute;right:${-20 * s}px;bottom:${-20 * s}px;width:${104 * s}px;height:${104 * s}px;border-radius:50%;background:${acc};opacity:.9;display:grid;place-items:center">${icon(ic, { size: 46 * s, color: bg === ADA.crust ? ADA.navy : bg, stroke: 1.8, style: `margin:${-10 * s}px 0 0 ${-10 * s}px` })}</div>
    <div style="position:absolute;left:${14 * s}px;top:${14 * s}px">${adaMark(26 * s, fg, bg)}</div>
    <div style="position:absolute;left:${14 * s}px;right:${48 * s}px;top:${52 * s}px"><div style="font-size:${10.5 * s}px;font-weight:600;letter-spacing:.16em;opacity:.8">${ey}</div><div style="font-size:${17 * s}px;font-weight:600;line-height:1.15;margin-top:${5 * s}px;letter-spacing:-.01em">${t}</div></div>
  </div>`;
}
export function adaStory({ s = 1 } = {}) {
  return `<div style="position:relative;width:100%;aspect-ratio:9/16;border-radius:${16 * s}px;background:linear-gradient(170deg,${ADA.navy},#1d4a8a);color:#fff;overflow:hidden">
    <div style="position:absolute;left:${16 * s}px;right:${16 * s}px;top:${12 * s}px;display:flex;gap:${4 * s}px">${[1, 0, 0].map((on) => `<span style="flex:1;height:${3 * s}px;border-radius:9px;background:rgb(255 255 255/${on ? 1 : 0.35})"></span>`).join("")}</div>
    <div style="position:absolute;left:${16 * s}px;top:${30 * s}px">${adaMark(30 * s)}</div>
    <div style="position:absolute;left:50%;top:44%;transform:translate(-50%,-50%);width:${150 * s}px;height:${150 * s}px;border-radius:50%;background:${ADA.crust};display:grid;place-items:center">${icon("croissant", { size: 74 * s, color: ADA.navy, stroke: 1.7 })}</div>
    <div style="position:absolute;left:${18 * s}px;right:${18 * s}px;bottom:${22 * s}px;text-align:center"><div style="font-size:${11 * s}px;letter-spacing:.18em;opacity:.8;font-weight:600">BUGÜN 08:00</div><div style="font-size:${22 * s}px;font-weight:600;line-height:1.1;margin-top:${6 * s}px">İlk tepsi fırından çıktı</div><div style="margin:${12 * s}px auto 0;display:inline-block;padding:${7 * s}px ${14 * s}px;border-radius:999px;background:${ADA.cream};color:${ADA.navy};font-size:${12.5 * s}px;font-weight:600">Yol tarifi</div></div>
  </div>`;
}
export function grafikSocialDesktop() {
  return app(guruSide("TASARIM", TAS_NAV(2), TAS_USER, TAS_MAN), `
    ${head("Sosyal Medya Şablonları", "Ada Fırın · 6 gönderi, 1 hikâye · düzenlenebilir", btn("Düzenlenebilir dosyalar", "folder-down") + btn("Yeni şablon", "plus", "pri"))}
    <div style="flex:1;min-height:0;display:flex;gap:14px">
      <div class="card" style="flex:1;min-width:0;padding:20px 22px" data-durak="gonderi">
        ${cardHead("Gönderi şablonları", "1080 × 1080 · marka renkleriyle", `<span class="row" style="gap:8px">${tag("Gönderi", "blue")}${tag("Hikâye", "gray")}</span>`)}
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-top:16px">${[0, 1, 2, 3, 4, 5].map((i) => adaPost(i, { s: 1.32 })).join("")}</div>
      </div>
      <div style="width:330px;flex-shrink:0;display:flex;flex-direction:column;gap:14px">
        <div class="card" style="padding:18px 20px" data-durak="hikaye">${cardHead("Hikâye şablonu", "1080 × 1920")}<div style="width:200px;margin:14px auto 0">${adaStory({ s: 0.9 })}</div></div>
        <div class="card" style="padding:16px 20px;flex:1;min-height:0" data-durak="kural">
          ${cardHead("Kullanım kuralları", "")}
          <div style="display:grid;gap:10px;margin-top:12px">${["Başlık en fazla 2 satır", "Logo hep sol üstte", "Fotoğrafta sıcak ışık", "En fazla iki marka rengi", "Fiyat yazısı Medium ağırlıkta"].map((t) => `<div class="row" style="gap:10px;font-size:13.5px"><span style="width:20px;height:20px;border-radius:6px;background:#12419b;display:grid;place-items:center;flex-shrink:0">${icon("check", { size: 13, color: "#fff", stroke: 3 })}</span>${t}</div>`).join("")}</div>
        </div>
      </div>
    </div>`);
}
/* Ambalaj: kraft kese kâğıdı ve kutu */
export function adaBag(w = 220) {
  return `<svg width="${w}" height="${w * 1.25}" viewBox="0 0 220 275"><defs><linearGradient id="bg1" x1="0" x2="1"><stop offset="0" stop-color="#e9dcc6"/><stop offset=".5" stop-color="#f4ecdf"/><stop offset="1" stop-color="#e2d3b9"/></linearGradient></defs>
    <path d="M30 40 L190 40 L200 265 L20 265Z" fill="url(#bg1)"/><path d="M30 40 L50 20 L170 20 L190 40Z" fill="#e2d3b9"/><path d="M20 265 L200 265 L196 252 L24 252Z" fill="#d8c7aa"/>
    <path d="M30 40 L18 70 L22 265" fill="#d8c7aa" opacity=".6"/>${[0, 1, 2, 3, 4].map((i) => `<path d="M30 ${44 + i * 6} H190" stroke="#d8c7aa" stroke-width="1"/>`).join("")}
    <g transform="translate(70 110)">${adaMark(80).replace("<svg", "<svg x='0' y='0'")}</g>
    <text x="110" y="222" text-anchor="middle" font-family="Outfit" font-size="17" font-weight="600" letter-spacing="3" fill="${ADA.navy}">ADA FIRIN</text>
    <text x="110" y="240" text-anchor="middle" font-family="Outfit" font-size="8" font-weight="500" letter-spacing="3" fill="${ADA.navy}" opacity=".7">TAŞ FIRIN · 1987</text></svg>`;
}
export function adaBox(w = 260) {
  return `<svg width="${w}" height="${w * 0.8}" viewBox="0 0 260 208"><path d="M20 70 L130 40 L240 70 L130 100Z" fill="#1d4a8a"/><path d="M20 70 L130 100 L130 200 L20 170Z" fill="${ADA.navy}"/><path d="M130 100 L240 70 L240 170 L130 200Z" fill="#0d2447"/>
    <path d="M20 70 L130 100 L130 112 L20 82Z" fill="${ADA.crust}"/><path d="M130 100 L240 70 L240 82 L130 112Z" fill="#a8743f"/>
    <g transform="translate(42 118) skewY(15)"><text font-family="Outfit" font-size="15" font-weight="600" letter-spacing="2.5" fill="${ADA.cream}">ADA FIRIN</text><text y="16" font-family="Outfit" font-size="7.5" letter-spacing="2.5" fill="${ADA.cream}" opacity=".7">PASTA KUTUSU</text></g></svg>`;
}
export function adaCatalog() {
  return `<div style="display:flex;border-radius:12px;overflow:hidden;box-shadow:0 20px 40px -22px rgb(1 12 40/.5)">
    <div style="flex:1;min-width:0;background:${ADA.navy};color:${ADA.cream};padding:22px;display:flex;flex-direction:column;gap:12px">${adaMark(40)}<div style="font-size:24px;font-weight:600;line-height:1.1;margin-top:auto">Sonbahar<br>ürünleri</div><div style="font-size:12px;opacity:.7;letter-spacing:.16em">KATALOG · 2026</div></div>
    <div style="flex:1.25;min-width:0;background:#fffaf2;color:${ADA.navy};padding:18px 16px;display:grid;gap:10px;align-content:start">${[["wheat", "Ekşi mayalı köy ekmeği", "₺85"], ["croissant", "Tereyağlı kruvasan", "₺48"], ["cake-slice", "Tarçınlı çörek", "₺42"], ["cookie", "Cevizli kurabiye", "₺110"]].map(([ic, n, p]) => `<div class="row" style="gap:10px;font-size:13px">${ibox(ic, ADA.cream, ADA.crust, 30, 9)}<span style="flex:1;min-width:0;${ELL}">${n}</span><b>${p}</b></div>`).join("")}</div>
  </div>`;
}
export function grafikPackDesktop() {
  return app(guruSide("TASARIM", TAS_NAV(3), TAS_USER, TAS_MAN), `
    ${head("Ambalaj ve Baskı", "Kese kâğıdı, pasta kutusu ve katalog · baskıya hazır", btn("Baskı dosyaları", "folder-down") + btn("Matbaaya gönder", "send", "pri"))}
    <div style="flex:1;min-height:0;display:flex;gap:14px">
      <div class="card" style="flex:1;min-width:0;padding:0;overflow:hidden;position:relative;background:radial-gradient(80% 70% at 40% 40%,#ffffff,#eaf0f8)" data-durak="ambalaj">
        <div class="row" style="position:absolute;left:22px;top:18px;gap:8px">${tag("3B önizleme", "gray", "background:#fff")}</div>
        <div style="position:absolute;left:46px;top:150px;width:520px;height:520px;border-radius:50%;background:radial-gradient(closest-side,#d6e4f6,transparent)"></div>
        <div style="position:absolute;left:58px;bottom:84px;filter:drop-shadow(0 30px 26px rgb(1 12 40/.25))">${adaBag(330)}</div>
        <div style="position:absolute;left:390px;bottom:80px;filter:drop-shadow(0 30px 26px rgb(1 12 40/.3))">${adaBox(340)}</div>
        <div class="row" style="position:absolute;left:22px;right:22px;bottom:18px;gap:10px">${[["Kese kâğıdı", "Kraft · 1 renk"], ["Pasta kutusu", "Karton · 2 renk"]].map(([a, b]) => `<div style="flex:1;padding:9px 14px;border-radius:12px;background:#fff"><span style="font-size:13.5px;font-weight:600">${a}</span><span style="font-size:12.5px;color:#8a95ad;margin-left:8px">${b}</span></div>`).join("")}</div>
      </div>
      <div style="width:380px;flex-shrink:0;display:flex;flex-direction:column;gap:14px">
        <div class="card" style="padding:18px 20px" data-durak="katalog">${cardHead("Katalog · 12 sayfa", "Sayfa 1-2")}<div style="margin-top:14px">${adaCatalog()}</div></div>
        <div class="card" style="padding:18px 20px;flex:1;min-height:0" data-durak="baski">
          ${cardHead("Baskı kontrolü", "", tag("5/5", "green"))}
          <div style="display:grid;gap:11px;margin-top:12px">${["CMYK renk profili", "3 mm taşma payı", "Yazılar eğrilere çevrildi", "300 dpi görseller", "PDF/X-4 çıktısı"].map((t) => `<div class="row" style="gap:10px;font-size:13.5px"><span style="width:20px;height:20px;border-radius:6px;background:#16a34a;display:grid;place-items:center;flex-shrink:0">${icon("check", { size: 13, color: "#fff", stroke: 3 })}</span>${t}</div>`).join("")}</div>
        </div>
      </div>
    </div>`);
}
export function grafikMobile() {
  return phoneScreen(`
    <div class="row" style="gap:10px;padding:4px 0 2px">${icon("chevron-left", { size: 24, color: "#12419b" })}<span style="font-size:19px;font-weight:600">Tasarım onayı</span><span style="margin-left:auto">${tag("v2", "blue")}</span></div>
    <div style="height:250px;border-radius:20px;background:${ADA.cream};display:grid;place-items:center;box-shadow:inset 0 0 0 1px #e7dccb">${adaLogo(0.82)}</div>
    <div class="row" style="gap:8px">${[ADA.navy, ADA.cream, ADA.crust, ADA.sky].map((c) => `<span style="flex:1;height:44px;border-radius:12px;background:${c};${c === ADA.cream ? "box-shadow:inset 0 0 0 1px #e7dccb" : ""}"></span>`).join("")}</div>
    <div class="card" style="padding:14px 16px">
      <div class="row" style="gap:10px">${av("DE", 32, 6)}<div style="min-width:0;flex:1"><div style="font-size:14px;font-weight:600">Duru Eren</div><div style="font-size:12px;color:#8a95ad">Kreatif direktör · 9 Eki</div></div></div>
      <div style="font-size:14px;line-height:1.45;color:#3b4763;margin-top:10px">Başak motifi taş fırının sıcaklığını, lacivert ise adayı anlatıyor. Kese ve kutu uygulamaları ekte.</div>
      <div class="row" style="gap:8px;margin-top:12px">${["Kese.pdf", "Kutu.pdf", "Kılavuz.pdf"].map((t) => `<span class="row" style="gap:6px;padding:6px 10px;border-radius:10px;background:#f5f8fd;font-size:12.5px">${icon("file-text", { size: 13, color: "#2a6aca" })}${t}</span>`).join("")}</div>
    </div>
    <div style="margin-top:auto;display:flex;gap:10px"><span class="btn sec" style="flex:1;justify-content:center;height:52px;border-radius:15px">${icon("message-square", { size: 17 })}Revize iste</span><span class="btn pri" style="flex:1.3;justify-content:center;height:52px;border-radius:15px">${icon("check", { size: 17, stroke: 2.4 })}Onayla</span></div>
  `, null);
}

/* ======================================================================
   9. SOSYAL MEDYA YÖNETİMİ · müşteri: Mola Kahve (kurgusal)
   Platform arayüzleri kopyalanmaz; önizlemeler genel tasarımdır.
   ====================================================================== */
const MOLA = (d = 34) => `<span style="width:${d}px;height:${d}px;border-radius:50%;background:linear-gradient(140deg,#0b2a66,#2a6aca);display:grid;place-items:center;flex-shrink:0">${icon("coffee", { size: d * 0.5, color: "#fff", stroke: 2.1 })}</span>`;
const SOS_NAV = (on) => [["calendar-days", "İçerik Takvimi"], ["layout-grid", "Gönderiler"], ["message-circle", "Topluluk", false, 9], ["chart-column", "Performans"], ["megaphone", "Reklamlar"], ["file-chart-column", "Raporlar"], ["settings", "Ayarlar"]].map((x, i) => (i === on ? [x[0], x[1], true, x[3]] : x));
const SOS_USER = ["ZK", "Zeynep Kurt", "Mola Kahve", 4];
const SOS_MAN = ["EŞ", "Ece Şahin", "İçerik uzmanı", 1];
/* Gönderi görseli: illüstrasyon */
export function molaArt(i, { r = 12 } = {}) {
  const A = [
    ["linear-gradient(160deg,#0b2a66,#2a6aca)", "cup-soda", "#bfe0ff", "Soğuk demleme geri döndü"],
    ["linear-gradient(160deg,#f4ecdf,#e3d2b8)", "coffee", "#0b2a66", "Sonbahar menüsü"],
    ["linear-gradient(160deg,#2a6aca,#8fc4f7)", "croissant", "#fff", "Kahve + kruvasan ₺120"],
    ["linear-gradient(160deg,#12305f,#3c6fb4)", "users", "#fff", "Cuma akşamı canlı müzik"],
  ][i % 4];
  return `<div style="position:relative;width:100%;height:100%;background:${A[0]};border-radius:${r}px;overflow:hidden">
    <div style="position:absolute;right:-12%;bottom:-12%;width:62%;aspect-ratio:1;border-radius:50%;background:rgb(255 255 255/.14);display:grid;place-items:center">${icon(A[1], { size: 64, color: A[2], stroke: 1.6, style: "width:46%;height:46%;margin:-14% 0 0 -14%" })}</div>
    <div style="position:absolute;left:9%;top:10%;right:38%;font-size:clamp(10px,1.1em,22px);font-weight:600;line-height:1.15;color:${A[2]}">${A[3]}</div></div>`;
}
const KIND = { Reels: ["#5b3fd6", "#f0ecff", "clapperboard"], Gönderi: ["#12419b", "#eaf2ff", "image"], Hikâye: ["#0b7d7d", "#e0f6f5", "circle-dashed"] };
const CAL = { 1: ["Gönderi", "Ekim menüsü", "ok"], 3: ["Reels", "Demleme ritüeli", "ok"], 6: ["Hikâye", "Anket: süt tercihi", "ok"], 8: ["Gönderi", "Barista tanıtımı", "ok"], 10: ["Reels", "Latte art", "ok"], 13: ["Gönderi", "Kahve + kruvasan", "ok"], 15: ["Reels", "Soğuk demleme", "wait"], 16: ["Hikâye", "Canlı müzik", "wait"], 17: ["Gönderi", "Cuma akşamı", "plan"], 20: ["Reels", "Çekirdek yolculuğu", "plan"], 22: ["Gönderi", "Müşteri yorumu", "plan"], 24: ["Hikâye", "Hafta sonu", "plan"], 27: ["Reels", "Yeni şube", "plan"], 29: ["Gönderi", "Kasım duyurusu", "plan"] };
export function calendarGrid({ ch = 92, compact = false } = {}) {
  const days = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];
  const start = 3; // 1 Ekim 2026 Perşembe
  const cells = Array.from({ length: 35 }, (_, i) => i - start + 1);
  return `<div style="display:grid;grid-template-columns:repeat(7,1fr);gap:6px">${days.map((d) => `<div style="font-size:12.5px;color:#8a95ad;padding:0 6px 4px">${d}</div>`).join("")}
    ${cells.map((n) => { const ok = n >= 1 && n <= 31; const e = CAL[n]; const today = n === 14; return `<div style="height:${ch}px;border-radius:12px;padding:8px;background:${ok ? (today ? "#eaf2ff" : "#f5f8fd") : "transparent"};${today ? "box-shadow:inset 0 0 0 2px #2a6aca" : ""};display:flex;flex-direction:column;gap:6px;min-width:0">
      ${ok ? `<span style="font-size:13px;font-weight:${today ? 700 : 500};color:${today ? "#12419b" : "#55617b"}">${n}</span>` : ""}
      ${ok && e ? `<div style="margin-top:auto;padding:6px 7px;border-radius:9px;background:#fff;box-shadow:0 1px 2px rgb(12 26 58/.06);min-width:0"><div class="row" style="gap:5px;font-size:11px;font-weight:600;color:${KIND[e[0]][0]}">${icon(KIND[e[0]][2], { size: 11, stroke: 2.4 })}${compact ? "" : `<span style="${ELL}">${e[0]}</span>`}${e[2] === "ok" ? icon("check", { size: 11, stroke: 3, color: "#16a34a", style: "margin-left:auto" }) : e[2] === "wait" ? `<span style="margin-left:auto;width:7px;height:7px;border-radius:50%;background:#e8a33a;flex-shrink:0"></span>` : ""}</div><div style="font-size:11.5px;line-height:1.25;color:#3b4763;margin-top:2px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">${e[1]}</div></div>` : ""}</div>`; }).join("")}</div>`;
}
export function postApproval() {
  return `<div class="card" style="padding:18px 20px">
    ${cardHead("Onay bekleyen", "15 Ekim · 18:00", tag("Reels", "violet"))}
    <div style="height:236px;margin-top:14px;font-size:20px">${molaArt(0, { r: 14 })}</div>
    <div style="font-size:13.5px;line-height:1.45;color:#3b4763;margin-top:12px">Soğuk demleme geri döndü. 16 saat demlenir, buzla gelir. #molakahve</div>
    <div class="row" style="gap:8px;margin-top:12px"><span class="btn sec" style="flex:1;justify-content:center;height:40px;font-size:14px;box-shadow:none;background:#f3f6fb">Revize</span><span class="btn pri" style="flex:1.2;justify-content:center;height:40px;font-size:14px">${icon("check", { size: 15, stroke: 2.4 })}Onayla</span></div>
  </div>`;
}
export function sosyalDesktop() {
  return app(guruSide("SOSYAL", SOS_NAV(0), SOS_USER, SOS_MAN), `
    ${head("İçerik Takvimi", "Mola Kahve · Ekim 2026 · 14 içerik", `<span class="row" style="gap:14px;font-size:13px;color:#55617b">${Object.entries(KIND).map(([k, [c]]) => `<span class="row" style="gap:6px">${dot(c, 8)}${k}</span>`).join("")}</span>` + btn("İçerik ekle", "plus", "pri"))}
    <div style="flex:1;min-height:0;display:flex;gap:14px">
      <div class="card" style="flex:1;min-width:0;padding:16px 18px" data-durak="takvim">
        <div class="row" style="gap:10px;margin-bottom:12px"><span class="h3">Ekim 2026</span>${tag("6 yayınlandı", "green")}${tag("2 onay bekliyor", "amber")}${tag("6 planlandı", "gray")}<span style="margin-left:auto" class="row">${icon("chevron-left", { size: 18, color: "#a0aac0" })}${icon("chevron-right", { size: 18, color: "#3b4763", style: "margin-left:10px" })}</span></div>
        ${calendarGrid({ ch: 128 })}
      </div>
      <div style="width:320px;flex-shrink:0;display:flex;flex-direction:column;gap:14px">
        <div data-durak="onay">${postApproval()}</div>
        <div class="card" style="padding:16px 20px;flex:1;min-height:0" data-durak="sirada">
          ${cardHead("Bu hafta", "")}
          <div style="display:grid;gap:12px;margin-top:12px">${[["Reels", "Soğuk demleme", "Çar 18:00"], ["Hikâye", "Canlı müzik", "Per 20:00"], ["Gönderi", "Cuma akşamı", "Cum 12:30"]].map(([k, t, d]) => `<div class="row" style="gap:10px;min-width:0">${ibox(KIND[k][2], KIND[k][1], KIND[k][0], 32, 10)}<div style="flex:1;min-width:0"><div style="font-size:14px;font-weight:500;${ELL}">${t}</div><div style="font-size:12px;color:#8a95ad">${k}</div></div><span style="flex-shrink:0;font-size:12.5px;color:#55617b">${d}</span></div>`).join("")}</div>
        </div>
      </div>
    </div>`);
}
export const SOS_REACH = [88, 96, 104, 118, 112, 131, 142, 138, 156, 171, 184, 202, 214, 248];
export function sosyalReportDesktop() {
  return app(guruSide("SOSYAL", SOS_NAV(3), SOS_USER, SOS_MAN), `
    ${head("Performans Raporu", "Mola Kahve · Eylül 2026 · Instagram, TikTok, Facebook", sel("Eylül", "calendar") + btn("Raporu indir", "file-down", "pri"))}
    <div class="row" style="gap:14px" data-durak="kpi">
      ${kpi("Erişim", "248K", "+%34", "eye", { note: "geçen aya göre" })}
      ${kpi("Etkileşim oranı", "%5,4", "+0,8 puan", "heart", { note: "sektör ort. %2,1" })}
      ${kpi("Yeni takipçi", "+1.920", "+%41", "user-plus", { note: "geçen aya göre" })}
      ${kpi("Profil ziyareti", "12.640", "+%27", "mouse-pointer-click", { note: "geçen aya göre" })}
    </div>
    <div style="flex:1;min-height:0;display:flex;gap:14px">
      <div class="card" style="flex:1;min-width:0;padding:20px 24px;display:flex;flex-direction:column" data-durak="erisim">
        ${cardHead("Haftalık erişim", "Son 14 hafta · bin kişi", tag(`${icon("trending-up", { size: 12, stroke: 2.4 })}%182`, "green"))}
        <div style="position:relative;margin-top:auto;padding-top:24px">${line([SOS_REACH], { w: 684, h: 210, min: 60, max: 270, dots: [true], dash: [false], width: [3] })}
          <div style="position:absolute;right:-8px;top:-10px;padding:6px 11px;border-radius:10px;background:#011441;color:#fff;font-size:13.5px;font-weight:600;white-space:nowrap">Bu hafta · 248K</div></div>
      </div>
      <div class="card" style="width:390px;flex-shrink:0;padding:20px 22px" data-durak="icerik">
        ${cardHead("İçerik türüne göre", "Ortalama etkileşim")}
        <div style="display:grid;gap:16px;margin-top:18px">${[["Reels", "%7,9", 100, "#5b3fd6"], ["Karusel gönderi", "%5,1", 64, "#12419b"], ["Tek görsel", "%3,2", 40, "#2a6aca"], ["Hikâye", "%2,6", 33, "#0b7d7d"]].map(([a, b, p, c]) => `<div><div class="row" style="font-size:14px"><span>${a}</span><span style="margin-left:auto;font-weight:600">${b}</span></div><div style="margin-top:7px">${meter(p, c, 9, "#eef3fa")}</div></div>`).join("")}</div>
      </div>
    </div>
    <div class="card" style="padding:18px 20px" data-durak="enler">
      ${cardHead("En iyi gönderiler", "Eylül")}
      <div class="row" style="gap:14px;margin-top:14px">${[[0, "38,2K", "%9,4"], [2, "26,7K", "%7,1"], [3, "21,9K", "%6,3"], [1, "18,4K", "%5,8"]].map(([i, r, e]) => `<div class="row" style="flex:1;min-width:0;gap:12px;padding:10px;border-radius:14px;background:#f5f8fd"><div style="width:62px;height:62px;flex-shrink:0;font-size:9px">${molaArt(i, { r: 10 })}</div><div style="min-width:0"><div style="font-size:12.5px;color:#7f8aa3">Erişim</div><div style="font-size:18px;font-weight:600">${r}</div><div style="font-size:12.5px;color:#12873f;font-weight:600">${e} etkileşim</div></div></div>`).join("")}</div>
    </div>`);
}
export const SOS_MSG = [["SA", "Seda A.", "Soğuk demleme glutensiz menüde de var mı?", "Yorum", "Soru", "2 dk"], ["KB", "Kaan B.", "Cuma canlı müzik kaçta başlıyor?", "Mesaj", "Soru", "8 dk"], ["NY", "Nil Y.", "Dün akşam latte art harikaydı, teşekkürler!", "Yorum", "Olumlu", "15 dk"], ["TD", "Tolga D.", "Siparişim geç geldi, soğumuştu.", "Mesaj", "Şikâyet", "22 dk"], ["İE", "İrem E.", "Yeni şube ne zaman açılıyor?", "Yorum", "Soru", "40 dk"], ["MO", "Mert O.", "Kahve çekirdeği satıyor musunuz?", "Mesaj", "Soru", "1 sa"]];
const sent = (s) => (s === "Olumlu" ? tag(s, "green") : s === "Şikâyet" ? tag(s, "red") : tag(s, "blue"));
export function msgRow([i, n, t, k, s, time], idx, { active = false } = {}) {
  return `<div class="row" style="gap:12px;padding:12px 14px;border-radius:14px;min-width:0;${active ? "background:#eaf2ff" : ""}">${av(i, 38, idx)}
    <div style="flex:1;min-width:0"><div class="row" style="gap:8px;min-width:0"><span style="font-size:14.5px;font-weight:600;${ELL}">${n}</span><span style="font-size:12px;color:#8a95ad;flex-shrink:0">${k}</span><span style="margin-left:auto;font-size:12px;color:#8a95ad;flex-shrink:0">${time}</span></div>
    <div class="row" style="gap:10px;margin-top:3px;min-width:0"><span style="flex:1;font-size:13.5px;color:#3b4763;${ELL}">${t}</span><span style="flex-shrink:0">${sent(s)}</span></div></div></div>`;
}
export function replyPanel() {
  return `<div class="card" style="padding:20px 22px;height:100%;display:flex;flex-direction:column">
    <div class="row" style="gap:12px">${av("TD", 40, 3)}<div><div style="font-size:16px;font-weight:600">Tolga D.</div><div style="font-size:12.5px;color:#8a95ad">Mesaj · 22 dk önce</div></div>${tag("Şikâyet", "red", "margin-left:auto")}</div>
    <div style="margin-top:16px;max-width:82%;padding:12px 16px;border-radius:18px 18px 18px 6px;background:#f1f4f9;font-size:14.5px;line-height:1.45">Siparişim geç geldi, soğumuştu.</div>
    <div style="margin-top:16px;padding:14px 16px;border-radius:14px;background:#f5f8fd">
      <div style="font-size:12.5px;font-weight:600;letter-spacing:.06em;color:#7f8aa3">MÜŞTERİ BİLGİSİ</div>
      <div class="row" style="gap:10px;margin-top:10px">${[["Takip süresi", "2 yıl"], ["Önceki yorum", "11"], ["Son ziyaret", "Kadıköy şube"]].map(([a, b]) => `<div style="flex:1;padding:9px 12px;border-radius:12px;background:#fff"><div style="font-size:12px;color:#7f8aa3">${a}</div><div style="font-size:15px;font-weight:600">${b}</div></div>`).join("")}</div>
    </div>
    <div class="row" style="gap:10px;margin-top:12px;padding:12px 14px;border-radius:14px;background:#fff8eb;color:#7a3f02;font-size:13.5px">${icon("info", { size: 16, color: "#b45f06" })}Şikâyetler 30 dakika içinde yanıtlanır ve şube müdürüne iletilir.</div>
    <div style="margin-top:auto;padding:14px 16px;border-radius:16px;background:#eaf2ff">
      <div class="row" style="gap:8px;font-size:12.5px;font-weight:600;color:#2a6aca">${icon("sparkles", { size: 14, stroke: 2.2 })}Önerilen yanıt · marka dilinde</div>
      <div style="font-size:14.5px;line-height:1.5;color:#1d2a48;margin-top:8px">Merhaba Tolga, bunun için çok üzgünüz. Sipariş numaranızı yazarsanız bir sonraki kahveniz bizden olsun.</div>
      <div class="row" style="gap:8px;margin-top:12px"><span class="btn sec" style="height:38px;font-size:13.5px;box-shadow:none">Düzenle</span><span class="btn pri" style="height:38px;font-size:13.5px;margin-left:auto">${icon("send", { size: 14, stroke: 2.2 })}Gönder</span></div>
    </div>
  </div>`;
}
export function sosyalCommunityDesktop() {
  return app(guruSide("SOSYAL", SOS_NAV(2), SOS_USER, SOS_MAN), `
    ${head("Topluluk", "Yorum ve mesajlar tek kutuda · 9 yanıt bekliyor", `<div class="row" style="gap:12px">${[["Ort. yanıt", "14 dk"], ["Yanıtlanan", "%98"]].map(([a, b]) => `<span style="font-size:13.5px;color:#7f8aa3">${a} <b style="color:#0c1a3a;font-size:15px">${b}</b></span>`).join("")}</div>` + btn("Hazır yanıtlar", "message-square-text", "pri"))}
    <div style="flex:1;min-height:0;display:flex;gap:14px">
      <div class="card" style="width:480px;flex-shrink:0;padding:16px 12px" data-durak="kutu">
        <div class="row" style="gap:8px;padding:0 8px 12px">${[["Tümü", 9, 1], ["Soru", 5], ["Şikâyet", 1], ["Olumlu", 3]].map(([t, n, on]) => `<span style="height:34px;padding:0 13px;border-radius:999px;display:inline-flex;align-items:center;gap:7px;font-size:14px;font-weight:500;${on ? "background:#12419b;color:#fff" : "background:#f1f4f9;color:#4a5672"}">${t}<span style="opacity:.7">${n}</span></span>`).join("")}</div>
        <div style="display:grid;gap:2px">${SOS_MSG.map((m, i) => msgRow(m, i, { active: i === 3 })).join("")}</div>
      </div>
      <div style="flex:1;min-width:0" data-durak="yanit">${replyPanel()}</div>
    </div>`);
}
export function sosyalMobile() {
  return phoneScreen(`
    <div class="row" style="gap:10px;padding:4px 0 2px">${icon("chevron-left", { size: 24, color: "#12419b" })}<span style="font-size:19px;font-weight:600">Gönderi önizleme</span><span style="margin-left:auto">${tag("Onay bekliyor", "amber")}</span></div>
    <div class="card" style="padding:0;overflow:hidden">
      <div class="row" style="gap:10px;padding:12px 14px">${MOLA(34)}<div><div style="font-size:14.5px;font-weight:600">molakahve</div><div style="font-size:12px;color:#8a95ad">Kadıköy</div></div>${icon("ellipsis", { size: 18, color: "#8a95ad", style: "margin-left:auto" })}</div>
      <div style="height:340px;font-size:30px">${molaArt(0, { r: 0 })}</div>
      <div class="row" style="gap:16px;padding:12px 14px 4px">${["heart", "message-circle", "send"].map((ic) => icon(ic, { size: 22, color: "#1d2a48" })).join("")}${icon("bookmark", { size: 22, color: "#1d2a48", style: "margin-left:auto" })}</div>
      <div style="padding:4px 14px 14px;font-size:13.5px;line-height:1.45;color:#3b4763"><b style="color:#0c1a3a">molakahve</b> Soğuk demleme geri döndü. 16 saat demlenir, buzla gelir. #molakahve</div>
    </div>
    <div class="row" style="gap:10px;font-size:13px;color:#55617b;padding:0 4px">${icon("calendar", { size: 16, color: "#2a6aca" })}15 Ekim Çarşamba, 18:00 · Reels</div>
    <div style="margin-top:auto;display:flex;gap:10px"><span class="btn sec" style="flex:1;justify-content:center;height:52px;border-radius:15px">Revize iste</span><span class="btn pri" style="flex:1.3;justify-content:center;height:52px;border-radius:15px">${icon("check", { size: 17, stroke: 2.4 })}Onayla</span></div>
  `, null);
}
export const etkBars = ({ w = 640, h = 230 } = {}) => bars([148, 162, 171, 158, 180, 194, 176, 188, 201, 196, 214, 208, 222, 241], { w, h, hi: 13, labels: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14"], fs: 12, r: 7, gap: 0.36 });
