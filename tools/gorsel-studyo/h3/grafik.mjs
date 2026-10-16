// Grafik Tasarım v4: katalog PSD'lerinin katmanlarından çıkan HAM tasarımlar (şeffaf paketler, düz katalog
// sayfaları, kesilmiş ürünler, logolar) ürün görselleri dilinde (lacivert ışık zemini, yüzen kart) kurulur.
import { fileUrl, floatCard, grainLayer, icon, page, ROOT, THEME, themeBg } from "../lib.mjs";
import { floor, glow, lockup } from "./real.mjs";

const G = (f) => fileUrl(`${ROOT}/tools/gorsel-studyo/kaynak/katalog/grafik/${f}`);
const KI = (f) => fileUrl(`${ROOT}/tools/gorsel-studyo/kaynak/katalog/${f}`);
const LOGO = (f) => fileUrl(`${ROOT}/public/references/${f}.png`);
const TG = THEME.chatbot;
const ACC = "#2a6aca";
const SOUR = { "blue-raspberry": 917 / 1400, karpuz: 497 / 755, kola: 496 / 758, cilek: 500 / 762, elma: 497 / 755, gokkusagi: 497 / 755 };

/* Ürün kesiti: yükseklik verilir, altında zemin gölgesi */
const product = (src, ratio, x, y, h, r = 0, shadow = true) => {
  const w = Math.round(h * ratio);
  return `${shadow ? floor(x - w * 0.05, y + h - h * 0.05, w * 1.1, h * 0.1, 0.55) : ""}<img src="${src}" style="position:absolute;left:${x}px;top:${y}px;height:${h}px;width:${w}px;transform:rotate(${r}deg);filter:drop-shadow(0 ${h * 0.06}px ${h * 0.06}px rgb(0 6 26/.5))">`;
};
const pouch = (n, x, y, h, r = 0) => product(G(`sour-${n}.png`), SOUR[n], x, y, h, r);
/* Katalog: kapak (sırt gölgeli) ve açık sayfa (orta katlama gölgeli) */
const PAGE = 1385 / 1959;
const cover = (f, x, y, w, r = 0) => `${floor(x, y + w / 0.707 - 20, w, 50, 0.55)}<div style="position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${Math.round(w / 0.707)}px;transform:rotate(${r}deg);border-radius:4px 10px 10px 4px;background:#fff url('${G(f)}') 50% 50%/cover;box-shadow:0 50px 80px -34px rgb(0 6 26/.8),0 0 0 1px rgb(255 255 255/.15)"><div style="position:absolute;inset:0;border-radius:inherit;background:linear-gradient(90deg,rgb(0 0 0/.28) 0%,rgb(255 255 255/.18) 2.2%,rgb(0 0 0/0) 6%)"></div></div>`;
const spread = (l, rgt, x, y, w, r = 0, tilt = 8) => {
  const pw = w / 2, ph = Math.round(pw / PAGE);
  return `${floor(x, y + ph - 26, w, 60, 0.6)}<div style="position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${ph}px;transform:perspective(2600px) rotateX(${tilt}deg) rotate(${r}deg);display:flex;box-shadow:0 60px 90px -40px rgb(0 6 26/.8)">
    <div style="width:${pw}px;height:100%;background:#fff url('${G(l)}') 50% 50%/cover;border-radius:6px 0 0 6px;position:relative"><div style="position:absolute;inset:0;background:linear-gradient(90deg,rgb(0 0 0/0) 78%,rgb(0 0 0/.22) 100%)"></div></div>
    <div style="width:${pw}px;height:100%;background:#fff url('${G(rgt)}') 50% 50%/cover;border-radius:0 6px 6px 0;position:relative"><div style="position:absolute;inset:0;background:linear-gradient(90deg,rgb(0 0 0/.25) 0%,rgb(255 255 255/.08) 5%,rgb(0 0 0/0) 22%)"></div></div>
  </div>`;
};
/* Marka kartı: gerçek logo (ya da ad) + iş türü + ne yapıldı + etiketler */
const card = ({ logo, name, lh = 40, kind, what, chips = [] }) => `${logo ? `<img src="${LOGO(logo)}" style="height:${lh}px;display:block;max-width:300px;object-fit:contain">` : `<div style="font-size:26px;font-weight:700;letter-spacing:-.01em">${name}</div>`}
   <div style="margin-top:16px;font-size:13px;font-weight:600;letter-spacing:.08em;color:${ACC}">${kind.toLocaleUpperCase("tr-TR")}</div>
   <div style="margin-top:4px;font-size:21px;font-weight:600;line-height:1.25">${what}</div>
   ${chips.length ? `<div class="row" style="gap:8px;margin-top:14px;flex-wrap:wrap">${chips.map((c) => `<span style="height:32px;padding:0 14px;border-radius:999px;background:#eef3fb;font:500 14px Outfit;color:#2b3a5c;display:inline-flex;align-items:center">${c}</span>`).join("")}</div>` : ""}`;
