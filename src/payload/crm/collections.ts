import type { CollectionConfig, Field } from "payload";
import { isAdmin, isLoggedIn } from "../access";
import { ACTIVITY_TYPES, DEAL_STAGES, QUOTE_STATUS, SOURCES } from "./stages";
import { tenantField } from "./tenant";
import { CRM_SKIP, dealStageChanged, idOf, logActivity } from "./automation";
import { quotePrint } from "./quote-print";

/**
 * Guru CRM: firma, kişi, fırsat, not/görev ve teklif. Sitedeki talep ve
 * randevular buraya kendiliğinden düşer (automation.ts). Her kayıt bir
 * işletmeye (tenant) bağlıdır; ürün satıldığında müşteri verileri ayrı kalır.
 */

const GROUP = "Guru CRM";
const access = { read: isLoggedIn, create: isLoggedIn, update: isLoggedIn, delete: isAdmin };

const ownerField: Field = {
  name: "owner",
  type: "relationship",
  relationTo: "users",
  label: "Sorumlu",
  defaultValue: ({ user }: { user?: { id?: number | string } | null }) => user?.id,
  admin: { position: "sidebar" },
};

/** Kaydın altındaki zaman çizelgesi: notlar, görevler, aşama değişiklikleri, talepler, randevular, teklifler */
const timeline = (kind: "contact" | "company" | "deal"): Field => ({
  name: "timeline",
  type: "ui",
  admin: {
    components: { Field: { path: "/payload/components/crm/Timeline#Timeline", clientProps: { kind } } },
    disableListColumn: true,
  },
});

export const Companies: CollectionConfig = {
  slug: "companies",
  labels: { singular: "Firma", plural: "Firmalar" },
  admin: {
    useAsTitle: "name",
    group: GROUP,
    defaultColumns: ["name", "sector", "phone", "owner"],
    listSearchableFields: ["name", "sector", "website"],
    description: "Müşteri ve aday firmalar. Kişiler ve fırsatlar firmaya bağlanır.",
  },
  defaultSort: "name",
  access,
  fields: [
    {
      type: "row",
      fields: [
        { name: "name", type: "text", label: "Firma adı", required: true },
        { name: "sector", type: "text", label: "Sektör" },
      ],
    },
    {
      type: "row",
      fields: [
        { name: "website", type: "text", label: "Web sitesi", admin: { placeholder: "https://" } },
        { name: "phone", type: "text", label: "Telefon" },
        { name: "email", type: "email", label: "E-posta" },
      ],
    },
    { name: "address", type: "textarea", label: "Adres" },
    {
      type: "row",
      fields: [
        { name: "taxOffice", type: "text", label: "Vergi dairesi" },
        { name: "taxNumber", type: "text", label: "Vergi numarası", admin: { description: "Teklif belgesinde müşteri bilgisi olarak görünür." } },
      ],
    },
    { name: "notes", type: "textarea", label: "Notlar" },
    timeline("company"),
    ownerField,
    tenantField,
  ],
};

export const Contacts: CollectionConfig = {
  slug: "contacts",
  labels: { singular: "Kişi", plural: "Kişiler" },
  admin: {
    useAsTitle: "name",
    group: GROUP,
    defaultColumns: ["name", "company", "email", "phone", "source"],
    listSearchableFields: ["name", "email", "phone"],
    description: "Görüştüğünüz kişiler. Siteden talep ya da randevu bırakan herkes e-posta adresine göre buraya eklenir.",
  },
  defaultSort: "-createdAt",
  access,
  hooks: {
    beforeChange: [
      ({ data }) => {
        if (typeof data.email === "string") data.email = data.email.trim().toLocaleLowerCase("tr-TR");
        return data;
      },
    ],
  },
  fields: [
    {
      type: "row",
      fields: [
        { name: "name", type: "text", label: "Ad Soyad", required: true },
        { name: "title", type: "text", label: "Görevi", admin: { placeholder: "Pazarlama müdürü" } },
      ],
    },
    {
      type: "row",
      fields: [
        { name: "email", type: "email", label: "E-posta", index: true },
        { name: "phone", type: "text", label: "Telefon" },
      ],
    },
    { name: "company", type: "relationship", relationTo: "companies", label: "Firma" },
    { name: "notes", type: "textarea", label: "Notlar" },
    timeline("contact"),
    { name: "source", type: "select", label: "Nereden geldi", defaultValue: "manuel", options: SOURCES, admin: { position: "sidebar" } },
    {
      name: "tags",
      type: "text",
      hasMany: true,
      label: "Etiketler",
      admin: { position: "sidebar", description: "Yazıp Enter'a basın (ör. e-ticaret, sıcak)." },
    },
    ownerField,
    tenantField,
  ],
};

