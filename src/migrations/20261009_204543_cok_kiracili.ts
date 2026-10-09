import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'
import { seedTemplates } from '../payload/ops/seed-templates'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_chatbot_config_model" AS ENUM('claude-haiku-5-5', 'claude-sonnet-5-5');
  CREATE TYPE "public"."enum_users_tenants_modules" AS ENUM('site', 'crm', 'chat', 'ops', 'business');
  CREATE TYPE "public"."enum_users_tenants_role" AS ENUM('yonetici', 'uye');
  CREATE TYPE "public"."enum_tenants_modules" AS ENUM('crm', 'chat', 'ops', 'business');
  CREATE TYPE "public"."enum_tenants_status" AS ENUM('aktif', 'pilot', 'askida');
  CREATE TABLE "chatbot_config_suggestions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar NOT NULL
  );
  
  CREATE TABLE "chatbot_config_canned_replies" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"text" varchar NOT NULL
  );
  
  CREATE TABLE "chatbot_config" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id" integer,
  	"enabled" boolean DEFAULT false,
  	"bot_name" varchar DEFAULT 'Asistan' NOT NULL,
  	"model" "enum_chatbot_config_model" DEFAULT 'claude-haiku-5-5',
  	"greeting" varchar DEFAULT 'Merhaba, size nasıl yardımcı olabilirim? Hizmetlerimiz ya da teklif almak hakkında sorularınızı yanıtlayabilirim.',
  	"notice" varchar DEFAULT 'Sohbet kayıt altına alınır. Paylaştığınız bilgileri yalnız size dönüş yapmak için kullanırız.',
  	"instructions" varchar,
  	"notify_handoff" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "users_tenants_modules" (
  	"order" integer NOT NULL,
  	"parent_id" varchar NOT NULL,
  	"value" "enum_users_tenants_modules",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "users_tenants" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"tenant_id" integer,
  	"role" "enum_users_tenants_role" DEFAULT 'uye'
  );
  
  CREATE TABLE "tenants_modules" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_tenants_modules",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "business_config_summary_recipients" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"email" varchar NOT NULL
  );
  
  CREATE TABLE "business_config" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id" integer,
  	"monthly_target" numeric,
  	"summary_enabled" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  DROP INDEX "quotes_number_idx";
  ALTER TABLE "leads" ADD COLUMN "tenant_id" integer;
  ALTER TABLE "bookings" ADD COLUMN "tenant_id" integer;
  ALTER TABLE "tenants" ADD COLUMN "profile_legal_name" varchar;
  ALTER TABLE "tenants" ADD COLUMN "profile_logo_id" integer;
  ALTER TABLE "tenants" ADD COLUMN "profile_email" varchar;
  ALTER TABLE "tenants" ADD COLUMN "profile_phone" varchar;
  ALTER TABLE "tenants" ADD COLUMN "profile_website" varchar;
  ALTER TABLE "tenants" ADD COLUMN "profile_address" varchar;
  ALTER TABLE "tenants" ADD COLUMN "profile_tax_office" varchar;
  ALTER TABLE "tenants" ADD COLUMN "profile_tax_number" varchar;
  ALTER TABLE "tenants" ADD COLUMN "profile_notify_email" varchar;
  ALTER TABLE "tenants" ADD COLUMN "quote_prefix" varchar DEFAULT 'GD';
  ALTER TABLE "tenants" ADD COLUMN "status" "enum_tenants_status" DEFAULT 'aktif';
  ALTER TABLE "tenants" ADD COLUMN "notes" varchar;
  ALTER TABLE "audit_log" ADD COLUMN "tenant_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "chatbot_config_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "business_config_id" integer;
  ALTER TABLE "chatbot_config_suggestions" ADD CONSTRAINT "chatbot_config_suggestions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."chatbot_config"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "chatbot_config_canned_replies" ADD CONSTRAINT "chatbot_config_canned_replies_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."chatbot_config"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "chatbot_config" ADD CONSTRAINT "chatbot_config_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "users_tenants_modules" ADD CONSTRAINT "users_tenants_modules_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."users_tenants"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users_tenants" ADD CONSTRAINT "users_tenants_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "users_tenants" ADD CONSTRAINT "users_tenants_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "tenants_modules" ADD CONSTRAINT "tenants_modules_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "business_config_summary_recipients" ADD CONSTRAINT "business_config_summary_recipients_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."business_config"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "business_config" ADD CONSTRAINT "business_config_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "chatbot_config_suggestions_order_idx" ON "chatbot_config_suggestions" USING btree ("_order");
  CREATE INDEX "chatbot_config_suggestions_parent_id_idx" ON "chatbot_config_suggestions" USING btree ("_parent_id");
  CREATE INDEX "chatbot_config_canned_replies_order_idx" ON "chatbot_config_canned_replies" USING btree ("_order");
  CREATE INDEX "chatbot_config_canned_replies_parent_id_idx" ON "chatbot_config_canned_replies" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "chatbot_config_tenant_idx" ON "chatbot_config" USING btree ("tenant_id");
  CREATE INDEX "chatbot_config_updated_at_idx" ON "chatbot_config" USING btree ("updated_at");
  CREATE INDEX "chatbot_config_created_at_idx" ON "chatbot_config" USING btree ("created_at");
  CREATE INDEX "users_tenants_modules_order_idx" ON "users_tenants_modules" USING btree ("order");
  CREATE INDEX "users_tenants_modules_parent_idx" ON "users_tenants_modules" USING btree ("parent_id");
  CREATE INDEX "users_tenants_order_idx" ON "users_tenants" USING btree ("_order");
  CREATE INDEX "users_tenants_parent_id_idx" ON "users_tenants" USING btree ("_parent_id");
  CREATE INDEX "users_tenants_tenant_idx" ON "users_tenants" USING btree ("tenant_id");
  CREATE INDEX "tenants_modules_order_idx" ON "tenants_modules" USING btree ("order");
  CREATE INDEX "tenants_modules_parent_idx" ON "tenants_modules" USING btree ("parent_id");
  CREATE INDEX "business_config_summary_recipients_order_idx" ON "business_config_summary_recipients" USING btree ("_order");
  CREATE INDEX "business_config_summary_recipients_parent_id_idx" ON "business_config_summary_recipients" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "business_config_tenant_idx" ON "business_config" USING btree ("tenant_id");
  CREATE INDEX "business_config_updated_at_idx" ON "business_config" USING btree ("updated_at");
  CREATE INDEX "business_config_created_at_idx" ON "business_config" USING btree ("created_at");
  ALTER TABLE "leads" ADD CONSTRAINT "leads_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "bookings" ADD CONSTRAINT "bookings_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "tenants" ADD CONSTRAINT "tenants_profile_logo_id_media_id_fk" FOREIGN KEY ("profile_logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_chatbot_config_fk" FOREIGN KEY ("chatbot_config_id") REFERENCES "public"."chatbot_config"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_business_config_fk" FOREIGN KEY ("business_config_id") REFERENCES "public"."business_config"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "leads_tenant_idx" ON "leads" USING btree ("tenant_id");
  CREATE INDEX "bookings_tenant_idx" ON "bookings" USING btree ("tenant_id");
  CREATE INDEX "tenants_profile_profile_logo_idx" ON "tenants" USING btree ("profile_logo_id");
  CREATE INDEX "audit_log_tenant_idx" ON "audit_log" USING btree ("tenant_id");
  CREATE INDEX "payload_locked_documents_rels_chatbot_config_id_idx" ON "payload_locked_documents_rels" USING btree ("chatbot_config_id");
  CREATE INDEX "payload_locked_documents_rels_business_config_id_idx" ON "payload_locked_documents_rels" USING btree ("business_config_id");
  CREATE INDEX "quotes_number_idx" ON "quotes" USING btree ("number");
`)

  /* Veri taşıma: eski genel ayarlar (tek kayıt) Guru Dijital işletmesinin ayarı olur; eski
     kullanıcı modülleri Guru Dijital satırına; işletmesi boş kayıtlar Guru Dijital'e bağlanır.
     Eski tablolar ancak bundan sonra kaldırılır. */
  await db.execute(sql`
  INSERT INTO "tenants" ("name", "slug", "updated_at", "created_at")
    SELECT 'Guru Dijital', 'guru', now(), now() WHERE NOT EXISTS (SELECT 1 FROM "tenants" WHERE "slug" = 'guru');
  UPDATE "tenants" SET "quote_prefix" = 'GD' WHERE "slug" = 'guru';
  INSERT INTO "tenants_modules" ("order", "parent_id", "value")
    SELECT v.ord, t.id, v.val::"enum_tenants_modules"
    FROM "tenants" t, (VALUES (1, 'crm'), (2, 'chat'), (3, 'ops'), (4, 'business')) AS v(ord, val)
    WHERE t.slug = 'guru' AND NOT EXISTS (SELECT 1 FROM "tenants_modules" m WHERE m.parent_id = t.id);

  UPDATE "leads" SET "tenant_id" = (SELECT id FROM "tenants" WHERE slug = 'guru') WHERE "tenant_id" IS NULL;
  UPDATE "bookings" SET "tenant_id" = (SELECT id FROM "tenants" WHERE slug = 'guru') WHERE "tenant_id" IS NULL;
  UPDATE "audit_log" SET "tenant_id" = (SELECT id FROM "tenants" WHERE slug = 'guru') WHERE "tenant_id" IS NULL;
  UPDATE "deals" SET "tenant_id" = (SELECT id FROM "tenants" WHERE slug = 'guru') WHERE "tenant_id" IS NULL;
  UPDATE "contacts" SET "tenant_id" = (SELECT id FROM "tenants" WHERE slug = 'guru') WHERE "tenant_id" IS NULL;
  UPDATE "companies" SET "tenant_id" = (SELECT id FROM "tenants" WHERE slug = 'guru') WHERE "tenant_id" IS NULL;
  UPDATE "quotes" SET "tenant_id" = (SELECT id FROM "tenants" WHERE slug = 'guru') WHERE "tenant_id" IS NULL;
  UPDATE "activities" SET "tenant_id" = (SELECT id FROM "tenants" WHERE slug = 'guru') WHERE "tenant_id" IS NULL;
  UPDATE "projects" SET "tenant_id" = (SELECT id FROM "tenants" WHERE slug = 'guru') WHERE "tenant_id" IS NULL;
  UPDATE "tasks" SET "tenant_id" = (SELECT id FROM "tenants" WHERE slug = 'guru') WHERE "tenant_id" IS NULL;
  UPDATE "templates" SET "tenant_id" = (SELECT id FROM "tenants" WHERE slug = 'guru') WHERE "tenant_id" IS NULL;
  UPDATE "conversations" SET "tenant_id" = (SELECT id FROM "tenants" WHERE slug = 'guru') WHERE "tenant_id" IS NULL;
  UPDATE "knowledge" SET "tenant_id" = (SELECT id FROM "tenants" WHERE slug = 'guru') WHERE "tenant_id" IS NULL;
  UPDATE "chat_messages" SET "tenant_id" = (SELECT id FROM "tenants" WHERE slug = 'guru') WHERE "tenant_id" IS NULL;

  INSERT INTO "chatbot_config" ("tenant_id", "enabled", "bot_name", "model", "greeting", "notice", "instructions", "notify_handoff", "updated_at", "created_at")
    SELECT (SELECT id FROM "tenants" WHERE slug = 'guru'), s.enabled, COALESCE(s.bot_name, 'Guru Asistan'), s.model::text::"enum_chatbot_config_model", s.greeting, s.notice, s.instructions, s.notify_handoff, s.updated_at, s.created_at
    FROM "chatbot_settings" s ORDER BY s.id LIMIT 1;
  INSERT INTO "chatbot_config_suggestions" ("_order", "_parent_id", "id", "text")
    SELECT x._order, c.id, x.id, x.text FROM "chatbot_settings_suggestions" x, "chatbot_config" c WHERE c.tenant_id = (SELECT id FROM "tenants" WHERE slug = 'guru');
  INSERT INTO "chatbot_config_canned_replies" ("_order", "_parent_id", "id", "label", "text")
    SELECT x._order, c.id, x.id, x.label, x.text FROM "chatbot_settings_canned_replies" x, "chatbot_config" c WHERE c.tenant_id = (SELECT id FROM "tenants" WHERE slug = 'guru');

  INSERT INTO "business_config" ("tenant_id", "monthly_target", "summary_enabled", "updated_at", "created_at")
    SELECT (SELECT id FROM "tenants" WHERE slug = 'guru'), b.monthly_target, b.summary_enabled, b.updated_at, b.created_at
    FROM "business_settings" b ORDER BY b.id LIMIT 1;
  INSERT INTO "business_config_summary_recipients" ("_order", "_parent_id", "id", "email")
    SELECT x._order, c.id, x.id, x.email FROM "business_settings_summary_recipients" x, "business_config" c WHERE c.tenant_id = (SELECT id FROM "tenants" WHERE slug = 'guru');

  INSERT INTO "users_tenants" ("_order", "_parent_id", "id", "tenant_id", "role")
    SELECT 1, u.id, substr(md5(random()::text || u.id::text), 1, 24), (SELECT id FROM "tenants" WHERE slug = 'guru'), 'uye'
    FROM "users" u WHERE u.role <> 'admin' AND NOT EXISTS (SELECT 1 FROM "users_tenants" x WHERE x._parent_id = u.id);
  INSERT INTO "users_tenants_modules" ("order", "parent_id", "value")
    SELECT m."order", ut.id, m.value::text::"enum_users_tenants_modules" FROM "users_modules" m JOIN "users_tenants" ut ON ut._parent_id = m.parent_id;
  INSERT INTO "users_tenants_modules" ("order", "parent_id", "value")
    SELECT 1, ut.id, 'site' FROM "users_tenants" ut WHERE NOT EXISTS (SELECT 1 FROM "users_tenants_modules" x WHERE x.parent_id = ut.id);
  `)

  await db.execute(sql`
  ALTER TABLE "business_settings" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "business_settings_summary_recipients" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "chatbot_settings" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "chatbot_settings_canned_replies" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "chatbot_settings_suggestions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "users_modules" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "users_modules" CASCADE;
  DROP TABLE "chatbot_settings_suggestions" CASCADE;
  DROP TABLE "chatbot_settings_canned_replies" CASCADE;
  DROP TABLE "chatbot_settings" CASCADE;
  DROP TABLE "business_settings_summary_recipients" CASCADE;
  DROP TABLE "business_settings" CASCADE;
  DROP TYPE "public"."enum_users_modules";
  DROP TYPE "public"."enum_chatbot_settings_model";
  `)

  /* Başlangıç süreç şablonları (Guru Dijital'de şablon yoksa) */
  const n = await seedTemplates(payload, req)
  if (n) payload.logger.info(`Süreç şablonları: ${n} eklendi`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_users_modules" AS ENUM('site', 'crm', 'chat', 'ops');
  CREATE TYPE "public"."enum_chatbot_settings_model" AS ENUM('claude-haiku-5-5', 'claude-sonnet-5-5');
  CREATE TABLE "users_modules" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_users_modules",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "chatbot_settings_suggestions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar NOT NULL
  );
  
  CREATE TABLE "chatbot_settings_canned_replies" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"text" varchar NOT NULL
  );
  
  CREATE TABLE "chatbot_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"enabled" boolean DEFAULT false,
  	"bot_name" varchar DEFAULT 'Guru Asistan' NOT NULL,
  	"model" "enum_chatbot_settings_model" DEFAULT 'claude-haiku-5-5',
  	"greeting" varchar DEFAULT 'Merhaba, ben Guru Dijital''in asistanıyım. Hizmetlerimiz, ürünlerimiz ya da teklif almak hakkında sorularınızı yanıtlayabilirim.',
  	"notice" varchar DEFAULT 'Sohbet kayıt altına alınır. Paylaştığınız bilgileri yalnız size dönüş yapmak için kullanırız.',
  	"instructions" varchar,
  	"notify_handoff" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "business_settings_summary_recipients" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"email" varchar NOT NULL
  );
  
  CREATE TABLE "business_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"monthly_target" numeric,
  	"summary_enabled" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "chatbot_config_suggestions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "chatbot_config_canned_replies" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "chatbot_config" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "users_tenants_modules" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "users_tenants" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "tenants_modules" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "business_config_summary_recipients" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "business_config" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "chatbot_config_suggestions" CASCADE;
  DROP TABLE "chatbot_config_canned_replies" CASCADE;
  DROP TABLE "chatbot_config" CASCADE;
  DROP TABLE "users_tenants_modules" CASCADE;
  DROP TABLE "users_tenants" CASCADE;
  DROP TABLE "tenants_modules" CASCADE;
  DROP TABLE "business_config_summary_recipients" CASCADE;
  DROP TABLE "business_config" CASCADE;
  ALTER TABLE "leads" DROP CONSTRAINT "leads_tenant_id_tenants_id_fk";
  
  ALTER TABLE "bookings" DROP CONSTRAINT "bookings_tenant_id_tenants_id_fk";
  
  ALTER TABLE "tenants" DROP CONSTRAINT "tenants_profile_logo_id_media_id_fk";
  
  ALTER TABLE "audit_log" DROP CONSTRAINT "audit_log_tenant_id_tenants_id_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_chatbot_config_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_business_config_fk";
  
  DROP INDEX "leads_tenant_idx";
  DROP INDEX "bookings_tenant_idx";
  DROP INDEX "tenants_profile_profile_logo_idx";
  DROP INDEX "audit_log_tenant_idx";
  DROP INDEX "payload_locked_documents_rels_chatbot_config_id_idx";
  DROP INDEX "payload_locked_documents_rels_business_config_id_idx";
  DROP INDEX "quotes_number_idx";
  ALTER TABLE "users_modules" ADD CONSTRAINT "users_modules_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "chatbot_settings_suggestions" ADD CONSTRAINT "chatbot_settings_suggestions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."chatbot_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "chatbot_settings_canned_replies" ADD CONSTRAINT "chatbot_settings_canned_replies_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."chatbot_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "business_settings_summary_recipients" ADD CONSTRAINT "business_settings_summary_recipients_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."business_settings"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "users_modules_order_idx" ON "users_modules" USING btree ("order");
  CREATE INDEX "users_modules_parent_idx" ON "users_modules" USING btree ("parent_id");
  CREATE INDEX "chatbot_settings_suggestions_order_idx" ON "chatbot_settings_suggestions" USING btree ("_order");
  CREATE INDEX "chatbot_settings_suggestions_parent_id_idx" ON "chatbot_settings_suggestions" USING btree ("_parent_id");
  CREATE INDEX "chatbot_settings_canned_replies_order_idx" ON "chatbot_settings_canned_replies" USING btree ("_order");
  CREATE INDEX "chatbot_settings_canned_replies_parent_id_idx" ON "chatbot_settings_canned_replies" USING btree ("_parent_id");
  CREATE INDEX "business_settings_summary_recipients_order_idx" ON "business_settings_summary_recipients" USING btree ("_order");
  CREATE INDEX "business_settings_summary_recipients_parent_id_idx" ON "business_settings_summary_recipients" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "quotes_number_idx" ON "quotes" USING btree ("number");
  ALTER TABLE "leads" DROP COLUMN "tenant_id";
  ALTER TABLE "bookings" DROP COLUMN "tenant_id";
  ALTER TABLE "tenants" DROP COLUMN "profile_legal_name";
  ALTER TABLE "tenants" DROP COLUMN "profile_logo_id";
  ALTER TABLE "tenants" DROP COLUMN "profile_email";
  ALTER TABLE "tenants" DROP COLUMN "profile_phone";
  ALTER TABLE "tenants" DROP COLUMN "profile_website";
  ALTER TABLE "tenants" DROP COLUMN "profile_address";
  ALTER TABLE "tenants" DROP COLUMN "profile_tax_office";
  ALTER TABLE "tenants" DROP COLUMN "profile_tax_number";
  ALTER TABLE "tenants" DROP COLUMN "profile_notify_email";
  ALTER TABLE "tenants" DROP COLUMN "quote_prefix";
  ALTER TABLE "tenants" DROP COLUMN "status";
  ALTER TABLE "tenants" DROP COLUMN "notes";
  ALTER TABLE "audit_log" DROP COLUMN "tenant_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "chatbot_config_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "business_config_id";
  DROP TYPE "public"."enum_chatbot_config_model";
  DROP TYPE "public"."enum_users_tenants_modules";
  DROP TYPE "public"."enum_users_tenants_role";
  DROP TYPE "public"."enum_tenants_modules";
  DROP TYPE "public"."enum_tenants_status";`)
}
