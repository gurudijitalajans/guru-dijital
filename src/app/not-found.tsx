import { GButton } from "@/components/ui/Button";
import { Scramble } from "@/components/fx/Scramble";
import { Magnetic } from "@/components/ui/Magnetic";

export default function NotFound() {
  return (
    <section className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden bg-coal px-5 text-center">
      <div className="grain-blob left-1/2 top-1/3 h-80 w-80 -translate-x-1/2 opacity-30 md:h-[28rem] md:w-[28rem]" aria-hidden />

      <p
        className="headline-outline-light select-none font-extrabold leading-none tracking-[-0.04em] text-[clamp(8rem,30vw,22rem)]"
        aria-hidden
      >
        404
      </p>

      <h1 className="mt-2 text-2xl font-bold tracking-tight text-paper md:text-3xl">
        <Scramble text="Bu sayfa bir üst seviyeye taşınmış olabilir." />
      </h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-paper/60 md:text-base">
        Aradığınız sayfa bulunamadı ya da adresi değişti.
      </p>

      <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
        <Magnetic>
          <GButton href="/" variant="green" size="lg">
            Ana Sayfa
          </GButton>
        </Magnetic>
        <Magnetic>
          <GButton
            href="/iletisim"
            variant="outline"
            size="lg"
            className="border-paper/25 text-paper hover:border-paper hover:bg-paper hover:text-ink"
          >
            Bize Ulaşın
          </GButton>
        </Magnetic>
      </div>
    </section>
  );
}
