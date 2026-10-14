import { MigrateUpArgs } from '@payloadcms/db-postgres'
import { dorduncuTur } from './data/dorduncu-tur'

/**
 * Dördüncü tur veri geçişi: sosyal medya görselleri yeni adla ve 50. referans
 * (Mavi Düşler). Şema değişikliği yok.
 * Ayrıntı: src/migrations/data/dorduncu-tur.ts. Tekrar çalışırsa kopya üretmez.
 */
export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  await dorduncuTur(payload, req)
}

export async function down(): Promise<void> {
  /* İçerik güncellemesi geri alınmaz */
}
