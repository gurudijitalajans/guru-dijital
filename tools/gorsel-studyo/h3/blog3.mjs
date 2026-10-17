// Blog kapakları v3 (1600x900): hizmet galerilerinin diliyle. Konu temasının lacivert ışık zemini, sol üstte
// beyaz başlık kartı (kategori + kısa konu), sağda yazının konusunu anlatan TEK büyük görsel. Kartta 520 px
// genişlikte de okunsun diye yazılar büyük, ayrıntı az. Kurgusal marka, uydurma sonuç ve puan yok.
import { floatCard, grainLayer, icon, iphone, macbook, page, themeBg } from "../lib.mjs";
import { T } from "./common.mjs";
import { floor, glow } from "./real.mjs";

const INK = "#0c1a3a";
const MUTED = "#6b7590";
const LINE = "#eef1f6";
const OK = "#16a34a";
/* Kategori → hizmet tonu ve vurgu rengi */
const CAT = {
  "Sosyal Medya": [T["sosyal-medya-yonetimi"], "#2f7de1"],
  "Web ve Teknoloji": [T["web-tasarim"], "#1f7fc4"],
  "Dijital Pazarlama": [T["dijital-reklam-yonetimi"], "#2a6aca"],
  SEO: [T.seo, "#1489b8"],
  "Marka ve Tasarım": [T["grafik-tasarim"], "#4b5be0"],
  "E-Ticaret": [T["e-ticaret-yonetimi"], "#0d8aa6"],
  Yazılım: [T["ozel-yazilim"], "#4b5be0"],
  Mobil: [T["mobil-uygulama"], "#4b5be0"],
};

let ACC = "#2a6aca";
const chip = (ic, s = 56, c = ACC, bg = null) => `<span style="width:${s}px;height:${s}px;border-radius:${s * 0.3}px;background:${bg ?? c + "1a"};display:grid;place-items:center;flex-shrink:0">${icon(ic, { size: s * 0.48, color: c, stroke: 2 })}</span>`;
const card = (html, style, pad = "30px 32px") => floatCard(html, `${style};border-radius:28px`, pad);
const title = (ic, t, right = "") => `<div class="row" style="gap:16px">${chip(ic, 52)}<div style="font-size:28px;font-weight:600;letter-spacing:-.01em">${t}</div>${right ? `<span style="margin-left:auto">${right}</span>` : ""}</div>`;
const pill = (t, bg, fg, fs = 18) => `<span style="display:inline-flex;align-items:center;height:${fs * 2}px;padding:0 ${fs * 0.8}px;border-radius:999px;background:${bg};color:${fg};font:600 ${fs}px Outfit;white-space:nowrap">${t}</span>`;
const check = (on = true, s = 34) => `<span style="width:${s}px;height:${s}px;border-radius:${s * 0.3}px;flex-shrink:0;display:grid;place-items:center;background:${on ? OK : "#e3e7ef"}">${on ? icon("check", { size: s * 0.56, color: "#fff", stroke: 3 }) : ""}</span>`;
const row = (left, right = "", pad = 18, first = false) => `<div class="row" style="gap:18px;padding:${pad}px 0;${first ? "" : `border-top:1.5px solid ${LINE}`};font-size:24px">${left}${right ? `<span style="margin-left:auto">${right}</span>` : ""}</div>`;
const bar = (w, c = "#e3e7ef", h = 14) => `<div style="height:${h}px;width:${w}px;border-radius:${h / 2}px;background:${c}"></div>`;
const glassCard = (html, style, pad = "22px 26px") => `<div style="position:absolute;${style};padding:${pad};border-radius:26px;background:linear-gradient(150deg,rgb(255 255 255/.2),rgb(255 255 255/.07));backdrop-filter:blur(18px);box-shadow:inset 0 0 0 1px rgb(255 255 255/.3),0 30px 60px -30px rgb(0 6 26/.7);color:#fff;font-family:Outfit">${html}</div>`;

/* Kapak iskeleti: sol üstte kategori + konu kartı, sağda görsel */
function cover(cat, topic, ic, body) {
  const [t, acc] = CAT[cat];
  ACC = acc;
  const head = floatCard(`<div class="row" style="gap:18px">${chip(ic, 64)}<div><div style="font-size:17px;font-weight:600;letter-spacing:.1em;color:${ACC}">${cat.toLocaleUpperCase("tr-TR")}</div><div style="font-size:36px;font-weight:600;letter-spacing:-.02em;line-height:1.12;margin-top:4px">${topic}</div></div></div>`, "left:72px;top:72px;width:620px;border-radius:30px", "26px 30px");
  return page({ w: 1600, h: 900, bg: themeBg(t), body: `${glow(260, 200, 1300, 760)}<div id="comp" style="position:absolute;inset:0">${body}</div>${head}${grainLayer(0.05)}<script>${FIT}</script>` });
}
/* Otomatik yerleşim: x < 700'deki öğeler başlık kartının altındaki sol kutuya, kalanlar sağdaki tam boy kutuya
   oranı korunarak sığdırılır ve ortalanır; böylece her kapak 72 px kenar boşluğuyla alanı doldurur */
const FIT = `(() => {
  const root = document.getElementById("comp");
  const mk = () => { const d = document.createElement("div"); d.style.cssText = "position:absolute;left:0;top:0;width:1600px;height:900px;transform-origin:0 0"; root.appendChild(d); return d; };
  const L = mk(), R = mk();
  [...root.children].filter((k) => k !== L && k !== R).forEach((k) => { const r = k.getBoundingClientRect(); (r.left + r.width / 2 < 700 ? L : R).appendChild(k); });
  const place = (g, x, y, w, h, mx) => {
    const rs = [...g.children].filter((c) => !/blur/.test(c.style.filter || "")).map((c) => c.getBoundingClientRect()).filter((r) => r.width && r.height && r.width < 1400);
    if (!rs.length) return;
    const bx = Math.min(...rs.map((r) => r.left)), by = Math.min(...rs.map((r) => r.top));
    const bw = Math.max(...rs.map((r) => r.right)) - bx, bh = Math.max(...rs.map((r) => r.bottom)) - by;
    const s = Math.min(w / bw, h / bh, mx);
    g.style.transform = "translate(" + (x + (w - bw * s) / 2 - bx * s) + "px," + (y + (h - bh * s) / 2 - by * s) + "px) scale(" + s + ")";
  };
  const run = () => { L.style.transform = R.style.transform = ""; place(R, 740, 72, 788, 756, 1.6); place(L, 72, 262, 620, 566, 1.3); };
  run(); document.fonts.ready.then(run);
})();`;
const phoneAt = (screen, x, y, w, rot = 0) => `${floor(x - w * 0.1, y + w * 2.0, w * 1.2, w * 0.22, 0.6)}<div style="position:absolute;left:${x}px;top:${y}px;transform:rotate(${rot}deg);filter:drop-shadow(0 50px 50px rgb(0 6 26/.55))">${iphone(screen, { width: w })}</div>`;
const screen = (html, bg = "#fff") => `<div style="width:390px;height:844px;background:${bg};font-family:Outfit;color:${INK};position:relative;overflow:hidden"><div class="row" style="height:54px;padding:0 30px;justify-content:space-between;font:600 16px Outfit"><span>9:41</span><span class="row" style="gap:6px">${icon("signal", { size: 15, stroke: 2.4 })}${icon("wifi", { size: 15, stroke: 2.4 })}${icon("battery-full", { size: 21, stroke: 2 })}</span></div>${html}</div>`;

