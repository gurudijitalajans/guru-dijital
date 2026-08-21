import type { Metadata } from "next";
import { Award, BadgeCheck, type LucideIcon } from "lucide-react";
import { PageHero } from "@/components/layout/PageHero";
import { CTASection } from "@/components/sections/CTASection";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/ui/Reveal";
import { Scramble } from "@/components/fx/Scramble";
import { Sparkles } from "@/components/fx/Sparkles";
import { LiquidImage } from "@/components/fx/LiquidImage";
import { GlowBorder } from "@/components/fx/GlowBorder";
import { RollingCounter } from "@/components/fx/RollingCounter";
import { SectionDivider } from "@/components/v2/SectionDivider";
import { awards, products, references, services, values } from "@/lib/data";

export const metadata: Metadata = {
  title: "Hakkımızda",
  description:
    "Guru Dijital'i tanıyın: Google Partner ve Google Ads Impact Awards tanınırlığıyla markaların yol arkadaşıyız.",
};

/* Ödül kartları: büyük görsel + yalnız kısa başlık ve tek cümle */
const awardCards: {
  image: string;
  alt: string;
  title: string;
  desc: string;
  icon: LucideIcon;
}[] = [
  {
    image: "/work/odul-impact.webp",
    alt: "Google Ads Impact Awards 2025 aday belgesi",
    title: "Google Ads Impact Awards 2025 Adayı",
    desc: "Data Innovation kategorisinde Google tarafından aday gösterildik.",
    icon: Award,
  },
  {
    image: "/work/odul-partner.webp",
    alt: "Google Partner 2025 rozeti",
    title: "2025 Google Partner",
    desc: "Kampanyalarımız Google'ın performans standartlarını karşılıyor.",
    icon: BadgeCheck,
  },
];

/* Tek sıra istatistik bandı */
const stats = [
  { value: references.length, suffix: "+", label: "Marka" },
  { value: services.length, suffix: "", label: "Uzmanlık" },
  { value: awards.length, suffix: "", label: "Google Tanınırlığı" },
  { value: products.length, suffix: "", label: "Ürün" },
];

/* Manifesto: aboutParagraphs'tan damıtılmış tek cümlelik özler */
const manifesto: { pre: string; accent: string; post: string; indent?: string }[] = [
  {
    pre: "Yaratıcılığın markalar için ",
    accent: "dönüştürücü bir etki",
    post: " yarattığına inanıyoruz.",
  },
  {
    pre: "İşimizi hizmet olarak değil; ",
    accent: "değer üretme süreci",
    post: " olarak görüyoruz.",
    indent: "md:pl-[10%]",
  },
  {
    pre: "Bizim için her marka bir ",
    accent: "yol arkadaşı",
    post: ", her proje ortak bir hayaldir.",
    indent: "md:pl-[20%]",
  },
];

export default function HakkimizdaPage() {
  return (
    <>
      <PageHero
        // PageHeroV2 eyebrow'u yalnızca {eyebrow} olarak render eder; ReactNode
        // runtime'da güvenlidir, prop tipi string olduğu için cast gerekir.
        eyebrow={(<Scramble text="Biz Kimiz" duration={1.1} />) as unknown as string}
        title="Markaların *yol arkadaşıyız*"
        sub="Strateji, tasarım ve teknoloji; tek çatıda."
        aside={
          // Aside lg altında render edilmez (hidden lg:block); priority/preload
          // mobilde gereksiz indirme yaratacağı için bilinçli olarak yok.
          <LiquidImage
            src="/work/unlock-cover.webp"
            alt="Guru Dijital marka kapak görseli"
            sizes="380px"
            className="aspect-[1600/1187] w-[380px] rounded-2xl border border-paper/10"
          />
        }
      >
        {/* Başlık çevresinde düşük yoğunluklu ışıltı — container'ı kaplar */}
        <Sparkles density={9} />
      </PageHero>

      {/* Manifesto bandı: 3 kısa cümle, büyük tipografi */}
      <section className="py-20 md:py-28">
        <div className="container-g space-y-9 md:space-y-12">
          {manifesto.map((line, i) => (
            <Reveal key={line.accent} delay={i * 0.06} className={line.indent}>
              <p className="max-w-4xl text-2xl font-semibold leading-[1.25] tracking-tight text-paper sm:text-3xl md:text-4xl lg:text-5xl">
                {line.pre}
                <span className="text-guru">{line.accent}</span>
                {line.post}
              </p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Ödüller: görsel ağırlıklı yıldız bölüm */}
      <section className="pb-20 md:pb-28">
        <div className="container-g">
          <SectionHeading
            dark
            eyebrow="Ödüller ve Tanınırlık"
            title="Google'ın *takdir* ettiği işler"
          />
          <StaggerGroup className="mt-12 grid grid-cols-1 gap-6 md:mt-16 lg:grid-cols-2">
            {awardCards.map((card) => (
              <StaggerItem key={card.title} className="h-full">
                <GlowBorder className="h-full" radius="1.5rem" always={false}>
                  <div className="flex h-full flex-col overflow-hidden rounded-[calc(1.5rem-1px)]">
                    <LiquidImage
                      src={card.image}
                      alt={card.alt}
                      sizes="(min-width: 1024px) 50vw, 100vw"
                      className="aspect-[1600/1131] w-full"
                    />
                    <div className="flex items-start gap-4 p-6 md:p-7">
                      <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-guru/12 text-guru">
                        <card.icon className="size-5" strokeWidth={2} />
                      </span>
                      <div>
                        <h3 className="text-lg font-bold tracking-tight text-paper md:text-xl">
                          {card.title}
                        </h3>
                        <p className="mt-1.5 text-sm leading-relaxed text-paper/55">
                          {card.desc}
                        </p>
                      </div>
                    </div>
                  </div>
                </GlowBorder>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </section>

      <SectionDivider from="coal" to="ink" />

      {/* Sayılarla Guru: tek sıra kompakt bant */}
      <section className="bg-ink py-14 text-paper md:py-16">
        <div className="container-g">
          <p className="mb-10 inline-flex items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.18em] text-paper/60">
            <span className="inline-block size-2 bg-guru" aria-hidden />
            Sayılarla Guru
          </p>
          <StaggerGroup className="grid grid-cols-2 gap-y-10 lg:grid-cols-4">
            {stats.map((s, i) => (
              <StaggerItem key={s.label}>
                <div
                  className={
                    i === 0
                      ? "px-2 text-center"
                      : "px-2 text-center lg:border-l lg:border-paper/10"
                  }
                >
                  <p className="text-4xl font-extrabold tracking-tight md:text-5xl">
                    <RollingCounter value={s.value} suffix={s.suffix} />
                  </p>
                  <p className="mt-2 text-sm font-medium text-paper/60">{s.label}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </section>

      <SectionDivider from="ink" to="coal" flip />

      {/* Değerler: 2x2 minimal liste */}
      <section className="py-20 md:py-28">
        <div className="container-g">
          <SectionHeading dark eyebrow="Değerlerimiz" title="Bizi biz yapan *ilkeler*" />
          <StaggerGroup className="mt-12 grid grid-cols-1 gap-x-14 gap-y-8 sm:grid-cols-2 md:mt-16">
            {values.map((v) => (
              <StaggerItem key={v.title}>
                <div className="flex gap-4 border-t border-paper/10 pt-6">
                  <span className="mt-1.5 inline-block size-2 shrink-0 bg-guru" aria-hidden />
                  <div>
                    <h3 className="text-base font-bold tracking-tight text-paper">
                      {v.title}
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-paper/55">{v.desc}</p>
                  </div>
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
