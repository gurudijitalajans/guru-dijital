// SEO: müşterinin arama sonuçlarındaki yeri (Nova Diş Kliniği), yerel harita, içerik, teknik sağlık
import { tooth } from "./art.mjs";
import { browser, chip, cover, feature, hero, icon, page, phone, T } from "./common.mjs";
import { serp, serpMobile } from "./kit.mjs";
import { clinicDesktop } from "./sites.mjs";

const t = T.seo;
const NOVA = { site: "Nova Diş Kliniği", url: "https://www.novadis.com.tr › implant", fav: "#2f6bff", favTxt: "N" };
const others = [
  { site: "Diş Sağlığı Rehberi", url: "https://www.dissagligi.org › implant", title: "İmplant nedir, nasıl yapılır? Bilmeniz gerekenler", desc: "İmplant tedavisinin aşamaları, iyileşme süresi ve dikkat edilmesi gerekenler hakkında genel bilgiler…", fav: "#8a95ad", favTxt: "D" },
  { site: "Kadıköy Ağız ve Diş", url: "https://www.kadikoyadsm.com", title: "Kadıköy Ağız ve Diş Sağlığı Merkezi", desc: "Muayene, dolgu, kanal tedavisi ve implant hizmetleri için randevu…", fav: "#16a34a", favTxt: "K" },
];
const novaRes = (extra = {}) => ({ ...NOVA, hi: true, title: "İmplant Tedavisi Kadıköy | Nova Diş Kliniği", desc: "Uzman hekim kadromuzla tek seansta geçici diş, 10 yıl garanti ve ücretsiz ön muayene. Tedavi planınızı ilk görüşmede çıkarıyoruz.", rating: "4,9 · 820 yorum", sitelinks: ["Fiyatlar", "Hekimlerimiz", "Online randevu"], ...extra });
const rank = (n, label, delta) => `<div class="row" style="gap:14px"><span style="width:56px;height:56px;border-radius:16px;background:linear-gradient(135deg,#2f6bff,#12419b);color:#fff;display:grid;place-items:center;font:600 26px Outfit">${n}.</span><div><div style="font-size:14px;color:#7f8aa3">${label}</div><div class="row" style="gap:6px;font-size:18px;font-weight:600;color:#12873f">${icon("trending-up", { size: 18, stroke: 2.4 })}${delta}</div></div></div>`;

/* Yerel harita (çizim) */
function mapArt(w, h) {
  const roads = [
    "M0 120 C200 100 300 180 520 150 S900 90 1100 140", "M0 330 C240 300 420 360 640 320 S980 280 1100 300",
    "M180 0 C200 160 150 300 210 520", "M560 0 C540 140 620 300 580 520", "M860 0 C900 180 820 330 880 520",
  ];
  return `<svg width="${w}" height="${h}" viewBox="0 0 1100 520" preserveAspectRatio="xMidYMid slice"><rect width="1100" height="520" fill="#eef2ea"/>
  <path d="M760 520 C780 420 900 380 1100 400 V520Z" fill="#cfe3f5"/><path d="M0 430 C120 420 200 470 260 520 H0Z" fill="#cfe3f5"/>
  <rect x="300" y="190" width="160" height="90" rx="14" fill="#dbe8d3"/><rect x="660" y="40" width="140" height="80" rx="14" fill="#dbe8d3"/>
  ${roads.map((d) => `<path d="${d}" fill="none" stroke="#fff" stroke-width="18" stroke-linecap="round"/><path d="${d}" fill="none" stroke="#f6d77a" stroke-width="5" stroke-linecap="round" opacity=".7"/>`).join("")}
  </svg>`;
}
const pin = (x, y, c = "#e5484d", big = false, label = "") =>
  `<div class="abs" style="left:${x}px;top:${y}px;transform:translate(-50%,-100%);display:grid;justify-items:center">${label ? `<div style="margin-bottom:6px;padding:6px 12px;border-radius:10px;background:#fff;font:600 14px Outfit;color:#0c1a3a;box-shadow:0 8px 20px -10px rgb(0 0 0/.4);white-space:nowrap">${label}</div>` : ""}<svg width="${big ? 46 : 30}" height="${big ? 58 : 38}" viewBox="0 0 24 30"><path d="M12 0C5.4 0 0 5.2 0 11.6 0 20.3 12 30 12 30s12-9.7 12-18.4C24 5.2 18.6 0 12 0z" fill="${c}"/><circle cx="12" cy="11.5" r="4.6" fill="#fff"/></svg></div>`;

