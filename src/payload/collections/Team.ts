import type { CollectionConfig } from "payload";
import { isAdmin, isLoggedIn } from "../access";
import { orderField } from "../fields";
import { revalidate } from "../utils";

/** Ekip üyeleri: ana sayfadaki ekip bölümü ve /hakkimizda#ekip */
export const Team: CollectionConfig = {
  slug: "team",
  labels: { singular: "Ekip Üyesi", plural: "Ekip" },
  admin: {
    useAsTitle: "name",
    group: "Kurumsal",
    defaultColumns: ["name", "role", "showOnHome", "order"],
    pagination: { defaultLimit: 50 },
    description: "Fotoğraf yüklenmeyen kişi için marka renklerinde yer tutucu görünür.",
  },
  defaultSort: "order",
  access: { read: () => true, create: isLoggedIn, update: isLoggedIn, delete: isAdmin },
  hooks: {
    afterChange: [() => revalidate(["/", "/hakkimizda"])],
    afterDelete: [() => revalidate(["/", "/hakkimizda"])],
  },
  fields: [
    {
      type: "row",
      fields: [
        { name: "name", type: "text", label: "Ad Soyad", required: true },
        { name: "role", type: "text", label: "Unvan", required: true },
      ],
    },
    {
      name: "photo",
      type: "upload",
      relationTo: "media",
      label: "Fotoğraf",
      admin: { description: "Dikey portre önerilir (4:5). Yüz odağını görselin kendisinden ayarlayabilirsiniz." },
    },
    {
      name: "linkedin",
      type: "text",
      label: "LinkedIn adresi",
      admin: { placeholder: "https://www.linkedin.com/in/..." },
      validate: (value: string | null | undefined) =>
        !value || /^https:\/\/([a-z]{2,3}\.)?linkedin\.com\//i.test(value) || "https://linkedin.com/ ile başlayan bir adres girin.",
    },
    orderField,
    {
      name: "showOnHome",
      type: "checkbox",
      label: "Ana sayfada göster",
      defaultValue: true,
      admin: { position: "sidebar" },
    },
  ],
};
