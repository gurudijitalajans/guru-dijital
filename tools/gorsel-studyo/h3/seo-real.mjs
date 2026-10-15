// SEO v4: hizmetteki üç SEO vakasının rakamları (rapor paneli) ve yaptığımız sitelerin canlıdaki GERÇEK
// sayfa başlığı ile açıklaması, kendi çizdiğimiz arama sonucu kartında. Sıralama iddiası yok.
import { fileUrl, floatCard, grainLayer, icon, iphone, page, ROOT, themeBg } from "../lib.mjs";
import { T } from "./common.mjs";
import { glow, lockup } from "./real.mjs";
import { reportTile } from "./reklam.mjs";

const F = (f) => fileUrl(`${ROOT}/tools/gorsel-studyo/kaynak/katalog/seo/${f}`);
const TS = T.seo;
const ACC = "#1f8f6a";
/* Canlı sitelerden okunan başlık ve açıklamalar (2026-10-16) */
const SITES = {
  aska: { icon: "aska.svg", name: "Aska Hotels", url: "askahotels.com", title: "Antalya Aska Hotels Sizler İçin, Sizlerle Beraber | Aska Hotels", desc: "Aska Hotels ile lüks konaklama deneyimi yaşayın. Türkiye'nin en güzel tatil bölgelerinde sizler için, sizlerle beraber otellerimiz sizi bekliyor." },
  usre: { icon: "usre.png", name: "Usre Okulları", url: "usreokullari.com", title: "Usre Okulları - Antalya Özel Okul - Kolej", desc: "Antalya Özel Okul ve Kolej arayışınızda, Usre Okulları akademik başarı, yabancı dil ve değerler eğitimiyle öğrencilerini geleceğe hazırlar. Hemen bilgi alın." },
  secen: { icon: "secen.jpg", name: "Secen Gross", url: "secengross.com", title: "Secen Gross | Toptan Fiyat, Perakende Mutluluk", desc: "Antalya’da 7.000 m² alanda kurulu Secen Gross, geniş ürün yelpazesi ve üstün hizmet anlayışıyla bölgenin lider toptan satış noktalarından biridir." },
  esdo: { icon: "esdo.svg", dark: true, name: "Esdo İnşaat", url: "esdoinsaat.com", title: "Esdo İnşaat | Geleceğinizi İnşa Ediyoruz", desc: "Esdo İnşaat; konut, kentsel dönüşüm, anahtar teslim ve müteahhitlik projeleri." },
};
const fav = (s, d = 30) => `<span style="width:${d}px;height:${d}px;border-radius:50%;background:${s.dark ? "#13233f" : "#fff"};box-shadow:0 0 0 1px #e3e7ee;display:grid;place-items:center;overflow:hidden;flex-shrink:0"><img src="${F(s.icon)}" style="width:${d * 0.72}px;height:${d * 0.72}px;object-fit:contain"></span>`;
/* Arama sonucu kartı (genel arama arayüzü; marka logosu yok) */
const snippet = (s, w = 620, fs = 1) => `<div style="width:${w}px;font-family:Arial,Helvetica,sans-serif">
  <div class="row" style="gap:${10 * fs}px">${fav(s, 30 * fs)}<div style="line-height:1.25"><div style="font-size:${14 * fs}px;color:#202124">${s.name}</div><div style="font-size:${12.5 * fs}px;color:#4d5156">https://${s.url}</div></div></div>
  <div style="margin-top:${8 * fs}px;font-size:${20 * fs}px;line-height:1.3;color:#1a0dab">${s.title}</div>
  <div style="margin-top:${5 * fs}px;font-size:${14 * fs}px;line-height:1.58;color:#4d5156">${s.desc}</div></div>`;
const snipCard = (s, x, y, w = 680, r = 0, fs = 1.3) => `<div style="position:absolute;left:${x}px;top:${y}px;transform:rotate(${r}deg);border-radius:${22 * fs}px;background:#fff;padding:${26 * fs}px ${30 * fs}px;box-shadow:0 0 0 1px rgb(255 255 255/.6),0 40px 70px -28px rgb(1 12 40/.6)">${snippet(s, w - 60 * fs, fs)}</div>`;
const searchBar = (q, x, y, w) => `<div class="row" style="position:absolute;left:${x}px;top:${y}px;width:${w}px;height:72px;padding:0 28px;gap:16px;border-radius:999px;background:#fff;box-shadow:0 30px 60px -26px rgb(1 12 40/.6);font:400 25px Arial,Helvetica,sans-serif;color:#202124">${icon("search", { size: 26, color: "#5f6368", stroke: 2.2 })}${q}</div>`;
const infoCard = (ic, kind, title, desc) => `<div class="row" style="gap:14px"><span style="width:50px;height:50px;border-radius:15px;background:#e3f5ee;display:grid;place-items:center">${icon(ic, { size: 25, color: ACC, stroke: 2 })}</span>
   <div><div style="font-size:13px;font-weight:600;letter-spacing:.08em;color:${ACC}">${kind.toLocaleUpperCase("tr-TR")}</div><div style="font-size:22px;font-weight:600;margin-top:2px">${title}</div></div></div>
   <div style="margin-top:12px;font-size:16px;color:#3b4763;line-height:1.4">${desc}</div>`;
