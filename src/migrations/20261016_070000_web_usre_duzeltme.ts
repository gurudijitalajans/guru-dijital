import { MigrateUpArgs } from '@payloadcms/db-postgres'
import { galeriGorseliYenile } from './data/katalog'

/** Web Tasarım galerisi: usreokullari.com karosu yeniden çekildi (açılış slaytı boş görünüyordu). Şema değişikliği yok. */
export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  await galeriGorseliYenile(payload, req, 'web-tasarim', '5', 'gercek2-')
}

export async function down(): Promise<void> {
  /* İçerik güncellemesi geri alınmaz */
}
