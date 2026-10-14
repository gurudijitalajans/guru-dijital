// Mobil Uygulama: müşteri uygulamaları (Kahve Durağı sadakat uygulaması, Pati Klinik
// randevu uygulaması), mağaza sayfası, bildirimler, tel kafesten arayüze
import { cup } from "./art.mjs";
import { chip, cover, feature, glass, hero, icon, page, phone, statusBar, T } from "./common.mjs";
import { notif } from "./kit.mjs";

const t = T["mobil-uygulama"];
const KD = { green: "#1f3b2d", cream: "#f6ead8", clay: "#c65d3b" };
const PK = { blue: "#4f46e5", soft: "#eef0ff", ink: "#1e1b4b" };
const tab = (items, on, c) => `<div class="row" style="position:absolute;left:0;right:0;bottom:0;justify-content:space-around;padding:12px 10px 30px;background:#fff;box-shadow:0 -10px 30px -24px rgb(12 26 58/.4)">${items.map(([ic, l], i) => `<div style="display:grid;justify-items:center;gap:4px;font:${i === on ? 600 : 500} 11.5px Outfit;color:${i === on ? c : "#8a95ad"}">${icon(ic, { size: 22, stroke: i === on ? 2.3 : 1.9 })}${l}</div>`).join("")}</div>`;
const kdTabs = (on) => tab([["house", "Ana sayfa"], ["coffee", "Menü"], ["qr-code", "Kart"], ["user", "Profil"]], on, KD.green);
const pkTabs = (on) => tab([["house", "Ana sayfa"], ["calendar", "Randevu"], ["paw-print", "Dostlarım"], ["user", "Profil"]], on, PK.blue);
const screen = (bg, html) => `<div style="position:relative;width:390px;height:844px;background:${bg};font-family:Outfit;color:#0c1a3a;overflow:hidden">${html}</div>`;

/* ---------- Kahve Durağı ---------- */
const kdHome = () => screen("#faf6f0", `${statusBar()}
  <div style="padding:6px 20px 0"><div style="font-size:15px;color:#8a7c70">Günaydın,</div><div style="font:600 28px Outfit;letter-spacing:-.02em">Deniz ☕</div></div>
  <div style="margin:18px 20px 0;border-radius:24px;background:${KD.green};color:${KD.cream};padding:22px;position:relative;overflow:hidden">
    <div style="position:absolute;right:-30px;bottom:-40px;opacity:.9">${cup(170, { body: KD.cream, coffee: "#6b3f2a", saucer: "rgb(255 255 255/.15)" })}</div>
    <div style="font:700 12px Outfit;letter-spacing:.2em;opacity:.8">DURAK KART</div>
    <div style="font:600 34px Outfit;margin-top:10px">7 / 10</div><div style="font-size:14px;opacity:.85">3 kahve sonra 1 kahve bizden</div>
    <div class="row" style="gap:6px;margin-top:16px">${Array.from({ length: 10 }, (_, i) => `<span style="width:20px;height:20px;border-radius:50%;background:${i < 7 ? KD.cream : "rgb(255 255 255/.18)"}"></span>`).join("")}</div></div>
  <div class="row" style="justify-content:space-between;padding:22px 20px 10px"><span style="font:600 19px Outfit">Bugün öneriyoruz</span><span style="font-size:14px;color:${KD.clay};font-weight:600">Tümü</span></div>
  <div class="row" style="gap:12px;padding:0 20px">${[["Fıstıklı latte", "₺145", "#9bb07a"], ["Flat white", "₺120", "#6b3f2a"]].map(([n, p, c]) => `<div style="flex:1;border-radius:20px;background:#fff;padding:14px;box-shadow:0 10px 24px -18px rgb(0 0 0/.3)"><div style="height:110px;border-radius:14px;background:#f1e3cf;display:grid;place-items:center">${cup(96, { coffee: c })}</div><div style="font:600 16px Outfit;margin-top:10px">${n}</div><div class="row" style="justify-content:space-between;margin-top:4px"><span style="color:#8a7c70">${p}</span><span style="width:30px;height:30px;border-radius:50%;background:${KD.green};display:grid;place-items:center">${icon("plus", { size: 16, color: "#fff", stroke: 2.6 })}</span></div></div>`).join("")}</div>
  ${kdTabs(0)}`);
