// Hizmet görselleri: her hizmet için kart (1600x1000, başlıksız) ve gönderi/poster (1200x1500,
// müşterinin "Marka Tescili" gönderisi düzeninde büyük başlıklı). Açık gri zemin, mavi tonlarda
// tek güçlü nesne ya da hizmete özgü arayüz, guru logosu.
//   node tools/gorsel-studyo/render.mjs hizmet-   → out/hizmet-*.png (2x)
//   python3 tools/gorsel-studyo/export-hizmet.py  → public/services/<slug>.webp, <slug>-poster.webp
// Marka Tescil'in posteri müşterinin kendi gönderisidir (export-hizmet.py kırpar); kartı burada kurulur.
import { ROOT, av, bars, fileUrl, icon, iphone, line, logo, macbook, page, ring, tag } from "./lib.mjs";
import { statusBar } from "./screens-chatbot.mjs";

/* ---------------- Ortak ---------------- */
const BGL = `background-color:#eef0f4;background-image:radial-gradient(60% 50% at 62% 36%,#f9fafc 0%,rgb(249 250 252/0) 75%),linear-gradient(180deg,#f3f4f7 0%,#e9ecf1 100%);`;
const CSS = `
.ttl{font-weight:700;letter-spacing:-.035em;line-height:1.07;white-space:nowrap;background:linear-gradient(180deg,#1677de 0%,#0a5cc0 60%,#0752b2 100%);-webkit-background-clip:text;background-clip:text;color:transparent;padding:0 .02em .12em;margin-bottom:-.12em}
.psub{font-size:48px;font-weight:600;color:#3a3b3e;letter-spacing:-.02em;line-height:1.1;margin-top:10px}
.pdesc{margin:66px 0 0 auto;max-width:470px;font-size:26px;line-height:1.38;color:#0b1f4e;font-weight:400}
.gl{background:rgb(255 255 255/.86);backdrop-filter:blur(14px);border-radius:22px;box-shadow:0 0 0 1px rgb(255 255 255/.7),0 30px 60px -30px rgb(1 20 65/.45),0 10px 24px -16px rgb(1 20 65/.25)}
.mono{font-family:"SF Mono",Menlo,monospace}
`;
const shadow = (x, y, w, h, op = 0.32) =>
  `<div style="position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px;border-radius:50%;background:radial-gradient(closest-side,rgb(1 20 65/${op}),transparent);filter:blur(8px)"></div>`;
const glowL = (x, y, w, h, c = "rgb(68 161 241/.22)") =>
  `<div style="position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px;border-radius:50%;background:radial-gradient(closest-side,${c},transparent);filter:blur(10px)"></div>`;
const at = (x, y, html, extra = "") => `<div style="position:absolute;left:${x}px;top:${y}px;${extra}">${html}</div>`;

function posterText({ lines, sub = "Hizmetleri", desc, size = 112 }) {
  return `<div style="position:absolute;right:58px;top:98px;text-align:right">
      ${lines.map((l) => `<div class="ttl" style="font-size:${size}px">${l}</div>`).join("")}
      <div class="psub">${sub}</div>
      <div class="pdesc">${desc}</div>
    </div>
    ${logo("navy", 72, "position:absolute;right:58px;bottom:62px")}`;
}
const card = (body) => page({ w: 1600, h: 1000, bg: BGL, css: CSS, body });
const poster = (body, text) => page({ w: 1200, h: 1500, bg: BGL, css: CSS, body: body + posterText(text) });

/* Parlak mavi malzeme: SVG gradyanları (her svg kendi id önekiyle) */
const mat = (p) => `
  <linearGradient id="${p}top" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e4f7ff"/><stop offset=".45" stop-color="#9fd8fb"/><stop offset="1" stop-color="#55aef3"/></linearGradient>
  <linearGradient id="${p}left" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#4a9df0"/><stop offset=".55" stop-color="#2c74d8"/><stop offset="1" stop-color="#1c56b8"/></linearGradient>
  <linearGradient id="${p}right" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1d58bd"/><stop offset=".6" stop-color="#12419b"/><stop offset="1" stop-color="#0a2d74"/></linearGradient>`;

/* İzometrik kutu */
const C30 = 0.866;
const prj = (ox, oy) => (X, Y, Z) => [ox + (X - Y) * C30, oy + (X + Y) * 0.5 - Z];
const pts = (a) => a.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
function isoBox(P, { x = 0, y = 0, z = 0, w, d, h, p, round = 5, edge = 0.55 }) {
  const T = [P(x, y, z + h), P(x + w, y, z + h), P(x + w, y + d, z + h), P(x, y + d, z + h)];
  const L = [P(x, y + d, z), P(x + w, y + d, z), P(x + w, y + d, z + h), P(x, y + d, z + h)];
  const R = [P(x + w, y, z), P(x + w, y + d, z), P(x + w, y + d, z + h), P(x + w, y, z + h)];
  const sw = `stroke-width="${round}" stroke-linejoin="round"`;
  return `<polygon points="${pts(L)}" fill="url(#${p}left)" stroke="#2466c8" ${sw}/>
    <polygon points="${pts(R)}" fill="url(#${p}right)" stroke="#123f96" ${sw}/>
    <polygon points="${pts(T)}" fill="url(#${p}top)" stroke="#b6e3fd" ${sw}/>
    <polyline points="${pts([L[3], L[2], T[1]])}" fill="none" stroke="#fff" stroke-opacity="${edge}" stroke-width="2.5" stroke-linejoin="round"/>
    <line x1="${L[2][0]}" y1="${L[2][1]}" x2="${L[1][0]}" y2="${L[1][1]}" stroke="#bfe6ff" stroke-opacity=".55" stroke-width="2"/>`;
}
/* Sol yüz (Y=y+d) düzlemine yerel koordinatla yazı/şekil yerleştirme */
const onLeft = (P, { x, y, z, d, h }, inner) => {
  const [e, f] = P(x, y + d, z + h);
  return `<g transform="matrix(${C30},0.5,0,1,${e.toFixed(1)},${f.toFixed(1)})">${inner}</g>`;
};
const onRight = (P, { x, y, z, w, d, h }, inner) => {
  const [e, f] = P(x + w, y + d, z + h);
  return `<g transform="matrix(${C30},-0.5,0,1,${e.toFixed(1)},${f.toFixed(1)})">${inner}</g>`;
};

/* Uygulama ikonu kabarcığı */
const appIcon = (ic, s = 96, tone = 0, extra = "") => {
  const g = [
    ["#5fb2f6", "#2c74d8", "#12419b"],
    ["#9fdcff", "#44a1f1", "#2a6aca"],
    ["#3d7fe0", "#12419b", "#011f63"],
  ][tone];
  return `<div style="width:${s}px;height:${s}px;border-radius:${s * 0.28}px;background:linear-gradient(145deg,${g[0]} 0%,${g[1]} 52%,${g[2]} 100%);display:grid;place-items:center;position:relative;box-shadow:inset 0 2px 0 rgb(255 255 255/.45),inset 0 -6px 14px rgb(1 20 65/.25),0 ${s * 0.28}px ${s * 0.4}px -${s * 0.18}px rgb(1 32 100/.55);${extra}">
    <div style="position:absolute;left:8%;right:8%;top:5%;height:42%;border-radius:${s * 0.24}px ${s * 0.24}px 50% 50%;background:linear-gradient(180deg,rgb(255 255 255/.42),rgb(255 255 255/0))"></div>
    ${icon(ic, { size: s * 0.46, stroke: 2.1, color: "#fff", style: "position:relative;filter:drop-shadow(0 2px 3px rgb(1 20 65/.3))" })}</div>`;
};

/* ======================================================================
   1) DİJİTAL REKLAM YÖNETİMİ: megafon + ağzından yükselen grafik
   ====================================================================== */
function megaphoneSvg(w = 900) {
  const P = prj(640, 560);
  const barsIso = [
    { x: 0, y: 0, h: 130 },
    { x: 78, y: -78, h: 215 },
    { x: 156, y: -156, h: 310 },
  ]
    .map((b) => isoBox(P, { x: b.x, y: b.y, z: 0, w: 60, d: 60, h: b.h, p: "mg" }))
    .join("");
  return `<svg width="${w}" height="${w * 0.9}" viewBox="0 0 1000 900" style="overflow:visible">
  <defs>${mat("mg")}
    <linearGradient id="mgBody" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#bfe8ff"/><stop offset=".16" stop-color="#5aaaf3"/><stop offset=".48" stop-color="#2c74d8"/><stop offset=".8" stop-color="#14449f"/><stop offset="1" stop-color="#0a2c72"/></linearGradient>
    <linearGradient id="mgRim" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e8f8ff"/><stop offset=".4" stop-color="#6cbaf6"/><stop offset="1" stop-color="#12419b"/></linearGradient>
    <radialGradient id="mgIn" cx=".38" cy=".45" r=".7"><stop offset="0" stop-color="#2f6fd0"/><stop offset=".6" stop-color="#103a8e"/><stop offset="1" stop-color="#06205c"/></radialGradient>
    <linearGradient id="mgGrip" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#0d3584"/><stop offset=".5" stop-color="#2c74d8"/><stop offset="1" stop-color="#0d3584"/></linearGradient>
    <linearGradient id="mgArrow" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#2c74d8"/><stop offset="1" stop-color="#8fd0ff"/></linearGradient>
    <filter id="mgBlur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="5"/></filter>
  </defs>
  <!-- grafik çubukları (megafonun önünden yükselir) -->
  <g transform="translate(-20,40)">${barsIso}</g>
  <!-- ok -->
  <g transform="translate(0,0)">
    <path d="M440,500 C560,450 650,400 740,290 L776,238" fill="none" stroke="#0a2c72" stroke-opacity=".18" stroke-width="34" stroke-linecap="round" transform="translate(8,14)" filter="url(#mgBlur)"/>
    <path d="M440,500 C560,450 650,400 740,290 L772,244" fill="none" stroke="url(#mgArrow)" stroke-width="30" stroke-linecap="round"/>
    <polygon points="826,160 742,206 812,258" fill="#8fd0ff" stroke="#8fd0ff" stroke-width="14" stroke-linejoin="round"/>
    <path d="M452,490 C562,442 645,396 728,296" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="6" stroke-linecap="round"/>
  </g>
  <!-- megafon (yatay kurulup döndürülür) -->
  <g transform="rotate(-24 330 600)">
    <ellipse cx="330" cy="770" rx="250" ry="34" fill="#011441" opacity=".0"/>
    <rect x="96" y="548" width="78" height="104" rx="14" fill="url(#mgGrip)"/>
    <ellipse cx="96" cy="600" rx="18" ry="52" fill="#0d3584"/>
    <ellipse cx="94" cy="600" rx="10" ry="34" fill="#2c74d8"/>
    <path d="M170,520 L520,384 L520,816 L170,680 Z" fill="url(#mgBody)"/>
    <path d="M182,536 L508,410 L510,446 L184,560 Z" fill="#fff" opacity=".42" filter="url(#mgBlur)"/>
    <path d="M170,520 L196,510 L196,690 L170,680 Z" fill="#0d3584" opacity=".55"/>
    <rect x="232" y="660" width="70" height="190" rx="30" fill="url(#mgGrip)"/>
    <rect x="246" y="672" width="12" height="160" rx="6" fill="#fff" opacity=".25"/>
    <ellipse cx="520" cy="600" rx="78" ry="218" fill="url(#mgRim)"/>
    <ellipse cx="528" cy="600" rx="60" ry="192" fill="url(#mgIn)"/>
    <ellipse cx="506" cy="520" rx="10" ry="70" fill="#fff" opacity=".5" filter="url(#mgBlur)"/>
  </g>
  </svg>`;
}

