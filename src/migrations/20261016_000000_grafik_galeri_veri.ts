import { MigrateUpArgs } from '@payloadcms/db-postgres'
import { katalogGalerileri } from './data/katalog'

/** Grafik Tasarım galerisi v4 (katalog PSD'lerinden ambalaj, katalog, kimlik, logo). Şema değişikliği yok. */
export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  await katalogGalerileri(payload, req, ['grafik-tasarim'])
}

export async function down(): Promise<void> {
  /* İçerik güncellemesi geri alınmaz */
}
