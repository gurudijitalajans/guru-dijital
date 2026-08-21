import { Marquee } from "@/components/ui/Marquee";
import { Magnetic } from "@/components/ui/Magnetic";
import { GButton } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";

/**
 * Full-width dark CTA band with a marquee headline — used at the bottom of
 * most pages, above the footer.
 */
export function CTASection({
  title = "Projenizi birlikte büyütelim",
  sub = "Markanız için doğru stratejiyi konuşmak üzere bir kahve içelim; ilk görüşme her zaman ücretsiz.",
}: {
  title?: string;
  sub?: string;
}) {
  return (
    <section className="relative overflow-hidden bg-guru py-20 text-ink md:py-28">
      <div className="pointer-events-none absolute inset-x-0 top-6 select-none opacity-[0.16]" aria-hidden>
        <Marquee slow>
          <span className="whitespace-nowrap pr-8 text-5xl font-extrabold tracking-tight md:text-8xl">
            Unlock the next level · Unlock the next level ·
          </span>
        </Marquee>
      </div>
      <div className="container-g relative flex flex-col items-center text-center">
        <Reveal>
          <h2 className="max-w-3xl text-balance text-4xl font-bold leading-[1.05] tracking-[-0.03em] md:text-6xl">
            {title}
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-ink/70 md:text-lg">
            {sub}
          </p>
        </Reveal>
        <Reveal delay={0.18}>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
            <Magnetic>
              <GButton href="/iletisim" size="lg" variant="dark">
                Teklif Al
              </GButton>
            </Magnetic>
            <Magnetic>
              <GButton href="/hizmetler" size="lg" variant="outline" className="border-ink/25">
                Hizmetleri İncele
              </GButton>
            </Magnetic>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
