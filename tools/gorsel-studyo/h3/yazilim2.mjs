// Özel Yazılım v5 (örnek kareler): kurgusal ürün adı yerine markasız örnek bir yönetim paneli (sipariş, stok,
// teklif, tahsilat; müşteriler sektör tanımıyla). Hizmet galerilerinin dili: lacivert ışık zemini, eğik dizüstü
// + telefon, beyaz başlık kartı. Ekranlar "Temsili arayüz".
import { av, bars, donut, floatCard, grainLayer, icon, iphone, line, macbook, page, themeBg } from "../lib.mjs";
import { T } from "./common.mjs";
import { floor, glow, lockup } from "./real.mjs";

const TY = T["ozel-yazilim"];
const ACC = "#4b5be0";

/* ---------- Örnek panel (markasız) ---------- */
const NAV = [["layout-dashboard", "Özet", true], ["shopping-cart", "Siparişler", false, 12], ["file-text", "Teklifler", false, 9], ["users", "Müşteriler"], ["boxes", "Stok"], ["chart-no-axes-column", "Raporlar"], ["workflow", "Otomasyonlar"], ["plug", "Entegrasyonlar"], ["settings", "Ayarlar"]];
const side = () => `<aside class="side">
  <div class="brand"><span style="width:32px;height:32px;border-radius:10px;background:linear-gradient(150deg,#6d7cf6,${ACC});display:grid;place-items:center">${icon("layout-grid", { size: 17, color: "#fff", stroke: 2.2 })}</span><span style="font-size:16px;font-weight:600;letter-spacing:-.01em">Yönetim paneli</span></div>
  <nav class="nav">${NAV.map(([ic, l, on, ct]) => `<div class="ni${on ? " on" : ""}">${icon(ic, { size: 19, stroke: on ? 2.2 : 1.9 })}<span>${l}</span>${ct ? `<span class="ct">${ct}</span>` : ""}</div>`).join("")}</nav>
  <div class="foot">${av("SE", 36, 1)}<div style="min-width:0"><div style="font-size:14px;font-weight:600">Satış ekibi</div><div style="font-size:12.5px;color:#7f8aa3">Yönetici</div></div>${icon("chevrons-up-down", { size: 16, color: "#a0aac0", style: "margin-left:auto" })}</div></aside>`;
const KPI = [["shopping-cart", "Bugünkü siparişler", "38", "+%12 dünden", true], ["file-text", "Bekleyen teklifler", "9", "₺412.500 toplam", null], ["boxes", "Kritik stok", "6 ürün", "Sipariş önerisi hazır", false], ["wallet", "Bu hafta tahsilat", "₺186.400", "+%8 geçen hafta", true]];
const AUTO = [["receipt", "Faturalar muhasebeye aktarıldı", "24 fatura", "#16a34a"], ["truck", "Kargo etiketi oluşturuldu", "31 sipariş", "#2a6aca"], ["refresh-cw", "Stok e-ticaret sitesiyle eşitlendi", "15 dk önce", "#7c5cff"], ["bell-ring", "Teklif hatırlatması gönderildi", "7 müşteri", "#e8833a"]];
const ORDERS = [["SP-2041", "Kafe, Kadıköy", "₺8.420", "Hazırlanıyor", "amber"], ["SP-2040", "Otel, Bodrum", "₺24.900", "Kargoda", "blue"], ["SP-2039", "Market, Çankaya", "₺12.150", "Teslim edildi", "green"], ["SP-2038", "Restoran, Karşıyaka", "₺6.780", "Kargoda", "blue"], ["SP-2037", "Pastane, Nilüfer", "₺3.940", "Teslim edildi", "green"]];
const TONE = { amber: ["#fff4e5", "#b45309"], blue: ["#eaf2ff", "#1d4ed8"], green: ["#e7f7ee", "#15803d"] };
const pill = (t, k) => `<span class="tag" style="background:${TONE[k][0]};color:${TONE[k][1]}">${t}</span>`;

