import { MigrateUpArgs } from '@payloadcms/db-postgres'
import { katalogGalerileri } from './data/katalog'

/** SEO galerisi v4 (SEO vakalarının rakamları, sitelerin gerçek arama sonucu görünümü). Şema değişikliği yok. */
export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  await katalogGalerileri(payload, req, ['seo'])
}

export async function down(): Promise<void> {
  /* İçerik güncellemesi geri alınmaz */
}
