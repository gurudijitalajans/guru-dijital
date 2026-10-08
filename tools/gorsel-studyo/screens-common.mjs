import { icon } from "./lib.mjs";

/* Gösterge kartı: etiket, değer, değişim */
export function kpi(label, value, delta, ic, { tone = "up", big = false, note = "" } = {}) {
  const col = tone === "up" || tone === "gooddown" ? "#12873f" : tone === "down" ? "#c9363b" : "#7f8aa3";
  const tic = tone === "down" || tone === "gooddown" ? "trending-down" : tone === "flat" ? "minus" : "trending-up";
  return `<div class="card" style="flex:1;min-width:0;padding:${big ? "22px 24px" : "16px 18px"}">
    <div class="row" style="gap:10px"><span class="lbl" style="font-size:${big ? 14.5 : 13.5}px">${label}</span><span style="margin-left:auto;width:${big ? 36 : 32}px;height:${big ? 36 : 32}px;border-radius:10px;background:#eaf2ff;display:grid;place-items:center">${icon(ic, { size: big ? 18 : 16, color: "#2a6aca", stroke: 2.1 })}</span></div>
    <div style="font-size:${big ? 36 : 28}px;font-weight:600;letter-spacing:-.03em;margin-top:${big ? 6 : 2}px;line-height:1.15">${value}</div>
    <div class="row" style="gap:6px;font-size:${big ? 14 : 12.5}px;margin-top:${big ? 8 : 5}px"><span class="row" style="gap:4px;color:${col};font-weight:600">${icon(tic, { size: 14, stroke: 2.4 })}${delta}</span><span style="color:#8a95ad">${note}</span></div>
  </div>`;
}

/* Telefon alt sekme çubuğu */
export function tabBar(items) {
  return `<div class="row" style="justify-content:space-around;padding:10px 12px 30px;background:#fff;box-shadow:0 -10px 30px -24px rgb(12 26 58/.4)">${items
    .map(([ic, l, on]) => `<div style="display:grid;justify-items:center;gap:4px;font-size:11.5px;font-weight:${on ? 600 : 500};color:${on ? "#12419b" : "#8a95ad"}">${icon(ic, { size: 22, stroke: on ? 2.2 : 1.9 })}${l}</div>`)
    .join("")}</div>`;
}

/* Fare imleci (sürükleme anlatımı için) */
export const cursor = (style = "") =>
  `<svg width="34" height="34" viewBox="0 0 24 24" style="position:absolute;${style};filter:drop-shadow(0 4px 6px rgb(0 0 0/.3))"><path d="M5 3l14 7.5-6.2 1.6L9.6 18.5z" fill="#0c1a3a" stroke="#fff" stroke-width="1.6" stroke-linejoin="round"/></svg>`;
