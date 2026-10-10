import type { PayloadHandler, PayloadRequest } from "payload";
import { addDataAndFileToRequest } from "payload";
import { isAdminUser } from "../business/roles";
import { CRM_SKIP } from "../crm/automation";
import { ALL_TENANT_MODULES } from "../crm/tenant";
import { chatConfigOf } from "../chat/collections";
import { siteConnectionOf } from "../channels/collections";
import { resetKnowledge } from "../chat/knowledge";

/**
 * Satış sunumu için örnek verili işletme:
 *   POST /api/tenants/demo  { reset?: boolean }
 * Yalnız Guru yöneticisi. Kayıtlar açıkça kurmacadır (Örnek ... adları,
 * example.com adresleri). Sıfırlamada işletme silinir; çok kiracılı eklenti
 * işletmenin tüm kayıtlarını da siler, sonra baştan kurulur.
 */

export const DEMO_SLUG = "demo";
const DEMO_NAME = "Demo İşletme";

const json = (body: Record<string, unknown>, status = 200) => Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
const DAY = 86400000;
/* Bugünden gün farkıyla, İstanbul öğlen (UTC 09:00) */
const day = (offset: number) => {
  const d = new Date(Date.now() + offset * DAY);
  d.setUTCHours(9, 0, 0, 0);
  return d.toISOString();
};
const dayOnly = (offset: number) => day(offset).slice(0, 10);

const COMPANIES = [
  { name: "Örnek Lojistik A.Ş.", sector: "Lojistik", phone: "0212 000 00 01", email: "info@ornek-lojistik.example.com" },
  { name: "Örnek Kafe Zinciri", sector: "Yiyecek ve içecek", phone: "0216 000 00 02", email: "merhaba@ornek-kafe.example.com" },
  { name: "Örnek Hukuk Bürosu", sector: "Hukuk", phone: "0312 000 00 03", email: "iletisim@ornek-hukuk.example.com" },
  { name: "Örnek Otel", sector: "Turizm", phone: "0242 000 00 04", email: "rezervasyon@ornek-otel.example.com" },
];
const CONTACTS = [
  { name: "Ayşe Örnek", title: "Satın alma müdürü", company: 0, email: "ayse@ornek-lojistik.example.com", source: "form" },
  { name: "Mehmet Deneme", title: "Genel müdür", company: 1, email: "mehmet@ornek-kafe.example.com", source: "chatbot" },
  { name: "Zeynep Örnek", title: "Ortak avukat", company: 2, email: "zeynep@ornek-hukuk.example.com", source: "referans" },
  { name: "Can Deneme", title: "İşletme müdürü", company: 3, email: "can@ornek-otel.example.com", source: "randevu" },
  { name: "Elif Örnek", title: null, company: null, email: "elif@example.com", source: "form" },
  { name: "Burak Deneme", title: "Ofis yöneticisi", company: 0, email: "burak@ornek-lojistik.example.com", source: "manuel" },
] as const;
const DEALS = [
  { title: "Ofis yenileme · Örnek Lojistik", contact: 0, value: 420000, stage: "teklif", close: 12, service: "Ofis yenileme" },
  { title: "Şube iç mimarisi · Örnek Kafe", contact: 1, value: 260000, stage: "gorusme", close: 20, service: "İç mimari" },
  { title: "Toplantı salonu · Örnek Hukuk", contact: 2, value: 95000, stage: "aday", close: 30, service: "Ofis yenileme" },
  { title: "Lobi yenileme · Örnek Otel", contact: 3, value: 610000, stage: "kazanildi", close: -6, service: "İç mimari" },
  { title: "Ev mutfağı · Elif Örnek", contact: 4, value: 140000, stage: "aday", close: 25, service: "Mutfak tasarımı" },
  { title: "Depo ofisi · Örnek Lojistik", contact: 5, value: 75000, stage: "kaybedildi", close: -15, service: "Ofis yenileme", lost: "Bütçe ertelendi" },
  { title: "Teras düzenleme · Örnek Otel", contact: 3, value: 180000, stage: "gorusme", close: 18, service: "Dış mekân" },
] as const;

