import Link from "next/link";
import { cn } from "@/lib/utils";

/** Dönem seçici (adres satırındaki ?gun= ile) */
export function PeriodLinks({ base, options, current }: { base: string; options: number[]; current: number }) {
  return (
    <div className="inline-flex rounded-[9px] border border-line bg-sunken p-[3px]" role="group" aria-label="Dönem">
      {options.map((d) => (
        <Link key={d} href={`${base}?gun=${d}`} aria-current={current === d ? "page" : undefined} className={cn("grid min-h-8.5 place-items-center rounded-[7px] px-3 font-medium text-muted no-underline", current === d && "bg-surface text-ink shadow-sm")}>
          {d} gün
        </Link>
      ))}
    </div>
  );
}

/** Yatay çubuklu sıralı liste */
export function BarList({ rows, empty, format = (s) => s, note }: { rows: { label: string; value: number; note?: string }[]; empty: string; format?: (s: string) => string; note?: (r: { label: string; value: number; note?: string }) => string | undefined }) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  const nf = new Intl.NumberFormat("tr-TR");
  if (!rows.length) return <p className="m-0 px-4 py-5 text-[14px] text-muted">{empty}</p>;
  return (
    <ul className="m-0 grid list-none gap-2.5 p-4">
      {rows.map((r) => (
        <li key={r.label} className="min-w-0">
          <div className="flex items-baseline justify-between gap-3 text-[14px]">
            <span className="min-w-0 truncate text-ink" title={format(r.label)}>
              {format(r.label)}
            </span>
            <span className="tabular shrink-0 text-muted">{nf.format(r.value)}</span>
          </div>
          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-sunken" aria-hidden>
            <div className="h-full rounded-full bg-accent" style={{ width: `${(r.value / max) * 100}%` }} />
          </div>
          {note?.(r) ? <p className="mt-0.5 mb-0 text-[12px] text-muted">{note(r)}</p> : null}
        </li>
      ))}
    </ul>
  );
}
