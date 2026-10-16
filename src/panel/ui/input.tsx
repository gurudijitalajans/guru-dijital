import { cn } from "@/lib/utils";

export function Input({ className, ...props }: React.ComponentProps<"input">) {
  return <input className={cn("min-h-10 min-w-0 rounded-[9px] border border-line bg-surface px-3 text-[14px] pointer-coarse:text-[16px] text-ink placeholder:text-muted focus:border-accent focus:outline-none", className)} {...props} />;
}