const tile = (body) => page({ w: 1200, h: 900, bg: themeBg(TG), body: `${glow(80, 220, 1040, 640)}${body}${grainLayer(0.06)}` });

const tiles = () => [
  /* 1) Veggy Snacky Sour: altı aromalı ürün ailesi */
  tile(`${[["karpuz", 40, 370, 400, -9], ["kola", 205, 340, 420, -5], ["gokkusagi", 760, 340, 420, 5], ["elma", 925, 370, 400, 9], ["cilek", 380, 310, 460, -2], ["blue-raspberry", 560, 310, 460, 2]].map(([n, x, y, h, r]) => pouch(n, x, y, h, r)).join("")}
    ${floatCard(card({ logo: "veggy-snacky", lh: 62, kind: "Ambalaj tasarımı", what: "Sour ürün ailesi, altı aroma", chips: ["Etiket tasarımı", "Ürün ailesi"] }), "left:56px;top:48px;width:400px")}`),
  /* 2) Veggy Snacky: kavanoz etiketi ve ayçekirdeği paketi */
  tile(`${product(G("kavanoz.png"), 1090 / 1400, 120, 250, 560)}${product(G("cekirdek.png"), 770 / 981, 560, 210, 600, 0, true)}
    ${floatCard(card({ logo: "veggy-snacky", lh: 62, kind: "Ambalaj tasarımı", what: "Kavanoz etiketi ve paket tasarımı", chips: ["Kakaolu fındık kreması", "Tuzlu ayçekirdeği"] }), "left:790px;top:60px;width:360px")}`),
  /* 3) Lion Klinker: el yapımı tuğla kataloğu */
  tile(`${cover("lionklinker-kapak.jpg", 80, 290, 310, -7)}${spread("lionklinker-sol.jpg", "lionklinker-sag.jpg", 440, 300, 700, 3)}
    ${floatCard(card({ logo: "lionklinker", lh: 44, kind: "Katalog tasarımı", what: "El yapımı tuğla kataloğu", chips: ["Kapak", "Ürün sayfaları", "Seri ve ölçüler"] }), "left:56px;top:48px;width:400px")}`),
  /* 4) Soiltech: İngilizce tanıtım kataloğu */
  tile(`${spread("soiltech-sol.jpg", "soiltech-sag.jpg", 380, 330, 760, -2)}${cover("soiltech-kapak.jpg", 70, 290, 330, -6)}
    ${floatCard(card({ name: "Soiltech", kind: "Katalog tasarımı", what: "Gemi bakım ve onarım firması için İngilizce tanıtım kataloğu", chips: ["İngilizce", "Kapak", "Referans sayfası"] }), "left:760px;top:90px;width:390px")}`),
  /* 5) Self Respect: kurumsal kimlik seti */
  tile(`<img src="${KI("kimlik-self-respect.png")}" style="position:absolute;left:90px;top:60px;height:780px">
    ${floatCard(card({ name: "Self Respect", kind: "Kurumsal kimlik", what: "Kurumsal kimlik seti", chips: ["Kartvizit", "Zarf ve dosya", "Etiket", "Kırtasiye"] }), "left:810px;top:320px;width:340px")}`),
  /* 6) Logo tasarımları: farklı sektörlerden sekiz marka */
  tile(`<div style="position:absolute;left:90px;top:410px;display:grid;grid-template-columns:repeat(4,240px);gap:20px">${[1, 2, 3, 4, 5, 6, 7, 8].map((i) => `<div style="height:150px;border-radius:22px;background:#fff;display:grid;place-items:center;box-shadow:0 30px 50px -26px rgb(0 6 26/.7)"><img src="${G(`logo-${i}.png`)}" style="max-width:190px;max-height:92px"></div>`).join("")}</div>
    ${floatCard(`<div class="row" style="gap:14px"><span style="width:50px;height:50px;border-radius:15px;background:#e7f0ff;display:grid;place-items:center">${icon("pen-tool", { size: 25, color: ACC, stroke: 2 })}</span><div><div style="font-size:13px;font-weight:600;letter-spacing:.08em;color:${ACC}">LOGO TASARIMI</div><div style="font-size:21px;font-weight:600;margin-top:2px">Farklı sektörlerden markalar</div></div></div><div style="margin-top:12px;font-size:16px;color:#3b4763">Modadan dış ticarete, tasarladığımız logolardan sekizi</div>`, "left:90px;top:190px;width:470px")}`),
];