const kdMenu = () => screen("#fff", `${statusBar()}
  <div style="padding:6px 20px"><div style="font:600 26px Outfit">Menü</div><div class="row" style="gap:8px;margin-top:14px">${["Sıcak", "Soğuk", "Tatlı", "Atıştırmalık"].map((x, i) => `<span style="padding:9px 16px;border-radius:999px;font-size:14px;font-weight:600;${i === 0 ? `background:${KD.green};color:#fff` : "background:#f3efe9;color:#5a4f46"}">${x}</span>`).join("")}</div></div>
  <div style="display:grid;gap:12px;padding:12px 20px">${[["Türk kahvesi", "Közde, lokum ile", "₺90"], ["Latte", "Çift shot espresso", "₺125"], ["Fıstıklı latte", "Antep fıstığı şurubu", "₺145"], ["Filtre kahve", "Günün çekirdeği", "₺100"], ["Sıcak çikolata", "Belçika çikolatası", "₺130"]].map(([n, d, p], i) => `<div class="row" style="gap:14px;padding:12px;border-radius:18px;background:${i === 2 ? "#f6efe6" : "#fff"};box-shadow:0 0 0 1px #f0ebe4"><span style="width:64px;height:64px;border-radius:14px;background:#f1e3cf;display:grid;place-items:center">${cup(54, { coffee: i === 2 ? "#9bb07a" : "#6b3f2a" })}</span><div style="flex:1"><div style="font:600 16px Outfit">${n}</div><div style="font-size:13.5px;color:#8a7c70">${d}</div></div><b style="font-size:16px">${p}</b></div>`).join("")}</div>
  <div class="row" style="position:absolute;left:20px;right:20px;bottom:100px;height:58px;border-radius:16px;background:${KD.clay};color:#fff;padding:0 20px;justify-content:space-between;font:600 16px Outfit"><span>Sepet · 2 ürün</span><span>₺270 ${icon("arrow-right", { size: 18 })}</span></div>
  ${kdTabs(1)}`);
const kdOrder = () => screen(KD.green, `${statusBar(true)}
  <div style="padding:20px 24px;color:${KD.cream}"><div style="font-size:15px;opacity:.75">Sipariş #2184</div><div style="font:600 32px/1.1 Outfit;margin-top:6px">Kahveniz<br>hazırlanıyor</div></div>
  <div style="display:grid;place-items:center;margin-top:10px">${cup(230, { body: KD.cream, coffee: "#6b3f2a", saucer: "rgb(255 255 255/.15)" })}</div>
  <div style="margin:10px 20px 0;border-radius:22px;background:#fff;padding:20px">${[["Sipariş alındı", "08:41", 1], ["Hazırlanıyor", "08:42", 1], ["Teslim noktasında", "~3 dk", 0]].map(([a, b, d], i) => `<div class="row" style="gap:12px;padding:8px 0"><span style="width:28px;height:28px;border-radius:50%;background:${d ? KD.green : "#eee6db"};display:grid;place-items:center">${d ? icon("check", { size: 15, color: "#fff", stroke: 3 }) : ""}</span><span style="flex:1;font:${i === 1 ? 600 : 500} 16px Outfit">${a}</span><span style="font-size:14px;color:#8a7c70">${b}</span></div>`).join("")}</div>
  <div style="margin:14px 20px 0;padding:16px 18px;border-radius:18px;background:rgb(255 255 255/.1);color:${KD.cream};font-size:14.5px" class="row">${icon("map-pin", { size: 18 })}<span style="margin-left:10px">Moda şubesi · Bahariye Cd. 42</span></div>`);

/* ---------- Pati Klinik ---------- */
const pkHome = () => screen("#f7f7fd", `${statusBar()}
  <div class="row" style="padding:6px 20px 0;gap:12px"><div style="flex:1"><div style="font-size:15px;color:#6b6b8a">Merhaba Selin</div><div style="font:600 26px Outfit;color:${PK.ink}">Pamuk nasıl?</div></div><span style="width:46px;height:46px;border-radius:50%;background:#ffe2c6;display:grid;place-items:center;font-size:24px">🐶</span></div>
  <div style="margin:18px 20px 0;border-radius:24px;background:${PK.blue};color:#fff;padding:20px"><div style="font-size:13px;opacity:.8;font-weight:600;letter-spacing:.08em">YAKLAŞAN RANDEVU</div><div class="row" style="gap:14px;margin-top:12px"><span style="width:58px;height:62px;border-radius:16px;background:rgb(255 255 255/.16);display:grid;place-items:center;text-align:center;font:600 13px Outfit">CUM<br><span style="font-size:24px">17</span></span><div><div style="font:600 19px Outfit">Karma aşı ve kontrol</div><div style="font-size:14px;opacity:.85">10:30 · Vet. Hekim Ali Er</div></div></div><div class="row" style="gap:10px;margin-top:16px">${["Yol tarifi", "Takvime ekle"].map((x) => `<span style="flex:1;height:40px;border-radius:12px;background:rgb(255 255 255/.16);display:grid;place-items:center;font-size:14px;font-weight:600">${x}</span>`).join("")}</div></div>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;padding:18px 20px">${[["stethoscope", "Muayene"], ["syringe", "Aşı takvimi"], ["scissors", "Bakım"], ["pill", "Reçeteler"]].map(([ic, n]) => `<div style="padding:16px;border-radius:20px;background:#fff;box-shadow:0 10px 24px -20px rgb(30 27 75/.4)"><span style="width:42px;height:42px;border-radius:12px;background:${PK.soft};display:grid;place-items:center">${icon(ic, { size: 21, color: PK.blue })}</span><div style="font:600 16px Outfit;margin-top:12px;color:${PK.ink}">${n}</div></div>`).join("")}</div>
  ${pkTabs(0)}`);
const pkBook = () => screen("#fff", `${statusBar()}
  <div class="row" style="padding:6px 20px;gap:12px">${icon("chevron-left", { size: 24 })}<span style="font:600 20px Outfit;color:${PK.ink}">Randevu al</span></div>
  <div style="padding:10px 20px"><div style="font-size:14px;color:#6b6b8a;font-weight:600">Ekim 2026</div><div class="row" style="gap:8px;margin-top:12px">${[["Pzt", 13], ["Sal", 14], ["Çar", 15], ["Per", 16], ["Cum", 17]].map(([d, n]) => `<div style="flex:1;padding:10px 0;border-radius:16px;text-align:center;${n === 17 ? `background:${PK.blue};color:#fff` : `background:${PK.soft};color:${PK.ink}`}"><div style="font-size:12.5px;opacity:.8">${d}</div><div style="font:600 20px Outfit">${n}</div></div>`).join("")}</div></div>
  <div style="padding:10px 20px"><div style="font:600 17px Outfit;color:${PK.ink}">Uygun saatler</div><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:12px">${["09:00", "09:30", "10:30", "11:00", "14:00", "15:30"].map((h) => `<span style="height:46px;border-radius:12px;display:grid;place-items:center;font-weight:600;${h === "10:30" ? `background:${PK.blue};color:#fff` : `box-shadow:inset 0 0 0 1.5px #e3e4f6;color:${PK.ink}`}">${h}</span>`).join("")}</div></div>
  <div style="padding:14px 20px"><div style="font:600 17px Outfit;color:${PK.ink}">Hekim</div>${[["AE", "Vet. Hekim Ali Er", "İç hastalıklar · 4,9 ★"], ["ZK", "Vet. Hekim Zeynep Kaya", "Cerrahi · 4,8 ★"]].map(([a, n, d], i) => `<div class="row" style="gap:12px;margin-top:10px;padding:12px;border-radius:16px;${i === 0 ? `box-shadow:inset 0 0 0 2px ${PK.blue}` : "box-shadow:inset 0 0 0 1px #e9eaf6"}"><span style="width:44px;height:44px;border-radius:50%;background:${i ? "#fde2e4" : "#dbeafe"};display:grid;place-items:center;font:600 15px Outfit">${a}</span><div><div style="font:600 15.5px Outfit">${n}</div><div style="font-size:13px;color:#6b6b8a">${d}</div></div></div>`).join("")}</div>
  <div style="position:absolute;left:20px;right:20px;bottom:40px;height:58px;border-radius:16px;background:${PK.blue};color:#fff;display:grid;place-items:center;font:600 17px Outfit">Randevuyu onayla</div>`);
const lock = () => screen("linear-gradient(170deg,#2a2a6e,#5b4bd6 50%,#c39bff)", `${statusBar(true)}
  <div style="text-align:center;color:#fff;margin-top:40px"><div style="font-size:19px;opacity:.85">Perşembe 16 Ekim</div><div style="font:500 92px/1 Outfit;letter-spacing:-.03em;margin-top:6px">9:41</div></div>
  <div style="display:grid;gap:10px;padding:40px 14px">${notif({ app: "Pati Klinik", color: PK.blue, letter: "P", title: "Yarın randevunuz var 🐾", text: "Pamuk için karma aşı · Cuma 10:30", time: "şimdi" })}${notif({ app: "Kahve Durağı", color: KD.green, letter: "K", title: "Bir kahve bizden!", text: "Durak kartınız doldu, sıradaki kahveniz ücretsiz.", time: "8 dk" })}${notif({ app: "Pati Klinik", color: PK.blue, letter: "P", title: "Reçeteniz hazır", text: "Vitamin takviyesi eczane bölümünde.", time: "1 sa" })}</div>`);

const appIcon = (bg, inner, d = 88) => `<span style="width:${d}px;height:${d}px;border-radius:${d * 0.23}px;background:${bg};display:grid;place-items:center;box-shadow:0 14px 28px -14px rgb(0 0 0/.5)">${inner}</span>`;
const kdIcon = (d) => appIcon(KD.green, `<span style="font:700 ${d * 0.42}px Outfit;color:${KD.cream}">K</span>`, d);
const pkIcon = (d) => appIcon(PK.blue, `<span style="font-size:${d * 0.46}px">🐾</span>`, d);

export const mobileScenes = () => {
  const A = kdHome(), B = kdMenu(), C = kdOrder(), D = pkHome(), E = pkBook(), L = lock();
  const out = [];
  out.push({
    name: "hizmet3-mobil-uygulama-hero", w: 1600, h: 1000,
    html: hero({ t, art: `
      ${phone(B, 290, "left:230px;top:200px;transform:rotate(-8deg)")}
      ${phone(A, 330, "left:500px;top:120px;transform:rotate(-2deg)")}
      ${phone(D, 330, "left:800px;top:120px;transform:rotate(2deg)")}
      ${phone(E, 290, "left:1090px;top:200px;transform:rotate(8deg)")}
      ${chip(`<div class="row" style="gap:14px">${kdIcon(52)}<div><div style="font-size:18px;font-weight:600">Kahve Durağı</div><div style="font-size:14px;color:#7f8aa3"><span style="color:#f2a600">★★★★★</span> 4,8 · iOS ve Android</div></div></div>`, "left:200px;top:96px")}
    ` }),
  });
  out.push({
    name: "hizmet3-mobil-uygulama-kapak", w: 1200, h: 1500,
    html: cover({ t, eyebrow: "Mobil Uygulama", headline: "Cebinizdeki *markanız*", sub: "iOS ve Android uygulamaları; tasarımdan mağaza yayınına kadar", art: `
      ${phone(A, 360, "left:170px;top:120px;transform:rotate(-6deg)")}
      ${phone(D, 360, "left:640px;top:120px;transform:rotate(6deg)")}
      <div class="abs" style="left:540px;top:60px">${kdIcon(110)}</div>` }),
  });
  out.push({
    name: "hizmet3-mobil-uygulama-1", w: 1200, h: 900,
    html: feature({ t, dark: true, title: "Kafe zinciri: sadakat ve sipariş", sub: "Kahve Durağı uygulamasında dijital durak kart, menü ve sipariş takibi.", body: `
      ${phone(A, 280, "left:40px;top:10px")}${phone(B, 280, "left:395px;top:10px")}${phone(C, 280, "left:750px;top:10px")}` }),
  });
  out.push({
    name: "hizmet3-mobil-uygulama-2", w: 1200, h: 900,
    html: feature({ t, title: "Veteriner kliniği: randevu cepte", sub: "Pati Klinik uygulamasında randevu, aşı takvimi ve hatırlatmalar.", body: `
      ${phone(D, 280, "left:120px;top:10px")}${phone(E, 280, "left:470px;top:10px")}
      ${chip(`<div style="font-size:14px;color:#7f8aa3">Uygulamadan alınan randevu</div><div style="font-size:34px;font-weight:600;margin-top:4px">%62</div><div style="font-size:14px;color:#12873f;font-weight:600">telefon trafiği yarıya indi</div>`, "left:820px;top:200px;width:250px")}` }),
  });
  out.push({
    name: "hizmet3-mobil-uygulama-3", w: 1200, h: 900,
    html: feature({ t, dark: true, title: "Doğru anda doğru bildirim", sub: "Hatırlatma, kampanya ve sipariş bildirimleri kullanıcıyı uygulamaya geri getirir.", body: `
      ${phone(L, 300, "left:80px;top:0")}
      ${glass(`<div style="font-size:20px;font-weight:600">Bildirim kurguları</div>${[["Randevudan 1 gün önce", "hatırlatma"], ["Kart dolunca", "ödül"], ["Sepette ürün kalınca", "2 saat sonra"], ["Doğum günü", "kişisel indirim"]].map(([a, b]) => `<div class="row" style="justify-content:space-between;margin-top:14px;padding-bottom:12px;border-bottom:1px solid rgb(255 255 255/.12);font-size:16px"><span>${a}</span><span style="opacity:.7">${b}</span></div>`).join("")}<div class="row" style="gap:20px;margin-top:20px">${["Açılma oranı|%34", "Geri dönüş|+%21"].map((x) => { const [a, b] = x.split("|"); return `<div><div style="font-size:13.5px;opacity:.7">${a}</div><div style="font-size:28px;font-weight:600">${b}</div></div>`; }).join("")}</div>`, "left:480px;top:60px;width:560px", "28px")}` }),
  });
  /* Mağaza sayfası (genel mağaza görünümü) */
  const store = screen("#fff", `${statusBar()}
    <div class="row" style="gap:16px;padding:14px 20px">${kdIcon(96)}<div><div style="font:600 22px Outfit">Kahve Durağı</div><div style="font-size:14px;color:#7f8aa3">Yemek ve içecek</div><span style="display:inline-block;margin-top:10px;padding:7px 22px;border-radius:999px;background:#2f6bff;color:#fff;font-weight:600;font-size:15px">Yükle</span></div></div>
    <div class="row" style="justify-content:space-around;padding:12px 20px;margin:0 20px;border-top:1px solid #eef0f4;border-bottom:1px solid #eef0f4;text-align:center">${[["4,8 ★", "12 B puan"], ["#3", "Yemek-içecek"], ["4+", "Yaş"]].map(([a, b]) => `<div><div style="font:600 18px Outfit">${a}</div><div style="font-size:12px;color:#7f8aa3">${b}</div></div>`).join("")}</div>
    <div class="row" style="gap:10px;padding:16px 20px;overflow:hidden">${[A, B, C].map((x) => `<div style="flex-shrink:0;width:150px;height:325px;border-radius:18px;overflow:hidden;box-shadow:0 0 0 1px #eef0f4"><div style="width:390px;height:844px;transform:scale(${150 / 390});transform-origin:0 0">${x}</div></div>`).join("")}</div>
    <div style="padding:0 20px;font-size:15px;line-height:1.5;color:#3b4763">Favori kahvenizi sıra beklemeden sipariş edin, her kahvede durak toplayın.</div>`);
  out.push({
    name: "hizmet3-mobil-uygulama-4", w: 1200, h: 900,
    html: feature({ t, title: "Mağazalarda yayında", sub: "Mağaza görselleri, açıklamalar ve inceleme süreci dahil; yayına kadar biz yürütüyoruz.", body: `
      ${phone(store, 290, "left:90px;top:0")}
      ${chip(`<div class="row" style="gap:16px">${pkIcon(64)}<div><div style="font-size:19px;font-weight:600">Pati Klinik</div><div style="font-size:14px;color:#7f8aa3">Sürüm 2.4 · İncelemeden geçti</div></div><span style="margin-left:12px;padding:6px 12px;border-radius:999px;background:#e6f6ec;color:#12873f;font-weight:600;font-size:14px">Yayında</span></div>`, "left:470px;top:80px")}
      ${chip(`<div style="font-size:16px;font-weight:600">Son 30 gün</div><div class="row" style="gap:34px;margin-top:14px">${[["İndirme", "8.940"], ["Aktif kullanıcı", "5.120"], ["Çökmesiz", "%99,8"]].map(([a, b]) => `<div><div style="font-size:13.5px;color:#7f8aa3">${a}</div><div style="font-size:28px;font-weight:600">${b}</div></div>`).join("")}</div>`, "left:470px;top:250px")}
      ${chip(`<div class="row" style="gap:10px"><span style="color:#f2a600;font-size:18px">★★★★★</span><b>“Sıra beklemek bitti, harika!”</b></div><div style="font-size:14px;color:#7f8aa3;margin-top:6px">Mağaza yorumu · Ekim 2026</div>`, "left:470px;top:440px")}` }),
  });
  /* Tel kafesten arayüze */
  const wire = screen("#f4f5f8", `${statusBar()}<div style="padding:10px 20px;display:grid;gap:14px">${[[40, 0.5], [150, 1], [24, 0.6]].map(([h, w]) => `<div style="height:${h}px;width:${w * 100}%;border-radius:14px;background:#dfe3ea"></div>`).join("")}<div class="row" style="gap:12px">${[0, 1].map(() => `<div style="flex:1;height:160px;border-radius:18px;background:#e6e9ef;box-shadow:inset 0 0 0 2px #d2d7e0"></div>`).join("")}</div>${[1, 2].map(() => `<div style="height:64px;border-radius:16px;background:#e6e9ef"></div>`).join("")}</div>`);
  out.push({
    name: "hizmet3-mobil-uygulama-5", w: 1200, h: 900,
    html: feature({ t, dark: true, title: "Tel kafesten son arayüze", sub: "Önce akışı ve ekranları birlikte çiziyor, onaydan sonra tasarlıyor ve kodluyoruz.", body: `
      ${phone(wire, 290, "left:120px;top:10px")}
      <div class="abs" style="left:470px;top:280px;width:120px;display:grid;place-items:center;color:#fff">${icon("arrow-right", { size: 54, stroke: 1.6, color: "#c3caff" })}</div>
      ${phone(A, 290, "left:640px;top:10px")}` }),
  });
  /* Teknik: tek kod tabanı, iOS + Android */
  out.push({
    name: "hizmet3-mobil-uygulama-6", w: 1200, h: 900,
    html: feature({ t, title: "iOS ve Android, tek ekip", sub: "Ödeme, konum, kamera ve bildirim entegrasyonlarıyla iki platform birlikte gelişir.", body: `
      ${phone(C, 280, "left:40px;top:10px")}
      <div class="abs sh" style="left:380px;top:20px;width:692px;border-radius:24px;background:#fff;padding:30px">
        <div style="font-size:20px;font-weight:600">Kahve Durağı · entegrasyonlar</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:20px">${[["credit-card", "Uygulama içi ödeme", "Kart ve cüzdan"], ["map-pin", "Şube bulucu", "Konuma göre en yakın şube"], ["bell", "Anlık bildirim", "Segment bazlı gönderim"], ["qr-code", "Kasada QR", "Durak kart okutma"], ["chart-column", "Analitik", "Ekran ve dönüşüm takibi"], ["shield-check", "KVKK uyumu", "İzin ve aydınlatma ekranları"]].map(([ic, a, b]) => `<div class="row" style="gap:12px;padding:14px;border-radius:16px;background:#f6f7fb"><span style="width:42px;height:42px;border-radius:12px;background:#ebedff;display:grid;place-items:center">${icon(ic, { size: 20, color: "#3646c0" })}</span><div><div style="font-size:15.5px;font-weight:600">${a}</div><div style="font-size:13.5px;color:#7f8aa3">${b}</div></div></div>`).join("")}</div>
        <div class="row" style="gap:12px;margin-top:20px">${["iOS 16+", "Android 9+", "Tablet uyumlu"].map((x) => `<span style="padding:8px 14px;border-radius:999px;background:#ebedff;color:#3646c0;font-weight:600;font-size:14px">${x}</span>`).join("")}</div>
      </div>` }),
  });
  for (const [n, h] of [["kd-home", A], ["kd-menu", B], ["kd-order", C], ["pk-home", D], ["pk-book", E], ["lock", L], ["store", store]])
    out.push({ name: `hizmet3-raw-mobil-${n}`, w: 390, h: 844, html: page({ w: 390, h: 844, bg: "background:#fff;", body: h }) });
  return out;
};
