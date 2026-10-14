// Site içerik görselleri: blog kapakları (16:9), ekip portre kartları (4:5, mockup),
// müşteri video yorumu yer tutucuları (4:5).
//   Blog kapaklarında ana içerik dikeyde orta bantta (y 170–730) durur; yazı sayfasında
//   21:9'a kırpıldığında (üst/alt ~107px) hiçbir şey kesilmez.
//   Kapaklarda büyük başlık yok (sitede yazı başlığı ayrıca var); yalnız küçük kategori etiketi.
//   Ekip ve yorum görsellerinde gerçek insan yüzü yok: monogram ve soyut marka zemini.
import { BG, grainLayer, icon, iphone, mark, page, ring } from "./lib.mjs";

const NAVY = "#011441";
const ROYAL = "#12419b";
const BRIGHT = "#2a6aca";
const SKY = "#44a1f1";
const ICE = "#cef0fe";
const INK = "#0c1a3a";
const MUTED = "#7f8aa3";

const W = 1600;
const H = 900;

const REG = (s, c = "#fff") => `<svg width="${s}" height="${s}" viewBox="0 0 100 100"><circle cx="50" cy="50" r="44" fill="none" stroke="${c}" stroke-width="7"/><path d="M37 74V27h16c10 0 16 6 16 14s-6 14-16 14H37M52 55l17 19" fill="none" stroke="${c}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const box = (style, html = "") => `<div style="position:absolute;${style}">${html}</div>`;
const SH_ICE = "box-shadow:0 34px 70px -38px rgb(1 20 65/.55),0 0 0 1px rgb(1 20 65/.05)";
const SH_NAVY = "box-shadow:0 50px 100px -40px rgb(0 6 30/.75),0 18px 40px -24px rgb(0 6 30/.5)";
const card = (style, html, dark = false) => box(`background:#fff;border-radius:24px;${dark ? SH_NAVY : SH_ICE};color:${INK};${style}`, html);
const glass = (style, html) =>
  box(`background:linear-gradient(160deg,rgb(30 78 170/.62),rgb(1 20 65/.82));border:1px solid rgb(255 255 255/.18);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border-radius:24px;color:#fff;box-shadow:0 40px 80px -40px rgb(0 6 30/.7);${style}`, html);

/* Küçük kategori etiketi (21:9 kırpmada da görünür kalır) */
const catChip = (text, dark) =>
  box(
    `left:96px;top:128px;height:40px;display:flex;align-items:center;gap:10px;padding:0 18px 0 12px;border-radius:999px;font-size:15px;font-weight:600;letter-spacing:.02em;${
      dark ? "background:rgb(255 255 255/.1);border:1px solid rgb(255 255 255/.2);color:#fff" : `background:#fff;color:${NAVY};${SH_ICE}`
    }`,
    `${mark(dark ? "white" : "navy", 20)}${text}`
  );

const iconTile = (ic, { d = 44, bg = "#eaf2ff", c = BRIGHT, r = 13, s } = {}) =>
  `<span style="width:${d}px;height:${d}px;border-radius:${r}px;background:${bg};display:grid;place-items:center;flex-shrink:0">${icon(ic, { size: s ?? Math.round(d * 0.48), color: c, stroke: 2.1 })}</span>`;

const cover = (dark, chipText, body) =>
  page({ w: W, h: H, bg: dark ? BG.navy : BG.ice, body: `${grainLayer(dark ? 0.06 : 0.05)}${body}${catChip(chipText, dark)}` });

/* ============ 1. Sosyal medya içerik takvimi ============ */
const KIND = {
  post: { t: "Gönderi", c: BRIGHT, bg: "#eaf2ff", ic: "image" },
  reels: { t: "Reels", c: "#6d4ae0", bg: "#f0ebff", ic: "clapperboard" },
  story: { t: "Hikâye", c: "#0e8a7e", bg: "#e3f6f3", ic: "circle-dashed" },
};
const GRADS = [
  ["#12419b", "#44a1f1"],
  ["#011441", "#2a6aca"],
  ["#2a6aca", "#cef0fe"],
  ["#6d4ae0", "#44a1f1"],
];
const thumb = (k, g, ic) =>
  `<div style="position:relative;height:104px;border-radius:12px;background:linear-gradient(140deg,${GRADS[g][0]},${GRADS[g][1]});display:grid;place-items:center">${icon(ic, { size: 30, color: "rgb(255 255 255/.9)", stroke: 1.8 })}
    <span style="position:absolute;left:8px;top:8px;width:24px;height:24px;border-radius:8px;background:rgb(255 255 255/.92);display:grid;place-items:center">${icon(KIND[k].ic, { size: 13, color: KIND[k].c, stroke: 2.3 })}</span></div>`;
const chip = (k, time) =>
  `<div class="row" style="gap:6px;font-size:12px;font-weight:600;color:${KIND[k].c}"><span style="width:7px;height:7px;border-radius:50%;background:${KIND[k].c}"></span>${KIND[k].t}<span style="margin-left:auto;font-weight:500;color:${MUTED}">${time}</span></div>`;
const note = (k, text, time) =>
  `<div style="padding:10px 11px 11px;border-radius:12px;background:${KIND[k].bg}">${chip(k, time)}<div style="margin-top:6px;font-size:13px;line-height:1.35;color:#24314f;font-weight:500">${text}</div></div>`;
const DAYS = [
  ["Pzt", 9, [thumb("post", 0, "sparkles"), chip("post", "10:00"), note("story", "Haftanın anketi", "19:00")]],
  ["Sal", 10, [note("reels", "Ürün kullanım videosu", "11:00"), note("story", "Kamera arkası", "17:30")]],
  ["Çar", 11, [thumb("reels", 3, "play"), chip("reels", "18:30"), note("story", "Geri sayım", "20:00")]],
  ["Per", 12, [note("post", "Haftanın ipucu", "12:30"), note("story", "Soru kutusu", "18:00"), note("post", "Müşteri yorumu", "21:00")]],
  ["Cum", 13, [thumb("post", 1, "megaphone"), chip("post", "12:00"), note("reels", "Kampanya duyurusu", "19:30")]],
  ["Cmt", 14, [note("story", "Hafta sonu önerisi", "11:00"), thumb("post", 2, "heart"), chip("post", "16:00")]],
  ["Paz", 15, [thumb("reels", 3, "play"), chip("reels", "20:00")]],
];
const coverTakvim = cover(
  false,
  "Sosyal Medya",
  card(
    "left:170px;top:206px;width:1260px;height:500px;padding:28px 30px 0",
    `<div class="row" style="gap:14px">
      <span style="width:46px;height:46px;border-radius:14px;background:${NAVY};display:grid;place-items:center">${icon("calendar-days", { size: 22, color: "#fff", stroke: 2 })}</span>
      <div><div style="font-size:22px;font-weight:600;letter-spacing:-.02em;color:${NAVY}">İçerik Takvimi</div><div style="font-size:14px;color:${MUTED};margin-top:1px">Haziran · 2. hafta · 14 paylaşım</div></div>
      <div class="row" style="gap:8px;margin-left:auto">${Object.values(KIND)
        .map((k) => `<span class="row" style="gap:7px;height:34px;padding:0 13px;border-radius:999px;background:${k.bg};color:${k.c};font-size:13px;font-weight:600">${icon(k.ic, { size: 14, stroke: 2.2 })}${k.t}</span>`)
        .join("")}</div>
    </div>
    <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:14px;margin-top:22px">
      ${DAYS.map(([d, n, items], i) => `<div>
        <div class="row" style="gap:7px;font-size:12.5px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:${i === 2 ? BRIGHT : "#8a95ad"};padding:0 4px 10px">${d}<span style="margin-left:auto;letter-spacing:0;font-size:13px;${i === 2 ? `background:${BRIGHT};color:#fff;border-radius:999px;padding:1px 8px` : ""}">${n}</span></div>
        <div style="display:grid;gap:10px;padding:11px;border-radius:16px;background:${i === 2 ? "#f0f6ff" : "#f6f8fc"};height:326px;align-content:start;${i === 2 ? `box-shadow:inset 0 0 0 1.5px #cfe0fb` : ""}">${items.join("")}</div>
      </div>`).join("")}
    </div>`
  )
);

/* ============ 2. Kurumsal web sitesi: 6 soru ============ */
const wl = (w, h = 10, o = 0.35, extra = "") => `<div style="width:${w}px;height:${h}px;border-radius:${h}px;background:rgb(206 240 254/${o});${extra}"></div>`;
const wbox = (style, html = "") => `<div style="border:1.5px solid rgb(206 240 254/.42);border-radius:14px;${style}">${html}</div>`;
const imgPh = (w, h) =>
  `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" style="display:block"><rect x=".75" y=".75" width="${w - 1.5}" height="${h - 1.5}" rx="14" fill="rgb(68 161 241/.08)" stroke="rgb(206 240 254/.42)" stroke-width="1.5"/><path d="M14 ${h - 14} L${w * 0.38} ${h * 0.45} L${w * 0.58} ${h * 0.68} L${w * 0.72} ${h * 0.52} L${w - 14} ${h - 14}" fill="none" stroke="rgb(206 240 254/.55)" stroke-width="1.5" stroke-linejoin="round"/><circle cx="${w * 0.74}" cy="${h * 0.28}" r="${h * 0.09}" fill="none" stroke="rgb(206 240 254/.55)" stroke-width="1.5"/></svg>`;
