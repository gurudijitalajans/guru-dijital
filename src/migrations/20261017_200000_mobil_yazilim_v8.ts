import { MigrateUpArgs } from '@payloadcms/db-postgres'
import { galeriGorseliYenile } from './data/katalog'

/**
 * Mobil Uygulama ve Özel Yazılım galerileri hizmet galerilerinin diline döner (düz cihaz çerçeveleri, beyaz
 * başlık kartı). Özel Yazılım'da Guru Panel yerine markasız örnek panel. Yeni adla, eskileri silinir; şema değişikliği yok.
 */
export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  for (const slug of ['mobil-uygulama', 'ozel-yazilim'])
    for (const key of ['hero', 'kapak', '1', '2', '3', '4', '5', '6']) await galeriGorseliYenile(payload, req, slug, key, 'gercek8-')
}

export async function down(): Promise<void> {
  /* İçerik güncellemesi geri alınmaz */
}
