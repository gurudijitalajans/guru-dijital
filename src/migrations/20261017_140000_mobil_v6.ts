import { MigrateUpArgs } from '@payloadcms/db-postgres'
import { galeriGorseliYenile } from './data/katalog'

/** Mobil Uygulama galerisi v6: Blender'da 3B iPhone ve Android (hero, kapak, 1, 2, 5; yeni adla, eskileri silinir). Şema değişikliği yok. */
export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  for (const key of ['hero', 'kapak', '1', '2', '5']) await galeriGorseliYenile(payload, req, 'mobil-uygulama', key, 'gercek6-')
}

export async function down(): Promise<void> {
  /* İçerik güncellemesi geri alınmaz */
}
