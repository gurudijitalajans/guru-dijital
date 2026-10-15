import { MigrateUpArgs } from '@payloadcms/db-postgres'
import { katalogGalerileri } from './data/katalog'

/** Özel Yazılım galerisi v4 (Guru Panel'in gerçek ekranları, örnek veriyle). Şema değişikliği yok. */
export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  await katalogGalerileri(payload, req, ['ozel-yazilim'])
}

export async function down(): Promise<void> {
  /* İçerik güncellemesi geri alınmaz */
}