const wire = box(
  "left:150px;top:190px;width:760px;height:540px;border-radius:22px;border:1.5px solid rgb(206 240 254/.5);background:linear-gradient(160deg,rgb(68 161 241/.12),rgb(1 20 65/.25));backdrop-filter:blur(6px);overflow:hidden",
  `<div class="row" style="gap:8px;height:48px;padding:0 20px;border-bottom:1.5px solid rgb(206 240 254/.3)">
    ${[0, 1, 2].map(() => `<span style="width:11px;height:11px;border-radius:50%;border:1.5px solid rgb(206 240 254/.6)"></span>`).join("")}
    <div class="row" style="gap:8px;margin:0 auto;height:28px;padding:0 16px;border-radius:9px;border:1.5px solid rgb(206 240 254/.35);font-size:13px;color:rgb(206 240 254/.8)">${icon("lock", { size: 12, color: "rgb(206 240 254/.8)", stroke: 2.2 })}alanadiniz.com</div><span style="width:50px"></span>
  </div>
  <div style="padding:22px 34px">
    <div class="row" style="gap:18px">${mark("white", 24, "opacity:.85")}${wl(70, 8, 0.3, "margin-left:auto")}${wl(70, 8, 0.3)}${wl(70, 8, 0.3)}${wl(70, 8, 0.3)}${wbox("width:110px;height:34px;border-radius:10px")}</div>
    <div class="row" style="gap:34px;margin-top:34px;align-items:flex-start">
      <div style="flex:1;display:grid;gap:14px;padding-top:10px">${wl(110, 9, 0.45)}${wl(300, 22, 0.5)}${wl(250, 22, 0.5)}${wl(330, 9, 0.28, "margin-top:8px")}${wl(290, 9, 0.28)}
        <div class="row" style="gap:12px;margin-top:12px"><div style="width:150px;height:44px;border-radius:12px;background:rgb(68 161 241/.55)"></div>${wbox("width:130px;height:44px;border-radius:12px")}</div></div>
      ${imgPh(280, 230)}
    </div>
    <div class="row" style="gap:18px;margin-top:34px">${[0, 1, 2]
      .map(() => wbox("flex:1;height:96px;padding:16px", `<div style="width:30px;height:30px;border-radius:9px;border:1.5px solid rgb(206 240 254/.5)"></div>${wl(120, 8, 0.32, "margin-top:14px")}${wl(80, 8, 0.2, "margin-top:8px")}`))
      .join("")}</div>
  </div>`
);
const QS = [
  ["target", "Hedef ne?", "Teklif, randevu, güven"],
  ["file-text", "İçeriği kim hazırlar?", "Metin ve görsel"],
  ["layout-dashboard", "Kim güncelleyecek?", "Yönetim paneli"],
  ["smartphone", "Mobilde nasıl?", "Hız ve kullanım"],
  ["chart-line", "Ne ölçülecek?", "Olaylar ve izin"],
  ["wrench", "Yayından sonra?", "Bakım ve destek"],
];
const qCards = QS.map(([ic, t, s], i) =>
  card(
    `left:${960 + (i % 2) * 262}px;top:${190 + Math.floor(i / 2) * 186}px;width:242px;height:168px;padding:20px 20px 0`,
    `<div class="row" style="gap:10px">${iconTile(ic, { d: 42 })}<span style="margin-left:auto;width:30px;height:30px;border-radius:50%;background:${NAVY};color:#fff;display:grid;place-items:center;font-size:14px;font-weight:600">${i + 1}</span></div>
     <div style="margin-top:16px;font-size:18.5px;font-weight:600;letter-spacing:-.01em;line-height:1.2;color:${NAVY}">${t}</div>
     <div style="margin-top:5px;font-size:13.5px;color:${MUTED}">${s}</div>`,
    true
  )
).join("");
const coverWeb = cover(true, "Web ve Teknoloji", wire + qCards);

/* ============ 3. Dönüşüm takibi: huni panosu ============ */
const FUNNEL = [
  ["Reklam tıklaması", "8.420", "", "mouse-pointer-click"],
  ["Hizmet sayfası", "5.130", "%61", "file-text"],
  ["Form başlatma", "1.240", "%24", "square-check"],
  ["Form gönderimi", "386", "%31", "send"],
];
const funnelSvg = (() => {
  const w = 360, rowH = 82, gap = 12;
  const widths = [360, 288, 206, 128];
  const cols = ["#12419b", "#2a6aca", "#44a1f1", "#8fd0ff"];
  let s = "";
  widths.forEach((tw, i) => {
    const bw = widths[i + 1] ?? tw * 0.72;
    const y = i * (rowH + gap);
    const p = [[(w - tw) / 2, y], [(w + tw) / 2, y], [(w + bw) / 2, y + rowH], [(w - bw) / 2, y + rowH]];
    s += `<path d="M${p.map((q) => q.join(",")).join(" L")} Z" fill="${cols[i]}" stroke="${cols[i]}" stroke-width="8" stroke-linejoin="round"/>`;
  });
  return `<svg width="${w}" height="${4 * rowH + 3 * gap}" viewBox="-6 -6 ${w + 12} ${4 * rowH + 3 * gap + 12}">${s}</svg>`;
})();
const funnelPanel = card(
  "left:150px;top:190px;width:860px;height:540px;padding:30px 34px",
  `<div class="row" style="gap:14px">${iconTile("chart-no-axes-column", { d: 46, bg: NAVY, c: "#fff" })}
    <div><div style="font-size:22px;font-weight:600;letter-spacing:-.02em;color:${NAVY}">Dönüşüm hunisi</div><div style="font-size:14px;color:${MUTED};margin-top:1px">Arama kampanyaları · son 28 gün</div></div>
    <span class="row" style="margin-left:auto;gap:7px;height:34px;padding:0 14px;border-radius:999px;background:#e6f6ec;color:#12873f;font-size:13px;font-weight:600">${icon("circle-check", { size: 15, stroke: 2.3 })}Etiketler etkin</span></div>
   <div class="row" style="gap:40px;margin-top:30px;align-items:flex-start">
     ${funnelSvg}
     <div style="flex:1;display:grid;gap:12px">${FUNNEL.map(([l, v, p, ic], i) => `
       <div class="row" style="gap:14px;height:82px;padding:0 18px;border-radius:16px;background:${i === 3 ? "#eaf2ff" : "#f5f8fd"}">
         ${iconTile(ic, { d: 38, bg: "#fff", c: i === 3 ? ROYAL : BRIGHT })}
         <div><div style="font-size:14px;color:${MUTED}">${l}</div><div style="font-size:24px;font-weight:600;letter-spacing:-.02em;color:${i === 3 ? ROYAL : INK}">${v}</div></div>
         ${p ? `<span style="margin-left:auto;font-size:14px;font-weight:600;color:${i === 3 ? ROYAL : "#55617b"}">${p}</span>` : ""}
       </div>`).join("")}</div>
   </div>`,
  true
);
const CONV = [
  ["file-check", "Form gönderimi", "386", "Birincil"],
  ["phone", "Telefon araması", "142", "Birincil"],
  ["shopping-bag", "Satın alma", "₺184.600", "Temel olay"],
];
const convCards = CONV.map(([ic, t, v, k], i) =>
  card(
    `left:1050px;top:${206 + i * 176}px;width:400px;height:156px;padding:22px 24px`,
    `<div class="row" style="gap:14px">${iconTile(ic, { d: 48, r: 15 })}
      <div><div style="font-size:13px;font-weight:600;letter-spacing:.06em;color:#12873f" class="row">${icon("check", { size: 14, stroke: 3, style: "margin-right:6px" })}DÖNÜŞÜM</div><div style="font-size:20px;font-weight:600;margin-top:2px;color:${NAVY}">${t}</div></div></div>
     <div class="row" style="margin-top:16px;padding:12px 16px;border-radius:14px;background:#f3f6fb"><span style="font-size:14px;color:${MUTED}">${k}</span><span style="margin-left:auto;font-size:22px;font-weight:600;letter-spacing:-.02em;color:${ROYAL}">${v}</span></div>`,
    true
  )
).join("");
const coverDonusum = cover(true, "Dijital Pazarlama", funnelPanel + convCards);

