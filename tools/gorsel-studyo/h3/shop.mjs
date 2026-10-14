// E-Ticaret Yönetimi: müşteri mağazası (Pamuk Sokağı ev tekstili): vitrin, ürün sayfası,
// sepet, pazaryeri mağazaları (markasız genel görünüm), kampanya görselleri, sipariş akışı
import { towels } from "./art.mjs";
import { browser, chip, cover, feature, glass, hero, icon, macbook, page, phone, SANS2, SERIF, statusBar, T } from "./common.mjs";
import { notif, pamukPost } from "./kit.mjs";

const t = T["e-ticaret-yonetimi"];
const PS = { ink: "#3b3330", sand: "#f6f1ea", clay: "#a7684a", sage: "#8a9a7b" };
const prods = [["Bambu havlu seti", "₺1.290", "₺1.590", ["#f8efe4", "#cfdbe6", "#e6cfc4"]], ["Waffle pike", "₺890", "", ["#e9dfd2", "#f4ece2", "#d6c6b4"]], ["Keten masa örtüsü", "₺740", "", ["#dfe7ee", "#c6d3dd", "#eef2f5"]], ["Organik nevresim", "₺2.150", "₺2.690", ["#ecdcd3", "#f6efe6", "#d9b9aa"]]];
const card = (p, w = 300, h = 300) => `<div><div style="height:${h}px;border-radius:18px;background:${PS.sand};display:grid;place-items:center;position:relative">${towels(w * 0.8, p[3])}${p[2] ? `<span class="abs" style="left:14px;top:14px;padding:5px 10px;border-radius:999px;background:${PS.clay};color:#fff;font:600 12px Outfit">%20</span>` : ""}</div><div style="font:500 16px ${SANS2};margin-top:12px">${p[0]}</div><div style="font:600 16px ${SANS2};margin-top:4px">${p[1]} ${p[2] ? `<span style="font-weight:400;color:#a49a92;text-decoration:line-through;margin-left:6px">${p[2]}</span>` : ""}</div></div>`;

const store = () => `<div style="width:1440px;background:#fff;color:${PS.ink};font-family:${SANS2}">
  <div style="height:38px;background:${PS.ink};color:#f6f1ea;display:grid;place-items:center;font-size:14px">750 TL üzeri kargo bedava · 14 gün içinde ücretsiz iade</div>
  <div class="row" style="height:88px;padding:0 64px;gap:40px"><span style="font:400 30px ${SERIF};letter-spacing:.08em">PAMUK SOKAĞI</span><div class="row" style="gap:30px;font-size:15.5px">${["Banyo", "Yatak odası", "Mutfak", "Bebek", "İndirim"].map((x, i) => `<span style="${i === 4 ? `color:${PS.clay};font-weight:600` : ""}">${x}</span>`).join("")}</div><div class="row" style="margin-left:auto;gap:22px">${icon("search", { size: 21 })}${icon("heart", { size: 21 })}${icon("user", { size: 21 })}<span class="row" style="gap:6px">${icon("shopping-bag", { size: 21 })}<span style="width:22px;height:22px;border-radius:50%;background:${PS.clay};color:#fff;display:grid;place-items:center;font:600 12px Outfit">2</span></span></div></div>
  <section style="margin:0 24px;height:520px;border-radius:28px;background:linear-gradient(120deg,#efe6da,#e4d7c8);position:relative;overflow:hidden">
    <div class="abs" style="right:60px;bottom:30px">${towels(640, ["#f8efe4", "#cfdbe6", "#e6cfc4"])}</div>
    <div class="abs" style="left:64px;top:110px;width:520px"><div style="font:600 13px ${SANS2};letter-spacing:.3em">YENİ SEZON</div><h1 style="font:400 76px/1.02 ${SERIF};margin-top:18px">Yumuşacık<br>bir sonbahar</h1><p style="font-size:18px;line-height:1.6;margin-top:18px;color:#6d625b">%100 pamuk ve bambu karışımlı havlular, waffle pikeler.</p><span style="display:inline-block;margin-top:28px;padding:17px 30px;border-radius:999px;background:${PS.ink};color:#fff;font-weight:600">Koleksiyonu keşfet</span></div>
  </section>
  <div class="row" style="justify-content:space-between;padding:60px 64px 22px"><h2 style="font:400 40px ${SERIF}">Çok satanlar</h2><span style="font-size:15px;font-weight:600">Tümünü gör →</span></div>
  <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:24px;padding:0 64px 80px">${prods.map((p) => card(p)).join("")}</div>
  </div>`;

