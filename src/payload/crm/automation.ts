import type { PayloadRequest } from "payload";
import { defaultTenantId } from "./tenant";
import { stageLabel } from "./stages";

/**
 * Sitedeki formlardan CRM'e akış. Talep gelince: kişi (e-postaya göre bulunur
 * ya da açılır), "Aday" aşamasında fırsat, kayıt notu ve ertesi iş günü için
 * "İlk dönüşü yapın" görevi. Randevu gelince: kişi, açık fırsat ("Aday" ise "Görüşme"ye geçer; yoksa
 * "Görüşme" aşamasında yeni fırsat) ve toplantı kaydı.
 * Hepsi aynı istek (req) üzerinden çalışır; biri hata verirse talep yine kaydedilir.
 */

type Id = number | string;
export const CRM_SKIP = "crmSkip";

/**
 * Otomasyonun kendi yazdığı kayıtlar hook'ları yeniden tetiklemesin diye
 * CRM_SKIP işaretiyle yazılır. Payload işareti req.context'e kalıcı olarak
 * birleştirir; aynı istekteki sonraki işlemler etkilenmesin diye geri alınır.
 */
async function quietly<T>(req: PayloadRequest, run: () => Promise<T>): Promise<T> {
  const prev = req.context?.[CRM_SKIP];
  try {
    return await run();
  } finally {
    req.context = { ...req.context, [CRM_SKIP]: prev };
  }
}
const idOf = (v: unknown): Id | undefined =>
  v && typeof v === "object" ? (v as { id?: Id }).id : (v as Id | undefined) ?? undefined;

/** Ertesi iş günü, İstanbul saatiyle 10:00 (UTC 07:00) */
export function nextBusinessDay(from = new Date()): string {
  const d = new Date(from);
  do d.setUTCDate(d.getUTCDate() + 1);
  while (d.getUTCDay() === 0 || d.getUTCDay() === 6);
  d.setUTCHours(7, 0, 0, 0);
  return d.toISOString();
}

/** Kişi e-postaya göre YALNIZ aynı işletmede aranır: iki işletmenin kişileri asla birleşmez */
export async function findOrCreateContact(
  req: PayloadRequest,
  input: { name: string; email: string; phone?: string | null; source: string; tenant: Id },
): Promise<Id> {
  const email = input.email.trim().toLocaleLowerCase("tr-TR");
  const found = await req.payload.find({
    collection: "contacts",
    where: { and: [{ email: { equals: email } }, { tenant: { equals: input.tenant } }] },
    limit: 1,
    depth: 0,
    req,
    overrideAccess: true,
  });
  const existing = found.docs[0];
  if (existing) {
    if (!existing.phone && input.phone) {
      await quietly(req, async () => req.payload.update({ collection: "contacts", id: existing.id, data: { phone: input.phone }, req, overrideAccess: true, context: { [CRM_SKIP]: true } }));
    }
    return existing.id;
  }
  const created = await quietly(req, async () => req.payload.create({
    collection: "contacts",
    data: { name: input.name, email, phone: input.phone || undefined, source: input.source as never, tenant: Number(input.tenant) },
    req,
    overrideAccess: true,
    context: { [CRM_SKIP]: true },
  }));
  return created.id;
}

async function openDealOf(req: PayloadRequest, contact: Id) {
  const res = await req.payload.find({
    collection: "deals",
    where: { and: [{ contact: { equals: contact } }, { stage: { in: ["aday", "gorusme", "teklif"] } }] },
    sort: "-updatedAt",
    limit: 1,
    depth: 0,
    req,
    overrideAccess: true,
  });
  return res.docs[0];
}

export async function logActivity(
  req: PayloadRequest,
  data: { type: string; title: string; body?: string; deal?: Id; contact?: Id; company?: Id; booking?: Id; dueAt?: string; done?: boolean },
) {
  return quietly(req, async () => req.payload.create({
    collection: "activities",
    /* İşletme fırsattan ya da kişiden gelir (fillTenant) */
    data: { ...data, done: data.done ?? data.type !== "gorev" } as never,
    req,
    overrideAccess: true,
    context: { [CRM_SKIP]: true },
  }));
}

/** Talep (leads) oluşturulunca */
export async function leadToCrm(
  req: PayloadRequest,
  lead: { id: Id; name: string; email: string; phone?: string | null; service?: string | null; subject?: string | null; message: string; source?: string | null; tenant?: unknown },
  via: "form" | "chatbot" = "form",
) {
  const tenant = idOf(lead.tenant) ?? (await defaultTenantId(req));
  const contact = await findOrCreateContact(req, { name: lead.name, email: lead.email, phone: lead.phone, source: via, tenant });
  const topic = lead.service || lead.subject || "Siteden talep";
  const deal = await quietly(req, async () => req.payload.create({
    collection: "deals",
    data: { title: `${topic} · ${lead.name}`, contact, stage: "aday", service: lead.service || undefined, lead: lead.id, tenant } as never,
    req,
    overrideAccess: true,
    context: { [CRM_SKIP]: true },
  }));
  await logActivity(req, { type: "sistem", title: via === "chatbot" ? "Sohbetten talep geldi" : "Siteden talep geldi", body: [lead.subject, lead.message, lead.source && `Sayfa: ${lead.source}`].filter(Boolean).join("\n\n"), deal: deal.id, contact });
  await logActivity(req, { type: "gorev", title: `İlk dönüşü yapın: ${lead.name}`, deal: deal.id, contact, dueAt: nextBusinessDay(), done: false });
  await quietly(req, async () => req.payload.update({ collection: "leads", id: lead.id, data: { contact, deal: deal.id } as never, req, overrideAccess: true, context: { [CRM_SKIP]: true } }));
}

