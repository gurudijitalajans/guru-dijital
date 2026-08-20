import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, ArrowUpRight, Check } from "lucide-react";
import { caseStudies, services, webProjects } from "@/lib/data";
import { cn } from "@/lib/utils";
import { PageHero } from "@/components/layout/PageHero";
import { CTASection } from "@/components/sections/CTASection";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/ui/Reveal";
import { TiltCard } from "@/components/ui/TiltCard";
import { Counter } from "@/components/ui/Counter";

/** "Sosyal Medya Yönetimi" → "Sosyal Medya *Yönetimi*" (son kelime yeşil). */
function accentLastWord(text: string) {
  const words = text.trim().split(" ");
  if (words.length < 2) return `*${text}*`;
  return `${words.slice(0, -1).join(" ")} *${words[words.length - 1]}*`;
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
        eyebrow={`Hizmet ${service.no}`}
        title={accentLastWord(service.title)}
        sub={service.headline}
      />

      {/* Giriş + kapak görseli */}
      <section className="pb-20 md:pb-28">
        <div className="container-g grid items-center gap-10 md:grid-cols-2 md:gap-16">
          <div>
            <StaggerGroup className="space-y-5">
              {service.intro.map((p) => (
                <StaggerItem key={p}>
                  <p className="text-base leading-relaxed text-smoke md:text-lg">{p}</p>
                </StaggerItem>
              ))}
            </StaggerGroup>
            <Reveal delay={0.15}>
              <div className="mt-7 flex flex-wrap gap-2">
                {service.keywords.map((k) => (
                  <span
                    key={k}
                    className="inline-flex items-center gap-2 rounded-full border border-ink/10 px-3.5 py-1.5 text-xs font-medium text-ink/70"
                  >
                    <span className="size-1.5 bg-guru" aria-hidden />
                    {k}
                  </span>
                ))}
              </div>
            </Reveal>
          </div>
          <Reveal delay={0.1}>
            <TiltCard className="group">
              <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-ink/8 shadow-soft">
                <Image
                  src={cover.src}
                  alt={cover.alt}
                  fill
                  priority
                  className="object-cover"
                  sizes="(min-width: 768px) 50vw, 100vw"
                />
              </div>
            </TiltCard>
          </Reveal>
        </div>
      </section>

      {/* Dijital pazarlama: vaka istatistikleri (koyu bant) */}
      {stats && (
        <section className="relative overflow-hidden bg-coal py-20 text-paper md:py-28">
          <div className="grain-blob -right-32 -top-24 h-80 w-80 opacity-30" aria-hidden />
          <div className="container-g relative">
            <SectionHeading
              dark
              eyebrow="Vaka Çalışmaları"
              title="Rakamlarla *kanıtlanmış* sonuçlar"
              sub="Yönettiğimiz kampanyalardan iki örnek: sağlık sektöründe reklam bütçesi artırılmadan yalnızca 3 ayda, e-ticarette ise sürekli optimizasyonla elde edilen sonuçlar."
            />
            <StaggerGroup className="mt-12 grid gap-x-8 gap-y-10 sm:grid-cols-2 md:mt-14 lg:grid-cols-4">
              {stats.map((stat) => (
                <StaggerItem key={stat.label}>
                  <div className="border-l-2 border-guru pl-5">
                    <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-paper/40">
                      {stat.sector}
                    </p>
                    <p className="mt-2 text-4xl font-bold tracking-tight text-guru md:text-5xl">
                      <Counter value={stat.value} prefix={stat.prefix ?? ""} suffix={stat.suffix} />
                    </p>
                    <p className="mt-2 text-sm leading-snug text-paper/60">{stat.label}</p>
                  </div>
                </StaggerItem>
              ))}
            </StaggerGroup>
          </div>
        </section>
      )}

      {/* Sunduklarımız */}
      <section className="bg-mist/40 py-20 md:py-28">
        <div className="container-g">
          <SectionHeading eyebrow="Kapsam" title={accentLastWord(service.offeringsTitle)} />
          <StaggerGroup className="mt-12 grid gap-4 md:grid-cols-2 md:gap-5">
            {service.offerings.map((offering, i) => (
              <StaggerItem key={offering} className="h-full">
                <div className="group flex h-full items-start gap-4 rounded-3xl border border-ink/8 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-guru/40 hover:shadow-card md:p-7">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-guru/15 text-guru-deep transition-colors duration-300 group-hover:bg-guru group-hover:text-ink">
                    <Check className="size-4" strokeWidth={2.5} />
                  </span>
                  <div className="min-w-0">
                    <span className="text-xs font-semibold tracking-[0.18em] text-smoke">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <p className="mt-1.5 font-medium leading-snug text-ink">{offering}</p>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </section>

      {/* Kalan görseller */}
      {gallery.length > 0 && (
        <section className="py-20 md:py-28">
          <div className="container-g">
            <SectionHeading eyebrow="İşlerimizden" title="Üretimden *kareler*" />
            <StaggerGroup className="mt-12 grid gap-5 sm:grid-cols-2 md:gap-6">
              {gallery.map((img, i) => {
                const spans = gallery.length % 2 === 1 && i === gallery.length - 1;
                return (
                  <StaggerItem key={img.src} className={cn(spans && "sm:col-span-2")}>
                    <TiltCard className="group" max={5}>
                      <div
                        className={cn(
                          "relative overflow-hidden rounded-3xl border border-ink/8 shadow-card",
                          spans ? "aspect-[16/9] sm:aspect-[21/9]" : "aspect-[4/3]"
                        )}
                      >
                        <Image
                          src={img.src}
                          alt={img.alt}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                          sizes={spans ? "100vw" : "(min-width: 640px) 50vw, 100vw"}
                        />
                      </div>
                    </TiltCard>
                  </StaggerItem>
                );
              })}
            </StaggerGroup>
          </div>
        </section>
      )}

      {/* Kapanış vurgusu */}
      {service.outro && (
        <section className="relative overflow-hidden bg-coal py-20 text-paper md:py-28">
          <div className="grain-blob -left-40 -top-24 h-96 w-96 opacity-25" aria-hidden />
          <span
            className="headline-outline-light pointer-events-none absolute -right-6 -top-8 select-none text-[10rem] font-extrabold leading-none md:text-[16rem]"
            aria-hidden
          >
            {service.no}
          </span>
          <div className="container-g relative">
            <Reveal>
              <div className="flex items-stretch gap-6 md:gap-10">
                <span className="w-1 shrink-0 bg-guru" aria-hidden />
                <p className="max-w-4xl text-xl font-semibold leading-snug tracking-tight sm:text-2xl md:text-4xl">
                  {service.outro}
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
              eyebrow="Yayında"
              title="Canlı web *projelerimiz*"
              sub="Tasarlayıp yayına aldığımız sitelerden bazıları — hepsi şu anda yayında, hepsi dönüşüm odaklı."
            />
            <StaggerGroup className="mt-12 grid gap-4 sm:grid-cols-2 md:gap-5 lg:grid-cols-3">
              {webProjects.map((project) => (
                <StaggerItem key={project.url} className="h-full">
                  <a
                    href={`https://${project.url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex h-full flex-col justify-between gap-8 rounded-3xl border border-ink/8 bg-white p-6 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-guru/40 hover:shadow-soft md:p-7"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-smoke">
                          Canlı site
                        </span>
                        <h3 className="mt-2 text-xl font-semibold tracking-tight">
                          {project.name}
                        </h3>
                      </div>
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-ink/10 transition-all duration-300 group-hover:border-guru group-hover:bg-guru">
                        <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                      </span>
                    </div>
                    <span className="inline-flex items-center gap-2 text-sm font-medium text-smoke transition-colors duration-300 group-hover:text-guru-deep">
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

      {/* Önceki / sonraki hizmet */}
      <section className="border-t border-ink/8 py-16 md:py-20">
        <div className="container-g grid gap-4 sm:grid-cols-2 md:gap-5">
          <Reveal className="h-full">
            <Link
              href={`/hizmetler/${prev.slug}`}
              className="group flex h-full items-center gap-5 rounded-3xl border border-ink/8 bg-white p-6 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-guru/40 hover:shadow-soft md:p-7"
            >
              <span className="flex size-11 shrink-0 items-center justify-center rounded-full border border-ink/10 transition-all duration-300 group-hover:border-guru group-hover:bg-guru">
                <ArrowLeft className="size-5 transition-transform duration-300 group-hover:-translate-x-0.5" />
              </span>
              <span className="min-w-0">
                <span className="block text-xs font-semibold uppercase tracking-[0.16em] text-smoke">
                  Önceki Hizmet
                </span>
                <span className="mt-1 block truncate text-lg font-semibold tracking-tight">
                  {prev.title}
                </span>
              </span>
            </Link>
          </Reveal>
          <Reveal delay={0.08} className="h-full">
            <Link
              href={`/hizmetler/${next.slug}`}
              className="group flex h-full flex-row-reverse items-center gap-5 rounded-3xl border border-ink/8 bg-white p-6 text-right shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-guru/40 hover:shadow-soft md:p-7"
            >
              <span className="flex size-11 shrink-0 items-center justify-center rounded-full border border-ink/10 transition-all duration-300 group-hover:border-guru group-hover:bg-guru">
                <ArrowRight className="size-5 transition-transform duration-300 group-hover:translate-x-0.5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-xs font-semibold uppercase tracking-[0.16em] text-smoke">
                  Sonraki Hizmet
                </span>
                <span className="mt-1 block truncate text-lg font-semibold tracking-tight">
                  {next.title}
                </span>
              </span>
            </Link>
          </Reveal>
        </div>
      </section>

      <CTASection />
    </>
  );
}
