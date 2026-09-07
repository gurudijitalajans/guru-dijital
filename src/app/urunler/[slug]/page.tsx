import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, type LucideIcon } from "lucide-react";
import { products, site } from "@/lib/data";
import { productDetails, productSlugs } from "@/lib/products-content";
import { PageHero } from "@/components/layout/PageHero";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/ui/Reveal";
import { GButton } from "@/components/ui/Button";
import { Scramble } from "@/components/fx/Scramble";
import { Spotlight } from "@/components/fx/Spotlight";
import { GlowBorder } from "@/components/fx/GlowBorder";
import { RollingCounter } from "@/components/fx/RollingCounter";
import { RotatingBadge } from "@/components/fx/RotatingBadge";
import { SectionDivider } from "@/components/v2/SectionDivider";
import { ContactForm } from "@/components/pages/ContactForm";
import { MeetingScheduler } from "@/components/pages/MeetingScheduler";
import { ProductFaq } from "@/components/pages/urunler/ProductFaq";
import { ScreenTour } from "@/components/pages/urunler/ScreenTour";
import { DemoSwitch } from "@/components/pages/urunler/DemoSwitch";

type Params = Promise<{ slug: string }>;

/** Ürünün görünen adı: liste kaydından, yoksa detay eyebrow'undan. */
function productName(slug: string) {
  return products.find((p) => p.slug === slug)?.name ?? productDetails[slug].hero.eyebrow;
}

/** Mockup alt metni tek kaynaktan (data.ts liste kaydı); yoksa ürün adı. */
function productImageAlt(slug: string) {
  return products.find((p) => p.slug === slug)?.imageAlt ?? `${productName(slug)} paneli`;
}

/* Liste kaydındaki ikonlar (önceki/sonraki kartlar). Modül seviyesinde
   kurulur: render sırasında bileşen üretilmez (react-hooks/static-components). */
const iconBySlug: Record<string, LucideIcon | undefined> = Object.fromEntries(
  products.map((p) => [p.slug, p.icon])
);

/* Demo formundaki ürün listesi: ajans hizmetleri yerine yalnız Guru ürünleri. */
const productNames = products.map((p) => p.name);

const pad = (n: number) => String(n).padStart(2, "0");

/* Ekran turunda anlatılan özellik sayısı; kalanlar kart ızgarasında listelenir. */
const TOUR_COUNT = 3;

export function generateStaticParams() {
  return productSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const product = productDetails[slug];
  if (!product) return {};
  const path = `/urunler/${product.slug}`;
  return {
    /* seo.title ürün adını zaten taşır; kök şablonun eklediği "| Guru Dijital
       Ajans" ekiyle üç parçalı başlık oluşmasın diye mutlak kullanılır. */
    title: { absolute: product.seo.title },
    description: product.seo.description,
    keywords: product.seo.keywords,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      locale: "tr_TR",
      url: path,
      siteName: site.name,
      title: product.seo.title,
      description: product.seo.description,
      /* Mockup SVG; sosyal ağ önizlemeleri SVG'yi desteklemediği için site OG görseli. */
      images: [{ url: "/og.jpg", width: 1200, height: 630, alt: productImageAlt(slug) }],
    },
  };
}

