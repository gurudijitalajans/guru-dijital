// Dijital Reklam v4: dosya adında "Reklam" geçen GERÇEK kreatifler, kendi çizdiğimiz sponsorlu gönderi
// çerçevesinde; sonuç karolarında yalnız hizmetteki üç vakanın rakamları (uydurma veri yok).
import { fileUrl, floatCard, grainLayer, icon, iphone, page, ROOT, THEME, themeBg } from "../lib.mjs";
import { floor, glow, lockup } from "./real.mjs";

const P = (f) => fileUrl(`${ROOT}/tools/gorsel-studyo/kaynak/katalog/gonderiler/${f}.jpg`);
const K = (f) => fileUrl(`${ROOT}/tools/gorsel-studyo/kaynak/katalog/${f}`);
const LOGO = (f) => fileUrl(`${ROOT}/public/references/${f}.png`);
const TR = THEME.business;
const ACC = "#2a6aca";
const tr = (n) => String(n).replace(".", ",");

/* Sponsorlu akış gönderisi 390x844: marka + "Sponsorlu", kreatif, eylem çubuğu; uydurma sayı yok */
const adScreen = (brand, initial, color, post, cta = "Daha fazla bilgi al") => `<div style="width:390px;height:844px;background:#fff;font-family:Outfit;color:#0c1a3a;position:relative;overflow:hidden">
  <div class="row" style="height:50px;padding:0 26px;justify-content:space-between;font:600 15px Outfit"><span>9:41</span><span class="row" style="gap:6px">${icon("signal", { size: 15, stroke: 2.4 })}${icon("wifi", { size: 15, stroke: 2.4 })}${icon("battery-full", { size: 19, stroke: 2 })}</span></div>
  <div class="row" style="gap:10px;padding:8px 14px 10px"><span style="width:36px;height:36px;border-radius:50%;background:${color};display:grid;place-items:center;color:#fff;font:600 13px Outfit">${initial}</span><div><b style="font-size:15px;display:block;line-height:1.1">${brand}</b><span style="font-size:12.5px;color:#6b7690">Sponsorlu</span></div><span style="margin-left:auto">${icon("ellipsis", { size: 20 })}</span></div>
  <div style="height:488px;background:url('${P(post)}') 50% 0/cover no-repeat"></div>
  <div class="row" style="height:48px;padding:0 14px;justify-content:space-between;background:${color};color:#fff;font:600 15px Outfit"><span>${cta}</span>${icon("chevron-right", { size: 20, color: "#fff", stroke: 2.4 })}</div>
  <div class="row" style="gap:16px;padding:12px 14px">${icon("heart", { size: 25 })}${icon("message-circle", { size: 25 })}${icon("send", { size: 23 })}<span style="margin-left:auto">${icon("bookmark", { size: 23 })}</span></div>
  <div style="padding:0 14px"><div style="height:10px;width:62%;border-radius:6px;background:#e9edf4"></div><div style="height:10px;width:44%;border-radius:6px;background:#eef1f6;margin-top:8px"></div></div>
</div>`;
const phoneAt = (screen, x, y, w, r = 0) =>
  `${floor(x - 10, y + w * 2.0 - 34, w + 20, 54, 0.5)}<div style="position:absolute;left:${x}px;top:${y}px;transform:rotate(${r}deg)">${iphone(screen, { width: w, style: "filter:drop-shadow(0 46px 46px rgb(0 6 26/.55))" })}</div>`;
const brandCard = (logo, kind, what, chips = [], lh = 40) => `<img src="${LOGO(logo)}" style="height:${lh}px;display:block;max-width:300px;object-fit:contain">
   <div style="margin-top:16px;font-size:13px;font-weight:600;letter-spacing:.08em;color:${ACC}">${kind.toLocaleUpperCase("tr-TR")}</div>
   <div style="margin-top:4px;font-size:21px;font-weight:600;line-height:1.25">${what}</div>
   ${chips.length ? `<div class="row" style="gap:8px;margin-top:14px;flex-wrap:wrap">${chips.map((c) => `<span style="height:32px;padding:0 14px;border-radius:999px;background:#eef3fb;font:500 14px Outfit;color:#2b3a5c;display:inline-flex;align-items:center">${c}</span>`).join("")}</div>` : ""}`;
