"use client";

import { SectionHeading } from "@/components/ui/SectionHeading";
import { StaggerGroup, StaggerItem } from "@/components/ui/Reveal";
import { process } from "@/lib/data";

export function ProcessSection() {
  return (
    <section className="bg-paper py-20 md:py-28">
      <div className="container-g">
        <SectionHeading
          center
          eyebrow="Nasıl Çalışıyoruz"
          title="Dört adımda *net* bir yol haritası"
          sub="Her projede aynı disiplin: önce anlamak, sonra kurgulamak, üretmek ve veriyle büyütmek."
        />

        <StaggerGroup
          className="relative mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-4"
          stagger={0.09}
        >
          {process.map((p, i) => (
            <StaggerItem key={p.no}>
              <div className="group relative h-full rounded-3xl border border-ink/8 bg-white p-7 shadow-card transition-all duration-500 hover:-translate-y-1 hover:border-guru/40">
                <div className="flex items-baseline justify-between">
                  <span className="headline-outline text-6xl font-extrabold tracking-tight transition-colors duration-500 group-hover:text-guru group-hover:[-webkit-text-stroke:0px]">
                    {p.no}
                  </span>
                  {i < process.length - 1 && (
                    <span
                      className="hidden h-px w-10 bg-ink/15 lg:block"
                      aria-hidden
                    />
                  )}
                </div>
                <h3 className="mt-6 text-lg font-bold tracking-tight text-ink">
                  {p.title}
                </h3>
                <p className="mt-2.5 text-sm leading-relaxed text-smoke">{p.desc}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </div>
    </section>
  );
}
