import type { Field, GlobalConfig } from "payload";
import { isLoggedIn } from "../access";
import { revalidate } from "../utils";
import { textHelper } from "../fields";
import { HOME_DEFAULTS as D } from "@/lib/home-defaults";

/** Bir ana sayfa bölümünün ortak alanları: göster, başlık, açıklama */
const section = (
  name: keyof typeof D,
  label: string,
  extra: Field[] = [],
  leadHint?: string
): Field => {
  const d = D[name] as { show?: boolean; title: string; lead?: string };
  return {
    name,
    type: "group",
    label,
    fields: [
      ...(d.show !== undefined
        ? [{ name: "show", type: "checkbox", label: "Bölümü göster", defaultValue: d.show } as Field]
        : []),
      { name: "title", type: "text", label: "Başlık", required: true, defaultValue: d.title },
      ...(d.lead !== undefined
        ? [{ name: "lead", type: "textarea", label: "Açıklama", defaultValue: d.lead, admin: { description: leadHint } } as Field]
        : []),
      ...extra,
    ],
  };
};

/**
 * Ana sayfanın metinleri ve bölüm görünürlüğü. Hizmet, ürün, ekip ve
 * referans kartlarının kendisi ilgili koleksiyonlardan gelir; burada
 * yalnız bölüm başlıkları ve açıklamaları düzenlenir.
 */
export const HomePage: GlobalConfig = {
  slug: "home-page",
  label: "Ana Sayfa",
  admin: { group: false, description: "Kaydettiğinizde ana sayfa hemen güncellenir." },
  access: { read: () => true, update: isLoggedIn },
  hooks: {
    afterChange: [() => revalidate(["/"])],
  },
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          name: "hero",
          label: "Giriş",
          fields: [
            {
              name: "title",
              type: "text",
              label: "Başlık",
              required: true,
              defaultValue: D.hero.title,
            },
            textHelper("titleHelper", "hero.title", "accent"),
            { name: "sub", type: "textarea", label: "Açıklama", required: true, defaultValue: D.hero.sub },
            {
              name: "showServiceLinks",
              type: "checkbox",
              label: "Altında hizmet bağlantılarını göster",
              defaultValue: D.hero.showServiceLinks,
            },
            {
              type: "row",
              fields: [
                { name: "primaryLabel", type: "text", label: "Ana buton", required: true, defaultValue: D.hero.primaryLabel },
                { name: "primaryHref", type: "text", label: "Ana buton adresi", required: true, defaultValue: D.hero.primaryHref },
              ],
            },
            {
              type: "row",
              fields: [
                { name: "secondaryLabel", type: "text", label: "İkinci buton", required: true, defaultValue: D.hero.secondaryLabel },
                {
                  name: "secondaryHref",
                  type: "text",
                  label: "İkinci buton adresi",
                  required: true,
                  defaultValue: D.hero.secondaryHref,
                },
              ],
            },
            {
              type: "row",
              fields: [
                { name: "badgeStrong", type: "text", label: "Rozet (kalın)", defaultValue: D.hero.badgeStrong },
                {
                  name: "badgeText",
                  type: "text",
                  label: "Rozet metni",
                  defaultValue: D.hero.badgeText,
                },
              ],
            },
            textHelper("badgeHelper", "hero.badgeText", "count", { source: "references" }),
          ],
        },
        {
          label: "Bölümler",
          fields: [
            section("references", "Referanslar"),
            section("services", "Hizmetler", [textHelper("leadHelper", "services.lead", "count", { source: "services", words: true })]),
            section("products", "Ürünler"),
            section("video", "Tanıtım videosu"),
            section("cases", "Başarı hikayeleri"),
            section("team", "Ekip", [
              {
                name: "limit",
                type: "number",
                label: "Gösterilecek kişi sayısı",
                defaultValue: D.team.limit,
                min: 2,
                max: 8,
                admin: { description: "Ekip kayıtlarında \"Ana sayfada göster\" seçili olanlar sırayla gösterilir." },
              },
            ]),
            section("quotes", "Müşteri yorumları"),
          ],
        },
        {
          name: "faq",
          label: "SSS",
          fields: [
            { name: "show", type: "checkbox", label: "Bölümü göster", defaultValue: D.faq.show },
            { name: "title", type: "text", label: "Başlık", required: true, defaultValue: D.faq.title },
            {
              name: "items",
              type: "array",
              label: "Sorular",
              labels: { singular: "Soru", plural: "Sorular" },
              defaultValue: D.faq.items,
              fields: [
                { name: "q", type: "text", label: "Soru", required: true },
                { name: "a", type: "textarea", label: "Cevap", required: true },
              ],
            },
          ],
        },
        {
          name: "meet",
          label: "Kapanış",
          fields: [
            { name: "title", type: "text", label: "Başlık", required: true, defaultValue: D.meet.title },
            { name: "text", type: "textarea", label: "Metin", required: true, defaultValue: D.meet.text },
            {
              type: "row",
              fields: [
                { name: "buttonLabel", type: "text", label: "Buton", required: true, defaultValue: D.meet.buttonLabel },
                { name: "buttonHref", type: "text", label: "Buton adresi", required: true, defaultValue: D.meet.buttonHref },
              ],
            },
          ],
        },
        {
          name: "seo",
          label: "SEO",
          fields: [
            { name: "title", type: "text", label: "Sayfa başlığı", maxLength: 70, defaultValue: D.seo.title },
            { name: "description", type: "textarea", label: "Arama sonucu açıklaması", maxLength: 170, defaultValue: D.seo.description },
          ],
        },
      ],
    },
  ],
};