export function grafikHero() {
  const body = `
  ${glow(160, 300, 1280, 700)}
  <div style="position:absolute;left:68px;top:60px">${lockup("Grafik Tasarım")}</div>
  ${cover("lionklinker-kapak.jpg", 120, 300, 330, -8)}
  ${pouch("elma", 470, 370, 460, -7)}${pouch("cilek", 810, 370, 460, 7)}${pouch("blue-raspberry", 630, 310, 530, 0)}
  ${product(G("kavanoz.png"), 1090 / 1400, 1170, 470, 420)}
  ${floatCard(`<div class="row" style="gap:14px"><span style="width:50px;height:50px;border-radius:15px;background:#e7f0ff;display:grid;place-items:center">${icon("pen-tool", { size: 25, color: ACC, stroke: 2 })}</span>
   <div><div style="font-size:14px;font-weight:600;letter-spacing:.06em;color:${ACC}">GERÇEK İŞLER</div><div style="font-size:22px;font-weight:600;margin-top:2px">Ambalaj · Katalog · Kimlik</div></div></div>
   <div style="margin-top:14px;font-size:16px;color:#3b4763">Markalarımız için tasarladıklarımız</div>`, "left:1040px;top:60px;width:470px")}
  ${grainLayer(0.06)}`;
  return page({ w: 1600, h: 1000, bg: themeBg(TG), body });
}

function grafikCover() {
  const body = `
  <div style="position:absolute;left:150px;top:560px;width:900px;height:1000px;border-radius:50%;background:radial-gradient(closest-side,${TG.hi}88,transparent);filter:blur(20px)"></div>
  <div style="position:absolute;left:0;right:0;top:96px;display:grid;justify-items:center;text-align:center;color:#fff">
    ${lockup("Grafik Tasarım", 30)}
    <h1 style="margin-top:40px;font-size:96px;line-height:1.02;font-weight:600;letter-spacing:-.045em">Akılda kalan<br><span style="color:${TG.glow}">bir kimlik</span></h1>
    <p style="margin-top:22px;font-size:28px;color:rgb(255 255 255/.8)">Markalarımız için tasarladıklarımızdan</p>
  </div>
  ${[["karpuz", 60, 800, 470, -10], ["gokkusagi", 820, 800, 470, 10], ["kola", 230, 760, 500, -5], ["elma", 650, 760, 500, 5], ["blue-raspberry", 410, 720, 560, 0]].map(([n, x, y, h, r]) => pouch(n, x, y, h, r)).join("")}
  ${grainLayer(0.06)}`;
  return page({ w: 1200, h: 1500, bg: themeBg(TG), body });
}

export const grafikScenesReal = () => [
  { name: "real-grafik-tasarim-hero", w: 1600, h: 1000, html: grafikHero() },
  { name: "real-grafik-tasarim-kapak", w: 1200, h: 1500, html: grafikCover() },
  ...tiles().map((html, i) => ({ name: `real-grafik-tasarim-${i + 1}`, w: 1200, h: 900, html })),
];
