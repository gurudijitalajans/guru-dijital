import { BG, bars, chan, donut, icon, page, ring, tag } from "./lib.mjs";
import { feature, hero, og } from "./compose.mjs";
import { CHANNELS, WEEK, WEEK_L, chatbotDesktop, chatbotMobile, handoffCard } from "./screens-chatbot.mjs";
import { STAGES, crmDesktop, crmMobile, dealCard, trendChart } from "./screens-crm.mjs";
import { cursor } from "./screens-common.mjs";
import { CAP, COLS, capacityRows, gantt, operationDesktop, operationMobile, taskCard } from "./screens-operation.mjs";
import { MODULES, activityRows, businessDesktop, businessMobile, moduleCard, revenueBlock } from "./screens-business.mjs";
import { av } from "./lib.mjs";

const notif = (app, appIcon, title, text, time = "şimdi") => `
  <div class="row" style="gap:10px;font-size:14px;color:#7f8aa3">${appIcon}<span style="font-weight:600;color:#3b4763;letter-spacing:.02em">${app}</span><span style="margin-left:auto">${time}</span></div>
  <div style="font-size:19px;font-weight:600;margin-top:10px">${title}</div>
  <div style="font-size:17px;color:#3b4763;margin-top:3px;line-height:1.4">${text}</div>`;

