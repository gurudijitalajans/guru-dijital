import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export type SectionHeadProps = {
  title: ReactNode;
  lead?: ReactNode;
  /** sağ üstte "Tümünü Gör" türü bağlantı */
  action?: { href: string; label: string };
  center?: boolean;
  /** başlık etiketi: sayfanın h1'i değilse h2 */
  as?: "h1" | "h2";
  className?: string;
};

/**
 * Bölüm başlığı: EDME dilinde ince (500) ve büyük başlık, gri açıklama,
 * isteğe bağlı sağda bağlantı. Ortalanmış ya da sola dayalı.
 */
export function SectionHead({ title, lead, action, center, as = "h2", className }: SectionHeadProps) {
  const H = as;
  const head = (
    <div className={cn(center && "mx-auto text-center", "max-w-3xl")}>
      <H className="text-[27px] font-medium leading-[1.15] tracking-[-0.025em] text-heading sm:text-[32px]">
        {title}
      </H>
      {lead && <p className={cn("mt-3 text-[15.5px] leading-relaxed text-muted", center && "mx-auto")}>{lead}</p>}
    </div>
  );
  if (!action) return <div className={className}>{head}</div>;
  return (
    <div className={cn("flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between", className)}>
      {head}
      <Link
        href={action.href}
        className="group inline-flex min-h-11 shrink-0 items-center gap-1.5 text-[14.5px] font-medium text-heading transition-colors hover:text-brand"
      >
        {action.label}
        <ArrowRight aria-hidden className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" />
      </Link>
    </div>
  );
}
