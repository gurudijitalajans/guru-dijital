import path from "path";
import { fileURLToPath } from "url";
import type { CollectionConfig } from "payload";
import { isAdmin, isLoggedIn } from "../access";

const dirname = path.dirname(fileURLToPath(import.meta.url));

export const Media: CollectionConfig = {
  slug: "media",
  labels: { singular: "Medya", plural: "Medya" },
  admin: { group: "İçerik", defaultColumns: ["filename", "alt", "updatedAt"] },
  access: {
    read: () => true,
    create: isLoggedIn,
    update: isLoggedIn,
    delete: isAdmin,
  },
  upload: {
    /* Yerelde proje kökündeki /media klasörü (git dışı). Canlıda Vercel Blob
       gibi bir depolama eklentisine geçilecek. */
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
      admin: { description: "Görseli göremeyen ziyaretçi ve arama motorları için kısa açıklama." },
    },
  ],
};
