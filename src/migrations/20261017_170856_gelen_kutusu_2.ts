import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_chat_messages_role" ADD VALUE 'not';
  ALTER TABLE "leads" ADD COLUMN "snoozed_until" timestamp(3) with time zone;
  ALTER TABLE "leads" ADD COLUMN "spam" boolean DEFAULT false;
  ALTER TABLE "activities" ADD COLUMN "lead_id" integer;
  ALTER TABLE "conversations" ADD COLUMN "snoozed_until" timestamp(3) with time zone;
  ALTER TABLE "conversations" ADD COLUMN "spam" boolean DEFAULT false;
  ALTER TABLE "chat_messages" ADD COLUMN "delivery_error" varchar;
  ALTER TABLE "users" ADD COLUMN "notify_prefs_talep_panel" boolean DEFAULT true;
  ALTER TABLE "users" ADD COLUMN "notify_prefs_talep_eposta" boolean DEFAULT true;
  ALTER TABLE "users" ADD COLUMN "notify_prefs_randevu_panel" boolean DEFAULT true;
  ALTER TABLE "users" ADD COLUMN "notify_prefs_randevu_eposta" boolean DEFAULT true;
  ALTER TABLE "users" ADD COLUMN "notify_prefs_sohbet_panel" boolean DEFAULT true;
  ALTER TABLE "users" ADD COLUMN "notify_prefs_sohbet_eposta" boolean DEFAULT true;
  ALTER TABLE "users" ADD COLUMN "notify_prefs_gorev_panel" boolean DEFAULT true;
  ALTER TABLE "users" ADD COLUMN "notify_prefs_gorev_eposta" boolean DEFAULT true;
  ALTER TABLE "users" ADD COLUMN "notify_prefs_kontrol_panel" boolean DEFAULT true;
  ALTER TABLE "users" ADD COLUMN "notify_prefs_kontrol_eposta" boolean DEFAULT true;
  ALTER TABLE "users" ADD COLUMN "notify_prefs_bahsetme_panel" boolean DEFAULT true;
  ALTER TABLE "users" ADD COLUMN "notify_prefs_bahsetme_eposta" boolean DEFAULT true;
  ALTER TABLE "notifications" ADD COLUMN "count" numeric DEFAULT 1;
  ALTER TABLE "activities" ADD CONSTRAINT "activities_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "leads_snoozed_until_idx" ON "leads" USING btree ("snoozed_until");
  CREATE INDEX "leads_spam_idx" ON "leads" USING btree ("spam");
  CREATE INDEX "activities_lead_idx" ON "activities" USING btree ("lead_id");
  CREATE INDEX "conversations_snoozed_until_idx" ON "conversations" USING btree ("snoozed_until");
  CREATE INDEX "conversations_spam_idx" ON "conversations" USING btree ("spam");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "activities" DROP CONSTRAINT "activities_lead_id_leads_id_fk";
  
  ALTER TABLE "chat_messages" ALTER COLUMN "role" SET DATA TYPE text;
  ALTER TABLE "chat_messages" ALTER COLUMN "role" SET DEFAULT 'ekip'::text;
  DROP TYPE "public"."enum_chat_messages_role";
  CREATE TYPE "public"."enum_chat_messages_role" AS ENUM('ziyaretci', 'bot', 'ekip', 'sistem');
  ALTER TABLE "chat_messages" ALTER COLUMN "role" SET DEFAULT 'ekip'::"public"."enum_chat_messages_role";
  ALTER TABLE "chat_messages" ALTER COLUMN "role" SET DATA TYPE "public"."enum_chat_messages_role" USING "role"::"public"."enum_chat_messages_role";
  DROP INDEX "leads_snoozed_until_idx";
  DROP INDEX "leads_spam_idx";
  DROP INDEX "activities_lead_idx";
  DROP INDEX "conversations_snoozed_until_idx";
  DROP INDEX "conversations_spam_idx";
  ALTER TABLE "leads" DROP COLUMN "snoozed_until";
  ALTER TABLE "leads" DROP COLUMN "spam";
  ALTER TABLE "activities" DROP COLUMN "lead_id";
  ALTER TABLE "conversations" DROP COLUMN "snoozed_until";
  ALTER TABLE "conversations" DROP COLUMN "spam";
  ALTER TABLE "chat_messages" DROP COLUMN "delivery_error";
  ALTER TABLE "users" DROP COLUMN "notify_prefs_talep_panel";
  ALTER TABLE "users" DROP COLUMN "notify_prefs_talep_eposta";
  ALTER TABLE "users" DROP COLUMN "notify_prefs_randevu_panel";
  ALTER TABLE "users" DROP COLUMN "notify_prefs_randevu_eposta";
  ALTER TABLE "users" DROP COLUMN "notify_prefs_sohbet_panel";
  ALTER TABLE "users" DROP COLUMN "notify_prefs_sohbet_eposta";
  ALTER TABLE "users" DROP COLUMN "notify_prefs_gorev_panel";
  ALTER TABLE "users" DROP COLUMN "notify_prefs_gorev_eposta";
  ALTER TABLE "users" DROP COLUMN "notify_prefs_kontrol_panel";
  ALTER TABLE "users" DROP COLUMN "notify_prefs_kontrol_eposta";
  ALTER TABLE "users" DROP COLUMN "notify_prefs_bahsetme_panel";
  ALTER TABLE "users" DROP COLUMN "notify_prefs_bahsetme_eposta";
  ALTER TABLE "notifications" DROP COLUMN "count";`)
}
