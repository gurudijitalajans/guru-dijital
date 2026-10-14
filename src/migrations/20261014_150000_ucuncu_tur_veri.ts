import { MigrateUpArgs } from '@payloadcms/db-postgres'
import { ucuncuTur } from './data/ucuncu-tur'

/**
 * Üçüncü tur veri geçişi: hizmet görselleri v3 (teslim edilen işler), 10 yeni
 * blog yazısı ve 20 yazının yeni kapakları. Şema değişikliği yok.
 * Ayrıntı: src/migrations/data/ucuncu-tur.ts. Tekrar çalışırsa kopya üretmez.
 */
export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  await ucuncuTur(payload, req)
}

export async function down(): Promise<void> {
  /* İçerik güncellemesi geri alınmaz */
}
