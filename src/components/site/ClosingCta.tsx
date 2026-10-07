import Image from "next/image";
import { Btn } from "@/components/site/Btn";
import { sectionY } from "@/components/site/styles";
import { Reveal } from "@/components/ui/Reveal";

type CtaLink = { href: string; label: string };

export type ClosingCtaProps = {
  title: string;
  lead: string;
  primary?: CtaLink;
  secondary?: CtaLink;
};

/**
 * İç sayfaların ortak kapanış bandı: lacivert kart, ortada beyaz g işareti,
 * başlık, kısa metin, iki buton. Işık yelpazesi kartın ortasına sabitlenmiş
 * geniş bir katmanda durur; dar ekranda da metin koyu orta bölgede kalır.
 * Bant görünürken mobil CTA barı gizlenir (data-hide-cta-bar).
 */
export function ClosingCta({
  title,
  lead,
  primary = { href: "/iletisim", label: "Teklif Al" },
  secondary = { href: "/iletisim#toplanti", label: "Toplantı Planla" },
}: ClosingCtaProps) {
  return (
    <section className={sectionY} data-hide-cta-bar>
      <div className="container-g">
        <Reveal>
          <div className="relative isolate overflow-hidden rounded-[28px] bg-navy px-6 py-14 text-center sm:px-10 md:py-20">
            <div
              aria-hidden
              className="guru-beam absolute left-1/2 top-0 -z-10 h-full w-[1240px] max-w-none -translate-x-1/2"
            />
            <Image src="/brand/mark-white.svg" alt="" width={44} height={44} className="mx-auto size-11" />
            <h2 className="mx-auto mt-6 max-w-2xl text-balance text-[30px] font-normal leading-[1.15] tracking-[-0.03em] text-white md:text-[40px]">
              {title}
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-[15.5px] leading-relaxed text-white/80 md:text-[16.5px]">
              {lead}
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Btn href={primary.href} variant="white" size="lg" arrow className="w-full max-w-xs sm:w-auto">
                {primary.label}
              </Btn>
              <Btn href={secondary.href} variant="brand" size="lg" className="w-full max-w-xs sm:w-auto">
                {secondary.label}
              </Btn>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
