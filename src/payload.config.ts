import path from "path";
import { fileURLToPath } from "url";
import { buildConfig } from "payload";
import { sqliteAdapter } from "@payloadcms/db-sqlite";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { tr } from "@payloadcms/translations/languages/tr";
import sharp from "sharp";

import { Users } from "./payload/collections/Users";
import { Media } from "./payload/collections/Media";
import { Categories } from "./payload/collections/Categories";
import { Posts } from "./payload/collections/Posts";
import { Leads } from "./payload/collections/Leads";
import { Bookings } from "./payload/collections/Bookings";
import { Services } from "./payload/collections/Services";
import { Products } from "./payload/collections/Products";
import { Team } from "./payload/collections/Team";
import { References } from "./payload/collections/References";
import { HomePage } from "./payload/globals/HomePage";
import { SiteSettings } from "./payload/globals/SiteSettings";

const dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Guru Panel (Payload CMS). Yerelde SQLite dosyası (data/guru.db) kullanılır.
 * Canlıya geçerken Guru'ya ait bir Postgres bağlanıp adaptör
 * @payloadcms/db-postgres ile değiştirilecek; koleksiyonlar aynı kalır.
 */
export default buildConfig({
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL || "",
  secret: process.env.PAYLOAD_SECRET || "",
  admin: {
    user: Users.slug,
    theme: "light",
    dateFormat: "dd.MM.yyyy HH:mm",
    importMap: { baseDir: path.resolve(dirname) },
    meta: {
      titleSuffix: " · Guru Panel",
      icons: [{ rel: "icon", type: "image/png", url: "/icon.png" }],
    },
    components: {
      graphics: {
        Logo: "/payload/components/Brand#Logo",
        Icon: "/payload/components/Brand#Icon",
      },
      beforeDashboard: ["/payload/components/DashboardIntro#DashboardIntro"],
    },
  },
  i18n: {
    supportedLanguages: { tr },
    fallbackLanguage: "tr",
  },
  collections: [Leads, Bookings, Services, Products, Posts, Categories, Team, References, Media, Users],
  globals: [HomePage, SiteSettings],
  editor: lexicalEditor(),
  db: sqliteAdapter({
    client: { url: process.env.DATABASE_URL || "file:./data/guru.db" },
  }),
  sharp,
  typescript: { outputFile: path.resolve(dirname, "payload-types.ts") },
  graphQL: { disable: true },
  telemetry: false,
});
