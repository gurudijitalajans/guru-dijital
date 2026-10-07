import type { CaseView } from "@/lib/content";
import { SectionHead } from "@/components/site/SectionHead";
import { StaggerGroup, StaggerItem } from "@/components/ui/Reveal";
import { cardCls, pillCls, sectionY } from "@/components/site/styles";
import { cn, formatStat } from "@/lib/utils";

/* Vaka çalışmaları panelden (Kurumsal > Vaka Çalışmaları); kartta "Kartta göster" seçili üç sonuç */
export function CasesBlock({ title, lead, cases }: { title: string; lead: string; cases: CaseView[] }) {
  return (
    <section className={cn("bg-soft", sectionY)}>
      <div className="container-g">
        <SectionHead
          title={title}
          lead={lead}
          action={{ href: "/iletisim", label: "Benzer Bir Hedefiniz mi Var?" }}
        />
        <StaggerGroup className="mt-10 grid gap-4 md:gap-5 lg:grid-cols-2">
          {cases.map((c) => (
            <StaggerItem key={c.id} className="h-full">
              <article className={cn(cardCls, "flex h-full flex-col p-6 md:p-8")}>
                <span className={cn(pillCls, "self-start bg-soft shadow-none")}>
                  <span className="size-1.5 rounded-full bg-brand" aria-hidden />
                  {c.sector}
                </span>
                <h3 className="mt-5 text-[22px] font-medium leading-snug tracking-[-0.02em] text-heading md:text-[24px]">{c.title}</h3>
                <p className="mt-3 text-[14.5px] leading-relaxed text-muted">{c.summary}</p>
                <dl className="mt-auto grid gap-2.5 pt-7 sm:grid-cols-3 sm:gap-3">
                  {c.featured.map((s) => (
                    <div key={s.label} className="flex items-center gap-4 rounded-xl bg-soft px-4 py-3 sm:block sm:px-3 sm:py-3.5">
                      <dt className="sr-only">{s.label}</dt>
                      <dd className="w-[92px] shrink-0 text-[24px] font-medium leading-none tracking-[-0.03em] text-heading sm:w-auto md:text-[28px]">
                        {formatStat(s)}
                      </dd>
                      <dd aria-hidden className="text-[13px] leading-snug text-muted sm:mt-2 sm:text-[12.5px]">{s.label}</dd>
                    </div>
                  ))}
                </dl>
                <p className="mt-4 text-[13px] text-muted">{c.note}</p>
              </article>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </div>
    </section>
  );
}
