// Site sahneleri: blog kapakları (yazının konusunu müşteri işleriyle anlatır, 16:9, 2x)
// ve tanıtım videosunun kapak karesi.
//   node tools/gorsel-studyo/render.mjs blog-          → out/blog-*.png
//   DPR=1 node tools/gorsel-studyo/render.mjs video-   → out/video-*.png
//   python3 tools/gorsel-studyo/export-site.py         → public/work/blog-*.webp, public/video/*-poster.jpg
import { BG, ROOT, fileUrl, grainLayer, icon, logo, mark, page } from "./lib.mjs";

/* Temizlenmiş gönderi şeridindeki (public/work/instagram-postlar.webp, 1250x387)
   dört gerçek gönderinin kutuları; her biri ~290x361 */
const STRIP = fileUrl(`${ROOT}/public/work/instagram-postlar.webp`);
const POSTS = [
  { x: 13, label: "Diş kliniği kampanyası" },
  { x: 325, label: "Atıştırmalık ürün lansmanı" },
  { x: 633, label: "Kozmetik ürün tanıtımı" },
  { x: 947, label: "Doğal zeytin ürün görseli" },
];
const post = (i, w) => {
  const s = w / 290;
  return `<div style="width:${w}px;height:${Math.round(361 * s)}px;border-radius:10px;overflow:hidden;box-shadow:0 10px 24px -14px rgb(1 20 65/.45);flex-shrink:0">
    <img src="${STRIP}" style="display:block;width:${1250 * s}px;max-width:none;margin-left:${-POSTS[i].x * s}px;margin-top:${-13 * s}px"></div>`;
};

/* Takvimdeki içerik türleri: gönderi, Reels, hikâye */
const KIND = {
  post: { t: "Gönderi", c: "#2a6aca", bg: "#eaf2ff", ic: "image" },
  reels: { t: "Reels", c: "#7c3aed", bg: "#f1ebff", ic: "clapperboard" },
  story: { t: "Hikâye", c: "#0e8a7e", bg: "#e3f6f3", ic: "circle-dashed" },
};
const chip = (k, time) =>
  `<div class="row" style="gap:6px;font-size:11.5px;font-weight:600;color:${KIND[k].c}"><span style="width:7px;height:7px;border-radius:50%;background:${KIND[k].c}"></span>${KIND[k].t}<span style="margin-left:auto;font-weight:500;color:#7f8aa3">${time}</span></div>`;
const note = (k, text, time) =>
  `<div style="padding:10px 10px 11px;border-radius:12px;background:${KIND[k].bg}">${chip(k, time)}<div style="margin-top:6px;font-size:12.5px;line-height:1.35;color:#24314f;font-weight:500">${text}</div></div>`;

/* Kart tuvalden geniş ve uzun: sağda ve altta kesilerek yakın plan bir arayüz gibi
   durur; görünen beş gün tam, cumartesi kenardan başlar. */
const COL = 168;
const W = COL - 22; // gönderi küçük resmi (css px); 2x çıktıda kaynağa yakın 1:1
const DAYS = [
  { d: "Pzt", items: [post(0, W), chip("post", "10:00"), note("story", "Haftanın anketi", "19:00")] },
  { d: "Sal", items: [note("reels", "Ürün kullanım videosu", "11:00"), note("story", "Ekipten kamera arkası", "17:30"), note("post", "Müşteri sorularına yanıt", "21:00")] },
  { d: "Çar", items: [post(1, W), chip("reels", "18:30"), note("story", "Yeni tat için geri sayım", "20:00")] },
  { d: "Per", items: [note("post", "Haftanın ipucu: bakım rutini", "12:30"), note("story", "Soru kutusu", "18:00")] },
  { d: "Cum", items: [post(2, W), chip("post", "12:00"), note("reels", "Kampanya duyurusu", "19:30")] },
  { d: "Cmt", items: [note("story", "Hafta sonu önerisi", "11:00")] },
  { d: "Paz", items: [post(3, W), chip("story", "20:00")] },
];

const calendar = `
  <div style="position:absolute;left:56px;top:54px;width:${30 * 2 + COL * 7 + 14 * 6}px;height:640px;border-radius:26px;background:#fff;box-shadow:0 30px 70px -40px rgb(1 20 65/.55),0 0 0 1px rgb(1 20 65/.05);padding:28px 30px 0">
    <div class="row" style="gap:14px;width:${COL * 5 + 14 * 4}px">
      <span style="width:46px;height:46px;border-radius:14px;background:#011441;display:grid;place-items:center">${mark("white", 23)}</span>
      <div><div style="font-size:22px;font-weight:600;letter-spacing:-.02em;color:#011441">İçerik Takvimi</div><div style="font-size:13.5px;color:#7f8aa3;margin-top:1px">Instagram · haftalık yayın planı</div></div>
      <div class="row" style="gap:8px;margin-left:auto">
        ${Object.values(KIND).map((k) => `<span class="row" style="gap:7px;height:32px;padding:0 12px;border-radius:999px;background:${k.bg};color:${k.c};font-size:12.5px;font-weight:600">${icon(k.ic, { size: 14, stroke: 2.2 })}${k.t}</span>`).join("")}
      </div>
    </div>
    <div style="display:grid;grid-template-columns:repeat(7,${COL}px);gap:14px;margin-top:24px">
      ${DAYS.map((day, i) => `
        <div>
          <div class="row" style="gap:7px;font-size:12px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:${i === 2 ? "#2a6aca" : "#8a95ad"};padding:0 2px 10px">${day.d}${i === 2 ? `<span style="width:6px;height:6px;border-radius:50%;background:#2a6aca"></span>` : ""}</div>
          <div style="display:grid;gap:10px;padding:11px;border-radius:16px;background:${i === 2 ? "#f2f7ff" : "#f6f8fc"};height:520px;align-content:start">${day.items.join("")}</div>
        </div>`).join("")}
    </div>
  </div>`;

export const BLOG_SCENES = [
  {
    name: "blog-icerik-takvimi",
    w: 1024,
    h: 576,
    html: page({ w: 1024, h: 576, bg: BG.ice, body: `${grainLayer(0.05)}${calendar}` }),
  },
];

/* Tanıtım videosu kapağı: oynat düğmesi ortada durduğu için logo sol üstte,
   ortası boş marka ışığı (videonun ilk karesindeki ortalı logo düğmenin altında kalıyordu) */
export const POSTER_SCENES = [
  {
    name: "video-guru-tanitim-poster",
    w: 1920,
    h: 1080,
    html: page({ w: 1920, h: 1080, bg: BG.navy, body: `${grainLayer(0.06)}${logo("white", 92, "position:absolute;left:128px;top:116px")}` }),
  },
];
