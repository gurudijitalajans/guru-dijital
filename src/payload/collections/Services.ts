import type { CollectionConfig } from "payload";
import { isAdmin, isLoggedIn, publishedOrLoggedIn } from "../access";
import { faqField, iconField, orderField, slugField, textList } from "../fields";
import { revalidate } from "../utils";

/**
 * Hizmetler: /hizmetler listesi, /hizmetler/[adres] sayfası, ana sayfa
 * kartları, menü ve alt bilgi buradan beslenir. Taslak kaydedip
 * yayınlayınca site yenilenir.
 */
export const Services: CollectionConfig = {
  slug: "services",
  labels: { singular: "Hizmet", plural: "Hizmetler" },
  admin: {
    useAsTitle: "title",
    group: "İçerik",
    defaultColumns: ["title", "order", "_status", "updatedAt"],
    preview: (doc) => (doc?.slug ? `/hizmetler/${doc.slug}` : null),
  },
  defaultSort: "order",
  versions: { drafts: true, maxPerDoc: 20 },
  access: { read: publishedOrLoggedIn, create: isLoggedIn, update: isLoggedIn, delete: isAdmin },
  hooks: {
    /* Menü ve alt bilgi her sayfada olduğu için tüm site yenilenir */
    afterChange: [() => revalidate(["/"], "layout")],
    afterDelete: [() => revalidate(["/"], "layout")],
  },
  fields: [
    { name: "title", type: "text", label: "Hizmet adı", required: true },
    {
      name: "short",
      type: "textarea",
      label: "Kısa açıklama",
      required: true,
      maxLength: 220,
      admin: { description: "Kartlarda ve sayfa girişinde görünen tek cümle." },
    },
    {
      type: "tabs",
      tabs: [
        {
          label: "Görseller",
          fields: [
            {
              name: "cardImage",
              type: "upload",
              relationTo: "media",
              label: "Liste kartı görseli",
              admin: { description: "/hizmetler sayfasındaki kartta görünür." },
            },
            {
              name: "gallery",
              type: "array",
              label: "Sayfa galerisi",
              labels: { singular: "Görsel", plural: "Görseller" },
              admin: {
                description:
                  "İlk görsel solda büyük, sonraki iki görsel sağda üst üste, kalanlar altta tam genişlikte görünür. Kırpma odağını görselin kendisinden ayarlayabilirsiniz.",
              },
              fields: [{ name: "image", type: "upload", relationTo: "media", label: "Görsel", required: true }],
            },
          ],
        },
        {
          label: "Kapsam",
          fields: [
            { name: "headline", type: "text", label: "Alt başlık", required: true },
            { name: "offeringsTitle", type: "text", label: "Kapsam başlığı", required: true },
            textList("intro", "Tanıtım paragrafları", "Paragraf", { textarea: true, minRows: 1 }),
            textList("offerings", "Kapsam maddeleri", "Madde", {
              minRows: 1,
              description: "Numaralı kartlar olarak sırayla listelenir.",
            }),
            textList("keywords", "Öne çıkan etiketler", "Etiket", {
              description: "Kapsam metninin altında küçük haplar olarak görünür.",
            }),
          ],
        },
        { label: "SSS", fields: [faqField] },
        {
          label: "Ek bölümler",
          fields: [
            {
              name: "showCases",
              type: "checkbox",
              label: "Vaka sonuçları ve ödülleri göster",
              admin: { description: "Ölçülmüş kampanya sonuçları ve Google ödülleri bölümü." },
            },
            {
              name: "showWebProjects",
              type: "checkbox",
              label: "Yayındaki web sitelerini göster",
              admin: { description: "Tasarlayıp yayına aldığımız sitelerin bağlantı listesi." },
            },
          ],
        },
        {
          label: "SEO",
          fields: [
            {
              name: "seoDescription",
              type: "textarea",
              label: "Arama sonucu açıklaması",
              maxLength: 170,
              admin: { description: "140-160 karakter önerilir. Boşsa kısa açıklama kullanılır." },
            },
          ],
        },
      ],
    },
    slugField("title", "/hizmetler"),
    orderField,
    iconField(),
  ],
};
