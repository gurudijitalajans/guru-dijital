// Web Tasarım: müşteri siteleri cihazlarda, tasarım sistemi ve yayındaki işler
import { stoneRoom } from "./art.mjs";
import { browser, chip, cover, feature, floor, hero, icon, macbook, page, phone, pic, SANS2, SERIF, T, work } from "./common.mjs";
import { buildDesktop, buildMobile, clinicDesktop, clinicMobile, hotelDesktop, hotelMobile } from "./sites.mjs";

const t = T["web-tasarim"];
const crop = (html, h = 900, y = 0) => `<div style="position:relative;width:1440px;height:${h}px;overflow:hidden"><div style="position:absolute;left:0;top:${-y}px">${html}</div></div>`;

/* iPad benzeri tablet: ekran 820x1180 */
export function tablet(screen, { width = 420, style = "" } = {}) {
  const s = (width - 28) / 820;
  return `<div class="abs" style="width:${width}px;padding:14px;border-radius:${width * 0.07}px;background:linear-gradient(135deg,#9aa0aa,#2b2e35 20%,#1b1d22 60%,#5b6069);box-shadow:inset 0 0 0 1px rgb(255 255 255/.2);filter:drop-shadow(0 40px 40px rgb(0 6 26/.5));${style}">
    <div style="width:${820 * s}px;height:${1180 * s}px;overflow:hidden;border-radius:${width * 0.045}px;background:#fff"><div style="width:820px;height:1180px;transform:scale(${s});transform-origin:0 0;overflow:hidden">${screen}</div></div></div>`;
}
export const ok = (text) => `<div class="row" style="gap:12px"><span style="width:34px;height:34px;border-radius:50%;background:#16a34a;display:grid;place-items:center">${icon("check", { size: 18, color: "#fff", stroke: 3 })}</span><div style="font-size:17px;font-weight:600">${text}</div></div>`;

