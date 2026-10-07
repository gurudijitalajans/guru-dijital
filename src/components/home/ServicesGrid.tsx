import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { services } from "@/lib/data";
import { SectionHead } from "@/components/site/SectionHead";
import { StaggerGroup, StaggerItem } from "@/components/ui/Reveal";
import { cardCls, cardHoverCls, cardTextCls, cardTitleCls, iconBoxCls, sectionY } from "@/components/site/styles";
import { cn } from "@/lib/utils";

export function ServicesGrid() {
  return (
    <section className={sectionY}>
      <div className="container-g">
        <SectionHead
          title="Hizmetlerimiz"
          lead="Markanızı büyüten altı disiplin; her biri ölçülebilir hedeflerle yönetilir."
          action={{ href: "/hizmetler", label: "Tüm Hizmetler" }}
        />
        <StaggerGroup className="mt-10 grid gap-4 sm:grid-cols-2 md:gap-5 lg:grid-cols-3">
          {services.map((s) => {
            const Icon = s.icon;
            return (
              <StaggerItem key={s.slug} className="h-full">
                <Link
                  href={`/hizmetler/${s.slug}`}
                  className={cn(cardCls, cardHoverCls, "group flex h-full flex-col gap-3 p-6 md:p-7")}
                >
                  <span className={iconBoxCls} aria-hidden>
                    <Icon className="size-5" strokeWidth={1.8} />
                  </span>
                  <h3 className={cn(cardTitleCls, "mt-2 text-[19px]")}>{s.title}</h3>
                  <p className={cardTextCls}>{s.short}</p>
                  <span className="mt-auto inline-flex items-center gap-1.5 pt-2 text-[14px] font-medium text-heading transition-colors group-hover:text-brand">
                    İncele
                    <ArrowRight aria-hidden className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                  </span>
                </Link>
              </StaggerItem>
            );
          })}
        </StaggerGroup>
      </div>
    </section>
  );
}