export function panelScreen() {
  const kpis = `<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px">${KPI.map(([ic, l, v, d, up]) => `<div class="card" style="padding:18px 20px"><div class="row" style="gap:10px"><span style="width:36px;height:36px;border-radius:11px;background:#eef0ff;display:grid;place-items:center">${icon(ic, { size: 18, color: ACC, stroke: 2 })}</span><span class="lbl" style="font-size:14px">${l}</span></div><div style="font-size:30px;font-weight:600;letter-spacing:-.02em;margin-top:12px">${v}</div><div style="font-size:13px;margin-top:2px" class="${up === true ? "up" : up === false ? "down" : ""}">${up === null ? `<span style="color:#7f8aa3">${d}</span>` : d}</div></div>`).join("")}</div>`;
  const chart = `<div class="card" style="padding:20px 22px;flex:1.45"><div class="row" style="justify-content:space-between"><div><div class="h3">Haftalık siparişler</div><div class="lbl" style="margin-top:2px">Bu hafta ve geçen hafta</div></div><div class="row" style="gap:16px;font-size:13px;color:#55617b"><span class="row" style="gap:6px"><span style="width:10px;height:10px;border-radius:3px;background:${ACC}"></span>Bu hafta</span><span class="row" style="gap:6px"><span style="width:10px;height:10px;border-radius:3px;background:#c5cbe0"></span>Geçen hafta</span></div></div>
    <div style="margin-top:22px">${line([[22, 31, 28, 36, 34, 41, 38], [20, 24, 27, 25, 30, 33, 31]], { w: 640, h: 180, colors: [ACC, "#c5cbe0"], max: 46 })}</div>
    <div class="row" style="justify-content:space-between;margin-top:10px;font-size:12.5px;color:#8a95ad">${["Cum", "Cmt", "Paz", "Pzt", "Sal", "Çar", "Per"].map((d) => `<span>${d}</span>`).join("")}</div></div>`;
  const auto = `<div class="card" style="padding:20px 22px;flex:1"><div class="row" style="justify-content:space-between"><div class="h3">Bugün otomatik yapılanlar</div>${icon("workflow", { size: 18, color: "#8a95ad" })}</div>
    <div style="margin-top:8px">${AUTO.map(([ic, t, v, c]) => `<div class="row" style="gap:12px;padding:12px 0;border-top:1px solid #eef1f6"><span style="width:34px;height:34px;border-radius:10px;background:${c}18;display:grid;place-items:center">${icon(ic, { size: 17, color: c, stroke: 2 })}</span><span style="font-size:14.5px;flex:1">${t}</span><span style="font-size:13.5px;color:#7f8aa3">${v}</span></div>`).join("")}</div></div>`;
  const table = `<div class="card" style="padding:18px 22px 8px"><div class="row" style="justify-content:space-between"><div class="h3">Son siparişler</div><span style="font-size:14px;color:${ACC};font-weight:500">Tümü</span></div>
    <div style="display:grid;grid-template-columns:120px 1fr 140px 160px 140px;margin-top:10px;font-size:14.5px">${["Sipariş", "Müşteri", "Tutar", "Durum", "Tarih"].map((h) => `<div class="lbl" style="padding:8px 0">${h}</div>`).join("")}
    ${ORDERS.map(([n, c, t, s, k], i) => [`<b style="font-weight:600">${n}</b>`, c, t, pill(s, k), `${16 - Math.floor(i / 2)} Ekim`].map((x) => `<div style="padding:11px 0;border-top:1px solid #eef1f6;display:flex;align-items:center">${x}</div>`).join("")).join("")}</div></div>`;
  return `<div class="app">${side()}<main class="main">
    <div class="top"><div><h1>Özet</h1><div class="sub">Perşembe, 16 Ekim</div></div><div class="search" style="margin-left:auto">${icon("search", { size: 16 })}Sipariş, müşteri ya da ürün ara</div><span class="btn sec">${icon("download", { size: 16 })}Rapor al</span><span class="btn pri" style="background:${ACC}">${icon("plus", { size: 16, color: "#fff", stroke: 2.4 })}Yeni sipariş</span></div>
    ${kpis}<div style="display:flex;gap:16px">${chart}${auto}</div>${table}</main></div>`;
}

