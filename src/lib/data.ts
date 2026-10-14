import servicesContent from "@/content/services.json";
import { DEFAULT_ICON, isIconName } from "@/lib/icon-names";
import {
  Bot,
  Briefcase,
  Users,
  Workflow,
  type LucideIcon,
} from "lucide-react";
import type { IconName } from "@/lib/icon-names";

/* ------------------------------------------------------------------ */
/*  Site                                                               */
/* ------------------------------------------------------------------ */

export const site = {
  name: "Guru Dijital Ajans",
  shortName: "Guru Dijital",
  tagline: "grow with guru",
  description:
    "Guru Dijital: sosyal medya yönetimi, grafik tasarım, içerik üretimi, web tasarım, dijital pazarlama ve video tasarımında entegre çözümler sunan dijital ajans.",
  url: "https://www.gurudijital.com",
  instagram: "https://www.instagram.com/gurudijital",
  email: "info@gurudijital.com",
  phone: "0850 308 34 57",
  /* wa.me biçimi: ülke koduyla, başında sıfır ve + olmadan */
  whatsapp: "908503083457",
  address: "",
};

/* Umami: çerezsiz, kişisel veri toplamayan ziyaretçi sayımı (Umami Cloud, Guru
   hesabı). Site kimliği gizli değildir, betikte herkese açık görünür. Yalnız
   aşağıdaki alan adları sayılır: önizleme ve yerel adresler sayıma girmez. */
export const umami = {
  websiteId: "fb72f8f5-2e67-4ed6-9b06-6e5b8bb7f26a",
  scriptUrl: "https://cloud.umami.is/script.js",
  domains: "guru-dijital-pied.vercel.app,gurudijital.com,www.gurudijital.com",
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
  icon: IconName;
  intro: string[];
  offeringsTitle: string;
  offerings: string[];
  outro?: string;
  keywords: string[];
  /** Arama sonucu açıklaması (140-160 karakter); yoksa short kullanılır */
  seoDescription?: string;
  /** Üst menüde başlığın altındaki tek satır (en fazla 48 karakter) */
  menuDesc: string;
  faq: { q: string; a: string }[];
};

/* Dokuz hizmet: metinler src/content/services.json (panelin ilk değeri ve yedek) */
export const services: Service[] = (servicesContent as (Omit<Service, "no" | "icon"> & { icon: string })[]).map((s, i) => ({
  ...s,
  no: String(i + 1).padStart(2, "0"),
  icon: isIconName(s.icon) ? s.icon : DEFAULT_ICON,
}));

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
      { value: 300, suffix: "%", label: "Yurt dışı hasta sayısı artışı" },
      { value: 350, suffix: "%", label: "Yurt içi hasta sayısı artışı" },
      { value: 320, suffix: "%", label: "Yurt dışı hasta geliri artışı" },
      { value: 245, suffix: "%", label: "Yurt içi hasta geliri artışı" },
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
    year: "2025 · 2026",
    desc: "Google'ın performans, reklam harcaması ve yetkinlik kriterlerini karşılayan ajanslara verilen rozet. 2026'da da yeniledik; reklam hesaplarınız bu standartlarla yönetilir.",
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
    desc: "İçerik, tasarım ve kampanyaları markanızın diliyle üretiyor; yayına hazır hâle getiriyoruz.",
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
    image: "/products/screens/guru-chatbot.webp",
    imageAlt: "Guru Chatbot gelen kutusu: konuşma listesi, aktif sohbet ve yanıt istatistikleri",
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
    image: "/products/screens/guru-crm.webp",
    imageAlt: "Guru CRM satış hattı: göstergeler ve aşamalara göre fırsat kartları",
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
    image: "/products/screens/guru-operation.webp",
    imageAlt: "Guru Operation panosu: görevler, ekip kapasitesi ve haftalık zaman çizelgesi",
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
    image: "/products/screens/guru-business.webp",
    imageAlt: "Guru Business genel bakış: göstergeler, modüller, gelir dağılımı ve son aktiviteler",
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

export type NavItem = { label: string; href: string; desc: string; icon: IconName };
/** Açılır menü: her öğe ikon + başlık + tek satır açıklama; altta aynı biçimde bir bağlantı satırı */
export type NavGroup = { label: string; href: string; items?: NavItem[]; footer?: { hint: string; label: string; href: string } };

