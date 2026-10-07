import { homeFaq, site } from "@/lib/data";

/**
 * Ana sayfa metinlerinin varsayılanları. İki yerde kullanılır:
 * panelde "Ana Sayfa" alanlarının ilk değeri olarak ve panele
 * ulaşılamadığında sitenin yedek içeriği olarak.
 */
export const HOME_DEFAULTS = {
  hero: {
    /* *yıldızlı* kelime bir kademe kalın yazılır */
    title: "Markanızı bir üst seviyeye *taşıyoruz*",
    sub: "Sosyal medyadan web tasarıma, dijital pazarlamadan yazılım ürünlerine: markanızı tek bir büyüme planıyla yönetiyoruz.",
    showServiceLinks: true,
    primaryLabel: "Teklif Al",
    primaryHref: "/iletisim",
    secondaryLabel: "Toplantı Planla",
    secondaryHref: "/iletisim#toplanti",
    badgeStrong: "2025 Google Partner",
    /* {sayı} yerine paneldeki referans sayısı yazılır */
    badgeText: "{sayı} markanın dijital yol arkadaşı",
  },
  references: {
    show: true,
    title: "Referanslarımız",
    lead: "Sağlıktan e-ticarete, turizmden inşaata farklı sektörlerden markalarla aynı masada üretiyoruz.",
  },
  services: {
    show: true,
    title: "Hizmetlerimiz",
    /* {sayı} yerine hizmet sayısı yazıyla gelir (altı, yedi…) */
    lead: "Markanızı büyüten {sayı} disiplin; her biri ölçülebilir hedeflerle yönetilir.",
  },
  products: {
    show: true,
    title: "Ürünlerimiz",
    lead: "Ajans deneyimimizi işletmeniz için çalışan yazılımlara dönüştürdük.",
  },
  video: {
    show: true,
    title: "Bizi Tanıyın",
    lead: "Guru Dijital'in nasıl çalıştığını ve markalara neler kattığını kısa bir videoda izleyin.",
  },
  cases: {
    show: true,
    title: "Başarı Hikayeleri",
    lead: "Strateji, reklam ve içeriği aynı hedefe bağladığımızda ortaya çıkan sonuçlar.",
  },
  team: {
    show: true,
    title: "Ekibimiz",
    lead: "Strateji, tasarım, içerik ve performans uzmanlarından oluşan, aynı hedefe odaklı bir ekip.",
    limit: 4,
  },
  quotes: {
    show: true,
    title: "Markalar Ne Diyor",
    lead: "Birlikte büyüdüğümüz markaların deneyimleri, kendi sözleriyle.",
  },
  faq: {
    show: true,
    title: "Sık Sorulan Sorular",
    items: homeFaq,
  },
  meet: {
    title: "Tanışalım",
    text: "Markanızı ve hedeflerinizi dinleyelim; size uygun planı birlikte çıkaralım. İlk görüşme ücretsiz.",
    buttonLabel: "İletişime Geç",
    buttonHref: "/iletisim",
  },
  seo: {
    title: `${site.name} | ${site.tagline}`,
    description: site.description,
  },
};

export type HomeContent = typeof HOME_DEFAULTS;
