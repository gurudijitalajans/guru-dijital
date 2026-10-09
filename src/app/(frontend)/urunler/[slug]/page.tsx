import { existsSync } from "node:fs";
import { join } from "node:path";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { site } from "@/lib/data";
import { getProduct, getProducts, type ProductView } from "@/lib/content";
import { SectionHead } from "@/components/site/SectionHead";
import { FaqGrid } from "@/components/site/FaqGrid";
import { VideoPlayer } from "@/components/site/VideoPlayer";
import { cardCls, cardTextCls, cardTitleCls, pillCls, sectionY } from "@/components/site/styles";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/ui/Reveal";
import { ContactForm } from "@/components/pages/ContactForm";
import { MeetingScheduler } from "@/components/pages/MeetingScheduler";
import { DemoSwitch } from "@/components/pages/urunler/DemoSwitch";
import { ProductSubnav, type SubnavItem } from "@/components/pages/urunler/ProductSubnav";
import {
  ComparisonBlock,
  FeatureGrid,
  IncludedGrid,
  ProductCardLink,
  ProductHero,
  ShowcaseRows,
  anchorCls,
} from "@/components/pages/urunler/ProductSections";
import { cn } from "@/lib/utils";

type Params = Promise<{ slug: string }>;

/** Türkçe yüzde biçimi önde: "%100"; diğer ekler sayının arkasında ("24/7", "1 gün"). */
function formatStat({ value, suffix }: ProductView["stats"][number]) {
  return suffix === "%" ? `%${value}` : `${value}${suffix}`;
}

const pad = (n: number) => String(n).padStart(2, "0");

/** Site içindeki video dosyası gerçekten var mı (Remotion çıktısı henüz üretilmediyse bölüm gizlenir) */
const videoExists = (src: string) => /^https:\/\//.test(src) || existsSync(join(process.cwd(), "public", src));

export async function generateStaticParams() {
  return (await getProducts()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
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
      images: [{ url: product.ogImage, width: 1200, height: 630, alt: `${product.name}: ${product.tagline}` }],
    },
    twitter: { card: "summary_large_image", title: product.seo.title, description: product.seo.description, images: [product.ogImage] },
  };
}

/**
 * Ürün sayfası: giriş (metin + marka görseli), yapışkan bölüm menüsü, ürün
 * turu videosu, öne çıkan ekranlar, özellikler, paket içeriği, karşılaştırma,
 * nasıl çalışır, senaryolar, sayılar, neler dahil, entegrasyonlar, SSS, diğer
 * ürünler ve demo. İçerik getProducts() ile gelir; boş bölüm görünmez.
 */
