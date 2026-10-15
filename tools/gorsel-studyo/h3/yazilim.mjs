// Özel Yazılım v4: kendi geliştirdiğimiz Guru Panel'in GERÇEK ekran görüntüleri (ayrı demo veritabanında,
// firma adı yerine sektör tanımı, ekip adı ve "Ziyaretçi" etiketleriyle örnek veri), ürün görselleri dilinde.
import { fileUrl, floatCard, grainLayer, icon, iphone, macbook, page, ROOT, themeBg } from "../lib.mjs";
import { T } from "./common.mjs";
import { floor, glow, lockup } from "./real.mjs";

const Y = (f) => fileUrl(`${ROOT}/tools/gorsel-studyo/kaynak/katalog/yazilim/${f}.jpg`);
const TY = T["ozel-yazilim"];
const ACC = "#4b5be0";
const shot = (f, w, h) => `<div style="width:${w}px;height:${h}px;background:#fff url('${Y(f)}') 50% 0/100% auto no-repeat"></div>`;
const note = `<div class="row" style="gap:7px;margin-top:12px;font-size:13px;color:#7a849b">${icon("info", { size: 14, color: "#7a849b", stroke: 2 })}Ekranlarda örnek veri</div>`;
const featCard = (ic, kind, title, desc) => `<div class="row" style="gap:14px"><span style="width:50px;height:50px;border-radius:15px;background:#eceeff;display:grid;place-items:center">${icon(ic, { size: 25, color: ACC, stroke: 2 })}</span>
   <div><div style="font-size:13px;font-weight:600;letter-spacing:.08em;color:${ACC}">${kind.toLocaleUpperCase("tr-TR")}</div><div style="font-size:22px;font-weight:600;margin-top:2px">${title}</div></div></div>
   <div style="margin-top:12px;font-size:16px;color:#3b4763;line-height:1.4">${desc}</div>${note}`;

/* 4:3 karo: eğik dizüstü (masaüstü ekranı) + telefon (aynı sayfanın mobil hali) + özellik kartı */
function tile(page_, mobile, ic, kind, title, desc, cardPos = "left:56px;top:56px;width:480px") {
  const body = `
  ${glow(90, 260, 960, 560)}
  ${floor(80, 790, 820, 80)}
  <div style="position:absolute;left:50px;top:260px;perspective:2600px">
    ${macbook(shot(page_, 1440, 900), { width: 820, style: "transform:rotateY(13deg) rotateX(4deg) rotateZ(-.6deg);transform-origin:0% 50%" })}
  </div>
  ${floor(840, 815, 260, 46, 0.6)}
  <div style="position:absolute;left:860px;top:300px;perspective:2000px">
    ${iphone(shot(mobile, 390, 844), { width: 240, style: "transform:rotateY(-10deg) rotateZ(1.5deg);filter:drop-shadow(0 40px 40px rgb(0 6 26/.55))" })}
  </div>
  ${floatCard(featCard(ic, kind, title, desc), cardPos, "18px 22px")}
  ${grainLayer(0.06)}`;
  return page({ w: 1200, h: 900, bg: themeBg(TY), body });
}

export function yazilimHero() {
  const body = `
  ${glow(120, 300, 1250, 700)}
  <div style="position:absolute;left:68px;top:60px">${lockup("Özel Yazılım")}</div>
  ${floor(110, 900, 1100, 100)}
  <div style="position:absolute;left:70px;top:250px;perspective:3200px">
    ${macbook(shot("ozet", 1440, 900), { width: 1100, style: "transform:rotateY(13deg) rotateX(4deg) rotateZ(-.6deg);transform-origin:0% 50%" })}
  </div>
  ${floor(1100, 935, 330, 60, 0.6)}
  <div style="position:absolute;left:1130px;top:330px;perspective:2400px">
    ${iphone(shot("gorevler-m", 390, 844), { width: 300, style: "transform:rotateY(-10deg) rotateZ(1.5deg);filter:drop-shadow(0 50px 50px rgb(0 6 26/.55))" })}
  </div>
  ${floatCard(featCard("layout-dashboard", "Kendi yazılımımız", "Guru Panel", "Satış, operasyon, sohbet ve raporlar tek panelde; masaüstünde ve telefonda"), "left:1010px;top:70px;width:480px")}
  ${grainLayer(0.06)}`;
  return page({ w: 1600, h: 1000, bg: themeBg(TY), body });
}

function yazilimCover() {
  const phones = [["ozet-m", 110, 770, -7], ["firsatlar-m", 435, 700, 0], ["teklifler-m", 760, 770, 7]];
  const body = `
  <div style="position:absolute;left:150px;top:560px;width:900px;height:1000px;border-radius:50%;background:radial-gradient(closest-side,${TY.hi}88,transparent);filter:blur(20px)"></div>
  <div style="position:absolute;left:0;right:0;top:96px;display:grid;justify-items:center;text-align:center;color:#fff">
    ${lockup("Özel Yazılım", 30)}
    <h1 style="margin-top:40px;font-size:96px;line-height:1.02;font-weight:600;letter-spacing:-.045em">İşinize göre<br><span style="color:${TY.glow}">yazılım</span></h1>
    <p style="margin-top:22px;font-size:28px;color:rgb(255 255 255/.8)">Kendi geliştirdiğimiz Guru Panel'den</p>
  </div>
  ${phones.map(([f, x, y, r]) => `<div style="position:absolute;left:${x}px;top:${y}px;transform:rotate(${r}deg)">${iphone(shot(f, 390, 844), { width: 330, style: "filter:drop-shadow(0 50px 60px rgb(0 6 26/.6))" })}</div>`).join("")}
  ${grainLayer(0.06)}`;
  return page({ w: 1200, h: 1500, bg: themeBg(TY), body });
}

const tiles = () => [
  tile("firsatlar", "firsatlar-m", "kanban", "Satış", "Fırsatlar", "Kart sürüklenerek aşama değişir; pano ve liste aynı kayıtları gösterir"),
  tile("teklifler", "teklifler-m", "file-text", "Satış", "Teklifler", "Kalem kalem teklif; toplam ve teklif numarası kendiliğinden hesaplanır"),
  tile("gorevler", "gorevler-m", "list-checks", "Operasyon", "Görev panosu", "Bir görev Tamam'a yalnız Kontrol aşamasından geçerek ulaşır"),
  tile("ekip-yuku", "ekip-yuku-m", "users", "Operasyon", "Ekip yükü", "Görev saatleri teslim tarihine dağılır; haftalık kapasite kişi kişi görünür"),
  tile("takvim", "takvim-m", "calendar-days", "Planlama", "Takvim", "Toplantı, CRM görevi, görev ve proje teslimleri tek takvimde"),
  tile("sohbet-raporu", "gelen-m", "messages-square", "Sohbet", "Sohbet ve talepler", "Sitedeki sohbetler, form talepleri ve randevular tek gelen kutusunda"),
];

export const yazilimScenesReal = () => [
  { name: "real-ozel-yazilim-hero", w: 1600, h: 1000, html: yazilimHero() },
  { name: "real-ozel-yazilim-kapak", w: 1200, h: 1500, html: yazilimCover() },
  ...tiles().map((html, i) => ({ name: `real-ozel-yazilim-${i + 1}`, w: 1200, h: 900, html })),
];
