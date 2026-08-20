import type { Metadata } from "next";
import Image from "next/image";
import { Award, BadgeCheck } from "lucide-react";
import { PageHero } from "@/components/layout/PageHero";
import { CTASection } from "@/components/sections/CTASection";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/ui/Reveal";
import { Counter } from "@/components/ui/Counter";
import { TiltCard } from "@/components/ui/TiltCard";
import { aboutParagraphs, awards, references, services, values } from "@/lib/data";

export const metadata: Metadata = {
  title: "Hakkımızda",
  description:
    "Guru Dijital'i tanıyın: hikâyemiz, değerlerimiz, Google Partner tanınırlığımız ve markalarla kurduğumuz yol arkadaşlığı.",
};

const stats = [
  { value: references.length, suffix: "+", label: "Mutlu Marka" },
  { value: services.length, suffix: "", label: "Uzmanlık Alanı" },
  { value: awards.length, suffix: "", label: "Google Tanınırlığı" },
  { value: 7, suffix: "/24", label: "Yol Arkadaşlığı" },
];

export default function HakkimizdaPage() {
  return (
    <>
      <PageHero
        eyebrow="Biz Kimiz"
        title="Ortak bir hayalin *gerçeğe* dönüşme süreci"
        sub="Bizim için her marka bir yol arkadaşı, her proje ortak bir hayalin gerçeğe dönüşme sürecidir."
      />

      {/* Hikâye */}
      <section className="pb-20 md:pb-28">
        <div className="container-g grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
          <div>
            {aboutParagraphs.map((p, i) => (
              <Reveal key={i} delay={i * 0.06} className={i > 0 ? "mt-7" : undefined}>
                <p
                  className={
                    i === 0
                      ? "text-xl font-medium leading-relaxed tracking-tight text-ink md:text-2xl"
                      : "text-base leading-relaxed text-smoke md:text-lg"
                  }
                >
                  {p}
                </p>
              </Reveal>
            ))}
          </div>
          <div className="lg:pt-2">
            <Reveal delay={0.1} className="lg:sticky lg:top-28">
              <TiltCard className="group rounded-3xl">
                <div className="relative aspect-[4/5] overflow-hidden rounded-3xl border border-ink/8 shadow-card">
                  <Image
                    src="/work/unlock-cover.webp"
                    alt="Guru Dijital — unlock the next level"
                    fill
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                    sizes="(min-width: 1024px) 40vw, 100vw"
                  />
                </div>
              </TiltCard>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Sayılarla Guru */}
      <section className="relative overflow-hidden bg-coal py-20 text-paper md:py-28">
        <div className="grain-blob -left-32 -top-24 h-96 w-96 opacity-30" aria-hidden />
        <div className="container-g relative">
          <SectionHeading
            dark
            eyebrow="Sayılarla Guru"
            title="Rakamlar da bizimle *aynı fikirde*"
          />
          <StaggerGroup className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 md:mt-16">
            {stats.map((s) => (
              <StaggerItem key={s.label}>
                <div className="rounded-3xl border border-paper/10 bg-carbon p-8">
                  <span className="inline-block size-2 bg-guru" aria-hidden />
                  <p className="mt-5 text-4xl font-extrabold tracking-tight md:text-5xl">
                    <Counter value={s.value} suffix={s.suffix} />
                  </p>
                  <p className="mt-2 text-sm font-medium text-paper/60">{s.label}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </section>

      {/* Değerler */}
      <section className="py-20 md:py-28">
        <div className="container-g">
          <SectionHeading
            eyebrow="Değerlerimiz"
            title="Bizi biz yapan *ilkeler*"
            sub="İlk günkü heyecan, üretme tutkusu ve işe duyduğumuz saygı; her projede aynı dört ilkeyle çalışıyoruz."
          />
          <StaggerGroup className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 md:mt-16">
            {values.map((v, i) => (
              <StaggerItem key={v.title} className="h-full">
                <div className="flex h-full flex-col rounded-3xl border border-ink/8 bg-white p-7 shadow-card">
                  <span className="text-sm font-bold tracking-[0.14em] text-guru-deep">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-4 text-lg font-bold tracking-tight text-ink">{v.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-smoke">{v.desc}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </section>

      {/* Ödüller */}
      <section className="pb-20 md:pb-28">
        <div className="container-g">
          <SectionHeading
            eyebrow="Ödüller & Tanınırlık"
            title="Google'ın da *takdir* ettiği işler"
          />
          <StaggerGroup className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-2 md:mt-16">
            {awards.map((a, i) => (
              <StaggerItem key={a.title} className="h-full">
                <div className="relative flex h-full flex-col overflow-hidden rounded-3xl border border-guru/30 bg-white p-8 shadow-card md:p-10">
                  <div className="absolute inset-x-0 top-0 h-1 bg-guru" aria-hidden />
                  <div className="flex items-center justify-between gap-4">
                    <span className="flex size-12 items-center justify-center rounded-2xl bg-guru/12 text-guru-deep">
                      {i === 0 ? (
                        <BadgeCheck className="size-6" strokeWidth={2} />
                      ) : (
                        <Award className="size-6" strokeWidth={2} />
                      )}
                    </span>
                    <span className="rounded-full border border-guru/30 px-3.5 py-1 text-xs font-bold tracking-[0.12em] text-guru-deep">
                      {a.year}
                    </span>
                  </div>
                  <h3 className="mt-6 text-xl font-bold tracking-tight text-ink md:text-2xl">
                    {a.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-smoke md:text-[15px]">
                    {a.desc}
                  </p>
                </div>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </section>

      <CTASection />
    </>
  );
}
