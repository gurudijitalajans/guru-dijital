import type { CollectionConfig } from "payload";
import { isAdmin, isLoggedIn, publishedOrLoggedIn } from "../access";
import { faqField, iconField, orderField, slugField, textList, titleDescList } from "../fields";
import { revalidate } from "../utils";

/**
 * Yazılım ürünleri: /urunler listesi, /urunler/[adres] sayfası, ana sayfa
 * kartları, menü ve alt bilgi buradan beslenir.
 */
export const Products: CollectionConfig = {
  slug: "products",
  labels: { singular: "Ürün", plural: "Ürünler" },
  admin: {
    useAsTitle: "name",
    group: "İçerik",
    defaultColumns: ["name", "tagline", "order", "_status"],
    preview: (doc) => (doc?.slug ? `/urunler/${doc.slug}` : null),
  },
  defaultSort: "order",
  versions: { drafts: true, maxPerDoc: 20 },
  access: { read: publishedOrLoggedIn, create: isLoggedIn, update: isLoggedIn, delete: isAdmin },
  hooks: {
    afterChange: [() => revalidate(["/"], "layout")],
    afterDelete: [() => revalidate(["/"], "layout")],
  },
  fields: [
    {
      type: "row",
      fields: [
        { name: "name", type: "text", label: "Ürün adı", required: true },
        { name: "tagline", type: "text", label: "Slogan", required: true, maxLength: 60 },
      ],
    },
    {
      name: "desc",
      type: "textarea",
      label: "Kart açıklaması",
      required: true,
      maxLength: 240,
      admin: { description: "Ana sayfa ve /urunler kartlarında görünür." },
    },
    {
      type: "tabs",
      tabs: [
        {
          label: "Kart ve görsel",
          fields: [
            textList("highlights", "Kart maddeleri", "Madde", { minRows: 1, maxRows: 4, description: "Kartta tik işaretiyle listelenir; üç madde önerilir." }),
            {
              name: "screenshot",
              type: "upload",
              relationTo: "media",
              label: "Ekran görüntüsü",
              required: true,
              admin: { description: "Yatay ürün ekranı (1600x1100 önerilir). Alternatif metni medya kaydından gelir." },
            },
            {
              type: "row",
              fields: [
                {
                  name: "heroVisual",
                  type: "upload",
                  relationTo: "media",
                  label: "Giriş görseli",
                  admin: { description: "Ürün sayfasının girişinde, marka ışık yelpazesiyle (4:3, 1600x1200)." },
                },
                {
                  name: "cover",
                  type: "upload",
                  relationTo: "media",
                  label: "Kapak görseli",
                  admin: { description: "Ana sayfa ve ürün kartlarındaki App Store tarzı dikey kapak (4:5, 1200x1500)." },
                },
                {
                  name: "ogImage",
                  type: "upload",
                  relationTo: "media",
                  label: "Paylaşım görseli",
                  admin: { description: "Sosyal medyada paylaşılınca görünen görsel (1200x630). Boşsa ürünün hazır paylaşım görseli kullanılır." },
                },
              ],
            },
          ],
        },
        {
          name: "hero",
          label: "Sayfa girişi",
          fields: [
            { name: "eyebrow", type: "text", label: "Üst etiket", admin: { description: "Boşsa ürün adı kullanılır." } },
            {
              name: "headline",
              type: "text",
              label: "Başlık",
              required: true,
              admin: { description: "Yıldız içindeki kelime bir kademe kalın yazılır: Müşterinize *7/24* yanıt veren asistan" },
            },
            { name: "sub", type: "textarea", label: "Açıklama", required: true },
            { name: "ctaLabel", type: "text", label: "Buton metni", defaultValue: "Demo Talep Et" },
            textList("trust", "Güven ifadeleri", "İfade", {
              maxRows: 3,
              description: "Butonların altında tik işaretiyle; yalnız taahhüt ettiğiniz bilgiler (ör. Standart kurulum aynı gün).",
            }),
          ],
        },
        {
          name: "tour",
          label: "Ürün turu",
          fields: [
            { name: "show", type: "checkbox", label: "Bölümü göster", defaultValue: true },
            { name: "title", type: "text", label: "Başlık", admin: { placeholder: "Guru Chatbot ürün turu" } },
            {
              name: "videoUrl",
              type: "text",
              label: "Video adresi",
              admin: { description: "Site içindeki dosya (/video/products/guru-chatbot.mp4) ya da https ile başlayan mp4 adresi." },
            },
            { name: "poster", type: "upload", relationTo: "media", label: "Kapak görseli", admin: { description: "Boşsa videonun hazır kapak karesi kullanılır." } },
          ],
        },
        {
          label: "Öne çıkan ekranlar",
          fields: [
            {
              name: "showcase",
              type: "array",
              label: "Öne çıkan ekranlar",
              labels: { singular: "Ekran", plural: "Ekranlar" },
              maxRows: 4,
              admin: { description: "Görsel ve metin dönüşümlü satırlar; üç satır önerilir. Görsel 4:3 (1200x900)." },
              fields: [
                {
                  type: "row",
                  fields: [
                    { name: "eyebrow", type: "text", label: "Üst etiket", admin: { width: "35%" } },
                    { name: "title", type: "text", label: "Başlık", required: true },
                  ],
                },
                { name: "desc", type: "textarea", label: "Açıklama", required: true },
                textList("bullets", "Maddeler", "Madde", { maxRows: 4 }),
                { name: "image", type: "upload", relationTo: "media", label: "Görsel", required: true },
              ],
            },
          ],
        },
        {
          name: "comparison",
          label: "Karşılaştırma",
          admin: { description: "\"Bugün\" ve \"Guru ile\" sütunları; dört madde önerilir." },
          fields: [
            textList("before", "Bugün", "Madde", { maxRows: 6 }),
            textList("after", "Guru ile", "Madde", { maxRows: 6 }),
          ],
        },
        {
          label: "Neler dahil",
          fields: [
            {
              name: "included",
              type: "array",
              label: "Neler dahil",
              labels: { singular: "Kalem", plural: "Kalemler" },
              maxRows: 6,
              fields: [
                {
                  type: "row",
                  fields: [{ name: "title", type: "text", label: "Başlık", required: true }, iconField({ width: "40%" })],
                },
                { name: "desc", type: "textarea", label: "Açıklama", required: true },
              ],
            },
          ],
        },
        {
          label: "Özellikler",
          fields: [
            {
              name: "features",
              type: "array",
              label: "Özellikler",
              labels: { singular: "Özellik", plural: "Özellikler" },
              admin: { description: "İkonlu kartlar; altı özellik önerilir." },
              fields: [
                {
                  type: "row",
                  fields: [
                    { name: "title", type: "text", label: "Başlık", required: true },
                    iconField({ width: "40%" }),
                  ],
                },
                { name: "desc", type: "textarea", label: "Açıklama", required: true },
              ],
            },
          ],
        },
        { label: "Nasıl çalışır", fields: [titleDescList("steps", "Adımlar", "Adım", "Numaralı kartlar; dört adım önerilir.")] },
        { label: "Senaryolar", fields: [titleDescList("useCases", "Kullanım senaryoları", "Senaryo")] },
        {
          label: "Sayılar",
          fields: [
            {
              name: "stats",
              type: "array",
              label: "Sayılar bandı",
              labels: { singular: "Sayı", plural: "Sayılar" },
              maxRows: 4,
              admin: {
                description:
                  "Yalnız ürün ve kurulum ifadeleri (kanal sayısı, kurulum süresi). Kaynağı olmayan performans yüzdesi yazmayın.",
              },
              fields: [
                {
                  type: "row",
                  fields: [
                    { name: "value", type: "number", label: "Değer", required: true },
                    { name: "suffix", type: "text", label: "Ek", admin: { description: "%, /7, gün…" } },
                    { name: "label", type: "text", label: "Etiket", required: true },
                  ],
                },
              ],
            },
          ],
        },
        { label: "Entegrasyonlar", fields: [textList("integrations", "Entegrasyonlar", "Entegrasyon")] },
        { label: "SSS", fields: [faqField] },
        {
          name: "seo",
          label: "SEO",
          fields: [
            { name: "title", type: "text", label: "Sayfa başlığı", maxLength: 70, admin: { description: "Boşsa ürün adı ve slogan." } },
            { name: "description", type: "textarea", label: "Arama sonucu açıklaması", maxLength: 170 },
            textList("keywords", "Anahtar kelimeler", "Kelime"),
          ],
        },
      ],
    },
    slugField("name", "/urunler"),
    orderField,
    iconField(),
    {
      name: "bundle",
      type: "relationship",
      relationTo: "products",
      hasMany: true,
      label: "Pakete dahil ürünler",
      admin: { position: "sidebar", description: "Paket ürünlerde (ör. Guru Business) sayfada \"Pakete dahil\" bölümü olarak görünür." },
    },
  ],
};
