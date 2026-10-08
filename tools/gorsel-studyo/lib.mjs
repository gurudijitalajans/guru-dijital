// Guru ürün görselleri stüdyosu: ortak tasarım sistemi (yazı tipi, ikon, UI kiti, cihaz çerçeveleri, zeminler)
//
// Ürün sayfası görsellerini (giriş, öne çıkan ekranlar, paylaşım) ve ana sayfa ekran görüntülerini HTML'den üretir.
//   node tools/gorsel-studyo/render.mjs [filtre]   → tools/gorsel-studyo/out/*.png (2x)
//   python3 tools/gorsel-studyo/export.py          → public/products/{visuals,og,screens}
// Panel kullanılıyorsa ardından: npm run payload run src/payload/refresh-product-visuals.ts
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

export const ROOT = fileURLToPath(new URL("../..", import.meta.url)).replace(/\/$/, "");
export const fileUrl = (p) => "file://" + encodeURI(p);

/* ---------------- Yazı tipi ---------------- */
const FONT_FILES = { 300: "Light", 400: "Regular", 500: "Medium", 600: "SemiBold", 700: "Bold" };
export const FONT_CSS = Object.entries(FONT_FILES)
  .map(([w, n]) => `@font-face{font-family:Outfit;font-weight:${w};src:url("${fileUrl(`${ROOT}/src/fonts/Outfit-${n}.ttf`)}")}`)
  .join("");

/* ---------------- İkonlar (lucide, projedeki paketten) ---------------- */
const iconCache = new Map();
function iconNode(name) {
  if (iconCache.has(name)) return iconCache.get(name);
  const src = readFileSync(`${ROOT}/node_modules/lucide-react/dist/esm/icons/${name}.mjs`, "utf8");
  const m = src.match(/const __iconNode = (\[[\s\S]*?\]);\nconst /);
  if (!m) throw new Error(`ikon okunamadı: ${name}`);
  const node = Function(`return ${m[1]}`)();
  iconCache.set(name, node);
  return node;
}
export function icon(name, { size = 18, stroke = 2, color = "currentColor", style = "" } = {}) {
  const inner = iconNode(name)
    .map(([tag, attrs]) => `<${tag} ${Object.entries(attrs).filter(([k]) => k !== "key").map(([k, v]) => `${k}="${v}"`).join(" ")}/>`)
    .join("");
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;${style}">${inner}</svg>`;
}
const WA_PATH = readFileSync(`${ROOT}/src/components/ui/icons.tsx`, "utf8").match(/WhatsAppIcon[\s\S]*?<path d="([^"]+)"/)[1];
export const brandIcon = {
  whatsapp: (s = 12) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="#fff"><path d="${WA_PATH}"/></svg>`,
  instagram: (s = 12) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round"><rect width="20" height="20" x="2" y="2" rx="5.5"/><circle cx="12" cy="12" r="4.2"/><circle cx="17.6" cy="6.4" r=".6" fill="#fff"/></svg>`,
  web: (s = 12) => icon("globe", { size: s, stroke: 2.4, color: "#fff" }),
};
/* Kanal rozeti: renkli yuvarlak içinde beyaz ikon */
export function chan(kind, d = 20) {
  const bg = { whatsapp: "#25d366", instagram: "linear-gradient(45deg,#f9a03f,#e1306c 55%,#833ab4)", web: "#2a6aca" }[kind];
  return `<span style="width:${d}px;height:${d}px;border-radius:50%;background:${bg};display:grid;place-items:center;flex-shrink:0">${brandIcon[kind](Math.round(d * 0.58))}</span>`;
}

/* ---------------- Logo ---------------- */
export const logo = (tone = "white", h = 40, extra = "") =>
  `<img src="${fileUrl(`${ROOT}/public/brand/logo-${tone}.svg`)}" style="height:${h}px;display:block;${extra}">`;
export const mark = (tone = "navy", h = 28, extra = "") =>
  `<img src="${fileUrl(`${ROOT}/public/brand/mark-${tone}.svg`)}" style="height:${h}px;display:block;${extra}">`;

