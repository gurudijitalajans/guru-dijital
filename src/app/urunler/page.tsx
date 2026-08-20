import type { Metadata } from "next";
import { PageHero, AccentText } from "@/components/layout/PageHero";
import { CTASection } from "@/components/sections/CTASection";
import { ProductGrid } from "@/components/pages/ProductGrid";
import { Reveal } from "@/components/ui/Reveal";
import { GButton } from "@/components/ui/Button";
import { Magnetic } from "@/components/ui/Magnetic";
import { site } from "@/lib/data";

export const metadata: Metadata = {
  title: "Ürünler",
  description:
    "Logo ve marka kimliğinden ambalaja, katalogdan web sitelerine; Guru Dijital'in ürettiği işlerden seçkiler.",
};

export default function UrunlerPage() {
  return (
    <>
      <PageHero
        eyebrow="Ürünlerimiz"
        title="Sözü işlerimize *bırakıyoruz*"
        sub="Hizmetlerimizin somut çıktıları: logo'dan ambalaja, katalogdan web sitesine."
      />

      {/* Ürün vitrini: filtre + grid */}
      <section className="pb-20 md:pb-28">
        <div className="container-g">
          <Reveal>
            <ProductGrid />
          </Reveal>
        </div>
      </section>

      {/* Instagram bandı */}
      <section className="relative overflow-hidden bg-coal py-20 text-paper md:py-28">
        <div className="grain-blob -right-32 -top-24 h-96 w-96 opacity-35" aria-hidden />
        <div className="grain-blob -left-40 bottom-0 h-80 w-80 opacity-20" aria-hidden />
        <div className="container-g relative flex flex-col items-center text-center">
          <Reveal>
            <h2 className="max-w-2xl text-balance text-3xl font-bold leading-[1.06] tracking-[-0.03em] sm:text-4xl md:text-5xl">
              <AccentText text="Portfolyomuz sürekli *büyüyor*" />
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-paper/70 md:text-lg">
              En güncel işlerimizi ve kamera arkasını Instagram&apos;da paylaşıyoruz.
              Buradaki seçki yalnızca küçük bir kesit.
            </p>
          </Reveal>
          <Reveal delay={0.18}>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
              <Magnetic>
                <GButton href={site.instagram} external size="lg" variant="green">
                  Instagram&apos;da İnceleyin
                </GButton>
              </Magnetic>
              <Magnetic>
                <GButton href="/hizmetler" size="lg" variant="light">
                  Hizmetlerimize Bakın
                </GButton>
              </Magnetic>
            </div>
          </Reveal>
        </div>
      </section>

      <CTASection />
    </>
  );
}
