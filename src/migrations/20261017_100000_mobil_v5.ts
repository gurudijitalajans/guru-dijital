import { MigrateUpArgs } from '@payloadcms/db-postgres'
import { galeriGorseliYenile } from './data/katalog'

/** Mobil Uygulama galerisi v5: Guru Panel yerine markasız örnek uygulama, iki mağaza ve süreç (yeni adla, eskileri silinir). Şema değişikliği yok. */
export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  for (const key of ['hero', 'kapak', '1', '2', '3', '4', '5', '6']) await galeriGorseliYenile(payload, req, 'mobil-uygulama', key, 'gercek5-')
}

export async function down(): Promise<void> {
  /* İçerik güncellemesi geri alınmaz */
}
