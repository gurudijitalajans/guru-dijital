import type { IconName } from "@/lib/icon-names";

/**
 * Ürün sayfalarının ek bölümleri: VARSAYILAN/YEDEK içerik (canlıda panel >
 * Ürünler). Kural: uydurma rakam yok; süre ve kapsam ifadeleri ürün SSS'lerinde
 * zaten taahhüt edilen bilgilerle aynıdır. Görseller public/products altında
 * (scratchpad'deki HTML şablonlarından üretildi, marka ışık yelpazesiyle).
 */

export type ShowcaseItem = {
  /** Küçük üst etiket (ör. "Gelen kutusu") */
  eyebrow: string;
  title: string;
  desc: string;
  bullets: string[];
  image: { src: string; alt: string; w: number; h: number };
};

export type ProductExtras = {
  /** Giriş bölümündeki kısa güven ifadeleri (3) */
  trust: string[];
  /** Marka kimliğinde ürün görseli (giriş, 4:3) */
  heroVisual: { src: string; alt: string; w: number; h: number };
  /** Sosyal paylaşım görseli (1200x630) */
  ogImage: string;
  /** Ürün turu videosu */
  video: { src: string; poster: string; title: string };
  showcase: ShowcaseItem[];
  comparison: { before: string[]; after: string[] };
  included: { icon: IconName; title: string; desc: string }[];
  /** Paket ürünlerde içerdiği modüller (ürün adresleri) */
  bundle?: string[];
};

const V = (slug: string, n: number, alt: string): ShowcaseItem["image"] => ({
  src: `/products/visuals/${slug}-${n}.webp`,
  alt,
  w: 1200,
  h: 900,
});
const hero = (slug: string, alt: string) => ({ src: `/products/visuals/${slug}-hero.webp`, alt, w: 1600, h: 1200 });
const video = (slug: string, name: string) => ({
  src: `/video/products/${slug}.mp4`,
  poster: `/video/products/${slug}.jpg`,
  title: `${name} Ürün Turu`,
});

