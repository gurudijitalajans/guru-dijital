import type { Payload, PayloadRequest } from 'payload'
import { mediaUsageMap } from '../../payload/media-usage'

/**
 * Medya kütüphanesini kullanım yerine göre yeniden klasörler (2026-10-16):
 * Hizmetler ve Ürünler altında kayıt başına alt klasör, blog kapakları,
 * referans logoları, ekip, müşteri yorumları, vaka çalışmaları, ödüller,
 * marka; hiçbir yerde kullanılmayanlar Arşiv'e. Görsel silinmez, adresler
 * değişmez (yalnız klasör alanı). Tekrar çalıştırmak güvenlidir.
 */
const RENAME: Record<string, string> = { Kurumsal: 'Marka ve kurumsal', Blog: 'Blog kapakları', Referanslar: 'Referans logoları', Ödüller: 'Ödüller ve belgeler' }
const ORDER = ['services', 'products', 'case-studies', 'posts', 'references', 'team', 'testimonials', 'tenants', 'about-page', 'home-page', 'site-settings']
const ROOT_FOR: Record<string, string> = {
  posts: 'Blog kapakları',
  references: 'Referans logoları',
  team: 'Ekip',
  testimonials: 'Müşteri yorumları',
  'case-studies': 'Vaka çalışmaları',
  tenants: 'Marka ve kurumsal',
  'about-page': 'Ödüller ve belgeler',
  'home-page': 'Marka ve kurumsal',
  'site-settings': 'Marka ve kurumsal',
}

export async function medyaAgaci(payload: Payload, req: PayloadRequest, log: (s: string) => void = () => {}) {
  const ok = { req, overrideAccess: true } as const
  const all = await payload.find({ collection: 'payload-folders', limit: 1000, depth: 0, pagination: false, ...ok })
  const folders = all.docs as unknown as { id: number; name: string; folder?: number | { id: number } | null }[]
  const parentId = (f: { folder?: number | { id: number } | null }) => (f.folder && typeof f.folder === 'object' ? f.folder.id : (f.folder ?? null))

  for (const f of folders) {
    if (parentId(f) === null && RENAME[f.name] && !folders.some((x) => x.name === RENAME[f.name] && parentId(x) === null)) {
      await payload.update({ collection: 'payload-folders', id: f.id, data: { name: RENAME[f.name] } as never, ...ok })
      f.name = RENAME[f.name]
    }
  }
  const ensure = async (name: string, parent: number | null) => {
    const found = folders.find((f) => f.name === name && parentId(f) === parent)
    if (found) return found.id
    const doc = (await payload.create({ collection: 'payload-folders', data: { name, folderType: ['media'], ...(parent ? { folder: parent } : {}) } as never, ...ok })) as unknown as { id: number; name: string }
    folders.push({ id: doc.id, name, folder: parent })
    return doc.id
  }

  const usage = await mediaUsageMap(payload, req)
  const media = await payload.find({ collection: 'media', limit: 5000, depth: 0, pagination: false, select: { folder: true }, ...ok })
  const moves = new Map<number, number[]>()
  for (const m of media.docs as unknown as { id: number }[]) {
    const uses = usage.get(String(m.id)) ?? []
    let target: number
    if (!uses.length) target = await ensure('Arşiv', null)
    else {
      const withSlug = uses.map((u) => {
        const parts = u.href.split('/')
        const slug = u.href === '/panel/ayarlar' ? 'tenants' : parts[3] ?? ''
        return { u, slug }
      })
      withSlug.sort((a, b) => (ORDER.indexOf(a.slug) + 100) % 100 - (ORDER.indexOf(b.slug) + 100) % 100)
      const first = withSlug[0]
      if (first.slug === 'services') target = await ensure(first.u.label, await ensure('Hizmetler', null))
      else if (first.slug === 'products') target = await ensure(first.u.label, await ensure('Ürünler', null))
      else target = await ensure(ROOT_FOR[first.slug] ?? 'Marka ve kurumsal', null)
    }
    moves.set(target, [...(moves.get(target) ?? []), m.id])
  }
  for (const [folder, ids] of moves) {
    for (let i = 0; i < ids.length; i += 200) await payload.update({ collection: 'media', where: { id: { in: ids.slice(i, i + 200) } }, data: { folder }, ...ok })
  }
  /* Boşalan eski klasörler (alt klasörü ve görseli kalmayan) silinir */
  const counts = new Map<number, number>()
  for (const [f, ids] of moves) counts.set(f, ids.length)
  for (const f of [...folders]) {
    const used = counts.get(f.id) || folders.some((x) => parentId(x) === f.id)
    if (!used) await payload.delete({ collection: 'payload-folders', id: f.id, ...ok }).catch(() => null)
  }
  log(`medya: ${media.docs.length} görsel ${moves.size} klasöre yerleşti`)
}
