import { copyFileSync, existsSync, mkdtempSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import type { Payload, PayloadRequest, Where } from 'payload'
import services from '../../content/services.json'
import blogPosts from '../../content/blog-posts.json'
import { toLexical } from './lexical'

/**
 * 2026-10 büyük içerik güncellemesi (veri geçişi; şema değişikliği ayrı
 * dosyada). Hem canlıdaki Postgres geçişinden hem yerel `payload run`
 * betiğinden çağrılır. Tekrar çalışırsa kopya üretmez: kayıtlar slug ya da
 * adla bulunur, görseller dosya adıyla tek kez yüklenir.
 *
 * Bu dosya geçişe aittir: uygulama kodu değişse de bu haliyle kalmalı.
 */
type Ctx = { payload: Payload; req: PayloadRequest; log: (m: string) => void }
type Doc = Record<string, unknown> & { id: number }

const ROOT = process.cwd()
const ok = { overrideAccess: true } as const

/* ------------------------------------------------------------------ */
/*  Yardımcılar                                                        */
/* ------------------------------------------------------------------ */

async function one(ctx: Ctx, collection: string, where: Where, draft = false): Promise<Doc | null> {
  const r = await ctx.payload.find({ collection: collection as never, where, limit: 1, depth: 0, draft, req: ctx.req, ...ok })
  return (r.docs[0] as unknown as Doc) ?? null
}

async function folder(ctx: Ctx, name: string): Promise<number> {
  const hit = await one(ctx, 'payload-folders', { name: { equals: name } })
  if (hit) return hit.id
  const d = await ctx.payload.create({ collection: 'payload-folders' as never, data: { name, folderType: ['media'] } as never, req: ctx.req, ...ok })
  return (d as unknown as Doc).id
}

/** public/ altındaki dosyayı bir kez yükler; aynı adla yüklenmişse onu döndürür */
async function media(ctx: Ctx, rel: string, alt: string, folderName: string): Promise<number | null> {
  const file = path.join(ROOT, 'public', rel)
  if (!existsSync(file)) {
    ctx.log(`  ! dosya yok: public/${rel}`)
    return null
  }
  const base = path.basename(rel).replace(/\.[a-z0-9]+$/i, '')
  /* Yükleme webp'ye çevrilir: aynı taban adla (ör. secen.webp, secen-1.webp) ara */
  const hit = await one(ctx, 'media', { and: [{ filename: { like: `${base}.` } }, { alt: { equals: alt } }] })
  if (hit) return hit.id
  const d = await ctx.payload.create({
    collection: 'media',
    data: { alt, folder: await folder(ctx, folderName) } as never,
    filePath: file,
    req: ctx.req,
    ...ok,
  })
  return (d as unknown as Doc).id
}

const list = (items: string[]) => items.map((text) => ({ text }))

/* ------------------------------------------------------------------ */
/*  Site ayarları, ana sayfa, hakkımızda                               */
/* ------------------------------------------------------------------ */

const ANNOUNCE = [
  "2026'da da Google Partner'ız: reklam bütçeniz sertifikalı ellerde.",
  'Web sitesinden mobil uygulamaya, fikirden yayına tek ekip.',
  'SEO ile reklama bağımlı kalmadan büyüyen organik trafik.',
  'Marka tescilinden sosyal medyaya, markanızın her adımında yanınızdayız.',
]

async function settings(ctx: Ctx) {
  const s = (await ctx.payload.findGlobal({ slug: 'site-settings', depth: 0, req: ctx.req, ...ok })) as unknown as Record<string, Record<string, unknown>>
  await ctx.payload.updateGlobal({
    slug: 'site-settings',
    data: {
      announcement: {
        enabled: s.announcement?.enabled ?? true,
        text: 'Strateji, tasarım ve teknoloji tek çatıda.',
        more: list(ANNOUNCE),
      },
      contact: { ...s.contact, email: 'info@gurudijital.com', phone: '0850 308 34 57', whatsapp: '908503083457' },
      /* Alan adı .com: ziyaretçi sayımı yeni adreste de çalışsın */
      ...(s.analytics ? { analytics: { ...s.analytics, domains: String(s.analytics.domains ?? '').replace(/gurudijital\.com\.tr/g, 'gurudijital.com') } } : {}),
    } as never,
    req: ctx.req,
    ...ok,
  })
  ctx.log('site ayarları: e-posta, telefon, WhatsApp, 5 duyuru cümlesi')

  const h = (await ctx.payload.findGlobal({ slug: 'home-page', depth: 0, req: ctx.req, ...ok })) as unknown as Record<string, Record<string, unknown>>
  await ctx.payload.updateGlobal({
    slug: 'home-page',
    data: {
      hero: { ...h.hero, badgeStrong: 'grow with guru' },
      meet: { ...h.meet, title: /tanışalım/i.test(String(h.meet?.title ?? '')) ? 'İletişime geçin' : h.meet?.title },
      seo: { ...h.seo, title: 'Guru Dijital Ajans | grow with guru' },
    } as never,
    req: ctx.req,
    ...ok,
  })

  const a = (await ctx.payload.findGlobal({ slug: 'about-page', depth: 0, req: ctx.req, ...ok })) as unknown as Record<string, Record<string, unknown>>
  const awards = a.awards as { lead?: string; items?: Record<string, unknown>[] } | undefined
  await ctx.payload.updateGlobal({
    slug: 'about-page',
    data: {
      intro: { ...a.intro, primaryLabel: 'İletişim' },
      closing: { ...a.closing, primaryLabel: 'İletişime Geç' },
      awards: {
        ...awards,
        lead: "2025'te Google Partner olduk, 2026'da rozetimizi yeniledik; veri odaklı çalışmalarımızla Google Ads Impact Awards'ta aday gösterildik.",
        items: (awards?.items ?? []).map((it) =>
          it.title === 'Google Partner'
            ? {
                ...it,
                year: '2025 · 2026',
                desc: "Google'ın performans, reklam harcaması ve yetkinlik kriterlerini karşılayan ajanslara verilen rozet. 2026'da da yeniledik; reklam hesaplarınız bu standartlarla yönetilir.",
              }
            : it,
        ),
      },
    } as never,
    req: ctx.req,
    ...ok,
  })
  ctx.log('ana sayfa ve hakkımızda: "Tanışalım" kalktı, Google Partner 2025 · 2026')
}

/* ------------------------------------------------------------------ */
/*  Hizmetler                                                          */
/* ------------------------------------------------------------------ */

type Svc = (typeof services)[number]
const OLD = ['icerik-uretimi', 'dijital-pazarlama', 'video-tasarimi']

async function serviceRecords(ctx: Ctx) {
  for (const s of services as Svc[]) {
    const card = await media(ctx, `services/${s.slug}.webp`, `${s.title} hizmeti`, 'Hizmetler')
    const poster = await media(ctx, `services/${s.slug}-poster.webp`, `${s.title}: Guru Dijital`, 'Hizmetler')
    const existing = await one(ctx, 'services', { slug: { equals: s.slug } }, true)
    const data = {
      title: s.title,
      slug: s.slug,
      short: s.short,
      menuDesc: s.menuDesc,
      headline: s.headline,
      offeringsTitle: s.offeringsTitle,
      intro: list(s.intro),
      offerings: list(s.offerings),
      keywords: list(s.keywords),
      faq: s.faq,
      seoDescription: s.seoDescription,
      icon: s.icon,
      order: s.order,
      showCases: s.slug === 'dijital-reklam-yonetimi' || s.slug === 'seo',
      showWebProjects: s.slug === 'web-tasarim',
      ...(card ? { cardImage: card } : {}),
      ...(card || poster ? { gallery: [poster, card].filter(Boolean).map((image) => ({ image })) } : {}),
      _status: 'published',
    }
    if (existing) await ctx.payload.update({ collection: 'services', id: existing.id, data: data as never, req: ctx.req, ...ok })
    else await ctx.payload.create({ collection: 'services', data: data as never, req: ctx.req, ...ok })
  }
  const old = await ctx.payload.delete({ collection: 'services', where: { slug: { in: OLD } }, req: ctx.req, ...ok })
  ctx.log(`hizmetler: 9 hizmet yazıldı, ${old.docs.length} eski hizmet kaldırıldı (adresleri yeni sayfalara yönlenir)`)
}

/* ------------------------------------------------------------------ */
/*  Referanslar                                                        */
/* ------------------------------------------------------------------ */

/* [dosya adı (public/references), görünen ad, eski kayıttaki ad (varsa)] */
const BRANDS: [string, string, string?][] = [
  ['academic-hospital', 'Academic Hospital', 'Academic Hospital'],
  ['avrupa-dis', 'Avrupa Diş', 'Avrupa Diş'],
  ['aska-hotels', 'Aska Hotels', 'Aska Hotels'],
  ['bioslife', 'BiosLife', 'BiosLife'],
  ['telkoturk', 'Telkotürk', 'Telkotürk'],
  ['medipunto-clinic', 'Medipunto Clinic'],
  ['tac', 'Taç', 'Taç'],
  ['lionklinker', 'LionKlinker', 'LionKlinker'],
  ['clinic-p', 'Clinic P Plastic Surgery', 'Clinic P'],
  ['galata-estetik', 'Galata Estetik'],
  ['veggy-snacky', 'Veggy Snacky', 'Veggy Snacky'],
  ['konak-akademi', 'Konak Akademi'],
  ['smella', 'Smella', 'Smella'],
  ['mednificant', 'Mednificant'],
  ['navelli-home', 'Navelli Home', 'Navelli Home'],
  ['adalar-belediyesi', 'Adalar Belediyesi'],
  ['espina', 'Espina', 'Espina'],
  ['elf-industrial-automation', 'ELF Industrial Automation'],
  ['sofra-turke', 'Sofra Türke', 'Sofra Türke'],
  ['aytek-global', 'Aytek Global'],
  ['bulbulogullari', 'Bülbüloğulları', 'Bülbüloğulları'],
  ['turkey-wellness-travel', 'Turkey Wellness Travel'],
  ['kontrol-market', 'Kontrol Market', 'Kontrol Market'],
  ['lingonline', 'Lingonline'],
  ['umaysa', 'UmaysA', 'UmaysA'],
  ['burak-kavlakoglu', 'Prof. Dr. Burak Kavlakoğlu'],
  ['classy-sheen', 'Classy & Sheen', 'Classy & Sheen'],
  ['padre', 'Padre'],
  ['iyi-bulut', 'İyi Bulut', 'İyi Bulut'],
  ['bulent-tekerekoglu', 'Op. Dr. Bülent Tekerekoğlu'],
  ['ekto', 'Ekto', 'Ekto'],
  ['wctlife', 'WCTLife'],
  ['konum-kapadokya', 'Konum Kapadokya', 'Konum Kapadokya'],
  ['irem-savci-beauty', 'İrem Savcı Beauty'],
  ['mates', 'Mates', 'Mates'],
  ['deva-tarim', 'Deva Tarım'],
  ['secen', 'Secen', 'Secen Gross'],
  ['veranda-boys', 'Veranda Boys'],
  ['nog', 'NoG', 'NOG'],
  ['bk-collection', 'BK Collection'],
  ['seyma-elmas', 'Şeyma Elmas Fashion House', 'Şeyma Elmaş'],
  ['duyu-konutlari', 'Duyu Konutları'],
  ['sutre', 'Sutre', 'Sutre'],
  ['pusula-donusum', 'Pusula Dönüşüm'],
  ['elit-international', 'Elit International'],
  ['artakalan', 'Artakalan'],
  ['britten-akademi', 'Britten Akademi'],
  ['marmara-adalari-kulturel-miras', 'Marmara Adaları Kültürel Miras Derneği'],
  ['dc', 'DC'],
]

async function references(ctx: Ctx) {
  let created = 0
  let updated = 0
  for (const [i, [file, name, oldName]] of BRANDS.entries()) {
    const logo = await media(ctx, `references/${file}.png`, name, 'Referanslar')
    const existing = (oldName ? await one(ctx, 'references', { name: { equals: oldName } }) : null) ?? (await one(ctx, 'references', { name: { equals: name } }))
    const data = { name, order: (i + 1) * 10, ...(logo ? { logo } : {}) }
    if (existing) {
      await ctx.payload.update({ collection: 'references', id: existing.id, data: data as never, req: ctx.req, ...ok })
      updated++
    } else {
      await ctx.payload.create({ collection: 'references', data: data as never, req: ctx.req, ...ok })
      created++
    }
  }
  /* Logosu henüz gelmemiş eski markalar listenin sonunda, adlarıyla kalır */
  const rest = await ctx.payload.find({ collection: 'references', where: { logo: { exists: false } }, limit: 100, depth: 0, req: ctx.req, ...ok })
  for (const [j, r] of rest.docs.entries()) {
    await ctx.payload.update({ collection: 'references', id: r.id, data: { order: 1000 + j * 10 } as never, req: ctx.req, ...ok })
  }
  ctx.log(`referanslar: ${created} yeni, ${updated} güncellendi, ${rest.docs.length} logosuz marka sonda`)
}

/* ------------------------------------------------------------------ */
/*  SEO başarı hikâyeleri                                              */
/* ------------------------------------------------------------------ */

const CASES = [
  {
    sector: 'SEO / E-Ticaret',
    title: 'Reklam harcamasından bağımsız, kesintisiz organik büyüme',
    summary:
      'Markanın organik arama performansını devraldığımızda site trafiği potansiyelin oldukça altındaydı. Teknik SEO ve içerik mimarisini tamamen yenileyerek reklam bütçesine ihtiyaç duymadan kısa sürede kalıcı bir trafik artışı sağladık.',
    stats: [
      { value: 325, prefix: '%', label: 'Organik trafikte artış' },
      { value: 42, prefix: '%', label: 'Anahtar kelime ilk 3 sıra artışı' },
      { value: 35, prefix: '%', label: 'Organik kanaldan gelen ciro artışı' },
    ],
    note: 'Ek reklam maliyeti olmadan, 6 ayda kalıcı sıralama.',
  },
  {
    sector: 'SEO / Doğrudan Satış',
    title: 'Doğru anahtar kelime stratejisiyle rekor organik satış',
    summary:
      'Yönetimini devraldığımız e-ticaret sitesinde; yüksek hacimli ve satın alma niyetli arama terimlerine odaklanarak kategori mimarisini optimize ettik. Kullanıcı deneyimi odaklı iyileştirmelerle organik gelirleri hızla yukarı taşıdık.',
    stats: [
      { value: 215, prefix: '%', label: 'Organik gelir artışı' },
      { value: 90, prefix: '%', label: 'Organik dönüşüm oranında artış' },
      { value: 50, prefix: '%', label: 'Müşteri edinim maliyetinde azalma' },
    ],
    note: 'Sürdürülebilir SEO altyapısı ile organik satışlarda rekor kırıldı.',
  },
  {
    sector: 'SEO / Sağlık Turizmi',
    title: 'Uluslararası aramalarda zirve, çok dilli SEO ile küresel hasta akışı',
    summary:
      'Sağlık turizmi hizmeti veren kliniğin küresel pazardaki dijital varlığını güçlendirmek için çok dilli teknik altyapı, hedef odaklı içerikler ve uluslararası otorite inşası gerçekleştirdik. Yabancı hasta potansiyeli yüksek hedef ülkelerde üst sıralara yerleştik.',
    stats: [
      { value: 410, prefix: '%', label: 'Uluslararası organik trafik artışı' },
      { value: 190, prefix: '%', label: 'Yabancı hasta başvuru formu artışı' },
      { value: 40, prefix: '%', label: 'Hasta edinme maliyetinde düşüş' },
    ],
    note: 'Doğru hedefleme ve uluslararası SEO ile 6 ayda küresel başarı.',
  },
]

async function cases(ctx: Ctx) {
  for (const [i, c] of CASES.entries()) {
    const existing = await one(ctx, 'case-studies', { title: { equals: c.title } })
    /* Üç rakam da kartta; ana sayfada ilk iki SEO hikâyesi (eski iki vakayla dört kart) */
    const data = { ...c, stats: c.stats.map((st) => ({ ...st, featured: true })), showOnHome: i < 2, order: 100 + i * 10 }
    if (existing) await ctx.payload.update({ collection: 'case-studies', id: existing.id, data: data as never, req: ctx.req, ...ok })
    else await ctx.payload.create({ collection: 'case-studies', data: data as never, req: ctx.req, ...ok })
  }
  ctx.log('başarı hikâyeleri: 3 SEO hikâyesi')
}

/* ------------------------------------------------------------------ */
/*  Ekip ve yorumlar                                                   */
/* ------------------------------------------------------------------ */

const LINKEDIN = 'https://tr.linkedin.com/company/gurudijital'
const TEAM = [
  { file: 'adil-can', name: 'Adil Can', role: 'Dijital Reklam, SEO ve Marka Tescil' },
  { file: 'furkan', name: 'Furkan', role: 'Web Tasarım ve Özel Yazılım' },
  { file: 'onur', name: 'Onur', role: 'Mobil Uygulama ve E-Ticaret' },
  { file: 'yasemin', name: 'Yasemin', role: 'Grafik Tasarım ve Sosyal Medya' },
]

async function team(ctx: Ctx) {
  for (const [i, m] of TEAM.entries()) {
    const photo = await media(ctx, `team/${m.file}.webp`, `${m.name}, ${m.role}`, 'Ekip')
    const existing = await one(ctx, 'team', { name: { equals: m.name } })
    const data = { name: m.name, role: m.role, linkedin: LINKEDIN, showOnHome: true, order: (i + 1) * 10, ...(photo ? { photo } : {}) }
    if (existing) await ctx.payload.update({ collection: 'team', id: existing.id, data: data as never, req: ctx.req, ...ok })
    else await ctx.payload.create({ collection: 'team', data: data as never, req: ctx.req, ...ok })
  }
  /* "Ad Soyad" yer tutucuları artık gerekmiyor */
  const r = await ctx.payload.delete({ collection: 'team', where: { name: { equals: 'Ad Soyad' } }, req: ctx.req, ...ok })
  ctx.log(`ekip: 4 kişi (LinkedIn bağlantılı), ${r.docs.length} yer tutucu silindi`)
}

/* Örnek yorumlar: yayın izni (consent) kapalı, sitede GÖRÜNMEZ; gerçek yorum ve
   videolar gelince panelden doldurulup izin işaretlenir. */
const QUOTES = [
  { name: 'Örnek müşteri', title: 'Pazarlama Müdürü', company: 'Sağlık sektörü', quote: 'Örnek yorum: gerçek müşteri yorumu ve videosu gelince bu kaydın yerine girilecek.' },
  { name: 'Örnek müşteri', title: 'Kurucu', company: 'E-ticaret', quote: 'Örnek yorum: gerçek müşteri yorumu ve videosu gelince bu kaydın yerine girilecek.' },
  { name: 'Örnek müşteri', title: 'Genel Müdür', company: 'Turizm', quote: 'Örnek yorum: gerçek müşteri yorumu ve videosu gelince bu kaydın yerine girilecek.' },
]

async function testimonials(ctx: Ctx) {
  const r = await ctx.payload.find({ collection: 'testimonials', where: { name: { in: ['Müşteri adı', 'Örnek müşteri'] } }, limit: 20, depth: 0, req: ctx.req, ...ok })
  for (const [i, q] of QUOTES.entries()) {
    const photo = await media(ctx, `testimonials/ornek-${i + 1}.webp`, `Örnek müşteri yorumu ${i + 1}`, 'Kurumsal')
    const data = { ...q, consent: false, order: (i + 1) * 10, ...(photo ? { photo } : {}) }
    const existing = r.docs[i]
    if (existing) await ctx.payload.update({ collection: 'testimonials', id: existing.id, data: data as never, req: ctx.req, ...ok })
    else await ctx.payload.create({ collection: 'testimonials', data: data as never, req: ctx.req, ...ok })
  }
  ctx.log('yorumlar: 3 örnek kayıt (yayın izni kapalı, sitede görünmez)')
}

/* ------------------------------------------------------------------ */
/*  Süreç şablonları (Guru Dijital): her hizmet için                   */
/* ------------------------------------------------------------------ */

type Step = [title: string, offset: number, duration: number, hours: number, priority?: 'dusuk' | 'normal' | 'yuksek']
const TEMPLATES: { name: string; description: string; steps: Step[] }[] = [
  { name: 'Dijital Reklam Yönetimi', description: 'Google, Meta ve diğer kanallarda kampanya kurulumu ve aylık optimizasyon.', steps: [['Hedef, bütçe ve KPI görüşmesi', 0, 1, 2, 'yuksek'], ['Hesap erişimleri ve dönüşüm takibi (GA4, etiketler)', 1, 2, 4, 'yuksek'], ['Kitle ve anahtar kelime araştırması', 2, 2, 5], ['Reklam metinleri ve görselleri', 3, 3, 6], ['Kampanyaların kurulumu ve yayına alınması', 6, 1, 4, 'yuksek'], ['İlk hafta optimizasyonu', 7, 5, 4], ['Aylık rapor ve sonraki ay planı', 30, 1, 3]] },
  { name: 'Web Tasarım Hizmetleri', description: 'Kurumsal web sitesi: keşiften yayına.', steps: [['Keşif toplantısı ve site haritası', 0, 2, 4, 'yuksek'], ['İçerik ve görsel listesinin toplanması', 2, 5, 3], ['Tasarım taslağı (ana sayfa ve iç sayfa)', 4, 5, 16, 'yuksek'], ['Tasarım revizyonları', 9, 3, 6], ['Geliştirme ve içerik girişi', 12, 10, 40], ['SEO temel ayarları ve hız testleri', 22, 2, 6], ['Test, yayına alma ve eğitim', 24, 2, 6, 'yuksek']] },
  { name: 'SEO (Arama Motoru Optimizasyonu)', description: 'Teknik SEO, içerik mimarisi ve aylık takip.', steps: [['Teknik SEO denetimi', 0, 3, 8, 'yuksek'], ['Anahtar kelime ve rakip analizi', 2, 3, 8], ['İçerik mimarisi ve sayfa planı', 5, 3, 6], ['Teknik düzeltmelerin uygulanması', 7, 7, 16, 'yuksek'], ['İçerik üretimi ve sayfa optimizasyonu', 10, 15, 24], ['Search Console ve sıralama takibi', 14, 30, 4], ['Aylık SEO raporu', 30, 1, 3]] },
  { name: 'Özel Yazılım Hizmetleri', description: 'Panel, entegrasyon ya da web uygulaması geliştirme.', steps: [['İhtiyaç analizi ve kapsam belgesi', 0, 5, 12, 'yuksek'], ['Mimari ve veri modeli', 5, 3, 10], ['Arayüz tasarımı', 6, 7, 20], ['Geliştirme (1. sürüm)', 10, 20, 80, 'yuksek'], ['Test ve hata düzeltmeleri', 30, 5, 16], ['Canlıya alma ve eğitim', 35, 2, 6, 'yuksek'], ['Bakım ve destek planı', 37, 1, 2]] },
  { name: 'Mobil Uygulama', description: 'iOS ve Android uygulaması: tasarımdan mağaza yayınına.', steps: [['Kapsam, ekran listesi ve akışlar', 0, 5, 12, 'yuksek'], ['Arayüz tasarımı ve prototip', 5, 10, 32], ['Uygulama geliştirme', 15, 30, 120, 'yuksek'], ['Sunucu ve bildirim entegrasyonları', 20, 15, 30], ['Test cihazlarında deneme', 45, 5, 16], ['App Store ve Google Play yayını', 50, 5, 8, 'yuksek'], ['Yayın sonrası izleme', 55, 10, 6]] },
  { name: 'Marka Tescil', description: 'TÜRKPATENT başvurusu ve tescil süreci takibi.', steps: [['Marka ve sınıf görüşmesi', 0, 1, 1, 'yuksek'], ['Benzer marka araştırması ve risk raporu', 1, 2, 3, 'yuksek'], ['Nice sınıfları ve mal/hizmet listesi', 3, 2, 2], ['Başvurunun hazırlanması ve yapılması', 5, 2, 2, 'yuksek'], ['Resmi Marka Bülteni yayın takibi', 60, 60, 1], ['İtiraz süreci takibi', 60, 60, 2], ['Tescil belgesi ve yenileme hatırlatması', 150, 2, 1]] },
  { name: 'E-Ticaret Yönetimi', description: 'Mağaza kurulumu, pazaryerleri ve aylık operasyon.', steps: [['Platform ve pazaryeri planı', 0, 2, 4, 'yuksek'], ['Mağaza kurulumu ve tema', 2, 7, 24], ['Ürün içerikleri ve görselleri', 4, 10, 30], ['Ödeme, kargo ve entegrasyonlar', 9, 3, 8, 'yuksek'], ['Pazaryeri mağazaları (Trendyol, Hepsiburada vb.)', 12, 5, 12], ['Kampanya takvimi ve reklamlar', 15, 5, 8], ['Aylık satış ve operasyon raporu', 30, 1, 3]] },
  { name: 'Grafik Tasarım Hizmetleri', description: 'Logo, kurumsal kimlik ve basılı/dijital tasarımlar.', steps: [['Brif ve referans toplama', 0, 1, 2, 'yuksek'], ['Moodboard ve yön önerisi', 1, 3, 6], ['İlk taslaklar', 4, 4, 12, 'yuksek'], ['Revizyonlar', 8, 3, 6], ['Final dosyalar ve kullanım kılavuzu', 11, 2, 6], ['Teslim ve arşivleme', 13, 1, 1]] },
  { name: 'Sosyal Medya Yönetimi', description: 'Aylık içerik planı, üretim, yayın ve raporlama.', steps: [['Aylık strateji ve içerik takvimi', 0, 3, 6, 'yuksek'], ['Takvimin müşteri onayı', 3, 2, 1, 'yuksek'], ['Görsel ve video üretimi', 4, 7, 24], ['Metinler ve hashtag planı', 4, 5, 8], ['Yayın planlaması', 10, 2, 3], ['Topluluk yönetimi (mesaj ve yorumlar)', 10, 20, 12], ['Aylık performans raporu', 30, 1, 3]] },
]

async function templates(ctx: Ctx) {
  const guru = await one(ctx, 'tenants', { slug: { equals: 'guru' } })
  if (!guru) return ctx.log('şablonlar: Guru Dijital işletmesi bulunamadı, atlandı')
  let n = 0
  for (const t of TEMPLATES) {
    const existing = await one(ctx, 'templates', { and: [{ name: { equals: t.name } }, { tenant: { equals: guru.id } }] })
    if (existing) continue
    await ctx.payload.create({
      collection: 'templates',
      data: {
        tenant: guru.id,
        name: t.name,
        description: t.description,
        steps: t.steps.map(([title, offset, duration, hours, priority]) => ({ title, offset, duration, hours, priority: priority ?? 'normal' })),
      } as never,
      req: ctx.req,
      ...ok,
    })
    n++
  }
  ctx.log(`şablonlar: ${n} hizmet şablonu eklendi`)
}

/* ------------------------------------------------------------------ */
/*  Bilgi tabanı: eski metinler                                        */
/* ------------------------------------------------------------------ */

async function knowledge(ctx: Ctx) {
  const r = await ctx.payload.find({ collection: 'knowledge', where: { content: { like: 'Tanışalım' } }, limit: 200, depth: 0, req: ctx.req, ...ok })
  for (const k of r.docs as unknown as (Doc & { content: string })[]) {
    await ctx.payload.update({ collection: 'knowledge', id: k.id, data: { content: k.content.replace(/Tanışalım/g, 'İletişim') } as never, req: ctx.req, ...ok })
  }
  ctx.log(`bilgi tabanı: ${r.docs.length} kayıtta "Tanışalım" düzeltildi`)
}

/* ------------------------------------------------------------------ */
/*  Blog: 10 yazı (iki eski yazı aynı adresle yenilenir)               */
/* ------------------------------------------------------------------ */

async function posts(ctx: Ctx) {
  const cats: Record<string, number> = {}
  for (const name of [...new Set(blogPosts.map((p) => p.category))]) {
    const hit = await one(ctx, 'categories', { title: { equals: name } })
    cats[name] = hit ? hit.id : ((await ctx.payload.create({ collection: 'categories', data: { title: name } as never, req: ctx.req, ...ok })) as unknown as Doc).id
  }
  let n = 0
  for (const p of blogPosts) {
    const cover = await media(ctx, `blog/${p.slug}.webp`, p.title, 'Blog')
    const existing = await one(ctx, 'posts', { slug: { equals: p.slug } }, true)
    const data = {
      title: p.title,
      slug: p.slug,
      excerpt: p.excerpt,
      content: toLexical(p.blocks as never),
      category: cats[p.category],
      publishedAt: p.publishedAt,
      seo: { title: p.title.length <= 60 ? p.title : undefined, description: p.seoDescription },
      ...(cover ? { cover } : {}),
      _status: 'published',
    }
    if (existing) await ctx.payload.update({ collection: 'posts', id: existing.id, data: data as never, req: ctx.req, ...ok })
    else await ctx.payload.create({ collection: 'posts', data: data as never, req: ctx.req, ...ok })
    n++
  }
  ctx.log(`blog: ${n} yazı, ${Object.keys(cats).length} kategori`)
}

/* ------------------------------------------------------------------ */
/*  Ürün görselleri: yeniden üretilen dosyalar aynı medya kaydına      */
/* ------------------------------------------------------------------ */

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
      const m = await one(ctx, 'media', { filename: { equals: `${stem}.webp` } })
      if (!m) continue
      /* Dosya, medyanın kendi adıyla yüklenir: aynı adlı başka bir medyanın dosyası ezilmesin */
      const tmp = path.join(mkdtempSync(path.join(os.tmpdir(), 'guru-')), `${stem}.webp`)
      copyFileSync(file, tmp)
      await ctx.payload.update({ collection: 'media', id: m.id, data: {} as never, filePath: tmp, overwriteExistingFiles: true, req: ctx.req, ...ok })
      n++
    }
  }
  ctx.log(`ürün görselleri: ${n} medya yeni dosyayla güncellendi`)
}

