import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type Variant = "dark" | "green" | "outline" | "light";
type Size = "md" | "lg";

const variants: Record<Variant, string> = {
  dark: "bg-ink text-paper hover:bg-guru hover:text-ink",
  green: "bg-guru text-ink hover:bg-ink hover:text-paper",
  outline:
    "border border-ink/15 bg-transparent text-ink hover:border-ink hover:bg-ink hover:text-paper",
  light: "bg-paper text-ink hover:bg-guru hover:text-ink",
};

const sizes: Record<Size, string> = {
  md: "px-6 py-3 text-sm",
  lg: "px-7 py-3.5 text-[15px] md:px-8 md:py-4 md:text-base",
};

export function GButton({
  href,
  children,
  variant = "dark",
  size = "md",
  className,
  external = false,
  arrow = true,
  type,
  disabled,
}: {
  href?: string;
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  className?: string;
  external?: boolean;
  arrow?: boolean;
  type?: "submit" | "button";
  disabled?: boolean;
}) {
  const cls = cn(
    "group inline-flex items-center justify-center gap-2 rounded-full font-semibold tracking-tight transition-all duration-300 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50",
    variants[variant],
    sizes[size],
    className
  );
  const inner = (
    <>
      {children}
      {arrow && (
        <ArrowUpRight
          className="size-[1.1em] transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
          strokeWidth={2.2}
        />
      )}
    </>
  );

  if (href && external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
        {inner}
      </a>
    );
  }
  if (href) {
    return (
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      <Link href={href as any} className={cls}>
        {inner}
      </Link>
    );
  }
  return (
    <button type={type ?? "button"} disabled={disabled} className={cls}>
      {inner}
    </button>
  );
}
