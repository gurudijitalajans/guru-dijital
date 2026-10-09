import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { webProjects } from "@/lib/data";
import { getCases, getReferences, getServices, getTestimonials } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";
import { Btn } from "@/components/site/Btn";
import { BrandTile } from "@/components/site/BrandTile";
import { ClosingCta } from "@/components/site/ClosingCta";
import { PageIntro } from "@/components/site/PageIntro";
import { SectionHead } from "@/components/site/SectionHead";
import { cardCls, cardHoverCls, sectionY } from "@/components/site/styles";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/ui/Reveal";
import { CasesBlock } from "@/components/home/CasesBlock";
import { QuotesBlock } from "@/components/home/QuotesBlock";
import { cn } from "@/lib/utils";

export const metadata: Metadata = pageMetadata({
  title: "Referanslarımız",
  description:
    "Sağlıktan turizme, perakendeden eğitime birlikte çalıştığımız markalar, seçili işlerimiz, vaka çalışmalarımız ve yayındaki web projelerimiz.",
  path: "/referanslar",
});

/**
 * Referanslar: markalar (panel: Kurumsal > Referanslar), hizmet galerilerinden
 * seçili işler, vaka çalışmaları, yayındaki web siteleri ve izinli yorumlar.
 * Arka planlar beyaz ve açık bant arasında sırayla değişir.
 */
export default async function ReferanslarPage() {
  const [references, services, cases, testimonials] = await Promise.all([
    getReferences(),
    getServices(),
    getCases(),
    getTestimonials(),
  ]);
  /* Her hizmetin ilk galeri görseli: işin hangi hizmetten geldiği kartta yazar */
  const works = services
    .map((s) => ({ service: s, image: s.gallery[0] ?? s.card }))
    .filter((w): w is { service: (typeof services)[number]; image: NonNullable<(typeof services)[number]["card"]> } => Boolean(w.image));
  const quotes = testimonials.filter((t) => t.quote);

  return (
    <>
      <PageIntro
        eyebrow="Referanslarımız"
        title={`${references.length} markanın dijital yol arkadaşıyız`}
        lead="Sağlıktan turizme, perakendeden eğitime farklı sektörlerden markalarla çalışıyor; stratejiden tasarıma, reklamdan yazılıma kadar birlikte büyüyoruz."
      >
        <Btn href="/iletisim" variant="primary" size="lg" arrow>
          Teklif Al
        </Btn>
        {cases.length > 0 && (
          <Btn href="#vakalar" variant="light" size="lg">
            Vaka Çalışmaları
          </Btn>
        )}
      </PageIntro>

      {/* Markalar */}
      <section className={cn("bg-soft", sectionY)}>
        <div className="container-g">
          <Reveal>
            <SectionHead center title="Birlikte Çalıştığımız Markalar" lead="Her biriyle aynı hedefe bakan tek bir ekip olarak çalışıyoruz." />
          </Reveal>
          <Reveal className="mt-10" delay={0.05}>
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-5" aria-label="Referans markalar">
              {references.map((r, i) => (
                <BrandTile key={r.name} brand={r} index={i} />
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* Seçili işler */}
      {works.length > 0 && (
        <section className={sectionY}>
          <div className="container-g">
            <Reveal>
              <SectionHead title="Seçili İşler" lead="Markalarımız için hazırladığımız tasarım, web ve reklam işlerinden örnekler." />
            </Reveal>
            <StaggerGroup className="mt-10 grid gap-4 sm:grid-cols-2 md:gap-5 lg:grid-cols-3">
              {works.map(({ service, image }) => (
                <StaggerItem key={service.slug} className="h-full">
                  <Link href={`/hizmetler/${service.slug}`} className={cn(cardCls, cardHoverCls, "group flex h-full flex-col overflow-hidden")}>
                    <div className="relative aspect-[4/3] overflow-hidden bg-soft">
                      <Image
                        src={image.src}
                        alt={image.alt}
                        fill
                        sizes="(min-width: 1024px) 390px, (min-width: 640px) 50vw, 100vw"
                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                        style={{ objectPosition: image.position ?? "50% 50%" }}
                      />
                    </div>
                    <div className="flex items-center justify-between gap-3 p-5">
                      <span className="text-[16px] font-medium text-heading">{service.title}</span>
                      <ArrowUpRight aria-hidden className="size-4 shrink-0 text-muted transition-colors group-hover:text-brand" strokeWidth={2} />
                    </div>
                  </Link>
                </StaggerItem>
              ))}
            </StaggerGroup>
          </div>
        </section>
      )}

      {/* Vaka çalışmaları */}
      {cases.length > 0 && (
        <div id="vakalar" className="scroll-mt-24">
          <CasesBlock title="Vaka Çalışmaları" lead="Ölçülebilir hedeflerle başlayıp sonuçlarını rakamlarla paylaştığımız projeler." cases={cases} />
        </div>
      )}

      {/* Yayındaki web siteleri */}
      {webProjects.length > 0 && (
        <section className={sectionY}>
          <div className="container-g">
            <Reveal>
              <SectionHead title="Yayındaki Web Sitelerimiz" lead="Tasarlayıp geliştirdiğimiz ve bugün yayında olan sitelerden bazıları." />
            </Reveal>
            <StaggerGroup className="mt-10 grid gap-3 sm:grid-cols-2 md:gap-4 lg:grid-cols-3">
              {webProjects.map((w) => (
                <StaggerItem key={w.url} className="h-full">
                  <a
                    href={`https://${w.url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(cardCls, cardHoverCls, "group flex h-full items-center gap-4 p-5")}
                  >
                    <span aria-hidden className="grid size-12 shrink-0 place-items-center rounded-2xl bg-chip text-[18px] font-semibold text-brand">
                      {w.name.charAt(0)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[16px] font-medium text-heading">{w.name}</span>
                      <span className="block truncate text-[14px] text-muted">{w.url}</span>
                    </span>
                    <ArrowUpRight aria-hidden className="size-4 shrink-0 text-muted transition-colors group-hover:text-brand" strokeWidth={2} />
                    <span className="sr-only">(yeni sekmede açılır)</span>
                  </a>
                </StaggerItem>
              ))}
            </StaggerGroup>
          </div>
        </section>
      )}

      {/* Yorumlar: yalnız yayın izni olan ve metni girilmiş olanlar */}
      {quotes.length > 0 && <QuotesBlock title="Markalar Ne Diyor" lead="Birlikte çalıştığımız markaların deneyimleri." items={quotes} />}

      <ClosingCta title="Markanızı Bu Listeye Ekleyelim" lead="Hedeflerinizi dinleyelim; size uygun planı birlikte çıkaralım. İlk görüşme ücretsiz." />
    </>
  );
}
