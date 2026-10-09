import type { CollectionConfig } from "payload";
import { adminOrSelf, isAdmin, isAdminField, isLoggedIn } from "../access";
import { MODULES } from "../business/roles";

export const Users: CollectionConfig = {
  slug: "users",
  labels: { singular: "Kullanıcı", plural: "Kullanıcılar" },
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "email", "role"],
    group: "Ayarlar",
    /* Ekip üyesi kendi hesabını sağ üstten açar; kullanıcı listesi yöneticide */
    hidden: ({ user }) => (user as { role?: string } | null)?.role !== "admin",
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
    /* Erişim kaydı: kim, ne zaman giriş yaptı (Ayarlar > İşlem geçmişi) */
    afterLogin: [
      async ({ user, req }) => {
        await req.payload
          .create({ collection: "audit-log", data: { user: user.id, action: "giris", target: "Oturum", docId: String(user.id), summary: `${user.name ?? user.email} giriş yaptı` }, overrideAccess: true })
          .catch(() => {});
      },
    ],
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
        { label: "Ekip üyesi", value: "editor" },
      ],
      access: { create: isAdminField, update: isAdminField },
      admin: {
        position: "sidebar",
        description: "Yönetici her şeyi görür, kullanıcı ekler ve siler. Ekip üyesi yalnız aşağıda işaretlenen modüllerle çalışır.",
      },
    },
    {
      name: "modules",
      type: "select",
      hasMany: true,
      label: "Erişebildiği modüller",
      saveToJWT: true,
      defaultValue: ["site"],
      options: [...MODULES],
      access: { create: isAdminField, update: isAdminField },
      admin: {
        position: "sidebar",
        condition: (data) => data?.role !== "admin",
        description: "Örnek: satış ekibine Guru CRM ve Guru Chatbot, tasarım ekibine Guru Operation, içerik editörüne Site içeriği.",
      },
    },
  ],
};
