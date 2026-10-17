import { createHmac, timingSafeEqual } from "crypto";
import type { PayloadHandler, PayloadRequest } from "payload";
import type { Conversation } from "@/payload-types";
import { idOf } from "../crm/tenant";
import { chatConfigOf } from "../chat/collections";
import { botReply, handoff } from "../chat/engine";
import { addUsage } from "./usage";

/**
 * WhatsApp ve Instagram mesajlarını sitedeki sohbetle aynı gelen kutusuna ve
 * aynı asistana bağlayan Meta köprüsü (WhatsApp Cloud API + Instagram
 * Messaging API). Ortam değişkenleri yoksa uç kapalıdır (404).
 *
 *   GET  /api/conversations/meta   Meta'nın webhook doğrulaması (hub.challenge)
 *   POST /api/conversations/meta   gelen mesajlar (X-Hub-Signature-256 imzalı)
 *
 * Ortam: META_APP_SECRET, META_VERIFY_TOKEN, META_TENANT (işletme kısa adı,
 * varsayılan "guru"); WhatsApp için WHATSAPP_TOKEN + WHATSAPP_PHONE_ID;
 * Instagram için INSTAGRAM_TOKEN (sayfa erişim anahtarı). Kurulum:
 * docs/chatbot-kanallar.md
 */
type Channel = "whatsapp" | "instagram";
type Inbound = { channel: Channel; from: string; name?: string; text: string };

const GRAPH = "https://graph.facebook.com/v21.0";
const env = (k: string) => process.env[k]?.trim() || "";
export const metaEnabled = () => Boolean(env("META_APP_SECRET") && env("META_VERIFY_TOKEN") && (env("WHATSAPP_TOKEN") || env("INSTAGRAM_TOKEN")));

function validSignature(raw: string, header: string | null) {
  const secret = env("META_APP_SECRET");
  if (!secret || !header?.startsWith("sha256=")) return false;
  const want = Buffer.from(createHmac("sha256", secret).update(raw).digest("hex"));
  const got = Buffer.from(header.slice(7));
  return want.length === got.length && timingSafeEqual(want, got);
}

/** Meta'nın gövdesinden metin mesajları (resim, ses vb. şimdilik metin notuna döner) */
function parse(body: Record<string, unknown>): Inbound[] {
  const out: Inbound[] = [];
  const entries = (body.entry as Record<string, unknown>[] | undefined) ?? [];
  if (body.object === "whatsapp_business_account") {
    for (const e of entries)
      for (const ch of (e.changes as { value?: Record<string, unknown> }[] | undefined) ?? []) {
        const v = ch.value ?? {};
        const contacts = (v.contacts as { wa_id?: string; profile?: { name?: string } }[] | undefined) ?? [];
        for (const m of (v.messages as Record<string, unknown>[] | undefined) ?? []) {
          const from = String(m.from ?? "");
          const text = m.type === "text" ? String((m.text as { body?: string })?.body ?? "") : `[${String(m.type ?? "mesaj")} gönderildi]`;
          if (from && text) out.push({ channel: "whatsapp", from, name: contacts.find((c) => c.wa_id === from)?.profile?.name, text });
        }
      }
  }
  if (body.object === "instagram") {
    for (const e of entries)
      for (const m of (e.messaging as Record<string, unknown>[] | undefined) ?? []) {
        const msg = m.message as { text?: string; is_echo?: boolean } | undefined;
        if (!msg || msg.is_echo) continue;
        const from = String((m.sender as { id?: string })?.id ?? "");
        const text = msg.text ?? "[ek gönderildi]";
        if (from) out.push({ channel: "instagram", from, text });
      }
  }
  return out;
}

