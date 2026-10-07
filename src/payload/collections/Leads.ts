import type { CollectionConfig } from "payload";
import { isAdmin, isLoggedIn } from "../access";
import { submitLead } from "../endpoints/forms";

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
    group: "Müşteriler",
    defaultColumns: ["name", "service", "status", "createdAt"],
    listSearchableFields: ["name", "email", "message"],
  },
  defaultSort: "-createdAt",
  access: { read: isLoggedIn, create: isLoggedIn, update: isLoggedIn, delete: isAdmin },
  endpoints: [{ path: "/gonder", method: "post", handler: submitLead }],
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
    {
      name: "notes",
      type: "textarea",
      label: "İç notlar",
      admin: { position: "sidebar", description: "Yalnız panelde görünür." },
    },
  ],
};
