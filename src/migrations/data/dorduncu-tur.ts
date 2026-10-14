import { copyFileSync, existsSync, mkdtempSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import type { Payload, PayloadRequest, Where } from 'payload'

/**
 * 2026-10 dördüncü tur (veri geçişi): sosyal medya hizmet görselleri yeni
 * adla (hizmet-v3b-: başka markanın kaydırmalı gönderisi çıkarıldı; aynı adla
 * yükleme önbellekte eski kalırdı) ve 50. referans Mavi Düşler. Canlıda
 * Postgres geçişiyle, yerelde src/payload/run-dorduncu-tur.ts ile çalışır;
 * tekrar çalışırsa kopya üretmez. Bu dosya geçişe aittir.
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

/* Yükleme webp'ye çevrilebilir: taban adla aranır */
async function upload(ctx: Ctx, rel: string, name: string, alt: string, folderName: string) {
  const file = path.join(ROOT, 'public', rel)
  if (!existsSync(file)) {
    ctx.log(`  ! dosya yok: public/${rel}`)
    return null
  }
  const base = name.replace(/\.[a-z0-9]+$/i, '')
  const hit = await one(ctx, 'media', { filename: { like: `${base}.` } })
  if (hit) return hit.id
  const tmp = path.join(mkdtempSync(path.join(os.tmpdir(), 'guru-')), name)
  copyFileSync(file, tmp)
  const d = await ctx.payload.create({ collection: 'media', data: { alt, folder: await folder(ctx, folderName) } as never, filePath: tmp, req: ctx.req, ...ok })
  return (d as unknown as Doc).id
}

async function socialVisuals(ctx: Ctx) {
  const slug = 'sosyal-medya-yonetimi'
  const s = await one(ctx, 'services', { slug: { equals: slug } }, true)
  if (!s) return
  const title = String(s.title)
  const up = (file: string, alt: string) => upload(ctx, `services/v3/${slug}-${file}.webp`, `hizmet-v3b-${slug}-${file}.webp`, alt, 'Hizmetler')
  const hero = await up('hero', `${title}: müşterilerimiz için hazırladığımız işler`)
  if (!hero) return
  const kapak = await up('kapak', `${title} hizmeti kapak görseli`)
  const feats = []
  for (const i of [1, 2, 3, 4, 5, 6]) feats.push(await up(String(i), `${title}: teslim ettiğimiz işlerden örnek ${i}`))
  const gallery = [hero, kapak, ...feats].filter(Boolean).map((image) => ({ image }))
  await ctx.payload.update({ collection: 'services', id: s.id, data: { cardImage: hero, gallery, _status: 'published' } as never, req: ctx.req, ...ok })
  const old = await ctx.payload.find({ collection: 'media', where: { filename: { like: `hizmet-v3-${slug}-` } }, limit: 50, depth: 0, req: ctx.req, ...ok })
  for (const m of old.docs as unknown as Doc[]) await ctx.payload.delete({ collection: 'media', id: m.id, req: ctx.req, ...ok }).catch(() => null)
  ctx.log(`sosyal medya görselleri yeni adla yüklendi, ${old.docs.length} eski görsel silindi`)
}

async function reference(ctx: Ctx) {
  const name = 'Mavi Düşler Özel Eğitim ve Rehabilitasyon Merkezi'
  const logo = await upload(ctx, 'references/mavi-dusler.png', 'referans-mavi-dusler.png', 'Mavi Düşler', 'Referanslar')
  if (!logo) return
  const existing = await one(ctx, 'references', { name: { equals: name } })
  if (existing) {
    await ctx.payload.update({ collection: 'references', id: existing.id, data: { logo } as never, req: ctx.req, ...ok })
  } else {
    const last = await ctx.payload.find({ collection: 'references', sort: '-order', limit: 1, depth: 0, req: ctx.req, ...ok })
    const order = (((last.docs[0] as unknown as Doc | undefined)?.order as number | undefined) ?? 490) + 10
    await ctx.payload.create({ collection: 'references', data: { name, logo, order } as never, req: ctx.req, ...ok })
  }
  const total = await ctx.payload.count({ collection: 'references', req: ctx.req, ...ok })
  ctx.log(`referanslar: Mavi Düşler eklendi, toplam ${total.totalDocs}`)
}

export const STEPS = { socialVisuals, reference }

export async function dorduncuTur(payload: Payload, req: PayloadRequest) {
  const ctx: Ctx = { payload, req, log: (m) => payload.logger.info(`[dördüncü tur] ${m}`) }
  for (const fn of Object.values(STEPS)) await fn(ctx)
}