export const Deals: CollectionConfig = {
  slug: "deals",
  labels: { singular: "Fırsat", plural: "Fırsatlar" },
  admin: {
    useAsTitle: "title",
    group: GROUP,
    defaultColumns: ["title", "stage", "value", "contact", "expectedClose", "owner"],
    listSearchableFields: ["title", "service"],
    description: "Satışa dönüşebilecek her iş. Aşamaları Satış hattı panosunda sürükleyerek değiştirebilirsiniz.",
  },
  defaultSort: "-updatedAt",
  access,
  hooks: {
    beforeChange: [
      async ({ data, originalDoc, req }) => {
        const stage = data.stage ?? originalDoc?.stage;
        const closed = stage === "kazanildi" || stage === "kaybedildi";
        if (closed && (originalDoc?.stage !== stage || !originalDoc?.closedAt)) data.closedAt = new Date().toISOString();
        if (!closed) data.closedAt = null;
        /* Firma boşsa kişinin firması */
        const contact = idOf(data.contact ?? originalDoc?.contact);
        if (contact && !(data.company ?? originalDoc?.company)) {
          const c = await req.payload.findByID({ collection: "contacts", id: contact, depth: 0, req, overrideAccess: true }).catch(() => null);
          if (c?.company) data.company = idOf(c.company);
        }
        return data;
      },
    ],
    afterChange: [
      async ({ doc, previousDoc, operation, req, context }) => {
        if (context[CRM_SKIP]) return;
        if (operation === "create") {
          await logActivity(req, { type: "sistem", title: "Fırsat açıldı", deal: doc.id, contact: idOf(doc.contact), company: idOf(doc.company) });
        } else if (previousDoc?.stage && previousDoc.stage !== doc.stage) {
          await dealStageChanged(req, doc, previousDoc.stage);
        }
      },
    ],
  },
  fields: [
    { name: "title", type: "text", label: "Fırsat", required: true, admin: { placeholder: "Sosyal medya yönetimi · Firma adı" } },
    {
      type: "row",
      fields: [
        { name: "contact", type: "relationship", relationTo: "contacts", label: "Kişi" },
        { name: "company", type: "relationship", relationTo: "companies", label: "Firma", admin: { description: "Boşsa kişinin firması." } },
      ],
    },
    {
      type: "row",
      fields: [
        { name: "value", type: "number", label: "Tutar (₺, KDV hariç)", min: 0, admin: { step: 500 } },
        {
          name: "expectedClose",
          type: "date",
          label: "Tahmini kapanış",
          admin: { date: { pickerAppearance: "dayOnly", displayFormat: "dd.MM.yyyy" } },
        },
      ],
    },
    { name: "service", type: "text", label: "Hizmet / ürün" },
    {
      name: "lostReason",
      type: "textarea",
      label: "Neden kaybedildi",
      admin: { condition: (data) => data?.stage === "kaybedildi", description: "Fiyat, zamanlama, rakip… Sonraki teklifler için ipucu." },
    },
    { name: "notes", type: "textarea", label: "Notlar" },
    timeline("deal"),
    { name: "stage", type: "select", label: "Aşama", required: true, defaultValue: "aday", options: [...DEAL_STAGES], index: true, admin: { position: "sidebar" } },
    ownerField,
    /* Guru Operation: kazanılan fırsattan tek tıkla iş */
    { name: "toProject", type: "ui", admin: { position: "sidebar", components: { Field: "/payload/components/ops/DealToProject#DealToProject" } } },
    { name: "lead", type: "relationship", relationTo: "leads", label: "Geldiği talep", admin: { position: "sidebar", readOnly: true, condition: (data) => Boolean(data?.lead) } },
    { name: "closedAt", type: "date", label: "Kapanış", admin: { position: "sidebar", readOnly: true, date: { displayFormat: "dd.MM.yyyy HH:mm" }, condition: (data) => Boolean(data?.closedAt) } },
    { name: "order", type: "number", admin: { hidden: true } },
    tenantField,
  ],
};

