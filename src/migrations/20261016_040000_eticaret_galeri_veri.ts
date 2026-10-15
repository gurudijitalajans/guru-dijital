import { MigrateUpArgs } from '@payloadcms/db-postgres'
import { katalogGalerileri } from './data/katalog'

/** E-Ticaret galerisi v4 (BK Collection ürün görselleri ve mağaza; e-ticaret vakalarının rakamları). Şema değişikliği yok. */
export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  await katalogGalerileri(payload, req, ['e-ticaret-yonetimi'])
}

export async function down(): Promise<void> {
  /* İçerik güncellemesi geri alınmaz */
}
