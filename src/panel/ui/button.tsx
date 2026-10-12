import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";
import { cn } from "@/lib/utils";

/** Panelin tek düğme bileşeni: birincil (mavi), ikincil (çerçeveli), sade (yalnız yazı) */
export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[9px] font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary: "bg-accent text-accent-ink hover:brightness-110",
        secondary: "border border-line bg-surface text-ink hover:border-accent",
        ghost: "text-ink hover:bg-sunken",
        danger: "border border-line bg-surface text-bad hover:border-bad",
      },
      size: { md: "min-h-10 px-3.5 text-[14px]", sm: "min-h-8 px-2.5 text-[13px]", icon: "size-10" },
    },
    defaultVariants: { variant: "secondary", size: "md" },
  },
);

type Props = React.ComponentProps<"button"> & VariantProps<typeof buttonVariants> & { asChild?: boolean };

export function Button({ className, variant, size, asChild, ...props }: Props) {
  const C = asChild ? Slot.Root : "button";
  return <C className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
