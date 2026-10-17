import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardHeader } from "./card";
import type { CheckItem } from "@/payload/setup/checklists";

/** Kurulum listesi: ilerleme çubuğu ve maddeler (bitenler soluk) */
export function Checklist({ title, items, note }: { title: string; items: CheckItem[]; note?: string }) {
  const done = items.filter((i) => i.done).length;
  return (
    <Card>
      <CardHeader title={title} action={<span className="tabular text-[13px] text-muted">{done}/{items.length} tamam</span>} />
      <div className="px-4 pt-3">
        <div className="h-2 overflow-hidden rounded-full bg-sunken" aria-hidden>
          <div className="h-full rounded-full bg-good" style={{ width: `${items.length ? (done / items.length) * 100 : 0}%` }} />
        </div>
        {note ? <p className="mt-2 mb-0 text-[13px] text-muted">{note}</p> : null}
      </div>
      <ul className="m-0 grid list-none gap-2 p-4 md:grid-cols-2 xl:grid-cols-3">
        {items.map((i) => {
          const body = (
            <>
              <span className={cn("mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border", i.done ? "border-good bg-good text-white" : "border-line")} aria-hidden>
                {i.done ? <Check className="size-3.5" /> : null}
              </span>
              <span className="min-w-0">
                <span className="sr-only">{i.done ? "Tamamlandı: " : "Bekliyor: "}</span>
                <span className={cn("block font-medium", i.done ? "text-muted" : "text-ink")}>{i.title}</span>
                <span className="block text-[13px] text-muted">{i.detail}</span>
              </span>
            </>
          );
          return (
            <li key={i.title}>
              {i.href ? (
                <a href={i.href} className="flex h-full min-h-14 items-start gap-2.5 rounded-[9px] border border-line px-3 py-2.5 no-underline hover:border-accent">
                  {body}
                </a>
              ) : (
                <div className="flex h-full min-h-14 items-start gap-2.5 rounded-[9px] border border-line px-3 py-2.5">{body}</div>
              )}
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
