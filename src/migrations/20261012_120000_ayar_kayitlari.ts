import { MigrateUpArgs } from '@payloadcms/db-postgres'

/**
 * Veri geçişi (şema değişmez): her işletmenin tek kayıtlık ayarlarını
 * (Chatbot ayarları, Yönetici ayarları, Site bağlantısı) eksikse açar. Kayıt
 * yokken ayar sayfası "Yeni oluştur" formu gibi açılıyordu. Var olan kayda
 * dokunmaz; uygulama kodunu çağırmaz (ileride değişse de bu geçiş çalışsın).
 * İşletmesi silinmiş (sahipsiz kalmış) ayar kayıtlarını da temizler.
 */
const SETTINGS = ['chatbot-config', 'business-config', 'site-connection'] as const

export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  const tenants = await payload.find({ collection: 'tenants', limit: 1000, depth: 0, pagination: false, req, overrideAccess: true })
  let created = 0
  let orphans = 0
  for (const slug of SETTINGS) {
    const r = await payload.delete({ collection: slug, where: { tenant: { exists: false } }, req, overrideAccess: true })
    orphans += r.docs.length
  }
  for (const t of tenants.docs) {
    for (const slug of SETTINGS) {
      const found = await payload.count({ collection: slug, where: { tenant: { equals: t.id } }, req, overrideAccess: true })
      if (found.totalDocs > 0) continue
      const data: Record<string, unknown> = { tenant: t.id }
      if (slug === 'chatbot-config') data.botName = t.slug === 'guru' ? 'Guru Asistan' : `${t.name} Asistanı`
      await payload.create({ collection: slug, data: data as never, req, overrideAccess: true })
      created++
    }
  }
  payload.logger.info(`İşletme ayarları: ${created} eksik kayıt açıldı, ${orphans} sahipsiz kayıt silindi`)
}

export async function down(): Promise<void> {
  /* Açılan ayar kayıtları geri alınmaz: içlerine işletme bilgisi girilmiş olabilir */
}