/* ---------------- Guru Chatbot ---------------- */
const cbD = chatbotDesktop();
const cbM = chatbotMobile();
const chatbot = [
  {
    name: "guru-chatbot-hero", w: 1600, h: 1200,
    html: hero({
      name: "Chatbot", desktop: cbD, mobile: cbM,
      card: notif("WHATSAPP", chan("whatsapp", 26), "Merve Kaya", "Siparişim ne zaman kargoya verilir?") +
        `<div class="row" style="gap:10px;margin-top:16px;padding:12px 14px;border-radius:14px;background:#eaf2ff;color:#12419b;font-size:15.5px;font-weight:500">${icon("sparkles", { size: 17, stroke: 2.2 })}Guru Bot 4 saniyede yanıtladı${icon("check-check", { size: 17, stroke: 2.2, style: "margin-left:auto" })}</div>`,
      cardPos: "left:960px;top:118px;width:520px;padding:22px 24px",
    }),
  },
  {
    name: "guru-chatbot-1", w: 1200, h: 900,
    html: feature({
      name: "Chatbot", desktop: cbD,
      win: { crop: [0, 0, 1130, 900], scale: 0.92, style: "left:64px;top:96px" },
      floats: [
        ["whatsapp", "WHATSAPP", "Merve Kaya", "Teslimat adresini değiştirmek istiyorum", "şimdi"],
        ["instagram", "INSTAGRAM", "Selin Aydın", "Bu ürün stokta var mı?", "2 dk"],
        ["web", "WEB SİTESİ", "Emre Demir", "Fiyat listesi var mı?", "5 dk"],
      ].map(([k, app, who, msg, t], i) => ({
        html: notif(app, chan(k, 26), who, msg, t),
        style: `left:${700 + i * 26}px;top:${236 + i * 158}px;width:430px`,
        pad: "18px 22px",
      })),
    }),
  },
  {
    name: "guru-chatbot-2", w: 1200, h: 900,
    html: feature({
      name: "Chatbot", desktop: cbD, bg: "navy",
      win: { crop: [626, 74, 486, 610], scale: 1.08, style: "left:572px;top:84px" },
      phone: { html: cbM, style: "left:92px;top:104px", width: 330 },
      floats: [{ html: handoffCard({ big: true }), style: "left:470px;top:716px;width:630px", pad: "10px" }],
    }),
  },
  {
    name: "guru-chatbot-3", w: 1200, h: 900,
    html: feature({
      name: "Chatbot", desktop: cbD,
      floats: [
        {
          html: `<div class="h3" style="font-size:21px">Haftalık konuşmalar</div><div class="lbl" style="font-size:15px;margin-top:3px">Son 7 gün · 703 toplam</div>
            <div style="position:relative;margin-top:26px">${bars(WEEK, { w: 576, h: 330, hi: 6, labels: WEEK_L, showVals: true, fs: 15, r: 10, fade: "#d9e8ff" })}</div>`,
          style: "left:72px;top:86px;width:640px", pad: "28px 32px 24px",
        },
        {
          html: `<div class="row" style="gap:10px;font-size:16px;color:#bfe0ff">${icon("timer", { size: 19, color: "#bfe0ff", stroke: 2.1 })}Ort. yanıt süresi</div>
            <div style="font-size:84px;font-weight:600;letter-spacing:-.04em;line-height:1;margin-top:18px">4<span style="font-size:30px;font-weight:500;margin-left:8px;letter-spacing:0;color:#cfe6ff">sn</span></div>
            <div class="row" style="gap:6px;margin-top:20px;display:inline-flex;padding:7px 12px;border-radius:999px;background:rgb(255 255 255/.14);font-size:14.5px;font-weight:500">${icon("trending-up", { size: 15, stroke: 2.4 })}1,2 sn daha hızlı</div>`,
          style: "left:744px;top:86px;width:384px;background:linear-gradient(150deg,#011441,#12419b 60%,#2a6aca);color:#fff", pad: "28px 30px",
        },
        {
          html: `<div class="row" style="gap:22px"><div style="position:relative;width:118px;height:118px">${ring(86, { d: 118, thick: 13 })}<div style="position:absolute;inset:0;display:grid;place-items:center;font-size:28px;font-weight:600;letter-spacing:-.03em">%86</div></div>
            <div><div style="font-size:19px;font-weight:600">Çözüm oranı</div><div class="lbl" style="font-size:14.5px;margin-top:4px;line-height:1.4">Bot'un tek başına<br>sonuçlandırdığı konuşmalar</div><div class="row up" style="gap:5px;font-size:14px;font-weight:500;margin-top:10px">${icon("trending-up", { size: 15, stroke: 2.4 })}4 puan bu hafta</div></div></div>`,
          style: "left:744px;top:368px;width:384px", pad: "26px 26px",
        },
        {
          html: `<div class="row" style="gap:40px"><div style="position:relative;width:150px;height:150px">${donut(CHANNELS.map(([, , v], i) => ({ v, c: ["#25d366", "#2a6aca", "#d9467a"][i] })), { d: 150, thick: 22 })}<div style="position:absolute;inset:0;display:grid;place-items:center;text-align:center;line-height:1.1"><div><div style="font-size:30px;font-weight:600;letter-spacing:-.03em">703</div><div class="lbl" style="font-size:13px">konuşma</div></div></div></div>
            <div style="flex:1"><div class="h3" style="font-size:20px">Kanallara göre</div><div class="lbl" style="font-size:14.5px;margin-top:3px">Bu hafta gelen konuşmalar</div>
            <div class="row" style="gap:16px;margin-top:20px">${CHANNELS.map(([k, n, v], i) => `<div style="flex:1;display:flex;align-items:center;gap:12px;padding:14px 16px;border-radius:16px;background:#f5f8fd">${chan(k, 34)}<div><div style="font-size:15px;color:#55617b">${n}</div><div style="font-size:24px;font-weight:600;letter-spacing:-.02em">${v}</div></div></div>`).join("")}</div></div></div>`,
          style: "left:72px;top:620px;width:1056px", pad: "26px 30px",
        },
      ],
    }),
  },
  {
    name: "guru-chatbot-og", w: 1200, h: 630,
    html: og({ name: "Chatbot", headline: "Müşterinize *7/24* yanıt veren yapay zeka asistanı", desktop: cbD, mobile: cbM }),
  },
];

