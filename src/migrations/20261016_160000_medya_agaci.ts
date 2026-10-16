import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres'
import { medyaAgaci } from './data/medya-agaci'

/* Medya kütüphanesi kullanım yerine göre klasör ağacına (yalnız klasör alanı değişir) */
export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  await medyaAgaci(payload, req, (s) => payload.logger.info(s))
}

export async function down(_: MigrateDownArgs): Promise<void> {
  /* Geri alınmaz: klasör düzeni panelden değiştirilebilir */
}
