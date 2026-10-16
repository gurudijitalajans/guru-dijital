import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/* Umami kaldırıldı (2026-10-16): Site Ayarları'ndaki ziyaretçi analizi alanları */
export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "site_settings" DROP COLUMN IF EXISTS "analytics_enabled";
  ALTER TABLE "site_settings" DROP COLUMN IF EXISTS "analytics_website_id";
  ALTER TABLE "site_settings" DROP COLUMN IF EXISTS "analytics_script_url";
  ALTER TABLE "site_settings" DROP COLUMN IF EXISTS "analytics_domains";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "analytics_enabled" boolean DEFAULT true;
  ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "analytics_website_id" varchar DEFAULT 'fb72f8f5-2e67-4ed6-9b06-6e5b8bb7f26a';
  ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "analytics_script_url" varchar DEFAULT 'https://cloud.umami.is/script.js';
  ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "analytics_domains" varchar DEFAULT 'guru-dijital-pied.vercel.app,gurudijital.com,www.gurudijital.com';`)
}