/* ============ 4. Teknik SEO: kontrol listesi + Core Web Vitals ============ */
const CHECKS = [
  ["robots.txt taramaya açık", 1],
  ["Site haritası gönderildi", 1],
  ["Kanonik adresler tutarlı", 1],
  ["Mobil sürüm eşdeğer", 1],
  ["HTTPS, karışık içerik yok", 1],
  ["Yapılandırılmış veri", 0],
  ["Eski adres yönlendirmeleri", 0],
];
const checklist = card(
  "left:170px;top:186px;width:560px;height:548px;padding:28px 30px",
  `<div class="row" style="gap:14px">${iconTile("list-checks", { d: 46, bg: NAVY, c: "#fff" })}
     <div><div style="font-size:22px;font-weight:600;letter-spacing:-.02em;color:${NAVY}">Teknik SEO kontrolü</div><div style="font-size:14px;color:${MUTED};margin-top:1px">alanadiniz.com · mobil</div></div>
     <span style="margin-left:auto;font-size:20px;font-weight:600;color:${ROYAL}">5/7</span></div>
   <div style="height:7px;border-radius:9px;background:#e3edfb;margin-top:18px"><div style="width:71%;height:100%;border-radius:9px;background:linear-gradient(90deg,${ROYAL},${SKY})"></div></div>
   <div style="display:grid;gap:8px;margin-top:20px">${CHECKS.map(([t, ok]) => `
     <div class="row" style="gap:14px;height:48px;padding:0 14px;border-radius:13px;background:${ok ? "#f5f8fd" : "#fff"};${ok ? "" : "box-shadow:inset 0 0 0 1.5px #e3e9f3"}">
       <span style="width:26px;height:26px;border-radius:8px;display:grid;place-items:center;${ok ? `background:${BRIGHT}` : "box-shadow:inset 0 0 0 2px #c5d2e6"}">${ok ? icon("check", { size: 16, color: "#fff", stroke: 3 }) : ""}</span>
       <span style="font-size:16px;font-weight:500;color:${ok ? INK : "#55617b"}">${t}</span>
       ${ok ? "" : `<span style="margin-left:auto;font-size:12.5px;font-weight:600;color:#b45f06;background:#fff3dc;border-radius:999px;padding:3px 10px">Sırada</span>`}
     </div>`).join("")}</div>`
);
const VITALS = [
  ["LCP", "2,1", "sn", 84, "≤ 2,5 sn", "En büyük içerik"],
  ["INP", "160", "ms", 80, "≤ 200 ms", "Etkileşim tepkisi"],
  ["CLS", "0,06", "", 90, "≤ 0,1", "Görsel kayma"],
];
const gauges = VITALS.map(([k, v, u, pct, th, d], i) =>
  card(
    `left:${790 + i * 214}px;top:186px;width:194px;height:300px;padding:22px 18px;display:flex;flex-direction:column;align-items:center`,
    `<div class="row" style="width:100%;gap:8px"><span style="font-size:18px;font-weight:700;letter-spacing:.04em;color:${NAVY}">${k}</span><span style="margin-left:auto;font-size:12px;font-weight:600;color:#12873f;background:#e6f6ec;border-radius:999px;padding:3px 9px">İyi</span></div>
     <div style="position:relative;margin-top:18px">${ring(pct, { d: 132, thick: 12, color: BRIGHT, track: "#e3edfb" })}
       <div style="position:absolute;inset:0;display:grid;place-content:center;text-align:center"><div style="font-size:30px;font-weight:600;letter-spacing:-.03em;color:${NAVY};line-height:1">${v}</div><div style="font-size:13px;color:${MUTED};margin-top:3px;min-height:16px">${u}</div></div></div>
     <div style="margin-top:16px;font-size:14px;font-weight:500;color:#3b4763">${d}</div>
     <div style="margin-top:3px;font-size:13px;color:${MUTED}">Hedef ${th}</div>`
  )
).join("");
const dist = card(
  "left:790px;top:514px;width:622px;height:220px;padding:24px 28px",
  `<div class="row" style="gap:12px">${iconTile("gauge", { d: 40 })}<div><div style="font-size:17px;font-weight:600;color:${NAVY}">Gerçek kullanıcı verisi</div><div style="font-size:13.5px;color:${MUTED}">Ziyaretlerin %75’i eşiğin altında olmalı</div></div><span style="margin-left:auto;font-size:13px;font-weight:600;color:#12873f;background:#e6f6ec;border-radius:999px;padding:5px 12px">Geçti</span></div>
   <div class="row" style="gap:4px;height:16px;margin-top:26px">
     <div style="flex:82;height:100%;border-radius:9px 3px 3px 9px;background:#16a34a"></div><div style="flex:12;height:100%;border-radius:3px;background:#f0a92e"></div><div style="flex:6;height:100%;border-radius:3px 9px 9px 3px;background:#e5484d"></div></div>
   <div class="row" style="gap:22px;margin-top:14px;font-size:13.5px;color:#55617b">
     <span class="row" style="gap:7px"><span style="width:9px;height:9px;border-radius:50%;background:#16a34a"></span>İyi %82</span>
     <span class="row" style="gap:7px"><span style="width:9px;height:9px;border-radius:50%;background:#f0a92e"></span>İyileştirilmeli %12</span>
     <span class="row" style="gap:7px"><span style="width:9px;height:9px;border-radius:50%;background:#e5484d"></span>Kötü %6</span></div>
   <div class="row" style="gap:10px;margin-top:20px">${[["smartphone", "Mobil"], ["monitor-smartphone", "Masaüstü"], ["shield-check", "HTTPS"]].map(([ic, t]) => `<span class="row" style="gap:8px;height:36px;padding:0 14px;border-radius:11px;background:#f3f6fb;font-size:13.5px;font-weight:500;color:${INK}">${icon(ic, { size: 15, color: BRIGHT, stroke: 2.2 })}${t}${icon("check", { size: 14, color: "#12873f", stroke: 3 })}</span>`).join("")}</div>`
);
const coverSeo = cover(false, "SEO", checklist + gauges + dist);

/* ============ 5. Marka tescil: logo + ® mühür + aşamalar ============ */
const fakeMark = (s, c1 = ROYAL, c2 = SKY) =>
  `<svg width="${s}" height="${s}" viewBox="0 0 100 100"><defs><linearGradient id="fm" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient></defs>
   <path d="M50 8 L88 30 L88 70 L50 92 L12 70 L12 30 Z" fill="url(#fm)"/><path d="M50 30 L69 41 L69 59 L50 70 L31 59 L31 41 Z" fill="#fff"/><path d="M50 30 L50 70" stroke="url(#fm)" stroke-width="6"/></svg>`;
const STEPS = [
  ["search", "Ön araştırma", "Benzer marka taraması"],
  ["layers", "Sınıf seçimi", "Mal ve hizmet listesi"],
  ["send", "Başvuru", "Örnek ve ücret"],
  ["file-search", "İnceleme", "Şeklî ve mutlak ret"],
  ["timer", "Yayın ve itiraz", "Bültende 2 ay"],
  ["badge-check", "Tescil belgesi", "10 yıl koruma"],
];
const T0 = 610, T1 = 1440, TY = 468;
const stepX = (i) => T0 + ((T1 - T0) / (STEPS.length - 1)) * i;
const timeline =
  box(`left:${T0}px;top:${TY - 1}px;width:${T1 - T0}px;height:3px;border-radius:3px;background:linear-gradient(90deg,${SKY},rgb(206 240 254/.35))`) +
  STEPS.map(([ic, t, s], i) => {
    const x = stepX(i);
    const up = i % 2 === 0;
    const done = i < 5;
    return (
      box(`left:${x - 15}px;top:${TY - 15}px;width:30px;height:30px;border-radius:50%;background:${done ? SKY : NAVY};box-shadow:0 0 0 6px rgb(68 161 241/.22)${done ? "" : `,inset 0 0 0 2px ${SKY}`};display:grid;place-items:center;font-size:13px;font-weight:700;color:${done ? NAVY : "#fff"}`, `${i + 1}`) +
      box(`left:${x - 1}px;top:${up ? TY - 46 : TY + 16}px;width:2px;height:30px;background:rgb(206 240 254/.4)`) +
      glass(
        `left:${x - 92}px;top:${up ? TY - 186 : TY + 46}px;width:184px;height:140px;padding:18px 18px;border-radius:20px`,
        `<span style="width:40px;height:40px;border-radius:12px;background:rgb(255 255 255/.14);display:grid;place-items:center">${icon(ic, { size: 20, color: ICE, stroke: 2 })}</span>
         <div style="margin-top:14px;font-size:17px;font-weight:600;letter-spacing:-.01em">${t}</div>
         <div style="margin-top:3px;font-size:13.5px;color:rgb(206 240 254/.8)">${s}</div>`
      )
    );
  }).join("");
const logoTile = card(
  "left:150px;top:230px;width:330px;height:330px;display:grid;place-items:center;border-radius:36px",
  `<div style="display:grid;justify-items:center;gap:18px">${fakeMark(150)}<div style="display:grid;gap:8px;justify-items:center">${`<div style="width:150px;height:14px;border-radius:9px;background:${NAVY}"></div><div style="width:96px;height:9px;border-radius:9px;background:#c5d2e6"></div>`}</div></div>`,
  true
);
const seal = box(
  "left:405px;top:178px;width:132px;height:132px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#3f86e6,#12419b 70%);box-shadow:0 24px 40px -18px rgb(0 6 30/.8),inset 0 0 0 5px rgb(255 255 255/.18);display:grid;place-items:center",
  `<div style="width:108px;height:108px;border-radius:50%;border:2px dashed rgb(206 240 254/.6);display:grid;place-items:center">${REG(64)}</div>`
);
const classChip = glass("left:150px;top:592px;width:330px;height:64px;border-radius:18px;display:flex;align-items:center;gap:12px;padding:0 18px", `${icon("stamp", { size: 20, color: ICE, stroke: 2 })}<span style="font-size:15.5px;font-weight:500">Sınıf 35 · 41 · 42</span><span style="margin-left:auto;font-size:13px;font-weight:600;color:${NAVY};background:${ICE};border-radius:999px;padding:4px 11px">Başvuruda</span>`);
const coverTescil = cover(true, "Marka ve Tasarım", timeline + logoTile + seal + classChip);

/* ============ 6. Pazaryeri mi, kendi site mi ============ */
const prodTile = (g, ic, price, seller) =>
  `<div style="padding:8px;border-radius:14px;background:#f5f8fd">
    <div style="height:74px;border-radius:10px;background:linear-gradient(140deg,${GRADS[g][0]},${GRADS[g][1]});display:grid;place-items:center">${icon(ic, { size: 24, color: "rgb(255 255 255/.9)", stroke: 1.8 })}</div>
    <div class="row" style="margin-top:8px;gap:4px;font-size:11.5px;color:${MUTED}">${icon("store", { size: 12, stroke: 2 })}${seller}</div>
    <div class="row" style="margin-top:2px;font-size:14px;font-weight:600;color:${INK}">${price}<span class="row" style="margin-left:auto;gap:2px;font-size:11.5px;font-weight:500;color:#b45f06">${icon("star", { size: 11, stroke: 2.4, color: "#e8a01a" })}4,6</span></div></div>`;
