// Özel Yazılım: müşteriye özel geliştirilen sistem (Kaya Lojistik sevkiyat ve depo
// yazılımı; müşterinin markasıyla), sürücü uygulaması, entegrasyon haritası, kod
import { browser, chip, cover, feature, glass, hero, icon, macbook, page, phone, statusBar, T } from "./common.mjs";
import { tablet } from "./web.mjs";

const t = T["ozel-yazilim"];
const KY = { ink: "#0f172a", acc: "#f97316", soft: "#fff4ec", bg: "#f6f7f9" };
const logo = (s = 1) => `<span class="row" style="gap:${10 * s}px"><span style="width:${34 * s}px;height:${34 * s}px;border-radius:${9 * s}px;background:${KY.acc};display:grid;place-items:center">${icon("truck", { size: 19 * s, color: "#fff", stroke: 2.3 })}</span><span style="font:700 ${18 * s}px Outfit;letter-spacing:.06em;color:${KY.ink}">KAYA<span style="font-weight:400"> LOJİSTİK</span></span></span>`;

/* Rota haritası (çizim) */
function routeMap(w, h) {
  return `<svg width="${w}" height="${h}" viewBox="0 0 800 520" preserveAspectRatio="xMidYMid slice"><rect width="800" height="520" fill="#eef1f4"/>
  ${["M0 90 C200 70 360 140 800 110", "M0 300 C180 280 420 330 800 290", "M0 450 C260 430 520 470 800 440", "M140 0 C160 200 120 330 170 520", "M420 0 C400 160 460 330 430 520", "M660 0 C700 200 640 330 690 520"].map((d) => `<path d="${d}" fill="none" stroke="#fff" stroke-width="16" stroke-linecap="round"/>`).join("")}
  <path d="M90 420 C200 380 260 300 330 290 S470 200 560 150 S680 90 720 80" fill="none" stroke="${KY.acc}" stroke-width="6" stroke-linecap="round" stroke-dasharray="1 0"/>
  <path d="M120 120 C220 160 300 230 420 250 S600 330 700 400" fill="none" stroke="#2563eb" stroke-width="6" stroke-linecap="round" stroke-dasharray="14 10"/>
  ${[[90, 420, KY.acc], [330, 290, KY.acc], [560, 150, KY.acc], [720, 80, KY.acc], [120, 120, "#2563eb"], [420, 250, "#2563eb"], [700, 400, "#2563eb"]].map(([x, y, c]) => `<circle cx="${x}" cy="${y}" r="11" fill="#fff" stroke="${c}" stroke-width="5"/>`).join("")}
  <g transform="translate(445 205)"><rect x="-22" y="-16" width="44" height="32" rx="9" fill="${KY.ink}"/><path d="M-8 -5h10v10h-10z M2 -1h6l3 4v2h-9z" fill="#fff"/></g>
  </svg>`;
}