const tile = (body) => page({ w: 1200, h: 900, bg: themeBg(TS), body: `${glow(80, 220, 1040, 640)}${body}${grainLayer(0.06)}` });
/* Telefonda arama sonucu */
const mobileSerp = (q, s) => `<div style="width:390px;height:844px;background:#fff;position:relative;overflow:hidden">
  <div class="row" style="height:50px;padding:0 26px;justify-content:space-between;font:600 15px Outfit;color:#0c1a3a"><span>9:41</span><span class="row" style="gap:6px">${icon("signal", { size: 15, stroke: 2.4 })}${icon("wifi", { size: 15, stroke: 2.4 })}${icon("battery-full", { size: 19, stroke: 2 })}</span></div>
  <div class="row" style="margin:14px 16px 0;height:48px;padding:0 18px;gap:10px;border-radius:999px;box-shadow:0 1px 6px rgb(32 33 36/.28);font:16px Arial,Helvetica,sans-serif;color:#202124">${icon("search", { size: 18, color: "#5f6368", stroke: 2.2 })}${q}</div>
  <div class="row" style="gap:22px;margin:16px 22px 0;font:14px Arial;color:#5f6368;border-bottom:1px solid #ebebeb;padding-bottom:10px"><span style="color:#1a73e8;box-shadow:0 12px 0 -9px #1a73e8">Tümü</span><span>Görseller</span><span>Haritalar</span><span>Haberler</span></div>
  <div style="padding:20px 18px">${snippet(s, 354, 0.92)}</div>
  ${[0, 1, 2, 3].map(() => `<div style="padding:18px 18px 4px;border-top:1px solid #f1f3f4"><div class="row" style="gap:10px"><span style="width:28px;height:28px;border-radius:50%;background:#eef1f6"></span><div><div style="height:9px;width:110px;border-radius:5px;background:#e8ebf0"></div><div style="height:8px;width:150px;border-radius:5px;background:#f0f2f5;margin-top:6px"></div></div></div><div style="height:13px;width:82%;border-radius:6px;background:#dfe6fb;margin-top:12px"></div><div style="height:10px;width:96%;border-radius:5px;background:#f0f2f5;margin-top:9px"></div><div style="height:10px;width:70%;border-radius:5px;background:#f0f2f5;margin-top:7px"></div></div>`).join("")}
</div>`;

const CASES = [
  { sector: "SEO / E-Ticaret", title: "Reklam harcamasından bağımsız, kesintisiz organik büyüme", big: "%325", bigLabel: "Organik trafikte artış",
    rows: [["Organik trafik", 325, "%325", true], ["İlk 3 sıradaki anahtar kelime", 42, "%42", false], ["Organik kanaldan ciro", 35, "%35", false]], max: 325, side: [["%42", "Anahtar kelime ilk 3 sıra artışı"], ["%35", "Organik kanaldan gelen ciro artışı"]], note: "Ek reklam maliyeti olmadan, 6 ayda kalıcı sıralama" },
  { sector: "SEO / Doğrudan Satış", title: "Doğru anahtar kelime stratejisiyle rekor organik satış", big: "%215", bigLabel: "Organik gelir artışı",
    rows: [["Organik gelir", 215, "%215", true], ["Organik dönüşüm oranı", 90, "%90", false]], max: 215, side: [["%90", "Organik dönüşüm oranında artış"], ["%50", "Müşteri edinim maliyetinde azalma"]] },
  { sector: "SEO / Sağlık Turizmi", title: "Uluslararası aramalarda zirve, çok dilli SEO ile küresel hasta akışı", big: "%410", bigLabel: "Uluslararası organik trafik artışı",
    rows: [["Uluslararası organik trafik", 410, "%410", true], ["Yabancı hasta başvuru formu", 190, "%190", false]], max: 410, side: [["%190", "Yabancı hasta başvuru formu artışı"], ["%40", "Hasta edinme maliyetinde düşüş"]], note: "Çok dilli altyapı ile 6 ayda" },
];

