import { Award } from "lucide-react";
import { references, awards } from "@/lib/data";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Marquee } from "@/components/ui/Marquee";
import { StaggerGroup, StaggerItem } from "@/components/ui/Reveal";
import { GlowBorder } from "@/components/fx/GlowBorder";
import { cn } from "@/lib/utils";

export type ReferencesWallProps = {
  className?: string;
};

/**
 * Referans duvarı: 30+ marka üç marquee şeridinde akar
 * (normal / ters / yavaş), altında yeşil glow'lu ödül kartları.
 * Animasyonlar CSS marquee + client alt bileşenlerde; bu bileşen server'da kalır.
 */
export function ReferencesWall({ className }: ReferencesWallProps) {
  const third = Math.ceil(references.length / 3);
  const rows: string[][] = [
    references.slice(0, third),
    references.slice(third, third * 2),
    references.slice(third * 2),
  ];

  return (
    // Zemin: coal — önündeki SectionDivider to="coal" ve ardından gelen
    // CTAV2 (bg-coal) ile birebir aynı hex; ton dikişi kalmaz.
    <section className={cn("overflow-x-clip bg-coal py-24 md:py-32", className)}>
      <div className="container-g">
        <SectionHeading
          dark
          center
          eyebrow="Referanslar"
          title="*30+* markanın yol arkadaşıyız"
          sub="Yerelden globale; sağlıktan e-ticarete her sektörden markayla aynı masada üretiyoruz."
        />
      </div>

      {/* üç şerit: normal / ters / yavaş */}
      <div className="mt-14 space-y-4 md:mt-16 md:space-y-5">
        <Marquee>
          {rows[0].map((name) => (
            <ReferencePill key={name} name={name} />
          ))}
        </Marquee>
        <Marquee reverse>
          {rows[1].map((name) => (
            <ReferencePill key={name} name={name} />
          ))}
        </Marquee>
        <Marquee slow>
          {rows[2].map((name) => (
            <ReferencePill key={name} name={name} />
          ))}
        </Marquee>
      </div>

      {/* ödüller */}
      <div className="container-g mt-16 md:mt-24">
        <StaggerGroup className="grid gap-5 md:grid-cols-2 md:gap-6" stagger={0.12}>
          {awards.map((a) => (
            <StaggerItem key={a.title} className="h-full">
              {/* Neon çerçeve: hover'da dönen conic-gradient; statikte sönük
                 yeşil çerçeve GlowBorder içinden gelir (eski border kaldırıldı) */}
              <GlowBorder
                always={false}
                radius="1.5rem"
                className="h-full shadow-[0_0_60px_rgb(16_216_108/0.15)]"
              >
              <article className="relative h-full overflow-hidden rounded-[calc(1.5rem_-_1px)] bg-carbon p-7 md:p-9">
                <div
                  aria-hidden
                  className="grain-blob -right-20 -top-20 h-48 w-48 opacity-20"
                />
                <div className="relative flex items-center justify-between gap-4">
                  <span className="inline-flex size-11 items-center justify-center rounded-full border border-guru/25 bg-guru/10 text-guru">
                    <Award className="size-5" strokeWidth={2} />
                  </span>
                  <span className="rounded-full border border-guru/30 bg-guru/10 px-3.5 py-1 text-xs font-semibold tracking-[0.14em] text-guru">
                    {a.year}
                  </span>
                </div>
                <h3 className="relative mt-6 text-xl font-bold tracking-tight text-paper md:text-2xl">
                  {a.title}
                </h3>
                <p className="relative mt-3 text-sm leading-relaxed text-paper/60 md:text-[15px]">
                  {a.desc}
                </p>
              </article>
              </GlowBorder>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </div>
    </section>
  );
}

function ReferencePill({ name }: { name: string }) {
  return (
    <span className="mx-2 inline-flex whitespace-nowrap rounded-full border border-paper/15 px-5 py-2.5 text-sm font-medium text-paper/70 transition-colors duration-300 hover:border-guru/40 hover:text-guru md:px-6 md:py-3 md:text-base">
      {name}
    </span>
  );
}