const TEMPLATE = {
  name: "Ofis yenileme projesi",
  description: "Demo şablonu: keşiften teslime adımlar.",
  steps: [
    { title: "Keşif ve ölçü", offset: 0, duration: 2, hours: 4, checklist: ["Yerinde ölçü alındı", "İhtiyaç listesi çıkarıldı"] },
    { title: "Tasarım ve 3B çizim", offset: 2, duration: 5, hours: 20, checklist: ["Yerleşim planı", "3B görseller"] },
    { title: "Tasarım onayı", offset: 7, duration: 2, hours: 2, checklist: ["Müşteri onayı yazılı alındı"] },
    { title: "Malzeme ve tedarik", offset: 9, duration: 5, hours: 8, checklist: ["Malzeme listesi onaylandı", "Siparişler verildi"] },
    { title: "Uygulama", offset: 14, duration: 10, hours: 60, checklist: [] },
    { title: "Teslim ve kontrol", offset: 24, duration: 2, hours: 4, checklist: ["Eksik listesi kapandı", "Teslim tutanağı imzalandı"] },
  ],
};

const KNOWLEDGE = [
  { title: "Hizmetler", content: "Demo İşletme bir iç mimari ve yenileme stüdyosudur (kurmaca). Ofis yenileme, şube ve mağaza iç mimarisi, ev mutfağı tasarımı ve dış mekân düzenlemesi yapar. Her proje yerinde keşifle başlar." },
  { title: "Keşif ve teklif", content: "Keşif randevusu hafta içi 10:00 ile 17:00 arasında verilir. Keşiften sonraki 3 iş günü içinde yazılı teklif gönderilir. Teklif 15 gün geçerlidir." },
  { title: "Çalışma saatleri ve iletişim", content: "Hafta içi 09:00-18:00, cumartesi 10:00-14:00 açığız. Pazar kapalıyız. Telefon: 0212 000 00 00, e-posta: merhaba@demo-isletme.example.com (kurmaca bilgiler)." },
];

