import { MigrateUpArgs } from '@payloadcms/db-postgres'
import { urunSimgeleri } from './data/urun-simgeleri'

/** Ürün görselleri uygulama simgeleriyle yenilendi (yeni adla yüklenir, eskileri silinir). Şema değişikliği yok. */
export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  await urunSimgeleri(payload, req)
}

export async function down(): Promise<void> {
  /* İçerik güncellemesi geri alınmaz */
}
