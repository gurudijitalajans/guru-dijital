import {
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
    "Guru Dijital; sosyal medya yönetimi, grafik tasarım, içerik üretimi, web tasarım, dijital pazarlama ve video tasarımı alanlarında entegre çözümler sunan dijital ajans.",
  url: "https://www.gurudijital.com.tr",
  instagram: "https://www.instagram.com/gurudijital",
  email: "info@gurudijital.com.tr",
  // TODO(client): telefon, WhatsApp ve adres bilgileri netleşince güncellenecek
  phone: "",
  whatsapp: "",
  address: "",
};

/* ------------------------------------------------------------------ */
/*  Hizmetler                                                          */
/* ------------------------------------------------------------------ */

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
    offeringsTitle: "Sunduğumuz hizmetler",
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
    keywords: ["strateji", "içerik planı", "topluluk yönetimi", "Meta Ads", "raporlama"],
  },
  {
    slug: "grafik-tasarim",
    no: "02",
    title: "Grafik Tasarım",
    headline: "Markanıza değer katan tasarımlar",
    short:
      "Logo ve kurumsal kimlikten ambalaja; markanızın görsel dilini estetik ve stratejik bir bütünlükle kuruyoruz.",
    icon: Palette,
    intro: [
      "Görsel tasarım, markanızın dış dünyaya attığı ilk adımdır ve doğru atıldığında güçlü bir etki yaratır. Markanızın kimliğini yansıtan özgün ve yaratıcı tasarımlar üreterek mesajınızı hedef kitlenize estetik ve stratejik bir bütünlük içinde ulaştırıyoruz.",
      "Tasarım sürecinde sadece göze hitap eden değil; aynı zamanda markanızın değerlerini yansıtan ve kullanıcı deneyimini gözeten işler üretiyoruz.",
    ],
    offeringsTitle: "Neler tasarlıyoruz?",
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
    offeringsTitle: "İçerik başlıklarımız",
    offerings: [
      "Marka diline özel metin yazarlığı ve slogan çalışmaları",
      "Sosyal medya içerik kurgusu ve metinleri",
      "SEO uyumlu web sitesi ve blog içerikleri",
      "Reklam kampanyası metinleri",
      "Kreatif konsept ve hikâyeleştirme",
    ],
    images: [
      { src: "/work/instagram-post-kare.webp", alt: "Sosyal medya gönderi tasarımları" },
      { src: "/tiles/icerik-uretimi.webp", alt: "Guru marka deseni" },
    ],
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
    offeringsTitle: "Sunduğumuz çözümler",
    offerings: [
      "Kurumsal web sitesi tasarımı ve geliştirme",
      "E-ticaret siteleri ve ürün kataloğu altyapıları",
      "Tüm cihazlarla uyumlu (responsive) arayüz tasarımı",
      "SEO dostu, hızlı ve güvenli teknik altyapı",
      "Bakım, güncelleme ve teknik destek",
    ],
    outro:
      "ekoda.com.tr, askahotels.com, esdoinsaat.com, secengross.com ve usreokullari.com dahil birçok markanın web sitesini tasarladık ve yayına aldık.",
    images: [
      { src: "/work/web-siteleri.webp", alt: "Yayında olan web sitesi projeleri" },
      { src: "/work/web-mockup-dark.webp", alt: "Web tasarım laptop mockup" },
      { src: "/work/web-siteleri-2.webp", alt: "Web tasarım projeleri laptop mockupları" },
    ],
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
    offeringsTitle: "Hizmetlerimiz",
    offerings: [
      "Google & Meta Ads kampanya yönetimi",
      "TikTok, LinkedIn ve diğer platform kampanyaları",
      "Yeniden pazarlama ve dönüşüm optimizasyonu",
      "ROAS odaklı analiz ve düzenli raporlama",
    ],
    outro:
      "Dijital pazarlamayı bir reklam gideri değil, markanızı büyüten stratejik bir yatırım olarak görüyoruz. 2025'te Google Partner'ı olduk ve Google Ads Impact Awards'ta 'Data Innovation' kategorisinde aday gösterildik.",
    images: [
      { src: "/work/dijital-pazarlama.webp", alt: "Dijital pazarlama kreatif kolaj" },
    ],
    keywords: ["Google Ads", "Meta Ads", "dönüşüm", "ROAS", "remarketing"],
  },
  {
    slug: "video-tasarimi",
    no: "06",
    title: "Video Tasarımı",
    headline: "Hikâyenizi harekete geçirin",
    short:
      "Reels ve reklam videolarından kurumsal tanıtımlara; markanızı hareketli içerikle anlatıyoruz.",
    icon: Clapperboard,
    intro: [
      "Video, dijitalde en yüksek etkileşimi alan içerik formatı. Markanızın hikâyesini; kurgusu, müziği ve grafikleriyle bütünleşen videolarla anlatıyoruz.",
      "Sosyal medya için dikey videolardan reklam filmlerine kadar tüm süreçleri; senaryo, çekim planı, kurgu ve yayın optimizasyonuyla birlikte yönetiyoruz.",
    ],
    offeringsTitle: "Video çözümlerimiz",
    offerings: [
      "Sosyal medya videoları (Reels, TikTok, Shorts)",
      "Ürün ve hizmet tanıtım videoları",
      "Motion graphics ve animasyon",
      "Reklam kampanyası videoları",
      "Kurumsal tanıtım filmleri",
    ],
    images: [
      { src: "/work/sosyal-icerik-cita.webp", alt: "Hareketli içerik kreatif tasarımı" },
      { src: "/tiles/video-tasarimi.webp", alt: "Guru marka deseni" },
    ],
    keywords: ["reels", "motion graphics", "reklam filmi", "kurgu"],
  },
];

