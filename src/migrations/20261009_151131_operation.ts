import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_projects_status" AS ENUM('aktif', 'beklemede', 'tamamlandi', 'iptal');
  CREATE TYPE "public"."enum_tasks_stage" AS ENUM('yapilacak', 'devam', 'kontrol', 'tamam');
  CREATE TYPE "public"."enum_tasks_priority" AS ENUM('dusuk', 'normal', 'yuksek', 'acil');
  CREATE TYPE "public"."enum_templates_steps_priority" AS ENUM('dusuk', 'normal', 'yuksek', 'acil');
  CREATE TABLE "projects" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"company_id" integer,
  	"contact_id" integer,
  	"start_date" timestamp(3) with time zone,
  	"due_date" timestamp(3) with time zone,
  	"template_id" integer,
  	"description" varchar,
  	"status" "enum_projects_status" DEFAULT 'aktif' NOT NULL,
  	"owner_id" integer,
  	"deal_id" integer,
  	"tenant_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "tasks_checklist" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"done" boolean DEFAULT false,
  	"text" varchar NOT NULL
  );
  
  CREATE TABLE "tasks" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"project_id" integer,
  	"assignee_id" integer,
  	"start_date" timestamp(3) with time zone,
  	"due_date" timestamp(3) with time zone,
  	"hours" numeric,
  	"description" varchar,
  	"stage" "enum_tasks_stage" DEFAULT 'yapilacak' NOT NULL,
  	"priority" "enum_tasks_priority" DEFAULT 'normal' NOT NULL,
  	"seq" numeric,
  	"started_at" timestamp(3) with time zone,
  	"completed_at" timestamp(3) with time zone,
  	"order" numeric,
  	"tenant_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "templates_steps_checklist" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar NOT NULL
  );
  
  CREATE TABLE "templates_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"assignee_id" integer,
  	"offset" numeric DEFAULT 0 NOT NULL,
  	"duration" numeric DEFAULT 1 NOT NULL,
  	"hours" numeric,
  	"priority" "enum_templates_steps_priority" DEFAULT 'normal'
  );
  
  CREATE TABLE "templates" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"description" varchar,
  	"tenant_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "users" ADD COLUMN "weekly_hours" numeric DEFAULT 40;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "projects_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "tasks_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "templates_id" integer;
  ALTER TABLE "projects" ADD CONSTRAINT "projects_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "projects" ADD CONSTRAINT "projects_contact_id_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "projects" ADD CONSTRAINT "projects_template_id_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."templates"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "projects" ADD CONSTRAINT "projects_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "projects" ADD CONSTRAINT "projects_deal_id_deals_id_fk" FOREIGN KEY ("deal_id") REFERENCES "public"."deals"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "projects" ADD CONSTRAINT "projects_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "tasks_checklist" ADD CONSTRAINT "tasks_checklist_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."tasks"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "tasks" ADD CONSTRAINT "tasks_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "tasks" ADD CONSTRAINT "tasks_assignee_id_users_id_fk" FOREIGN KEY ("assignee_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "tasks" ADD CONSTRAINT "tasks_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "templates_steps_checklist" ADD CONSTRAINT "templates_steps_checklist_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."templates_steps"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "templates_steps" ADD CONSTRAINT "templates_steps_assignee_id_users_id_fk" FOREIGN KEY ("assignee_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "templates_steps" ADD CONSTRAINT "templates_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."templates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "templates" ADD CONSTRAINT "templates_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "projects_company_idx" ON "projects" USING btree ("company_id");
  CREATE INDEX "projects_contact_idx" ON "projects" USING btree ("contact_id");
  CREATE INDEX "projects_template_idx" ON "projects" USING btree ("template_id");
  CREATE INDEX "projects_owner_idx" ON "projects" USING btree ("owner_id");
  CREATE INDEX "projects_deal_idx" ON "projects" USING btree ("deal_id");
  CREATE INDEX "projects_tenant_idx" ON "projects" USING btree ("tenant_id");
  CREATE INDEX "projects_updated_at_idx" ON "projects" USING btree ("updated_at");
  CREATE INDEX "projects_created_at_idx" ON "projects" USING btree ("created_at");
  CREATE INDEX "tasks_checklist_order_idx" ON "tasks_checklist" USING btree ("_order");
  CREATE INDEX "tasks_checklist_parent_id_idx" ON "tasks_checklist" USING btree ("_parent_id");
  CREATE INDEX "tasks_project_idx" ON "tasks" USING btree ("project_id");
  CREATE INDEX "tasks_assignee_idx" ON "tasks" USING btree ("assignee_id");
  CREATE INDEX "tasks_due_date_idx" ON "tasks" USING btree ("due_date");
  CREATE INDEX "tasks_stage_idx" ON "tasks" USING btree ("stage");
  CREATE INDEX "tasks_seq_idx" ON "tasks" USING btree ("seq");
  CREATE INDEX "tasks_completed_at_idx" ON "tasks" USING btree ("completed_at");
  CREATE INDEX "tasks_tenant_idx" ON "tasks" USING btree ("tenant_id");
  CREATE INDEX "tasks_updated_at_idx" ON "tasks" USING btree ("updated_at");
  CREATE INDEX "tasks_created_at_idx" ON "tasks" USING btree ("created_at");
  CREATE INDEX "templates_steps_checklist_order_idx" ON "templates_steps_checklist" USING btree ("_order");
  CREATE INDEX "templates_steps_checklist_parent_id_idx" ON "templates_steps_checklist" USING btree ("_parent_id");
  CREATE INDEX "templates_steps_order_idx" ON "templates_steps" USING btree ("_order");
  CREATE INDEX "templates_steps_parent_id_idx" ON "templates_steps" USING btree ("_parent_id");
  CREATE INDEX "templates_steps_assignee_idx" ON "templates_steps" USING btree ("assignee_id");
  CREATE INDEX "templates_tenant_idx" ON "templates" USING btree ("tenant_id");
  CREATE INDEX "templates_updated_at_idx" ON "templates" USING btree ("updated_at");
  CREATE INDEX "templates_created_at_idx" ON "templates" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_projects_fk" FOREIGN KEY ("projects_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_tasks_fk" FOREIGN KEY ("tasks_id") REFERENCES "public"."tasks"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_templates_fk" FOREIGN KEY ("templates_id") REFERENCES "public"."templates"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_projects_id_idx" ON "payload_locked_documents_rels" USING btree ("projects_id");
  CREATE INDEX "payload_locked_documents_rels_tasks_id_idx" ON "payload_locked_documents_rels" USING btree ("tasks_id");
  CREATE INDEX "payload_locked_documents_rels_templates_id_idx" ON "payload_locked_documents_rels" USING btree ("templates_id");`)

  /* Başlangıç süreç şablonları çok kiracılı geçişte (20261009_204543) eklenir: tohumlama güncel
     kodu kullanır, bu noktadaki şemada işletme yapısı henüz tamam değildir. */
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "projects" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "tasks_checklist" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "tasks" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "templates_steps_checklist" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "templates_steps" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "templates" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "projects" CASCADE;
  DROP TABLE "tasks_checklist" CASCADE;
  DROP TABLE "tasks" CASCADE;
  DROP TABLE "templates_steps_checklist" CASCADE;
  DROP TABLE "templates_steps" CASCADE;
  DROP TABLE "templates" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_projects_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_tasks_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_templates_fk";
  
  DROP INDEX "payload_locked_documents_rels_projects_id_idx";
  DROP INDEX "payload_locked_documents_rels_tasks_id_idx";
  DROP INDEX "payload_locked_documents_rels_templates_id_idx";
  ALTER TABLE "users" DROP COLUMN "weekly_hours";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "projects_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "tasks_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "templates_id";
  DROP TYPE "public"."enum_projects_status";
  DROP TYPE "public"."enum_tasks_stage";
  DROP TYPE "public"."enum_tasks_priority";
  DROP TYPE "public"."enum_templates_steps_priority";`)
}
