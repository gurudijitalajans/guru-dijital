import { PageHero } from "@/components/layout/PageHero";
import { Scramble } from "@/components/fx/Scramble";
import { ShimmerText } from "@/components/fx/ShimmerText";
import { RotatingBadge } from "@/components/fx/RotatingBadge";
import { SectionDivider } from "@/components/v2/SectionDivider";
import { Reveal } from "@/components/ui/Reveal";
import { GButton } from "@/components/ui/Button";
import { ServicePanels } from "@/components/pages/hizmetler/ServicePanels";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Hizmetler",
  description:
    "Sosyal medya yönetimi, grafik tasarım, içerik üretimi, web tasarım, dijital pazarlama ve video tasarımı: markanızı büyüten altı başlıkta entegre çözümler.",
  path: "/hizmetler",
});

export default function HizmetlerPage() {
  return (
    <>
      <PageHero
        // PageHeroV2 eyebrow'u JSX child olarak basar; Scramble elementi
        // ReactNode olarak sorunsuz render edilir (tip string beklediği için cast).
        eyebrow={(<Scramble text="Hizmetlerimiz" duration={1.1} />) as unknown as string}
        title="Markanızı bir üst seviyeye taşıyan *hizmetler*"
        sub="Altı başlıkta uçtan uca dijital çözümler."
        aside={<RotatingBadge size={120} />}
      />

      {/* Hizmet panelleri: md+ ve yeterli yükseklikte sticky yığın, mobilde dikey kartlar.
          DİKKAT: sticky çalışsın diye bu section'a overflow-hidden VERİLMEZ; dekoratif
          blob kendi kırpılan (absolute + overflow-hidden) katmanında durur. */}
      <section className="relative bg-page pb-24 pt-10 md:pb-32 md:pt-14">
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
          <div className="grain-blob left-[-12%] top-[14%] h-[24rem] w-[24rem] opacity-20" />
        </div>
        <ServicePanels />
      </section>

      <SectionDivider from="coal" to="ink" />

      {/* Kısa CTA şeridi; rozet hero'ya taşındı, sağda label-roll buton */}
      <section className="relative overflow-hidden bg-band py-16 md:py-24">
        <div
          className="grain-blob -bottom-28 -right-24 h-80 w-80 opacity-20"
          aria-hidden
        />
        <div className="container-g relative flex flex-col items-center gap-10 text-center md:flex-row md:justify-between md:gap-12 md:text-left">
          <Reveal>
            <div>
              <p className="inline-flex items-center gap-2.5 text-[13px] font-semibold uppercase tracking-[0.22em] text-fg/50">
                <span className="inline-block size-2 bg-guru" aria-hidden />
                Sıradaki Proje
              </p>
              <h2 className="mt-4 max-w-xl text-balance text-3xl font-extrabold tracking-[-0.03em] text-fg sm:text-4xl md:text-5xl">
                <ShimmerText interval={5}>
                  Aklınızdaki işi <span className="text-guru">birlikte</span>{" "}
                  büyütelim
                </ShimmerText>
              </h2>
            </div>
          </Reveal>
          <Reveal delay={0.1} className="shrink-0">
            <GButton href="/iletisim" variant="light" size="lg">
              Projenizi Konuşalım
            </GButton>
          </Reveal>
        </div>
      </section>
    </>
  );
}