/* ---------------- Zeminler ---------------- */
const GRAIN = `url("data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 .55 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>`
)}")`;
export const BG = {
  /* Marka anahtar görseli: lacivert zemin, sağ üstten açılan ışık yelpazesi */
  navy: `background-color:#011441;background-image:radial-gradient(48% 60% at 0% 100%, rgb(196 238 255 / .55) 0%, rgb(132 206 252 / .3) 38%, rgb(80 165 245 / 0) 78%),conic-gradient(from 180deg at 103% -3%,#1a4fae 0deg,#0b2e7c 9deg,#011648 17deg,#011648 36deg,#072560 39deg,#2a72d9 41deg,#bfeaff 42.8deg,#b0e5ff 45deg,#6cc0f8 49.5deg,#3383e2 54.5deg,#1a52b4 60deg,#0d3787 67deg,#04205e 76deg,#011649 84deg,#001341 90deg);`,
  /* Açık buz mavisi: ince ışık süzmesi */
  ice: `background-color:#e9f3ff;background-image:radial-gradient(60% 55% at 12% 8%, rgb(255 255 255 / .95), rgb(255 255 255 / 0) 70%),radial-gradient(55% 60% at 100% 100%, rgb(110 190 250 / .45), rgb(110 190 250 / 0) 70%),conic-gradient(from 200deg at 105% -10%, #e9f3ff 0deg, #e9f3ff 30deg, #d5e9ff 36deg, #ffffff 39deg, #cfe6ff 44deg, #e2efff 52deg, #e9f3ff 70deg);`,
};
export const grainLayer = (op = 0.07) =>
  `<div style="position:absolute;inset:0;background-image:${GRAIN};opacity:${op};mix-blend-mode:overlay;pointer-events:none"></div>`;

