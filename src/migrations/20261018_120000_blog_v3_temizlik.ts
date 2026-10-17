import { MigrateUpArgs } from '@payloadcms/db-postgres'
import blogPosts from '../content/blog-posts.json'
import blogPosts2 from '../content/blog-posts-2.json'
import { blogKapaklari, kullanilmayanMedyayiSil } from './data/katalog'

/**
 * Blog kapakları v3 (hizmet galerilerinin diliyle, yeni adla) ve kullanılmayan medyanın temizliği: kapaklar
 * değiştikten sonra hiçbir kayıtta, taslakta ya da sayfa ayarında geçmeyen görseller dosyasıyla silinir.
 * Şema değişikliği yok; geri alınmaz.
 */
export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  const slugs = [...(blogPosts as { slug: string }[]), ...(blogPosts2 as { slug: string }[])].map((p) => p.slug)
  await blogKapaklari(payload, req, slugs, 'blog-v3-')
  await kullanilmayanMedyayiSil(payload, req)
}

export async function down(): Promise<void> {
  /* Silinen medya geri getirilemez */
}
