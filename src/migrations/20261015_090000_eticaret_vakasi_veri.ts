import { MigrateUpArgs } from '@payloadcms/db-postgres'
import { eticaretVakasi } from './data/eticaret-vakasi'

/** Dijital reklamın üçüncü vakası (giyim e-ticaret, ROAS 3,41 → 8,62). Şema değişikliği yok. */
export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  await eticaretVakasi(payload, req)
}

export async function down(): Promise<void> {
  /* İçerik güncellemesi geri alınmaz */
}
