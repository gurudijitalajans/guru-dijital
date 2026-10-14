import { MigrateUpArgs } from '@payloadcms/db-postgres'
import { buyukGuncelleme } from './data/buyuk-guncelleme'

/**
 * Veri geçişi (şema bir önceki geçişte): 9 hizmet, 49 referans logosu, SEO
 * hikâyeleri, ekip, 10 blog yazısı, hizmet şablonları, iletişim bilgileri,
 * duyuru cümleleri, ürün görselleri ve medya klasörleri. Ayrıntı:
 * src/migrations/data/buyuk-guncelleme.ts. Tekrar çalışırsa kopya üretmez.
 */
export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  await buyukGuncelleme(payload, req)
}

export async function down(): Promise<void> {
  /* İçerik güncellemesi geri alınmaz: panelde elle düzenlenmiş olabilir */
}
