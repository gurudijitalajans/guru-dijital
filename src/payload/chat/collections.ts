import type { CollectionConfig, Payload, PayloadRequest } from "payload";
import type { ChatbotConfig } from "@/payload-types";
import { isAdmin, isAdminField, isLoggedIn } from "../access";
import { idOf } from "../crm/automation";
import { chatHistory, chatPoll, chatSend } from "./endpoints";
import { resetKnowledge } from "./knowledge";
import { revalidate } from "../utils";

/**
 * Guru Chatbot: sitedeki sohbet balonu, ekip gelen kutusu ve bilgi tabanı.
 * Ziyaretçi kayıt oluşturamaz; mesajlar yalnız hız sınırlı /api/conversations/mesaj
 * ucundan gelir. Asistan yalnız bilgi tabanıyla yanıtlar, bilmediğini ekibe aktarır.
 */

const GROUP = "Guru Chatbot";
export const MODELS = [
  { label: "Claude Haiku 5.5 (hızlı, ekonomik)", value: "claude-haiku-5-5" },
  { label: "Claude Sonnet 5.5 (daha ayrıntılı)", value: "claude-sonnet-5-5" },
];
export const CONV_STATUS = [
  { label: "Asistan yanıtlıyor", value: "bot" },
  { label: "Ekipte", value: "ekip" },
  { label: "Kapandı", value: "kapali" },
];
export const MSG_ROLES = [
  { label: "Ziyaretçi", value: "ziyaretci" },
  { label: "Asistan", value: "bot" },
  { label: "Ekip", value: "ekip" },
  { label: "Sistem", value: "sistem" },
];

/* İşletme başına tek kayıt (çok kiracılı eklentide "isGlobal"): her işletmenin kendi asistan ayarı */
export const ChatbotSettings: CollectionConfig = {
  slug: "chatbot-config",
  labels: { singular: "Chatbot ayarları", plural: "Chatbot ayarları" },
  admin: { group: GROUP, useAsTitle: "botName" },
  access: { read: isLoggedIn, create: isLoggedIn, update: isLoggedIn, delete: isAdmin },
  /* Balon sitenin her sayfasında: ayar değişince sayfalar yenilenir */
  hooks: { afterChange: [() => resetKnowledge(), () => revalidate(["/"], "layout")] },
  fields: [
    {
      name: "enabled",
      type: "checkbox",
      label: "Sitede sohbet balonunu göster",
      defaultValue: false,
      admin: { description: "Açınca sitenin sağ alt köşesinde sohbet balonu çıkar. Yapay zekâ anahtarı yoksa mesajlar doğrudan ekibe düşer." },
    },
    {
      type: "row",
      fields: [
        { name: "botName", type: "text", label: "Asistanın adı", defaultValue: "Asistan", required: true },
        { name: "model", type: "select", label: "Yapay zekâ modeli", defaultValue: "claude-haiku-5-5", options: MODELS, access: { update: isAdminField } },
      ],
    },
    {
      name: "greeting",
      type: "textarea",
      label: "Karşılama mesajı",
      defaultValue: "Merhaba, size nasıl yardımcı olabilirim? Hizmetlerimiz ya da teklif almak hakkında sorularınızı yanıtlayabilirim.",
    },
    {
      name: "suggestions",
      type: "array",
      label: "Hazır sorular",
      labels: { singular: "Soru", plural: "Sorular" },
      maxRows: 4,
      admin: { description: "Sohbet açılınca ziyaretçiye dokunulabilir öneri olarak görünür." },
      defaultValue: [{ text: "Hizmetleriniz neler?" }, { text: "Teklif almak istiyorum" }, { text: "Toplantı ayarlayalım" }],
      fields: [{ name: "text", type: "text", label: "Soru", required: true }],
    },
    {
      name: "notice",
      type: "textarea",
      label: "Bilgilendirme notu",
      defaultValue: "Sohbet kayıt altına alınır. Paylaştığınız bilgileri yalnız size dönüş yapmak için kullanırız.",
      admin: { description: "Sohbet penceresinin altında küçük yazıyla görünür. KVKK aydınlatma metni gelince bağlantısı eklenir." },
    },
    {
      name: "instructions",
      type: "textarea",
      label: "Asistana ek talimatlar",
      admin: { description: "Ton, vurgulanacak kampanya ya da yanıtlanmayacak konular. Ör. \"Ekim boyunca web sitesi projelerinde ücretsiz keşif görüşmesi var.\"" },
    },
    {
      name: "cannedReplies",
      type: "array",
      label: "Ekip için hazır yanıtlar",
      labels: { singular: "Hazır yanıt", plural: "Hazır yanıtlar" },
      admin: { description: "Gelen kutusunda tek tıkla eklenen kısa yanıtlar." },
      defaultValue: [
        { label: "Selam", text: "Merhaba, ekibimizden yazıyorum. Size nasıl yardımcı olabilirim?" },
        { label: "Dönüş", text: "Teşekkürler, bilgileri aldım. Bugün içinde e-postayla dönüş yapacağız." },
      ],
      fields: [
        {
          type: "row",
          fields: [
            { name: "label", type: "text", label: "Kısa ad", required: true, admin: { width: "30%" } },
            { name: "text", type: "textarea", label: "Yanıt", required: true },
          ],
        },
      ],
    },
    { name: "notifyHandoff", type: "checkbox", label: "Sohbet ekibe aktarılınca e-postayla bildir", defaultValue: true },
  ],
};

