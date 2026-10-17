import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/*
 * Pano sırası: eski fırsat ve görevlerde "order" boştu; boş sıra sona dizildiği için
 * sürüklenen kart bırakıldığı yere değil sütunun başına düşüyordu. Her sütun bugünkü
 * görünüm sırasıyla (fırsatta son güncellenen, görevde teslim tarihi önce) 1, 2, 3… olarak
 * numaralanır. Yeni kayıtlar artık oluşturulurken sıra alır.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  UPDATE "deals" d SET "order" = s.rn FROM (
    SELECT id, row_number() OVER (PARTITION BY tenant_id, stage ORDER BY "order" ASC NULLS LAST, updated_at DESC) AS rn FROM "deals"
  ) s WHERE d.id = s.id;
  UPDATE "tasks" t SET "order" = s.rn FROM (
    SELECT id, row_number() OVER (PARTITION BY tenant_id, stage ORDER BY "order" ASC NULLS LAST, due_date ASC NULLS LAST) AS rn FROM "tasks"
  ) s WHERE t.id = s.id;
  `)
}

export async function down(_: MigrateDownArgs): Promise<void> {
  /* Sıra numaraları zararsız; geri almada dokunulmaz */
}
