import { awards, values } from "@/lib/data";
import type { IconName } from "@/lib/icon-names";

/**
 * Hakkımızda sayfasının varsayılanları: panelde "Hakkımızda" alanlarının
 * ilk değeri ve panele ulaşılamadığında sitenin yedek içeriği.
 * Ödül görselleri yedekte public/work altındaki dosyalardır.
 */
const VALUE_ICONS: IconName[] = ["gem", "lightbulb", "chart-line", "handshake"];
const AWARD_META: Record<string, { badge: string; icon: IconName; image: string; alt: string }> = {
  "Google Partner": {
    badge: "Partner Rozeti",
    icon: "badge-check",
    image: "/work/odul-partner.webp",
    alt: "2025 Google Partner rozeti",
  },
  "Google Ads Impact Awards": {
    badge: "Data Innovation Adayı",
    icon: "award",
    image: "/work/odul-impact.webp",
    alt: "Google Ads Impact Awards 2025 Data Innovation kategorisi aday belgesi",
  },
};

export const ABOUT_DEFAULTS = {
  intro: {
    eyebrow: "Biz Kimiz",
    title: "Markaların yol arkadaşıyız",
    lead: "Strateji, tasarım ve teknolojiyi tek çatıda buluşturuyor; markanızı dijitalde sizinle birlikte büyütüyoruz.",
    primaryLabel: "Tanışalım",
    primaryHref: "/iletisim",
    secondaryLabel: "Ekibimizi Tanıyın",
    secondaryHref: "#ekip",
  },
  story: {
    title: "Hikayemiz",
    paragraphs: [
      "Yaratıcılığın markalar için dönüştürücü bir etki yarattığına inanıyoruz. Sosyal medyadan web tasarıma, içerikten dijital pazarlamaya kadar her işi aynı hedefe bakan tek bir ekiple yürütüyoruz.",
      "Sağlıktan turizme, perakendeden inşaata farklı sektörlerden markalarla çalışıyor; ajans deneyimimizi işletmelerin günlük işini kolaylaştıran yazılımlara da taşıyoruz.",
    ],
    valuesLabel: "İlkelerimiz",
    values: values.map((v, i) => ({ icon: VALUE_ICONS[i % VALUE_ICONS.length], title: v.title, desc: v.desc })),
  },
  awards: {
    show: true,
    title: "Ödüller ve Tanınırlık",
    lead: "2025'te Google Partner olduk; veri odaklı çalışmalarımızla Google Ads Impact Awards'ta aday gösterildik.",
    items: awards.map((a) => ({
      title: a.title,
      year: a.year,
      desc: a.desc,
      badge: AWARD_META[a.title]?.badge ?? "",
      icon: AWARD_META[a.title]?.icon ?? ("award" as IconName),
      image: AWARD_META[a.title] ? { src: AWARD_META[a.title].image, alt: AWARD_META[a.title].alt, w: 1600, h: 1131 } : null,
    })),
  },
  team: {
    show: true,
    title: "Ekibimiz",
    lead: "Strateji, tasarım, içerik ve performans uzmanlarından oluşan, aynı hedefe odaklı bir ekip.",
  },
  stats: {
    show: true,
    title: "Sayılarla Guru",
    referencesLabel: "Referans Marka",
    servicesLabel: "Uzmanlık Alanı",
    productsLabel: "Yazılım Ürünü",
  },
  closing: {
    title: "Markanızı Birlikte Büyütelim",
    lead: "Hedeflerinizi dinleyelim; size uygun planı birlikte çıkaralım. İlk görüşme ücretsiz.",
    primaryLabel: "Tanışalım",
  },
  seo: {
    title: "Hakkımızda",
    description:
      "Guru Dijital'i tanıyın: Google Partner ve Google Ads Impact Awards adayı ekibimizle markaların yol arkadaşıyız; strateji, tasarım ve teknoloji tek çatıda.",
  },
};

export type AboutContent = typeof ABOUT_DEFAULTS;
export type AwardView = AboutContent["awards"]["items"][number];
