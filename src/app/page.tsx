import { existsSync } from "node:fs";
import { join } from "node:path";
import { homeFaq, site } from "@/lib/data";
import { pageMetadata } from "@/lib/seo";
import { Hero } from "@/components/home/Hero";
import { LogoWall } from "@/components/home/LogoWall";
import { ServicesGrid } from "@/components/home/ServicesGrid";
import { ProductsGrid } from "@/components/home/ProductsGrid";
import { VideoBlock } from "@/components/home/VideoBlock";
import { CasesBlock } from "@/components/home/CasesBlock";
import { TeamBlock } from "@/components/home/TeamBlock";
import { QuotesBlock } from "@/components/home/QuotesBlock";
import { MeetCta } from "@/components/home/MeetCta";
import { SectionHead } from "@/components/site/SectionHead";
import { FaqGrid } from "@/components/site/FaqGrid";
import { sectionY } from "@/components/site/styles";

/* Ana sayfa metadata: canonical "/"; başlık mutlak (kök şablon eki yok). */
export const metadata = pageMetadata({
  title: `${site.name} | ${site.tagline}`,
  absoluteTitle: true,
  description: site.description,
  path: "/",
});

const faqLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: homeFaq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
};

export default function Home() {
  /* Tanıtım videosu public/video altında varsa oynatıcı açılır (statik sayfada derleme anında bakılır). */
  const hasVideo = existsSync(join(process.cwd(), "public/video/guru-tanitim.mp4"));
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd).replace(/</g, "\\u003c") }} />
      <Hero />
      <LogoWall />
      <ServicesGrid />
      <ProductsGrid />
      <VideoBlock hasVideo={hasVideo} />
      <CasesBlock />
      <TeamBlock />
      <QuotesBlock />
      <section className={sectionY}>
        <div className="container-g">
          <SectionHead center title="Sık Sorulan Sorular" />
          <FaqGrid items={homeFaq} className="mt-10" />
        </div>
      </section>
      <div className="bg-soft">
        <MeetCta />
      </div>
    </>
  );
}
