import Image from "next/image";
import { LightboxRoot } from "@/components/ui/Lightbox";
import { zoomCls, zoomProps } from "@/components/ui/zoom";
import { existsSync } from "fs";
import { serviceAsset } from "@/lib/service-assets";
import { join } from "path";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, ArrowUpRight, Check } from "lucide-react";
import { site, webProjects } from "@/lib/data";
import { getAbout, getCases, getService, getServices } from "@/lib/content";
import { CaseCard } from "@/components/home/CasesBlock";
import { cn, countWord, sentenceStart, shortServiceTitle } from "@/lib/utils";
import { pageMetadata } from "@/lib/seo";
import { Btn } from "@/components/site/Btn";
import { FaqGrid } from "@/components/site/FaqGrid";
import { GlyphChip, ServiceIcon } from "@/components/site/Glyph";
import { PageIntro } from "@/components/site/PageIntro";
import { SectionHead } from "@/components/site/SectionHead";
import {
  cardCls,
  cardHoverCls,
  cardTextCls,
  cardTitleCls,
  sectionY,
} from "@/components/site/styles";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/ui/Reveal";
import { ServiceGallery, type GalleryVideo } from "@/components/pages/hizmetler/ServiceGallery";
import { VideoPlayer } from "@/components/site/VideoPlayer";
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
    ...(serviceAsset(service.slug, "og.jpg")
      ? { image: { url: serviceAsset(service.slug, "og.jpg") as string, width: 1200, height: 630, alt: service.title } }
      : {}),
  });
}

/* "Örneklerle …" bölümünün açıklaması: müşteri işi olmayan galerilerde neyin gösterildiği açıkça yazılır */
const WORK_LEADS: Record<string, string> = {
  "ozel-yazilim": "Kendi geliştirdiğimiz Guru Panel'den ekranlar; ekranlarda örnek veri kullanılmıştır.",
  "mobil-uygulama": "Guru Panel'in telefona kurulabilen sürümü ve temsili uygulama ekranları.",
  "marka-tescil": "Başvurudan tescile sürecin adımları ve bilmeniz gerekenler.",
};

