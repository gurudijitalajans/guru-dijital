import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { caseStudies, services } from "@/lib/data";
import { cn } from "@/lib/utils";
import { pageMetadata } from "@/lib/seo";
import { PageHero } from "@/components/layout/PageHero";
import { CTAV2 } from "@/components/v2/CTAV2";
import { GButton } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/ui/Reveal";
import { Scramble } from "@/components/fx/Scramble";
import { LiquidImage } from "@/components/fx/LiquidImage";
import { Sparkles } from "@/components/fx/Sparkles";
import { GlowBorder } from "@/components/fx/GlowBorder";
import { RollingCounter } from "@/components/fx/RollingCounter";
import { VelocityMarquee } from "@/components/fx/VelocityMarquee";
import { SectionDivider } from "@/components/v2/SectionDivider";
import { ServiceSignature } from "@/components/pages/hizmetler/ServiceSignature";
import {
  serviceShowcase,
  showcaseSources,
} from "@/components/pages/hizmetler/service-showcase";

/** "Sosyal Medya Yönetimi" → "Sosyal Medya *Yönetimi*" (son kelime yeşil); tek kelime vurgusuz kalır. */
function accentLastWord(text: string) {
  const words = text.trim().split(" ");
  if (words.length < 2) return text;
  return `${words.slice(0, -1).join(" ")} *${words[words.length - 1]}*`;
}

/**
 * Metni ilk `count` cümleye indirir (az metin kuralı). Nokta + boşluk
 * sınırından böler; alan adlarındaki noktalar boşluk içermediği için güvenli.
 */
function firstSentences(text: string, count: number) {
  return text
    .split(/(?<=\.)\s+/)
    .slice(0, count)
    .join(" ");
}

/** Hero aside (lg+) ve mobil kapak aynı sizes'ı kullanır → tek istek, tek preload. */
const COVER_SIZES = "(min-width: 1280px) 460px, (min-width: 1024px) 380px, 100vw";

export function generateStaticParams() {
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = services.find((s) => s.slug === slug);
  if (!service) return {};
  return pageMetadata({
    title: service.title,
    description: service.seoDescription ?? service.short,
    path: `/hizmetler/${service.slug}`,
  });
}

