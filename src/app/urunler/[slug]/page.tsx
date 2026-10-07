import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { products, site } from "@/lib/data";
import { productDetails, productSlugs, type ProductDetail } from "@/lib/products-content";
import { PageIntro } from "@/components/site/PageIntro";
import { SectionHead } from "@/components/site/SectionHead";
import { FaqGrid } from "@/components/site/FaqGrid";
import { Btn } from "@/components/site/Btn";
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
import { ContactForm } from "@/components/pages/ContactForm";
import { MeetingScheduler } from "@/components/pages/MeetingScheduler";
import { DemoSwitch } from "@/components/pages/urunler/DemoSwitch";
import { cn } from "@/lib/utils";

type Params = Promise<{ slug: string }>;

/** Ürünün görünen adı: liste kaydından, yoksa detay eyebrow'undan. */
function productName(slug: string) {
  return products.find((p) => p.slug === slug)?.name ?? productDetails[slug].hero.eyebrow;
}

/** Ürünün kısa sloganı (önceki/sonraki kartları). */
function productTagline(slug: string) {
  return products.find((p) => p.slug === slug)?.tagline ?? "";
}

/** Ekran görüntüsü alt metni tek kaynaktan (data.ts liste kaydı); yoksa ürün adı. */
function productImageAlt(slug: string) {
  return products.find((p) => p.slug === slug)?.imageAlt ?? `${productName(slug)} paneli`;
}

/** Başlıktaki *yıldızlı* kelime ana sayfa girişindeki gibi bir kademe kalın yazılır (renk yok). */
function renderHeadline(text: string) {
  return text
    .split(/(\*[^*]+\*)/g)
    .filter(Boolean)
    .map((part, i) =>
      part.startsWith("*") && part.endsWith("*") ? (
        <span key={i} className="font-medium">
          {part.slice(1, -1)}
        </span>
      ) : (
        part
      )
    );
}

/** Türkçe yüzde biçimi önde: "%100"; diğer ekler sayının arkasında ("24/7", "1 gün"). */
function formatStat({ value, suffix }: ProductDetail["stats"][number]) {
  return suffix === "%" ? `%${value}` : `${value}${suffix}`;
}

const pad = (n: number) => String(n).padStart(2, "0");

