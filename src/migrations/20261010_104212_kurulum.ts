import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_contacts_source" ADD VALUE 'aktarim';
  ALTER TABLE "users" ADD COLUMN "invite_pending" boolean DEFAULT false;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "contacts" ALTER COLUMN "source" SET DATA TYPE text;
  ALTER TABLE "contacts" ALTER COLUMN "source" SET DEFAULT 'manuel'::text;
  DROP TYPE "public"."enum_contacts_source";
  CREATE TYPE "public"."enum_contacts_source" AS ENUM('form', 'randevu', 'chatbot', 'referans', 'manuel');
  ALTER TABLE "contacts" ALTER COLUMN "source" SET DEFAULT 'manuel'::"public"."enum_contacts_source";
  ALTER TABLE "contacts" ALTER COLUMN "source" SET DATA TYPE "public"."enum_contacts_source" USING "source"::"public"."enum_contacts_source";
  ALTER TABLE "users" DROP COLUMN "invite_pending";`)
}