/** Randevu (bookings) oluşturulunca */
export async function bookingToCrm(req: PayloadRequest, b: { id: Id; name: string; email: string; phone?: string | null; topic?: string | null; note?: string | null; date: string; time: string; tenant?: unknown }) {
  const tenant = idOf(b.tenant) ?? (await defaultTenantId(req));
  const contact = await findOrCreateContact(req, { name: b.name, email: b.email, phone: b.phone, source: "randevu", tenant });
  let deal = await openDealOf(req, contact);
  /* Toplantı alındıysa fırsat en az "Görüşme" aşamasındadır (aşama kaydı ve talep durumu da güncellenir) */
  if (deal?.stage === "aday") deal = await req.payload.update({ collection: "deals", id: deal.id, data: { stage: "gorusme" }, req, overrideAccess: true });
  if (!deal) {
    deal = await quietly(req, async () => req.payload.create({
      collection: "deals",
      data: { title: `${b.topic || "Tanışma toplantısı"} · ${b.name}`, contact, stage: "gorusme", tenant } as never,
      req,
      overrideAccess: true,
      context: { [CRM_SKIP]: true },
    }));
  }
  await logActivity(req, {
    type: "toplanti",
    title: `Toplantı: ${b.topic || b.name}`,
    body: b.note || undefined,
    deal: deal.id,
    contact,
    booking: b.id,
    dueAt: meetingAt(b.date, b.time),
    done: false,
  });
  await quietly(req, async () => req.payload.update({ collection: "bookings", id: b.id, data: { contact, deal: deal.id } as never, req, overrideAccess: true, context: { [CRM_SKIP]: true } }));
}

/** Randevu günü (öğlen UTC) + "14:00" → İstanbul saatiyle o an (UTC+3) */
export function meetingAt(date: string, time: string): string {
  const day = new Date(date).toISOString().slice(0, 10);
  const [h, m] = time.split(":").map(Number);
  return new Date(Date.UTC(Number(day.slice(0, 4)), Number(day.slice(5, 7)) - 1, Number(day.slice(8, 10)), h - 3, m)).toISOString();
}

/** Randevu değişince bağlı toplantı kaydı da güncellenir (saat, iptal, tamamlandı) */
export async function syncBookingActivity(req: PayloadRequest, b: { id: Id; date: string; time: string; status: string }) {
  const res = await req.payload.find({ collection: "activities", where: { booking: { equals: b.id } }, limit: 1, depth: 0, req, overrideAccess: true });
  const act = res.docs[0];
  if (!act) return;
  await quietly(req, async () => req.payload.update({
    collection: "activities",
    id: act.id,
    data: { dueAt: meetingAt(b.date, b.time), done: b.status === "tamamlandi" || b.status === "iptal", ...(b.status === "iptal" ? { title: act.title.startsWith("İptal") ? act.title : `İptal edildi · ${act.title}` } : {}) },
    req,
    overrideAccess: true,
    context: { [CRM_SKIP]: true },
  }));
}

/* Fırsat aşaması talebin durumuna yansır: talepler listesi CRM ile aynı şeyi söyler */
const LEAD_STATUS_FOR: Record<string, string> = { aday: "yeni", gorusme: "iletisim", teklif: "teklif", kazanildi: "kazanildi", kaybedildi: "kaybedildi" };

export async function dealStageChanged(req: PayloadRequest, deal: { id: Id; stage: string; lead?: unknown; contact?: unknown; company?: unknown; lostReason?: string | null }, from: string) {
  await logActivity(req, {
    type: "sistem",
    title: `Aşama: ${stageLabel(from)} → ${stageLabel(deal.stage)}`,
    body: deal.stage === "kaybedildi" && deal.lostReason ? `Neden: ${deal.lostReason}` : undefined,
    deal: deal.id,
    contact: idOf(deal.contact),
    company: idOf(deal.company),
  });
  const lead = idOf(deal.lead);
  if (lead && LEAD_STATUS_FOR[deal.stage]) {
    await quietly(req, async () => req.payload.update({ collection: "leads", id: lead, data: { status: LEAD_STATUS_FOR[deal.stage] } as never, req, overrideAccess: true, context: { [CRM_SKIP]: true } }));
  }
}

export { idOf };
