import { av, bars, donut, dot, icon, sidebar, tag } from "./lib.mjs";
import { kpi, tabBar } from "./screens-common.mjs";
import { statusBar } from "./screens-chatbot.mjs";

/* Mevcut ürün ekranıyla aynı örnek veri */
export const MODULES = [
  { n: "Guru Chatbot", ic: "message-circle", c: "#2a6aca", sub: "3 kanal bağlı · 412 sohbet", m: [["412", "sohbet bugün"], ["4 sn", "ort. yanıt"], ["%94", "memnuniyet"]] },
  { n: "Guru CRM", ic: "handshake", c: "#7c5cff", sub: "14 kullanıcı · 3.812 müşteri", m: [["86", "açık fırsat"], ["₺1,2M", "satış hattı"], ["%31", "kapanış oranı"]] },
  { n: "Guru Operation", ic: "list-checks", c: "#0ea5a5", sub: "5 süreç · 24 kullanıcı", m: [["37", "açık görev"], ["%73", "ekip kapasitesi"], ["12", "tamamlanan iş"]] },
];
export const REVENUE = [
  ["E-ticaret", 42, "₺287.490", "#12419b"],
  ["Kurumsal Hizmet", 28, "₺191.660", "#44a1f1"],
  ["Abonelik", 18, "₺123.210", "#7c5cff"],
  ["Danışmanlık", 12, "₺82.140", "#bcdcff"],
];
export const ACTIVITY = [
  ["14:32", "Chatbot", "\"Kargom nerede?\" sorusu otomatik yanıtlandı", "Ahmet Yıldız · Web sitesi"],
  ["14:05", "CRM", "Teklif gönderildi: Demir Lojistik, ₺48.000", "Mehmet Demir"],
  ["13:41", "Operation", "OP-131 Stok uyarı eşikleri kontrole alındı", "Burak Taş"],
  ["12:58", "CRM", "Yeni fırsat: Kaya Mobilya, ilk görüşme 9 Eylül", "Selin Yılmaz"],
  ["11:20", "Chatbot", "WhatsApp'tan 3 randevu talebi ekibe aktarıldı", "Servis ekibi"],
];
const MTONE = { Chatbot: "blue", CRM: "violet", Operation: "teal" };

export function moduleCard(m, { big = false } = {}) {
  const f = big ? 1.28 : 1;
  return `<div class="card" style="flex:1;min-width:0;padding:${17 * f}px ${18 * f}px">
    <div class="row" style="gap:${11 * f}px"><span style="width:${38 * f}px;height:${38 * f}px;border-radius:${12 * f}px;background:${m.c};display:grid;place-items:center;box-shadow:0 8px 16px -10px ${m.c}">${icon(m.ic, { size: 19 * f, color: "#fff", stroke: 2.1 })}</span>
      <div style="min-width:0"><div style="font-size:${15.5 * f}px;font-weight:600">${m.n}</div><div style="font-size:${12 * f}px;color:#8a95ad;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${m.sub}</div></div>
      ${tag(`${dot("#16a34a", 6 * f)}Çalışıyor`, "green", `margin-left:auto;font-size:${11.5 * f}px`)}</div>
    <div class="row" style="gap:${8 * f}px;margin-top:${14 * f}px">${m.m.map(([v, l]) => `<div style="flex:1;padding:${10 * f}px ${11 * f}px;border-radius:${12 * f}px;background:#f5f8fd"><div style="font-size:${19 * f}px;font-weight:600;letter-spacing:-.02em">${v}</div><div style="font-size:${12 * f}px;color:#7f8aa3">${l}</div></div>`).join("")}</div>
  </div>`;
}

export function revenueBlock({ d = 150, big = false, stack = false } = {}) {
  const f = big ? 1.25 : 1;
  return `<div class="${stack ? "" : "row"}" style="gap:${24 * f}px;${stack ? "display:grid;justify-items:center" : ""}"><div style="position:relative;width:${d}px;height:${d}px;flex-shrink:0">${donut(REVENUE.map(([, v, , c]) => ({ v, c })), { d, thick: d * 0.15 })}<div style="position:absolute;inset:0;display:grid;place-items:center;text-align:center;line-height:1.15"><div><div style="font-size:${d * 0.15}px;font-weight:600;letter-spacing:-.03em">₺684,5K</div><div class="lbl" style="font-size:${12 * f}px">toplam gelir</div></div></div></div>
    <div style="flex:1;display:grid;gap:${10 * f}px;${stack ? "width:100%" : ""}">${REVENUE.map(([n, p, v, c]) => `<div class="row" style="gap:9px;font-size:${13.5 * f}px">${dot(c, 10 * f)}<span>${n}</span><span style="margin-left:auto;color:#7f8aa3">%${p}</span><span style="width:${78 * f}px;text-align:right;font-weight:600">${v}</span></div>`).join("")}</div></div>`;
}

