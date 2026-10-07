import type { Metadata } from "next";
import Image from "next/image";
import { Btn } from "@/components/site/Btn";
import { ClosingCta } from "@/components/site/ClosingCta";
import { PageIntro } from "@/components/site/PageIntro";
import { SectionHead } from "@/components/site/SectionHead";
import { cardCls, cardTextCls, cardTitleCls, iconBoxCls, sectionY } from "@/components/site/styles";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/ui/Reveal";
import { LinkedinIcon } from "@/components/ui/icons";
import { getAbout, getProducts, getReferences, getServices, getTeam } from "@/lib/content";
import { iconFor } from "@/lib/icons";
import { pageMetadata } from "@/lib/seo";
import { cn } from "@/lib/utils";

/* Metinler panelden (İçerik > Hakkımızda) */
export async function generateMetadata(): Promise<Metadata> {
  const { seo } = await getAbout();
  return pageMetadata({ title: seo.title, description: seo.description, path: "/hakkimizda" });
}

/** Ad Soyad → "AS" */
const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w.charAt(0).toLocaleUpperCase("tr-TR"))
    .join("");

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
  /* Sayılar yalnız gerçek adetlerden; ekip, referans, hizmet ve ürünler panelden */
  const [about, services, products, references, team] = await Promise.all([
    getAbout(),
    getServices(),
    getProducts(),
    getReferences(),
    getTeam(),
  ]);
  const { intro, story, awards, closing } = about;
  const stats = [
    { value: references.length, label: about.stats.referencesLabel },
    { value: services.length, label: about.stats.servicesLabel },
    { value: products.length, label: about.stats.productsLabel },
  ];
  return (
    <>
      <PageIntro eyebrow={intro.eyebrow || undefined} title={intro.title} lead={intro.lead || undefined}>
        <Btn href={intro.primaryHref} variant="primary" size="lg" arrow>
          {intro.primaryLabel}
        </Btn>
        {intro.secondaryLabel && intro.secondaryHref && (
          <Btn href={intro.secondaryHref} variant="light" size="lg">
            {intro.secondaryLabel}
          </Btn>
        )}
      </PageIntro>

      {/* Hikaye + ilkeler */}
      <section className="pb-16 pt-4 md:pb-[72px] md:pt-8">
        <div className="container-g grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start lg:gap-16">
          <Reveal>
            <SectionHead title={story.title} />
            <div className="mt-5 max-w-xl space-y-4 text-[16px] leading-relaxed text-body md:text-[16.5px]">
              {story.paragraphs.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
          </Reveal>

          <div>
            <p className="mb-4 inline-flex items-center gap-2 text-[13px] font-medium text-brand">
              <span className="size-1.5 rounded-full bg-brand" aria-hidden />
              {story.valuesLabel}
            </p>
            <StaggerGroup className="grid gap-3 sm:grid-cols-2 sm:gap-4">
              {story.values.map((v) => {
                const Icon = iconFor(v.icon);
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

      {/* Ödüller ve tanınırlık */}
      {awards.show && awards.items.length > 0 && (
      <section className={cn("bg-soft", sectionY)}>
        <div className="container-g">
          <Reveal>
            <SectionHead
              center
              title={awards.title}
              lead={awards.lead || undefined}
            />
          </Reveal>
          <StaggerGroup className="mx-auto mt-10 grid max-w-5xl gap-4 md:grid-cols-2 md:gap-5">
            {awards.items.map((a) => {
              const Icon = iconFor(a.icon);
              return (
                <StaggerItem key={a.title} className="h-full">
                  <article
                    className={cn(
                      cardCls,
                      "flex h-full flex-col overflow-hidden shadow-[0_0_0_1px_rgb(42_106_202/0.22),0_30px_60px_-42px_rgb(18_65_155/0.55)]"
                    )}
                  >
                    {a.image && (
                      <Image
                        src={a.image.src}
                        alt={a.image.alt}
                        width={a.image.w}
                        height={a.image.h}
                        sizes="(min-width: 1072px) 510px, (min-width: 768px) 50vw, 100vw"
                        className="aspect-[1600/1131] h-auto w-full bg-soft object-cover"
                      />
                    )}
                    <div className="flex flex-1 flex-col p-5 md:p-7">
                      <p className="inline-flex items-center gap-2 text-[13px] font-medium text-brand">
                        <Icon className="size-4 shrink-0" strokeWidth={2} aria-hidden />
                        {[a.year, a.badge].filter(Boolean).join(" · ")}
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
      )}

      {/* Ekip: ÖRNEK kartlar. TODO(client): fotoğraf, isim, unvan ve LinkedIn (data.ts > team) */}
      {about.team.show && team.length > 0 && (
      <section id="ekip" className={sectionY}>
        <div className="container-g">
          <Reveal>
            <SectionHead title={about.team.title} lead={about.team.lead || undefined} />
          </Reveal>
          <StaggerGroup className="mt-10 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:gap-5">
            {team.map((m, i) => (
              <StaggerItem key={`${m.role}-${i}`} className="h-full">
                <article className={cn(cardCls, "flex h-full flex-col overflow-hidden")}>
                  <div
                    className={cn(
                      "relative grid aspect-[4/3] place-items-center bg-gradient-to-br md:aspect-[16/10]",
                      !m.photo && avatarTones[i % avatarTones.length]
                    )}
                  >
                    {m.photo ? (
                      <Image
                        src={m.photo.src}
                        alt={m.photo.alt}
                        fill
                        sizes="(min-width: 768px) 380px, 45vw"
                        className="object-cover"
                        style={{ objectPosition: m.photo.position ?? "50% 25%" }}
                      />
                    ) : (
                      <span
                        aria-hidden
                        className="grid size-16 place-items-center rounded-full bg-white/75 text-[22px] font-light tracking-[-0.02em] text-navy shadow-[0_10px_30px_-14px_rgb(1_20_65/0.5)] sm:size-20 sm:text-[26px]"
                      >
                        {initials(m.name)}
                      </span>
                    )}
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
      )}

      {/* Sayılar */}
      {about.stats.show && (
      <section className={cn("bg-soft", sectionY)}>
        <div className="container-g">
          <Reveal>
            <SectionHead center title={about.stats.title} />
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
      )}

      {/* Kapanış */}
      <ClosingCta title={closing.title} lead={closing.lead} primary={{ href: "/iletisim", label: closing.primaryLabel }} />
    </>
  );
}
