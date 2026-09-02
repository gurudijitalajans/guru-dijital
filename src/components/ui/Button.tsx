import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type Variant = "dark" | "green" | "outline" | "light";
type Size = "md" | "lg";

/* Tema-duyarlı varyantlar: fg/base tokenları gündüz/gece modunda otomatik
   ters döner; ink sabit koyudur (yeşil zemin üstü metin her temada koyu). */
const variants: Record<Variant, string> = {
  dark: "bg-fg text-page hover:bg-guru hover:text-ink",
  green: "bg-guru text-ink hover:bg-fg hover:text-page",
  outline:
    "border border-fg/20 bg-transparent text-fg hover:border-fg hover:bg-fg hover:text-page",
  light: "bg-card text-fg hover:bg-guru hover:text-ink",
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
      {/* amphora tarzı hover: etiket maskeden yukarı kayar, kopyası alttan gelir */}
      <span className="relative overflow-hidden">
        <span className="block transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-[110%] motion-reduce:transition-none motion-reduce:group-hover:translate-y-0">
          {children}
        </span>
        <span
          aria-hidden
          className="absolute inset-0 block translate-y-[110%] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-y-0 motion-reduce:hidden"
        >
          {children}
        </span>
      </span>
      {arrow && (
        <ArrowUpRight
          className="size-[1.1em] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:rotate-45"
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
