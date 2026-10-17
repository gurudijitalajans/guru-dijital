import { copyFileSync, existsSync, mkdtempSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import type { Payload, PayloadRequest, Where } from 'payload'

/**
 * Katalog PSD'lerinden üretilen gerçek iş görselleri (veri geçişi): ödül kartları ve hizmet
 * galerileri (dokuz hizmetin tamamı). Görseller benzersiz adla bir kez yüklenir (görsel önbelleği aynı adı eski
 * haliyle sunuyordu). Canlıda Postgres geçişiyle, yerelde src/payload/run-katalog.ts ile
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
async function upload(ctx: Ctx, rel: string, alt: string, folderName: string, prefix = 'katalog-') {
  const file = path.join(ROOT, 'public', rel)
  if (!existsSync(file)) {
    ctx.log(`  ! dosya yok: public/${rel}`)
    return null
  }
  const name = prefix + path.basename(rel)
  const base = name.replace(/\.[a-z0-9]+$/i, '')
  const hit = await one(ctx, 'media', { filename: { like: `${base}.` } })
  if (hit) return hit.id
  const tmp = path.join(mkdtempSync(path.join(os.tmpdir(), 'guru-')), name)
  copyFileSync(file, tmp)
  return ((await ctx.payload.create({ collection: 'media', data: { alt, folder: await folder(ctx, folderName) } as never, filePath: tmp, req: ctx.req, ...ok })) as unknown as Doc).id
}

/* Hakkımızda > Ödüller: kupa ve Partner logosu, yazısız */
const AWARD_IMAGES: Record<string, [string, string]> = {
  'Google Partner': ['work/odul2-partner.webp', 'Google Partner rozeti'],
  'Google Ads Impact Awards': ['work/odul2-impact.webp', 'Google Ads Impact Awards 2025 kupası'],
}
async function awards(ctx: Ctx) {
  const g = (await ctx.payload.findGlobal({ slug: 'about-page', depth: 0, req: ctx.req, ...ok })) as unknown as { awards?: { items?: (Record<string, unknown> & { title: string })[] } & Record<string, unknown> }
  const items = g.awards?.items
  if (!items?.length) return
  let n = 0
  const next = []
  for (const it of items) {
    const m = AWARD_IMAGES[it.title]
    const id = m ? await upload(ctx, m[0], m[1], 'Ödüller') : null
    if (id) n++
    next.push(id ? { ...it, image: id } : it)
  }
  await ctx.payload.updateGlobal({ slug: 'about-page', data: { awards: { ...g.awards, items: next } } as never, req: ctx.req, ...ok })
  ctx.log(`ödüller: ${n} görsel yenilendi`)
}

/* Hizmet galerileri: gerçek işlerle üretilen v4 görseller (public/services/v4/<slug>-*.webp);
   altı karonun alt metni karodaki işi anlatır */
const GALLERY_ALTS: Record<string, string[]> = {
  'web-tasarim': [
    'askahotels.com otel web sitesi, masaüstü ve mobil görünüm',
    'secengross.com perakende web sitesi, masaüstü ve mobil görünüm',
    'esdoinsaat.com inşaat firması web sitesi, masaüstü ve mobil görünüm',
    'ekoda.com.tr depolama hizmeti web sitesi, masaüstü ve mobil görünüm',
    'usreokullari.com özel okul web sitesi, masaüstü ve mobil görünüm',
    'rimasis.com mühendislik firması web sitesi, masaüstü ve mobil görünüm',
  ],
  'sosyal-medya-yonetimi': [
    'WCTLife için hazırladığımız gönderi serisi, profil ızgarasında',
    'Medipunto Clinic için çok dilli kampanya ve bilgilendirici gönderiler',
    'DC diş kliniği için üç dilde kampanya gönderileri',
    'Classy & Sheen için ürün tanıtım gönderileri',
    'Veggy Snacky için ürün lansmanı gönderileri',
    'Sağlıktan gayrimenkule farklı sektörlerden markalar için hazırladığımız gönderiler',
  ],
  'grafik-tasarim': [
    'Veggy Snacky Sour ürün ailesi için altı aromalı paket tasarımı',
    'Veggy Snacky kakaolu fındık kreması kavanoz etiketi ve tuzlu ayçekirdeği paketi',
    'Lion Klinker el yapımı tuğla kataloğu: kapak ve ürün sayfaları',
    'Soiltech gemi bakım ve onarım firması için İngilizce tanıtım kataloğu',
    'Self Respect kurumsal kimlik seti: kartvizit, zarf, dosya, etiket ve kırtasiye',
    'Farklı sektörlerden markalar için tasarladığımız sekiz logo',
  ],
  'dijital-reklam-yonetimi': [
    'DC diş kliniği için Türkçe ve İngilizce Meta reklam kreatifleri',
    'Medipunto Clinic için İngilizce estetik kampanyası reklam kreatifi',
    'WCTLife konut projesi satış kampanyası reklam kreatifi',
    "Giyim e-ticaret vakası: ROAS 3,41'den 8,62'ye, ciro %74 arttı",
    'Sağlık kliniği vakası: aynı bütçeyle yurt dışı hasta sayısında %300 artış',
    'E-ticaret vakası: kampanya döneminde ciro %96 arttı',
  ],
  'ozel-yazilim': [
    'Panelin bağlandığı sistemler: muhasebe, ERP, kargo, ödeme, e-ticaret sitesi, Excel ve CSV',
    'Satış hunisi ve kalem kalem teklif belgesi, toplam ve KDV ile (temsili arayüz)',
    'Sipariş onayıyla başlayan otomasyon: fatura, kargo etiketi, stok ve müşteri bildirimi',
    'Yapay zekâ gelen faturayı okuyup alanları doldurur, son onay kullanıcıda (temsili arayüz)',
    'Satış raporu: aylık ciro, ortalama sipariş ve satış kanalları (temsili veri)',
    'Aşama aşama teslim ve bakım; kaynak kodu ve veriler müşteriye ait',
  ],
  seo: [
    'SEO e-ticaret vakası: 6 ayda organik trafikte %325 artış',
    'SEO doğrudan satış vakası: organik gelirde %215 artış',
    'SEO sağlık turizmi vakası: uluslararası organik trafikte %410 artış',
    'Aska Hotels çok dilli sitesinin arama sonucundaki başlık ve açıklaması',
    'Usre Okulları sitesinin telefonda arama sonucundaki görünümü',
    'Secen Gross ve Esdo İnşaat sitelerinin arama sonucundaki başlık ve açıklamaları',
  ],
  'e-ticaret-yonetimi': [
    'BK Collection: masada çekilen ham ürün fotoğrafı ve aynı ceketin mağaza görseli',
    'Pazar yeri mağaza kurulumu: Trendyol, Hepsiburada, n11, Amazon ve Etsy',
    'Pazar yeri ürün sayfası optimizasyonu: başlık, görsel, varyant, kampanya ve reklam',
    'E-ticaret altyapıları: Shopify Partner ve ikas İş Ortağı olarak kurulum ve yönetim',
    "E-ticaret reklam vakaları: ROAS 3,41'den 8,62'ye, kampanya döneminde ciro %96 arttı",
    'E-ticaret SEO vakaları: organik trafikte %325, organik gelirde %215 artış',
  ],
  'marka-tescil': [
    'Marka tescil süreci: ön araştırmadan tescil belgesine yedi adım',
    'Resmi Marka Bülteninde yayından sonra iki aylık itiraz süresi',
    'Tescilli markanın koruma süresi: başvurudan itibaren on yıl, onar yıllık yenileme',
    'Nice sınıflandırması: 34 mal ve 11 hizmet sınıfı',
    'Marka başvurusundan önce ön araştırmada bakılacaklar',
    'Guru Dijital Marka Tescil hizmet gönderisi',
  ],
  'mobil-uygulama': [
    'Bir kez yazılan kod iki platformda: kod düzenleyiciden iPhone ve Android ekranına (temsili arayüz)',
    'Fikirden mağazaya beş adım: keşif, tasarım, geliştirme, test ve yayın',
    'App Store ve Google Play inceleme durumları ve göndermeden önce kontrol listesi',
    'Mağaza sayfası için uygulama simgesi ve ekran görüntüsü seti (temsili)',
    'Uygulamanın entegrasyonları: bildirim, ödeme, kolay giriş, web sitesi, panel ve analitik',
    'Yayından sonra sürüm geçmişi, iOS ve Android uyumu ve hata izleme',
  ],
}
/* Hero alt metni genel kalıptan farklı olması gereken hizmetler */
const HERO_ALTS: Record<string, string> = {
  'ozel-yazilim': 'Markasız örnek yönetim paneli: özet ekranı dizüstünde, sipariş listesi telefonda (temsili arayüz)',
  seo: 'Yaptığımız sitelerin arama sonucundaki görünümü ve SEO vakalarından iki sonuç',
  'e-ticaret-yonetimi': 'Pazar yerleri ve e-ticaret altyapıları: Trendyol, Hepsiburada, n11, Amazon, Etsy, Shopify ve ikas',
  'marka-tescil': 'Cam kum saatinin içinde kumdan tescil işareti: Marka Tescil',
  'mobil-uygulama': 'Aynı örnek uygulama iPhone ve Android\'de; App Store ve Google Play rozetleri (temsili arayüz)',
}
async function serviceGalleries(ctx: Ctx, only?: string[]) {
  for (const [slug, alts] of Object.entries(GALLERY_ALTS)) {
    if (only && !only.includes(slug)) continue
    const s = await one(ctx, 'services', { slug: { equals: slug } }, true)
    if (!s) continue
    const title = String(s.title)
    const up = (f: string, alt: string) => upload(ctx, `services/v4/${slug}-${f}.webp`, alt, 'Hizmetler', 'gercek-')
    const hero = await up('hero', HERO_ALTS[slug] ?? `${title}: müşterilerimiz için yaptığımız işler`)
    if (!hero) continue
    const kapak = await up("kapak", `${title}: kapak görseli`)
    const feats = []
    for (const [i, alt] of alts.entries()) feats.push(await up(String(i + 1), alt))
    const gallery = [hero, kapak, ...feats].filter(Boolean).map((image) => ({ image }))
    await ctx.payload.update({ collection: 'services', id: s.id, data: { cardImage: hero, gallery, _status: 'published' } as never, req: ctx.req, ...ok })
    ctx.log(`${slug}: galeri v4 (${gallery.length} görsel)`)
  }
}

export const STEPS = { awards, serviceGalleries }

export async function katalog(payload: Payload, req: PayloadRequest) {
  const ctx: Ctx = { payload, req, log: (m) => payload.logger.info(`[katalog] ${m}`) }
  for (const fn of Object.values(STEPS)) await fn(ctx)
}

/* Sonradan eklenen hizmet galerileri (ilk geçiş canlıda çalıştıktan sonra) */
export async function katalogGalerileri(payload: Payload, req: PayloadRequest, slugs: string[]) {
  const ctx: Ctx = { payload, req, log: (m) => payload.logger.info(`[katalog] ${m}`) }
  await serviceGalleries(ctx, slugs)
}

/* Galerideki tek bir görseli yeni adla yükleyip yerine koyar (önbellek eskisini sunmasın); eski medya silinir */
export async function galeriGorseliYenile(payload: Payload, req: PayloadRequest, slug: string, key: string, prefix: string) {
  const ctx: Ctx = { payload, req, log: (m) => payload.logger.info(`[katalog] ${m}`) }
  const s = await one(ctx, 'services', { slug: { equals: slug } }, true)
  if (!s) return
  const idx = ['hero', 'kapak', '1', '2', '3', '4', '5', '6'].indexOf(key)
  const alt = key === 'hero' ? HERO_ALTS[slug] : key === 'kapak' ? `${String(s.title)}: kapak görseli` : GALLERY_ALTS[slug]?.[idx - 2]
  const id = await upload(ctx, `services/v4/${slug}-${key}.webp`, alt ?? `${String(s.title)}: ${key}`, 'Hizmetler', prefix)
  if (!id) return
  /* Eski görsel adıyla değil galerideki sırasıyla bulunur (hero, kapak, 1-6): ad çakışmasında -1 eki alabilir */
  const items = ((s.gallery as { image: number | { id: number } }[]) ?? []).map((g) => (typeof g.image === 'object' ? g.image.id : g.image))
  const oldId = items[idx]
  if (oldId === undefined || oldId === id) return
  const gallery = items.map((gid, i) => ({ image: i === idx ? id : gid }))
  /* Hero hizmet kartında da kullanılır: kart görseli eskisi silinmeden yenisine geçer */
  const card = key === 'hero' ? { cardImage: id } : {}
  await ctx.payload.update({ collection: 'services', id: s.id, data: { gallery, ...card, _status: 'published' } as never, req: ctx.req, ...ok })
  await ctx.payload.delete({ collection: 'media', id: oldId, req: ctx.req, ...ok }).catch(() => null)
  ctx.log(`${slug}-${key}: yenilendi (${prefix})`)
}
