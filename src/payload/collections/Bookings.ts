import { APIError, type CollectionConfig } from "payload";
import { isLoggedIn } from "../access";
import { busySlots, submitBooking } from "../endpoints/forms";
import { dayKey } from "../utils";
import { kaynakField } from "../kaynak";
import { bookingToCrm, CRM_SKIP, syncBookingActivity } from "../crm/automation";
import { tenantAdminAccess } from "../business/roles";


export const BOOKING_STATUS = [
  { label: "Onay bekliyor", value: "bekliyor" },
  { label: "Onaylandı", value: "onaylandi" },
  { label: "Tamamlandı", value: "tamamlandi" },
  { label: "İptal", value: "iptal" },
];

/**
 * Toplantı talepleri. Aynı gün ve saate iptal edilmemiş ikinci bir randevu
 * yazılamaz (panelden de, siteden de). Site dolu saatleri kişisel veri
 * içermeyen GET /api/bookings/dolu ucundan okur.
 */
export const Bookings: CollectionConfig = {
  slug: "bookings",
  labels: { singular: "Randevu", plural: "Randevular" },
  admin: {
    useAsTitle: "name",
    group: "Guru CRM",
    defaultColumns: ["name", "date", "time", "status", "topic"],
    listSearchableFields: ["name", "email", "topic"],
  },
  defaultSort: "date",
  access: { read: isLoggedIn, create: isLoggedIn, update: isLoggedIn, delete: tenantAdminAccess },
  endpoints: [
    { path: "/gonder", method: "post", handler: submitBooking },
    { path: "/dolu", method: "get", handler: busySlots },
  ],
  hooks: {
    afterChange: [
      async ({ doc, previousDoc, operation, req, context }) => {
        if (context[CRM_SKIP]) return;
        /* Siteden gelen randevuyu form ucu aktarır (forms.ts); panelden eklenen burada */
        if (operation === "create") {
          if (req.user) await bookingToCrm(req, doc);
        } else if (previousDoc && (previousDoc.date !== doc.date || previousDoc.time !== doc.time || previousDoc.status !== doc.status)) {
          await syncBookingActivity(req, doc);
        }
      },
      /* Ziyaretçiye e-posta: onay, iptal ya da saat değişikliği (siteden gelen ilk talepte değil) */
      async ({ doc, previousDoc, operation, req, context }) => {
        if (operation !== "update" || !previousDoc || context.noVisitorEmail) return;
        const kind =
          doc.status === "iptal" && previousDoc.status !== "iptal"
            ? "iptal"
            : doc.status === "onaylandi" && previousDoc.status !== "onaylandi"
              ? "onay"
              : doc.status !== "iptal" && (previousDoc.date !== doc.date || previousDoc.time !== doc.time)
                ? "degisti"
                : null;
        if (!kind) return;
        const { bookingVisitorEmail } = await import("../notify");
        const r = await bookingVisitorEmail(req, doc, kind);
        if (r.ok) {
          const { logActivity, idOf } = await import("../crm/automation");
          await logActivity(req, { type: "eposta", title: kind === "onay" ? "Ziyaretçiye onay e-postası gitti" : kind === "iptal" ? "Ziyaretçiye iptal e-postası gitti" : "Ziyaretçiye yeni saat e-postası gitti", body: doc.email, contact: idOf(doc.contact) ?? undefined, booking: doc.id });
        }
      },
    ],
    beforeChange: [
      async ({ data, originalDoc, req }) => {
        const date = data.date ?? originalDoc?.date;
        const time = data.time ?? originalDoc?.time;
        const status = data.status ?? originalDoc?.status;
        if (!date || !time) return data;
        data.slot = `${dayKey(date)} ${time}`;
        if (status === "iptal") return data;
        const clash = await req.payload.find({
          collection: "bookings",
          where: {
            and: [
              { slot: { equals: data.slot } },
              { status: { not_equals: "iptal" } },
              /* Takvim işletme başınadır */
              ...((data.tenant ?? originalDoc?.tenant) ? [{ tenant: { equals: data.tenant ?? originalDoc?.tenant } }] : []),
              ...(originalDoc?.id ? [{ id: { not_equals: originalDoc.id } }] : []),
            ],
          },
          limit: 1,
          depth: 0,
          overrideAccess: true,
          req,
        });
        if (clash.totalDocs > 0) {
          throw new APIError("Bu gün ve saatte başka bir randevu var. Lütfen farklı bir saat seçin.", 409, undefined, true);
        }
        return data;
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
    {
      type: "row",
      fields: [
        {
          name: "date",
          type: "date",
          label: "Gün",
          required: true,
          admin: { date: { pickerAppearance: "dayOnly", displayFormat: "dd.MM.yyyy" } },
        },
        {
          name: "time",
          type: "text",
          label: "Saat",
          required: true,
          admin: { placeholder: "14:00", description: "Saatler Ayarlar > Çalışma saatleri ve tatiller'den gelir." },
          validate: (v: string | null | undefined) => (v && /^([01]\d|2[0-3]):[0-5]\d$/.test(v)) || "Saati 14:00 biçiminde yazın.",
        },
      ],
    },
    { name: "topic", type: "text", label: "Konu" },
    { name: "note", type: "textarea", label: "Ziyaretçinin notu" },
    {
      name: "status",
      type: "select",
      label: "Durum",
      required: true,
      defaultValue: "bekliyor",
      options: BOOKING_STATUS,
      admin: { position: "sidebar" },
    },
    {
      name: "slot",
      type: "text",
      index: true,
      admin: { hidden: true },
    },
    { name: "source", type: "text", label: "Geldiği sayfa", admin: { position: "sidebar", readOnly: true } },
    kaynakField,
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
