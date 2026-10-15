// Marka Tescil v4: Guru'nun kendi Marka Tescil kampanya görselinin fikri (kum saati ve ®) Blender'da,
// lacivert cam stüdyoda (blender/tescil.py); süreç ve sınıf bilgileri sitedeki SMK yazısıyla aynı.
import { fileUrl, floatCard, grainLayer, icon, page, ROOT, themeBg } from "../lib.mjs";
import { T } from "./common.mjs";
import { glow, lockup } from "./real.mjs";

const R3 = (f) => fileUrl(`${ROOT}/tools/gorsel-studyo/blender/out/${f}`);
const ACC = "#2a6aca";

export function tescilHero() {
  const body = `
  <div style="position:absolute;inset:0;background:#011441 url('${R3("tescil-final.png")}') 50% 50%/cover no-repeat"></div>
  <div style="position:absolute;left:68px;top:60px">${lockup("Marka Tescil")}</div>
  ${floatCard(`<div class="row" style="gap:14px"><span style="width:50px;height:50px;border-radius:15px;background:#e7f0ff;display:grid;place-items:center">${icon("shield-check", { size: 25, color: ACC, stroke: 2 })}</span>
    <div><div style="font-size:13px;font-weight:600;letter-spacing:.08em;color:${ACC}">TESCİL DANIŞMANLIĞI</div><div style="font-size:22px;font-weight:600;margin-top:2px">Markanızın yasal güvencesi</div></div></div>
    <div style="margin-top:12px;font-size:16px;color:#3b4763;line-height:1.45">Ön araştırmadan tescil belgesine, süreç yönetimi ve takip</div>
    <div class="row" style="gap:8px;margin-top:14px;flex-wrap:wrap">${["Ön araştırma", "Sınıf seçimi", "Başvuru", "İtiraz takibi"].map((c) => `<span style="height:32px;padding:0 14px;border-radius:999px;background:#eef3fb;font:500 14px Outfit;color:#2b3a5c;display:inline-flex;align-items:center">${c}</span>`).join("")}</div>`, "left:68px;top:600px;width:470px")}
  ${grainLayer(0.05)}`;
  return page({ w: 1600, h: 1000, bg: "background:#011441;", body });
}

const TT = T["marka-tescil"];
const KAMPANYA = fileUrl(`${ROOT}/tools/gorsel-studyo/kaynak/marka-tescil-gonderi.jpg`);
const tile = (body) => page({ w: 1200, h: 900, bg: themeBg(TT), body: `${glow(80, 220, 1040, 640)}${body}${grainLayer(0.06)}` });
const head = (ic, kind, title) => `<div class="row" style="gap:14px"><span style="width:50px;height:50px;border-radius:15px;background:#e7f0ff;display:grid;place-items:center">${icon(ic, { size: 25, color: ACC, stroke: 2 })}</span>
  <div><div style="font-size:13px;font-weight:600;letter-spacing:.08em;color:${ACC}">${kind.toLocaleUpperCase("tr-TR")}</div><div style="font-size:24px;font-weight:600;margin-top:2px;line-height:1.2">${title}</div></div></div>`;
const panel = (inner, style = "left:70px;top:50%;transform:translateY(-50%);width:1060px") => `<div style="position:absolute;${style};border-radius:30px;background:#fff;box-shadow:0 0 0 1px rgb(255 255 255/.6),0 60px 100px -40px rgb(1 12 40/.7);font-family:Outfit;color:#0c1a3a;padding:42px 46px">${inner}</div>`;
const SOURCE = `<div class="row" style="gap:8px;margin-top:22px;font-size:13.5px;color:#7a849b">${icon("scale", { size: 15, color: "#7a849b", stroke: 2 })}6769 sayılı Sınai Mülkiyet Kanunu (SMK)</div>`;

/* Sitedeki "Marka tescil süreci adım adım" yazısının adımları */
const STEPS = [["search", "Ön araştırma", "Aynı ya da benzer marka var mı"], ["layout-grid", "Sınıf seçimi", "Nice sınıflandırması"], ["send", "Başvuru", "TÜRKPATENT'e elektronik"], ["file-search", "Şeklî inceleme", "SMK md. 15"], ["shield-alert", "Mutlak ret incelemesi", "SMK md. 16"], ["newspaper", "Bültende yayın", "2 ay itiraz süresi"], ["badge-check", "Tescil ve belge", "Sicile kayıt"]];

