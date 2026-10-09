import type { CollectionConfig } from "payload";
import { isAdmin, isLoggedIn, publishedOrLoggedIn } from "../access";
import { faqField, iconField, orderField, pageMap, ratioValidate, slugField, textHelper, textList, titleDescList } from "../fields";
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
    group: false,
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
      admin: { description: "Ana sayfa ve ürünler sayfasındaki kartlarda görünür." },
    },
    /* Beş bölüm, sayfanın yukarıdan aşağı sırasıyla. Veri adları (hero, tour,
       comparison, seo) eski sekmelerle aynı gruplardır: veritabanı değişmez. */
    {
      type: "tabs",
      tabs: [
        {
          label: "Sayfanın üstü",
          description: "Ürün sayfasının ilk ekranı: başlık, açıklama, düğme ve sağdaki görsel.",
          fields: [
            pageMap("mapHero", "urun", ["Giriş"]),
            {
              name: "hero",
              type: "group",
              label: false,
              fields: [
                { name: "eyebrow", type: "text", label: "Üst etiket", admin: { description: "Başlığın üstündeki küçük etiket. Boşsa ürün adı yazar." } },
                { name: "headline", type: "text", label: "Başlık", required: true },
                textHelper("headlineHelper", "hero.headline", "accent"),
                { name: "sub", type: "textarea", label: "Açıklama", required: true },
                { name: "ctaLabel", type: "text", label: "Düğme metni", defaultValue: "Demo Talep Edin" },
                textList("trust", "Güven ifadeleri", "İfade", {
                  maxRows: 3,
                  description: "Düğmelerin altında tik işaretiyle; yalnız taahhüt ettiğiniz bilgiler (ör. Standart kurulum aynı gün).",
                }),
              ],
            },
            {
              name: "heroVisual",
              type: "upload",
              relationTo: "media",
              label: "Giriş görseli",
              validate: ratioValidate(4 / 3, "4:3", "Giriş görseli") as never,
              admin: { description: "Başlığın yanında duran yatay görsel (4:3)." },
            },
          ],
        },
        {
          label: "Ekranlar ve video",
          description: "Ürün turu videosu ve görselle metnin dönüşümlü sıralandığı ekran satırları.",
          fields: [
            pageMap("mapScreens", "urun", ["Ürün turu videosu", "Öne çıkan ekranlar"]),
            {
              name: "tour",
              type: "group",
              label: "Ürün turu videosu",
              fields: [
                { name: "show", type: "checkbox", label: "Bölümü göster", defaultValue: true },
                { name: "title", type: "text", label: "Başlık", admin: { placeholder: "Guru Chatbot ürün turu" } },
                {
                  name: "videoUrl",
                  type: "text",
                  label: "Video adresi",
                  admin: { description: "Site içindeki dosya (/video/products/guru-chatbot.mp4) ya da https ile başlayan mp4 adresi." },
                },
                { name: "poster", type: "upload", relationTo: "media", label: "Kapak görseli", admin: { description: "Oynat düğmesinin arkasındaki kare. Boşsa videonun hazır kapağı kullanılır." } },
              ],
            },
            {
              name: "showcase",
              type: "array",
              label: "Öne çıkan ekranlar",
              labels: { singular: "Ekran", plural: "Ekranlar" },
              maxRows: 4,
              admin: { description: "Görsel ve metin dönüşümlü satırlar; üç satır önerilir." },
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
                {
                  name: "image",
                  type: "upload",
                  relationTo: "media",
                  label: "Görsel",
                  required: true,
                  validate: ratioValidate(4 / 3, "4:3", "Ekran görseli") as never,
                  admin: { description: "Yatay ekran görseli (4:3)." },
                },
              ],
            },
          ],
        },
        {
          label: "Ayrıntılar",
          description: "Sayfanın orta bölümleri. Her bölümü açıp kapatabilirsiniz; boş bırakılan bölüm sitede görünmez.",
          fields: [
            pageMap("mapDetails", "urun", ["Ve daha fazlası", "Bugün / Guru ile", "Nasıl çalışır", "Kullanım senaryoları", "Sayılar bandı", "Neler dahil", "Entegrasyonlar"]),
            {
              type: "collapsible",
              label: "Ve daha fazlası (özellik kartları)",
              admin: { initCollapsed: true },
              fields: [
                {
                  name: "features",
                  type: "array",
                  label: "Özellikler",
                  labels: { singular: "Özellik", plural: "Özellikler" },
                  admin: { description: "İkonlu kartlar; altı özellik önerilir." },
                  fields: [
                    { type: "row", fields: [{ name: "title", type: "text", label: "Başlık", required: true }, iconField({ width: "40%" })] },
                    { name: "desc", type: "textarea", label: "Açıklama", required: true },
                  ],
                },
              ],
            },
            {
              type: "collapsible",
              label: "Bugün / Guru ile karşılaştırması",
              admin: { initCollapsed: true },
              fields: [
                {
                  name: "comparison",
                  type: "group",
                  label: false,
                  admin: { description: "İki sütun; dört madde önerilir." },
                  fields: [textList("before", "Bugün", "Madde", { maxRows: 6 }), textList("after", "Guru ile", "Madde", { maxRows: 6 })],
                },
              ],
            },
            {
              type: "collapsible",
              label: "Nasıl çalışır",
              admin: { initCollapsed: true },
              fields: [titleDescList("steps", "Adımlar", "Adım", "Numaralı kartlar; dört adım önerilir.")],
            },
            {
              type: "collapsible",
              label: "Kullanım senaryoları",
              admin: { initCollapsed: true },
              fields: [titleDescList("useCases", "Kullanım senaryoları", "Senaryo")],
            },
            {
              type: "collapsible",
              label: "Sayılar bandı",
              admin: { initCollapsed: true },
              fields: [
                {
                  name: "stats",
                  type: "array",
                  label: "Sayılar",
                  labels: { singular: "Sayı", plural: "Sayılar" },
                  maxRows: 4,
                  admin: { description: "Yalnız ürün ve kurulum gerçekleri (kanal sayısı, kurulum süresi). Kaynağı olmayan performans rakamı yazmayın." },
                  fields: [
                    {
                      type: "row",
                      fields: [
                        { name: "value", type: "number", label: "Değer", required: true },
                        { name: "suffix", type: "text", label: "Ek", admin: { description: "%, /24, gün…" } },
                        { name: "label", type: "text", label: "Etiket", required: true },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              type: "collapsible",
              label: "Kurulumdan desteğe neler dahil",
              admin: { initCollapsed: true },
              fields: [
                {
                  name: "included",
                  type: "array",
                  label: "Neler dahil",
                  labels: { singular: "Kalem", plural: "Kalemler" },
                  maxRows: 6,
                  fields: [
                    { type: "row", fields: [{ name: "title", type: "text", label: "Başlık", required: true }, iconField({ width: "40%" })] },
                    { name: "desc", type: "textarea", label: "Açıklama", required: true },
                  ],
                },
              ],
            },
            {
              type: "collapsible",
              label: "Entegrasyonlar",
              admin: { initCollapsed: true },
              fields: [textList("integrations", "Entegrasyonlar", "Entegrasyon")],
            },
          ],
        },
        {
          label: "Sorular",
          description: "Sayfanın sonundaki sık sorulan sorular.",
          fields: [pageMap("mapFaq", "urun", ["Sık sorulan sorular"]), faqField],
        },
        {
          label: "Kartlar ve paylaşım",
          description: "Ürünün sayfa dışında göründüğü yerler: ana sayfa ve ürünler sayfasındaki kartlar, sosyal medya paylaşımı, arama sonucu.",
          fields: [
            pageMap("mapCards", "urun-dis", ["Ana sayfa ürün kartı", "Ürünler sayfası kartı", "Sosyal medya paylaşımı", "Arama sonucu"], "Nerede görünür"),
            {
              name: "cover",
              type: "upload",
              relationTo: "media",
              label: "Kart kapağı",
              validate: ratioValidate(4 / 5, "4:5 (dikey)", "Kart kapağı") as never,
              admin: { description: "Ana sayfa ve ürün kartlarındaki dikey kapak (4:5)." },
            },
            textList("highlights", "Kart maddeleri", "Madde", { minRows: 1, maxRows: 4, description: "Ürünler sayfasındaki kartta tik işaretiyle; üç madde önerilir." }),
            {
              name: "screenshot",
              type: "upload",
              relationTo: "media",
              label: "Ekran görüntüsü",
              required: true,
              admin: { description: "Yatay ürün ekranı; kapak yoksa kartlarda bunun yerine kullanılır." },
            },
            {
              name: "ogImage",
              type: "upload",
              relationTo: "media",
              label: "Paylaşım görseli",
              validate: ratioValidate(1200 / 630, "1200x630 (yatay)", "Paylaşım görseli") as never,
              admin: { description: "Bağlantı WhatsApp ya da sosyal medyada paylaşılınca görünen görsel. Boşsa ürünün hazır paylaşım görseli kullanılır." },
            },
            {
              name: "seo",
              type: "group",
              label: "Arama sonucu",
              fields: [
                { name: "title", type: "text", label: "Sayfa başlığı", maxLength: 70, admin: { description: "Google'da mavi başlık. Boşsa ürün adı ve slogan." } },
                { name: "description", type: "textarea", label: "Arama sonucu açıklaması", maxLength: 170, admin: { description: "Başlığın altındaki iki satır." } },
                textList("keywords", "Anahtar kelimeler", "Kelime"),
              ],
            },
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
