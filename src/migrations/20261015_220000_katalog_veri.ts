import { MigrateUpArgs } from '@payloadcms/db-postgres'
import { katalog } from './data/katalog'

/** Gerçek iş görselleri: ödül kartları, Web Tasarım ve Sosyal Medya galerileri (v4). Şema değişikliği yok. */
export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  await katalog(payload, req)
}

export async function down(): Promise<void> {
  /* İçerik güncellemesi geri alınmaz */
}