const adsPanel = () => {
  const rows = [
    ["Arama · Hizmet aramaları", "Google Ads", "Arama", "₺14.820", "486", "6,1x", true],
    ["Performance Max · Ürünler", "Google Ads", "PMax", "₺12.460", "392", "5,8x", true],
    ["Yeni sezon · Dönüşüm", "Meta", "Sosyal", "₺9.740", "251", "4,6x", true],
    ["Sepeti terk edenler", "Meta", "Remarketing", "₺5.180", "118", "7,2x", true],
    ["Tanıtım videosu", "TikTok", "Video", "₺6.050", "37", "1,9x", false],
  ];
  const kp = (l, v, d, good = true) => `<div style="flex:1;padding:14px 16px;border-radius:14px;background:#f4f7fc">
      <div style="font-size:13px;color:#7f8aa3">${l}</div>
      <div style="font-size:25px;font-weight:600;letter-spacing:-.03em;margin-top:2px">${v}</div>
      <div class="row" style="gap:4px;font-size:12.5px;font-weight:600;color:${good ? "#12873f" : "#c9363b"};margin-top:2px">${icon(d.startsWith("−") ? "trending-down" : "trending-up", { size: 13, stroke: 2.4 })}${d}</div></div>`;
  return `<div style="width:760px;padding:26px 28px;border-radius:26px;background:#fff;box-shadow:0 0 0 1px rgb(1 20 65/.04),0 40px 80px -40px rgb(1 20 65/.45),0 12px 28px -18px rgb(1 20 65/.2);color:#0c1a3a;font-variant-numeric:tabular-nums">
    <div class="row" style="gap:14px">
      <span style="width:44px;height:44px;border-radius:13px;background:#eaf2ff;display:grid;place-items:center">${icon("megaphone", { size: 22, color: "#12419b", stroke: 2 })}</span>
      <div><div style="font-size:22px;font-weight:600;letter-spacing:-.02em">Kampanyalar</div><div style="font-size:13.5px;color:#7f8aa3">Tüm hesaplar · son 30 gün</div></div>
      <span class="row" style="margin-left:auto;gap:8px;height:36px;padding:0 14px;border-radius:11px;background:#f4f7fc;font-size:13.5px;font-weight:500;color:#3b4763">${icon("calendar", { size: 15, stroke: 2 })}14 Eyl – 13 Eki</span>
    </div>
    <div class="row" style="gap:12px;margin-top:20px">${kp("Harcama", "₺48.250", "+%6")}${kp("Dönüşüm", "1.284", "+%38")}${kp("Dönüşüm başı maliyet", "₺37,58", "−%23")}${kp("ROAS", "5,2x", "+%31")}</div>
    <div style="margin-top:18px;padding:16px 18px 12px;border-radius:16px;background:linear-gradient(180deg,#f7faff,#fff);box-shadow:inset 0 0 0 1px #edf2fa">
      <div class="row" style="font-size:13.5px;color:#7f8aa3;gap:16px"><span style="font-weight:600;color:#0c1a3a;font-size:15px">Günlük dönüşüm</span><span class="row" style="gap:6px;margin-left:auto"><span style="width:16px;height:3px;border-radius:2px;background:#2a6aca"></span>Bu dönem</span><span class="row" style="gap:6px"><span style="width:16px;height:3px;border-radius:2px;background:#b9c7e0"></span>Önceki dönem</span></div>
      <div style="margin-top:12px">${line([[22, 26, 25, 31, 29, 34, 38, 36, 41, 45, 43, 49, 52, 55], [20, 22, 21, 24, 23, 25, 27, 26, 28, 29, 28, 31, 30, 32]], { w: 656, h: 96, min: 10, max: 60 })}</div>
    </div>
    <div style="margin-top:16px">
      <div class="row" style="font-size:12px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:#8a95ad;padding:0 6px 8px">
        <span style="width:280px">Kampanya</span><span style="width:110px">Kanal</span><span style="width:110px;text-align:right">Harcama</span><span style="width:100px;text-align:right">Dönüşüm</span><span style="flex:1;text-align:right">ROAS</span></div>
      ${rows
        .map(
          ([n, ch, t, sp, cv, ro, on], i) => `<div class="row" style="height:50px;padding:0 6px;border-radius:12px;${i === 0 ? "background:#f2f7ff" : ""};font-size:15px">
          <span class="row" style="width:280px;gap:12px;min-width:0"><span style="width:34px;height:20px;border-radius:999px;background:${on ? "#2a6aca" : "#d5dbe6"};position:relative;flex-shrink:0"><span style="position:absolute;top:3px;${on ? "right:3px" : "left:3px"};width:14px;height:14px;border-radius:50%;background:#fff"></span></span><span style="min-width:0"><span style="display:block;font-weight:500;white-space:nowrap">${n}</span><span style="display:block;font-size:12px;color:#8a95ad">${t}</span></span></span>
          <span style="width:110px">${tag(ch, ch === "Google Ads" ? "blue" : ch === "Meta" ? "violet" : "gray")}</span>
          <span style="width:110px;text-align:right;color:#3b4763">${sp}</span>
          <span style="width:100px;text-align:right;font-weight:600">${cv}</span>
          <span style="flex:1;text-align:right;font-weight:600;color:${parseFloat(ro.replace(",", ".")) >= 4 ? "#12873f" : "#b45f06"}">${ro}</span></div>`,
        )
        .join("")}
    </div>
  </div>`;
};

const reklam = {
  slug: "dijital-reklam-yonetimi",
  card: card(`
    ${glowL(0, 120, 820, 800)}
    ${shadow(80, 760, 600, 90, 0.26)}
    ${at(-10, 110, megaphoneSvg(800))}
    ${at(790, 130, adsPanel())}`),
  poster: poster(
    `${glowL(-120, 600, 900, 900)}
     ${shadow(20, 1330, 760, 120, 0.3)}
     ${at(-170, 420, megaphoneSvg(1150))}
     <div class="gl" style="position:absolute;left:64px;top:330px;padding:20px 26px 20px 22px">
       <div class="row" style="gap:12px"><span style="width:44px;height:44px;border-radius:13px;background:#e6f6ec;display:grid;place-items:center">${icon("trending-up", { size: 22, color: "#12873f", stroke: 2.2 })}</span><div><div style="font-size:14px;color:#7f8aa3">Reklam getirisi (ROAS)</div><div style="font-size:30px;font-weight:600;letter-spacing:-.03em;color:#0c1a3a;line-height:1.1">5,2x <span style="font-size:15px;font-weight:600;color:#12873f">+%31</span></div></div></div>
     </div>`,
    { lines: ["Dijital", "Reklam"], sub: "Yönetimi Hizmetleri", desc: "Google, Meta ve TikTok kampanyalarınızı dönüşüm takibiyle kuran, bütçenizi sonuca göre yöneten reklam hizmetleri." },
  ),
};

/* ======================================================================
   2) WEB TASARIM: kurumsal site (dizüstü + telefon) ve katman katman açılan sayfa
   ====================================================================== */
/* Mimari çizim görseli (stok fotoğraf yerine) */
function archImg(w, h, v = 0) {
  const sky = [["#d9f2ff", "#9fd3fa"], ["#e9f5ff", "#bfe2fb"], ["#cfeaff", "#7fbdf2"]][v % 3];
  const id = `ar${v}${w}`;
  const blocks = [
    [[0.06, 0.42, 0.28, 0.58], [0.3, 0.22, 0.24, 0.78], [0.52, 0.5, 0.2, 0.5], [0.7, 0.3, 0.26, 0.7]],
    [[0.1, 0.34, 0.38, 0.66], [0.46, 0.18, 0.22, 0.82], [0.66, 0.46, 0.3, 0.54]],
    [[0.04, 0.5, 0.3, 0.5], [0.3, 0.3, 0.3, 0.7], [0.58, 0.4, 0.36, 0.6]],
  ][v % 3];
  const b = blocks
    .map(([x, y, bw, bh], i) => {
      const X = x * w, Y = y * h, W = bw * w, H = bh * h;
      const c = ["#12419b", "#2a6aca", "#0b2e7c", "#2c74d8"][i % 4];
      let win = "";
      const cols = Math.max(2, Math.round(W / 22)), rows = Math.max(3, Math.round(H / 26));
      for (let r = 0; r < rows; r++) for (let k = 0; k < cols; k++) win += `<rect x="${(X + 6 + k * ((W - 12) / cols)).toFixed(1)}" y="${(Y + 10 + r * ((H - 14) / rows)).toFixed(1)}" width="${((W - 12) / cols - 5).toFixed(1)}" height="${((H - 14) / rows - 7).toFixed(1)}" rx="1.5" fill="#cfeeff" opacity="${(0.35 + ((r * 7 + k * 3 + i) % 5) * 0.12).toFixed(2)}"/>`;
      return `<rect x="${X}" y="${Y}" width="${W}" height="${H}" fill="${c}"/><rect x="${X}" y="${Y}" width="${W * 0.18}" height="${H}" fill="#fff" opacity=".08"/>${win}`;
    })
    .join("");
  return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid slice" style="display:block"><defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${sky[0]}"/><stop offset="1" stop-color="${sky[1]}"/></linearGradient></defs><rect width="${w}" height="${h}" fill="url(#${id})"/><circle cx="${w * 0.8}" cy="${h * 0.2}" r="${h * 0.09}" fill="#fff" opacity=".8"/>${b}<rect y="${h * 0.94}" width="${w}" height="${h * 0.06}" fill="#011441" opacity=".85"/></svg>`;
}
const atlasWord = (s = 22, c = "#011441") => `<span class="row" style="gap:${s * 0.4}px;font-size:${s}px;font-weight:600;letter-spacing:.16em;color:${c}"><span style="width:${s * 1.1}px;height:${s * 1.1}px;border-radius:${s * 0.3}px;background:#12419b;display:grid;place-items:center;color:#fff;font-size:${s * 0.62}px;letter-spacing:0">A</span>ATLAS<span style="font-weight:300;letter-spacing:.12em">MİMARLIK</span></span>`;

function siteDesktop() {
  return `<div style="width:1440px;height:900px;background:#fff;font-family:Outfit;color:#0c1a3a;overflow:hidden">
    <div class="row" style="height:92px;padding:0 72px">${atlasWord(22)}
      <span class="row" style="gap:40px;margin-left:auto;font-size:17px;color:#3b4763"><span>Projeler</span><span>Hizmetler</span><span>Hakkımızda</span><span>Blog</span><span>İletişim</span></span>
      <span class="btn pri" style="margin-left:40px;height:48px;padding:0 24px;font-size:16px">Teklif Al${icon("arrow-up-right", { size: 18 })}</span></div>
    <div class="row" style="padding:30px 72px 0;gap:56px;align-items:stretch">
      <div style="width:560px;padding-top:40px">
        <span class="tag" style="background:#eaf2ff;color:#12419b;font-size:14px;padding:6px 14px">2008'den bu yana · 140+ proje</span>
        <div style="font-size:66px;line-height:1.04;font-weight:600;letter-spacing:-.035em;margin-top:22px">Yaşam alanlarını birlikte tasarlayalım</div>
        <div style="font-size:20px;line-height:1.5;color:#55617b;margin-top:22px">Konut, ofis ve otel projelerinde fikir aşamasından anahtar teslimine kadar yanınızdayız.</div>
        <div class="row" style="gap:14px;margin-top:34px"><span class="btn pri" style="height:56px;padding:0 28px;font-size:17px">Projeleri incele</span><span class="btn sec" style="height:56px;padding:0 26px;font-size:17px">${icon("phone", { size: 18 })}Bizi arayın</span></div>
        <div class="row" style="gap:40px;margin-top:46px">${[["140+", "Tamamlanan proje"], ["18", "Yıllık deneyim"], ["%96", "Müşteri memnuniyeti"]].map(([a, b]) => `<div><div style="font-size:34px;font-weight:600;letter-spacing:-.03em;color:#12419b">${a}</div><div style="font-size:15px;color:#7f8aa3">${b}</div></div>`).join("")}</div>
      </div>
      <div style="flex:1;border-radius:28px;overflow:hidden;position:relative;height:640px">${archImg(752, 640, 0)}
        <div style="position:absolute;left:26px;bottom:26px;padding:16px 20px;border-radius:18px;background:rgb(255 255 255/.92);width:300px"><div style="font-size:13px;color:#7f8aa3">Son proje</div><div style="font-size:19px;font-weight:600;margin-top:2px">Kadıköy Rezidans</div><div style="font-size:14px;color:#55617b;margin-top:2px">42 daire · 2025</div></div></div>
    </div></div>`;
}
function siteMobile() {
  return `<div style="width:390px;height:844px;background:#fff;font-family:Outfit;color:#0c1a3a;overflow:hidden">
    ${statusBar()}
    <div class="row" style="padding:6px 22px 14px">${atlasWord(15)}<span style="margin-left:auto">${icon("menu", { size: 24 })}</span></div>
    <div style="margin:0 16px;border-radius:22px;overflow:hidden;height:250px">${archImg(358, 250, 1)}</div>
    <div style="padding:22px 22px 0">
      <div style="font-size:31px;line-height:1.08;font-weight:600;letter-spacing:-.03em">Yaşam alanlarını birlikte tasarlayalım</div>
      <div style="font-size:15px;line-height:1.5;color:#55617b;margin-top:12px">Fikir aşamasından anahtar teslimine kadar yanınızdayız.</div>
      <div class="btn pri" style="margin-top:20px;width:100%;justify-content:center;height:52px;font-size:16px">Teklif Al${icon("arrow-up-right", { size: 18 })}</div>
      <div style="font-size:13px;font-weight:600;letter-spacing:.08em;color:#8a95ad;margin-top:26px">PROJELER</div>
      <div class="row" style="gap:12px;margin-top:12px">${[2, 0].map((v) => `<div style="flex:1;border-radius:16px;overflow:hidden;height:120px">${archImg(170, 120, v)}</div>`).join("")}</div>
    </div></div>`;
}

