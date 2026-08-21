import type { Metadata } from "next";
import { Award, BadgeCheck } from "lucide-react";
import { PageHero } from "@/components/layout/PageHero";
import { CTASection } from "@/components/sections/CTASection";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/ui/Reveal";
import { TiltCard } from "@/components/ui/TiltCard";
import { Scramble } from "@/components/fx/Scramble";
import { Sparkles } from "@/components/fx/Sparkles";
import { LiquidImage } from "@/components/fx/LiquidImage";
import { Spotlight } from "@/components/fx/Spotlight";
import { GlowBorder } from "@/components/fx/GlowBorder";
import { RollingCounter } from "@/components/fx/RollingCounter";
import { SectionDivider } from "@/components/v2/SectionDivider";
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

/** Manifesto paragrafında yeşile boyanacak ifadeler (veri metniyle birebir). */
const MANIFESTO_ACCENTS = [
  "dönüştürücü bir etki",
  "değer üretme süreci",
  "gerçek bir bağ",
];

/**
 * Düz metni MANIFESTO_ACCENTS ifadelerine göre bölüp vurgulu parçaları
 * text-guru span'larına sarar. Saf string işlemi — SSR/istemci deterministik.
 */
function ManifestoText({ text }: { text: string }) {
  const parts = text.split(new RegExp(`(${MANIFESTO_ACCENTS.join("|")})`, "g"));
  return (
    <>
      {parts.map((part, i) =>
        MANIFESTO_ACCENTS.includes(part) ? (
          <span key={i} className="text-guru">
            {part}
          </span>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

export default function HakkimizdaPage() {
  return (
    <>
      <PageHero
        // PageHeroV2 eyebrow'u yalnızca {eyebrow} olarak render eder; ReactNode
        // runtime'da güvenlidir, prop tipi string olduğu için cast gerekir.
        eyebrow={(<Scramble text="Biz Kimiz" duration={1.1} />) as unknown as string}
        title="Ortak bir hayalin *gerçeğe* dönüşme süreci"
        sub="Bizim için her marka bir yol arkadaşı, her proje ortak bir hayalin gerçeğe dönüşme sürecidir."
      >
        {/* Başlık çevresinde düşük yoğunluklu ışıltı — container'ı kaplar */}
        <Sparkles density={9} />
      </PageHero>

      {/* Hikâye — manifesto + 2 sütun küçük metin + liquid görsel */}
      <section className="pb-20 pt-16 md:pb-28 md:pt-24">
        <div className="container-g">
          <Reveal>
            <p className="max-w-5xl text-2xl font-semibold leading-[1.3] tracking-tight text-paper md:text-3xl md:leading-[1.25] lg:text-4xl">
              <ManifestoText text={aboutParagraphs[0]} />
            </p>
          </Reveal>

          <div className="mt-14 grid items-center gap-12 md:mt-20 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
            <Reveal delay={0.08}>
              <div className="gap-10 sm:columns-2">
                {aboutParagraphs.slice(1).map((p, i) => (
                  <p
                    key={i}
                    className="mb-5 break-inside-avoid text-sm leading-relaxed text-paper/55"
                  >
                    {p}
                  </p>
                ))}
              </div>
            </Reveal>
            <Reveal delay={0.14}>
              <TiltCard className="group rounded-3xl">
                <LiquidImage
                  src="/work/unlock-cover.webp"
                  alt="Guru Dijital: Unlock the next level"
                  sizes="(min-width: 1024px) 45vw, 100vw"
                  className="aspect-[4/5] rounded-3xl border border-paper/10"
                />
              </TiltCard>
            </Reveal>
          </div>
        </div>
      </section>

      <SectionDivider from="coal" to="ink" />

      {/* Sayılarla Guru */}
      <section className="relative overflow-hidden bg-ink py-20 text-paper md:py-28">
        <div className="grain-blob -left-32 -top-24 h-96 w-96 opacity-30" aria-hidden />
        <div className="container-g relative">
          <SectionHeading
            dark
            eyebrow="Sayılarla Guru"
            title="Rakamlar da bizimle *aynı fikirde*"
          />
          <StaggerGroup className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 md:mt-16">
            {stats.map((s) => (
              <StaggerItem key={s.label} className="h-full">
                <Spotlight className="h-full overflow-hidden rounded-3xl border border-paper/10 bg-carbon">
                  <div className="p-8">
                    <span className="inline-block size-2 bg-guru" aria-hidden />
                    <p className="mt-5 text-4xl font-extrabold tracking-tight md:text-5xl">
                      <RollingCounter value={s.value} suffix={s.suffix} />
                    </p>
                    <p className="mt-2 text-sm font-medium text-paper/60">{s.label}</p>
                  </div>
                </Spotlight>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </section>

      <SectionDivider from="ink" to="coal" flip />

      {/* Değerler */}
      <section className="py-20 md:py-28">
        <div className="container-g">
          <SectionHeading
            dark
            eyebrow="Değerlerimiz"
            title="Bizi biz yapan *ilkeler*"
            sub="İlk günkü heyecan, üretme tutkusu ve işe duyduğumuz saygı; her projede aynı dört ilkeyle çalışıyoruz."
          />
          <StaggerGroup className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 md:mt-16">
            {values.map((v, i) => (
              <StaggerItem key={v.title} className="h-full">
                <GlowBorder className="h-full" radius="1.5rem">
                  <div className="flex h-full flex-col p-7">
                    <span
                      aria-hidden
                      className="text-5xl font-extrabold leading-none tracking-tight text-transparent [-webkit-text-stroke:1.5px_rgb(16_216_108/0.55)] md:text-6xl"
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h3 className="mt-5 text-lg font-bold tracking-tight text-paper">
                      {v.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-paper/60">{v.desc}</p>
                  </div>
                </GlowBorder>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </section>

      {/* Ödüller */}
      <section className="pb-20 md:pb-28">
        <div className="container-g">
          <SectionHeading
            dark
            eyebrow="Ödüller & Tanınırlık"
            title="Google'ın da *takdir* ettiği işler"
          />
          <StaggerGroup className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-2 md:mt-16">
            {awards.map((a, i) => (
              <StaggerItem key={a.title} className="h-full">
                <div className="relative flex h-full flex-col overflow-hidden rounded-3xl border border-guru/30 bg-carbon p-8 shadow-[0_0_50px_rgba(16,216,108,0.07)] md:p-10">
                  <div className="absolute inset-x-0 top-0 h-1 bg-guru" aria-hidden />
                  <div className="flex items-center justify-between gap-4">
                    <span className="flex size-12 items-center justify-center rounded-2xl bg-guru/12 text-guru">
                      {i === 0 ? (
                        <BadgeCheck className="size-6" strokeWidth={2} />
                      ) : (
                        <Award className="size-6" strokeWidth={2} />
                      )}
                    </span>
                    <span className="rounded-full border border-guru/30 px-3.5 py-1 text-xs font-bold tracking-[0.12em] text-guru">
                      {a.year}
                    </span>
                  </div>
                  <h3 className="mt-6 text-xl font-bold tracking-tight text-paper md:text-2xl">
                    {a.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-paper/60 md:text-[15px]">
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
