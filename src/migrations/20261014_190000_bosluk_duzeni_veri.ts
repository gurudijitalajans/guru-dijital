import { MigrateUpArgs } from '@payloadcms/db-postgres'
import { boslukDuzeni } from './data/bosluk-duzeni'

/**
 * Duyuru bandının iki uzun cümlesi telefonda tek satıra sığacak kadar
 * kısaltılır (panelden değiştirilmişse dokunulmaz). Şema değişikliği yok.
 */
export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  await boslukDuzeni(payload, req)
}

export async function down(): Promise<void> {
  /* İçerik güncellemesi geri alınmaz */
}