/* Demo formundaki ürün listesi: ajans hizmetleri yerine yalnız Guru ürünleri. */
const productNames = products.map((p) => p.name);

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
      /* Ekran görüntüsü SVG; sosyal ağ önizlemeleri SVG'yi desteklemediği için site OG görseli. */
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

  const neighbours = [
    { slug: prevSlug, label: "Önceki Ürün", dir: "prev" as const },
    { slug: nextSlug, label: "Sonraki Ürün", dir: "next" as const },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        // "<" kaçışı: JSON içinde olası "</script>" dizisinin etiketi kapatmasını önler.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />

      {/* 1. Giriş + büyük ekran görüntüsü. lang="en": İngilizce ürün adı büyük harfe
          dönüştürülürse noktalı İ almasın (Operation, Business). */}
      <PageIntro
        eyebrow={<span lang="en">{product.hero.eyebrow}</span>}
        title={renderHeadline(product.hero.headline)}
        lead={product.hero.sub}
        visual={
          /* LCP görseli: Reveal'e sarılmaz (opaklık 0 ile başlamasın), preload edilir */
          <div className="mx-auto max-w-[1120px] rounded-[20px] bg-gradient-to-b from-ice/70 via-soft to-soft p-1.5 sm:rounded-[28px] sm:p-4 md:p-6">
            <Image
              src={product.image}
              alt={imageAlt}
              width={1600}
              height={1100}
              preload
              sizes="(min-width: 1248px) 1072px, calc(100vw - 52px)"
              className="block h-auto w-full"
            />
          </div>
        }
      >
        <Btn href="#demo" variant="primary" size="lg" arrow>
          {product.hero.ctaLabel}
        </Btn>
        <Btn href="/urunler" variant="light" size="lg">
          Diğer Ürünler
        </Btn>
      </PageIntro>

      {/* 2. Özellikler: ikonlu kartlar */}
      <section className={sectionY}>
        <div className="container-g">
          <SectionHead
            title="Özellikler"
            lead={
              <>
                <span lang="en">{name}</span> ekibinizin günlük işini kolaylaştıran bu yeteneklerle gelir.
              </>
            }
          />
          <StaggerGroup className="mt-10 grid gap-4 sm:grid-cols-2 md:gap-5 lg:grid-cols-3">
            {product.features.map((feature) => {
              const Icon = feature.icon;
              return (
                <StaggerItem key={feature.title} className="h-full">
                  {/* Mobilde ikon ve başlık yan yana: altı kart alt alta dizilirken sayfa kısalır */}
                  <article className={cn(cardCls, "h-full p-5 sm:p-6 md:p-7")}>
                    <div className="flex items-center gap-3.5 sm:flex-col sm:items-start sm:gap-5">
                      <span className={cn(iconBoxCls, "shrink-0")} aria-hidden>
                        <Icon className="size-5" strokeWidth={1.8} />
                      </span>
                      <h3 className={cardTitleCls}>{feature.title}</h3>
                    </div>
                    <p className={cn(cardTextCls, "mt-3")}>{feature.desc}</p>
                  </article>
                </StaggerItem>
              );
            })}
          </StaggerGroup>
        </div>
      </section>

      {/* 3. Nasıl çalışır: numaralı adımlar, açık bant */}
      <section className={cn("bg-soft", sectionY)}>
        <div className="container-g">
          <SectionHead
            title="Nasıl Çalışır"
            lead="Kurulumu birlikte yapıyor, ekibinizi eğitiyor ve ilk haftadan itibaren yanınızda kalıyoruz."
          />
          <StaggerGroup className="mt-10">
            <ol className="grid gap-4 sm:grid-cols-2 md:gap-5 lg:grid-cols-4">
            {product.steps.map((step, i) => (
              <li key={step.title}>
              <StaggerItem className="h-full">
                <div className={cn(cardCls, "h-full p-5 sm:p-6")}>
                  <div className="flex items-center gap-3.5 sm:flex-col sm:items-start sm:gap-5">
                    <span
                      className="grid size-10 shrink-0 place-items-center rounded-full bg-navy text-[14px] font-medium text-white"
                      aria-hidden
                    >
                      {pad(i + 1)}
                    </span>
                    <h3 className={cardTitleCls}>
                      <span className="sr-only">{i + 1}. adım: </span>
                      {step.title}
                    </h3>
                  </div>
                  <p className={cn(cardTextCls, "mt-3")}>{step.desc}</p>
                </div>
              </StaggerItem>
              </li>
            ))}
            </ol>
          </StaggerGroup>
        </div>
      </section>

      {/* 4. Kullanım senaryoları: solda başlık, sağda senaryo kartları */}
      <section className={sectionY}>
        <div className="container-g grid items-start gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16">
          <SectionHead
            className="lg:sticky lg:top-32"
            title="Kullanım Senaryoları"
            lead="Farklı sektörlerde, farklı ekip büyüklüklerinde aynı netlikte çalışır."
          />
          <StaggerGroup className="grid gap-4">
            {product.useCases.map((useCase, i) => (
              <StaggerItem key={useCase.title}>
                <article className={cn(cardCls, "p-6 md:p-7")}>
                  <p className="text-[13px] font-medium text-brand">Senaryo {pad(i + 1)}</p>
                  <h3 className={cn(cardTitleCls, "mt-2 text-[20px]")}>{useCase.title}</h3>
                  <p className={cn(cardTextCls, "mt-2")}>{useCase.desc}</p>
                </article>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </section>

      {/* 5. Sayılar: sayfanın tek marka ışık bandı. Yalnız ürün ve kurulum ifadeleri
          (products-content.ts); kaynaksız performans yüzdesi yok. */}
      <section className="pb-16 md:pb-[72px]">
        <div className="container-g">
          <Reveal>
            <div className="relative isolate overflow-hidden rounded-[28px] bg-navy px-6 py-10 sm:px-10 md:px-12 md:py-14">
              {/* Işık yelpazesi bandın 1600px'lik geniş katmanında: parlak şerit ve alt köşe
                  parıltısı içerik kenarına itilir, rakam ve etiketler koyu zeminde kalır */}
              <div
                aria-hidden
                className="guru-beam absolute left-1/2 top-0 -z-10 h-full w-[1600px] max-w-none -translate-x-1/2"
              />
              <h2 className="text-[24px] font-medium leading-tight tracking-[-0.02em] text-white sm:text-[28px]">
                Sayılarla <span lang="en">{name}</span>
              </h2>
              <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-8 md:mt-10 lg:grid-cols-4">
                {product.stats.map((stat) => (
                  <div key={stat.label} className="flex flex-col-reverse">
                    <dt className="mt-2 text-[14px] leading-snug text-white/80">{stat.label}</dt>
                    <dd className="text-[34px] font-normal leading-none tracking-[-0.03em] text-white sm:text-[44px]">
                      {formatStat(stat)}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 6. Entegrasyonlar: hap rozetler, açık bant */}
      <section className={cn("bg-soft", sectionY)}>
        <div className="container-g grid items-start gap-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16">
          <SectionHead
            title="Entegrasyonlar"
            lead="Mevcut kanallarınızı ve araçlarınızı değiştirmeden bağlanır; veri tek yerde toplanır."
          />
          <Reveal delay={0.06}>
            <ul className="flex flex-wrap gap-2.5 lg:pt-2">
              {product.integrations.map((integration) => (
                <li key={integration} className={cn(pillCls, "px-4 py-2 text-[14px]")}>
                  <span className="size-1.5 rounded-full bg-brand" aria-hidden />
                  {integration}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* 7. SSS */}
      <section className={sectionY}>
        <div className="container-g">
          <SectionHead
            center
            title="Sık Sorulan Sorular"
            lead="Kısa yanıtlar; ayrıntıları demo görüşmesinde birlikte netleştiririz."
          />
          <Reveal className="mt-10">
            <FaqGrid items={product.faq} />
          </Reveal>
        </div>
      </section>

      {/* 8. Önceki / sonraki ürün (dairesel) */}
      <nav aria-label="Diğer ürünler" className="bg-soft py-12 md:py-14">
        <div className="container-g grid gap-4 sm:grid-cols-2 md:gap-5">
          {neighbours.map((n) => {
            const next = n.dir === "next";
            const Arrow = next ? ArrowRight : ArrowLeft;
            return (
              <Link
                key={n.dir}
                href={`/urunler/${n.slug}`}
                className={cn(
                  cardCls,
                  cardHoverCls,
                  "group flex items-center gap-4 p-5 md:p-6",
                  next && "flex-row-reverse text-right"
                )}
              >
                <span className="grid size-11 shrink-0 place-items-center rounded-full bg-chip text-heading transition-colors duration-300 group-hover:bg-navy group-hover:text-white">
                  <Arrow
                    aria-hidden
                    className={cn(
                      "size-[18px] transition-transform duration-300",
                      next ? "group-hover:translate-x-0.5" : "group-hover:-translate-x-0.5"
                    )}
                  />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[13px] text-muted">{n.label}</span>
                  <span lang="en" className="mt-0.5 block text-[18px] font-medium tracking-[-0.015em] text-heading">
                    {productName(n.slug)}
                  </span>
                  <span className="mt-0.5 block truncate text-[14px] text-muted">{productTagline(n.slug)}</span>
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* 9. Demo talebi: sayfanın sonu; lg+ iki sütun, altında sekmeli tek panel */}
      <section id="demo" className={cn("scroll-mt-28", sectionY)}>
        <div className="container-g">
          <SectionHead
            center
            title="Demo Talep Edin"
            lead={
              <>
                <span lang="en">{name}</span> için formu doldurun ya da doğrudan toplantı planlayın; aynı gün
                dönüş yapalım.
              </>
            }
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
