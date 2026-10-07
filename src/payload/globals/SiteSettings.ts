import type { GlobalConfig } from "payload";
import { isAdminField, isLoggedIn } from "../access";
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
    {
      name: "analytics",
      type: "group",
      label: "Ziyaretçi analizi (Umami)",
      admin: {
        description:
          "Çerezsiz, kişisel veri toplamayan ziyaretçi sayımı. Bu alanlar sitenin her sayfasına bir betik eklediği için yalnız yöneticiler düzenleyebilir. API bağlantısı (panel istatistikleri) sunucu ortam değişkenlerindedir.",
      },
      access: { update: isAdminField },
      fields: [
        { name: "enabled", type: "checkbox", label: "Sitede ziyaretçi sayımını aç", defaultValue: false },
        {
          type: "row",
          fields: [
            {
              name: "websiteId",
              type: "text",
              label: "Site kimliği (Website ID)",
              admin: { placeholder: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" },
              validate: (v: string | null | undefined) =>
                !v || /^[0-9a-f-]{36}$/i.test(v) || "Umami'deki 36 karakterlik site kimliğini yapıştırın.",
            },
            {
              name: "scriptUrl",
              type: "text",
              label: "Betik adresi",
              defaultValue: "https://cloud.umami.is/script.js",
              /* Canlıda yalnız https; geliştirmede yerel test sunucusuna (localhost) izin verilir */
              validate: (v: string | null | undefined) =>
                !v ||
                /^https:\/\/[^\s"'<>]+\.js$/i.test(v) ||
                (process.env.NODE_ENV !== "production" && /^http:\/\/localhost(:\d+)?\/[^\s"'<>]+\.js$/i.test(v)) ||
                "https:// ile başlayıp .js ile biten bir adres girin.",
            },
          ],
        },
        {
          name: "domains",
          type: "text",
          label: "Sayılacak alan adları",
          admin: {
            placeholder: "gurudijital.com.tr,www.gurudijital.com.tr",
            description: "Virgülle ayırın. Doluysa önizleme ve yerel adresler sayılmaz.",
          },
        },
      ],
    },
  ],
};