export function activityRows({ big = false, n = 5 } = {}) {
  const f = big ? 1.25 : 1;
  return ACTIVITY.slice(0, n).map(
    ([t, mod, txt, who]) => `<div class="row" style="gap:${12 * f}px;align-items:flex-start"><span style="font-size:${12.5 * f}px;color:#8a95ad;width:${40 * f}px;padding-top:${2 * f}px">${t}</span>
      <div style="flex:1;min-width:0"><div class="row" style="gap:8px">${tag(mod, MTONE[mod], `font-size:${11 * f}px`)}</div><div style="font-size:${14 * f}px;font-weight:500;margin-top:${5 * f}px;line-height:1.35">${txt}</div><div style="font-size:${12.5 * f}px;color:#8a95ad;margin-top:2px">${who}</div></div></div>`
  ).join("");
}

export function businessDesktop() {
  const side = sidebar({
    product: "Business",
    items: [["layout-dashboard", "Genel Bakış", true], ["message-circle", "Chatbot"], ["handshake", "CRM"], ["list-checks", "Operation"], ["chart-column", "Raporlar"], ["receipt", "Faturalar"], ["settings", "Ayarlar"]],
    user: ["CA", "Cem Arslan", "Genel Müdür", 5],
  }).replace('<div class="foot">', `<div style="margin-top:auto;padding:16px 14px;border-radius:16px;background:linear-gradient(150deg,#eaf2ff,#f5f9ff);margin-bottom:12px">
      <div style="font-size:12.5px;color:#55617b">Paketiniz</div><div style="font-size:15px;font-weight:600;color:#12419b;margin-top:2px">Guru Business</div>
      <div class="row" style="gap:6px;margin-top:10px">${MODULES.map((m) => `<span style="width:26px;height:26px;border-radius:8px;background:${m.c};display:grid;place-items:center">${icon(m.ic, { size: 14, color: "#fff", stroke: 2.2 })}</span>`).join("")}<span style="font-size:12.5px;color:#55617b;margin-left:4px">3 modül aktif</span></div>
    </div><div class="foot" style="margin-top:0">`);
  return `<div class="app">${side}<main class="main">
    <div class="top"><div><h1>Genel Bakış</h1><div class="sub">4 Eylül 2026, Cuma</div></div>
      <span style="margin-left:14px">${tag(`${dot("#16a34a", 7)}Tüm modüller çalışıyor`, "green", "font-size:13px;padding:7px 12px")}</span>
      <span class="btn sec" style="margin-left:auto">${icon("calendar", { size: 16 })}Son 30 gün${icon("chevron-down", { size: 15, color: "#8a95ad" })}</span>
      <span class="btn pri">${icon("download", { size: 16, stroke: 2.2 })}Rapor İndir</span></div>
    <div class="row" style="gap:14px">
      ${kpi("Aktif müşteri", "1.248", "%8,4", "users", { note: "geçen aya göre" })}
      ${kpi("Aylık gelir", "₺684.500", "%12,1", "wallet", { note: "geçen aya göre" })}
      ${kpi("Açık görev", "37", "6 azaldı", "list-checks", { tone: "gooddown", note: "geçen haftaya göre" })}
      ${kpi("Bot çözüm oranı", "%87", "%3,2", "sparkles", { note: "geçen aya göre" })}
    </div>
    <div class="row" style="gap:14px">${MODULES.map((m) => moduleCard(m)).join("")}</div>
    <div style="flex:1;min-height:0;display:flex;gap:14px">
      <div class="card" style="flex:1.1;padding:18px 20px"><div class="row"><div><div class="h3">Gelir Kaynağı Dağılımı</div><div class="lbl" style="margin-top:2px">Ağustos 2026 · 4 kaynak</div></div>${tag("%12,1 artış", "green", "margin-left:auto")}</div>
        <div style="margin-top:16px">${revenueBlock({ d: 150 })}</div>
        <div style="margin-top:16px;padding:11px 14px;border-radius:12px;background:#f5f8fd"><div class="row" style="font-size:13px"><span style="color:#55617b">Hedef ₺700.000</span><span style="margin-left:auto;font-weight:600;color:#12419b">%98</span></div><div style="height:6px;border-radius:9px;background:#e1e9f5;margin-top:8px"><div style="width:98%;height:100%;border-radius:9px;background:linear-gradient(90deg,#12419b,#44a1f1)"></div></div></div>
        <div class="row" style="margin-top:16px;font-size:13px;color:#55617b">Son 6 ay</div>
        <div style="margin-top:8px">${bars([540, 575, 590, 612, 610, 684], { w: 500, h: 124, hi: 5, labels: ["Mar", "Nis", "May", "Haz", "Tem", "Ağu"], gap: 0.36, r: 7, fade: "#c9dcfa" })}</div>
      </div>
      <div class="card" style="flex:1;padding:18px 20px"><div class="row"><span class="h3">Son Aktiviteler</span><span style="margin-left:auto;font-size:13px;font-weight:500;color:#2a6aca">Tümünü gör</span></div>
        <div style="display:grid;gap:15px;margin-top:14px">${activityRows({ n: 5 })}</div></div>
    </div>
  </main></div>`;
}

