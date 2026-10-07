import { FaqGrid, type FaqItem } from "@/components/site/FaqGrid";

/* İletişim sayfasına özel kısa SSS. Görünüm ve açılır davranış FaqGrid'den gelir
   (iki sütunlu ince halkalı kartlar, başlangıçta hepsi kapalı: hydration güvenli). */
export const contactFaqs: FaqItem[] = [
  {
    q: "Süreç nasıl başlıyor?",
    a: "Ücretsiz bir keşif görüşmesiyle başlıyoruz. Markanızı, hedeflerinizi ve mevcut durumunuzu dinliyor; ardından size özel bir yol haritası ve teklif sunuyoruz.",
  },
  {
    q: "Hangi şehirlerle çalışıyorsunuz?",
    a: "Türkiye genelinde ve global ölçekte çalışıyoruz. Süreçlerimiz tamamen uzaktan yürütülebiliyor; toplantıları çevrim içi yapıyor, işleri şeffaf araçlar üzerinden birlikte takip ediyoruz.",
  },
  {
    q: "Raporlama nasıl işliyor?",
    a: "Düzenli ve veri odaklı raporlama yapıyoruz. Neyin işe yaradığını, neyin geliştirilmesi gerektiğini net metriklerle görürsünüz; kararları birlikte veriyoruz.",
  },
  {
    q: "Sözleşme ve paket modeliniz nasıl?",
    a: "İhtiyaca göre esnek bir model uyguluyoruz: proje bazlı ya da aylık iş birliği şeklinde çalışabiliyoruz. Kapsamı ve bütçeyi keşif görüşmesinde birlikte netleştiriyoruz.",
  },
];

export function ContactFaq({ className }: { className?: string }) {
  return <FaqGrid items={contactFaqs} className={className} />;
}
