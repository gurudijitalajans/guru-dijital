import { APIError, type CollectionConfig } from "payload";
import { isAdmin, isLoggedIn } from "../access";
import { busySlots, submitBooking } from "../endpoints/forms";
import { dayKey } from "../utils";
import { bookingToCrm, CRM_SKIP, syncBookingActivity } from "../crm/automation";

/* Sitedeki toplantı planlayıcısıyla aynı saatler (öğle arası hariç). */
export const TIME_SLOTS = ["10:00", "11:00", "13:00", "14:00", "15:00", "16:00"];

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
  access: { read: isLoggedIn, create: isLoggedIn, update: isLoggedIn, delete: isAdmin },
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
          type: "select",
          label: "Saat",
          required: true,
          options: TIME_SLOTS.map((t) => ({ label: t, value: t })),
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
