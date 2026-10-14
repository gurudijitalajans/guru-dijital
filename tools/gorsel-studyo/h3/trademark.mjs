// Marka Tescil: müşteri markası (ZEYDA zeytinyağı) için araştırma, sınıf seçimi, bülten,
// tescil belgesi (örnek, kurum logosu yok) ve uluslararası başvuru
import { chip, cover, feature, glass, hero, icon, page, SANS2, SERIF, T } from "./common.mjs";

const t = T["marka-tescil"];
const ZG = "#3f5a2b";
const leaf = (s = 40, c = ZG) => `<svg width="${s}" height="${s}" viewBox="0 0 40 40"><path d="M20 36C20 22 26 10 36 4 34 18 28 30 20 36z" fill="${c}"/><path d="M20 36C20 24 14 14 4 10 6 22 12 32 20 36z" fill="${c}" opacity=".7"/><ellipse cx="27" cy="16" rx="3.4" ry="4.6" fill="#8aa04f" transform="rotate(30 27 16)"/></svg>`;
export const zeydaLogo = (s = 1, c = ZG) => `<span class="row" style="gap:${10 * s}px;color:${c}">${leaf(44 * s, c)}<span style="font:400 ${44 * s}px ${SERIF};letter-spacing:.2em">ZEYDA</span><sup style="font:600 ${16 * s}px Outfit;margin-left:-${6 * s}px;align-self:flex-start;margin-top:${4 * s}px">®</sup></span>`;
const oil = (h = 360) => `<svg width="${h * 0.36}" height="${h}" viewBox="0 0 36 100"><defs><linearGradient id="og" x1="0" x2="1"><stop offset="0" stop-color="#2f4a1c"/><stop offset=".35" stop-color="#6f8f2c"/><stop offset=".6" stop-color="#4b6b20"/><stop offset="1" stop-color="#22350f"/></linearGradient></defs><rect x="13" y="0" width="10" height="9" rx="2" fill="#c8a978"/><path d="M14 9h8v10c0 4 8 8 8 16v58c0 4-3 7-7 7H13c-4 0-7-3-7-7V35c0-8 8-12 8-16z" fill="url(#og)"/><rect x="8" y="46" width="20" height="30" rx="2" fill="#f6f1e4"/><text x="18" y="60" text-anchor="middle" font-family="Didot,serif" font-size="4.6" letter-spacing=".9" fill="${ZG}">ZEYDA</text><text x="18" y="66" text-anchor="middle" font-family="Outfit" font-size="2.3" fill="${ZG}">NATÜREL SIZMA</text><text x="18" y="70" text-anchor="middle" font-family="Outfit" font-size="2.3" fill="${ZG}">ZEYTİNYAĞI · 500 ML</text></svg>`;