function tescilCover() {
  const body = `
  <div style="position:absolute;left:0;right:0;top:250px;bottom:0;background:url('${R3("tescil-final.png")}') 61% 100%/auto 100% no-repeat;-webkit-mask-image:linear-gradient(180deg,transparent 0%,#000 22%);mask-image:linear-gradient(180deg,transparent 0%,#000 22%)"></div>
  <div style="position:absolute;left:0;right:0;top:96px;display:grid;justify-items:center;text-align:center;color:#fff">
    ${lockup("Marka Tescil", 30)}
    <h1 style="margin-top:40px;font-size:96px;line-height:1.02;font-weight:600;letter-spacing:-.045em">Emeğiniz<br><span style="color:${TT.glow}">adınızla</span> korunsun</h1>
  </div>
  ${grainLayer(0.05)}`;
  return page({ w: 1200, h: 1500, bg: "background:#010a24;", body });
}

const tiles = () => [
  /* 1) Süreç: yedi adım */
  tile(panel(`${head("route", "Tescil süreci", "Ön araştırmadan tescil belgesine yedi adım")}
    <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:12px;margin-top:34px">${STEPS.map(([ic, t, d], i) => `<div style="border-radius:18px;background:${i === 5 ? "#eaf2ff" : "#f3f7fd"};padding:18px 14px;min-height:210px;${i === 5 ? `box-shadow:inset 0 0 0 2px ${ACC}` : ""}">
      <div style="font-size:13px;font-weight:600;color:${ACC}">${i + 1}</div><div style="margin-top:10px">${icon(ic, { size: 26, color: "#011441", stroke: 1.8 })}</div>
      <div style="margin-top:12px;font-size:16.5px;font-weight:600;line-height:1.25">${t}</div><div style="margin-top:6px;font-size:13.5px;color:#5a6680;line-height:1.35">${d}</div></div>`).join("")}</div>${SOURCE}`)),
  /* 2) Bültende yayın: iki ay itiraz */
  tile(panel(`${head("newspaper", "Resmi Marka Bülteni", "Yayından sonra itiraz süresi")}
    <div class="row" style="gap:40px;margin-top:30px;align-items:flex-end"><div style="font-size:150px;font-weight:300;letter-spacing:-.05em;line-height:.9;color:#011441">2 ay</div>
    <div style="font-size:19px;color:#3b4763;line-height:1.5;max-width:520px;padding-bottom:14px">Üçüncü kişiler başvuruyu görür ve bu süre içinde yazılı, gerekçeli itiraz edebilir. İtiraz gelirse görüşünüz istenir.</div></div>
    <div style="margin-top:30px;height:18px;border-radius:10px;background:#eef2f9;position:relative;overflow:hidden"><div style="position:absolute;left:0;top:0;bottom:0;width:62%;border-radius:10px;background:linear-gradient(90deg,${ACC},#3d8bf2)"></div></div>
    <div class="row" style="justify-content:space-between;margin-top:10px;font-size:14px;color:#5a6680"><span>Bültende yayın</span><span>İtiraz süresinin sonu</span></div>${SOURCE.replace("(SMK)", "(SMK), md. 18")}`)),
  /* 3) Koruma süresi: 10 yıl, onar yıllık yenileme */
  tile(panel(`${head("shield-check", "Koruma süresi", "Başvuru tarihinden itibaren on yıl")}
    <div style="margin-top:44px;position:relative;height:120px">
      <div style="position:absolute;left:0;right:0;top:44px;height:6px;border-radius:3px;background:#e3e9f4"></div>
      ${[["0", "Başvuru", 0], ["10. yıl", "Yenileme", 33.3], ["20. yıl", "Yenileme", 66.6], ["…", "Onar yıllık dönemler", 100]].map(([y, l, x], i) => `<div style="position:absolute;left:${x}%;top:0;transform:translateX(${i === 3 ? "-100%" : i === 0 ? "0" : "-50%"});text-align:${i === 3 ? "right" : i === 0 ? "left" : "center"}"><div style="font-size:26px;font-weight:600;color:#011441">${y}</div><div style="width:22px;height:22px;border-radius:50%;background:${i < 3 ? ACC : "#c9d6ee"};box-shadow:0 0 0 6px #fff;margin:6px ${i === 3 ? "0 0 auto" : i === 0 ? "auto 0 0" : "auto"}"></div><div style="font-size:15px;color:#5a6680;margin-top:6px;white-space:nowrap">${l}</div></div>`).join("")}
      <div style="position:absolute;left:0;width:33.3%;top:44px;height:6px;border-radius:3px;background:${ACC}"></div>
    </div>
    <div style="margin-top:30px;font-size:19px;color:#3b4763;line-height:1.5">Koruma, onar yıllık dönemler hâlinde yenilenir; yenileme tarihini sizin yerinize takip ederiz.</div>${SOURCE.replace("(SMK)", "(SMK), md. 23")}`)),
  /* 4) Nice sınıfları: 45 sınıf, 1-34 mal, 35-45 hizmet */
  tile(panel(`${head("layout-grid", "Nice sınıflandırması", "45 sınıf: 34 mal, 11 hizmet")}
    <div style="display:grid;grid-template-columns:repeat(15,1fr);gap:8px;margin-top:30px">${Array.from({ length: 45 }, (_, i) => i + 1).map((n) => `<div style="height:52px;border-radius:12px;display:grid;place-items:center;font:600 16px Outfit;${n === 35 || n === 42 ? `background:${ACC};color:#fff` : n >= 35 ? "background:#e2ecfb;color:#12419b" : "background:#f3f6fa;color:#5a6680"}">${n}</div>`).join("")}</div>
    <div class="row" style="gap:22px;margin-top:22px;font-size:15px;color:#3b4763"><span class="row" style="gap:8px"><span style="width:16px;height:16px;border-radius:5px;background:#f3f6fa;box-shadow:inset 0 0 0 1px #dfe5ee"></span>1–34 mal</span><span class="row" style="gap:8px"><span style="width:16px;height:16px;border-radius:5px;background:#e2ecfb"></span>35–45 hizmet</span><span class="row" style="gap:8px"><span style="width:16px;height:16px;border-radius:5px;background:${ACC}"></span>Örnek: 35 reklam ve işletme yönetimi, 42 yazılım ve tasarım</span></div>
    <div style="margin-top:16px;font-size:16px;color:#5a6680">Marka, başvuruda seçilen mal ve hizmetler için korunur; her ek sınıf ücreti artırır.</div>`)),
  /* 5) Ön araştırma: bakılacaklar */
  tile(panel(`${head("search", "Ön araştırma", "Başvurudan önce bakılacaklar")}
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:30px">${[["Aynı ad, aynı ya da benzer mal ve hizmetler için tescilli mi?", "copy"], ["Yazılışı farklı ama okunuşu benzer markalar var mı?", "audio-lines"], ["Logodaki şekil unsuru tescilli bir şekle benziyor mu?", "shapes"], ["Alan adı ve sosyal medya kullanıcı adları uygun mu?", "at-sign"]].map(([t, ic]) => `<div class="row" style="gap:16px;align-items:flex-start;border-radius:18px;background:#f3f7fd;padding:22px 22px"><span style="flex-shrink:0">${icon(ic, { size: 26, color: ACC, stroke: 2 })}</span><span style="font-size:18px;line-height:1.4;color:#1f2b46">${t}</span></div>`).join("")}</div>
    <div style="margin-top:22px;font-size:16px;color:#5a6680">Araştırmayı isim aşamasında yapmak, tasarım emeğinin boşa gitmesini önler.</div>`)),
  /* 6) Guru'nun Marka Tescil kampanya görseli */
  tile(`<div style="position:absolute;left:110px;top:70px;width:610px;height:760px;border-radius:26px;overflow:hidden;background:#fff url('${KAMPANYA}') 50% 50%/cover;box-shadow:0 0 0 1px rgb(255 255 255/.5),0 60px 100px -40px rgb(0 6 26/.8);transform:rotate(-2deg)"></div>
    ${floatCard(head("megaphone", "Kendi kampanyamız", "Marka Tescil hizmet gönderisi"), "left:690px;top:600px;width:440px")}`),
];

export const tescilScenesReal = () => [
  { name: "real-marka-tescil-hero", w: 1600, h: 1000, html: tescilHero() },
  { name: "real-marka-tescil-kapak", w: 1200, h: 1500, html: tescilCover() },
  ...tiles().map((html, i) => ({ name: `real-marka-tescil-${i + 1}`, w: 1200, h: 900, html })),
];
