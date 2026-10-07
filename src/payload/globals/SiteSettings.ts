import type { GlobalConfig } from "payload";
import { isLoggedIn } from "../access";
import { revalidate } from "../utils";
import { announcement, site } from "@/lib/data";

/**
 * Sitenin her sayfasında görünen ayarlar. Boş bırakılan alanda data.ts'teki
 * varsayılan kullanılır; telefon, WhatsApp ve adres doldurulunca iletişim
 * sayfasında ve sağdaki sekmede kendiliğinden görünür.
 */
export const SiteSettings: GlobalConfig = {
  slug: "site-settings",
  label: "Site Ayarları",
  admin: { group: "Yönetim" },
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
