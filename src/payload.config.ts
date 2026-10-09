import { createHash } from "crypto";
import path from "path";
import { fileURLToPath } from "url";
import { buildConfig } from "payload";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { sqliteAdapter } from "@payloadcms/db-sqlite";
import { resendAdapter } from "@payloadcms/email-resend";
import { vercelBlobStorage } from "@payloadcms/storage-vercel-blob";
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
import { CaseStudies } from "./payload/collections/CaseStudies";
import { Testimonials } from "./payload/collections/Testimonials";
import { AboutPage } from "./payload/globals/AboutPage";
import { HomePage } from "./payload/globals/HomePage";
import { SiteSettings } from "./payload/globals/SiteSettings";
import { trOverrides } from "./payload/translations";
import { Activities, Companies, Contacts, Deals, Quotes } from "./payload/crm/collections";
import { Tenants } from "./payload/crm/tenant";
import { Projects, Tasks, Templates } from "./payload/ops/collections";
import { ChatbotSettings, ChatMessages, Conversations, Knowledge } from "./payload/chat/collections";
import { guardCollection, guardGlobal } from "./payload/business/roles";
import { AuditLog, BusinessSettings, withAudit } from "./payload/business/collections";
import { businessEndpoints } from "./payload/business/endpoints";

const dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Guru Panel (Payload CMS). Veritabanı adresine göre adaptör seçilir:
 * yerelde SQLite dosyası (data/guru.db, şema kendiliğinden güncellenir),
 * canlıda Postgres (şema yalnız src/migrations ile değişir). Medya canlıda
 * Vercel Blob'a, yerelde /media klasörüne yazılır. E-posta Resend anahtarı
 * varsa gönderilir, yoksa yalnız sunucu günlüğüne düşer.
 * Ayrıntı: docs/panel-canliya-alma.md
 */
const DATABASE_URL = process.env.DATABASE_URL || "file:./data/guru.db";
const isPostgres = /^postgres(ql)?:\/\//.test(DATABASE_URL);
const serverURL = process.env.NEXT_PUBLIC_SERVER_URL || "";
/* PAYLOAD_SECRET girilmemişse canlıda gizli veritabanı adresinden türetilir;
   böylece elle ayrı bir anahtar girmek gerekmez. Adres (parola) değişirse
   yalnız açık oturumlar kapanır, veri etkilenmez. */
const secret =
  process.env.PAYLOAD_SECRET ||
  (isPostgres ? createHash("sha256").update(`guru-panel:${DATABASE_URL}`).digest("hex") : "");

/* Panel bu adreslerden açılabilir (oturum çerezi yalnız bunlarda geçerli) */
const SITE_ORIGINS = ["https://guru-dijital-pied.vercel.app", "https://gurudijital.com.tr", "https://www.gurudijital.com.tr"];

