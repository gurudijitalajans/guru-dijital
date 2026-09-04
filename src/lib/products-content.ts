import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Bell,
  Bot,
  BrainCircuit,
  CalendarClock,
  ClipboardList,
  Database,
  FileText,
  Gauge,
  Handshake,
  Kanban,
  Languages,
  LayoutDashboard,
  Layers,
  Link2,
  MessageSquare,
  PieChart,
  ShieldCheck,
  Users,
  Workflow,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Ürün detay içerikleri (ürün sayfaları için)                         */
/*  Sözleşme: ProductDetail. İçerik uzman PM + SEO yazarı gözüyle       */
/*  doldurulur. Em dash yok, başlıklar büyük harfle başlar.             */
/*  Headline içindeki *yıldızlı* kelime vurgu (yeşil) olarak render     */
/*  edilir. Mockup görselleri public/products/<slug>.svg yolundadır.    */
/* ------------------------------------------------------------------ */

export type ProductDetail = {
  slug: string;
  seo: { title: string; description: string; keywords: string[] };
  hero: { eyebrow: string; headline: string; sub: string; ctaLabel: string };
  /** Ürün mockup görseli (public/products/*.svg) */
  image: string;
  imageAlt: string;
  features: { icon: LucideIcon; title: string; desc: string }[];
  steps: { title: string; desc: string }[];
  useCases: { title: string; desc: string }[];
  stats: { value: number; suffix: string; label: string }[];
  faq: { q: string; a: string }[];
  integrations: string[];
};

