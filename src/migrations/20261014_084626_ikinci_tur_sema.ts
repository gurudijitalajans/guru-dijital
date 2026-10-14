import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "home_page" ALTER COLUMN "hero_badge_strong" SET DEFAULT 'Grow with Guru';
  ALTER TABLE "home_page" ALTER COLUMN "hero_badge_text" SET DEFAULT 'Onlarca markanın dijital yol arkadaşı';
  ALTER TABLE "home_page" ALTER COLUMN "seo_title" SET DEFAULT 'Guru Dijital Ajans | Grow with Guru';
  ALTER TABLE "site_settings" ALTER COLUMN "analytics_domains" SET DEFAULT 'guru-dijital-pied.vercel.app,gurudijital.com,www.gurudijital.com';
  ALTER TABLE "case_studies" ADD COLUMN "service_id" integer;
  ALTER TABLE "case_studies" ADD CONSTRAINT "case_studies_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "case_studies_service_idx" ON "case_studies" USING btree ("service_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "case_studies" DROP CONSTRAINT "case_studies_service_id_services_id_fk";
  
  DROP INDEX "case_studies_service_idx";
  ALTER TABLE "home_page" ALTER COLUMN "hero_badge_strong" SET DEFAULT 'grow with guru';
  ALTER TABLE "home_page" ALTER COLUMN "hero_badge_text" SET DEFAULT '{sayı} markanın dijital yol arkadaşı';
  ALTER TABLE "home_page" ALTER COLUMN "seo_title" SET DEFAULT 'Guru Dijital Ajans | grow with guru';
  ALTER TABLE "site_settings" ALTER COLUMN "analytics_domains" SET DEFAULT 'guru-dijital-pied.vercel.app,gurudijital.com.tr,www.gurudijital.com.tr';
  ALTER TABLE "case_studies" DROP COLUMN "service_id";`)
}
