import { av, dot, icon, line, ring, sidebar, tag } from "./lib.mjs";
import { kpi, tabBar } from "./screens-common.mjs";
import { statusBar } from "./screens-chatbot.mjs";

/* Mevcut ürün ekranıyla aynı örnek veri */
export const STAGES = [
  { t: "Aday", n: 18, sum: "₺1.640.000", c: "#8a95ad", more: 14, deals: [["Kaya Lojistik", "₺180.000", "12 Eyl", 20, "BK"], ["Nova Mobilya", "₺95.000", "15 Eyl", 20, "SA"], ["Delta Turizm", "₺140.000", "18 Eyl", 25, "MÖ"], ["Ege Mimarlık", "₺75.000", "19 Eyl", 15, "EY"]] },
  { t: "Görüşme", n: 14, sum: "₺1.920.000", c: "#44a1f1", more: 10, deals: [["Atlas Yapı", "₺240.000", "9 Eyl", 45, "BK"], ["Mavi Klinik", "₺68.000", "10 Eyl", 40, "EY"], ["Yıldız Gıda", "₺310.000", "16 Eyl", 50, "SA"], ["Sena Kozmetik", "₺120.000", "17 Eyl", 40, "MÖ"]] },
  { t: "Teklif", n: 10, sum: "₺1.300.000", c: "#e8a33a", more: 6, deals: [["Efe Otomotiv", "₺420.000", "Bugün", 70, "MÖ", true], ["Pera Hukuk", "₺52.000", "8 Eyl", 65, "EY"], ["Arda Enerji", "₺275.000", "11 Eyl", 75, "BK"], ["Marmara Lojistik", "₺190.000", "13 Eyl", 60, "SA"]] },
  { t: "Kazanıldı", n: 7, sum: "₺920.000", c: "#16a34a", more: 3, won: true, deals: [["Lidya Tekstil", "₺190.000", "2 Eyl", 100, "SA"], ["Kuzey Sigorta", "₺145.000", "1 Eyl", 100, "MÖ"], ["Bora Eğitim", "₺88.000", "29 Ağu", 100, "EY"], ["Orion Yazılım", "₺110.000", "28 Ağu", 100, "BK"]] },
];
const OWNER_I = { BK: 0, SA: 2, MÖ: 3, EY: 4 };

export function dealCard([co, amt, date, p, owner, urgent], { won = false, big = false, color = "#2a6aca" } = {}) {
  const f = big ? 1.25 : 1;
  return `<div class="card" style="padding:${14 * f}px ${15 * f}px;border-radius:${14 * f}px">
    <div class="row" style="gap:8px"><span style="font-size:${15 * f}px;font-weight:600">${co}</span><span style="margin-left:auto">${av(owner, 26 * f, OWNER_I[owner])}</span></div>
    <div style="font-size:${19 * f}px;font-weight:600;letter-spacing:-.02em;margin-top:${4 * f}px;color:#12419b">${amt}</div>
    <div class="row" style="gap:8px;margin-top:${10 * f}px">${urgent ? tag(`${icon("bell", { size: 11 * f, stroke: 2.4 })}Bugün`, "amber", `font-size:${12 * f}px`) : tag(`${icon("calendar", { size: 11 * f, stroke: 2.2 })}${date}`, "gray", `font-size:${12 * f}px`)}
      ${won ? tag(`${icon("check", { size: 11 * f, stroke: 3 })}Kazanıldı`, "green", `margin-left:auto;font-size:${12 * f}px`) : `<span style="margin-left:auto;font-size:${13 * f}px;font-weight:600;color:#55617b">%${p}</span>`}</div>
    ${won ? "" : `<div style="height:${5 * f}px;border-radius:9px;background:#edf2f9;margin-top:${10 * f}px"><div style="width:${p}%;height:100%;border-radius:9px;background:${color}"></div></div>`}
  </div>`;
}

