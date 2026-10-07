import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, ArrowUpRight, LayoutGrid } from "lucide-react";
import { site, webProjects } from "@/lib/data";
import { getAbout, getCases, getService, getServices } from "@/lib/content";
import { iconFor } from "@/lib/icons";
import { cn, countWord, formatStat } from "@/lib/utils";
import { pageMetadata } from "@/lib/seo";
import { Btn } from "@/components/site/Btn";
import { FaqGrid } from "@/components/site/FaqGrid";
import { PageIntro } from "@/components/site/PageIntro";
import { SectionHead } from "@/components/site/SectionHead";
import {
  cardCls,
  cardHoverCls,
  cardTextCls,
  cardTitleCls,
  iconBoxCls,
  pillCls,
  sectionY,
} from "@/components/site/styles";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/ui/Reveal";
import { ServiceGallery } from "@/components/pages/hizmetler/ServiceGallery";
import { ClosingCta } from "@/components/site/ClosingCta";

type Params = Promise<{ slug: string }>;

const pad = (n: number) => String(n).padStart(2, "0");

export async function generateStaticParams() {
  return (await getServices()).map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const service = await getService(slug);
  if (!service) return {};
  return pageMetadata({
    title: service.title,
    description: service.seoDescription ?? service.short,
    path: `/hizmetler/${service.slug}`,
  });
}

