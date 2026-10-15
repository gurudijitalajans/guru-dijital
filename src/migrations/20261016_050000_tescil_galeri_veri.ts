import { MigrateUpArgs } from '@payloadcms/db-postgres'
import { katalogGalerileri } from './data/katalog'

/** Marka Tescil galerisi v4 (3D kum saati, SMK'ya dayalı süreç bilgileri, kampanya gönderisi). Şema değişikliği yok. */
export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  await katalogGalerileri(payload, req, ['marka-tescil'])
}

export async function down(): Promise<void> {
  /* İçerik güncellemesi geri alınmaz */
}
