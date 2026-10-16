import Image from "next/image";
import { SectionHead } from "@/components/site/SectionHead";
import { Reveal } from "@/components/ui/Reveal";
import type { ReferenceView } from "@/lib/content";
import { cn } from "@/lib/utils";

/**
 * Ana sayfa referans şeridi (Magic UI "Marquee" düzeni): üç sıra, zıt
 * yönlere yavaşça akan renkli logolar; kenarlar yumuşakça kaybolur, üzerine
 * gelince durur, hareket azaltma tercihinde durağan kalır. Logosu olmayan
 * marka şeritte yer almaz (tam liste /referanslar sayfasında).
 * Ekran okuyucu için marka adları ayrı bir listede.
 */
function Row({ items, reverse, seconds }: { items: ReferenceView[]; reverse?: boolean; seconds: number }) {
  return (
    <div className="marquee">
      {/* İçerik iki kez: iz %50 kayınca başa döndüğünde dikiş görünmez */}
      <ul className={reverse ? "marquee-track marquee-reverse-track" : "marquee-track"} style={{ animationDuration: `${seconds}s` }}>
        {[...items, ...items].map((r, i) =>
          r.logo ? (
            /* Hareket azaltmada şerit kaydırılabilir listeye döner: ikinci kopya gizlenir, her logo bir kez */
            <li key={`${r.name}-${i}`} className={cn("mx-2.5 grid h-[76px] w-[172px] shrink-0 place-items-center rounded-2xl bg-white px-5 shadow-[0_0_0_1px_rgb(1_20_65/0.07)] md:mx-3 md:h-[84px] md:w-[196px]", i >= items.length && "motion-reduce:hidden")}>
              <Image src={r.logo.src} alt="" width={r.logo.w} height={r.logo.h} sizes="200px" className="max-h-12 w-auto max-w-full object-contain md:max-h-[52px]" />
            </li>
          ) : null
        )}
      </ul>
    </div>
  );
}

type LogoWallProps = { title: string; lead: string; references: ReferenceView[] };

export function LogoWall({ title, lead, references }: LogoWallProps) {
  const withLogo = references.filter((r) => r.logo);
  /* Üç sıra; her sıra kendi markalarıyla, ortadaki ters yönde */
  const per = Math.ceil(withLogo.length / 3);
  const rows = [0, 1, 2].map((i) => withLogo.slice(i * per, (i + 1) * per)).filter((r) => r.length > 0);
  /* Logo başına ~7 sn: sakin, okunur akış */
  const speed = (n: number) => Math.max(70, Math.round(n * 7));
  return (
    <section id="referanslar" className="overflow-x-clip pb-12 pt-12 md:pb-14 md:pt-14">
      <div className="container-g">
        <Reveal>
          <SectionHead title={title} lead={lead} action={{ href: "/referanslar", label: "Tüm Referanslar" }} />
        </Reveal>
      </div>
      <ul className="sr-only" aria-label={title}>
        {references.map((r) => (
          <li key={r.name}>{r.name}</li>
        ))}
      </ul>
      {withLogo.length > 0 && (
        <div className="mt-10 grid gap-3 md:gap-4" aria-hidden>
          {rows.map((r, i) => (
            <Row key={i} items={r} reverse={i === 1} seconds={speed(r.length) + i * 9} />
          ))}
        </div>
      )}
    </section>
  );
}