/* ---------------- Uygulama arayüzü kiti (açık tema, çizgisiz) ---------------- */
export const UI_CSS = `
.app{width:1440px;height:900px;display:flex;background:#f3f6fb;color:#0c1a3a;font-family:Outfit,sans-serif;overflow:hidden;font-variant-numeric:tabular-nums}
.side{width:244px;flex-shrink:0;background:#fff;padding:24px 16px 20px;display:flex;flex-direction:column;box-shadow:1px 0 0 rgb(12 26 58/.0),8px 0 30px -24px rgb(12 26 58/.25);z-index:1}
.brand{display:flex;align-items:center;gap:10px;padding:0 10px 26px}
.brand .pn{font-size:13px;font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:#2a6aca;padding-top:3px}
.nav{display:grid;gap:3px}
.ni{display:flex;align-items:center;gap:12px;height:42px;padding:0 12px;border-radius:11px;font-size:15px;color:#4a5672;font-weight:400}
.ni.on{background:#eaf2ff;color:#12419b;font-weight:500}
.ni .ct{margin-left:auto;font-size:12px;font-weight:600;background:#12419b;color:#fff;border-radius:999px;padding:2px 8px}
.ni.on .ct{background:#12419b}
.side .foot{margin-top:auto;display:flex;align-items:center;gap:11px;padding:12px;border-radius:14px;background:#f5f8fd}
.main{flex:1;min-width:0;padding:26px 30px;display:flex;flex-direction:column;gap:18px}
.top{display:flex;align-items:center;gap:14px}
.top h1{font-size:25px;font-weight:600;letter-spacing:-.02em;line-height:1.15}
.top .sub{font-size:14px;color:#7f8aa3;margin-top:3px}
.search{display:flex;align-items:center;gap:9px;height:42px;width:260px;padding:0 14px;border-radius:12px;background:#fff;color:#a0aac0;font-size:14px;box-shadow:0 1px 2px rgb(12 26 58/.05),0 4px 14px -8px rgb(12 26 58/.15)}
.btn{display:inline-flex;align-items:center;gap:8px;height:42px;padding:0 16px;border-radius:12px;font-size:14.5px;font-weight:500;white-space:nowrap}
.btn.pri{background:#12419b;color:#fff;box-shadow:0 8px 18px -8px rgb(18 65 155/.7)}
.btn.sec{background:#fff;color:#0c1a3a;box-shadow:0 1px 2px rgb(12 26 58/.05),0 4px 14px -8px rgb(12 26 58/.15)}
.card{background:#fff;border-radius:16px;box-shadow:0 1px 2px rgb(12 26 58/.05),0 10px 28px -16px rgb(12 26 58/.22)}
.lbl{font-size:13px;color:#7f8aa3}
.h3{font-size:16px;font-weight:600;letter-spacing:-.01em}
.av{display:grid;place-items:center;border-radius:50%;color:#fff;font-weight:600;flex-shrink:0;letter-spacing:.02em}
.tag{display:inline-flex;align-items:center;gap:6px;border-radius:999px;font-size:12px;font-weight:600;padding:3px 9px;white-space:nowrap}
.up{color:#12a150}.down{color:#e5484d}
.row{display:flex;align-items:center}
`;
const AV_COLORS = ["#2a6aca", "#7c5cff", "#0ea5a5", "#e8833a", "#d9467a", "#12419b", "#16a34a", "#5b6bf5"];
export function av(initials, d = 34, i) {
  const c = AV_COLORS[(i ?? initials.charCodeAt(0) + initials.charCodeAt(1)) % AV_COLORS.length];
  return `<span class="av" style="width:${d}px;height:${d}px;font-size:${Math.round(d * 0.36)}px;background:linear-gradient(140deg,${c},${c}cc)">${initials}</span>`;
}
const TONES = {
  blue: ["#eaf2ff", "#12419b"],
  green: ["#e6f6ec", "#12873f"],
  amber: ["#fff3dc", "#b45f06"],
  red: ["#feecec", "#c9363b"],
  violet: ["#f0ecff", "#5b3fd6"],
  gray: ["#eef1f6", "#55617b"],
  teal: ["#e0f6f5", "#0b7d7d"],
};
export const tag = (text, tone = "blue", extra = "") => {
  const [bg, fg] = TONES[tone];
  return `<span class="tag" style="background:${bg};color:${fg};${extra}">${text}</span>`;
};
export const dot = (c, s = 8) => `<span style="width:${s}px;height:${s}px;border-radius:50%;background:${c};display:inline-block;flex-shrink:0"></span>`;

export function sidebar({ product, items, user }) {
  return `<aside class="side">
    <div class="brand">${mark("navy", 30)}<span class="pn">${product}</span></div>
    <nav class="nav">${items
      .map(([ic, label, on, ct]) => `<div class="ni${on ? " on" : ""}">${icon(ic, { size: 19, stroke: on ? 2.2 : 1.9 })}<span>${label}</span>${ct ? `<span class="ct">${ct}</span>` : ""}</div>`)
      .join("")}</nav>
    <div class="foot">${av(user[0], 36, user[3])}<div style="min-width:0"><div style="font-size:14px;font-weight:600">${user[1]}</div><div style="font-size:12.5px;color:#7f8aa3">${user[2]}</div></div>${icon("chevrons-up-down", { size: 16, color: "#a0aac0", style: "margin-left:auto" })}</div>
  </aside>`;
}