/* Mobil: yöneticinin günlük özeti */
export function businessMobile() {
  const tile = (l, v, d, ic, down = false) => `<div class="card" style="padding:14px"><div class="row" style="gap:8px"><span style="width:30px;height:30px;border-radius:9px;background:#eaf2ff;display:grid;place-items:center">${icon(ic, { size: 15, color: "#2a6aca", stroke: 2.2 })}</span><span style="font-size:12.5px;color:#7f8aa3">${l}</span></div><div style="font-size:22px;font-weight:600;letter-spacing:-.02em;margin-top:9px">${v}</div><div class="row up" style="gap:4px;font-size:12px;font-weight:600;margin-top:2px">${icon(down ? "trending-down" : "trending-up", { size: 13, stroke: 2.4 })}${d}</div></div>`;
  return `<div style="width:390px;height:844px;background:#f3f6fb;font-family:Outfit;color:#0c1a3a;display:flex;flex-direction:column">
    ${statusBar()}
    <div class="row" style="padding:6px 20px 0"><div><div class="lbl" style="font-size:14px">4 Eylül, Cuma</div><div style="font-size:26px;font-weight:600;letter-spacing:-.02em">Günaydın, Cem Bey</div></div><span style="margin-left:auto">${av("CA", 40, 5)}</span></div>
    <div style="padding:14px 18px 0;display:flex;flex-direction:column;gap:11px;flex:1">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">${tile("Aylık gelir", "₺684,5K", "%12,1", "wallet")}${tile("Aktif müşteri", "1.248", "%8,4", "users")}${tile("Bot çözüm", "%87", "%3,2", "sparkles")}${tile("Açık görev", "37", "6 azaldı", "list-checks", true)}</div>
      <div class="card" style="padding:14px 16px"><div class="h3" style="font-size:15px">Modüller</div>
        <div style="display:grid;gap:11px;margin-top:12px">${MODULES.map((m) => `<div class="row" style="gap:11px"><span style="width:32px;height:32px;border-radius:10px;background:${m.c};display:grid;place-items:center">${icon(m.ic, { size: 16, color: "#fff", stroke: 2.1 })}</span><div><div style="font-size:14.5px;font-weight:600">${m.n}</div><div style="font-size:12px;color:#8a95ad">${m.m[0][0]} ${m.m[0][1]}</div></div>${tag(`${dot("#16a34a", 6)}Çalışıyor`, "green", "margin-left:auto;font-size:11px")}</div>`).join("")}</div></div>
      <div class="card" style="padding:14px 16px"><div class="h3" style="font-size:15px">Son aktivite</div><div style="display:grid;gap:11px;margin-top:11px">${activityRows({ n: 2 })}</div></div>
    </div>
    <div style="height:10px"></div>
    ${tabBar([["layout-dashboard", "Özet", true], ["blocks", "Modüller"], ["chart-column", "Raporlar"], ["settings", "Ayarlar"]])}
  </div>`;
}
