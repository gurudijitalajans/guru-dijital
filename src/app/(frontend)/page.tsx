import { existsSync } from "node:fs";
import { join } from "node:path";
import type { Metadata } from "next";
import { getCases, getHome, getReferences, getTeam, getTestimonials } from "@/lib/content";
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
import { cn } from "@/lib/utils";

/* Ana sayfa metadata panelden (Ana Sayfa > SEO); canonical "/", başlık mutlak. */
export async function generateMetadata(): Promise<Metadata> {
  const { seo } = await getHome();
  return pageMetadata({ title: seo.title, absoluteTitle: true, description: seo.description, path: "/" });
}

/**
 * Ana sayfa: bölüm metinleri ve görünürlüğü panelin "Ana Sayfa" kaydından,
 * kartlar ilgili koleksiyonlardan (Hizmetler, Ürünler, Ekip, Referanslar,
 * Vaka Çalışmaları, Müşteri Yorumları).
 */
export default async function Home() {
  const [home, references, team, cases, testimonials] = await Promise.all([
    getHome(),
    getReferences(),
    getTeam(),
    getCases(),
    getTestimonials(),
  ]);
  const homeCases = cases.filter((c) => c.showOnHome);
  const quotes = testimonials.filter((t) => t.quote);
  /* Tanıtım videosu public/video altında varsa oynatıcı açılır (statik sayfada derleme anında bakılır). */
  const hasVideo = existsSync(join(process.cwd(), "public/video/guru-tanitim.mp4"));
  const faqItems = home.faq.show ? home.faq.items : [];
  /* Aynı zeminli iki bölüm üst üste gelince aradaki boşluk iki kat olmasın: alttakinin üst boşluğu kalkar */
  const showRefs = home.references.show && references.length > 0;
  const showQuotes = home.quotes.show && quotes.length > 0;
  const showTeam = home.team.show && team.some((m) => m.showOnHome);
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };

  return (
    <>
      {faqItems.length > 0 && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd).replace(/</g, "\\u003c") }} />
      )}
      <Hero hero={home.hero} referenceCount={references.length} />
      {showRefs && <LogoWall title={home.references.title} lead={home.references.lead} references={references} />}
      {home.services.show && (
        <ServicesGrid title={home.services.title} lead={home.services.lead} className={cn(showRefs && "pt-0 md:pt-0")} />
      )}
      {home.products.show && <ProductsGrid title={home.products.title} lead={home.products.lead} />}
      {home.video.show && <VideoBlock hasVideo={hasVideo} title={home.video.title} lead={home.video.lead} />}
      {home.cases.show && homeCases.length > 0 && (
        <CasesBlock title={home.cases.title} lead={home.cases.lead} cases={homeCases} />
      )}
      {home.team.show && (
        <TeamBlock title={home.team.title} lead={home.team.lead} members={team} limit={home.team.limit} />
      )}
      {/* Yalnız metni girilmiş (yayın izni olan) yorumlar; hiç yoksa bölüm görünmez */}
      {showQuotes && <QuotesBlock title={home.quotes.title} lead={home.quotes.lead} items={quotes} />}
      {faqItems.length > 0 && (
        <section className={cn(sectionY, showTeam && !showQuotes && "pt-0 md:pt-0")}>
          <div className="container-g">
            <SectionHead center title={home.faq.title} />
            <FaqGrid items={faqItems} className="mt-10" />
          </div>
        </section>
      )}
      <div className="bg-soft">
        <MeetCta
          title={home.meet.title}
          text={home.meet.text}
          buttonLabel={home.meet.buttonLabel}
          buttonHref={home.meet.buttonHref}
        />
      </div>
    </>
  );
}