/** Ekip ya da asistan yanıtını müşterinin kanalına gönderir */
export async function sendToChannel(channel: string, to: string, text: string) {
  if (channel === "whatsapp" && env("WHATSAPP_TOKEN") && env("WHATSAPP_PHONE_ID")) {
    await fetch(`${GRAPH}/${env("WHATSAPP_PHONE_ID")}/messages`, {
      method: "POST",
      headers: { Authorization: `Bearer ${env("WHATSAPP_TOKEN")}`, "Content-Type": "application/json" },
      body: JSON.stringify({ messaging_product: "whatsapp", to, type: "text", text: { body: text.slice(0, 4000) } }),
    });
  } else if (channel === "instagram" && env("INSTAGRAM_TOKEN")) {
    await fetch(`${GRAPH}/me/messages?access_token=${encodeURIComponent(env("INSTAGRAM_TOKEN"))}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recipient: { id: to }, message: { text: text.slice(0, 1000) } }),
    });
  }
}

async function receive(req: PayloadRequest, m: Inbound) {
  const tenant = await req.payload.find({ collection: "tenants", where: { slug: { equals: env("META_TENANT") || "guru" } }, limit: 1, depth: 0, req, overrideAccess: true });
  const t = tenant.docs[0];
  if (!t) return;
  const settings = await chatConfigOf(req.payload, t.id, req);
  const found = await req.payload.find({
    collection: "conversations",
    where: { and: [{ tenant: { equals: t.id } }, { channel: { equals: m.channel } }, { externalId: { equals: m.from } }] },
    limit: 1,
    depth: 0,
    req,
    overrideAccess: true,
  });
  let conv = found.docs[0] as Conversation | undefined;
  if (!conv) {
    conv = (await req.payload.create({
      collection: "conversations",
      data: {
        tenant: t.id,
        channel: m.channel,
        externalId: m.from,
        status: "bot",
        visitorMessages: 0,
        page: m.channel === "whatsapp" ? "WhatsApp" : "Instagram",
        name: m.name,
        ...(m.channel === "whatsapp" ? { phone: `+${m.from}` } : {}),
      } as never,
      req,
      overrideAccess: true,
    })) as Conversation;
    await addUsage(req.payload, t.id, { conversations: 1 }, req);
  }
  const visitor = await req.payload.create({ collection: "chat-messages", data: { conversation: conv.id, role: "ziyaretci", text: m.text.slice(0, 1500), tenant: t.id }, req, overrideAccess: true });
  await addUsage(req.payload, t.id, { visitorMessages: 1 }, req);
  conv = (await req.payload.update({
    collection: "conversations",
    id: conv.id,
    data: {
      lastMessageAt: visitor.createdAt,
      lastText: m.text.slice(0, 160),
      visitorMessages: (conv.visitorMessages ?? 0) + 1,
      ...(conv.status === "kapali" ? { status: "bot" } : {}),
      ...(conv.status === "ekip" ? { needsReply: true } : {}),
      /* Yeni mesaj ertelemeyi kaldırır */
      snoozedUntil: null,
    },
    req,
    overrideAccess: true,
  })) as Conversation;
  /* Asistanın yanıtı chat-messages kancasıyla kanala gider */
  if (conv.status === "bot") {
    /* "enabled" yalnız sitedeki balonu açar; WhatsApp/Instagram'da asistan kapalıysa mesaj doğrudan ekibe düşer */
    if (settings.enabled) await botReply(req, conv, settings);
    else await handoff(req, conv, settings, `${m.channel === "whatsapp" ? "WhatsApp" : "Instagram"} mesajı; asistan kapalı olduğu için doğrudan ekibe düştü.`);
  }
}

export const metaWebhook: PayloadHandler = async (req) => {
  if (!metaEnabled()) return new Response("Not found", { status: 404 });
  const url = new URL(req.url ?? "", "http://x");
  if (req.method === "GET") {
    const okVerify = url.searchParams.get("hub.mode") === "subscribe" && url.searchParams.get("hub.verify_token") === env("META_VERIFY_TOKEN");
    return okVerify ? new Response(url.searchParams.get("hub.challenge") ?? "", { status: 200 }) : new Response("Forbidden", { status: 403 });
  }
  const raw = await (req as unknown as Request).text();
  if (!validSignature(raw, req.headers.get("x-hub-signature-256"))) return new Response("Forbidden", { status: 403 });
  let body: Record<string, unknown> = {};
  try {
    body = JSON.parse(raw);
  } catch {
    return new Response("Bad request", { status: 400 });
  }
  for (const m of parse(body)) {
    try {
      await receive(req, m);
    } catch (e) {
      req.payload.logger.error({ err: e }, "Meta mesajı işlenemedi");
    }
  }
  /* Meta 200 bekler; yanıt gecikirse mesajı yeniden gönderir */
  return new Response("OK", { status: 200 });
};

/** chat-messages afterChange: dış kanaldaki sohbete giden yanıtı ilet */
export async function deliverOutbound(req: PayloadRequest, doc: { id?: number | string; role?: string | null; text?: string | null; conversation?: unknown }) {
  if (!metaEnabled() || !doc.text || !["bot", "ekip", "sistem"].includes(doc.role ?? "")) return;
  const id = idOf(doc.conversation as never);
  if (!id) return;
  const conv = (await req.payload.findByID({ collection: "conversations", id, depth: 0, req, overrideAccess: true }).catch(() => null)) as (Conversation & { channel?: string; externalId?: string }) | null;
  if (!conv?.externalId || !conv.channel || conv.channel === "web") return;
  /* Gönderilemezse (ör. 24 saatlik pencere doldu) sebep mesaja yazılır; panelde "gönderilemedi" ve "Tekrar dene" görünür */
  const error = await sendToChannel(conv.channel, conv.externalId, doc.text).then(
    () => null,
    (e: unknown) => {
      req.payload.logger.error({ err: e }, "Kanala gönderilemedi");
      return e instanceof Error && e.message ? e.message.slice(0, 300) : "Gönderilemedi.";
    },
  );
  if (doc.id !== undefined) await req.payload.update({ collection: "chat-messages", id: doc.id, data: { deliveryError: error }, req, overrideAccess: true }).catch(() => null);
  return error;
}