const certificate = (w = 620) => `<div style="width:${w}px;aspect-ratio:1/1.32;background:#fffdf8;border-radius:10px;padding:${w * 0.07}px;position:relative;font-family:${SERIF};color:#2a2a2a;box-shadow:0 50px 90px -40px rgb(0 6 26/.7),0 0 0 1px rgb(0 0 0/.04)">
  <div style="position:absolute;inset:${w * 0.03}px;border:1.5px solid #c9b07a;border-radius:6px"></div>
  <div style="position:absolute;inset:${w * 0.04}px;border:.6px solid #c9b07a;border-radius:4px"></div>
  <div style="position:relative;text-align:center">
    <div style="font:600 ${w * 0.022}px Outfit;letter-spacing:.32em;color:#8a7240">ÖRNEK BELGE</div>
    <div style="font-size:${w * 0.058}px;margin-top:${w * 0.03}px;letter-spacing:.06em">Marka Tescil Belgesi</div>
    <div style="width:${w * 0.2}px;height:1px;background:#c9b07a;margin:${w * 0.03}px auto"></div>
    <div style="display:grid;place-items:center;margin-top:${w * 0.04}px">${zeydaLogo(w / 620)}</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:${w * 0.03}px ${w * 0.05}px;text-align:left;margin-top:${w * 0.07}px;font:400 ${w * 0.024}px ${SANS2}">
      ${[["Başvuru numarası", "2026/014382"], ["Tescil tarihi", "2 Eylül 2026"], ["Marka sahibi", "Zeyda Gıda Tic. A.Ş."], ["Koruma süresi", "10 yıl (2036)"], ["Nice sınıfları", "29 · 30 · 35"], ["Marka türü", "Şekil + kelime"]].map(([a, b]) => `<div><div style="color:#8a7c6a;font-size:${w * 0.02}px;letter-spacing:.06em;text-transform:uppercase">${a}</div><div style="font-weight:600;margin-top:3px;color:#2a2a2a">${b}</div></div>`).join("")}
    </div>
  </div>
  <div style="position:absolute;right:${w * 0.09}px;bottom:${w * 0.08}px;width:${w * 0.2}px;height:${w * 0.2}px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#e7c873,#b8912f);display:grid;place-items:center;box-shadow:0 8px 18px -8px rgb(120 90 20/.6)"><div style="width:76%;height:76%;border-radius:50%;border:1.5px dashed rgb(255 255 255/.7);display:grid;place-items:center;font:700 ${w * 0.024}px Outfit;color:#fff;letter-spacing:.1em;text-align:center">TESCİLLİ<br>®</div></div>
  <div style="position:absolute;left:${w * 0.09}px;bottom:${w * 0.1}px;font:italic ${w * 0.03}px ${SERIF};color:#555">Marka vekili onaylı kopya</div>
</div>`;

