import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_knowledge_source" AS ENUM('elle', 'site', 'belge');
  CREATE TABLE "site_connection_allowed_origins" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"origin" varchar NOT NULL
  );
  
  CREATE TABLE "site_connection_form_topics" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar NOT NULL
  );
  
  CREATE TABLE "site_connection" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id" integer,
  	"accent_color" varchar DEFAULT '#011441',
  	"form_enabled" boolean DEFAULT true,
  	"form_title" varchar DEFAULT 'Bize ulaşın',
  	"form_ask_phone" boolean DEFAULT true,
  	"form_success_text" varchar DEFAULT 'Teşekkürler, mesajınızı aldık. En kısa sürede dönüş yapacağız.',
  	"form_consent_text" varchar DEFAULT 'Bilgilerimin bana dönüş yapılması amacıyla işlenmesini kabul ediyorum.',
  	"form_privacy_url" varchar,
  	"label" varchar DEFAULT 'Site bağlantısı',
  	"site_key" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "usage" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id" integer,
  	"month" varchar,
  	"conversations" numeric DEFAULT 0,
  	"visitor_messages" numeric DEFAULT 0,
  	"chat_leads" numeric DEFAULT 0,
  	"form_leads" numeric DEFAULT 0,
  	"ai_calls" numeric DEFAULT 0,
  	"input_tokens" numeric DEFAULT 0,
  	"output_tokens" numeric DEFAULT 0,
  	"cache_read_tokens" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "knowledge" ADD COLUMN "source" "enum_knowledge_source" DEFAULT 'elle';
  ALTER TABLE "knowledge" ADD COLUMN "source_url" varchar;
  ALTER TABLE "chatbot_config" ADD COLUMN "monthly_limit" numeric;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "site_connection_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "usage_id" integer;
  ALTER TABLE "site_connection_allowed_origins" ADD CONSTRAINT "site_connection_allowed_origins_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_connection"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_connection_form_topics" ADD CONSTRAINT "site_connection_form_topics_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_connection"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_connection" ADD CONSTRAINT "site_connection_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "usage" ADD CONSTRAINT "usage_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "site_connection_allowed_origins_order_idx" ON "site_connection_allowed_origins" USING btree ("_order");
  CREATE INDEX "site_connection_allowed_origins_parent_id_idx" ON "site_connection_allowed_origins" USING btree ("_parent_id");
  CREATE INDEX "site_connection_form_topics_order_idx" ON "site_connection_form_topics" USING btree ("_order");
  CREATE INDEX "site_connection_form_topics_parent_id_idx" ON "site_connection_form_topics" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "site_connection_tenant_idx" ON "site_connection" USING btree ("tenant_id");
  CREATE INDEX "site_connection_site_key_idx" ON "site_connection" USING btree ("site_key");
  CREATE INDEX "site_connection_updated_at_idx" ON "site_connection" USING btree ("updated_at");
  CREATE INDEX "site_connection_created_at_idx" ON "site_connection" USING btree ("created_at");
  CREATE INDEX "usage_tenant_idx" ON "usage" USING btree ("tenant_id");
  CREATE INDEX "usage_month_idx" ON "usage" USING btree ("month");
  CREATE INDEX "usage_updated_at_idx" ON "usage" USING btree ("updated_at");
  CREATE INDEX "usage_created_at_idx" ON "usage" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_site_connection_fk" FOREIGN KEY ("site_connection_id") REFERENCES "public"."site_connection"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_usage_fk" FOREIGN KEY ("usage_id") REFERENCES "public"."usage"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "knowledge_source_url_idx" ON "knowledge" USING btree ("source_url");
  CREATE INDEX "payload_locked_documents_rels_site_connection_id_idx" ON "payload_locked_documents_rels" USING btree ("site_connection_id");
  CREATE INDEX "payload_locked_documents_rels_usage_id_idx" ON "payload_locked_documents_rels" USING btree ("usage_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "site_connection_allowed_origins" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "site_connection_form_topics" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "site_connection" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "usage" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "site_connection_allowed_origins" CASCADE;
  DROP TABLE "site_connection_form_topics" CASCADE;
  DROP TABLE "site_connection" CASCADE;
  DROP TABLE "usage" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_site_connection_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_usage_fk";
  
  DROP INDEX "knowledge_source_url_idx";
  DROP INDEX "payload_locked_documents_rels_site_connection_id_idx";
  DROP INDEX "payload_locked_documents_rels_usage_id_idx";
  ALTER TABLE "knowledge" DROP COLUMN "source";
  ALTER TABLE "knowledge" DROP COLUMN "source_url";
  ALTER TABLE "chatbot_config" DROP COLUMN "monthly_limit";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "site_connection_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "usage_id";
  DROP TYPE "public"."enum_knowledge_source";`)
}
