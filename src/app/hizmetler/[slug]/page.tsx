import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import { caseStudies, services, webProjects } from "@/lib/data";
import { cn } from "@/lib/utils";
import { PageHero } from "@/components/layout/PageHero";
import { CTASection } from "@/components/sections/CTASection";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/ui/Reveal";
import { Scramble } from "@/components/fx/Scramble";
import { LiquidImage } from "@/components/fx/LiquidImage";
import { Spotlight } from "@/components/fx/Spotlight";
import { Sparkles } from "@/components/fx/Sparkles";
import { GlowBorder } from "@/components/fx/GlowBorder";
import { RollingCounter } from "@/components/fx/RollingCounter";
import { VelocityMarquee } from "@/components/fx/VelocityMarquee";
import { SectionDivider } from "@/components/v2/SectionDivider";

/** "Sosyal Medya Yönetimi" → "Sosyal Medya *Yönetimi*" (son kelime yeşil). */
function accentLastWord(text: string) {
  const words = text.trim().split(" ");
  if (words.length < 2) return `*${text}*`;
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
  return {
    title: service.title,
    description: service.short,
  };
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
  const [cover, ...gallery] = service.images;

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
      />

      {/* Giriş + kapak görseli; lg'de görsel kolonu daha geniş (tam genişlik) */}
      <section className="pb-20 md:pb-28 md:pt-2">
        <div className="container-g grid items-center gap-10 md:grid-cols-2 md:gap-16 lg:grid-cols-[1fr_1.1fr]">
          <div>
            <Reveal>
              <p className="text-lg leading-relaxed text-paper/70 md:text-xl md:leading-relaxed">
                {firstSentences(service.intro[0], 2)}
              </p>
            </Reveal>
            <Reveal delay={0.15}>
              <div className="mt-8 flex flex-wrap gap-2">
                {service.keywords.map((k) => (
                  <span
                    key={k}
                    className="inline-flex items-center gap-2 rounded-full border border-paper/15 px-3.5 py-1.5 text-xs font-medium text-paper/60"
                  >
                    <span className="size-1.5 bg-guru" aria-hidden />
                    {k}
                  </span>
                ))}
              </div>
            </Reveal>
          </div>
          <Reveal delay={0.1}>
            {/* Kapak: hover'da sıvı dalgalanma — link değil, data-cursor yok */}
            <LiquidImage
              src={cover.src}
              alt={cover.alt}
              priority
              sizes="(min-width: 1024px) 55vw, (min-width: 768px) 50vw, 100vw"
              className="aspect-[4/3] rounded-3xl border border-paper/10 shadow-[0_0_50px_rgba(16,216,108,0.07)]"
            />
          </Reveal>
        </div>
      </section>

      {/* Dijital pazarlama: vaka istatistikleri (koyu bant) */}
      {stats && (
        <section className="relative overflow-hidden border-y border-paper/10 bg-coal py-20 text-paper md:py-28">
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
                    <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-paper/40">
                      {stat.sector}
                    </p>
                    <p className="mt-2 text-4xl font-bold tracking-tight text-guru md:text-5xl">
                      <RollingCounter
                        value={stat.value}
                        prefix={stat.prefix ?? ""}
                        suffix={stat.suffix}
                      />
                    </p>
                    <p className="mt-2 text-sm leading-snug text-paper/60">{stat.label}</p>
                  </div>
                </StaggerItem>
              ))}
            </StaggerGroup>
          </div>
        </section>
      )}

      <SectionDivider from="coal" to="ink" />

      {/* Sunduklarımız — spotlight'lı kartlar, dev numaralar */}
      <section className="bg-ink py-20 md:py-28">
        <div className="container-g">
          <SectionHeading dark eyebrow="Kapsam" title={accentLastWord(service.offeringsTitle)} />
          <StaggerGroup className="mt-12 grid gap-5 md:grid-cols-2">
            {service.offerings.map((offering, i) => (
              <StaggerItem key={offering} className="h-full">
                <Spotlight
                  size={380}
                  opacity={0.09}
                  className="h-full overflow-hidden rounded-3xl border border-paper/10 bg-carbon transition-all duration-300 hover:-translate-y-1 hover:border-guru/40"
                >
                  <div className="flex h-full items-start gap-5 p-7 md:gap-6 md:p-8">
                    <span
                      className="headline-outline-light shrink-0 text-5xl font-extrabold leading-none md:text-6xl"
                      aria-hidden
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <p className="min-w-0 pt-1.5 font-medium leading-snug text-paper md:pt-2 md:text-lg">
                      {offering}
                    </p>
                  </div>
                </Spotlight>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </section>

      <SectionDivider from="ink" to="coal" flip />

      {/* Görseller: 3+ karede tek sıra akan bant, aksi halde sıvı görsel ızgarası */}
      {gallery.length >= 3 ? (
        <section className="overflow-hidden pb-20 pt-14 md:pb-28 md:pt-16">
          <div className="container-g">
            <SectionHeading dark eyebrow="İşlerimizden" title="Üretimden *kareler*" />
          </div>
          <Reveal className="mt-12 md:mt-14">
            <VelocityMarquee baseVelocity={0.8}>
              {gallery.map((img) => (
                <div
                  key={img.src}
                  className="relative mx-2.5 aspect-[4/3] w-64 shrink-0 overflow-hidden rounded-2xl border border-paper/10 sm:w-80 md:mx-3 md:w-96"
                >
                  <Image
                    src={img.src}
                    alt={img.alt}
                    fill
                    sizes="(min-width: 768px) 384px, (min-width: 640px) 320px, 256px"
                    className="object-cover"
                  />
                </div>
              ))}
            </VelocityMarquee>
          </Reveal>
        </section>
      ) : gallery.length > 0 ? (
        <section className="pb-20 pt-14 md:pb-28 md:pt-16">
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
                        "rounded-3xl border border-paper/10",
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

      {/* Kapanış vurgusu — düşük yoğunluklu ışıltı */}
      {service.outro && (
        <section className="relative overflow-hidden border-y border-paper/10 bg-coal py-20 text-paper md:py-28">
          <div className="grain-blob -left-40 -top-24 h-96 w-96 opacity-25" aria-hidden />
          <Sparkles density={8} className="opacity-70" />
          <span
            className="headline-outline-light pointer-events-none absolute -right-6 -top-8 select-none text-[6rem] font-extrabold leading-none sm:text-[10rem] md:text-[16rem]"
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

      {/* Web tasarım: canlı projeler */}
      {service.slug === "web-tasarim" && (
        <section className="py-20 md:py-28">
          <div className="container-g">
            <SectionHeading
              dark
              eyebrow="Yayında"
              title="Canlı web *projelerimiz*"
              sub="Tasarlayıp yayına aldığımız sitelerden bazıları."
            />
            <StaggerGroup className="mt-12 grid gap-4 sm:grid-cols-2 md:gap-5 lg:grid-cols-3">
              {webProjects.map((project) => (
                <StaggerItem key={project.url} className="h-full">
                  <a
                    href={`https://${project.url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex h-full flex-col justify-between gap-8 rounded-3xl border border-paper/10 bg-carbon p-6 transition-all duration-300 hover:-translate-y-1 hover:border-guru/40 hover:shadow-[0_0_50px_rgba(16,216,108,0.07)] md:p-7"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-paper/50">
                          Canlı site
                        </span>
                        <h3 className="mt-2 text-xl font-semibold tracking-tight">
                          {project.name}
                        </h3>
                      </div>
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-paper/15 transition-all duration-300 group-hover:border-guru group-hover:bg-guru group-hover:text-ink">
                        <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                      </span>
                    </div>
                    <span className="inline-flex items-center gap-2 text-sm font-medium text-paper/60 transition-colors duration-300 group-hover:text-guru">
                      <span className="size-1.5 bg-guru" aria-hidden />
                      {project.url}
                    </span>
                  </a>
                </StaggerItem>
              ))}
            </StaggerGroup>
          </div>
        </section>
      )}

      {/* Önceki / sonraki hizmet — hover'da dönen neon çerçeve, eşit yükseklik */}
      <section className="border-t border-paper/10 py-16 md:py-20">
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
                <span className="flex size-12 shrink-0 items-center justify-center rounded-full border border-paper/15 transition-all duration-300 group-hover:border-guru group-hover:bg-guru group-hover:text-ink">
                  <ArrowLeft className="size-5 transition-transform duration-300 group-hover:-translate-x-0.5" />
                </span>
                <span className="min-w-0">
                  <span className="block text-xs font-semibold uppercase tracking-[0.16em] text-paper/50">
                    Önceki Hizmet
                  </span>
                  <span className="mt-1 block truncate text-lg font-semibold tracking-tight md:text-xl">
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
                <span className="flex size-12 shrink-0 items-center justify-center rounded-full border border-paper/15 transition-all duration-300 group-hover:border-guru group-hover:bg-guru group-hover:text-ink">
                  <ArrowRight className="size-5 transition-transform duration-300 group-hover:translate-x-0.5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-xs font-semibold uppercase tracking-[0.16em] text-paper/50">
                    Sonraki Hizmet
                  </span>
                  <span className="mt-1 block truncate text-lg font-semibold tracking-tight md:text-xl">
                    {next.title}
                  </span>
                </span>
              </Link>
            </GlowBorder>
          </Reveal>
        </div>
      </section>

      <CTASection />
    </>
  );
}
