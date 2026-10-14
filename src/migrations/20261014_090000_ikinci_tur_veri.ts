import { MigrateUpArgs } from '@payloadcms/db-postgres'
import { ikinciTur } from './data/ikinci-tur'

/**
 * İkinci tur veri geçişi (şema bir önceki geçişte): "Grow with Guru",
 * logosuz referansların çıkarılması, vakaların hizmetlere bağlanması, ürün
 * görsellerinin yeni adla yüklenmesi (önbellek), hizmet görselleri v2.
 * Ayrıntı: src/migrations/data/ikinci-tur.ts. Tekrar çalışırsa kopya üretmez.
 */
export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  await ikinciTur(payload, req)
}

export async function down(): Promise<void> {
  /* İçerik güncellemesi geri alınmaz */
}
