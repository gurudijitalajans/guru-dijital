import { randomBytes } from "crypto";
import type { CollectionConfig, Payload, PayloadRequest } from "payload";
import type { SiteConnection } from "@/payload-types";
import { isAdmin } from "../access";
import { canReq, isAdminUser, isTenantAdminReq } from "../business/roles";

/**
 * Müşteri kanalları: işletmenin kendi web sitesine eklenen sohbet balonu ve
 * talep formu. Site anahtarı herkese açıktır (sayfanın kodunda durur); kötüye
 * kullanıma karşı izinli adres listesi, hız sınırı ve aylık sohbet sınırı vardır.
 */

const newKey = () => randomBytes(18).toString("base64url");
const ORIGIN_RE = /^https?:\/\/[a-z0-9.-]+(:\d{2,5})?$/i;
const crmOrChat = ({ req }: { req: PayloadRequest }) => canReq(req, "crm") || canReq(req, "chat");

/* İşletme başına tek kayıt (çok kiracılı eklentide "isGlobal") */
export const SiteConnections: CollectionConfig = {
  slug: "site-connection",
  labels: { singular: "Site bağlantısı", plural: "Site bağlantısı" },
  admin: {
    group: "Ayarlar",
    useAsTitle: "label",
    description: "İşletmenin kendi web sitesine sohbet balonu ve talep formu eklemek için kod ve ayarlar.",
    /* Menüde görünmesi okuma yetkisine bağlı (CRM ya da Chatbot); ayrıca "hidden" verilince Payload
       işletme başına tek kayıtlı bu ekranı panoya yönlendiriyordu */
  },
  access: { read: crmOrChat, create: crmOrChat, update: crmOrChat, delete: isAdmin },
  hooks: {
    beforeChange: [
      ({ data, originalDoc }) => {
        if (!data.siteKey && !originalDoc?.siteKey) data.siteKey = newKey();
        /* Adreslerin sonundaki yol ve eğik çizgi atılır: yalnız köken (https://ornek.com) */
        if (Array.isArray(data.allowedOrigins)) {
          data.allowedOrigins = data.allowedOrigins.map((r: { origin?: string }) => {
            try {
              return { ...r, origin: new URL(String(r.origin ?? "").trim()).origin };
            } catch {
              return r;
            }
          });
        }
        return data;
      },
    ],
  },
  fields: [
    {
      name: "embed",
      type: "ui",
      admin: { components: { Field: "/payload/components/channels/EmbedCode#EmbedCode" } },
    },
    {
      name: "allowedOrigins",
      type: "array",
      label: "Sitenizin adresleri",
      labels: { singular: "Adres", plural: "Adresler" },
      admin: { description: "Balon ve form yalnız bu adreslerde açılır; siteyi tarama da yalnız bunlardan okur. Ör. https://www.ornekklinik.com" },
      fields: [
        {
          name: "origin",
          type: "text",
          label: "Adres",
          required: true,
          validate: (v: string | null | undefined) => {
            try {
              return ORIGIN_RE.test(new URL(String(v ?? "")).origin) || "https:// ile başlayan bir site adresi yazın.";
            } catch {
              return "https:// ile başlayan bir site adresi yazın.";
            }
          },
        },
      ],
    },
    {
      name: "accentColor",
      type: "text",
      label: "Vurgu rengi",
      defaultValue: "#011441",
      validate: (v: string | null | undefined) => !v || /^#[0-9a-f]{6}$/i.test(v) || "Altı haneli renk kodu yazın (ör. #0a5c8f).",
      admin: { description: "Balon, başlık ve düğmelerin rengi; sitenizin ana rengi önerilir." },
    },
    {
      name: "form",
      type: "group",
      label: "Talep formu",
      fields: [
        { name: "enabled", type: "checkbox", label: "Formu kullan", defaultValue: true },
        {
          type: "row",
          fields: [
            { name: "title", type: "text", label: "Başlık", defaultValue: "Bize ulaşın" },
            { name: "askPhone", type: "checkbox", label: "Telefon sor", defaultValue: true },
          ],
        },
        {
          name: "topics",
          type: "array",
          label: "Konu seçenekleri",
          labels: { singular: "Konu", plural: "Konular" },
          admin: { description: "Boşsa konu sorulmaz. Seçilen konu CRM'de fırsatın hizmeti olur." },
          fields: [{ name: "text", type: "text", label: "Konu", required: true }],
        },
        { name: "successText", type: "textarea", label: "Gönderim sonrası mesaj", defaultValue: "Teşekkürler, mesajınızı aldık. En kısa sürede dönüş yapacağız." },
        {
          name: "consentText",
          type: "textarea",
          label: "Onay metni",
          defaultValue: "Bilgilerimin bana dönüş yapılması amacıyla işlenmesini kabul ediyorum.",
          admin: { description: "Gönder düğmesinin üstünde işaret kutusuyla. Metin işletmenin sorumluluğundadır; KVKK aydınlatma metninize bağlantı ekleyin." },
        },
        { name: "privacyUrl", type: "text", label: "Aydınlatma metni adresi", admin: { placeholder: "https://ornek.com/kvkk" } },
      ],
    },
    { name: "label", type: "text", defaultValue: "Site bağlantısı", admin: { hidden: true } },
    { name: "siteKey", type: "text", label: "Site anahtarı", index: true, admin: { position: "sidebar", readOnly: true, description: "Kodda görünür; gizli değildir." } },
  ],
};