/* ---------------- Guru CRM ---------------- */
const crD = crmDesktop();
const crM = crmMobile();
const crm = [
  {
    name: "guru-crm-hero", w: 1600, h: 1200,
    html: hero({
      name: "CRM", desktop: crD, mobile: crM,
      card: `<div class="row" style="gap:14px"><span style="width:52px;height:52px;border-radius:16px;background:#e6f6ec;display:grid;place-items:center">${icon("badge-check", { size: 27, color: "#12873f", stroke: 2 })}</span>
          <div><div style="font-size:14px;font-weight:600;letter-spacing:.06em;color:#12873f">FIRSAT KAZANILDI</div><div style="font-size:21px;font-weight:600;margin-top:2px">Lidya Tekstil</div></div><div style="margin-left:auto;font-size:26px;font-weight:600;letter-spacing:-.02em;color:#12419b">₺190.000</div></div>
        <div style="margin-top:18px;padding:14px 16px;border-radius:14px;background:#f3f6fb"><div class="row" style="font-size:15px;font-weight:500">Eylül hedefi<span style="margin-left:auto;font-weight:600;color:#12419b">%68</span></div>
        <div style="height:8px;border-radius:9px;background:#dbe6f5;margin-top:10px"><div style="width:68%;height:100%;border-radius:9px;background:linear-gradient(90deg,#12419b,#44a1f1)"></div></div></div>`,
      cardPos: "left:960px;top:118px;width:520px;padding:22px 24px",
    }),
  },
  {
    name: "guru-crm-1", w: 1200, h: 900,
    html: feature({
      name: "CRM", desktop: crmDesktop({ dragging: true }),
      win: { crop: [244, 0, 1196, 900], scale: 0.9, style: "left:70px;top:96px" },
      floats: [{ html: dealCard(STAGES[1].deals[0], { big: true, color: STAGES[1].c }).replace('class="card"', 'class=""'), style: "left:560px;top:430px;width:300px;transform:rotate(-4deg);box-shadow:0 0 0 2px #2a6aca,0 50px 80px -30px rgb(1 12 40/.6)", pad: "2px" }],
      chips: cursor("left:820px;top:560px"),
    }),
  },
  {
    name: "guru-crm-2", w: 1200, h: 900,
    html: feature({
      name: "CRM", desktop: crD, bg: "navy",
      phone: { html: crM, style: "left:96px;top:104px", width: 330 },
      floats: [
        {
          html: `<div class="row" style="gap:10px;font-size:14px;color:#7f8aa3"><span style="width:26px;height:26px;border-radius:8px;background:#12419b;display:grid;place-items:center">${icon("bell-ring", { size: 15, color: "#fff", stroke: 2.2 })}</span><span style="font-weight:600;color:#3b4763;letter-spacing:.02em">HATIRLATMA</span><span style="margin-left:auto">şimdi</span></div>
            <div style="font-size:19px;font-weight:600;margin-top:10px">Bugün son gün: Efe Otomotiv</div><div style="font-size:16.5px;color:#3b4763;margin-top:3px">₺420.000 teklif yanıt bekliyor</div>`,
          style: "left:520px;top:92px;width:560px", pad: "18px 22px",
        },
        {
          html: `<div class="row" style="gap:12px"><span style="width:46px;height:46px;border-radius:14px;background:#fff3dc;display:grid;place-items:center">${icon("file-text", { size: 22, color: "#b45f06", stroke: 2 })}</span><div><div style="font-size:14px;color:#7f8aa3">Teklif T-2026-118</div><div style="font-size:21px;font-weight:600">Efe Otomotiv</div></div>${tag("Gönderildi", "blue", "margin-left:auto;font-size:13px;padding:5px 11px")}</div>
            <div style="display:grid;gap:10px;margin-top:20px">${[["Kurumsal web sitesi", "₺180.000"], ["CRM kurulumu ve veri aktarımı", "₺160.000"], ["Eğitim ve 12 ay destek", "₺80.000"]].map(([a, b]) => `<div class="row" style="padding:13px 16px;border-radius:13px;background:#f5f8fd;font-size:16px"><span>${a}</span><span style="margin-left:auto;font-weight:600">${b}</span></div>`).join("")}</div>
            <div class="row" style="margin-top:18px;padding:0 4px"><span style="font-size:16px;color:#55617b">Toplam</span><span style="margin-left:auto;font-size:30px;font-weight:600;letter-spacing:-.03em;color:#12419b">₺420.000</span></div>
            <div class="row" style="gap:8px;margin-top:14px;font-size:14px;color:#55617b">${icon("eye", { size: 16, color: "#2a6aca" })}Müşteri teklifi 2 kez açtı · son 11:20</div>`,
          style: "left:520px;top:300px;width:560px", pad: "24px 26px",
        },
      ],
    }),
  },
  {
    name: "guru-crm-3", w: 1200, h: 900,
    html: feature({
      name: "CRM", desktop: crD,
      floats: [
        {
          html: `<div class="row"><div><div class="h3" style="font-size:21px">Gelir trendi</div><div class="lbl" style="font-size:15px;margin-top:3px">Yıl toplamı ₺5,05M</div></div>
              <div class="row" style="margin-left:auto;gap:16px;font-size:14px;color:#55617b"><span class="row" style="gap:7px"><span style="width:18px;height:4px;border-radius:9px;background:#2a6aca"></span>2026</span><span class="row" style="gap:7px"><span style="width:18px;height:4px;border-radius:9px;background:#b9c7e0"></span>2025</span></div></div>
            <div style="position:relative;margin-top:44px">${trendChart({ w: 572, h: 270, fs: 14 })}
              <div style="position:absolute;right:-6px;top:-40px;padding:7px 12px;border-radius:11px;background:#011441;color:#fff;font-size:15px;font-weight:600;white-space:nowrap">Eyl · ₺740K</div></div>`,
          style: "left:72px;top:86px;width:640px", pad: "28px 34px 26px",
        },
        {
          html: `<div class="row" style="gap:10px;font-size:16px;color:#bfe0ff">${icon("wallet", { size: 19, color: "#bfe0ff", stroke: 2.1 })}Satış hattı değeri</div>
            <div style="font-size:66px;font-weight:600;letter-spacing:-.04em;line-height:1;margin-top:20px">₺4,86M</div>
            <div class="row" style="gap:6px;margin-top:20px;display:inline-flex;padding:7px 12px;border-radius:999px;background:rgb(255 255 255/.14);font-size:14.5px;font-weight:500">${icon("trending-up", { size: 15, stroke: 2.4 })}%12 geçen aya göre</div>`,
          style: "left:744px;top:86px;width:384px;background:linear-gradient(150deg,#011441,#12419b 60%,#2a6aca);color:#fff", pad: "28px 30px",
        },
        {
          html: `<div class="row" style="gap:22px"><div style="position:relative;width:118px;height:118px">${ring(34, { d: 118, thick: 13 })}<div style="position:absolute;inset:0;display:grid;place-items:center;font-size:28px;font-weight:600;letter-spacing:-.03em">%34</div></div>
            <div><div style="font-size:19px;font-weight:600">Kazanma oranı</div><div class="lbl" style="font-size:14.5px;margin-top:4px;line-height:1.4">Teklif verilen fırsatların<br>satışa dönüşenleri</div><div class="row up" style="gap:5px;font-size:14px;font-weight:500;margin-top:10px">${icon("trending-up", { size: 15, stroke: 2.4 })}3 puan arttı</div></div></div>`,
          style: "left:744px;top:368px;width:384px", pad: "26px 26px",
        },
        {
          html: `<div class="row"><div class="h3" style="font-size:20px">Temsilci performansı</div><span class="lbl" style="margin-left:auto;font-size:14.5px">Eylül · kazanılan</span></div>
            <div class="row" style="gap:14px;margin-top:18px">${[["BK", "Burak Kılıç", "₺410K", 82, 0], ["SA", "Seda Aksoy", "₺345K", 69, 2], ["MÖ", "Mert Özkan", "₺245K", 49, 3], ["EY", "Ece Yalçın", "₺180K", 36, 4]].map(([i, n, v, p, k]) => `<div style="flex:1;padding:14px 16px;border-radius:16px;background:#f5f8fd"><div class="row" style="gap:10px">${av(i, 34, k)}<div><div style="font-size:14.5px;font-weight:500">${n}</div><div style="font-size:19px;font-weight:600;letter-spacing:-.02em">${v}</div></div></div><div style="height:6px;border-radius:9px;background:#e3eaf5;margin-top:12px"><div style="width:${p}%;height:100%;border-radius:9px;background:#2a6aca"></div></div></div>`).join("")}</div>`,
          style: "left:72px;top:620px;width:1056px", pad: "24px 28px",
        },
      ],
    }),
  },
  {
    name: "guru-crm-og", w: 1200, h: 630,
    html: og({ name: "CRM", headline: "Her müşteri ve her fırsat *tek* ekranda", desktop: crD, mobile: crM }),
  },
];