export function crmDesktop({ dragging = false } = {}) {
  const side = sidebar({
    product: "CRM",
    items: [["layout-dashboard", "Panel"], ["funnel", "Fırsatlar", true, 42], ["users", "Müşteriler"], ["file-text", "Teklifler"], ["list-checks", "Görevler"], ["chart-column", "Raporlar"], ["settings", "Ayarlar"]],
    user: ["BK", "Burak Kılıç", "Satış Müdürü", 0],
  }).replace('<div class="foot">', `<div style="margin-top:auto;padding:16px 14px;border-radius:16px;background:linear-gradient(150deg,#eaf2ff,#f5f9ff);margin-bottom:12px">
      <div class="row" style="font-size:13.5px;font-weight:600;color:#12419b">Eylül hedefi<span style="margin-left:auto">%68</span></div>
      <div style="height:7px;border-radius:9px;background:#d6e5fb;margin-top:10px"><div style="width:68%;height:100%;border-radius:9px;background:linear-gradient(90deg,#12419b,#44a1f1)"></div></div>
      <div style="font-size:12.5px;color:#55617b;margin-top:8px">₺920.000 / ₺1.350.000</div>
    </div><div class="foot" style="margin-top:0">`);
  const cols = STAGES.map(
    (s) => `<div style="flex:1;min-width:0;padding:12px;border-radius:18px;background:#eaf0f8;overflow:hidden">
      <div class="row" style="gap:8px;padding:2px 4px 10px">${dot(s.c, 9)}<span style="font-size:15px;font-weight:600">${s.t}</span><span style="font-size:13px;color:#7f8aa3">${s.n}</span><span style="margin-left:auto;font-size:13px;font-weight:600;color:#3b4763">${s.sum}</span></div>
      <div style="display:grid;gap:10px">${s.deals.map((d) => (dragging && d[0] === "Atlas Yapı" ? `<div style="height:128px;border-radius:14px;background:#dfe8f5;box-shadow:inset 0 0 0 2px #c9d8ee"></div>` : dealCard(d, { won: s.won, color: s.c }))).join("")}</div>
      <div class="row" style="gap:6px;justify-content:center;margin-top:10px;font-size:13px;color:#7f8aa3">${icon("plus", { size: 14 })}${s.more} fırsat daha</div>
    </div>`
  ).join("");
  return `<div class="app">${side}<main class="main">
    <div class="top"><div><h1>Satış Hattı</h1><div class="sub">Eylül 2026 · 42 açık fırsat · 4 aşama</div></div>
      <div class="search" style="margin-left:auto;width:230px">${icon("search", { size: 17, color: "#a0aac0" })}Fırsat ara</div>
      <span class="btn sec">${icon("users", { size: 16 })}Tüm ekip${icon("chevron-down", { size: 15, color: "#8a95ad" })}</span>
      <span class="btn pri">${icon("plus", { size: 17, stroke: 2.4 })}Yeni Fırsat</span></div>
    <div class="row" style="gap:14px">
      ${kpi("Açık fırsat", "42", "+6", "briefcase-business", { note: "bu hafta" })}
      ${kpi("Satış hattı değeri", "₺4,86M", "+%12", "wallet", { note: "geçen aya göre" })}
      ${kpi("Kazanma oranı", "%34", "+3 puan", "target", { note: "geçen aya göre" })}
      ${kpi("Bu ay teklif", "19", "10", "file-text", { tone: "flat", note: "yanıt bekliyor" })}
    </div>
    <div style="flex:1;min-height:0;display:flex;gap:14px">${cols}</div>
  </main></div>`;
}

export const TREND26 = [410, 455, 470, 520, 560, 545, 610, 680, 740];
export const TREND25 = [380, 395, 430, 440, 470, 500, 490, 530, 560];
export const MONTHS = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl"];

export function trendChart({ w = 620, h = 260, fs = 13 } = {}) {
  return `<div style="position:relative">${line([TREND26, TREND25], { w, h, min: 300, max: 800 })}
    <div class="row" style="justify-content:space-between;margin-top:12px;font-size:${fs}px;color:#8a95ad">${MONTHS.map((m, i) => `<span style="${i === 8 ? "color:#0c1a3a;font-weight:600" : ""}">${m}</span>`).join("")}</div></div>`;
}

/* Rapor ekranı (ürün turu videosundaki "Raporlar" durağı). Veriler mevcut
   görsellerle aynı: gelir trendi, kazanma oranı, temsilci performansı. */
export const REPS = [["BK", "Burak Kılıç", "₺410K", 82, 0], ["SA", "Seda Aksoy", "₺345K", 69, 2], ["MÖ", "Mert Özkan", "₺245K", 49, 3], ["EY", "Ece Yalçın", "₺180K", 36, 4]];