export const trademarkScenes = () => {
  const out = [];
  out.push({
    name: "hizmet3-marka-tescil-hero", w: 1600, h: 1000,
    html: hero({ t, art: `
      <div class="abs" style="left:420px;top:90px;transform:rotate(-3deg)">${certificate(560)}</div>
      <div class="abs" style="left:1010px;top:330px;filter:drop-shadow(0 40px 40px rgb(0 6 26/.6))">${oil(560)}</div>
      ${chip(`<div class="row" style="gap:14px"><span style="width:44px;height:44px;border-radius:12px;background:#e6f6ec;display:grid;place-items:center">${icon("shield-check", { size: 22, color: "#12873f" })}</span><div><div style="font-size:14px;color:#7f8aa3">ZEYDA · 3 sınıf</div><div style="font-size:19px;font-weight:600">Tescil tamamlandı</div></div></div>`, "left:190px;top:700px")}
      ${chip(`<div class="row" style="gap:10px">${["29", "30", "35"].map((x) => `<span style="width:52px;height:44px;border-radius:12px;background:#2c74d8;color:#fff;display:grid;place-items:center;font-weight:600;font-size:18px">${x}</span>`).join("")}<span style="font-size:15px;color:#55617b;margin-left:6px">Nice sınıfları</span></div>`, "left:200px;top:180px")}
    ` }),
  });
  out.push({
    name: "hizmet3-marka-tescil-kapak", w: 1200, h: 1500,
    html: cover({ t, eyebrow: "Marka Tescil", headline: "Emeğiniz *adınızla* korunsun", sub: "Araştırmadan tescil belgesine kadar tüm süreç sizin yerinize takipte", art: `
      <div class="abs" style="left:250px;top:80px;transform:rotate(-4deg)">${certificate(560)}</div>
      <div class="abs" style="left:780px;top:300px;filter:drop-shadow(0 40px 40px rgb(0 6 26/.6))">${oil(520)}</div>` }),
  });
  /* 1: Benzer marka araştırması */
  const sims = [["ZEYDA", "Başvurulan marka", 0, "#2c74d8"], ["ZEYDAN", "Sınıf 30 · 2019", 72, "#dc2626"], ["ZEYTA", "Sınıf 29 · 2021", 58, "#f59e0b"], ["ZEYNA FOOD", "Sınıf 43 · 2017", 31, "#16a34a"], ["DEYZA", "Sınıf 3 · 2022", 18, "#16a34a"]];
  out.push({
    name: "hizmet3-marka-tescil-1", w: 1200, h: 900,
    html: feature({ t, title: "Önce benzer marka araştırması", sub: "Başvurudan önce benzer kayıtları tarar, risk düzeyini ve stratejiyi raporlarız.", body: `
      <div class="abs sh" style="left:0;top:0;width:1072px;height:638px;border-radius:24px;background:#fff;padding:30px 36px">
        <div class="row" style="justify-content:space-between"><div><div style="font-size:21px;font-weight:600">Benzerlik raporu · ZEYDA</div><div style="font-size:14px;color:#7f8aa3;margin-top:4px">Ulusal veri tabanı · 29, 30 ve 35. sınıflar · 1.284 kayıt tarandı</div></div><span style="padding:8px 14px;border-radius:999px;background:#fff3dc;color:#b45f06;font-size:14px;font-weight:600">Orta risk · strateji önerildi</span></div>
        <div style="margin-top:24px;display:grid;gap:12px">${sims.map(([n, d, v, c], i) => `<div class="row" style="gap:18px;padding:16px 20px;border-radius:16px;background:${i === 0 ? "#eef5ff" : "#f8f9fc"}"><span style="width:200px;font:400 26px ${SERIF};letter-spacing:.12em;color:${i === 0 ? ZG : "#2a2a2a"}">${n}</span><span style="flex:1;font-size:15px;color:#7f8aa3">${d}</span>${i === 0 ? `<span style="font-size:15px;font-weight:600;color:#2c74d8">karşılaştırma tabanı</span>` : `<div style="width:260px"><div class="row" style="justify-content:space-between;font-size:14px"><span style="color:#7f8aa3">Benzerlik</span><b style="color:${c}">%${v}</b></div><div style="height:8px;border-radius:8px;background:#e9edf3;margin-top:6px"><div style="width:${v}%;height:100%;border-radius:8px;background:${c}"></div></div></div>`}</div>`).join("")}</div>
        <div class="row" style="gap:10px;margin-top:18px;padding:14px 16px;border-radius:14px;background:#eef3ff;color:#12419b;font-size:15px">${icon("lightbulb", { size: 20 })}Öneri: şekil unsuru (zeytin dalı) ile birlikte başvuru; 30. sınıfta mal listesi daraltılsın.</div>
      </div>` }),
  });
  /* 2: Nice sınıfları */
  const cls = Array.from({ length: 45 }, (_, i) => i + 1);
  out.push({
    name: "hizmet3-marka-tescil-2", w: 1200, h: 900,
    html: feature({ t, dark: true, title: "Doğru sınıf, doğru mal listesi", sub: "45 Nice sınıfı arasından işinizi bugün ve yarın koruyacak olanları seçeriz.", body: `
      <div class="abs sh" style="left:0;top:0;width:620px;height:638px;border-radius:24px;background:#fff;padding:28px;color:#0c1a3a">
        <div style="font-size:20px;font-weight:600">Nice sınıflandırması</div><div style="font-size:14px;color:#7f8aa3;margin-top:4px">Seçilen: 3 sınıf</div>
        <div style="display:grid;grid-template-columns:repeat(9,1fr);gap:8px;margin-top:20px">${cls.map((n) => `<span style="height:50px;border-radius:12px;display:grid;place-items:center;font-weight:600;font-size:16px;${[29, 30, 35].includes(n) ? "background:#2c74d8;color:#fff;box-shadow:0 10px 20px -10px #2c74d8" : "background:#f3f5f9;color:#8a95ad"}">${n}</span>`).join("")}</div>
      </div>
      ${glass(`${[["29", "Zeytinyağı, zeytin, sofralık yağlar"], ["30", "Baharat, sos, unlu mamuller"], ["35", "Perakende ve çevrim içi satış hizmetleri"]].map(([a, b]) => `<div class="row" style="gap:16px;padding:14px 0;border-bottom:1px solid rgb(255 255 255/.12)"><span style="width:54px;height:46px;border-radius:12px;background:#2c74d8;display:grid;place-items:center;font-weight:600;font-size:19px">${a}</span><span style="font-size:16.5px;line-height:1.4">${b}</span></div>`).join("")}`, "left:650px;top:60px;width:422px", "24px 26px")}` }),
  });
  /* 3: Bülten ve itiraz takibi */
  out.push({
    name: "hizmet3-marka-tescil-3", w: 1200, h: 900,
    html: feature({ t, title: "Bülten ve itiraz süresi takipte", sub: "Yayın, iki aylık itiraz süresi ve gelen itirazlara yanıt sizin yerinize yürütülür.", body: `
      <div class="abs sh" style="left:0;top:0;width:560px;height:638px;border-radius:12px;background:#fffdf8;padding:34px;font-family:${SERIF};color:#2a2a2a">
        <div class="row" style="justify-content:space-between;font:600 13px Outfit;letter-spacing:.2em;color:#8a7240"><span>RESMİ MARKA BÜLTENİ</span><span>SAYI 412 · EYLÜL 2026</span></div>
        <div style="height:1px;background:#c9b07a;margin:16px 0 22px"></div>
        ${[["2026/014382", true], ["2026/014390", false], ["2026/014401", false]].map(([n, hi]) => `<div style="padding:18px;border-radius:10px;margin-bottom:14px;${hi ? "background:#eef5ff;box-shadow:inset 0 0 0 2px #2c74d8" : "background:#f6f3ec"}"><div class="row" style="justify-content:space-between;font:500 14px Outfit;color:#6b6252"><span>(210) ${n}</span><span>(511) ${hi ? "29, 30, 35" : "25, 35"}</span></div>${hi ? `<div style="margin-top:14px">${zeydaLogo(0.7)}</div><div style="font:400 14px Outfit;color:#6b6252;margin-top:10px">(731) Zeyda Gıda Tic. A.Ş. · İzmir</div>` : `<div style="height:40px;margin-top:12px;border-radius:6px;background:#ebe5d8"></div>`}</div>`).join("")}
      </div>
      <div class="abs sh" style="left:592px;top:40px;width:480px;border-radius:24px;background:#fff;padding:28px">
        <div style="font-size:15px;color:#7f8aa3">İtiraz süresi</div><div class="row" style="align-items:flex-end;gap:10px;margin-top:6px"><span style="font-size:64px;font-weight:600;letter-spacing:-.04em;line-height:1">18</span><span style="font-size:18px;color:#7f8aa3;padding-bottom:8px">gün kaldı</span></div>
        <div style="height:10px;border-radius:10px;background:#e9edf3;margin-top:16px"><div style="width:70%;height:100%;border-radius:10px;background:#2c74d8"></div></div>
        <div class="row" style="gap:10px;margin-top:20px;font-size:16px">${icon("shield-check", { size: 20, color: "#12873f" })}Şu ana kadar itiraz yok</div>
        <div class="row" style="gap:10px;margin-top:12px;font-size:16px">${icon("bell", { size: 20, color: "#2c74d8" })}Benzer başvurular için izleme açık</div>
      </div>` }),
  });
  /* 4: Süreç zaman çizelgesi */
  const st = [["Araştırma", "1-2 gün", 1], ["Başvuru", "Aynı hafta", 1], ["İnceleme", "~2-3 ay", 1], ["Bülten ve itiraz", "2 ay", 0.7], ["Tescil belgesi", "", 0]];
  out.push({
    name: "hizmet3-marka-tescil-4", w: 1200, h: 900,
    html: feature({ t, dark: true, title: "Her adımda nerede olduğunuzu bilin", sub: "Başvurudan belgeye kadar süreç tarih tarih izlenir; bir sonraki adım önceden bildirilir.", body: `
      <div class="abs" style="left:100px;top:150px;width:872px;height:6px;border-radius:6px;background:rgb(255 255 255/.15)"><div style="width:72%;height:100%;border-radius:6px;background:linear-gradient(90deg,#2c74d8,#bcecff)"></div></div>
      ${st.map(([a, b, d], i) => `<div class="abs" style="left:${i * 218}px;top:107px;width:200px;display:grid;justify-items:center;text-align:center;color:#fff"><span style="width:86px;height:86px;border-radius:50%;display:grid;place-items:center;${d === 1 ? "background:#2c74d8" : d ? "background:#fff;color:#011441" : "background:rgb(255 255 255/.1);box-shadow:inset 0 0 0 2px rgb(255 255 255/.3)"}">${d === 1 ? icon("check", { size: 34, stroke: 3 }) : icon(d ? "hourglass" : "award", { size: 32, color: d ? "#011441" : "#fff" })}</span><div style="font-size:20px;font-weight:600;margin-top:20px">${a}</div><div style="font-size:15px;opacity:.7;margin-top:4px">${b}</div></div>`).join("")}
      ${glass(`<div class="row" style="gap:16px">${icon("calendar-check", { size: 28, color: "#bcecff" })}<div><div style="font-size:19px;font-weight:600">Sıradaki adım: itiraz süresinin bitişi · 20 Ekim</div><div style="font-size:15px;opacity:.75;margin-top:4px">Süre dolunca tescil ücreti ödenir ve belge düzenlenir; size hatırlatırız.</div></div></div>`, "left:120px;top:420px;width:832px", "24px 28px")}` }),
  });
  /* 5: Belge yakın plan + ürün üzerinde ® */
  out.push({
    name: "hizmet3-marka-tescil-5", w: 1200, h: 900,
    html: feature({ t, title: "Belge elinizde, ® ürününüzde", sub: "Tescilden sonra logo kullanımı, ® işareti ve yenileme tarihleri için yol gösteririz.", body: `
      <div class="abs" style="left:40px;top:0;transform:rotate(-2deg)">${certificate(470)}</div>
      <div class="abs" style="left:640px;top:40px;filter:drop-shadow(0 30px 30px rgb(1 12 40/.35))">${oil(560)}</div>
      ${chip(`<div style="font-size:14px;color:#7f8aa3">Yenileme hatırlatması</div><div style="font-size:20px;font-weight:600">2 Eylül 2036</div>`, "left:820px;top:430px")}` }),
  });
  /* 6: Uluslararası */
  const cs = [["🇩🇪", "Almanya"], ["🇬🇧", "Birleşik Krallık"], ["🇺🇸", "ABD"], ["🇳🇱", "Hollanda"], ["🇦🇪", "BAE"], ["🇯🇵", "Japonya"]];
  out.push({
    name: "hizmet3-marka-tescil-6", w: 1200, h: 900,
    html: feature({ t, dark: true, title: "Yurt dışında da korunur", sub: "Madrid Protokolü ile tek başvuruda birden fazla ülkede marka koruması.", body: `
      <svg class="abs" style="left:0;top:0;opacity:.5" width="1072" height="638" viewBox="0 0 1072 638">${Array.from({ length: 900 }, (_, i) => { const x = (i * 37) % 1072, y = (i * 53) % 638; const land = Math.sin(x / 120) * Math.cos(y / 90) + Math.sin((x + y) / 210) > 0.35; return land ? `<circle cx="${x}" cy="${y}" r="3" fill="#bcecff"/>` : ""; }).join("")}</svg>
      <div class="abs" style="left:60px;top:40px;width:952px;display:grid;grid-template-columns:repeat(3,1fr);gap:18px">${cs.map(([f, n], i) => `<div class="row sh" style="gap:14px;padding:20px;border-radius:20px;background:#fff;color:#0c1a3a"><span style="font-size:34px">${f}</span><div><div style="font-size:18px;font-weight:600">${n}</div><div style="font-size:14px;color:${i < 4 ? "#12873f" : "#b45f06"};font-weight:600">${i < 4 ? "Koruma başladı" : "İnceleme sürüyor"}</div></div></div>`).join("")}</div>
      ${glass(`<div class="row" style="gap:16px">${zeydaLogo(0.7, "#fff")}<div style="margin-left:12px"><div style="font-size:18px;font-weight:600">6 ülke · tek başvuru</div><div style="font-size:14.5px;opacity:.75">Uluslararası kayıt no: 1 812 004</div></div></div>`, "left:240px;top:420px;width:592px", "22px 28px")}` }),
  });
  out.push({ name: "hizmet3-raw-marka-belge", w: 900, h: 1188, html: page({ w: 900, h: 1188, bg: "background:#eef2f8;", body: `<div style="padding:0">${certificate(900)}</div>` }) });
  return out;
};
