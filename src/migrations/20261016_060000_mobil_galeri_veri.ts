import { MigrateUpArgs } from '@payloadcms/db-postgres'
import { katalogGalerileri } from './data/katalog'

/** Mobil Uygulama galerisi v4 (Guru Panel'in gerçek mobil ekranları; ana ekran ve mağaza sayfaları temsili). Şema değişikliği yok. */
export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  await katalogGalerileri(payload, req, ['mobil-uygulama'])
}

export async function down(): Promise<void> {
  /* İçerik güncellemesi geri alınmaz */
}