export function crmReportsDesktop() {
  const side = sidebar({
    product: "CRM",
    items: [["layout-dashboard", "Panel"], ["funnel", "Fırsatlar", false, 42], ["users", "Müşteriler"], ["file-text", "Teklifler"], ["list-checks", "Görevler"], ["chart-column", "Raporlar", true], ["settings", "Ayarlar"]],
    user: ["BK", "Burak Kılıç", "Satış Müdürü", 0],
  });
  return `<div class="app">${side}<main class="main">
    <div class="top"><div><h1>Raporlar</h1><div class="sub">Eylül 2026 · tüm ekip</div></div>
      <span class="btn sec" style="margin-left:auto">${icon("users", { size: 16 })}Tüm ekip${icon("chevron-down", { size: 15, color: "#8a95ad" })}</span>
      <span class="btn sec">${icon("calendar", { size: 16 })}Bu yıl${icon("chevron-down", { size: 15, color: "#8a95ad" })}</span></div>
    <div class="row" style="gap:14px">
      ${kpi("Açık fırsat", "42", "+6", "briefcase-business", { note: "bu hafta" })}
      ${kpi("Satış hattı değeri", "₺4,86M", "+%12", "wallet", { note: "geçen aya göre" })}
      ${kpi("Kazanma oranı", "%34", "+3 puan", "target", { note: "geçen aya göre" })}
      ${kpi("Bu ay teklif", "19", "10", "file-text", { tone: "flat", note: "yanıt bekliyor" })}
    </div>
    <div style="flex:1;min-height:0;display:flex;gap:14px">
      <div class="card" style="flex:1;min-width:0;padding:22px 28px 20px;display:flex;flex-direction:column">
        <div class="row"><div><div class="h3" style="font-size:19px">Gelir trendi</div><div class="lbl" style="font-size:14px;margin-top:3px">Yıl toplamı ₺5,05M</div></div>
          <div class="row" style="margin-left:auto;gap:16px;font-size:13.5px;color:#55617b"><span class="row" style="gap:7px"><span style="width:18px;height:4px;border-radius:9px;background:#2a6aca"></span>2026</span><span class="row" style="gap:7px"><span style="width:18px;height:4px;border-radius:9px;background:#b9c7e0"></span>2025</span></div></div>
        <div style="position:relative;margin-top:auto">${trendChart({ w: 680, h: 250, fs: 13.5 })}
          <div style="position:absolute;right:-6px;top:-44px;padding:6px 11px;border-radius:10px;background:#011441;color:#fff;font-size:14px;font-weight:600;white-space:nowrap">Eyl · ₺740K</div></div>
      </div>
      <div style="width:384px;flex-shrink:0;display:flex;flex-direction:column;gap:14px">
        <div class="card" style="flex:1;padding:22px 24px;display:flex;align-items:center"><div class="row" style="gap:20px"><div style="position:relative;width:112px;height:112px">${ring(34, { d: 112, thick: 13 })}<div style="position:absolute;inset:0;display:grid;place-items:center;font-size:26px;font-weight:600;letter-spacing:-.03em">%34</div></div>
          <div><div style="font-size:17px;font-weight:600">Kazanma oranı</div><div class="lbl" style="font-size:13.5px;margin-top:4px;line-height:1.4">Teklif verilen fırsatların<br>satışa dönüşenleri</div><div class="row up" style="gap:5px;font-size:13.5px;font-weight:500;margin-top:9px">${icon("trending-up", { size: 15, stroke: 2.4 })}3 puan arttı</div></div></div></div>
        <div class="card" style="padding:20px 24px">
          <div class="row" style="font-size:15.5px;font-weight:600;color:#12419b">Eylül hedefi<span style="margin-left:auto">%68</span></div>
          <div style="height:8px;border-radius:9px;background:#d6e5fb;margin-top:12px"><div style="width:68%;height:100%;border-radius:9px;background:linear-gradient(90deg,#12419b,#44a1f1)"></div></div>
          <div style="font-size:13.5px;color:#55617b;margin-top:9px">₺920.000 / ₺1.350.000</div>
        </div>
      </div>
    </div>
    <div class="card" style="padding:20px 24px 22px">
      <div class="row"><div class="h3" style="font-size:17px">Temsilci performansı</div><span class="lbl" style="margin-left:auto">Eylül · kazanılan</span></div>
      <div class="row" style="gap:14px;margin-top:16px">${REPS.map(([i, n, v, p, k]) => `<div style="flex:1;padding:14px 16px;border-radius:14px;background:#f5f8fd"><div class="row" style="gap:11px">${av(i, 34, k)}<div><div style="font-size:14.5px;font-weight:500">${n}</div><div style="font-size:18px;font-weight:600;letter-spacing:-.02em">${v}</div></div></div><div style="height:6px;border-radius:9px;background:#e3eaf5;margin-top:12px"><div style="width:${p}%;height:100%;border-radius:9px;background:#2a6aca"></div></div></div>`).join("")}</div>
    </div>
  </main></div>`;
}

