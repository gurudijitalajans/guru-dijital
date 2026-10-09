/**
 * Yeni tasarım sisteminin ortak sınıfları (EDME çizgisinde, mavi marka).
 * Bütün sayfalar bu sabitleri kullanır; tutarlılık buradan sağlanır.
 *
 * Kurallar:
 * - Zemin beyaz; bölümler arası ayrım boşluk ve `bg-soft` bantla yapılır. Ayraç ÇİZGİSİ yok
 *   (border-t/b, divide-y, hr kullanılmaz). Kart kenarı ince gölge halkasıdır.
 * - Başlıklar ince ve büyük (font-medium = 500, sayfa başlığı font-normal = 400 olabilir),
 *   renk `text-heading`. Gövde `text-body`, ikincil `text-muted`.
 * - Vurgu rengi `brand` (mavi). Birincil buton lacivert (`Btn variant="primary"`).
 * - Hareket sakin: Reveal ile yumuşak belirme, hafif hover yükselmesi; dev efekt yok.
 */

/** Standart bölüm dikey boşluğu */
export const sectionY = "py-16 md:py-[72px]";

/** Beyaz kart: 16px köşe, ince halka */
export const cardCls = "rounded-2xl bg-white shadow-[0_0_0_1px_rgb(1_20_65/0.08)]";

/** Etkileşimli kart (bağlantı olan kartlar). Tailwind v4 kaldırmayı `translate` özelliğiyle yapar. */
export const cardHoverCls =
  "transition-[box-shadow,translate] duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_0_1px_rgb(42_106_202/0.35),0_18px_40px_-24px_rgb(1_20_65/0.35)]";

/** Kart içindeki ikon kutusu: menüdeki ikonlarla aynı marka mavisi */
export const iconBoxCls = "grid size-11 place-items-center rounded-xl bg-chip text-brand";

/** Küçük hap rozet */
export const pillCls =
  "inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-1.5 text-[13px] font-medium text-heading shadow-[0_0_0_1px_rgb(1_20_65/0.08)]";

/** Kart başlığı */
export const cardTitleCls = "text-balance text-[18px] font-medium leading-snug tracking-[-0.015em] text-heading";

/** Kart açıklaması */
export const cardTextCls = "text-pretty text-[14.5px] leading-relaxed text-muted";