const PRODS = [
  [0, "package", "₺349", "Satıcı A"], [1, "shopping-bag", "₺329", "Satıcı B"], [2, "package", "₺365", "Satıcı C"], [3, "tag", "₺299", "Satıcı D"],
  [1, "tag", "₺412", "Satıcı E"], [2, "shopping-bag", "₺339", "Satıcı F"], [0, "package", "₺355", "Satıcı G"], [1, "package", "₺318", "Satıcı H"],
];
const market = card(
  "left:150px;top:222px;width:590px;height:456px;padding:26px 26px",
  `<div class="row" style="gap:14px">${iconTile("store", { d: 46, bg: "#eef1f6", c: "#3b4763" })}
     <div><div style="font-size:21px;font-weight:600;letter-spacing:-.02em;color:${NAVY}">Pazaryeri</div><div style="font-size:14px;color:${MUTED};margin-top:1px">Hazır trafik · yoğun rekabet</div></div>
     <span class="row" style="margin-left:auto;gap:6px;height:32px;padding:0 12px;border-radius:999px;background:#fff3dc;color:#b45f06;font-size:12.5px;font-weight:600">${icon("arrow-left-right", { size: 14, stroke: 2.3 })}Fiyat karşılaştırma</span></div>
   <div class="row" style="gap:8px;margin-top:18px;height:40px;padding:0 14px;border-radius:12px;background:#f3f6fb;font-size:14px;color:#a0aac0">${icon("search", { size: 16, stroke: 2.2 })}seramik kupa</div>
   <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-top:14px">${PRODS.map((p) => prodTile(...p)).join("")}</div>`
);
const own = box(
  `left:860px;top:222px;width:590px;height:456px;border-radius:24px;overflow:hidden;background:#fff;${SH_ICE}`,
  `<div class="row" style="gap:8px;height:44px;padding:0 18px;background:#fbfcfe">${["#ff5f57", "#febc2e", "#28c840"].map((c) => `<span style="width:11px;height:11px;border-radius:50%;background:${c}"></span>`).join("")}
     <div class="row" style="gap:7px;margin:0 auto;height:26px;padding:0 14px;border-radius:8px;background:#eef2f8;font-size:12.5px;color:#55617b">${icon("lock", { size: 11, stroke: 2.4, color: "#8a95ad" })}nilseramik.com</div><span style="width:46px"></span></div>
   <div class="row" style="gap:12px;padding:16px 26px">${fakeMark(30, NAVY, BRIGHT)}<span style="font-size:17px;font-weight:600;color:${NAVY};letter-spacing:.02em">Nil Seramik</span>
     <span style="margin-left:auto;font-size:13.5px;color:#55617b">Koleksiyon</span><span style="font-size:13.5px;color:#55617b">Hikâyemiz</span>${icon("shopping-cart", { size: 19, color: NAVY, stroke: 2 })}</div>
   <div style="margin:0 26px;height:236px;border-radius:18px;background:linear-gradient(130deg,#011441 0%,#12419b 55%,#44a1f1 100%);position:relative;overflow:hidden;padding:30px 30px">
     <div style="font-size:13px;font-weight:600;letter-spacing:.12em;color:${ICE}">YENİ SERİ</div>
     <div style="margin-top:10px;font-size:30px;font-weight:600;letter-spacing:-.02em;line-height:1.1;color:#fff;width:250px">El yapımı kupalar</div>
     <div class="row" style="gap:8px;margin-top:22px;width:max-content;height:42px;padding:0 18px;border-radius:12px;background:#fff;color:${NAVY};font-size:14.5px;font-weight:600">Sepete ekle${icon("arrow-right", { size: 16, stroke: 2.3 })}</div>
     <div style="position:absolute;right:34px;top:40px;width:150px;height:150px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#ffffff,#cef0fe 60%,#8fd0ff);box-shadow:0 30px 40px -20px rgb(0 0 0/.5);display:grid;place-items:center">${icon("package", { size: 54, color: ROYAL, stroke: 1.5 })}</div>
   </div>
   <div class="row" style="gap:12px;padding:18px 26px">${[
     ["badge-check", "Kendi markanız"],
     ["users", "Müşteri verisi sizde"],
     ["credit-card", "Komisyonsuz"],
   ].map(([ic, t]) => `<div class="row" style="flex:1;gap:9px;height:62px;padding:0 13px;border-radius:14px;background:#f3f6fb;font-size:13.5px;font-weight:500;color:${INK}">${iconTile(ic, { d: 32, r: 10, bg: "#fff" })}${t}</div>`).join("")}</div>`
);
const vs = box(
  `left:760px;top:420px;width:80px;height:80px;border-radius:50%;background:${NAVY};display:grid;place-items:center;box-shadow:0 0 0 8px rgb(255 255 255/.7),0 20px 40px -16px rgb(1 20 65/.6)`,
  `<span style="font-size:20px;font-weight:600;color:#fff;letter-spacing:.02em">ya da</span>`
);
const coverPazar = cover(false, "E-Ticaret", market + own + vs);

/* ============ 7. Meta kreatif testi: A/B ============ */
const feedScreen = (variant) => `
  <div style="width:390px;height:844px;background:#fff;font-family:Outfit;color:${INK};padding-top:58px">
    <div class="row" style="gap:10px;padding:10px 16px 12px">
      <span style="width:38px;height:38px;border-radius:50%;background:linear-gradient(140deg,${ROYAL},${SKY});display:grid;place-items:center">${fakeMark(22, "#fff", "#cef0fe")}</span>
      <div><div style="font-size:15px;font-weight:600">Lina Kozmetik</div><div style="font-size:12.5px;color:${MUTED}">Sponsorlu</div></div>${icon("ellipsis", { size: 20, color: "#55617b", style: "margin-left:auto" })}</div>
    <div style="position:relative;height:420px;background:${variant === "A" ? "linear-gradient(150deg,#cef0fe,#8fd0ff 55%,#2a6aca)" : "linear-gradient(160deg,#011441,#12419b 60%,#44a1f1)"};display:grid;place-items:center;overflow:hidden">
      ${variant === "A"
        ? `<div style="width:150px;height:220px;border-radius:30px 30px 18px 18px;background:linear-gradient(180deg,#fff,#e9f3ff);box-shadow:0 30px 40px -20px rgb(1 20 65/.6);display:grid;place-items:center">${fakeMark(60)}</div>
           <div style="position:absolute;left:20px;top:20px;padding:8px 14px;border-radius:999px;background:#fff;font-size:14px;font-weight:600;color:${ROYAL}">%20 indirim</div>`
        : `<div style="position:absolute;inset:0;background:radial-gradient(50% 40% at 70% 30%,rgb(206 240 254/.55),transparent)"></div>
           <span style="position:relative;width:92px;height:92px;border-radius:50%;background:rgb(255 255 255/.22);border:1.5px solid rgb(255 255 255/.5);display:grid;place-items:center">${icon("play", { size: 40, color: "#fff", stroke: 2 , style: "margin-left:6px" })}</span>
           <div style="position:absolute;left:18px;right:18px;bottom:18px"><div class="row" style="font-size:13px;color:#fff;gap:8px">${icon("volume-2", { size: 16, color: "#fff" })}<span style="margin-left:auto">0:07 / 0:15</span></div><div style="height:4px;border-radius:4px;background:rgb(255 255 255/.3);margin-top:8px"><div style="width:46%;height:100%;border-radius:4px;background:#fff"></div></div></div>`}
    </div>
    <div class="row" style="gap:10px;margin:12px 16px;height:44px;padding:0 16px;border-radius:12px;background:#eaf2ff;color:${ROYAL};font-size:15px;font-weight:600">Şimdi alışveriş yap${icon("arrow-right", { size: 17, stroke: 2.3, style: "margin-left:auto" })}</div>
    <div class="row" style="gap:18px;padding:4px 18px">${["heart", "message-circle", "send"].map((n) => icon(n, { size: 24, color: INK, stroke: 1.9 })).join("")}${icon("bookmark", { size: 24, color: INK, stroke: 1.9, style: "margin-left:auto" })}</div>
    <div style="padding:12px 18px;display:grid;gap:9px"><div style="width:200px;height:10px;border-radius:9px;background:#dfe6f1"></div><div style="width:300px;height:10px;border-radius:9px;background:#eef1f6"></div><div style="width:240px;height:10px;border-radius:9px;background:#eef1f6"></div></div>
    <div class="row" style="gap:10px;padding:14px 16px 12px;border-top:1px solid #eef1f6;margin-top:6px"><span style="width:38px;height:38px;border-radius:50%;background:#e3e9f3"></span><div style="display:grid;gap:7px"><div style="width:120px;height:10px;border-radius:9px;background:#dfe6f1"></div><div style="width:70px;height:8px;border-radius:9px;background:#eef1f6"></div></div></div>
    <div style="height:200px;background:linear-gradient(160deg,#eef4fc,#dfeafa)"></div>
  </div>`;