/* Grafikler (SVG) */
export function bars(values, { w = 300, h = 150, color = "#2a6aca", hi = -1, hiColor = "#12419b", labels = [], max, gap = 0.42, r = 7, fade = "#dce9ff", showVals = false, fs = 12 } = {}) {
  const m = max ?? Math.max(...values) * (showVals ? 1.22 : 1.08);
  const bw = w / values.length;
  const barW = bw * (1 - gap);
  const lh = labels.length ? fs + 12 : 0;
  const ch = h - lh;
  const out = values
    .map((v, i) => {
      const bh = (v / m) * ch;
      const x = i * bw + (bw - barW) / 2;
      const fill = hi === -1 ? color : i === hi ? hiColor : fade;
      return `<rect x="${x.toFixed(1)}" y="${(ch - bh).toFixed(1)}" width="${barW.toFixed(1)}" height="${bh.toFixed(1)}" rx="${r}" fill="${fill}"/>` +
        (showVals ? `<text x="${(x + barW / 2).toFixed(1)}" y="${(ch - bh - 10).toFixed(1)}" text-anchor="middle" font-size="${fs + 1}" fill="${i === hi ? "#12419b" : "#7f8aa3"}" font-family="Outfit" font-weight="${i === hi ? 700 : 500}">${v}</text>` : "") +
        (labels[i] ? `<text x="${(x + barW / 2).toFixed(1)}" y="${h - 4}" text-anchor="middle" font-size="${fs}" fill="${i === hi ? "#0c1a3a" : "#8a95ad"}" font-family="Outfit" font-weight="${i === hi ? 600 : 400}">${labels[i]}</text>` : "");
    })
    .join("");
  return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${out}</svg>`;
}
export function line(series, { w = 600, h = 200, max, min = 0, colors = ["#2a6aca", "#b9c7e0"], fill = true, dash = [false, true], dots = [true, false], width = [3, 2] } = {}) {
  const all = series.flat();
  const M = max ?? Math.max(...all) * 1.1;
  const pt = (v, i, n) => [(i / (n - 1)) * w, h - ((v - min) / (M - min)) * h];
  let out = "";
  series.forEach((s, k) => {
    const n = s.length;
    const pts = s.map((v, i) => pt(v, i, n));
    /* yumuşak eğri */
    let d = `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`;
    for (let i = 1; i < pts.length; i++) {
      const [x0, y0] = pts[i - 1];
      const [x1, y1] = pts[i];
      const cx = (x0 + x1) / 2;
      d += ` C${cx.toFixed(1)},${y0.toFixed(1)} ${cx.toFixed(1)},${y1.toFixed(1)} ${x1.toFixed(1)},${y1.toFixed(1)}`;
    }
    if (fill && k === 0) {
      out += `<defs><linearGradient id="lg${k}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${colors[k]}" stop-opacity=".22"/><stop offset="1" stop-color="${colors[k]}" stop-opacity="0"/></linearGradient></defs><path d="${d} L${w},${h} L0,${h} Z" fill="url(#lg${k})"/>`;
    }
    out += `<path d="${d}" fill="none" stroke="${colors[k]}" stroke-width="${width[k]}" stroke-linecap="round" ${dash[k] ? 'stroke-dasharray="6 7"' : ""}/>`;
    if (dots[k]) {
      const [x, y] = pts[n - 1];
      out += `<circle cx="${x}" cy="${y}" r="7" fill="#fff" stroke="${colors[k]}" stroke-width="3.5"/>`;
    }
  });
  return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" style="overflow:visible">${out}</svg>`;
}
export function donut(parts, { d = 200, thick = 30, gap = 2.2 } = {}) {
  const r = (d - thick) / 2;
  const c = 2 * Math.PI * r;
  const total = parts.reduce((a, p) => a + p.v, 0);
  let off = 0;
  const segs = parts
    .map((p) => {
      const len = (p.v / total) * c - gap;
      const s = `<circle cx="${d / 2}" cy="${d / 2}" r="${r}" fill="none" stroke="${p.c}" stroke-width="${thick}" stroke-dasharray="${len.toFixed(2)} ${(c - len).toFixed(2)}" stroke-dashoffset="${(-off).toFixed(2)}" stroke-linecap="butt" transform="rotate(-90 ${d / 2} ${d / 2})"/>`;
      off += (p.v / total) * c;
      return s;
    })
    .join("");
  return `<svg width="${d}" height="${d}" viewBox="0 0 ${d} ${d}">${segs}</svg>`;
}

