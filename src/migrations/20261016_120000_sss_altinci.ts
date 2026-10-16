import { MigrateUpArgs } from '@payloadcms/db-postgres'
import { sssTamamla } from './data/sss-altinci'

/** Beş sorusu olan hizmetlere altıncı soru eklenir (SSS ızgarası üçer satır dolar). Şema değişikliği yok. */
export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  await sssTamamla(payload, req)
}

export async function down(): Promise<void> {
  /* İçerik güncellemesi geri alınmaz */
}
