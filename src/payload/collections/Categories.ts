import type { CollectionConfig } from "payload";
import { isAdmin, isLoggedIn } from "../access";
import { revalidate, slugify } from "../utils";

export const Categories: CollectionConfig = {
  slug: "categories",
  labels: { singular: "Kategori", plural: "Kategoriler" },
  admin: { useAsTitle: "title", group: "Blog", defaultColumns: ["title", "slug"] },
  access: { read: () => true, create: isLoggedIn, update: isLoggedIn, delete: isAdmin },
  hooks: {
    afterChange: [() => revalidate(["/blog"], "layout")],
  },
  fields: [
    { name: "title", type: "text", label: "Ad", required: true },
    {
      name: "slug",
      type: "text",
      label: "Adres (slug)",
      unique: true,
      index: true,
      admin: { position: "sidebar", description: "Boş bırakırsanız addan üretilir." },
      hooks: {
        beforeValidate: [({ value, data }) => (value ? slugify(value) : data?.title ? slugify(data.title) : value)],
      },
    },
  ],
};
