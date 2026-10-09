import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Reveal } from "@/components/ui/Reveal";

export type PageIntroProps = {
  /** küçük üst etiket (ör. "Hizmetlerimiz") */
  eyebrow?: ReactNode;
  title: ReactNode;
  lead?: ReactNode;
  /** butonlar vb. */
  children?: ReactNode;
  /** başlığın altında tam genişlik görsel/ekran */
  visual?: ReactNode;
  className?: string;
};

/**
 * İç sayfa girişi: EDME hizmet sayfası gibi ortalanmış, ince ve büyük başlık,
 * gri açıklama ve isteğe bağlı butonlar. Beyaz zemin, ayraç çizgisi yok.
 */
export function PageIntro({ eyebrow, title, lead, children, visual, className }: PageIntroProps) {
  return (
    <section className={cn("pb-10 pt-12 text-center md:pb-14 md:pt-16", className)}>
      <div className="container-g">
        <Reveal>
          {eyebrow && (
            <p className="mb-4 inline-flex items-center gap-2 text-[13px] font-medium text-brand">
              <span className="size-1.5 rounded-full bg-brand" aria-hidden />
              {eyebrow}
            </p>
          )}
          <h1 className="mx-auto max-w-4xl text-balance text-[34px] font-normal leading-[1.12] tracking-[-0.035em] text-heading sm:text-[44px] lg:text-[52px]">
            {title}
          </h1>
          {lead && (
            <p className="mx-auto mt-5 max-w-2xl text-pretty text-[16px] leading-relaxed text-muted md:text-[16.5px]">{lead}</p>
          )}
          {children && <div className="mt-8 flex flex-wrap items-center justify-center gap-3">{children}</div>}
        </Reveal>
        {visual && <div className="mt-12 md:mt-14">{visual}</div>}
      </div>
    </section>
  );
}
