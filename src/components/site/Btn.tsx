import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

export type BtnVariant = "primary" | "brand" | "light" | "white";
export type BtnSize = "md" | "lg";

const variants: Record<BtnVariant, string> = {
  /* Birincil: lacivert hap; EDME'deki siyah butonun marka karşılığı */
  primary: "bg-navy text-white hover:bg-brand",
  brand: "bg-brand text-white hover:bg-navy",
  /* İkincil: beyaz hap, ince çerçeve ve hafif gölge */
  light:
    "bg-white text-heading shadow-[0_0_0_1px_rgb(1_20_65/0.09),0_8px_22px_-12px_rgb(1_20_65/0.35)] hover:shadow-[0_0_0_1px_rgb(42_106_202/0.5),0_10px_26px_-12px_rgb(42_106_202/0.45)]",
  /* Koyu/mavi zeminlerde beyaz hap */
  white: "bg-white text-navy hover:bg-ice",
};

const sizes: Record<BtnSize, string> = {
  md: "min-h-11 px-5 text-[14.5px]",
  lg: "min-h-12 px-6 text-[15.5px]",
};

type Common = {
  variant?: BtnVariant;
  size?: BtnSize;
  /** sağdaki çapraz ok */
  arrow?: boolean;
  className?: string;
  children: ReactNode;
};

type AsLink = Common & { href: string } & Omit<ComponentProps<typeof Link>, "href" | "className" | "children">;
type AsButton = Common & { href?: undefined } & Omit<ComponentProps<"button">, "className" | "children">;

export function Btn(props: AsLink | AsButton) {
  const { variant = "primary", size = "md", arrow = false, className, children } = props;
  const cls = cn(
    "group inline-flex items-center justify-center gap-2 rounded-full font-medium tracking-[-0.005em] transition-[background-color,color,box-shadow,transform] duration-300 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
    variants[variant],
    sizes[size],
    className
  );
  const inner = (
    <>
      <span>{children}</span>
      {arrow && (
        <ArrowUpRight
          aria-hidden
          className="size-4 shrink-0 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
          strokeWidth={2}
        />
      )}
    </>
  );
  if (props.href !== undefined) {
    const { variant: _v, size: _s, arrow: _a, className: _c, children: _ch, href, ...rest } = props;
    void _v; void _s; void _a; void _c; void _ch;
    return (
      <Link href={href} className={cls} {...rest}>
        {inner}
      </Link>
    );
  }
  const { variant: _v, size: _s, arrow: _a, className: _c, children: _ch, ...rest } = props;
  void _v; void _s; void _a; void _c; void _ch;
  return (
    <button type="button" className={cls} {...rest}>
      {inner}
    </button>
  );
}
