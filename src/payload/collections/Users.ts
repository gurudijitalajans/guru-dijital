import type { CollectionConfig } from "payload";
import { adminOrSelf, isAdmin, isAdminField, isLoggedIn } from "../access";

export const Users: CollectionConfig = {
  slug: "users",
  labels: { singular: "Kullanıcı", plural: "Kullanıcılar" },
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "email", "role"],
    group: "Ayarlar",
  },
  auth: {
    tokenExpiration: 60 * 60 * 8,
    maxLoginAttempts: 5,
    lockTime: 10 * 60 * 1000,
  },
  access: {
    admin: ({ req }) => Boolean(req.user),
    read: isLoggedIn,
    create: isAdmin,
    update: adminOrSelf,
    delete: isAdmin,
  },
  hooks: {
    /* İlk hesap her zaman yönetici olur (panelin "ilk kullanıcı" ekranı dahil). */
    beforeValidate: [
      async ({ data, operation, req }) => {
        if (operation !== "create" || !data) return data;
        const { totalDocs } = await req.payload.count({ collection: "users", overrideAccess: true });
        if (totalDocs === 0) data.role = "admin";
        return data;
      },
    ],
  },
  fields: [
    { name: "name", type: "text", label: "Ad Soyad", required: true },
    {
      name: "weeklyHours",
      type: "number",
      label: "Haftalık çalışma saati",
      defaultValue: 40,
      min: 0,
      admin: { position: "sidebar", description: "Guru Operation ekip planındaki doluluk yüzdesi bu saate göre hesaplanır." },
    },
    {
      name: "role",
      type: "select",
      label: "Rol",
      required: true,
      defaultValue: "editor",
      saveToJWT: true,
      options: [
        { label: "Yönetici", value: "admin" },
        { label: "Editör", value: "editor" },
      ],
      access: { create: isAdminField, update: isAdminField },
      admin: {
        position: "sidebar",
        description: "Editör içerik ve müşteri kayıtlarıyla çalışır; kullanıcı ekleme ve silme yöneticidedir.",
      },
    },
  ],
};
