import { av, bars, chan, dot, icon, mark, sidebar, tag } from "./lib.mjs";

/* Konuşma listesi verisi (mevcut ürün ekranıyla aynı örnek veri) */
export const CONVS = [
  ["MK", "Merve Kaya", "14:32", "Teslimat adresini değiştirmek istiyorum", 2, "whatsapp", true],
  ["ED", "Emre Demir", "14:27", "Fiyat listesi var mı?", 1, "web"],
  ["SA", "Selin Aydın", "14:15", "Bu ürün stokta var mı?", 3, "instagram"],
  ["BŞ", "Burak Şahin", "13:58", "Teşekkürler, çözüldü.", 0, "web", false, "bot"],
  ["ZÇ", "Zeynep Çelik", "13:41", "İade nasıl yapılıyor?", 0, "whatsapp", false, "bot"],
  ["CÖ", "Can Öztürk", "13:20", "Randevu almak istiyorum", 1, "instagram"],
  ["EA", "Elif Arslan", "12:55", "Faturamı alabilir miyim?", 0, "web", false, "bot"],
  ["AY", "Ahmet Yılmaz", "12:30", "Kargo takip numarası?", 0, "whatsapp", false, "bot"],
];

export function convRow([ini, name, time, prev, unread, ch, active, by], i, { big = false } = {}) {
  const d = big ? 46 : 42;
  return `<div style="display:flex;gap:12px;align-items:center;padding:${big ? "14px 16px" : "11px 12px"};border-radius:14px;${active ? "background:#eaf2ff;" : ""}">
    <div style="position:relative">${av(ini, d, i)}<span style="position:absolute;right:-3px;bottom:-3px;border:2.5px solid ${active ? "#eaf2ff" : "#fff"};border-radius:50%">${chan(ch, big ? 19 : 17)}</span></div>
    <div style="min-width:0;flex:1">
      <div class="row" style="gap:8px"><span style="font-size:${big ? 16 : 15}px;font-weight:600">${name}</span>${by === "bot" ? tag(`${icon("sparkles", { size: 11, stroke: 2.4 })}Bot`, "blue", "font-size:11px;padding:2px 7px") : ""}<span style="margin-left:auto;font-size:12.5px;color:#8a95ad">${time}</span></div>
      <div class="row" style="gap:8px;margin-top:3px"><span style="font-size:${big ? 14.5 : 13.5}px;color:${unread ? "#3b4763" : "#8a95ad"};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;${unread ? "font-weight:500" : ""}">${prev}</span>${unread ? `<span style="margin-left:auto;min-width:21px;height:21px;padding:0 6px;border-radius:999px;background:#12419b;color:#fff;font-size:12px;font-weight:600;display:grid;place-items:center">${unread}</span>` : ""}</div>
    </div>
  </div>`;
}

const botLabel = `<div class="row" style="gap:6px;justify-content:flex-end;font-size:12.5px;font-weight:600;color:#2a6aca;margin-bottom:6px">${icon("sparkles", { size: 13, stroke: 2.2 })}Guru Bot</div>`;
export const bubble = {
  them: (text, time, extra = "") =>
    `<div style="max-width:72%;${extra}"><div style="background:#f1f4f9;border-radius:18px 18px 18px 6px;padding:12px 16px;font-size:15px;line-height:1.45;color:#1d2a48">${text}</div><div style="font-size:12px;color:#9aa4ba;margin:5px 0 0 6px">${time}</div></div>`,
  bot: (text, time, extra = "") =>
    `<div style="max-width:72%;margin-left:auto;${extra}">${botLabel}<div style="background:linear-gradient(135deg,#12419b,#2a6aca);border-radius:18px 18px 6px 18px;padding:12px 16px;font-size:15px;line-height:1.45;color:#fff;box-shadow:0 10px 24px -14px rgb(18 65 155/.8)">${text}</div><div style="font-size:12px;color:#9aa4ba;margin:5px 6px 0 0;text-align:right">${time} · ${icon("check-check", { size: 13, stroke: 2.2, color: "#44a1f1", style: "vertical-align:-2px" })}</div></div>`,
};

