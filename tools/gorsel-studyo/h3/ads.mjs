// Dijital Reklam Yönetimi: müşteri markaları için yayınlanan reklamlar (akış, hikâye,
// arama, video), kreatif testleri ve Google ödülleri (gerçek)
import { browser, chip, cover, feature, glass, hero, icon, page, phone, pic, statusBar, T, work } from "./common.mjs";
import { avatar, feedPost, kahvePost, lyaPost, novaPost, serp, storyFrame } from "./kit.mjs";

const t = T["dijital-reklam-yonetimi"];
const lyaAv = (d = 34) => avatar("L", "#3a2a2a", d, "#f7e8df", "Didot,serif");
const kahveAv = (d = 34) => avatar("K", "#1f3b2d", d, "#f6ead8");
const novaAv = (d = 34) => avatar("N", "#2f6bff", d);
const stat = (label, value, good = true) => `<div><div style="font-size:13.5px;color:#7f8aa3">${label}</div><div style="font-size:26px;font-weight:600;letter-spacing:-.02em;color:${good ? "#0c1a3a" : "#0c1a3a"}">${value}</div></div>`;

export const adsScenes = () => {
  const lyaFeed = feedPost({ handle: "lyaskin", av: lyaAv(), art: lyaPost(390, 488, { v: 2 }), artH: 488, sponsored: true, likes: "2.416", caption: "C vitamini serumu ile ışıltılı bir cilt. İlk siparişe kargo bizden.", cta: "Şimdi alışveriş yap" });
  const lyaFeedScreen = `<div style="width:390px;background:#fff">${statusBar()}${lyaFeed}</div>`;
  const kahveStory = storyFrame({ handle: "kahveduragi", av: kahveAv(32), art: kahvePost(390, 844, { v: 2 }), sponsored: true, cta: "Uygulamayı indir" });
  const novaStory = storyFrame({ handle: "novadis", av: novaAv(32), art: novaPost(390, 844, { v: 2 }), sponsored: true, cta: "Randevu al" });
  const searchAd = serp({ q: "diş beyazlatma kadıköy", tabs: false, results: [
    { ad: true, site: "Nova Diş Kliniği", url: "https://www.novadis.com.tr/beyazlatma", favTxt: "N", hi: true, title: "Diş Beyazlatma Kadıköy | Tek Seansta Sonuç", desc: "Uzman hekim kontrolünde ofis tipi beyazlatma. Ücretsiz ön muayene için hemen randevu alın.", sitelinks: ["Fiyatlar", "Önce / sonra", "Randevu al"] },
    { site: "Diş Sağlığı Rehberi", url: "https://www.dissagligi.org › beyazlatma", title: "Diş beyazlatma yöntemleri ve dikkat edilmesi gerekenler", desc: "Ev tipi ve ofis tipi beyazlatma arasındaki farklar…", fav: "#8a95ad", favTxt: "D" },
  ] });

  const out = [];
  out.push({
    name: "hizmet3-dijital-reklam-yonetimi-hero", w: 1600, h: 1000,
    html: hero({ t, art: `
      ${phone(kahveStory, 300, "left:260px;top:170px;transform:rotate(-6deg)")}
      ${phone(lyaFeedScreen, 340, "left:630px;top:110px")}
      ${phone(novaStory, 300, "left:1040px;top:170px;transform:rotate(6deg)")}
      ${chip(`<div class="row" style="gap:26px">${stat("Reklam getirisi", "5,8x")}${stat("Dönüşüm", "2.418")}${stat("Maliyet", "−%11")}</div>`, "left:560px;top:850px")}
    ` }),
  });
  out.push({
    name: "hizmet3-dijital-reklam-yonetimi-kapak", w: 1200, h: 1500,
    html: cover({ t, eyebrow: "Dijital Reklam Yönetimi", headline: "Her lira *ölçülür*", sub: "Arama, sosyal medya ve video reklamları; dönüşüm takibiyle", art: `
      ${phone(kahveStory, 330, "left:150px;top:150px;transform:rotate(-7deg)")}
      ${phone(lyaFeedScreen, 380, "left:620px;top:80px;transform:rotate(5deg)")}
      ${chip(`<div class="row" style="gap:22px">${stat("ROAS", "5,8x")}${stat("Tıklama oranı", "%3,4")}</div>`, "left:380px;top:40px")}
    ` }),
  });
  out.push({
    name: "hizmet3-dijital-reklam-yonetimi-1", w: 1200, h: 900,
    html: feature({ t, dark: true, title: "Akışta ve hikâyede doğru kreatif", sub: "Her mecranın ölçüsüne ve diline göre hazırlanmış reklam setleri.", body: `
      ${phone(lyaFeedScreen, 300, "left:40px;top:0")}
      ${phone(storyFrame({ handle: "lyaskin", av: lyaAv(32), art: lyaPost(390, 844, { v: 1 }), sponsored: true, cta: "Şimdi alışveriş yap" }), 270, "left:400px;top:40px")}
      ${phone(storyFrame({ handle: "lyaskin", av: lyaAv(32), art: lyaPost(390, 844, { v: 4 }), sponsored: true, cta: "Kodu kullan: LYA25" }), 270, "left:730px;top:40px")}` }),
  });
  out.push({
    name: "hizmet3-dijital-reklam-yonetimi-2", w: 1200, h: 900,
    html: feature({ t, title: "Arayan müşterinin karşısında", sub: "Arama reklamlarında doğru kelime, güçlü başlık ve hızlı açılan açılış sayfası.", body: `
      ${browser(searchAd, { url: "arabul.com/search?q=diş+beyazlatma+kadıköy", scale: 1.072, cw: 1000, vh: 470, style: "left:0;top:0" })}
      ${chip(`<div class="row" style="gap:30px">${stat("Tıklama oranı", "%8,2")}${stat("Kalite puanı", "9/10")}${stat("Randevu", "184")}</div>`, "left:560px;top:500px")}` }),
  });
  /* A/B testi */
  const variant = (k, art, ctr, win) => `<div class="abs sh" style="${k === "A" ? "left:0" : "left:390px"};top:0;width:360px;border-radius:24px;background:#fff;overflow:hidden">
    <div style="height:450px;overflow:hidden">${art}</div>
    <div class="row" style="padding:18px 22px;justify-content:space-between"><div><div style="font-size:14px;color:#7f8aa3">Varyant ${k}</div><div style="font-size:26px;font-weight:600">%${ctr} <span style="font-size:15px;color:#7f8aa3;font-weight:500">tıklama</span></div></div>${win ? `<span class="row" style="gap:6px;padding:8px 14px;border-radius:999px;background:#e6f6ec;color:#12873f;font-weight:600;font-size:14px">${icon("trophy", { size: 16 })}Kazanan</span>` : `<span style="padding:8px 14px;border-radius:999px;background:#eef1f6;color:#55617b;font-weight:600;font-size:14px">Durduruldu</span>`}</div></div>`;
  out.push({
    name: "hizmet3-dijital-reklam-yonetimi-3", w: 1200, h: 900,
    html: feature({ t, title: "Kreatifleri test ederek ilerliyoruz", sub: "Kazanan reklam bütçenin büyük kısmını alır; kaybeden yerini yeni fikre bırakır.", body: `
      ${variant("A", kahvePost(360, 450, { v: 1 }), "1,9", false)}
      ${variant("B", kahvePost(360, 450, { v: 2 }), "3,4", true)}
      <div class="abs sh" style="left:780px;top:0;width:292px;height:560px;border-radius:24px;background:linear-gradient(160deg,#011441,#12419b 70%,#2a6aca);color:#fff;padding:28px">
        <div style="font-size:15px;color:#bfe0ff">Kahve Durağı · Ekim testi</div>
        <div style="font-size:64px;font-weight:600;letter-spacing:-.04em;margin-top:22px">+%79</div>
        <div style="font-size:16px;line-height:1.5;opacity:.85">B varyantı daha fazla tıklama ve uygulama indirmesi getirdi.</div>
        <div style="margin-top:28px;display:grid;gap:14px;font-size:15px">${[["Gösterim", "412.800"], ["İndirme", "3.940"], ["İndirme başı", "₺6,2"]].map(([a, b]) => `<div class="row" style="justify-content:space-between;padding-bottom:12px;border-bottom:1px solid rgb(255 255 255/.15)"><span style="opacity:.75">${a}</span><b>${b}</b></div>`).join("")}</div>
      </div>` }),
  });
  /* Video reklam (genel video platformu) */
  const video = `<div style="width:1100px;background:#0f0f0f;color:#fff;font-family:Outfit;padding:24px">
    <div style="position:relative;height:560px;border-radius:16px;overflow:hidden">${lyaPost(1052, 560, { v: 3 })}
      <div class="abs" style="left:18px;bottom:18px;padding:8px 14px;border-radius:8px;background:rgb(0 0 0/.7);font-size:15px"><b style="color:#ffd84d">Reklam</b> · lyaskin.com.tr · 0:12</div>
      <div class="abs" style="right:0;bottom:22px;padding:14px 22px;background:rgb(0 0 0/.75);font-size:17px;font-weight:500">Reklamı atla ${icon("skip-forward", { size: 18 })}</div>
      <div class="abs" style="left:0;right:0;bottom:0;height:5px;background:rgb(255 255 255/.25)"><div style="width:38%;height:100%;background:#ffd84d"></div></div></div>
    <div class="row" style="gap:14px;margin-top:18px">${lyaAv(44)}<div><div style="font-size:19px;font-weight:600">Hassas ciltler için 3 adımlı rutin</div><div style="font-size:14px;opacity:.6">Lya Skin · Sponsorlu</div></div><span style="margin-left:auto;padding:12px 20px;border-radius:999px;background:#fff;color:#0f0f0f;font-weight:600">Siteyi ziyaret et</span></div></div>`;
  out.push({
    name: "hizmet3-dijital-reklam-yonetimi-4", w: 1200, h: 900,
    html: feature({ t, dark: true, title: "Video reklamlarla akılda kalın", sub: "İlk 5 saniyede mesajı veren, izlenme ve dönüşüm için ayrı kurgulanan videolar.", body: `
      ${browser(video, { url: "izle.com/watch?v=lya-rutin", scale: 0.975, cw: 1100, vh: 680, style: "left:0;top:0", dark: true })}
      ${glass(`<div class="row" style="gap:26px">${["İzlenme oranı|%41", "Hatırlanma|+%18", "Site ziyareti|9.120"].map((x) => { const [a, b] = x.split("|"); return `<div><div style="font-size:13.5px;opacity:.7">${a}</div><div style="font-size:26px;font-weight:600">${b}</div></div>`; }).join("")}</div>`, "left:620px;top:470px")}` }),
  });
  /* Kanal kırılımı (rapor, müşteri markası) */
  const ch = [["Arama reklamları", 46, "#2f6bff"], ["Sosyal medya", 31, "#7c5cff"], ["Video", 14, "#0ea5a5"], ["Görüntülü ağ", 9, "#e8833a"]];
  out.push({
    name: "hizmet3-dijital-reklam-yonetimi-5", w: 1200, h: 900,
    html: feature({ t, title: "Bütçe sonuç getiren kanala kayar", sub: "Her hafta kanal kanal bakıyor, verimli olana daha fazla bütçe ayırıyoruz.", body: `
      <div class="abs sh" style="left:0;top:0;width:640px;height:638px;border-radius:24px;background:#fff;padding:32px">
        <div style="font-size:21px;font-weight:600">Nova Diş · randevuların kanala göre dağılımı</div><div style="font-size:14px;color:#7f8aa3;margin-top:4px">Eylül 2026 · 612 randevu</div>
        <div style="display:grid;gap:26px;margin-top:36px">${ch.map(([n, v, c]) => `<div><div class="row" style="justify-content:space-between;font-size:17px"><span>${n}</span><b>%${v}</b></div><div style="height:16px;border-radius:16px;background:#f1f4f9;margin-top:10px"><div style="width:${v * 2}%;height:100%;border-radius:16px;background:${c}"></div></div></div>`).join("")}</div>
        <div class="row" style="gap:10px;margin-top:40px;padding:16px 18px;border-radius:16px;background:#eef3ff;color:#12419b;font-size:15.5px">${icon("lightbulb", { size: 20 })}Ekimde arama bütçesi %15 artırılıyor; video yeniden hedeflemeye geçiyor.</div>
      </div>
      <div class="abs sh" style="left:672px;top:0;width:400px;height:300px;border-radius:24px;background:linear-gradient(160deg,#011441,#12419b 70%,#2a6aca);color:#fff;padding:28px">
        <div style="font-size:15px;color:#bfe0ff">Randevu başı maliyet</div><div style="font-size:60px;font-weight:600;letter-spacing:-.04em;margin-top:14px">₺214</div><div class="row" style="gap:6px;margin-top:10px;font-size:15px">${icon("trending-down", { size: 17 })}3 ayda %37 düştü</div></div>
      <div class="abs sh" style="left:672px;top:330px;width:400px;height:308px;border-radius:24px;background:#fff;padding:28px">
        <div style="font-size:15px;color:#7f8aa3">Haftalık randevu</div>
        <svg width="344" height="200" viewBox="0 0 344 200" style="margin-top:18px">${[60, 72, 68, 90, 104, 98, 126, 140].map((v, i) => `<rect x="${i * 43 + 4}" y="${190 - v}" width="30" height="${v}" rx="8" fill="${i === 7 ? "#2f6bff" : "#dce8ff"}"/>`).join("")}</svg></div>` }),
  });
  /* Ödüller (gerçek) */
  out.push({
    name: "hizmet3-dijital-reklam-yonetimi-6", w: 1200, h: 900,
    html: feature({ t, dark: true, title: "Google'ın tanıdığı bir ekip", sub: "Google Partner rozeti ve 2025 Google Ads Impact Awards adaylığı.", body: `
      <div class="abs" style="left:0;top:40px;width:524px;height:370px;border-radius:24px;overflow:hidden;box-shadow:0 40px 80px -30px rgb(0 6 26/.7)">${pic(work("odul-impact.webp"), "width:100%;height:100%", "center")}</div>
      <div class="abs" style="left:548px;top:40px;width:524px;height:370px;border-radius:24px;overflow:hidden;box-shadow:0 40px 80px -30px rgb(0 6 26/.7)">${pic(work("odul-partner.webp"), "width:100%;height:100%", "center")}</div>
      ${glass(`<div class="row" style="gap:14px">${icon("badge-check", { size: 26, color: "#9fd2ff" })}<div><div style="font-size:20px;font-weight:600">Google Partner</div><div style="font-size:15px;opacity:.75">2026 yılında sertifikalı iş ortağı</div></div></div>`, "left:0;top:450px;width:524px", "22px 26px")}
      ${glass(`<div class="row" style="gap:14px">${icon("trophy", { size: 26, color: "#9fd2ff" })}<div><div style="font-size:20px;font-weight:600">Impact Awards 2025</div><div style="font-size:15px;opacity:.75">Data Innovation kategorisi adayı</div></div></div>`, "left:548px;top:450px;width:524px", "22px 26px")}` }),
  });
  out.push({ name: "hizmet3-raw-reklam-feed", w: 390, h: 844, html: page({ w: 390, h: 844, bg: "background:#fff;", body: lyaFeedScreen }) });
  out.push({ name: "hizmet3-raw-reklam-story-kahve", w: 390, h: 844, html: page({ w: 390, h: 844, bg: "background:#000;", body: kahveStory }) });
  out.push({ name: "hizmet3-raw-reklam-story-nova", w: 390, h: 844, html: page({ w: 390, h: 844, bg: "background:#000;", body: novaStory }) });
  out.push({ name: "hizmet3-raw-reklam-serp", w: 1000, h: 700, html: page({ w: 1000, h: 700, bg: "background:#fff;", body: searchAd }) });
  return out;
};

