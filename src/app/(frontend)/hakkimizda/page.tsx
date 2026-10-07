import Image from "next/image";
import { Award, BadgeCheck, ChartLine, Gem, Handshake, Lightbulb, type LucideIcon } from "lucide-react";
import { Btn } from "@/components/site/Btn";
import { ClosingCta } from "@/components/site/ClosingCta";
import { PageIntro } from "@/components/site/PageIntro";
import { SectionHead } from "@/components/site/SectionHead";
import { cardCls, cardTextCls, cardTitleCls, iconBoxCls, sectionY } from "@/components/site/styles";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/ui/Reveal";
import { LinkedinIcon } from "@/components/ui/icons";
import { awards, references, team, values } from "@/lib/data";
import { getProducts, getServices } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";
import { cn } from "@/lib/utils";

export const metadata = pageMetadata({
  title: "Hakkımızda",
  description:
    "Guru Dijital'i tanıyın: Google Partner ve Google Ads Impact Awards adayı ekibimizle markaların yol arkadaşıyız; strateji, tasarım ve teknoloji tek çatıda.",
  path: "/hakkimizda",
});

/** Ad Soyad → "AS" */
const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w.charAt(0).toLocaleUpperCase("tr-TR"))
    .join("");

/* İlkeler: data.ts sırasıyla eşleşen ikonlar */
const valueIcons: LucideIcon[] = [Gem, Lightbulb, ChartLine, Handshake];

/* Google tanınırlığı: data.ts'teki ödül kayıtlarına görsel ve kısa etiket */
const awardMeta: Record<string, { image: string; alt: string; badge: string; icon: LucideIcon }> = {
  "Google Partner": {
    image: "/work/odul-partner.webp",
    alt: "2025 Google Partner rozeti",
    badge: "Partner Rozeti",
    icon: BadgeCheck,
  },
  "Google Ads Impact Awards": {
    image: "/work/odul-impact.webp",
    alt: "Google Ads Impact Awards 2025 Data Innovation kategorisi aday belgesi",
    badge: "Data Innovation Adayı",
    icon: Award,
  },
};

/* Fotoğraf gelene kadar marka mavisi tonlarında baş harf avatarı */
const avatarTones = [
  "from-[#e9f7ff] to-[#9fd6fb]",
  "from-[#eef3fa] to-[#94b8ec]",
  "from-[#e3effd] to-[#6b9de0]",
  "from-[#e2f5ff] to-[#6dc1f8]",
  "from-[#edf2fb] to-[#7fa6e3]",
  "from-[#e6f1ff] to-[#5d9cec]",
];