/* ---------------- Guru Operation ---------------- */
const opD = operationDesktop();
const opM = operationMobile();
const operation = [
  {
    name: "guru-operation-hero", w: 1600, h: 1200,
    html: hero({
      name: "Operation", desktop: opD, mobile: opM,
      card: `<div class="row" style="gap:14px"><span style="width:52px;height:52px;border-radius:16px;background:#e6f6ec;display:grid;place-items:center">${icon("circle-check-big", { size: 26, color: "#12873f", stroke: 2 })}</span>
          <div><div style="font-size:14px;font-weight:600;letter-spacing:.06em;color:#12873f">KONTROLDEN GEÇTİ</div><div style="font-size:21px;font-weight:600;margin-top:2px">Stok uyarı eşikleri</div></div><span style="margin-left:auto;font-size:15px;color:#8a95ad">OP-131</span></div>
        <div class="row" style="gap:12px;margin-top:18px;padding:14px 16px;border-radius:14px;background:#f3f6fb;font-size:15px"><span class="row" style="gap:-6px">${av("BT", 30, 3)}${av("EK", 30, 4)}</span><span style="color:#3b4763">Burak Taş tamamladı, Elif Koç onayladı</span></div>`,
      cardPos: "left:960px;top:118px;width:520px;padding:22px 24px",
    }),
  },
  {
    name: "guru-operation-1", w: 1200, h: 900,
    html: feature({
      name: "Operation", desktop: operationDesktop({ dragging: true }),
      win: { crop: [244, 0, 1196, 900], scale: 0.9, style: "left:70px;top:96px" },
      floats: [{ html: taskCard(COLS[2].tasks[0], { big: true }).replace('class="card"', 'class=""'), style: "left:575px;top:330px;width:290px;transform:rotate(4deg);box-shadow:0 0 0 2px #2a6aca,0 50px 80px -30px rgb(1 12 40/.6)", pad: "2px" }],
      chips: cursor("left:812px;top:500px"),
    }),
  },
  {
    name: "guru-operation-2", w: 1200, h: 900,
    html: feature({
      name: "Operation", desktop: opD, bg: "navy",
      floats: [
        {
          html: `<div class="row"><div><div class="h3" style="font-size:22px">Ekip Kapasitesi</div><div class="lbl" style="font-size:15px;margin-top:3px">Bu hafta · 31 Ağu - 6 Eyl</div></div>${tag("Ort. %73", "blue", "margin-left:auto;font-size:14px;padding:6px 12px")}</div>
            <div style="display:grid;gap:22px;margin-top:26px">${capacityRows({ big: true })}</div>`,
          style: "left:72px;top:150px;width:590px", pad: "30px 34px",
        },
        {
          html: `<div class="row" style="gap:12px"><span style="width:46px;height:46px;border-radius:14px;background:#fff3dc;display:grid;place-items:center">${icon("scale", { size: 22, color: "#b45f06", stroke: 2 })}</span><div><div style="font-size:14px;font-weight:600;letter-spacing:.05em;color:#b45f06">YÜK DENGELEME</div><div style="font-size:20px;font-weight:600;margin-top:2px">Ayşe Kaya %92 dolu</div></div></div>
            <div style="font-size:16.5px;color:#3b4763;line-height:1.5;margin-top:14px">2 görevi Elif Koç'a aktarırsanız iki kişinin yükü de %80'in altına iner.</div>
            <div class="row" style="gap:10px;margin-top:18px"><span class="btn pri" style="height:44px;font-size:15.5px">${icon("arrow-right-left", { size: 16, stroke: 2.2 })}Görevleri dağıt</span><span class="btn sec" style="height:44px;font-size:15.5px;background:#f3f6fb;box-shadow:none">Sonra</span></div>`,
          style: "left:694px;top:432px;width:436px", pad: "24px 26px",
        },
        {
          html: `<div style="position:relative;width:150px;height:150px;margin:0 auto">${ring(73, { d: 150, thick: 16 })}<div style="position:absolute;inset:0;display:grid;place-items:center;text-align:center;line-height:1.1"><div><div style="font-size:36px;font-weight:600;letter-spacing:-.03em">%73</div><div class="lbl" style="font-size:13.5px">ortalama</div></div></div></div>
            <div style="text-align:center;font-size:15.5px;color:#3b4763;margin-top:14px">5 kişi · 37 açık görev</div>`,
          style: "left:694px;top:120px;width:436px", pad: "26px 24px",
        },
      ],
    }),
  },
  {
    name: "guru-operation-3", w: 1200, h: 900,
    html: feature({
      name: "Operation", desktop: opD,
      floats: [
        {
          html: `<div class="row"><div><div class="h3" style="font-size:22px">Haftalık Zaman Çizelgesi</div><div class="lbl" style="font-size:15px;margin-top:3px">36. Hafta · 6 iş · 5 kişi</div></div>${tag(`${icon("calendar", { size: 14, stroke: 2.3 })}Bugün: 4 Eylül`, "blue", "margin-left:auto;font-size:14px;padding:6px 12px")}</div>
            <div style="margin-top:28px">${gantt({ w: 972, rowH: 44, labelW: 160, fs: 16 })}</div>`,
          style: "left:72px;top:86px;width:1056px", pad: "30px 42px 34px",
        },
        {
          html: `<div class="row" style="gap:12px"><span style="width:44px;height:44px;border-radius:13px;background:#fff3dc;display:grid;place-items:center">${icon("flag", { size: 21, color: "#b45f06", stroke: 2 })}</span><div><div style="font-size:19px;font-weight:600">Fatura testi</div><div style="font-size:14.5px;color:#7f8aa3">Teslim 5 Eylül · Mehmet Demir</div></div></div>
            <div class="row" style="gap:6px;margin-top:16px">${[1, 1, 1, 0, 0].map((on) => `<span style="flex:1;height:8px;border-radius:9px;background:${on ? "#e8a33a" : "#efe4d2"}"></span>`).join("")}</div><div style="font-size:14px;color:#55617b;margin-top:8px">3/5 alt görev tamamlandı</div>`,
          style: "left:640px;top:612px;width:460px", pad: "22px 24px",
        },
      ],
    }),
  },
  {
    name: "guru-operation-og", w: 1200, h: 630,
    html: og({ name: "Operation", headline: "Operasyonun her adımı *görünür* ve takipte", desktop: opD, mobile: opM }),
  },
];

