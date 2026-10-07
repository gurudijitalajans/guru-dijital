import Link from "next/link";
import { getServices } from "@/lib/content";
import type { HomeContent } from "@/lib/home-defaults";
import { parseAccent } from "@/lib/utils";
import { Btn } from "@/components/site/Btn";
import { Reveal } from "@/components/ui/Reveal";
import { Globe } from "./Globe";

/**
 * Ana sayfa girişi (EDME düzeni): ortalanmış ince başlık, kısa açıklama,
 * hizmet bağlantı şeridi, iki buton, altında yarısı görünen nokta küresi
 * ve kürenin üstüne binen kanıt rozeti. Metinler panelden (Ana Sayfa > Giriş).
 */
export async function Hero({ hero, referenceCount }: { hero: HomeContent["hero"]; referenceCount: number }) {
  const services = hero.showServiceLinks ? await getServices() : [];
  const badgeText = hero.badgeText.replace("{sayı}", String(referenceCount));
  return (
    <section className="relative overflow-hidden pt-12 text-center md:pt-16">
      <div className="container-g">
        <Reveal y={16}>
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
          <p className="mx-auto mt-5 max-w-[680px] text-[16px] leading-relaxed text-muted md:text-[16.5px]">{hero.sub}</p>
          {/* Dar ekranda satır başına nokta düşmesin: ayraç yalnız lg+ (tek satır) */}
          {services.length > 0 && (
          <ul className="mx-auto mt-5 flex max-w-[860px] flex-wrap justify-center gap-x-4 gap-y-1 text-[13.5px] text-muted lg:gap-x-1">
            {services.map((s, i) => (
              <li key={s.slug} className="flex items-center">
                {i > 0 && <span aria-hidden className="mx-2.5 hidden text-[#c5cbd6] lg:inline">·</span>}
                <Link href={`/hizmetler/${s.slug}`} className="py-1 transition-colors hover:text-brand">
                  {s.title}
                </Link>
              </li>
            ))}
          </ul>
          )}
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Btn href={hero.primaryHref} variant="primary" size="lg" arrow data-umami-event="giris-ana-buton" data-umami-event-metin={hero.primaryLabel}>
              {hero.primaryLabel}
            </Btn>
            <Btn href={hero.secondaryHref} variant="light" size="lg" data-umami-event="giris-ikinci-buton" data-umami-event-metin={hero.secondaryLabel}>
              {hero.secondaryLabel}
            </Btn>
          </div>
        </Reveal>

        {/* Küre: üst yarısı görünür, alta doğru beyaza erir */}
        <div className="relative mx-auto mt-10 h-[220px] max-w-[440px] overflow-hidden sm:h-[300px] sm:max-w-[640px] md:mt-12 md:h-[360px] md:max-w-[780px]">
          <Globe className="absolute left-0 top-0" />
          <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-b from-white/0 to-white" />
        </div>

        <div className="relative z-10 -mt-7 flex justify-center pb-4">
          <p className="inline-flex flex-wrap items-center justify-center gap-x-3 gap-y-1 rounded-xl bg-white px-5 py-3 text-[14px] shadow-[0_0_0_1px_rgb(1_20_65/0.08),0_14px_32px_-18px_rgb(1_20_65/0.4)]">
            <span className="relative inline-flex size-2.5" aria-hidden>
              <span className="absolute inset-0 animate-ping rounded-full bg-brand/40 motion-reduce:animate-none" />
              <span className="relative inline-block size-2.5 rounded-full bg-brand" />
            </span>
            {hero.badgeStrong && <b className="font-semibold text-heading">{hero.badgeStrong}</b>}
            {badgeText && <span className="text-muted">{badgeText}</span>}
          </p>
        </div>
      </div>
    </section>
  );
}
