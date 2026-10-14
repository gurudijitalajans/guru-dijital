import type { Payload, PayloadRequest } from 'payload'

/**
 * 2026-10 boşluk ve satır düzeni (veri geçişi): duyuru bandındaki iki uzun
 * cümle telefonda tek satıra sığacak kadar kısaltılır. Yalnız eski metin
 * değişmeden duruyorsa güncellenir; panelden değiştirilmiş cümleye dokunulmaz.
 * Bu dosya geçişe aittir.
 */
const SHORTER: Record<string, string> = {
  "2026'da da Google Partner'ız: reklam bütçeniz sertifikalı ellerde.": "2026'da da Google Partner'ız: bütçeniz emin ellerde.",
  'Marka tescilinden sosyal medyaya, markanızın her adımında yanınızdayız.': 'Marka tescilinden sosyal medyaya her adımda yanınızdayız.',
}

export async function boslukDuzeni(payload: Payload, req: PayloadRequest) {
  const s = (await payload.findGlobal({ slug: 'site-settings', depth: 0, req, overrideAccess: true })) as unknown as {
    announcement?: { enabled?: boolean; text?: string; more?: { id?: string; text: string }[] }
  }
  const a = s.announcement
  if (!a?.more?.length) return
  let n = 0
  const more = a.more.map((m) => {
    const t = SHORTER[m.text]
    if (!t) return m
    n++
    return { ...m, text: t }
  })
  if (n === 0) return
  await payload.updateGlobal({ slug: 'site-settings', data: { announcement: { ...a, more } } as never, req, overrideAccess: true })
  payload.logger.info(`[boşluk düzeni] duyuru bandı: ${n} cümle kısaltıldı`)
}
