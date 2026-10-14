import { copyFileSync, existsSync, mkdtempSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import type { Payload, PayloadRequest, Where } from 'payload'
import blogPosts from '../../content/blog-posts.json'
import blogPosts2 from '../../content/blog-posts-2.json'
import { toLexical } from './lexical'

/**
 * 2026-10 üçüncü tur (veri geçişi): hizmet görselleri v3 (teslim edilen
 * işler, Guru paneli yok), 10 yeni blog yazısı ve 20 yazının yeni kapakları.
 * Canlıda Postgres geçişiyle, yerelde src/payload/run-ucuncu-tur.ts ile
 * çalışır; tekrar çalışırsa kopya üretmez. Bu dosya geçişe aittir.
 */
type Ctx = { payload: Payload; req: PayloadRequest; log: (m: string) => void }
type Doc = Record<string, unknown> & { id: number }
const ROOT = process.cwd()
const ok = { overrideAccess: true } as const

async function one(ctx: Ctx, collection: string, where: Where, draft = false): Promise<Doc | null> {
  const r = await ctx.payload.find({ collection: collection as never, where, limit: 1, depth: 0, draft, req: ctx.req, ...ok })
  return (r.docs[0] as unknown as Doc) ?? null
}

async function folder(ctx: Ctx, name: string) {
  const hit = await one(ctx, 'payload-folders', { name: { equals: name } })
  if (hit) return hit.id
  return ((await ctx.payload.create({ collection: 'payload-folders' as never, data: { name, folderType: ['media'] } as never, req: ctx.req, ...ok })) as unknown as Doc).id
}

/* Benzersiz adla bir kez yüklenir (önbellek ve -1/-2 ad çakışması olmasın) */
async function upload(ctx: Ctx, rel: string, name: string, alt: string, folderName: string) {
  const file = path.join(ROOT, 'public', rel)
  if (!existsSync(file)) {
    ctx.log(`  ! dosya yok: public/${rel}`)
    return null
  }
  const hit = await one(ctx, 'media', { filename: { equals: name } })
  if (hit) return hit.id
  const tmp = path.join(mkdtempSync(path.join(os.tmpdir(), 'guru-')), name)
  copyFileSync(file, tmp)
  const d = await ctx.payload.create({ collection: 'media', data: { alt, folder: await folder(ctx, folderName) } as never, filePath: tmp, req: ctx.req, ...ok })
  return (d as unknown as Doc).id
}

async function dropMedia(ctx: Ctx, where: Where) {
  const r = await ctx.payload.find({ collection: 'media', where, limit: 200, depth: 0, req: ctx.req, ...ok })
  let n = 0
  for (const m of r.docs as unknown as Doc[]) {
    await ctx.payload
      .delete({ collection: 'media', id: m.id, req: ctx.req, ...ok })
      .then(() => n++)
      .catch(() => null)
  }
  return n
}

/* ------------------------------------------------------------------ */

const SERVICES = ['dijital-reklam-yonetimi', 'web-tasarim', 'seo', 'ozel-yazilim', 'mobil-uygulama', 'marka-tescil', 'e-ticaret-yonetimi', 'grafik-tasarim', 'sosyal-medya-yonetimi']

/* Galeri: hero (16:10), kapak (4:5), altı öne çıkan iş (4:3) */
async function serviceVisuals(ctx: Ctx) {
  let n = 0
  for (const slug of SERVICES) {
    const s = await one(ctx, 'services', { slug: { equals: slug } }, true)
    if (!s) continue
    const title = String(s.title)
    const up = (file: string, alt: string) => upload(ctx, `services/v3/${slug}-${file}.webp`, `hizmet-v3-${slug}-${file}.webp`, alt, 'Hizmetler')
    const hero = await up('hero', `${title}: müşterilerimiz için hazırladığımız işler`)
    if (!hero) continue
    const kapak = await up('kapak', `${title} hizmeti kapak görseli`)
    const feats = []
    for (const i of [1, 2, 3, 4, 5, 6]) feats.push(await up(String(i), `${title}: teslim ettiğimiz işlerden örnek ${i}`))
    const gallery = [hero, kapak, ...feats].filter(Boolean).map((image) => ({ image }))
    await ctx.payload.update({ collection: 'services', id: s.id, data: { cardImage: hero, gallery, _status: 'published' } as never, req: ctx.req, ...ok })
    await dropMedia(ctx, { filename: { like: `hizmet-v2-${slug}-` } })
    n++
  }
  ctx.log(`hizmet görselleri: ${n} hizmet v3 görsellerine geçti`)
}

type Post = (typeof blogPosts)[number]

/* Yeni 10 yazı ve 20 yazının kapağı (blog-v2-<slug>.webp) */
async function posts(ctx: Ctx) {
  const all = [...(blogPosts as Post[]), ...(blogPosts2 as Post[])]
  const cats: Record<string, number> = {}
  for (const name of [...new Set(all.map((p) => p.category))]) {
    const hit = await one(ctx, 'categories', { title: { equals: name } })
    cats[name] = hit ? hit.id : ((await ctx.payload.create({ collection: 'categories', data: { title: name } as never, req: ctx.req, ...ok })) as unknown as Doc).id
  }
  let created = 0
  let covers = 0
  for (const p of all) {
    const cover = await upload(ctx, `blog/v2/${p.slug}.webp`, `blog-v2-${p.slug}.webp`, p.title, 'Blog')
    const existing = await one(ctx, 'posts', { slug: { equals: p.slug } }, true)
    if (existing) {
      if (cover && existing.cover !== cover) {
        await ctx.payload.update({ collection: 'posts', id: existing.id, data: { cover } as never, req: ctx.req, ...ok })
        covers++
      }
      continue
    }
    await ctx.payload.create({
      collection: 'posts',
      data: {
        title: p.title,
        slug: p.slug,
        excerpt: p.excerpt,
        content: toLexical(p.blocks as never),
        category: cats[p.category],
        publishedAt: p.publishedAt,
        seo: { title: p.title.length <= 60 ? p.title : undefined, description: p.seoDescription },
        ...(cover ? { cover } : {}),
        _status: 'published',
      } as never,
      req: ctx.req,
      ...ok,
    })
    created++
  }
  /* Eski kapaklar (<slug>.webp) artık kullanılmıyor */
  let dropped = 0
  for (const p of all) dropped += await dropMedia(ctx, { filename: { equals: `${p.slug}.webp` } })
  ctx.log(`blog: ${created} yeni yazı, ${covers} kapak yenilendi, ${dropped} eski kapak silindi`)
}

/* ------------------------------------------------------------------ */

export const STEPS = { serviceVisuals, posts }

export async function ucuncuTur(payload: Payload, req: PayloadRequest, only?: (keyof typeof STEPS)[]) {
  const ctx: Ctx = { payload, req, log: (m) => payload.logger.info(`[üçüncü tur] ${m}`) }
  for (const [name, fn] of Object.entries(STEPS)) {
    if (only && !only.includes(name as keyof typeof STEPS)) continue
    await fn(ctx)
  }
}
