import type { CollectionConfig } from "payload";
import { isAdmin, isLoggedIn } from "../access";
import { submitLead } from "../endpoints/forms";
import { CRM_SKIP, idOf, leadToCrm } from "../crm/automation";

const STAGE_FOR: Record<string, string> = { yeni: "aday", iletisim: "gorusme", teklif: "teklif", kazanildi: "kazanildi", kaybedildi: "kaybedildi" };

export const LEAD_STATUS = [
  { label: "Yeni", value: "yeni" },
  { label: "İletişime geçildi", value: "iletisim" },
  { label: "Teklif verildi", value: "teklif" },
  { label: "Kazanıldı", value: "kazanildi" },
  { label: "Kaybedildi", value: "kaybedildi" },
];

/**
 * Sitedeki iletişim ve demo formlarından gelen talepler. Ziyaretçi kaydı
 * doğrudan REST ile oluşturamaz; yalnız doğrulama, bal küpü ve hız sınırı
 * uygulayan POST /api/leads/gonder ucundan gelir.
 */
export const Leads: CollectionConfig = {
  slug: "leads",
  labels: { singular: "Talep", plural: "Talepler" },
  admin: {
    useAsTitle: "name",
    group: "Guru CRM",
    defaultColumns: ["name", "service", "status", "createdAt"],
    listSearchableFields: ["name", "email", "message"],
  },
  defaultSort: "-createdAt",
  access: { read: isLoggedIn, create: isLoggedIn, update: isLoggedIn, delete: isAdmin },
  endpoints: [{ path: "/gonder", method: "post", handler: submitLead }],
  hooks: {
    afterChange: [
      async ({ doc, previousDoc, operation, req, context }) => {
        if (context[CRM_SKIP]) return;
        /* Panelden eklenen talep aynı işlemde CRM'e aktarılır. Siteden gelen talep
           önce kaydedilir, aktarımı form ucu yapar (forms.ts): aktarım hata verse de talep kaybolmaz. */
        if (operation === "create") {
          if (req.user) await leadToCrm(req, doc);
          return;
        }
        /* Talebin durumu elle değişince bağlı fırsatın aşaması da değişir */
        const deal = idOf(doc.deal);
        if (deal && previousDoc?.status !== doc.status && STAGE_FOR[doc.status]) {
          await req.payload.update({ collection: "deals", id: deal, data: { stage: STAGE_FOR[doc.status] } as never, req, overrideAccess: true });
        }
      },
    ],
  },
  fields: [
    {
      type: "row",
      fields: [
        { name: "name", type: "text", label: "Ad Soyad", required: true },
        { name: "email", type: "email", label: "E-posta", required: true },
        { name: "phone", type: "text", label: "Telefon" },
      ],
    },
    { name: "service", type: "text", label: "İlgilendiği hizmet / ürün" },
    { name: "subject", type: "text", label: "Konu" },
    { name: "message", type: "textarea", label: "Mesaj", required: true },
    {
      name: "status",
      type: "select",
      label: "Durum",
      required: true,
      defaultValue: "yeni",
      options: LEAD_STATUS,
      admin: { position: "sidebar" },
    },
    {
      name: "source",
      type: "text",
      label: "Geldiği sayfa",
      admin: { position: "sidebar", readOnly: true },
    },
    { name: "contact", type: "relationship", relationTo: "contacts", label: "Kişi", admin: { position: "sidebar", readOnly: true } },
    { name: "deal", type: "relationship", relationTo: "deals", label: "Fırsat", admin: { position: "sidebar", readOnly: true } },
    {
      name: "notes",
      type: "textarea",
      label: "İç notlar",
      admin: { position: "sidebar", description: "Yalnız panelde görünür." },
    },
  ],
};
