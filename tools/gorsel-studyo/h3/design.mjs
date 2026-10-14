// Grafik Tasarım: Guru'nun gerçek işleri (ambalaj, etiket, kurumsal kimlik, katalog, logolar)
// ve bir marka kimliği panosu
import { cup } from "./art.mjs";
import { chip, cover, feature, glass, hero, icon, pic, SANS2, SERIF, T, work } from "./common.mjs";

const t = T["grafik-tasarim"];
const frame = (img, style, pos = "center", fit = "cover", bg = "#fff") =>
  `<div class="abs" style="border-radius:24px;overflow:hidden;box-shadow:0 40px 80px -30px rgb(0 6 26/.65);${style}"><div style="width:100%;height:100%;background:${bg} url('${work(img)}') ${pos}/${fit} no-repeat"></div></div>`;

/* Kurgusal marka panosu: Ada Fırın */
const AF = { navy: "#1d2b4f", cream: "#f4ecdf", gold: "#c8964a", sky: "#7fa6d9" };
const afMark = (s = 80, c = AF.navy, bg = AF.cream) => `<span style="width:${s}px;height:${s}px;border-radius:50%;background:${c};display:inline-grid;place-items:center"><svg width="${s * 0.5}" height="${s * 0.5}" viewBox="0 0 40 40"><path d="M20 4v32" stroke="${bg}" stroke-width="2.4" stroke-linecap="round"/>${[8, 14, 20, 26].map((y) => `<path d="M20 ${y + 4}c-5 0-8-3-8-7 5 0 8 3 8 7zM20 ${y + 4}c5 0 8-3 8-7-5 0-8 3-8 7z" fill="${bg}"/>`).join("")}</svg></span>`;
const afLogo = (s = 1, c = AF.navy) => `<span class="row" style="gap:${14 * s}px;color:${c}">${afMark(64 * s, c, c === AF.navy ? AF.cream : AF.navy)}<span><span style="display:block;font:600 ${40 * s}px ${SANS2};letter-spacing:.22em;line-height:1">ADA FIRIN</span><span style="display:block;font:500 ${12 * s}px ${SANS2};letter-spacing:.5em;margin-top:${6 * s}px;opacity:.8">TAŞ FIRIN · 1987</span></span></span>`;

