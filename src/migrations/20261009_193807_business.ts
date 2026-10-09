import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_users_modules" AS ENUM('site', 'crm', 'chat', 'ops');
  CREATE TYPE "public"."enum_audit_log_action" AS ENUM('olusturdu', 'degistirdi', 'sildi', 'giris');
  CREATE TABLE "users_modules" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_users_modules",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "audit_log" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"summary" varchar,
  	"user_id" integer,
  	"action" "enum_audit_log_action",
  	"target" varchar,
  	"doc_id" varchar,
  	"fields" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
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
  
  ALTER TABLE "projects" ADD COLUMN "completed_at" timestamp(3) with time zone;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "audit_log_id" integer;
  ALTER TABLE "users_modules" ADD CONSTRAINT "users_modules_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "business_settings_summary_recipients" ADD CONSTRAINT "business_settings_summary_recipients_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."business_settings"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "users_modules_order_idx" ON "users_modules" USING btree ("order");
  CREATE INDEX "users_modules_parent_idx" ON "users_modules" USING btree ("parent_id");
  CREATE INDEX "audit_log_user_idx" ON "audit_log" USING btree ("user_id");
  CREATE INDEX "audit_log_action_idx" ON "audit_log" USING btree ("action");
  CREATE INDEX "audit_log_target_idx" ON "audit_log" USING btree ("target");
  CREATE INDEX "audit_log_updated_at_idx" ON "audit_log" USING btree ("updated_at");
  CREATE INDEX "audit_log_created_at_idx" ON "audit_log" USING btree ("created_at");
  CREATE INDEX "business_settings_summary_recipients_order_idx" ON "business_settings_summary_recipients" USING btree ("_order");
  CREATE INDEX "business_settings_summary_recipients_parent_id_idx" ON "business_settings_summary_recipients" USING btree ("_parent_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_audit_log_fk" FOREIGN KEY ("audit_log_id") REFERENCES "public"."audit_log"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_audit_log_id_idx" ON "payload_locked_documents_rels" USING btree ("audit_log_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "users_modules" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "audit_log" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "business_settings_summary_recipients" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "business_settings" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "users_modules" CASCADE;
  DROP TABLE "audit_log" CASCADE;
  DROP TABLE "business_settings_summary_recipients" CASCADE;
  DROP TABLE "business_settings" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_audit_log_fk";
  
  DROP INDEX "payload_locked_documents_rels_audit_log_id_idx";
  ALTER TABLE "projects" DROP COLUMN "completed_at";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "audit_log_id";
  DROP TYPE "public"."enum_users_modules";
  DROP TYPE "public"."enum_audit_log_action";`)
}
