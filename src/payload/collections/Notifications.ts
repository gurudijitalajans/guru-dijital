import type { CollectionConfig } from "payload";

/**
 * Panel içi bildirimler (üst çubuktaki zil): yeni talep, randevu, ekibe aktarılan
 * sohbet, atanan görev, kontrol bekleyen iş. Her kişi yalnız kendi bildirimini
 * görür ve okundu işaretler; kayıtları sistem yazar. 60 günden eskiler silinir.
 */
export const Notifications: CollectionConfig = {
  slug: "notifications",
  labels: { singular: "Bildirim", plural: "Bildirimler" },
  admin: { hidden: true, useAsTitle: "title" },
  access: {
    read: ({ req }) => (req.user ? { user: { equals: req.user.id } } : false),
    update: ({ req }) => (req.user ? { user: { equals: req.user.id } } : false),
    create: () => false,
    delete: ({ req }) => (req.user ? { user: { equals: req.user.id } } : false),
  },
  fields: [
    { name: "user", type: "relationship", relationTo: "users", required: true, index: true },
    { name: "tenant", type: "number", index: true },
    { name: "kind", type: "text" },
    { name: "title", type: "text", required: true },
    { name: "body", type: "text" },
    { name: "href", type: "text" },
    { name: "read", type: "checkbox", defaultValue: false, index: true },
  ],
};