export const webScenes = () => {
  const H = hotelDesktop(), HM = hotelMobile(), C = clinicDesktop(), CM = clinicMobile(), B = buildDesktop(), BM = buildMobile();
  const out = [];
  out.push({
    name: "hizmet3-web-tasarim-hero", w: 1600, h: 1000,
    html: hero({ t, art: `
      ${floor(220, 900, 1100, 90)}
      <div class="abs" style="left:250px;top:150px">${macbook(crop(H), { width: 980 })}</div>
      ${phone(HM, 270, "left:1120px;top:300px")}
      ${chip(`<div class="row" style="gap:14px"><span style="width:44px;height:44px;border-radius:12px;background:#b5764f;display:grid;place-items:center;font:400 22px ${SERIF};color:#fff">D</span><div><div style="font-size:15px;color:#7f8aa3">defnekoy.com.tr</div><div style="font-size:19px;font-weight:600">Yeni site yayında</div></div><span style="margin-left:18px;padding:6px 12px;border-radius:999px;background:#e6f6ec;color:#12873f;font-size:14px;font-weight:600">Mobil hız 98</span></div>`, "left:200px;top:96px")}
    ` }),
  });
  out.push({
    name: "hizmet3-web-tasarim-kapak", w: 1200, h: 1500,
    html: cover({ t, eyebrow: "Web Tasarım", headline: "Markanızın *dijital* yüzü", sub: "Hızlı açılan, telefonda rahat kullanılan ve size ait web siteleri", art: `
      ${phone(CM, 330, "left:70px;top:150px;transform:rotate(-8deg)")}
      ${phone(BM, 330, "left:770px;top:150px;transform:rotate(8deg)")}
      ${phone(HM, 380, "left:410px;top:60px")}
    ` }),
  });
  out.push({
    name: "hizmet3-web-tasarim-1", w: 1200, h: 900,
    html: feature({ t, dark: true, title: "Butik otel: rezervasyona kısa yol", sub: "Müsaitlik kutusu ilk ekranda; odalar, deneyimler ve yorumlar tek akışta.", body: `
      ${browser(H, { url: "defnekoy.com.tr", scale: 0.62, vh: 900, style: "left:0;top:20px" })}
      ${phone(HM, 250, "left:820px;top:40px")}` }),
  });
  out.push({
    name: "hizmet3-web-tasarim-2", w: 1200, h: 900,
    html: feature({ t, title: "Klinik: güven veren sade düzen", sub: "Tedaviler, hekimler ve online randevu formu ziyaretçiyi yormadan sunulur.", body: `
      ${browser(C, { url: "novadis.com.tr", scale: 0.62, vh: 900, style: "left:0;top:20px" })}
      ${phone(CM, 250, "left:820px;top:40px")}` }),
  });
  out.push({
    name: "hizmet3-web-tasarim-3", w: 1200, h: 900,
    html: feature({ t, dark: true, title: "Kurumsal: projeler ön planda", sub: "Referans projeler, rakamlar ve iletişim; her şey markanın diliyle.", body: `
      ${browser(B, { url: "atlasyapi.com.tr", scale: 0.62, vh: 900, style: "left:0;top:20px", dark: true })}
      ${phone(BM, 250, "left:820px;top:40px")}` }),
  });
  out.push({
    name: "hizmet3-web-tasarim-4", w: 1200, h: 900,
    html: feature({ t, title: "Her ekranda aynı özen", sub: "Masaüstü, tablet ve telefon için ayrı ayrı düzenlenmiş arayüz.", body: `
      ${floor(40, 560, 700, 70, 0.3)}
      <div class="abs" style="left:0;top:40px">${macbook(crop(C), { width: 720 })}</div>
      ${tablet(`<div style="zoom:.57">${crop(C, 2070)}</div>`, { width: 300, style: "left:600px;top:70px" })}
      ${phone(CM, 220, "left:860px;top:150px")}` }),
  });
  /* Tasarım sistemi panosu: renk, yazı, bileşenler */
  const sw = (c, n, hex) => `<div><div style="height:120px;border-radius:16px;background:${c}"></div><div style="font-size:15px;font-weight:600;margin-top:10px">${n}</div><div style="font-size:13px;color:#7f8aa3">${hex}</div></div>`;
  out.push({
    name: "hizmet3-web-tasarim-5", w: 1200, h: 900,
    html: feature({ t, title: "Önce tasarım dili, sonra sayfalar", sub: "Renk, yazı ve bileşen kuralları sitenin her yerinde tutarlı kalır.", body: `
      <div class="abs sh" style="left:0;top:0;width:640px;height:638px;border-radius:24px;background:#fff;padding:34px">
        <div style="font-size:14px;letter-spacing:.2em;color:#9a8b7c;font-weight:600">DEFNE KÖY · TASARIM DİLİ</div>
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-top:22px">${sw("#2b2420", "Mürekkep", "#2B2420")}${sw("#b5764f", "Kil", "#B5764F")}${sw("#6f7d5a", "Zeytin", "#6F7D5A")}${sw("#f6efe6", "Kum", "#F6EFE6")}</div>
        <div style="margin-top:30px;display:grid;grid-template-columns:1.2fr 1fr;gap:24px;align-items:end">
          <div><div style="font:400 64px/1 ${SERIF};color:#2b2420">Aa</div><div style="font-size:14px;color:#7f8aa3;margin-top:8px">Başlık · Didot</div></div>
          <div><div style="font:500 44px/1 ${SANS2};color:#2b2420">Aa</div><div style="font-size:14px;color:#7f8aa3;margin-top:8px">Metin · Avenir Next</div></div>
        </div>
        <div style="margin-top:28px;font:400 34px/1.15 ${SERIF};color:#2b2420">Zamanın yavaşladığı yer</div>
        <div style="margin-top:10px;font:400 16px/1.6 ${SANS2};color:#6d6158">Zeytin bahçeleri arasında 14 odalı taş ev.</div>
      </div>
      <div class="abs sh" style="left:670px;top:0;width:402px;height:300px;border-radius:24px;background:#fff;padding:28px">
        <div style="font-size:14px;letter-spacing:.2em;color:#9a8b7c;font-weight:600">BUTONLAR</div>
        <div style="display:grid;gap:14px;margin-top:20px">
          <span style="height:56px;border-radius:12px;background:#b5764f;color:#fff;display:grid;place-items:center;font:600 17px ${SANS2}">Müsaitlik</span>
          <span style="height:56px;border-radius:999px;background:#2b2420;color:#fff;display:grid;place-items:center;font:600 17px ${SANS2}">Rezervasyon</span>
          <span style="height:56px;border-radius:999px;box-shadow:inset 0 0 0 1.5px #2b2420;color:#2b2420;display:grid;place-items:center;font:600 17px ${SANS2}">Odaları inceleyin</span>
        </div>
      </div>
      <div class="abs sh" style="left:670px;top:330px;width:402px;height:308px;border-radius:24px;background:#f6efe6;padding:24px">
        <div style="font-size:14px;letter-spacing:.2em;color:#9a8b7c;font-weight:600">ODA KARTI</div>
        <div style="margin-top:16px;height:150px;border-radius:16px;overflow:hidden">${stoneRoom(354, 150, { wall: "#e7ddd2", shade: "#cbbba7", accent: "#5f7a6a" })}</div>
        <div class="row" style="justify-content:space-between;margin-top:14px;color:#2b2420"><span style="font:400 24px ${SERIF}">Defne Süit</span><span style="font:600 18px ${SANS2}">₺7.200</span></div>
      </div>` }),
  });
  /* Yayındaki işler (gerçek projeler) */
  out.push({
    name: "hizmet3-web-tasarim-6", w: 1200, h: 900,
    html: feature({ t, dark: true, title: "Yayındaki işlerimizden", sub: "Otel, inşaat, eğitim ve sanayi markaları için tasarlayıp geliştirdiğimiz siteler.", body: `
      <div class="abs" style="left:0;top:0;width:520px;height:638px;border-radius:24px;overflow:hidden;box-shadow:0 40px 80px -30px rgb(0 6 26/.7)">${pic(work("web-mockup-dark.webp"), "width:100%;height:100%", "center")}</div>
      <div class="abs" style="left:544px;top:0;width:528px;height:307px;border-radius:24px;overflow:hidden;box-shadow:0 40px 80px -30px rgb(0 6 26/.7)">${pic(work("web-siteleri.webp"), "width:100%;height:100%", "50% 55%")}</div>
      <div class="abs" style="left:544px;top:331px;width:528px;height:307px;border-radius:24px;overflow:hidden;box-shadow:0 40px 80px -30px rgb(0 6 26/.7)">${pic(work("web-siteleri-2.webp"), "width:100%;height:100%", "50% 55%")}</div>` }),
  });
  /* Video için tam sayfa ekranlar */
  for (const [n, html, w] of [["hotel", H, 1440], ["clinic", C, 1440], ["build", B, 1440], ["hotel-m", HM, 390], ["clinic-m", CM, 390], ["build-m", BM, 390]])
    out.push({ name: `hizmet3-raw-web-${n}`, w, h: w === 390 ? 1500 : 2600, html: rawPage(html, w, w === 390 ? 1500 : 2600) });
  return out;
};

export const rawPage = (html, w, h) => page({ w, h, bg: "background:#fff;", body: html });