/* Katmanlar: tel kafes → bloklar → bitmiş sayfa (CSS 3B) */
function layerStack(scale = 1) {
  const W = 620, H = 430;
  const wire = `<div style="position:absolute;inset:0;border-radius:22px;background:rgb(255 255 255/.55);box-shadow:inset 0 0 0 2px #9cc4f2;padding:26px">
      ${[[0, 0, 568, 34], [0, 58, 270, 190], [292, 58, 276, 190], [0, 272, 176, 106], [196, 272, 176, 106], [392, 272, 176, 106]].map(([x, y, w, h]) => `<div style="position:absolute;left:${26 + x}px;top:${26 + y}px;width:${w}px;height:${h}px;border-radius:10px;border:2px dashed #8ab8ee"></div>`).join("")}</div>`;
  const blocks = `<div style="position:absolute;inset:0;border-radius:22px;background:linear-gradient(140deg,rgb(206 240 254/.75),rgb(68 161 241/.45));box-shadow:inset 0 0 0 1.5px rgb(255 255 255/.8),0 30px 50px -20px rgb(18 65 155/.45);padding:26px">
      ${[[0, 0, 568, 34, "#2c74d8"], [0, 58, 270, 190, "#12419b"], [292, 58, 276, 190, "#44a1f1"], [0, 272, 176, 106, "#2a6aca"], [196, 272, 176, 106, "#2a6aca"], [392, 272, 176, 106, "#2a6aca"]].map(([x, y, w, h, c]) => `<div style="position:absolute;left:${26 + x}px;top:${26 + y}px;width:${w}px;height:${h}px;border-radius:10px;background:${c};opacity:.85"></div>`).join("")}</div>`;
  const fin = `<div style="position:absolute;inset:0;border-radius:22px;background:#fff;overflow:hidden;box-shadow:0 0 0 1px rgb(1 20 65/.05),0 40px 60px -24px rgb(1 20 65/.5)">
      <div class="row" style="height:58px;padding:0 26px">${atlasWord(14)}<span class="row" style="gap:16px;margin-left:auto;font-size:11px;color:#55617b"><span>Projeler</span><span>Hizmetler</span><span>İletişim</span></span><span class="btn pri" style="margin-left:16px;height:28px;padding:0 12px;font-size:11px;border-radius:8px">Teklif Al</span></div>
      <div class="row" style="padding:4px 26px 0;gap:22px;align-items:stretch">
        <div style="width:270px"><div style="font-size:30px;line-height:1.05;font-weight:600;letter-spacing:-.03em;margin-top:18px">Yaşam alanlarını birlikte tasarlayalım</div><div style="font-size:12px;color:#55617b;margin-top:10px;line-height:1.45">Fikir aşamasından anahtar teslimine kadar yanınızdayız.</div><span class="btn pri" style="margin-top:14px;height:30px;padding:0 14px;font-size:11.5px;border-radius:8px">Projeleri incele</span></div>
        <div style="flex:1;border-radius:14px;overflow:hidden;height:190px">${archImg(276, 190, 0)}</div></div>
      <div class="row" style="gap:20px;padding:20px 26px 0">${[2, 1, 0].map((v) => `<div style="flex:1;border-radius:12px;overflow:hidden;height:110px">${archImg(176, 110, v)}</div>`).join("")}</div></div>`;
  const L = (z, html) => `<div style="position:absolute;left:0;top:0;width:${W}px;height:${H}px;transform:translateZ(${z}px);transform-style:preserve-3d">${html}</div>`;
  return `<div style="width:${W}px;height:${H}px;transform:scale(${scale}) rotateX(56deg) rotateZ(-36deg);transform-style:preserve-3d;transform-origin:50% 50%">
     <div style="position:absolute;left:30px;top:40px;width:${W}px;height:${H}px;border-radius:22px;background:rgb(1 20 65/.28);filter:blur(26px)"></div>
     ${L(0, wire)}${L(130, blocks)}${L(270, fin)}</div>`;
}

const web = {
  slug: "web-tasarim",
  card: card(`
    ${glowL(100, 160, 1100, 760, "rgb(68 161 241/.2)")}
    ${shadow(90, 820, 1120, 70, 0.3)}
    ${at(110, 128, macbook(siteDesktop(), { width: 1040 }))}
    ${shadow(1210, 828, 320, 40, 0.32)}
    ${at(1228, 262, iphone(siteMobile(), { width: 290, style: "filter:drop-shadow(0 30px 34px rgb(1 20 65/.35))" }))}
    <div class="gl" style="position:absolute;left:1218px;top:84px;width:310px;padding:18px 20px">
      <div class="row" style="gap:14px">${ring(98, { d: 64, thick: 8, color: "#12a150", track: "#e3f3e8" })}<div><div style="font-size:13.5px;color:#7f8aa3">Performans puanı</div><div style="font-size:28px;font-weight:600;letter-spacing:-.03em;line-height:1.1">98<span style="font-size:15px;color:#7f8aa3;font-weight:500"> / 100</span></div></div></div>
      <div class="row" style="gap:6px;margin-top:12px">${tag("Mobil uyumlu", "blue")}${tag("SSL", "green")}${tag("0,9 sn", "gray")}</div>
    </div>`),
  poster: poster(
    `${glowL(-100, 620, 1000, 860)}
     <div style="position:absolute;left:200px;top:900px">${layerStack(1.12)}</div>
     ${at(84, 120, iphone(siteMobile(), { width: 250, style: "transform:rotate(-7deg);filter:drop-shadow(0 36px 34px rgb(1 20 65/.3))" }))}`,
    { lines: ["Web", "Tasarım"], desc: "Mobil uyumlu, hızlı açılan ve arama motorlarına hazır kurumsal web siteleri ve açılış sayfaları." },
  ),
};

/* ======================================================================
   3) SEO: büyüteç içinde yükselen sıralama
   ====================================================================== */
function magnifierSvg(w = 760) {
  const cx = 470, cy = 330, r = 228;
  const barsIn = [70, 120, 182, 252]
    .map((h, i) => `<rect x="${330 + i * 74}" y="${478 - h}" width="50" height="${h + 40}" rx="12" fill="url(#mfBar)"/><rect x="${336 + i * 74}" y="${484 - h}" width="10" height="${h}" rx="5" fill="#fff" opacity=".35"/>`)
    .join("");
  return `<svg width="${w}" height="${w}" viewBox="0 0 800 800" style="overflow:visible">
  <defs>
    <linearGradient id="mfRing" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e3f6ff"/><stop offset=".28" stop-color="#6cbaf6"/><stop offset=".6" stop-color="#2a6aca"/><stop offset="1" stop-color="#0b2e7c"/></linearGradient>
    <linearGradient id="mfHandle" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2c74d8"/><stop offset=".5" stop-color="#12419b"/><stop offset="1" stop-color="#011f63"/></linearGradient>
    <radialGradient id="mfGlass" cx=".35" cy=".3" r=".85"><stop offset="0" stop-color="#ffffff" stop-opacity=".85"/><stop offset=".55" stop-color="#dff4ff" stop-opacity=".55"/><stop offset="1" stop-color="#8fd0ff" stop-opacity=".55"/></radialGradient>
    <linearGradient id="mfBar" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5fb2f6"/><stop offset="1" stop-color="#12419b"/></linearGradient>
    <clipPath id="mfClip"><circle cx="${cx}" cy="${cy}" r="${r - 22}"/></clipPath>
    <filter id="mfB" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="4"/></filter>
  </defs>
  <!-- sap -->
  <g transform="rotate(45 ${cx} ${cy})">
    <rect x="${cx - 36}" y="${cy + r + 6}" width="72" height="60" rx="14" fill="url(#mfRing)"/>
    <rect x="${cx - 52}" y="${cy + r + 58}" width="104" height="300" rx="50" fill="url(#mfHandle)"/>
    <rect x="${cx - 34}" y="${cy + r + 78}" width="16" height="250" rx="8" fill="#fff" opacity=".28"/>
  </g>
  <circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#mfGlass)"/>
  <g clip-path="url(#mfClip)">
    <rect x="240" y="100" width="460" height="460" fill="#eaf6ff" opacity=".5"/>
    ${[200, 270, 340, 410, 480].map((y) => `<line x1="240" y1="${y}" x2="700" y2="${y}" stroke="#9cc4f2" stroke-opacity=".45" stroke-width="2" stroke-dasharray="6 8"/>`).join("")}
    ${barsIn}
    <path d="M318,420 L404,352 L470,378 L604,232" fill="none" stroke="#011f63" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/>
    <polygon points="636,196 584,212 624,252" fill="#011f63" stroke="#011f63" stroke-width="10" stroke-linejoin="round"/>
  </g>
  <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="url(#mfRing)" stroke-width="44"/>
  <circle cx="${cx}" cy="${cy}" r="${r + 20}" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="3"/>
  <circle cx="${cx}" cy="${cy}" r="${r - 22}" fill="none" stroke="#0b2e7c" stroke-opacity=".3" stroke-width="3"/>
  <path d="M${cx - 150},${cy - 70} A170,170 0 0 1 ${cx - 40},${cy - 168}" fill="none" stroke="#fff" stroke-opacity=".85" stroke-width="16" stroke-linecap="round" filter="url(#mfB)"/>
  <circle cx="${cx - 168}" cy="${cy - 20}" r="9" fill="#fff" opacity=".8"/>
  </svg>`;
}
const seoPanel = () => {
  const kw = [
    ["kurumsal web tasarım", 2, 12, "1,9B"],
    ["istanbul dijital ajans", 1, 8, "880"],
    ["google ads ajansı", 3, 15, "1,3B"],
    ["e-ticaret sitesi kurulumu", 4, 21, "720"],
    ["seo hizmeti fiyatları", 2, 9, "590"],
  ];
  return `<div style="width:760px;padding:26px 28px;border-radius:26px;background:#fff;box-shadow:0 0 0 1px rgb(1 20 65/.04),0 40px 80px -40px rgb(1 20 65/.45),0 12px 28px -18px rgb(1 20 65/.2);color:#0c1a3a;font-variant-numeric:tabular-nums">
    <div class="row" style="gap:14px"><span style="width:44px;height:44px;border-radius:13px;background:#eaf2ff;display:grid;place-items:center">${icon("search", { size: 22, color: "#12419b", stroke: 2.2 })}</span>
      <div><div style="font-size:22px;font-weight:600;letter-spacing:-.02em">Organik görünürlük</div><div style="font-size:13.5px;color:#7f8aa3">Son 12 ay · tüm sayfalar</div></div>
      <span class="tag" style="margin-left:auto;background:#e6f6ec;color:#12873f;font-size:13.5px;padding:6px 12px">${icon("trending-up", { size: 15, stroke: 2.4 })}Organik trafik +%142</span></div>
    <div class="row" style="gap:12px;margin-top:20px">${[["Aylık organik ziyaret", "18.420"], ["İlk 3'teki kelime", "64"], ["Ortalama pozisyon", "4,2"]].map(([l, v]) => `<div style="flex:1;padding:14px 16px;border-radius:14px;background:#f4f7fc"><div style="font-size:13px;color:#7f8aa3">${l}</div><div style="font-size:26px;font-weight:600;letter-spacing:-.03em;margin-top:2px">${v}</div></div>`).join("")}</div>
    <div style="margin-top:18px;padding:16px 18px 10px;border-radius:16px;background:linear-gradient(180deg,#f7faff,#fff);box-shadow:inset 0 0 0 1px #edf2fa">
      <div style="font-size:15px;font-weight:600">Organik trafik</div>
      <div style="margin-top:12px">${line([[5.1, 5.6, 6.2, 6.0, 7.4, 8.3, 9.1, 10.6, 12.2, 13.8, 16.1, 18.4]], { w: 656, h: 100, min: 3, max: 20, dash: [false], dots: [true], width: [3] })}</div>
      <div class="row" style="justify-content:space-between;font-size:12px;color:#8a95ad;margin-top:8px">${["Kas", "Ara", "Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki"].map((m) => `<span>${m}</span>`).join("")}</div>
    </div>
    <div style="margin-top:16px">
      <div class="row" style="font-size:12px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:#8a95ad;padding:0 8px 8px"><span style="flex:1">Anahtar kelime</span><span style="width:110px;text-align:right">Aylık arama</span><span style="width:110px;text-align:right">Pozisyon</span><span style="width:90px;text-align:right">Değişim</span></div>
      ${kw.map(([k, p, d, v], i) => `<div class="row" style="height:46px;padding:0 8px;border-radius:12px;${i === 1 ? "background:#f2f7ff" : ""};font-size:15.5px">
        <span class="row" style="flex:1;gap:10px">${icon("search", { size: 15, color: "#a0aac0", stroke: 2.2 })}${k}</span>
        <span style="width:110px;text-align:right;color:#55617b">${v}</span>
        <span style="width:110px;display:flex;justify-content:flex-end"><span style="min-width:34px;height:28px;border-radius:9px;background:${p === 1 ? "#12419b" : "#eaf2ff"};color:${p === 1 ? "#fff" : "#12419b"};display:grid;place-items:center;font-weight:600">${p}</span></span>
        <span class="row" style="width:90px;justify-content:flex-end;gap:3px;color:#12873f;font-weight:600">${icon("arrow-up", { size: 14, stroke: 2.6 })}${d}</span></div>`).join("")}
    </div></div>`;
};
const seo = {
  slug: "seo",
  card: card(`
    ${glowL(20, 120, 800, 780)}
    ${shadow(60, 800, 520, 90, 0.26)}
    ${at(-20, 90, magnifierSvg(800))}
    ${at(790, 120, seoPanel())}`),
  poster: poster(
    `${glowL(-120, 560, 1000, 900)}
     ${shadow(-60, 1360, 600, 100, 0.26)}
     ${at(-200, 380, magnifierSvg(1120))}
     <div class="gl" style="position:absolute;left:806px;top:1110px;width:320px;padding:18px 20px">
       <div style="font-size:14px;color:#7f8aa3">Anahtar kelime</div>
       <div class="row" style="gap:10px;margin-top:4px"><span style="font-size:20px;font-weight:600;color:#0c1a3a">kurumsal web tasarım</span></div>
       <div class="row" style="gap:10px;margin-top:12px"><span style="height:34px;padding:0 12px;border-radius:10px;background:#12419b;color:#fff;display:inline-flex;align-items:center;font-size:17px;font-weight:600">2. sıra</span><span class="row" style="gap:4px;color:#12873f;font-weight:600;font-size:16px">${icon("arrow-up", { size: 16, stroke: 2.6 })}12 basamak</span></div>
     </div>`,
    { lines: ["SEO"], size: 170, desc: "Teknik altyapıdan içerik planına, sitenizi aramalarda üst sıralara taşıyan arama motoru optimizasyonu." },
  ),
};