export default async function HizmetDetayPage({ params }: { params: Params }) {
  const { slug } = await params;
  const services = await getServices();
  const service = services.find((s) => s.slug === slug);
  if (!service) notFound();

  const { gallery, faq } = service;
  /* Vaka ve ödüller panelden (Kurumsal > Vaka Çalışmaları, İçerik > Hakkımızda > Ödüller) */
  const [caseStudies, about] = service.sections.cases ? await Promise.all([getCases(), getAbout()]) : [[], null];
  const awards = about?.awards.items ?? [];
  const others = services.filter((s) => s.slug !== service.slug);
  const contactHref = `/iletisim?hizmet=${service.slug}`;
  /* Vaka bölümü olan sayfalarda SSS beyaz bölümün devamıdır: üst boşluk tekrarlanmaz */
  const hasCase = service.sections.cases || service.sections.webProjects;

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Service",
      name: service.title,
      serviceType: service.title,
      description: service.seoDescription ?? service.short,
      url: `${site.url}/hizmetler/${service.slug}`,
      areaServed: { "@type": "Country", name: "Türkiye" },
      inLanguage: "tr",
      provider: { "@type": "Organization", name: site.name, url: site.url },
    },
    ...(faq.length > 0
      ? [
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faq.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          },
        ]
      : []),
  ];

  return (
    <>
      <script
        type="application/ld+json"
        // "<" kaçışı: JSON içinde olası "</script>" dizisinin etiketi kapatmasını önler.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />

      {/* 1. Giriş: ortalanmış başlık, kısa açıklama, iki buton, altında galeri */}
      <PageIntro
        eyebrow="Hizmetlerimiz"
        title={service.title}
        lead={service.short}
        visual={gallery.length > 0 ? <ServiceGallery images={gallery} /> : undefined}
      >
        <Btn href={contactHref} size="lg" arrow>
          Teklif Al
        </Btn>
        <Btn href="/iletisim#toplanti" variant="light" size="lg">
          Toplantı Planla
        </Btn>
      </PageIntro>

      {/* 2. Kapsam: solda tanıtım, sağda numaralı kartlar */}
      <section id="kapsam" className={cn(sectionY, "scroll-mt-28 bg-soft")}>
        <div className="container-g grid gap-10 lg:grid-cols-12 lg:gap-12">
          <Reveal className="lg:col-span-5">
            <p className="mb-4 inline-flex items-center gap-2 text-[13px] font-medium text-brand">
              <span className="size-1.5 rounded-full bg-brand" aria-hidden />
              Kapsam
            </p>
            <SectionHead title={service.offeringsTitle} lead={service.headline} />
            <div className="mt-6 space-y-4 text-[15.5px] leading-relaxed text-body">
              {service.intro.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
            {service.keywords.length > 0 && (
              <ul className="mt-7 flex flex-wrap gap-2" aria-label="Öne çıkan başlıklar">
                {service.keywords.map((k) => (
                  <li key={k} className={pillCls}>
                    {k}
                  </li>
                ))}
              </ul>
            )}
          </Reveal>
          <StaggerGroup className="grid content-start gap-3 lg:col-span-7">
            {service.offerings.map((offering, i) => (
              <StaggerItem key={offering}>
                <div className={cn(cardCls, "flex items-center gap-4 p-4 sm:gap-5 sm:p-5")}>
                  <span
                    className="grid size-11 shrink-0 place-items-center rounded-xl bg-chip text-[15px] font-medium tabular-nums text-brand"
                    aria-hidden
                  >
                    {pad(i + 1)}
                  </span>
                  <p className="text-[16px] font-medium leading-snug tracking-[-0.01em] text-heading sm:text-[17px]">
                    {offering}
                  </p>
                </div>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </section>

      {/* 3a. Dijital pazarlama: ölçülmüş vaka sonuçları ve ödüller */}
      {service.sections.cases && (
        <section className={sectionY}>
          <div className="container-g">
            <SectionHead
              title="Ölçülen Sonuçlar"
              lead="Yönetimini devraldığımız hesaplarda ölçtüğümüz sonuçlar."
            />
            <StaggerGroup className="mt-10 grid gap-4 md:gap-5 lg:grid-cols-2">
              {caseStudies.map((cs) => (
                <StaggerItem key={cs.id} className="h-full">
                  <article className={cn(cardCls, "flex h-full flex-col p-6 md:p-8")}>
                    <span className="inline-flex w-fit items-center rounded-full bg-chip px-3 py-1 text-[13px] font-medium text-heading">
                      {cs.sector}
                    </span>
                    <h3 className="mt-5 text-[22px] font-medium leading-snug tracking-[-0.02em] text-heading md:text-[24px]">
                      {cs.title}
                    </h3>
                    <p className={cn(cardTextCls, "mt-3")}>{cs.summary}</p>
                    <dl className="mt-auto grid grid-cols-1 gap-2 pt-7 min-[420px]:grid-cols-3 min-[420px]:gap-3">
                      {cs.featured.map((stat) => (
                          <div
                            key={stat.label}
                            className="flex items-center justify-between gap-4 rounded-xl bg-soft px-4 py-3 min-[420px]:block min-[420px]:p-4"
                          >
                            <dt className="text-[13px] leading-snug text-muted">{stat.label}</dt>
                            <dd className="shrink-0 text-[22px] font-medium tabular-nums leading-none tracking-[-0.02em] text-brand min-[420px]:mt-1.5 min-[420px]:text-[26px]">
                              {formatStat(stat)}
                            </dd>
                          </div>
                      ))}
                    </dl>
                    <p className="mt-4 text-[13px] text-muted">{cs.note}</p>
                  </article>
                </StaggerItem>
              ))}
            </StaggerGroup>
            <StaggerGroup className="mt-4 grid gap-4 md:mt-5 md:grid-cols-2 md:gap-5">
              {awards.map((a) => {
                const AwardIcon = iconFor(a.icon);
                return (
                <StaggerItem key={a.title} className="h-full">
                  <article className={cn(cardCls, "flex h-full items-start gap-4 p-6")}>
                    <span className={cn(iconBoxCls, "shrink-0")} aria-hidden>
                      <AwardIcon className="size-5" strokeWidth={1.8} />
                    </span>
                    <div>
                      <h3 className={cardTitleCls}>
                        {a.title} <span className="font-normal text-muted">{a.year}</span>
                      </h3>
                      <p className={cn(cardTextCls, "mt-1.5")}>{a.desc}</p>
                    </div>
                  </article>
                </StaggerItem>
                );
              })}
            </StaggerGroup>
          </div>
        </section>
      )}

      {/* 3b. Web tasarım: yayındaki siteler */}
      {service.sections.webProjects && (
        <section className={sectionY}>
          <div className="container-g">
            <SectionHead
              title="Yayındaki İşlerimiz"
              lead="Tasarlayıp yayına aldığımız sitelerden bazıları; her biri canlı olarak incelenebilir."
            />
            <StaggerGroup className="mt-10 grid gap-3 sm:grid-cols-2 md:gap-4 lg:grid-cols-3">
              {webProjects.map((p) => (
                <StaggerItem key={p.url}>
                  <a
                    href={`https://${p.url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(cardCls, cardHoverCls, "group flex min-h-[72px] items-center justify-between gap-4 p-5")}
                  >
                    <span className="min-w-0">
                      <span className="block text-[16px] font-medium text-heading">{p.name}</span>
                      <span className="mt-0.5 block truncate text-[13.5px] text-muted">{p.url}</span>
                    </span>
                    <span
                      className="grid size-10 shrink-0 place-items-center rounded-full bg-chip text-heading transition-colors duration-300 group-hover:bg-brand group-hover:text-white"
                      aria-hidden
                    >
                      <ArrowUpRight className="size-4" strokeWidth={2} />
                    </span>
                    <span className="sr-only">(yeni sekmede açılır)</span>
                  </a>
                </StaggerItem>
              ))}
            </StaggerGroup>
          </div>
        </section>
      )}

      {/* 4. Hizmete özel SSS */}
      {faq.length > 0 && (
        <section className={cn(sectionY, hasCase && "pt-0 md:pt-0")}>
          <div className="container-g">
            <SectionHead
              center
              title="Sık Sorulan Sorular"
              lead={`${service.title} hakkında en çok merak edilenler. Aklınızdaki başka sorular için bize yazabilirsiniz.`}
            />
            <Reveal className="mt-10">
              <FaqGrid items={faq} />
            </Reveal>
          </div>
        </section>
      )}

      {/* 5. Diğer hizmetler */}
      <section className={cn(sectionY, "bg-soft")}>
        <div className="container-g">
          <SectionHead title="Diğer Hizmetlerimiz" lead="Hizmetlerimiz birbirini tamamlar; ihtiyacınıza göre birlikte ya da ayrı ayrı planlanabilir." />
          <StaggerGroup className="mt-10 grid gap-3 sm:grid-cols-2 md:gap-4 lg:grid-cols-3">
            {others.map((s) => {
              const Icon = iconFor(s.icon);
              return (
                <StaggerItem key={s.slug} className="h-full">
                  <Link
                    href={`/hizmetler/${s.slug}`}
                    className={cn(cardCls, cardHoverCls, "group flex h-full items-center gap-4 p-5")}
                  >
                    <span className={cn(iconBoxCls, "shrink-0")} aria-hidden>
                      <Icon className="size-5" strokeWidth={1.8} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[16px] font-medium leading-snug text-heading">{s.title}</span>
                      <span className="mt-0.5 block text-[13.5px] leading-snug text-muted">{s.headline}</span>
                    </span>
                    <ArrowRight
                      aria-hidden
                      className="size-4 shrink-0 text-heading transition-transform duration-300 group-hover:translate-x-0.5 group-hover:text-brand"
                    />
                  </Link>
                </StaggerItem>
              );
            })}
            <StaggerItem className="h-full">
              <Link
                href="/hizmetler"
                className={cn(cardCls, cardHoverCls, "group flex h-full items-center gap-4 p-5")}
              >
                <span className={cn(iconBoxCls, "shrink-0 bg-navy text-white")} aria-hidden>
                  <LayoutGrid className="size-5" strokeWidth={1.8} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[16px] font-medium leading-snug text-heading">Tüm hizmetler</span>
                  <span className="mt-0.5 block text-[13.5px] leading-snug text-muted">{`${countWord(services.length).replace(/^./, (c) => c.toLocaleUpperCase("tr-TR"))} hizmeti bir arada inceleyin`}</span>
                </span>
                <ArrowRight
                  aria-hidden
                  className="size-4 shrink-0 text-heading transition-transform duration-300 group-hover:translate-x-0.5 group-hover:text-brand"
                />
              </Link>
            </StaggerItem>
          </StaggerGroup>
        </div>
      </section>

      {/* 6. Kapanış çağrısı */}
      <ClosingCta
        title="Tanışalım"
        lead={`${service.title} için hedeflerinizi dinleyelim; size uygun kapsamı ve planı birlikte belirleyelim.`}
        primary={{ href: contactHref, label: "Teklif Al" }}
      />
    </>
  );
}