export const productDetails: Record<string, ProductDetail> = {
  /* ---------------------------------------------------------------- */
  /*  Guru Chatbot                                                      */
  /* ---------------------------------------------------------------- */
  "guru-chatbot": {
    slug: "guru-chatbot",
    seo: {
      title: "Guru Chatbot | Yapay Zeka Müşteri Asistanı, 7/24 Destek",
      description:
        "Web sitesi, WhatsApp ve Instagram'da 7/24 yanıt veren yapay zeka müşteri asistanı. Soruları anında çözer, talepleri ekibinize iletir. Demo talep edin.",
      keywords: [
        "yapay zeka chatbot",
        "müşteri asistanı",
        "whatsapp chatbot",
        "web sitesi chatbot",
        "instagram otomatik yanıt",
        "canlı destek yazılımı",
        "müşteri hizmetleri otomasyonu",
        "türkçe chatbot",
        "chatbot kurulumu",
        "7/24 müşteri desteği",
      ],
    },
    hero: {
      eyebrow: "Guru Chatbot",
      headline: "Müşterinize *7/24* yanıt veren yapay zeka asistanı",
      sub: "Web sitenizde, WhatsApp'ta ve Instagram'da soruları anında yanıtlar, nitelikli talepleri doğru kişiye iletir.",
      ctaLabel: "Demo Talep Et",
    },
    image: "/products/guru-chatbot.svg",
    imageAlt: "Guru Chatbot yönetim paneli ve müşteriyle sohbet penceresi",
    features: [
      {
        icon: Bot,
        title: "Anında ve doğru yanıt",
        desc: "Ürün, fiyat, teslimat ve iade gibi sık sorulan soruları saniyeler içinde yanıtlar. Yalnızca sizin onayladığınız bilgi tabanından beslenir, uydurma cevap üretmez.",
      },
      {
        icon: MessageSquare,
        title: "Tüm kanallar tek kutuda",
        desc: "Web sitesi, WhatsApp ve Instagram mesajları tek gelen kutusunda toplanır. Ekibiniz kanal değiştirmeden tüm konuşmaları aynı ekrandan yönetir.",
      },
      {
        icon: Users,
        title: "Akıllı ekip yönlendirmesi",
        desc: "Asistanın çözemediği veya satış fırsatı taşıyan konuşmalar, konu ve önceliğe göre doğru temsilciye devredilir. Müşteri aynı konuyu ikinci kez anlatmaz.",
      },
      {
        icon: BrainCircuit,
        title: "İşletmenize özel eğitim",
        desc: "Ürün kataloğunuz, SSS sayfanız ve belgelerinizle eğitilir. Marka dilinize uygun tonda konuşur, kampanya ve fiyat güncellemelerini anında öğrenir.",
      },
      {
        icon: Languages,
        title: "Çok dilli hizmet",
        desc: "Türkçe başta olmak üzere birden fazla dilde yanıt verir. Yabancı müşterilerinizi ek ekip kurmadan, aynı kalitede karşılarsınız.",
      },
      {
        icon: BarChart3,
        title: "Konuşma analitiği",
        desc: "En çok sorulan konuları, çözüm oranını ve müşteri memnuniyetini panelden izleyin. Hangi soruların satışa dönüştüğünü veriyle görün.",
      },
    ],
    steps: [
      {
        title: "Bilgi tabanını yükleyin",
        desc: "Web sitenizi, ürün kataloğunuzu ve SSS içeriğinizi bağlayın; asistan işletmenizi dakikalar içinde öğrenir.",
      },
      {
        title: "Kanalları bağlayın",
        desc: "Web sitenize tek satır kod ekleyin, WhatsApp Business ve Instagram hesaplarınızı birkaç tıkla eşleştirin.",
      },
      {
        title: "Akışları belirleyin",
        desc: "Hangi konuların otomatik yanıtlanacağını, hangilerinin ekibe düşeceğini ve çalışma saatlerini tanımlayın.",
      },
      {
        title: "Canlıya alın ve ölçün",
        desc: "Asistanı yayına alın, konuşma raporlarından yanıt kalitesini izleyin ve bilgi tabanını sürekli iyileştirin.",
      },
    ],
    useCases: [
      {
        title: "E-ticaret",
        desc: "Sipariş durumu, kargo takibi ve iade koşulları gibi sorular otomatik yanıtlanır. Kararsız müşteriye ürün önerisi sunularak sepet tamamlamaya yönlendirilir.",
      },
      {
        title: "Sağlık ve klinikler",
        desc: "Randevu talepleri, çalışma saatleri ve hizmet bilgileri mesai dışında da yanıtlanır. Randevu istekleri ekibin takvimine düşer, hasta beklemede kalmaz.",
      },
      {
        title: "Eğitim ve danışmanlık",
        desc: "Program içeriği, ücret ve kayıt soruları anında cevaplanır. İlgili adaylar iletişim bilgileriyle Guru CRM'e aktarılır, satış ekibi doğrudan arar.",
      },
    ],
    stats: [
      { value: 80, suffix: "%", label: "Otomatik yanıtlanan soru" },
      { value: 5, suffix: "x", label: "Daha hızlı ilk yanıt" },
      { value: 24, suffix: "", label: "Saat kesintisiz hizmet" },
      { value: 35, suffix: "%", label: "Daha fazla nitelikli talep" },
    ],
    faq: [
      {
        q: "Kurulum ne kadar sürer?",
        a: "Standart bir web sitesi ve WhatsApp kurulumu genellikle aynı gün tamamlanır. Özel entegrasyonlar ve kapsamlı bilgi tabanı çalışmaları için süre 1-2 haftayı bulabilir; net takvimi keşif görüşmesinde paylaşırız.",
      },
      {
        q: "Müşteri verileri ve KVKK açısından güvende miyiz?",
        a: "Konuşma verileri şifreli olarak saklanır, yalnızca yetkili kullanıcılar erişir. Aydınlatma metni ve açık rıza akışlarını sohbet başlangıcına ekleriz; veri saklama süresini birlikte belirleriz.",
      },
      {
        q: "Asistan yanlış bilgi verirse ne olur?",
        a: "Asistan yalnızca sizin onayladığınız bilgi tabanından yanıt üretir; emin olmadığı konularda tahmin yürütmek yerine ekibinize devreder. Tüm konuşmalar kayıt altındadır, gerektiğinde tek tıkla düzeltirsiniz.",
      },
      {
        q: "Mevcut sistemlerimle entegre olur mu?",
        a: "Guru CRM ile doğal olarak çalışır; e-ticaret altyapıları, randevu sistemleri ve ERP yazılımlarına API üzerinden bağlanır. Kullandığınız araçları keşif aşamasında birlikte listeleriz.",
      },
      {
        q: "Fiyatlandırma nasıl işliyor?",
        a: "Aylık abonelik modeliyle çalışır; kanal sayısı ve aylık konuşma hacmine göre paket belirlenir. Kurulum ve ilk eğitim tek seferlik ücrete dahildir, sürpriz maliyet yoktur.",
      },
      {
        q: "Kurulumdan sonra destek alabilir miyim?",
        a: "Evet. Ekibinize panel eğitimi verir, ilk ay boyunca yanıt kalitesini birlikte izleriz. Sonrasında Türkçe teknik destek ve düzenli güncellemeler aboneliğinize dahildir.",
      },
    ],
    integrations: ["Web sitesi", "WhatsApp Business", "Instagram", "Guru CRM", "E-ticaret altyapıları", "Takvim"],
  },

  /* ---------------------------------------------------------------- */
  /*  Guru CRM                                                          */
  /* ---------------------------------------------------------------- */
  "guru-crm": {
    slug: "guru-crm",
    seo: {
      title: "Guru CRM | Satış ve Müşteri Takibi Tek Panelde",
      description:
        "Müşteri kayıtları, satış hattı, teklif ve görüşme takibi tek panelde. Fırsat kaçırmayın, ekibinizin satış sürecini Guru CRM ile hızlandırın. Demo talep edin.",
      keywords: [
        "crm yazılımı",
        "müşteri ilişkileri yönetimi",
        "satış takip programı",
        "satış hattı yönetimi",
        "teklif takip yazılımı",
        "kobi crm",
        "türkçe crm",
        "müşteri takip programı",
        "satış otomasyonu",
        "whatsapp crm entegrasyonu",
      ],
    },
    hero: {
      eyebrow: "Guru CRM",
      headline: "Her müşteri ve her fırsat *tek* ekranda",
      sub: "Fırsatları, teklifleri ve görüşme geçmişini tek panelden yönetin; ekibiniz kimin ne zaman aranacağını her zaman bilsin.",
      ctaLabel: "Demo Talep Et",
    },
    image: "/products/guru-crm.svg",
    imageAlt: "Guru CRM satış hattı panosu ve müşteri kartları",
    features: [
      {
        icon: Users,
        title: "Tek müşteri kartı",
        desc: "Her müşterinin iletişim bilgileri, görüşme notları, teklifleri ve mesajları tek kartta toplanır. Ekipteki herkes aynı güncel bilgiyi görür.",
      },
      {
        icon: Kanban,
        title: "Görsel satış hattı",
        desc: "Fırsatları aşamalar arasında sürükleyin, hangi adımda ne kadar ciro beklediğinizi anında görün. Takılan fırsatlar otomatik olarak öne çıkar.",
      },
      {
        icon: FileText,
        title: "Hızlı teklif oluşturma",
        desc: "Hazır şablonlarla dakikalar içinde markalı teklif üretin, e-posta veya WhatsApp ile gönderin. Teklifin açılıp açılmadığını takip edin.",
      },
      {
        icon: Bell,
        title: "Otomatik hatırlatmalar",
        desc: "Takip aramaları, teklif son tarihleri ve sözleşme yenilemeleri için hatırlatma alın. Hiçbir fırsat unutulduğu için kaybolmaz.",
      },
      {
        icon: Link2,
        title: "Guru Chatbot ile bağlantı",
        desc: "Chatbot'tan gelen nitelikli talepler otomatik olarak müşteri kartına dönüşür. Satış ekibi konuşma geçmişini görerek arar.",
      },
      {
        icon: PieChart,
        title: "Satış raporları",
        desc: "Kaynak bazlı dönüşüm, temsilci performansı ve aylık ciro tahmini hazır raporlarla elinizde. Yönetim toplantısına veriyle gelin.",
      },
    ],
    steps: [
      {
        title: "Verilerinizi aktarın",
        desc: "Excel listenizi veya mevcut CRM verinizi içe aktarın; mükerrer kayıtlar otomatik temizlenir.",
      },
      {
        title: "Süreci uyarlayın",
        desc: "Satış aşamalarını, teklif şablonlarını ve özel alanları işletmenizin diline göre düzenleyin.",
      },
      {
        title: "Ekibi dahil edin",
        desc: "Kullanıcı rollerini tanımlayın, e-posta ve takvim hesaplarını bağlayın; herkes kendi panosunda çalışsın.",
      },
      {
        title: "Takip edin ve büyütün",
        desc: "Haftalık raporlarla darboğazı görün, hedefleri güncelleyin ve kazandıran adımları ekipte standart hale getirin.",
      },
    ],
    useCases: [
      {
        title: "Ajanslar ve hizmet firmaları",
        desc: "Teklif aşamasındaki projeler, onay bekleyen sözleşmeler ve yenileme tarihleri tek hatta izlenir. Müşteri talepleri proje ekibine kaybolmadan aktarılır.",
      },
      {
        title: "Gayrimenkul ve otomotiv",
        desc: "Portföy ilgilileri kaynak bazında kaydedilir, her aday için ziyaret ve teklif geçmişi tutulur. Uygun yeni ilan çıktığında ilgili alıcılar tek tıkla bilgilendirilir.",
      },
      {
        title: "B2B üretim ve toptan satış",
        desc: "Bayi ve kurumsal müşteriler için fiyat listesi, sipariş geçmişi ve ödeme takibi tek kartta durur. Yenileme dönemi yaklaşan müşteriler için ekip otomatik uyarılır.",
      },
    ],
    stats: [
      { value: 40, suffix: "%", label: "Daha hızlı teklif süreci" },
      { value: 30, suffix: "%", label: "Daha az kaybolan fırsat" },
      { value: 100, suffix: "%", label: "Görüşme geçmişi kayıt altında" },
      { value: 15, suffix: "dk", label: "Haftalık rapor hazırlığı" },
    ],
    faq: [
      {
        q: "Verilerimiz güvende mi, KVKK'ya uygun mu?",
        a: "Tüm veriler şifreli bağlantı üzerinden taşınır, şifreli olarak saklanır ve düzenli yedeklenir. Rol bazlı yetkilendirmeyle kimin neyi göreceğini siz belirlersiniz; KVKK kapsamındaki silme ve düzeltme talepleri panelden yönetilir.",
      },
      {
        q: "Mevcut Excel veya CRM verilerimizi taşıyabilir miyiz?",
        a: "Evet. Excel, CSV ve yaygın CRM dışa aktarma dosyalarını içe alırız. Alan eşleştirmesini birlikte yapar, mükerrer kayıtları temizleriz; geçmiş görüşme notlarınız kaybolmaz.",
      },
      {
        q: "Hangi araçlarla entegre çalışır?",
        a: "E-posta, takvim ve WhatsApp Business ile hazır bağlantı sunar. Guru Chatbot ve Guru Operation ile aynı veri tabanını paylaşır; muhasebe ve e-fatura sistemlerine API üzerinden bağlanır.",
      },
      {
        q: "Fiyatlandırma kullanıcı başına mı?",
        a: "Evet, aylık abonelik kullanıcı sayısına göre belirlenir. Kayıt ve fırsat sayısında sınır yoktur; ekip büyüdükçe kullanıcı ekler, küçüldükçe çıkarırsınız.",
      },
      {
        q: "Kurulum ne kadar sürer?",
        a: "Veri aktarımı ve temel yapılandırma genellikle bir hafta içinde tamamlanır. Özel alanlar, teklif şablonları ve entegrasyonlarla birlikte 2-3 hafta içinde ekibiniz tam verimle çalışır.",
      },
      {
        q: "Ekibimiz CRM kullanmaya alışık değil, destek var mı?",
        a: "Kurulum sonrası canlı eğitim oturumları düzenler, ekibinizin ilk haftalarında yanınızda oluruz. Türkçe yardım merkezi ve teknik destek aboneliğinize dahildir.",
      },
    ],
    integrations: ["E-posta", "Takvim", "WhatsApp Business", "Guru Chatbot", "Guru Operation", "E-fatura"],
  },

  /* ---------------------------------------------------------------- */
  /*  Guru Operation                                                    */
  /* ---------------------------------------------------------------- */
  "guru-operation": {
    slug: "guru-operation",
    seo: {
      title: "Guru Operation | Operasyon ve İş Akışı Yönetimi Yazılımı",
      description:
        "Görevler, iş akışları, ekip planı ve süreç performansı tek panoda. Darboğazı önceden görün, teslimatları zamanında yapın. Guru Operation demosu talep edin.",
      keywords: [
        "operasyon yönetimi yazılımı",
        "iş akışı yönetimi",
        "görev takip programı",
        "ekip planlama yazılımı",
        "süreç yönetimi",
        "proje takip yazılımı",
        "iş takip programı",
        "kobi operasyon yazılımı",
        "vardiya planlama",
        "saha ekibi yönetimi",
      ],
    },
    hero: {
      eyebrow: "Guru Operation",
      headline: "Operasyonun her adımı *görünür* ve takipte",
      sub: "Görevleri, ekip planını ve süreç performansını tek panodan yönetin; darboğazı oluşmadan görün, teslimatı zamanında yapın.",
      ctaLabel: "Demo Talep Et",
    },
    image: "/products/guru-operation.svg",
    imageAlt: "Guru Operation görev panosu ve ekip takvimi",
    features: [
      {
        icon: Workflow,
        title: "Şablonlaşmış iş akışları",
        desc: "Tekrarlayan süreçleri adım adım şablona dönüştürün. Yeni bir sipariş veya proje açıldığında görevler doğru kişilere otomatik dağılır.",
      },
      {
        icon: ClipboardList,
        title: "Görev ve kontrol listeleri",
        desc: "Her görevde sorumlu, teslim tarihi, öncelik ve kontrol listesi bulunur. Eksik adım varken iş tamamlandı olarak işaretlenemez.",
      },
      {
        icon: CalendarClock,
        title: "Ekip ve kaynak planlama",
        desc: "Kimin hangi gün ne kadar yükü olduğunu takvimde görün. Fazla yüklenen ekip üyesini ve boşta kalan kapasiteyi anında fark edin.",
      },
      {
        icon: Gauge,
        title: "Süreç performansı",
        desc: "Adım bazlı tamamlanma süreleri, geciken işler ve darboğaz noktaları panoda canlı izlenir. Nerede zaman kaybedildiğini veriyle görün.",
      },
      {
        icon: Bell,
        title: "Akıllı bildirimler",
        desc: "Yaklaşan teslim tarihi, geciken adım veya onay bekleyen iş için ilgili kişi anında bildirim alır. Toplantı yapmadan koordinasyon sağlanır.",
      },
      {
        icon: Link2,
        title: "CRM ile bütünleşik",
        desc: "Guru CRM'de kazanılan fırsat tek tıkla operasyon sürecine dönüşür. Satış ne söz verdiyse operasyon aynı bilgiyle işe başlar.",
      },
    ],
    steps: [
      {
        title: "Süreçlerinizi haritalayın",
        desc: "Keşif görüşmesinde mevcut iş akışlarınızı birlikte çıkarır, adımları ve sorumluları netleştiririz.",
      },
      {
        title: "Şablonları kurun",
        desc: "Süreçleri iş akışı şablonuna dönüştürün, kontrol listelerini ve teslim sürelerini tanımlayın.",
      },
      {
        title: "Ekibi ve takvimi bağlayın",
        desc: "Kullanıcıları rollerine göre ekleyin, takvim ve e-posta hesaplarını eşleştirin; görevler doğru kişiye otomatik düşsün.",
      },
      {
        title: "Ölçün ve iyileştirin",
        desc: "Performans panosundan geciken adımları görün, şablonları güncelleyin ve süreçleri her ay biraz daha hızlandırın.",
      },
    ],
    useCases: [
      {
        title: "Üretim ve atölye",
        desc: "Sipariş, üretim, kalite kontrol ve sevkiyat adımları tek zincirde izlenir. Hangi siparişin hangi istasyonda beklediği anlık olarak görünür.",
      },
      {
        title: "Saha ve teknik servis",
        desc: "Servis talepleri ekiplere konum ve uygunluğa göre dağıtılır, teknisyen mobilden kontrol listesini doldurur. Müşteri işin tamamlandığını beklemeden öğrenir.",
      },
      {
        title: "Ajans ve proje ekipleri",
        desc: "Brief, tasarım, onay ve yayın adımları her proje için standart şablondan açılır. Müşteri onayı bekleyen işler tek listede toplanır, revizyon gecikmeleri azalır.",
      },
    ],
    stats: [
      { value: 30, suffix: "%", label: "Daha az koordinasyon süresi" },
      { value: 90, suffix: "%", label: "Zamanında tamamlanan iş" },
      { value: 10, suffix: "dk", label: "Günlük planlama süresi" },
      { value: 2, suffix: "x", label: "Daha hızlı adımlar arası devir" },
    ],
    faq: [
      {
        q: "Kurulum ne kadar sürer?",
        a: "Süreç haritalama ve şablon kurulumu genellikle 1-2 hafta sürer. Basit görev takibiyle başlamak isterseniz ilk gün kullanmaya başlar, iş akışlarını zamanla derinleştirirsiniz.",
      },
      {
        q: "Ekip büyüklüğü sınırı var mı?",
        a: "Hayır. Beş kişilik ekipten yüzlerce kullanıcılı operasyonlara kadar ölçeklenir; departman, şube ve ekip bazlı yapı kurabilirsiniz.",
      },
      {
        q: "Verilerimiz ve iş süreçlerimiz güvende mi?",
        a: "Tüm veriler şifreli olarak saklanır ve düzenli yedeklenir. Rol bazlı yetkilendirmeyle her kullanıcı yalnızca kendi işini görür; KVKK gereklilikleri için erişim kayıtları tutulur.",
      },
      {
        q: "Hangi sistemlerle entegre olur?",
        a: "Guru CRM ile aynı veri tabanını paylaşır, takvim ve e-posta ile hazır bağlantı sunar. ERP, muhasebe ve e-ticaret sistemlerine API üzerinden bağlanır; mobil uygulamayla sahadan da erişilir.",
      },
      {
        q: "Fiyatlandırma nasıl?",
        a: "Aylık abonelik, aktif kullanıcı sayısına göre hesaplanır. Görev, proje ve iş akışı sayısında sınır yoktur; süreç haritalama ve kurulum tek seferlik hizmet olarak sunulur.",
      },
      {
        q: "Ekibimiz yeni bir araca alışabilir mi?",
        a: "Ekip için rol bazlı eğitim oturumları düzenler, ilk haftalarda kullanım verilerini izleyip yanınızda oluruz. Türkçe destek ekibimiz ve yardım içerikleri aboneliğe dahildir.",
      },
    ],
    integrations: ["Guru CRM", "Guru Chatbot", "Takvim", "E-posta", "ERP ve muhasebe", "E-ticaret altyapıları"],
  },

  /* ---------------------------------------------------------------- */
  /*  Guru Business (tüm modüller tek pakette)                          */
  /* ---------------------------------------------------------------- */
  "guru-business": {
    slug: "guru-business",
    seo: {
      title: "Guru Business | İşletmeler İçin Bütünleşik Yönetim Paketi",
      description:
        "Guru Chatbot, Guru CRM ve Guru Operation tek pakette. Müşteri iletişimi, satış ve operasyon aynı veri üzerinde çalışsın. Keşif görüşmesi için demo talep edin.",
      keywords: [
        "işletme yönetim yazılımı",
        "kobi dijital dönüşüm",
        "hepsi bir arada iş yazılımı",
        "crm ve operasyon yazılımı",
        "işletme otomasyonu",
        "dijital işletme paketi",
        "müşteri ve satış yönetimi",
        "iş süreçleri dijitalleştirme",
        "kurumsal yazılım çözümü",
        "işletme yönetim paneli",
      ],
    },
    hero: {
      eyebrow: "Guru Business",
      headline: "İşletmeniz için *bütünleşik* dijital yönetim",
      sub: "Chatbot, CRM ve Operation aynı veri tabanında çalışır; müşteri ilk mesajdan teslimata kadar tek sistemde izlenir.",
      ctaLabel: "Demo Talep Et",
    },
    image: "/products/guru-business.svg",
    imageAlt: "Guru Business genel bakış panosu: chatbot, CRM ve operasyon özetleri",
    features: [
      {
        icon: Layers,
        title: "Üç modül, tek panel",
        desc: "Guru Chatbot, Guru CRM ve Guru Operation tek girişle açılır. Müşteri iletişimi, satış ve operasyon aynı ekranda özetlenir.",
      },
      {
        icon: Database,
        title: "Tek müşteri verisi",
        desc: "Chatbot'ta başlayan konuşma CRM'de fırsata, kazanılan fırsat operasyonda işe dönüşür. Aynı bilgi ikinci kez girilmez.",
      },
      {
        icon: LayoutDashboard,
        title: "Yönetici panosu",
        desc: "Gelen talep, açık fırsat, süren iş ve geciken görev sayıları tek bakışta. İşletmenin nabzını her sabah tek ekrandan ölçün.",
      },
      {
        icon: Workflow,
        title: "Uçtan uca otomasyon",
        desc: "Talep alma, teklif gönderme, onay ve iş başlatma adımları arasında otomatik geçiş. Ekibiniz kopyala yapıştır yerine işe odaklanır.",
      },
      {
        icon: ShieldCheck,
        title: "Kurumsal güvenlik",
        desc: "Rol bazlı yetkilendirme, şifreli veri saklama, erişim kayıtları ve düzenli yedekleme tüm modüllerde standarttır. KVKK süreçleri tek merkezden yönetilir.",
      },
      {
        icon: Handshake,
        title: "İşletmenize özel kurulum",
        desc: "Keşif, süreç haritalama, veri aktarımı ve ekip eğitimi Guru Dijital ekibi tarafından yapılır. Yazılımı değil, işleyen sistemi teslim ederiz.",
      },
    ],
    steps: [
      {
        title: "Keşif ve ihtiyaç haritası",
        desc: "İşletmenizin müşteri, satış ve operasyon akışlarını birlikte inceler, öncelikli sorunları netleştiririz.",
      },
      {
        title: "Kurulum ve veri aktarımı",
        desc: "Modülleri işletmenize göre yapılandırır, mevcut müşteri ve iş verilerinizi tek veri tabanına taşırız.",
      },
      {
        title: "Ekip eğitimi ve pilot",
        desc: "Rol bazlı eğitimlerle ekibinizi hazırlar, seçilen bir departmanda pilot çalıştırıp süreçleri inceltiriz.",
      },
      {
        title: "Canlıya geçiş ve büyüme",
        desc: "Tüm ekipte yayına alır, aylık performans görüşmeleriyle sistemi işletmenizle birlikte büyütürüz.",
      },
    ],
    useCases: [
      {
        title: "Büyüyen KOBİ",
        desc: "WhatsApp, Excel ve dağınık notlarla yürüyen işler tek sisteme taşınır. Yönetici her müşterinin hangi aşamada beklediğini sormadan görür.",
      },
      {
        title: "Çok şubeli hizmet işletmeleri",
        desc: "Şubelerden gelen talepler merkezi olarak karşılanır, satış ve operasyon şube bazında raporlanır. Standart süreçler her şubede aynı kalitede uygulanır.",
      },
      {
        title: "Klinik ve sağlık grupları",
        desc: "Randevu talebi chatbot'tan alınır, hasta kaydı CRM'de tutulur, tedavi planı ve takip operasyonda izlenir. Hasta deneyimi ilk mesajdan kontrole kadar kesintisiz olur.",
      },
    ],
    stats: [
      { value: 3, suffix: "", label: "Modül, tek panel" },
      { value: 45, suffix: "%", label: "Daha az manuel veri girişi" },
      { value: 2, suffix: "x", label: "Daha hızlı talepten teslimata" },
      { value: 14, suffix: "", label: "Gün içinde ilk modül canlıda" },
    ],
    faq: [
      {
        q: "Modülleri ayrı ayrı alabilir miyim?",
        a: "Evet. Guru Chatbot, Guru CRM ve Guru Operation tek başına da kullanılır. Guru Business, üçünü tek veri tabanı ve tek girişle birleştirir; paket fiyatı modülleri ayrı ayrı almaya göre avantajlıdır.",
      },
      {
        q: "Kurulum ne kadar sürer?",
        a: "Öncelikli modül genellikle iki hafta içinde canlıya alınır; tüm paketin keşiften canlıya geçişine kadar süreç 4-6 hafta sürer. Aşamalı geçişle ilk faydayı beklemeden görürsünüz.",
      },
      {
        q: "Verilerimiz nerede saklanıyor, KVKK'ya uygun mu?",
        a: "Veriler şifreli ve yedekli altyapıda saklanır; sunucu lokasyonu ve saklama süresi sözleşmede netleştirilir. Rol bazlı erişim, işlem kayıtları ve veri silme akışları KVKK yükümlülüklerinizi destekler.",
      },
      {
        q: "Mevcut yazılımlarımız ne olacak?",
        a: "Muhasebe, e-fatura, e-ticaret ve ERP gibi sistemleriniz API üzerinden bağlanır; çalışan araçlarınızı değiştirmek zorunda kalmazsınız. Keşif aşamasında hangi sistemlerin taşınacağına, hangilerinin bağlanacağına birlikte karar veririz.",
      },
      {
        q: "Fiyatlandırma nasıl işliyor?",
        a: "Aylık abonelik, kullanıcı sayısı ve chatbot konuşma hacmine göre belirlenir. Keşif, kurulum, veri aktarımı ve eğitim tek seferlik proje bedeli olarak ayrıca teklif edilir; tüm kalemler sözleşmede yazılıdır.",
      },
      {
        q: "Kurulum sonrası kimden destek alırız?",
        a: "Size atanan müşteri başarı yöneticisi aylık performans görüşmelerini yürütür. Türkçe teknik destek, güncellemeler ve yeni ekip üyeleri için eğitim aboneliğinize dahildir.",
      },
    ],
    integrations: [
      "Guru Chatbot",
      "Guru CRM",
      "Guru Operation",
      "WhatsApp Business",
      "E-fatura ve muhasebe",
      "E-ticaret altyapıları",
    ],
  },
};

export const productSlugs = Object.keys(productDetails);