export const designScenes = () => {
  const out = [];
  out.push({
    name: "hizmet3-grafik-tasarim-hero", w: 1600, h: 1000,
    html: hero({ t, art: `
      ${frame("ambalaj-kavanoz.webp", "left:170px;top:120px;width:560px;height:400px")}
      ${frame("ambalaj-aycekirdek.webp", "left:170px;top:550px;width:560px;height:330px", "center 40%")}
      ${frame("kurumsal-kimlik.webp", "left:760px;top:120px;width:320px;height:760px", "center 30%")}
      ${frame("katalog-brosur.webp", "left:1110px;top:120px;width:320px;height:365px")}
      ${frame("ambalaj-etiket.webp", "left:1110px;top:515px;width:320px;height:365px")}
    ` }),
  });
  out.push({
    name: "hizmet3-grafik-tasarim-kapak", w: 1200, h: 1500,
    html: cover({ t, eyebrow: "Grafik Tasarım", headline: "Akılda kalan *bir kimlik*", sub: "Logo, kurumsal kimlik, ambalaj ve basılı işler; tek bir tasarım diliyle", art: `
      ${frame("kurumsal-kimlik.webp", "left:120px;top:60px;width:440px;height:740px", "center 25%")}
      ${frame("ambalaj-kavanoz.webp", "left:590px;top:60px;width:490px;height:356px")}
      ${frame("ambalaj-etiket.webp", "left:590px;top:446px;width:490px;height:354px")}` }),
  });
  out.push({
    name: "hizmet3-grafik-tasarim-1", w: 1200, h: 900,
    html: feature({ t, dark: true, title: "Rafta fark edilen ambalaj", sub: "Veggy Snacky için kavanoz, paket ve kutu tasarımları; baskıya hazır dosyalarla.", body: `
      ${frame("ambalaj-kavanoz.webp", "left:0;top:0;width:620px;height:638px", "center")}
      ${frame("ambalaj-aycekirdek.webp", "left:650px;top:0;width:422px;height:304px", "center 40%")}
      ${frame("ambalaj-etiket.webp", "left:650px;top:334px;width:422px;height:304px")}` }),
  });
  /* Kartvizit (kurgusal Ada Fırın, ön ve arka) */
  const bcard = (front) => `<div class="sh" style="width:422px;height:250px;border-radius:16px;background:${front ? AF.navy : AF.cream};color:${front ? AF.cream : AF.navy};padding:30px;position:relative;overflow:hidden">${front ? `<div style="position:absolute;inset:0;display:grid;place-items:center">${afLogo(0.8, AF.cream)}</div>` : `<div style="font:600 22px ${SANS2};letter-spacing:.06em">Elif Ada</div><div style="font-size:14px;letter-spacing:.2em;margin-top:4px;opacity:.75">KURUCU · USTA FIRINCI</div><div style="position:absolute;left:30px;bottom:28px;font-size:14.5px;line-height:1.7">+90 232 000 00 00<br>merhaba@adafirin.com.tr<br>Alsancak · İzmir</div><div style="position:absolute;right:26px;bottom:26px">${afMark(54, AF.navy, AF.cream)}</div>`}</div>`;
  out.push({
    name: "hizmet3-grafik-tasarim-2", w: 1200, h: 900,
    html: feature({ t, title: "Kurumsal kimlik, her temas noktasında", sub: "Kartvizit, antetli, zarf ve promosyon ürünlerinde aynı dil.", body: `
      ${frame("kurumsal-kimlik.webp", "left:0;top:0;width:620px;height:638px", "center 18%")}
      <div class="abs" style="left:650px;top:40px;transform:rotate(-3deg)">${bcard(true)}</div>
      <div class="abs" style="left:650px;top:340px;transform:rotate(2deg)">${bcard(false)}</div>` }),
  });
  out.push({
    name: "hizmet3-grafik-tasarim-3", w: 1200, h: 900,
    html: feature({ t, dark: true, title: "Katalog ve broşürler", sub: "Ürünü ve hikâyeyi anlatan sayfa düzenleri; matbaa provasına kadar takip.", body: `
      ${frame("katalog-brosur.webp", "left:0;top:0;width:1072px;height:556px")}
      ${glass(`<div class="row" style="gap:30px">${["Ürün kataloğu", "Broşür", "Fuar ve sunum dosyası"].map((x) => `<span class="row" style="gap:8px;font-size:18px;font-weight:600">${icon("check", { size: 18, stroke: 2.6, color: "#c3c6ff" })}${x}</span>`).join("")}</div>`, "left:40px;top:500px", "20px 28px")}` }),
  });
  out.push({
    name: "hizmet3-grafik-tasarim-4", w: 1200, h: 900,
    html: feature({ t, title: "Logo tasarımları", sub: "Moda, kuyum, gıda ve teknoloji markaları için tasarladığımız logolardan seçkiler.", body: `
      ${frame("logo-tasarimlari.webp", "left:0;top:0;width:1072px;height:300px", "center", "contain", "#fff")}
      <div class="abs sh" style="left:0;top:330px;width:524px;height:308px;border-radius:24px;background:${AF.cream};display:grid;place-items:center">${afLogo(1)}</div>
      <div class="abs sh" style="left:548px;top:330px;width:524px;height:308px;border-radius:24px;background:${AF.navy};display:grid;place-items:center">${afLogo(1, AF.cream)}</div>` }),
  });
  /* Marka kimliği panosu (kurgusal Ada Fırın) */
  const sw = (c, n, hex, dark) => `<div style="flex:1;height:190px;border-radius:18px;background:${c};padding:18px;display:flex;flex-direction:column;justify-content:flex-end;color:${dark ? "#fff" : AF.navy}"><div style="font-size:16px;font-weight:600">${n}</div><div style="font-size:13px;opacity:.75">${hex}</div></div>`;
  out.push({
    name: "hizmet3-grafik-tasarim-5", w: 1200, h: 900,
    html: feature({ t, dark: true, title: "Kurallarıyla teslim edilen kimlik", sub: "Renk, yazı tipi, logo kullanımı ve uygulama örneklerini içeren marka kılavuzu.", body: `
      <div class="abs sh" style="left:0;top:0;width:1072px;height:638px;border-radius:24px;background:#fff;padding:30px;color:${AF.navy}">
        <div class="row" style="justify-content:space-between"><span style="font:600 14px ${SANS2};letter-spacing:.24em;color:#9a8b6c">ADA FIRIN · MARKA KILAVUZU</span><span style="font-size:14px;color:#9a8b6c">Sayfa 12 / 36</span></div>
        <div class="row" style="gap:24px;margin-top:22px;align-items:stretch">
          <div style="width:420px;border-radius:18px;background:${AF.cream};display:grid;place-items:center">${afLogo(0.9)}</div>
          <div style="flex:1;display:grid;gap:14px">
            <div class="row" style="gap:12px">${sw(AF.navy, "Gece laciverti", "#1D2B4F", 1)}${sw(AF.cream, "Un beyazı", "#F4ECDF")}${sw(AF.gold, "Taş fırın", "#C8964A", 1)}${sw(AF.sky, "Ada mavisi", "#7FA6D9", 1)}</div>
          </div>
        </div>
        <div class="row" style="gap:24px;margin-top:24px;align-items:stretch">
          <div style="flex:1;padding:22px;border-radius:18px;background:#f7f4ee"><div style="font:600 64px/1 ${SANS2}">Aa</div><div style="font-size:14px;color:#9a8b6c;margin-top:10px">Başlık · Avenir Next SemiBold</div><div style="font:400 40px/1 ${SERIF};margin-top:18px">Aa</div><div style="font-size:14px;color:#9a8b6c;margin-top:10px">Vurgu · Didot</div></div>
          <div style="width:220px;border-radius:18px;background:${AF.navy};display:grid;place-items:center">${cup(150, { body: AF.cream, coffee: "#6b3f2a", saucer: "rgb(255 255 255/.15)" })}</div>
          <div style="width:220px;border-radius:18px;background:${AF.gold};display:grid;place-items:center;color:#fff;text-align:center"><div>${afMark(70, AF.cream, AF.gold)}<div style="font:600 18px ${SANS2};letter-spacing:.2em;margin-top:12px">ADA FIRIN</div><div style="font-size:12px;letter-spacing:.3em;opacity:.85">EKMEK KESESİ</div></div></div>
        </div>
      </div>` }),
  });
  out.push({
    name: "hizmet3-grafik-tasarim-6", w: 1200, h: 900,
    html: feature({ t, title: "Baskıya ve dijitale hazır dosyalar", sub: "Her iş; baskı için CMYK, ekran için RGB ve sosyal medya ölçülerinde teslim edilir.", body: `
      ${frame("ambalaj-aycekirdek.webp", "left:0;top:0;width:620px;height:638px", "center")}
      ${chip(`<div style="font-size:18px;font-weight:600">Her işte teslim paketi</div>${[["file-image", "Baskı PDF (CMYK, 3 mm taşma)"], ["layers", "Kaynak dosyalar (AI, PSD)"], ["monitor", "Web ve sosyal medya PNG/WebP"], ["book-open", "Kullanım ve renk kılavuzu"]].map(([ic, a]) => `<div class="row" style="gap:12px;margin-top:16px;font-size:16px">${icon(ic, { size: 20, color: "#3530a8" })}${a}</div>`).join("")}`, "left:650px;top:40px;width:422px", "26px")}
      ${chip(`<div class="row" style="gap:10px">${["#1D2B4F", "#F4ECDF", "#C8964A", "#3BA845"].map((c) => `<span style="width:40px;height:40px;border-radius:12px;background:${c};box-shadow:inset 0 0 0 1px rgb(0 0 0/.08)"></span>`).join("")}<span style="font-size:15px;color:#55617b;margin-left:8px">Pantone eşleştirmesi dahil</span></div>`, "left:650px;top:420px")}` }),
  });
  return out;
};
