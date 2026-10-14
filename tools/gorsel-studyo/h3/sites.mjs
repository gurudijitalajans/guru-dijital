// Müşteri web siteleri (kurgusal markalar): masaüstü 1440 genişlik, mobil 390 genişlik.
// Uzun sayfalar; videoda kaydırılır, görsellerde üst kısmı görünür.
import { blobs, building, stoneRoom, sunset, tooth } from "./art.mjs";
import { GEO, icon, SANS2, SERIF, SERIF2, statusBar } from "./common.mjs";

/* ===================== Defne Köy Otel (butik otel) ===================== */
const DK = { ink: "#2b2420", sand: "#f6efe6", clay: "#b5764f", olive: "#6f7d5a" };
const dkNav = (w, mobile) =>
  mobile
    ? `<div class="row" style="justify-content:space-between;padding:6px 22px 14px;color:#fff;position:absolute;left:0;right:0;top:50px;z-index:2"><span style="font:400 24px ${SERIF};letter-spacing:.04em">Defne Köy</span>${icon("menu", { size: 24 })}</div>`
    : `<div class="row" style="position:absolute;left:0;right:0;top:0;z-index:2;height:96px;padding:0 64px;color:#fff;gap:40px"><span style="font:400 30px ${SERIF};letter-spacing:.04em">Defne Köy</span><span style="font:500 11px ${SANS2};letter-spacing:.3em;opacity:.8;margin-left:-26px;margin-top:6px">AYVALIK</span><div class="row" style="margin-left:auto;gap:34px;font:500 15px ${SANS2};letter-spacing:.02em">${["Odalar", "Deneyimler", "Restoran", "Galeri", "İletişim"].map((x) => `<span>${x}</span>`).join("")}<span style="padding:12px 22px;border-radius:999px;background:#fff;color:${DK.ink}">Rezervasyon</span></div></div>`;