export default async function UrunDetayPage({ params }: { params: Params }) {
  const { slug } = await params;
  const index = productSlugs.indexOf(slug);
  if (index === -1) notFound();

  const product = productDetails[slug];
  const name = productName(slug);
  const imageAlt = productImageAlt(slug);
  const prevSlug = productSlugs[(index - 1 + productSlugs.length) % productSlugs.length];
  const nextSlug = productSlugs[(index + 1) % productSlugs.length];
  const PrevIcon = iconBySlug[prevSlug];
  const NextIcon = iconBySlug[nextSlug];

  /* Ekran turu yalnız serileştirilebilir veri alır (ikon bileşeni client'a geçmez). */
  const tourFeatures = product.features
    .slice(0, TOUR_COUNT)
    .map(({ title, desc }) => ({ title, desc }));
  const gridFeatures = product.features.slice(TOUR_COUNT);

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name,
      description: product.seo.description,
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      url: `${site.url}/urunler/${product.slug}`,
      image: `${site.url}${product.image}`,
      inLanguage: "tr",
      provider: {
        "@type": "Organization",
        name: site.name,
        url: site.url,
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: product.faq.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        // "<" kaçışı: JSON içinde olası "</script>" dizisinin etiketi kapatmasını önler.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />

      {/* 1. Hero */}
      <PageHero
        // PageHeroV2 eyebrow'u JSX child olarak basar; Scramble elementi
        // ReactNode olarak sorunsuz render edilir (tip string beklediği için cast).
        // lang="en": İngilizce ürün adı CSS uppercase'te noktalı İ almasın (Operation, Business).
        eyebrow={
          (
            <span lang="en">
              <Scramble text={product.hero.eyebrow} duration={1.1} />
            </span>
          ) as unknown as string
        }
        title={product.hero.headline}
        sub={product.hero.sub}
        aside={<RotatingBadge size={120} href="#demo" label={`Demo talep et: ${name}`} />}
      >
        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          <GButton href="#demo" variant="green" size="lg">
            {product.hero.ctaLabel}
          </GButton>
          <GButton href="/urunler" variant="outline" size="lg">
            Diğer Ürünler
          </GButton>
        </div>
      </PageHero>

      {/* 2. Ekran turu: masaüstünde pinned mockup + sıralı noktalar, mobilde yakın kadrajlar */}
      <ScreenTour
        name={name}
        image={product.image}
        imageAlt={imageAlt}
        features={tourFeatures}
        hotspots={product.hotspots}
      />

      {/* 3. Diğer özellikler: 3 sütun, spotlight'lı kartlar */}
      <section className="pb-14 md:pb-28">
        <div className="container-g">
          <SectionHeading
            dark
            eyebrow="Özellikler"
            title="Neler *yapar*?"
            sub="Turdaki üç özelliğe ek olarak ekibinizin zamanını geri kazandıran yetenekler."
          />
          <StaggerGroup className="mt-10 grid gap-5 sm:grid-cols-2 md:mt-14 lg:grid-cols-3">
            {gridFeatures.map((feature) => {
              const Icon = feature.icon;
              return (
                <StaggerItem key={feature.title} className="h-full">
                  <Spotlight
                    size={380}
                    opacity={0.09}
                    className="h-full overflow-hidden rounded-3xl border border-fg/10 bg-card transition-all duration-300 hover:-translate-y-1 hover:border-guru/40"
                  >
                    <article className="flex h-full flex-col p-7 md:p-8">
                      <span
                        className="grid size-12 shrink-0 place-items-center rounded-2xl bg-guru/12 text-guru-text"
                        aria-hidden
                      >
                        <Icon className="size-6" strokeWidth={1.9} />
                      </span>
                      <h3 className="mt-6 text-lg font-bold tracking-tight text-fg md:text-xl">
                        {feature.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-fg/60 md:text-[15px]">
                        {feature.desc}
                      </p>
                    </article>
                  </Spotlight>
                </StaggerItem>
              );
            })}
          </StaggerGroup>
        </div>
      </section>

      <SectionDivider from="coal" to="ink" />

      {/* 4. Nasıl çalışır: yatay adımlar, bg-band */}
      <section className="relative overflow-hidden bg-band py-14 md:py-28">
        <div className="grain-blob -bottom-24 -left-32 h-80 w-80 opacity-20" aria-hidden />
        <div className="container-g relative">
          <SectionHeading
            dark
            eyebrow="Nasıl Çalışır"
            title="Kurulumdan sonuca *adım adım*"
            sub="Kurulumu birlikte yapıyor, ekibinizi eğitiyor ve ilk haftadan itibaren yanınızda kalıyoruz."
          />
          <StaggerGroup
            className="mt-10 grid gap-x-8 gap-y-10 sm:grid-cols-2 md:mt-14 lg:grid-cols-4"
            stagger={0.1}
          >
            {product.steps.map((step, i) => (
              <StaggerItem key={step.title} className="h-full">
                <div className="relative h-full border-t border-fg/15 pt-6">
                  {/* Rayın üstünde kısa yeşil vurgu çizgisi */}
                  <span className="absolute -top-px left-0 h-px w-12 bg-guru" aria-hidden />
                  <span
                    className="headline-outline-light block text-6xl font-extrabold leading-none tracking-[-0.04em] md:text-7xl"
                    aria-hidden
                  >
                    {pad(i + 1)}
                  </span>
                  <h3 className="mt-5 text-xl font-bold tracking-tight text-fg">
                    <span className="sr-only">{pad(i + 1)}. </span>
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-fg/60 md:text-[15px]">
                    {step.desc}
                  </p>
                </div>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </section>

      <SectionDivider from="ink" to="coal" flip />

      {/* 5. Kullanım senaryoları: satır dokusu (kart üstüne kart ritmini kırar) */}
      <section className="pb-14 pt-14 md:pb-28 md:pt-16">
        <div className="container-g">
          <SectionHeading
            dark
            eyebrow="Kullanım Senaryoları"
            title="Kimler için *uygun*?"
            sub="Farklı sektörlerde, farklı ekip büyüklüklerinde aynı netlikte çalışır."
          />
          <StaggerGroup className="mt-10 md:mt-14">
            {product.useCases.map((useCase, i) => (
              <StaggerItem key={useCase.title} className="border-t border-fg/10 last:border-b">
                <article className="grid gap-2 py-6 md:grid-cols-[7rem_1fr_1.35fr] md:gap-8 md:py-8">
                  <span className="text-xs font-semibold uppercase tracking-[0.16em] text-guru-text">
                    Senaryo {pad(i + 1)}
                  </span>
                  <h3 className="text-xl font-bold tracking-tight text-fg md:text-2xl">
                    {useCase.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-fg/60 md:max-w-xl md:text-[15px]">
                    {useCase.desc}
                  </p>
                </article>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </section>

      {/* 6. Sayısal faydalar: bg-band şeridi, odometre sayaçlar (yalnız ürün/özellik ifadeleri) */}
      <section className="relative overflow-hidden border-y border-fg/10 bg-band py-14 md:py-20">
        <div className="grain-blob -right-32 -top-24 h-80 w-80 opacity-25" aria-hidden />
        <div className="container-g relative">
          <Reveal y={16}>
            <p className="mb-10 inline-flex items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.18em] text-fg/60">
              <span className="inline-block size-2 bg-guru" aria-hidden />
              Sayılarla <span lang="en">{name}</span>
            </p>
          </Reveal>
          <StaggerGroup className="grid grid-cols-2 gap-x-8 gap-y-10 lg:grid-cols-4">
            {product.stats.map((stat) => (
              <StaggerItem key={stat.label}>
                <div className="border-l-2 border-guru pl-4 sm:pl-5">
                  <p className="text-3xl font-bold tracking-tight text-guru-text sm:text-4xl md:text-5xl">
                    <RollingCounter value={stat.value} suffix={stat.suffix} />
                  </p>
                  <p className="mt-2 text-sm leading-snug text-fg/60">{stat.label}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </section>

      {/* 7. Entegrasyonlar: pill listesi */}
      <section className="py-14 md:py-28">
        <div className="container-g grid items-start gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <SectionHeading
            dark
            eyebrow="Entegrasyonlar"
            title="Kullandığınız araçlarla *uyumlu*"
            sub="Mevcut kanallarınızı ve araçlarınızı değiştirmeden bağlanır; veri tek yerde toplanır."
          />
          <Reveal delay={0.1}>
            <ul className="flex flex-wrap gap-2.5 lg:pt-2">
              {product.integrations.map((integration) => (
                <li
                  key={integration}
                  className="inline-flex min-h-11 items-center gap-2.5 rounded-full border border-fg/15 bg-card px-4 text-sm font-medium text-fg/75 transition-colors duration-300 hover:border-guru/50 hover:text-fg"
                >
                  <span
                    className="size-1.5 rounded-full bg-guru shadow-[0_0_8px_rgb(16_216_108/0.6)]"
                    aria-hidden
                  />
                  {integration}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* 8. SSS */}
      <section className="border-t border-fg/10 py-14 md:py-28">
        <div className="container-g">
          <SectionHeading
            center
            dark
            eyebrow="Sık Sorulanlar"
            title="Aklınıza takılan *sorular*"
            sub="Kısa yanıtlar; detayları demo görüşmesinde birlikte netleştiririz."
          />
          <div className="mt-10 md:mt-16">
            <Reveal>
              <ProductFaq items={product.faq} idPrefix={`${product.slug}-faq`} />
            </Reveal>
          </div>
        </div>
      </section>

      {/* 9. Önceki / sonraki ürün (dairesel): hover'da dönen neon çerçeve */}
      <section className="border-t border-fg/10 py-14 md:py-20">
        <div className="container-g grid gap-5 sm:grid-cols-2">
          <Reveal className="h-full">
            <GlowBorder
              radius="1.5rem"
              speed={5}
              className="h-full transition-transform duration-300 hover:-translate-y-1"
            >
              <Link
                href={`/urunler/${prevSlug}`}
                className="group flex h-full items-center gap-5 rounded-[calc(1.5rem-1px)] p-6 md:p-8"
              >
                <span className="flex size-12 shrink-0 items-center justify-center rounded-full border border-fg/15 transition-all duration-300 group-hover:border-guru group-hover:bg-guru group-hover:text-ink">
                  <ArrowLeft className="size-5 transition-transform duration-300 group-hover:-translate-x-0.5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-xs font-semibold uppercase tracking-[0.16em] text-fg/50">
                    Önceki Ürün
                  </span>
                  <span className="mt-1 flex items-center gap-2 text-lg font-semibold tracking-tight md:text-xl">
                    {PrevIcon && (
                      <PrevIcon className="size-5 shrink-0 text-guru-text" strokeWidth={2} aria-hidden />
                    )}
                    <span className="truncate">{productName(prevSlug)}</span>
                  </span>
                </span>
              </Link>
            </GlowBorder>
          </Reveal>
          <Reveal delay={0.08} className="h-full">
            <GlowBorder
              radius="1.5rem"
              speed={5}
              className="h-full transition-transform duration-300 hover:-translate-y-1"
            >
              <Link
                href={`/urunler/${nextSlug}`}
                className="group flex h-full flex-row-reverse items-center gap-5 rounded-[calc(1.5rem-1px)] p-6 text-right md:p-8"
              >
                <span className="flex size-12 shrink-0 items-center justify-center rounded-full border border-fg/15 transition-all duration-300 group-hover:border-guru group-hover:bg-guru group-hover:text-ink">
                  <ArrowRight className="size-5 transition-transform duration-300 group-hover:translate-x-0.5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-xs font-semibold uppercase tracking-[0.16em] text-fg/50">
                    Sonraki Ürün
                  </span>
                  <span className="mt-1 flex flex-row-reverse items-center gap-2 text-lg font-semibold tracking-tight md:text-xl">
                    {NextIcon && (
                      <NextIcon className="size-5 shrink-0 text-guru-text" strokeWidth={2} aria-hidden />
                    )}
                    <span className="truncate">{productName(nextSlug)}</span>
                  </span>
                </span>
              </Link>
            </GlowBorder>
          </Reveal>
        </div>
      </section>

      {/* 10. Demo talebi: sayfanın sonu (CTASection yok); mobilde tek form, lg+ iki sütun */}
      <section
        id="demo"
        className="relative scroll-mt-28 overflow-hidden border-t border-fg/10 bg-page py-14 md:py-28"
      >
        <div className="grain-blob -left-40 -top-24 h-96 w-96 opacity-25" aria-hidden />
        <div className="grain-blob -bottom-32 -right-32 h-80 w-80 opacity-15" aria-hidden />
        <div className="container-g relative">
          <SectionHeading
            center
            dark
            eyebrow="Demo"
            title="Demo *talep edin*"
            sub={`${name} için formu doldurun ya da doğrudan toplantı planlayın; aynı gün dönüş yapalım.`}
          />
          <DemoSwitch
            form={
              <ContactForm
                defaultService={name}
                subjectPrefix="Demo Talebi"
                serviceLabel="İlgilendiğiniz ürün"
                serviceOptions={productNames}
              />
            }
            scheduler={<MeetingScheduler topic={`${name} Demo`} />}
          />
        </div>
      </section>
    </>
  );
}
