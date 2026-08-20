"use client";

import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { StaggerGroup, StaggerItem, Reveal } from "@/components/ui/Reveal";
import { Counter } from "@/components/ui/Counter";
import { caseStudies } from "@/lib/data";
import { cn } from "@/lib/utils";

export function CaseStats() {
  return (
    <section className="relative overflow-hidden bg-coal py-20 text-paper md:py-28">
      <div
        className="grain-blob -right-40 top-1/3 h-[460px] w-[460px] opacity-25"
        aria-hidden
      />
      <div className="container-g relative">
        <SectionHeading
          dark
          eyebrow="Vaka Çalışmaları"
          title="Nasıl *başardık*?"
          sub="Sözü verilere bırakıyoruz: reklam bütçesi artırılmadan, strateji yenilenerek elde edilen gerçek sonuçlar."
        />

        <div className="mt-14 space-y-8">
          {caseStudies.map((c, idx) => (
            <Reveal key={c.id} delay={idx * 0.08}>
              <article className="rounded-3xl border border-paper/10 bg-carbon/70 p-7 backdrop-blur md:p-10">
                <div className="flex flex-wrap items-start justify-between gap-6">
                  <div className="max-w-2xl">
                    <span className="inline-flex items-center gap-2 rounded-full border border-guru/30 bg-guru/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-guru">
                      {c.sector}
                    </span>
                    <h3 className="mt-4 text-2xl font-bold tracking-tight md:text-3xl">
                      {c.title}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-paper/65 md:text-[15px]">
                      {c.summary}
                    </p>
                  </div>
                  <div className="hidden shrink-0 rounded-2xl border border-paper/10 px-5 py-4 text-sm font-medium text-paper/70 lg:block">
                    {c.note}
                  </div>
                </div>

                <StaggerGroup
                  className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6"
                  stagger={0.06}
                >
                  {c.stats.map((s) => (
                    <StaggerItem key={s.label}>
                      <div
                        className={cn(
                          "group flex h-full flex-col justify-between rounded-2xl border border-paper/10 bg-coal/60 p-5 transition-colors duration-300 hover:border-guru/40",
                          c.stats.length === 3 && "lg:col-span-2"
                        )}
                      >
                        <span
                          className={cn(
                            "grid size-8 place-items-center rounded-full",
                            s.down ? "bg-guru text-ink" : "bg-paper/10 text-guru"
                          )}
                        >
                          {s.down ? (
                            <ArrowDownRight className="size-4" strokeWidth={2.4} />
                          ) : (
                            <ArrowUpRight className="size-4" strokeWidth={2.4} />
                          )}
                        </span>
                        <div className="mt-6">
                          <div className="text-3xl font-extrabold tracking-tight text-paper md:text-4xl">
                            <Counter value={s.value} prefix={s.prefix ?? "%"} suffix="" />
                          </div>
                          <div className="mt-1.5 text-xs leading-snug text-paper/60 md:text-[13px]">
                            {s.label}
                          </div>
                        </div>
                      </div>
                    </StaggerItem>
                  ))}
                </StaggerGroup>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
