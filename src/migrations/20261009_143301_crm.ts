import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'
import { backfillCrm } from '../payload/crm/backfill'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_deals_stage" AS ENUM('aday', 'gorusme', 'teklif', 'kazanildi', 'kaybedildi');
  CREATE TYPE "public"."enum_contacts_source" AS ENUM('form', 'randevu', 'chatbot', 'referans', 'manuel');
  CREATE TYPE "public"."enum_quotes_items_vat_rate" AS ENUM('20', '10', '1', '0');
  CREATE TYPE "public"."enum_quotes_status" AS ENUM('taslak', 'gonderildi', 'kabul', 'red');
  CREATE TYPE "public"."enum_activities_type" AS ENUM('not', 'arama', 'eposta', 'toplanti', 'gorev', 'sistem');
  CREATE TABLE "deals" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"contact_id" integer,
  	"company_id" integer,
  	"value" numeric,
  	"expected_close" timestamp(3) with time zone,
  	"service" varchar,
  	"lost_reason" varchar,
  	"notes" varchar,
  	"stage" "enum_deals_stage" DEFAULT 'aday' NOT NULL,
  	"owner_id" integer,
  	"lead_id" integer,
  	"closed_at" timestamp(3) with time zone,
  	"order" numeric,
  	"tenant_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "contacts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"title" varchar,
  	"email" varchar,
  	"phone" varchar,
  	"company_id" integer,
  	"notes" varchar,
  	"source" "enum_contacts_source" DEFAULT 'manuel',
  	"owner_id" integer,
  	"tenant_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "contacts_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "companies" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"sector" varchar,
  	"website" varchar,
  	"phone" varchar,
  	"email" varchar,
  	"address" varchar,
  	"tax_office" varchar,
  	"tax_number" varchar,
  	"notes" varchar,
  	"owner_id" integer,
  	"tenant_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "quotes_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"description" varchar NOT NULL,
  	"qty" numeric DEFAULT 1 NOT NULL,
  	"unit" varchar DEFAULT 'Adet',
  	"unit_price" numeric NOT NULL,
  	"vat_rate" "enum_quotes_items_vat_rate" DEFAULT '20' NOT NULL
  );
  
  CREATE TABLE "quotes" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"deal_id" integer,
  	"contact_id" integer,
  	"company_id" integer,
  	"notes" varchar,
  	"terms" varchar DEFAULT 'Bu teklif geçerlilik tarihine kadar geçerlidir. Ödeme ve teslim koşulları sözleşmede netleşir.',
  	"number" varchar,
  	"status" "enum_quotes_status" DEFAULT 'taslak' NOT NULL,
  	"issue_date" timestamp(3) with time zone,
  	"valid_until" timestamp(3) with time zone,
  	"subtotal" numeric,
  	"vat_total" numeric,
  	"total" numeric,
  	"owner_id" integer,
  	"tenant_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "activities" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"type" "enum_activities_type" DEFAULT 'not' NOT NULL,
  	"title" varchar NOT NULL,
  	"body" varchar,
  	"due_at" timestamp(3) with time zone,
  	"done" boolean DEFAULT false,
  	"deal_id" integer,
  	"contact_id" integer,
  	"company_id" integer,
  	"booking_id" integer,
  	"owner_id" integer,
  	"tenant_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "tenants" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "leads" ADD COLUMN "contact_id" integer;
  ALTER TABLE "leads" ADD COLUMN "deal_id" integer;
  ALTER TABLE "bookings" ADD COLUMN "contact_id" integer;
  ALTER TABLE "bookings" ADD COLUMN "deal_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "deals_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "contacts_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "companies_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "quotes_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "activities_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "tenants_id" integer;
  ALTER TABLE "deals" ADD CONSTRAINT "deals_contact_id_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "deals" ADD CONSTRAINT "deals_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "deals" ADD CONSTRAINT "deals_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "deals" ADD CONSTRAINT "deals_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "deals" ADD CONSTRAINT "deals_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "contacts" ADD CONSTRAINT "contacts_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "contacts" ADD CONSTRAINT "contacts_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "contacts" ADD CONSTRAINT "contacts_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "contacts_texts" ADD CONSTRAINT "contacts_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."contacts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "companies" ADD CONSTRAINT "companies_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "companies" ADD CONSTRAINT "companies_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "quotes_items" ADD CONSTRAINT "quotes_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."quotes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "quotes" ADD CONSTRAINT "quotes_deal_id_deals_id_fk" FOREIGN KEY ("deal_id") REFERENCES "public"."deals"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "quotes" ADD CONSTRAINT "quotes_contact_id_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "quotes" ADD CONSTRAINT "quotes_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "quotes" ADD CONSTRAINT "quotes_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "quotes" ADD CONSTRAINT "quotes_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "activities" ADD CONSTRAINT "activities_deal_id_deals_id_fk" FOREIGN KEY ("deal_id") REFERENCES "public"."deals"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "activities" ADD CONSTRAINT "activities_contact_id_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "activities" ADD CONSTRAINT "activities_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "activities" ADD CONSTRAINT "activities_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "activities" ADD CONSTRAINT "activities_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "activities" ADD CONSTRAINT "activities_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "deals_contact_idx" ON "deals" USING btree ("contact_id");
  CREATE INDEX "deals_company_idx" ON "deals" USING btree ("company_id");
  CREATE INDEX "deals_stage_idx" ON "deals" USING btree ("stage");
  CREATE INDEX "deals_owner_idx" ON "deals" USING btree ("owner_id");
  CREATE INDEX "deals_lead_idx" ON "deals" USING btree ("lead_id");
  CREATE INDEX "deals_tenant_idx" ON "deals" USING btree ("tenant_id");
  CREATE INDEX "deals_updated_at_idx" ON "deals" USING btree ("updated_at");
  CREATE INDEX "deals_created_at_idx" ON "deals" USING btree ("created_at");
  CREATE INDEX "contacts_email_idx" ON "contacts" USING btree ("email");
  CREATE INDEX "contacts_company_idx" ON "contacts" USING btree ("company_id");
  CREATE INDEX "contacts_owner_idx" ON "contacts" USING btree ("owner_id");
  CREATE INDEX "contacts_tenant_idx" ON "contacts" USING btree ("tenant_id");
  CREATE INDEX "contacts_updated_at_idx" ON "contacts" USING btree ("updated_at");
  CREATE INDEX "contacts_created_at_idx" ON "contacts" USING btree ("created_at");
  CREATE INDEX "contacts_texts_order_parent" ON "contacts_texts" USING btree ("order","parent_id");
  CREATE INDEX "companies_owner_idx" ON "companies" USING btree ("owner_id");
  CREATE INDEX "companies_tenant_idx" ON "companies" USING btree ("tenant_id");
  CREATE INDEX "companies_updated_at_idx" ON "companies" USING btree ("updated_at");
  CREATE INDEX "companies_created_at_idx" ON "companies" USING btree ("created_at");
  CREATE INDEX "quotes_items_order_idx" ON "quotes_items" USING btree ("_order");
  CREATE INDEX "quotes_items_parent_id_idx" ON "quotes_items" USING btree ("_parent_id");
  CREATE INDEX "quotes_deal_idx" ON "quotes" USING btree ("deal_id");
  CREATE INDEX "quotes_contact_idx" ON "quotes" USING btree ("contact_id");
  CREATE INDEX "quotes_company_idx" ON "quotes" USING btree ("company_id");
  CREATE UNIQUE INDEX "quotes_number_idx" ON "quotes" USING btree ("number");
  CREATE INDEX "quotes_owner_idx" ON "quotes" USING btree ("owner_id");
  CREATE INDEX "quotes_tenant_idx" ON "quotes" USING btree ("tenant_id");
  CREATE INDEX "quotes_updated_at_idx" ON "quotes" USING btree ("updated_at");
  CREATE INDEX "quotes_created_at_idx" ON "quotes" USING btree ("created_at");
  CREATE INDEX "activities_due_at_idx" ON "activities" USING btree ("due_at");
  CREATE INDEX "activities_done_idx" ON "activities" USING btree ("done");
  CREATE INDEX "activities_deal_idx" ON "activities" USING btree ("deal_id");
  CREATE INDEX "activities_contact_idx" ON "activities" USING btree ("contact_id");
  CREATE INDEX "activities_company_idx" ON "activities" USING btree ("company_id");
  CREATE INDEX "activities_booking_idx" ON "activities" USING btree ("booking_id");
  CREATE INDEX "activities_owner_idx" ON "activities" USING btree ("owner_id");
  CREATE INDEX "activities_tenant_idx" ON "activities" USING btree ("tenant_id");
  CREATE INDEX "activities_updated_at_idx" ON "activities" USING btree ("updated_at");
  CREATE INDEX "activities_created_at_idx" ON "activities" USING btree ("created_at");
  CREATE UNIQUE INDEX "tenants_slug_idx" ON "tenants" USING btree ("slug");
  CREATE INDEX "tenants_updated_at_idx" ON "tenants" USING btree ("updated_at");
  CREATE INDEX "tenants_created_at_idx" ON "tenants" USING btree ("created_at");
  ALTER TABLE "leads" ADD CONSTRAINT "leads_contact_id_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "leads" ADD CONSTRAINT "leads_deal_id_deals_id_fk" FOREIGN KEY ("deal_id") REFERENCES "public"."deals"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "bookings" ADD CONSTRAINT "bookings_contact_id_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "bookings" ADD CONSTRAINT "bookings_deal_id_deals_id_fk" FOREIGN KEY ("deal_id") REFERENCES "public"."deals"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_deals_fk" FOREIGN KEY ("deals_id") REFERENCES "public"."deals"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_contacts_fk" FOREIGN KEY ("contacts_id") REFERENCES "public"."contacts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_companies_fk" FOREIGN KEY ("companies_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_quotes_fk" FOREIGN KEY ("quotes_id") REFERENCES "public"."quotes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_activities_fk" FOREIGN KEY ("activities_id") REFERENCES "public"."activities"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_tenants_fk" FOREIGN KEY ("tenants_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "leads_contact_idx" ON "leads" USING btree ("contact_id");
  CREATE INDEX "leads_deal_idx" ON "leads" USING btree ("deal_id");
  CREATE INDEX "bookings_contact_idx" ON "bookings" USING btree ("contact_id");
  CREATE INDEX "bookings_deal_idx" ON "bookings" USING btree ("deal_id");
  CREATE INDEX "payload_locked_documents_rels_deals_id_idx" ON "payload_locked_documents_rels" USING btree ("deals_id");
  CREATE INDEX "payload_locked_documents_rels_contacts_id_idx" ON "payload_locked_documents_rels" USING btree ("contacts_id");
  CREATE INDEX "payload_locked_documents_rels_companies_id_idx" ON "payload_locked_documents_rels" USING btree ("companies_id");
  CREATE INDEX "payload_locked_documents_rels_quotes_id_idx" ON "payload_locked_documents_rels" USING btree ("quotes_id");
  CREATE INDEX "payload_locked_documents_rels_activities_id_idx" ON "payload_locked_documents_rels" USING btree ("activities_id");
  CREATE INDEX "payload_locked_documents_rels_tenants_id_idx" ON "payload_locked_documents_rels" USING btree ("tenants_id");`)

  /* CRM'den önce gelmiş talep ve randevular: kişi, fırsat, görev ve toplantı kaydı */
  const res = await backfillCrm(payload, req)
  payload.logger.info(`CRM aktarımı: ${res.leads} talep, ${res.bookings} randevu`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "deals" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "contacts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "contacts_texts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "companies" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "quotes_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "quotes" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "activities" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "tenants" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "deals" CASCADE;
  DROP TABLE "contacts" CASCADE;
  DROP TABLE "contacts_texts" CASCADE;
  DROP TABLE "companies" CASCADE;
  DROP TABLE "quotes_items" CASCADE;
  DROP TABLE "quotes" CASCADE;
  DROP TABLE "activities" CASCADE;
  DROP TABLE "tenants" CASCADE;
  ALTER TABLE "leads" DROP CONSTRAINT "leads_contact_id_contacts_id_fk";
  
  ALTER TABLE "leads" DROP CONSTRAINT "leads_deal_id_deals_id_fk";
  
  ALTER TABLE "bookings" DROP CONSTRAINT "bookings_contact_id_contacts_id_fk";
  
  ALTER TABLE "bookings" DROP CONSTRAINT "bookings_deal_id_deals_id_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_deals_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_contacts_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_companies_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_quotes_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_activities_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_tenants_fk";
  
  DROP INDEX "leads_contact_idx";
  DROP INDEX "leads_deal_idx";
  DROP INDEX "bookings_contact_idx";
  DROP INDEX "bookings_deal_idx";
  DROP INDEX "payload_locked_documents_rels_deals_id_idx";
  DROP INDEX "payload_locked_documents_rels_contacts_id_idx";
  DROP INDEX "payload_locked_documents_rels_companies_id_idx";
  DROP INDEX "payload_locked_documents_rels_quotes_id_idx";
  DROP INDEX "payload_locked_documents_rels_activities_id_idx";
  DROP INDEX "payload_locked_documents_rels_tenants_id_idx";
  ALTER TABLE "leads" DROP COLUMN "contact_id";
  ALTER TABLE "leads" DROP COLUMN "deal_id";
  ALTER TABLE "bookings" DROP COLUMN "contact_id";
  ALTER TABLE "bookings" DROP COLUMN "deal_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "deals_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "contacts_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "companies_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "quotes_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "activities_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "tenants_id";
  DROP TYPE "public"."enum_deals_stage";
  DROP TYPE "public"."enum_contacts_source";
  DROP TYPE "public"."enum_quotes_items_vat_rate";
  DROP TYPE "public"."enum_quotes_status";
  DROP TYPE "public"."enum_activities_type";`)
}