export default async function HizmetDetayPage({ params }: { params: Params }) {
  const { slug } = await params;
  const services = await getServices();
  const service = services.find((s) => s.slug === slug);
  if (!service) notFound();

  const { gallery: allImages, faq } = service;
  /* Girişte ana kare + dikey kapak; öne çıkan ekranlar kendi bölümünde */
  const gallery = allImages.slice(0, allImages[1] && allImages[1].h > allImages[1].w ? 2 : 3);
  const features = allImages.slice(gallery.length);
  /* Hizmet turu videosu (1 dk, sesli): public/video/services/v3/<slug>.mp4 */
  const tourSrc = `/video/services/v3/${service.slug}.mp4`;
  const tour = existsSync(join(process.cwd(), "public", tourSrc))
    ? { src: tourSrc, poster: `/video/services/v3/${service.slug}.jpg`, label: `${service.title} tanıtım filmini oynat`, trackName: `hizmet-${service.slug}` }
    : null;
  const video: GalleryVideo | undefined = undefined;
  /* Vaka ve ödüller panelden (Kurumsal > Vaka Çalışmaları, İçerik > Hakkımızda > Ödüller) */
  /* Yalnız bu hizmetin vakaları; Google ödülleri reklam hizmetinde */
  const [allCases, about] = await Promise.all([getCases(), service.slug === "dijital-reklam-yonetimi" ? getAbout() : Promise.resolve(null)]);
  const caseStudies = allCases.filter((c) => c.service?.slug === service.slug);
  const awards = about?.awards.items ?? [];
  const showCases = caseStudies.length > 0;
  const others = services.filter((s) => s.slug !== service.slug);
  const contactHref = `/iletisim?hizmet=${service.slug}`;
  /* Vaka bölümü olan sayfalarda SSS beyaz bölümün devamıdır: üst boşluk tekrarlanmaz */
  const hasCase = showCases || service.sections.webProjects;

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
    <LightboxRoot>
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
        visual={gallery.length > 0 || video ? <ServiceGallery images={gallery} video={video} /> : undefined}
      >
        <Btn href={contactHref} size="lg" arrow>
          Teklif Al
        </Btn>
        <Btn href="/iletisim#toplanti" variant="light" size="lg">
          Toplantı Planla
        </Btn>
      </PageIntro>

      {/* 2. Kapsam: lacivert panel; üstte başlık ve tanıtım, altta numaralı iş kalemleri ızgarası */}
      <section id="kapsam" className={cn(sectionY, "scroll-mt-28 pt-2 md:pt-4")}>
        <div className="container-g">
          <div className="relative isolate overflow-hidden rounded-[28px] bg-navy px-5 py-10 sm:px-8 md:px-12 md:py-14">
            <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(55%_45%_at_100%_0%,rgb(51_131_226/0.5),transparent_72%),radial-gradient(45%_40%_at_0%_100%,rgb(132_206_252/0.16),transparent_72%)]" />
            <div className="grid gap-8 lg:grid-cols-12 lg:gap-12">
              <Reveal className="lg:col-span-5">
                <p className="inline-flex items-center gap-2 text-[13px] font-medium text-white/70">
                  <span className="size-1.5 rounded-full bg-[#6ea8ff]" aria-hidden />
                  Kapsam
                </p>
                <h2 className="mt-4 text-balance text-[30px] font-normal leading-[1.12] tracking-[-0.03em] text-white md:text-[40px]">
                  {service.offeringsTitle}
                </h2>
                <p className="mt-3 text-pretty text-[16px] leading-relaxed text-white/70 md:text-[17px]">{service.headline}</p>
              </Reveal>
              <Reveal className="lg:col-span-7 lg:pt-9" delay={0.06}>
                <div className="space-y-4 text-pretty text-[15.5px] leading-relaxed text-white/80">
                  {service.intro.map((p) => (
                    <p key={p}>{p}</p>
                  ))}
                </div>
                {service.keywords.length > 0 && (
                  <ul className="mt-6 flex flex-wrap gap-2" aria-label="Öne çıkan başlıklar">
                    {service.keywords.map((k) => (
                      <li key={k} className="inline-flex min-h-9 items-center rounded-full bg-white/[0.08] px-3.5 text-[13.5px] font-medium text-white shadow-[inset_0_0_0_1px_rgb(255_255_255/0.14)]">
                        {k}
                      </li>
                    ))}
                  </ul>
                )}
              </Reveal>
            </div>
            {/* 7 kalemde ilk kart iki sütun kaplar: ızgara 4 sütunda iki tam satır olur; 6 kalemde 3x2 */}
            <StaggerGroup
              className={cn(
                "mt-10 grid gap-3 sm:grid-cols-2 md:mt-12 md:gap-4",
                service.offerings.length % 3 === 0 ? "lg:grid-cols-3" : "lg:grid-cols-4"
              )}
            >
              {service.offerings.map((offering, i) => {
                const lead = i === 0 && service.offerings.length % 2 === 1;
                return (
                  <StaggerItem key={offering} className={cn("h-full", lead && "sm:col-span-2")}>
                    <div
                      className={cn(
                        "flex h-full flex-col justify-between gap-5 rounded-[20px] p-5 md:gap-8 md:p-6",
                        lead
                          ? "bg-[linear-gradient(135deg,#1d5bd8,#0b3a9e)] shadow-[0_24px_48px_-28px_rgb(29_91_216/0.9)]"
                          : "bg-white/[0.05] shadow-[inset_0_0_0_1px_rgb(255_255_255/0.1)]"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className={cn("text-[14px] font-medium tabular-nums", lead ? "text-white/80" : "text-[#8db8ff]")}>
                          {pad(i + 1)}
                        </span>
                        <span className={cn("grid size-8 place-items-center rounded-full", lead ? "bg-white/15" : "bg-white/[0.07]")} aria-hidden>
                          <Check className="size-4 text-white" strokeWidth={2.4} />
                        </span>
                      </div>
                      <p
                        className={cn(
                          "text-pretty font-medium leading-snug tracking-[-0.01em] text-white",
                          lead ? "text-[19px] md:text-[22px]" : "text-[16px] md:text-[17px]"
                        )}
                      >
                        {offering}
                      </p>
                    </div>
                  </StaggerItem>
                );
              })}
            </StaggerGroup>
          </div>
        </div>
      </section>

      {/* 2b. Hizmet turu videosu ve öne çıkan ekranlar */}
      {(tour || features.length > 0) && (
        <section className={cn(sectionY, "pt-0 md:pt-0")}>
          <div className="container-g">
            <SectionHead title={`Örneklerle ${shortServiceTitle(service.title)}`} lead={WORK_LEADS[service.slug] ?? "Markalarımız için hazırladığımız işlerden örnekler."} />
            {tour ? (
              <div className="mt-10">
                <VideoPlayer src={tour.src} poster={tour.poster} label={tour.label} trackName={tour.trackName} />
              </div>
            ) : null}
            {features.length > 0 ? (
              <div className="fill-odd-sm mt-5 grid gap-4 sm:grid-cols-2 md:gap-5 lg:grid-cols-3">
                {features.map((img) => (
                  <div key={img.src} {...zoomProps(img)} className={cn(zoomCls, "relative overflow-hidden rounded-2xl bg-white md:rounded-[20px]")} style={{ aspectRatio: `${img.w} / ${img.h}` }}>
                    <Image src={img.src} alt={img.alt} fill sizes="(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw" className="object-cover" />
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </section>
      )}

      {/* 3a. Bu hizmetin ölçülmüş vaka sonuçları (ve reklamda Google ödülleri) */}
      {showCases && (
        <section className={sectionY}>
          <div className="container-g">
            <SectionHead title="Ölçülen Sonuçlar" lead="Yönetimini devraldığımız projelerde ölçtüğümüz sonuçlar." />
            <StaggerGroup className="fill-odd-sm mt-10 grid gap-4 sm:grid-cols-2 md:gap-5 lg:grid-cols-3">
              {caseStudies.map((cs) => (
                <StaggerItem key={cs.id} className="h-full">
                  <CaseCard c={cs} />
                </StaggerItem>
              ))}
            </StaggerGroup>
            <StaggerGroup className="mt-4 grid gap-4 md:mt-5 md:grid-cols-2 md:gap-5">
              {awards.map((a) => {
                return (
                <StaggerItem key={a.title} className="h-full">
                  <article className={cn(cardCls, "flex h-full items-start gap-4 p-6")}>
                    <GlyphChip name={a.icon} />
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
              lead={
                <>
                  {sentenceStart(service.title)} hakkında en çok merak edilenler. Aklınızdaki başka sorular için{" "}
                  <Link href={contactHref} className="font-medium text-brand underline-offset-4 hover:underline">
                    bize yazabilirsiniz
                  </Link>
                  .
                </>
              }
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
          <StaggerGroup className="fill-odd-sm mt-10 grid auto-rows-fr gap-3 sm:grid-cols-2 md:gap-4 lg:grid-cols-3">
            {others.map((s) => {
              return (
                <StaggerItem key={s.slug} className="h-full">
                  {/* items-start: açıklaması iki satıra inen kartta da başlıklar aynı hizada */}
                  <Link
                    href={`/hizmetler/${s.slug}`}
                    className={cn(cardCls, cardHoverCls, "group flex h-full items-start gap-4 p-5")}
                  >
                    <ServiceIcon name={s.icon} />
                    <span className="min-w-0 flex-1">
                      <span className="block text-[16px] font-medium leading-snug text-heading">{s.title}</span>
                      <span className="mt-0.5 block text-[13.5px] leading-snug text-muted">{s.menuDesc}</span>
                    </span>
                    <ArrowRight
                      aria-hidden
                      className="size-4 shrink-0 self-center text-heading transition-transform duration-300 group-hover:translate-x-0.5 group-hover:text-brand"
                    />
                  </Link>
                </StaggerItem>
              );
            })}
            <StaggerItem className="h-full">
              <Link
                href="/hizmetler"
                className={cn(cardCls, cardHoverCls, "group flex h-full items-start gap-4 p-5")}
              >
                <ServiceIcon name="layout-grid" />
                <span className="min-w-0 flex-1">
                  <span className="block text-[16px] font-medium leading-snug text-heading">Tüm Hizmetler</span>
                  <span className="mt-0.5 block text-[13.5px] leading-snug text-muted">{`${countWord(services.length).replace(/^./, (c) => c.toLocaleUpperCase("tr-TR"))} hizmeti bir arada inceleyin`}</span>
                </span>
                <ArrowRight
                  aria-hidden
                  className="size-4 shrink-0 self-center text-heading transition-transform duration-300 group-hover:translate-x-0.5 group-hover:text-brand"
                />
              </Link>
            </StaggerItem>
          </StaggerGroup>
        </div>
      </section>

      {/* 6. Kapanış çağrısı */}
      <ClosingCta
        title="İletişime geçin"
        lead={`${sentenceStart(service.title)} için hedeflerinizi dinleyelim; size uygun kapsamı ve planı birlikte belirleyelim.`}
        primary={{ href: contactHref, label: "Teklif Al" }}
      />
    </LightboxRoot>
  );
}