export function handoffCard({ big = false } = {}) {
  return `<div style="display:flex;align-items:center;gap:14px;padding:${big ? "16px 18px" : "13px 16px"};border-radius:16px;background:linear-gradient(135deg,#fff8eb,#fff2dc)">
    <span style="width:${big ? 40 : 36}px;height:${big ? 40 : 36}px;border-radius:12px;background:#fff;display:grid;place-items:center;box-shadow:0 4px 10px -6px rgb(180 95 6/.5)">${icon("user-round-check", { size: big ? 20 : 18, color: "#b45f06", stroke: 2.1 })}</span>
    <div style="flex:1;min-width:0"><div style="font-size:${big ? 15.5 : 14.5}px;font-weight:600;color:#7a3f02;white-space:nowrap">Ekibe aktarma önerisi</div><div style="font-size:${big ? 13.5 : 13}px;color:#a0661f;margin-top:2px;white-space:nowrap">Adres değişikliği temsilci onayı ister</div></div>
    <span class="btn pri" style="height:${big ? 40 : 36}px;padding:0 ${big ? 16 : 14}px;font-size:${big ? 14.5 : 14}px;background:#12419b">${icon("arrow-right-left", { size: 15, stroke: 2.2 })}Ekibe Aktar</span>
  </div>`;
}

export function statCard(lbl, val, unit, delta, ic, { big = false } = {}) {
  return `<div class="card" style="padding:${big ? "20px 22px" : "16px 18px"}">
    <div class="row" style="gap:10px"><span class="lbl" style="font-size:${big ? 14 : 13}px">${lbl}</span><span style="margin-left:auto;width:${big ? 34 : 30}px;height:${big ? 34 : 30}px;border-radius:10px;background:#eaf2ff;display:grid;place-items:center">${icon(ic, { size: big ? 17 : 15, color: "#2a6aca", stroke: 2.2 })}</span></div>
    <div style="font-size:${big ? 38 : 30}px;font-weight:600;letter-spacing:-.03em;margin-top:${big ? 6 : 4}px;line-height:1.1">${val}<span style="font-size:${big ? 17 : 15}px;font-weight:500;color:#7f8aa3;margin-left:5px;letter-spacing:0">${unit}</span></div>
    <div class="row up" style="gap:5px;font-size:${big ? 13.5 : 12.5}px;font-weight:500;margin-top:${big ? 8 : 6}px">${icon("trending-up", { size: 14, stroke: 2.4 })}${delta}</div>
  </div>`;
}

export const CHANNELS = [["whatsapp", "WhatsApp", 312], ["web", "Web sitesi", 248], ["instagram", "Instagram", 143]];
export function channelCard({ big = false } = {}) {
  const max = 312;
  return `<div class="card" style="padding:${big ? "22px 24px" : "16px 18px"}">
    <div class="h3" style="font-size:${big ? 18 : 16}px">Kanallar</div>
    <div style="display:grid;gap:${big ? 14 : 11}px;margin-top:${big ? 16 : 12}px">${CHANNELS.map(([k, n, v]) => `<div class="row" style="gap:10px">${chan(k, big ? 24 : 20)}<div style="flex:1"><div class="row" style="font-size:${big ? 14.5 : 13.5}px"><span style="font-weight:500">${n}</span><span style="margin-left:auto;color:#7f8aa3">${v}</span></div><div style="height:6px;border-radius:9px;background:#edf2f9;margin-top:6px"><div style="width:${(v / max) * 100}%;height:100%;border-radius:9px;background:#2a6aca"></div></div></div></div>`).join("")}</div>
  </div>`;
}

export const WEEK = [74, 58, 96, 112, 104, 131, 128];
export const WEEK_L = ["Cmt", "Paz", "Pzt", "Sal", "Çar", "Per", "Cum"];

export function weeklyCard({ w = 268, h = 150, big = false } = {}) {
  return `<div class="card" style="padding:${big ? "22px 24px" : "18px 18px 14px"}">
    <div class="h3" style="font-size:${big ? 18 : 16}px">Haftalık konuşmalar</div><div class="lbl" style="margin-top:2px">Son 7 gün · 703 toplam</div>
    <div style="margin-top:14px">${bars(WEEK, { w, h, hi: 6, labels: WEEK_L, color: "#2a6aca", fade: "#d6e6ff" })}</div>
  </div>`;
}

