import type { Metadata } from "next";
import Image from "next/image";
import { Btn } from "@/components/site/Btn";
import { ClosingCta } from "@/components/site/ClosingCta";
import { Glyph, GlyphChip } from "@/components/site/Glyph";
import { PageIntro } from "@/components/site/PageIntro";
import { SectionHead } from "@/components/site/SectionHead";
import { TeamRoleCard } from "@/components/site/TeamRoleCard";
import { cardCls, cardTextCls, cardTitleCls, sectionY } from "@/components/site/styles";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/ui/Reveal";
import { LinkedinIcon } from "@/components/ui/icons";
import { getAbout, getProducts, getReferences, getServices, getTeam } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";
import { cn } from "@/lib/utils";

/* Metinler panelden (İçerik > Hakkımızda) */
export async function generateMetadata(): Promise<Metadata> {
  const { seo } = await getAbout();
  return pageMetadata({ title: seo.title, description: seo.description, path: "/hakkimizda" });
}

/* Referans markalarımızın sektörleri (Referanslar sayfasındaki markalarla aynı) */
const SECTORS = ["Sağlık", "Turizm", "Perakende", "İnşaat", "Eğitim", "Gıda"];
/* Hikâye mozaiği: Guru'yu anlatan üç 3D karo (cam Guru işareti, dokuz disiplin
   tek ekip, büyüme). Panelde aynı dosya adıyla bulunur; yoksa sitedeki kopyası kullanılır. */
