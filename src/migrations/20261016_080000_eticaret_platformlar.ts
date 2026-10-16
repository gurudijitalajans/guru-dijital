import { MigrateUpArgs } from '@payloadcms/db-postgres'
import { galeriGorseliYenile } from './data/katalog'

/**
 * E-Ticaret galerisi: hero, kapak ve 2-4. karolar pazar yerleri (Trendyol, Hepsiburada, n11, Amazon, Etsy) ve
 * altyapılar (Shopify, ikas) ile yenilendi; ortaklıklar müşteri teyidiyle. 1, 5 ve 6. karolar aynı kalır.
 */
export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  for (const key of ['hero', 'kapak', '2', '3', '4']) await galeriGorseliYenile(payload, req, 'e-ticaret-yonetimi', key, 'gercek2-')
}

export async function down(): Promise<void> {
  /* İçerik güncellemesi geri alınmaz */
}
