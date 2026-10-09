import Image from "next/image";
import { LinkedinIcon as Linkedin } from "@/components/ui/icons";
import type { TeamView } from "@/lib/content";
import { SectionHead } from "@/components/site/SectionHead";
import { TeamRoleCard } from "@/components/site/TeamRoleCard";
import { StaggerGroup, StaggerItem } from "@/components/ui/Reveal";
import { cardCls, sectionY } from "@/components/site/styles";
import { IconByName } from "@/lib/icons";
import { cn } from "@/lib/utils";

/* Fotoğraf gelene kadar marka mavisi tonlarında soyut portre yer tutucusu */
const TONES = [
  "from-[#cef0fe] to-[#6dc1f8]",
  "from-[#dbe7fb] to-[#3888e7]",
  "from-[#e6eefb] to-[#12419b]",
  "from-[#d6f1ff] to-[#2a6aca]",
];

type TeamBlockProps = { title: string; lead: string; members: TeamView[]; limit?: number };

/* Ekip panelden (Kurumsal > Ekip): "Ana sayfada göster" seçili olanlar sırayla */
export function TeamBlock({ title, lead, members, limit = 4 }: TeamBlockProps) {
  const shown = members.filter((m) => m.showOnHome).slice(0, limit);
  if (shown.length === 0) return null;
  /* Hiç fotoğraf yoksa boş portreler yerine kompakt rol kartları */
  const compact = shown.every((m) => !m.photo);
  return (
    <section className={sectionY}>
      <div className="container-g">
        <SectionHead
          title={title}
          lead={lead}
          action={{ href: "/hakkimizda#ekip", label: "Tüm Ekibi Gör" }}
        />
        {compact ? (
          <StaggerGroup className="mt-10 grid gap-3 sm:grid-cols-2 md:gap-4 lg:grid-cols-4">
            {shown.map((m, i) => (
              <StaggerItem key={`${m.role}-${i}`} className="h-full">
                <TeamRoleCard member={m} />
              </StaggerItem>
            ))}
          </StaggerGroup>
        ) : (
        <StaggerGroup className="mt-10 grid grid-cols-2 gap-4 md:gap-5 lg:grid-cols-4">
          {shown.map((m, i) => (
            <StaggerItem key={`${m.role}-${i}`} className="h-full">
              <article className={cn(cardCls, "flex h-full flex-col overflow-hidden")}>
                {m.photo ? (
                  <div className="relative aspect-[4/5] bg-soft">
                    <Image
                      src={m.photo.src}
                      alt={m.photo.alt}
                      fill
                      sizes="(min-width: 1024px) 290px, 45vw"
                      className="object-cover"
                      style={m.photo.position ? { objectPosition: m.photo.position } : undefined}
                    />
                  </div>
                ) : (
                  /* Fotoğraf gelene kadar: marka tonunda zemin, ortada role uygun ikon */
                  <div className={cn("relative grid aspect-[4/5] place-items-center bg-gradient-to-br", TONES[i % TONES.length])} aria-hidden>
                    <span className="grid size-16 place-items-center rounded-full bg-white/80 text-navy shadow-[0_12px_30px_-14px_rgb(1_20_65/0.5)]">
                      <IconByName name={m.icon} className="size-7" strokeWidth={1.6} />
                    </span>
                  </div>
                )}
                <div className="flex min-h-[72px] items-center justify-between gap-3 p-4">
                  <div className="min-w-0">
                    {/* İsim girilmediyse rol başlık olur; uydurma isim yazılmaz */}
                    <h3 className="text-[15.5px] font-medium leading-snug text-heading">{m.placeholder ? m.role : m.name}</h3>
                    <p className="text-[13px] leading-snug text-muted">{m.placeholder ? m.focus : m.role}</p>
                  </div>
                  {m.linkedin && (
                    <a
                      href={m.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${m.name} LinkedIn`}
                      className="grid size-10 shrink-0 place-items-center rounded-xl text-heading shadow-[0_0_0_1px_rgb(1_20_65/0.1)] hover:text-brand"
                    >
                      <Linkedin className="size-4" />
                    </a>
                  )}
                </div>
              </article>
            </StaggerItem>
          ))}
        </StaggerGroup>
        )}
      </div>
    </section>
  );
}
