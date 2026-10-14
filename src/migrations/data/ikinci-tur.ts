import { copyFileSync, existsSync, mkdtempSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import type { Payload, PayloadRequest, Where } from 'payload'

/**
 * 2026-10 ikinci tur içerik düzeltmeleri (veri geçişi). Canlıda Postgres
 * geçişiyle, yerelde src/payload/run-ikinci-tur.ts ile çalışır; tekrar
 * çalışırsa kopya üretmez. Bu dosya geçişe aittir.
 */
type Ctx = { payload: Payload; req: PayloadRequest; log: (m: string) => void }
type Doc = Record<string, unknown> & { id: number }
const ROOT = process.cwd()
const ok = { overrideAccess: true } as const

async function one(ctx: Ctx, collection: string, where: Where, draft = false): Promise<Doc | null> {
  const r = await ctx.payload.find({ collection: collection as never, where, limit: 1, depth: 0, draft, req: ctx.req, ...ok })
  return (r.docs[0] as unknown as Doc) ?? null
}

/** Dosyayı verilen adla geçici klasöre kopyalar (yükleme o adla yapılır) */
function named(file: string, name: string) {
  const tmp = path.join(mkdtempSync(path.join(os.tmpdir(), 'guru-')), name)
  copyFileSync(file, tmp)
  return tmp
}

/* ------------------------------------------------------------------ */

async function copy(ctx: Ctx) {
  const h = (await ctx.payload.findGlobal({ slug: 'home-page', depth: 0, req: ctx.req, ...ok })) as unknown as Record<string, Record<string, unknown>>
  await ctx.payload.updateGlobal({
    slug: 'home-page',
    data: {
      hero: { ...h.hero, badgeStrong: 'Grow with Guru', badgeText: 'Onlarca markanın dijital yol arkadaşı' },
      seo: { ...h.seo, title: 'Guru Dijital Ajans | Grow with Guru' },
    } as never,
    req: ctx.req,
    ...ok,
  })
  ctx.log('ana sayfa: "Grow with Guru"')
}

/* Logosu olmayan eski markalar listeden çıkar (sitede yalnız logolu markalar) */
async function references(ctx: Ctx) {
  const r = await ctx.payload.delete({ collection: 'references', where: { logo: { exists: false } }, req: ctx.req, ...ok })
  ctx.log(`referanslar: logosuz ${r.docs.length} kayıt silindi`)
}

/* Vakalar hizmetine bağlanır; ana sayfada üç SEO vakası yan yana */
const CASE_SERVICE: [title: string, service: string, home: boolean][] = [
  ['Aynı bütçeyle %300 daha fazla hasta', 'dijital-reklam-yonetimi', false],
  ['Satış odaklı strateji, ölçülebilir büyüme', 'dijital-reklam-yonetimi', false],
  ['Reklam harcamasından bağımsız, kesintisiz organik büyüme', 'seo', true],
  ['Doğru anahtar kelime stratejisiyle rekor organik satış', 'seo', true],
  ['Uluslararası aramalarda zirve, çok dilli SEO ile küresel hasta akışı', 'seo', true],
]

async function cases(ctx: Ctx) {
  let n = 0
  for (const [title, slug, home] of CASE_SERVICE) {
    const c = await one(ctx, 'case-studies', { title: { equals: title } })
    const s = await one(ctx, 'services', { slug: { equals: slug } }, true)
    if (!c || !s) continue
    await ctx.payload.update({ collection: 'case-studies', id: c.id, data: { service: s.id, showOnHome: home } as never, req: ctx.req, ...ok })
    n++
  }
  ctx.log(`vakalar: ${n} vaka hizmetine bağlandı`)
}

/*
 * Ürün görselleri yeni adla (-v2) yüklenir: aynı adla üzerine yazılan dosyayı
 * görsel önbelleği eski haliyle sunmaya devam ediyordu.
 */
const PRODUCTS = ['guru-chatbot', 'guru-crm', 'guru-operation', 'guru-business']

async function productVisuals(ctx: Ctx) {
  let n = 0
  for (const slug of PRODUCTS) {
    const map: [string, string][] = [
      [`${slug}-hero`, `products/visuals/${slug}-hero.webp`],
      [`${slug}-1`, `products/visuals/${slug}-1.webp`],
      [`${slug}-2`, `products/visuals/${slug}-2.webp`],
      [`${slug}-3`, `products/visuals/${slug}-3.webp`],
      [`${slug}-ekran`, `products/screens/${slug}.webp`],
      [`${slug}-kapak`, `products/covers/${slug}.webp`],
    ]
    for (const [stem, rel] of map) {
      const file = path.join(ROOT, 'public', rel)
      if (!existsSync(file)) continue
      const m = await one(ctx, 'media', { or: [{ filename: { equals: `${stem}.webp` } }, { filename: { equals: `${stem}-v2.webp` } }] })
      if (!m) continue
      await ctx.payload.update({ collection: 'media', id: m.id, data: {} as never, filePath: named(file, `${stem}-v2.webp`), overwriteExistingFiles: true, req: ctx.req, ...ok })
      n++
    }
  }
  ctx.log(`ürün görselleri: ${n} medya yeni adla yüklendi`)
}

/* ------------------------------------------------------------------ */

export const STEPS = { copy, references, cases, productVisuals }

export async function ikinciTur(payload: Payload, req: PayloadRequest, only?: (keyof typeof STEPS)[]) {
  const ctx: Ctx = { payload, req, log: (m) => payload.logger.info(`[ikinci tur] ${m}`) }
  for (const [name, fn] of Object.entries(STEPS)) {
    if (only && !only.includes(name as keyof typeof STEPS)) continue
    await fn(ctx)
  }
}
