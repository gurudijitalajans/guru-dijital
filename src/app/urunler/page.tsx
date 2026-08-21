import type { Metadata } from "next";
import { PageHero, AccentText } from "@/components/layout/PageHero";
import { CTASection } from "@/components/sections/CTASection";
import { ProductsShowcase } from "@/components/pages/ProductsShowcase";
import { Reveal } from "@/components/ui/Reveal";
import { GButton } from "@/components/ui/Button";
import { Magnetic } from "@/components/ui/Magnetic";
import { Scramble } from "@/components/fx/Scramble";
import { RotatingBadge } from "@/components/fx/RotatingBadge";
import { SectionDivider } from "@/components/v2/SectionDivider";

export const metadata: Metadata = {
  title: "Ürünler",
  description:
    "Guru Chatbot, Guru CRM, Guru Operation ve Guru Business; işletmenizi büyüten yazılım ürünlerimiz çok yakında.",
};

/* PageHeroV2 eyebrow'u yalnızca JSX içinde render eder; Scramble SSR'da düz
   metin bastığı için ReactNode olarak güvenle geçer (tip daraltması string). */
const scrambledEyebrow = (
  <Scramble text="Ürünlerimiz" duration={1.1} />
) as unknown as string;

export default function UrunlerPage() {
  return (
    <>
      <PageHero
        eyebrow={scrambledEyebrow}
        title="İşletmenizi büyüten *yazılım* ürünleri"
        sub="Ajans deneyimimizi işletmeniz için çalışan ürünlere dönüştürüyoruz."
        aside={<RotatingBadge size={120} />}
      />

      {/* Ürün vitrini: 4 yazılım ürünü, 2x2 dev kart grid'i */}
      <section className="relative overflow-hidden py-16 md:py-24">
        <div
          className="grain-blob -left-32 top-1/4 h-96 w-96 opacity-15"
          aria-hidden
        />
        <div
          className="grain-blob -right-40 bottom-10 h-80 w-80 opacity-10"
          aria-hidden
        />
        <div className="container-g relative">
          <ProductsShowcase />
        </div>
      </section>

      <SectionDivider from="coal" to="ink" flip />

      {/* Özel çözüm bandı */}
      <section className="relative overflow-hidden bg-ink py-16 text-paper md:py-24">
        <div
          className="grain-blob -right-28 -top-24 h-80 w-80 opacity-20"
          aria-hidden
        />
        <div className="container-g relative flex flex-col items-center gap-8 text-center md:flex-row md:justify-between md:gap-12 md:text-left">
          <Reveal>
            <div>
              <h2 className="max-w-xl text-balance text-3xl font-extrabold leading-[1.06] tracking-[-0.03em] sm:text-4xl md:text-5xl">
                <AccentText text="İşletmenize *özel* çözüm mü gerekiyor?" />
              </h2>
              <p className="mt-4 max-w-lg text-base leading-relaxed text-paper/65 md:text-lg">
                İhtiyacınızı dinleyelim; size uygun kurulumu birlikte planlayalım.
              </p>
            </div>
          </Reveal>
          <Reveal delay={0.1} className="shrink-0">
            <Magnetic>
              <GButton href="/iletisim" size="lg" variant="green">
                Teklif Al
              </GButton>
            </Magnetic>
          </Reveal>
        </div>
      </section>

      <SectionDivider from="ink" to="coal" />

      <CTASection />
    </>
  );
}