export default async function UrunDetayPage({ params }: { params: Params }) {
  const { slug } = await params;
  const products = await getProducts();
  const product = products.find((p) => p.slug === slug);
  if (!product) notFound();

  const name = product.name;
  /* Demo formundaki ürün listesi: ajans hizmetleri yerine yalnız Guru ürünleri */
  const productNames = products.map((p) => p.name);
  const tour = product.tour && videoExists(product.tour.src) ? product.tour : null;
  const bundle = product.bundle.map((s) => products.find((p) => p.slug === s)).filter((p): p is ProductView => Boolean(p));
  const others = products.filter((p) => p.slug !== product.slug && !product.bundle.includes(p.slug));

  const nav: SubnavItem[] = [
    ...(tour ? [{ id: "urun-turu", label: "Ürün turu" }] : []),
    { id: "ozellikler", label: "Özellikler" },
    ...(bundle.length > 0 ? [{ id: "paket", label: "Paket içeriği" }] : []),
    { id: "nasil-calisir", label: "Nasıl çalışır" },
    ...(product.included.length > 0 ? [{ id: "neler-dahil", label: "Neler dahil" }] : []),
    { id: "sss", label: "SSS" },
    /* Masaüstünde sağdaki düğme var; mobilde menünün sonunda dolu düğme olarak durur */
    { id: "demo", label: "Demo", cta: true },
  ];

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name,
      description: product.seo.description,
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      url: `${site.url}/urunler/${product.slug}`,
      image: product.heroVisual.src.startsWith("http") ? product.heroVisual.src : `${site.url}${product.heroVisual.src}`,
      inLanguage: "tr",
      provider: { "@type": "Organization", name: site.name, url: site.url },
    },
    ...(product.faq.length > 0
      ? [
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: product.faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
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

      {/* 1. Giriş */}
      <ProductHero product={product} hasTour={Boolean(tour)} />

      {/* 2. Yapışkan bölüm menüsü */}
      <ProductSubnav items={nav} ctaLabel={product.hero.ctaLabel} />

      {/* 3. Ürün turu videosu */}
      {tour && (
        <section id="urun-turu" className={cn(anchorCls, "bg-soft", sectionY)}>
          <div className="container-g">
            <SectionHead
              center
              title={tour.title}
              lead={
                <>
                  <span lang="en">{name}</span> ekranlarını ve günlük kullanımını kısa bir videoda izleyin.
                </>
              }
            />
            <Reveal className="mx-auto mt-10 max-w-5xl">
              <VideoPlayer src={tour.src} poster={tour.poster} label={`${name} ürün turunu oynat`} trackName={product.slug} />
            </Reveal>
          </div>
        </section>
      )}

      {/* 4. Öne çıkan ekranlar ve diğer özellikler */}
      <section id="ozellikler" className={cn(anchorCls, sectionY)}>
        <div className="container-g">
          {product.showcase.length > 0 && (
            <>
              <SectionHead
                center
                title="Öne Çıkan Ekranlar"
                lead={
                  <>
                    <span lang="en">{name}</span> ekibinizin günlük işinde en çok kullandığı ekranlar.
                  </>
                }
              />
              <div className="mt-12 md:mt-16">
                <ShowcaseRows product={product} />
              </div>
            </>
          )}
          {product.features.length > 0 && (
            <div className={cn(product.showcase.length > 0 && "mt-20 md:mt-28")}>
              <SectionHead title={product.showcase.length > 0 ? "Ve Daha Fazlası" : "Özellikler"} lead="Ekibinizin işini kolaylaştıran diğer yetenekler." />
              <div className="mt-10">
                <FeatureGrid product={product} />
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 5. Paket içeriği (paket ürünlerde) */}
      {bundle.length > 0 && (
        <section id="paket" className={cn(anchorCls, "bg-soft", sectionY)}>
          <div className="container-g">
            <SectionHead
              title="Pakete Dahil Ürünler"
              lead="Her biri tek başına da kullanılabilir; pakette aynı veri tabanını ve tek girişi paylaşır."
            />
            <StaggerGroup className="mt-10 grid gap-4 sm:grid-cols-3 sm:gap-3 md:gap-5">
              {bundle.map((b) => (
                <StaggerItem key={b.slug} className="h-full">
                  <ProductCardLink product={b} />
                </StaggerItem>
              ))}
            </StaggerGroup>
          </div>
        </section>
      )}

      {/* 6. Bugün / Guru ile */}
      <ComparisonBlock product={product} />

      {/* 7. Nasıl çalışır */}
      {product.steps.length > 0 && (
        <section id="nasil-calisir" className={cn(anchorCls, "bg-soft", sectionY)}>
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
      )}

      {/* 8. Kullanım senaryoları */}
      {product.useCases.length > 0 && (
        <section className={sectionY}>
          <div className="container-g grid items-start gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16">
            <SectionHead
              className="lg:sticky lg:top-44"
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
      )}

      {/* 9. Sayılar: yalnız ürün ve kurulum ifadeleri; kaynaksız performans yüzdesi yok */}
      {product.stats.length > 0 && (
        <section className="pb-16 md:pb-[72px]">
          <div className="container-g">
            <Reveal>
              <div className="relative isolate overflow-hidden rounded-[28px] bg-navy px-6 py-10 sm:px-10 md:px-12 md:py-14">
                <div aria-hidden className="guru-beam absolute left-1/2 top-0 -z-10 h-full w-[1600px] max-w-none -translate-x-1/2" />
                <h2 className="text-[24px] font-medium leading-tight tracking-[-0.02em] text-white sm:text-[28px]">
                  Sayılarla <span lang="en">{name}</span>
                </h2>
                <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-8 md:mt-10 lg:grid-cols-4">
                  {product.stats.map((stat) => (
                    <div key={stat.label} className="flex flex-col-reverse">
                      <dt className="mt-2 text-[14px] leading-snug text-white/80">{stat.label}</dt>
                      <dd className="text-[34px] font-normal leading-none tracking-[-0.03em] text-white sm:text-[44px]">{formatStat(stat)}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </Reveal>
          </div>
        </section>
      )}

      {/* 10. Neler dahil */}
      {product.included.length > 0 && (
        <section id="neler-dahil" className={cn(anchorCls, "bg-soft", sectionY)}>
          <div className="container-g">
            <SectionHead title="Kurulumdan Desteğe Neler Dahil" lead="Yazılımı teslim edip bırakmıyoruz; işleyen sistemi birlikte kuruyoruz." />
            <div className="mt-10">
              <IncludedGrid product={product} />
            </div>
          </div>
        </section>
      )}

      {/* 11. Entegrasyonlar */}
      {product.integrations.length > 0 && (
        <section className={sectionY}>
          <div className="container-g grid items-start gap-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16">
            <SectionHead
              title="Entegrasyonlar"
              lead="Mevcut kanallarınızı ve araçlarınızı değiştirmeden bağlanır; veri tek yerde toplanır."
            />
            <Reveal delay={0.06}>
              <ul className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:pt-2">
                {product.integrations.map((integration) => (
                  <li key={integration} className={cn(pillCls, "bg-chip px-4 py-2.5 text-[14px] shadow-none")}>
                    <span className="size-1.5 rounded-full bg-brand" aria-hidden />
                    {integration}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </section>
      )}

      {/* 12. SSS */}
      {product.faq.length > 0 && (
        <section id="sss" className={cn(anchorCls, "bg-soft", sectionY)}>
          <div className="container-g">
            <SectionHead center title="Sık Sorulan Sorular" lead="Kısa yanıtlar; ayrıntıları demo görüşmesinde birlikte netleştiririz." />
            <Reveal className="mt-10">
              <FaqGrid items={product.faq} />
            </Reveal>
          </div>
        </section>
      )}

      {/* 13. Diğer ürünler */}
      {others.length > 0 && (
        <section className={sectionY}>
          <div className="container-g">
            <SectionHead title="Diğer Ürünlerimiz" lead="Hepsi aynı veri tabanını paylaşır; ihtiyacınız büyüdükçe birbirine bağlanır." />
            <StaggerGroup className="mt-10 grid gap-4 sm:grid-cols-3 sm:gap-3 md:gap-5">
              {others.map((p) => (
                <StaggerItem key={p.slug} className="h-full">
                  <ProductCardLink product={p} />
                </StaggerItem>
              ))}
            </StaggerGroup>
          </div>
        </section>
      )}

      {/* 14. Demo talebi */}
      {/* Beyaz bölüm içinde açık panel: SSS (açık bant) ve alt bilgiyle aynı zeminde tek uzun bant oluşmaz.
          Diğer ürünler (beyaz) varsa üst boşluk tekrarlanmaz. */}
      <section id="demo" className={cn(anchorCls, sectionY, others.length > 0 && "pt-0 md:pt-0")}>
        <div className="container-g">
          <div className="rounded-[24px] bg-soft px-3 py-10 sm:px-6 md:rounded-[28px] md:px-10 md:py-14">
          <SectionHead
            center
            title="Demo Talep Edin"
            lead={
              <>
                <span lang="en">{name}</span> için formu doldurun ya da doğrudan toplantı planlayın; aynı gün dönüş yapalım.
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
                messagePlaceholder="Ekibinizden ve bugün kullandığınız araçlardan kısaca bahsedin."
              />
            }
            scheduler={<MeetingScheduler topic={`${name} Demo`} />}
          />
          </div>
        </div>
      </section>
    </>
  );
}
