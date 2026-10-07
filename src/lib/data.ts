import {
  Bot,
  Briefcase,
  Users,
  Workflow,
  Share2,
  Palette,
  PenLine,
  MonitorSmartphone,
  BarChart3,
  Clapperboard,
  type LucideIcon,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Site                                                               */
/* ------------------------------------------------------------------ */

export const site = {
  name: "Guru Dijital Ajans",
  shortName: "Guru Dijital",
  tagline: "Unlock the next level",
  description:
    "Guru Dijital: sosyal medya yönetimi, grafik tasarım, içerik üretimi, web tasarım, dijital pazarlama ve video tasarımında entegre çözümler sunan dijital ajans.",
  url: "https://www.gurudijital.com.tr",
  instagram: "https://www.instagram.com/gurudijital",
  email: "info@gurudijital.com.tr",
  // TODO(client): telefon, WhatsApp ve adres bilgileri netleşince güncellenecek
  phone: "",
  whatsapp: "",
  address: "",
};

/* Umami: çerezsiz, kişisel veri toplamayan ziyaretçi sayımı (Umami Cloud, Guru
   hesabı). Site kimliği gizli değildir, betikte herkese açık görünür. Yalnız
   aşağıdaki alan adları sayılır: önizleme ve yerel adresler sayıma girmez. */
export const umami = {
  websiteId: "fb72f8f5-2e67-4ed6-9b06-6e5b8bb7f26a",
  scriptUrl: "https://cloud.umami.is/script.js",
  domains: "guru-dijital-pied.vercel.app,gurudijital.com.tr,www.gurudijital.com.tr",
};

/* ------------------------------------------------------------------ */
/*  Hizmetler                                                          */
/* ------------------------------------------------------------------ */

/* NOT: Canlı içerik panelde (Guru Panel > İçerik > Hizmetler). Buradaki
   liste yalnız varsayılan/yedek içeriktir: npm run seed ile panele aktarılır
   ve panele ulaşılamadığında site bunu gösterir. Düzenlemeyi panelden yapın. */

export type Service = {
  slug: string;
  no: string;
  title: string;
  headline: string;
  short: string;
  icon: LucideIcon;
  intro: string[];
  offeringsTitle: string;
  offerings: string[];
  outro?: string;
  images: { src: string; alt: string; ratio?: string }[];
  keywords: string[];
  /** Arama sonucu açıklaması (140-160 karakter); yoksa short kullanılır */
  seoDescription?: string;
};

export const services: Service[] = [
  {
    slug: "sosyal-medya-yonetimi",
    no: "01",
    title: "Sosyal Medya Yönetimi",
    headline: "Markanızı dijital dünyada öne çıkarın",
    short:
      "Strateji, içerik, topluluk yönetimi ve reklam kampanyalarıyla markanızı doğru kitleyle buluşturuyoruz.",
    icon: Share2,
    intro: [
      "Sosyal medya, günümüzün en güçlü iletişim ve marka inşa araçlarından biri. Markanızın sesi, yüzü ve hikâyesi burada şekilleniyor. Biz, markanızı hedef kitlenizle doğru zamanda, doğru platformda ve etkileyici içeriklerle buluşturuyoruz.",
      "Strateji geliştirmeden yaratıcı içerik üretimine, topluluk yönetiminden performans odaklı reklam kampanyalarına kadar tüm süreci titizlikle planlıyor ve yönetiyoruz.",
    ],
    offeringsTitle: "Sunduğumuz Hizmetler",
    offerings: [
      "Platforma özel sosyal medya stratejisi ve içerik planlaması",
      "Kreatif tasarım ve profesyonel metin yazarlığı",
      "Topluluk yönetimi ve takipçi etkileşimi",
      "Hedef odaklı reklam kampanyaları (Meta, TikTok, LinkedIn vb.)",
      "Performans takibi, veri analizi ve düzenli raporlama",
    ],
    outro:
      "Markanızı sosyal medyada sadece görünür kılmakla kalmıyor; kalıcı bir etki yaratarak fark edilir, güvenilir ve ilham veren bir dijital varlık haline getiriyoruz.",
    images: [
      { src: "/work/sosyal-medya-telefon.webp", alt: "Guru Dijital Instagram hesabı telefon mockup" },
      { src: "/work/instagram-postlar.webp", alt: "Instagram gönderi tasarımları" },
    ],
    seoDescription:
      "Platforma özel strateji, içerik, topluluk yönetimi ve Meta, TikTok, LinkedIn reklam kampanyalarıyla markanızı doğru kitleyle buluşturan sosyal medya yönetimi.",
    keywords: ["strateji", "içerik planı", "topluluk yönetimi", "Meta Ads", "raporlama"],
  },
  {
    slug: "grafik-tasarim",
    no: "02",
    title: "Grafik Tasarım",
    headline: "Markanıza değer katan tasarımlar",
    short:
      "Logo ve kurumsal kimlikten ambalaja: markanızın görsel dilini estetik ve stratejik bir bütünlükle kuruyoruz.",
    icon: Palette,
    intro: [
      "Görsel tasarım, markanızın dış dünyaya attığı ilk adımdır ve doğru atıldığında güçlü bir etki yaratır. Markanızın kimliğini yansıtan özgün ve yaratıcı tasarımlar üreterek mesajınızı hedef kitlenize estetik ve stratejik bir bütünlük içinde ulaştırıyoruz.",
      "Tasarım sürecinde sadece göze hitap eden değil; aynı zamanda markanızın değerlerini yansıtan ve kullanıcı deneyimini gözeten işler üretiyoruz.",
    ],
    offeringsTitle: "Neler Tasarlıyoruz",
    offerings: [
      "Marka ve logo tasarımı",
      "Kurumsal kimlik tasarımı (kartvizit, antetli kağıt, zarf vb.)",
      "Dijital ve basılı tanıtım materyalleri (afiş, broşür, katalog)",
      "Ambalaj ve etiket tasarımları",
      "Sosyal medya ve dijital mecralara özel görsel içerikler",
    ],
    outro:
      "Hayal ettiğiniz tasarımı gerçeğe dönüştürmek için buradayız. Estetikten ödün vermeden, her detayı stratejik bir yaklaşımla ele alıyor; markanıza değer katan çözümler sunuyoruz.",
    images: [
      { src: "/work/kurumsal-kimlik.webp", alt: "Kurumsal kimlik tasarımı mockup seti" },
      { src: "/work/logo-tasarimlari.webp", alt: "Logo tasarımı örnekleri" },
      { src: "/work/ambalaj-etiket.webp", alt: "Ambalaj ve etiket tasarımları" },
      { src: "/work/katalog-brosur.webp", alt: "Katalog ve broşür tasarımları" },
    ],
    seoDescription:
      "Logo ve kurumsal kimlikten ambalaj, katalog ve broşüre: markanızın görsel dilini estetik ve stratejik bir bütünlükle kuran grafik tasarım hizmeti.",
    keywords: ["logo", "kurumsal kimlik", "katalog", "ambalaj", "afiş"],
  },
  {
    slug: "icerik-uretimi",
    no: "03",
    title: "İçerik Üretimi",
    headline: "Doğru kelimelerle güçlü etki",
    short:
      "Markanızın sesini doğru şekilde duyuracak, hedef kitlenize gerçekten dokunan içerikler üretiyoruz.",
    icon: PenLine,
    intro: [
      "Dijital dünyada dikkat çekmenin yolu, etkili içerikten geçer. Biz, markanızın sesini doğru şekilde duyuracak içerikler üretiyor, hikâyenizi ilgiyle okunacak hale getiriyoruz.",
      "Her içerikte samimiyet, özgünlük ve strateji bir arada. Amacımız sadece yazmak değil; hedef kitlenize gerçekten dokunan, değer katan içerikler sunmak.",
    ],
    offeringsTitle: "İçerik Başlıklarımız",
    offerings: [
      "Marka diline özel metin yazarlığı ve slogan çalışmaları",
      "Sosyal medya içerik kurgusu ve metinleri",
      "SEO uyumlu web sitesi ve blog içerikleri",
      "Reklam kampanyası metinleri",
      "Kreatif konsept ve hikâyeleştirme",
    ],
    images: [
      { src: "/work/instagram-post-kare.webp", alt: "Sosyal medya gönderi tasarımları" },
    ],
    seoDescription:
      "Marka diline özel metin yazarlığı, sosyal medya metinleri, SEO uyumlu web ve blog içerikleri ve kreatif konseptlerle hedef kitlenize dokunan içerikler.",
    keywords: ["metin yazarlığı", "SEO içerik", "kreatif konsept", "hikâyeleştirme"],
  },
  {
    slug: "web-tasarim",
    no: "04",
    title: "Web Tasarım",
    headline: "Markanızın dijitaldeki yüzü",
    short:
      "Mobil uyumlu, hızlı ve SEO dostu web siteleriyle ziyaretçilerinizi müşteriye dönüştürüyoruz.",
    icon: MonitorSmartphone,
    intro: [
      "Profesyonel, modern ve kullanıcı odaklı web siteleri ile dijital varlığınızı güçlendiriyoruz.",
      "Mobil uyumlu, hızlı ve SEO dostu tasarımlarımızla hem göz dolduruyor hem de ziyaretçilerinizi müşteriye dönüştürüyoruz.",
    ],
    offeringsTitle: "Sunduğumuz Çözümler",
    offerings: [
      "Kurumsal web sitesi tasarımı ve geliştirme",
      "E-ticaret siteleri ve ürün kataloğu altyapıları",
      "Tüm cihazlarla uyumlu (responsive) arayüz tasarımı",
      "SEO dostu, hızlı ve güvenli teknik altyapı",
      "Bakım, güncelleme ve teknik destek",
    ],
    outro:
      "Ekoda, Aska Hotels, Esdo İnşaat, Secen Gross ve USRE Okulları dahil birçok markanın web sitesini tasarladık ve yayına aldık.",
    images: [
      { src: "/work/web-siteleri.webp", alt: "Yayında olan web sitesi projeleri" },
      { src: "/work/web-mockup-dark.webp", alt: "Web tasarım laptop mockup" },
      { src: "/work/web-siteleri-2.webp", alt: "Web tasarım projeleri laptop mockupları" },
    ],
    seoDescription:
      "Mobil uyumlu, hızlı ve SEO dostu kurumsal web sitesi ve e-ticaret tasarımı; bakım ve teknik destekle ziyaretçilerinizi müşteriye dönüştüren web tasarım hizmeti.",
    keywords: ["kurumsal site", "e-ticaret", "responsive", "SEO", "bakım & destek"],
  },
  {
    slug: "dijital-pazarlama",
    no: "05",
    title: "Dijital Pazarlama",
    headline: "Dijitalde stratejik büyüme",
    short:
      "Veriye dayalı, ROAS odaklı kampanyalarla reklam bütçenizi büyümeye dönüştürüyoruz. Google Partner'ıyız.",
    icon: BarChart3,
    intro: [
      "Dijital pazarlama sadece görünür olmak değil; doğru zamanda, doğru yerde, doğru kitleyle buluşmaktır. Guru Dijital olarak markanız için veriye dayalı, sonuç odaklı dijital stratejiler geliştiriyoruz.",
      "Tüm süreci uçtan uca yönetiyor; hedef kitle analizi, mecra seçimi, reklam kurgusu, bütçe optimizasyonu ve performans takibini tek merkezden sağlıyoruz.",
    ],
    offeringsTitle: "Pazarlama Çözümlerimiz",
    offerings: [
      "Google & Meta Ads kampanya yönetimi",
      "TikTok, LinkedIn ve diğer platform kampanyaları",
      "Yeniden pazarlama ve dönüşüm optimizasyonu",
      "ROAS odaklı analiz ve düzenli raporlama",
    ],
    outro:
      "Dijital pazarlamayı bir reklam gideri değil, markanızı büyüten stratejik bir yatırım olarak görüyoruz. 2025'te Google Partner'ı olduk ve Google Ads Impact Awards'ta Data Innovation kategorisinde aday gösterildik.",
    images: [
      { src: "/work/dijital-pazarlama.webp", alt: "Dijital pazarlama kreatif kolaj" },
    ],
    seoDescription:
      "Google Partner ajans olarak Google ve Meta Ads, TikTok ve LinkedIn kampanyalarını ROAS odaklı yönetiyor; reklam bütçenizi ölçülebilir büyümeye dönüştürüyoruz.",
    keywords: ["Google Ads", "Meta Ads", "dönüşüm", "ROAS", "remarketing"],
  },
  {
    slug: "video-tasarimi",
    no: "06",
    title: "Video Tasarımı",
    headline: "Hikâyenizi harekete geçirin",
    short:
      "Reels ve reklam videolarından kurumsal tanıtımlara: markanızı hareketli içerikle anlatıyoruz.",
    icon: Clapperboard,
    intro: [
      "Video, dijitalde en yüksek etkileşimi alan içerik formatı. Markanızın hikâyesini; kurgusu, müziği ve grafikleriyle bütünleşen videolarla anlatıyoruz.",
      "Sosyal medya için dikey videolardan reklam filmlerine kadar tüm süreçleri; senaryo, çekim planı, kurgu ve yayın optimizasyonuyla birlikte yönetiyoruz.",
    ],
    offeringsTitle: "Video Çözümlerimiz",
    offerings: [
      "Sosyal medya videoları (Reels, TikTok, Shorts)",
      "Ürün ve hizmet tanıtım videoları",
      "Motion graphics ve animasyon",
      "Reklam kampanyası videoları",
      "Kurumsal tanıtım filmleri",
    ],
    images: [
      { src: "/work/sosyal-icerik-cita.webp", alt: "Hareketli içerik kreatif tasarımı" },
    ],
    seoDescription:
      "Reels, TikTok ve Shorts videolarından motion graphics, reklam filmi ve kurumsal tanıtım filmlerine: markanızı hareketli içerikle anlatan video tasarımı hizmeti.",
    keywords: ["reels", "motion graphics", "reklam filmi", "kurgu"],
  },
];

/* ------------------------------------------------------------------ */
/*  Vaka çalışmaları                                                   */
/* ------------------------------------------------------------------ */

/* NOT: Canlı içerik panelde (Kurumsal > Vaka Çalışmaları, Müşteri Yorumları,
   Ekip, Referanslar; İçerik > Hakkımızda). Buradaki listeler yalnız
   varsayılan/yedek içeriktir (npm run seed + panel yokken). */
export type CaseStudy = {
  id: string;
  sector: string;
  title: string;
  summary: string;
  note: string;
  stats: { value: number; suffix: string; prefix?: string; label: string; down?: boolean }[];
};

export const caseStudies: CaseStudy[] = [
  {
    id: "klinik",
    sector: "Sağlık / Klinik",
    title: "Aynı bütçeyle %300 daha fazla hasta",
    summary:
      "Kliniğin dijital reklam süreçlerini devraldığımızda sonuçlar potansiyelin oldukça altındaydı. Reklam bütçesini artırmadan, stratejiyi tamamen yenileyerek yalnızca 3 ayda etkileyici bir dönüşüm sağladık.",
    note: "Reklam bütçesi artırılmadan, 3 ayda",
    stats: [
      { value: 300, suffix: "%", label: "Yurtdışı hasta sayısı artışı" },
      { value: 350, suffix: "%", label: "Yurtiçi hasta sayısı artışı" },
      { value: 320, suffix: "%", label: "Yurtdışı hasta geliri artışı" },
      { value: 245, suffix: "%", label: "Yurtiçi hasta geliri artışı" },
      { value: 120, suffix: "%", label: "Aylık talep artışı" },
      { value: 54.5, suffix: "%", label: "Talep başı maliyette düşüş", down: true },
    ],
  },
  {
    id: "eticaret",
    sector: "E-ticaret",
    title: "Satış odaklı strateji, ölçülebilir büyüme",
    summary:
      "Yönetimini devraldığımız e-ticaret markasında; satış odaklı strateji, doğru hedefleme ve sürekli optimizasyonla kısa sürede güçlü bir performans artışı sağladık.",
    note: "Kampanya dönemlerinde önceki ciroyu %96 aştık",
    stats: [
      { value: 60, suffix: "%", label: "Ciro artışı" },
      { value: 96, suffix: "%", label: "Kampanya dönemi ciro artışı" },
      { value: 37.5, suffix: "%", label: "Sonuç başına maliyette azalma", down: true },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  Referanslar & Ödüller                                              */
/* ------------------------------------------------------------------ */

export const references: string[] = [
  "Academic Hospital",
  "Aska Hotels",
  "Avrupa Diş",
  "BiosLife",
  "Bülbüloğulları",
  "Classy & Sheen",
  "Clinic P",
  "Ekoda",
  "Ekto",
  "Esdo İnşaat",
  "Espina",
  "İyi Bulut",
  "Jaecoo İnoto",
  "Konum Kapadokya",
  "Kontrol Market",
  "LionKlinker",
  "Mates",
  "Navelli Home",
  "NOG",
  "Rimasis",
  "Secen Gross",
  "Smella",
  "Sofra Türke",
  "Sutre",
  "Şeyma Elmaş",
  "Taç",
  "Telkotürk",
  "UmaysA",
  "USRE Okulları",
  "Veggy Snacky",
];

export const webProjects = [
  { name: "Ekoda", url: "ekoda.com.tr" },
  { name: "Aska Hotels", url: "askahotels.com" },
  { name: "Esdo İnşaat", url: "esdoinsaat.com" },
  { name: "Secen Gross", url: "secengross.com" },
  { name: "USRE Okulları", url: "usreokullari.com" },
  { name: "Jaecoo İnoto", url: "jaecoo.inoto.com.tr" },
];

export const awards = [
  {
    title: "Google Partner",
    year: "2025",
    desc: "2025 yılında Google Partner'ı olduk; kampanyalarımız Google'ın performans ve yetkinlik standartlarını karşılıyor.",
  },
  {
    title: "Google Ads Impact Awards",
    year: "2025",
    desc: "Veri odaklı çalışmalarımızla Data Innovation kategorisinde Google tarafından aday gösterildik.",
  },
];

/* ------------------------------------------------------------------ */
/*  Süreç                                                              */
/* ------------------------------------------------------------------ */

export const process = [
  {
    no: "01",
    title: "Keşif & Analiz",
    desc: "Markanızı, hedef kitlenizi ve rakiplerinizi analiz ediyor; mevcut durumu veriyle fotoğraflıyoruz.",
  },
  {
    no: "02",
    title: "Strateji",
    desc: "Hedeflerinize göre mecra, mesaj ve bütçe planını netleştiriyor; yol haritasını birlikte onaylıyoruz.",
  },
  {
    no: "03",
    title: "Tasarım & Üretim",
    desc: "İçerik, tasarım ve kampanyaları markanızın diliyle üretiyor; yayına hazır hale getiriyoruz.",
  },
  {
    no: "04",
    title: "Ölçüm & Optimizasyon",
    desc: "Sonuçları düzenli raporluyor; veriye göre sürekli iyileştirerek performansı büyütüyoruz.",
  },
];

/* ------------------------------------------------------------------ */
/*  İşlerimiz (portfolyo vitrini)                                      */
/* ------------------------------------------------------------------ */

export type Work = {
  slug: string;
  title: string;
  desc: string;
  image: string;
  imageAlt: string;
  serviceSlug: string;
  tags: string[];
};

export const works: Work[] = [
  {
    slug: "logo-marka-kimligi",
    title: "Logo & Marka Kimliği",
    desc: "Şeyma Elmaş'tan Quick Card'a; markanın karakterini tek işarette anlatan özgün logo tasarımları.",
    image: "/work/logo-tasarimlari.webp",
    imageAlt: "Logo tasarımı örnekleri",
    serviceSlug: "grafik-tasarim",
    tags: ["Logo", "Marka Kimliği"],
  },
  {
    slug: "kurumsal-kimlik-setleri",
    title: "Kurumsal Kimlik Setleri",
    desc: "Kartvizitten antetli kağıda; markayı her temas noktasında aynı dille konuşturan kimlik setleri.",
    image: "/work/kurumsal-kimlik.webp",
    imageAlt: "Kurumsal kimlik mockup seti",
    serviceSlug: "grafik-tasarim",
    tags: ["Kartvizit", "Kırtasiye", "Kimlik"],
  },
  {
    slug: "katalog-brosur",
    title: "Katalog & Broşür",
    desc: "Soiltech'ten LionKlinker'a; ürünlerinizi en iyi anlatan baskıya hazır katalog ve broşür tasarımları.",
    image: "/work/katalog-brosur.webp",
    imageAlt: "Katalog ve broşür tasarımları",
    serviceSlug: "grafik-tasarim",
    tags: ["Katalog", "Broşür", "Afiş"],
  },
  {
    slug: "ambalaj-etiket",
    title: "Ambalaj & Etiket",
    desc: "Veggy Snacky serisi gibi; rafta fark edilen, satışa dönüşen ambalaj ve etiket tasarımları.",
    image: "/work/ambalaj-etiket.webp",
    imageAlt: "Ambalaj ve etiket tasarımları",
    serviceSlug: "grafik-tasarim",
    tags: ["Ambalaj", "Etiket", "FMCG"],
  },
  {
    slug: "sosyal-medya-icerikleri",
    title: "Sosyal Medya İçerikleri",
    desc: "Farklı sektörlerden markalar için üretilmiş; etkileşim odaklı gönderi, story ve reels tasarımları.",
    image: "/work/instagram-post-kare.webp",
    imageAlt: "Instagram gönderi tasarımları",
    serviceSlug: "sosyal-medya-yonetimi",
    tags: ["Instagram", "Post", "Reels"],
  },
  {
    slug: "web-siteleri",
    title: "Web Siteleri",
    desc: "ekoda.com.tr, askahotels.com, esdoinsaat.com ve daha fazlası; yayında olan, dönüşüm odaklı siteler.",
    image: "/work/web-laptop-kare.webp",
    imageAlt: "Yayında olan web sitesi projeleri",
    serviceSlug: "web-tasarim",
    tags: ["Kurumsal Site", "E-ticaret"],
  },
];

/* ------------------------------------------------------------------ */
/*  Ürünler (işletmeye yönelik yazılım ürünleri)                       */
/* ------------------------------------------------------------------ */

/* NOT: Canlı içerik panelde (Guru Panel > İçerik > Ürünler); bu liste ve
   products-content.ts yalnız varsayılan/yedek içeriktir (seed + panel yokken). */

export type SoftwareProduct = {
  slug: string;
  name: string;
  tagline: string;
  desc: string;
  features: string[];
  icon: LucideIcon;
  /* Ürün mockup görseli (public/products) */
  image: string;
  imageAlt: string;
};

export const products: SoftwareProduct[] = [
  {
    slug: "guru-chatbot",
    name: "Guru Chatbot",
    tagline: "Yapay zeka destekli müşteri asistanı",
    desc: "Web sitenizde ve sosyal kanallarınızda müşterilerinizle 7/24 konuşan, sorulara anında yanıt veren ve talepleri ekibinize ileten akıllı asistan.",
    features: [
      "7/24 otomatik müşteri yanıtları",
      "Web sitesi ve WhatsApp entegrasyonu",
      "Talepleri ekibe yönlendirme",
    ],
    icon: Bot,
    image: "/products/guru-chatbot.svg",
    imageAlt: "Guru Chatbot yönetim paneli: konuşma listesi, aktif sohbet ve yanıt istatistikleri",
  },
  {
    slug: "guru-crm",
    name: "Guru CRM",
    tagline: "Müşteri ilişkileri tek ekranda",
    desc: "Müşteri kayıtlarından satış fırsatlarına; teklif, görüşme ve takip süreçlerinizi tek panelden yöneten müşteri ilişkileri platformu.",
    features: [
      "Müşteri ve fırsat takibi",
      "Teklif ve satış hattı yönetimi",
      "Raporlama ve hatırlatmalar",
    ],
    icon: Users,
    image: "/products/guru-crm.svg",
    imageAlt: "Guru CRM satış hattı: fırsat kartları, KPI şeridi ve gelir grafiği",
  },
  {
    slug: "guru-operation",
    name: "Guru Operation",
    tagline: "Operasyonunuz kontrol altında",
    desc: "Görevler, iş akışları ve ekip planlaması: günlük operasyonun tamamını görünür kılan, darboğazları erkenden gösteren yönetim aracı.",
    features: [
      "Görev ve iş akışı yönetimi",
      "Ekip planlama ve takvim",
      "Süreç performans takibi",
    ],
    icon: Workflow,
    image: "/products/guru-operation.svg",
    imageAlt: "Guru Operation görev panosu, ekip kapasitesi ve haftalık zaman çizelgesi",
  },
  {
    slug: "guru-business",
    name: "Guru Business",
    tagline: "İşletmeniz için uçtan uca paket",
    desc: "Chatbot, CRM ve Operation modüllerini tek çatıda birleştiren; büyüyen işletmeler için uçtan uca dijital yönetim çözümü.",
    features: [
      "Tüm Guru modülleri bir arada",
      "İşletmeye özel kurulum",
      "Öncelikli destek",
    ],
    icon: Briefcase,
    image: "/products/guru-business.svg",
    imageAlt: "Guru Business genel bakış panosu: KPI'lar, modüller ve gelir dağılımı",
  },
];

/* ------------------------------------------------------------------ */
/*  Hakkımızda                                                         */
/* ------------------------------------------------------------------ */

export const values = [
  {
    title: "Değer Üretme Süreci",
    desc: "İşimizi bir hizmet değil, markaya değer üretme süreci olarak görüyoruz.",
  },
  {
    title: "Özgün Bakış Açısı",
    desc: "Her markayı kendi hikâyesiyle, şablonsuz ve özgün bir dille ifade ediyoruz.",
  },
  {
    title: "Veriyle Karar",
    desc: "Kararlarımızı sezgiyle değil; analiz, test ve ölçümle veriyoruz.",
  },
  {
    title: "Yol Arkadaşlığı",
    desc: "Müşteri değil yol arkadaşı; görev değil ortak bir hayalin gerçeğe dönüşmesi.",
  },
];

export const navLinks = [
  { href: "/", label: "Ana Sayfa" },
  { href: "/hizmetler", label: "Hizmetler" },
  { href: "/urunler", label: "Ürünler" },
  { href: "/hakkimizda", label: "Hakkımızda" },
  { href: "/iletisim", label: "İletişim" },
] as const;

/* ------------------------------------------------------------------ */
/*  Ana menü (açılır gruplar) ve duyuru bandı                          */
/* ------------------------------------------------------------------ */

export type NavItem = { label: string; href: string; desc?: string };
export type NavGroup = { label: string; href: string; items?: NavItem[] };

export const announcement = "Strateji, tasarım ve teknoloji tek çatıda.";

/** Üst menü: hizmet ve ürün grupları panelden gelen listeyle kurulur */
export function buildNavMenu(
  svc: { title: string; slug: string }[],
  prd: { name: string; slug: string; tagline: string }[]
): NavGroup[] {
  return [
    {
      label: "Kurumsal",
      href: "/hakkimizda",
      items: [
        { label: "Hakkımızda", href: "/hakkimizda", desc: "Hikayemiz ve ilkelerimiz" },
        { label: "Ekibimiz", href: "/hakkimizda#ekip", desc: "Markanızla çalışacak ekip" },
        { label: "İletişim", href: "/iletisim", desc: "Teklif ve toplantı" },
      ],
    },
    {
      label: "Hizmetlerimiz",
      href: "/hizmetler",
      items: svc.map((s) => ({ label: s.title, href: `/hizmetler/${s.slug}` })),
    },
    {
      label: "Ürünlerimiz",
      href: "/urunler",
      items: prd.map((p) => ({ label: p.name, href: `/urunler/${p.slug}`, desc: p.tagline })),
    },
    { label: "Referanslarımız", href: "/#referanslar" },
  ];
}

/* ------------------------------------------------------------------ */
/*  ÖRNEK İÇERİK (mockup): gerçek içerik gelene kadar yer tutucu       */
/* ------------------------------------------------------------------ */

/* TODO(client): ekip fotoğrafları, isimler, unvanlar ve LinkedIn adresleri */
export type TeamMember = { name: string; role: string; linkedin?: string; photo?: string };
export const team: TeamMember[] = [
  { name: "Ad Soyad", role: "Kurucu" },
  { name: "Ad Soyad", role: "Sosyal Medya Yöneticisi" },
  { name: "Ad Soyad", role: "Grafik Tasarımcı" },
  { name: "Ad Soyad", role: "Performans Uzmanı" },
  { name: "Ad Soyad", role: "İçerik Editörü" },
  { name: "Ad Soyad", role: "Yazılım Geliştirici" },
];

/* TODO(client): izinli, isimli müşteri yorumları. Uydurma alıntı yazılmaz;
   yorum gelene kadar kartlar boş iskelet olarak görünür. */
export type Testimonial = { quote?: string; name: string; title: string; company: string };
export const testimonials: Testimonial[] = [
  { name: "Müşteri adı", title: "Unvan", company: "Firma" },
  { name: "Müşteri adı", title: "Unvan", company: "Firma" },
  { name: "Müşteri adı", title: "Unvan", company: "Firma" },
];

/* Ana sayfa sık sorulan sorular */
export const homeFaq: { q: string; a: string }[] = [
  { q: "Hangi hizmetleri birlikte alabilirim?", a: "Altı hizmetimizin tamamını tek bir planla birlikte yürütebilir ya da yalnız ihtiyacınız olanı seçebilirsiniz. Birlikte çalıştığımızda strateji, tasarım ve reklam aynı hedefe bakar." },
  { q: "Sosyal medya yönetimine neler dahil?", a: "Platforma özel strateji, aylık içerik planı, tasarım ve metin üretimi, topluluk yönetimi ve düzenli raporlama. Reklam kampanyaları isteğe göre pakete eklenir." },
  { q: "Reklam bütçesini nasıl planlıyorsunuz?", a: "Hedefinizi, kâr marjınızı ve mevcut verinizi inceleyip bütçeyi kanallara göre dağıtıyoruz. Kampanyaları sonuçlara göre haftalık olarak optimize ediyoruz." },
  { q: "Web sitesi ne kadar sürede hazır olur?", a: "Kapsama göre değişir. Kurumsal bir site genellikle birkaç hafta içinde yayına alınır; net süreyi tanışma görüşmesinden sonra planla birlikte paylaşırız." },
  { q: "Raporlamayı ne sıklıkla yapıyorsunuz?", a: "Aylık ayrıntılı rapor paylaşıyor, kampanya dönemlerinde haftalık özet geçiyoruz. Raporlarda yalnız rakam değil, bir sonraki adım da yer alır." },
  { q: "Guru ürünlerini ayrı ayrı alabilir miyim?", a: "Evet. Guru Chatbot, Guru CRM ve Guru Operation tek başına kullanılabilir; Guru Business üçünü tek panelde birleştirir." },
  { q: "Google Partner olmanın bana faydası ne?", a: "Google Partner rozeti, reklam hesaplarını Google'ın performans ve yetkinlik standartlarına göre yönettiğimizi gösterir. Bu da bütçenizin daha verimli kullanılması demektir." },
  { q: "Çalışmaya nasıl başlıyoruz?", a: "Önce kısa bir tanışma görüşmesi yapıyoruz. Ardından ihtiyaçlarınıza göre bir teklif ve yol haritası hazırlayıp onayınızla çalışmaya başlıyoruz." },
];