export const announcement = "Strateji, tasarım ve teknoloji tek çatıda.";
/** Duyuru bandında sırayla dönen diğer cümleler (15 saniyede bir) */
export const announcementMore = [
  "2026'da da Google Partner'ız: reklam bütçeniz sertifikalı ellerde.",
  "Web sitesinden mobil uygulamaya, fikirden yayına tek ekip.",
  "SEO ile reklama bağımlı kalmadan büyüyen organik trafik.",
  "Marka tescilinden sosyal medyaya, markanızın her adımında yanınızdayız.",
];

/** Üst menü: hizmet ve ürün grupları panelden gelen listeyle kurulur */
export function buildNavMenu(
  svc: { title: string; slug: string; icon: IconName; menuDesc: string }[],
  prd: { name: string; slug: string; tagline: string; icon: IconName }[]
): NavGroup[] {
  return [
    {
      label: "Kurumsal",
      href: "/hakkimizda",
      items: [
        { label: "Hakkımızda", href: "/hakkimizda", desc: "Hikâyemiz ve ilkelerimiz", icon: "lightbulb" },
        { label: "Ekibimiz", href: "/hakkimizda#ekip", desc: "Markanızla çalışacak ekip", icon: "users" },
        { label: "Ödüllerimiz", href: "/hakkimizda#oduller", desc: "Google Partner ve sektör ödülleri", icon: "award" },
        { label: "İletişim", href: "/iletisim", desc: "Teklif, toplantı ve iletişim kanalları", icon: "mail" },
      ],
      footer: { hint: "30 dakikalık tanışma görüşmesi", label: "Toplantı Planla", href: "/iletisim#toplanti" },
    },
    {
      label: "Hizmetlerimiz",
      href: "/hizmetler",
      items: svc.map((s) => ({ label: s.title, href: `/hizmetler/${s.slug}`, desc: s.menuDesc, icon: s.icon })),
      footer: { hint: "Tek ekip, uçtan uca hizmet", label: "Tüm Hizmetler", href: "/hizmetler" },
    },
    {
      label: "Ürünlerimiz",
      href: "/urunler",
      items: prd.map((p) => ({ label: p.name, href: `/urunler/${p.slug}`, desc: p.tagline, icon: p.icon })),
      footer: { hint: "Aynı veri tabanında çalışan yazılımlar", label: "Tüm Ürünler", href: "/urunler" },
    },
    { label: "Referanslarımız", href: "/referanslar" },
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
  { q: "Hangi hizmetleri birlikte alabilirim?", a: "Hizmetlerimizin tamamını tek bir planla birlikte yürütebilir ya da yalnız ihtiyacınız olanı seçebilirsiniz. Birlikte çalıştığımızda strateji, tasarım ve reklam aynı hedefe bakar." },
  { q: "Sosyal medya yönetimine neler dahil?", a: "Platforma özel strateji, aylık içerik planı, tasarım ve metin üretimi, topluluk yönetimi ve düzenli raporlama. Reklam kampanyaları isteğe göre pakete eklenir." },
  { q: "Reklam bütçesini nasıl planlıyorsunuz?", a: "Hedefinizi, kâr marjınızı ve mevcut verinizi inceleyip bütçeyi kanallara göre dağıtıyoruz. Kampanyaları sonuçlara göre haftalık olarak optimize ediyoruz." },
  { q: "Web sitesi ne kadar sürede hazır olur?", a: "Kapsama göre değişir. Kurumsal bir site genellikle birkaç hafta içinde yayına alınır; net süreyi tanışma görüşmesinden sonra planla birlikte paylaşırız." },
  { q: "Raporlamayı ne sıklıkla yapıyorsunuz?", a: "Aylık ayrıntılı rapor paylaşıyor, kampanya dönemlerinde haftalık özet geçiyoruz. Raporlarda yalnız rakam değil, bir sonraki adım da yer alır." },
  { q: "Guru ürünlerini ayrı ayrı alabilir miyim?", a: "Evet. Guru Chatbot, Guru CRM ve Guru Operation tek başına kullanılabilir; Guru Business üçünü tek panelde birleştirir." },
  { q: "Google Partner olmanın bana faydası ne?", a: "Google Partner rozeti, reklam hesaplarını Google'ın performans ve yetkinlik standartlarına göre yönettiğimizi gösterir. Bu da bütçenizin daha verimli kullanılması demektir." },
  { q: "Çalışmaya nasıl başlıyoruz?", a: "Önce kısa bir tanışma görüşmesi yapıyoruz. Ardından ihtiyaçlarınıza göre bir teklif ve yol haritası hazırlayıp onayınızla çalışmaya başlıyoruz." },
];
