import type { Payload, PayloadRequest } from 'payload'

/**
 * Her hizmette altı soru (SSS iki sütunda üçer satır dolar): beş sorusu olan hizmetlere altıncı
 * eklenir. Panelde soru sayısı zaten altı ya da üstündeyse ya da aynı soru varsa dokunulmaz;
 * tekrar çalışırsa kopya üretmez. Metinler src/content/services.json'daki yedekle aynı. Bu dosya geçişe aittir.
 */
export const SSS_ALTINCI: Record<string, { q: string; a: string }> = {
  'dijital-reklam-yonetimi': {
    q: 'Dönüşüm takibini nasıl kuruyorsunuz?',
    a: "Form, arama, WhatsApp mesajı ya da satış gibi sizin için değerli işlemleri Google Etiket Yöneticisi, Meta pikseli ve dönüşüm API'siyle ölçecek şekilde kuruyoruz. Kampanyalar bu verilere göre optimize edildiği için takibin doğru çalıştığını reklamlar yayına girmeden önce test ediyoruz.",
  },
  'web-tasarim': {
    q: 'Site telefonda da hızlı ve düzgün görünecek mi?',
    a: "Evet. Tasarımı önce telefon ekranına göre planlıyor, her sayfayı farklı ekran boyutlarında test ediyoruz. Görselleri sıkıştırıp sayfaları hızlı açılacak şekilde kuruyor, yayından önce Google'ın PageSpeed ölçümleriyle kontrol ediyoruz.",
  },
  seo: {
    q: 'SEO için sitemi baştan yaptırmam gerekir mi?',
    a: 'Çoğu zaman hayır. Önce teknik bir denetimle mevcut sitenin hız, dizine eklenme ve yapı sorunlarını çıkarıyor, düzeltilebilecekleri mevcut sitede düzeltiyoruz. Altyapı SEO çalışmasını gerçekten engelliyorsa yenilemeyi o zaman öneriyoruz.',
  },
  'ozel-yazilim': {
    q: 'Proje bittikten sonra destek veriyor musunuz?',
    a: 'Evet. Yayından sonra hata düzeltmeleri, güvenlik güncellemeleri ve yedekleme için bakım desteği sunuyoruz; yeni özellik talepleri ayrıca planlanır. Destek kapsamı ve yanıt süreleri sözleşmede yazılı olarak belirtilir.',
  },
  'mobil-uygulama': {
    q: 'Uygulama fikrimi önce küçük bir sürümle deneyebilir miyim?',
    a: 'Evet. Tıklanabilir bir prototip ya da yalnız temel özellikleri içeren ilk sürümle (MVP) başlamak, büyük bir yatırım yapmadan kullanıcı tepkisini görmenizi sağlar. Gelen geri bildirime göre sonraki özellikleri birlikte planlıyoruz.',
  },
  'e-ticaret-yonetimi': {
    q: 'Stok ve siparişleri tek yerden yönetebilir miyim?',
    a: 'Evet. Sitenizi ve pazaryeri mağazalarınızı entegrasyon araçlarıyla bağlayarak stok, fiyat ve siparişlerin tek panelden takip edilmesini sağlıyoruz. Hangi aracın uygun olduğu, kullandığınız altyapıya ve satış kanalı sayınıza göre belirlenir.',
  },
  'grafik-tasarim': {
    q: 'Kurumsal kimlik çalışmasına neler dahil?',
    a: 'Logo, renk paleti ve yazı tipi seçiminin yanında kartvizit, antetli kâğıt, e-posta imzası ve sosyal medya şablonları gibi temel uygulamalar hazırlanır. Hangi uygulamaların yer alacağı ihtiyacınıza göre teklifte netleşir; isterseniz kullanım kurallarını anlatan bir marka kılavuzu da hazırlıyoruz.',
  },
  'sosyal-medya-yonetimi': {
    q: 'Yorum ve mesajlara kim yanıt veriyor?',
    a: 'Topluluk yönetimi pakete dahilse yorum ve mesajları belirlenen saatlerde biz yanıtlıyoruz. Fiyat, sipariş ya da şikâyet gibi sizin bilgi vermeniz gereken konuları size iletiyor, sık gelen sorular için birlikte hazır yanıtlar oluşturuyoruz.',
  },
}

const ok = { overrideAccess: true } as const

export async function sssTamamla(payload: Payload, req: PayloadRequest) {
  const log = (m: string) => payload.logger.info(`[sss] ${m}`)
  for (const [slug, item] of Object.entries(SSS_ALTINCI)) {
    const r = await payload.find({ collection: 'services', where: { slug: { equals: slug } }, limit: 1, depth: 0, draft: true, req, ...ok })
    const s = r.docs[0] as unknown as { id: number; faq?: { q: string; a: string }[] } | undefined
    if (!s) continue
    const faq = s.faq ?? []
    if (faq.length >= 6 || faq.some((f) => f.q.trim() === item.q)) continue
    await payload.update({ collection: 'services', id: s.id, data: { faq: [...faq, item], _status: 'published' } as never, req, ...ok })
    log(`${slug}: ${faq.length + 1}. soru eklendi`)
  }
}
