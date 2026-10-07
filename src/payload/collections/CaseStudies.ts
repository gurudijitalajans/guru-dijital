import type { CollectionConfig } from "payload";
import { isAdmin, isLoggedIn } from "../access";
import { orderField } from "../fields";
import { revalidate } from "../utils";

/**
 * Vaka çalışmaları: ana sayfadaki "Başarı hikayeleri" ve "Vaka sonuçları"
 * bölümü açık hizmet sayfaları. Rakamlar müşteri onaylı ve ölçülmüş
 * olmalıdır (Ticari Reklam Yönetmeliği: ispat yükü ajansta).
 */
export const CaseStudies: CollectionConfig = {
  slug: "case-studies",
  labels: { singular: "Vaka Çalışması", plural: "Vaka Çalışmaları" },
  admin: {
    useAsTitle: "title",
    group: "Kurumsal",
    defaultColumns: ["title", "sector", "showOnHome", "order"],
    description: "Yalnız ölçülmüş ve müşterinin paylaşmayı onayladığı sonuçları yazın.",
  },
  defaultSort: "order",
  access: { read: () => true, create: isLoggedIn, update: isLoggedIn, delete: isAdmin },
  hooks: {
    /* Ana sayfa ve vaka bölümü açık hizmet sayfaları */
    afterChange: [() => revalidate(["/"], "layout")],
    afterDelete: [() => revalidate(["/"], "layout")],
  },
  fields: [
    {
      type: "row",
      fields: [
        { name: "sector", type: "text", label: "Sektör", required: true, admin: { placeholder: "Sağlık / Klinik" } },
        { name: "title", type: "text", label: "Başlık", required: true },
      ],
    },
    { name: "summary", type: "textarea", label: "Özet", required: true },
    {
      name: "stats",
      type: "array",
      label: "Sonuçlar",
      labels: { singular: "Sonuç", plural: "Sonuçlar" },
      minRows: 1,
      maxRows: 8,
      admin: { description: "\"Kartta göster\" seçili ilk üç sonuç kartta görünür; hiçbiri seçili değilse ilk üçü." },
      fields: [
        {
          type: "row",
          fields: [
            { name: "label", type: "text", label: "Etiket", required: true, admin: { width: "45%" } },
            { name: "value", type: "number", label: "Değer", required: true, admin: { width: "18%" } },
            { name: "prefix", type: "text", label: "Ön ek", admin: { width: "12%" } },
            { name: "suffix", type: "text", label: "Ek", admin: { width: "12%", placeholder: "%" } },
          ],
        },
        { name: "featured", type: "checkbox", label: "Kartta göster" },
      ],
    },
    {
      name: "note",
      type: "text",
      label: "Dipnot",
      admin: { description: "Kartın altında küçük yazı: ölçüm süresi, koşul vb." },
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