const tile = (body) => page({ w: 1200, h: 900, bg: themeBg(TR), body: `${glow(80, 220, 1040, 640)}${body}${grainLayer(0.06)}` });

/* Vaka kartları: sektör + başlık; büyük rakam; gerçek değerlerle orantılı çubuklar */
const caseHead = (sector, title, acc = ACC) => `<div class="row" style="gap:14px"><span style="width:50px;height:50px;border-radius:15px;background:#e7f0ff;display:grid;place-items:center">${icon("trending-up", { size: 25, color: acc, stroke: 2.2 })}</span>
  <div><div style="font-size:13px;font-weight:600;letter-spacing:.08em;color:${acc}">VAKA · ${sector.toLocaleUpperCase("tr-TR")}</div><div style="font-size:21px;font-weight:600;margin-top:3px;line-height:1.25">${title}</div></div></div>`;
const stat = (value, label, x, y, w = 300) => floatCard(`<div style="font-size:54px;font-weight:300;letter-spacing:-.04em;line-height:1;color:#011441">${value}</div><div style="margin-top:10px;font-size:16px;color:#3b4763;line-height:1.35">${label}</div>`, `left:${x}px;top:${y}px;width:${w}px`, "24px 26px");
const bars = (rows, max, x, y, w) => floatCard(rows.map(([label, v, txt, hi]) => `<div style="margin-top:14px"><div class="row" style="justify-content:space-between;font-size:15px;color:#3b4763"><span>${label}</span><b style="color:#011441;font-size:17px">${txt}</b></div><div style="margin-top:8px;height:16px;border-radius:9px;background:#eef2f9;overflow:hidden"><div style="height:100%;width:${(v / max) * 100}%;border-radius:9px;background:${hi ? "linear-gradient(90deg,#2a6aca,#3d8bf2)" : "#9fb6dc"}"></div></div></div>`).join(""), `left:${x}px;top:${y}px;width:${w}px`, "12px 26px 26px");