export function hotelDesktop() {
  const rooms = [
    ["Zeytin Odası", "2 kişi · bahçe manzarası", "₺4.800", { wall: "#efe3d3", shade: "#dccab3", accent: "#7d8c66" }],
    ["Defne Süit", "3 kişi · deniz manzarası", "₺7.200", { wall: "#e7ddd2", shade: "#cbbba7", accent: "#5f7a6a" }],
    ["Taş Ev", "4 kişi · özel teras", "₺9.600", { wall: "#e2d4c2", shade: "#c7b296", accent: "#8a9a6c" }],
  ];
  return `<div style="width:1440px;background:${DK.sand};color:${DK.ink};font-family:${SANS2}">
  <section style="position:relative;height:900px;overflow:hidden">
    <div style="position:absolute;inset:0">${sunset(1440, 900)}</div>
    <div style="position:absolute;inset:0;background:linear-gradient(180deg,rgb(20 14 30/.35),rgb(20 14 30/0) 30%,rgb(20 14 30/.15) 70%,rgb(20 14 30/.45))"></div>
    ${dkNav(1440)}
    <div style="position:absolute;left:64px;bottom:150px;color:#fff;max-width:760px">
      <div style="font:500 13px ${SANS2};letter-spacing:.32em;opacity:.85">EGE'NİN SAKİN KIYISINDA</div>
      <h1 style="font:400 92px/1 ${SERIF};margin-top:22px;letter-spacing:-.01em">Zamanın yavaşladığı yer</h1>
      <p style="font:400 19px/1.6 ${SANS2};margin-top:24px;opacity:.9;max-width:560px">Zeytin bahçeleri arasında 14 odalı taş ev; gün batımına bakan teras ve köy kahvaltısı.</p>
    </div>
    <div class="row" style="position:absolute;left:64px;right:64px;bottom:44px;height:76px;border-radius:18px;background:rgb(255 255 255/.94);padding:0 12px 0 28px;gap:0;color:${DK.ink}">
      ${[["Giriş", "18 Ekim Cmt"], ["Çıkış", "20 Ekim Pzt"], ["Misafir", "2 yetişkin"], ["Oda", "Defne Süit"]].map(([a, b]) => `<div style="flex:1;border-right:1px solid #e8dfd3;padding-right:20px;margin-right:20px"><div style="font:500 12px ${SANS2};letter-spacing:.14em;color:#9a8b7c;text-transform:uppercase">${a}</div><div style="font:500 17px ${SANS2};margin-top:4px">${b}</div></div>`).join("")}
      <span style="height:54px;padding:0 30px;border-radius:12px;background:${DK.clay};color:#fff;display:grid;place-items:center;font:600 16px ${SANS2}">Müsaitlik</span>
    </div>
  </section>
  <section style="padding:110px 64px 40px;display:grid;grid-template-columns:1fr 1fr;gap:80px;align-items:end">
    <h2 style="font:400 56px/1.08 ${SERIF}">Taş, zeytin ve<br>deniz kokusu</h2>
    <p style="font:400 18px/1.7 ${SANS2};color:#6d6158">1890'dan kalma köy evini aslına sadık kalarak yeniledik. Her oda bahçeye ya da denize açılıyor; sabahları bahçeden toplanan ürünlerle kahvaltı hazırlanıyor.</p>
  </section>
  <section style="padding:40px 64px 110px;display:grid;grid-template-columns:repeat(3,1fr);gap:28px">
    ${rooms.map(([n, d, p, c]) => `<article><div style="height:400px;border-radius:20px;overflow:hidden">${stoneRoom(410, 400, c)}</div><div class="row" style="margin-top:22px;justify-content:space-between;align-items:flex-end"><div><h3 style="font:400 30px ${SERIF}">${n}</h3><div style="font:400 15px ${SANS2};color:#8a7c70;margin-top:6px">${d}</div></div><div style="text-align:right"><div style="font:400 13px ${SANS2};color:#8a7c70">gecelik</div><div style="font:600 21px ${SANS2}">${p}</div></div></div></article>`).join("")}
  </section>
  <section style="margin:0 64px;border-radius:28px;overflow:hidden;position:relative;height:520px;background:${DK.olive}">
    <div style="position:absolute;right:0;top:0;width:58%;height:100%">${sunset(840, 520, { sky: ["#f5d3a5", "#e9a983", "#a36f80", "#4c4d78"] })}</div>
    <div style="position:absolute;left:64px;top:80px;width:500px;color:#fff"><div style="font:500 13px ${SANS2};letter-spacing:.3em;opacity:.8">DENEYİMLER</div><h2 style="font:400 50px/1.1 ${SERIF};margin-top:18px">Gün batımında tekne turu</h2><p style="font:400 17px/1.7 ${SANS2};margin-top:20px;opacity:.88">Cunda'dan adalara iki saatlik tur; ikramlar ve fotoğraf molası dahil.</p><span style="display:inline-block;margin-top:30px;padding:15px 26px;border-radius:999px;background:#fff;color:${DK.ink};font:600 15px ${SANS2}">Turları inceleyin</span></div>
  </section>
  <section style="padding:110px 64px;display:grid;grid-template-columns:repeat(3,1fr);gap:28px">
    ${[["“Kahvaltı tek kelimeyle muhteşemdi.”", "Elif K. · İstanbul"], ["“Terastan izlediğimiz gün batımını unutamayız.”", "Mert & Ece · Ankara"], ["“Sessiz, temiz ve çok sıcak bir ekip.”", "Anna L. · Berlin"]].map(([q, a]) => `<blockquote style="padding:34px;border-radius:20px;background:#fff"><div style="color:${DK.clay}">★★★★★</div><p style="font:400 24px/1.4 ${SERIF2};margin-top:14px">${q}</p><div style="font:500 14px ${SANS2};color:#8a7c70;margin-top:18px">${a}</div></blockquote>`).join("")}
  </section>
  <footer style="padding:60px 64px;background:${DK.ink};color:#e9dfd3;display:flex;justify-content:space-between"><span style="font:400 30px ${SERIF}">Defne Köy</span><span style="font:400 15px ${SANS2};opacity:.7">Sarımsaklı Mah. · Ayvalık / Balıkesir · +90 266 000 00 00</span></footer>
  </div>`;
}

