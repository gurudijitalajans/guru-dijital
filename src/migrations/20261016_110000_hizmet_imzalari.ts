import { MigrateUpArgs } from '@payloadcms/db-postgres'
import { galeriGorseliYenile } from './data/katalog'

/** Hizmet hero ve kapaklarında imza: g işareti yerine sitedeki hizmet karosu (yeni adla yüklenir, eskileri silinir). Şema değişikliği yok. */
const HIZMETLER = [
  'dijital-reklam-yonetimi',
  'web-tasarim',
  'seo',
  'ozel-yazilim',
  'mobil-uygulama',
  'marka-tescil',
  'e-ticaret-yonetimi',
  'grafik-tasarim',
  'sosyal-medya-yonetimi',
]

export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  for (const slug of HIZMETLER) {
    await galeriGorseliYenile(payload, req, slug, 'hero', 'gercek4-')
    await galeriGorseliYenile(payload, req, slug, 'kapak', 'gercek4-')
  }
}

export async function down(): Promise<void> {
  /* İçerik güncellemesi geri alınmaz */
}
