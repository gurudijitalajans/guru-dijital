import { cn } from "@/lib/utils";

/** Durum etiketi: renk anlamı taşır (kötü, uyarı, iyi, bilgi, sade) */
export type Tone = "bad" | "warn" | "good" | "info" | "plain";
const TONES: Record<Tone, string> = {
  bad: "bg-bad-soft text-bad",
  warn: "bg-warn-soft text-warn",
  good: "bg-good-soft text-good",
  info: "bg-accent-soft text-accent",
  plain: "bg-sunken text-muted",
};

export function Badge({ tone = "plain", dot, className, children }: { tone?: Tone; dot?: boolean; className?: string; children: React.ReactNode }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-[12px] font-medium", TONES[tone], className)}>
      {dot ? <span className="size-2 rounded-full bg-current" aria-hidden /> : null}
      {children}
    </span>
  );
}