export function hotelMobile() {
  return `<div style="width:390px;background:${DK.sand};color:${DK.ink};font-family:${SANS2}">
  <section style="position:relative;height:640px;overflow:hidden">
    <div style="position:absolute;inset:0">${sunset(390, 640)}</div>
    <div style="position:absolute;inset:0;background:linear-gradient(180deg,rgb(20 14 30/.35),rgb(20 14 30/0) 30%,rgb(20 14 30/.5))"></div>
    <div style="position:absolute;left:0;right:0;top:0">${statusBar(true)}</div>
    ${dkNav(390, true)}
    <div style="position:absolute;left:22px;right:22px;bottom:110px;color:#fff"><div style="font:500 11px ${SANS2};letter-spacing:.3em;opacity:.85">AYVALIK</div><h1 style="font:400 50px/1.02 ${SERIF};margin-top:14px">Zamanın yavaşladığı yer</h1></div>
    <div style="position:absolute;left:22px;right:22px;bottom:28px;height:62px;border-radius:14px;background:${DK.clay};color:#fff;display:grid;place-items:center;font:600 17px ${SANS2}">Müsaitliğe bakın</div>
  </section>
  <section style="padding:34px 22px 16px"><h2 style="font:400 34px/1.1 ${SERIF}">Odalarımız</h2></section>
  ${[["Zeytin Odası", "₺4.800"], ["Defne Süit", "₺7.200"]].map(([n, p], i) => `<article style="padding:10px 22px 22px"><div style="height:230px;border-radius:18px;overflow:hidden">${stoneRoom(346, 230, i ? { wall: "#e7ddd2", shade: "#cbbba7", accent: "#5f7a6a" } : undefined)}</div><div class="row" style="justify-content:space-between;margin-top:14px"><h3 style="font:400 24px ${SERIF}">${n}</h3><span style="font:600 17px ${SANS2}">${p}<span style="font-weight:400;font-size:13px;color:#8a7c70"> /gece</span></span></div></article>`).join("")}
  </div>`;
}

