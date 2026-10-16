import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getServices } from "@/lib/content";
import { ServiceIcon } from "@/components/site/Glyph";
import { SectionHead } from "@/components/site/SectionHead";
import { StaggerGroup, StaggerItem } from "@/components/ui/Reveal";
import { cardCls, cardHoverCls, cardTextCls, cardTitleCls, sectionY } from "@/components/site/styles";
import { cn, countWord } from "@/lib/utils";

/** Hizmet kartları: içerik panelden (Hizmetler), başlıklar Ana Sayfa > Bölümler */
export async function ServicesGrid({ title, lead, className }: { title: string; lead: string; className?: string }) {
  const services = await getServices();
  return (
    <section className={cn(sectionY, className)}>
      <div className="container-g">
        <SectionHead
          title={title}
          lead={lead.replace("{sayı}", countWord(services.length))}
          action={{ href: "/hizmetler", label: "Tüm Hizmetler" }}
        />
        <StaggerGroup className="mt-10 grid gap-4 sm:grid-cols-2 md:gap-5 lg:grid-cols-3">
          {services.map((s, i) => {
            /* İki sütunda tek kalan son kart iki sütunu kaplar (üç sütunda 9 kart tam dolar) */
            const lone = services.length % 2 === 1 && i === services.length - 1;
            return (
              <StaggerItem key={s.slug} className={cn("h-full", lone && "sm:col-span-2 lg:col-span-1")}>
                <Link
                  href={`/hizmetler/${s.slug}`}
                  className={cn(cardCls, cardHoverCls, "group flex h-full flex-col gap-3 p-6 md:p-7")}
                >
                  <ServiceIcon name={s.icon} />
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
