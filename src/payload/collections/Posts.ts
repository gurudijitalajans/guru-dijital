import type { CollectionConfig } from "payload";
import { isAdmin, isLoggedIn, publishedOrLoggedIn } from "../access";
import { revalidate, slugify } from "../utils";

type PostDoc = { slug?: string | null; _status?: string | null };

const pathsFor = (doc?: PostDoc | null) => ["/blog", "/", ...(doc?.slug ? [`/blog/${doc.slug}`] : [])];

export const Posts: CollectionConfig = {
  slug: "posts",
  labels: { singular: "Blog Yazısı", plural: "Blog Yazıları" },
  admin: {
    useAsTitle: "title",
    group: false,
    defaultColumns: ["title", "category", "_status", "publishedAt"],
    listSearchableFields: ["title", "excerpt"],
    preview: (doc) => (doc?.slug ? `/blog/${doc.slug}` : null),
  },
  versions: { drafts: true, maxPerDoc: 25 },
  defaultSort: "-publishedAt",
  access: {
    read: publishedOrLoggedIn,
    create: isLoggedIn,
    update: isLoggedIn,
    delete: isAdmin,
  },
  hooks: {
    beforeChange: [
      ({ data, req, operation }) => {
        if (operation === "create" && !data.author && req.user) data.author = req.user.id;
        if (data._status === "published" && !data.publishedAt) data.publishedAt = new Date().toISOString();
        return data;
      },
    ],
    afterChange: [
      ({ doc, previousDoc }) => {
        /* Adres değiştiyse eski sayfa da yenilenir */
        revalidate([...pathsFor(doc), ...pathsFor(previousDoc)]);
        return doc;
      },
    ],
    afterDelete: [({ doc }) => revalidate(pathsFor(doc))],
  },
  fields: [
    { name: "title", type: "text", label: "Başlık", required: true, maxLength: 110 },
    {
      name: "excerpt",
      type: "textarea",
      label: "Özet",
      required: true,
      maxLength: 220,
      admin: { description: "Liste kartında ve paylaşımlarda görünen 1-2 cümle." },
    },
    {
      name: "cover",
      type: "upload",
      relationTo: "media",
      label: "Kapak görseli",
      admin: { description: "Yatay görsel önerilir (en az 1600 px genişlik)." },
    },
    { name: "content", type: "richText", label: "İçerik", required: true },
    {
      name: "slug",
      type: "text",
      label: "Adres (slug)",
      unique: true,
      index: true,
      admin: { position: "sidebar", description: "Boş bırakırsanız başlıktan üretilir: /blog/adres" },
      hooks: {
        beforeValidate: [({ value, data }) => (value ? slugify(value) : data?.title ? slugify(data.title) : value)],
      },
    },
    {
      name: "category",
      type: "relationship",
      relationTo: "categories",
      label: "Kategori",
      admin: { position: "sidebar" },
    },
    {
      name: "publishedAt",
      type: "date",
      label: "Yayın tarihi",
      admin: {
        position: "sidebar",
        date: { pickerAppearance: "dayAndTime", displayFormat: "dd.MM.yyyy HH:mm" },
        description: "Boş bırakılırsa yayınlandığı an yazılır.",
      },
    },
    {
      name: "author",
      type: "relationship",
      relationTo: "users",
      label: "Yazar",
      admin: { position: "sidebar" },
    },
    {
      name: "seo",
      type: "group",
      label: "Arama motoru (SEO)",
      admin: { description: "Boş bırakılırsa başlık ve özet kullanılır." },
      fields: [
        { name: "title", type: "text", label: "SEO başlığı", maxLength: 60 },
        { name: "description", type: "textarea", label: "SEO açıklaması", maxLength: 160 },
      ],
    },
  ],
};
