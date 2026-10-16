import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/*
 * Faz 2 ölçüm: talep ve randevuya kaynak alanları, Site Ayarları'na izleme kodları
 * ve kendi çerezsiz sayacımızın ham olay tablosu (ga_events; Payload koleksiyonu değil,
 * toplu yazım ve SQL raporları için düz tablo).
 */
export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_leads_kaynak_kanal" AS ENUM('reklam-google', 'reklam-meta', 'reklam', 'organik-arama', 'sosyal', 'yapay-zeka', 'e-posta', 'whatsapp', 'qr', 'yonlendirme', 'dogrudan');
  CREATE TYPE "public"."enum_bookings_kaynak_kanal" AS ENUM('reklam-google', 'reklam-meta', 'reklam', 'organik-arama', 'sosyal', 'yapay-zeka', 'e-posta', 'whatsapp', 'qr', 'yonlendirme', 'dogrudan');
  CREATE TYPE "public"."enum_site_settings_izleme_custom_head_consent" AS ENUM('pazarlama', 'analitik');
  ALTER TABLE "leads" ADD COLUMN "kaynak_kanal" "enum_leads_kaynak_kanal";
  ALTER TABLE "leads" ADD COLUMN "kaynak_utm_source" varchar;
  ALTER TABLE "leads" ADD COLUMN "kaynak_utm_medium" varchar;
  ALTER TABLE "leads" ADD COLUMN "kaynak_utm_campaign" varchar;
  ALTER TABLE "leads" ADD COLUMN "kaynak_utm_term" varchar;
  ALTER TABLE "leads" ADD COLUMN "kaynak_utm_content" varchar;
  ALTER TABLE "leads" ADD COLUMN "kaynak_ref" varchar;
  ALTER TABLE "leads" ADD COLUMN "kaynak_giris" varchar;
  ALTER TABLE "leads" ADD COLUMN "kaynak_gclid" varchar;
  ALTER TABLE "leads" ADD COLUMN "kaynak_gbraid" varchar;
  ALTER TABLE "leads" ADD COLUMN "kaynak_wbraid" varchar;
  ALTER TABLE "leads" ADD COLUMN "kaynak_fbclid" varchar;
  ALTER TABLE "leads" ADD COLUMN "kaynak_msclkid" varchar;
  ALTER TABLE "leads" ADD COLUMN "kaynak_oturum" varchar;
  ALTER TABLE "bookings" ADD COLUMN "kaynak_kanal" "enum_bookings_kaynak_kanal";
  ALTER TABLE "bookings" ADD COLUMN "kaynak_utm_source" varchar;
  ALTER TABLE "bookings" ADD COLUMN "kaynak_utm_medium" varchar;
  ALTER TABLE "bookings" ADD COLUMN "kaynak_utm_campaign" varchar;
  ALTER TABLE "bookings" ADD COLUMN "kaynak_utm_term" varchar;
  ALTER TABLE "bookings" ADD COLUMN "kaynak_utm_content" varchar;
  ALTER TABLE "bookings" ADD COLUMN "kaynak_ref" varchar;
  ALTER TABLE "bookings" ADD COLUMN "kaynak_giris" varchar;
  ALTER TABLE "bookings" ADD COLUMN "kaynak_gclid" varchar;
  ALTER TABLE "bookings" ADD COLUMN "kaynak_gbraid" varchar;
  ALTER TABLE "bookings" ADD COLUMN "kaynak_wbraid" varchar;
  ALTER TABLE "bookings" ADD COLUMN "kaynak_fbclid" varchar;
  ALTER TABLE "bookings" ADD COLUMN "kaynak_msclkid" varchar;
  ALTER TABLE "bookings" ADD COLUMN "kaynak_oturum" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "izleme_meta_pixel_id" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "izleme_google_ads_id" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "izleme_ads_talep" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "izleme_ads_randevu" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "izleme_ads_iletisim" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "izleme_ga4_id" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "izleme_gtm_id" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "izleme_tiktok_pixel_id" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "izleme_linkedin_partner_id" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "izleme_clarity_id" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "izleme_custom_head" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "izleme_custom_head_consent" "enum_site_settings_izleme_custom_head_consent" DEFAULT 'pazarlama';;
  CREATE TABLE IF NOT EXISTS "ga_events" (
    "id" bigserial PRIMARY KEY,
    "ts" timestamptz NOT NULL,
    "sid" varchar(24) NOT NULL,
    "vid" varchar(24) NOT NULL,
    "kind" varchar(4) NOT NULL,
    "name" varchar(64),
    "path" varchar(300) NOT NULL,
    "title" varchar(160),
    "entry" boolean NOT NULL DEFAULT false,
    "channel" varchar(24),
    "utm_source" varchar(150),
    "utm_medium" varchar(150),
    "utm_campaign" varchar(150),
    "ref" varchar(150),
    "country" varchar(2),
    "region" varchar(10),
    "city" varchar(80),
    "device" varchar(12),
    "browser" varchar(24),
    "os" varchar(24),
    "props" jsonb
  );
  CREATE INDEX IF NOT EXISTS "ga_events_ts_brin" ON "ga_events" USING brin ("ts");
  CREATE INDEX IF NOT EXISTS "ga_events_ts_sid" ON "ga_events" ("ts", "sid");
  CREATE INDEX IF NOT EXISTS "ga_events_entry" ON "ga_events" ("ts") WHERE "entry";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE IF EXISTS "ga_events";
   ALTER TABLE "leads" DROP COLUMN "kaynak_kanal";
  ALTER TABLE "leads" DROP COLUMN "kaynak_utm_source";
  ALTER TABLE "leads" DROP COLUMN "kaynak_utm_medium";
  ALTER TABLE "leads" DROP COLUMN "kaynak_utm_campaign";
  ALTER TABLE "leads" DROP COLUMN "kaynak_utm_term";
  ALTER TABLE "leads" DROP COLUMN "kaynak_utm_content";
  ALTER TABLE "leads" DROP COLUMN "kaynak_ref";
  ALTER TABLE "leads" DROP COLUMN "kaynak_giris";
  ALTER TABLE "leads" DROP COLUMN "kaynak_gclid";
  ALTER TABLE "leads" DROP COLUMN "kaynak_gbraid";
  ALTER TABLE "leads" DROP COLUMN "kaynak_wbraid";
  ALTER TABLE "leads" DROP COLUMN "kaynak_fbclid";
  ALTER TABLE "leads" DROP COLUMN "kaynak_msclkid";
  ALTER TABLE "leads" DROP COLUMN "kaynak_oturum";
  ALTER TABLE "bookings" DROP COLUMN "kaynak_kanal";
  ALTER TABLE "bookings" DROP COLUMN "kaynak_utm_source";
  ALTER TABLE "bookings" DROP COLUMN "kaynak_utm_medium";
  ALTER TABLE "bookings" DROP COLUMN "kaynak_utm_campaign";
  ALTER TABLE "bookings" DROP COLUMN "kaynak_utm_term";
  ALTER TABLE "bookings" DROP COLUMN "kaynak_utm_content";
  ALTER TABLE "bookings" DROP COLUMN "kaynak_ref";
  ALTER TABLE "bookings" DROP COLUMN "kaynak_giris";
  ALTER TABLE "bookings" DROP COLUMN "kaynak_gclid";
  ALTER TABLE "bookings" DROP COLUMN "kaynak_gbraid";
  ALTER TABLE "bookings" DROP COLUMN "kaynak_wbraid";
  ALTER TABLE "bookings" DROP COLUMN "kaynak_fbclid";
  ALTER TABLE "bookings" DROP COLUMN "kaynak_msclkid";
  ALTER TABLE "bookings" DROP COLUMN "kaynak_oturum";
  ALTER TABLE "site_settings" DROP COLUMN "izleme_meta_pixel_id";
  ALTER TABLE "site_settings" DROP COLUMN "izleme_google_ads_id";
  ALTER TABLE "site_settings" DROP COLUMN "izleme_ads_talep";
  ALTER TABLE "site_settings" DROP COLUMN "izleme_ads_randevu";
  ALTER TABLE "site_settings" DROP COLUMN "izleme_ads_iletisim";
  ALTER TABLE "site_settings" DROP COLUMN "izleme_ga4_id";
  ALTER TABLE "site_settings" DROP COLUMN "izleme_gtm_id";
  ALTER TABLE "site_settings" DROP COLUMN "izleme_tiktok_pixel_id";
  ALTER TABLE "site_settings" DROP COLUMN "izleme_linkedin_partner_id";
  ALTER TABLE "site_settings" DROP COLUMN "izleme_clarity_id";
  ALTER TABLE "site_settings" DROP COLUMN "izleme_custom_head";
  ALTER TABLE "site_settings" DROP COLUMN "izleme_custom_head_consent";
  DROP TYPE "public"."enum_leads_kaynak_kanal";
  DROP TYPE "public"."enum_bookings_kaynak_kanal";
  DROP TYPE "public"."enum_site_settings_izleme_custom_head_consent";`)
}
