import type { CollectionConfig } from "payload";
import { isAdmin, isLoggedIn } from "../access";
import { orderField } from "../fields";
import { revalidate } from "../utils";

/**
 * Referans markalar: ana sayfadaki kayan logo şeridi ve sayılar
 * ("30 markanın yol arkadaşı", hakkımızda). Logo yüklenmeyen marka adıyla yazılır.
 */
export const References: CollectionConfig = {
  slug: "references",
  labels: { singular: "Referans", plural: "Referanslar" },
  admin: {
    useAsTitle: "name",
    group: "Kurumsal",
    defaultColumns: ["name", "logo", "order"],
    pagination: { defaultLimit: 50 },
    description: "Logolar şeritte gri tonda ve aynı yükseklikte gösterilir; şeffaf zeminli SVG ya da PNG önerilir.",
  },
  defaultSort: "order",
  access: { read: () => true, create: isLoggedIn, update: isLoggedIn, delete: isAdmin },
  hooks: {
    afterChange: [() => revalidate(["/", "/hakkimizda"])],
    afterDelete: [() => revalidate(["/", "/hakkimizda"])],
  },
  fields: [
    { name: "name", type: "text", label: "Marka adı", required: true },
    { name: "logo", type: "upload", relationTo: "media", label: "Logo" },
    orderField,
  ],
};
