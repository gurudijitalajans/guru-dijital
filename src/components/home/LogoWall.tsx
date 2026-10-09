import { BrandTile } from "@/components/site/BrandTile";
import { SectionHead } from "@/components/site/SectionHead";
import { Reveal } from "@/components/ui/Reveal";
import type { ReferenceView } from "@/lib/content";

/* Ana sayfa referans önizlemesi: Referanslar sayfasıyla aynı marka kartları,
   ilk 12 marka; tamamı ve vaka çalışmaları /referanslar sayfasında. */
const PREVIEW = 12;

type LogoWallProps = { title: string; lead: string; references: ReferenceView[] };

export function LogoWall({ title, lead, references }: LogoWallProps) {
  const shown = references.slice(0, PREVIEW);
  return (
    <section id="referanslar" className="pb-12 pt-16 md:pb-16 md:pt-20">
      <div className="container-g">
        <Reveal>
          <SectionHead
            title={title}
            lead={lead}
            action={{ href: "/referanslar", label: `Tüm Referanslar (${references.length})` }}
          />
        </Reveal>
        <Reveal className="mt-10" delay={0.05}>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-6" aria-label={title}>
            {shown.map((r, i) => (
              <BrandTile key={r.name} brand={r} index={i} />
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
