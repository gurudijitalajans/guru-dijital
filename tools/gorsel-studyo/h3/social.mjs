// Sosyal Medya Yönetimi: müşteri hesaplarının akışı, kaydırmalı gönderiler (gerçek
// Lya Skin rutin rehberi), Reels, içerik takvimi, topluluk ve aylık rapor
import { chip, cover, feature, glass, hero, icon, page, phone, pic, statusBar, T, work } from "./common.mjs";
import { avatar, feedPost, kahvePost, lyaPost, novaPost, pamukPost, profile, storyFrame } from "./kit.mjs";

const t = T["sosyal-medya-yonetimi"];
const lyaAv = (d = 34) => avatar("L", "#3a2a2a", d, "#f7e8df", "Didot,serif");

export const socialScenes = () => {
  const tiles = [lyaPost(130, 163, { v: 1 }), lyaPost(130, 163, { v: 2 }), lyaPost(130, 163, { v: 3 }), lyaPost(130, 163, { v: 4 }), lyaPost(130, 163, { v: 2 }), lyaPost(130, 163, { v: 1 }), lyaPost(130, 163, { v: 3 }), lyaPost(130, 163, { v: 4 }), lyaPost(130, 163, { v: 1 })];
  const lyaProfile = profile({ handle: "lyaskin", name: "Lya Skin", bio: "Hassas ciltler için temiz içerikli bakım 🌿<br>Türkiye'de üretildi · lyaskin.com.tr", av: lyaAv(84), stats: [["148", "gönderi"], ["24,6B", "takipçi"], ["212", "takip"]], tiles });
  /* Kaydırmalı gönderi: Lya Skin akşam rutini (kurgusal marka) */
  const carousel = (n, v) => `<div style="width:390px;background:#fff">${statusBar()}${feedPost({ handle: "lyaskin", av: lyaAv(), art: `<div style="position:relative">${lyaPost(390, 488, { v })}<span class="abs" style="right:12px;top:12px;padding:4px 10px;border-radius:999px;background:rgb(0 0 0/.6);color:#fff;font:600 12px Outfit">${n}/5</span></div>`, artH: 488, likes: "3.912", caption: "Akşam rutini 3 adımda: kaydırın, kaydedin 📌" })}</div>`;
  const britC = carousel(1, 1);
  const reels = storyFrame({ handle: "kahveduragi", av: avatar("K", "#1f3b2d", 32, "#f6ead8"), art: kahvePost(390, 844, { v: 3 }), reels: true, cta: "" });

  const out = [];
  out.push({
    name: "hizmet3-sosyal-medya-yonetimi-hero", w: 1600, h: 1000,
    html: hero({ t, art: `
      ${phone(britC, 300, "left:250px;top:170px;transform:rotate(-6deg)")}
      ${phone(lyaProfile, 340, "left:630px;top:110px")}
      ${phone(reels, 300, "left:1050px;top:170px;transform:rotate(6deg)")}
      ${chip(`<div class="row" style="gap:14px"><span style="width:44px;height:44px;border-radius:12px;background:linear-gradient(45deg,#f9a03f,#e1306c 55%,#833ab4);display:grid;place-items:center">${icon("trending-up", { size: 22, color: "#fff" })}</span><div><div style="font-size:14px;color:#7f8aa3">Bu ay erişim</div><div style="font-size:24px;font-weight:600">412 bin <span style="font-size:15px;color:#12873f">+%38</span></div></div></div>`, "left:200px;top:110px")}
    ` }),
  });
  out.push({
    name: "hizmet3-sosyal-medya-yonetimi-kapak", w: 1200, h: 1500,
    html: cover({ t, eyebrow: "Sosyal Medya Yönetimi", headline: "Markanız *her gün* akışta", sub: "Plan, tasarım, paylaşım ve topluluk yönetimi tek ekipten", art: `
      ${phone(britC, 330, "left:130px;top:150px;transform:rotate(-7deg)")}
      ${phone(lyaProfile, 380, "left:640px;top:80px;transform:rotate(5deg)")}` }),
  });
  /* 1: Kaydırmalı gönderi (gerçek iş) */
  out.push({
    name: "hizmet3-sosyal-medya-yonetimi-1", w: 1200, h: 900,
    html: feature({ t, dark: true, title: "Kaydedilen, paylaşılan gönderiler", sub: "Bir kozmetik markası için hazırlanmış beş sayfalık rutin rehberi.", body: `
      ${[1, 2, 3, 4].map((v, i) => `<div class="abs" style="left:${i * 262}px;top:${i % 2 ? 40 : 0}px;width:250px;height:313px;border-radius:20px;overflow:hidden;box-shadow:0 40px 70px -30px rgb(0 6 26/.7)">${lyaPost(250, 313, { v })}<span class="abs" style="right:10px;top:10px;padding:3px 9px;border-radius:999px;background:rgb(0 0 0/.55);color:#fff;font:600 12px Outfit">${i + 1}/5</span></div>`).join("")}
      ${glass(`<div class="row" style="gap:30px">${["Kaydetme|2.840", "Paylaşım|1.126", "Yeni takipçi|+940"].map((x) => { const [a, b] = x.split("|"); return `<div><div style="font-size:13.5px;opacity:.7">${a}</div><div style="font-size:28px;font-weight:600">${b}</div></div>`; }).join("")}</div>`, "left:0;top:420px", "22px 28px")}` }),
  });
  /* 2: Profil ızgarası tutarlılığı */
  out.push({
    name: "hizmet3-sosyal-medya-yonetimi-2", w: 1200, h: 900,
    html: feature({ t, title: "Profilde tutarlı bir görünüm", sub: "Renk, yazı ve kompozisyon kurallarıyla akış tek bir marka gibi görünür.", body: `
      ${phone(lyaProfile, 300, "left:30px;top:0")}
      <div class="abs" style="left:380px;top:10px;display:grid;grid-template-columns:repeat(3,220px);gap:12px">${[1, 2, 3, 4, 1, 2].map((v) => `<div style="height:275px;border-radius:16px;overflow:hidden;box-shadow:0 20px 40px -24px rgb(1 12 40/.45)">${lyaPost(220, 275, { v })}</div>`).join("")}</div>` }),
  });
  /* 3: Reels */
  out.push({
    name: "hizmet3-sosyal-medya-yonetimi-3", w: 1200, h: 900,
    html: feature({ t, dark: true, title: "Kısa videolarla erişim", sub: "Reels ve TikTok için senaryo, çekim planı, kurgu ve altyazı.", body: `
      ${phone(reels, 270, "left:60px;top:20px")}
      ${phone(storyFrame({ handle: "pamuksokagi", av: avatar("P", "#3b3330", 32, "#efe6da"), art: pamukPost(390, 844, { v: 1 }), reels: true, cta: "" }), 270, "left:400px;top:20px")}
      ${phone(storyFrame({ handle: "novadis", av: avatar("N", "#2f6bff", 32), art: novaPost(390, 844, { v: 3 }), reels: true, cta: "" }), 270, "left:740px;top:20px")}` }),
  });
  /* 4: İçerik takvimi (müşteri planı) */
  const days = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];
  const items = [[0, "lya", 1, "Gönderi", "Rutin rehberi"], [1, "lya", 2, "Reels", "Serum uygulama"], [2, "lya", 3, "Hikâye", "Soru-cevap"], [3, "lya", 4, "Gönderi", "Kasım indirimi"], [4, "lya", 2, "Reels", "Kullanıcı yorumu"], [5, "lya", 1, "Hikâye", "Anket"], [6, "lya", 3, "Gönderi", "Haftanın ürünü"]];
  out.push({
    name: "hizmet3-sosyal-medya-yonetimi-4", w: 1200, h: 900,
    html: feature({ t, title: "Aylık plan, onayınızla yayında", sub: "Her ayın içerikleri önceden planlanır; onayladığınız gönderi zamanında paylaşılır.", body: `
      <div class="abs sh" style="left:0;top:0;width:1072px;height:638px;border-radius:24px;background:#fff;padding:28px">
        <div class="row" style="justify-content:space-between"><div><div style="font-size:21px;font-weight:600">Lya Skin · Kasım içerik planı</div><div style="font-size:14px;color:#7f8aa3;margin-top:4px">3. hafta · 7 içerik</div></div><div class="row" style="gap:8px">${[["Gönderi", "#eaf2ff", "#12419b"], ["Reels", "#f0ecff", "#5b3fd6"], ["Hikâye", "#e6f6ec", "#12873f"]].map(([a, b, c]) => `<span style="padding:6px 12px;border-radius:999px;background:${b};color:${c};font-size:13px;font-weight:600">${a}</span>`).join("")}</div></div>
        <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:12px;margin-top:22px">${days.map((d, i) => { const it = items[i]; const tone = { Gönderi: ["#eaf2ff", "#12419b"], Reels: ["#f0ecff", "#5b3fd6"], Hikâye: ["#e6f6ec", "#12873f"] }[it[3]]; return `<div><div style="font-size:14px;color:#7f8aa3;font-weight:500">${d} ${17 + i}</div><div style="margin-top:10px;border-radius:16px;background:#f6f8fc;padding:8px"><div style="height:${it[3] === "Gönderi" ? 160 : 230}px;border-radius:12px;overflow:hidden">${lyaPost(124, it[3] === "Gönderi" ? 160 : 230, { v: it[2] })}</div><div style="margin-top:8px;font-size:13px;font-weight:600;padding:3px 8px;border-radius:999px;display:inline-block;background:${tone[0]};color:${tone[1]}">${it[3]}</div><div style="font-size:13.5px;margin-top:6px;line-height:1.3">${it[4]}</div><div class="row" style="gap:5px;margin-top:8px;font-size:12.5px;color:${i < 4 ? "#12873f" : "#b45f06"}">${icon(i < 4 ? "check-circle" : "clock", { size: 14 })}${i < 4 ? "Onaylandı" : "Onay bekliyor"}</div></div></div>`; }).join("")}</div>
      </div>` }),
  });
  /* 5: Topluluk yönetimi: yorum ve mesaj yanıtları */
  const msg = (who, text, me = false) => `<div style="display:flex;justify-content:${me ? "flex-end" : "flex-start"}"><div style="max-width:78%;padding:12px 16px;border-radius:20px;font-size:15.5px;line-height:1.4;${me ? "background:#2f6bff;color:#fff;border-bottom-right-radius:6px" : "background:#eef1f6;border-bottom-left-radius:6px"}">${text}</div></div>`;
  const dm = `<div style="width:390px;height:844px;background:#fff;font-family:Outfit;color:#0c1a3a">${statusBar()}<div class="row" style="gap:12px;padding:6px 16px 14px;border-bottom:1px solid #f0f2f6">${icon("chevron-left", { size: 26 })}${avatar("E", "#d9467a", 38)}<div><div style="font-size:16px;font-weight:600">elif.k</div><div style="font-size:13px;color:#7f8aa3">Lya Skin'e mesaj</div></div></div>
    <div style="display:grid;gap:12px;padding:18px 16px">${msg("e", "Merhaba, serum hassas cilt için uygun mu?")}${msg("me", "Merhaba Elif Hanım 🌿 Evet, parfümsüz ve dermatolojik olarak test edildi. Akşam rutininde nemlendiriciden önce 2-3 damla öneriyoruz.", true)}${msg("e", "Teşekkürler! Kargo ne kadar sürer?")}${msg("me", "Bugün verilen siparişler yarın kargoda. İlk siparişe özel LYA10 kodu ile %10 indirim kazanabilirsiniz.", true)}</div></div>`;
  out.push({
    name: "hizmet3-sosyal-medya-yonetimi-5", w: 1200, h: 900,
    html: feature({ t, dark: true, title: "Yorumlar ve mesajlar yanıtsız kalmaz", sub: "Markanın diliyle, belirlenen sürelerde ve kurallarla topluluk yönetimi.", body: `
      ${phone(dm, 300, "left:60px;top:0")}
      <div class="abs sh" style="left:430px;top:30px;width:600px;border-radius:24px;background:#fff;padding:28px;color:#0c1a3a">
        <div style="font-size:20px;font-weight:600">Bu ayın topluluk özeti</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:20px">${[["Yanıtlanan mesaj", "1.284"], ["Ort. yanıt süresi", "18 dk"], ["Yanıtlanan yorum", "2.960"], ["Olumlu duygu", "%92"]].map(([a, b]) => `<div style="padding:18px;border-radius:16px;background:#f6f8fc"><div style="font-size:14px;color:#7f8aa3">${a}</div><div style="font-size:30px;font-weight:600;margin-top:4px">${b}</div></div>`).join("")}</div>
        <div class="row" style="gap:10px;margin-top:18px;padding:14px 16px;border-radius:14px;background:#eef3ff;color:#12419b;font-size:15px">${icon("message-square-heart", { size: 20 })}Sık sorulan 12 soru için hazır yanıt kütüphanesi güncellendi.</div>
      </div>` }),
  });
  /* 6: Gerçek gönderiler */
  out.push({
    name: "hizmet3-sosyal-medya-yonetimi-6", w: 1200, h: 900,
    html: feature({ t, title: "Markalarımız için hazırladığımız işler", sub: "Klinik, gıda, kozmetik ve eğitim markaları için kampanya ve ürün gönderileri.", body: `
      <div class="abs sh" style="left:0;top:0;width:1072px;height:330px;border-radius:24px;overflow:hidden">${pic(work("instagram-postlar.webp"), "width:100%;height:100%", "center")}</div>
      <div class="abs sh" style="left:0;top:354px;width:1072px;height:284px;border-radius:24px;overflow:hidden"><div style="width:100%;height:100%;background:#eceef1 url('${work("sosyal-icerik-cita.webp")}') center/contain no-repeat"></div></div>` }),
  });
  out.push({ name: "hizmet3-raw-sosyal-profil", w: 390, h: 844, html: page({ w: 390, h: 844, bg: "background:#fff;", body: lyaProfile }) });
  out.push({ name: "hizmet3-raw-sosyal-carousel", w: 390, h: 844, html: page({ w: 390, h: 844, bg: "background:#fff;", body: britC }) });
  out.push({ name: "hizmet3-raw-sosyal-reels", w: 390, h: 844, html: page({ w: 390, h: 844, bg: "background:#000;", body: reels }) });
  out.push({ name: "hizmet3-raw-sosyal-dm", w: 390, h: 844, html: page({ w: 390, h: 844, bg: "background:#fff;", body: dm }) });
  return out;
};