export default async function HakkimizdaPage() {
  /* Sayılar: yalnız gerçek adetler (referanslar data.ts, hizmet ve ürünler panel) */
  const [services, products] = await Promise.all([getServices(), getProducts()]);
  const stats = [
    { value: references.length, label: "Referans Marka" },
    { value: services.length, label: "Uzmanlık Alanı" },
    { value: products.length, label: "Yazılım Ürünü" },
  ];
  return (
    <>
      <PageIntro
        eyebrow="Biz Kimiz"
        title="Markaların yol arkadaşıyız"
        lead="Strateji, tasarım ve teknolojiyi tek çatıda buluşturuyor; markanızı dijitalde sizinle birlikte büyütüyoruz."
      >
        <Btn href="/iletisim" variant="primary" size="lg" arrow>
          Tanışalım
        </Btn>
        <Btn href="#ekip" variant="light" size="lg">
          Ekibimizi Tanıyın
        </Btn>
      </PageIntro>

      {/* Hikaye + ilkeler */}
      <section className="pb-16 pt-4 md:pb-[72px] md:pt-8">
        <div className="container-g grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start lg:gap-16">
          <Reveal>
            <SectionHead title="Hikayemiz" />
            <div className="mt-5 max-w-xl space-y-4 text-[16px] leading-relaxed text-body md:text-[16.5px]">
              <p>
                Yaratıcılığın markalar için dönüştürücü bir etki yarattığına inanıyoruz. Sosyal medyadan web
                tasarıma, içerikten dijital pazarlamaya kadar her işi aynı hedefe bakan tek bir ekiple
                yürütüyoruz.
              </p>
              <p>
                Sağlıktan turizme, perakendeden inşaata farklı sektörlerden markalarla çalışıyor; ajans
                deneyimimizi işletmelerin günlük işini kolaylaştıran yazılımlara da taşıyoruz.
              </p>
            </div>
          </Reveal>

          <div>
            <p className="mb-4 inline-flex items-center gap-2 text-[13px] font-medium text-brand">
              <span className="size-1.5 rounded-full bg-brand" aria-hidden />
              İlkelerimiz
            </p>
            <StaggerGroup className="grid gap-3 sm:grid-cols-2 sm:gap-4">
              {values.map((v, i) => {
                const Icon = valueIcons[i % valueIcons.length];
                return (
                  <StaggerItem key={v.title} className="h-full">
                    <article className={cn(cardCls, "flex h-full gap-4 p-5 sm:block md:p-6")}>
                      <span className={cn(iconBoxCls, "shrink-0")} aria-hidden>
                        <Icon className="size-5" strokeWidth={1.8} />
                      </span>
                      <div className="min-w-0">
                        <h3 className={cn(cardTitleCls, "sm:mt-4")}>{v.title}</h3>
                        <p className={cn(cardTextCls, "mt-1.5")}>{v.desc}</p>
                      </div>
                    </article>
                  </StaggerItem>
                );
              })}
            </StaggerGroup>
          </div>
        </div>
      </section>

      {/* Google tanınırlığı */}
      <section className={cn("bg-soft", sectionY)}>
        <div className="container-g">
          <Reveal>
            <SectionHead
              center
              title="Ödüller ve Tanınırlık"
              lead="2025'te Google Partner olduk; veri odaklı çalışmalarımızla Google Ads Impact Awards'ta aday gösterildik."
            />
          </Reveal>
          <StaggerGroup className="mx-auto mt-10 grid max-w-5xl gap-4 md:grid-cols-2 md:gap-5">
            {awards.map((a) => {
              const meta = awardMeta[a.title];
              const Icon = meta?.icon ?? Award;
              return (
                <StaggerItem key={a.title} className="h-full">
                  <article
                    className={cn(
                      cardCls,
                      "flex h-full flex-col overflow-hidden shadow-[0_0_0_1px_rgb(42_106_202/0.22),0_30px_60px_-42px_rgb(18_65_155/0.55)]"
                    )}
                  >
                    {meta && (
                      <Image
                        src={meta.image}
                        alt={meta.alt}
                        width={1600}
                        height={1131}
                        sizes="(min-width: 1072px) 510px, (min-width: 768px) 50vw, 100vw"
                        className="aspect-[1600/1131] h-auto w-full bg-soft object-cover"
                      />
                    )}
                    <div className="flex flex-1 flex-col p-5 md:p-7">
                      <p className="inline-flex items-center gap-2 text-[13px] font-medium text-brand">
                        <Icon className="size-4 shrink-0" strokeWidth={2} aria-hidden />
                        {a.year} · {meta?.badge}
                      </p>
                      <h3 className={cn(cardTitleCls, "mt-2 text-[20px] md:text-[22px]")}>{a.title}</h3>
                      <p className={cn(cardTextCls, "mt-2")}>{a.desc}</p>
                    </div>
                  </article>
                </StaggerItem>
              );
            })}
          </StaggerGroup>
        </div>
      </section>

      {/* Ekip: ÖRNEK kartlar. TODO(client): fotoğraf, isim, unvan ve LinkedIn (data.ts > team) */}
      <section id="ekip" className={sectionY}>
        <div className="container-g">
          <Reveal>
            <SectionHead
              title="Ekibimiz"
              lead="Strateji, tasarım, içerik ve performans uzmanlarından oluşan, aynı hedefe odaklı bir ekip."
            />
          </Reveal>
          <StaggerGroup className="mt-10 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:gap-5">
            {team.map((m, i) => (
              <StaggerItem key={`${m.role}-${i}`} className="h-full">
                <article className={cn(cardCls, "flex h-full flex-col overflow-hidden")}>
                  <div
                    className={cn(
                      "relative grid aspect-[4/3] place-items-center bg-gradient-to-br md:aspect-[16/10]",
                      avatarTones[i % avatarTones.length]
                    )}
                  >
                    <span
                      aria-hidden
                      className="grid size-16 place-items-center rounded-full bg-white/75 text-[22px] font-light tracking-[-0.02em] text-navy shadow-[0_10px_30px_-14px_rgb(1_20_65/0.5)] sm:size-20 sm:text-[26px]"
                    >
                      {initials(m.name)}
                    </span>
                    {m.linkedin ? (
                      <a
                        href={m.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`${m.name}, ${m.role}: LinkedIn profili`}
                        className="absolute right-2.5 top-2.5 grid size-11 place-items-center rounded-xl bg-white text-heading shadow-[0_0_0_1px_rgb(1_20_65/0.08)] transition-colors hover:text-brand"
                      >
                        <LinkedinIcon className="size-4" />
                      </a>
                    ) : (
                      <span
                        aria-hidden
                        className="absolute right-2.5 top-2.5 grid size-11 place-items-center rounded-xl bg-white/60 text-heading/40"
                      >
                        <LinkedinIcon className="size-4" />
                      </span>
                    )}
                  </div>
                  <div className="p-4 md:p-5">
                    <h3 className="text-[15.5px] font-medium leading-snug text-heading md:text-[16.5px]">{m.name}</h3>
                    <p className="mt-0.5 text-[13px] leading-snug text-muted md:text-[14px]">{m.role}</p>
                  </div>
                </article>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </section>

      {/* Sayılar */}
      <section className={cn("bg-soft", sectionY)}>
        <div className="container-g">
          <Reveal>
            <SectionHead center title="Sayılarla Guru" />
          </Reveal>
          <Reveal className="mx-auto mt-10 max-w-4xl" delay={0.05}>
            {/* dl > div > (dt, dd): görselde sayı üstte (flex-col-reverse) */}
            <dl className="grid grid-cols-3 gap-3 sm:gap-5">
              {stats.map((s) => (
                <div
                  key={s.label}
                  className={cn(cardCls, "flex flex-col-reverse items-center px-2 py-7 text-center sm:py-10")}
                >
                  <dt className="mt-2 text-[13px] leading-snug text-muted sm:text-[15px]">{s.label}</dt>
                  <dd className="text-[40px] font-light leading-none tracking-[-0.04em] text-heading sm:text-[56px]">
                    {s.value}
                  </dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </section>

      {/* Kapanış */}
      <ClosingCta
        title="Markanızı Birlikte Büyütelim"
        lead="Hedeflerinizi dinleyelim; size uygun planı birlikte çıkaralım. İlk görüşme ücretsiz."
        primary={{ href: "/iletisim", label: "Tanışalım" }}
      />
    </>
  );
}