export function panelMobile() {
  return `<div style="width:390px;height:844px;background:#f3f6fb;font-family:Outfit;color:#0c1a3a;position:relative;overflow:hidden">
    <div class="row" style="height:54px;padding:0 30px;justify-content:space-between;font:600 16px Outfit"><span>9:41</span><span class="row" style="gap:6px">${icon("signal", { size: 15, stroke: 2.4 })}${icon("wifi", { size: 15, stroke: 2.4 })}${icon("battery-full", { size: 21, stroke: 2 })}</span></div>
    <div class="row" style="padding:8px 20px 0;gap:12px"><div><div style="font-size:14px;color:#7f8aa3">Perşembe, 16 Ekim</div><div style="font-size:28px;font-weight:600;letter-spacing:-.02em">Siparişler</div></div><span style="margin-left:auto;width:44px;height:44px;border-radius:14px;background:${ACC};display:grid;place-items:center">${icon("plus", { size: 22, color: "#fff", stroke: 2.4 })}</span></div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;padding:16px 18px 0">${[["Bugün", "38", "+%12"], ["Hazırlanıyor", "11", "4 acil"]].map(([l, v, d], i) => `<div style="padding:14px 16px;border-radius:18px;background:${i ? "#fff" : ACC};color:${i ? "#0c1a3a" : "#fff"};box-shadow:0 10px 24px -16px rgb(12 26 58/.3)"><div style="font-size:13px;opacity:.75">${l}</div><div style="font-size:28px;font-weight:600;margin-top:4px">${v}</div><div style="font-size:12.5px;opacity:.8">${d}</div></div>`).join("")}</div>
    <div class="row" style="gap:8px;padding:16px 18px 0">${["Tümü", "Hazırlanıyor", "Kargoda", "Teslim"].map((t, i) => `<span style="height:34px;padding:0 14px;border-radius:999px;display:grid;place-items:center;font-size:13.5px;font-weight:500;${i ? "background:#fff;color:#55617b" : "background:#0c1a3a;color:#fff"}">${t}</span>`).join("")}</div>
    <div style="display:grid;gap:10px;padding:14px 18px 0">${ORDERS.slice(0, 5).map(([n, c, t, s, k]) => `<div style="padding:14px 16px;border-radius:18px;background:#fff;box-shadow:0 8px 20px -16px rgb(12 26 58/.3)"><div class="row" style="justify-content:space-between"><b style="font-size:15px;font-weight:600">${n}</b>${pill(s, k)}</div><div class="row" style="justify-content:space-between;margin-top:6px;font-size:14px;color:#55617b"><span>${c}</span><span style="font-weight:600;color:#0c1a3a">${t}</span></div></div>`).join("")}</div>
    <div class="row" style="position:absolute;left:0;right:0;bottom:0;height:84px;padding:10px 20px 26px;background:rgb(255 255 255/.95);box-shadow:0 -1px 0 #e6eaf2;justify-content:space-around">${[["layout-dashboard", "Özet"], ["shopping-cart", "Siparişler"], ["boxes", "Stok"], ["user-round", "Hesap"]].map(([ic, t], i) => `<div style="display:grid;justify-items:center;gap:3px;font-size:11px;font-weight:500;color:${i === 1 ? ACC : "#8a95ad"}">${icon(ic, { size: 23, color: i === 1 ? ACC : "#8a95ad", stroke: 2 })}${t}</div>`).join("")}</div></div>`;
}

/* Başlık kartı: hizmet galerilerinin ortak kartı */
const featCard = (ic, kind, title, desc) => `<div class="row" style="gap:14px"><span style="width:50px;height:50px;border-radius:15px;background:#eceeff;display:grid;place-items:center;flex-shrink:0">${icon(ic, { size: 25, color: ACC, stroke: 2 })}</span>
   <div><div style="font-size:13px;font-weight:600;letter-spacing:.08em;color:${ACC}">${kind.toLocaleUpperCase("tr-TR")}</div><div style="font-size:22px;font-weight:600;margin-top:2px;line-height:1.2">${title}</div></div></div>
   ${desc ? `<div style="margin-top:12px;font-size:16px;color:#3b4763;line-height:1.4">${desc}</div>` : ""}
   <div class="row" style="gap:7px;margin-top:12px;font-size:13px;color:#7a849b">${icon("info", { size: 14, color: "#7a849b", stroke: 2 })}Temsili arayüz</div>`;

/* ---------- Hero 1600x1000: eğik dizüstü (panel) + telefon (siparişler) + başlık kartı ---------- */
export function yazilim2Hero() {
  const body = `
  ${glow(120, 300, 1250, 700)}
  <div style="position:absolute;left:68px;top:60px">${lockup("Özel Yazılım")}</div>
  ${floor(110, 900, 1100, 100)}
  <div style="position:absolute;left:70px;top:250px;perspective:3200px">
    ${macbook(panelScreen(), { width: 1100, style: "transform:rotateY(13deg) rotateX(4deg) rotateZ(-.6deg);transform-origin:0% 50%" })}
  </div>
  ${floor(1100, 935, 330, 60, 0.6)}
  <div style="position:absolute;left:1130px;top:330px;perspective:2400px">
    ${iphone(panelMobile(), { width: 300, style: "transform:rotateY(-10deg) rotateZ(1.5deg);filter:drop-shadow(0 50px 50px rgb(0 6 26/.55))" })}
  </div>
  ${floatCard(featCard("code", "Özel yazılım", "İşinize göre yönetim paneli", "Sipariş, stok, teklif ve raporlar tek yerde; masaüstünde ve telefonda"), "left:1010px;top:70px;width:480px")}
  ${grainLayer(0.06)}`;
  return page({ w: 1600, h: 1000, bg: themeBg(TY), body });
}

/* ---------- Kapak 1200x1500 ---------- */
function cover() {
  const body = `
  <div style="position:absolute;left:150px;top:560px;width:900px;height:1000px;border-radius:50%;background:radial-gradient(closest-side,${TY.hi}88,transparent);filter:blur(20px)"></div>
  <div style="position:absolute;left:0;right:0;top:96px;display:grid;justify-items:center;text-align:center;color:#fff">
    ${lockup("Özel Yazılım", 30)}
    <h1 style="margin-top:40px;font-size:96px;line-height:1.02;font-weight:600;letter-spacing:-.045em">İşinize göre<br><span style="color:${TY.glow}">yazılım</span></h1>
    <p style="margin-top:22px;font-size:28px;color:rgb(255 255 255/.8)">Web uygulaması, panel, entegrasyon ve otomasyon</p>
  </div>
  ${floor(60, 1230, 1080, 120)}
  <div style="position:absolute;left:50px;top:640px">${macbook(panelScreen(), { width: 1010 })}</div>
  <div style="position:absolute;left:850px;top:780px;transform:rotate(3deg);filter:drop-shadow(0 50px 60px rgb(0 6 26/.6))">${iphone(panelMobile(), { width: 300 })}</div>
  ${grainLayer(0.06)}`;
  return page({ w: 1200, h: 1500, bg: themeBg(TY), body });
}

/* ---------- 1) Entegrasyonlar: ortada panel, çevresinde bağlanan sistem türleri ---------- */
const SYSTEMS = [["receipt", "Muhasebe", "Fatura ve tahsilat aktarımı", 250, 470], ["file-spreadsheet", "Excel ve CSV", "Mevcut tabloların içe aktarımı", 250, 730], ["truck", "Kargo", "Etiket ve gönderi takibi", 600, 805], ["credit-card", "Ödeme", "Sanal POS ve tahsilat", 950, 730], ["shopping-cart", "E-ticaret sitesi", "Ürün, stok ve sipariş eşitleme", 950, 470], ["database", "ERP", "Cari, stok ve sevkiyat verisi", 870, 230]];
function integTile() {
  const C = [600, 520];
  const body = `${glow(90, 220, 1020, 640)}
  <svg style="position:absolute;inset:0" width="1200" height="900">${SYSTEMS.map(([, , , x, y]) => `<line x1="${C[0]}" y1="${C[1]}" x2="${x}" y2="${y}" stroke="rgb(174 183 255/.6)" stroke-width="2" stroke-dasharray="6 8"/>`).join("")}</svg>
  <div style="position:absolute;left:${C[0] - 150}px;top:${C[1] - 95}px;width:300px;height:190px;border-radius:30px;background:linear-gradient(160deg,#6d7cf6,#2a35a0);display:grid;place-items:center;text-align:center;color:#fff;box-shadow:0 0 0 1px rgb(255 255 255/.25),0 60px 100px -40px rgb(0 6 26/.85);font-family:Outfit"><div>${icon("layout-dashboard", { size: 44, color: "#fff", stroke: 1.8 })}<div style="font:600 28px Outfit;margin-top:10px">Paneliniz</div><div style="font:400 16px Outfit;opacity:.85;margin-top:4px">Tüm veri tek yerde</div></div></div>
  ${SYSTEMS.map(([ic, t, d, x, y]) => floatCard(`<div class="row" style="gap:14px"><span style="width:46px;height:46px;border-radius:14px;background:#eceeff;display:grid;place-items:center;flex-shrink:0">${icon(ic, { size: 22, color: ACC, stroke: 2 })}</span><div style="min-width:0"><div style="font-size:18px;font-weight:600">${t}</div><div style="font-size:14px;color:#6b7590;margin-top:2px;line-height:1.3">${d}</div></div></div>`, `left:${x - 150}px;top:${y - 50}px;width:300px`, "16px 18px")).join("")}
  ${floatCard(featCard("plug", "Entegrasyonlar", "Programlarınız birbirine bağlanır", "API ya da veri aktarımıyla; uygunluk teklif öncesi kontrol edilir"), "left:56px;top:56px;width:480px", "18px 22px")}
  ${grainLayer(0.06)}`;
  return page({ w: 1200, h: 900, bg: themeBg(TY), body });
}

/* ---------- Ortak karo parçaları ---------- */
const tileHead = (ic, k, t) => floatCard(featCard(ic, k, t, ""), "left:56px;top:56px;width:480px", "18px 22px");
const tileOf = (head, body) => page({ w: 1200, h: 900, bg: themeBg(TY), body: `${glow(90, 220, 1020, 640)}${body}${head}${grainLayer(0.06)}` });
const card = (html, style, pad = "24px 26px") => floatCard(html, style, pad);
const glassCard = (html, style, pad = "18px 20px") => `<div style="position:absolute;${style};padding:${pad};border-radius:22px;background:linear-gradient(150deg,rgb(255 255 255/.2),rgb(255 255 255/.07));backdrop-filter:blur(18px);box-shadow:inset 0 0 0 1px rgb(255 255 255/.28),0 30px 60px -30px rgb(0 6 26/.7);color:#fff;font-family:Outfit">${html}</div>`;
const chip = (ic, c = ACC, s = 44) => `<span style="width:${s}px;height:${s}px;border-radius:${s * 0.3}px;background:${c === ACC ? "#eceeff" : c + "1c"};display:grid;place-items:center;flex-shrink:0">${icon(ic, { size: s * 0.48, color: c, stroke: 2 })}</span>`;
const cardTitle = (ic, t, right = "") => `<div class="row" style="gap:12px">${chip(ic)}<div style="font-size:20px;font-weight:600">${t}</div>${right ? `<span style="margin-left:auto">${right}</span>` : ""}</div>`;
const glassNote = (ic, t, d) => `<div class="row" style="gap:14px;align-items:flex-start"><span style="width:42px;height:42px;border-radius:12px;background:rgb(255 255 255/.16);display:grid;place-items:center;flex-shrink:0">${icon(ic, { size: 20, color: "#fff", stroke: 2 })}</span><div><div style="font-size:16px;font-weight:600">${t}</div><div style="font-size:14.5px;line-height:1.4;color:rgb(255 255 255/.8);margin-top:2px">${d}</div></div></div>`;
const btn = (t, pri, ic = "") => `<span class="row" style="gap:8px;height:44px;padding:0 18px;border-radius:12px;font:600 15px Outfit;${pri ? `background:${ACC};color:#fff` : "background:#f1f3f9;color:#1f2b46"}">${ic ? icon(ic, { size: 17, color: pri ? "#fff" : "#1f2b46", stroke: 2.2 }) : ""}${t}</span>`;

/* ---------- 2) Teklif ve CRM: satış hunisi + teklif belgesi ---------- */
const FUNNEL = [["Yeni talep", 14, "", 1], ["Görüşülüyor", 9, "", 0.64], ["Teklif verildi", 9, "₺412.500", 0.64], ["Kazanıldı", 6, "₺238.000", 0.43]];
const ITEMS = [["Oda tableti", "24", "₺6.200", "₺148.800"], ["Duvar tutucu", "24", "₺450", "₺10.800"], ["Kurulum", "1", "₺8.000", "₺8.000"], ["Personel eğitimi", "1", "₺4.000", "₺4.000"]];
function crmTile() {
  const funnel = card(`${cardTitle("filter", "Satış hunisi", `<span style="font-size:13.5px;color:#7a849b">Ekim</span>`)}
    <div style="margin-top:14px;display:grid;gap:14px">${FUNNEL.map(([t, n, v, k], i) => `<div><div class="row" style="justify-content:space-between;font-size:15.5px"><span>${t}</span><span><b style="font-weight:600">${n}</b>${v ? `<span style="color:#7a849b"> · ${v}</span>` : ""}</span></div><div style="margin-top:7px;height:10px;border-radius:5px;background:#eef0f7"><div style="height:10px;width:${k * 100}%;border-radius:5px;background:${i === 3 ? "#16a34a" : ACC}"></div></div></div>`).join("")}</div>`, "left:56px;top:250px;width:410px;transform:scale(1.16);transform-origin:0 0");
  const quote = card(`<div class="row" style="justify-content:space-between"><div><div style="font-size:13px;font-weight:600;letter-spacing:.08em;color:#7a849b">TEKLİF</div><div style="font-size:26px;font-weight:600;margin-top:2px">TK-2026-118</div></div><span class="tag" style="background:#eaf2ff;color:#1d4ed8;font-size:13px;padding:5px 12px">Gönderildi</span></div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px 20px;margin-top:16px;font-size:14.5px"><span style="color:#7a849b">Müşteri</span><span style="color:#7a849b">Geçerlilik</span><b style="font-weight:600">Otel, Bodrum</b><b style="font-weight:600">30 gün</b><span style="color:#7a849b;margin-top:8px">Teslim</span><span style="color:#7a849b;margin-top:8px">Ödeme</span><b style="font-weight:600">10 iş günü</b><b style="font-weight:600">%50 peşin, %50 teslimde</b></div>
    <div style="margin-top:18px;display:grid;grid-template-columns:1fr 54px 92px 104px;font-size:14.5px">${["Kalem", "Adet", "Birim", "Tutar"].map((h, i) => `<div style="padding:8px 0;color:#7a849b;font-size:13px;${i ? "text-align:right" : ""}">${h}</div>`).join("")}
      ${ITEMS.map((r) => r.map((c, i) => `<div style="padding:11px 0;border-top:1px solid #eef1f6;${i ? "text-align:right" : ""}">${c}</div>`).join("")).join("")}</div>
    <div style="margin-top:6px;padding-top:12px;border-top:1px solid #eef1f6;display:grid;gap:6px;font-size:14.5px">${[["Ara toplam", "₺171.600"], ["KDV %20", "₺34.320"]].map(([a, b]) => `<div class="row" style="justify-content:space-between;color:#55617b"><span>${a}</span><span>${b}</span></div>`).join("")}<div class="row" style="justify-content:space-between;font-size:19px;font-weight:600;margin-top:4px"><span>Toplam</span><span>₺205.920</span></div></div>
    <div class="row" style="gap:10px;margin-top:18px">${btn("PDF", false, "file-down")}${btn("E-postayla gönder", true, "send")}</div>`, "left:574px;top:56px;width:440px;transform:scale(1.3);transform-origin:0 0", "24px 26px");
  return tileOf(tileHead("file-text", "Teklif ve CRM", "Teklif ve müşteri takibi"), `${funnel}${quote}
    ${glassCard(glassNote("bell-ring", "Hatırlatma gönderildi", "Teklif 3 gündür yanıtlanmadı; müşteriye hatırlatma e-postası gitti"), "left:56px;top:680px;width:410px;transform:scale(1.16);transform-origin:0 0")}`);
}

/* ---------- 3) İş akışı otomasyonu: tetikleyici ve adımlar ---------- */
const FLOW = [["zap", "Sipariş onaylandı", "Tetikleyici"], ["receipt", "Fatura oluşturulur", "Muhasebe programına aktarılır"], ["truck", "Kargo etiketi hazırlanır", "Gönderi kaydı açılır"], ["boxes", "Stok düşülür", "E-ticaret sitesiyle eşitlenir"], ["mail", "Müşteriye takip bağlantısı", "E-postayla gönderilir"]];
function flowTile() {
  const x = 620, w = 524, h = 112, gap = 38, y0 = 64;
  const steps = FLOW.map(([ic, t, d], i) => {
    const top = y0 + i * (h + gap);
    const first = i === 0;
    return `${i ? `<div style="position:absolute;left:${x + 44}px;top:${top - gap}px;width:2px;height:${gap}px;background:repeating-linear-gradient(180deg,#c3caff 0 6px,transparent 6px 12px)"></div>` : ""}
    <div style="position:absolute;left:${x}px;top:${top}px;width:${w}px;height:${h}px;border-radius:22px;padding:0 22px;display:flex;align-items:center;gap:16px;font-family:Outfit;${first ? `background:linear-gradient(160deg,#6d7cf6,#2a35a0);color:#fff;box-shadow:0 0 0 1px rgb(255 255 255/.25),0 40px 70px -30px rgb(0 6 26/.8)` : "background:#fff;color:#0c1a3a;box-shadow:0 0 0 1px rgb(255 255 255/.6),0 40px 70px -28px rgb(1 12 40/.55)"}">
      <span style="width:48px;height:48px;border-radius:14px;display:grid;place-items:center;flex-shrink:0;background:${first ? "rgb(255 255 255/.18)" : "#eceeff"}">${icon(ic, { size: 23, color: first ? "#fff" : ACC, stroke: 2 })}</span>
      <div style="min-width:0"><div style="font-size:${first ? 13 : 19}px;${first ? "font-weight:600;letter-spacing:.08em;opacity:.8" : "font-weight:600"}">${first ? "TETİKLEYİCİ" : t}</div><div style="font-size:${first ? 20 : 14.5}px;${first ? "font-weight:600;margin-top:2px" : "color:#6b7590;margin-top:2px"}">${first ? t : d}</div></div>
      ${first ? "" : `<span style="margin-left:auto;width:28px;height:28px;border-radius:50%;background:#e7f7ee;display:grid;place-items:center;flex-shrink:0">${icon("check", { size: 16, color: "#15803d", stroke: 3 })}</span>`}</div>`;
  }).join("");
  const rule = card(`${cardTitle("git-fork", "Koşul")}
    <div style="margin-top:14px;font-size:16px;line-height:1.45;color:#3b4763">Tutar <b style="font-weight:600;color:#0c1a3a">₺50.000</b> üzerindeyse sipariş önce yönetici onayına gider</div>
    <div class="row" style="gap:10px;margin-top:16px">${av("YÖ", 34, 5)}<span style="font-size:14.5px;color:#55617b">Onay bekliyor</span><span class="tag" style="margin-left:auto;background:#fff4e5;color:#b45309;font-size:12.5px;padding:4px 11px">1 sipariş</span></div>`, "left:56px;top:250px;width:480px");
  const sched = card(`${cardTitle("calendar-clock", "Zamanlanmış görev")}<div style="margin-top:12px;font-size:16px;line-height:1.45;color:#3b4763">Her pazartesi 09:00'da haftalık satış raporu yöneticilere e-postayla gider</div>`, "left:56px;top:490px;width:480px");
  return tileOf(tileHead("workflow", "Otomasyon", "Tekrarlayan işler kendiliğinden yürür"), `${steps}${rule}${sched}
    ${glassCard(glassNote("bell-ring", "Bir adım takılırsa haber verir", "Aktarım hata verirse ekip bildirim alır, iş yarıda kalmaz"), "left:56px;top:690px;width:480px")}`);
}

/* ---------- 4) Yapay zekâ: gelen belge okunur, alanlar doldurulur ---------- */
const FIELDS = [["Tedarikçi", "Ambalaj tedarikçisi, İzmir"], ["Belge türü", "e-Fatura"], ["Belge no", "EF-2026-000418"], ["Tarih", "14.10.2026"], ["Matrah", "₺15.375,00"], ["KDV %20", "₺3.075,00"], ["Toplam", "₺18.450,00"], ["Gider türü", "Ambalaj"]];
function aiTile() {
  const hl = (x, y, w, h) => `<div style="position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px;border-radius:8px;box-shadow:0 0 0 2px ${ACC};background:${ACC}14"></div>`;
  const bar = (w, c = "#dfe3ec", h = 10) => `<div style="height:${h}px;width:${w}px;border-radius:${h / 2}px;background:${c}"></div>`;
  const doc = `<div style="position:absolute;left:66px;top:250px;width:410px;height:560px;border-radius:14px;background:#fff;transform:rotate(-3deg);box-shadow:0 60px 100px -40px rgb(1 12 40/.8);font-family:Outfit;padding:30px 30px">
    <div class="row" style="justify-content:space-between"><div style="display:grid;gap:8px">${bar(150, "#c9cfdd", 14)}${bar(110)}${bar(130)}</div><div style="font:700 20px Outfit;letter-spacing:.12em;color:#1f2b46">FATURA</div></div>
    <div style="display:grid;gap:8px;margin-top:34px">${bar(90)}${bar(170)}</div>
    <div style="margin-top:30px;display:grid;gap:14px">${[300, 260, 280, 240].map((w) => `<div class="row" style="justify-content:space-between">${bar(w * 0.62)}${bar(60)}</div>`).join("")}</div>
    <div style="margin-top:34px;display:grid;gap:12px;justify-items:end">${bar(140)}${bar(120)}${bar(170, "#1f2b46", 14)}</div>
    ${hl(22, 22, 166, 56)}${hl(22, 118, 186, 46)}${hl(196, 400, 192, 104)}</div>`;
  const out = card(`${cardTitle("sparkles", "Okunan alanlar", `<span class="tag" style="background:#fff4e5;color:#b45309;font-size:13px;padding:5px 12px">Onay bekliyor</span>`)}
    <div style="margin-top:10px">${FIELDS.map(([k, v], i) => `<div class="row" style="padding:11px 0;border-top:1px solid #eef1f6;font-size:15.5px;gap:12px"><span style="width:120px;color:#7a849b;flex-shrink:0">${k}</span><b style="font-weight:${i === 6 ? 700 : 600}">${v}</b></div>`).join("")}</div>
    <div class="row" style="gap:10px;margin-top:16px">${btn("Düzelt", false, "pencil")}${btn("Onayla ve aktar", true, "check")}</div>`, "left:610px;top:150px;width:534px", "24px 26px");
  return tileOf(tileHead("sparkles", "Yapay zekâ", "Gelen belgeler okunur, alanlar dolar"), `${doc}${out}
    <div style="position:absolute;left:505px;top:470px;width:76px;height:76px;border-radius:50%;background:#fff;display:grid;place-items:center;box-shadow:0 20px 40px -16px rgb(0 6 26/.6)">${icon("arrow-right", { size: 32, color: ACC, stroke: 2.4 })}</div>
    ${glassCard(`<div class="row" style="gap:10px;font-size:15px">${icon("shield-check", { size: 19, color: "#fff", stroke: 2 })}Son onay her zaman sizde</div>`, "left:610px;top:700px;width:534px", "14px 20px")}`);
}

/* ---------- 5) Raporlar: aylık ciro, kanal dağılımı ---------- */
function reportTile() {
  const months = ["Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki"];
  const chans = [["Bayi", 46, ACC], ["E-ticaret", 31, "#8b96f3"], ["Saha satış", 23, "#c9cef8"]];
  const kpi = (l, v, d) => `<div style="padding:16px 18px;border-radius:16px;background:#f5f6fb"><div style="font-size:13.5px;color:#7a849b">${l}</div><div style="font-size:27px;font-weight:600;margin-top:6px;letter-spacing:-.02em">${v}</div><div style="font-size:13px;color:#16a34a;margin-top:2px">${d}</div></div>`;
  const body = card(`<div class="row" style="justify-content:space-between">${cardTitle("chart-no-axes-column", "Satış raporu")}<div class="row" style="gap:8px">${["Excel", "PDF"].map((t) => `<span class="row" style="gap:6px;height:36px;padding:0 14px;border-radius:10px;background:#f1f3f9;font:500 14px Outfit;color:#1f2b46">${icon("download", { size: 15, color: "#1f2b46", stroke: 2.2 })}${t}</span>`).join("")}</div></div>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-top:20px">${kpi("Ekim cirosu", "₺1,84 mn", "+%9 eylülden")}${kpi("Ortalama sipariş", "₺4.850", "+%4 eylülden")}${kpi("Zamanında teslim", "%96", "+2 puan")}</div>
    <div style="display:flex;gap:28px;margin-top:22px;align-items:flex-end">
      <div style="flex:1"><div style="font-size:15px;font-weight:600;margin-bottom:12px">Aylık ciro</div>${bars([1.21, 1.34, 1.29, 1.48, 1.52, 1.69, 1.84], { w: 560, h: 230, hi: 6, hiColor: ACC, fade: "#dfe2fb", labels: months, fs: 13 })}</div>
      <div style="width:330px"><div style="font-size:15px;font-weight:600;margin-bottom:12px">Satış kanalları</div><div class="row" style="gap:20px">${donut(chans.map(([, v, c]) => ({ v, c })), { d: 150, thick: 24 })}<div style="display:grid;gap:10px;font-size:14.5px">${chans.map(([t, v, c]) => `<div class="row" style="gap:8px"><span style="width:10px;height:10px;border-radius:3px;background:${c}"></span>${t}<b style="font-weight:600;margin-left:4px">%${v}</b></div>`).join("")}</div></div></div></div>`, "left:56px;top:250px;width:1088px", "26px 28px");
  return tileOf(tileHead("chart-no-axes-column", "Raporlar", "Veriler anlık panolarda"), body);
}

/* ---------- 6) Aşamalı teslim ve bakım ---------- */
const STAGES = [["search", "Keşif ve kapsam", "İş akışı incelenir, önce yapılacak parça seçilir"], ["rocket", "İlk sürüm", "Kısa sürede kullanıma açılır"], ["refresh-cw", "Geri bildirimle geliştirme", "Yeni parçalar aşama aşama eklenir"], ["shield-check", "Bakım", "Hata düzeltme, güvenlik güncellemesi ve yedekleme"]];
function careTile() {
  const tl = card(`${cardTitle("git-branch", "Aşama aşama teslim")}
    <div style="margin-top:8px">${STAGES.map(([ic, t, d], i) => `<div class="row" style="gap:16px;align-items:flex-start;position:relative;padding-top:30px">
      ${i < STAGES.length - 1 ? `<span style="position:absolute;left:23px;top:80px;width:2px;height:62px;background:#dfe3fb"></span>` : ""}
      <span style="width:48px;height:48px;border-radius:15px;background:${i === 1 ? `linear-gradient(150deg,#6d7cf6,${ACC})` : "#eceeff"};display:grid;place-items:center;flex-shrink:0">${icon(ic, { size: 23, color: i === 1 ? "#fff" : ACC, stroke: 2 })}</span>
      <div style="min-width:0;padding-top:2px"><div style="font-size:19px;font-weight:600">${t}</div><div style="font-size:15px;color:#6b7590;margin-top:2px;line-height:1.35">${d}</div></div></div>`).join("")}</div>`, "left:56px;top:250px;width:460px;transform:scale(1.22);transform-origin:0 0", "24px 28px 26px");
  const own = card(`${cardTitle("key-round", "Kaynak kodu ve veriler sizin")}
    <div style="margin-top:14px;display:grid;gap:0">${["Kaynak kodu size teslim edilir", "Veriler size aittir", "Sözleşmede açıkça yazılır", "Destek kapsamı ve yanıt süreleri belirlenir"].map((t) => `<div class="row" style="gap:12px;padding:17px 0;border-top:1px solid #eef1f6;font-size:16.5px">${icon("circle-check", { size: 20, color: "#16a34a", stroke: 2.2 })}${t}</div>`).join("")}</div>`, "left:640px;top:250px;width:458px;transform:scale(1.1);transform-origin:0 0", "24px 26px 16px");
  return tileOf(tileHead("calendar-check", "Teslim ve bakım", "Yayından sonra da yanınızdayız"), `${tl}${own}
    ${glassCard(glassNote("rocket", "Yeni sürüm yayında", "Teklif ekranına toplu indirim eklendi"), "left:640px;top:700px;width:458px;transform:scale(1.1);transform-origin:0 0")}`);
}

export const yazilim2Scenes = () => [
  { name: "real-ozel-yazilim-hero", w: 1600, h: 1000, html: yazilim2Hero() },
  { name: "real-ozel-yazilim-kapak", w: 1200, h: 1500, html: cover() },
  ...[integTile(), crmTile(), flowTile(), aiTile(), reportTile(), careTile()].map((html, k) => ({ name: `real-ozel-yazilim-${k + 1}`, w: 1200, h: 900, html })),
];