/* ---------------- Guru Business ---------------- */
const bzD = businessDesktop();
const bzM = businessMobile();
const business = [
  {
    name: "guru-business-hero", w: 1600, h: 1200,
    html: hero({
      name: "Business", desktop: bzD, mobile: bzM,
      card: notif("GURU BUSINESS", `<span style="width:26px;height:26px;border-radius:8px;background:#12419b;display:grid;place-items:center">${icon("sun", { size: 15, color: "#fff", stroke: 2.2 })}</span>`, "Günaydın, Cem Bey", "İşletmenizin bugünkü özeti hazır", "08:30") +
        `<div class="row" style="gap:10px;margin-top:16px">${MODULES.map((m) => `<div style="flex:1;padding:12px 12px;border-radius:14px;background:#f3f6fb"><span style="width:28px;height:28px;border-radius:9px;background:${m.c};display:grid;place-items:center">${icon(m.ic, { size: 15, color: "#fff", stroke: 2.2 })}</span><div style="font-size:20px;font-weight:600;letter-spacing:-.02em;margin-top:8px">${m.m[0][0]}</div><div style="font-size:13px;color:#7f8aa3">${m.m[0][1]}</div></div>`).join("")}</div>`,
      cardPos: "left:960px;top:96px;width:520px;padding:22px 24px",
    }),
  },
  {
    name: "guru-business-1", w: 1200, h: 900,
    html: feature({
      name: "Business", desktop: bzD,
      win: { crop: [244, 0, 1196, 900], scale: 0.9, style: "left:70px;top:96px" },
      floats: [{
        html: `<div class="row" style="gap:10px;font-size:16px;color:#bfe0ff">${icon("wallet", { size: 19, color: "#bfe0ff", stroke: 2.1 })}Aylık gelir</div>
          <div style="font-size:58px;font-weight:600;letter-spacing:-.04em;line-height:1;margin-top:16px">₺684.500</div>
          <div class="row" style="gap:6px;margin-top:18px;display:inline-flex;padding:7px 12px;border-radius:999px;background:rgb(255 255 255/.14);font-size:14.5px;font-weight:500">${icon("trending-up", { size: 15, stroke: 2.4 })}%12,1 geçen aya göre</div>`,
        style: "left:620px;top:330px;width:440px;background:linear-gradient(150deg,#011441,#12419b 60%,#2a6aca);color:#fff", pad: "28px 30px",
      }],
    }),
  },
  {
    name: "guru-business-2", w: 1200, h: 900,
    html: feature({
      name: "Business", desktop: bzD, bg: "navy",
      phone: { html: bzM, style: "left:862px;top:120px", width: 290 },
      floats: MODULES.map((m, i) => ({ html: moduleCard(m, { big: true }).replace('class="card"', 'class=""'), style: `left:${64 + i * 96}px;top:${120 + i * 232}px;width:620px`, pad: "4px" })),
    }),
  },
  {
    name: "guru-business-3", w: 1200, h: 900,
    html: feature({
      name: "Business", desktop: bzD,
      floats: [
        {
          html: `<div class="row"><span class="h3" style="font-size:22px">Son Aktiviteler</span>${tag("3 modül", "blue", "margin-left:auto;font-size:13.5px;padding:5px 11px")}</div>
            <div style="display:grid;gap:22px;margin-top:24px">${activityRows({ big: true, n: 5 })}</div>`,
          style: "left:72px;top:86px;width:580px", pad: "30px 32px",
        },
        {
          html: `<div class="h3" style="font-size:20px">Gelir Kaynağı Dağılımı</div><div class="lbl" style="font-size:14.5px;margin-top:3px">Ağustos 2026 · 4 kaynak</div>
            <div style="margin-top:20px">${revenueBlock({ d: 168, stack: true })}</div>`,
          style: "left:684px;top:86px;width:444px", pad: "26px 30px",
        },
        {
          html: `<div class="row" style="font-size:16px;color:#bfe0ff">${icon("target", { size: 19, color: "#bfe0ff", stroke: 2.1, style: "margin-right:10px" })}Aylık hedef<span style="margin-left:auto;font-weight:600;color:#fff">%98</span></div>
            <div style="font-size:44px;font-weight:600;letter-spacing:-.03em;margin-top:14px">₺684.500</div><div style="font-size:15px;color:#bfe0ff">Hedef ₺700.000</div>
            <div style="height:9px;border-radius:9px;background:rgb(255 255 255/.16);margin-top:16px"><div style="width:98%;height:100%;border-radius:9px;background:linear-gradient(90deg,#7cc4ff,#fff)"></div></div>`,
          style: "left:684px;top:600px;width:444px;background:linear-gradient(150deg,#011441,#12419b 60%,#2a6aca);color:#fff", pad: "26px 30px",
        },
      ],
    }),
  },
  {
    name: "guru-business-og", w: 1200, h: 630,
    html: og({ name: "Business", headline: "İşletmeniz için *bütünleşik* dijital yönetim", desktop: bzD, mobile: bzM }),
  },
];

export const SCENES = [
  { name: "raw-chatbot-desktop", w: 1440, h: 900, html: page({ w: 1440, h: 900, bg: "", body: cbD }) },
  { name: "raw-chatbot-mobile", w: 390, h: 844, html: page({ w: 390, h: 844, bg: "", body: cbM }) },
  ...chatbot,
  { name: "raw-crm-desktop", w: 1440, h: 900, html: page({ w: 1440, h: 900, bg: "", body: crD }) },
  { name: "raw-crm-mobile", w: 390, h: 844, html: page({ w: 390, h: 844, bg: "", body: crM }) },
  ...crm,
  { name: "raw-operation-desktop", w: 1440, h: 900, html: page({ w: 1440, h: 900, bg: "", body: opD }) },
  { name: "raw-operation-mobile", w: 390, h: 844, html: page({ w: 390, h: 844, bg: "", body: opM }) },
  ...operation,
  { name: "raw-business-desktop", w: 1440, h: 900, html: page({ w: 1440, h: 900, bg: "", body: bzD }) },
  { name: "raw-business-mobile", w: 390, h: 844, html: page({ w: 390, h: 844, bg: "", body: bzM }) },
  ...business,
];