export default buildConfig({
  serverURL,
  /* serverURL tanımlıysa (canlı) çerezli istekler yalnız sitenin kendi adreslerinden kabul edilir */
  csrf: serverURL ? [...new Set([serverURL, ...SITE_ORIGINS])] : [],
  secret,
  admin: {
    user: Users.slug,
    theme: "light",
    dateFormat: "dd.MM.yyyy HH:mm",
    importMap: { baseDir: path.resolve(dirname) },
    /* Yan yana önizleme: formun yanında sayfanın kendisi açık; kaydedince yenilenir.
       Taslaklar /onizleme üzerinden (yalnız giriş yapmış kullanıcıya) görünür. */
    livePreview: {
      /* Panel ilk açılışta önizlemeyi kendiliğinden açar; kullanıcı kapatırsa tercihi hatırlanır */
      openByDefault: true,
      /* Adres TAM olmalı: panel kayıt olayını postMessage ile bu adresin kaynağına gönderir */
      url: ({ data, collectionConfig, globalConfig, req }) => {
        const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
        const proto = req.headers.get("x-forwarded-proto") ?? (host?.startsWith("localhost") ? "http" : "https");
        const origin = host ? `${proto}://${host}` : (serverURL ?? "");
        const slug = typeof data?.slug === "string" ? data.slug : "";
        const PATHS: Record<string, string> = {
          "home-page": "/",
          "about-page": "/hakkimizda",
          services: `/hizmetler/${slug}`,
          products: `/urunler/${slug}`,
          posts: `/blog/${slug}`,
        };
        const key = collectionConfig?.slug ?? globalConfig?.slug ?? "";
        return `${origin}/onizleme?yol=${encodeURIComponent(PATHS[key] ?? "/")}`;
      },
      collections: ["services", "products", "posts"],
      globals: ["home-page", "about-page"],
      breakpoints: [
        { label: "Telefon", name: "telefon", width: 390, height: 844 },
        { label: "Tablet", name: "tablet", width: 820, height: 1180 },
        { label: "Masaüstü", name: "masaustu", width: 1440, height: 900 },
      ],
    },
    meta: {
      titleSuffix: " · Guru Panel",
      icons: [{ rel: "icon", type: "image/png", url: "/icon.png" }],
    },
    components: {
      graphics: {
        Logo: "/payload/components/Brand#Logo",
        Icon: "/payload/components/Brand#Icon",
      },
      /* Menünün başı: pano, analiz ve sitenin sayfaları (site haritası sırasıyla) */
      beforeNavLinks: ["/payload/components/PanelNav#PanelNav"],
      views: {
        /* Koleksiyon ızgarası yerine görev odaklı pano */
        dashboard: { Component: "/payload/components/Dashboard#Dashboard" },
        satisHatti: {
          Component: "/payload/components/crm/SalesPipeline#SalesPipeline",
          path: "/satis-hatti",
          meta: { title: "Satış hattı" },
        },
        operasyon: {
          Component: "/payload/components/ops/TaskBoardView#TaskBoardView",
          path: "/operasyon",
          meta: { title: "Görev panosu" },
        },
        ekipPlani: {
          Component: "/payload/components/ops/TeamPlanView#TeamPlanView",
          path: "/ekip-plani",
          meta: { title: "Ekip planı" },
        },
        sohbetler: {
          Component: "/payload/components/chat/InboxView#InboxView",
          path: "/sohbetler",
          meta: { title: "Sohbetler" },
        },
        sohbetRaporu: {
          Component: "/payload/components/chat/ReportView#ReportView",
          path: "/sohbet-raporu",
          meta: { title: "Sohbet raporu" },
        },
        yonetici: {
          Component: "/payload/components/business/ExecutiveView#ExecutiveView",
          path: "/yonetici",
          meta: { title: "Yönetici panosu" },
        },
        analiz: {
          Component: "/payload/components/AnalyticsView#AnalyticsView",
          path: "/analiz",
          meta: { title: "Ziyaretçi Analizi" },
        },
      },
    },
  },
  i18n: {
    supportedLanguages: { tr },
    fallbackLanguage: "tr",
    translations: { tr: trOverrides },
  },
  /* Sıra menü gruplarının sırasını belirler: Guru CRM, Guru Operation, Guru Chatbot, Kurumsal, Kitaplık, Ayarlar (sayfalar PanelNav'da) */
  collections: [
    /* Guru CRM: satış ekibi; sohbet ekibi de kişileri görür, operasyon işin firmasını ve kişisini görür */
    guardCollection(Leads, "crm", { privateRead: true, readAlso: ["chat"] }),
    guardCollection(Bookings, "crm", { privateRead: true, readAlso: ["chat"] }),
    guardCollection(Deals, "crm", { privateRead: true, readAlso: ["ops"] }),
    guardCollection(Contacts, "crm", { privateRead: true, readAlso: ["ops", "chat"] }),
    guardCollection(Companies, "crm", { privateRead: true, readAlso: ["ops"] }),
    guardCollection(Quotes, "crm", { privateRead: true }),
    guardCollection(Activities, "crm", { privateRead: true }),
    /* Guru Operation */
    guardCollection(Projects, "ops", { privateRead: true }),
    guardCollection(Tasks, "ops", { privateRead: true }),
    guardCollection(Templates, "ops", { privateRead: true }),
    /* Guru Chatbot */
    guardCollection(Conversations, "chat", { privateRead: true }),
    guardCollection(Knowledge, "chat", { privateRead: true }),
    guardCollection(ChatMessages, "chat", { privateRead: true }),
    /* Site içeriği: yayındaki içerik herkese açık, düzenleme site modülünde */
    guardCollection(Team, "site"),
    guardCollection(CaseStudies, "site"),
    guardCollection(Testimonials, "site"),
    guardCollection(References, "site"),
    guardCollection(Services, "site"),
    guardCollection(Products, "site"),
    guardCollection(Posts, "site"),
    guardCollection(Media, "site"),
    guardCollection(Categories, "site"),
    Users,
    Tenants,
    AuditLog,
  ].map(withAudit),
  /* Yönetici ay sonu raporu ve sabah özeti (Vercel Cron, vercel.json) */
  endpoints: businessEndpoints,
  globals: [guardGlobal(HomePage, "site"), guardGlobal(AboutPage, "site"), guardGlobal(ChatbotSettings, "chat"), guardGlobal(BusinessSettings, "admin"), guardGlobal(SiteSettings, "site")],
  /* Medya klasörleri: "Klasöre göre gez" görünümü ve görsel başına klasör alanı */
  folders: {
    browseByFolder: true,
    collectionOverrides: [
      ({ collection }) => ({
        ...collection,
        labels: { singular: "Klasör", plural: "Klasörler" },
        admin: { ...collection.admin, group: "Kitaplık" },
      }),
    ],
  },
  editor: lexicalEditor(),
  db: isPostgres
    ? postgresAdapter({
        pool: { connectionString: DATABASE_URL },
        migrationDir: path.resolve(dirname, "migrations"),
        push: false,
      })
    : sqliteAdapter({
        client: { url: DATABASE_URL },
        migrationDir: path.resolve(dirname, "migrations-sqlite"),
      }),
  email: process.env.RESEND_API_KEY
    ? resendAdapter({
        apiKey: process.env.RESEND_API_KEY,
        /* Alan adı Resend'de doğrulanana kadar yalnız onboarding@resend.dev gönderebilir */
        defaultFromAddress: process.env.EMAIL_FROM || "onboarding@resend.dev",
        defaultFromName: "Guru Panel",
      })
    : undefined,
  plugins: [
    vercelBlobStorage({
      enabled: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
      token: process.env.BLOB_READ_WRITE_TOKEN,
      /* Şema her ortamda aynı kalsın (yerelde eklenti kapalıyken de) */
      alwaysInsertFields: true,
      /* Görseller herkese açık: doğrudan Blob CDN adresinden sunulur */
      collections: { media: { disablePayloadAccessControl: true } },
      /* Vercel'in 4,5 MB istek sınırına takılmadan tarayıcıdan doğrudan yükleme */
      clientUploads: true,
    }),
  ],
  sharp,
  typescript: { outputFile: path.resolve(dirname, "payload-types.ts") },
  graphQL: { disable: true },
  telemetry: false,
});