const MOSAIC = [
  { file: "hikaye6-guru", alt: "Camdan Guru işareti, lacivert zeminde ışık huzmesi altında: Grow with Guru", w: 1000, h: 1600 },
  { file: "hikaye6-ekip", alt: "Tek ekip, dokuz disiplin: reklam, web, SEO, yazılım, mobil, marka tescil, e-ticaret, grafik ve sosyal medya", w: 1250, h: 1000 },
  { file: "hikaye6-buyume", alt: "Büyüme: buz mavisinden laciverte yükselen cam sütunlar ve zirvede ışık alan küre", w: 1250, h: 1000 },
];

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
  /* Mozaik: panelde (hizmet görsellerinde) aynı adlı dosya varsa o, yoksa /work kopyası */
  const workImages = services.flatMap((sv) => [sv.card, ...sv.gallery]).filter((c): c is NonNullable<typeof c> => Boolean(c));
  const mosaic = MOSAIC.map(
    (m) => workImages.find((w) => w.src.includes(m.file)) ?? { src: `/work/${m.file}.webp`, alt: m.alt, w: m.w, h: m.h }
  );
  /* Referans sayısı listelenenlerden fazlası olduğu için "50+" biçiminde */
  const stats = [
    { value: `${references.length}+`, label: about.stats.referencesLabel },
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

      {/* Hikâye: solda metin, sektörler ve gerçek sayılar; sağda Guru'yu anlatan
          3D mozaik (ödüller aşağıda kendi bölümünde); altında dört ilke tek satırda */}
      <section className="pb-16 pt-4 md:pb-[72px] md:pt-8">
        <div className="container-g">
          <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-16">
            <Reveal>
              <SectionHead title={story.title} />
              <div className="mt-5 space-y-4 text-[16px] leading-relaxed text-body md:text-[17px]">
                {story.paragraphs.map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </div>
              <ul className="mt-6 flex flex-wrap gap-2" aria-label="Çalıştığımız sektörler">
                {SECTORS.map((sector) => (
                  <li key={sector} className="rounded-full bg-chip px-3.5 py-1.5 text-[13.5px] font-medium text-heading">
                    {sector}
                  </li>
                ))}
              </ul>
              {about.stats.show && (
                <dl className="mt-8 grid grid-cols-3 gap-3" aria-label={about.stats.title}>
                  {stats.map((s) => (
                    <div key={s.label} className="flex flex-col-reverse rounded-2xl bg-soft px-4 py-4 sm:px-5 sm:py-5">
                      <dt className="mt-1.5 text-[13px] leading-snug text-muted sm:text-[14px]">{s.label}</dt>
                      <dd className="text-[30px] font-light leading-none tracking-[-0.03em] text-heading sm:text-[38px]">{s.value}</dd>
                    </div>
                  ))}
                </dl>
              )}
            </Reveal>

            {mosaic.length > 0 && (
              <Reveal delay={0.06}>
                <div className="grid aspect-[5/4] grid-cols-2 grid-rows-2 gap-3 sm:gap-4">
                  {mosaic.map((m, i) => (
                    <div
                      key={m.src}
                      className={cn(
                        "relative overflow-hidden rounded-[22px] bg-soft shadow-[0_24px_48px_-32px_rgb(1_20_65/0.5)]",
                        i === 0 && "row-span-2"
                      )}
                    >
                      {/* Mozaik masaüstünde ilk ekranda (LCP adayı): geç yüklenmesin */}
                      <Image
                        src={m.src}
                        alt={m.alt}
                        fill
                        loading="eager"
                        sizes="(min-width: 1024px) 300px, 50vw"
                        className="object-cover"
                        style={{ objectPosition: m.position ?? "50% 50%" }}
                      />
                    </div>
                  ))}
                </div>
              </Reveal>
            )}
          </div>

          {/* İlkeler */}
          <div className="mt-12 md:mt-14">
            <Reveal>
              <SectionHead title={story.valuesLabel} />
            </Reveal>
            <StaggerGroup className="mt-8 grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
              {story.values.map((v, i) => {
                return (
                  <StaggerItem key={v.title} className="h-full">
                    <article className={cn(cardCls, "flex h-full flex-col p-5 md:p-6")}>
                      <div className="flex items-center justify-between">
                        <GlyphChip name={v.icon} />
                        <span className="text-[13px] font-medium tabular-nums text-muted" aria-hidden>
                          {String(i + 1).padStart(2, "0")}
                        </span>
                      </div>
                      <h3 className={cn(cardTitleCls, "mt-5")}>{v.title}</h3>
                      <p className={cn(cardTextCls, "mt-1.5")}>{v.desc}</p>
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
      <section id="oduller" className={cn("scroll-mt-24 bg-soft", sectionY)}>
        <div className="container-g">
          <Reveal>
            <SectionHead title={awards.title} lead={awards.lead || undefined} />
          </Reveal>
          <StaggerGroup className="mt-10 grid gap-4 md:grid-cols-2 md:gap-5">
            {awards.items.map((a) => {
              return (
                <StaggerItem key={a.title} className="h-full">
                  <article className={cn(cardCls, "flex h-full flex-col overflow-hidden")}>
                    {a.image && (
                      <Image
                        src={a.image.src}
                        alt={a.image.alt}
                        width={a.image.w}
                        height={a.image.h}
                        sizes="(min-width: 1248px) 600px, (min-width: 768px) 50vw, 100vw"
                        className="aspect-[1600/1131] h-auto w-full bg-soft object-cover"
                      />
                    )}
                    <div className="flex flex-1 flex-col p-5 md:p-7">
                      <p className="inline-flex items-center gap-2 text-[13px] font-medium text-brand">
                        <Glyph name={a.icon} className="size-[18px]" strokeWidth={2} />
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

      {/* Ekip (panel: Kurumsal > Ekip). Hiç fotoğraf yokken kompakt rol kartları,
          fotoğraflar eklenince portre kartları. TODO(client): fotoğraf, isim ve LinkedIn */}
      {about.team.show && team.length > 0 && (
      <section id="ekip" className={sectionY}>
        <div className="container-g">
          <Reveal>
            <SectionHead title={about.team.title} lead={about.team.lead || undefined} />
          </Reveal>
          {team.every((m) => !m.photo) ? (
          <StaggerGroup className="mt-10 grid gap-3 sm:grid-cols-2 md:gap-4 lg:grid-cols-3">
            {team.map((m, i) => (
              <StaggerItem key={`${m.role}-${i}`} className="h-full">
                <TeamRoleCard member={m} />
              </StaggerItem>
            ))}
          </StaggerGroup>
          ) : (
          <StaggerGroup className="mt-10 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 lg:gap-5">
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
                        {/* İsim girilmediyse baş harf yerine role uygun ikon */}
                        {m.placeholder ? <Glyph name={m.icon} className="size-7 sm:size-8" strokeWidth={1.6} /> : initials(m.name)}
                      </span>
                    )}
                    {m.linkedin && (
                      <a
                        href={m.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`${m.name}, ${m.role}: LinkedIn profili`}
                        className="absolute right-2.5 top-2.5 grid size-11 place-items-center rounded-xl bg-white text-heading shadow-[0_0_0_1px_rgb(1_20_65/0.08)] transition-colors hover:text-brand"
                      >
                        <LinkedinIcon className="size-4" />
                      </a>
                    )}
                  </div>
                  <div className="p-4 md:p-5">
                    <h3 className="text-[15.5px] font-medium leading-snug text-heading md:text-[16.5px]">{m.placeholder ? m.role : m.name}</h3>
                    <p className="mt-0.5 text-[13px] leading-snug text-muted md:text-[14px]">{m.placeholder ? m.focus : m.role}</p>
                  </div>
                </article>
              </StaggerItem>
            ))}
          </StaggerGroup>
          )}
        </div>
      </section>
      )}

      {/* Kapanış */}
      <ClosingCta after="white" title={closing.title} lead={closing.lead} primary={{ href: "/iletisim", label: closing.primaryLabel }} />
    </>
  );
}