export function ring(pct, { d = 120, thick = 12, color = "#2a6aca", track = "#e3edfb" } = {}) {
  const r = (d - thick) / 2;
  const c = 2 * Math.PI * r;
  return `<svg width="${d}" height="${d}" viewBox="0 0 ${d} ${d}"><circle cx="${d / 2}" cy="${d / 2}" r="${r}" fill="none" stroke="${track}" stroke-width="${thick}"/><circle cx="${d / 2}" cy="${d / 2}" r="${r}" fill="none" stroke="${color}" stroke-width="${thick}" stroke-linecap="round" stroke-dasharray="${((pct / 100) * c).toFixed(1)} ${c.toFixed(1)}" transform="rotate(-90 ${d / 2} ${d / 2})"/></svg>`;
}

/* ---------------- Cihaz çerçeveleri ---------------- */
/** MacBook: ekran içeriği 1440x900 CSS px, verilen genişliğe ölçeklenir */
export function macbook(screen, { width = 1100, style = "", glare = true } = {}) {
  const bez = width * 0.021;
  const inner = width - bez * 2;
  const s = inner / 1440;
  const sh = 900 * s;
  const rad = width * 0.026;
  const baseH = width * 0.024;
  return `<div class="mac" style="position:relative;width:${width}px;${style}">
    <div style="position:relative;padding:${bez}px ${bez}px ${bez * 1.25}px;border-radius:${rad}px ${rad}px ${rad * 0.35}px ${rad * 0.35}px;background:#07090d;box-shadow:inset 0 0 0 ${Math.max(1.5, width * 0.0016)}px #3b3f47,0 0 0 ${Math.max(1, width * 0.0012)}px #aeb3bb">
      <div style="position:absolute;left:50%;top:0;transform:translateX(-50%);width:${width * 0.09}px;height:${bez * 1.05}px;background:#07090d;border-radius:0 0 ${bez * 0.5}px ${bez * 0.5}px;z-index:3;display:grid;place-items:center"><span style="width:${bez * 0.36}px;height:${bez * 0.36}px;border-radius:50%;background:#1a2233;box-shadow:inset 0 0 0 1px #2c3650"></span></div>
      <div style="position:relative;width:${inner}px;height:${sh}px;overflow:hidden;border-radius:${rad * 0.32}px">
        <div style="width:1440px;height:900px;transform:scale(${s});transform-origin:0 0">${screen}</div>
        ${glare ? `<div style="position:absolute;inset:0;background:linear-gradient(118deg,rgb(255 255 255/.10) 0%,rgb(255 255 255/0) 34%);pointer-events:none"></div>` : ""}
      </div>
    </div>
    <div style="position:relative;left:${-width * 0.035}px;width:${width * 1.07}px;height:${baseH}px;border-radius:${baseH * 0.12}px ${baseH * 0.12}px ${baseH * 0.9}px ${baseH * 0.9}px / ${baseH * 0.12}px ${baseH * 0.12}px ${baseH * 0.55}px ${baseH * 0.55}px;background:linear-gradient(180deg,#f1f2f5 0%,#d7dae0 32%,#b4b9c2 70%,#8d929c 100%);box-shadow:inset 0 1px 0 #fff">
      <div style="position:absolute;left:50%;top:0;transform:translateX(-50%);width:${width * 0.15}px;height:${baseH * 0.32}px;border-radius:0 0 ${baseH * 0.3}px ${baseH * 0.3}px;background:linear-gradient(180deg,#a9aeb7,#c9cdd4)"></div>
    </div>
  </div>`;
}

