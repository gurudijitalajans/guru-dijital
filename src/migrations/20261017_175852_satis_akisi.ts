import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "deals" ADD COLUMN "stage_changed_at" timestamp(3) with time zone;
  ALTER TABLE "quotes" ADD COLUMN "public_token" varchar;
  ALTER TABLE "quotes" ADD COLUMN "sent_at" timestamp(3) with time zone;
  ALTER TABLE "quotes" ADD COLUMN "viewed_at" timestamp(3) with time zone;
  ALTER TABLE "quotes" ADD COLUMN "responded_at" timestamp(3) with time zone;
  ALTER TABLE "quotes" ADD COLUMN "customer_note" varchar;
  ALTER TABLE "activities" ADD COLUMN "result" varchar;
  CREATE INDEX "deals_stage_changed_at_idx" ON "deals" USING btree ("stage_changed_at");
  CREATE INDEX "quotes_public_token_idx" ON "quotes" USING btree ("public_token");
  -- Mevcut fırsatların aşamaya giriş zamanı: son "Aşama:" kaydı, yoksa fırsatın açıldığı an
  UPDATE "deals" d SET "stage_changed_at" = COALESCE((SELECT max(a."created_at") FROM "activities" a WHERE a."deal_id" = d."id" AND a."title" LIKE 'Aşama:%'), d."created_at");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP INDEX "deals_stage_changed_at_idx";
  DROP INDEX "quotes_public_token_idx";
  ALTER TABLE "deals" DROP COLUMN "stage_changed_at";
  ALTER TABLE "quotes" DROP COLUMN "public_token";
  ALTER TABLE "quotes" DROP COLUMN "sent_at";
  ALTER TABLE "quotes" DROP COLUMN "viewed_at";
  ALTER TABLE "quotes" DROP COLUMN "responded_at";
  ALTER TABLE "quotes" DROP COLUMN "customer_note";
  ALTER TABLE "activities" DROP COLUMN "result";`)
}
