import { references } from "@/lib/data";
import { SectionHead } from "@/components/site/SectionHead";

/* ÖRNEK logo duvarı: gerçek logo dosyaları gelene kadar marka adları farklı
   yazı biçimleriyle logo gibi dizilir. TODO(client): vektör müşteri logoları. */
const STYLES = [
  "font-semibold tracking-[-0.02em]",
  "font-normal uppercase tracking-[0.28em] text-[13px]",
  "font-medium italic",
  "font-light tracking-[0.06em]",
  "font-bold tracking-[-0.04em] text-[19px]",
];

const TR_CHARS = /[çğıöşüÇĞİÖŞÜ]/;

function Row({ items, reverse }: { items: string[]; reverse?: boolean }) {
  const loop = [...items, ...items];
  return (
    <div className={reverse ? "marquee marquee-reverse marquee-slow" : "marquee marquee-slow"}>
      <ul className="marquee-track items-center gap-14 py-4 pr-14" aria-hidden={reverse || undefined}>
        {loop.map((name, i) => (
          <li
            key={`${name}-${i}`}
            /* Türkçeye özgü harf yoksa İngilizce büyük harf kuralı: "Clinic P" → CLINIC P (CLİNİC P değil) */
            lang={TR_CHARS.test(name) ? undefined : "en"}
            className={`whitespace-nowrap text-[18px] text-[#8a93a6] ${STYLES[i % STYLES.length]}`}
          >
            {name}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function LogoWall() {
  const half = Math.ceil(references.length / 2);
  return (
    <section id="referanslar" className="pb-12 pt-16 md:pb-16 md:pt-20">
      <div className="container-g">
        <SectionHead
          center
          title="Referanslarımız"
          lead="Sağlıktan e-ticarete, turizmden inşaata farklı sektörlerden markalarla aynı masada üretiyoruz."
        />
      </div>
      <p className="sr-only">Referanslarımız: {references.join(", ")}</p>
      <div className="mt-8 space-y-1" aria-hidden>
        <Row items={references.slice(0, half)} />
        <Row items={references.slice(half)} reverse />
      </div>
    </section>
  );
}
