import { MigrateUpArgs } from '@payloadcms/db-postgres'
import { galeriGorseliYenile } from './data/katalog'

/** Mobil Uygulama galerisi v7: kapakta ışık ve sis, 2. karede ekran yansıması düzeltildi (hero, kapak, 2; yeni adla, eskileri silinir). Şema değişikliği yok. */
export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  for (const key of ['hero', 'kapak', '2']) await galeriGorseliYenile(payload, req, 'mobil-uygulama', key, 'gercek7-')
}

export async function down(): Promise<void> {
  /* İçerik güncellemesi geri alınmaz */
}
