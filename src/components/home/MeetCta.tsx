import Image from "next/image";
import { Btn } from "@/components/site/Btn";
import { Reveal } from "@/components/ui/Reveal";

/** EDME'deki "Tanışalım" kapanışı: halkalı marka simgesi, kısa davet, tek buton. */
type MeetCtaProps = { title: string; text: string; buttonLabel: string; buttonHref: string };

export function MeetCta({ title, text, buttonLabel, buttonHref }: MeetCtaProps) {
  return (
    <section className="py-20 text-center md:py-24">
      <div className="container-g">
        <Reveal>
          <div className="mx-auto grid size-[124px] place-items-center rounded-full bg-[radial-gradient(circle,#ffffff_58%,rgb(42_106_202/0.12)_59%)]">
            <div className="guru-beam grid size-[96px] place-items-center rounded-full shadow-[0_0_0_4px_#ffffff,0_0_0_7px_#2a6aca]">
              <Image src="/brand/mark-white.svg" alt="" width={52} height={52} className="h-[52px] w-[52px]" />
            </div>
          </div>
          <h2 className="mt-5 text-[32px] font-medium tracking-[-0.025em] text-heading md:text-[36px]">{title}</h2>
          <p className="mx-auto mt-3 max-w-[560px] text-[15.5px] leading-relaxed text-muted">
            {text}
          </p>
          <div className="mt-7 flex justify-center">
            <Btn href={buttonHref} variant="light" size="lg" arrow>
              {buttonLabel}
            </Btn>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
