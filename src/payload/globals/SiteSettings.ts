import type { GlobalConfig } from "payload";
import { isLoggedIn } from "../access";
import { revalidate } from "../utils";
import { announcement, announcementMore, site } from "@/lib/data";

/**
 * Sitenin her sayfasında görünen ayarlar. Boş bırakılan alanda data.ts'teki
 * varsayılan kullanılır; telefon, WhatsApp ve adres doldurulunca iletişim
 * sayfasında ve sağdaki sekmede kendiliğinden görünür.
 */
export const SiteSettings: GlobalConfig = {
  slug: "site-settings",
  label: "Site Ayarları",
  admin: { group: "Ayarlar" },
  access: { read: () => true, update: isLoggedIn },
  hooks: {
    afterChange: [() => revalidate(["/"], "layout")],
  },
  fields: [
    {
      name: "announcement",
      type: "group",
      label: "Duyuru bandı",
      fields: [
        { name: "enabled", type: "checkbox", label: "Bandı göster", defaultValue: true },
        { name: "text", type: "text", label: "Metin", defaultValue: announcement, maxLength: 120 },
        {
          name: "more",
          type: "array",
          label: "Sırayla dönen diğer cümleler",
          labels: { singular: "Cümle", plural: "Cümleler" },
          admin: { description: "Bant 15 saniyede bir sıradakine geçer; ziyaretçi üzerine gelince durur." },
          maxRows: 8,
          defaultValue: announcementMore.map((text) => ({ text })),
          fields: [{ name: "text", type: "text", label: "Metin", required: true, maxLength: 120 }],
        },
      ],
    },
    {
      name: "contact",
      type: "group",
      label: "İletişim bilgileri",
      fields: [
        {
          type: "row",
          fields: [
            { name: "email", type: "email", label: "E-posta", defaultValue: site.email },
            { name: "phone", type: "text", label: "Telefon", admin: { placeholder: "0 5xx xxx xx xx" } },
          ],
        },
        {
          name: "mobile",
          type: "text",
          label: "Cep telefonu (doğrudan arama)",
          admin: {
            placeholder: "+90 5xx xxx xx xx",
            description: "Doluysa iletişim sayfasında ve alt bilgide arama kartı, mobilde alt çubukta Ara düğmesi görünür.",
          },
        },
        {
          type: "row",
          fields: [
            {
              name: "whatsapp",
              type: "text",
              label: "WhatsApp numarası",
              admin: { placeholder: "90 5xx xxx xx xx", description: "Ülke koduyla; doldurulunca sağdaki sekme WhatsApp'a gider." },
            },
            { name: "instagram", type: "text", label: "Instagram adresi", defaultValue: site.instagram },
          ],
        },
        { name: "address", type: "textarea", label: "Adres" },
      ],
    },
  ],
};
