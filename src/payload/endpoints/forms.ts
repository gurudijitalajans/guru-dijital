import { APIError, addDataAndFileToRequest, type PayloadHandler, type PayloadRequest } from "payload";
import type { Booking } from "@/payload-types";
import { notifyTeam } from "../notify";
import { bookingToCrm, leadToCrm } from "../crm/automation";
import { defaultTenantId } from "../crm/tenant";
import { connectionByKey } from "../channels/collections";
import { addUsage } from "../channels/usage";
import { clientIp, dayKey, rateLimited } from "../utils";

/* Sitedeki formlarla aynı kurallar; istemci doğrulaması atlatılsa da geçerli. */
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DAY_RE = /^\d{4}-\d{2}-\d{2}$/;
const SLOTS = new Set(["10:00", "11:00", "13:00", "14:00", "15:00", "16:00"]);

type Body = Record<string, unknown>;
export const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

const fail = (status: number, error: string, extra?: Body) => Response.json({ ok: false, error, ...extra }, { status });

async function readBody(req: Parameters<PayloadHandler>[0]): Promise<Body> {
  await addDataAndFileToRequest(req);
  return (req.data ?? {}) as Body;
}

/** Bal küpü doluysa bot kabul edilir: başarı döner ama kayıt yazılmaz. */
const isBot = (body: Body) => str(body.website, 200).length > 0;

export type LeadInput = { name: string; email: string; phone?: string; service?: string; subject?: string; message: string; source?: string };
export type BookingInput = { name: string; email: string; phone?: string; topic?: string; note?: string; source?: string; day: string; time: string };
type Result = { ok: true; id: number | string } | { ok: false; status: number; error: string; code?: string };

/**
 * Talebi doğrular, kaydeder, CRM'e aktarır ve ekibe bildirir. Site formu ve
 * sohbet asistanı aynı kuralları kullanır. `via` CRM'deki kaynak etiketidir.
 */
export async function createLead(req: PayloadRequest, input: LeadInput, via: "form" | "chatbot" = "form", tenantId?: number | string): Promise<Result> {
  const tenant = Number(tenantId ?? (await defaultTenantId(req)));
  const data = {
    name: str(input.name, 120),
    email: str(input.email, 160),
    phone: str(input.phone, 40),
    service: str(input.service, 120),
    subject: str(input.subject, 200),
    message: str(input.message, 4000),
    source: str(input.source, 200),
  };
  if (!data.name || !EMAIL_RE.test(data.email) || !data.message) {
    return { ok: false, status: 400, error: "Lütfen ad, geçerli bir e-posta ve mesaj yazın." };
  }
  const lead = await req.payload.create({ collection: "leads", data: { ...data, status: "yeni", tenant }, overrideAccess: true });
  /* Talep kaydedildi; CRM aktarımı (kişi, fırsat, görev) ayrı işlemlerde, hata talebi etkilemez */
  await leadToCrm(req, lead, via).catch((err) => req.payload.logger.error({ err }, "CRM: talep aktarılamadı"));
  await notifyTeam(req, {
    subject: `Yeni talep${via === "chatbot" ? " (sohbet)" : ""}: ${data.subject || data.service || data.name}`,
    intro: via === "chatbot" ? "Sitedeki sohbet asistanı yeni bir talep aldı." : "Siteden yeni bir talep geldi.",
    rows: [
      ["Ad Soyad", data.name],
      ["E-posta", data.email],
      ["Telefon", data.phone],
      ["Hizmet / ürün", data.service],
      ["Konu", data.subject],
      ["Mesaj", data.message],
      ["Geldiği sayfa", data.source],
    ],
    replyTo: data.email,
    adminPath: `/collections/leads/${lead.id}`,
    tenant,
  });
  return { ok: true, id: lead.id };
}