export const Knowledge: CollectionConfig = {
  slug: "knowledge",
  labels: { singular: "Bilgi", plural: "Bilgi tabanı" },
  admin: {
    useAsTitle: "title",
    group: GROUP,
    defaultColumns: ["title", "active", "updatedAt"],
    description:
      "Asistan hizmetleri, ürünleri, sık sorulan soruları ve iletişim bilgilerini sitenin kendisinden okur. Sitede olmayan bilgileri (çalışma saatleri, ödeme koşulları, kampanyalar) buraya ekleyin.",
  },
  access: { read: isLoggedIn, create: isLoggedIn, update: isLoggedIn, delete: isAdmin },
  hooks: { afterChange: [() => resetKnowledge()], afterDelete: [() => resetKnowledge()] },
  fields: [
    { name: "title", type: "text", label: "Başlık", required: true, admin: { placeholder: "Çalışma saatleri" } },
    { name: "content", type: "textarea", label: "Bilgi", required: true, admin: { rows: 8, description: "Asistan bunu olduğu gibi bilgi olarak kullanır; kısa ve net yazın." } },
    { name: "active", type: "checkbox", label: "Asistan kullansın", defaultValue: true, admin: { position: "sidebar" } },
  ],
};

export const Conversations: CollectionConfig = {
  slug: "conversations",
  labels: { singular: "Sohbet", plural: "Sohbetler" },
  admin: {
    useAsTitle: "label",
    group: GROUP,
    defaultColumns: ["label", "status", "topic", "lastMessageAt"],
    description: "Sitedeki sohbetler. Yanıtlamak için menüdeki Sohbetler ekranını kullanın.",
  },
  defaultSort: "-lastMessageAt",
  access: { read: isLoggedIn, create: isAdmin, update: isLoggedIn, delete: isAdmin },
  endpoints: [
    { path: "/mesaj", method: "post", handler: chatSend },
    { path: "/akis", method: "get", handler: chatPoll },
    { path: "/gecmis", method: "get", handler: chatHistory },
  ],
  hooks: {
    beforeChange: [
      ({ data, originalDoc }) => {
        const name = data.name ?? originalDoc?.name;
        const email = data.email ?? originalDoc?.email;
        const id = originalDoc?.id;
        data.label = name || email || `Ziyaretçi${id ? ` #${id}` : ""}`;
        return data;
      },
    ],
  },
  fields: [
    { name: "label", type: "text", label: "Ziyaretçi", admin: { readOnly: true } },
    {
      type: "row",
      fields: [
        { name: "name", type: "text", label: "Ad" },
        { name: "email", type: "email", label: "E-posta" },
        { name: "phone", type: "text", label: "Telefon" },
      ],
    },
    { name: "topic", type: "text", label: "Konu", index: true, admin: { description: "Asistan sohbetin konusunu kendisi etiketler." } },
    { name: "page", type: "text", label: "Başladığı sayfa", admin: { readOnly: true } },
    { name: "lastText", type: "text", label: "Son mesaj", admin: { readOnly: true } },
    { name: "status", type: "select", label: "Durum", required: true, defaultValue: "bot", options: CONV_STATUS, index: true, admin: { position: "sidebar" } },
    { name: "needsReply", type: "checkbox", label: "Yanıt bekliyor", defaultValue: false, index: true, admin: { position: "sidebar" } },
    { name: "assignee", type: "relationship", relationTo: "users", label: "Sorumlu", admin: { position: "sidebar" } },
    { name: "contact", type: "relationship", relationTo: "contacts", label: "Kişi", admin: { position: "sidebar", readOnly: true } },
    { name: "lead", type: "relationship", relationTo: "leads", label: "Talep", admin: { position: "sidebar", readOnly: true } },
    { name: "booking", type: "relationship", relationTo: "bookings", label: "Randevu", admin: { position: "sidebar", readOnly: true } },
    { name: "lastMessageAt", type: "date", label: "Son mesaj zamanı", index: true, admin: { position: "sidebar", readOnly: true, date: { displayFormat: "dd.MM.yyyy HH:mm" } } },
    { name: "handedOffAt", type: "date", label: "Ekibe aktarıldı", admin: { position: "sidebar", readOnly: true, date: { displayFormat: "dd.MM.yyyy HH:mm" } } },
    { name: "firstTeamReplyAt", type: "date", label: "Ekibin ilk yanıtı", admin: { position: "sidebar", readOnly: true, date: { displayFormat: "dd.MM.yyyy HH:mm" } } },
    { name: "visitorMessages", type: "number", defaultValue: 0, admin: { hidden: true } },
    { name: "token", type: "text", index: true, admin: { hidden: true }, access: { read: () => false } },
  ],
};

