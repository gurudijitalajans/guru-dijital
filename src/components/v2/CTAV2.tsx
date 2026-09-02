import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { site } from "@/lib/data";
import { Magnetic } from "@/components/ui/Magnetic";
import { Reveal } from "@/components/ui/Reveal";
import { AuroraCanvas } from "@/components/fx/AuroraCanvas";
import { cn, parseAccent } from "@/lib/utils";

export type CTAV2Props = {
  className?: string;
};

/**
 * Kapanış CTA: dev lowercase tipografi + tek dev magnetic yuvarlak buton.
 * Magnetic ve Reveal client alt bileşenler; bu bileşen server'da kalır.
 */
export function CTAV2({ className }: CTAV2Props) {
  const parts = parseAccent("Projeni *konuşalım*");

  return (
    <section
      className={cn("relative overflow-x-clip bg-page py-28 md:py-40", className)}
    >
      {/* üst kenarda ince yeşil çizgi */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-guru/70 to-transparent"
      />

      {/* arka plan: düşük yoğunluklu aurora + grain bloblar */}
      <AuroraCanvas className="fx-aurora absolute inset-0 h-full w-full" intensity={0.4} />
      <div
        aria-hidden
        className="grain-blob left-[-12%] top-[8%] h-72 w-72 opacity-30 md:h-[26rem] md:w-[26rem]"
      />
      <div
        aria-hidden
        className="grain-blob bottom-[-18%] right-[-10%] h-80 w-80 opacity-25 md:h-[30rem] md:w-[30rem]"
      />

      <div className="container-g relative flex flex-col items-center text-center">
        <Reveal>
          <h2 className="text-balance font-extrabold leading-[0.95] tracking-[-0.04em] text-fg text-[clamp(3rem,10vw,8rem)]">
            {parts.map((p, i) => (
              <span key={i} className={p.accent ? "text-guru" : undefined}>
                {p.t}
              </span>
            ))}
          </h2>
        </Reveal>

        <Reveal delay={0.15} className="mt-12 md:mt-16">
          <Magnetic strength={0.35}>
            <Link
              href="/iletisim"
              aria-label="İletişime geç: Projeni konuşalım"
              className="group flex size-[128px] flex-col items-center justify-center gap-1 rounded-full bg-guru text-ink shadow-[0_0_80px_rgb(16_216_108/0.25)] transition-transform duration-500 ease-out hover:scale-110 md:size-[150px]"
            >
              <ArrowUpRight
                className="size-8 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 md:size-9"
                strokeWidth={2.2}
              />
              <span className="text-sm font-semibold tracking-tight md:text-[15px]">
                Başlayalım
              </span>
            </Link>
          </Magnetic>
        </Reveal>

        <Reveal delay={0.25} className="mt-10 md:mt-14">
          <a
            href={`mailto:${site.email}`}
            className="inline-block py-3 -my-3 text-sm text-fg/60 transition-colors duration-300 hover:text-guru md:text-base"
          >
            {site.email}
          </a>
        </Reveal>
      </div>
    </section>
  );
}
