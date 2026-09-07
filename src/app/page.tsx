import { HeroV2 } from "@/components/v2/HeroV2";
import { VelocityMarquee } from "@/components/fx/VelocityMarquee";
import { ServicesIndex } from "@/components/v2/ServicesIndex";
import { ProductsStrip } from "@/components/v2/ProductsStrip";
import { CaseStack } from "@/components/v2/CaseStack";
import { Showreel } from "@/components/v2/Showreel";
import { ProcessRail } from "@/components/v2/ProcessRail";
import { WorkShowcase } from "@/components/v2/WorkShowcase";
import { ReferencesWall } from "@/components/v2/ReferencesWall";
import { CTAV2 } from "@/components/v2/CTAV2";
import { SectionDivider } from "@/components/v2/SectionDivider";
import { ManifestoBand } from "@/components/v2/ManifestoBand";
import { services, site } from "@/lib/data";
import { pageMetadata } from "@/lib/seo";

/* Ana sayfa metadata: canonical "/" + OG/Twitter url'i kök layout'tan değil,
   sayfa yolundan türer. Başlık mutlak (kök şablon "| Guru Dijital Ajans" eklemez). */
export const metadata = pageMetadata({
  title: `${site.name} | ${site.tagline}`,
  absoluteTitle: true,
  description: site.description,
  path: "/",
});

const DIVIDER_GAP = "-mt-6 -mb-6 md:mt-0 md:-mb-px";

export default function Home() {
  return (
    <>
      <HeroV2 />

      {/* scroll hızına tepkili hizmet marquee'si */}
      <div className="border-y border-fg/10 bg-band py-5" aria-hidden>
        <VelocityMarquee baseVelocity={0.7}>
          {services.map((s) => (
            <span
              key={s.slug}
              className="mx-6 inline-flex items-center gap-6 text-sm font-semibold uppercase tracking-[0.18em] text-fg/70"
            >
              {s.title}
              <span className="text-guru">✦</span>
            </span>
          ))}
        </VelocityMarquee>
      </div>

      <ManifestoBand />
      <ServicesIndex />
      <ProductsStrip />
      <CaseStack />
      {/* Mobilde divider komşu bölümlerin dolgusuna 24px biner (boşluk birikmesin);
          md+'da bileşenin kendi -mb-px örtüşmesi korunur. */}
      <SectionDivider from="coal" to="ink" className={DIVIDER_GAP} />
      <Showreel />
      <SectionDivider from="ink" to="ink" flip className={DIVIDER_GAP} />
      <ProcessRail />
      <WorkShowcase />
      <SectionDivider from="ink" to="coal" className={DIVIDER_GAP} />
      <ReferencesWall />
      <CTAV2 />
    </>
  );
}
