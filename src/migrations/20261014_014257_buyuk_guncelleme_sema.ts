import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_conversations_channel" AS ENUM('web', 'whatsapp', 'instagram');
  ALTER TYPE "public"."enum_services_icon" ADD VALUE 'smartphone' BEFORE 'chart-bar';
  ALTER TYPE "public"."enum__services_v_version_icon" ADD VALUE 'smartphone' BEFORE 'chart-bar';
  ALTER TYPE "public"."enum_products_features_icon" ADD VALUE 'smartphone' BEFORE 'chart-bar';
  ALTER TYPE "public"."enum_products_included_icon" ADD VALUE 'smartphone' BEFORE 'chart-bar';
  ALTER TYPE "public"."enum_products_icon" ADD VALUE 'smartphone' BEFORE 'chart-bar';
  ALTER TYPE "public"."enum__products_v_version_features_icon" ADD VALUE 'smartphone' BEFORE 'chart-bar';
  ALTER TYPE "public"."enum__products_v_version_included_icon" ADD VALUE 'smartphone' BEFORE 'chart-bar';
  ALTER TYPE "public"."enum__products_v_version_icon" ADD VALUE 'smartphone' BEFORE 'chart-bar';
  ALTER TYPE "public"."enum_about_page_story_values_icon" ADD VALUE 'smartphone' BEFORE 'chart-bar';
  ALTER TYPE "public"."enum_about_page_awards_items_icon" ADD VALUE 'smartphone' BEFORE 'chart-bar';
  CREATE TABLE "site_settings_announcement_more" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar NOT NULL
  );
  
  ALTER TABLE "home_page" ALTER COLUMN "hero_badge_strong" SET DEFAULT 'grow with guru';
  ALTER TABLE "home_page" ALTER COLUMN "meet_title" SET DEFAULT 'İletişime geçin';
  ALTER TABLE "home_page" ALTER COLUMN "seo_title" SET DEFAULT 'Guru Dijital Ajans | grow with guru';
  ALTER TABLE "about_page" ALTER COLUMN "intro_primary_label" SET DEFAULT 'İletişim';
  ALTER TABLE "about_page" ALTER COLUMN "awards_lead" SET DEFAULT '2025''te Google Partner olduk, 2026''da rozetimizi yeniledik; veri odaklı çalışmalarımızla Google Ads Impact Awards''ta aday gösterildik.';
  ALTER TABLE "about_page" ALTER COLUMN "closing_primary_label" SET DEFAULT 'İletişime Geç';
  ALTER TABLE "site_settings" ALTER COLUMN "contact_email" SET DEFAULT 'info@gurudijital.com';
  ALTER TABLE "conversations" ADD COLUMN "channel" "enum_conversations_channel" DEFAULT 'web';
  ALTER TABLE "conversations" ADD COLUMN "external_id" varchar;
  ALTER TABLE "testimonials" ADD COLUMN "video_url" varchar;
  ALTER TABLE "site_settings_announcement_more" ADD CONSTRAINT "site_settings_announcement_more_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "site_settings_announcement_more_order_idx" ON "site_settings_announcement_more" USING btree ("_order");
  CREATE INDEX "site_settings_announcement_more_parent_id_idx" ON "site_settings_announcement_more" USING btree ("_parent_id");
  CREATE INDEX "conversations_channel_idx" ON "conversations" USING btree ("channel");
  CREATE INDEX "conversations_external_id_idx" ON "conversations" USING btree ("external_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "site_settings_announcement_more" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "site_settings_announcement_more" CASCADE;
  ALTER TABLE "services" ALTER COLUMN "icon" SET DATA TYPE text;
  ALTER TABLE "services" ALTER COLUMN "icon" SET DEFAULT 'sparkles'::text;
  DROP TYPE "public"."enum_services_icon";
  CREATE TYPE "public"."enum_services_icon" AS ENUM('share', 'palette', 'pen', 'monitor', 'chart-bar', 'clapperboard', 'bot', 'users', 'workflow', 'briefcase', 'message', 'brain', 'languages', 'bell', 'calendar', 'clipboard', 'database', 'file', 'gauge', 'handshake', 'kanban', 'dashboard', 'layers', 'link', 'pie', 'shield', 'sparkles', 'target', 'rocket', 'megaphone', 'camera', 'globe', 'cart', 'search', 'mail', 'zap', 'trending', 'code', 'lightbulb', 'award', 'badge-check', 'gem', 'chart-line');
  ALTER TABLE "services" ALTER COLUMN "icon" SET DEFAULT 'sparkles'::"public"."enum_services_icon";
  ALTER TABLE "services" ALTER COLUMN "icon" SET DATA TYPE "public"."enum_services_icon" USING "icon"::"public"."enum_services_icon";
  ALTER TABLE "_services_v" ALTER COLUMN "version_icon" SET DATA TYPE text;
  ALTER TABLE "_services_v" ALTER COLUMN "version_icon" SET DEFAULT 'sparkles'::text;
  DROP TYPE "public"."enum__services_v_version_icon";
  CREATE TYPE "public"."enum__services_v_version_icon" AS ENUM('share', 'palette', 'pen', 'monitor', 'chart-bar', 'clapperboard', 'bot', 'users', 'workflow', 'briefcase', 'message', 'brain', 'languages', 'bell', 'calendar', 'clipboard', 'database', 'file', 'gauge', 'handshake', 'kanban', 'dashboard', 'layers', 'link', 'pie', 'shield', 'sparkles', 'target', 'rocket', 'megaphone', 'camera', 'globe', 'cart', 'search', 'mail', 'zap', 'trending', 'code', 'lightbulb', 'award', 'badge-check', 'gem', 'chart-line');
  ALTER TABLE "_services_v" ALTER COLUMN "version_icon" SET DEFAULT 'sparkles'::"public"."enum__services_v_version_icon";
  ALTER TABLE "_services_v" ALTER COLUMN "version_icon" SET DATA TYPE "public"."enum__services_v_version_icon" USING "version_icon"::"public"."enum__services_v_version_icon";
  ALTER TABLE "products_features" ALTER COLUMN "icon" SET DATA TYPE text;
  ALTER TABLE "products_features" ALTER COLUMN "icon" SET DEFAULT 'sparkles'::text;
  DROP TYPE "public"."enum_products_features_icon";
  CREATE TYPE "public"."enum_products_features_icon" AS ENUM('share', 'palette', 'pen', 'monitor', 'chart-bar', 'clapperboard', 'bot', 'users', 'workflow', 'briefcase', 'message', 'brain', 'languages', 'bell', 'calendar', 'clipboard', 'database', 'file', 'gauge', 'handshake', 'kanban', 'dashboard', 'layers', 'link', 'pie', 'shield', 'sparkles', 'target', 'rocket', 'megaphone', 'camera', 'globe', 'cart', 'search', 'mail', 'zap', 'trending', 'code', 'lightbulb', 'award', 'badge-check', 'gem', 'chart-line');
  ALTER TABLE "products_features" ALTER COLUMN "icon" SET DEFAULT 'sparkles'::"public"."enum_products_features_icon";
  ALTER TABLE "products_features" ALTER COLUMN "icon" SET DATA TYPE "public"."enum_products_features_icon" USING "icon"::"public"."enum_products_features_icon";
  ALTER TABLE "products_included" ALTER COLUMN "icon" SET DATA TYPE text;
  ALTER TABLE "products_included" ALTER COLUMN "icon" SET DEFAULT 'sparkles'::text;
  DROP TYPE "public"."enum_products_included_icon";
  CREATE TYPE "public"."enum_products_included_icon" AS ENUM('share', 'palette', 'pen', 'monitor', 'chart-bar', 'clapperboard', 'bot', 'users', 'workflow', 'briefcase', 'message', 'brain', 'languages', 'bell', 'calendar', 'clipboard', 'database', 'file', 'gauge', 'handshake', 'kanban', 'dashboard', 'layers', 'link', 'pie', 'shield', 'sparkles', 'target', 'rocket', 'megaphone', 'camera', 'globe', 'cart', 'search', 'mail', 'zap', 'trending', 'code', 'lightbulb', 'award', 'badge-check', 'gem', 'chart-line');
  ALTER TABLE "products_included" ALTER COLUMN "icon" SET DEFAULT 'sparkles'::"public"."enum_products_included_icon";
  ALTER TABLE "products_included" ALTER COLUMN "icon" SET DATA TYPE "public"."enum_products_included_icon" USING "icon"::"public"."enum_products_included_icon";
  ALTER TABLE "products" ALTER COLUMN "icon" SET DATA TYPE text;
  ALTER TABLE "products" ALTER COLUMN "icon" SET DEFAULT 'sparkles'::text;
  DROP TYPE "public"."enum_products_icon";
  CREATE TYPE "public"."enum_products_icon" AS ENUM('share', 'palette', 'pen', 'monitor', 'chart-bar', 'clapperboard', 'bot', 'users', 'workflow', 'briefcase', 'message', 'brain', 'languages', 'bell', 'calendar', 'clipboard', 'database', 'file', 'gauge', 'handshake', 'kanban', 'dashboard', 'layers', 'link', 'pie', 'shield', 'sparkles', 'target', 'rocket', 'megaphone', 'camera', 'globe', 'cart', 'search', 'mail', 'zap', 'trending', 'code', 'lightbulb', 'award', 'badge-check', 'gem', 'chart-line');
  ALTER TABLE "products" ALTER COLUMN "icon" SET DEFAULT 'sparkles'::"public"."enum_products_icon";
  ALTER TABLE "products" ALTER COLUMN "icon" SET DATA TYPE "public"."enum_products_icon" USING "icon"::"public"."enum_products_icon";
  ALTER TABLE "_products_v_version_features" ALTER COLUMN "icon" SET DATA TYPE text;
  ALTER TABLE "_products_v_version_features" ALTER COLUMN "icon" SET DEFAULT 'sparkles'::text;
  DROP TYPE "public"."enum__products_v_version_features_icon";
  CREATE TYPE "public"."enum__products_v_version_features_icon" AS ENUM('share', 'palette', 'pen', 'monitor', 'chart-bar', 'clapperboard', 'bot', 'users', 'workflow', 'briefcase', 'message', 'brain', 'languages', 'bell', 'calendar', 'clipboard', 'database', 'file', 'gauge', 'handshake', 'kanban', 'dashboard', 'layers', 'link', 'pie', 'shield', 'sparkles', 'target', 'rocket', 'megaphone', 'camera', 'globe', 'cart', 'search', 'mail', 'zap', 'trending', 'code', 'lightbulb', 'award', 'badge-check', 'gem', 'chart-line');
  ALTER TABLE "_products_v_version_features" ALTER COLUMN "icon" SET DEFAULT 'sparkles'::"public"."enum__products_v_version_features_icon";
  ALTER TABLE "_products_v_version_features" ALTER COLUMN "icon" SET DATA TYPE "public"."enum__products_v_version_features_icon" USING "icon"::"public"."enum__products_v_version_features_icon";
  ALTER TABLE "_products_v_version_included" ALTER COLUMN "icon" SET DATA TYPE text;
  ALTER TABLE "_products_v_version_included" ALTER COLUMN "icon" SET DEFAULT 'sparkles'::text;
  DROP TYPE "public"."enum__products_v_version_included_icon";
  CREATE TYPE "public"."enum__products_v_version_included_icon" AS ENUM('share', 'palette', 'pen', 'monitor', 'chart-bar', 'clapperboard', 'bot', 'users', 'workflow', 'briefcase', 'message', 'brain', 'languages', 'bell', 'calendar', 'clipboard', 'database', 'file', 'gauge', 'handshake', 'kanban', 'dashboard', 'layers', 'link', 'pie', 'shield', 'sparkles', 'target', 'rocket', 'megaphone', 'camera', 'globe', 'cart', 'search', 'mail', 'zap', 'trending', 'code', 'lightbulb', 'award', 'badge-check', 'gem', 'chart-line');
  ALTER TABLE "_products_v_version_included" ALTER COLUMN "icon" SET DEFAULT 'sparkles'::"public"."enum__products_v_version_included_icon";
  ALTER TABLE "_products_v_version_included" ALTER COLUMN "icon" SET DATA TYPE "public"."enum__products_v_version_included_icon" USING "icon"::"public"."enum__products_v_version_included_icon";
  ALTER TABLE "_products_v" ALTER COLUMN "version_icon" SET DATA TYPE text;
  ALTER TABLE "_products_v" ALTER COLUMN "version_icon" SET DEFAULT 'sparkles'::text;
  DROP TYPE "public"."enum__products_v_version_icon";
  CREATE TYPE "public"."enum__products_v_version_icon" AS ENUM('share', 'palette', 'pen', 'monitor', 'chart-bar', 'clapperboard', 'bot', 'users', 'workflow', 'briefcase', 'message', 'brain', 'languages', 'bell', 'calendar', 'clipboard', 'database', 'file', 'gauge', 'handshake', 'kanban', 'dashboard', 'layers', 'link', 'pie', 'shield', 'sparkles', 'target', 'rocket', 'megaphone', 'camera', 'globe', 'cart', 'search', 'mail', 'zap', 'trending', 'code', 'lightbulb', 'award', 'badge-check', 'gem', 'chart-line');
  ALTER TABLE "_products_v" ALTER COLUMN "version_icon" SET DEFAULT 'sparkles'::"public"."enum__products_v_version_icon";
  ALTER TABLE "_products_v" ALTER COLUMN "version_icon" SET DATA TYPE "public"."enum__products_v_version_icon" USING "version_icon"::"public"."enum__products_v_version_icon";
  ALTER TABLE "about_page_story_values" ALTER COLUMN "icon" SET DATA TYPE text;
  ALTER TABLE "about_page_story_values" ALTER COLUMN "icon" SET DEFAULT 'sparkles'::text;
  DROP TYPE "public"."enum_about_page_story_values_icon";
  CREATE TYPE "public"."enum_about_page_story_values_icon" AS ENUM('share', 'palette', 'pen', 'monitor', 'chart-bar', 'clapperboard', 'bot', 'users', 'workflow', 'briefcase', 'message', 'brain', 'languages', 'bell', 'calendar', 'clipboard', 'database', 'file', 'gauge', 'handshake', 'kanban', 'dashboard', 'layers', 'link', 'pie', 'shield', 'sparkles', 'target', 'rocket', 'megaphone', 'camera', 'globe', 'cart', 'search', 'mail', 'zap', 'trending', 'code', 'lightbulb', 'award', 'badge-check', 'gem', 'chart-line');
  ALTER TABLE "about_page_story_values" ALTER COLUMN "icon" SET DEFAULT 'sparkles'::"public"."enum_about_page_story_values_icon";
  ALTER TABLE "about_page_story_values" ALTER COLUMN "icon" SET DATA TYPE "public"."enum_about_page_story_values_icon" USING "icon"::"public"."enum_about_page_story_values_icon";
  ALTER TABLE "about_page_awards_items" ALTER COLUMN "icon" SET DATA TYPE text;
  ALTER TABLE "about_page_awards_items" ALTER COLUMN "icon" SET DEFAULT 'sparkles'::text;
  DROP TYPE "public"."enum_about_page_awards_items_icon";
  CREATE TYPE "public"."enum_about_page_awards_items_icon" AS ENUM('share', 'palette', 'pen', 'monitor', 'chart-bar', 'clapperboard', 'bot', 'users', 'workflow', 'briefcase', 'message', 'brain', 'languages', 'bell', 'calendar', 'clipboard', 'database', 'file', 'gauge', 'handshake', 'kanban', 'dashboard', 'layers', 'link', 'pie', 'shield', 'sparkles', 'target', 'rocket', 'megaphone', 'camera', 'globe', 'cart', 'search', 'mail', 'zap', 'trending', 'code', 'lightbulb', 'award', 'badge-check', 'gem', 'chart-line');
  ALTER TABLE "about_page_awards_items" ALTER COLUMN "icon" SET DEFAULT 'sparkles'::"public"."enum_about_page_awards_items_icon";
  ALTER TABLE "about_page_awards_items" ALTER COLUMN "icon" SET DATA TYPE "public"."enum_about_page_awards_items_icon" USING "icon"::"public"."enum_about_page_awards_items_icon";
  DROP INDEX "conversations_channel_idx";
  DROP INDEX "conversations_external_id_idx";
  ALTER TABLE "home_page" ALTER COLUMN "hero_badge_strong" SET DEFAULT '2025 Google Partner';
  ALTER TABLE "home_page" ALTER COLUMN "meet_title" SET DEFAULT 'Tanışalım';
  ALTER TABLE "home_page" ALTER COLUMN "seo_title" SET DEFAULT 'Guru Dijital Ajans | Unlock the next level';
  ALTER TABLE "about_page" ALTER COLUMN "intro_primary_label" SET DEFAULT 'Tanışalım';
  ALTER TABLE "about_page" ALTER COLUMN "awards_lead" SET DEFAULT '2025''te Google Partner olduk; veri odaklı çalışmalarımızla Google Ads Impact Awards''ta aday gösterildik.';
  ALTER TABLE "about_page" ALTER COLUMN "closing_primary_label" SET DEFAULT 'Tanışalım';
  ALTER TABLE "site_settings" ALTER COLUMN "contact_email" SET DEFAULT 'info@gurudijital.com.tr';
  ALTER TABLE "conversations" DROP COLUMN "channel";
  ALTER TABLE "conversations" DROP COLUMN "external_id";
  ALTER TABLE "testimonials" DROP COLUMN "video_url";
  DROP TYPE "public"."enum_conversations_channel";`)
}