/* ===================== Nova Diş Kliniği ===================== */
const NV = { ink: "#0d2340", blue: "#2f6bff", sky: "#eaf3ff" };
export function clinicDesktop() {
  return `<div style="width:1440px;background:#fff;color:${NV.ink};font-family:Outfit">
  <div class="row" style="height:92px;padding:0 64px;gap:12px"><span style="width:40px;height:40px;border-radius:12px;background:${NV.blue};display:grid;place-items:center">${tooth(26, "#fff", "#fff")}</span><span style="font:600 24px Outfit;letter-spacing:-.02em">nova<span style="font-weight:300">diş</span></span>
    <div class="row" style="margin-left:auto;gap:34px;font-size:16px;color:#3c4f6b">${["Tedaviler", "Hekimlerimiz", "Fiyatlar", "Blog", "İletişim"].map((x) => `<span>${x}</span>`).join("")}<span class="row" style="gap:8px;color:${NV.ink};font-weight:500">${icon("phone", { size: 17 })}0216 000 00 00</span><span style="padding:13px 22px;border-radius:12px;background:${NV.blue};color:#fff;font-weight:500">Randevu al</span></div></div>
  <section style="margin:0 24px;border-radius:32px;background:${NV.sky};height:640px;position:relative;overflow:hidden">
    <div style="position:absolute;right:0;top:0;width:760px;height:640px">${blobs(760, 640, { bg: NV.sky })}</div>
    <div style="position:absolute;right:240px;top:150px">${tooth(260, "#ffffff", "#9cc0ff")}</div>
    <div style="position:absolute;left:56px;top:110px;width:640px">
      <span class="row" style="display:inline-flex;gap:8px;padding:8px 14px;border-radius:999px;background:#fff;font-size:14px;font-weight:500;color:${NV.blue}">${icon("badge-check", { size: 16 })}Kadıköy · 2009'dan beri</span>
      <h1 style="font:600 72px/1.02 Outfit;letter-spacing:-.04em;margin-top:24px">Gülüşünüz için<br><span style="color:${NV.blue}">acısız</span> ve planlı tedavi</h1>
      <p style="font-size:20px;line-height:1.6;color:#4a5d7a;margin-top:22px;max-width:520px">İmplant, ortodonti ve estetik diş hekimliğinde uzman kadro; tedavi planınızı ilk muayenede birlikte çıkarıyoruz.</p>
      <div class="row" style="gap:14px;margin-top:34px"><span style="padding:18px 28px;border-radius:14px;background:${NV.blue};color:#fff;font-size:17px;font-weight:500">Ücretsiz ön muayene</span><span style="padding:18px 28px;border-radius:14px;background:#fff;font-size:17px;font-weight:500">Tedavileri inceleyin</span></div>
    </div>
    <div class="row" style="position:absolute;left:56px;bottom:46px;gap:40px">${[["4,9", "Google puanı · 820 yorum"], ["15+", "uzman hekim"], ["12.000+", "tamamlanan tedavi"]].map(([a, b]) => `<div><div style="font:600 34px Outfit;letter-spacing:-.03em">${a}</div><div style="font-size:14px;color:#5b6e8a">${b}</div></div>`).join("")}</div>
  </section>
  <section style="padding:90px 64px 40px"><h2 style="font:600 46px Outfit;letter-spacing:-.03em">Tedavilerimiz</h2></section>
  <section style="padding:0 64px 100px;display:grid;grid-template-columns:repeat(4,1fr);gap:20px">
    ${[["İmplant", "sparkles"], ["Şeffaf plak", "smile"], ["Diş beyazlatma", "sun"], ["Çocuk diş", "baby"], ["Zirkonyum", "gem"], ["Kanal tedavisi", "activity"], ["Diş eti", "heart-pulse"], ["Acil", "siren"]]
      .map(([n, ic], i) => `<div style="padding:28px;border-radius:22px;background:${i === 0 ? NV.blue : "#f4f8ff"};color:${i === 0 ? "#fff" : NV.ink};height:200px;display:flex;flex-direction:column;justify-content:space-between"><span style="width:52px;height:52px;border-radius:16px;background:${i === 0 ? "rgb(255 255 255/.18)" : "#fff"};display:grid;place-items:center">${icon(ic, { size: 24, color: i === 0 ? "#fff" : NV.blue })}</span><div class="row" style="justify-content:space-between"><span style="font:500 22px Outfit">${n}</span>${icon("arrow-up-right", { size: 20 })}</div></div>`)
      .join("")}
  </section>
  <section style="margin:0 24px 80px;border-radius:32px;background:${NV.ink};color:#fff;padding:70px 56px;display:grid;grid-template-columns:1.1fr 1fr;gap:60px">
    <div><h2 style="font:600 44px/1.1 Outfit;letter-spacing:-.03em">Online randevu</h2><p style="font-size:18px;line-height:1.6;opacity:.75;margin-top:16px">Size uygun günü seçin, hekimimiz aynı gün sizi arasın.</p></div>
    <div style="display:grid;gap:14px">${["Ad soyad", "Telefon", "Tedavi: İmplant"].map((x) => `<div style="height:58px;border-radius:14px;background:rgb(255 255 255/.08);padding:0 20px;display:flex;align-items:center;color:rgb(255 255 255/.7);font-size:16px">${x}</div>`).join("")}<div style="height:60px;border-radius:14px;background:${NV.blue};display:grid;place-items:center;font-size:17px;font-weight:500">Randevu talebi gönder</div></div>
  </section>
  </div>`;
}
export function clinicMobile() {
  return `<div style="width:390px;background:#fff;color:${NV.ink};font-family:Outfit">${statusBar()}
  <div class="row" style="padding:4px 20px 14px;gap:10px"><span style="width:34px;height:34px;border-radius:10px;background:${NV.blue};display:grid;place-items:center">${tooth(22, "#fff", "#fff")}</span><span style="font:600 21px Outfit">nova<span style="font-weight:300">diş</span></span><span style="margin-left:auto">${icon("menu", { size: 24 })}</span></div>
  <section style="margin:0 12px;border-radius:26px;background:${NV.sky};padding:30px 20px 26px;position:relative;overflow:hidden">
    <div style="position:absolute;right:-60px;top:-30px;opacity:.9">${blobs(260, 200, { bg: NV.sky })}</div>
    <h1 style="position:relative;font:600 40px/1.04 Outfit;letter-spacing:-.035em">Gülüşünüz için <span style="color:${NV.blue}">acısız</span> tedavi</h1>
    <p style="position:relative;font-size:16px;line-height:1.55;color:#4a5d7a;margin-top:14px">İlk muayenede tedavi planınızı birlikte çıkarıyoruz.</p>
    <div style="position:relative;margin-top:22px;height:56px;border-radius:14px;background:${NV.blue};color:#fff;display:grid;place-items:center;font-size:17px;font-weight:500">Ücretsiz ön muayene</div>
  </section>
  <div style="padding:26px 20px 10px;font:600 26px Outfit">Tedavilerimiz</div>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;padding:0 20px 30px">${[["İmplant", "sparkles"], ["Şeffaf plak", "smile"], ["Beyazlatma", "sun"], ["Zirkonyum", "gem"]].map(([n, ic]) => `<div style="padding:18px;border-radius:18px;background:#f4f8ff;height:120px;display:flex;flex-direction:column;justify-content:space-between">${icon(ic, { size: 24, color: NV.blue })}<span style="font:500 17px Outfit">${n}</span></div>`).join("")}</div>
  </div>`;
}

/* ===================== Atlas Yapı (inşaat) ===================== */
export function buildDesktop() {
  return `<div style="width:1440px;background:#0b111e;color:#fff;font-family:${GEO}">
  <section style="position:relative;height:900px;overflow:hidden">
    <div style="position:absolute;inset:0">${building(1440, 900)}</div>
    <div style="position:absolute;inset:0;background:linear-gradient(90deg,rgb(8 12 22/.92) 0%,rgb(8 12 22/.55) 45%,rgb(8 12 22/0) 70%)"></div>
    <div class="row" style="position:absolute;left:64px;right:64px;top:0;height:96px;gap:36px;font:500 15px ${SANS2}"><span style="font:700 26px ${GEO};letter-spacing:.18em">ATLAS<span style="color:#e3b04b">.</span>YAPI</span><div class="row" style="margin-left:auto;gap:34px;opacity:.9">${["Projeler", "Hakkımızda", "Sürdürülebilirlik", "Kariyer", "İletişim"].map((x) => `<span>${x}</span>`).join("")}</div></div>
    <div style="position:absolute;left:64px;top:260px;width:680px">
      <div style="font:500 14px ${SANS2};letter-spacing:.32em;color:#e3b04b">1998'DEN BERİ</div>
      <h1 style="font:600 84px/1.02 ${GEO};margin-top:20px;letter-spacing:-.01em">Kalıcı yapılar,<br>güvenilir teslim.</h1>
      <p style="font:400 19px/1.6 ${SANS2};margin-top:24px;opacity:.82;max-width:520px">Konut, ofis ve endüstriyel projelerde 2,4 milyon m² inşaat alanı; zamanında teslim edilen 64 proje.</p>
      <div class="row" style="gap:14px;margin-top:36px"><span style="padding:18px 28px;background:#e3b04b;color:#0b111e;font:600 16px ${SANS2}">Projeleri inceleyin</span><span style="padding:18px 28px;box-shadow:inset 0 0 0 1px rgb(255 255 255/.4);font:600 16px ${SANS2}">Bize ulaşın</span></div>
    </div>
    <div class="row" style="position:absolute;left:64px;bottom:60px;gap:60px">${[["64", "teslim edilen proje"], ["2,4M m²", "inşaat alanı"], ["850+", "çalışan"]].map(([a, b]) => `<div><div style="font:600 40px ${GEO}">${a}</div><div style="font:400 14px ${SANS2};opacity:.7;margin-top:4px">${b}</div></div>`).join("")}</div>
  </section>
  <section style="padding:100px 64px;display:grid;grid-template-columns:repeat(3,1fr);gap:24px;background:#f3f1ec;color:#0b111e">
    ${[["Mavi Vadi Konutları", "İstanbul · 412 daire", ["#1f2d4a", "#6d8fbf"]], ["Atlas Ofis Park", "Ankara · 38.000 m²", ["#26334d", "#9fb6d6"]], ["Ege Lojistik Merkezi", "İzmir · 62.000 m²", ["#2a2f3b", "#b9c4d4"]]]
      .map(([n, d, sky]) => `<article><div style="height:360px;overflow:hidden">${building(410, 360, { sky })}</div><h3 style="font:600 24px ${GEO};margin-top:20px">${n}</h3><div style="font:400 15px ${SANS2};color:#6b7280;margin-top:6px">${d}</div></article>`)
      .join("")}
  </section>
  </div>`;
}
export function buildMobile() {
  return `<div style="width:390px;background:#0b111e;color:#fff;font-family:${GEO}">
  <section style="position:relative;height:700px;overflow:hidden"><div style="position:absolute;inset:0">${building(390, 700)}</div><div style="position:absolute;inset:0;background:linear-gradient(180deg,rgb(8 12 22/.6),rgb(8 12 22/.2) 40%,rgb(8 12 22/.95))"></div>
  <div style="position:absolute;left:0;right:0;top:0">${statusBar(true)}</div>
  <div class="row" style="position:absolute;left:22px;right:22px;top:58px;justify-content:space-between"><span style="font:700 20px ${GEO};letter-spacing:.16em">ATLAS<span style="color:#e3b04b">.</span>YAPI</span>${icon("menu", { size: 24 })}</div>
  <div style="position:absolute;left:22px;right:22px;bottom:40px"><h1 style="font:600 44px/1.04 ${GEO}">Kalıcı yapılar, güvenilir teslim.</h1><div style="margin-top:22px;height:56px;background:#e3b04b;color:#0b111e;display:grid;place-items:center;font:600 16px ${SANS2}">Projeleri inceleyin</div></div></section>
  </div>`;
}
