import { APIError, addDataAndFileToRequest, type PayloadHandler } from "payload";
import type { Booking } from "@/payload-types";
import { clientIp, dayKey, rateLimited } from "../utils";

/* Sitedeki formlarla aynı kurallar; istemci doğrulaması atlatılsa da geçerli. */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DAY_RE = /^\d{4}-\d{2}-\d{2}$/;
const SLOTS = new Set(["10:00", "11:00", "13:00", "14:00", "15:00", "16:00"]);

type Body = Record<string, unknown>;
const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

const fail = (status: number, error: string, extra?: Body) => Response.json({ ok: false, error, ...extra }, { status });

async function readBody(req: Parameters<PayloadHandler>[0]): Promise<Body> {
  await addDataAndFileToRequest(req);
  return (req.data ?? {}) as Body;
}

/** Bal küpü doluysa bot kabul edilir: başarı döner ama kayıt yazılmaz. */
const isBot = (body: Body) => str(body.website, 200).length > 0;

/** POST /api/leads/gonder */
export const submitLead: PayloadHandler = async (req) => {
  if (rateLimited(`lead:${clientIp(req.headers)}`)) {
    return fail(429, "Kısa sürede çok fazla gönderim yapıldı. Lütfen birkaç dakika sonra tekrar deneyin.");
  }
  const body = await readBody(req);
  if (isBot(body)) return Response.json({ ok: true });

  const data = {
    name: str(body.name, 120),
    email: str(body.email, 160),
    phone: str(body.phone, 40),
    service: str(body.service, 120),
    subject: str(body.subject, 200),
    message: str(body.message, 4000),
    source: str(body.source, 200),
  };
  if (!data.name || !EMAIL_RE.test(data.email) || !data.message) {
    return fail(400, "Lütfen ad, geçerli bir e-posta ve mesaj yazın.");
  }

  await req.payload.create({ collection: "leads", data: { ...data, status: "yeni" }, overrideAccess: true });
  return Response.json({ ok: true });
};

/** POST /api/bookings/gonder */
export const submitBooking: PayloadHandler = async (req) => {
  if (rateLimited(`booking:${clientIp(req.headers)}`)) {
    return fail(429, "Kısa sürede çok fazla gönderim yapıldı. Lütfen birkaç dakika sonra tekrar deneyin.");
  }
  const body = await readBody(req);
  if (isBot(body)) return Response.json({ ok: true });

  const day = str(body.day, 10);
  const time = str(body.time, 5);
  const data = {
    name: str(body.name, 120),
    email: str(body.email, 160),
    phone: str(body.phone, 40),
    topic: str(body.topic, 160),
    note: str(body.note, 2000),
    source: str(body.source, 200),
  };
  if (!DAY_RE.test(day) || !SLOTS.has(time) || !data.name || !EMAIL_RE.test(data.email)) {
    return fail(400, "Lütfen gün, saat, ad ve geçerli bir e-posta girin.");
  }
  /* Öğlen UTC: Türkiye saatinde de aynı güne düşer */
  const date = new Date(`${day}T12:00:00.000Z`);
  if (Number.isNaN(date.getTime()) || dayKey(date) <= dayKey(new Date())) {
    return fail(400, "Lütfen yarın ya da daha ileri bir gün seçin.");
  }

  try {
    await req.payload.create({
      collection: "bookings",
      data: { ...data, date: date.toISOString(), time: time as Booking["time"], status: "bekliyor" },
      overrideAccess: true,
    });
  } catch (err) {
    if (err instanceof APIError && err.status === 409) return fail(409, err.message, { code: "dolu" });
    throw err;
  }
  return Response.json({ ok: true });
};

/** GET /api/bookings/dolu: önümüzdeki dolu saatler, kişisel veri olmadan. */
export const busySlots: PayloadHandler = async (req) => {
  const today = dayKey(new Date());
  const res = await req.payload.find({
    collection: "bookings",
    where: {
      and: [{ status: { not_equals: "iptal" } }, { slot: { greater_than: today } }],
    },
    select: { slot: true },
    limit: 500,
    depth: 0,
    pagination: false,
    overrideAccess: true,
  });
  const slots = res.docs.map((d) => (d as { slot?: string | null }).slot).filter(Boolean);
  return Response.json({ slots }, { headers: { "Cache-Control": "no-store" } });
};
