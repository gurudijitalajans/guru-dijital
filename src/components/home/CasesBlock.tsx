import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { CaseView } from "@/lib/content";
import { SectionHead } from "@/components/site/SectionHead";
import { StaggerGroup, StaggerItem } from "@/components/ui/Reveal";
import { cardCls, pillCls, sectionY } from "@/components/site/styles";
import { cn, formatStat } from "@/lib/utils";

/** Tek vaka kartı: sektör, başlık, özet, üç sonuç, dipnot (üç sütunlu ızgaraya göre) */
export function CaseCard({ c }: { c: CaseView }) {
  return (
    <article className={cn(cardCls, "flex h-full flex-col p-6 md:p-7")}>
      <span className={cn(pillCls, "self-start bg-soft shadow-none")}>
        <span className="size-1.5 rounded-full bg-brand" aria-hidden />
        {c.sector}
      </span>
      <h3 className="mt-5 text-balance text-[20px] font-medium leading-snug tracking-[-0.02em] text-heading md:text-[21px]">{c.title}</h3>
      <p className="mt-3 text-pretty text-[14.5px] leading-relaxed text-muted">{c.summary}</p>
      <dl className="mt-auto grid grid-cols-3 gap-2 pt-6">
        {c.featured.map((s) => (
          <div key={s.label} className="flex flex-col-reverse justify-end gap-1.5 rounded-xl bg-soft px-3 py-3">
            {/* Etiket iki satırlık yer ayırır: kartlarda rakamlar aynı hizada */}
            <dt className="min-h-[2lh] text-[12px] leading-snug text-muted">{s.label}</dt>
            <dd className="text-[22px] font-medium leading-none tracking-[-0.03em] text-heading tabular-nums">{formatStat(s)}</dd>
          </div>
        ))}
      </dl>
      {c.note ? <p className="mt-4 text-[13px] text-muted">{c.note}</p> : null}
    </article>
  );
}

function CaseGrid({ cases }: { cases: CaseView[] }) {
  return (
    <StaggerGroup className="fill-odd-sm grid gap-4 sm:grid-cols-2 md:gap-5 lg:grid-cols-3">
      {cases.map((c) => (
        <StaggerItem key={c.id} className="h-full">
          <CaseCard c={c} />
        </StaggerItem>
      ))}
    </StaggerGroup>
  );
}

/**
 * Vaka çalışmaları panelden (Kurumsal > Vaka Çalışmaları). Üç sütun; byService
 * ile hizmetine göre gruplanır (Referanslar sayfası), her grubun başında
 * hizmetin adı ve sayfasına bağlantı.
 */
export function CasesBlock({ title, lead, cases, byService = false, className }: { title: string; lead: string; cases: CaseView[]; byService?: boolean; className?: string }) {
  const groups = byService
    ? [...new Map(cases.map((c) => [c.service?.slug ?? "", { service: c.service, items: cases.filter((x) => (x.service?.slug ?? "") === (c.service?.slug ?? "")) }])).values()]
    : [{ service: null, items: cases }];
  return (
    <section className={cn("bg-soft", sectionY, className)}>
      <div className="container-g">
        <SectionHead title={title} lead={lead} action={{ href: "/iletisim", label: "Benzer Bir Hedefiniz mi Var?" }} />
        <div className="mt-10 grid gap-10">
          {groups.map((g) => (
            <div key={g.service?.slug ?? "diger"}>
              {byService && g.service ? (
                <div className="mb-4 flex items-baseline justify-between gap-4">
                  <h3 className="text-[18px] font-medium text-heading">{g.service.title}</h3>
                  <Link href={`/hizmetler/${g.service.slug}`} className="inline-flex shrink-0 items-center gap-1.5 text-[14px] font-medium text-brand hover:text-navy">
                    Hizmeti inceleyin
                    <ArrowRight aria-hidden className="size-4" />
                  </Link>
                </div>
              ) : null}
              <CaseGrid cases={g.items} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
