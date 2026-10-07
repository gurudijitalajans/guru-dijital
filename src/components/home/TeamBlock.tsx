import { LinkedinIcon as Linkedin } from "@/components/ui/icons";
import { team } from "@/lib/data";
import { SectionHead } from "@/components/site/SectionHead";
import { StaggerGroup, StaggerItem } from "@/components/ui/Reveal";
import { cardCls, sectionY } from "@/components/site/styles";
import { cn } from "@/lib/utils";

/* Fotoğraf gelene kadar marka mavisi tonlarında soyut portre yer tutucusu */
const TONES = [
  "from-[#cef0fe] to-[#6dc1f8]",
  "from-[#dbe7fb] to-[#3888e7]",
  "from-[#e6eefb] to-[#12419b]",
  "from-[#d6f1ff] to-[#2a6aca]",
];

/* ÖRNEK ekip (mockup). TODO(client): fotoğraflar, isimler ve LinkedIn adresleri. */
export function TeamBlock({ limit = 4 }: { limit?: number }) {
  return (
    <section className={sectionY}>
      <div className="container-g">
        <SectionHead
          title="Ekibimiz"
          lead="Strateji, tasarım, içerik ve performans uzmanlarından oluşan, aynı hedefe odaklı bir ekip."
          action={{ href: "/hakkimizda#ekip", label: "Tüm Ekibi Gör" }}
        />
        <StaggerGroup className="mt-10 grid grid-cols-2 gap-4 md:gap-5 lg:grid-cols-4">
          {team.slice(0, limit).map((m, i) => (
            <StaggerItem key={`${m.role}-${i}`} className="h-full">
              <article className={cn(cardCls, "flex h-full flex-col overflow-hidden")}>
                <div className={cn("relative aspect-[4/5] bg-gradient-to-br", TONES[i % TONES.length])} aria-hidden>
                  <svg viewBox="0 0 100 125" className="absolute inset-x-0 bottom-0 h-[78%] w-full text-white/55" fill="currentColor">
                    <circle cx="50" cy="42" r="19" />
                    <path d="M12 125c0-24 17-41 38-41s38 17 38 41z" />
                  </svg>
                </div>
                <div className="flex items-center justify-between gap-3 p-4">
                  <div className="min-w-0">
                    <h3 className="truncate text-[15.5px] font-medium text-heading">{m.name}</h3>
                    <p className="text-[13px] leading-snug text-muted">{m.role}</p>
                  </div>
                  {m.linkedin ? (
                    <a
                      href={m.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${m.name} LinkedIn`}
                      className="grid size-10 shrink-0 place-items-center rounded-xl text-heading shadow-[0_0_0_1px_rgb(1_20_65/0.1)] hover:text-brand"
                    >
                      <Linkedin className="size-4" />
                    </a>
                  ) : (
                    <span aria-hidden className="grid size-10 shrink-0 place-items-center rounded-xl text-[#b3bccb] shadow-[0_0_0_1px_rgb(1_20_65/0.08)]">
                      <Linkedin className="size-4" />
                    </span>
                  )}
                </div>
              </article>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </div>
    </section>
  );
}
