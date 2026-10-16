import { copyFileSync, existsSync, mkdtempSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import type { Payload, PayloadRequest } from 'payload'

/**
 * Ürün görselleri uygulama simgeleriyle yeniden üretildi (giriş, kapak, öne çıkan
 * üç ekran, ekran görüntüsü). Yeni adla (-v3) yüklenir: görsel önbelleği aynı adı eski
 * haliyle sunuyordu. Alt metinler eski medyadan aynen taşınır, eski medya silinir.
 * Canlıda Postgres geçişiyle, yerelde src/payload/run-urun-simgeleri.ts ile çalışır;
 * tekrar çalışırsa kopya üretmez. Bu dosya geçişe aittir.
 */
type Doc = Record<string, unknown> & { id: number }
type Ref = number | { id: number } | null | undefined
const ROOT = process.cwd()
const ok = { overrideAccess: true } as const
const PRODUCTS = ['guru-chatbot', 'guru-crm', 'guru-operation', 'guru-business']
const idOf = (r: Ref) => (r && typeof r === 'object' ? r.id : (r ?? null))

export async function urunSimgeleri(payload: Payload, req: PayloadRequest) {
  const log = (m: string) => payload.logger.info(`[urun-simgeleri] ${m}`)
  const tmpDir = mkdtempSync(path.join(os.tmpdir(), 'guru-'))

  /* Yeni dosya bir kez yüklenir; alt metin eski medyadan gelir */
  async function upload(rel: string, name: string, oldId: number | null): Promise<number | null> {
    const file = path.join(ROOT, 'public', rel)
    if (!existsSync(file)) {
      log(`! dosya yok: public/${rel}`)
      return null
    }
    const hit = await payload.find({ collection: 'media', where: { filename: { like: `${name.replace(/\.webp$/, '')}.` } }, limit: 1, depth: 0, req, ...ok })
    if (hit.docs[0]) return hit.docs[0].id as number
    const old = oldId ? ((await payload.findByID({ collection: 'media', id: oldId, depth: 0, req, ...ok }).catch(() => null)) as Doc | null) : null
    const tmp = path.join(tmpDir, name)
    copyFileSync(file, tmp)
    const data: Record<string, unknown> = { alt: (old?.alt as string) || name }
    if (old?.folder) data.folder = idOf(old.folder as Ref)
    const doc = await payload.create({ collection: 'media', data: data as never, filePath: tmp, req, ...ok })
    return doc.id as number
  }

  for (const slug of PRODUCTS) {
    const r = await payload.find({ collection: 'products', where: { slug: { equals: slug } }, limit: 1, depth: 0, draft: true, req, ...ok })
    const p = r.docs[0] as unknown as Doc | undefined
    if (!p) continue
    const old = { hero: idOf(p.heroVisual as Ref), cover: idOf(p.cover as Ref), shot: idOf(p.screenshot as Ref) }
    const showcase = ((p.showcase as (Record<string, unknown> & { image: Ref })[]) ?? []).map((s) => ({ ...s, image: idOf(s.image) }))

    const hero = await upload(`products/visuals/${slug}-hero.webp`, `${slug}-hero-v3.webp`, old.hero)
    const cover = await upload(`products/covers/${slug}.webp`, `${slug}-kapak-v3.webp`, old.cover)
    const shot = await upload(`products/screens/${slug}.webp`, `${slug}-ekran-v3.webp`, old.shot)
    const shows: (number | null)[] = []
    for (const [i, s] of showcase.entries()) shows.push(await upload(`products/visuals/${slug}-${i + 1}.webp`, `${slug}-${i + 1}-v3.webp`, s.image))

    const data: Record<string, unknown> = { _status: 'published' }
    if (hero) data.heroVisual = hero
    if (cover) data.cover = cover
    if (shot) data.screenshot = shot
    data.showcase = showcase.map((s, i) => ({ ...s, image: shows[i] ?? s.image }))
    await payload.update({ collection: 'products', id: p.id, data: data as never, req, ...ok })

    /* Yerine yenisi geçen eski medya silinir */
    const replaced = [
      [old.hero, hero],
      [old.cover, cover],
      [old.shot, shot],
      ...showcase.map((s, i) => [s.image, shows[i]] as const),
    ].filter(([o, n]) => o && n && o !== n)
    for (const [o] of replaced) await payload.delete({ collection: 'media', id: o as number, req, ...ok }).catch(() => null)
    log(`${slug}: ${replaced.length} görsel yenilendi`)
  }
}