const tiles = () => [
  ...CASES.map((c) => reportTile(TS, c, ACC)),
  /* 4) Aska Hotels: çok dilli site, arama sonucunda */
  tile(`${searchBar("aska hotels", 70, 110, 620)}${snipCard(SITES.aska, 70, 220, 1060, 0, 1.45)}
    ${floatCard(infoCard("languages", "Turizm · Çok dilli", "Aska Hotels", "Site her dil sürümü için hreflang ile işaretli; başlık ve açıklama markayı ve bölgeyi anlatıyor"), "left:640px;top:560px;width:490px")}`),
  /* 5) Usre Okulları: telefonda arama sonucu */
  tile(`<div style="position:absolute;left:150px;top:70px;transform:rotate(-3deg)">${iphone(mobileSerp("usre okulları", SITES.usre), { width: 370, style: "filter:drop-shadow(0 46px 46px rgb(0 6 26/.55))" })}</div>
    ${floatCard(infoCard("graduation-cap", "Eğitim · Yerel arama", "Usre Okulları", "Başlıkta şehir ve arama niyeti: “Antalya Özel Okul - Kolej”; açıklamada eylem çağrısı: “Hemen bilgi alın”"), "left:600px;top:320px;width:500px")}`),
  /* 6) Secen Gross ve Esdo İnşaat: iki sitenin arama sonucu */
  tile(`${snipCard(SITES.secen, 60, 110, 860, -1.5)}${snipCard(SITES.esdo, 280, 400, 860, 1.5)}
    ${floatCard(infoCard("search", "Sayfa içi SEO", "Arama sonucunda marka", "Yaptığımız sitelerin canlıdaki başlık ve açıklamaları"), "left:60px;top:680px;width:470px")}`),
];

export function seoHero() {
  const body = `
  ${glow(160, 300, 1280, 700)}
  <div style="position:absolute;left:68px;top:60px">${lockup("SEO")}</div>
  ${snipCard(SITES.usre, 90, 190, 860, -1)}${snipCard(SITES.aska, 170, 430, 860, 0.8)}${snipCard(SITES.secen, 110, 690, 860, -0.6)}
  ${floatCard(`<div style="font-size:13px;font-weight:600;letter-spacing:.08em;color:${ACC}">VAKA · SEO / E-TİCARET</div><div style="margin-top:6px;font-size:64px;font-weight:300;letter-spacing:-.04em;line-height:1;color:#011441">%325</div><div style="margin-top:8px;font-size:17px;color:#3b4763">Organik trafikte artış, 6 ayda</div>`, "left:1060px;top:250px;width:440px", "30px 34px")}
  ${floatCard(`<div style="font-size:13px;font-weight:600;letter-spacing:.08em;color:${ACC}">VAKA · SEO / SAĞLIK TURİZMİ</div><div style="margin-top:6px;font-size:64px;font-weight:300;letter-spacing:-.04em;line-height:1;color:#011441">%410</div><div style="margin-top:8px;font-size:17px;color:#3b4763">Uluslararası organik trafik artışı</div>`, "left:1060px;top:560px;width:440px", "30px 34px")}
  ${grainLayer(0.06)}`;
  return page({ w: 1600, h: 1000, bg: themeBg(TS), body });
}

function seoCover() {
  const body = `
  <div style="position:absolute;left:150px;top:560px;width:900px;height:1000px;border-radius:50%;background:radial-gradient(closest-side,${TS.hi}88,transparent);filter:blur(20px)"></div>
  <div style="position:absolute;left:0;right:0;top:96px;display:grid;justify-items:center;text-align:center;color:#fff">
    ${lockup("SEO", 30)}
    <h1 style="margin-top:40px;font-size:96px;line-height:1.02;font-weight:600;letter-spacing:-.045em">Sizi arayan<br><span style="color:${TS.glow}">sizi bulsun</span></h1>
    <p style="margin-top:22px;font-size:28px;color:rgb(255 255 255/.8)">Organik büyüme vakalarımızdan</p>
  </div>
  ${[["%325", "Organik trafik", "SEO / E-Ticaret", 90, 560, -2], ["%215", "Organik gelir", "SEO / Doğrudan Satış", 570, 800, 2], ["%410", "Uluslararası organik trafik", "SEO / Sağlık Turizmi", 130, 1060, -1]].map(([v, l, s, x, y, r]) => floatCard(`<div style="font-size:17px;font-weight:600;letter-spacing:.08em;color:${ACC}">VAKA · ${s.toLocaleUpperCase("tr-TR")}</div><div style="margin-top:10px;font-size:128px;font-weight:300;letter-spacing:-.05em;line-height:1;color:#011441">${v}</div><div style="margin-top:12px;font-size:26px;color:#3b4763">${l} artışı</div>`, `left:${x}px;top:${y}px;width:540px;transform:rotate(${r}deg)`, "34px 40px")).join("")}
  ${grainLayer(0.06)}`;
  return page({ w: 1200, h: 1500, bg: themeBg(TS), body });
}

export const seoScenesReal = () => [
  { name: "real-seo-hero", w: 1600, h: 1000, html: seoHero() },
  { name: "real-seo-kapak", w: 1200, h: 1500, html: seoCover() },
  ...tiles().map((html, i) => ({ name: `real-seo-${i + 1}`, w: 1200, h: 900, html })),
];
