import type { GlobalConfig } from "payload";
import { isLoggedIn } from "../access";
import { iconField } from "../fields";
import { revalidate } from "../utils";
import { ABOUT_DEFAULTS as D } from "@/lib/about-defaults";

/**
 * Hakkımızda sayfası. Ekip kartları "Kurumsal > Ekip"ten, sayılar kayıt
 * sayılarından gelir. Ödüllerin ilki alt bilgideki rozette de görünür;
 * ödüller ayrıca "Vaka sonuçları" açık hizmet sayfalarında listelenir.
 */
export const AboutPage: GlobalConfig = {
  slug: "about-page",
  label: "Hakkımızda",
  admin: { group: false, description: "Kaydettiğinizde Hakkımızda sayfası ve ödüllerin geçtiği yerler güncellenir." },
  access: { read: () => true, update: isLoggedIn },
  hooks: {
    /* Ödüller alt bilgide de görünür: tüm site */
    afterChange: [() => revalidate(["/"], "layout")],
  },
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          name: "intro",
          label: "Giriş",
          fields: [
            { name: "eyebrow", type: "text", label: "Üst etiket", defaultValue: D.intro.eyebrow },
            { name: "title", type: "text", label: "Başlık", required: true, defaultValue: D.intro.title },
            { name: "lead", type: "textarea", label: "Açıklama", defaultValue: D.intro.lead },
            {
              type: "row",
              fields: [
                { name: "primaryLabel", type: "text", label: "Ana buton", required: true, defaultValue: D.intro.primaryLabel },
                { name: "primaryHref", type: "text", label: "Ana buton adresi", required: true, defaultValue: D.intro.primaryHref },
              ],
            },
            {
              type: "row",
              fields: [
                { name: "secondaryLabel", type: "text", label: "İkinci buton", defaultValue: D.intro.secondaryLabel },
                { name: "secondaryHref", type: "text", label: "İkinci buton adresi", defaultValue: D.intro.secondaryHref },
              ],
            },
          ],
        },
        {
          name: "story",
          label: "Hikâye ve ilkeler",
          fields: [
            { name: "title", type: "text", label: "Başlık", required: true, defaultValue: D.story.title },
            {
              name: "paragraphs",
              type: "array",
              label: "Paragraflar",
              labels: { singular: "Paragraf", plural: "Paragraflar" },
              defaultValue: D.story.paragraphs.map((text) => ({ text })),
              fields: [{ name: "text", type: "textarea", label: "Paragraf", required: true }],
            },
            { name: "valuesLabel", type: "text", label: "İlkeler etiketi", defaultValue: D.story.valuesLabel },
            {
              name: "values",
              type: "array",
              label: "İlkeler",
              labels: { singular: "İlke", plural: "İlkeler" },
              defaultValue: D.story.values,
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
          name: "awards",
          label: "Ödüller",
          fields: [
            { name: "show", type: "checkbox", label: "Bölümü göster", defaultValue: D.awards.show },
            { name: "title", type: "text", label: "Başlık", required: true, defaultValue: D.awards.title },
            { name: "lead", type: "textarea", label: "Açıklama", defaultValue: D.awards.lead },
            {
              name: "items",
              type: "array",
              label: "Ödüller",
              labels: { singular: "Ödül", plural: "Ödüller" },
              admin: { description: "İlk ödül alt bilgideki rozette de görünür (ör. 2025 Google Partner)." },
              defaultValue: D.awards.items.map((a) => ({ title: a.title, year: a.year, badge: a.badge, icon: a.icon, desc: a.desc })),
              fields: [
                {
                  type: "row",
                  fields: [
                    { name: "title", type: "text", label: "Ödül adı", required: true },
                    { name: "year", type: "text", label: "Yıl", required: true, admin: { width: "15%" } },
                  ],
                },
                {
                  type: "row",
                  fields: [
                    { name: "badge", type: "text", label: "Kısa etiket", admin: { placeholder: "Partner Rozeti" } },
                    iconField({ width: "40%" }),
                  ],
                },
                { name: "desc", type: "textarea", label: "Açıklama", required: true },
                { name: "image", type: "upload", relationTo: "media", label: "Görsel" },
              ],
            },
          ],
        },
        {
          label: "Ekip ve sayılar",
          fields: [
            {
              name: "team",
              type: "group",
              label: "Ekip bölümü",
              admin: { description: "Kişiler \"Kurumsal > Ekip\"ten gelir." },
              fields: [
                { name: "show", type: "checkbox", label: "Bölümü göster", defaultValue: D.team.show },
                { name: "title", type: "text", label: "Başlık", required: true, defaultValue: D.team.title },
                { name: "lead", type: "textarea", label: "Açıklama", defaultValue: D.team.lead },
              ],
            },
            {
              name: "stats",
              type: "group",
              label: "Sayılar bandı",
              admin: { description: "Sayılar referans, hizmet ve ürün kayıtlarından otomatik hesaplanır." },
              fields: [
                { name: "show", type: "checkbox", label: "Bölümü göster", defaultValue: D.stats.show },
                { name: "title", type: "text", label: "Başlık", required: true, defaultValue: D.stats.title },
                {
                  type: "row",
                  fields: [
                    { name: "referencesLabel", type: "text", label: "Referans etiketi", defaultValue: D.stats.referencesLabel },
                    { name: "servicesLabel", type: "text", label: "Hizmet etiketi", defaultValue: D.stats.servicesLabel },
                    { name: "productsLabel", type: "text", label: "Ürün etiketi", defaultValue: D.stats.productsLabel },
                  ],
                },
              ],
            },
          ],
        },
        {
          name: "closing",
          label: "Kapanış",
          fields: [
            { name: "title", type: "text", label: "Başlık", required: true, defaultValue: D.closing.title },
            { name: "lead", type: "textarea", label: "Metin", defaultValue: D.closing.lead },
            { name: "primaryLabel", type: "text", label: "Buton", required: true, defaultValue: D.closing.primaryLabel },
          ],
        },
        {
          name: "seo",
          label: "SEO",
          fields: [
            { name: "title", type: "text", label: "Sayfa başlığı", maxLength: 60, defaultValue: D.seo.title },
            { name: "description", type: "textarea", label: "Arama sonucu açıklaması", maxLength: 170, defaultValue: D.seo.description },
          ],
        },
      ],
    },
  ],
};
