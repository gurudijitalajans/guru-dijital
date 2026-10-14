import Link from "next/link";
import { getServices } from "@/lib/content";
import type { HomeContent } from "@/lib/home-defaults";
import { parseAccent } from "@/lib/utils";
import { Btn } from "@/components/site/Btn";
import { Globe } from "./Globe";

/** Google'ın çok renkli "G" işareti */
function GoogleG({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" aria-hidden className={className}>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5Z" />
      <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7Z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44Z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3a12 12 0 0 1-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5Z" />
    </svg>
  );
}

/** Girişin en üstündeki kanıt: Google Partner (2025 ve 2026) */
function GooglePartnerPill() {
  return (
    <p className="inline-flex items-center gap-3 rounded-full bg-white py-2 pl-2 pr-5 text-left shadow-[0_0_0_1px_rgb(1_20_65/0.09),0_10px_28px_-16px_rgb(1_20_65/0.45)]">
      <span className="grid size-9 place-items-center rounded-full bg-white shadow-[0_0_0_1px_rgb(1_20_65/0.08)]">
        <GoogleG className="size-5" />
      </span>
      <span className="leading-tight">
        <b className="block text-[15px] font-semibold text-heading">Google Partner</b>
        <span className="block text-[12.5px] text-muted">2026 yılında sertifikalı iş ortağı</span>
      </span>
    </p>
  );
}

/**
 * Ana sayfa girişi (EDME düzeni): ortalanmış ince başlık, kısa açıklama,
 * hizmet bağlantı şeridi, iki buton, altında yarısı görünen nokta küresi
 * ve kürenin üstüne binen kanıt rozeti. Metinler panelden (Ana Sayfa > Giriş).
 * Giriş metni belirme animasyonu almaz: sayfanın en büyük öğesi (LCP) JS
 * beklemeden görünür; hareketi başlıktaki ışık süpürmesi verir.
 */
export async function Hero({ hero }: { hero: HomeContent["hero"]; referenceCount?: number }) {
  const services = hero.showServiceLinks ? await getServices() : [];
  /* Bölüm yalnız yatayda kırpılır: alttaki kanıt rozetinin gölgesi bölümün dışına yumuşakça taşabilsin */
  return (
    <section className="relative overflow-x-clip pt-8 text-center md:pt-10">
      <div className="container-g">
        <div>
          <h1 className="hero-sweep mx-auto max-w-[900px] text-balance text-[36px] font-normal leading-[1.1] tracking-[-0.035em] sm:text-[48px] lg:text-[56px]">
            {parseAccent(hero.title).map((part, i) =>
              part.accent ? (
                <span key={i} className="font-medium">
                  {part.t}
                </span>
              ) : (
                part.t
              )
            )}
          </h1>
          <p className="mx-auto mt-5 max-w-4xl text-pretty text-[16px] leading-relaxed text-muted md:text-[16.5px]">{hero.sub}</p>
          {/* Hizmetler yalnız boşlukla ayrılır: kırılan satır ayraçla başlamaz */}
          {services.length > 0 && (
          <ul className="mx-auto mt-4 flex max-w-[900px] flex-wrap justify-center gap-x-6 text-[13.5px] text-muted lg:mt-5 lg:gap-x-5">
            {services.map((s) => (
              <li key={s.slug} className="flex items-center">
                {/* Mobilde 44px dokunma alanı; masaüstünde tek satır */}
                <Link href={`/hizmetler/${s.slug}`} className="inline-flex min-h-11 items-center transition-colors hover:text-brand lg:min-h-0 lg:py-1">
                  {s.title}
                </Link>
              </li>
            ))}
          </ul>
          )}
          {/* relative z-10: küre kutusu yukarı çekildiği için düğmelerin altına biner, tıklamayı kapmasın */}
          <div className="relative z-10 mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row lg:mt-8">
            <Btn href={hero.primaryHref} variant="primary" size="lg" arrow className="w-full max-w-xs sm:w-auto" data-umami-event="giris-ana-buton" data-umami-event-metin={hero.primaryLabel}>
              {hero.primaryLabel}
            </Btn>
            <Btn href={hero.secondaryHref} variant="light" size="lg" className="w-full max-w-xs sm:w-auto" data-umami-event="giris-ikinci-buton" data-umami-event-metin={hero.secondaryLabel}>
              {hero.secondaryLabel}
            </Btn>
          </div>
        </div>

        {/* Küre: üst yarısı görünür, alta doğru beyaza erir. Cobe küreyi kanvasın
            ~%10 içinden çizer; eksi boşluk düğmelerle küre arasını girişin diğer
            aralıklarına (~40px) çeker. */}
        <div className="relative mx-auto -mt-2 h-[220px] max-w-[440px] overflow-hidden sm:-mt-6 sm:h-[300px] sm:max-w-[640px] md:-mt-8 md:h-[360px] md:max-w-[780px]">
          <Globe className="absolute left-0 top-0" />
          <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-b from-white/0 to-white" />
        </div>

        {/* Kürenin üstüne binen kanıt kartı: Google Partner */}
        <div className="relative z-10 -mt-9 flex justify-center pb-4">
          <GooglePartnerPill />
        </div>
      </div>
    </section>
  );
}