/** iPhone: ekran içeriği 390x844 CSS px */
export function iphone(screen, { width = 330, style = "" } = {}) {
  const frame = width * 0.03;
  const bez = width * 0.034;
  const inner = width - (frame + bez) * 2;
  const s = inner / 390;
  const sh = 844 * s;
  const R = width * 0.17;
  return `<div class="phone" style="position:relative;width:${width}px;${style}">
    <div style="position:relative;padding:${frame}px;border-radius:${R}px;background:linear-gradient(135deg,#9aa0aa 0%,#3c4048 18%,#24272d 50%,#4a4f58 82%,#a3a8b1 100%);box-shadow:inset 0 0 0 1px rgb(255 255 255/.25)">
      <div style="padding:${bez}px;border-radius:${R - frame}px;background:#050608">
        <div style="position:relative;width:${inner}px;height:${sh}px;overflow:hidden;border-radius:${R - frame - bez}px;background:#fff">
          <div style="width:390px;height:844px;transform:scale(${s});transform-origin:0 0">${screen}</div>
          <div style="position:absolute;left:50%;top:${inner * 0.03}px;transform:translateX(-50%);width:${inner * 0.32}px;height:${inner * 0.092}px;border-radius:999px;background:#050608"></div>
          <div style="position:absolute;inset:0;background:linear-gradient(125deg,rgb(255 255 255/.12) 0%,rgb(255 255 255/0) 30%);pointer-events:none"></div>
        </div>
      </div>
    </div>
    <span style="position:absolute;right:${-width * 0.008}px;top:${width * 0.62}px;width:${width * 0.012}px;height:${width * 0.26}px;border-radius:2px;background:#5b606a"></span>
    <span style="position:absolute;left:${-width * 0.008}px;top:${width * 0.5}px;width:${width * 0.012}px;height:${width * 0.16}px;border-radius:2px;background:#5b606a"></span>
    <span style="position:absolute;left:${-width * 0.008}px;top:${width * 0.72}px;width:${width * 0.012}px;height:${width * 0.16}px;border-radius:2px;background:#5b606a"></span>
  </div>`;
}

/** Uygulama penceresi: 1440x900 ekrandan bir bölge (x,y,w,h) verilen ölçekte; üstte sade pencere çubuğu */
export function appWindow(screen, { crop: [x, y, w, h], scale = 1, title = "", style = "", radius = 18 } = {}) {
  const bar = 44;
  return `<div style="position:absolute;border-radius:${radius}px;overflow:hidden;background:#fff;box-shadow:0 0 0 1px rgb(12 26 58/.06),0 50px 100px -40px rgb(1 12 40/.55),0 18px 40px -24px rgb(1 12 40/.35);${style}">
    <div style="height:${bar}px;display:flex;align-items:center;gap:8px;padding:0 18px;background:#fbfcfe">
      ${["#ff5f57", "#febc2e", "#28c840"].map((c) => `<span style="width:12px;height:12px;border-radius:50%;background:${c}"></span>`).join("")}
      ${title ? `<div style="margin:0 auto;display:flex;align-items:center;gap:8px;height:28px;padding:0 16px;border-radius:9px;background:#eef2f8;font:500 13px Outfit;color:#55617b">${icon("lock", { size: 12, stroke: 2.4, color: "#8a95ad" })}${title}</div><span style="width:52px"></span>` : ""}
    </div>
    <div style="position:relative;width:${w * scale}px;height:${h * scale}px;overflow:hidden">
      <div style="position:absolute;left:${-x * scale}px;top:${-y * scale}px;width:1440px;height:900px;transform:scale(${scale});transform-origin:0 0">${screen}</div>
    </div>
  </div>`;
}

/* Yüzen kart (cam etkili beyaz) */
export const floatCard = (html, style = "", pad = "20px 22px") =>
  `<div style="position:absolute;background:#fff;border-radius:22px;padding:${pad};box-shadow:0 0 0 1px rgb(255 255 255/.6),0 40px 70px -28px rgb(1 12 40/.55),0 14px 30px -18px rgb(1 12 40/.35);color:#0c1a3a;font-family:Outfit;${style}">${html}</div>`;

/* Sayfa iskeleti */
export function page({ w, h, bg, body, css = "" }) {
  return `<!doctype html><html><head><meta charset="utf-8"><style>${FONT_CSS}${UI_CSS}
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:${w}px;height:${h}px;overflow:hidden}
body{position:relative;font-family:Outfit,sans-serif;-webkit-font-smoothing:antialiased;${bg}}
${css}</style></head><body>${body}</body></html>`;
}