/* ---------- 1) Sosyal medya içerik takvimi ---------- */
function takvim() {
  const D = ["Pzt", "Sal", "Çar", "Per", "Cum"];
  const K = { R: ["Reels", "#ffe4ef", "#be185d"], G: ["Gönderi", "#e6f0ff", "#1d4ed8"], S: ["Story", "#fff3e0", "#b45309"], C: ["Carousel", "#e7f7ee", "#15803d"] };
  const W = [["G", "", "R", "S", "C"], ["R", "S", "", "G", "R"], ["C", "G", "S", "", "G"], ["", "R", "G", "C", "S"]];
  return cover("Sosyal Medya", "İçerik takvimi", "calendar-days", card(`${title("calendar-days", "Kasım içerik planı", pill("4 hafta", "#eef2fb", "#3b4763", 16))}
    <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:12px;margin-top:26px">${D.map((d) => `<div style="font-size:19px;color:${MUTED};padding-left:6px">${d}</div>`).join("")}
    ${W.flat().map((k) => `<div style="height:104px;border-radius:18px;background:${k ? K[k][1] : "#f5f7fb"};padding:14px;display:flex;flex-direction:column;justify-content:space-between">${k ? `<span style="font:600 19px Outfit;color:${K[k][2]}">${K[k][0]}</span>${bar(70, K[k][2] + "33", 10)}` : ""}</div>`).join("")}</div>`, "left:740px;top:96px;width:788px")
    + glassCard(`<div style="font-size:20px;opacity:.8">Bu hafta</div><div class="row" style="gap:26px;margin-top:10px">${[["5", "gönderi"], ["3", "Reels"], ["7", "story"]].map(([n, l]) => `<div><div style="font-size:46px;font-weight:600;line-height:1">${n}</div><div style="font-size:19px;opacity:.8;margin-top:4px">${l}</div></div>`).join("")}</div>`, "left:72px;top:600px;width:620px", "26px 30px"));
}

/* ---------- 2) Web sitesi yaptırmadan önce 6 soru ---------- */
function altiSoru() {
  const Q = [["target", "Hedef"], ["file-text", "İçerik"], ["settings", "Yönetim"], ["smartphone", "Mobil deneyim"], ["chart-line", "Ölçüm"], ["wrench", "Bakım"]];
  return cover("Web ve Teknoloji", "Başlamadan önce 6 soru", "list-checks", `${floor(560, 820, 1000, 90)}
    <div style="position:absolute;left:640px;top:250px;perspective:2600px">${macbook(`<div style="width:1440px;height:900px;background:#f3f6fb;padding:60px 80px;font-family:Outfit"><div class="row" style="gap:20px">${bar(160, "#cfd8e8", 26)}<span style="margin-left:auto" class="row">${[90, 90, 90, 140].map((w, i) => `<span style="margin-left:26px">${bar(w, i === 3 ? "#1f7fc4" : "#d7dfec", 22)}</span>`).join("")}</span></div><div style="margin-top:120px">${bar(760, "#0c1a3a", 56)}<div style="height:22px"></div>${bar(560, "#0c1a3a", 56)}<div style="height:40px"></div>${bar(620, "#c9d3e3", 22)}<div style="height:18px"></div>${bar(480, "#c9d3e3", 22)}<div style="height:50px"></div><span class="row" style="gap:20px">${bar(220, "#1f7fc4", 64)}${bar(200, "#dfe6f1", 64)}</span></div></div>`, { width: 880, style: "transform:rotateY(-12deg) rotateX(4deg);transform-origin:100% 50%" })}</div>`
    + card(`<div style="font-size:21px;font-weight:600;letter-spacing:.08em;color:${MUTED}">NETLEŞTİRİLECEKLER</div>${Q.map(([ic, t], i) => row(`${chip(ic, 46)}<span style="font-weight:500">${t}</span>`, check(i < 4, 32), 14, i === 0)).join("")}`, "left:72px;top:300px;width:520px", "26px 30px 16px"));
}

/* ---------- 3) Google Ads dönüşüm takibi ve GA4 ---------- */
function donusum() {
  const step = (ic, t, d, x, y, hi = false) => `<div style="position:absolute;left:${x}px;top:${y}px;width:300px;padding:24px 26px;border-radius:26px;font-family:Outfit;${hi ? `background:linear-gradient(160deg,#4f8ff0,#1747a8);color:#fff;box-shadow:0 0 0 1px rgb(255 255 255/.25),0 40px 70px -30px rgb(0 6 26/.8)` : `background:#fff;color:${INK};box-shadow:0 0 0 1px rgb(255 255 255/.6),0 40px 70px -28px rgb(1 12 40/.55)`}">${chip(ic, 54, hi ? "#fff" : ACC, hi ? "rgb(255 255 255/.18)" : null)}<div style="font-size:28px;font-weight:600;margin-top:16px">${t}</div><div style="font-size:19px;margin-top:4px;${hi ? "opacity:.85" : `color:${MUTED}`}">${d}</div></div>`;
  return cover("Dijital Pazarlama", "Dönüşüm takibi ve GA4", "chart-line", `
    <svg width="1600" height="900" style="position:absolute;inset:0"><path d="M 870 330 L 1010 330 M 1310 330 L 1340 330" stroke="rgb(159 210 255/.7)" stroke-width="3" stroke-dasharray="8 9" fill="none"/></svg>
    ${step("mouse-pointer-click", "Reklam tıklaması", "Google Ads", 740, 230)}${step("globe", "Site ziyareti", "Google etiketi", 1080, 230)}
    ${card(`${title("target", "Dönüşüm işlemleri")}${[["Form gönderimi", "Birincil", "#e7f7ee", "#15803d"], ["Telefon araması", "Birincil", "#e7f7ee", "#15803d"], ["Bültene kayıt", "İkincil", "#eef2fb", "#3b4763"]].map(([t, k, bg, fg], i) => row(`<span style="width:12px;height:12px;border-radius:50%;background:${ACC}"></span>${t}`, pill(k, bg, fg, 17), 18, i === 0)).join("")}<div class="row" style="gap:12px;margin-top:14px;font-size:20px;color:#15803d">${icon("shield-check", { size: 24, color: "#15803d", stroke: 2 })}İzin modu etkin</div>`, "left:740px;top:520px;width:640px", "28px 32px 24px")}
    ${glassCard(`<div class="row" style="gap:14px">${icon("activity", { size: 30, color: "#fff", stroke: 2 })}<div><div style="font-size:24px;font-weight:600">GA4 temel olaylar</div><div style="font-size:19px;opacity:.85;margin-top:2px">page_view · generate_lead · purchase</div></div></div>`, "left:72px;top:330px;width:620px")}`);
}

/* ---------- 4) Teknik SEO ve Core Web Vitals ---------- */
function cwv() {
  const gauge = (label, val, lim, pct) => {
    const r = 70, C = 2 * Math.PI * r;
    return `<div style="text-align:center"><div style="position:relative;width:180px;height:180px;margin:0 auto"><svg width="180" height="180" style="transform:rotate(-90deg)"><circle cx="90" cy="90" r="${r}" fill="none" stroke="#e7f7ee" stroke-width="16"/><circle cx="90" cy="90" r="${r}" fill="none" stroke="${OK}" stroke-width="16" stroke-linecap="round" stroke-dasharray="${(C * pct).toFixed(1)} ${C.toFixed(1)}"/></svg><div style="position:absolute;inset:0;display:grid;place-items:center;font:600 34px Outfit;color:${INK}">${val}</div></div><div style="font-size:30px;font-weight:600;margin-top:12px">${label}</div><div style="font-size:19px;color:${MUTED};margin-top:2px">iyi: ${lim}</div></div>`;
  };
  return cover("SEO", "Teknik SEO kontrol listesi", "gauge", card(`${title("gauge", "Core Web Vitals", pill("İyi", "#e7f7ee", "#15803d", 17))}<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin-top:30px">${gauge("LCP", "1,9 sn", "≤ 2,5 sn", 0.76)}${gauge("INP", "140 ms", "≤ 200 ms", 0.7)}${gauge("CLS", "0,04", "≤ 0,1", 0.4)}</div>`, "left:760px;top:96px;width:768px")
    + card(`${["Tarama ve dizine ekleme", "Site haritası", "Kanonik adresler", "Mobil uyum"].map((t, i) => row(`${check(true, 32)}${t}`, "", 15, i === 0)).join("")}`, "left:72px;top:330px;width:620px", "16px 30px")
    + glassCard(`<div class="row" style="gap:14px;font-size:22px">${icon("search-check", { size: 28, color: "#fff", stroke: 2 })}Sayfa deneyimi ve tarama birlikte kontrol edilir</div>`, "left:760px;top:640px;width:768px"));
}

/* ---------- 5) Marka tescil süreci ---------- */
function tescil() {
  const S = [["search", "Ön araştırma", "Benzer markalar ve sınıflar"], ["file-plus", "Başvuru", "TÜRKPATENT, Nice sınıfları"], ["newspaper", "Bültende yayın", "2 ay itiraz süresi"], ["badge-check", "Tescil", "10 yıl koruma, yenilenebilir"]];
  return cover("Marka ve Tasarım", "Marka tescil süreci", "badge-check", card(`${S.map(([ic, t, d], i) => `<div class="row" style="gap:22px;align-items:flex-start;position:relative;padding-top:${i ? 26 : 0}px">${i < S.length - 1 ? `<span style="position:absolute;left:31px;top:${i ? 92 : 66}px;width:3px;height:52px;background:#dfe3fb"></span>` : ""}${chip(ic, 64, i === 3 ? "#fff" : ACC, i === 3 ? `linear-gradient(150deg,#6d78f2,#3530a8)` : null)}<div><div style="font-size:30px;font-weight:600">${t}</div><div style="font-size:21px;color:${MUTED};margin-top:2px">${d}</div></div></div>`).join("")}`, "left:780px;top:96px;width:620px", "34px 36px")
    + `<div style="position:absolute;left:250px;top:400px;width:300px;height:300px;border-radius:50%;background:linear-gradient(160deg,#fff,#e8e9ff);display:grid;place-items:center;box-shadow:0 0 0 14px rgb(255 255 255/.12),0 60px 90px -30px rgb(0 6 26/.8);font:600 170px/1 Outfit;color:#3530a8">®</div>`);
}

/* ---------- 6) Pazaryeri mi kendi site mi ---------- */
function pazaryeri() {
  const R = [["Hazır trafik", true, false], ["Müşteri verisi", false, true], ["Marka kontrolü", false, true], ["Komisyonsuz satış", false, true], ["Hızlı başlangıç", true, false]];
  const mark = (on) => (on ? check(true, 36) : `<span style="width:36px;height:36px;border-radius:11px;background:#f1f3f8;display:grid;place-items:center">${icon("minus", { size: 20, color: "#9aa2b8", stroke: 3 })}</span>`);
  return cover("E-Ticaret", "Pazaryeri mi, kendi site mi?", "scale", card(`<div style="display:grid;grid-template-columns:1fr 150px 150px;align-items:center;font-size:24px"><span></span>${[["store", "Pazaryeri"], ["globe", "Kendi site"]].map(([ic, t]) => `<div style="display:grid;justify-items:center;gap:8px">${chip(ic, 52)}<span style="font-weight:600;font-size:21px">${t}</span></div>`).join("")}
    ${R.map(([t, a, b]) => `<div style="padding:18px 0;border-top:1.5px solid ${LINE};margin-top:${0}px">${t}</div><div style="display:grid;place-items:center;border-top:1.5px solid ${LINE};height:100%">${mark(a)}</div><div style="display:grid;place-items:center;border-top:1.5px solid ${LINE};height:100%">${mark(b)}</div>`).join("")}</div>`, "left:760px;top:96px;width:740px", "30px 34px 14px")
    + glassCard(`<div style="font-size:22px;line-height:1.45">Çoğu marka için cevap ikisi birden: pazaryeri satış getirir, kendi site müşteriyi sizde tutar.</div>`, "left:72px;top:330px;width:600px", "26px 30px"));
}

/* ---------- 7) Meta reklamlarında kreatif test ---------- */
function kreatif() {
  const ad = (k, art, x, win) => `<div style="position:absolute;left:${x}px;top:150px;width:330px;border-radius:28px;background:#fff;overflow:hidden;font-family:Outfit;color:${INK};box-shadow:0 0 0 ${win ? 4 : 1}px ${win ? OK : "rgb(255 255 255/.6)"},0 50px 80px -30px rgb(0 6 26/.75)">
    <div class="row" style="gap:12px;padding:18px 20px"><span style="width:40px;height:40px;border-radius:50%;background:#e3e7ef"></span><div>${bar(120, "#c9d3e3", 12)}<div style="height:8px"></div>${bar(70, "#e3e7ef", 10)}</div>${pill(k, win ? "#e7f7ee" : "#eef2fb", win ? "#15803d" : "#3b4763", 18)}</div>
    <div style="height:330px;${art}"></div><div style="padding:18px 20px">${bar(240, "#d7dfec", 12)}<div style="height:14px"></div><div style="height:46px;border-radius:12px;background:${win ? "#2a6aca" : "#e9eef6"}"></div></div></div>`;
  return cover("Dijital Pazarlama", "Kreatif test", "flask-conical", `${ad("A", "background:radial-gradient(60% 60% at 30% 30%,#ffd2a8,transparent 70%),linear-gradient(150deg,#ff9a62,#e8452d)", 720, false)}${ad("B", "background:radial-gradient(60% 60% at 70% 30%,#c9d0ff,transparent 70%),linear-gradient(150deg,#7b8cff,#3646c0)", 1100, true)}
    ${card(`<div style="font-size:22px;color:${MUTED}">Sonuç başına maliyet</div>${[["A", 0.92, "#f3b49a"], ["B", 0.58, OK]].map(([k, w, c]) => `<div class="row" style="gap:16px;margin-top:18px"><span style="font:600 24px Outfit;width:24px">${k}</span><div style="flex:1;height:22px;border-radius:11px;background:#f1f3f8"><div style="height:22px;width:${w * 100}%;border-radius:11px;background:${c}"></div></div></div>`).join("")}<div class="row" style="gap:12px;margin-top:22px;font-size:22px;color:#15803d;font-weight:600">${icon("trophy", { size: 26, color: "#15803d", stroke: 2 })}B daha düşük maliyetle kazandı</div>`, "left:72px;top:330px;width:560px", "28px 32px")}`);
}

/* ---------- 8) Mobil uygulama mı, mobil uyumlu site mi ---------- */
function uygulamaMiSite() {
  const appGrid = screen(`<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:22px;padding:40px 26px">${["#ff6a3d", "#4351d6", "#1e9c88", "#e8833a", "#7b8cff", "#d9467a", "#12419b", "#16a34a", "#0d8aa6", "#ffb020", "#7c5cff", "#2f9be0"].map((c) => `<span style="aspect-ratio:1;border-radius:22px;background:linear-gradient(150deg,${c}cc,${c})"></span>`).join("")}</div>`, "linear-gradient(180deg,#2a2f45,#141826)");
  const site = screen(`<div style="margin:6px 16px;height:44px;border-radius:14px;background:#eef2f8;display:flex;align-items:center;padding:0 16px;color:#7a849b;font-size:15px">${icon("lock", { size: 13, color: "#7a849b", stroke: 2.4 })}<span style="margin-left:8px">alanadiniz.com</span></div><div style="padding:30px 24px">${bar(300, INK, 30)}<div style="height:14px"></div>${bar(220, INK, 30)}<div style="height:26px"></div>${bar(320, "#d7dfec", 14)}<div style="height:12px"></div>${bar(260, "#d7dfec", 14)}<div style="height:30px"></div><div style="height:220px;border-radius:22px;background:linear-gradient(150deg,#9be0ff,#1f7fc4)"></div><div style="height:24px"></div><div style="height:58px;border-radius:16px;background:#1f7fc4"></div></div>`);
  return cover("Web ve Teknoloji", "Uygulama mı, mobil site mi?", "smartphone", `${phoneAt(appGrid, 780, 120, 300, -4)}${phoneAt(site, 1150, 150, 300, 4)}
    ${glassCard(`<div style="font-size:24px;font-weight:600">Uygulama</div><div style="font-size:19px;opacity:.85;margin-top:2px">Bildirim, cihaz özellikleri, mağaza</div>`, "left:740px;top:770px;width:340px", "18px 22px")}
    ${glassCard(`<div style="font-size:24px;font-weight:600">Mobil uyumlu site</div><div style="font-size:19px;opacity:.85;margin-top:2px">Aramada bulunur, tek bakım</div>`, "left:1130px;top:770px;width:360px", "18px 22px")}
    ${card(`${[["Maliyet", "Site"], ["Bulunabilirlik", "Site"], ["Cihaz özellikleri", "Uygulama"], ["Sadakat ve bildirim", "Uygulama"]].map(([t, w], i) => row(t, pill(w, w === "Site" ? "#e6f4fb" : "#eceeff", w === "Site" ? "#1f7fc4" : "#4b5be0", 17), 16, i === 0)).join("")}`, "left:72px;top:330px;width:560px", "14px 30px")}`);
}

/* ---------- 9) KOBİ'ler için kurumsal kimlik ---------- */
function kimlik() {
  const sw = [["#14213d", "Lacivert"], ["#fca311", "Amber"], ["#e5e5e5", "Gri"], ["#ffffff", "Beyaz"]];
  return cover("Marka ve Tasarım", "Kurumsal kimlik", "palette", card(`<div style="display:grid;grid-template-columns:300px 1fr;gap:30px">
      <div style="height:300px;border-radius:24px;background:#14213d;display:grid;place-items:center"><div style="width:150px;height:150px;border-radius:44px;background:#fca311;display:grid;place-items:center;font:700 96px/1 Outfit;color:#14213d">K</div></div>
      <div><div style="font-size:21px;color:${MUTED}">Renkler</div><div class="row" style="gap:14px;margin-top:12px">${sw.map(([c, n]) => `<div><span style="display:block;width:86px;height:86px;border-radius:20px;background:${c};box-shadow:inset 0 0 0 1.5px #e3e7ef"></span><div style="font-size:16px;color:${MUTED};margin-top:6px">${c.toUpperCase()}</div></div>`).join("")}</div>
      <div style="font-size:21px;color:${MUTED};margin-top:26px">Yazı tipi</div><div class="row" style="gap:20px;margin-top:4px;align-items:baseline"><span style="font:600 76px/1 Outfit">Aa</span><span style="font-size:24px">Outfit · 400 / 600</span></div></div></div>
    <div class="row" style="gap:12px;margin-top:28px;flex-wrap:wrap">${["Sade", "Güven veren", "Samimi", "Net"].map((t) => pill(t, "#eef0ff", "#4b5be0", 19)).join("")}<span style="margin-left:auto;font-size:20px;color:${MUTED}">Ses tonu</span></div><div style="font-size:21px;color:${MUTED};margin-top:28px">Uygulama alanları</div><div class="row" style="gap:14px;margin-top:12px">${[["contact", "Kartvizit"], ["share-2", "Sosyal medya"], ["package", "Ambalaj"], ["signpost", "Tabela"]].map(([ic, t]) => `<div style="flex:1;padding:16px;border-radius:18px;background:#f5f7fb;display:grid;justify-items:center;gap:8px">${icon(ic, { size: 30, color: ACC, stroke: 2 })}<span style="font-size:18px">${t}</span></div>`).join("")}</div>`, "left:740px;top:110px;width:788px", "34px 36px")
    + glassCard(`<div class="row" style="gap:14px">${icon("book-open", { size: 30, color: "#fff", stroke: 2 })}<div><div style="font-size:24px;font-weight:600">Kullanım kılavuzu</div><div style="font-size:19px;opacity:.85">Logo, renk, yazı ve ses tonu tek dosyada</div></div></div>`, "left:72px;top:330px;width:620px"));
}

/* ---------- 10) AI Overviews çağında SEO ---------- */
function aiOzet() {
  return cover("SEO", "Yapay zekâ aramada görünmek", "sparkles", card(`<div class="row" style="gap:14px;height:66px;padding:0 24px;border-radius:999px;background:#f3f6fb;font-size:24px;color:#3b4763">${icon("search", { size: 26, color: "#3b4763", stroke: 2.2 })}kurumsal web sitesi ne kadar sürer</div>
    <div style="margin-top:24px;padding:26px 28px;border-radius:24px;background:linear-gradient(160deg,#eef7ff,#e7f0ff)"><div class="row" style="gap:12px;font:600 22px Outfit;color:#1460a8">${icon("sparkles", { size: 26, color: "#1460a8", stroke: 2 })}Yapay zekâ özeti</div><div style="margin-top:16px">${bar(600, "#b9cde6", 16)}<div style="height:12px"></div>${bar(560, "#b9cde6", 16)}<div style="height:12px"></div>${bar(380, "#b9cde6", 16)}</div><div class="row" style="gap:12px;margin-top:22px">${["Kaynak 1", "Sizin siteniz", "Kaynak 3"].map((t, i) => pill(t, i === 1 ? "#1489b8" : "#fff", i === 1 ? "#fff" : "#3b4763", 18)).join("")}</div></div>
    ${[0, 1, 2].map((i) => `<div style="margin-top:24px">${bar(300, "#1a0dab55", 18)}<div style="height:10px"></div>${bar(620, "#e3e7ef", 13)}</div>`).join("")}`, "left:740px;top:96px;width:788px", "30px 32px")
    + glassCard(`<div style="font-size:22px;line-height:1.45">Özetlerde kaynak gösterilmenin yolu yine net, güvenilir ve iyi yapılandırılmış içerikten geçer.</div>`, "left:72px;top:330px;width:600px", "26px 30px"));
}

/* ---------- 11) Arama terimleri ve negatif anahtar kelimeler ---------- */
function negatif() {
  const R = [["kurumsal web sitesi fiyat", "Ekle", false], ["web sitesi yaptırma", "Ekle", false], ["ücretsiz web sitesi", "Negatif", true], ["web tasarım kursu", "Negatif", true], ["e-ticaret sitesi kurulumu", "Ekle", false], ["web tasarımcı iş ilanı", "Negatif", true], ["kurumsal site örnekleri", "Ekle", false]];
  return cover("Dijital Pazarlama", "Negatif anahtar kelimeler", "filter-x", card(`${title("list-filter", "Arama terimleri")}${R.map(([t, a, neg], i) => row(`<span style="${neg ? "text-decoration:line-through;color:#9aa2b8" : ""}">${t}</span>`, pill(neg ? "− Negatif" : "+ Anahtar kelime", neg ? "#fdecec" : "#e7f7ee", neg ? "#b42318" : "#15803d", 17), 18, i === 0)).join("")}`, "left:740px;top:96px;width:788px", "30px 34px 18px")
    + card(`<div style="font-size:21px;color:${MUTED}">Negatif liste</div><div class="row" style="gap:10px;margin-top:14px;flex-wrap:wrap">${["[ücretsiz]", "\"kurs\"", "staj", "iş ilanı"].map((t) => pill(t, "#fdecec", "#b42318", 19)).join("")}</div>`, "left:72px;top:330px;width:560px", "26px 30px"));
}

/* ---------- 12) Özel yazılım ihtiyaç analizi ve kapsam ---------- */
function kapsam() {
  const col = (h, items, on) => `<div style="flex:1;padding:22px;border-radius:24px;background:${on ? "#eef0ff" : "#f5f7fb"}"><div style="font-size:22px;font-weight:600;color:${on ? "#4b5be0" : MUTED}">${h}</div>${items.map((t) => `<div style="margin-top:14px;padding:16px 18px;border-radius:16px;background:#fff;font-size:21px;box-shadow:0 6px 16px -12px rgb(12 26 58/.3)">${t}</div>`).join("")}</div>`;
  return cover("Yazılım", "İhtiyaç analizi ve kapsam", "clipboard-list", card(`${title("layers", "Kapsam panosu")}<div class="row" style="gap:18px;margin-top:24px;align-items:stretch">${col("İlk sürüm", ["Teklif oluşturma", "Müşteri kartı", "Muhasebe aktarımı", "Yetki ve roller"], true)}${col("Sonraki sürüm", ["Stok takibi", "Mobil onay", "Raporlar", "Yapay zekâ özeti"], false)}</div>`, "left:740px;top:96px;width:788px", "30px 32px")
    + card(`${[["plug", "Entegrasyonlar"], ["shield-check", "KVKK"], ["key-round", "Kaynak kodu sahipliği"]].map(([ic, t], i) => row(`${chip(ic, 46)}${t}`, check(true, 30), 15, i === 0)).join("")}`, "left:72px;top:330px;width:560px", "16px 30px"));
}

/* ---------- 13) Topluluk yönetimi ---------- */
function topluluk() {
  const msg = (who, txt, tag, bg, fg) => `<div style="margin:12px 16px 0;padding:16px;border-radius:20px;background:#f6f7fa"><div class="row" style="gap:10px"><span style="width:34px;height:34px;border-radius:50%;background:#d7dfec"></span><b style="font-size:15px">${who}</b><span style="margin-left:auto">${pill(tag, bg, fg, 13)}</span></div><div style="font-size:16px;margin-top:8px;line-height:1.35">${txt}</div></div>`;
  const s = screen(`<div style="padding:10px 20px 4px;font:600 26px Outfit">Gelen kutusu</div>${msg("Ziyaretçi", "Siparişim ne zaman kargoya verilir?", "Soru", "#e6f0ff", "#1d4ed8")}${msg("Ziyaretçi", "Ürün hasarlı geldi, değişim istiyorum.", "Şikâyet", "#fdecec", "#b42318")}${msg("Ziyaretçi", "Ekibinize çok teşekkürler!", "Teşekkür", "#e7f7ee", "#15803d")}${msg("Ziyaretçi", "Mağazanız hafta sonu açık mı?", "Soru", "#e6f0ff", "#1d4ed8")}`);
  return cover("Sosyal Medya", "Topluluk yönetimi", "messages-square", `${phoneAt(s, 800, 110, 320, -3)}
    ${card(`<div class="row" style="gap:12px;font-size:21px;color:${MUTED}">${icon("message-square-reply", { size: 24, color: ACC, stroke: 2 })}Hazır yanıt</div><div style="font-size:23px;line-height:1.45;margin-top:12px">Yaşadığınız sorun için üzgünüz. Sipariş numaranızı mesajla iletirseniz hemen ilgileniyoruz.</div>`, "left:1150px;top:300px;width:400px", "26px 28px")}
    ${glassCard(`<div style="font-size:22px;line-height:1.45">Şikâyete herkese açık alanda kısa yanıt, ayrıntıya özel mesajda devam.</div>`, "left:72px;top:330px;width:600px", "26px 30px")}`);
}

/* ---------- 14) Yerel SEO: İşletme Profili ---------- */
function yerel() {
  const map = `<div style="height:400px;border-radius:24px;overflow:hidden;position:relative;background:#e8eef5"><svg width="100%" height="400" style="position:absolute;inset:0"><path d="M0 200 C 200 160, 380 260, 788 190" stroke="#fff" stroke-width="26" fill="none"/><path d="M260 0 L 340 300" stroke="#fff" stroke-width="20"/><path d="M560 0 C 520 120, 640 200, 600 300" stroke="#fff" stroke-width="16" fill="none"/><rect x="40" y="30" width="160" height="100" rx="14" fill="#d5ecd9"/><rect x="620" y="40" width="140" height="90" rx="14" fill="#d5ecd9"/></svg>${[[180, 220, false], [470, 120, true], [640, 230, false]].map(([x, y, me]) => `<div style="position:absolute;left:${x}px;top:${y - 60}px">${icon("map-pin", { size: me ? 66 : 44, color: me ? "#dc2626" : "#7a849b", stroke: 2 })}</div>`).join("")}</div>`;
  return cover("SEO", "Yerel SEO ve İşletme Profili", "map-pin", card(`${map}<div class="row" style="margin-top:22px;gap:16px"><div><div style="font-size:30px;font-weight:600">İşletmeniz</div><div style="font-size:20px;color:${MUTED};margin-top:2px">Kategori · Açık, 19:00'da kapanıyor</div></div></div><div class="row" style="gap:12px;margin-top:20px">${[["navigation", "Yol tarifi"], ["phone", "Ara"], ["globe", "Web sitesi"]].map(([ic, t], i) => `<span class="row" style="gap:10px;height:56px;padding:0 22px;border-radius:999px;font:600 20px Outfit;${i ? "background:#eef6fb;color:#1489b8" : "background:#1489b8;color:#fff"}">${icon(ic, { size: 21, color: i ? "#1489b8" : "#fff", stroke: 2.2 })}${t}</span>`).join("")}</div>`, "left:740px;top:96px;width:788px", "26px")
    + card(`<div style="font-size:21px;color:${MUTED}">Yerel sıralamanın üç ölçütü</div>${["Alaka", "Mesafe", "Öne çıkma"].map((t, i) => row(`${chip(["target", "ruler", "star"][i], 44)}${t}`, "", 14, i === 0)).join("")}`, "left:72px;top:330px;width:560px", "24px 30px 12px"));
}

/* ---------- 15) Baskıya hazır dosya ---------- */
function baski() {
  return cover("Marka ve Tasarım", "Baskıya hazır dosya", "printer", `<div style="position:absolute;left:760px;top:120px;width:700px;height:460px;border-radius:10px;background:#fff;box-shadow:0 60px 100px -40px rgb(1 12 40/.8)">
      <div style="position:absolute;inset:34px;border:3px dashed #e5484d;border-radius:4px"></div><div style="position:absolute;inset:68px;border:2px solid #9aa2b8"></div>
      <div style="position:absolute;inset:68px;background:linear-gradient(150deg,#3530a8,#6d78f2);display:grid;place-items:center"><div style="text-align:center;color:#fff;font-family:Outfit"><div style="font:700 64px/1 Outfit">Kartvizit</div><div style="font-size:24px;opacity:.85;margin-top:10px">85 × 55 mm</div></div></div>
      ${[["Taşma payı 3 mm", "#e5484d", 36, -46], ["Kesim çizgisi", "#7a849b", 420, -46]].map(([t, c, x, y]) => `<div style="position:absolute;left:${x}px;top:${y}px;font:600 20px Outfit;color:#fff" class="row"><span style="width:14px;height:14px;border-radius:4px;background:${c};margin-right:8px"></span>${t}</div>`).join("")}</div>
    ${card(`<div class="row" style="gap:14px">${["#00a0e3", "#e6007e", "#ffed00", "#1d1d1b"].map((c, i) => `<div style="text-align:center"><span style="display:block;width:74px;height:74px;border-radius:50%;background:${c}"></span><div style="font:600 18px Outfit;margin-top:6px">${"CMYK"[i]}</div></div>`).join("")}</div>`, "left:760px;top:640px;width:400px", "22px 26px")}
    ${card(`${[["300 dpi", "görsel çözünürlüğü"], ["PDF/X", "dışa aktarma"]].map(([a, b], i) => row(`<b style="font-weight:600">${a}</b><span style="color:${MUTED}">${b}</span>`, "", 12, i === 0)).join("")}`, "left:1190px;top:640px;width:340px", "14px 26px")}
    ${glassCard(`<div style="font-size:22px;line-height:1.45">Matbaaya gitmeden önce renk, çözünürlük ve taşma payını kontrol edin.</div>`, "left:72px;top:330px;width:600px", "26px 30px")}`);
}

/* ---------- 16) Mobil uygulamada gizlilik ve izinler ---------- */
function izinler() {
  const s = screen(`<div style="position:absolute;inset:54px 0 0;background:linear-gradient(180deg,#eef0ff,#dfe3fb)"></div><div style="position:absolute;left:30px;right:30px;top:280px;border-radius:26px;background:rgb(250 250 252/.97);text-align:center;padding:28px 22px 0;box-shadow:0 30px 60px -20px rgb(12 26 58/.4)"><div style="width:64px;height:64px;border-radius:18px;margin:0 auto;background:#4b5be0;display:grid;place-items:center">${icon("map-pin", { size: 32, color: "#fff", stroke: 2 })}</div><div style="font:600 20px Outfit;margin-top:16px;line-height:1.3">Uygulama konumunuzu kullansın mı?</div><div style="font-size:15px;color:#6b7590;margin-top:8px;line-height:1.4">Size en yakın şubeyi göstermek için</div><div style="margin-top:22px;border-top:1px solid #e3e7ef">${["Uygulamayı kullanırken", "Bir kez izin ver", "İzin verme"].map((t, i) => `<div style="padding:15px;font:${i ? 500 : 600} 17px Outfit;color:#2a6aca;${i ? "border-top:1px solid #e3e7ef" : ""}">${t}</div>`).join("")}</div></div>`);
  return cover("Mobil", "Gizlilik ve izinler", "shield-check", `${phoneAt(s, 780, 110, 320, -3)}
    ${card(`${title("file-lock", "Gizlilik beyanı")}${[["Konum", "Uygulama işlevi"], ["E-posta", "Hesap"], ["Kullanım verisi", "Analiz"]].map(([a, b], i) => row(a, pill(b, "#eef0ff", "#4b5be0", 16), 14, i === 0)).join("")}<div class="row" style="gap:10px;margin-top:12px;font-size:20px;color:#15803d">${icon("user-x", { size: 22, color: "#15803d", stroke: 2 })}Uygulama içinden hesap silme</div>`, "left:1150px;top:250px;width:390px", "26px 28px 22px")}
    ${glassCard(`<div style="font-size:22px;line-height:1.45">İzin, ihtiyaç duyulan anda ve nedeniyle birlikte istenir.</div>`, "left:72px;top:330px;width:600px", "26px 30px")}`);
}

/* ---------- 17) E-ticarette ürün sayfası ---------- */
function urunSayfasi() {
  return cover("E-Ticaret", "Ürün sayfası nasıl hazırlanır?", "shopping-bag", card(`<div style="display:grid;grid-template-columns:330px 1fr;gap:30px">
      <div><div style="height:330px;border-radius:22px;background:linear-gradient(160deg,#eef6f8,#d5eef4);display:grid;place-items:center">${icon("package", { size: 130, color: "#7fb8c6", stroke: 1.2 })}</div><div class="row" style="gap:10px;margin-top:12px">${[0, 1, 2, 3].map((i) => `<span style="flex:1;height:66px;border-radius:14px;background:#f1f6f8;box-shadow:${i ? "inset 0 0 0 1px #d8e6ea" : `inset 0 0 0 3px ${ACC}`}"></span>`).join("")}</div></div>
      <div>${bar(380, INK, 26)}<div style="height:12px"></div>${bar(260, INK, 26)}<div class="row" style="gap:10px;margin-top:26px">${["S", "M", "L", "XL"].map((v, i) => `<span style="width:60px;height:50px;border-radius:12px;display:grid;place-items:center;font:600 19px Outfit;${i === 1 ? `box-shadow:inset 0 0 0 3px ${ACC};color:${ACC}` : "box-shadow:inset 0 0 0 1.5px #d6dce6;color:#3b4763"}">${v}</span>`).join("")}</div>
      <div style="font:600 40px Outfit;margin-top:26px">₺1.249</div><div style="height:62px;border-radius:16px;background:${ACC};margin-top:20px;display:grid;place-items:center;color:#fff;font:600 22px Outfit">Sepete ekle</div>
      <div class="row" style="gap:10px;margin-top:16px;font-size:18px;color:${MUTED}">${icon("truck", { size: 20, color: MUTED, stroke: 2 })}Kargo ve iade bilgisi</div></div></div><div style="margin-top:26px;padding-top:22px;border-top:1.5px solid ${LINE}"><div class="row" style="justify-content:space-between;font-size:21px;font-weight:600"><span>Ürün açıklaması</span><span class="row" style="gap:10px;font-weight:500;color:${MUTED}">${icon("barcode", { size: 24, color: MUTED, stroke: 2 })}Barkod 8690000000000</span></div><div style="margin-top:16px">${bar(700, "#e3e7ef", 13)}<div style="height:10px"></div>${bar(640, "#e3e7ef", 13)}<div style="height:10px"></div>${bar(420, "#e3e7ef", 13)}</div></div>`, "left:740px;top:96px;width:788px", "30px")
    + card(`${["Anahtar kelimeli başlık", "Çok açılı görseller", "Varyant ve barkod", "Yapılandırılmış veri"].map((t, i) => row(`${check(true, 30)}${t}`, "", 14, i === 0)).join("")}`, "left:72px;top:330px;width:560px", "14px 30px"));
}

/* ---------- 18) Marka, ticaret unvanı ve alan adı ---------- */
function unvan() {
  const c = (ic, t, w, d, x, y) => card(`${chip(ic, 60)}<div style="font-size:30px;font-weight:600;margin-top:18px">${t}</div><div style="font-size:20px;color:${MUTED};margin-top:6px;line-height:1.35">${w}</div><div style="margin-top:18px">${pill(d, "#eef0ff", "#4b5be0", 17)}</div>`, `left:${x}px;top:${y}px;width:360px`, "28px 30px");
  return cover("Marka ve Tasarım", "Marka, unvan ve alan adı", "scale", `${c("building-2", "Ticaret unvanı", "Şirketin resmî adı", "Ticaret sicili", 740, 110)}${c("badge-check", "Marka", "Mal ve hizmetteki ad ve logo", "TÜRKPATENT", 1130, 110)}${c("globe", "Alan adı", "İnternetteki adres", "Kayıt firması", 740, 480)}${c("pen-tool", "Logo telifi", "Tasarımın kendisi", "Telif hakkı", 1130, 480)}
    ${glassCard(`<div style="font-size:22px;line-height:1.45">Biri diğerinin yerine geçmez: dördü ayrı ayrı korunur.</div>`, "left:72px;top:330px;width:600px", "26px 30px")}`);
}

/* ---------- 19) Web erişilebilirliği: WCAG 2.2 ---------- */
function wcag() {
  return cover("Web ve Teknoloji", "Erişilebilirlik: WCAG 2.2", "accessibility", card(`${title("contrast", "Kontrast", pill("AAA", "#e7f7ee", "#15803d", 17))}<div class="row" style="gap:20px;margin-top:22px"><div style="flex:1;height:140px;border-radius:22px;background:#0c1a3a;display:grid;place-items:center;font:600 64px Outfit;color:#fff">Aa</div><div><div style="font:600 54px/1 Outfit">16,1:1</div><div style="font-size:20px;color:${MUTED};margin-top:8px">en az 4,5:1 · AAA 7:1</div></div></div>`, "left:740px;top:96px;width:788px", "28px 32px")
    + card(`${title("image", "Alternatif metin")}<div style="margin-top:16px;padding:16px 20px;border-radius:16px;background:#f5f7fb;font:500 20px ui-monospace,Menlo,monospace;color:#3b4763">alt="Teras ve gün batımı manzarası"</div>`, "left:740px;top:430px;width:500px", "26px 30px")
    + card(`${title("pointer", "Dokunma")}<div class="row" style="gap:14px;margin-top:18px"><span style="width:72px;height:72px;border-radius:16px;box-shadow:inset 0 0 0 3px ${ACC};display:grid;place-items:center;font:600 18px Outfit;color:${ACC}">24px</span><span style="font-size:20px;color:${MUTED};line-height:1.3">en küçük<br>hedef</span></div>`, "left:1268px;top:430px;width:260px", "26px 26px")
    + card(`${title("keyboard", "Klavye ile gezinme")}<div class="row" style="gap:14px;margin-top:18px">${["Tab", "Enter", "Esc"].map((k) => `<span style="height:54px;padding:0 20px;border-radius:12px;background:#f5f7fb;box-shadow:inset 0 -3px 0 #d6dce6;display:grid;place-items:center;font:600 20px Outfit">${k}</span>`).join("")}<span style="margin-left:auto;height:54px;padding:0 22px;border-radius:14px;background:${ACC};color:#fff;display:grid;place-items:center;font:600 20px Outfit;box-shadow:0 0 0 4px #fff,0 0 0 8px #f59e0b">Odak</span></div>`, "left:740px;top:640px;width:788px", "24px 30px"));
}

/* ---------- 20) Reels ve TikTok için kısa video ---------- */
function reels() {
  const s = `<div style="width:390px;height:844px;position:relative;overflow:hidden;font-family:Outfit;color:#fff;background:radial-gradient(70% 50% at 50% 40%,#ffd2a8 0%,transparent 70%),linear-gradient(180deg,#c2603a,#3a1d2e)">
    <div style="position:absolute;left:24px;right:24px;top:110px;bottom:220px;border:3px dashed rgb(255 255 255/.75);border-radius:18px"></div><div style="position:absolute;left:36px;top:122px;font:600 15px Outfit;padding:6px 10px;border-radius:8px;background:rgb(0 0 0/.35)">Güvenli alan</div>
    <div style="position:absolute;left:30px;right:30px;top:420px;text-align:center;font:700 32px/1.2 Outfit;text-shadow:0 2px 10px rgb(0 0 0/.4)">İlk 3 saniyede<br>neden izlemeli?</div>
    <div style="position:absolute;right:16px;bottom:240px;display:grid;gap:22px">${["heart", "message-circle", "send"].map((i) => icon(i, { size: 34, color: "#fff", stroke: 2 })).join("")}</div></div>`;
  return cover("Sosyal Medya", "Reels ve TikTok için kısa video", "clapperboard", `${phoneAt(s, 780, 110, 320, -3)}
    ${card(`${title("film", "Kurgu")}<div style="margin-top:22px;display:grid;gap:12px">${[["Kanca", "0-3 sn", 0.18, "#e8452d"], ["Anlatım", "3-20 sn", 0.62, "#2f7de1"], ["Çağrı", "son 3 sn", 0.2, "#16a34a"]].map(([t, d, w, c]) => `<div><div class="row" style="justify-content:space-between;font-size:20px"><b style="font-weight:600">${t}</b><span style="color:${MUTED}">${d}</span></div><div style="height:16px;border-radius:8px;background:#f1f3f8;margin-top:6px"><div style="height:16px;width:${w * 100}%;border-radius:8px;background:${c}"></div></div></div>`).join("")}</div><div class="row" style="gap:10px;margin-top:20px;font-size:19px;color:${MUTED}">${icon("captions", { size: 22, color: ACC, stroke: 2 })}Altyazı sesi kapalı izleyene de anlatır</div>`, "left:1150px;top:250px;width:390px", "26px 28px")}
    ${glassCard(`<div class="row" style="gap:14px;font-size:22px">${icon("smartphone", { size: 28, color: "#fff", stroke: 2 })}9:16 dikey · 1080 × 1920</div>`, "left:72px;top:330px;width:600px")}`);
}

const ALL = {
  "sosyal-medya-icerik-takvimi-nasil-hazirlanir": takvim,
  "kurumsal-web-sitesi-yaptirmadan-once-sorulacak-6-soru": altiSoru,
  "google-ads-donusum-takibi-ve-ga4-kurulum-rehberi": donusum,
  "2026-teknik-seo-kontrol-listesi-core-web-vitals": cwv,
  "marka-tescil-sureci-adim-adim-turkpatent": tescil,
  "e-ticarette-pazaryeri-mi-kendi-site-mi": pazaryeri,
  "meta-reklamlarinda-kreatif-test-nasil-yapilir": kreatif,
  "mobil-uygulama-mi-mobil-uyumlu-site-mi": uygulamaMiSite,
  "kobiler-icin-kurumsal-kimlik-rehberi": kimlik,
  "yapay-zeka-arama-sonuclari-ai-overviews-caginda-seo": aiOzet,
  "google-ads-arama-terimleri-raporu-negatif-anahtar-kelimeler": negatif,
  "ozel-yazilim-projesi-ihtiyac-analizi-ve-kapsam": kapsam,
  "sosyal-medyada-topluluk-yonetimi-yorum-ve-mesajlar": topluluk,
  "yerel-seo-google-isletme-profili-rehberi": yerel,
  "baskiya-hazir-dosya-nasil-hazirlanir": baski,
  "mobil-uygulamada-gizlilik-izinler-ve-kvkk": izinler,
  "e-ticarette-urun-sayfasi-nasil-hazirlanir": urunSayfasi,
  "marka-ticaret-unvani-ve-alan-adi-farki": unvan,
  "web-sitesi-erisilebilirligi-wcag-temel-kontroller": wcag,
  "reels-ve-tiktok-icin-kisa-video-rehberi": reels,
};
export const blog3Scenes = () => Object.entries(ALL).map(([slug, fn]) => ({ name: `blog3-${slug}`, w: 1600, h: 900, html: fn() }));