export const Activities: CollectionConfig = {
  slug: "activities",
  labels: { singular: "Not / görev", plural: "Notlar ve görevler" },
  admin: {
    useAsTitle: "title",
    group: GROUP,
    defaultColumns: ["title", "type", "dueAt", "done", "contact", "owner"],
    listSearchableFields: ["title", "body"],
    description: "Arama, toplantı, not ve görevler. Kişi, firma ya da fırsat sayfasının altından da hızlıca eklenir.",
  },
  defaultSort: "-createdAt",
  access,
  fields: [
    {
      type: "row",
      fields: [
        { name: "type", type: "select", label: "Tür", required: true, defaultValue: "not", options: [...ACTIVITY_TYPES], admin: { width: "30%" } },
        { name: "title", type: "text", label: "Başlık", required: true },
      ],
    },
    { name: "body", type: "textarea", label: "Ayrıntı" },
    {
      type: "row",
      fields: [
        {
          name: "dueAt",
          type: "date",
          label: "Tarih ve saat",
          index: true,
          admin: { date: { pickerAppearance: "dayAndTime", displayFormat: "dd.MM.yyyy HH:mm", timeIntervals: 15 }, description: "Görev ve toplantılarda." },
        },
        { name: "done", type: "checkbox", label: "Tamamlandı", defaultValue: false, index: true },
      ],
    },
    {
      type: "row",
      fields: [
        { name: "deal", type: "relationship", relationTo: "deals", label: "Fırsat" },
        { name: "contact", type: "relationship", relationTo: "contacts", label: "Kişi" },
        { name: "company", type: "relationship", relationTo: "companies", label: "Firma" },
      ],
    },
    { name: "booking", type: "relationship", relationTo: "bookings", label: "Randevu", admin: { position: "sidebar", readOnly: true, condition: (data) => Boolean(data?.booking) } },
    ownerField,
    tenantField,
  ],
};

const VAT = [
  { label: "%20", value: "20" },
  { label: "%10", value: "10" },
  { label: "%1", value: "1" },
  { label: "%0", value: "0" },
];

type QuoteItem = { qty?: number | null; unitPrice?: number | null; vatRate?: string | null };
const round = (n: number) => Math.round(n * 100) / 100;
export function quoteTotals(items: QuoteItem[] = []) {
  let subtotal = 0;
  let vat = 0;
  for (const it of items) {
    const line = (it.qty ?? 0) * (it.unitPrice ?? 0);
    subtotal += line;
    vat += (line * Number(it.vatRate ?? 20)) / 100;
  }
  return { subtotal: round(subtotal), vatTotal: round(vat), total: round(subtotal + vat) };
}

const istanbulYear = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Istanbul", year: "numeric" }).format(new Date());

