"use client";

import Image from "next/image";
import { Award, BadgeCheck } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Marquee } from "@/components/ui/Marquee";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/ui/Reveal";
import { references, awards } from "@/lib/data";

function RefPill({ name }: { name: string }) {
  return (
    <span className="mr-3 inline-flex items-center gap-2.5 whitespace-nowrap rounded-full border border-ink/10 bg-white px-5 py-2.5 text-sm font-semibold text-ink/70 shadow-card">
      <span className="size-1.5 rounded-full bg-guru" aria-hidden />
      {name}
    </span>
  );
}

export function ReferencesSection() {
  const half = Math.ceil(references.length / 2);
  return (
    <section className="overflow-hidden bg-mist/60 py-20 md:py-28">
      <div className="container-g">
        <SectionHeading
          center
          eyebrow="Referanslarımız"
          title="30+ markanın *yol arkadaşıyız*"
          sub="Sağlıktan turizme, e-ticaretten inşaata — yerel ve global ölçekte markalarla çalışıyoruz."
        />
      </div>

      <Reveal className="mt-12 space-y-4">
        <Marquee slow>
          {references.slice(0, half).map((r) => (
            <RefPill key={r} name={r} />
          ))}
        </Marquee>
        <Marquee slow reverse>
          {references.slice(half).map((r) => (
            <RefPill key={r} name={r} />
          ))}
        </Marquee>
      </Reveal>

      {/* awards */}
      <div className="container-g mt-16">
        <StaggerGroup className="grid gap-5 md:grid-cols-2" stagger={0.1}>
          {awards.map((a, i) => (
            <StaggerItem key={a.title}>
              <div className="group relative flex h-full items-start gap-5 overflow-hidden rounded-3xl border border-ink/8 bg-white p-7 shadow-card transition-all duration-500 hover:-translate-y-1 hover:border-guru/50 md:p-8">
                <span className="grid size-13 shrink-0 place-items-center rounded-2xl bg-guru/12 text-guru transition-colors duration-300 group-hover:bg-guru group-hover:text-ink">
                  {i === 0 ? (
                    <BadgeCheck className="size-6.5" strokeWidth={2} />
                  ) : (
                    <Award className="size-6.5" strokeWidth={2} />
                  )}
                </span>
                <div>
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h3 className="text-lg font-bold tracking-tight text-ink">
                      {a.title}
                    </h3>
                    <span className="rounded-full bg-ink px-2.5 py-0.5 text-[11px] font-bold text-guru">
                      {a.year}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-smoke">{a.desc}</p>
                </div>
                <Image
                  src="/icon.png"
                  alt=""
                  width={120}
                  height={120}
                  aria-hidden
                  className="pointer-events-none absolute -bottom-8 -right-8 size-28 opacity-[0.05] transition-transform duration-700 group-hover:rotate-12"
                />
              </div>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </div>
    </section>
  );
}