export default async function HizmetDetayPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const index = services.findIndex((s) => s.slug === slug);
  if (index === -1) notFound();

  const service = services[index];
  const prev = services[(index - 1 + services.length) % services.length];
  const next = services[(index + 1) % services.length];

  const config = serviceShowcase[service.slug];
  const showcase = config?.showcase;
  const cover = config?.hero ?? service.images[0];

  /* Galeri: marka deseni karoları ve vitrinde zaten görünen kareler elenir;
     boş kalınca bölüm hiç basılmaz. */
  const used = new Set([cover.src, ...showcaseSources(showcase)]);
  const gallery = service.images.filter(
    (img) => !img.src.startsWith("/tiles/") && !used.has(img.src)
  );
  const showGallery = showcase?.kind !== "reel" && gallery.length > 0;

  const stats =
    service.slug === "dijital-pazarlama"
      ? [
          { ...caseStudies[0].stats[0], sector: caseStudies[0].sector },
          { ...caseStudies[0].stats[5], sector: caseStudies[0].sector },
          { ...caseStudies[1].stats[0], sector: caseStudies[1].sector },
          { ...caseStudies[1].stats[1], sector: caseStudies[1].sector },
        ]
      : null;

  return (
    <>
      <PageHero
        // PageHeroV2 eyebrow'u JSX child olarak basar; Scramble elementi
        // ReactNode olarak sorunsuz render edilir (tip string beklediği için cast).
        eyebrow={
          (<Scramble text={`Hizmet ${service.no}`} duration={1.1} />) as unknown as string
        }
        title={accentLastWord(service.title)}
        sub={service.headline}
        aside={
          <LiquidImage
            src={cover.src}
            alt={cover.alt}
            priority
            sizes={COVER_SIZES}
            className="aspect-[4/3] w-[380px] rounded-3xl border border-fg/10 bg-card shadow-[0_0_50px_rgba(16,216,108,0.07)] xl:w-[460px]"
          />
        }
      >
        <div className="flex flex-wrap gap-3">
          <GButton href={`/iletisim?hizmet=${service.slug}`} variant="green" size="lg">
            Teklif Al
          </GButton>
          <GButton href="#kapsam" variant="outline" size="lg" arrow={false}>
            Kapsamı İncele
          </GButton>
        </div>
      </PageHero>

      {/* Vitrin anı: manifesto + anahtar kelimeler + hizmete özgü gösterim.
          Telefon akışı kapağı zaten içerdiğinden mobil kapak onda basılmaz. */}
      <ServiceSignature
        showcase={showcase}
        manifesto={firstSentences(service.intro[0], 1)}
        keywords={service.keywords}
        cover={
          showcase?.kind === "phone-feed"
            ? null
            : { src: cover.src, alt: cover.alt, sizes: COVER_SIZES }
        }
      />

      {/* Dijital pazarlama: vaka istatistikleri (koyu bant) */}
      {stats && (
        <section className="relative overflow-hidden border-y border-fg/10 bg-page py-20 text-fg md:py-28">
          <div className="grain-blob -right-32 -top-24 h-80 w-80 opacity-30" aria-hidden />
          <div className="container-g relative">
            <SectionHeading
              dark
              eyebrow="Vaka Çalışmaları"
              title="Rakamlarla *kanıtlanmış* sonuçlar"
              sub="Sağlık ve e-ticaret sektörlerinden iki kampanyanın ölçülmüş sonuçları."
            />
            <StaggerGroup className="mt-12 grid gap-x-8 gap-y-10 sm:grid-cols-2 md:mt-14 lg:grid-cols-4">
              {stats.map((stat) => (
                <StaggerItem key={stat.label}>
                  <div className="border-l-2 border-guru pl-5">
                    <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-fg/40">
                      {stat.sector}
                    </p>
                    <p className="mt-2 text-4xl font-bold tracking-tight text-guru-text md:text-5xl">
                      <RollingCounter
                        value={stat.value}
                        prefix={stat.prefix ?? ""}
                        suffix={stat.suffix}
                      />
                    </p>
                    <p className="mt-2 text-sm leading-snug text-fg/60">{stat.label}</p>
                  </div>
                </StaggerItem>
              ))}
            </StaggerGroup>
          </div>
        </section>
      )}

      <SectionDivider from="coal" to="ink" />

      {/* Kapsam: editorial satırlar (numara, başlık, dahil işareti) */}
      <section id="kapsam" className="scroll-mt-28 bg-band py-20 md:py-28">
        <div className="container-g">
          <SectionHeading dark eyebrow="Kapsam" title={accentLastWord(service.offeringsTitle)} />
          <StaggerGroup className="mt-12 md:mt-14">
            {service.offerings.map((offering, i) => (
              <StaggerItem key={offering} className="border-t border-fg/10 last:border-b">
                <div className="group flex items-center gap-4 py-5 transition-[padding,background-color] duration-500 sm:gap-6 md:gap-8 md:py-7 lg:hover:bg-guru/5 lg:hover:pl-6">
                  <span className="w-8 shrink-0 text-sm font-semibold tabular-nums tracking-[0.12em] text-guru-text">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <p className="min-w-0 flex-1 text-lg font-bold tracking-[-0.02em] text-fg sm:text-xl md:text-2xl lg:text-3xl">
                    {offering}
                  </p>
                  <span
                    aria-hidden
                    className="grid size-10 shrink-0 place-items-center rounded-full border border-fg/15 text-fg/60 transition-all duration-500 group-hover:border-guru group-hover:bg-guru group-hover:text-ink"
                  >
                    <Check className="size-4" strokeWidth={2.2} />
                  </span>
                </div>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </section>

      {/* Görseller: yalnız vitrinde gösterilmeyen ek kareler kaldıysa;
          3+ karede tek sıra akan bant, aksi halde sıvı görsel ızgarası */}
      {showGallery && gallery.length >= 3 ? (
        <section className="overflow-hidden border-t border-fg/10 pb-20 pt-14 md:pb-28 md:pt-16">
          <div className="container-g">
            <SectionHeading dark eyebrow="İşlerimizden" title="Üretimden *kareler*" />
          </div>
          <Reveal className="mt-12 md:mt-14">
            <VelocityMarquee baseVelocity={0.8}>
              {gallery.map((img, i) => (
                <div
                  key={img.src}
                  className="relative mx-2.5 aspect-[4/3] w-64 shrink-0 overflow-hidden rounded-2xl border border-fg/10 sm:w-80 md:mx-3 md:w-96"
                >
                  <Image
                    src={img.src}
                    alt={img.alt}
                    fill
                    sizes="(min-width: 768px) 384px, (min-width: 640px) 320px, 256px"
                    loading={i < 3 ? "eager" : undefined}
                    className="object-cover"
                  />
                </div>
              ))}
            </VelocityMarquee>
          </Reveal>
        </section>
      ) : showGallery ? (
        <section className="border-t border-fg/10 pb-20 pt-14 md:pb-28 md:pt-16">
          <div className="container-g">
            <SectionHeading dark eyebrow="İşlerimizden" title="Üretimden *kareler*" />
            <StaggerGroup className="mt-12 grid gap-5 sm:grid-cols-2 md:gap-6">
              {gallery.map((img, i) => {
                const spans = gallery.length % 2 === 1 && i === gallery.length - 1;
                return (
                  <StaggerItem key={img.src} className={cn(spans && "sm:col-span-2")}>
                    <LiquidImage
                      src={img.src}
                      alt={img.alt}
                      sizes={spans ? "100vw" : "(min-width: 640px) 50vw, 100vw"}
                      className={cn(
                        "rounded-3xl border border-fg/10",
                        spans ? "aspect-[16/9] sm:aspect-[21/9]" : "aspect-[4/3]"
                      )}
                    />
                  </StaggerItem>
                );
              })}
            </StaggerGroup>
          </div>
        </section>
      ) : null}

      {/* Kapanış vurgusu: düşük yoğunluklu ışıltı */}
      {service.outro && (
        <section className="relative overflow-hidden border-y border-fg/10 bg-page py-20 text-fg md:py-28">
          <div className="grain-blob -left-40 -top-24 h-96 w-96 opacity-25" aria-hidden />
          <Sparkles density={8} className="opacity-70" />
          <span
            className="headline-outline-light pointer-events-none absolute right-2 top-2 select-none text-[5rem] font-extrabold leading-none sm:-right-6 sm:-top-8 sm:text-[10rem] md:text-[16rem]"
            aria-hidden
          >
            {service.no}
          </span>
          <div className="container-g relative">
            <Reveal>
              <div className="flex items-stretch gap-6 md:gap-10">
                <span className="w-1 shrink-0 bg-guru" aria-hidden />
                <p className="max-w-5xl text-xl font-semibold leading-snug tracking-tight sm:text-2xl md:text-4xl">
                  {firstSentences(service.outro, 1)}
                </p>
              </div>
            </Reveal>
          </div>
        </section>
      )}

      {/* Önceki / sonraki hizmet: hover'da dönen neon çerçeve, eşit yükseklik */}
      <section className="border-t border-fg/10 py-16 md:py-20">
        <div className="container-g grid gap-5 sm:grid-cols-2">
          <Reveal className="h-full">
            <GlowBorder
              radius="1.5rem"
              speed={5}
              className="h-full transition-transform duration-300 hover:-translate-y-1"
            >
              <Link
                href={`/hizmetler/${prev.slug}`}
                className="group flex h-full items-center gap-5 rounded-[calc(1.5rem-1px)] p-6 md:p-8"
              >
                <span className="flex size-12 shrink-0 items-center justify-center rounded-full border border-fg/15 transition-all duration-300 group-hover:border-guru group-hover:bg-guru group-hover:text-ink">
                  <ArrowLeft className="size-5 transition-transform duration-300 group-hover:-translate-x-0.5" />
                </span>
                <span className="min-w-0">
                  <span className="block text-xs font-semibold uppercase tracking-[0.16em] text-fg/50">
                    Önceki Hizmet
                  </span>
                  <span className="mt-1 block text-base font-semibold tracking-tight md:text-lg">
                    {prev.title}
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
                href={`/hizmetler/${next.slug}`}
                className="group flex h-full flex-row-reverse items-center gap-5 rounded-[calc(1.5rem-1px)] p-6 text-right md:p-8"
              >
                <span className="flex size-12 shrink-0 items-center justify-center rounded-full border border-fg/15 transition-all duration-300 group-hover:border-guru group-hover:bg-guru group-hover:text-ink">
                  <ArrowRight className="size-5 transition-transform duration-300 group-hover:translate-x-0.5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-xs font-semibold uppercase tracking-[0.16em] text-fg/50">
                    Sonraki Hizmet
                  </span>
                  <span className="mt-1 block text-base font-semibold tracking-tight md:text-lg">
                    {next.title}
                  </span>
                </span>
              </Link>
            </GlowBorder>
          </Reveal>
        </div>
      </section>

      <CTAV2 />
    </>
  );
}