const gauge = (v, label, c = "#16a34a") => {
  const r = 46, C = 2 * Math.PI * r;
  return `<div style="display:grid;justify-items:center;gap:10px"><svg width="120" height="120" viewBox="0 0 120 120"><circle cx="60" cy="60" r="${r}" fill="none" stroke="#e7f6ec" stroke-width="10"/><circle cx="60" cy="60" r="${r}" fill="none" stroke="${c}" stroke-width="10" stroke-linecap="round" stroke-dasharray="${((v / 100) * C).toFixed(1)} ${C.toFixed(1)}" transform="rotate(-90 60 60)"/><text x="60" y="70" text-anchor="middle" font-family="Outfit" font-size="32" font-weight="600" fill="${c}">${v}</text></svg><div style="font-size:15px;font-weight:500">${label}</div></div>`;
};

export const seoScenes = () => {
  const Q = "implant tedavisi kadıköy";
  const S1 = serp({ q: Q, results: [novaRes(), ...others], ai: { text: "Kadıköy'de implant tedavisi genellikle muayene, cerrahi yerleştirme ve 2–4 aylık iyileşmenin ardından kalıcı diş aşamalarından oluşur. Fiyatlar kullanılan implant markasına ve kemik durumuna göre değişir.", sources: ["novadis.com.tr", "dissagligi.org", "kadikoyadsm.com"] } });
  const SM = serpMobile({ q: Q, results: [{ ...novaRes(), title: "İmplant Tedavisi Kadıköy | Nova Diş Kliniği" }, others[0], others[1]] });
  const out = [];
  out.push({
    name: "hizmet3-seo-hero", w: 1600, h: 1000,
    html: hero({ t, art: `
      ${browser(S1, { url: "arabul.com/search?q=implant+tedavisi+kadıköy", scale: 0.92, cw: 1000, vh: 760, style: "left:200px;top:120px" })}
      ${phone(SM, 270, "left:1140px;top:300px")}
      ${chip(rank(1, "“implant tedavisi kadıköy”", "6 ayda 14 sıra yükseldi"), "left:150px;top:700px")}
    ` }),
  });
  out.push({
    name: "hizmet3-seo-kapak", w: 1200, h: 1500,
    html: cover({ t, eyebrow: "SEO", headline: "Sizi arayan *sizi bulsun*", sub: "Arama sonuçlarında, haritada ve yapay zekâ özetlerinde görünür olun", art: `
      ${phone(SM, 420, "left:390px;top:40px")}
      ${chip(rank(1, "Kadıköy · implant", "+14 sıra"), "left:70px;top:330px")}
      ${chip(`<div class="row" style="gap:12px">${icon("map-pin", { size: 24, color: "#e5484d" })}<div><div style="font-size:14px;color:#7f8aa3">Haritada</div><div style="font-size:19px;font-weight:600">İlk 3 sonuçta</div></div></div>`, "left:830px;top:520px")}
    ` }),
  });
  out.push({
    name: "hizmet3-seo-1", w: 1200, h: 900,
    html: feature({ t, title: "Aranan kelimede ilk sırada", sub: "Doğru sayfa, doğru başlık ve güçlü içerikle müşteriniz sizi rakiplerden önce görür.", body: `
      ${browser(S1, { url: "arabul.com/search?q=implant+tedavisi+kadıköy", scale: 1.072, cw: 1000, vh: 555, style: "left:0;top:0" })}` }),
  });
  out.push({
    name: "hizmet3-seo-2", w: 1200, h: 900,
    html: feature({ t, dark: true, title: "Yakındaki müşteri için haritada", sub: "İşletme profili, yorumlar ve konum sinyalleriyle yerel aramalarda öne çıkın.", body: `
      <div class="abs" style="left:0;top:0;width:1072px;height:638px;border-radius:24px;overflow:hidden;box-shadow:0 40px 80px -30px rgb(0 6 26/.7)">${mapArt(1072, 638)}
        ${pin(420, 330, "#2f6bff", true, "Nova Diş Kliniği · 4,9 ★")}${pin(250, 200)}${pin(680, 420)}${pin(820, 210)}${pin(560, 150)}</div>
      ${chip(`<div style="width:330px"><div class="row" style="gap:12px"><span style="width:52px;height:52px;border-radius:14px;background:#2f6bff;display:grid;place-items:center">${tooth(32, "#fff", "#fff")}</span><div><div style="font-size:19px;font-weight:600">Nova Diş Kliniği</div><div style="font-size:14px;color:#7f8aa3">Diş kliniği · Kadıköy</div></div></div>
        <div class="row" style="gap:8px;margin-top:14px;font-size:15px"><b>4,9</b><span style="color:#f2a600">★★★★★</span><span style="color:#7f8aa3">(820)</span><span style="margin-left:auto;color:#12873f;font-weight:600">Açık</span></div>
        <div class="row" style="gap:8px;margin-top:14px">${["Yol tarifi", "Ara", "Web sitesi"].map((x, i) => `<span style="flex:1;height:40px;border-radius:999px;display:grid;place-items:center;font-size:14px;font-weight:600;${i === 0 ? "background:#2f6bff;color:#fff" : "background:#eef3ff;color:#12419b"}">${x}</span>`).join("")}</div></div>`, "left:640px;top:40px")}` }),
  });
  /* İçerik: klinik blogunda rehber yazı */
  const article = `<div style="width:1200px;background:#fff;font-family:Outfit;color:#0d2340">${clinicDesktop().slice(0, clinicDesktop().indexOf("<section"))}
    <div style="display:grid;grid-template-columns:minmax(0,1fr) 290px;gap:50px;padding:40px 64px">
      <div><div style="font-size:15px;color:#2f6bff;font-weight:500">Blog · İmplant</div><h1 style="font:600 54px/1.08 Outfit;letter-spacing:-.035em;margin-top:14px">İmplant tedavisi kaç seans sürer?</h1>
      <div style="font-size:16px;color:#5b6e8a;margin-top:14px">Dt. Ece Arslan · 6 dk okuma · Güncelleme: Eylül 2026</div>
      <p style="font-size:19px;line-height:1.75;margin-top:28px;color:#33465f">İmplant tedavisi çoğu hastada üç aşamada tamamlanır: muayene ve planlama, implantın yerleştirilmesi, iyileşmenin ardından kalıcı dişin takılması. Toplam süre kemik yapısına göre 2 ile 4 ay arasında değişir.</p>
      <h2 style="font:600 32px Outfit;margin-top:34px">1. Muayene ve planlama</h2><p style="font-size:19px;line-height:1.75;margin-top:12px;color:#33465f">İlk seansta ağız içi muayene ve 3 boyutlu tomografi ile kemik hacmi ölçülür…</p></div>
      <aside style="padding:26px;border-radius:22px;background:#f4f8ff;align-self:start"><div style="font:600 18px Outfit">Bu yazıda</div>${["Kaç seans sürer?", "Muayene ve planlama", "Yerleştirme günü", "İyileşme süreci", "Kalıcı diş", "Sık sorulanlar"].map((x, i) => `<div style="font-size:16px;margin-top:14px;color:${i === 1 ? "#2f6bff" : "#33465f"};font-weight:${i === 1 ? 600 : 400}">${x}</div>`).join("")}</aside>
    </div></div>`;
  out.push({
    name: "hizmet3-seo-3", w: 1200, h: 900,
    html: feature({ t, title: "Soruları yanıtlayan içerikler", sub: "Hastaların aradığı sorulara hekim imzalı, sade ve güncel rehber yazılar.", body: `
      ${browser(article, { url: "novadis.com.tr/blog/implant-kac-seans", scale: 0.893, cw: 1200, vh: 660, style: "left:0;top:0" })}` }),
  });
  /* Teknik sağlık */
  out.push({
    name: "hizmet3-seo-4", w: 1200, h: 900,
    html: feature({ t, dark: true, title: "Hızlı ve taranabilir bir site", sub: "Sayfa hızı, mobil uyum ve dizine eklenme sorunları teker teker kapanır.", body: `
      <div class="abs sh" style="left:0;top:0;width:1072px;height:300px;border-radius:24px;background:#fff;padding:30px 40px">
        <div class="row" style="justify-content:space-between"><div style="font-size:20px;font-weight:600">novadis.com.tr · mobil ölçüm</div><span style="padding:6px 12px;border-radius:999px;background:#e6f6ec;color:#12873f;font-size:14px;font-weight:600">Tümü iyi</span></div>
        <div class="row" style="justify-content:space-around;margin-top:22px">${gauge(97, "Performans")}${gauge(100, "Erişilebilirlik")}${gauge(100, "En iyi uygulamalar")}${gauge(100, "SEO")}</div></div>
      <div class="abs sh" style="left:0;top:330px;width:520px;height:308px;border-radius:24px;background:#fff;padding:28px">
        <div style="font-size:19px;font-weight:600">Temel web metrikleri</div>
        ${[["Yüklenme (LCP)", "1,4 sn", 0.86], ["Etkileşim (INP)", "120 ms", 0.92], ["Kayma (CLS)", "0,02", 0.97]].map(([a, b, p]) => `<div style="margin-top:20px"><div class="row" style="justify-content:space-between;font-size:15px"><span>${a}</span><b style="color:#12873f">${b}</b></div><div style="height:9px;border-radius:9px;background:#e7f6ec;margin-top:8px"><div style="height:100%;width:${p * 100}%;border-radius:9px;background:#16a34a"></div></div></div>`).join("")}</div>
      <div class="abs sh" style="left:552px;top:330px;width:520px;height:308px;border-radius:24px;background:#fff;padding:28px">
        <div style="font-size:19px;font-weight:600">Bu ay kapanan sorunlar</div>
        ${["Yinelenen başlıklar düzeltildi (38 sayfa)", "Görseller WebP'ye çevrildi", "Kırık 12 bağlantı yönlendirildi", "Site haritası yeniden gönderildi"].map((x) => `<div class="row" style="gap:12px;margin-top:16px;font-size:15.5px"><span style="width:24px;height:24px;border-radius:7px;background:#16a34a;display:grid;place-items:center">${icon("check", { size: 15, color: "#fff", stroke: 3 })}</span>${x}</div>`).join("")}</div>` }),
  });
  /* Çok dilli */
  const S2 = serp({ q: "dental implant istanbul", results: [{ ...NOVA, url: "https://www.novadis.com.tr › en › dental-implant", hi: true, title: "Dental Implants in Istanbul | Nova Dental Clinic", desc: "Same-week treatment plan, 10-year warranty and free airport transfer. Talk to our patient coordinator on WhatsApp.", rating: "4.9 · 820 reviews", sitelinks: ["Prices", "Treatment plan", "Contact"] }, { site: "Health Travel Guide", url: "https://www.healthtravel.example › turkey", title: "Dental treatment in Turkey: what to expect", desc: "A guide to clinics, prices and travel planning…", fav: "#8a95ad", favTxt: "H" }], tabs: false });
  out.push({
    name: "hizmet3-seo-5", w: 1200, h: 900,
    html: feature({ t, title: "Yurt dışındaki hasta da sizi bulsun", sub: "Her dil için ayrı sayfa ve hreflang kurgusu; doğru ülkede doğru sonuç.", body: `
      ${browser(S2, { url: "arabul.com/search?q=dental+implant+istanbul", scale: 1.0, cw: 1000, vh: 520, style: "left:0;top:0" })}
      ${chip(`<div style="font-size:15px;font-weight:600">Dil sürümleri</div><div class="row" style="gap:8px;margin-top:12px">${["TR", "EN", "DE", "AR", "RU"].map((x, i) => `<span style="width:52px;height:40px;border-radius:12px;display:grid;place-items:center;font-weight:600;${i === 1 ? "background:#2f6bff;color:#fff" : "background:#eef3ff;color:#12419b"}">${x}</span>`).join("")}</div>`, "left:690px;top:470px")}` }),
  });
  /* Aylık sıralama tablosu (şeffaf rapor) */
  const kw = [["implant tedavisi kadıköy", 17, 3], ["zirkonyum kaplama fiyat", 24, 5], ["şeffaf plak kadıköy", 12, 2], ["diş beyazlatma istanbul", 31, 8], ["çocuk diş hekimi kadıköy", 9, 1], ["acil diş hekimi", 22, 6]];
  out.push({
    name: "hizmet3-seo-6", w: 1200, h: 900,
    html: feature({ t, dark: true, title: "Her ay şeffaf sıralama raporu", sub: "Hangi kelimede nereden nereye geldiğinizi tek tabloda görürsünüz.", body: `
      <div class="abs sh" style="left:0;top:0;width:1072px;height:638px;border-radius:24px;background:#fff;padding:30px 36px">
        <div class="row" style="justify-content:space-between"><div><div style="font-size:21px;font-weight:600">Anahtar kelime sıralamaları</div><div style="font-size:14px;color:#7f8aa3;margin-top:4px">Nova Diş Kliniği · Mart → Eylül 2026</div></div><span style="padding:8px 14px;border-radius:999px;background:#eef3ff;color:#12419b;font-size:14px;font-weight:600">İlk 10'da 41 kelime</span></div>
        <div class="row" style="margin-top:24px;padding:0 4px 12px;font-size:13.5px;color:#7f8aa3;border-bottom:1px solid #eef1f6"><span style="flex:1">Kelime</span><span style="width:120px;text-align:center">Mart</span><span style="width:120px;text-align:center">Eylül</span><span style="width:140px;text-align:right">Değişim</span></div>
        ${kw.map(([k, a, b]) => `<div class="row" style="padding:15px 4px;font-size:17px;border-bottom:1px solid #f2f4f8"><span style="flex:1">${k}</span><span style="width:120px;text-align:center;color:#8a95ad">${a}.</span><span style="width:120px;text-align:center"><span style="display:inline-grid;place-items:center;min-width:44px;height:34px;border-radius:10px;background:${b <= 3 ? "#2f6bff" : "#eef3ff"};color:${b <= 3 ? "#fff" : "#12419b"};font-weight:600">${b}.</span></span><span class="row" style="width:140px;justify-content:flex-end;gap:6px;color:#12873f;font-weight:600">${icon("arrow-up", { size: 16, stroke: 2.6 })}${a - b}</span></div>`).join("")}
      </div>` }),
  });
  out.push({ name: "hizmet3-raw-seo-serp", w: 1000, h: 1300, html: rawPg(S1, 1000, 1300) });
  out.push({ name: "hizmet3-raw-seo-serp-m", w: 390, h: 1100, html: rawPg(SM, 390, 1100) });
  out.push({ name: "hizmet3-raw-seo-article", w: 1200, h: 1000, html: rawPg(article, 1200, 1000) });
  return out;
};
const rawPg = (html, w, h) => page({ w, h, bg: "background:#fff;", body: html });