async function seed(req: PayloadRequest) {
  const { payload } = req;
  const write = { req, overrideAccess: true } as const;
  const tenant = (await payload.create({
    collection: "tenants",
    data: {
      name: DEMO_NAME,
      slug: DEMO_SLUG,
      modules: ALL_TENANT_MODULES,
      status: "pilot",
      quotePrefix: "DM",
      notes: "Satış sunumu için örnek verili işletme. Panodaki Demo işletmesi kutusundan sıfırlanır.",
      profile: { legalName: "Demo İşletme (kurmaca)", email: "merhaba@demo-isletme.example.com", phone: "0212 000 00 00", website: "https://demo-isletme.example.com", address: "Örnek Mah. Deneme Cad. No: 1, İstanbul" },
    },
    ...write,
  })).id;
  const t = { tenant };
  const me = req.user?.id;

  const companies = [];
  for (const c of COMPANIES) companies.push((await payload.create({ collection: "companies", data: { ...c, ...t }, ...write })).id);
  const contacts = [];
  for (const c of CONTACTS) {
    contacts.push(
      (await payload.create({
        collection: "contacts",
        data: { name: c.name, title: c.title, email: c.email, source: c.source, company: c.company === null ? null : companies[c.company], ...t },
        ...write,
      })).id,
    );
  }
  const deals = [];
  for (const [i, d] of DEALS.entries()) {
    const closed = d.stage === "kazanildi" || d.stage === "kaybedildi";
    deals.push(
      (await payload.create({
        collection: "deals",
        data: {
          title: d.title,
          contact: contacts[d.contact],
          value: d.value,
          stage: d.stage,
          expectedClose: day(d.close),
          service: d.service,
          order: i,
          owner: me,
          ...(closed ? { closedAt: day(d.close) } : {}),
          ...("lost" in d ? { lostReason: d.lost } : {}),
          ...t,
        },
        ...write,
      })).id,
    );
  }

  const activities = [
    { type: "gorev", title: "Teklifi telefonla takip edin", dueAt: day(0), deal: 0 },
    { type: "arama", title: "Keşif randevusu için arayın", dueAt: day(-1), deal: 2 },
    { type: "toplanti", title: "Tasarım sunumu", dueAt: day(3), deal: 1 },
    { type: "not", title: "Bütçe ilk çeyreğe kaldı", body: "Yeni yılda tekrar görüşülecek.", deal: 5, done: true },
    { type: "eposta", title: "Malzeme kataloğu gönderildi", deal: 6, done: true },
  ] as const;
  for (const a of activities) {
    await payload.create({
      collection: "activities",
      data: { type: a.type, title: a.title, ...("body" in a ? { body: a.body } : {}), ...("dueAt" in a ? { dueAt: a.dueAt } : {}), done: "done" in a, deal: deals[a.deal], contact: contacts[DEALS[a.deal].contact], owner: me, ...t },
      ...write,
    });
  }

  await payload.create({
    collection: "quotes",
    data: {
      title: "Ofis yenileme teklifi",
      deal: deals[0],
      contact: contacts[0],
      company: companies[0],
      status: "gonderildi",
      issueDate: day(-2),
      validUntil: day(13),
      items: [
        { description: "Keşif, yerleşim planı ve 3B tasarım", qty: 1, unit: "iş", unitPrice: 45000, vatRate: "20" },
        { description: "Bölme duvar ve tavan uygulaması", qty: 180, unit: "m²", unitPrice: 1200, vatRate: "20" },
        { description: "Aydınlatma ve elektrik", qty: 1, unit: "iş", unitPrice: 68000, vatRate: "20" },
        { description: "Mobilya montajı", qty: 1, unit: "iş", unitPrice: 37000, vatRate: "20" },
      ],
      terms: "Örnek koşullar: %40 peşin, %60 teslimde. Teklif 15 gün geçerlidir.",
      owner: me,
      ...t,
    },
    ...write,
  });

  const template = await payload.create({
    collection: "templates",
    data: { ...TEMPLATE, ...t, steps: TEMPLATE.steps.map((s) => ({ ...s, priority: "normal" as const, assignee: me, checklist: s.checklist.map((text) => ({ text })) })) },
    ...write,
  });
  /* Kazanılan fırsatın işi: şablon adımları görev olarak açılır; ilk adımlar ilerlemiş görünür */
  const project = await payload.create({
    collection: "projects",
    data: { title: "Lobi yenileme · Örnek Otel", company: companies[3], contact: contacts[3], deal: deals[3], template: template.id, startDate: dayOnly(-8), status: "aktif", owner: me, ...t },
    ...write,
  });
  const tasks = await payload.find({ collection: "tasks", where: { project: { equals: project.id } }, sort: "startDate", limit: 20, depth: 0, ...write });
  const stages = ["tamam", "tamam", "kontrol", "devam"] as const;
  for (const [i, task] of tasks.docs.entries()) {
    const to = stages[i];
    if (!to) continue;
    /* Görev akışı: Tamam'a Kontrol'den, kontrol listesi bitmiş olarak geçilir */
    const checklist = to === "tamam" ? (task.checklist ?? []).map((c) => ({ ...c, done: true })) : undefined;
    for (const stage of to === "tamam" ? (["kontrol", "tamam"] as const) : [to]) await payload.update({ collection: "tasks", id: task.id, data: { stage, ...(checklist ? { checklist } : {}) }, ...write });
  }

  /* Sohbet: biri asistanla kapanmış, biri ekipten yanıt bekliyor */
  const chat = await chatConfigOf(payload, tenant, req);
  await payload.update({
    collection: "chatbot-config",
    id: chat.id,
    data: { enabled: true, botName: "Demo Asistan", greeting: "Merhaba, ben Demo Asistan. Keşif randevusu, fiyat ya da çalışma saatleri hakkında sorabilirsiniz.", suggestions: [{ text: "Keşif ücretli mi?" }, { text: "Ne kadar sürede teklif alırım?" }] },
    ...write,
  });
  for (const k of KNOWLEDGE) await payload.create({ collection: "knowledge", data: { ...k, active: true, source: "elle", ...t }, ...write });
  const convs = [
    {
      conv: { name: "Mehmet Deneme", email: "mehmet@ornek-kafe.example.com", status: "kapali", contact: contacts[1], page: "/hizmetler", lastText: "Teşekkürler, teklif bekliyorum." },
      msgs: [
        ["ziyaretci", "Merhaba, kafemiz için iç mimari hizmeti veriyor musunuz?"],
        ["bot", "Merhaba, evet. Şube ve mağaza iç mimarisi yapıyoruz. Her proje yerinde keşifle başlar; keşiften sonraki 3 iş günü içinde yazılı teklif gönderilir. Keşif randevusu ister misiniz?"],
        ["ziyaretci", "Teşekkürler, teklif bekliyorum."],
      ],
    },
    {
      conv: { name: "Selin Örnek", email: "selin@example.com", status: "ekip", needsReply: true, page: "/iletisim", lastText: "Cumartesi keşif yapabiliyor musunuz?", handedOffAt: day(0) },
      msgs: [
        ["ziyaretci", "Evimizin mutfağını yenilemek istiyoruz."],
        ["bot", "Memnuniyetle yardımcı oluruz. Mutfak tasarımı için önce yerinde ölçü alıyoruz. Sizi ekibimize bağlıyorum."],
        ["sistem", "Sohbet ekibe aktarıldı."],
        ["ziyaretci", "Cumartesi keşif yapabiliyor musunuz?"],
      ],
    },
  ] as const;
  for (const c of convs) {
    const conv = await payload.create({ collection: "conversations", data: { ...c.conv, visitorMessages: c.msgs.filter((m) => m[0] === "ziyaretci").length, lastMessageAt: new Date().toISOString(), ...t }, ...write });
    for (const [role, text] of c.msgs) await payload.create({ collection: "chat-messages", data: { conversation: conv.id, role, text, ...t }, ...write });
  }

  /* Siteden gelen talep ve randevu (otomasyon kapalı: kişi ve fırsat yukarıda) */
  await payload.create({
    collection: "leads",
    data: { name: "Elif Örnek", email: "elif@example.com", service: "Mutfak tasarımı", message: "Mutfağımızı yenilemek istiyoruz, yaklaşık 12 m².", status: "yeni", source: "/iletisim", contact: contacts[4], deal: deals[4], ...t },
    ...write,
  });
  await payload.create({
    collection: "bookings",
    data: { name: "Zeynep Örnek", email: "zeynep@ornek-hukuk.example.com", date: day(2), time: "11:00", topic: "Toplantı salonu keşfi", status: "onaylandi", source: "/iletisim", contact: contacts[2], deal: deals[2], ...t },
    ...write,
  });

  await siteConnectionOf(payload, tenant, req);
  resetKnowledge();
  return tenant;
}