export const Quotes: CollectionConfig = {
  slug: "quotes",
  labels: { singular: "Teklif", plural: "Teklifler" },
  admin: {
    useAsTitle: "number",
    group: GROUP,
    defaultColumns: ["number", "title", "company", "total", "status", "validUntil"],
    listSearchableFields: ["number", "title"],
    description: "Kalem kalem teklif; toplamlar kendiliğinden hesaplanır. Kaydettikten sonra \"Yazdır / PDF\" ile müşteriye gönderilecek belge açılır.",
  },
  defaultSort: "-createdAt",
  access,
  endpoints: [{ path: "/:id/yazdir", method: "get", handler: quotePrint }],
  hooks: {
    beforeChange: [
      async ({ data, originalDoc, operation, req }) => {
        Object.assign(data, quoteTotals(data.items ?? originalDoc?.items));
        if (operation === "create" && !data.number) {
          const year = istanbulYear();
          const last = await req.payload.find({ collection: "quotes", where: { number: { like: `GD-${year}-` } }, sort: "-number", limit: 1, depth: 0, req, overrideAccess: true });
          const n = Number(String(last.docs[0]?.number ?? "").split("-")[2] ?? 0) + 1;
          data.number = `GD-${year}-${String(n).padStart(3, "0")}`;
        }
        /* Kişi ve firma boşsa fırsattan */
        const deal = idOf(data.deal ?? originalDoc?.deal);
        if (deal && (!(data.contact ?? originalDoc?.contact) || !(data.company ?? originalDoc?.company))) {
          const d = await req.payload.findByID({ collection: "deals", id: deal, depth: 0, req, overrideAccess: true }).catch(() => null);
          if (d) {
            data.contact = data.contact ?? originalDoc?.contact ?? idOf(d.contact);
            data.company = data.company ?? originalDoc?.company ?? idOf(d.company);
          }
        }
        /* Firma hâlâ boşsa kişinin firması */
        const contact = idOf(data.contact ?? originalDoc?.contact);
        if (contact && !(data.company ?? originalDoc?.company)) {
          const c = await req.payload.findByID({ collection: "contacts", id: contact, depth: 0, req, overrideAccess: true }).catch(() => null);
          if (c?.company) data.company = idOf(c.company);
        }
        return data;
      },
    ],
    afterChange: [
      /* Teklif gönderilince fırsat "Teklif" aşamasına, kabul edilince "Kazanıldı"ya geçer */
      async ({ doc, previousDoc, req, context }) => {
        if (context[CRM_SKIP] || doc.status === previousDoc?.status) return;
        const dealId = idOf(doc.deal);
        if (!dealId) return;
        const deal = await req.payload.findByID({ collection: "deals", id: dealId, depth: 0, req, overrideAccess: true }).catch(() => null);
        if (!deal) return;
        const next = doc.status === "gonderildi" && (deal.stage === "aday" || deal.stage === "gorusme") ? "teklif" : doc.status === "kabul" ? "kazanildi" : null;
        if (next && next !== deal.stage) {
          await req.payload.update({
            collection: "deals",
            id: dealId,
            data: { stage: next, ...(next === "kazanildi" && !deal.value ? { value: doc.subtotal } : {}) } as never,
            req,
            overrideAccess: true,
          });
        }
      },
    ],
  },
  fields: [
    { name: "title", type: "text", label: "Teklif konusu", required: true, admin: { placeholder: "Sosyal medya yönetimi, 12 aylık" } },
    {
      type: "row",
      fields: [
        { name: "deal", type: "relationship", relationTo: "deals", label: "Fırsat" },
        { name: "contact", type: "relationship", relationTo: "contacts", label: "Kişi" },
        { name: "company", type: "relationship", relationTo: "companies", label: "Firma" },
      ],
    },
    {
      name: "items",
      type: "array",
      label: "Kalemler",
      labels: { singular: "Kalem", plural: "Kalemler" },
      minRows: 1,
      fields: [
        { name: "description", type: "text", label: "Açıklama", required: true },
        {
          type: "row",
          fields: [
            { name: "qty", type: "number", label: "Miktar", required: true, defaultValue: 1, min: 0, admin: { width: "18%" } },
            { name: "unit", type: "text", label: "Birim", defaultValue: "Adet", admin: { width: "18%", placeholder: "Ay, Adet, Saat" } },
            { name: "unitPrice", type: "number", label: "Birim fiyat (₺)", required: true, min: 0 },
            { name: "vatRate", type: "select", label: "KDV", required: true, defaultValue: "20", options: VAT, admin: { width: "16%" } },
          ],
        },
      ],
    },
    { name: "notes", type: "textarea", label: "Açıklama", admin: { description: "Belgede kalemlerin altında görünür: kapsam, teslim süresi, dahil olmayanlar." } },
    {
      name: "terms",
      type: "textarea",
      label: "Koşullar",
      defaultValue: "Bu teklif geçerlilik tarihine kadar geçerlidir. Ödeme ve teslim koşulları sözleşmede netleşir.",
    },
    { name: "actions", type: "ui", admin: { position: "sidebar", components: { Field: "/payload/components/crm/QuoteActions#QuoteActions" } } },
    { name: "number", type: "text", label: "Teklif no", unique: true, index: true, admin: { position: "sidebar", readOnly: true, description: "Kaydedince verilir (GD-yıl-sıra)." } },
    { name: "status", type: "select", label: "Durum", required: true, defaultValue: "taslak", options: QUOTE_STATUS, admin: { position: "sidebar" } },
    {
      name: "issueDate",
      type: "date",
      label: "Teklif tarihi",
      defaultValue: () => new Date().toISOString(),
      admin: { position: "sidebar", date: { pickerAppearance: "dayOnly", displayFormat: "dd.MM.yyyy" } },
    },
    {
      name: "validUntil",
      type: "date",
      label: "Geçerlilik",
      defaultValue: () => new Date(Date.now() + 15 * 86400000).toISOString(),
      admin: { position: "sidebar", date: { pickerAppearance: "dayOnly", displayFormat: "dd.MM.yyyy" } },
    },
    { name: "subtotal", type: "number", label: "Ara toplam (₺)", admin: { position: "sidebar", readOnly: true } },
    { name: "vatTotal", type: "number", label: "KDV (₺)", admin: { position: "sidebar", readOnly: true } },
    { name: "total", type: "number", label: "Genel toplam (₺)", admin: { position: "sidebar", readOnly: true } },
    ownerField,
    tenantField,
  ],
};
