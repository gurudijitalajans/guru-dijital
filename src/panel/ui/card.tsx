import { cn } from "@/lib/utils";

/** Çerçeveli bölüm: başlık satırı ve içerik */
export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return <section className={cn("min-w-0 rounded-card border border-line bg-surface", className)}>{children}</section>;
}

export function CardHeader({ title, action, className }: { title: React.ReactNode; action?: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex min-h-13 items-center justify-between gap-3 border-b border-line px-4 py-3", className)}>
      <h2 className="m-0 text-[16px] font-semibold text-ink">{title}</h2>
      {action}
    </div>
  );
}

/** Sayı kartı: değer, etiket, isteğe bağlı karşılaştırma */
export function Stat({ label, value, hint, delta }: { label: string; value: React.ReactNode; hint?: string; delta?: { dir: "up" | "down"; text: string } }) {
  return (
    <div className="min-w-0 rounded-card border border-line bg-surface px-4 py-3.5">
      <div className="text-[13px] text-muted">{label}</div>
      <div className="tabular mt-0.5 text-[26px] font-semibold leading-tight text-ink">{value}</div>
      {hint || delta ? (
        <div className="text-[13px] text-muted">
          {delta ? <span className={cn("font-medium", delta.dir === "up" ? "text-good" : "text-bad")}>{delta.dir === "up" ? "▲" : "▼"} {delta.text} </span> : null}
          {hint}
        </div>
      ) : null}
    </div>
  );
}

export function Empty({ children }: { children: React.ReactNode }) {
  return <p className="m-0 px-4 py-5 text-[14px] text-muted">{children}</p>;
}