export const demoTenant: PayloadHandler = async (req) => {
  if (!isAdminUser(req.user)) return json({ ok: false, error: "Yalnız Guru yöneticisi." }, 403);
  await addDataAndFileToRequest(req);
  const reset = Boolean((req.data as { reset?: unknown } | undefined)?.reset);
  /* Örnek kayıtlar otomasyonu (görev, bildirim, işlem geçmişi) tetiklemez */
  req.context = { ...req.context, [CRM_SKIP]: true };
  const found = await req.payload.find({ collection: "tenants", where: { slug: { equals: DEMO_SLUG } }, limit: 1, depth: 0, req, overrideAccess: true });
  const existing = found.docs[0];
  if (existing && !reset) return json({ ok: true, id: existing.id, created: false });
  try {
    if (existing) await req.payload.delete({ collection: "tenants", id: existing.id, req, overrideAccess: true });
    const id = await seed(req);
    return json({ ok: true, id, created: true });
  } catch (err) {
    req.payload.logger.error({ err }, "Demo işletmesi kurulamadı");
    /* Yarım kalan kurulum bırakılmaz */
    const half = await req.payload.find({ collection: "tenants", where: { slug: { equals: DEMO_SLUG } }, limit: 1, depth: 0, req, overrideAccess: true }).catch(() => null);
    if (half?.docs[0]) await req.payload.delete({ collection: "tenants", id: half.docs[0].id, req, overrideAccess: true }).catch(() => null);
    return json({ ok: false, error: "Demo işletmesi kurulamadı. Ayrıntı sunucu kaydında." }, 500);
  }
};
