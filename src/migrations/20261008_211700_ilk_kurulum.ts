import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_leads_status" AS ENUM('yeni', 'iletisim', 'teklif', 'kazanildi', 'kaybedildi');
  CREATE TYPE "public"."enum_bookings_time" AS ENUM('10:00', '11:00', '13:00', '14:00', '15:00', '16:00');
  CREATE TYPE "public"."enum_bookings_status" AS ENUM('bekliyor', 'onaylandi', 'tamamlandi', 'iptal');
  CREATE TYPE "public"."enum_services_icon" AS ENUM('share', 'palette', 'pen', 'monitor', 'chart-bar', 'clapperboard', 'bot', 'users', 'workflow', 'briefcase', 'message', 'brain', 'languages', 'bell', 'calendar', 'clipboard', 'database', 'file', 'gauge', 'handshake', 'kanban', 'dashboard', 'layers', 'link', 'pie', 'shield', 'sparkles', 'target', 'rocket', 'megaphone', 'camera', 'globe', 'cart', 'search', 'mail', 'zap', 'trending', 'code', 'lightbulb', 'award', 'badge-check', 'gem', 'chart-line');
  CREATE TYPE "public"."enum_services_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__services_v_version_icon" AS ENUM('share', 'palette', 'pen', 'monitor', 'chart-bar', 'clapperboard', 'bot', 'users', 'workflow', 'briefcase', 'message', 'brain', 'languages', 'bell', 'calendar', 'clipboard', 'database', 'file', 'gauge', 'handshake', 'kanban', 'dashboard', 'layers', 'link', 'pie', 'shield', 'sparkles', 'target', 'rocket', 'megaphone', 'camera', 'globe', 'cart', 'search', 'mail', 'zap', 'trending', 'code', 'lightbulb', 'award', 'badge-check', 'gem', 'chart-line');
  CREATE TYPE "public"."enum__services_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_products_included_icon" AS ENUM('share', 'palette', 'pen', 'monitor', 'chart-bar', 'clapperboard', 'bot', 'users', 'workflow', 'briefcase', 'message', 'brain', 'languages', 'bell', 'calendar', 'clipboard', 'database', 'file', 'gauge', 'handshake', 'kanban', 'dashboard', 'layers', 'link', 'pie', 'shield', 'sparkles', 'target', 'rocket', 'megaphone', 'camera', 'globe', 'cart', 'search', 'mail', 'zap', 'trending', 'code', 'lightbulb', 'award', 'badge-check', 'gem', 'chart-line');
  CREATE TYPE "public"."enum_products_features_icon" AS ENUM('share', 'palette', 'pen', 'monitor', 'chart-bar', 'clapperboard', 'bot', 'users', 'workflow', 'briefcase', 'message', 'brain', 'languages', 'bell', 'calendar', 'clipboard', 'database', 'file', 'gauge', 'handshake', 'kanban', 'dashboard', 'layers', 'link', 'pie', 'shield', 'sparkles', 'target', 'rocket', 'megaphone', 'camera', 'globe', 'cart', 'search', 'mail', 'zap', 'trending', 'code', 'lightbulb', 'award', 'badge-check', 'gem', 'chart-line');
  CREATE TYPE "public"."enum_products_icon" AS ENUM('share', 'palette', 'pen', 'monitor', 'chart-bar', 'clapperboard', 'bot', 'users', 'workflow', 'briefcase', 'message', 'brain', 'languages', 'bell', 'calendar', 'clipboard', 'database', 'file', 'gauge', 'handshake', 'kanban', 'dashboard', 'layers', 'link', 'pie', 'shield', 'sparkles', 'target', 'rocket', 'megaphone', 'camera', 'globe', 'cart', 'search', 'mail', 'zap', 'trending', 'code', 'lightbulb', 'award', 'badge-check', 'gem', 'chart-line');
  CREATE TYPE "public"."enum_products_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__products_v_version_included_icon" AS ENUM('share', 'palette', 'pen', 'monitor', 'chart-bar', 'clapperboard', 'bot', 'users', 'workflow', 'briefcase', 'message', 'brain', 'languages', 'bell', 'calendar', 'clipboard', 'database', 'file', 'gauge', 'handshake', 'kanban', 'dashboard', 'layers', 'link', 'pie', 'shield', 'sparkles', 'target', 'rocket', 'megaphone', 'camera', 'globe', 'cart', 'search', 'mail', 'zap', 'trending', 'code', 'lightbulb', 'award', 'badge-check', 'gem', 'chart-line');
  CREATE TYPE "public"."enum__products_v_version_features_icon" AS ENUM('share', 'palette', 'pen', 'monitor', 'chart-bar', 'clapperboard', 'bot', 'users', 'workflow', 'briefcase', 'message', 'brain', 'languages', 'bell', 'calendar', 'clipboard', 'database', 'file', 'gauge', 'handshake', 'kanban', 'dashboard', 'layers', 'link', 'pie', 'shield', 'sparkles', 'target', 'rocket', 'megaphone', 'camera', 'globe', 'cart', 'search', 'mail', 'zap', 'trending', 'code', 'lightbulb', 'award', 'badge-check', 'gem', 'chart-line');
  CREATE TYPE "public"."enum__products_v_version_icon" AS ENUM('share', 'palette', 'pen', 'monitor', 'chart-bar', 'clapperboard', 'bot', 'users', 'workflow', 'briefcase', 'message', 'brain', 'languages', 'bell', 'calendar', 'clipboard', 'database', 'file', 'gauge', 'handshake', 'kanban', 'dashboard', 'layers', 'link', 'pie', 'shield', 'sparkles', 'target', 'rocket', 'megaphone', 'camera', 'globe', 'cart', 'search', 'mail', 'zap', 'trending', 'code', 'lightbulb', 'award', 'badge-check', 'gem', 'chart-line');
  CREATE TYPE "public"."enum__products_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_posts_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__posts_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_users_role" AS ENUM('admin', 'editor');
  CREATE TYPE "public"."enum_about_page_story_values_icon" AS ENUM('share', 'palette', 'pen', 'monitor', 'chart-bar', 'clapperboard', 'bot', 'users', 'workflow', 'briefcase', 'message', 'brain', 'languages', 'bell', 'calendar', 'clipboard', 'database', 'file', 'gauge', 'handshake', 'kanban', 'dashboard', 'layers', 'link', 'pie', 'shield', 'sparkles', 'target', 'rocket', 'megaphone', 'camera', 'globe', 'cart', 'search', 'mail', 'zap', 'trending', 'code', 'lightbulb', 'award', 'badge-check', 'gem', 'chart-line');
  CREATE TYPE "public"."enum_about_page_awards_items_icon" AS ENUM('share', 'palette', 'pen', 'monitor', 'chart-bar', 'clapperboard', 'bot', 'users', 'workflow', 'briefcase', 'message', 'brain', 'languages', 'bell', 'calendar', 'clipboard', 'database', 'file', 'gauge', 'handshake', 'kanban', 'dashboard', 'layers', 'link', 'pie', 'shield', 'sparkles', 'target', 'rocket', 'megaphone', 'camera', 'globe', 'cart', 'search', 'mail', 'zap', 'trending', 'code', 'lightbulb', 'award', 'badge-check', 'gem', 'chart-line');
  CREATE TABLE "leads" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"email" varchar NOT NULL,
  	"phone" varchar,
  	"service" varchar,
  	"subject" varchar,
  	"message" varchar NOT NULL,
  	"status" "enum_leads_status" DEFAULT 'yeni' NOT NULL,
  	"source" varchar,
  	"notes" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "bookings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"email" varchar NOT NULL,
  	"phone" varchar,
  	"date" timestamp(3) with time zone NOT NULL,
  	"time" "enum_bookings_time" NOT NULL,
  	"topic" varchar,
  	"note" varchar,
  	"status" "enum_bookings_status" DEFAULT 'bekliyor' NOT NULL,
  	"slot" varchar,
  	"source" varchar,
  	"notes" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "services_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer
  );
  
  CREATE TABLE "services_intro" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "services_offerings" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "services_keywords" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "services_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"q" varchar,
  	"a" varchar
  );
  
  CREATE TABLE "services" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"short" varchar,
  	"card_image_id" integer,
  	"headline" varchar,
  	"offerings_title" varchar,
  	"show_cases" boolean,
  	"show_web_projects" boolean,
  	"seo_description" varchar,
  	"slug" varchar,
  	"order" numeric DEFAULT 10,
  	"icon" "enum_services_icon" DEFAULT 'sparkles',
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_services_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_services_v_version_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_services_v_version_intro" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_services_v_version_offerings" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_services_v_version_keywords" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_services_v_version_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"q" varchar,
  	"a" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_services_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_short" varchar,
  	"version_card_image_id" integer,
  	"version_headline" varchar,
  	"version_offerings_title" varchar,
  	"version_show_cases" boolean,
  	"version_show_web_projects" boolean,
  	"version_seo_description" varchar,
  	"version_slug" varchar,
  	"version_order" numeric DEFAULT 10,
  	"version_icon" "enum__services_v_version_icon" DEFAULT 'sparkles',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__services_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "products_highlights" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "products_hero_trust" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "products_showcase_bullets" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "products_showcase" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"title" varchar,
  	"desc" varchar,
  	"image_id" integer
  );
  
  CREATE TABLE "products_comparison_before" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "products_comparison_after" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "products_included" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"icon" "enum_products_included_icon" DEFAULT 'sparkles',
  	"desc" varchar
  );
  
  CREATE TABLE "products_features" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"icon" "enum_products_features_icon" DEFAULT 'sparkles',
  	"desc" varchar
  );
  
  CREATE TABLE "products_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"desc" varchar
  );
  
  CREATE TABLE "products_use_cases" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"desc" varchar
  );
  
  CREATE TABLE "products_stats" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" numeric,
  	"suffix" varchar,
  	"label" varchar
  );
  
  CREATE TABLE "products_integrations" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "products_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"q" varchar,
  	"a" varchar
  );
  
  CREATE TABLE "products_seo_keywords" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "products" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"tagline" varchar,
  	"desc" varchar,
  	"screenshot_id" integer,
  	"hero_visual_id" integer,
  	"cover_id" integer,
  	"og_image_id" integer,
  	"hero_eyebrow" varchar,
  	"hero_headline" varchar,
  	"hero_sub" varchar,
  	"hero_cta_label" varchar DEFAULT 'Demo Talep Et',
  	"tour_show" boolean DEFAULT true,
  	"tour_title" varchar,
  	"tour_video_url" varchar,
  	"tour_poster_id" integer,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"slug" varchar,
  	"order" numeric DEFAULT 10,
  	"icon" "enum_products_icon" DEFAULT 'sparkles',
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_products_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "products_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"products_id" integer
  );
  
  CREATE TABLE "_products_v_version_highlights" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_products_v_version_hero_trust" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_products_v_version_showcase_bullets" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_products_v_version_showcase" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"title" varchar,
  	"desc" varchar,
  	"image_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_products_v_version_comparison_before" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_products_v_version_comparison_after" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_products_v_version_included" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"icon" "enum__products_v_version_included_icon" DEFAULT 'sparkles',
  	"desc" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_products_v_version_features" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"icon" "enum__products_v_version_features_icon" DEFAULT 'sparkles',
  	"desc" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_products_v_version_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"desc" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_products_v_version_use_cases" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"desc" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_products_v_version_stats" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"value" numeric,
  	"suffix" varchar,
  	"label" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_products_v_version_integrations" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_products_v_version_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"q" varchar,
  	"a" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_products_v_version_seo_keywords" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_products_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_name" varchar,
  	"version_tagline" varchar,
  	"version_desc" varchar,
  	"version_screenshot_id" integer,
  	"version_hero_visual_id" integer,
  	"version_cover_id" integer,
  	"version_og_image_id" integer,
  	"version_hero_eyebrow" varchar,
  	"version_hero_headline" varchar,
  	"version_hero_sub" varchar,
  	"version_hero_cta_label" varchar DEFAULT 'Demo Talep Et',
  	"version_tour_show" boolean DEFAULT true,
  	"version_tour_title" varchar,
  	"version_tour_video_url" varchar,
  	"version_tour_poster_id" integer,
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"version_slug" varchar,
  	"version_order" numeric DEFAULT 10,
  	"version_icon" "enum__products_v_version_icon" DEFAULT 'sparkles',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__products_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "_products_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"products_id" integer
  );
  
  CREATE TABLE "posts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"excerpt" varchar,
  	"cover_id" integer,
  	"content" jsonb,
  	"slug" varchar,
  	"category_id" integer,
  	"published_at" timestamp(3) with time zone,
  	"author_id" integer,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_posts_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_posts_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_excerpt" varchar,
  	"version_cover_id" integer,
  	"version_content" jsonb,
  	"version_slug" varchar,
  	"version_category_id" integer,
  	"version_published_at" timestamp(3) with time zone,
  	"version_author_id" integer,
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__posts_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "categories" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "team" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"role" varchar NOT NULL,
  	"photo_id" integer,
  	"linkedin" varchar,
  	"order" numeric DEFAULT 10,
  	"show_on_home" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "references" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"logo_id" integer,
  	"order" numeric DEFAULT 10,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "case_studies_stats" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"value" numeric NOT NULL,
  	"prefix" varchar,
  	"suffix" varchar,
  	"featured" boolean
  );
  
  CREATE TABLE "case_studies" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"sector" varchar NOT NULL,
  	"title" varchar NOT NULL,
  	"summary" varchar NOT NULL,
  	"note" varchar,
  	"order" numeric DEFAULT 10,
  	"show_on_home" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "testimonials" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"quote" varchar,
  	"name" varchar NOT NULL,
  	"title" varchar,
  	"company" varchar,
  	"photo_id" integer,
  	"consent" boolean,
  	"order" numeric DEFAULT 10,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar NOT NULL,
  	"prefix" varchar DEFAULT '',
  	"_objectkey" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric,
  	"sizes_thumbnail_url" varchar,
  	"sizes_thumbnail_width" numeric,
  	"sizes_thumbnail_height" numeric,
  	"sizes_thumbnail_mime_type" varchar,
  	"sizes_thumbnail_filesize" numeric,
  	"sizes_thumbnail_filename" varchar,
  	"sizes_card_url" varchar,
  	"sizes_card_width" numeric,
  	"sizes_card_height" numeric,
  	"sizes_card_mime_type" varchar,
  	"sizes_card_filesize" numeric,
  	"sizes_card_filename" varchar,
  	"sizes_wide_url" varchar,
  	"sizes_wide_width" numeric,
  	"sizes_wide_height" numeric,
  	"sizes_wide_mime_type" varchar,
  	"sizes_wide_filesize" numeric,
  	"sizes_wide_filename" varchar
  );
  
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"role" "enum_users_role" DEFAULT 'editor' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"reset_password_requested_at" timestamp(3) with time zone,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"leads_id" integer,
  	"bookings_id" integer,
  	"services_id" integer,
  	"products_id" integer,
  	"posts_id" integer,
  	"categories_id" integer,
  	"team_id" integer,
  	"references_id" integer,
  	"case_studies_id" integer,
  	"testimonials_id" integer,
  	"media_id" integer,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "home_page_faq_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"q" varchar NOT NULL,
  	"a" varchar NOT NULL
  );
  
  CREATE TABLE "home_page" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"hero_title" varchar DEFAULT 'Markanızı bir üst seviyeye *taşıyoruz*' NOT NULL,
  	"hero_sub" varchar DEFAULT 'Sosyal medyadan web tasarıma, dijital pazarlamadan yazılım ürünlerine: markanızı tek bir büyüme planıyla yönetiyoruz.' NOT NULL,
  	"hero_show_service_links" boolean DEFAULT true,
  	"hero_primary_label" varchar DEFAULT 'Teklif Al' NOT NULL,
  	"hero_primary_href" varchar DEFAULT '/iletisim' NOT NULL,
  	"hero_secondary_label" varchar DEFAULT 'Toplantı Planla' NOT NULL,
  	"hero_secondary_href" varchar DEFAULT '/iletisim#toplanti' NOT NULL,
  	"hero_badge_strong" varchar DEFAULT '2025 Google Partner',
  	"hero_badge_text" varchar DEFAULT '{sayı} markanın dijital yol arkadaşı',
  	"references_show" boolean DEFAULT true,
  	"references_title" varchar DEFAULT 'Referanslarımız' NOT NULL,
  	"references_lead" varchar DEFAULT 'Sağlıktan e-ticarete, turizmden inşaata farklı sektörlerden markalarla aynı masada üretiyoruz.',
  	"services_show" boolean DEFAULT true,
  	"services_title" varchar DEFAULT 'Hizmetlerimiz' NOT NULL,
  	"services_lead" varchar DEFAULT 'Markanızı büyüten {sayı} disiplin; her biri ölçülebilir hedeflerle yönetilir.',
  	"products_show" boolean DEFAULT true,
  	"products_title" varchar DEFAULT 'Ürünlerimiz' NOT NULL,
  	"products_lead" varchar DEFAULT 'Ajans deneyimimizi işletmeniz için çalışan yazılımlara dönüştürdük.',
  	"video_show" boolean DEFAULT true,
  	"video_title" varchar DEFAULT 'Bizi Tanıyın' NOT NULL,
  	"video_lead" varchar DEFAULT 'Guru Dijital''in nasıl çalıştığını ve markalara neler kattığını kısa bir videoda izleyin.',
  	"cases_show" boolean DEFAULT true,
  	"cases_title" varchar DEFAULT 'Başarı Hikayeleri' NOT NULL,
  	"cases_lead" varchar DEFAULT 'Strateji, reklam ve içeriği aynı hedefe bağladığımızda ortaya çıkan sonuçlar.',
  	"team_show" boolean DEFAULT true,
  	"team_title" varchar DEFAULT 'Ekibimiz' NOT NULL,
  	"team_lead" varchar DEFAULT 'Strateji, tasarım, içerik ve performans uzmanlarından oluşan, aynı hedefe odaklı bir ekip.',
  	"team_limit" numeric DEFAULT 4,
  	"quotes_show" boolean DEFAULT true,
  	"quotes_title" varchar DEFAULT 'Markalar Ne Diyor' NOT NULL,
  	"quotes_lead" varchar DEFAULT 'Birlikte büyüdüğümüz markaların deneyimleri, kendi sözleriyle.',
  	"faq_show" boolean DEFAULT true,
  	"faq_title" varchar DEFAULT 'Sık Sorulan Sorular' NOT NULL,
  	"meet_title" varchar DEFAULT 'Tanışalım' NOT NULL,
  	"meet_text" varchar DEFAULT 'Markanızı ve hedeflerinizi dinleyelim; size uygun planı birlikte çıkaralım. İlk görüşme ücretsiz.' NOT NULL,
  	"meet_button_label" varchar DEFAULT 'İletişime Geç' NOT NULL,
  	"meet_button_href" varchar DEFAULT '/iletisim' NOT NULL,
  	"seo_title" varchar DEFAULT 'Guru Dijital Ajans | Unlock the next level',
  	"seo_description" varchar DEFAULT 'Guru Dijital: sosyal medya yönetimi, grafik tasarım, içerik üretimi, web tasarım, dijital pazarlama ve video tasarımında entegre çözümler sunan dijital ajans.',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "about_page_story_paragraphs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar NOT NULL
  );
  
  CREATE TABLE "about_page_story_values" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"icon" "enum_about_page_story_values_icon" DEFAULT 'sparkles' NOT NULL,
  	"desc" varchar NOT NULL
  );
  
  CREATE TABLE "about_page_awards_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"year" varchar NOT NULL,
  	"badge" varchar,
  	"icon" "enum_about_page_awards_items_icon" DEFAULT 'sparkles' NOT NULL,
  	"desc" varchar NOT NULL,
  	"image_id" integer
  );
  
  CREATE TABLE "about_page" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"intro_eyebrow" varchar DEFAULT 'Biz Kimiz',
  	"intro_title" varchar DEFAULT 'Markaların yol arkadaşıyız' NOT NULL,
  	"intro_lead" varchar DEFAULT 'Strateji, tasarım ve teknolojiyi tek çatıda buluşturuyor; markanızı dijitalde sizinle birlikte büyütüyoruz.',
  	"intro_primary_label" varchar DEFAULT 'Tanışalım' NOT NULL,
  	"intro_primary_href" varchar DEFAULT '/iletisim' NOT NULL,
  	"intro_secondary_label" varchar DEFAULT 'Ekibimizi Tanıyın',
  	"intro_secondary_href" varchar DEFAULT '#ekip',
  	"story_title" varchar DEFAULT 'Hikayemiz' NOT NULL,
  	"story_values_label" varchar DEFAULT 'İlkelerimiz',
  	"awards_show" boolean DEFAULT true,
  	"awards_title" varchar DEFAULT 'Ödüller ve Tanınırlık' NOT NULL,
  	"awards_lead" varchar DEFAULT '2025''te Google Partner olduk; veri odaklı çalışmalarımızla Google Ads Impact Awards''ta aday gösterildik.',
  	"team_show" boolean DEFAULT true,
  	"team_title" varchar DEFAULT 'Ekibimiz' NOT NULL,
  	"team_lead" varchar DEFAULT 'Strateji, tasarım, içerik ve performans uzmanlarından oluşan, aynı hedefe odaklı bir ekip.',
  	"stats_show" boolean DEFAULT true,
  	"stats_title" varchar DEFAULT 'Sayılarla Guru' NOT NULL,
  	"stats_references_label" varchar DEFAULT 'Referans Marka',
  	"stats_services_label" varchar DEFAULT 'Uzmanlık Alanı',
  	"stats_products_label" varchar DEFAULT 'Yazılım Ürünü',
  	"closing_title" varchar DEFAULT 'Markanızı Birlikte Büyütelim' NOT NULL,
  	"closing_lead" varchar DEFAULT 'Hedeflerinizi dinleyelim; size uygun planı birlikte çıkaralım. İlk görüşme ücretsiz.',
  	"closing_primary_label" varchar DEFAULT 'Tanışalım' NOT NULL,
  	"seo_title" varchar DEFAULT 'Hakkımızda',
  	"seo_description" varchar DEFAULT 'Guru Dijital''i tanıyın: Google Partner ve Google Ads Impact Awards adayı ekibimizle markaların yol arkadaşıyız; strateji, tasarım ve teknoloji tek çatıda.',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "site_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"announcement_enabled" boolean DEFAULT true,
  	"announcement_text" varchar DEFAULT 'Strateji, tasarım ve teknoloji tek çatıda.',
  	"contact_email" varchar DEFAULT 'info@gurudijital.com.tr',
  	"contact_phone" varchar,
  	"contact_whatsapp" varchar,
  	"contact_instagram" varchar DEFAULT 'https://www.instagram.com/gurudijital',
  	"contact_address" varchar,
  	"analytics_enabled" boolean DEFAULT true,
  	"analytics_website_id" varchar DEFAULT 'fb72f8f5-2e67-4ed6-9b06-6e5b8bb7f26a',
  	"analytics_script_url" varchar DEFAULT 'https://cloud.umami.is/script.js',
  	"analytics_domains" varchar DEFAULT 'guru-dijital-pied.vercel.app,gurudijital.com.tr,www.gurudijital.com.tr',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "services_gallery" ADD CONSTRAINT "services_gallery_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "services_gallery" ADD CONSTRAINT "services_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_intro" ADD CONSTRAINT "services_intro_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_offerings" ADD CONSTRAINT "services_offerings_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_keywords" ADD CONSTRAINT "services_keywords_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_faq" ADD CONSTRAINT "services_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services" ADD CONSTRAINT "services_card_image_id_media_id_fk" FOREIGN KEY ("card_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_services_v_version_gallery" ADD CONSTRAINT "_services_v_version_gallery_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_services_v_version_gallery" ADD CONSTRAINT "_services_v_version_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_version_intro" ADD CONSTRAINT "_services_v_version_intro_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_version_offerings" ADD CONSTRAINT "_services_v_version_offerings_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_version_keywords" ADD CONSTRAINT "_services_v_version_keywords_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_version_faq" ADD CONSTRAINT "_services_v_version_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v" ADD CONSTRAINT "_services_v_parent_id_services_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."services"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_services_v" ADD CONSTRAINT "_services_v_version_card_image_id_media_id_fk" FOREIGN KEY ("version_card_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products_highlights" ADD CONSTRAINT "products_highlights_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_hero_trust" ADD CONSTRAINT "products_hero_trust_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_showcase_bullets" ADD CONSTRAINT "products_showcase_bullets_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products_showcase"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_showcase" ADD CONSTRAINT "products_showcase_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products_showcase" ADD CONSTRAINT "products_showcase_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_comparison_before" ADD CONSTRAINT "products_comparison_before_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_comparison_after" ADD CONSTRAINT "products_comparison_after_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_included" ADD CONSTRAINT "products_included_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_features" ADD CONSTRAINT "products_features_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_steps" ADD CONSTRAINT "products_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_use_cases" ADD CONSTRAINT "products_use_cases_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_stats" ADD CONSTRAINT "products_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_integrations" ADD CONSTRAINT "products_integrations_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_faq" ADD CONSTRAINT "products_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_seo_keywords" ADD CONSTRAINT "products_seo_keywords_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products" ADD CONSTRAINT "products_screenshot_id_media_id_fk" FOREIGN KEY ("screenshot_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products" ADD CONSTRAINT "products_hero_visual_id_media_id_fk" FOREIGN KEY ("hero_visual_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products" ADD CONSTRAINT "products_cover_id_media_id_fk" FOREIGN KEY ("cover_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products" ADD CONSTRAINT "products_og_image_id_media_id_fk" FOREIGN KEY ("og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products" ADD CONSTRAINT "products_tour_poster_id_media_id_fk" FOREIGN KEY ("tour_poster_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products_rels" ADD CONSTRAINT "products_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_rels" ADD CONSTRAINT "products_rels_products_fk" FOREIGN KEY ("products_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_version_highlights" ADD CONSTRAINT "_products_v_version_highlights_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_version_hero_trust" ADD CONSTRAINT "_products_v_version_hero_trust_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_version_showcase_bullets" ADD CONSTRAINT "_products_v_version_showcase_bullets_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_products_v_version_showcase"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_version_showcase" ADD CONSTRAINT "_products_v_version_showcase_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_products_v_version_showcase" ADD CONSTRAINT "_products_v_version_showcase_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_version_comparison_before" ADD CONSTRAINT "_products_v_version_comparison_before_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_version_comparison_after" ADD CONSTRAINT "_products_v_version_comparison_after_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_version_included" ADD CONSTRAINT "_products_v_version_included_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_version_features" ADD CONSTRAINT "_products_v_version_features_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_version_steps" ADD CONSTRAINT "_products_v_version_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_version_use_cases" ADD CONSTRAINT "_products_v_version_use_cases_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_version_stats" ADD CONSTRAINT "_products_v_version_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_version_integrations" ADD CONSTRAINT "_products_v_version_integrations_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_version_faq" ADD CONSTRAINT "_products_v_version_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_version_seo_keywords" ADD CONSTRAINT "_products_v_version_seo_keywords_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v" ADD CONSTRAINT "_products_v_parent_id_products_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_products_v" ADD CONSTRAINT "_products_v_version_screenshot_id_media_id_fk" FOREIGN KEY ("version_screenshot_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_products_v" ADD CONSTRAINT "_products_v_version_hero_visual_id_media_id_fk" FOREIGN KEY ("version_hero_visual_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_products_v" ADD CONSTRAINT "_products_v_version_cover_id_media_id_fk" FOREIGN KEY ("version_cover_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_products_v" ADD CONSTRAINT "_products_v_version_og_image_id_media_id_fk" FOREIGN KEY ("version_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_products_v" ADD CONSTRAINT "_products_v_version_tour_poster_id_media_id_fk" FOREIGN KEY ("version_tour_poster_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_products_v_rels" ADD CONSTRAINT "_products_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_rels" ADD CONSTRAINT "_products_v_rels_products_fk" FOREIGN KEY ("products_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts" ADD CONSTRAINT "posts_cover_id_media_id_fk" FOREIGN KEY ("cover_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts" ADD CONSTRAINT "posts_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts" ADD CONSTRAINT "posts_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v" ADD CONSTRAINT "_posts_v_parent_id_posts_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v" ADD CONSTRAINT "_posts_v_version_cover_id_media_id_fk" FOREIGN KEY ("version_cover_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v" ADD CONSTRAINT "_posts_v_version_category_id_categories_id_fk" FOREIGN KEY ("version_category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v" ADD CONSTRAINT "_posts_v_version_author_id_users_id_fk" FOREIGN KEY ("version_author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "team" ADD CONSTRAINT "team_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "references" ADD CONSTRAINT "references_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "case_studies_stats" ADD CONSTRAINT "case_studies_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."case_studies"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "testimonials" ADD CONSTRAINT "testimonials_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_leads_fk" FOREIGN KEY ("leads_id") REFERENCES "public"."leads"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_bookings_fk" FOREIGN KEY ("bookings_id") REFERENCES "public"."bookings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_services_fk" FOREIGN KEY ("services_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_products_fk" FOREIGN KEY ("products_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_team_fk" FOREIGN KEY ("team_id") REFERENCES "public"."team"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_references_fk" FOREIGN KEY ("references_id") REFERENCES "public"."references"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_case_studies_fk" FOREIGN KEY ("case_studies_id") REFERENCES "public"."case_studies"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_testimonials_fk" FOREIGN KEY ("testimonials_id") REFERENCES "public"."testimonials"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_page_faq_items" ADD CONSTRAINT "home_page_faq_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "about_page_story_paragraphs" ADD CONSTRAINT "about_page_story_paragraphs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."about_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "about_page_story_values" ADD CONSTRAINT "about_page_story_values_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."about_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "about_page_awards_items" ADD CONSTRAINT "about_page_awards_items_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "about_page_awards_items" ADD CONSTRAINT "about_page_awards_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."about_page"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "leads_updated_at_idx" ON "leads" USING btree ("updated_at");
  CREATE INDEX "leads_created_at_idx" ON "leads" USING btree ("created_at");
  CREATE INDEX "bookings_slot_idx" ON "bookings" USING btree ("slot");
  CREATE INDEX "bookings_updated_at_idx" ON "bookings" USING btree ("updated_at");
  CREATE INDEX "bookings_created_at_idx" ON "bookings" USING btree ("created_at");
  CREATE INDEX "services_gallery_order_idx" ON "services_gallery" USING btree ("_order");
  CREATE INDEX "services_gallery_parent_id_idx" ON "services_gallery" USING btree ("_parent_id");
  CREATE INDEX "services_gallery_image_idx" ON "services_gallery" USING btree ("image_id");
  CREATE INDEX "services_intro_order_idx" ON "services_intro" USING btree ("_order");
  CREATE INDEX "services_intro_parent_id_idx" ON "services_intro" USING btree ("_parent_id");
  CREATE INDEX "services_offerings_order_idx" ON "services_offerings" USING btree ("_order");
  CREATE INDEX "services_offerings_parent_id_idx" ON "services_offerings" USING btree ("_parent_id");
  CREATE INDEX "services_keywords_order_idx" ON "services_keywords" USING btree ("_order");
  CREATE INDEX "services_keywords_parent_id_idx" ON "services_keywords" USING btree ("_parent_id");
  CREATE INDEX "services_faq_order_idx" ON "services_faq" USING btree ("_order");
  CREATE INDEX "services_faq_parent_id_idx" ON "services_faq" USING btree ("_parent_id");
  CREATE INDEX "services_card_image_idx" ON "services" USING btree ("card_image_id");
  CREATE UNIQUE INDEX "services_slug_idx" ON "services" USING btree ("slug");
  CREATE INDEX "services_updated_at_idx" ON "services" USING btree ("updated_at");
  CREATE INDEX "services_created_at_idx" ON "services" USING btree ("created_at");
  CREATE INDEX "services__status_idx" ON "services" USING btree ("_status");
  CREATE INDEX "_services_v_version_gallery_order_idx" ON "_services_v_version_gallery" USING btree ("_order");
  CREATE INDEX "_services_v_version_gallery_parent_id_idx" ON "_services_v_version_gallery" USING btree ("_parent_id");
  CREATE INDEX "_services_v_version_gallery_image_idx" ON "_services_v_version_gallery" USING btree ("image_id");
  CREATE INDEX "_services_v_version_intro_order_idx" ON "_services_v_version_intro" USING btree ("_order");
  CREATE INDEX "_services_v_version_intro_parent_id_idx" ON "_services_v_version_intro" USING btree ("_parent_id");
  CREATE INDEX "_services_v_version_offerings_order_idx" ON "_services_v_version_offerings" USING btree ("_order");
  CREATE INDEX "_services_v_version_offerings_parent_id_idx" ON "_services_v_version_offerings" USING btree ("_parent_id");
  CREATE INDEX "_services_v_version_keywords_order_idx" ON "_services_v_version_keywords" USING btree ("_order");
  CREATE INDEX "_services_v_version_keywords_parent_id_idx" ON "_services_v_version_keywords" USING btree ("_parent_id");
  CREATE INDEX "_services_v_version_faq_order_idx" ON "_services_v_version_faq" USING btree ("_order");
  CREATE INDEX "_services_v_version_faq_parent_id_idx" ON "_services_v_version_faq" USING btree ("_parent_id");
  CREATE INDEX "_services_v_parent_idx" ON "_services_v" USING btree ("parent_id");
  CREATE INDEX "_services_v_version_version_card_image_idx" ON "_services_v" USING btree ("version_card_image_id");
  CREATE INDEX "_services_v_version_version_slug_idx" ON "_services_v" USING btree ("version_slug");
  CREATE INDEX "_services_v_version_version_updated_at_idx" ON "_services_v" USING btree ("version_updated_at");
  CREATE INDEX "_services_v_version_version_created_at_idx" ON "_services_v" USING btree ("version_created_at");
  CREATE INDEX "_services_v_version_version__status_idx" ON "_services_v" USING btree ("version__status");
  CREATE INDEX "_services_v_created_at_idx" ON "_services_v" USING btree ("created_at");
  CREATE INDEX "_services_v_updated_at_idx" ON "_services_v" USING btree ("updated_at");
  CREATE INDEX "_services_v_latest_idx" ON "_services_v" USING btree ("latest");
  CREATE INDEX "products_highlights_order_idx" ON "products_highlights" USING btree ("_order");
  CREATE INDEX "products_highlights_parent_id_idx" ON "products_highlights" USING btree ("_parent_id");
  CREATE INDEX "products_hero_trust_order_idx" ON "products_hero_trust" USING btree ("_order");
  CREATE INDEX "products_hero_trust_parent_id_idx" ON "products_hero_trust" USING btree ("_parent_id");
  CREATE INDEX "products_showcase_bullets_order_idx" ON "products_showcase_bullets" USING btree ("_order");
  CREATE INDEX "products_showcase_bullets_parent_id_idx" ON "products_showcase_bullets" USING btree ("_parent_id");
  CREATE INDEX "products_showcase_order_idx" ON "products_showcase" USING btree ("_order");
  CREATE INDEX "products_showcase_parent_id_idx" ON "products_showcase" USING btree ("_parent_id");
  CREATE INDEX "products_showcase_image_idx" ON "products_showcase" USING btree ("image_id");
  CREATE INDEX "products_comparison_before_order_idx" ON "products_comparison_before" USING btree ("_order");
  CREATE INDEX "products_comparison_before_parent_id_idx" ON "products_comparison_before" USING btree ("_parent_id");
  CREATE INDEX "products_comparison_after_order_idx" ON "products_comparison_after" USING btree ("_order");
  CREATE INDEX "products_comparison_after_parent_id_idx" ON "products_comparison_after" USING btree ("_parent_id");
  CREATE INDEX "products_included_order_idx" ON "products_included" USING btree ("_order");
  CREATE INDEX "products_included_parent_id_idx" ON "products_included" USING btree ("_parent_id");
  CREATE INDEX "products_features_order_idx" ON "products_features" USING btree ("_order");
  CREATE INDEX "products_features_parent_id_idx" ON "products_features" USING btree ("_parent_id");
  CREATE INDEX "products_steps_order_idx" ON "products_steps" USING btree ("_order");
  CREATE INDEX "products_steps_parent_id_idx" ON "products_steps" USING btree ("_parent_id");
  CREATE INDEX "products_use_cases_order_idx" ON "products_use_cases" USING btree ("_order");
  CREATE INDEX "products_use_cases_parent_id_idx" ON "products_use_cases" USING btree ("_parent_id");
  CREATE INDEX "products_stats_order_idx" ON "products_stats" USING btree ("_order");
  CREATE INDEX "products_stats_parent_id_idx" ON "products_stats" USING btree ("_parent_id");
  CREATE INDEX "products_integrations_order_idx" ON "products_integrations" USING btree ("_order");
  CREATE INDEX "products_integrations_parent_id_idx" ON "products_integrations" USING btree ("_parent_id");
  CREATE INDEX "products_faq_order_idx" ON "products_faq" USING btree ("_order");
  CREATE INDEX "products_faq_parent_id_idx" ON "products_faq" USING btree ("_parent_id");
  CREATE INDEX "products_seo_keywords_order_idx" ON "products_seo_keywords" USING btree ("_order");
  CREATE INDEX "products_seo_keywords_parent_id_idx" ON "products_seo_keywords" USING btree ("_parent_id");
  CREATE INDEX "products_screenshot_idx" ON "products" USING btree ("screenshot_id");
  CREATE INDEX "products_hero_visual_idx" ON "products" USING btree ("hero_visual_id");
  CREATE INDEX "products_cover_idx" ON "products" USING btree ("cover_id");
  CREATE INDEX "products_og_image_idx" ON "products" USING btree ("og_image_id");
  CREATE INDEX "products_tour_tour_poster_idx" ON "products" USING btree ("tour_poster_id");
  CREATE UNIQUE INDEX "products_slug_idx" ON "products" USING btree ("slug");
  CREATE INDEX "products_updated_at_idx" ON "products" USING btree ("updated_at");
  CREATE INDEX "products_created_at_idx" ON "products" USING btree ("created_at");
  CREATE INDEX "products__status_idx" ON "products" USING btree ("_status");
  CREATE INDEX "products_rels_order_idx" ON "products_rels" USING btree ("order");
  CREATE INDEX "products_rels_parent_idx" ON "products_rels" USING btree ("parent_id");
  CREATE INDEX "products_rels_path_idx" ON "products_rels" USING btree ("path");
  CREATE INDEX "products_rels_products_id_idx" ON "products_rels" USING btree ("products_id");
  CREATE INDEX "_products_v_version_highlights_order_idx" ON "_products_v_version_highlights" USING btree ("_order");
  CREATE INDEX "_products_v_version_highlights_parent_id_idx" ON "_products_v_version_highlights" USING btree ("_parent_id");
  CREATE INDEX "_products_v_version_hero_trust_order_idx" ON "_products_v_version_hero_trust" USING btree ("_order");
  CREATE INDEX "_products_v_version_hero_trust_parent_id_idx" ON "_products_v_version_hero_trust" USING btree ("_parent_id");
  CREATE INDEX "_products_v_version_showcase_bullets_order_idx" ON "_products_v_version_showcase_bullets" USING btree ("_order");
  CREATE INDEX "_products_v_version_showcase_bullets_parent_id_idx" ON "_products_v_version_showcase_bullets" USING btree ("_parent_id");
  CREATE INDEX "_products_v_version_showcase_order_idx" ON "_products_v_version_showcase" USING btree ("_order");
  CREATE INDEX "_products_v_version_showcase_parent_id_idx" ON "_products_v_version_showcase" USING btree ("_parent_id");
  CREATE INDEX "_products_v_version_showcase_image_idx" ON "_products_v_version_showcase" USING btree ("image_id");
  CREATE INDEX "_products_v_version_comparison_before_order_idx" ON "_products_v_version_comparison_before" USING btree ("_order");
  CREATE INDEX "_products_v_version_comparison_before_parent_id_idx" ON "_products_v_version_comparison_before" USING btree ("_parent_id");
  CREATE INDEX "_products_v_version_comparison_after_order_idx" ON "_products_v_version_comparison_after" USING btree ("_order");
  CREATE INDEX "_products_v_version_comparison_after_parent_id_idx" ON "_products_v_version_comparison_after" USING btree ("_parent_id");
  CREATE INDEX "_products_v_version_included_order_idx" ON "_products_v_version_included" USING btree ("_order");
  CREATE INDEX "_products_v_version_included_parent_id_idx" ON "_products_v_version_included" USING btree ("_parent_id");
  CREATE INDEX "_products_v_version_features_order_idx" ON "_products_v_version_features" USING btree ("_order");
  CREATE INDEX "_products_v_version_features_parent_id_idx" ON "_products_v_version_features" USING btree ("_parent_id");
  CREATE INDEX "_products_v_version_steps_order_idx" ON "_products_v_version_steps" USING btree ("_order");
  CREATE INDEX "_products_v_version_steps_parent_id_idx" ON "_products_v_version_steps" USING btree ("_parent_id");
  CREATE INDEX "_products_v_version_use_cases_order_idx" ON "_products_v_version_use_cases" USING btree ("_order");
  CREATE INDEX "_products_v_version_use_cases_parent_id_idx" ON "_products_v_version_use_cases" USING btree ("_parent_id");
  CREATE INDEX "_products_v_version_stats_order_idx" ON "_products_v_version_stats" USING btree ("_order");
  CREATE INDEX "_products_v_version_stats_parent_id_idx" ON "_products_v_version_stats" USING btree ("_parent_id");
  CREATE INDEX "_products_v_version_integrations_order_idx" ON "_products_v_version_integrations" USING btree ("_order");
  CREATE INDEX "_products_v_version_integrations_parent_id_idx" ON "_products_v_version_integrations" USING btree ("_parent_id");
  CREATE INDEX "_products_v_version_faq_order_idx" ON "_products_v_version_faq" USING btree ("_order");
  CREATE INDEX "_products_v_version_faq_parent_id_idx" ON "_products_v_version_faq" USING btree ("_parent_id");
  CREATE INDEX "_products_v_version_seo_keywords_order_idx" ON "_products_v_version_seo_keywords" USING btree ("_order");
  CREATE INDEX "_products_v_version_seo_keywords_parent_id_idx" ON "_products_v_version_seo_keywords" USING btree ("_parent_id");
  CREATE INDEX "_products_v_parent_idx" ON "_products_v" USING btree ("parent_id");
  CREATE INDEX "_products_v_version_version_screenshot_idx" ON "_products_v" USING btree ("version_screenshot_id");
  CREATE INDEX "_products_v_version_version_hero_visual_idx" ON "_products_v" USING btree ("version_hero_visual_id");
  CREATE INDEX "_products_v_version_version_cover_idx" ON "_products_v" USING btree ("version_cover_id");
  CREATE INDEX "_products_v_version_version_og_image_idx" ON "_products_v" USING btree ("version_og_image_id");
  CREATE INDEX "_products_v_version_tour_version_tour_poster_idx" ON "_products_v" USING btree ("version_tour_poster_id");
  CREATE INDEX "_products_v_version_version_slug_idx" ON "_products_v" USING btree ("version_slug");
  CREATE INDEX "_products_v_version_version_updated_at_idx" ON "_products_v" USING btree ("version_updated_at");
  CREATE INDEX "_products_v_version_version_created_at_idx" ON "_products_v" USING btree ("version_created_at");
  CREATE INDEX "_products_v_version_version__status_idx" ON "_products_v" USING btree ("version__status");
  CREATE INDEX "_products_v_created_at_idx" ON "_products_v" USING btree ("created_at");
  CREATE INDEX "_products_v_updated_at_idx" ON "_products_v" USING btree ("updated_at");
  CREATE INDEX "_products_v_latest_idx" ON "_products_v" USING btree ("latest");
  CREATE INDEX "_products_v_rels_order_idx" ON "_products_v_rels" USING btree ("order");
  CREATE INDEX "_products_v_rels_parent_idx" ON "_products_v_rels" USING btree ("parent_id");
  CREATE INDEX "_products_v_rels_path_idx" ON "_products_v_rels" USING btree ("path");
  CREATE INDEX "_products_v_rels_products_id_idx" ON "_products_v_rels" USING btree ("products_id");
  CREATE INDEX "posts_cover_idx" ON "posts" USING btree ("cover_id");
  CREATE UNIQUE INDEX "posts_slug_idx" ON "posts" USING btree ("slug");
  CREATE INDEX "posts_category_idx" ON "posts" USING btree ("category_id");
  CREATE INDEX "posts_author_idx" ON "posts" USING btree ("author_id");
  CREATE INDEX "posts_updated_at_idx" ON "posts" USING btree ("updated_at");
  CREATE INDEX "posts_created_at_idx" ON "posts" USING btree ("created_at");
  CREATE INDEX "posts__status_idx" ON "posts" USING btree ("_status");
  CREATE INDEX "_posts_v_parent_idx" ON "_posts_v" USING btree ("parent_id");
  CREATE INDEX "_posts_v_version_version_cover_idx" ON "_posts_v" USING btree ("version_cover_id");
  CREATE INDEX "_posts_v_version_version_slug_idx" ON "_posts_v" USING btree ("version_slug");
  CREATE INDEX "_posts_v_version_version_category_idx" ON "_posts_v" USING btree ("version_category_id");
  CREATE INDEX "_posts_v_version_version_author_idx" ON "_posts_v" USING btree ("version_author_id");
  CREATE INDEX "_posts_v_version_version_updated_at_idx" ON "_posts_v" USING btree ("version_updated_at");
  CREATE INDEX "_posts_v_version_version_created_at_idx" ON "_posts_v" USING btree ("version_created_at");
  CREATE INDEX "_posts_v_version_version__status_idx" ON "_posts_v" USING btree ("version__status");
  CREATE INDEX "_posts_v_created_at_idx" ON "_posts_v" USING btree ("created_at");
  CREATE INDEX "_posts_v_updated_at_idx" ON "_posts_v" USING btree ("updated_at");
  CREATE INDEX "_posts_v_latest_idx" ON "_posts_v" USING btree ("latest");
  CREATE UNIQUE INDEX "categories_slug_idx" ON "categories" USING btree ("slug");
  CREATE INDEX "categories_updated_at_idx" ON "categories" USING btree ("updated_at");
  CREATE INDEX "categories_created_at_idx" ON "categories" USING btree ("created_at");
  CREATE INDEX "team_photo_idx" ON "team" USING btree ("photo_id");
  CREATE INDEX "team_updated_at_idx" ON "team" USING btree ("updated_at");
  CREATE INDEX "team_created_at_idx" ON "team" USING btree ("created_at");
  CREATE INDEX "references_logo_idx" ON "references" USING btree ("logo_id");
  CREATE INDEX "references_updated_at_idx" ON "references" USING btree ("updated_at");
  CREATE INDEX "references_created_at_idx" ON "references" USING btree ("created_at");
  CREATE INDEX "case_studies_stats_order_idx" ON "case_studies_stats" USING btree ("_order");
  CREATE INDEX "case_studies_stats_parent_id_idx" ON "case_studies_stats" USING btree ("_parent_id");
  CREATE INDEX "case_studies_updated_at_idx" ON "case_studies" USING btree ("updated_at");
  CREATE INDEX "case_studies_created_at_idx" ON "case_studies" USING btree ("created_at");
  CREATE INDEX "testimonials_photo_idx" ON "testimonials" USING btree ("photo_id");
  CREATE INDEX "testimonials_updated_at_idx" ON "testimonials" USING btree ("updated_at");
  CREATE INDEX "testimonials_created_at_idx" ON "testimonials" USING btree ("created_at");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "media_sizes_thumbnail_sizes_thumbnail_filename_idx" ON "media" USING btree ("sizes_thumbnail_filename");
  CREATE INDEX "media_sizes_card_sizes_card_filename_idx" ON "media" USING btree ("sizes_card_filename");
  CREATE INDEX "media_sizes_wide_sizes_wide_filename_idx" ON "media" USING btree ("sizes_wide_filename");
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_leads_id_idx" ON "payload_locked_documents_rels" USING btree ("leads_id");
  CREATE INDEX "payload_locked_documents_rels_bookings_id_idx" ON "payload_locked_documents_rels" USING btree ("bookings_id");
  CREATE INDEX "payload_locked_documents_rels_services_id_idx" ON "payload_locked_documents_rels" USING btree ("services_id");
  CREATE INDEX "payload_locked_documents_rels_products_id_idx" ON "payload_locked_documents_rels" USING btree ("products_id");
  CREATE INDEX "payload_locked_documents_rels_posts_id_idx" ON "payload_locked_documents_rels" USING btree ("posts_id");
  CREATE INDEX "payload_locked_documents_rels_categories_id_idx" ON "payload_locked_documents_rels" USING btree ("categories_id");
  CREATE INDEX "payload_locked_documents_rels_team_id_idx" ON "payload_locked_documents_rels" USING btree ("team_id");
  CREATE INDEX "payload_locked_documents_rels_references_id_idx" ON "payload_locked_documents_rels" USING btree ("references_id");
  CREATE INDEX "payload_locked_documents_rels_case_studies_id_idx" ON "payload_locked_documents_rels" USING btree ("case_studies_id");
  CREATE INDEX "payload_locked_documents_rels_testimonials_id_idx" ON "payload_locked_documents_rels" USING btree ("testimonials_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");
  CREATE INDEX "home_page_faq_items_order_idx" ON "home_page_faq_items" USING btree ("_order");
  CREATE INDEX "home_page_faq_items_parent_id_idx" ON "home_page_faq_items" USING btree ("_parent_id");
  CREATE INDEX "about_page_story_paragraphs_order_idx" ON "about_page_story_paragraphs" USING btree ("_order");
  CREATE INDEX "about_page_story_paragraphs_parent_id_idx" ON "about_page_story_paragraphs" USING btree ("_parent_id");
  CREATE INDEX "about_page_story_values_order_idx" ON "about_page_story_values" USING btree ("_order");
  CREATE INDEX "about_page_story_values_parent_id_idx" ON "about_page_story_values" USING btree ("_parent_id");
  CREATE INDEX "about_page_awards_items_order_idx" ON "about_page_awards_items" USING btree ("_order");
  CREATE INDEX "about_page_awards_items_parent_id_idx" ON "about_page_awards_items" USING btree ("_parent_id");
  CREATE INDEX "about_page_awards_items_image_idx" ON "about_page_awards_items" USING btree ("image_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "leads" CASCADE;
  DROP TABLE "bookings" CASCADE;
  DROP TABLE "services_gallery" CASCADE;
  DROP TABLE "services_intro" CASCADE;
  DROP TABLE "services_offerings" CASCADE;
  DROP TABLE "services_keywords" CASCADE;
  DROP TABLE "services_faq" CASCADE;
  DROP TABLE "services" CASCADE;
  DROP TABLE "_services_v_version_gallery" CASCADE;
  DROP TABLE "_services_v_version_intro" CASCADE;
  DROP TABLE "_services_v_version_offerings" CASCADE;
  DROP TABLE "_services_v_version_keywords" CASCADE;
  DROP TABLE "_services_v_version_faq" CASCADE;
  DROP TABLE "_services_v" CASCADE;
  DROP TABLE "products_highlights" CASCADE;
  DROP TABLE "products_hero_trust" CASCADE;
  DROP TABLE "products_showcase_bullets" CASCADE;
  DROP TABLE "products_showcase" CASCADE;
  DROP TABLE "products_comparison_before" CASCADE;
  DROP TABLE "products_comparison_after" CASCADE;
  DROP TABLE "products_included" CASCADE;
  DROP TABLE "products_features" CASCADE;
  DROP TABLE "products_steps" CASCADE;
  DROP TABLE "products_use_cases" CASCADE;
  DROP TABLE "products_stats" CASCADE;
  DROP TABLE "products_integrations" CASCADE;
  DROP TABLE "products_faq" CASCADE;
  DROP TABLE "products_seo_keywords" CASCADE;
  DROP TABLE "products" CASCADE;
  DROP TABLE "products_rels" CASCADE;
  DROP TABLE "_products_v_version_highlights" CASCADE;
  DROP TABLE "_products_v_version_hero_trust" CASCADE;
  DROP TABLE "_products_v_version_showcase_bullets" CASCADE;
  DROP TABLE "_products_v_version_showcase" CASCADE;
  DROP TABLE "_products_v_version_comparison_before" CASCADE;
  DROP TABLE "_products_v_version_comparison_after" CASCADE;
  DROP TABLE "_products_v_version_included" CASCADE;
  DROP TABLE "_products_v_version_features" CASCADE;
  DROP TABLE "_products_v_version_steps" CASCADE;
  DROP TABLE "_products_v_version_use_cases" CASCADE;
  DROP TABLE "_products_v_version_stats" CASCADE;
  DROP TABLE "_products_v_version_integrations" CASCADE;
  DROP TABLE "_products_v_version_faq" CASCADE;
  DROP TABLE "_products_v_version_seo_keywords" CASCADE;
  DROP TABLE "_products_v" CASCADE;
  DROP TABLE "_products_v_rels" CASCADE;
  DROP TABLE "posts" CASCADE;
  DROP TABLE "_posts_v" CASCADE;
  DROP TABLE "categories" CASCADE;
  DROP TABLE "team" CASCADE;
  DROP TABLE "references" CASCADE;
  DROP TABLE "case_studies_stats" CASCADE;
  DROP TABLE "case_studies" CASCADE;
  DROP TABLE "testimonials" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TABLE "home_page_faq_items" CASCADE;
  DROP TABLE "home_page" CASCADE;
  DROP TABLE "about_page_story_paragraphs" CASCADE;
  DROP TABLE "about_page_story_values" CASCADE;
  DROP TABLE "about_page_awards_items" CASCADE;
  DROP TABLE "about_page" CASCADE;
  DROP TABLE "site_settings" CASCADE;
  DROP TYPE "public"."enum_leads_status";
  DROP TYPE "public"."enum_bookings_time";
  DROP TYPE "public"."enum_bookings_status";
  DROP TYPE "public"."enum_services_icon";
  DROP TYPE "public"."enum_services_status";
  DROP TYPE "public"."enum__services_v_version_icon";
  DROP TYPE "public"."enum__services_v_version_status";
  DROP TYPE "public"."enum_products_included_icon";
  DROP TYPE "public"."enum_products_features_icon";
  DROP TYPE "public"."enum_products_icon";
  DROP TYPE "public"."enum_products_status";
  DROP TYPE "public"."enum__products_v_version_included_icon";
  DROP TYPE "public"."enum__products_v_version_features_icon";
  DROP TYPE "public"."enum__products_v_version_icon";
  DROP TYPE "public"."enum__products_v_version_status";
  DROP TYPE "public"."enum_posts_status";
  DROP TYPE "public"."enum__posts_v_version_status";
  DROP TYPE "public"."enum_users_role";
  DROP TYPE "public"."enum_about_page_story_values_icon";
  DROP TYPE "public"."enum_about_page_awards_items_icon";`)
}