/* ------------------------------------------------------------------ */
/*  Medya klasörleri: klasörsüz görseller kullanıldıkları yere göre    */
/* ------------------------------------------------------------------ */

async function mediaFolders(ctx: Ctx) {
  const used = new Map<number, string>()
  const mark = (id: unknown, f: string) => {
    const n = typeof id === 'object' && id ? (id as Doc).id : (id as number)
    if (n && !used.has(n)) used.set(n, f)
  }
  const all = async (collection: string) => (await ctx.payload.find({ collection: collection as never, limit: 1000, depth: 0, pagination: false, req: ctx.req, ...ok })).docs as unknown as Doc[]
  for (const d of await all('references')) mark(d.logo, 'Referanslar')
  for (const d of await all('services')) {
    mark(d.cardImage, 'Hizmetler')
    for (const g of (d.gallery as { image: unknown }[] | undefined) ?? []) mark(g.image, 'Hizmetler')
  }
  for (const d of await all('products')) for (const v of Object.values(d)) if (typeof v === 'number' || (v && typeof v === 'object' && 'filename' in (v as object))) mark(v, 'Ürünler')
  for (const d of await all('posts')) mark(d.cover, 'Blog')
  for (const d of await all('team')) mark(d.photo, 'Ekip')
  for (const d of await all('testimonials')) mark(d.photo, 'Kurumsal')
  const loose = await ctx.payload.find({ collection: 'media', where: { folder: { exists: false } }, limit: 1000, depth: 0, pagination: false, req: ctx.req, ...ok })
  let moved = 0
  for (const m of loose.docs as unknown as Doc[]) {
    const f = used.get(m.id) ?? (/(odul|partner|impact)/i.test(String(m.filename)) ? 'Kurumsal' : 'Portfolyo')
    await ctx.payload.update({ collection: 'media', id: m.id, data: { folder: await folder(ctx, f) } as never, req: ctx.req, ...ok })
    moved++
  }
  ctx.log(`medya: ${moved} klasörsüz görsel klasörlere yerleşti`)
}

/* ------------------------------------------------------------------ */

export const STEPS = { settings, serviceRecords, references, cases, team, testimonials, templates, knowledge, posts, productVisuals, mediaFolders }

export async function buyukGuncelleme(payload: Payload, req: PayloadRequest, only?: (keyof typeof STEPS)[]) {
  const ctx: Ctx = { payload, req, log: (m) => payload.logger.info(`[güncelleme] ${m}`) }
  for (const [name, fn] of Object.entries(STEPS)) {
    if (only && !only.includes(name as keyof typeof STEPS)) continue
    await fn(ctx)
  }
}
