import type { CollectionConfig } from "payload";
import { isAdmin, isLoggedIn } from "../access";
import { orderField } from "../fields";
import { revalidate } from "../utils";

/**
 * Müşteri yorumları: ana sayfadaki "Markalar ne diyor" bölümü. Uydurma
 * alıntı yayınlanmaz: yorum metni yalnız "Yayın izni alındı" işaretliyse
 * görünür, aksi halde kart boş yer tutucu olarak kalır.
 */
export const Testimonials: CollectionConfig = {
  slug: "testimonials",
  labels: { singular: "Müşteri Yorumu", plural: "Müşteri Yorumları" },
  admin: {
    useAsTitle: "name",
    group: "Kurumsal",
    defaultColumns: ["name", "company", "consent", "order"],
    description: "Yorum metni, kişiden yazılı yayın izni alınıp işaretlenene kadar sitede görünmez.",
  },
  defaultSort: "order",
  access: { read: () => true, create: isLoggedIn, update: isLoggedIn, delete: isAdmin },
  hooks: {
    afterChange: [() => revalidate(["/"])],
    afterDelete: [() => revalidate(["/"])],
  },
  fields: [
    { name: "quote", type: "textarea", label: "Yorum", maxLength: 400 },
    {
      type: "row",
      fields: [
        { name: "name", type: "text", label: "Ad Soyad", required: true },
        { name: "title", type: "text", label: "Unvan" },
        { name: "company", type: "text", label: "Firma" },
      ],
    },
    { name: "photo", type: "upload", relationTo: "media", label: "Fotoğraf ya da logo" },
    {
      name: "consent",
      type: "checkbox",
      label: "Yayın izni alındı",
      admin: { position: "sidebar", description: "Kişinin adı ve yorumu için yazılı izin alındıysa işaretleyin." },
    },
    orderField,
  ],
};