export function chatbotDesktop() {
  const side = sidebar({
    product: "Chatbot",
    items: [["inbox", "Gelen Kutusu", true, 12], ["workflow", "Senaryolar"], ["book-open", "Bilgi Bankası"], ["plug", "Kanallar"], ["chart-column", "Raporlar"], ["settings", "Ayarlar"]],
    user: ["AY", "Ayşe Yıldız", "Yönetici", 1],
  }).replace('<div class="foot">', `<div style="margin-top:auto;padding:16px 14px;border-radius:16px;background:linear-gradient(150deg,#eaf2ff,#f5f9ff);margin-bottom:12px">
      <div class="row" style="gap:8px;font-size:13.5px;font-weight:600;color:#12419b">${icon("sparkles", { size: 15, stroke: 2.2 })}Guru Bot</div>
      <div style="font-size:12.5px;color:#55617b;margin-top:4px;line-height:1.45">Bilgi bankası güncel, 3 kanalda yanıt veriyor</div>
      <div class="row" style="gap:6px;margin-top:10px">${chan("whatsapp", 22)}${chan("instagram", 22)}${chan("web", 22)}</div>
    </div><div class="foot" style="margin-top:0">`);
  const list = `<div class="card" style="width:336px;flex-shrink:0;padding:16px 10px;display:flex;flex-direction:column">
    <div class="row" style="padding:0 8px 12px"><span class="h3">Konuşmalar</span>${tag("12 açık", "blue", "margin-left:auto")}</div>
    <div class="row" style="gap:6px;padding:0 8px 10px">${[["Tümü", 12, true], ["Bot", 7], ["Ekip", 5]].map(([t, n, on]) => `<span style="height:32px;padding:0 13px;border-radius:999px;display:inline-flex;align-items:center;gap:7px;font-size:13.5px;font-weight:500;${on ? "background:#12419b;color:#fff" : "background:#f1f4f9;color:#4a5672"}">${t}<span style="opacity:.7">${n}</span></span>`).join("")}</div>
    <div style="display:grid;gap:2px">${CONVS.map((c, i) => convRow(c, i)).join("")}</div>
  </div>`;
  const chat = `<div class="card" style="flex:1;min-width:0;display:flex;flex-direction:column;padding:0;overflow:hidden">
    <div class="row" style="gap:12px;padding:16px 20px;background:#fbfcfe">
      <div style="position:relative">${av("MK", 42, 0)}<span style="position:absolute;right:-3px;bottom:-3px;border:2.5px solid #fbfcfe;border-radius:50%">${chan("whatsapp", 17)}</span></div>
      <div><div style="font-size:16px;font-weight:600">Merve Kaya</div><div class="row" style="gap:6px;font-size:13px;color:#7f8aa3">${dot("#16a34a", 7)}Çevrimiçi · WhatsApp</div></div>
      <span class="btn sec" style="margin-left:auto;height:38px">${icon("user-plus", { size: 16 })}Ata</span><span class="btn sec" style="height:38px">${icon("circle-check", { size: 16 })}Kapat</span>
    </div>
    <div style="flex:1;padding:14px 22px;display:flex;flex-direction:column;gap:10px">
      <div style="align-self:center;font-size:12.5px;color:#7f8aa3;background:#f1f4f9;border-radius:999px;padding:4px 12px">Bugün, 4 Eylül</div>
      ${bubble.them("Merhaba, siparişim 3 gündür kargoya verilmedi. Ne zaman gönderilir?", "14:29")}
      ${bubble.bot("Merhaba Merve Hanım! GD-48213 numaralı siparişiniz bugün paketlendi. Teslimat 1-2 iş günü içinde yapılacak.", "14:29")}
      ${bubble.them("Takip numarası alabilir miyim?", "14:31")}
      ${bubble.bot("Elbette: <b>YK 4821 3390 17</b>", "14:31")}
      ${bubble.them("Teslimat adresini değiştirmek istiyorum, mümkün mü?", "14:32")}
    </div>
    <div style="padding:0 20px 18px;display:grid;gap:12px">
      ${handoffCard()}
      <div class="row" style="gap:8px">${["Adres güncelle", "Kargo durumu", "İade koşulları"].map((t) => `<span style="height:32px;padding:0 13px;border-radius:999px;background:#eaf2ff;color:#12419b;font-size:13.5px;font-weight:500;display:inline-flex;align-items:center;gap:6px">${icon("zap", { size: 13, stroke: 2.3 })}${t}</span>`).join("")}</div>
      <div class="row" style="gap:10px;height:50px;padding:0 8px 0 18px;border-radius:14px;background:#f3f6fb;color:#9aa4ba;font-size:14.5px">Yanıt yazın…<span style="margin-left:auto;display:flex;gap:6px;align-items:center">${icon("paperclip", { size: 18, color: "#9aa4ba" })}<span style="width:36px;height:36px;border-radius:11px;background:#12419b;display:grid;place-items:center">${icon("send-horizontal", { size: 17, color: "#fff", stroke: 2.2 })}</span></span></div>
    </div>
  </div>`;
  const right = `<div style="width:282px;flex-shrink:0;display:grid;gap:14px;align-content:start">
    ${statCard("Ort. yanıt süresi", "4", "sn", "1,2 sn daha hızlı", "timer")}
    ${statCard("Çözüm oranı", "%86", "", "4 puan bu hafta", "circle-check-big")}
    ${weeklyCard({ w: 244, h: 128 })}
    ${channelCard()}
  </div>`;
  return `<div class="app">${side}<main class="main">
    <div class="top"><div><h1>Gelen Kutusu</h1><div class="sub">Bugün 128 konuşma · 12 açık · 3 kanal bağlı</div></div>
      <span style="margin-left:auto" class="row">${tag(`${dot("#16a34a", 7)}Guru Bot çevrimiçi`, "green", "font-size:13px;padding:7px 12px;margin-right:12px")}</span>
      <div class="search">${icon("search", { size: 17, color: "#a0aac0" })}Konuşma ara</div>
      <span class="btn sec">${icon("sliders-horizontal", { size: 16 })}Filtrele</span></div>
    <div style="flex:1;min-height:0;display:flex;gap:16px">${list}${chat}${right}</div>
  </main></div>`;
}

/* Mobil: ziyaretçinin gördüğü sohbet penceresi (web sitesi asistanı) */
export function statusBar(color = "#0c1a3a") {
  return `<div class="row" style="height:50px;padding:0 30px 0 34px;font:600 16px Outfit;color:${color}"><span>9:41</span><span style="margin-left:auto" class="row">
    <svg width="18" height="12" viewBox="0 0 18 12"><rect x="0" y="8" width="3" height="4" rx="1" fill="${color}"/><rect x="5" y="5.5" width="3" height="6.5" rx="1" fill="${color}"/><rect x="10" y="3" width="3" height="9" rx="1" fill="${color}"/><rect x="15" y="0" width="3" height="12" rx="1" fill="${color}"/></svg>
    <svg width="17" height="12" viewBox="0 0 17 12" style="margin-left:6px"><path d="M8.5 2.5c2.4 0 4.6.9 6.2 2.4l1.2-1.3A10.6 10.6 0 0 0 8.5.7 10.6 10.6 0 0 0 1.1 3.6l1.2 1.3A8.8 8.8 0 0 1 8.5 2.5Zm0 3.6c1.4 0 2.7.5 3.7 1.4l1.2-1.3a7 7 0 0 0-9.8 0l1.2 1.3c1-.9 2.3-1.4 3.7-1.4Zm0 3.5c.5 0 1 .2 1.3.5L8.5 11.6 7.2 10.1c.3-.3.8-.5 1.3-.5Z" fill="${color}"/></svg>
    <svg width="27" height="13" viewBox="0 0 27 13" style="margin-left:6px"><rect x=".5" y=".5" width="23" height="12" rx="3.5" fill="none" stroke="${color}" opacity=".4"/><rect x="2" y="2" width="18" height="9" rx="2" fill="${color}"/><rect x="25" y="4.5" width="1.6" height="4" rx=".8" fill="${color}" opacity=".5"/></svg></span></div>`;
}

export function chatbotMobile() {
  return `<div style="width:390px;height:844px;background:#f3f6fb;font-family:Outfit;color:#0c1a3a;display:flex;flex-direction:column">
    <div style="background:linear-gradient(160deg,#011441,#12419b 70%,#2a6aca);color:#fff;padding-bottom:18px">
      ${statusBar("#fff")}
      <div class="row" style="gap:12px;padding:6px 20px 0">
        <span style="width:46px;height:46px;border-radius:15px;background:#fff;display:grid;place-items:center">${mark("navy", 26)}</span>
        <div><div style="font-size:18px;font-weight:600">Guru Asistan</div><div class="row" style="gap:6px;font-size:13.5px;color:#bfe0ff">${dot("#4ade80", 7)}Genellikle anında yanıt verir</div></div>
        <span style="margin-left:auto;width:38px;height:38px;border-radius:12px;background:rgb(255 255 255/.12);display:grid;place-items:center">${icon("x", { size: 18, color: "#fff" })}</span>
      </div>
    </div>
    <div style="flex:1;padding:18px 16px;display:flex;flex-direction:column;gap:12px">
      <div style="align-self:center;font-size:12px;color:#7f8aa3;background:#e8edf5;border-radius:999px;padding:3px 11px">Bugün 14:29</div>
      ${bubble.them("Merhaba, siparişim ne zaman kargoya verilir?", "14:29", "max-width:80%")}
      ${bubble.bot("Merhaba Merve Hanım! GD-48213 numaralı siparişiniz bugün paketlendi.", "14:29", "max-width:84%")}
      <div style="margin-left:auto;width:84%;background:#fff;border-radius:16px;padding:14px;box-shadow:0 10px 24px -16px rgb(12 26 58/.35)">
        <div class="row" style="gap:10px"><span style="width:38px;height:38px;border-radius:11px;background:#eaf2ff;display:grid;place-items:center">${icon("package", { size: 19, color: "#12419b", stroke: 2 })}</span><div><div style="font-size:14.5px;font-weight:600">Sipariş GD-48213</div><div style="font-size:12.5px;color:#7f8aa3">Tahmini teslimat 6 Eylül</div></div>${tag("Kargoda", "green", "margin-left:auto")}</div>
        <div class="row" style="gap:5px;margin-top:12px">${[1, 1, 1, 0].map((on) => `<span style="flex:1;height:6px;border-radius:99px;background:${on ? "#2a6aca" : "#dfe7f3"}"></span>`).join("")}</div>
        <div class="row" style="margin-top:7px;font-size:11.5px;color:#8a95ad;justify-content:space-between"><span>Alındı</span><span>Paketlendi</span><span style="color:#12419b;font-weight:600">Kargoda</span><span>Teslim</span></div>
      </div>
      ${bubble.them("Takip numarası alabilir miyim?", "14:31", "max-width:80%")}
      ${bubble.bot("Elbette: <b>YK 4821 3390 17</b>", "14:31", "max-width:84%")}
      <div class="row" style="gap:7px;flex-wrap:wrap;justify-content:flex-end;margin-top:2px">${["Adresimi değiştir", "İade koşulları", "Canlı destek"].map((t) => `<span style="height:34px;padding:0 13px;border-radius:999px;background:#fff;color:#12419b;font-size:13.5px;font-weight:500;display:inline-flex;align-items:center;box-shadow:0 0 0 1.5px #cfe0fb inset">${t}</span>`).join("")}</div>
    </div>
    <div style="padding:10px 14px 30px;background:#fff;box-shadow:0 -10px 30px -24px rgb(12 26 58/.4)">
      <div class="row" style="gap:10px;height:50px;padding:0 6px 0 16px;border-radius:16px;background:#f3f6fb;color:#9aa4ba;font-size:15px">Mesajınızı yazın…<span style="margin-left:auto;width:40px;height:40px;border-radius:12px;background:#12419b;display:grid;place-items:center">${icon("send-horizontal", { size: 18, color: "#fff", stroke: 2.2 })}</span></div>
    </div>
  </div>`;
}