/* Mobil: fırsat ayrıntısı */
export function crmMobile() {
  const steps = ["Aday", "Görüşme", "Teklif", "Kazanıldı"];
  return `<div style="width:390px;height:844px;background:#f3f6fb;font-family:Outfit;color:#0c1a3a;display:flex;flex-direction:column">
    ${statusBar()}
    <div class="row" style="padding:4px 18px 10px;gap:10px">${icon("chevron-left", { size: 24, color: "#12419b" })}<span style="font-size:16px;color:#12419b;font-weight:500">Fırsatlar</span><span style="margin-left:auto">${icon("ellipsis", { size: 22, color: "#55617b" })}</span></div>
    <div style="padding:0 18px;flex:1;display:flex;flex-direction:column;gap:12px;min-height:0">
      <div class="card" style="padding:18px">
        <div class="row" style="gap:12px"><span style="width:48px;height:48px;border-radius:15px;background:linear-gradient(140deg,#12419b,#44a1f1);display:grid;place-items:center">${icon("building-2", { size: 24, color: "#fff", stroke: 1.9 })}</span><div><div style="font-size:19px;font-weight:600">Atlas Yapı</div><div style="font-size:13.5px;color:#7f8aa3">Kurumsal web ve CRM projesi</div></div></div>
        <div class="row" style="margin-top:16px;align-items:flex-end"><div><div class="lbl">Tutar</div><div style="font-size:30px;font-weight:600;letter-spacing:-.03em;color:#12419b">₺240.000</div></div><div style="margin-left:auto;text-align:right"><div class="lbl">Olasılık</div><div style="font-size:22px;font-weight:600">%45</div></div></div>
        <div class="row" style="gap:5px;margin-top:16px">${steps.map((_, i) => `<span style="flex:1;height:7px;border-radius:9px;background:${i <= 1 ? "#2a6aca" : "#dfe7f3"}"></span>`).join("")}</div>
        <div class="row" style="justify-content:space-between;margin-top:7px;font-size:12px;color:#8a95ad">${steps.map((s, i) => `<span style="${i === 1 ? "color:#12419b;font-weight:600" : ""}">${s}</span>`).join("")}</div>
      </div>
      <div style="padding:16px 18px;border-radius:16px;background:linear-gradient(135deg,#fff8eb,#fff2dc)">
        <div class="row" style="gap:12px"><span style="width:40px;height:40px;border-radius:12px;background:#fff;display:grid;place-items:center">${icon("bell-ring", { size: 19, color: "#b45f06", stroke: 2.1 })}</span><div><div style="font-size:15px;font-weight:600;color:#7a3f02">Teklif gönder</div><div style="font-size:13px;color:#a0661f">Bugün 17:00 · Burak Kılıç</div></div></div>
        <div class="row" style="gap:8px;margin-top:12px"><span class="btn pri" style="flex:1;justify-content:center;height:40px">${icon("send", { size: 15, stroke: 2.2 })}Teklifi gönder</span><span class="btn sec" style="height:40px;padding:0 13px">${icon("clock", { size: 16 })}</span></div>
      </div>
      <div class="card" style="padding:16px 18px">
        <div class="h3">Aktivite</div>
        <div style="display:grid;gap:13px;margin-top:12px">${[
          ["phone", "Görüşme yapıldı", "9 Eyl · 25 dk", "#eaf2ff", "#2a6aca"],
          ["file-text", "Teklif taslağı hazırlandı", "8 Eyl · Burak Kılıç", "#fff3dc", "#b45f06"],
          ["mail", "Tanışma e-postası gönderildi", "5 Eyl · Burak Kılıç", "#e6f6ec", "#12873f"],
        ].map(([ic, t, s, bg, fg]) => `<div class="row" style="gap:12px"><span style="width:34px;height:34px;border-radius:11px;background:${bg};display:grid;place-items:center">${icon(ic, { size: 16, color: fg, stroke: 2.1 })}</span><div><div style="font-size:14.5px;font-weight:500">${t}</div><div style="font-size:12.5px;color:#8a95ad">${s}</div></div></div>`).join("")}</div>
      </div>
    </div>
    <div style="padding:12px 18px 14px"><div class="card" style="padding:14px 16px" ><div class="row" style="gap:12px">${av("OY", 40, 5)}<div><div style="font-size:15px;font-weight:600">Okan Yıldız</div><div style="font-size:12.5px;color:#8a95ad">Satın Alma Müdürü</div></div>
      <span class="row" style="margin-left:auto;gap:8px">${["phone", "mail", "message-circle"].map((ic) => `<span style="width:36px;height:36px;border-radius:11px;background:#eaf2ff;display:grid;place-items:center">${icon(ic, { size: 16, color: "#12419b", stroke: 2.1 })}</span>`).join("")}</span></div></div></div>
    ${tabBar([["layout-dashboard", "Panel"], ["funnel", "Fırsatlar", true], ["users", "Müşteriler"], ["list-checks", "Görevler"]])}
  </div>`;
}