const product = () => `<div style="width:390px;background:#fff;color:${PS.ink};font-family:${SANS2};position:relative;height:844px">${statusBar()}
  <div class="row" style="padding:4px 18px 10px;justify-content:space-between">${icon("chevron-left", { size: 24 })}<span style="font:400 18px ${SERIF};letter-spacing:.08em">PAMUK SOKAĞI</span>${icon("shopping-bag", { size: 22 })}</div>
  <div style="margin:0 14px;height:330px;border-radius:22px;background:${PS.sand};display:grid;place-items:center;position:relative">${towels(280, prods[0][3])}<div class="row abs" style="bottom:14px;gap:6px">${[1, 0, 0, 0].map((a) => `<span style="width:${a ? 18 : 7}px;height:7px;border-radius:7px;background:${a ? PS.ink : "#cfc5bb"}"></span>`).join("")}</div></div>
  <div style="padding:18px 20px"><div style="font-size:13px;color:${PS.sage};font-weight:600">★★★★★ 4,8 · 312 değerlendirme</div><div style="font:400 26px ${SERIF};margin-top:6px">Bambu havlu seti</div><div style="font:600 22px ${SANS2};margin-top:6px">₺1.290 <span style="font-weight:400;font-size:16px;color:#a49a92;text-decoration:line-through">₺1.590</span></div>
  <div style="font-size:14px;font-weight:600;margin-top:16px">Renk: Kum</div><div class="row" style="gap:10px;margin-top:10px">${["#e9dfd2", "#cfdbe6", "#e6cfc4", "#8a9a7b"].map((c, i) => `<span style="width:34px;height:34px;border-radius:50%;background:${c};${i === 0 ? `box-shadow:0 0 0 2px #fff,0 0 0 4px ${PS.ink}` : ""}"></span>`).join("")}</div>
  <div class="row" style="gap:8px;margin-top:16px">${["3'lü set", "5'li set", "Banyo + el"].map((x, i) => `<span style="padding:10px 14px;border-radius:12px;font-size:14px;font-weight:600;${i === 0 ? `background:${PS.ink};color:#fff` : "box-shadow:inset 0 0 0 1px #ddd3c8"}">${x}</span>`).join("")}</div></div>
  <div class="row" style="position:absolute;left:20px;right:20px;bottom:34px;gap:10px"><span style="width:58px;height:58px;border-radius:16px;box-shadow:inset 0 0 0 1px #ddd3c8;display:grid;place-items:center">${icon("heart", { size: 22 })}</span><span style="flex:1;height:58px;border-radius:16px;background:${PS.clay};color:#fff;display:grid;place-items:center;font:600 17px ${SANS2}">Sepete ekle</span></div></div>`;

const cart = () => `<div style="width:390px;height:844px;background:#faf8f5;color:${PS.ink};font-family:${SANS2};position:relative">${statusBar()}
  <div style="padding:6px 20px 14px;font:400 26px ${SERIF}">Sepetim</div>
  ${[prods[0], prods[1]].map((p) => `<div class="row" style="gap:14px;margin:0 16px 12px;padding:12px;border-radius:18px;background:#fff"><span style="width:84px;height:84px;border-radius:14px;background:${PS.sand};display:grid;place-items:center">${towels(70, p[3])}</span><div style="flex:1"><div style="font-size:15.5px;font-weight:500">${p[0]}</div><div style="font-size:13px;color:#a49a92">Kum · 3'lü</div><div class="row" style="justify-content:space-between;margin-top:8px"><b>${p[1]}</b><span class="row" style="gap:12px;padding:4px 10px;border-radius:999px;background:#f3eee8;font-size:14px">− 1 +</span></div></div></div>`).join("")}
  <div style="margin:6px 16px;padding:16px;border-radius:18px;background:#fff;font-size:15px">${[["Ara toplam", "₺2.180"], ["Kargo", "Ücretsiz"], ["İndirim (SONBAHAR)", "−₺218"]].map(([a, b]) => `<div class="row" style="justify-content:space-between;padding:6px 0"><span style="color:#7d736c">${a}</span><span style="${b.startsWith("−") ? "color:#15803d;font-weight:600" : ""}">${b}</span></div>`).join("")}<div class="row" style="justify-content:space-between;padding-top:10px;margin-top:6px;border-top:1px solid #f0ebe5;font-size:18px;font-weight:600"><span>Toplam</span><span>₺1.962</span></div></div>
  <div class="row" style="margin:12px 16px;gap:8px">${["Kart", "Havale", "Kapıda"].map((x, i) => `<span style="flex:1;height:44px;border-radius:12px;display:grid;place-items:center;font-size:14px;font-weight:600;${i === 0 ? `background:${PS.ink};color:#fff` : "background:#fff;box-shadow:inset 0 0 0 1px #e6ded5"}">${x}</span>`).join("")}</div>
  <div style="position:absolute;left:16px;right:16px;bottom:34px;height:58px;border-radius:16px;background:${PS.clay};color:#fff;display:grid;place-items:center;font:600 17px ${SANS2}">Güvenli ödeme · ₺1.962</div></div>`;

/* Pazaryeri mağaza kartı (markasız) */
const market = (name, color, score, n) => `<div class="sh" style="border-radius:22px;background:#fff;overflow:hidden;color:#0c1a3a">
  <div style="height:90px;background:${color};position:relative"><span class="abs" style="left:20px;bottom:-30px;width:64px;height:64px;border-radius:18px;background:#fff;display:grid;place-items:center;font:400 13px ${SERIF};letter-spacing:.06em;box-shadow:0 10px 20px -10px rgb(0 0 0/.35);text-align:center;line-height:1.1;color:${PS.ink}">PAMUK<br>SOKAĞI</span><span class="abs" style="right:16px;top:14px;padding:5px 11px;border-radius:999px;background:rgb(255 255 255/.25);color:#fff;font-weight:600;font-size:13px">${name}</span></div>
  <div style="padding:40px 20px 20px"><div class="row" style="justify-content:space-between"><div style="font-size:18px;font-weight:600">Pamuk Sokağı</div><span style="padding:5px 10px;border-radius:10px;background:#16a34a;color:#fff;font-weight:600;font-size:14px">${score}</span></div><div style="font-size:13.5px;color:#7f8aa3;margin-top:4px">${n} ürün · Hızlı kargo rozeti</div>
  <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:14px">${prods.slice(0, 3).map((p) => `<div style="height:84px;border-radius:12px;background:${PS.sand};display:grid;place-items:center">${towels(70, p[3])}</div>`).join("")}</div></div></div>`;

export const shopScenes = () => {
  const S = store(), P = product(), C = cart();
  const out = [];
  out.push({
    name: "hizmet3-e-ticaret-yonetimi-hero", w: 1600, h: 1000,
    html: hero({ t, art: `
      <div class="abs" style="left:240px;top:150px">${macbook(`<div style="width:1440px;height:900px;overflow:hidden">${S}</div>`, { width: 960 })}</div>
      ${phone(P, 280, "left:1120px;top:290px")}
      ${chip(`<div class="row" style="gap:14px"><span style="width:44px;height:44px;border-radius:12px;background:#e6f6ec;display:grid;place-items:center">${icon("shopping-bag", { size: 22, color: "#12873f" })}</span><div><div style="font-size:14px;color:#7f8aa3">Yeni sipariş · Bursa</div><div style="font-size:19px;font-weight:600">Bambu havlu seti · ₺1.290</div></div></div>`, "left:180px;top:720px")}
    ` }),
  });
  out.push({
    name: "hizmet3-e-ticaret-yonetimi-kapak", w: 1200, h: 1500,
    html: cover({ t, eyebrow: "E-Ticaret Yönetimi", headline: "Mağazanız *satışa* hazır", sub: "Site, pazaryerleri, kampanyalar ve günlük operasyon tek ekipte", art: `
      ${phone(P, 360, "left:170px;top:120px;transform:rotate(-6deg)")}
      ${phone(C, 360, "left:640px;top:120px;transform:rotate(6deg)")}` }),
  });
  out.push({
    name: "hizmet3-e-ticaret-yonetimi-1", w: 1200, h: 900,
    html: feature({ t, dark: true, title: "Satış için tasarlanmış vitrin", sub: "Kategori yapısı, kampanya alanları ve hızlı açılan ürün listeleri.", body: `
      ${browser(S, { url: "pamuksokagi.com", scale: 0.744, vh: 820, style: "left:0;top:0" })}` }),
  });
  out.push({
    name: "hizmet3-e-ticaret-yonetimi-2", w: 1200, h: 900,
    html: feature({ t, title: "Ürün sayfasından ödemeye kısa yol", sub: "Varyant seçimi, güven unsurları ve tek sayfada ödeme ile sepette kayıp azalır.", body: `
      ${phone(P, 280, "left:120px;top:10px")}${phone(C, 280, "left:470px;top:10px")}
      ${chip(`<div style="font-size:14px;color:#7f8aa3">Sepet terk oranı</div><div style="font-size:34px;font-weight:600">%68 → %49</div><div style="font-size:14px;color:#12873f;font-weight:600">yeni ödeme akışından sonra</div>`, "left:820px;top:220px;width:250px")}` }),
  });
  out.push({
    name: "hizmet3-e-ticaret-yonetimi-3", w: 1200, h: 900,
    html: feature({ t, dark: true, title: "Pazaryerlerinde de aynı özen", sub: "Mağaza açılışı, ürün içerikleri, fiyat ve stok eşitlemesi; tüm kanallar tek elden.", body: `
      <div class="abs" style="left:0;top:20px;width:1072px;display:grid;grid-template-columns:repeat(3,1fr);gap:22px">${market("Pazaryeri 1", "#f27a1a", "9,6", 214)}${market("Pazaryeri 2", "#ff6000", "9,4", 198)}${market("Pazaryeri 3", "#232f3e", "4,8", 126)}</div>
      ${glass(`<div class="row" style="gap:30px">${["Kanal|4", "Eşitlenen stok|her 5 dk", "Bu ay sipariş|1.842"].map((x) => { const [a, b] = x.split("|"); return `<div><div style="font-size:13.5px;opacity:.7">${a}</div><div style="font-size:26px;font-weight:600">${b}</div></div>`; }).join("")}</div>`, "left:250px;top:460px", "22px 30px")}` }),
  });
  out.push({
    name: "hizmet3-e-ticaret-yonetimi-4", w: 1200, h: 900,
    html: feature({ t, title: "Kampanya takvimi ve görselleri", sub: "Kasım indirimleri, özel günler ve sezon geçişleri için hazır görsel setleri.", body: `
      <div class="abs sh" style="left:0;top:0;width:620px;height:638px;border-radius:24px;overflow:hidden">${pamukPost(620, 638, { v: 3 })}</div>
      <div class="abs sh" style="left:650px;top:0;width:422px;height:304px;border-radius:24px;overflow:hidden">${pamukPost(422, 304, { v: 1 })}</div>
      <div class="abs sh" style="left:650px;top:334px;width:422px;height:304px;border-radius:24px;overflow:hidden">${pamukPost(422, 304, { v: 2 })}</div>` }),
  });
  const lockS = `<div style="position:relative;width:390px;height:844px;background:linear-gradient(170deg,#3b3330,#a7684a 60%,#e8cdb6);font-family:Outfit">${statusBar(true)}<div style="text-align:center;color:#fff;margin-top:40px"><div style="font-size:19px;opacity:.85">Perşembe 16 Ekim</div><div style="font:500 92px/1 Outfit;margin-top:6px">9:41</div></div>
    <div style="display:grid;gap:10px;padding:40px 14px">${notif({ app: "Pamuk Sokağı", color: PS.ink, letter: "P", title: "Siparişiniz kargoda 📦", text: "#PS-48214 · yarın teslim edilecek", time: "şimdi" })}${notif({ app: "Pamuk Sokağı", color: PS.ink, letter: "P", title: "Siparişiniz alındı", text: "Bambu havlu seti · ₺1.290", time: "1 gün" })}${notif({ app: "Pamuk Sokağı", color: PS.ink, letter: "P", title: "Fiyatı düştü!", text: "Favorilerinizdeki waffle pike %20 indirimde", time: "2 gün" })}</div></div>`;
  out.push({
    name: "hizmet3-e-ticaret-yonetimi-5", w: 1200, h: 900,
    html: feature({ t, dark: true, title: "Siparişten teslimata takipte", sub: "Kargo entegrasyonu, otomatik bildirimler ve iade süreçleri düzenli işler.", body: `
      ${phone(lockS, 290, "left:80px;top:0")}
      ${glass(`<div style="font-size:20px;font-weight:600">Bugünkü siparişler</div>${[["Hazırlanıyor", "24", "#f59e0b"], ["Kargoda", "61", "#2c74d8"], ["Teslim edildi", "118", "#16a34a"], ["İade talebi", "3", "#dc2626"]].map(([a, b, c]) => `<div class="row" style="justify-content:space-between;margin-top:16px;padding-bottom:12px;border-bottom:1px solid rgb(255 255 255/.12);font-size:17px"><span class="row" style="gap:10px"><span style="width:10px;height:10px;border-radius:50%;background:${c}"></span>${a}</span><b>${b}</b></div>`).join("")}`, "left:480px;top:80px;width:540px", "28px")}` }),
  });
  /* Haftalık rapor */
  out.push({
    name: "hizmet3-e-ticaret-yonetimi-6", w: 1200, h: 900,
    html: feature({ t, title: "Satış verisiyle haftalık karar", sub: "Hangi ürün, hangi kanal ve hangi kampanya kazandırıyor; her hafta birlikte bakıyoruz.", body: `
      <div class="abs sh" style="left:0;top:0;width:1072px;height:638px;border-radius:24px;background:#fff;padding:32px">
        <div class="row" style="justify-content:space-between"><div><div style="font-size:21px;font-weight:600">Pamuk Sokağı · haftalık satış</div><div style="font-size:14px;color:#7f8aa3;margin-top:4px">Tüm kanallar · son 8 hafta</div></div><div class="row" style="gap:28px">${[["Ciro", "₺684B", "+%22"], ["Sipariş", "1.842", "+%18"], ["Dönüşüm", "%2,9", "+0,4"]].map(([a, b, c]) => `<div><div style="font-size:13.5px;color:#7f8aa3">${a}</div><div style="font-size:24px;font-weight:600">${b} <span style="font-size:14px;color:#12873f">${c}</span></div></div>`).join("")}</div></div>
        <svg width="1008" height="300" viewBox="0 0 1008 300" style="margin-top:30px">${[[120, 60, 40], [140, 70, 44], [130, 76, 48], [170, 80, 52], [160, 90, 58], [190, 96, 60], [210, 104, 66], [250, 120, 74]].map(([a, b, c], i) => { const x = i * 126 + 20; return `<rect x="${x}" y="${290 - a}" width="26" height="${a}" rx="7" fill="#1aa9c4"/><rect x="${x + 32}" y="${290 - b}" width="26" height="${b}" rx="7" fill="#0b4f7a"/><rect x="${x + 64}" y="${290 - c}" width="26" height="${c}" rx="7" fill="#8fe6f2"/>`; }).join("")}</svg>
        <div class="row" style="gap:22px;margin-top:16px;font-size:14.5px;color:#55617b">${[["#1aa9c4", "Kendi site"], ["#0b4f7a", "Pazaryerleri"], ["#8fe6f2", "Sosyal satış"]].map(([c, l]) => `<span class="row" style="gap:8px"><span style="width:12px;height:12px;border-radius:4px;background:${c}"></span>${l}</span>`).join("")}</div>
      </div>` }),
  });
  out.push({ name: "hizmet3-raw-shop-store", w: 1440, h: 1500, html: page({ w: 1440, h: 1500, bg: "background:#fff;", body: S }) });
  out.push({ name: "hizmet3-raw-shop-product", w: 390, h: 844, html: page({ w: 390, h: 844, bg: "background:#fff;", body: P }) });
  out.push({ name: "hizmet3-raw-shop-cart", w: 390, h: 844, html: page({ w: 390, h: 844, bg: "background:#fff;", body: C }) });
  out.push({ name: "hizmet3-raw-shop-lock", w: 390, h: 844, html: page({ w: 390, h: 844, bg: "background:#000;", body: lockS }) });
  return out;
};
