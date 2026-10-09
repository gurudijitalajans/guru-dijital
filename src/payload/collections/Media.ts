import path from "path";
import { fileURLToPath } from "url";
import type { CollectionConfig } from "payload";
import { isAdmin, isLoggedIn } from "../access";
import { findMediaUsage } from "../media-usage";

const dirname = path.dirname(fileURLToPath(import.meta.url));

export const Media: CollectionConfig = {
  slug: "media",
  labels: { singular: "Medya", plural: "Medya" },
  admin: { group: "Kitaplık", defaultColumns: ["filename", "alt", "updatedAt"] },
  /* Görseller klasörlere ayrılabilir (Hizmetler, Ürünler, Blog, Ekip, Referans logoları…) */
  folders: true,
  hooks: {
    /* Kullanılan görsel silinmez: sitede boş kare kalmasın */
    beforeDelete: [
      async ({ req, id }) => {
        const uses = await findMediaUsage(req.payload, id, req);
        if (uses.length > 0) {
          const list = uses.slice(0, 3).map((u) => `${u.where}: ${u.label}`).join(", ");
          throw new Error(`Bu görsel ${uses.length} yerde kullanılıyor (${list}${uses.length > 3 ? "…" : ""}). Önce oradan kaldırın, sonra silin.`);
        }
      },
    ],
  },
  access: {
    read: () => true,
    create: isLoggedIn,
    update: isLoggedIn,
    delete: isAdmin,
  },
  upload: {
    /* Yerelde proje kökündeki /media klasörü (git dışı). Canlıda
       BLOB_READ_WRITE_TOKEN varsa dosyalar Vercel Blob'a yazılır. */
    staticDir: path.resolve(dirname, "../../../media"),
    mimeTypes: ["image/*"],
    adminThumbnail: "thumbnail",
    focalPoint: true,
    formatOptions: { format: "webp", options: { quality: 82 } },
    imageSizes: [
      { name: "thumbnail", width: 480, formatOptions: { format: "webp", options: { quality: 78 } } },
      { name: "card", width: 960, formatOptions: { format: "webp", options: { quality: 80 } } },
      { name: "wide", width: 1600, formatOptions: { format: "webp", options: { quality: 82 } } },
    ],
  },
  fields: [
    {
      name: "alt",
      type: "text",
      label: "Alternatif metin",
      required: true,
      admin: { description: "Görseli göremeyen ziyaretçi ve arama motorları için kısa açıklama (ör. \"Guru CRM satış hattı ekranı\")." },
    },
    {
      name: "usage",
      type: "ui",
      admin: { position: "sidebar", components: { Field: "/payload/components/MediaUsage#MediaUsage" } },
    },
  ],
};
