import { av, dot, icon, ring, sidebar, tag } from "./lib.mjs";
import { tabBar } from "./screens-common.mjs";
import { statusBar } from "./screens-chatbot.mjs";

const PRIO = { Yüksek: "red", Orta: "amber", Düşük: "gray", Bitti: "green" };
const PI = { AK: 6, MD: 0, SY: 2, BT: 3, EK: 4 };

/* Mevcut ürün ekranıyla aynı örnek veri */
export const COLS = [
  { t: "Yapılacak", n: 5, c: "#8a95ad", more: 3, tasks: [["Yüksek", "8 Eyl", "Eylül üretim planı onayı", "OP-148", "AK", "1/3"], ["Orta", "11 Eyl", "Tedarikçi sözleşmesi", "OP-151", "MD", "0/2"]] },
  { t: "Devam", n: 4, c: "#44a1f1", more: 2, tasks: [["Yüksek", "5 Eyl", "Fatura entegrasyonu", "OP-139", "MD", "3/5"], ["Orta", "9 Eyl", "Müşteri onboarding akışı", "OP-142", "EK", "2/4"]] },
  { t: "Kontrol", n: 3, c: "#e8a33a", more: 1, tasks: [["Yüksek", "4 Eyl", "Stok uyarı eşikleri", "OP-131", "BT", "4/4"], ["Orta", "5 Eyl", "Servis randevu şablonu", "OP-135", "EK", "3/3"]] },
  { t: "Tamam", n: 6, c: "#16a34a", more: 4, tasks: [["Bitti", "1 Eyl", "Ağustos kapanış raporu", "OP-120", "AK", "5/5"], ["Bitti", "29 Ağu", "Bayi fiyat listesi", "OP-124", "MD", "2/2"]] },
];

export function taskCard([prio, date, title, id, who, chk], { big = false } = {}) {
  const f = big ? 1.3 : 1;
  const done = prio === "Bitti";
  return `<div class="card" style="padding:${13 * f}px ${14 * f}px;border-radius:${14 * f}px">
    <div class="row">${tag(prio, PRIO[prio], `font-size:${11.5 * f}px`)}<span class="row" style="margin-left:auto;gap:5px;font-size:${12.5 * f}px;color:${date === "4 Eyl" ? "#c9363b" : "#8a95ad"};font-weight:${date === "4 Eyl" ? 600 : 400}">${icon("calendar", { size: 12 * f, stroke: 2.2 })}${date === "4 Eyl" ? "Bugün" : date}</span></div>
    <div style="font-size:${15 * f}px;font-weight:600;margin-top:${9 * f}px;line-height:1.3;${done ? "color:#55617b" : ""}">${title}</div>
    <div class="row" style="gap:10px;margin-top:${11 * f}px;font-size:${12.5 * f}px;color:#8a95ad"><span>${id}</span><span class="row" style="gap:4px">${icon("list-checks", { size: 13 * f, stroke: 2.1 })}${chk}</span><span style="margin-left:auto">${av(who, 26 * f, PI[who])}</span></div>
  </div>`;
}

export const CAP = [["AK", "Ayşe Kaya", 92], ["MD", "Mehmet Demir", 78], ["SY", "Selin Yılmaz", 64], ["BT", "Burak Taş", 85], ["EK", "Elif Koç", 48]];
const capColor = (p) => (p >= 90 ? "#e5484d" : p >= 80 ? "#e8a33a" : "#2a6aca");
export function capacityRows({ big = false } = {}) {
  const f = big ? 1.3 : 1;
  return CAP.map(
    ([i, n, p]) => `<div class="row" style="gap:${12 * f}px">${av(i, 32 * f, PI[i])}<div style="flex:1;min-width:0"><div class="row" style="font-size:${14 * f}px"><span style="font-weight:500">${n}</span><span style="margin-left:auto;font-weight:600;color:${p >= 90 ? "#c9363b" : "#0c1a3a"}">%${p}</span></div>
      <div style="height:${7 * f}px;border-radius:9px;background:#edf2f9;margin-top:${7 * f}px"><div style="width:${p}%;height:100%;border-radius:9px;background:${capColor(p)}"></div></div></div></div>`
  ).join("");
}

