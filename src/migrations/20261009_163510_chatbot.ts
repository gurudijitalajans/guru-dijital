import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_conversations_status" AS ENUM('bot', 'ekip', 'kapali');
  CREATE TYPE "public"."enum_chat_messages_role" AS ENUM('ziyaretci', 'bot', 'ekip', 'sistem');
  CREATE TYPE "public"."enum_chatbot_settings_model" AS ENUM('claude-haiku-5-5', 'claude-sonnet-5-5');
  CREATE TABLE "conversations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"name" varchar,
  	"email" varchar,
  	"phone" varchar,
  	"topic" varchar,
  	"page" varchar,
  	"last_text" varchar,
  	"status" "enum_conversations_status" DEFAULT 'bot' NOT NULL,
  	"needs_reply" boolean DEFAULT false,
  	"assignee_id" integer,
  	"contact_id" integer,
  	"lead_id" integer,
  	"booking_id" integer,
  	"last_message_at" timestamp(3) with time zone,
  	"handed_off_at" timestamp(3) with time zone,
  	"first_team_reply_at" timestamp(3) with time zone,
  	"visitor_messages" numeric DEFAULT 0,
  	"token" varchar,
  	"tenant_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "knowledge" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"content" varchar NOT NULL,
  	"active" boolean DEFAULT true,
  	"tenant_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "chat_messages" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"conversation_id" integer NOT NULL,
  	"role" "enum_chat_messages_role" DEFAULT 'ekip' NOT NULL,
  	"text" varchar NOT NULL,
  	"author_id" integer,
  	"unanswered" boolean DEFAULT false,
  	"tenant_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
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
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "conversations_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "knowledge_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "chat_messages_id" integer;
  ALTER TABLE "conversations" ADD CONSTRAINT "conversations_assignee_id_users_id_fk" FOREIGN KEY ("assignee_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "conversations" ADD CONSTRAINT "conversations_contact_id_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "conversations" ADD CONSTRAINT "conversations_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "conversations" ADD CONSTRAINT "conversations_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "conversations" ADD CONSTRAINT "conversations_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "knowledge" ADD CONSTRAINT "knowledge_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_conversation_id_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "chatbot_settings_suggestions" ADD CONSTRAINT "chatbot_settings_suggestions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."chatbot_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "chatbot_settings_canned_replies" ADD CONSTRAINT "chatbot_settings_canned_replies_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."chatbot_settings"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "conversations_topic_idx" ON "conversations" USING btree ("topic");
  CREATE INDEX "conversations_status_idx" ON "conversations" USING btree ("status");
  CREATE INDEX "conversations_needs_reply_idx" ON "conversations" USING btree ("needs_reply");
  CREATE INDEX "conversations_assignee_idx" ON "conversations" USING btree ("assignee_id");
  CREATE INDEX "conversations_contact_idx" ON "conversations" USING btree ("contact_id");
  CREATE INDEX "conversations_lead_idx" ON "conversations" USING btree ("lead_id");
  CREATE INDEX "conversations_booking_idx" ON "conversations" USING btree ("booking_id");
  CREATE INDEX "conversations_last_message_at_idx" ON "conversations" USING btree ("last_message_at");
  CREATE INDEX "conversations_token_idx" ON "conversations" USING btree ("token");
  CREATE INDEX "conversations_tenant_idx" ON "conversations" USING btree ("tenant_id");
  CREATE INDEX "conversations_updated_at_idx" ON "conversations" USING btree ("updated_at");
  CREATE INDEX "conversations_created_at_idx" ON "conversations" USING btree ("created_at");
  CREATE INDEX "knowledge_tenant_idx" ON "knowledge" USING btree ("tenant_id");
  CREATE INDEX "knowledge_updated_at_idx" ON "knowledge" USING btree ("updated_at");
  CREATE INDEX "knowledge_created_at_idx" ON "knowledge" USING btree ("created_at");
  CREATE INDEX "chat_messages_conversation_idx" ON "chat_messages" USING btree ("conversation_id");
  CREATE INDEX "chat_messages_author_idx" ON "chat_messages" USING btree ("author_id");
  CREATE INDEX "chat_messages_unanswered_idx" ON "chat_messages" USING btree ("unanswered");
  CREATE INDEX "chat_messages_tenant_idx" ON "chat_messages" USING btree ("tenant_id");
  CREATE INDEX "chat_messages_updated_at_idx" ON "chat_messages" USING btree ("updated_at");
  CREATE INDEX "chat_messages_created_at_idx" ON "chat_messages" USING btree ("created_at");
  CREATE INDEX "chatbot_settings_suggestions_order_idx" ON "chatbot_settings_suggestions" USING btree ("_order");
  CREATE INDEX "chatbot_settings_suggestions_parent_id_idx" ON "chatbot_settings_suggestions" USING btree ("_parent_id");
  CREATE INDEX "chatbot_settings_canned_replies_order_idx" ON "chatbot_settings_canned_replies" USING btree ("_order");
  CREATE INDEX "chatbot_settings_canned_replies_parent_id_idx" ON "chatbot_settings_canned_replies" USING btree ("_parent_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_conversations_fk" FOREIGN KEY ("conversations_id") REFERENCES "public"."conversations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_knowledge_fk" FOREIGN KEY ("knowledge_id") REFERENCES "public"."knowledge"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_chat_messages_fk" FOREIGN KEY ("chat_messages_id") REFERENCES "public"."chat_messages"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_conversations_id_idx" ON "payload_locked_documents_rels" USING btree ("conversations_id");
  CREATE INDEX "payload_locked_documents_rels_knowledge_id_idx" ON "payload_locked_documents_rels" USING btree ("knowledge_id");
  CREATE INDEX "payload_locked_documents_rels_chat_messages_id_idx" ON "payload_locked_documents_rels" USING btree ("chat_messages_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "conversations" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "knowledge" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "chat_messages" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "chatbot_settings_suggestions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "chatbot_settings_canned_replies" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "chatbot_settings" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "conversations" CASCADE;
  DROP TABLE "knowledge" CASCADE;
  DROP TABLE "chat_messages" CASCADE;
  DROP TABLE "chatbot_settings_suggestions" CASCADE;
  DROP TABLE "chatbot_settings_canned_replies" CASCADE;
  DROP TABLE "chatbot_settings" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_conversations_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_knowledge_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_chat_messages_fk";
  
  DROP INDEX "payload_locked_documents_rels_conversations_id_idx";
  DROP INDEX "payload_locked_documents_rels_knowledge_id_idx";
  DROP INDEX "payload_locked_documents_rels_chat_messages_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "conversations_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "knowledge_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "chat_messages_id";
  DROP TYPE "public"."enum_conversations_status";
  DROP TYPE "public"."enum_chat_messages_role";
  DROP TYPE "public"."enum_chatbot_settings_model";`)
}
