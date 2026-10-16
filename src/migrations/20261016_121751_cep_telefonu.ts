import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/** Site Ayarları > Cep telefonu (doğrudan arama); müşterinin verdiği numara ilk değer olarak yazılır */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "site_settings" ADD COLUMN "contact_mobile" varchar;`)
  await db.execute(sql`
   UPDATE "site_settings" SET "contact_mobile" = '+90 534 348 44 17' WHERE "contact_mobile" IS NULL;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "site_settings" DROP COLUMN "contact_mobile";`)
}