const PH_W = 268;
const phoneA = iphone(feedScreen("A"), { width: PH_W, style: "position:absolute;left:452px;top:180px" });
const phoneB = iphone(feedScreen("B"), { width: PH_W, style: "position:absolute;left:880px;top:180px" });
const abBadge = (l, style) => box(`${style};width:56px;height:56px;border-radius:18px;background:#fff;display:grid;place-items:center;font-size:26px;font-weight:700;color:${ROYAL};box-shadow:0 20px 40px -16px rgb(0 6 30/.7)`, l);
const scale = glass(
  "left:740px;top:390px;width:120px;height:120px;border-radius:50%;display:grid;place-items:center",
  `${icon("scale", { size: 50, color: "#fff", stroke: 1.6 })}`
);
const metric = (title, ic, rows, win) =>
  `<div class="row" style="gap:12px">${iconTile(ic, { d: 42 })}<div><div style="font-size:13px;color:${MUTED}">Kreatif</div><div style="font-size:19px;font-weight:600;color:${NAVY}">${title}</div></div>
     ${win ? `<span class="row" style="margin-left:auto;gap:5px;font-size:12.5px;font-weight:600;color:#12873f;background:#e6f6ec;border-radius:999px;padding:4px 10px">${icon("trophy", { size: 13, stroke: 2.4 })}Kazanan</span>` : ""}</div>
   <div style="display:grid;gap:8px;margin-top:16px">${rows.map(([k, v, hi]) => `<div class="row" style="height:42px;padding:0 14px;border-radius:12px;background:#f3f6fb;font-size:14px;color:#55617b">${k}<span style="margin-left:auto;font-size:17px;font-weight:600;color:${hi ? "#12873f" : INK}">${v}</span></div>`).join("")}</div>`;
const mA = card("left:150px;top:300px;width:270px;height:262px;padding:22px 20px", metric("A · Görsel", "image", [["Tıklama oranı", "%1,4"], ["Sonuç başı maliyet", "₺62"], ["Harcama", "₺4.000"]]), true);
const mB = card("left:1180px;top:300px;width:270px;height:262px;padding:22px 20px", metric("B · Video", "clapperboard", [["Tıklama oranı", "%2,3", 1], ["Sonuç başı maliyet", "₺41", 1], ["Harcama", "₺4.000"]], true), true);
const coverMeta = cover(
  true,
  "Dijital Pazarlama",
  phoneA + phoneB + scale + abBadge("A", "left:424px;top:206px") + abBadge("B", "left:1120px;top:206px") + mA + mB
);

/* ============ 8. Mobil uygulama mı, mobil site mi ============ */
const APPS = [
  ["house", ROYAL], ["shopping-cart", BRIGHT], ["bell", "#6d4ae0"], ["map-pin", "#0e8a7e"],
  ["calendar-days", SKY], ["heart", "#d9467a"], ["credit-card", "#12419b"], ["message-circle", "#2a6aca"],
];
const splitScreen = `
  <div style="width:390px;height:844px;display:flex;font-family:Outfit;color:${INK};background:#fff">
    <div style="width:194px;background:#f3f6fb;padding:62px 12px 0">
      <div class="row" style="gap:5px;height:30px;padding:0 9px;border-radius:9px;background:#fff;font-size:11px;color:#55617b;box-shadow:0 2px 8px -4px rgb(12 26 58/.2)">${icon("lock", { size: 10, stroke: 2.4, color: "#8a95ad" })}alanadiniz.com</div>
      <div class="row" style="margin-top:14px;gap:6px">${mark("navy", 18)}${icon("menu", { size: 18, color: INK, style: "margin-left:auto" })}</div>
      <div style="margin-top:16px;height:190px;border-radius:14px;background:linear-gradient(140deg,${NAVY},${BRIGHT});padding:14px"><div style="width:90px;height:9px;border-radius:9px;background:rgb(206 240 254/.7)"></div><div style="width:130px;height:14px;border-radius:9px;background:#fff;margin-top:12px"></div><div style="width:100px;height:14px;border-radius:9px;background:#fff;margin-top:8px"></div><div style="width:80px;height:28px;border-radius:9px;background:${SKY};margin-top:22px"></div></div>
      ${[0, 1, 2, 3].map(() => `<div class="row" style="gap:9px;margin-top:10px;padding:14px 10px;border-radius:12px;background:#fff"><span style="width:30px;height:30px;border-radius:9px;background:#eaf2ff"></span><div style="display:grid;gap:6px"><div style="width:90px;height:8px;border-radius:9px;background:#c9d6ea"></div><div style="width:60px;height:7px;border-radius:9px;background:#e3e9f3"></div></div></div>`).join("")}
      <div style="margin-top:12px;height:40px;border-radius:11px;background:#25d366;display:grid;place-items:center;color:#fff;font-size:12.5px;font-weight:600">WhatsApp’tan yazın</div>
    </div>
    <div style="width:2px;background:linear-gradient(180deg,${SKY},${ROYAL})"></div>
    <div style="flex:1;background:linear-gradient(170deg,#011441,#12419b);padding:70px 14px 0">
      <div style="font-size:12px;color:rgb(206 240 254/.8)">Günaydın</div><div style="font-size:17px;font-weight:600;color:#fff;margin-top:2px">Uygulamanız</div>
      <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:12px;margin-top:20px">${APPS.map(([ic, c]) => `<div style="height:96px;border-radius:18px;background:rgb(255 255 255/.1);display:grid;place-items:center"><span style="width:42px;height:42px;border-radius:13px;background:${c === ROYAL ? SKY : c};display:grid;place-items:center">${icon(ic, { size: 21, color: "#fff", stroke: 2 })}</span></div>`).join("")}</div>
      <div class="row" style="gap:9px;margin-top:16px;padding:11px;border-radius:14px;background:#fff;font-size:11.5px;font-weight:500;color:${INK}">${icon("bell", { size: 15, color: ROYAL, stroke: 2.2 })}Siparişiniz yolda</div>
    </div>
  </div>`;
const phoneSplit = iphone(splitScreen, { width: 290, style: "position:absolute;left:655px;top:164px" });
const sideCard = (title, ic, items, style) =>
  glass(
    `${style};width:330px;padding:24px 24px`,
    `<div class="row" style="gap:12px"><span style="width:44px;height:44px;border-radius:13px;background:rgb(255 255 255/.14);display:grid;place-items:center">${icon(ic, { size: 22, color: ICE, stroke: 2 })}</span><span style="font-size:20px;font-weight:600">${title}</span></div>
     <div style="display:grid;gap:12px;margin-top:18px">${items.map((t) => `<div class="row" style="gap:10px;font-size:15.5px;color:rgb(255 255 255/.9)">${icon("circle-check", { size: 17, color: SKY, stroke: 2.2 })}${t}</div>`).join("")}</div>`
  );
const coverMobil = cover(
  true,
  "Web ve Teknoloji",
  sideCard("Mobil uyumlu site", "globe", ["Arama motorunda bulunur", "Kurulum gerektirmez", "Tek bağlantıyla paylaşılır"], "left:250px;top:330px") +
    sideCard("Mobil uygulama", "app-window", ["Bildirim gönderebilir", "Cihaz özelliklerine erişir", "Mağazadan indirilir"], "left:1020px;top:330px") +
    phoneSplit
);

/* ============ 9. Kurumsal kimlik seti ============ */
const ADA = (s, c = "#fff") =>
  `<svg width="${s}" height="${s}" viewBox="0 0 100 100"><path d="M50 10 L90 86 H10 Z" fill="none" stroke="${c}" stroke-width="8" stroke-linejoin="round"/><path d="M50 44 L70 82 H30 Z" fill="${c}"/></svg>`;
const bizBack = box(
  `left:236px;top:420px;width:400px;height:230px;border-radius:18px;background:#fff;transform:rotate(5deg);${SH_ICE};padding:0 30px`,
  `<div style="position:absolute;left:30px;bottom:26px;display:grid;gap:9px;font-size:13.5px;color:#3b4763">
     <div class="row" style="gap:9px">${icon("phone", { size: 14, color: BRIGHT, stroke: 2.2 })}0212 000 00 00</div>
     <div class="row" style="gap:9px">${icon("globe", { size: 14, color: BRIGHT, stroke: 2.2 })}adamimarlik.com</div></div>
   <div style="position:absolute;right:28px;bottom:26px">${ADA(46, ROYAL)}</div>`
);
const bizFront = box(
  `left:150px;top:206px;width:400px;height:230px;border-radius:18px;background:linear-gradient(135deg,#011441,#12419b 70%,#2a6aca);transform:rotate(-6deg);box-shadow:0 40px 60px -30px rgb(1 20 65/.7);display:flex;align-items:center;gap:20px;padding:0 38px;overflow:hidden`,
  `${ADA(74, "#fff")}<div><div style="font-size:30px;font-weight:600;letter-spacing:.04em;color:#fff">ADA</div><div style="font-size:14px;letter-spacing:.32em;color:${ICE}">MİMARLIK</div></div>
   <div style="position:absolute;right:-40px;bottom:-60px;width:200px;height:200px;border-radius:50%;background:radial-gradient(circle,rgb(68 161 241/.5),transparent 70%)"></div>`
);
const SW = [
  ["Lacivert", "#011441", "#fff"],
  ["Kraliyet", "#12419b", "#fff"],
  ["Gök", "#44a1f1", "#fff"],
  ["Buz", "#cef0fe", NAVY],
];
const swatches = SW.map(([n, c, fg], i) =>
  box(
    `left:${650 + i * 124}px;top:186px;width:112px;height:300px;border-radius:18px;background:#fff;${SH_ICE};padding:8px;display:flex;flex-direction:column`,
    `<div style="flex:1;border-radius:12px;background:${c};${c === "#cef0fe" ? "box-shadow:inset 0 0 0 1px #b8dff3" : ""}"></div>
     <div style="padding:12px 6px 6px"><div style="font-size:15px;font-weight:600;color:${NAVY}">${n}</div><div style="font-size:12.5px;color:${MUTED};margin-top:2px">${c.toUpperCase()}</div></div>`
  )
).join("");
const typeCard = card(
  "left:650px;top:512px;width:484px;height:206px;padding:24px 28px;display:flex;gap:26px;align-items:center",
  `<div style="font-size:110px;font-weight:600;letter-spacing:-.04em;line-height:1;color:${NAVY}">Aa</div>
   <div><div style="font-size:13px;font-weight:600;letter-spacing:.12em;color:${BRIGHT}">YAZI TİPİ</div><div style="font-size:26px;font-weight:600;color:${NAVY};margin-top:4px">Outfit</div>
     <div style="display:grid;gap:4px;margin-top:10px;font-size:15px;color:#3b4763"><span style="font-weight:300">İnce · Light</span><span style="font-weight:500">Orta · Medium</span><span style="font-weight:700">Kalın · Bold</span></div></div>`
);
const profileScreen = `
  <div style="width:390px;height:844px;background:#fff;font-family:Outfit;color:${INK};padding:70px 22px 0">
    <div class="row" style="gap:18px"><span style="width:96px;height:96px;border-radius:50%;background:linear-gradient(135deg,#011441,#12419b);display:grid;place-items:center;box-shadow:0 0 0 4px #fff,0 0 0 6px ${SKY}">${ADA(50)}</span>
      <div class="row" style="flex:1;justify-content:space-around;text-align:center">${[["128", "Gönderi"], ["4,2B", "Takipçi"], ["180", "Takip"]].map(([v, l]) => `<div><div style="font-size:19px;font-weight:600">${v}</div><div style="font-size:13px;color:${MUTED}">${l}</div></div>`).join("")}</div></div>
    <div style="font-size:17px;font-weight:600;margin-top:16px">Ada Mimarlık</div><div style="font-size:14px;color:#55617b;margin-top:2px">İç mimari ve proje tasarımı</div>
    <div class="row" style="gap:8px;margin-top:16px"><div style="flex:1;height:38px;border-radius:10px;background:${ROYAL};display:grid;place-items:center;color:#fff;font-size:14px;font-weight:600">Takip et</div><div style="flex:1;height:38px;border-radius:10px;background:#eef2f8;display:grid;place-items:center;font-size:14px;font-weight:600">Mesaj</div></div>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:4px;margin:22px -22px 0">${[0, 1, 2, 3, 1, 0, 2, 3, 0, 1, 3, 2].map((g, i) => `<div style="aspect-ratio:1;background:linear-gradient(${120 + i * 20}deg,${GRADS[g][0]},${GRADS[g][1]});display:grid;place-items:center">${i % 4 === 1 ? ADA(36, "rgb(255 255 255/.85)") : ""}</div>`).join("")}</div>
  </div>`;