/* ------------------------------------------------------------------ */
/*  Vaka çalışmaları                                                   */
/* ------------------------------------------------------------------ */

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
    title: "Aynı bütçeyle 3 kat fazla hasta",
    summary:
      "Kliniğin dijital reklam süreçleri devraldığımızda sonuçlar potansiyelin oldukça altındaydı. Reklam bütçesini artırmadan, stratejiyi tamamen yenileyerek yalnızca 3 ayda etkileyici bir dönüşüm sağladık.",
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
    note: "Dönemsel kampanyalarda önceki cironun %96 üzerine çıktık",
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
    desc: "Veri odaklı çalışmalarımızla 'Data Innovation' kategorisinde Google tarafından aday gösterildik.",
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
/*  Ürünler (iş ürünleri vitrini)                                      */
/* ------------------------------------------------------------------ */

export type Product = {
  slug: string;
  title: string;
  desc: string;
  image: string;
  imageAlt: string;
  serviceSlug: string;
  tags: string[];
};

export const products: Product[] = [
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
/*  Hakkımızda                                                         */
/* ------------------------------------------------------------------ */

export const aboutParagraphs = [
  "İletişim kurmanın gücüne, yaratıcılığın markalar için dönüştürücü bir etki yaratabileceğine inanan bir ekip olarak yola çıktık. İlk projelerimizi tasarlarken bizi harekete geçiren en güçlü motivasyon, işimize yalnızca bir “hizmet” olarak değil, bir “değer üretme süreci” olarak yaklaşmaktı. Amacımız; birlikte çalıştığımız markaların hikâyelerine katkı sunmak, onları özgün bir bakış açısıyla ifade etmek ve hedef kitleleriyle gerçek bir bağ kurmalarını sağlamaktı.",
  "Yıllar içinde değişen teknolojilere, gelişen dijital dinamiklere ve dönüşen tüketici davranışlarına hızla adapte olduk. Ancak ilk günkü heyecanımızdan, üretme tutkumuzdan ve işimize duyduğumuz saygıdan hiçbir şey kaybetmedik. Sürekli gelişen, öğrenen ve dönüşen bir yapıyla bugün geldiğimiz noktada; stratejik iletişimden dijital kampanya yönetimine, yaratıcı içerik üretiminden sosyal medya ve performans pazarlamasına, medya planlamasından marka konumlandırmaya kadar geniş bir yelpazede entegre çözümler sunuyoruz.",
  "Guru Dijital olarak yerel pazarlarda olduğu kadar global ölçekte de birçok markayla çalışıyor, her projeye aynı özen ve aynı detaycılıkla yaklaşıyoruz. Çünkü bizim için her marka; sadece bir müşteri değil, birlikte yol aldığımız bir yol arkadaşı, her proje ise sadece bir görev değil, ortak bir hayalin gerçeğe dönüşme sürecidir.",
  "Bizce iyi bir iş; yalnızca sonuçla değil, sürece gösterilen özenle, verilen emekle ve her gün yeniden daha iyisini hedeflemekle mümkündür. Bu anlayışla çalışıyor, işimize duyduğumuz tutkuyu ve ilkelerimizi geleceğe de kararlılıkla taşıyoruz.",
];

export const values = [
  {
    title: "Değer üretme süreci",
    desc: "İşimizi bir hizmet değil, markaya değer üretme süreci olarak görüyoruz.",
  },
  {
    title: "Özgün bakış açısı",
    desc: "Her markayı kendi hikâyesiyle, şablonsuz ve özgün bir dille ifade ediyoruz.",
  },
  {
    title: "Veriyle karar",
    desc: "Kararlarımızı sezgiyle değil; analiz, test ve ölçümle veriyoruz.",
  },
  {
    title: "Yol arkadaşlığı",
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