/* Vaka rapor paneli (Dijital Reklam ve SEO): başlık, ana rakam, gerçek değerlerle orantılı çubuklar, yan rakamlar */
export const reportTile = (theme, { sector, title, big, bigLabel, rows, max, side, note = "" }, acc = ACC) => page({ w: 1200, h: 900, bg: themeBg(theme), body: `${glow(80, 220, 1040, 640)}
  <div style="position:absolute;left:70px;top:50%;transform:translateY(-50%);width:1060px;border-radius:30px;background:#fff;box-shadow:0 0 0 1px rgb(255 255 255/.6),0 60px 100px -40px rgb(1 12 40/.7);font-family:Outfit;color:#0c1a3a;padding:44px 48px;display:grid;grid-template-columns:1fr 330px;grid-template-rows:auto 1fr;gap:34px 40px">
    <div style="grid-column:1/3">${caseHead(sector, title, acc)}</div>
    <div style="display:flex;flex-direction:column">
      <div style="font-size:84px;font-weight:300;letter-spacing:-.045em;line-height:1;color:#011441">${big}</div>
      <div style="margin-top:12px;font-size:18px;color:#3b4763">${bigLabel}</div>
      <div style="margin-top:34px">${rows.map(([label, v, txt, hi]) => `<div style="margin-top:18px"><div class="row" style="justify-content:space-between;font-size:16px;color:#3b4763"><span>${label}</span><b style="color:#011441;font-size:18px">${txt}</b></div><div style="margin-top:9px;height:18px;border-radius:10px;background:#eef2f9;overflow:hidden"><div style="height:100%;width:${(v / max) * 100}%;border-radius:10px;background:${hi ? `linear-gradient(90deg,${acc},#3d8bf2)` : "#a9bfe3"}"></div></div></div>`).join("")}</div>
      ${note ? `<div class="row" style="gap:8px;margin-top:26px;font-size:15px;color:#3b4763">${icon("clock-3", { size: 17, color: acc, stroke: 2 })}${note}</div>` : ""}
    </div>
    <div style="display:grid;gap:16px;align-content:start">${side.map(([v, l]) => `<div style="border-radius:20px;background:#f3f7fd;padding:24px 26px"><div style="font-size:48px;font-weight:300;letter-spacing:-.04em;line-height:1;color:#011441">${v}</div><div style="margin-top:10px;font-size:16px;color:#3b4763;line-height:1.35">${l}</div></div>`).join("")}</div>
  </div>${grainLayer(0.06)}` });
const report = (opts) => reportTile(TR, opts);

const tiles = () => [
  /* 1) DC: aynı kampanya iki dilde, sponsorlu */
  tile(`${phoneAt(adScreen("DC", "DC", "#35b8cf", "Didcem_Coban_Reklam8", "Daha fazla bilgi al"), 110, 160, 300, -5)}
    ${phoneAt(adScreen("DC", "DC", "#35b8cf", "didem_coban_reklam_5", "Daha fazla bilgi al"), 450, 120, 300, 4)}
    ${floatCard(brandCard("dc", "Meta reklamları", "Diş kliniği için iki dilde kampanya kreatifleri", ["Türkçe", "İngilizce"], 64), "left:820px;top:280px;width:330px")}`),
  /* 2) Medipunto Clinic: yurt dışına yönelik kampanya */
  tile(`${phoneAt(adScreen("Medipunto Clinic", "M", "#1aa0d8", "mediounto_reklam"), 330, 110, 320, -3)}
    ${floatCard(brandCard("medipunto-clinic", "Meta reklamları", "İngilizce estetik kampanyası", ["İngilizce", "Fiyat listeli kreatif"]), "left:800px;top:320px;width:330px")}`),
  /* 3) WCTLife: konut projesi satış kampanyası */
  tile(`${phoneAt(adScreen("WCTLife", "W", "#6b2fb3", "WCT_Reklam_3"), 330, 110, 320, 3)}
    ${floatCard(brandCard("wctlife", "Meta reklamları", "Konut projesi satış kampanyası", ["Proje tanıtımı", "Fiyat ve vade"]), "left:780px;top:320px;width:360px")}`),
  /* 4-6) Vakalar: tek rapor paneli (başlık, ana rakam, gerçek değerlerle orantılı çubuklar, yan rakamlar) */
  report({ sector: "E-Ticaret / Giyim", title: "ROAS'ı 3,41'den 8,62'ye taşıyan performans dönüşümü", big: "3,41 → 8,62", bigLabel: "ROAS, dönüşüm öncesi ve sonrası",
    rows: [["Önce", 3.41, "3,41", false], ["Sonra", 8.62, "8,62", true]], max: 8.62, side: [["%152", "ROAS artışı"], ["%74", "Ciro artışı"], ["%42", "Alışveriş başına maliyette azalma"]] }),
  report({ sector: "Sağlık / Klinik", title: "Aynı bütçeyle %300 daha fazla hasta", big: "%300", bigLabel: "Yurt dışı hasta sayısı artışı",
    rows: [["Yurt dışı hasta sayısı", 300, "%300", true], ["Yurt içi hasta sayısı", 350, "%350", true], ["Yurt dışı hasta geliri", 320, "%320", false], ["Yurt içi hasta geliri", 245, "%245", false]], max: 350, side: [["%120", "Aylık talep artışı"], [`%${tr(54.5)}`, "Talep başı maliyette düşüş"]] }),
  report({ sector: "E-ticaret", title: "Satış odaklı strateji, ölçülebilir büyüme", big: "%96", bigLabel: "Kampanya dönemi ciro artışı",
    rows: [["Ciro artışı", 60, "%60", false], ["Kampanya dönemi ciro artışı", 96, "%96", true]], max: 96, side: [["%60", "Ciro artışı"], [`%${tr(37.5)}`, "Sonuç başına maliyette azalma"]] }),
];

export function reklamHero() {
  const body = `
  ${glow(160, 300, 1280, 700)}
  <div style="position:absolute;left:68px;top:60px">${lockup("Dijital Reklam")}</div>
  ${phoneAt(adScreen("DC", "DC", "#35b8cf", "Didcem_Coban_Reklam8"), 200, 250, 290, -7)}
  ${phoneAt(adScreen("WCTLife", "W", "#6b2fb3", "WCT_Reklam_3"), 560, 180, 320, 0)}
  ${phoneAt(adScreen("Medipunto Clinic", "M", "#1aa0d8", "mediounto_reklam"), 900, 250, 290, 7)}
  ${floatCard(`<div class="row" style="gap:16px"><img src="${K("google-partner-logo.png")}" style="height:62px"><div><div style="font-size:14px;font-weight:600;letter-spacing:.06em;color:${ACC}">GOOGLE PARTNER</div><div style="font-size:22px;font-weight:600;margin-top:2px">2025 · 2026</div></div></div>`, "left:1100px;top:60px;width:420px")}
  ${floatCard(`<div style="font-size:13px;font-weight:600;letter-spacing:.08em;color:${ACC}">VAKA · E-TİCARET / GİYİM</div><div class="row" style="gap:12px;margin-top:8px;align-items:baseline"><span style="font-size:22px;color:#6b7690">ROAS</span><span style="font-size:44px;font-weight:300;letter-spacing:-.03em;color:#011441">3,41 → 8,62</span></div>`, "left:1210px;top:640px;width:340px")}
  ${grainLayer(0.06)}`;
  return page({ w: 1600, h: 1000, bg: themeBg(TR), body });
}

function reklamCover() {
  const body = `
  <div style="position:absolute;left:150px;top:560px;width:900px;height:1000px;border-radius:50%;background:radial-gradient(closest-side,${TR.hi}88,transparent);filter:blur(20px)"></div>
  <div style="position:absolute;left:0;right:0;top:96px;display:grid;justify-items:center;text-align:center;color:#fff">
    ${lockup("Dijital Reklam", 30)}
    <h1 style="margin-top:40px;font-size:96px;line-height:1.02;font-weight:600;letter-spacing:-.045em">Her lira<br><span style="color:${TR.glow}">ölçülür</span></h1>
    <p style="margin-top:22px;font-size:28px;color:rgb(255 255 255/.8)">Markalarımız için yönettiğimiz reklamlardan</p>
  </div>
  ${[["DC", "DC", "#35b8cf", "didem_coban_reklam_5", 110, 770, -7], ["WCTLife", "W", "#6b2fb3", "WCT_Reklam_3", 435, 700, 0], ["Medipunto Clinic", "M", "#1aa0d8", "mediounto_reklam", 760, 770, 7]].map(([b, i, c, p, x, y, r]) => `<div style="position:absolute;left:${x}px;top:${y}px;transform:rotate(${r}deg)">${iphone(adScreen(b, i, c, p), { width: 330, style: "filter:drop-shadow(0 50px 60px rgb(0 6 26/.6))" })}</div>`).join("")}
  ${grainLayer(0.06)}`;
  return page({ w: 1200, h: 1500, bg: themeBg(TR), body });
}

export const reklamScenesReal = () => [
  { name: "real-dijital-reklam-yonetimi-hero", w: 1600, h: 1000, html: reklamHero() },
  { name: "real-dijital-reklam-yonetimi-kapak", w: 1200, h: 1500, html: reklamCover() },
  ...tiles().map((html, i) => ({ name: `real-dijital-reklam-yonetimi-${i + 1}`, w: 1200, h: 900, html })),
];
