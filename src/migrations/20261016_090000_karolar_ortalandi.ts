import { MigrateUpArgs } from '@payloadcms/db-postgres'
import { galeriGorseliYenile } from './data/katalog'

/** İçeriği kayık duran karolar ortalandı (yeni adla yüklenir, eskileri silinir). Şema değişikliği yok. */
const KAROLAR: [string, string][] = [
  ['dijital-reklam-yonetimi', '2'],
  ['dijital-reklam-yonetimi', '3'],
  ['e-ticaret-yonetimi', '2'],
  ['e-ticaret-yonetimi', '4'],
  ['grafik-tasarim', '1'],
  ['grafik-tasarim', '4'],
  ['grafik-tasarim', '6'],
  ['mobil-uygulama', '2'],
  ['mobil-uygulama', '5'],
  ['seo', '4'],
]

export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  for (const [slug, key] of KAROLAR) await galeriGorseliYenile(payload, req, slug, key, 'gercek3-')
}

export async function down(): Promise<void> {
  /* İçerik güncellemesi geri alınmaz */
}