/* ======================================================================
   4) ÖZEL YAZILIM: kenetlenen modül küpü + kod editörü ve otomasyon akışı
   ====================================================================== */
function cubeSvg(w = 760) {
  /* 2x2x2 modül küpü; öndeki üst modül yerinden kalkmış, ön yüzünde </> */
  const u = 150, g = 12, lift = 190;
  const P = prj(400, 330);
  const cells = [];
  for (const k of [0, 1]) for (const i of [0, 1]) for (const j of [0, 1]) if (!(i === 1 && j === 1 && k === 1)) cells.push({ i, j, k });
  cells.sort((a, b) => a.k - b.k || a.i + a.j - (b.i + b.j));
  const box = (c, up = 0) => ({ x: c.i * (u + g), y: c.j * (u + g), z: c.k * (u + g) + up, w: u, d: u, h: u });
  const body = cells.map((c) => isoBox(P, { ...box(c), p: "cb", round: 6 })).join("");
  const lifted = box({ i: 1, j: 1, k: 1 }, lift);
  const glyph = `<text x="${u / 2}" y="${u / 2 + 26}" text-anchor="middle" font-family="Outfit" font-weight="700" font-size="74" fill="#fff" opacity=".95">&lt;/&gt;</text>`;
  const [sx, sy] = P(lifted.x + u / 2, lifted.y + u / 2, u + g);
  return `<svg width="${w}" height="${(w * 880) / 600}" viewBox="100 -230 600 880" style="overflow:visible"><defs>${mat("cb")}
      <radialGradient id="cbGlow" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#44a1f1" stop-opacity=".55"/><stop offset="1" stop-color="#44a1f1" stop-opacity="0"/></radialGradient></defs>
    ${body}
    <ellipse cx="${sx}" cy="${sy}" rx="150" ry="80" fill="url(#cbGlow)"/>
    ${(() => { const c = box({ i: 1, j: 1, k: 1 }); const q = (X, Y, Z) => P(X, Y, Z); const e = [[q(c.x, c.y + u, c.z + u), q(c.x + u, c.y + u, c.z + u)], [q(c.x + u, c.y + u, c.z + u), q(c.x + u, c.y, c.z + u)], [q(c.x, c.y + u, c.z), q(c.x, c.y + u, c.z + u)], [q(c.x + u, c.y + u, c.z), q(c.x + u, c.y + u, c.z + u)], [q(c.x + u, c.y, c.z), q(c.x + u, c.y, c.z + u)]]; return e.map(([[a, b], [d, f]]) => `<line x1="${a}" y1="${b}" x2="${d}" y2="${f}" stroke="#2a6aca" stroke-width="2.5" stroke-dasharray="7 7" stroke-opacity=".7"/>`).join(""); })()}
    ${isoBox(P, { ...lifted, p: "cb", round: 6, edge: 0.8 })}
    ${onLeft(P, lifted, glyph)}
    ${onRight(P, lifted, `<g transform="translate(${u / 2 - 28},${u / 2 - 28})" opacity=".9">${iconPaths("braces", 56)}</g>`)}
  </svg>`;
}
/* lucide ikonu SVG içine gömülü yol olarak */
const iconPaths = (name, s, color = "#fff") => icon(name, { size: s, stroke: 2.2, color }).replace("<svg ", `<svg x="0" y="0" `);

