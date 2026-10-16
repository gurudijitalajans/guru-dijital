import type { GlobalConfig } from "payload";
import { isAdminField, isLoggedIn } from "../access";
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
    {
      name: "izleme",
      type: "group",
      label: "İzleme kodları",
      admin: {
        description:
          "Reklam ve ölçüm etiketleri. Hiçbiri ziyaretçi çerez tercihinde onay vermeden yüklenmez: reklam etiketleri Pazarlama, Clarity Analitik onayıyla. Site olayları (talep, randevu, iletişim tıklaması) dolu olan her etikete aynı anda iletilir. Yalnız yöneticiler düzenleyebilir.",
      },
      access: { update: isAdminField },
      fields: [
        {
          type: "row",
          fields: [
            { name: "metaPixelId", type: "text", label: "Meta Pixel kimliği", admin: { placeholder: "123456789012345" }, validate: (v: string | null | undefined) => !v || /^\d{8,20}$/.test(v) || "Yalnız rakamlardan oluşan Pixel kimliğini yazın." },
            { name: "googleAdsId", type: "text", label: "Google Ads kimliği", admin: { placeholder: "AW-123456789" }, validate: (v: string | null | undefined) => !v || /^AW-\d{6,14}$/.test(v) || "AW- ile başlayan kimliği yazın." },
          ],
        },
        {
          type: "row",
          fields: [
            { name: "adsTalep", type: "text", label: "Ads dönüşüm etiketi: talep", admin: { placeholder: "AbC-dEfGhIjK" }, validate: (v: string | null | undefined) => !v || /^[\w-]{4,40}$/.test(v) || "Dönüşüm etiketini (send_to'daki / sonrası) yazın." },
            { name: "adsRandevu", type: "text", label: "Ads dönüşüm etiketi: randevu", validate: (v: string | null | undefined) => !v || /^[\w-]{4,40}$/.test(v) || "Dönüşüm etiketini yazın." },
            { name: "adsIletisim", type: "text", label: "Ads dönüşüm etiketi: iletişim tıklaması", validate: (v: string | null | undefined) => !v || /^[\w-]{4,40}$/.test(v) || "Dönüşüm etiketini yazın." },
          ],
        },
        {
          type: "row",
          fields: [
            { name: "ga4Id", type: "text", label: "Google Analytics 4", admin: { placeholder: "G-XXXXXXXXXX" }, validate: (v: string | null | undefined) => !v || /^G-[A-Z0-9]{6,14}$/.test(v) || "G- ile başlayan ölçüm kimliğini yazın." },
            { name: "gtmId", type: "text", label: "Google Tag Manager", admin: { placeholder: "GTM-XXXXXXX" }, validate: (v: string | null | undefined) => !v || /^GTM-[A-Z0-9]{4,12}$/.test(v) || "GTM- ile başlayan kapsayıcı kimliğini yazın." },
          ],
        },
        {
          type: "row",
          fields: [
            { name: "tiktokPixelId", type: "text", label: "TikTok Pixel", validate: (v: string | null | undefined) => !v || /^[A-Z0-9]{10,30}$/.test(v) || "TikTok Pixel kimliğini yazın." },
            { name: "linkedinPartnerId", type: "text", label: "LinkedIn Insight (Partner ID)", validate: (v: string | null | undefined) => !v || /^\d{4,12}$/.test(v) || "Yalnız rakamlardan oluşan Partner ID'yi yazın." },
            { name: "clarityId", type: "text", label: "Microsoft Clarity", validate: (v: string | null | undefined) => !v || /^[a-z0-9]{6,20}$/.test(v) || "Clarity proje kimliğini yazın." },
          ],
        },
        {
          name: "customHead",
          type: "code",
          label: "Özel head kodu",
          admin: {
            language: "html",
            description: "Yukarıdaki alanların karşılamadığı bir etiket için. Panel sayfalarına asla yüklenmez; seçilen onay verilince sitenin head bölümüne eklenir. Güvenmediğiniz kodu yapıştırmayın.",
          },
        },
        {
          name: "customHeadConsent",
          type: "select",
          label: "Özel kod hangi onayla yüklensin",
          defaultValue: "pazarlama",
          options: [
            { label: "Pazarlama", value: "pazarlama" },
            { label: "Analitik", value: "analitik" },
          ],
        },
      ],
    },
  ],
};
