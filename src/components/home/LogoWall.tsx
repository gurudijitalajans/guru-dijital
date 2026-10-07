import Image from "next/image";
import { SectionHead } from "@/components/site/SectionHead";
import type { ReferenceView } from "@/lib/content";

/* Logo duvarı: panelde logosu yüklenen marka gri tonda logo olarak, logosu
   olmayan marka farklı yazı biçimleriyle adı yazılarak dizilir. */
const STYLES = [
  "font-semibold tracking-[-0.02em]",
  "font-normal uppercase tracking-[0.28em] text-[13px]",
  "font-medium italic",
  "font-light tracking-[0.06em]",
  "font-bold tracking-[-0.04em] text-[19px]",
];

const TR_CHARS = /[çğıöşüÇĞİÖŞÜ]/;

function Row({ items, reverse }: { items: ReferenceView[]; reverse?: boolean }) {
  const loop = [...items, ...items];
  return (
    <div className={reverse ? "marquee marquee-reverse marquee-slow" : "marquee marquee-slow"}>
      <ul className="marquee-track items-center gap-14 py-4 pr-14" aria-hidden={reverse || undefined}>
        {loop.map((r, i) =>
          r.logo ? (
            <li key={`${r.name}-${i}`} className="flex h-9 shrink-0 items-center">
              <Image
                src={r.logo.src}
                alt=""
                width={r.logo.w}
                height={r.logo.h}
                sizes="160px"
                className="h-8 w-auto max-w-[150px] object-contain opacity-60 grayscale"
              />
            </li>
          ) : (
            <li
              key={`${r.name}-${i}`}
              /* Türkçeye özgü harf yoksa İngilizce büyük harf kuralı: "Clinic P" → CLINIC P (CLİNİC P değil) */
              lang={TR_CHARS.test(r.name) ? undefined : "en"}
              className={`whitespace-nowrap text-[18px] text-[#8a93a6] ${STYLES[i % STYLES.length]}`}
            >
              {r.name}
            </li>
          )
        )}
      </ul>
    </div>
  );
}

type LogoWallProps = { title: string; lead: string; references: ReferenceView[] };

export function LogoWall({ title, lead, references }: LogoWallProps) {
  const half = Math.ceil(references.length / 2);
  return (
    <section id="referanslar" className="pb-12 pt-16 md:pb-16 md:pt-20">
      <div className="container-g">
        <SectionHead
          center
          title={title}
          lead={lead}
        />
      </div>
      <p className="sr-only">
        {title}: {references.map((r) => r.name).join(", ")}
      </p>
      <div className="mt-8 space-y-1" aria-hidden>
        <Row items={references.slice(0, half)} />
        <Row items={references.slice(half)} reverse />
      </div>
    </section>
  );
}