const dash = () => `<div style="width:1440px;height:900px;display:flex;background:${KY.bg};font-family:Outfit;color:${KY.ink}">
  <aside style="width:236px;background:${KY.ink};color:#cbd5e1;padding:24px 16px;display:flex;flex-direction:column;gap:4px">
    <div style="padding:0 10px 24px" class="row"><span style="width:34px;height:34px;border-radius:9px;background:${KY.acc};display:grid;place-items:center">${icon("truck", { size: 19, color: "#fff" })}</span><span style="font:700 17px Outfit;letter-spacing:.06em;color:#fff;margin-left:10px">KAYA</span></div>
    ${[["layout-dashboard", "Genel bakış"], ["route", "Sevkiyatlar", 1], ["warehouse", "Depolar"], ["users", "Sürücüler"], ["file-text", "İrsaliyeler"], ["receipt", "Faturalar"], ["chart-column", "Raporlar"], ["settings", "Ayarlar"]].map(([ic, l, on]) => `<div class="row" style="gap:12px;height:42px;padding:0 12px;border-radius:10px;font-size:15px;${on ? "background:rgb(255 255 255/.08);color:#fff;font-weight:500" : ""}">${icon(ic, { size: 18 })}${l}</div>`).join("")}
  </aside>
  <main style="flex:1;padding:26px 30px;display:flex;flex-direction:column;gap:18px;min-width:0">
    <div class="row" style="gap:14px"><div><div style="font:600 25px Outfit">Sevkiyatlar</div><div style="font-size:14px;color:#64748b">Bugün · 42 araç yolda · 186 teslimat</div></div><span style="margin-left:auto;padding:11px 16px;border-radius:12px;background:#fff;font-size:14.5px;box-shadow:0 1px 2px rgb(0 0 0/.06)">Bugün ▾</span><span style="padding:11px 18px;border-radius:12px;background:${KY.acc};color:#fff;font-weight:600;font-size:14.5px">+ Yeni sevkiyat</span></div>
    <div class="row" style="gap:16px">${[["Yoldaki araç", "42", "truck"], ["Zamanında teslim", "%97,4", "clock"], ["Bekleyen yükleme", "18", "package"], ["Ort. teslim süresi", "3,2 sa", "timer"]].map(([a, b, ic]) => `<div style="flex:1;padding:18px 20px;border-radius:16px;background:#fff;box-shadow:0 1px 2px rgb(0 0 0/.05)"><div class="row" style="justify-content:space-between;font-size:14px;color:#64748b">${a}<span style="width:32px;height:32px;border-radius:9px;background:${KY.soft};display:grid;place-items:center">${icon(ic, { size: 16, color: KY.acc })}</span></div><div style="font:600 30px Outfit;margin-top:6px">${b}</div></div>`).join("")}</div>
    <div class="row" style="gap:16px;flex:1;min-height:0;align-items:stretch">
      <div style="flex:1.5;border-radius:18px;overflow:hidden;background:#fff;position:relative">${routeMap(760, 520)}
        <div class="abs" style="left:16px;top:16px;padding:12px 14px;border-radius:14px;background:#fff;box-shadow:0 10px 24px -12px rgb(0 0 0/.3);font-size:14px"><b>34 KY 812</b> · Gebze → Bursa<div style="color:#64748b;font-size:13px;margin-top:2px">Tahmini varış 14:20 · 12 teslimat</div></div></div>
      <div style="flex:1;border-radius:18px;background:#fff;padding:18px;display:flex;flex-direction:column;gap:10px">
        <div style="font:600 17px Outfit">Canlı sevkiyatlar</div>
        ${[["34 KY 812", "Gebze → Bursa", "Yolda", "#2563eb", 62], ["16 KY 204", "Bursa → İzmir", "Yolda", "#2563eb", 38], ["41 KY 990", "Kocaeli depo", "Yükleniyor", KY.acc, 15], ["34 KY 117", "Esenyurt → Tuzla", "Teslim edildi", "#16a34a", 100], ["06 KY 451", "Ankara depo", "Gecikme riski", "#dc2626", 71]].map(([p, r, s, c, pr]) => `<div style="padding:12px;border-radius:12px;background:#f8fafc"><div class="row" style="justify-content:space-between;font-size:14.5px"><b>${p}</b><span style="font-size:12.5px;font-weight:600;color:${c}">${s}</span></div><div style="font-size:13px;color:#64748b;margin-top:2px">${r}</div><div style="height:6px;border-radius:6px;background:#e2e8f0;margin-top:8px"><div style="width:${pr}%;height:100%;border-radius:6px;background:${c}"></div></div></div>`).join("")}
      </div>
    </div>
  </main></div>`;

const depot = () => `<div style="width:820px;height:1180px;background:${KY.bg};font-family:Outfit;color:${KY.ink};padding:34px">
  <div class="row" style="justify-content:space-between">${logo(1.1)}<span style="padding:9px 14px;border-radius:999px;background:#dcfce7;color:#15803d;font-weight:600;font-size:15px">Gebze depo · çevrimiçi</span></div>
  <div style="font:600 34px Outfit;margin-top:34px">Depo stok durumu</div><div style="font-size:17px;color:#64748b">Raf bazında doluluk · son okutma 2 dk önce</div>
  <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-top:26px">${Array.from({ length: 16 }, (_, i) => { const v = [92, 64, 30, 78, 88, 45, 12, 70, 96, 52, 66, 84, 20, 74, 58, 90][i]; const c = v > 85 ? "#dc2626" : v < 25 ? "#f59e0b" : "#16a34a"; return `<div style="padding:16px;border-radius:16px;background:#fff"><div style="font-size:14px;color:#64748b">Raf ${String.fromCharCode(65 + (i >> 2))}-${(i % 4) + 1}</div><div style="font:600 26px Outfit;margin-top:4px">%${v}</div><div style="height:8px;border-radius:8px;background:#e2e8f0;margin-top:10px"><div style="width:${v}%;height:100%;border-radius:8px;background:${c}"></div></div></div>`; }).join("")}</div>
  <div style="margin-top:26px;padding:22px;border-radius:20px;background:#fff"><div style="font:600 21px Outfit">Bugünkü hareketler</div>${[["Giriş", "Akın Beyaz Eşya · 48 palet", "08:12"], ["Çıkış", "Yıldız Market Bursa · 22 palet", "09:40"], ["Sayım", "Raf C-2 · fark yok", "10:05"], ["Çıkış", "Moda Tekstil İzmir · 31 palet", "11:20"]].map(([a, b, c]) => `<div class="row" style="gap:14px;padding:14px 0;border-bottom:1px solid #f1f5f9;font-size:17px"><span style="width:70px;padding:5px 0;text-align:center;border-radius:999px;font-size:14px;font-weight:600;background:${a === "Giriş" ? "#dcfce7" : a === "Çıkış" ? KY.soft : "#e0e7ff"};color:${a === "Giriş" ? "#15803d" : a === "Çıkış" ? "#c2410c" : "#4338ca"}">${a}</span><span style="flex:1">${b}</span><span style="color:#64748b">${c}</span></div>`).join("")}</div></div>`;

const driver = () => `<div style="position:relative;width:390px;height:844px;background:#fff;font-family:Outfit;color:${KY.ink}">${statusBar()}
  <div style="padding:4px 20px 12px">${logo(0.9)}</div>
  <div style="height:300px;overflow:hidden">${routeMap(390, 300)}</div>
  <div style="margin:-30px 16px 0;position:relative;border-radius:22px;background:#fff;box-shadow:0 20px 40px -20px rgb(0 0 0/.35);padding:18px">
    <div class="row" style="justify-content:space-between"><div><div style="font-size:13px;color:#64748b">Sıradaki teslimat · 4/12</div><div style="font:600 19px Outfit">Yıldız Market Nilüfer</div></div><span style="font:600 20px Outfit;color:${KY.acc}">8 dk</span></div>
    <div style="font-size:14px;color:#64748b;margin-top:6px">Özlüce Mah. 23. Sk. No:4 · 6 palet</div>
    <div class="row" style="gap:10px;margin-top:16px">${[["navigation", "Yol tarifi", 1], ["phone", "Ara"], ["camera", "Fotoğraf"]].map(([ic, l, p]) => `<span class="row" style="flex:1;justify-content:center;gap:6px;height:46px;border-radius:12px;font-size:14px;font-weight:600;${p ? `background:${KY.acc};color:#fff` : "background:#f1f5f9"}">${icon(ic, { size: 16 })}${l}</span>`).join("")}</div>
  </div>
  <div style="padding:16px 20px">${[["Teslim edildi", "Bursa Ticaret · imza alındı", 1], ["Teslim edildi", "Özlüce AVM · 4 palet", 1], ["Sırada", "Yıldız Market Nilüfer", 0]].map(([a, b, d]) => `<div class="row" style="gap:12px;padding:9px 0"><span style="width:26px;height:26px;border-radius:50%;background:${d ? "#16a34a" : "#e2e8f0"};display:grid;place-items:center">${d ? icon("check", { size: 14, color: "#fff", stroke: 3 }) : ""}</span><div><div style="font-size:15px;font-weight:600">${a}</div><div style="font-size:13px;color:#64748b">${b}</div></div></div>`).join("")}</div>
  <div style="position:absolute;left:20px;right:20px;bottom:36px;height:58px;border-radius:16px;background:${KY.ink};color:#fff;display:grid;place-items:center;font:600 17px Outfit">Teslimatı tamamla</div></div>`;

export const softwareScenes = () => {
  const D = dash(), P = depot(), M = driver();
  const out = [];
  out.push({
    name: "hizmet3-ozel-yazilim-hero", w: 1600, h: 1000,
    html: hero({ t, art: `
      <div class="abs" style="left:220px;top:150px">${macbook(D, { width: 940 })}</div>
      ${tablet(P, { width: 330, style: "left:1030px;top:260px" })}
      ${phone(M, 220, "left:1200px;top:430px")}
      ${chip(`<div class="row" style="gap:14px">${logo(1)}<span style="padding:6px 12px;border-radius:999px;background:#e6f6ec;color:#12873f;font-size:14px;font-weight:600">Canlıda · 2. yıl</span></div>`, "left:200px;top:90px")}
    ` }),
  });
  out.push({
    name: "hizmet3-ozel-yazilim-kapak", w: 1200, h: 1500,
    html: cover({ t, eyebrow: "Özel Yazılım", headline: "İşinize göre *yazılım*", sub: "Hazır paketlere uymayan süreçler için size ait, ölçeklenebilir sistemler", art: `
      ${tablet(P, { width: 470, style: "left:150px;top:120px;transform:rotate(-4deg)" })}
      ${phone(M, 300, "left:690px;top:200px;transform:rotate(5deg)")}` }),
  });
  out.push({
    name: "hizmet3-ozel-yazilim-1", w: 1200, h: 900,
    html: feature({ t, dark: true, title: "Lojistik firması için sevkiyat sistemi", sub: "Kaya Lojistik'in 42 aracı, 3 deposu ve tüm teslimatları tek ekranda.", body: `
      ${browser(D, { url: "panel.kayalojistik.com.tr", scale: 0.744, vh: 820, style: "left:0;top:0" })}` }),
  });
  out.push({
    name: "hizmet3-ozel-yazilim-2", w: 1200, h: 900,
    html: feature({ t, title: "Sahada çalışan ekip için mobil", sub: "Sürücü uygulamasında rota, teslim fotoğrafı ve dijital imza.", body: `
      ${phone(M, 290, "left:120px;top:0")}
      ${chip(`<div style="font-size:15px;color:#7f8aa3">Kağıt irsaliye</div><div style="font-size:34px;font-weight:600">%0</div><div style="font-size:14px;color:#12873f;font-weight:600">tüm teslimatlar dijital imzalı</div>`, "left:480px;top:90px;width:260px")}
      ${chip(`<div style="font-size:15px;color:#7f8aa3">Teslim kanıtı</div><div class="row" style="gap:10px;margin-top:10px">${["Fotoğraf", "İmza", "Konum", "Saat"].map((x) => `<span style="padding:7px 12px;border-radius:999px;background:#eef3ff;color:#12419b;font-size:14px;font-weight:600">${x}</span>`).join("")}</div>`, "left:480px;top:280px")}
      ${chip(`<div style="font-size:15px;color:#7f8aa3">Çevrimdışı mod</div><div style="font-size:17px;font-weight:600;margin-top:4px">Kapsama dışında da çalışır, bağlanınca eşitler</div>`, "left:480px;top:420px;width:470px")}` }),
  });
  out.push({
    name: "hizmet3-ozel-yazilim-3", w: 1200, h: 900,
    html: feature({ t, dark: true, title: "Depo ekranları tablette", sub: "Raf doluluğu, giriş ve çıkışlar el terminali okutmasıyla anında güncellenir.", body: `
      ${tablet(P, { width: 400, style: "left:80px;top:0;transform:rotate(-3deg)" })}
      ${glass(`<div style="font-size:20px;font-weight:600">Ölçülen fark</div>${[["Sayım süresi", "2 gün → 3 saat"], ["Yanlış sevk", "%2,1 → %0,3"], ["Depo doluluğu görünürlüğü", "anlık"]].map(([a, b]) => `<div class="row" style="justify-content:space-between;margin-top:16px;padding-bottom:12px;border-bottom:1px solid rgb(255 255 255/.12);font-size:16.5px"><span style="opacity:.8">${a}</span><b>${b}</b></div>`).join("")}`, "left:560px;top:120px;width:500px", "28px")}` }),
  });
  /* Entegrasyon haritası */
  const node = (x, y, ic, l, c = "#5f6ff0") => `<div class="abs sh" style="left:${x}px;top:${y}px;width:200px;padding:16px;border-radius:18px;background:#fff;text-align:center"><span style="width:46px;height:46px;border-radius:14px;background:${c}1a;display:inline-grid;place-items:center">${icon(ic, { size: 22, color: c })}</span><div style="font-size:15.5px;font-weight:600;margin-top:8px">${l}</div></div>`;
  out.push({
    name: "hizmet3-ozel-yazilim-4", w: 1200, h: 900,
    html: feature({ t, title: "Kullandığınız sistemlerle konuşur", sub: "ERP, e-fatura, kargo, banka ve mesajlaşma servisleri API ile bağlanır.", body: `
      <svg class="abs" style="left:0;top:0" width="1072" height="638">${[[150, 90], [536, 60], [922, 90], [150, 500], [536, 560], [922, 500]].map(([x, y]) => `<path d="M536 319 L${x} ${y}" stroke="#5f6ff0" stroke-width="2.5" stroke-dasharray="7 7" opacity=".55"/>`).join("")}</svg>
      <div class="abs" style="left:416px;top:249px;width:240px;height:140px;border-radius:24px;background:linear-gradient(150deg,#0b0f3f,#2a35a0);display:grid;place-items:center;box-shadow:0 30px 60px -30px rgb(11 15 63/.8)">${logo(1).replace(/color:#0f172a/g, "color:#fff")}<div style="color:#aeb7ff;font-size:14px;margin-top:-30px">çekirdek sistem</div></div>
      ${node(50, 20, "database", "ERP (Logo, Netsis)")}${node(436, 0, "file-check", "e-Fatura / e-İrsaliye", "#0ea5a5")}${node(822, 20, "package", "Kargo firmaları", "#e8833a")}
      ${node(50, 470, "landmark", "Banka ve POS", "#16a34a")}${node(436, 500, "message-circle", "WhatsApp / SMS", "#22c55e")}${node(822, 470, "map", "Harita ve rota", "#2563eb")}` }),
  });
  /* Kod ve testler */
  const code = `<div style="width:1100px;height:700px;background:#0d1117;color:#c9d1d9;font:15px/1.7 Menlo,monospace;display:flex">
    <div style="width:220px;background:#010409;padding:18px;font-size:13.5px;color:#8b949e">${["src/", "  sevkiyat/", "    rota.ts", "    teslim.ts", "  depo/", "    stok.ts", "  entegrasyon/", "    efatura.ts", "    kargo.ts", "tests/", "  rota.test.ts"].map((x, i) => `<div style="${i === 2 ? "color:#fff;background:#1f2937;margin:0 -8px;padding:0 8px;border-radius:6px" : ""}">${x.replace(/ /g, "&nbsp;")}</div>`).join("")}</div>
    <div style="flex:1;padding:18px 24px;white-space:pre"><span style="color:#ff7b72">export async function</span> <span style="color:#d2a8ff">rotaOlustur</span>(araç: Araç, teslimatlar: Teslimat[]) {
  <span style="color:#8b949e">// Zaman pencereleri ve araç kapasitesine göre sıralama</span>
  <span style="color:#ff7b72">const</span> sıralı = <span style="color:#d2a8ff">optimizeEt</span>(teslimatlar, {
    kapasite: araç.paletKapasitesi,
    başlangıç: araç.depo.konum,
    pencere: <span style="color:#a5d6ff">"08:00-18:00"</span>,
  });
  <span style="color:#ff7b72">await</span> db.rota.<span style="color:#d2a8ff">create</span>({ araçId: araç.id, duraklar: sıralı });
  <span style="color:#ff7b72">await</span> bildirim.<span style="color:#d2a8ff">sürücüye</span>(araç.sürücü, <span style="color:#a5d6ff">\`\${sıralı.length} durak hazır\`</span>);
  <span style="color:#ff7b72">return</span> sıralı;
}</div></div>`;
  out.push({
    name: "hizmet3-ozel-yazilim-5", w: 1200, h: 900,
    html: feature({ t, dark: true, title: "Size ait, belgelenmiş kod", sub: "Kaynak kod sizde kalır; testler, belgeler ve sürüm geçmişiyle teslim edilir.", body: `
      ${browser(code, { url: "kod · kaya-lojistik / sevkiyat", scale: 0.975, cw: 1100, vh: 560, style: "left:0;top:0", dark: true })}
      ${chip(`<div class="row" style="gap:14px"><span style="width:40px;height:40px;border-radius:12px;background:#16a34a;display:grid;place-items:center">${icon("check", { size: 22, color: "#fff", stroke: 3 })}</span><div><div style="font-size:18px;font-weight:600">412 test geçti</div><div style="font-size:14px;color:#7f8aa3">Kod kapsamı %86 · son sürüm v3.8</div></div></div>`, "left:700px;top:520px")}` }),
  });
  /* Süreç: ihtiyaç analizinden canlıya */
  const steps = [["search", "Analiz", "Süreçleri yerinde inceliyoruz"], ["pen-tool", "Tasarım", "Ekranlar ve veri modeli"], ["code", "Geliştirme", "İki haftalık sprintler"], ["flask-conical", "Test", "Gerçek veriyle deneme"], ["rocket", "Canlı", "Eğitim ve geçiş"], ["life-buoy", "Destek", "Bakım ve yeni özellikler"]];
  out.push({
    name: "hizmet3-ozel-yazilim-6", w: 1200, h: 900,
    html: feature({ t, title: "Her iki haftada çalışan bir sürüm", sub: "Proje adım adım ilerler; her sprint sonunda yeni ekranları birlikte deneriz.", body: `
      <div class="abs" style="left:0;top:40px;display:grid;grid-template-columns:repeat(3,1fr);gap:20px;width:1072px">${steps.map(([ic, a, b], i) => `<div class="sh" style="padding:26px;border-radius:22px;background:${i === 2 ? "linear-gradient(150deg,#0b0f3f,#2a35a0)" : "#fff"};color:${i === 2 ? "#fff" : "#0c1a3a"};height:240px;display:flex;flex-direction:column;justify-content:space-between"><div class="row" style="justify-content:space-between"><span style="width:50px;height:50px;border-radius:14px;background:${i === 2 ? "rgb(255 255 255/.14)" : "#eceefe"};display:grid;place-items:center">${icon(ic, { size: 24, color: i === 2 ? "#fff" : "#2a35a0" })}</span><span style="font-size:15px;font-weight:600;opacity:.6">0${i + 1}</span></div><div><div style="font-size:24px;font-weight:600">${a}</div><div style="font-size:15.5px;opacity:.75;margin-top:4px">${b}</div>${i === 2 ? `<div style="margin-top:12px;height:8px;border-radius:8px;background:rgb(255 255 255/.18)"><div style="width:64%;height:100%;border-radius:8px;background:#aeb7ff"></div></div>` : ""}</div></div>`).join("")}</div>` }),
  });
  out.push({ name: "hizmet3-raw-yazilim-dash", w: 1440, h: 900, html: page({ w: 1440, h: 900, bg: "background:#fff;", body: D }) });
  out.push({ name: "hizmet3-raw-yazilim-depo", w: 820, h: 1180, html: page({ w: 820, h: 1180, bg: "background:#fff;", body: P }) });
  out.push({ name: "hizmet3-raw-yazilim-driver", w: 390, h: 844, html: page({ w: 390, h: 844, bg: "background:#fff;", body: M }) });
  out.push({ name: "hizmet3-raw-yazilim-code", w: 1100, h: 700, html: page({ w: 1100, h: 700, bg: "background:#0d1117;", body: code }) });
  return out;
};