const phoneProf = iphone(profileScreen, { width: 260, style: "position:absolute;left:1190px;top:176px" });
const coverKimlik = cover(false, "Marka ve Tasarım", bizBack + bizFront + swatches + typeCard + phoneProf);

/* ============ 10. Yapay zekâ özetli arama sonucu ============ */
const SRC = [
  ["sizinsiteniz.com", "Kurumsal site süreci: 6 adım", true],
  ["webrehberi-ornek.com", "Proje takvimi nasıl çıkarılır?", false],
  ["kobi-kaynak.org", "İçerik hazırlığı kontrol listesi", false],
];
const searchBox = box(
  "left:250px;top:186px;width:1100px;height:78px;border-radius:999px;background:rgb(255 255 255/.96);display:flex;align-items:center;gap:16px;padding:0 14px 0 30px;box-shadow:0 0 0 6px rgb(68 161 241/.25),0 0 60px 10px rgb(68 161 241/.35),0 30px 60px -30px rgb(0 6 30/.8)",
  `${icon("search", { size: 24, color: ROYAL, stroke: 2.2 })}<span style="font-size:21px;color:${INK}">kurumsal web sitesi kaç haftada hazırlanır?</span>
   <span style="margin-left:auto;width:52px;height:52px;border-radius:50%;background:linear-gradient(135deg,${ROYAL},${SKY});display:grid;place-items:center">${icon("sparkles", { size: 22, color: "#fff", stroke: 2 })}</span>`
);
const cite = (n, on) => `<span style="display:inline-grid;place-items:center;width:24px;height:24px;border-radius:7px;font-size:13px;font-weight:700;vertical-align:2px;margin:0 2px;${on ? `background:${SKY};color:${NAVY}` : "background:rgb(255 255 255/.18);color:#fff"}">${n}</span>`;
const summary = glass(
  "left:250px;top:304px;width:660px;height:426px;padding:30px 34px;border-radius:26px",
  `<div class="row" style="gap:12px"><span style="width:40px;height:40px;border-radius:12px;background:linear-gradient(135deg,${ROYAL},${SKY});display:grid;place-items:center">${icon("sparkles", { size: 20, color: "#fff", stroke: 2 })}</span>
     <span style="font-size:19px;font-weight:600">Yapay zekâ özeti</span><span style="margin-left:auto;font-size:13px;color:rgb(206 240 254/.75)">3 kaynaktan derlendi</span></div>
   <div style="margin-top:22px;font-size:18px;line-height:1.6;color:rgb(255 255 255/.92)">Süre; sayfa sayısına, içeriğin hazır olmasına ve yönetim paneli ihtiyacına göre değişir.${cite(1, true)} Teslim tarihleri takvime baştan yazılmalı.${cite(2)}</div>
   <div style="display:grid;gap:12px;margin-top:22px">
     ${[["Hedef ve kapsamın netleşmesi", 1], ["Metin ve görsellerin teslimi", 3], ["Test, hız ve ölçüm kurulumu", 1]].map(([t, n]) => `<div class="row" style="gap:12px;font-size:16px;color:rgb(255 255 255/.88)"><span style="width:7px;height:7px;border-radius:50%;background:${SKY}"></span>${t}${cite(n, n === 1)}</div>`).join("")}
   </div>
   <div style="display:grid;gap:9px;margin-top:24px"><div style="width:520px;height:9px;border-radius:9px;background:rgb(255 255 255/.16)"></div><div style="width:400px;height:9px;border-radius:9px;background:rgb(255 255 255/.1)"></div><div style="width:460px;height:9px;border-radius:9px;background:rgb(255 255 255/.1)"></div></div>`
);
const srcCards = SRC.map(([d, t, me], i) =>
  card(
    `left:1010px;top:${304 + i * 150}px;width:340px;height:126px;padding:20px 22px;${me ? `box-shadow:0 0 0 3px ${SKY},0 0 50px 4px rgb(68 161 241/.45),0 40px 80px -30px rgb(0 6 30/.8)` : ""}`,
    `<div class="row" style="gap:12px"><span style="width:34px;height:34px;border-radius:10px;background:${me ? NAVY : "#eef1f6"};display:grid;place-items:center">${me ? mark("white", 18) : icon("globe", { size: 17, color: "#55617b", stroke: 2 })}</span>
       <span style="font-size:14px;color:#55617b">${d}</span><span style="margin-left:auto;width:28px;height:28px;border-radius:8px;display:grid;place-items:center;font-size:13.5px;font-weight:700;${me ? `background:${SKY};color:${NAVY}` : `background:#eef1f6;color:#55617b`}">${i + 1}</span></div>
     <div style="margin-top:14px;font-size:17px;font-weight:600;color:${NAVY}">${t}</div>
     ${me ? `<div class="row" style="gap:6px;margin-top:4px;font-size:12.5px;font-weight:600;color:${BRIGHT}">${icon("link", { size: 13, stroke: 2.4 })}Özette kaynak gösterildi</div>` : `<div style="width:180px;height:8px;border-radius:9px;background:#eef1f6;margin-top:10px"></div>`}`,
    true
  )
).join("");
const links = `<svg style="position:absolute;left:0;top:0" width="${W}" height="${H}">${SRC.map((_, i) => {
  const y = 367 + i * 150;
  return `<path d="M910 ${470 + i * 34} C960 ${470 + i * 34} 960 ${y} 1010 ${y}" fill="none" stroke="${i === 0 ? SKY : "rgb(206 240 254/.35)"}" stroke-width="${i === 0 ? 2.5 : 1.5}" ${i ? 'stroke-dasharray="5 6"' : ""}/>
          <circle cx="910" cy="${470 + i * 34}" r="4" fill="${i === 0 ? SKY : "rgb(206 240 254/.6)"}"/>`;
}).join("")}</svg>`;
const coverAi = cover(true, "SEO", links + summary + srcCards + searchBox);

export const BLOG = [
  ["sosyal-medya-icerik-takvimi-nasil-hazirlanir", coverTakvim],
  ["kurumsal-web-sitesi-yaptirmadan-once-sorulacak-6-soru", coverWeb],
  ["google-ads-donusum-takibi-ve-ga4-kurulum-rehberi", coverDonusum],
  ["2026-teknik-seo-kontrol-listesi-core-web-vitals", coverSeo],
  ["marka-tescil-sureci-adim-adim-turkpatent", coverTescil],
  ["e-ticarette-pazaryeri-mi-kendi-site-mi", coverPazar],
  ["meta-reklamlarinda-kreatif-test-nasil-yapilir", coverMeta],
  ["mobil-uygulama-mi-mobil-uyumlu-site-mi", coverMobil],
  ["kobiler-icin-kurumsal-kimlik-rehberi", coverKimlik],
  ["yapay-zeka-arama-sonuclari-ai-overviews-caginda-seo", coverAi],
];

/* ================= EKİP PORTRE KARTLARI (1000x1250) ================= */
const TW = 1000, TH = 1250;
const frag = (style, html, o = 1) =>
  box(`background:rgb(255 255 255/.94);border-radius:22px;padding:20px 22px;color:${INK};box-shadow:0 40px 80px -36px rgb(0 6 30/.8);opacity:${o};${style}`, html);
const gfrag = (style, html) => glass(`border-radius:22px;padding:20px 22px;${style}`, html);
const monogram = (txt) =>
  box(
    "left:250px;top:380px;width:500px;height:500px;border-radius:50%;display:grid;place-items:center;background:radial-gradient(circle at 30% 22%,rgb(255 255 255/.34),rgb(255 255 255/.08) 55%,rgb(255 255 255/.04));border:1.5px solid rgb(255 255 255/.38);backdrop-filter:blur(22px) saturate(1.2);-webkit-backdrop-filter:blur(22px) saturate(1.2);box-shadow:inset 0 2px 0 rgb(255 255 255/.35),inset 0 -30px 60px -30px rgb(68 161 241/.45),0 60px 120px -40px rgb(0 6 30/.9)",
    `<div style="font-size:${txt.length > 1 ? 210 : 250}px;font-weight:600;letter-spacing:-.04em;line-height:1;background:linear-gradient(170deg,#ffffff 20%,#cef0fe 70%,#8fd0ff);-webkit-background-clip:text;background-clip:text;color:transparent;padding-bottom:12px">${txt}</div>`
  );
const ring2 = box("left:200px;top:330px;width:600px;height:600px;border-radius:50%;border:1px dashed rgb(206 240 254/.28)");
const glow = (x, y, c, s = 520) => box(`left:${x - s / 2}px;top:${y - s / 2}px;width:${s}px;height:${s}px;border-radius:50%;background:radial-gradient(circle,${c},transparent 68%)`);
const orbitIcons = (ics) =>
  ics.map(([ic, ang]) => {
    const r = 300, cx = 500, cy = 630;
    const x = cx + r * Math.cos((ang * Math.PI) / 180), y = cy + r * Math.sin((ang * Math.PI) / 180);
    return box(`left:${x - 34}px;top:${y - 34}px;width:68px;height:68px;border-radius:20px;background:linear-gradient(140deg,${BRIGHT},${ROYAL});display:grid;place-items:center;box-shadow:0 0 0 6px rgb(1 20 65/.5),0 20px 40px -16px rgb(0 6 30/.8)`, icon(ic, { size: 30, color: "#fff", stroke: 2 }));
  }).join("");
const teamPage = (body, glowC) =>
  page({ w: TW, h: TH, bg: BG.navy, body: `${glow(780, 260, glowC, 700)}${glow(160, 1080, "rgb(68 161 241/.35)", 640)}${grainLayer(0.06)}${body}${mark("white", 40, "position:absolute;left:60px;top:60px;opacity:.9")}` });

const teamAdil = teamPage(
  frag("left:470px;top:70px;width:440px;height:236px", `<div class="row" style="gap:10px">${iconTile("megaphone", { d: 38 })}<span style="font-size:17px;font-weight:600">Reklam performansı</span><span style="margin-left:auto;font-size:14px;font-weight:600;color:#12873f">+%38</span></div>
    <svg width="396" height="130" style="margin-top:16px">${[52, 70, 60, 88, 78, 104, 122].map((v, i) => `<rect x="${i * 57 + 6}" y="${130 - v}" width="40" height="${v}" rx="9" fill="${i === 6 ? ROYAL : "#cfe0fb"}"/>`).join("")}</svg>`) +
    frag("left:60px;top:960px;width:420px;height:196px", `<div class="row" style="gap:10px">${iconTile("search", { d: 38 })}<span style="font-size:17px;font-weight:600">Arama sıralaması</span></div>
    ${[["1", "kurumsal web tasarım", "#eaf2ff"], ["3", "dijital reklam ajansı", "#f5f8fd"]].map(([n, t, bg]) => `<div class="row" style="gap:12px;height:44px;padding:0 14px;border-radius:12px;background:${bg};margin-top:10px;font-size:15px"><span style="font-weight:700;color:${ROYAL}">${n}.</span>${t}${icon("trending-up", { size: 16, color: "#12873f", stroke: 2.4, style: "margin-left:auto" })}</div>`).join("")}`) +
    box("left:640px;top:960px;width:250px;height:250px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#3f86e6,#12419b 70%);box-shadow:0 30px 60px -24px rgb(0 6 30/.9),inset 0 0 0 7px rgb(255 255 255/.16);display:grid;place-items:center",
      `<div style="width:206px;height:206px;border-radius:50%;border:2.5px dashed rgb(206 240 254/.55);display:grid;place-items:center">${REG(120)}</div>`) +
    ring2 + monogram("AC") + orbitIcons([["chart-line", 200], ["target", 340]]),
  "rgb(68 161 241/.45)"
);

const code = [
  [["#8fd0ff", "export"], ["#fff", " function"], ["#cef0fe", " Hero"], ["#fff", "() {"]],
  [["#8fd0ff", "  return"], ["#fff", " ("]],
  [["#44a1f1", "    <section"], ["#cef0fe", " className"], ["#fff", "="], ["#a5f3c4", '"hero"'], ["#44a1f1", ">"]],
  [["#44a1f1", "      <h1>"], ["#fff", "Merhaba"], ["#44a1f1", "</h1>"]],
  [["#44a1f1", "    </section>"]],
  [["#fff", "  );"]],
  [["#fff", "}"]],
];
const teamFurkan = teamPage(
  gfrag("left:60px;top:96px;width:520px;height:270px;background:linear-gradient(160deg,rgb(1 20 65/.85),rgb(18 65 155/.6))",
    `<div class="row" style="gap:7px">${["#ff5f57", "#febc2e", "#28c840"].map((c) => `<span style="width:11px;height:11px;border-radius:50%;background:${c}"></span>`).join("")}<span style="margin-left:14px;font-size:14px;color:rgb(206 240 254/.75)">Hero.tsx</span></div>
     <div style="margin-top:18px;font-family:Menlo,monospace;font-size:16px;line-height:1.6;white-space:pre">${code.map((l, i) => `<div><span style="color:rgb(206 240 254/.35);display:inline-block;width:28px">${i + 1}</span>${l.map(([c, t]) => `<span style="color:${c}">${t.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</span>`).join("")}</div>`).join("")}</div>`) +
    frag("left:560px;top:930px;width:380px;height:260px;padding:0;overflow:hidden",
      `<div class="row" style="gap:7px;height:40px;padding:0 16px;background:#f3f6fb">${["#ff5f57", "#febc2e", "#28c840"].map((c) => `<span style="width:10px;height:10px;border-radius:50%;background:${c}"></span>`).join("")}<div style="margin-left:auto;margin-right:auto;width:150px;height:20px;border-radius:7px;background:#e3e9f3"></div></div>
       <div style="padding:18px 20px"><div class="row" style="gap:10px">${mark("navy", 20)}<div style="margin-left:auto;width:120px;height:8px;border-radius:9px;background:#dfe6f1"></div></div>
       <div style="margin-top:20px;height:110px;border-radius:14px;background:linear-gradient(130deg,${NAVY},${BRIGHT});padding:18px"><div style="width:150px;height:12px;border-radius:9px;background:#fff"></div><div style="width:110px;height:12px;border-radius:9px;background:#fff;margin-top:8px"></div><div style="width:80px;height:24px;border-radius:8px;background:${SKY};margin-top:16px"></div></div></div>`) +
    gfrag("left:60px;top:1010px;width:400px;height:120px;display:flex;align-items:center;gap:16px",
      `<span style="width:52px;height:52px;border-radius:15px;background:rgb(255 255 255/.14);display:grid;place-items:center">${icon("terminal", { size: 26, color: ICE, stroke: 2 })}</span><div style="font-family:Menlo,monospace;font-size:16px;color:#cef0fe">npm run build<div style="color:#a5f3c4;font-size:14px;margin-top:4px">✓ derleme tamamlandı</div></div>`) +
    ring2 + monogram("F") + orbitIcons([["braces", 330], ["git-branch", 160]]),
  "rgb(42 106 202/.55)"
);

const teamOnur = teamPage(
  box("left:710px;top:60px;width:250px;height:480px;border-radius:46px;background:linear-gradient(135deg,#9aa0aa,#3c4048 18%,#24272d 50%,#4a4f58 82%,#a3a8b1);padding:9px;box-shadow:0 60px 100px -40px rgb(0 6 30/.9);opacity:.95",
    `<div style="width:100%;height:100%;border-radius:38px;background:#fff;padding:40px 14px 0;overflow:hidden">
      <div class="row"><span style="font-size:19px;font-weight:600;color:${NAVY}">Mağaza</span>${icon("shopping-cart", { size: 20, color: NAVY, style: "margin-left:auto" })}</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:16px">${[0, 1, 2, 3].map((g) => `<div style="border-radius:14px;background:#f3f6fb;padding:7px"><div style="height:66px;border-radius:10px;background:linear-gradient(140deg,${GRADS[g][0]},${GRADS[g][1]})"></div><div style="width:70px;height:7px;border-radius:9px;background:#c9d6ea;margin-top:9px"></div><div style="font-size:14px;font-weight:600;color:${INK};margin-top:6px">₺${[349, 520, 289, 410][g]}</div></div>`).join("")}</div>
      <div style="margin-top:14px;height:44px;border-radius:12px;background:${ROYAL};display:grid;place-items:center;color:#fff;font-size:14px;font-weight:600">Sepete ekle</div></div>`) +
    frag("left:60px;top:150px;width:380px;height:150px", `<div class="row" style="gap:12px">${iconTile("bell", { d: 42 })}<div><div style="font-size:13px;color:${MUTED}">Bildirim · şimdi</div><div style="font-size:17px;font-weight:600;margin-top:2px">Siparişiniz kargoya verildi</div></div></div>
      <div style="height:7px;border-radius:9px;background:#e3edfb;margin-top:22px"><div style="width:66%;height:100%;border-radius:9px;background:linear-gradient(90deg,${ROYAL},${SKY})"></div></div>`) +
    frag("left:70px;top:950px;width:420px;height:210px", `<div class="row" style="gap:12px">${iconTile("shopping-bag", { d: 42 })}<span style="font-size:17px;font-weight:600">Sepet özeti</span><span style="margin-left:auto;font-size:14px;color:${MUTED}">3 ürün</span></div>
      <div class="row" style="margin-top:18px;font-size:15px;color:#55617b">Ara toplam<span style="margin-left:auto;color:${INK};font-weight:500">₺1.180</span></div>
      <div class="row" style="margin-top:8px;font-size:15px;color:#55617b">Kargo<span style="margin-left:auto;color:#12873f;font-weight:600">Ücretsiz</span></div>
      <div class="row" style="margin-top:12px;padding-top:12px;border-top:1px solid #e3e9f3;font-size:17px;font-weight:600">Toplam<span style="margin-left:auto;color:${ROYAL}">₺1.180</span></div>`) +
    gfrag("left:640px;top:1010px;width:290px;height:150px;display:grid;grid-template-columns:repeat(3,1fr);gap:10px;align-items:center;justify-items:center",
      [["house", SKY], ["credit-card", "#6d4ae0"], ["truck", "#0e8a7e"]].map(([ic, c]) => `<span style="width:64px;height:64px;border-radius:19px;background:${c};display:grid;place-items:center">${icon(ic, { size: 30, color: "#fff", stroke: 2 })}</span>`).join("")) +
    ring2 + monogram("O") + orbitIcons([["smartphone", 200], ["package", 20]]),
  "rgb(68 161 241/.45)"
);

const teamYasemin = teamPage(
  frag("left:60px;top:150px;width:430px;height:210px", `<div class="row" style="gap:10px">${iconTile("palette", { d: 38 })}<span style="font-size:17px;font-weight:600">Renk paleti</span></div>
    <div class="row" style="gap:10px;margin-top:18px">${["#011441", "#12419b", "#2a6aca", "#44a1f1", "#cef0fe"].map((c) => `<div style="flex:1"><div style="height:74px;border-radius:14px;background:${c};${c === "#cef0fe" ? "box-shadow:inset 0 0 0 1px #b8dff3" : ""}"></div><div style="font-size:11.5px;color:${MUTED};margin-top:7px;text-align:center">${c.slice(1).toUpperCase()}</div></div>`).join("")}</div>`) +
    box("left:560px;top:80px;width:380px;height:300px", `<svg width="380" height="300" viewBox="0 0 380 300"><path d="M30 250 C 90 40, 250 40, 350 200" fill="none" stroke="#cef0fe" stroke-width="5" stroke-linecap="round"/>
      <line x1="30" y1="250" x2="90" y2="60" stroke="rgb(206 240 254/.5)" stroke-width="2"/><line x1="350" y1="200" x2="270" y2="40" stroke="rgb(206 240 254/.5)" stroke-width="2"/>
      ${[[30, 250], [350, 200]].map(([x, y]) => `<rect x="${x - 11}" y="${y - 11}" width="22" height="22" rx="4" fill="#fff" stroke="${SKY}" stroke-width="4"/>`).join("")}
      ${[[90, 60], [270, 40]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="9" fill="${SKY}"/>`).join("")}</svg>
      <span style="position:absolute;left:150px;top:150px;width:72px;height:72px;border-radius:20px;background:linear-gradient(140deg,${BRIGHT},${ROYAL});display:grid;place-items:center;box-shadow:0 20px 40px -16px rgb(0 6 30/.8)">${icon("pen-tool", { size: 34, color: "#fff", stroke: 2 })}</span>`) +
    frag("left:60px;top:930px;width:330px;height:260px;padding:14px", `<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px">${[0, 2, 1, 3, 0, 2, 1, 3, 0].map((g, i) => `<div style="height:72px;border-radius:9px;background:linear-gradient(${120 + i * 25}deg,${GRADS[g][0]},${GRADS[g][1]});display:grid;place-items:center">${i === 4 ? icon("heart", { size: 24, color: "#fff", stroke: 2 }) : ""}</div>`).join("")}</div>`) +
    frag("left:600px;top:960px;width:340px;height:200px;display:flex;align-items:center;gap:22px", `<div style="font-size:104px;font-weight:600;letter-spacing:-.04em;line-height:1;color:${NAVY}">Aa</div><div><div style="font-size:13px;font-weight:600;letter-spacing:.12em;color:${BRIGHT}">TİPOGRAFİ</div><div style="display:grid;gap:3px;margin-top:8px;font-size:15px;color:#3b4763"><span style="font-weight:300">Light</span><span style="font-weight:500">Medium</span><span style="font-weight:700">Bold</span></div></div>`) +
    ring2 + monogram("Y") + orbitIcons([["image", 340], ["layers", 160]]),
  "rgb(109 74 224/.4)"
);

export const TEAM = [
  ["adil-can", teamAdil],
  ["furkan", teamFurkan],
  ["onur", teamOnur],
  ["yasemin", teamYasemin],
];

/* ================= MÜŞTERİ VİDEO YORUMU YER TUTUCULARI (1080x1350) ================= */
const VW = 1080, VH = 1350;
const blob = (x, y, s, c) => box(`left:${x - s / 2}px;top:${y - s / 2}px;width:${s}px;height:${s}px;border-radius:50%;background:${c};filter:blur(90px)`);
const video = (sector, ic, blobs, dur, prog) =>
  page({
    w: VW,
    h: VH,
    bg: `background:#011441;`,
    body: `${blobs.map((b) => blob(...b)).join("")}
      <div style="position:absolute;inset:0;background:radial-gradient(70% 55% at 50% 45%,transparent,rgb(1 10 40/.45))"></div>
      ${grainLayer(0.09)}
      <div style="position:absolute;left:0;right:0;bottom:0;height:520px;background:linear-gradient(180deg,transparent,rgb(1 10 40/.88))"></div>
      ${box("left:60px;top:60px;height:48px;display:flex;align-items:center;gap:12px;padding:0 20px 0 14px;border-radius:999px;background:rgb(255 255 255/.12);border:1px solid rgb(255 255 255/.22);backdrop-filter:blur(14px);font-size:18px;font-weight:500;color:#fff", `${mark("white", 24)}Video yorum`)}
      ${box("right:60px;top:60px;width:48px;height:48px;border-radius:50%;background:rgb(255 255 255/.12);border:1px solid rgb(255 255 255/.22);display:grid;place-items:center", icon("volume-2", { size: 22, color: "#fff", stroke: 2 }))}
      ${box("left:390px;top:525px;width:300px;height:300px;border-radius:50%;border:1px solid rgb(255 255 255/.18)")}
      ${box("left:430px;top:565px;width:220px;height:220px;border-radius:50%;display:grid;place-items:center;background:radial-gradient(circle at 30% 25%,rgb(255 255 255/.38),rgb(255 255 255/.12) 60%);border:1.5px solid rgb(255 255 255/.45);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);box-shadow:inset 0 2px 0 rgb(255 255 255/.35),0 40px 80px -30px rgb(0 6 30/.9)",
        `<svg width="84" height="84" viewBox="0 0 24 24" style="margin-left:12px"><path d="M7 4.5v15a1 1 0 0 0 1.5.86l12.5-7.5a1 1 0 0 0 0-1.72L8.5 3.64A1 1 0 0 0 7 4.5z" fill="#fff"/></svg>`)}
      ${box("left:60px;right:60px;bottom:170px", `<div class="row" style="gap:14px"><span class="row" style="gap:9px;height:44px;padding:0 18px;border-radius:999px;background:${ICE};color:${NAVY};font-size:18px;font-weight:600">${icon(ic, { size: 20, stroke: 2.2 })}${sector}</span></div>
         <div style="margin-top:22px;font-size:60px;font-weight:600;letter-spacing:-.03em;color:#fff;line-height:1.05">Müşteri yorumu</div>`)}
      ${box("left:60px;right:60px;bottom:70px", `<div style="height:6px;border-radius:6px;background:rgb(255 255 255/.25)"><div style="width:${prog}%;height:100%;border-radius:6px;background:linear-gradient(90deg,${SKY},#fff)"></div></div>
         <div class="row" style="margin-top:16px;gap:20px;font-size:18px;color:rgb(255 255 255/.85)">${icon("play", { size: 22, color: "#fff", stroke: 2.2 })}<span>0:00 / ${dur}</span><span class="row" style="margin-left:auto;gap:20px">${icon("captions", { size: 24, color: "#fff", stroke: 2 })}${icon("maximize", { size: 22, color: "#fff", stroke: 2 })}</span></div>`)}`,
  });
export const TESTI = [
  ["ornek-1", video("Sağlık", "stethoscope", [[260, 300, 620, "#2a6aca"], [880, 760, 680, "#0e8a9e"], [400, 1150, 560, "#12419b"], [820, 220, 380, "#cef0fe"]], "1:12", 0)],
  ["ornek-2", video("E-ticaret", "shopping-bag", [[800, 300, 640, "#44a1f1"], [200, 780, 620, "#6d4ae0"], [760, 1160, 560, "#12419b"], [260, 220, 360, "#cef0fe"]], "0:58", 0)],
  ["ornek-3", video("Turizm", "plane", [[300, 280, 600, "#1aa9c4"], [860, 640, 640, "#2a6aca"], [260, 1100, 600, "#12419b"], [900, 1180, 340, "#8fe6f2"]], "1:24", 0)],
];

export const ICERIK_SCENES = [
  ...BLOG.map(([slug, html]) => ({ name: `blog__${slug}`, w: W, h: H, html })),
  ...TEAM.map(([n, html]) => ({ name: `team__${n}`, w: TW, h: TH, html })),
  ...TESTI.map(([n, html]) => ({ name: `testimonials__${n}`, w: VW, h: VH, html })),
];
