import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_automations_stage" AS ENUM('aday', 'gorusme', 'teklif', 'kazanildi', 'kaybedildi');
  CREATE TYPE "public"."enum_automations_action" AS ENUM('gorev', 'sorumlu', 'eposta', 'bildirim');
  CREATE TYPE "public"."enum_automations_task_type" AS ENUM('arama', 'toplanti', 'eposta', 'gorev');
  CREATE TYPE "public"."enum_automations_deadline" AS ENUM('hemen', 'gun-sonu', '1', '3', 'hafta');
  CREATE TYPE "public"."enum_tasks_repeat" AS ENUM('haftalik', 'iki-haftalik', 'aylik');
  CREATE TYPE "public"."enum_users_tenants_scope" AS ENUM('hepsi', 'kendi');
  CREATE TABLE "automations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id" integer,
  	"name" varchar NOT NULL,
  	"active" boolean DEFAULT true,
  	"stage" "enum_automations_stage" NOT NULL,
  	"action" "enum_automations_action" DEFAULT 'gorev' NOT NULL,
  	"task_type" "enum_automations_task_type" DEFAULT 'arama',
  	"deadline" "enum_automations_deadline" DEFAULT '1',
  	"task_title" varchar,
  	"assign_to_id" integer,
  	"email_subject" varchar,
  	"email_body" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "task_comments" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id" integer,
  	"task_id" integer NOT NULL,
  	"text" varchar NOT NULL,
  	"author_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "task_comments_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  ALTER TABLE "tasks" ADD COLUMN "repeat" "enum_tasks_repeat";
  ALTER TABLE "users_tenants" ADD COLUMN "scope" "enum_users_tenants_scope" DEFAULT 'hepsi';
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "automations_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "task_comments_id" integer;
  ALTER TABLE "automations" ADD CONSTRAINT "automations_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "automations" ADD CONSTRAINT "automations_assign_to_id_users_id_fk" FOREIGN KEY ("assign_to_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "task_comments" ADD CONSTRAINT "task_comments_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "task_comments" ADD CONSTRAINT "task_comments_task_id_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "task_comments" ADD CONSTRAINT "task_comments_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "task_comments_rels" ADD CONSTRAINT "task_comments_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."task_comments"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "task_comments_rels" ADD CONSTRAINT "task_comments_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "automations_tenant_idx" ON "automations" USING btree ("tenant_id");
  CREATE INDEX "automations_assign_to_idx" ON "automations" USING btree ("assign_to_id");
  CREATE INDEX "automations_updated_at_idx" ON "automations" USING btree ("updated_at");
  CREATE INDEX "automations_created_at_idx" ON "automations" USING btree ("created_at");
  CREATE INDEX "task_comments_tenant_idx" ON "task_comments" USING btree ("tenant_id");
  CREATE INDEX "task_comments_task_idx" ON "task_comments" USING btree ("task_id");
  CREATE INDEX "task_comments_author_idx" ON "task_comments" USING btree ("author_id");
  CREATE INDEX "task_comments_updated_at_idx" ON "task_comments" USING btree ("updated_at");
  CREATE INDEX "task_comments_created_at_idx" ON "task_comments" USING btree ("created_at");
  CREATE INDEX "task_comments_rels_order_idx" ON "task_comments_rels" USING btree ("order");
  CREATE INDEX "task_comments_rels_parent_idx" ON "task_comments_rels" USING btree ("parent_id");
  CREATE INDEX "task_comments_rels_path_idx" ON "task_comments_rels" USING btree ("path");
  CREATE INDEX "task_comments_rels_users_id_idx" ON "task_comments_rels" USING btree ("users_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_automations_fk" FOREIGN KEY ("automations_id") REFERENCES "public"."automations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_task_comments_fk" FOREIGN KEY ("task_comments_id") REFERENCES "public"."task_comments"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_automations_id_idx" ON "payload_locked_documents_rels" USING btree ("automations_id");
  CREATE INDEX "payload_locked_documents_rels_task_comments_id_idx" ON "payload_locked_documents_rels" USING btree ("task_comments_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "automations" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "task_comments" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "task_comments_rels" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "automations" CASCADE;
  DROP TABLE "task_comments" CASCADE;
  DROP TABLE "task_comments_rels" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_automations_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_task_comments_fk";
  
  DROP INDEX "payload_locked_documents_rels_automations_id_idx";
  DROP INDEX "payload_locked_documents_rels_task_comments_id_idx";
  ALTER TABLE "tasks" DROP COLUMN "repeat";
  ALTER TABLE "users_tenants" DROP COLUMN "scope";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "automations_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "task_comments_id";
  DROP TYPE "public"."enum_automations_stage";
  DROP TYPE "public"."enum_automations_action";
  DROP TYPE "public"."enum_automations_task_type";
  DROP TYPE "public"."enum_automations_deadline";
  DROP TYPE "public"."enum_tasks_repeat";
  DROP TYPE "public"."enum_users_tenants_scope";`)
}