const code = [
  [["c", "// Yeni sipariş geldiğinde stok, fatura ve bildirim akışı"]],
  [["k", "export async function "], ["f", "siparisOlustu"], ["p", "(siparis: "], ["t", "Siparis"], ["p", ") {"]],
  [["p", "  "], ["k", "const "], ["v", "stok"], ["p", " = "], ["k", "await "], ["v", "erp"], ["p", "."], ["f", "stokKontrol"], ["p", "(siparis.urunler);"]],
  [["p", "  "], ["k", "if "], ["p", "(!stok.yeterli) "], ["k", "return "], ["f", "tedarikciyeBildir"], ["p", "(stok.eksikler);"]],
  [],
  [["p", "  "], ["k", "const "], ["v", "fatura"], ["p", " = "], ["k", "await "], ["v", "eFatura"], ["p", "."], ["f", "kes"], ["p", "({"]],
  [["p", "    musteri: siparis.musteri,"]],
  [["p", "    tutar: siparis.toplam,"]],
  [["p", "    kdv: "], ["n", "0.20"], ["p", ","]],
  [["p", "  });"]],
  [],
  [["p", "  "], ["k", "await "], ["v", "crm"], ["p", "."], ["f", "aktiviteEkle"], ["p", "(siparis.musteri.id, "], ["s", "'Sipariş alındı'"], ["p", ");"]],
  [["p", "  "], ["k", "await "], ["v", "whatsapp"], ["p", "."], ["f", "gonder"], ["p", "(siparis.musteri.telefon, {"]],
  [["p", "    sablon: "], ["s", "'siparis_onay'"], ["p", ","]],
  [["p", "    degiskenler: [siparis.no, fatura.pdfUrl],"]],
  [["p", "  });"]],
  [["p", "  "], ["k", "return "], ["p", "{ durum: "], ["s", "'tamamlandi'"], ["p", ", fatura: fatura.no };"]],
  [["p", "}"]],
];
const COLS_CODE = { c: "#6f8bb8", k: "#7cc4ff", f: "#ffd479", p: "#dbe7ff", t: "#7ee0c3", v: "#c5b4ff", s: "#a5e3a0", n: "#ffab7a" };
const editor = (w = 900) => `<div style="width:${w}px;border-radius:22px;overflow:hidden;background:#0a1838;box-shadow:0 0 0 1px rgb(255 255 255/.06),0 50px 90px -40px rgb(1 20 65/.7),0 16px 30px -18px rgb(1 20 65/.4)">
    <div class="row" style="height:48px;padding:0 18px;gap:8px;background:#071230">${["#ff5f57", "#febc2e", "#28c840"].map((c) => `<span style="width:12px;height:12px;border-radius:50%;background:${c}"></span>`).join("")}
      <div class="row" style="margin-left:18px;gap:2px;font-size:13.5px">
        <span class="row" style="gap:8px;height:34px;padding:0 14px;border-radius:9px 9px 0 0;background:#0a1838;color:#dbe7ff">${icon("file-code", { size: 14, color: "#7cc4ff" })}siparis-akisi.ts</span>
        <span class="row" style="gap:8px;height:34px;padding:0 14px;color:#6f8bb8">${icon("file-braces", { size: 14, color: "#ffd479" })}api.json</span>
        <span class="row" style="gap:8px;height:34px;padding:0 14px;color:#6f8bb8">${icon("database", { size: 14, color: "#7ee0c3" })}sema.sql</span></div></div>
    <div class="mono" style="padding:22px 0 24px;font-size:17px;line-height:31px">
      ${code.map((ln, i) => `<div class="row" style="${i === 12 ? "background:rgb(124 196 255/.08);box-shadow:inset 3px 0 0 #44a1f1" : ""}"><span style="width:58px;text-align:right;padding-right:20px;color:#3d5582;flex-shrink:0">${i + 1}</span><span style="white-space:pre">${ln.map(([t, s]) => `<span style="color:${COLS_CODE[t]}">${s.replace(/</g, "&lt;")}</span>`).join("")}</span></div>`).join("")}
    </div>
    <div class="row mono" style="height:38px;padding:0 18px;gap:18px;background:#071230;font-size:12.5px;color:#6f8bb8"><span class="row" style="gap:6px;color:#7ee0c3">${icon("git-branch", { size: 13 })}main</span><span class="row" style="gap:6px">${icon("circle-check", { size: 13, color: "#7ee0c3" })}24 test geçti</span><span style="margin-left:auto">TypeScript · UTF-8</span></div>
  </div>`;
const flowCard = () => {
  const steps = [
    ["webhook", "Yeni sipariş geldi", "Web sitesi · #10482", "12 ms"],
    ["boxes", "Stok kontrolü", "ERP entegrasyonu", "86 ms"],
    ["receipt-text", "e-Fatura kesildi", "GİB uyumlu", "420 ms"],
    ["message-circle", "Müşteriye bildirim", "WhatsApp şablonu", "140 ms"],
  ];
  return `<div style="width:470px;padding:24px 24px 22px;border-radius:26px;background:#fff;box-shadow:0 0 0 1px rgb(1 20 65/.04),0 40px 80px -40px rgb(1 20 65/.45),0 12px 28px -18px rgb(1 20 65/.2);color:#0c1a3a">
    <div class="row" style="gap:12px"><span style="width:42px;height:42px;border-radius:12px;background:#eaf2ff;display:grid;place-items:center">${icon("workflow", { size: 21, color: "#12419b" })}</span><div><div style="font-size:20px;font-weight:600;letter-spacing:-.02em">Sipariş otomasyonu</div><div style="font-size:13px;color:#7f8aa3">Son çalışma · 2 dk önce</div></div>${tag("Aktif", "green", "margin-left:auto")}</div>
    <div style="margin-top:18px;display:grid;gap:0">
      ${steps.map(([ic, t, s, ms], i) => `<div class="row" style="gap:14px;position:relative;padding:10px 0">
        ${i < steps.length - 1 ? `<span style="position:absolute;left:23px;top:58px;width:2px;height:32px;background:repeating-linear-gradient(180deg,#9cc4f2 0 5px,transparent 5px 9px)"></span>` : ""}
        <span style="width:48px;height:48px;border-radius:14px;background:linear-gradient(145deg,#5fb2f6,#2c74d8 55%,#12419b);display:grid;place-items:center;box-shadow:inset 0 1px 0 rgb(255 255 255/.4),0 10px 18px -10px rgb(18 65 155/.8)">${icon(ic, { size: 22, color: "#fff" })}</span>
        <div style="min-width:0"><div style="font-size:16.5px;font-weight:600">${t}</div><div style="font-size:13.5px;color:#7f8aa3">${s}</div></div>
        <span class="row mono" style="margin-left:auto;gap:6px;font-size:12.5px;color:#12873f">${icon("circle-check", { size: 15, stroke: 2.4 })}${ms}</span></div>`).join("")}
    </div>
    <div class="row mono" style="margin-top:14px;gap:10px;padding:12px 14px;border-radius:14px;background:#f4f7fc;font-size:13px;color:#3b4763"><span style="padding:3px 8px;border-radius:7px;background:#12419b;color:#fff;font-weight:600">POST</span>/api/siparisler<span style="margin-left:auto;color:#12873f;font-weight:600">201 Created</span></div>
  </div>`;
};
const yazilim = {
  slug: "ozel-yazilim",
  card: card(`
    ${glowL(60, 100, 1000, 820)}
    ${at(64, 134, editor(930))}
    ${at(1050, 120, flowCard())}
    ${shadow(1150, 925, 300, 46, 0.26)}
    ${at(1172, 600, cubeSvg(250))}`),
  poster: poster(
    `${glowL(-120, 560, 1000, 900)}
     ${shadow(60, 1330, 700, 110, 0.3)}
     ${at(10, 360, cubeSvg(720))}`,
    { lines: ["Özel", "Yazılım"], desc: "İşinize özel web uygulamaları, yönetim panelleri ve entegrasyonlarla süreçlerinizi otomatikleştiren yazılımlar." },
  ),
};

/* ======================================================================
   5) MOBİL UYGULAMA: randevu uygulaması ekranları + yükselen uygulama ikonları
   ====================================================================== */
const appTab = (on) => `<div class="row" style="position:absolute;left:0;right:0;bottom:0;justify-content:space-around;padding:10px 12px 28px;background:#fff;box-shadow:0 -10px 30px -24px rgb(12 26 58/.4)">${[["house", "Ana sayfa"], ["calendar-days", "Randevular"], ["heart", "Favoriler"], ["user-round", "Profil"]].map(([ic, l], i) => `<div style="display:grid;justify-items:center;gap:4px;font-size:11.5px;font-weight:${i === on ? 600 : 500};color:${i === on ? "#12419b" : "#8a95ad"}">${icon(ic, { size: 22, stroke: i === on ? 2.2 : 1.9 })}${l}</div>`).join("")}</div>`;
function appHome() {
  return `<div style="width:390px;height:844px;background:#f3f6fb;font-family:Outfit;color:#0c1a3a;position:relative;overflow:hidden">
    <div style="background:linear-gradient(160deg,#2c74d8,#12419b 70%);padding-bottom:70px;border-radius:0 0 30px 30px">${statusBar("#fff")}
      <div class="row" style="padding:8px 22px 0;color:#fff"><div><div style="font-size:15px;opacity:.8">Günaydın,</div><div style="font-size:26px;font-weight:600;letter-spacing:-.02em">Zeynep Hanım</div></div>
        <span style="margin-left:auto;width:44px;height:44px;border-radius:14px;background:rgb(255 255 255/.16);display:grid;place-items:center;position:relative">${icon("bell", { size: 21, color: "#fff" })}<span style="position:absolute;top:10px;right:11px;width:9px;height:9px;border-radius:50%;background:#ffb547;box-shadow:0 0 0 2px #2366c9"></span></span></div>
      <div class="row" style="margin:18px 22px 0;height:48px;padding:0 16px;gap:10px;border-radius:14px;background:#fff;color:#a0aac0;font-size:15px">${icon("search", { size: 18 })}Hizmet veya uzman ara</div></div>
    <div style="margin:-48px 18px 0;padding:18px;border-radius:22px;background:#fff;box-shadow:0 20px 40px -24px rgb(1 20 65/.45)">
      <div class="row"><span style="font-size:13px;font-weight:600;letter-spacing:.06em;color:#2a6aca">YAKLAŞAN RANDEVU</span>${tag("Onaylandı", "green", "margin-left:auto")}</div>
      <div class="row" style="gap:12px;margin-top:12px">${av("EA", 46, 2)}<div><div style="font-size:17px;font-weight:600">Dr. Elif Arslan</div><div style="font-size:13.5px;color:#7f8aa3">Cilt bakımı · 45 dk</div></div></div>
      <div class="row" style="gap:10px;margin-top:14px">${[["calendar", "Per, 16 Eki"], ["clock", "14:30"]].map(([ic, t]) => `<span class="row" style="flex:1;gap:8px;height:42px;padding:0 12px;border-radius:12px;background:#f3f6fb;font-size:14.5px;font-weight:500">${icon(ic, { size: 17, color: "#2a6aca" })}${t}</span>`).join("")}</div></div>
    <div class="row" style="padding:22px 22px 10px"><span style="font-size:18px;font-weight:600">Hizmetler</span><span style="margin-left:auto;font-size:14px;color:#2a6aca;font-weight:500">Tümü</span></div>
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;padding:0 18px">${[["sparkles", "Bakım"], ["scissors", "Saç"], ["hand", "Masaj"], ["face-slightly-smiling", "Diş"]].map(([ic, l], i) => `<div style="display:grid;justify-items:center;gap:8px;padding:14px 0;border-radius:16px;background:#fff;font-size:13px;font-weight:500">${appIcon(ic, 46, i % 3)}${l}</div>`).join("")}</div>
    <div style="margin:16px 18px 0;padding:16px;border-radius:18px;background:#fff" class="row"><span style="width:46px;height:46px;border-radius:14px;background:#fff3dc;display:grid;place-items:center">${icon("gift", { size: 22, color: "#b45f06" })}</span><div style="margin-left:12px"><div style="font-size:15.5px;font-weight:600">İlk randevuya %15 indirim</div><div style="font-size:13px;color:#7f8aa3">Kod: HOSGELDIN</div></div></div>
    <div class="row" style="padding:20px 22px 10px"><span style="font-size:18px;font-weight:600">Popüler uzmanlar</span></div>
    <div class="row" style="gap:10px;padding:0 18px">${[["MK", "Merve Koç", "Saç tasarımı", 4], ["CY", "Can Yurt", "Masaj terapisti", 6]].map(([i, n, t, c]) => `<div class="row" style="flex:1;gap:10px;padding:12px;border-radius:16px;background:#fff">${av(i, 40, c)}<div style="min-width:0"><div style="font-size:14.5px;font-weight:600;white-space:nowrap">${n}</div><div style="font-size:12px;color:#7f8aa3;white-space:nowrap">${t}</div></div></div>`).join("")}</div>
    ${appTab(0)}</div>`;
}
function appBook() {
  const days = [["Pzt", 13], ["Sal", 14], ["Çar", 15], ["Per", 16], ["Cum", 17]];
  const slots = ["10:00", "11:30", "13:00", "14:30", "15:15", "16:00", "17:30", "18:15"];
  return `<div style="width:390px;height:844px;background:#fff;font-family:Outfit;color:#0c1a3a;position:relative;overflow:hidden">${statusBar()}
    <div class="row" style="padding:6px 20px 0;gap:12px"><span style="width:42px;height:42px;border-radius:13px;background:#f3f6fb;display:grid;place-items:center">${icon("chevron-left", { size: 22 })}</span><span style="font-size:19px;font-weight:600">Randevu al</span></div>
    <div class="row" style="gap:14px;margin:18px 20px 0;padding:16px;border-radius:20px;background:#f3f6fb">${av("EA", 56, 2)}<div><div style="font-size:18px;font-weight:600">Dr. Elif Arslan</div><div style="font-size:13.5px;color:#7f8aa3">Dermatoloji uzmanı</div><div class="row" style="gap:4px;margin-top:4px;font-size:13.5px;font-weight:600">${icon("star", { size: 14, color: "#f5a524", style: "fill:#f5a524" })}4,9 <span style="color:#8a95ad;font-weight:400">(312 yorum)</span></div></div></div>
    <div class="row" style="padding:22px 20px 12px"><span style="font-size:16px;font-weight:600">Ekim 2026</span><span style="margin-left:auto;color:#8a95ad" class="row">${icon("chevron-left", { size: 18 })}${icon("chevron-right", { size: 18 })}</span></div>
    <div class="row" style="gap:9px;padding:0 20px">${days.map(([d, n]) => `<div style="flex:1;padding:12px 0;border-radius:16px;text-align:center;${n === 16 ? "background:#12419b;color:#fff;box-shadow:0 12px 20px -12px rgb(18 65 155/.9)" : "background:#f3f6fb"}"><div style="font-size:12.5px;opacity:.75">${d}</div><div style="font-size:20px;font-weight:600;margin-top:2px">${n}</div></div>`).join("")}</div>
    <div style="padding:22px 20px 10px;font-size:16px;font-weight:600">Uygun saatler</div>
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:9px;padding:0 20px">${slots.map((s) => `<div style="height:44px;border-radius:12px;display:grid;place-items:center;font-size:15px;font-weight:500;${s === "14:30" ? "background:#eaf2ff;color:#12419b;box-shadow:inset 0 0 0 2px #2a6aca" : s === "11:30" || s === "17:30" ? "background:#f6f7f9;color:#c2c8d4;text-decoration:line-through" : "background:#f3f6fb"}">${s}</div>`).join("")}</div>
    <div style="display:grid;gap:10px;padding:20px 20px 0">${[["map-pin", "Moda Klinik", "Kadıköy, İstanbul", ""], ["bell-ring", "Hatırlatma", "Randevudan 1 saat önce", "on"]].map(([ic, t, d, sw]) => `<div class="row" style="gap:12px;padding:12px 14px;border-radius:16px;background:#f3f6fb"><span style="width:40px;height:40px;border-radius:12px;background:#fff;display:grid;place-items:center">${icon(ic, { size: 19, color: "#2a6aca" })}</span><div><div style="font-size:15px;font-weight:600">${t}</div><div style="font-size:12.5px;color:#7f8aa3">${d}</div></div>${sw ? `<span style="margin-left:auto;width:44px;height:26px;border-radius:999px;background:#2a6aca;position:relative"><span style="position:absolute;top:3px;right:3px;width:20px;height:20px;border-radius:50%;background:#fff"></span></span>` : `<span style="margin-left:auto;color:#a0aac0">${icon("chevron-right", { size: 18 })}</span>`}</div>`).join("")}</div>
    <div style="position:absolute;left:20px;right:20px;bottom:34px">
      <div class="row" style="font-size:14.5px;color:#7f8aa3;padding:0 4px 12px">Cilt bakımı · 45 dk<span style="margin-left:auto;font-size:19px;font-weight:600;color:#0c1a3a">₺1.250</span></div>
      <div class="btn pri" style="width:100%;justify-content:center;height:56px;font-size:17px;border-radius:16px">Randevuyu onayla</div></div></div>`;
}
const mobil = {
  slug: "mobil-uygulama",
  card: card(`
    ${glowL(330, 80, 940, 860)}
    ${shadow(470, 735, 330, 50, 0.3)}${shadow(860, 752, 310, 46, 0.26)}
    ${at(470, 96, iphone(appHome(), { width: 330, style: "filter:drop-shadow(0 34px 36px rgb(1 20 65/.32))" }))}
    ${at(860, 150, iphone(appBook(), { width: 310, style: "filter:drop-shadow(0 34px 36px rgb(1 20 65/.3))" }))}
    ${at(250, 170, appIcon("calendar-check", 112, 0, "transform:rotate(-8deg)"))}
    ${at(150, 420, appIcon("bell-ring", 92, 1, "transform:rotate(6deg)"))}
    ${at(290, 640, appIcon("credit-card", 104, 2, "transform:rotate(-4deg)"))}
    ${at(1250, 210, appIcon("map-pin", 96, 1, "transform:rotate(8deg)"))}
    ${at(1330, 470, appIcon("star", 112, 0, "transform:rotate(-6deg)"))}
    ${at(1240, 720, appIcon("message-circle", 90, 2, "transform:rotate(5deg)"))}
    <div class="row" style="position:absolute;left:668px;top:858px;gap:10px">${[["smartphone", "iOS"], ["tablet-smartphone", "Android"]].map(([ic, t]) => `<span class="row gl" style="gap:8px;height:44px;padding:0 16px;border-radius:999px;font-size:16px;font-weight:600;color:#12419b">${icon(ic, { size: 18 })}${t}</span>`).join("")}</div>`),
  poster: poster(
    `${glowL(-80, 560, 900, 900)}
     ${at(110, 610, iphone(appHome(), { width: 450, style: "transform:rotate(-9deg);filter:drop-shadow(0 50px 50px rgb(1 20 65/.35))" }))}
     ${at(80, 170, appIcon("calendar-check", 120, 0, "transform:rotate(-8deg)"))}
     ${at(310, 300, appIcon("bell-ring", 96, 1, "transform:rotate(7deg)"))}
     ${at(100, 400, appIcon("credit-card", 84, 2, "transform:rotate(-5deg)"))}
     ${at(470, 150, appIcon("star", 80, 1, "transform:rotate(9deg)"))}
     ${at(580, 760, appIcon("map-pin", 100, 0, "transform:rotate(8deg)"))}
     ${at(640, 1010, appIcon("message-circle", 88, 2, "transform:rotate(-6deg)"))}`,
    { lines: ["Mobil", "Uygulama"], desc: "iOS ve Android için tasarımdan mağaza yayınına kadar uçtan uca mobil uygulama geliştirme." },
  ),
};

/* ======================================================================
   6) E-TİCARET YÖNETİMİ: mağaza paneli + mobil mağaza; poster: kargo kutuları
   ====================================================================== */
function product(w, h, v = 0) {
  /* sade seramik kupa/vazo çizimi */
  const bgc = ["#eaf4ff", "#f1f5fb", "#e3f1fd", "#eef3fa"][v % 4];
  const body = [
    `<path d="M${w * 0.32},${h * 0.3} h${w * 0.36} v${h * 0.42} a${w * 0.06},${w * 0.06} 0 0 1 -${w * 0.06},${w * 0.06} h-${w * 0.24} a${w * 0.06},${w * 0.06} 0 0 1 -${w * 0.06},-${w * 0.06}z" fill="url(#pg${v}${w})"/><path d="M${w * 0.68},${h * 0.38} a${w * 0.1},${w * 0.1} 0 0 1 0,${w * 0.2}" fill="none" stroke="#2a6aca" stroke-width="${w * 0.04}"/>`,
    `<path d="M${w * 0.42},${h * 0.18} h${w * 0.16} v${h * 0.1} c${w * 0.22},${h * 0.08} ${w * 0.22},${h * 0.5} 0,${h * 0.56} h-${w * 0.16} c-${w * 0.22},-${h * 0.06} -${w * 0.22},-${h * 0.48} 0,-${h * 0.56}z" fill="url(#pg${v}${w})"/>`,
    `<rect x="${w * 0.22}" y="${h * 0.42}" width="${w * 0.56}" height="${h * 0.34}" rx="${w * 0.05}" fill="url(#pg${v}${w})"/><rect x="${w * 0.22}" y="${h * 0.36}" width="${w * 0.56}" height="${h * 0.1}" rx="${w * 0.04}" fill="#cfeeff"/>`,
    `<ellipse cx="${w * 0.5}" cy="${h * 0.52}" rx="${w * 0.24}" ry="${h * 0.26}" fill="url(#pg${v}${w})"/><rect x="${w * 0.44}" y="${h * 0.2}" width="${w * 0.12}" height="${h * 0.1}" rx="3" fill="#12419b"/>`,
  ][v % 4];
  return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" style="display:block"><defs><linearGradient id="pg${v}${w}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#2c74d8"/><stop offset=".35" stop-color="#6cbaf6"/><stop offset="1" stop-color="#12419b"/></linearGradient></defs><rect width="${w}" height="${h}" fill="${bgc}"/><ellipse cx="${w / 2}" cy="${h * 0.84}" rx="${w * 0.3}" ry="${h * 0.04}" fill="#011441" opacity=".12"/>${body}</svg>`;
}
function storeAdmin() {
  const orders = [
    ["#10482", "Ayşe Yılmaz", "Web sitesi", "₺1.249", ["Hazırlanıyor", "amber"]],
    ["#10481", "Mehmet Kaya", "Trendyol", "₺689", ["Kargoda", "blue"]],
    ["#10480", "Selin Aydın", "Hepsiburada", "₺2.340", ["Kargoda", "blue"]],
    ["#10479", "Can Öztürk", "Web sitesi", "₺449", ["Teslim edildi", "green"]],
    ["#10478", "Elif Demir", "Amazon", "₺1.890", ["Teslim edildi", "green"]],
    ["#10477", "Burak Şahin", "Trendyol", "₺975", ["Teslim edildi", "green"]],
    ["#10476", "Zeynep Arı", "Web sitesi", "₺3.120", ["İade talebi", "red"]],
    ["#10475", "Ozan Çelik", "Hepsiburada", "₺560", ["Teslim edildi", "green"]],
  ];
  const nav = [["layout-dashboard", "Genel bakış", true], ["shopping-bag", "Siparişler", false, 18], ["package", "Ürünler"], ["store", "Pazaryerleri"], ["users", "Müşteriler"], ["chart-column", "Raporlar"]];
  return `<div class="app">
    <aside class="side"><div class="brand" style="gap:12px"><span style="width:38px;height:38px;border-radius:11px;background:#12419b;display:grid;place-items:center">${icon("shopping-bag", { size: 20, color: "#fff" })}</span><span style="font-size:18px;font-weight:600;color:#0c1a3a;letter-spacing:-.01em">Mavi Ev</span></div>
      <nav class="nav">${nav.map(([ic, l, on, ct]) => `<div class="ni${on ? " on" : ""}">${icon(ic, { size: 19, stroke: on ? 2.2 : 1.9 })}<span>${l}</span>${ct ? `<span class="ct">${ct}</span>` : ""}</div>`).join("")}</nav>
      <div class="foot">${av("DK", 36, 5)}<div><div style="font-size:14px;font-weight:600">Deniz Koç</div><div style="font-size:12.5px;color:#7f8aa3">Mağaza yöneticisi</div></div></div></aside>
    <main class="main">
      <div class="top"><div><h1>Genel bakış</h1><div class="sub">Bugün · 13 Ekim 2026</div></div><div class="search" style="margin-left:auto">${icon("search", { size: 17 })}Sipariş, ürün ara</div><span class="btn pri">${icon("plus", { size: 17 })}Ürün ekle</span></div>
      <div class="row" style="gap:16px">${[["Bugünkü satış", "₺86.420", "+%18", "wallet"], ["Sipariş", "214", "+%12", "shopping-bag"], ["Sepet ortalaması", "₺404", "+%5", "shopping-cart"], ["Dönüşüm oranı", "%3,8", "+0,6", "mouse-pointer-click"]].map(([l, v, d, ic]) => `<div class="card" style="flex:1;padding:18px 20px"><div class="row"><span class="lbl" style="font-size:14px">${l}</span><span style="margin-left:auto;width:34px;height:34px;border-radius:10px;background:#eaf2ff;display:grid;place-items:center">${icon(ic, { size: 17, color: "#2a6aca" })}</span></div><div style="font-size:30px;font-weight:600;letter-spacing:-.03em;margin-top:4px">${v}</div><div class="row up" style="gap:4px;font-size:13px;font-weight:600;margin-top:4px">${icon("trending-up", { size: 14, stroke: 2.4 })}${d}<span style="color:#8a95ad;font-weight:400;margin-left:4px">dünden</span></div></div>`).join("")}</div>
      <div class="row" style="gap:16px;flex:1;min-height:0;align-items:stretch">
        <div class="card" style="flex:1.45;padding:20px 22px"><div class="row"><span class="h3" style="font-size:17px">Son siparişler</span><span style="margin-left:auto;font-size:14px;color:#2a6aca;font-weight:500">Tümünü gör</span></div>
          <div class="row" style="font-size:12px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:#8a95ad;padding:16px 8px 6px"><span style="width:84px">Sipariş</span><span style="flex:1">Müşteri</span><span style="width:118px">Kanal</span><span style="width:84px;text-align:right">Tutar</span><span style="width:136px;text-align:right">Durum</span></div>
          ${orders.map(([n, c, ch, t, [s, tone]], i) => `<div class="row" style="height:52px;padding:0 8px;border-radius:12px;font-size:15px;${i === 0 ? "background:#f2f7ff" : ""}"><span style="width:84px;font-weight:600;color:#12419b">${n}</span><span class="row" style="flex:1;gap:10px;white-space:nowrap;min-width:0">${av(c.split(" ").map((x) => x[0]).join(""), 30, i)}${c}</span><span style="width:118px;color:#55617b">${ch}</span><span style="width:84px;text-align:right;font-weight:600">${t}</span><span style="width:136px;display:flex;justify-content:flex-end">${tag(s, tone)}</span></div>`).join("")}</div>
        <div class="card" style="flex:1;padding:20px 22px"><div class="h3" style="font-size:17px">Kanallara göre satış</div><div class="lbl" style="margin-top:2px">Bu hafta</div>
          <div style="display:grid;gap:16px;margin-top:22px">${[["Web sitesi", 46, "#12419b"], ["Trendyol", 28, "#2a6aca"], ["Hepsiburada", 16, "#44a1f1"], ["Amazon", 10, "#9fd3fa"]].map(([l, p, c]) => `<div><div class="row" style="font-size:15px"><span>${l}</span><span style="margin-left:auto;font-weight:600">%${p}</span></div><div style="height:10px;border-radius:9px;background:#eef2f8;margin-top:8px"><div style="width:${p * 2}%;height:100%;border-radius:9px;background:${c}"></div></div></div>`).join("")}</div>
          <div class="row" style="gap:12px;margin-top:26px;padding:14px 16px;border-radius:14px;background:#f3f6fb;font-size:14.5px">${icon("package-check", { size: 20, color: "#12873f" })}<span>Stok senkronu: <b style="font-weight:600">4 kanal güncel</b></span></div>
          <div class="row" style="margin-top:22px"><span class="h3" style="font-size:16px">Haftalık ciro</span><span style="margin-left:auto;font-size:13px;color:#12873f;font-weight:600">+%22</span></div>
          <div style="margin-top:12px">${bars([48, 56, 52, 64, 71, 86, 79], { w: 400, h: 150, labels: ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"], hi: 5, fade: "#d6e6fb" })}</div></div>
      </div>
    </main></div>`;
}
function storeMobile() {
  return `<div style="width:390px;height:844px;background:#fff;font-family:Outfit;color:#0c1a3a;position:relative;overflow:hidden">${statusBar()}
    <div class="row" style="padding:4px 20px 0;gap:12px"><span style="width:42px;height:42px;border-radius:13px;background:#f3f6fb;display:grid;place-items:center">${icon("chevron-left", { size: 22 })}</span><span style="margin-left:auto;width:42px;height:42px;border-radius:13px;background:#f3f6fb;display:grid;place-items:center">${icon("heart", { size: 20 })}</span><span style="width:42px;height:42px;border-radius:13px;background:#f3f6fb;display:grid;place-items:center;position:relative">${icon("shopping-cart", { size: 20 })}<span style="position:absolute;top:-4px;right:-4px;min-width:20px;height:20px;border-radius:10px;background:#12419b;color:#fff;font-size:11px;font-weight:600;display:grid;place-items:center">2</span></span></div>
    <div style="margin:14px 20px 0;border-radius:24px;overflow:hidden">${product(350, 330, 1)}</div>
    <div class="row" style="gap:8px;justify-content:center;margin-top:12px">${[1, 0, 0, 0].map((a) => `<span style="width:${a ? 22 : 7}px;height:7px;border-radius:4px;background:${a ? "#12419b" : "#d5dbe6"}"></span>`).join("")}</div>
    <div style="padding:16px 22px 0"><div style="font-size:13px;font-weight:600;letter-spacing:.08em;color:#2a6aca">SERAMİK KOLEKSİYONU</div>
      <div style="font-size:25px;font-weight:600;letter-spacing:-.02em;margin-top:4px">El yapımı vazo, mavi sır</div>
      <div class="row" style="gap:6px;margin-top:8px;font-size:14px;font-weight:600">${icon("star", { size: 15, color: "#f5a524", style: "fill:#f5a524" })}4,8<span style="font-weight:400;color:#8a95ad">· 186 değerlendirme</span></div>
      <div class="row" style="gap:10px;margin-top:14px"><span style="font-size:28px;font-weight:600;letter-spacing:-.02em">₺1.249</span><span style="font-size:17px;color:#a0aac0;text-decoration:line-through">₺1.490</span>${tag("%16 indirim", "green")}</div>
      <div class="row" style="gap:8px;margin-top:12px;font-size:14px;color:#12873f">${icon("truck", { size: 17 })}Yarın kargoda · Ücretsiz kargo</div>
      <div class="row" style="gap:10px;margin-top:16px;font-size:14px;color:#55617b">Renk:<b style="font-weight:600;color:#0c1a3a">Mavi sır</b><span class="row" style="gap:8px;margin-left:auto">${["#2a6aca", "#f4f1ea", "#011441"].map((c, i) => `<span style="width:26px;height:26px;border-radius:50%;background:${c};box-shadow:${i === 0 ? "0 0 0 2px #fff,0 0 0 4px #2a6aca" : "inset 0 0 0 1px rgb(1 20 65/.15)"}"></span>`).join("")}</span></div></div>
    <div class="row" style="position:absolute;left:20px;right:20px;bottom:34px;gap:12px"><span style="width:56px;height:56px;border-radius:16px;background:#f3f6fb;display:grid;place-items:center">${icon("message-circle", { size: 22 })}</span><div class="btn pri" style="flex:1;justify-content:center;height:56px;font-size:17px;border-radius:16px">${icon("shopping-cart", { size: 19 })}Sepete ekle</div></div></div>`;
}
function boxesSvg(w = 900) {
  const P = prj(450, 470);
  const B = 200, H = 150, G = 12;
  const list = [
    { x: 0, y: 0, z: 0, w: B, d: B, h: H },
    { x: B + G, y: 0, z: 0, w: B, d: B, h: H },
    { x: 0, y: B + G, z: 0, w: B, d: B, h: H },
    { x: B + G, y: B + G, z: 0, w: B, d: B, h: H },
    { x: B / 2 + 6, y: B / 2 + 6, z: H + 4, w: B, d: B, h: H },
  ];
  const tape = (b) => {
    const T = [P(b.x + b.w * 0.42, b.y, b.z + b.h), P(b.x + b.w * 0.58, b.y, b.z + b.h), P(b.x + b.w * 0.58, b.y + b.d, b.z + b.h), P(b.x + b.w * 0.42, b.y + b.d, b.z + b.h)];
    const F = [P(b.x + b.w * 0.42, b.y + b.d, b.z + b.h), P(b.x + b.w * 0.58, b.y + b.d, b.z + b.h), P(b.x + b.w * 0.58, b.y + b.d, b.z + b.h * 0.6), P(b.x + b.w * 0.42, b.y + b.d, b.z + b.h * 0.6)];
    return `<polygon points="${pts(T)}" fill="#ffffff" opacity=".45"/><polygon points="${pts(F)}" fill="#cfeeff" opacity=".5"/>`;
  };
  const label = (b) => onRight(P, b, `<rect x="${b.d * 0.52}" y="${b.h * 0.4}" width="${b.d * 0.34}" height="${b.h * 0.36}" rx="5" fill="#fff" opacity=".92"/>${[0, 1, 2].map((r) => `<rect x="${b.d * 0.56}" y="${b.h * (0.47 + r * 0.085)}" width="${b.d * (r === 2 ? 0.14 : 0.25)}" height="${b.h * 0.04}" rx="1.5" fill="#12419b" opacity=".55"/>`).join("")}`);
  const arrow = "M60,0 L140,96 L94,96 L94,260 L26,260 L26,96 L-20,96 Z";
  return `<svg width="${w}" height="${w}" viewBox="0 0 900 900" style="overflow:visible"><defs>${mat("bx")}
     <linearGradient id="bxAr" x1="0" y1="1" x2=".3" y2="0"><stop offset="0" stop-color="#2c74d8"/><stop offset="1" stop-color="#9fdcff"/></linearGradient></defs>
     ${list.map((b, i) => isoBox(P, { ...b, p: "bx", round: 4 }) + tape(b) + (i === 1 || i === 3 || i === 4 ? label(b) : "")).join("")}
     <g transform="translate(690,30) rotate(14 60 130)">
       ${[18, 15, 12, 9, 6, 3].map((o) => `<path d="${arrow}" transform="translate(${o},${o * 0.6})" fill="#0e3a8c" stroke="#0e3a8c" stroke-width="10" stroke-linejoin="round"/>`).join("")}
       <path d="${arrow}" fill="url(#bxAr)" stroke="url(#bxAr)" stroke-width="10" stroke-linejoin="round"/>
       <path d="M60,16 L116,84" stroke="#fff" stroke-opacity=".65" stroke-width="7" stroke-linecap="round"/>
     </g></svg>`;
}
const eticaret = {
  slug: "e-ticaret-yonetimi",
  card: card(`
    ${glowL(40, 140, 1100, 760)}
    ${shadow(40, 830, 1100, 70, 0.3)}
    ${at(60, 150, macbook(storeAdmin(), { width: 1060 }))}
    ${shadow(1195, 838, 310, 40, 0.32)}
    ${at(1210, 250, iphone(storeMobile(), { width: 300, style: "filter:drop-shadow(0 30px 34px rgb(1 20 65/.35))" }))}
    <div class="gl" style="position:absolute;left:760px;top:44px;width:400px;padding:16px 18px">
      <div class="row" style="gap:12px"><span style="width:46px;height:46px;border-radius:14px;background:linear-gradient(145deg,#5fb2f6,#12419b);display:grid;place-items:center">${icon("shopping-bag", { size: 22, color: "#fff" })}</span><div><div style="font-size:13.5px;color:#7f8aa3">Yeni sipariş · şimdi</div><div style="font-size:18px;font-weight:600">#10482 · 2 ürün</div></div><span style="margin-left:auto;font-size:22px;font-weight:600;letter-spacing:-.02em;color:#12419b">₺1.249</span></div></div>`),
  poster: poster(
    `${glowL(-120, 600, 1000, 900)}
     ${shadow(60, 1320, 760, 120, 0.3)}
     ${at(0, 560, boxesSvg(900))}
     <div class="gl" style="position:absolute;left:64px;top:640px;padding:18px 26px 18px 20px">
       <div class="row" style="gap:12px"><span style="width:46px;height:46px;border-radius:14px;background:linear-gradient(145deg,#5fb2f6,#12419b);display:grid;place-items:center">${icon("shopping-bag", { size: 22, color: "#fff" })}</span><div><div style="font-size:14px;color:#7f8aa3">Bugünkü satış</div><div style="font-size:28px;font-weight:600;letter-spacing:-.03em;color:#0c1a3a;line-height:1.1">₺86.420</div></div></div>
       <div class="row" style="gap:6px;margin-top:12px">${tag("214 sipariş", "blue")}${tag("+%18", "green")}</div></div>`,
    { lines: ["E-Ticaret", "Yönetimi"], desc: "Mağaza kurulumu, pazaryeri entegrasyonu ve sipariş operasyonuyla online satışınızı büyüten hizmetler." },
  ),
};

/* ======================================================================
   7) GRAFİK TASARIM: guru kurumsal kimlik seti + renk kartelası
   ====================================================================== */
const SW = [
  ["#011441", "Lacivert", "#fff"],
  ["#12419b", "Kraliyet", "#fff"],
  ["#2a6aca", "Parlak mavi", "#fff"],
  ["#44a1f1", "Gök", "#fff"],
  ["#cef0fe", "Buz", "#011441"],
  ["#eef1f5", "Açık gri", "#011441"],
];
function swatchFan(scale = 1, start = -46, step = 15) {
  const w = 150, h = 560;
  return `<div style="position:relative;width:${w}px;height:${h}px;transform:scale(${scale});transform-origin:50% 92%">
    ${[...SW].reverse().map(([c, n, fg], i) => `<div style="position:absolute;inset:0;transform-origin:50% 92%;transform:rotate(${start + i * step}deg);border-radius:18px;background:#fff;box-shadow:0 0 0 1px rgb(1 20 65/.06),0 20px 34px -18px rgb(1 20 65/.5);overflow:hidden">
        <div style="height:70%;background:${c};position:relative"><div style="position:absolute;inset:0;background:linear-gradient(120deg,rgb(255 255 255/.18),rgb(255 255 255/0) 40%)"></div></div>
        <div style="padding:14px 16px;color:#0c1a3a"><div style="font-size:17px;font-weight:600">${n}</div><div class="mono" style="font-size:13px;color:#7f8aa3;margin-top:3px">${c.toUpperCase()}</div></div>
        <span style="position:absolute;left:50%;top:92%;transform:translate(-50%,-50%);width:16px;height:16px;border-radius:50%;background:radial-gradient(circle at 35% 35%,#fff,#b4bcc9);box-shadow:0 1px 2px rgb(0 0 0/.3)"></span></div>`).join("")}</div>`;
}
const bizCard = (dark, w = 420, extra = "") => {
  const h = w * 0.58;
  return `<div style="width:${w}px;height:${h}px;border-radius:${w * 0.03}px;${dark ? "background:linear-gradient(150deg,#08205a,#011441 60%)" : "background:#fff"};box-shadow:0 0 0 1px rgb(1 20 65/.05),0 26px 40px -22px rgb(1 20 65/.55);position:relative;overflow:hidden;${extra}">
    ${dark ? `<div style="position:absolute;right:-${w * 0.2}px;top:-${w * 0.3}px;width:${w * 0.8}px;height:${w * 0.8}px;border-radius:50%;background:radial-gradient(closest-side,rgb(68 161 241/.35),transparent)"></div>${logo("white", h * 0.34, `position:absolute;left:${w * 0.08}px;top:${h * 0.3}px`)}` : `${logo("navy", h * 0.2, `position:absolute;left:${w * 0.08}px;top:${h * 0.14}px`)}
      <div style="position:absolute;left:${w * 0.08}px;bottom:${h * 0.13}px;font-size:${w * 0.036}px;color:#3b4763;line-height:1.5"><div style="font-size:${w * 0.046}px;font-weight:600;color:#011441">Dijital Ajans</div>guruajans.com.tr<br>İstanbul</div>
      <div style="position:absolute;right:0;top:0;bottom:0;width:${w * 0.06}px;background:linear-gradient(180deg,#44a1f1,#12419b)"></div>`}</div>`;
};
const typeCard = (w = 360) => `<div style="width:${w}px;padding:24px 26px;border-radius:22px;background:#fff;box-shadow:0 0 0 1px rgb(1 20 65/.05),0 26px 40px -24px rgb(1 20 65/.5);color:#011441">
    <div class="row"><span style="font-size:13px;font-weight:600;letter-spacing:.1em;color:#7f8aa3">YAZI TİPİ</span><span style="margin-left:auto;font-size:13px;color:#7f8aa3">Outfit</span></div>
    <div style="font-size:120px;font-weight:600;letter-spacing:-.04em;line-height:1;margin-top:8px;background:linear-gradient(180deg,#2a6aca,#011441);-webkit-background-clip:text;color:transparent;padding-bottom:6px">Aa</div>
    <div style="display:grid;gap:4px;margin-top:6px;font-size:18px">${[[300, "Light"], [400, "Regular"], [600, "SemiBold"], [700, "Bold"]].map(([w, n]) => `<div class="row" style="font-weight:${w}">${n}<span style="margin-left:auto;font-size:14px;color:#a0aac0;font-weight:400">${w}</span></div>`).join("")}</div>
    <div style="margin-top:12px;font-size:16px;color:#55617b;letter-spacing:.02em">ABCÇDEFGĞHIİ 0123456789</div></div>`;
const markBoard = (w = 420) => `<div style="width:${w}px;height:${w}px;border-radius:24px;background:#fff;box-shadow:0 0 0 1px rgb(1 20 65/.05),0 26px 40px -24px rgb(1 20 65/.5);position:relative;overflow:hidden">
    <svg width="${w}" height="${w}" style="position:absolute;inset:0">${[0.25, 0.5, 0.75].map((f) => `<line x1="${w * f}" y1="0" x2="${w * f}" y2="${w}" stroke="#d6e6fb" stroke-width="1.5"/><line x1="0" y1="${w * f}" x2="${w}" y2="${w * f}" stroke="#d6e6fb" stroke-width="1.5"/>`).join("")}
      <circle cx="${w / 2}" cy="${w / 2}" r="${w * 0.3}" fill="none" stroke="#9cc4f2" stroke-width="1.5" stroke-dasharray="5 6"/><circle cx="${w / 2}" cy="${w / 2}" r="${w * 0.4}" fill="none" stroke="#d6e6fb" stroke-width="1.5"/>
      <line x1="0" y1="0" x2="${w}" y2="${w}" stroke="#e3eefc" stroke-width="1.5"/><line x1="${w}" y1="0" x2="0" y2="${w}" stroke="#e3eefc" stroke-width="1.5"/></svg>
    <img src="${fileUrl(`${ROOT}/public/brand/mark-navy.svg`)}" style="position:absolute;left:50%;top:50%;width:${w * 0.46}px;transform:translate(-50%,-50%)">
    <span style="position:absolute;left:18px;top:16px;font-size:13px;font-weight:600;letter-spacing:.1em;color:#7f8aa3">AMBLEM</span></div>`;
const grafik = {
  slug: "grafik-tasarim",
  card: card(`
    ${glowL(200, 80, 1200, 860, "rgb(68 161 241/.16)")}
    ${at(80, 120, markBoard(400))}
    ${at(530, 120, bizCard(true, 470, "transform:rotate(-4deg)"))}
    ${at(560, 430, bizCard(false, 470, "transform:rotate(3deg)"))}
    ${at(84, 560, `<div class="row" style="gap:14px">${SW.slice(0, 5).map(([c, n, fg]) => `<div style="width:66px;height:300px;border-radius:16px;background:${c};box-shadow:0 0 0 1px rgb(1 20 65/.05),0 18px 28px -18px rgb(1 20 65/.55);position:relative"><span style="position:absolute;left:0;right:0;bottom:12px;text-align:center;font-size:11px;font-weight:600;color:${fg};letter-spacing:.02em" class="mono">${c.slice(1).toUpperCase()}</span></div>`).join("")}</div>`)}
    ${at(1110, 120, typeCard(400))}
    <div style="position:absolute;left:1215px;top:385px">${swatchFan(0.62, -40, 14)}</div>`),
  poster: poster(
    `${glowL(-120, 560, 1000, 900)}
     ${shadow(60, 1320, 600, 100, 0.28)}
     <div style="position:absolute;left:255px;top:845px">${swatchFan(1.35, -38, 12)}</div>
     ${at(706, 850, `<div style="transform:rotate(4deg)">${typeCard(360)}</div>`)}`,
    { lines: ["Grafik", "Tasarım"], desc: "Logodan kurumsal kimliğe, katalogdan ambalaja markanızı her noktada tutarlı gösteren tasarımlar." },
  ),
};

/* ======================================================================
   8) SOSYAL MEDYA YÖNETİMİ: içerik planı uygulaması + 3B konuşma balonu
   ====================================================================== */
const STRIP = fileUrl(`${ROOT}/public/work/instagram-postlar.webp`);
const PX = [13, 325, 633, 947];
const thumb = (i, w, r = 12) => {
  const s = w / 290;
  return `<div style="width:${w}px;height:${Math.round(w)}px;border-radius:${r}px;overflow:hidden;flex-shrink:0"><img src="${STRIP}" style="display:block;width:${1250 * s}px;max-width:none;margin-left:${-PX[i] * s}px;margin-top:${-(13 + 35) * s}px"></div>`;
};
function socialApp() {
  const items = [
    [0, "Avrupa Diş", "Gönderi", "Bugün 10:00", ["Yayınlandı", "green"], "1.284", "86"],
    [1, "Veggy Snacky", "Reels", "Bugün 18:30", ["Planlandı", "blue"]],
    [2, "Kozmetik lansman", "Gönderi", "Yarın 12:00", ["Onay bekliyor", "amber"]],
    [3, "Doğal zeytin", "Hikâye", "Cum 20:00", ["Planlandı", "blue"]],
  ];
  return `<div style="width:390px;height:844px;background:#f3f6fb;font-family:Outfit;color:#0c1a3a;position:relative;overflow:hidden">${statusBar()}
    <div class="row" style="padding:4px 20px 0"><div><div style="font-size:14px;color:#7f8aa3">İçerik planı</div><div style="font-size:25px;font-weight:600;letter-spacing:-.02em">Bu hafta</div></div><span style="margin-left:auto;width:44px;height:44px;border-radius:14px;background:#12419b;display:grid;place-items:center">${icon("plus", { size: 22, color: "#fff" })}</span></div>
    <div class="row" style="gap:8px;padding:16px 20px 0">${[["Pzt", 13], ["Sal", 14, 1], ["Çar", 15], ["Per", 16], ["Cum", 17], ["Cmt", 18]].map(([d, n, on]) => `<div style="flex:1;padding:9px 0;border-radius:14px;text-align:center;${on ? "background:#12419b;color:#fff" : "background:#fff"}"><div style="font-size:11.5px;opacity:.7">${d}</div><div style="font-size:17px;font-weight:600">${n}</div></div>`).join("")}</div>
    <div style="display:grid;gap:10px;padding:16px 16px 0">${items.map(([i, n, k, t, [s, tone], lk, cm]) => `<div class="row" style="gap:12px;padding:10px;border-radius:18px;background:#fff;box-shadow:0 8px 20px -16px rgb(1 20 65/.4)">${thumb(i, 76)}<div style="min-width:0;flex:1"><div style="font-size:15.5px;font-weight:600;white-space:nowrap">${n}</div><div style="font-size:12.5px;color:#7f8aa3;margin-top:1px">${k} · ${t}</div><div class="row" style="gap:10px;margin-top:6px">${tag(s, tone)}${lk ? `<span class="row" style="gap:3px;font-size:12px;color:#55617b">${icon("heart", { size: 13, color: "#e5484d", style: "fill:#e5484d" })}${lk}</span><span class="row" style="gap:3px;font-size:12px;color:#55617b">${icon("message-circle", { size: 13 })}${cm}</span>` : ""}</div></div></div>`).join("")}</div>
    <div style="margin:12px 16px 0;padding:14px 16px;border-radius:18px;background:#fff;box-shadow:0 8px 20px -16px rgb(1 20 65/.4)"><div class="row" style="font-size:14.5px;font-weight:600">Haftalık plan<span style="margin-left:auto;font-size:13px;color:#7f8aa3;font-weight:500">9 / 12 içerik hazır</span></div><div style="height:8px;border-radius:9px;background:#e3edfb;margin-top:10px"><div style="width:75%;height:100%;border-radius:9px;background:linear-gradient(90deg,#12419b,#44a1f1)"></div></div></div>
    <div class="row" style="position:absolute;left:0;right:0;bottom:0;justify-content:space-around;padding:10px 12px 28px;background:#fff">${[["calendar-days", "Plan", 1], ["chart-no-axes-column", "Rapor"], ["messages-square", "Mesajlar"], ["settings", "Ayarlar"]].map(([ic, l, on]) => `<div style="display:grid;justify-items:center;gap:4px;font-size:11.5px;font-weight:${on ? 600 : 500};color:${on ? "#12419b" : "#8a95ad"}">${icon(ic, { size: 22, stroke: on ? 2.2 : 1.9 })}${l}</div>`).join("")}</div></div>`;
}
function bubbleSvg(w = 800) {
  return `<svg width="${w}" height="${w * 0.9}" viewBox="0 0 800 720" style="overflow:visible"><defs>
    <linearGradient id="sbF" x1="0" y1="0" x2=".8" y2="1"><stop offset="0" stop-color="#bfe8ff"/><stop offset=".3" stop-color="#5aaaf3"/><stop offset=".7" stop-color="#2a6aca"/><stop offset="1" stop-color="#12419b"/></linearGradient>
    <linearGradient id="sbS" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#12419b"/><stop offset="1" stop-color="#011f63"/></linearGradient>
    <radialGradient id="sbH" cx=".4" cy=".3" r=".8"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#dff4ff"/></radialGradient>
    <filter id="sbB" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="8"/></filter></defs>
    ${[34, 31, 28, 25, 22, 19, 16, 13, 10, 7, 4].map((o) => `<g transform="translate(0,${o})"><path d="M400,90 C580,90 700,190 700,320 C700,450 580,550 400,550 C360,550 322,545 288,535 L170,610 L200,500 C140,460 100,395 100,320 C100,190 220,90 400,90 Z" fill="url(#sbS)"/></g>`).join("")}
    <path d="M400,90 C580,90 700,190 700,320 C700,450 580,550 400,550 C360,550 322,545 288,535 L170,610 L200,500 C140,460 100,395 100,320 C100,190 220,90 400,90 Z" fill="url(#sbF)"/>
    <path d="M190,230 C240,150 320,118 410,116" fill="none" stroke="#fff" stroke-opacity=".75" stroke-width="22" stroke-linecap="round" filter="url(#sbB)"/>
    <g transform="translate(400,330)">
      <path d="M0,70 C-90,10 -120,-40 -100,-80 C-80,-118 -28,-120 0,-78 C28,-120 80,-118 100,-80 C120,-40 90,10 0,70 Z" fill="#0b2e7c" opacity=".35" transform="translate(6,12)" filter="url(#sbB)"/>
      <path d="M0,70 C-90,10 -120,-40 -100,-80 C-80,-118 -28,-120 0,-78 C28,-120 80,-118 100,-80 C120,-40 90,10 0,70 Z" fill="url(#sbH)"/>
      <path d="M-74,-74 C-62,-92 -40,-96 -26,-84" fill="none" stroke="#fff" stroke-width="8" stroke-linecap="round"/>
    </g></svg>`;
}
const miniBubble = (ic, txt, tone = 0) => `<div class="row gl" style="gap:10px;height:58px;padding:0 18px 0 8px;border-radius:999px">
   <span style="width:42px;height:42px;border-radius:50%;background:${["linear-gradient(145deg,#ff7a85,#e5484d)", "linear-gradient(145deg,#5fb2f6,#12419b)", "linear-gradient(145deg,#7ee0c3,#0e8a7e)"][tone]};display:grid;place-items:center">${icon(ic, { size: 20, color: "#fff", stroke: 2.2, style: tone === 0 ? "fill:#fff" : "" })}</span>
   <span style="font-size:19px;font-weight:600;color:#0c1a3a;white-space:nowrap">${txt}</span></div>`;
const statsCard = () => `<div style="width:420px;padding:22px 24px;border-radius:24px;background:#fff;box-shadow:0 0 0 1px rgb(1 20 65/.04),0 40px 80px -40px rgb(1 20 65/.45),0 12px 28px -18px rgb(1 20 65/.2);color:#0c1a3a;font-variant-numeric:tabular-nums">
   <div class="row"><span style="font-size:19px;font-weight:600">Aylık rapor</span><span style="margin-left:auto;font-size:13.5px;color:#7f8aa3">Eylül 2026</span></div>
   <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:16px">${[["Erişim", "128,4B", "+%64"], ["Etkileşim oranı", "%6,8", "+1,9"], ["Yeni takipçi", "2.140", "+%38"], ["Profil ziyareti", "9.870", "+%41"]].map(([l, v, d]) => `<div style="padding:12px 14px;border-radius:14px;background:#f4f7fc"><div style="font-size:12.5px;color:#7f8aa3">${l}</div><div style="font-size:23px;font-weight:600;letter-spacing:-.02em">${v}</div><div class="up" style="font-size:12.5px;font-weight:600">${d}</div></div>`).join("")}</div>
   <div style="margin-top:16px">${bars([42, 55, 48, 66, 72, 61, 84, 90], { w: 372, h: 110, labels: ["1", "5", "9", "13", "17", "21", "25", "29"], hi: 7, color: "#2a6aca", fade: "#d6e6fb" })}</div></div>`;
const sosyal = {
  slug: "sosyal-medya-yonetimi",
  card: card(`
    ${glowL(0, 120, 1500, 800, "rgb(68 161 241/.18)")}
    ${shadow(40, 680, 520, 80, 0.24)}
    ${at(20, 220, bubbleSvg(560))}
    ${shadow(640, 785, 330, 46, 0.3)}
    ${at(640, 130, iphone(socialApp(), { width: 330, style: "filter:drop-shadow(0 34px 36px rgb(1 20 65/.32))" }))}
    ${at(1060, 190, statsCard())}
    ${at(1060, 640, miniBubble("heart", "1.284 beğeni", 0))}
    ${at(1290, 640, miniBubble("message-circle", "86 yorum", 1))}
    ${at(410, 170, miniBubble("user-plus", "+2.140", 2))}`),
  poster: poster(
    `${glowL(-120, 560, 1000, 900)}
     ${shadow(0, 1340, 700, 100, 0.26)}
     ${at(-90, 620, bubbleSvg(900))}
     ${at(64, 600, miniBubble("heart", "1.284 beğeni", 0))}
     ${at(640, 760, miniBubble("message-circle", "86 yorum", 1))}
     ${at(720, 1180, miniBubble("user-plus", "+2.140 takipçi", 2))}`,
    { lines: ["Sosyal", "Medya"], sub: "Yönetimi Hizmetleri", desc: "Strateji, içerik planı ve topluluk yönetimiyle markanızı sosyal medyada düzenli büyüten hizmetler." },
  ),
};

/* ======================================================================
   9) MARKA TESCİL: kart, müşteri gönderisindeki fotoğraf + başvuru takibi
   ====================================================================== */
const POST = `${ROOT}/tools/gorsel-studyo/kaynak/marka-tescil-gonderi.jpg`; // müşterinin Marka Tescili gönderisi
const tescilCard = () => {
  const steps = [["Ön araştırma", "Benzer marka taraması", "file-search"], ["Başvuru", "Nice sınıfları 35 · 42", "file-check"], ["Yayın ve itiraz süresi", "Bülten yayını tamamlandı", "newspaper"], ["Tescil", "Belge düzenlendi", "badge-check"]];
  return `<div style="width:470px;padding:24px 24px 20px;border-radius:26px;background:#fff;box-shadow:0 0 0 1px rgb(1 20 65/.04),0 40px 80px -40px rgb(1 20 65/.45),0 12px 28px -18px rgb(1 20 65/.2);color:#0c1a3a">
    <div class="row" style="gap:12px"><span style="width:44px;height:44px;border-radius:13px;background:#eaf2ff;display:grid;place-items:center;font-size:34px;font-weight:600;line-height:1;color:#12419b">®</span><div><div style="font-size:20px;font-weight:600;letter-spacing:-.02em">Marka başvuru takibi</div><div style="font-size:13.5px;color:#7f8aa3">Başvuru no. 2026/041872</div></div></div>
    <div style="margin-top:18px">${steps.map(([t, s, ic], i) => `<div class="row" style="gap:14px;position:relative;padding:9px 0">
      ${i < steps.length - 1 ? `<span style="position:absolute;left:21px;top:53px;width:2px;height:30px;background:#9cc4f2"></span>` : ""}
      <span style="width:44px;height:44px;border-radius:50%;background:${i === 3 ? "linear-gradient(145deg,#5fb2f6,#12419b)" : "#eaf2ff"};display:grid;place-items:center">${icon(ic, { size: 20, color: i === 3 ? "#fff" : "#12419b" })}</span>
      <div><div style="font-size:16.5px;font-weight:600">${t}</div><div style="font-size:13.5px;color:#7f8aa3">${s}</div></div>
      <span style="margin-left:auto">${icon("circle-check", { size: 20, color: "#12873f", stroke: 2.3 })}</span></div>`).join("")}</div>
    <div class="row" style="margin-top:12px;gap:10px;padding:12px 14px;border-radius:14px;background:#e6f6ec;color:#12873f;font-size:14.5px;font-weight:600">${icon("shield-check", { size: 18 })}10 yıl koruma · yenileme hatırlatması açık</div></div>`;
};
const tescil = {
  slug: "marka-tescil",
  card: page({
    w: 1600,
    h: 1000,
    bg: "background:#eeeeee;background-image:radial-gradient(60% 70% at 40% 45%,#f4f4f4,#eaeaea);",
    css: CSS,
    body: `<div style="position:absolute;left:0;top:0;width:1060px;height:1000px;overflow:hidden;-webkit-mask-image:linear-gradient(90deg,#000 82%,transparent 100%)">
        <img src="${fileUrl(POST)}" style="position:absolute;width:1400px;left:0;top:-702px;max-width:none"></div>
      ${at(1050, 262, tescilCard())}`,
  }),
};

/* ---------------- Sahne listesi ---------------- */
const ALL = [reklam, web, seo, yazilim, mobil, eticaret, grafik, sosyal];
export const HIZMET_SCENES = [
  ...ALL.flatMap((s) => [
    { name: `hizmet-${s.slug}-kart`, w: 1600, h: 1000, html: s.card },
    { name: `hizmet-${s.slug}-poster`, w: 1200, h: 1500, html: s.poster },
  ]),
  { name: `hizmet-marka-tescil-kart`, w: 1600, h: 1000, html: tescil.card },
];