export const ChatMessages: CollectionConfig = {
  slug: "chat-messages",
  labels: { singular: "Sohbet mesajı", plural: "Sohbet mesajları" },
  admin: { useAsTitle: "text", group: GROUP, hidden: true },
  defaultSort: "createdAt",
  access: { read: isLoggedIn, create: isLoggedIn, update: isAdmin, delete: isAdmin },
  hooks: {
    beforeChange: [
      ({ data, operation, req }) => {
        /* Panelden yazılan mesaj her zaman ekip mesajıdır, yazarı oturumdaki kullanıcı */
        if (operation === "create" && req.user) {
          data.role = "ekip";
          data.author = req.user.id;
        }
        return data;
      },
    ],
    afterChange: [
      /* Ekip yazınca sohbet ekibe geçer (asistan susar) ve yanıt bekliyor işareti kalkar */
      async ({ doc, operation, req }) => {
        if (operation !== "create" || doc.role !== "ekip") return;
        const id = idOf(doc.conversation);
        if (!id) return;
        const conv = await req.payload.findByID({ collection: "conversations", id, depth: 0, req, overrideAccess: true });
        const now = new Date().toISOString();
        await req.payload.update({
          collection: "conversations",
          id,
          data: {
            status: "ekip",
            needsReply: false,
            lastMessageAt: now,
            lastText: doc.text.slice(0, 160),
            ...(conv.firstTeamReplyAt ? {} : { firstTeamReplyAt: now }),
            ...(conv.handedOffAt ? {} : { handedOffAt: now }),
            ...(conv.assignee ? {} : { assignee: req.user?.id }),
          },
          req,
          overrideAccess: true,
        });
      },
    ],
  },
  fields: [
    { name: "conversation", type: "relationship", relationTo: "conversations", label: "Sohbet", required: true, index: true },
    { name: "role", type: "select", label: "Yazan", required: true, defaultValue: "ekip", options: MSG_ROLES },
    { name: "text", type: "textarea", label: "Mesaj", required: true, maxLength: 4000 },
    { name: "author", type: "relationship", relationTo: "users", label: "Ekip üyesi" },
    { name: "unanswered", type: "checkbox", label: "Asistan yanıtlayamadı", defaultValue: false, index: true },
  ],
};

/** İşletmenin sohbet ayarı; yoksa varsayılanlarla açılır */
export async function chatConfigOf(payload: Payload, tenant: number | string, req?: PayloadRequest): Promise<ChatbotConfig> {
  const found = await payload.find({ collection: "chatbot-config", where: { tenant: { equals: tenant } }, limit: 1, depth: 0, req, overrideAccess: true });
  if (found.docs[0]) return found.docs[0];
  const t = await payload.findByID({ collection: "tenants", id: tenant, depth: 0, req, overrideAccess: true }).catch(() => null);
  const botName = t?.slug === "guru" ? "Guru Asistan" : `${t?.name ?? "İşletme"} Asistanı`;
  return payload.create({ collection: "chatbot-config", data: { tenant: Number(tenant), botName }, req, overrideAccess: true });
}