export const DAYS = [["Pzt", 31], ["Sal", 1], ["Çar", 2], ["Per", 3], ["Cum", 4], ["Cmt", 5], ["Paz", 6]];
export const GANTT = [
  ["Üretim planı", 0, 3, "#2a6aca"],
  ["Fatura testi", 1, 4, "#e8a33a"],
  ["Onboarding", 2, 2, "#7c5cff"],
  ["Stok eşikleri", 3, 2, "#e5484d"],
  ["Sipariş takip", 0, 2, "#0ea5a5"],
  ["SLA raporu", 4, 2, "#44a1f1"],
  ["Haftalık plan", 0, 1, "#12419b"],
];
export function gantt({ w = 760, rowH = 34, labelW = 120, fs = 13, today = 4 } = {}) {
  const cw = (w - labelW) / 7;
  return `<div style="position:relative;width:${w}px">
    <div class="row" style="padding-left:${labelW}px">${DAYS.map(([d, n], i) => `<div style="width:${cw}px;text-align:center;font-size:${fs}px;color:${i === today ? "#12419b" : "#8a95ad"};font-weight:${i === today ? 600 : 400}">${d} ${n}</div>`).join("")}</div>
    <div style="position:absolute;left:${labelW + cw * today + 4}px;top:${fs + 10}px;width:${cw - 8}px;bottom:0;border-radius:12px;background:#eaf2ff"></div>
    <div style="position:relative;display:grid;gap:${rowH * 0.28}px;margin-top:${rowH * 0.4}px">${GANTT.map(
      ([t, s, len, c]) => `<div class="row" style="height:${rowH}px"><span style="width:${labelW}px;font-size:${fs}px;color:#3b4763">${t}</span><span style="position:relative;flex:1;height:100%"><span style="position:absolute;left:${s * cw + 4}px;width:${len * cw - 8}px;top:${rowH * 0.12}px;bottom:${rowH * 0.12}px;border-radius:${rowH}px;background:${c};box-shadow:0 6px 14px -8px ${c}"></span></span></div>`
    ).join("")}</div>
  </div>`;
}

export function operationDesktop({ dragging = false } = {}) {
  const side = sidebar({
    product: "Operation",
    items: [["layout-dashboard", "Pano", true], ["list-checks", "Görevler", false, 12], ["users", "Ekip"], ["calendar-range", "Zaman Çizelgesi"], ["workflow", "Süreçler"], ["chart-column", "Raporlar"], ["settings", "Ayarlar"]],
    user: ["EK", "Elif Koç", "Yönetici", 4],
  }).replace('<div class="foot">', `<div style="margin-top:auto;padding:16px 14px;border-radius:16px;background:linear-gradient(150deg,#eaf2ff,#f5f9ff);margin-bottom:12px" class="row">
      <div style="position:relative;width:52px;height:52px">${ring(96, { d: 52, thick: 6 })}<div style="position:absolute;inset:0;display:grid;place-items:center;font-size:12.5px;font-weight:600">%96</div></div>
      <div style="margin-left:12px"><div style="font-size:13.5px;font-weight:600;color:#12419b">Süreç sağlığı</div><div style="font-size:12.5px;color:#55617b;margin-top:2px">Görevler zamanında</div></div>
    </div><div class="foot" style="margin-top:0">`);
  const cols = COLS.map(
    (c) => `<div style="flex:1;min-width:0;padding:11px;border-radius:18px;background:#eaf0f8">
      <div class="row" style="gap:8px;padding:2px 4px 10px">${dot(c.c, 9)}<span style="font-size:15px;font-weight:600">${c.t}</span><span style="font-size:13px;color:#7f8aa3">${c.n}</span>${icon("plus", { size: 16, color: "#8a95ad", style: "margin-left:auto" })}</div>
      <div style="display:grid;gap:10px">${c.tasks.map((t) => (dragging && t[3] === "OP-131" ? `<div style="height:120px;border-radius:14px;background:#dfe8f5;box-shadow:inset 0 0 0 2px #c9d8ee"></div>` : taskCard(t))).join("")}</div>
      <div class="row" style="gap:6px;justify-content:center;margin-top:9px;font-size:13px;color:#7f8aa3">${c.more} görev daha</div>
    </div>`
  ).join("");
  return `<div class="app">${side}<main class="main">
    <div class="top"><div><h1>Operasyon Panosu</h1><div class="sub">4 Eylül 2026, Cuma · 12 açık görev · 3 görev kontrol bekliyor</div></div>
      <span class="btn sec" style="margin-left:auto">${icon("sliders-horizontal", { size: 16 })}Filtrele</span>
      <span class="btn pri">${icon("plus", { size: 17, stroke: 2.4 })}Yeni Görev</span></div>
    <div style="flex:1;min-height:0;display:flex;gap:16px">
      <div style="flex:1;min-width:0;display:flex;flex-direction:column;gap:16px">
        <div style="display:flex;gap:12px">${cols}</div>
        <div class="card" style="flex:1;padding:18px 20px">
          <div class="row"><span class="h3">Haftalık Zaman Çizelgesi</span><span class="lbl" style="margin-left:10px">36. Hafta</span>${tag(`${icon("calendar", { size: 12, stroke: 2.3 })}Bugün`, "blue", "margin-left:auto")}</div>
          <div style="margin-top:14px">${gantt({ w: 788, rowH: 33, labelW: 118 })}</div>
        </div>
      </div>
      <div style="width:290px;flex-shrink:0;display:grid;gap:16px;align-content:start">
        <div class="card" style="padding:18px 20px"><div class="row"><span class="h3">Ekip Kapasitesi</span>${tag("Ort. %73", "blue", "margin-left:auto")}</div><div class="lbl" style="margin-top:2px">Bu hafta · 31 Ağu - 6 Eyl</div>
          <div style="display:grid;gap:15px;margin-top:16px">${capacityRows()}</div></div>
        <div class="card" style="padding:18px 20px"><div class="h3">Yaklaşan teslimler</div>
          <div style="display:grid;gap:12px;margin-top:14px">${[["Stok uyarı eşikleri", "Bugün", "red"], ["Fatura entegrasyonu", "Yarın", "amber"], ["Servis randevu şablonu", "Yarın", "amber"], ["Müşteri onboarding akışı", "9 Eyl", "gray"]]
            .map(([t, d, tone]) => `<div class="row" style="gap:10px"><span style="width:20px;height:20px;border-radius:7px;box-shadow:inset 0 0 0 2px #c9d4e6"></span><span style="font-size:14px;font-weight:500">${t}</span>${tag(d, tone, "margin-left:auto")}</div>`).join("")}</div></div>
        <div class="card" style="padding:18px 20px"><div class="h3">Bu hafta</div>
          <div class="row" style="gap:8px;margin-top:14px">${[["12", "Tamamlanan", "#12873f"], ["1", "Geciken", "#c9363b"], ["2,4 g", "Ort. süre", "#12419b"]].map(([v, l, c]) => `<div style="flex:1;padding:12px 10px;border-radius:13px;background:#f5f8fd;text-align:center"><div style="font-size:21px;font-weight:600;color:${c};letter-spacing:-.02em">${v}</div><div style="font-size:12px;color:#7f8aa3;margin-top:2px">${l}</div></div>`).join("")}</div></div>
      </div>
    </div>
  </main></div>`;
}

/* Mobil: görevlerim */
export function operationMobile() {
  const item = (t, sub, done, tone, label) => `<div class="card" style="padding:14px 16px;display:flex;gap:13px;align-items:center">
    <span style="width:26px;height:26px;border-radius:50%;flex-shrink:0;${done ? "background:#16a34a;display:grid;place-items:center" : "box-shadow:inset 0 0 0 2px #c3cfe2"}">${done ? icon("check", { size: 15, color: "#fff", stroke: 3 }) : ""}</span>
    <div style="min-width:0"><div style="font-size:15.5px;font-weight:600;${done ? "color:#8a95ad" : ""}">${t}</div><div style="font-size:12.5px;color:#8a95ad;margin-top:2px">${sub}</div></div>
    ${label ? tag(label, tone, "margin-left:auto") : ""}</div>`;
  return `<div style="width:390px;height:844px;background:#f3f6fb;font-family:Outfit;color:#0c1a3a;display:flex;flex-direction:column">
    ${statusBar()}
    <div style="padding:6px 20px 0"><div class="lbl" style="font-size:14px">4 Eylül, Cuma</div><div class="row"><span style="font-size:28px;font-weight:600;letter-spacing:-.02em">Görevlerim</span><span style="margin-left:auto">${av("EK", 40, 4)}</span></div></div>
    <div style="padding:14px 18px 0;display:flex;flex-direction:column;gap:11px;flex:1">
      <div style="padding:18px;border-radius:20px;background:linear-gradient(150deg,#011441,#12419b 65%,#2a6aca);color:#fff" class="row">
        <div style="position:relative;width:66px;height:66px">${ring(60, { d: 66, thick: 8, color: "#7cc4ff", track: "rgb(255 255 255/.16)" })}<div style="position:absolute;inset:0;display:grid;place-items:center;font-size:17px;font-weight:600">3/5</div></div>
        <div style="margin-left:16px"><div style="font-size:17px;font-weight:600">Bugünün planı</div><div style="font-size:13.5px;color:#bfe0ff;margin-top:3px">2 görev kaldı · biri kontrolde</div></div>
      </div>
      <div class="row" style="gap:6px;padding:2px 0">${[["Bugün", true], ["Bu hafta"], ["Tümü"]].map(([t, on]) => `<span style="height:34px;padding:0 15px;border-radius:999px;display:inline-flex;align-items:center;font-size:14px;font-weight:500;${on ? "background:#12419b;color:#fff" : "background:#fff;color:#4a5672"}">${t}</span>`).join("")}</div>
      ${item("Stok uyarı eşikleri", "OP-131 · kontrol bekliyor", false, "red", "Yüksek")}
      ${item("Fatura entegrasyonu", "OP-139 · 3/5 alt görev", false, "amber", "Yarın")}
      ${item("Teslimat rota planı", "OP-137 · 09:40'ta tamamlandı", true)}
      ${item("Kalite kontrol listesi", "OP-129 · 11:15'te tamamlandı", true)}
      ${item("Haftalık kapasite planı", "OP-146 · 13:05'te tamamlandı", true)}
    </div>
    <div style="height:12px"></div>
    ${tabBar([["layout-dashboard", "Pano"], ["list-checks", "Görevler", true], ["calendar-range", "Takvim"], ["users", "Ekip"]])}
  </div>`;
}
