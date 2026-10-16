import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/*
 * Faz 3: işletme başına çalışma takvimi, kişi izinleri; randevu saati artık
 * sabit liste değil, takvimden gelir (bookings.time düz metin). Var olan her
 * işletmeye bugünkü davranışla aynı varsayılan takvim yazılır.
 */
export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_work_calendar_randevu_sure" AS ENUM('30', '45', '60', '90');
  CREATE TYPE "public"."enum_leaves_tur" AS ENUM('yillik', 'rapor', 'yarim', 'etkinlik', 'diger');
  CREATE TABLE "work_calendar_kapali_gunler" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"tarih" timestamp(3) with time zone NOT NULL,
  	"ad" varchar,
  	"yarim" boolean
  );
  
  CREATE TABLE "work_calendar_acik_gunler" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"tarih" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "work_calendar" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id" integer,
  	"hafta_pzt_acik" boolean DEFAULT true,
  	"hafta_pzt_bas" varchar DEFAULT '10:00',
  	"hafta_pzt_bit" varchar DEFAULT '17:00',
  	"hafta_pzt_ara_bas" varchar DEFAULT '12:00',
  	"hafta_pzt_ara_bit" varchar DEFAULT '13:00',
  	"hafta_sal_acik" boolean DEFAULT true,
  	"hafta_sal_bas" varchar DEFAULT '10:00',
  	"hafta_sal_bit" varchar DEFAULT '17:00',
  	"hafta_sal_ara_bas" varchar DEFAULT '12:00',
  	"hafta_sal_ara_bit" varchar DEFAULT '13:00',
  	"hafta_car_acik" boolean DEFAULT true,
  	"hafta_car_bas" varchar DEFAULT '10:00',
  	"hafta_car_bit" varchar DEFAULT '17:00',
  	"hafta_car_ara_bas" varchar DEFAULT '12:00',
  	"hafta_car_ara_bit" varchar DEFAULT '13:00',
  	"hafta_per_acik" boolean DEFAULT true,
  	"hafta_per_bas" varchar DEFAULT '10:00',
  	"hafta_per_bit" varchar DEFAULT '17:00',
  	"hafta_per_ara_bas" varchar DEFAULT '12:00',
  	"hafta_per_ara_bit" varchar DEFAULT '13:00',
  	"hafta_cum_acik" boolean DEFAULT true,
  	"hafta_cum_bas" varchar DEFAULT '10:00',
  	"hafta_cum_bit" varchar DEFAULT '17:00',
  	"hafta_cum_ara_bas" varchar DEFAULT '12:00',
  	"hafta_cum_ara_bit" varchar DEFAULT '13:00',
  	"hafta_cmt_acik" boolean DEFAULT false,
  	"hafta_cmt_bas" varchar DEFAULT '10:00',
  	"hafta_cmt_bit" varchar DEFAULT '17:00',
  	"hafta_cmt_ara_bas" varchar DEFAULT '12:00',
  	"hafta_cmt_ara_bit" varchar DEFAULT '13:00',
  	"hafta_paz_acik" boolean DEFAULT false,
  	"hafta_paz_bas" varchar DEFAULT '10:00',
  	"hafta_paz_bit" varchar DEFAULT '17:00',
  	"hafta_paz_ara_bas" varchar DEFAULT '12:00',
  	"hafta_paz_ara_bit" varchar DEFAULT '13:00',
  	"randevu_sure" "enum_work_calendar_randevu_sure" DEFAULT '60',
  	"randevu_tampon" numeric DEFAULT 0,
  	"randevu_en_erken_saat" numeric DEFAULT 12,
  	"randevu_en_gec_gun" numeric DEFAULT 14,
  	"resmi_tatiller" boolean DEFAULT true,
  	"arife_yarim" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "leaves" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id" integer,
  	"kisi_id" integer NOT NULL,
  	"baslangic" timestamp(3) with time zone NOT NULL,
  	"bitis" timestamp(3) with time zone NOT NULL,
  	"tur" "enum_leaves_tur" DEFAULT 'yillik',
  	"not" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "bookings" ALTER COLUMN "time" SET DATA TYPE varchar;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "work_calendar_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "leaves_id" integer;
  ALTER TABLE "work_calendar_kapali_gunler" ADD CONSTRAINT "work_calendar_kapali_gunler_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."work_calendar"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "work_calendar_acik_gunler" ADD CONSTRAINT "work_calendar_acik_gunler_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."work_calendar"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "work_calendar" ADD CONSTRAINT "work_calendar_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "leaves" ADD CONSTRAINT "leaves_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "leaves" ADD CONSTRAINT "leaves_kisi_id_users_id_fk" FOREIGN KEY ("kisi_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "work_calendar_kapali_gunler_order_idx" ON "work_calendar_kapali_gunler" USING btree ("_order");
  CREATE INDEX "work_calendar_kapali_gunler_parent_id_idx" ON "work_calendar_kapali_gunler" USING btree ("_parent_id");
  CREATE INDEX "work_calendar_acik_gunler_order_idx" ON "work_calendar_acik_gunler" USING btree ("_order");
  CREATE INDEX "work_calendar_acik_gunler_parent_id_idx" ON "work_calendar_acik_gunler" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "work_calendar_tenant_idx" ON "work_calendar" USING btree ("tenant_id");
  CREATE INDEX "work_calendar_updated_at_idx" ON "work_calendar" USING btree ("updated_at");
  CREATE INDEX "work_calendar_created_at_idx" ON "work_calendar" USING btree ("created_at");
  CREATE INDEX "leaves_tenant_idx" ON "leaves" USING btree ("tenant_id");
  CREATE INDEX "leaves_kisi_idx" ON "leaves" USING btree ("kisi_id");
  CREATE INDEX "leaves_updated_at_idx" ON "leaves" USING btree ("updated_at");
  CREATE INDEX "leaves_created_at_idx" ON "leaves" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_work_calendar_fk" FOREIGN KEY ("work_calendar_id") REFERENCES "public"."work_calendar"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_leaves_fk" FOREIGN KEY ("leaves_id") REFERENCES "public"."leaves"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_work_calendar_id_idx" ON "payload_locked_documents_rels" USING btree ("work_calendar_id");
  CREATE INDEX "payload_locked_documents_rels_leaves_id_idx" ON "payload_locked_documents_rels" USING btree ("leaves_id");
  DROP TYPE "public"."enum_bookings_time";`)
  const tenants = await payload.find({ collection: 'tenants', limit: 1000, depth: 0, pagination: false, req, overrideAccess: true })
  for (const t of tenants.docs) {
    const has = await payload.find({ collection: 'work-calendar', where: { tenant: { equals: t.id } }, limit: 1, depth: 0, req, overrideAccess: true })
    if (!has.docs.length) await payload.create({ collection: 'work-calendar', data: { tenant: t.id } as never, req, overrideAccess: true })
  }
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_bookings_time" AS ENUM('10:00', '11:00', '13:00', '14:00', '15:00', '16:00');
  ALTER TABLE "work_calendar_kapali_gunler" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "work_calendar_acik_gunler" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "work_calendar" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "leaves" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "work_calendar_kapali_gunler" CASCADE;
  DROP TABLE "work_calendar_acik_gunler" CASCADE;
  DROP TABLE "work_calendar" CASCADE;
  DROP TABLE "leaves" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_work_calendar_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_leaves_fk";
  
  DROP INDEX "payload_locked_documents_rels_work_calendar_id_idx";
  DROP INDEX "payload_locked_documents_rels_leaves_id_idx";
  ALTER TABLE "bookings" ALTER COLUMN "time" SET DATA TYPE "public"."enum_bookings_time" USING "time"::"public"."enum_bookings_time";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "work_calendar_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "leaves_id";
  DROP TYPE "public"."enum_work_calendar_randevu_sure";
  DROP TYPE "public"."enum_leaves_tur";`)
}