/** İşletmenin site bağlantısı; yoksa açılır (anahtar üretilir) */
export async function siteConnectionOf(payload: Payload, tenant: number | string, req?: PayloadRequest): Promise<SiteConnection> {
  const found = await payload.find({ collection: "site-connection", where: { tenant: { equals: tenant } }, limit: 1, depth: 0, req, overrideAccess: true });
  if (found.docs[0]) return found.docs[0];
  return payload.create({ collection: "site-connection", data: { tenant: Number(tenant) }, req, overrideAccess: true });
}

/** Site anahtarından işletme (gömülü balon ve form) */
export async function connectionByKey(payload: Payload, key: unknown, req?: PayloadRequest): Promise<SiteConnection | null> {
  if (typeof key !== "string" || !/^[A-Za-z0-9_-]{16,40}$/.test(key)) return null;
  const r = await payload.find({ collection: "site-connection", where: { siteKey: { equals: key } }, limit: 1, depth: 0, req, overrideAccess: true });
  return r.docs[0] ?? null;
}

/* ---- Kullanım ölçümü: işletme ve ay başına ---- */
export const Usage: CollectionConfig = {
  slug: "usage",
  labels: { singular: "Kullanım", plural: "Kullanım" },
  admin: {
    group: "Ayarlar",
    useAsTitle: "month",
    defaultColumns: ["month", "conversations", "visitorMessages", "aiCalls", "inputTokens", "outputTokens"],
    description: "İşletme başına aylık sohbet ve yapay zekâ kullanımı. Kendiliğinden tutulur.",
    hidden: ({ user }) => !isAdminUser(user),
  },
  defaultSort: "-month",
  access: { read: ({ req }) => isTenantAdminReq(req), create: () => false, update: () => false, delete: isAdmin },
  fields: [
    { name: "month", type: "text", label: "Ay", index: true, admin: { readOnly: true } },
    {
      type: "row",
      fields: [
        { name: "conversations", type: "number", label: "Sohbet", defaultValue: 0, admin: { readOnly: true } },
        { name: "visitorMessages", type: "number", label: "Ziyaretçi mesajı", defaultValue: 0, admin: { readOnly: true } },
        { name: "chatLeads", type: "number", label: "Sohbetten talep", defaultValue: 0, admin: { readOnly: true } },
        { name: "formLeads", type: "number", label: "Formdan talep", defaultValue: 0, admin: { readOnly: true } },
      ],
    },
    {
      type: "row",
      fields: [
        { name: "aiCalls", type: "number", label: "Yapay zekâ çağrısı", defaultValue: 0, admin: { readOnly: true } },
        { name: "inputTokens", type: "number", label: "Girdi (token)", defaultValue: 0, admin: { readOnly: true } },
        { name: "outputTokens", type: "number", label: "Çıktı (token)", defaultValue: 0, admin: { readOnly: true } },
        { name: "cacheReadTokens", type: "number", label: "Önbellekten (token)", defaultValue: 0, admin: { readOnly: true } },
      ],
    },
  ],
};
