import type { Payload, PayloadRequest } from 'payload'

/**
 * Dijital reklamın üçüncü vakası (müşterinin verdiği metin ve rakamlar):
 * giyim e-ticaret markası, ROAS 3,41 → 8,62. Ayrıca reklam vakalarındaki
 * yüzde işareti Türkçe yazıma uygun öne alınır (%300; SEO vakaları gibi).
 * Tekrar çalışırsa kopya üretmez. Bu dosya geçişe aittir.
 */
const TITLE = "ROAS'ı 3,41'den 8,62'ye Taşıyan Performans Dönüşümü"

export async function eticaretVakasi(payload: Payload, req: PayloadRequest) {
  const ok = { req, overrideAccess: true } as const
  const svc = await payload.find({ collection: 'services', where: { slug: { equals: 'dijital-reklam-yonetimi' } }, limit: 1, depth: 0, draft: true, ...ok })
  const service = svc.docs[0]?.id
  const exists = await payload.find({ collection: 'case-studies', where: { title: { equals: TITLE } }, limit: 1, depth: 0, ...ok })
  if (exists.docs.length === 0) {
    const last = await payload.find({ collection: 'case-studies', sort: '-order', limit: 1, depth: 0, ...ok })
    const order = (((last.docs[0] as { order?: number } | undefined)?.order) ?? 0) + 10
    await payload.create({
      collection: 'case-studies',
      data: {
        sector: 'E-Ticaret / Giyim',
        title: TITLE,
        summary:
          'Giyim sektöründe faaliyet gösteren e-ticaret markasının dijital reklam süreçlerini devraldığımızda; hedef kitle optimizasyonunu yeniden kurgulayarak ve bütçeyi en verimli kanallara yönlendirerek aynı takvim dönemi içinde rekor bir kârlılık ve verimlilik artışı elde ettik.',
        service,
        showOnHome: false,
        order,
        stats: [
          { label: "ROAS artışı (3,41'den 8,62'ye)", value: 152, prefix: '%', featured: true },
          { label: 'Ciro artışı', value: 74, prefix: '%', featured: true },
          { label: 'Alışveriş başına maliyette azalma', value: 42, prefix: '%', featured: true },
        ],
      } as never,
      ...ok,
    })
    payload.logger.info('[e-ticaret vakası] eklendi')
  }
  /* Reklam vakalarında "300%" yerine "%300" */
  const ads = await payload.find({ collection: 'case-studies', where: { service: { equals: service } }, limit: 20, depth: 0, ...ok })
  for (const c of ads.docs as unknown as { id: number; stats?: { id?: string; label: string; value: number; prefix?: string | null; suffix?: string | null; featured?: boolean | null }[] }[]) {
    if (!c.stats?.some((s) => s.suffix === '%')) continue
    const stats = c.stats.map((s) => (s.suffix === '%' ? { ...s, prefix: '%', suffix: null } : s))
    await payload.update({ collection: 'case-studies', id: c.id, data: { stats } as never, ...ok })
  }
}