/** Randevuyu doğrular (gün, saat, hafta içi, dolu saat), kaydeder, CRM'e aktarır ve bildirir. */
export async function createBooking(req: PayloadRequest, input: BookingInput, tenantId?: number | string): Promise<Result> {
  const tenant = Number(tenantId ?? (await defaultTenantId(req)));
  const day = str(input.day, 10);
  const time = str(input.time, 5);
  const data = {
    name: str(input.name, 120),
    email: str(input.email, 160),
    phone: str(input.phone, 40),
    topic: str(input.topic, 160),
    note: str(input.note, 2000),
    source: str(input.source, 200),
  };
  if (!DAY_RE.test(day) || !SLOTS.has(time) || !data.name || !EMAIL_RE.test(data.email)) {
    return { ok: false, status: 400, error: "Lütfen gün, saat, ad ve geçerli bir e-posta girin." };
  }
  /* Öğlen UTC: Türkiye saatinde de aynı güne düşer */
  const date = new Date(`${day}T12:00:00.000Z`);
  if (Number.isNaN(date.getTime()) || dayKey(date) <= dayKey(new Date())) {
    return { ok: false, status: 400, error: "Lütfen yarın ya da daha ileri bir gün seçin." };
  }
  /* Takvim yalnız hafta içini gösterir; doğrudan istekle hafta sonu alınamaz */
  if (date.getUTCDay() === 0 || date.getUTCDay() === 6) {
    return { ok: false, status: 400, error: "Toplantılar hafta içi günlerde planlanabiliyor." };
  }

  let bookingId: number | string;
  try {
    const booking = await req.payload.create({
      collection: "bookings",
      data: { ...data, date: date.toISOString(), time: time as Booking["time"], status: "bekliyor", tenant },
      overrideAccess: true,
    });
    bookingId = booking.id;
    await bookingToCrm(req, booking).catch((err) => req.payload.logger.error({ err }, "CRM: randevu aktarılamadı"));
  } catch (err) {
    if (err instanceof APIError && err.status === 409) return { ok: false, status: 409, error: err.message, code: "dolu" };
    throw err;
  }
  const dayLabel = date.toLocaleDateString("tr-TR", { timeZone: "Europe/Istanbul", day: "numeric", month: "long", year: "numeric", weekday: "long" });
  await notifyTeam(req, {
    subject: `Yeni randevu: ${dayLabel} ${time}`,
    intro: "Siteden yeni bir toplantı talebi geldi. Panelden onaylayabilirsiniz.",
    rows: [
      ["Gün ve saat", `${dayLabel}, ${time}`],
      ["Ad Soyad", data.name],
      ["E-posta", data.email],
      ["Telefon", data.phone],
      ["Konu", data.topic],
      ["Not", data.note],
      ["Geldiği sayfa", data.source],
    ],
    replyTo: data.email,
    adminPath: `/collections/bookings/${bookingId}`,
    tenant,
  });
  return { ok: true, id: bookingId };
}

/** POST /api/leads/gonder */
export const submitLead: PayloadHandler = async (req) => {
  /* Oturumsuz site isteği sunucu adına yazar: çok kiracılı eklenti işletme atamasını ancak yerel işlemde kabul eder */
  req.payloadAPI = "local";
  if (rateLimited(`lead:${clientIp(req.headers)}`, 8)) {
    return fail(429, "Kısa sürede çok fazla gönderim yapıldı. Lütfen birkaç dakika sonra tekrar deneyin.");
  }
  const body = await readBody(req);
  if (isBot(body)) return Response.json({ ok: true });
  /* Gömülü form: site anahtarından işletme; formu kapalı ya da CRM'i olmayan işletmeye yazılmaz */
  let tenant: number | undefined;
  if (body.k) {
    const conn = await connectionByKey(req.payload, body.k, req);
    const t = conn?.tenant ? await req.payload.findByID({ collection: "tenants", id: typeof conn.tenant === "object" ? conn.tenant.id : conn.tenant, depth: 0, req, overrideAccess: true }).catch(() => null) : null;
    if (!conn || !t || t.status === "askida" || !(t.modules ?? []).includes("crm") || conn.form?.enabled === false) return fail(404, "Form bulunamadı.");
    if (conn.form?.consentText && body.consent !== true && body.consent !== "true") return fail(400, "Devam etmek için onay kutusunu işaretleyin.");
    tenant = t.id;
  }
  const res = await createLead(req, body as unknown as LeadInput, "form", tenant);
  if (res.ok && tenant) await addUsage(req.payload, tenant, { formLeads: 1 }, req);
  return res.ok ? Response.json({ ok: true }) : fail(res.status, res.error);
};

/** POST /api/bookings/gonder */
export const submitBooking: PayloadHandler = async (req) => {
  req.payloadAPI = "local";
  if (rateLimited(`booking:${clientIp(req.headers)}`)) {
    return fail(429, "Kısa sürede çok fazla gönderim yapıldı. Lütfen birkaç dakika sonra tekrar deneyin.");
  }
  const body = await readBody(req);
  if (isBot(body)) return Response.json({ ok: true });
  const res = await createBooking(req, body as unknown as BookingInput);
  return res.ok ? Response.json({ ok: true }) : fail(res.status, res.error, res.code ? { code: res.code } : undefined);
};

/** Önümüzdeki dolu saatler ("YYYY-MM-DD HH:MM"); sohbet asistanı da boş saat önerirken kullanır */
export async function busySlotList(req: PayloadRequest, tenantId?: number | string): Promise<string[]> {
  const today = dayKey(new Date());
  const tenant = tenantId ?? (await defaultTenantId(req));
  const res = await req.payload.find({
    collection: "bookings",
    where: {
      and: [{ status: { not_equals: "iptal" } }, { slot: { greater_than: today } }, { tenant: { equals: tenant } }],
    },
    select: { slot: true },
    limit: 500,
    depth: 0,
    pagination: false,
    overrideAccess: true,
  });
  return res.docs.map((d) => (d as { slot?: string | null }).slot).filter((v): v is string => Boolean(v));
}

export const SLOT_TIMES = [...SLOTS];

/** GET /api/bookings/dolu: önümüzdeki dolu saatler, kişisel veri olmadan. */
export const busySlots: PayloadHandler = async (req) => {
  const slots = await busySlotList(req);
  return Response.json({ slots }, { headers: { "Cache-Control": "no-store" } });
};
