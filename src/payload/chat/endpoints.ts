import { randomBytes } from "crypto";
import { addDataAndFileToRequest, type PayloadHandler, type PayloadRequest } from "payload";
import type { ChatbotConfig, Conversation } from "@/payload-types";
import { defaultTenantId, idOf } from "../crm/tenant";
import { chatConfigOf } from "./collections";
import { clientIp, rateLimited } from "../utils";
import { botReply } from "./engine";

/**
 * Sitedeki sohbet balonunun uçları (oturum gerektirmez). Ziyaretçi ilk mesajda
 * sunucunun ürettiği gizli bir anahtar alır; geçmişi ve ekip yanıtlarını yalnız
 * bu anahtarla okur. Kişisel veri dönülmez, yalnız mesaj metinleri.
 *   POST /api/conversations/mesaj  { token?, text, page }
 *   GET  /api/conversations/akis?token=…&after=ISO
 *   GET  /api/conversations/gecmis?token=…
 */

const MAX_TEXT = 1500;
const MAX_VISITOR_MESSAGES = 60;
type Out = { id: number | string; role: string; text: string; at: string; author?: string };

const fail = (status: number, error: string) => Response.json({ ok: false, error }, { status, headers: { "Cache-Control": "no-store" } });
const ok = (body: Record<string, unknown>) => Response.json({ ok: true, ...body }, { headers: { "Cache-Control": "no-store" } });

/* Bugün balon yalnız Guru'nun sitesinde: işletme Guru Dijital. Müşteri sitesine gömülünce işletme anahtarından gelecek. */
async function siteTenant(req: PayloadRequest) {
  return defaultTenantId(req);
}
async function settingsOf(req: PayloadRequest, tenant: number | string): Promise<ChatbotConfig> {
  return chatConfigOf(req.payload, tenant, req);
}

/* Oturumsuz site isteği sunucu adına yazar: çok kiracılı eklenti işletme atamasını ancak yerel işlemde kabul eder */
const asServer = (req: PayloadRequest) => {
  req.user = null;
  req.payloadAPI = "local";
};

async function byToken(req: PayloadRequest, token: unknown): Promise<Conversation | null> {
  if (typeof token !== "string" || !/^[A-Za-z0-9_-]{20,64}$/.test(token)) return null;
  const res = await req.payload.find({ collection: "conversations", where: { token: { equals: token } }, limit: 1, depth: 0, req, overrideAccess: true });
  return (res.docs[0] as Conversation | undefined) ?? null;
}

async function messagesOf(req: PayloadRequest, conv: Conversation, after?: string): Promise<Out[]> {
  const res = await req.payload.find({
    collection: "chat-messages",
    where: { and: [{ conversation: { equals: conv.id } }, ...(after ? [{ createdAt: { greater_than: after } }] : [])] },
    sort: "createdAt",
    limit: 200,
    depth: 1,
    req,
    overrideAccess: true,
  });
  return res.docs.map((m) => ({
    id: m.id,
    role: m.role,
    text: m.text,
    at: m.createdAt,
    ...(m.role === "ekip" && m.author && typeof m.author === "object" ? { author: m.author.name.split(" ")[0] } : {}),
  }));
}

/** POST /api/conversations/mesaj */
export const chatSend: PayloadHandler = async (req) => {
  /* Panele girmiş biri siteden yazsa da ziyaretçi sayılır (mesaj ekip mesajına dönmesin) */
  asServer(req);
  const tenant = await siteTenant(req);
  const settings = await settingsOf(req, tenant);
  if (!settings.enabled) return fail(403, "Sohbet şu an kapalı. İletişim sayfasından bize yazabilirsiniz.");
  if (rateLimited(`chat:${clientIp(req.headers)}`, 25)) return fail(429, "Kısa sürede çok fazla mesaj gönderildi. Lütfen birkaç dakika sonra tekrar deneyin.");
  await addDataAndFileToRequest(req);
  const body = (req.data ?? {}) as Record<string, unknown>;
  if (typeof body.website === "string" && body.website) return ok({ messages: [] });
  const text = typeof body.text === "string" ? body.text.trim().slice(0, MAX_TEXT) : "";
  if (!text) return fail(400, "Mesaj boş olamaz.");
  const page = typeof body.page === "string" ? body.page.slice(0, 200) : "";

  let conv = body.token ? await byToken(req, body.token) : null;
  /* Başka işletmenin sohbet anahtarıyla yazılamaz */
  if (conv && String(idOf(conv.tenant)) !== String(tenant)) conv = null;
  let token = typeof body.token === "string" ? body.token : "";
  if (!conv) {
    token = randomBytes(24).toString("base64url");
    conv = (await req.payload.create({
      collection: "conversations",
      data: { token, status: "bot", page, tenant: Number(tenant), visitorMessages: 0 },
      req,
      overrideAccess: true,
    })) as Conversation;
  }
  if ((conv.visitorMessages ?? 0) >= MAX_VISITOR_MESSAGES) return fail(429, "Bu sohbet çok uzadı. Ekibimize iletişim sayfasından yazabilirsiniz.");

  const visitor = await req.payload.create({
    collection: "chat-messages",
    data: { conversation: conv.id, role: "ziyaretci", text, tenant: conv.tenant as number },
    req,
    overrideAccess: true,
  });
  const reopen = conv.status === "kapali";
  conv = (await req.payload.update({
    collection: "conversations",
    id: conv.id,
    data: {
      lastMessageAt: visitor.createdAt,
      lastText: text.slice(0, 160),
      visitorMessages: (conv.visitorMessages ?? 0) + 1,
      ...(reopen ? { status: "bot" } : {}),
      /* Ekipteki sohbette her ziyaretçi mesajı yanıt bekler */
      ...(conv.status === "ekip" ? { needsReply: true } : {}),
    },
    req,
    overrideAccess: true,
  })) as Conversation;

  if (conv.status === "bot") await botReply(req, conv, settings);

  const fresh = (await req.payload.findByID({ collection: "conversations", id: conv.id, depth: 0, req, overrideAccess: true })) as Conversation;
  const messages = await messagesOf(req, conv, new Date(new Date(visitor.createdAt).getTime() - 1).toISOString());
  return ok({ token, status: fresh.status, messages });
};

/** GET /api/conversations/akis: ekip yanıtları için yoklama */
export const chatPoll: PayloadHandler = async (req) => {
  asServer(req);
  const conv = await byToken(req, req.searchParams.get("token"));
  if (!conv) return fail(404, "Sohbet bulunamadı.");
  const after = req.searchParams.get("after") ?? undefined;
  const valid = after && !Number.isNaN(Date.parse(after)) ? new Date(after).toISOString() : undefined;
  return ok({ status: conv.status, messages: await messagesOf(req, conv, valid) });
};

/** GET /api/conversations/gecmis: pencere yeniden açılınca tüm geçmiş */
export const chatHistory: PayloadHandler = async (req) => {
  asServer(req);
  const conv = await byToken(req, req.searchParams.get("token"));
  if (!conv) return fail(404, "Sohbet bulunamadı.");
  return ok({ status: conv.status, messages: await messagesOf(req, conv) });
};
