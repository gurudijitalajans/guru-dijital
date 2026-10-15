import { MigrateUpArgs } from '@payloadcms/db-postgres'
import { katalogGalerileri } from './data/katalog'

/** Dijital Reklam galerisi v4 (gerçek reklam kreatifleri ve vaka rakamları). Şema değişikliği yok. */
export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  await katalogGalerileri(payload, req, ['dijital-reklam-yonetimi'])
}

export async function down(): Promise<void> {
  /* İçerik güncellemesi geri alınmaz */
}