export const productExtras: Record<string, ProductExtras> = {
  "guru-chatbot": {
    trust: ["Standart kurulum aynı gün", "Web, WhatsApp ve Instagram", "Türkçe destek dahil"],
    heroVisual: hero("guru-chatbot", "Guru Chatbot paneli: gelen kutusu, Guru Bot'un yanıtladığı sohbet ve konuşma istatistikleri"),
    ogImage: "/products/og/guru-chatbot.jpg",
    video: video("guru-chatbot", "Guru Chatbot"),
    showcase: [
      {
        eyebrow: "Gelen kutusu",
        title: "Tüm mesajlar tek gelen kutusunda",
        desc: "Web sitenizden, WhatsApp'tan ve Instagram'dan gelen her konuşma aynı listede toplanır. Ekibiniz kanal kanal dolaşmadan hangi müşterinin ne beklediğini görür.",
        bullets: [
          "Kanal rozetiyle mesajın nereden geldiği bir bakışta",
          "Tümü, Bot ve Ekip filtreleriyle öncelik sırası",
          "Her müşterinin konuşma geçmişi tek yerde",
        ],
        image: V("guru-chatbot", 1, "Guru Chatbot gelen kutusu: WhatsApp, Instagram ve web sitesinden gelen konuşmalar tek listede"),
      },
      {
        eyebrow: "Akıllı devir",
        title: "Asistan yanıtlar, gerektiğinde ekibe devreder",
        desc: "Guru Bot sipariş, kargo, fiyat ve iade sorularını yalnız sizin onayladığınız bilgilerle yanıtlar. Emin olmadığı ya da satış fırsatı gördüğü konuşmayı ekibe önerir; temsilci tek tıkla devralır.",
        bullets: [
          "Onaylı bilgi tabanından tutarlı yanıtlar",
          "\"Ekibe Aktar\" önerisiyle kesintisiz devir",
          "Hazır yanıt kısayollarıyla hızlı müdahale",
        ],
        image: V("guru-chatbot", 2, "Guru Bot'un yanıtladığı sohbet ve konuşmayı ekibe aktarma önerisi"),
      },
      {
        eyebrow: "Konuşma analitiği",
        title: "Hangi soru, ne kadar sürede çözülüyor",
        desc: "Ortalama yanıt süresi, çözüm oranı ve günlük konuşma hacmi panelde canlı izlenir. En çok sorulan konuları görerek bilgi tabanını veriyle güçlendirirsiniz.",
        bullets: [
          "Yanıt süresi ve çözüm oranı tek ekranda",
          "Günlük ve haftalık konuşma grafiği",
          "Kanal ve konu bazında karşılaştırma",
        ],
        image: V("guru-chatbot", 3, "Guru Chatbot raporları: ortalama yanıt süresi, çözüm oranı ve haftalık konuşma grafiği"),
      },
    ],
    comparison: {
      before: [
        "Mesajlar WhatsApp, Instagram ve e-posta arasında dağılır",
        "Mesai dışında gelen sorular sabaha kalır",
        "Aynı sorular her gün yeniden elle yanıtlanır",
        "Hangi talebin kime düştüğü belirsiz kalır",
      ],
      after: [
        "Tüm kanallar tek gelen kutusunda toplanır",
        "Sık sorulan sorular 7/24 anında yanıtlanır",
        "Ekip yalnız insan gerektiren konuşmalarla ilgilenir",
        "Her talep doğru kişiye kayıtlı olarak devredilir",
      ],
    },
    included: [
      { icon: "handshake", title: "Kurulum bizden", desc: "Kanalları bağlar, bilgi tabanını ve yanıt akışlarını sizinle birlikte kurarız." },
      { icon: "users", title: "Ekip eğitimi", desc: "Panel için canlı eğitim verir, ilk ay yanıt kalitesini birlikte izleriz." },
      { icon: "shield", title: "KVKK ve güvenlik", desc: "Konuşmalar şifreli saklanır; aydınlatma metni ve açık rıza akışı sohbete eklenir." },
      { icon: "message", title: "Türkçe destek", desc: "Teknik destek ve düzenli güncellemeler aboneliğinize dahildir." },
    ],
  },

  "guru-crm": {
    trust: ["Temel kurulum bir hafta", "Excel ve CRM verisi aktarımı", "Kayıt sayısında sınır yok"],
    heroVisual: hero("guru-crm", "Guru CRM paneli: satış hattı aşamaları, fırsat kartları ve gelir trendi"),
    ogImage: "/products/og/guru-crm.jpg",
    video: video("guru-crm", "Guru CRM"),
    showcase: [
      {
        eyebrow: "Satış hattı",
        title: "Hangi fırsat hangi aşamada, tek bakışta",
        desc: "Fırsatlar Aday, Görüşme, Teklif ve Kazanıldı aşamalarında kart olarak durur. Her aşamada bekleyen tutarı, sorumlu temsilciyi ve kapanma olasılığını aynı ekranda görürsünüz.",
        bullets: [
          "Sürükle bırak ile aşama değişikliği",
          "Aşama başına toplam tutar ve fırsat sayısı",
          "Kapanma olasılığına göre önceliklendirme",
        ],
        image: V("guru-crm", 1, "Guru CRM satış hattı: Aday, Görüşme, Teklif ve Kazanıldı aşamalarında fırsat kartları"),
      },
      {
        eyebrow: "Teklif ve takip",
        title: "Teklif, hatırlatma ve görüşme aynı kartta",
        desc: "Hazır şablonlarla markalı teklif hazırlayın, e-posta ya da WhatsApp ile gönderin. Son tarihi yaklaşan teklifler ve takip aramaları otomatik hatırlatılır; hiçbir fırsat unutulmaz.",
        bullets: [
          "Şablondan dakikalar içinde teklif",
          "Son tarihi bugün olan işler vurgulu",
          "Görüşme notları ve mesajlar müşteri kartında",
        ],
        image: V("guru-crm", 2, "Teklif aşamasındaki fırsatlar ve bugün son tarihli teklif hatırlatması"),
      },
      {
        eyebrow: "Raporlar",
        title: "Ciroyu tahmin edin, ekibi veriyle yönetin",
        desc: "Açık fırsat, pipeline değeri, kazanma oranı ve aylık gelir trendi hazır raporlarla elinizde. Geçen yılla karşılaştırarak hedefleri gerçekçi koyarsınız.",
        bullets: [
          "Pipeline değeri ve kazanma oranı",
          "Aylık gelir trendi, geçen yılla karşılaştırma",
          "Temsilci ve kaynak bazında dönüşüm",
        ],
        image: V("guru-crm", 3, "Guru CRM gelir trendi grafiği ve satış göstergeleri"),
      },
    ],
    comparison: {
      before: [
        "Müşteri bilgileri Excel, telefon rehberi ve not defterinde",
        "Teklifin hangi aşamada olduğu toplantıda sorulur",
        "Takip araması unutulur, fırsat soğur",
        "Ay sonu raporu saatler sürer",
      ],
      after: [
        "Her müşteri tek kartta, tüm ekip aynı bilgiyi görür",
        "Satış hattı aşama aşama ve tutarıyla görünür",
        "Hatırlatmalar zamanında gelir, fırsat kaçmaz",
        "Raporlar hazır, haftalık değerlendirme dakikalar sürer",
      ],
    },
    included: [
      { icon: "database", title: "Veri aktarımı", desc: "Excel ve mevcut CRM verinizi alan eşleştirmesiyle taşır, mükerrer kayıtları temizleriz." },
      { icon: "users", title: "Canlı ekip eğitimi", desc: "Kurulumdan sonra eğitim oturumları düzenler, ilk haftalarda yanınızda oluruz." },
      { icon: "shield", title: "Rol bazlı yetki", desc: "Kimin hangi müşteriyi ve tutarı göreceğini siz belirlersiniz; veriler şifreli saklanır ve yedeklenir." },
      { icon: "message", title: "Türkçe destek", desc: "Yardım merkezi ve teknik destek aboneliğinize dahildir." },
    ],
  },

  "guru-operation": {
    trust: ["İlk gün görev takibiyle başlayın", "Ekip büyüklüğü sınırı yok", "Guru CRM ile bütünleşik"],
    heroVisual: hero("guru-operation", "Guru Operation paneli: görev panosu, ekip kapasitesi ve haftalık zaman çizelgesi"),
    ogImage: "/products/og/guru-operation.jpg",
    video: video("guru-operation", "Guru Operation"),
    showcase: [
      {
        eyebrow: "Görev panosu",
        title: "Her iş, sorumlusu ve tarihiyle panoda",
        desc: "Görevler Yapılacak, Devam, Kontrol ve Tamam aşamalarında öncelik etiketiyle görünür. Kimin hangi işi hangi tarihe kadar teslim edeceği tartışma konusu olmaktan çıkar.",
        bullets: [
          "Yüksek, Orta ve Düşük öncelik etiketleri",
          "Görev numarası ve sorumlu her kartta",
          "Kontrol aşamasıyla onaysız iş kapanmaz",
        ],
        image: V("guru-operation", 1, "Guru Operation görev panosu: Yapılacak, Devam, Kontrol ve Tamam sütunları"),
      },
      {
        eyebrow: "Ekip kapasitesi",
        title: "Kimin ne kadar yükü olduğunu önceden görün",
        desc: "Ekip kapasitesi haftalık olarak yüzdeyle izlenir. Fazla yüklenen ekip üyesini ve boşta kalan kapasiteyi fark ederek işleri teslim tarihi gelmeden dengelersiniz.",
        bullets: [
          "Kişi bazında haftalık doluluk",
          "Aşırı yükte renkli uyarı",
          "İş dağılımını tek ekrandan dengeleme",
        ],
        image: V("guru-operation", 2, "Ekip kapasitesi: kişi bazında haftalık doluluk oranları"),
      },
      {
        eyebrow: "Zaman çizelgesi",
        title: "Haftanın planı tek çizelgede",
        desc: "Süren işlerin başlangıç ve bitişleri haftalık zaman çizelgesinde yan yana durur. Bugün çizgisiyle hangi işin gecikme riski taşıdığını toplantı yapmadan görürsünüz.",
        bullets: [
          "Haftalık çizelgede tüm süreçler",
          "Bugün çizgisiyle gecikme riski",
          "Zamanında tamamlanan iş oranıyla süreç sağlığı",
        ],
        image: V("guru-operation", 3, "Haftalık zaman çizelgesi ve bugün çizgisi"),
      },
    ],
    comparison: {
      before: [
        "Görevler WhatsApp gruplarında ve sözlü talimatlarla dağılır",
        "Kimin neyle meşgul olduğu ancak sorunca öğrenilir",
        "Geciken iş teslim günü fark edilir",
        "Tekrarlayan süreçler her seferinde baştan anlatılır",
      ],
      after: [
        "Her görev sorumlusu, önceliği ve tarihiyle panoda",
        "Ekip kapasitesi haftalık olarak görünür",
        "Gecikme riski çizelgede önceden belirir",
        "Süreçler şablondan açılır, adımlar otomatik dağılır",
      ],
    },
    included: [
      { icon: "workflow", title: "Süreç haritalama", desc: "Mevcut iş akışlarınızı birlikte çıkarır, adımları şablona dönüştürürüz." },
      { icon: "users", title: "Rol bazlı eğitim", desc: "Her rol için eğitim oturumu düzenler, ilk haftalarda kullanımı yakından izleriz." },
      { icon: "shield", title: "Güvenlik ve erişim kaydı", desc: "Veriler şifreli saklanır ve yedeklenir; her kullanıcı yalnız kendi işini görür." },
      { icon: "message", title: "Türkçe destek", desc: "Destek ekibimiz ve yardım içerikleri aboneliğe dahildir." },
    ],
  },

  "guru-business": {
    trust: ["Üç modül, tek giriş", "İlk modül iki haftada canlıda", "Size atanan müşteri başarı yöneticisi"],
    heroVisual: hero("guru-business", "Guru Business genel bakış panosu: göstergeler, modül özetleri ve aktivite akışı"),
    ogImage: "/products/og/guru-business.jpg",
    video: video("guru-business", "Guru Business"),
    bundle: ["guru-chatbot", "guru-crm", "guru-operation"],
    showcase: [
      {
        eyebrow: "Genel bakış",
        title: "İşletmenin nabzı her sabah tek ekranda",
        desc: "Aktif müşteri, aylık gelir, açık görev ve bot çözüm oranı yönetici panosunda geçen dönemle karşılaştırmalı görünür. Rapor istemeden durumu bilirsiniz.",
        bullets: ["Dört ana gösterge tek satırda", "Geçen döneme göre değişim", "Tek tıkla rapor indirme"],
        image: V("guru-business", 1, "Guru Business yönetici panosu: aktif müşteri, aylık gelir, açık görev ve bot çözüm oranı"),
      },
      {
        eyebrow: "Modüller",
        title: "Chatbot, CRM ve Operation birlikte çalışır",
        desc: "Her modülün özeti aynı panoda durur: kaç sohbet yanıtlandı, kaç fırsat açık, ekip kapasitesi ne durumda. Bir modüle giren kayıt diğerinde hazır bekler.",
        bullets: ["Modül başına canlı özet", "Tek veri tabanı, tekrar eden giriş yok", "Tek girişle tüm modüllere erişim"],
        image: V("guru-business", 2, "Guru Chatbot, Guru CRM ve Guru Operation modül özetleri tek panoda"),
      },
      {
        eyebrow: "Aktivite akışı",
        title: "Müşterinin yolculuğu ilk mesajdan teslimata",
        desc: "Chatbot'ta yanıtlanan soru, CRM'de gönderilen teklif ve Operation'da tamamlanan iş tek zaman akışında görünür. Kim, ne zaman, ne yaptı sorusunun cevabı hep hazırdır.",
        bullets: ["Modüller arası ortak aktivite akışı", "Kişi ve saat bilgisiyle kayıt", "Gelir kaynağı dağılımı ve hedef takibi"],
        image: V("guru-business", 3, "Modüller arası son aktiviteler akışı"),
      },
    ],
    comparison: {
      before: [
        "Mesaj, satış ve operasyon ayrı araçlarda ve ayrı tablolarda",
        "Aynı müşteri bilgisi her sistemde yeniden girilir",
        "Yönetici durumu öğrenmek için herkese ayrı ayrı sorar",
        "Departmanlar arası devirde bilgi kaybolur",
      ],
      after: [
        "Üç modül aynı veri tabanında, tek girişle",
        "Bilgi bir kez girilir, her modülde hazır",
        "Yönetici panosu işletmenin durumunu anlık gösterir",
        "Talep, teklif ve iş aynı akışta kesintisiz ilerler",
      ],
    },
    included: [
      { icon: "target", title: "Keşif ve süreç haritası", desc: "Müşteri, satış ve operasyon akışlarınızı birlikte inceler, öncelikleri netleştiririz." },
      { icon: "database", title: "Kurulum ve veri aktarımı", desc: "Modülleri yapılandırır, mevcut verinizi tek veri tabanına taşırız." },
      { icon: "users", title: "Pilot ve ekip eğitimi", desc: "Seçilen bir departmanda pilot çalıştırır, rol bazlı eğitimlerle ekibi hazırlarız." },
      { icon: "handshake", title: "Müşteri başarı yöneticisi", desc: "Aylık performans görüşmeleriyle sistemi işletmenizle birlikte büyütürüz." },
    ],
  },
};
