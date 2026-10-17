"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { CalendarClock, Check, CheckSquare, Mail, Phone, Users } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { completeActivity, rescheduleActivity } from "./actions";

export type TodoRow = { id: number; type: string; typeLabel: string; title: string; body: string; due: string | null; owner: string; link: { href: string; label: string } | null };

const TZ = "Europe/Istanbul";
const ICON: Record<string, React.ComponentType<{ className?: string }>> = { arama: Phone, toplanti: Users, eposta: Mail, gorev: CheckSquare };
const dayKey = (d: Date) => new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(d);
const time = (iso: string) => new Intl.DateTimeFormat("tr-TR", { timeZone: TZ, hour: "2-digit", minute: "2-digit" }).format(new Date(iso));
const dayLabel = (iso: string) => new Intl.DateTimeFormat("tr-TR", { timeZone: TZ, weekday: "short", day: "numeric", month: "short" }).format(new Date(iso));

/* Gruplar İstanbul gününe göre: geciken (şu andan önce), bugün, yarın, bu hafta (pazara kadar), sonra */
function groupOf(due: string | null, now: Date): string {
  if (!due) return "sonra";
  const d = new Date(due);
  if (d.getTime() < now.getTime()) return "geciken";
  const today = dayKey(now);
  const k = dayKey(d);
  if (k === today) return "bugun";
  if (k === dayKey(new Date(now.getTime() + 86400000))) return "yarin";
  const dow = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(new Intl.DateTimeFormat("en-US", { timeZone: TZ, weekday: "short" }).format(now));
  const daysToSunday = (7 - dow) % 7;
  return k <= dayKey(new Date(now.getTime() + daysToSunday * 86400000)) ? "hafta" : "sonra";
}
const GROUPS: [string, string][] = [
  ["geciken", "Geciken"],
  ["bugun", "Bugün"],
  ["yarin", "Yarın"],
  ["hafta", "Bu hafta"],
  ["sonra", "Sonra"],
];

/* Erteleme: bugünden itibaren gün kayar ("Yarın" gerçekten yarın), saat korunur. İş zaten o gün
   ya da sonrasındaysa teslimden bir gün ileri gider (düğme hiçbir şey yapmamış görünmesin) */
const shift = (due: string | null, days: number) => {
  const d = new Date(Date.now() + days * 86400000);
  if (!due) d.setHours(10, 0, 0, 0);
  else d.setHours(new Date(due).getHours(), new Date(due).getMinutes(), 0, 0);
  if (due && d.getTime() <= new Date(due).getTime()) return new Date(new Date(due).getTime() + days * 86400000).toISOString();
  return d.toISOString();
};
const nextMonday = (due: string | null) => {
  const d = new Date();
  d.setDate(d.getDate() + (((8 - d.getDay()) % 7) || 7));
  const src = due ? new Date(due) : null;
  d.setHours(src ? src.getHours() : 10, src ? src.getMinutes() : 0, 0, 0);
  return d.toISOString();
};

export function Yapilacaklar({ rows, all }: { rows: TodoRow[]; all: boolean }) {
  const router = useRouter();
  const path = usePathname();
  const [pending, start] = useTransition();
  const [doneFor, setDoneFor] = useState<number | null>(null);
  const [result, setResult] = useState("");
  const [now] = useState(() => new Date());

  const run = (job: () => Promise<{ ok: boolean; error?: string }>, done: string, after?: () => void) =>
    start(async () => {
      const r = await job();
      if (!r.ok) return void toast.error(r.error ?? "İşlem yapılamadı.");
      toast.success(done);
      after?.();
      router.refresh();
    });

  const grouped = GROUPS.map(([k, l]) => [k, l, rows.filter((r) => groupOf(r.due, now) === k)] as const).filter(([, , list]) => list.length);

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex rounded-[10px] border border-line bg-surface p-0.5" role="tablist" aria-label="Kimin">
          {[
            [false, "Benim"],
            [true, "Herkes"],
          ].map(([v, l]) => (
            <button key={String(v)} type="button" role="tab" aria-selected={all === v} onClick={() => router.push(v ? `${path}?kim=herkes` : path)} className={cn("min-h-9 rounded-[8px] px-3 text-[14px]", all === v ? "bg-accent-soft font-medium text-accent" : "text-text hover:text-ink")}>
              {l as string}
            </button>
          ))}
        </div>
        <span className="text-[13px] text-muted">
          <span className="tabular">{rows.length}</span> açık
        </span>
      </div>

      {grouped.length ? (
        grouped.map(([k, l, list]) => (
          <section key={k} aria-label={l} className="overflow-hidden rounded-card border border-line bg-surface">
            <h2 className={cn("m-0 flex items-center gap-2 border-b border-line px-4 py-2.5 text-[14px] font-semibold", k === "geciken" ? "bg-bad-soft text-bad" : k === "bugun" ? "bg-accent-soft text-accent" : "text-ink")}>
              {l} <span className="tabular rounded-full bg-surface/80 px-2 text-[12px] font-medium">{list.length}</span>
            </h2>
            <ul className="m-0 list-none p-0">
              {list.map((r) => {
                const Icon = ICON[r.type] ?? CheckSquare;
                return (
                  <li key={r.id} className="border-b border-line px-4 py-3 last:border-b-0">
                    <div className="flex flex-wrap items-start gap-3">
                      <Icon className={cn("mt-0.5 size-4 shrink-0", k === "geciken" ? "text-bad" : "text-accent")} aria-hidden />
                      <div className="min-w-0 flex-1">
                        <p className="m-0 font-medium text-ink">{r.title}</p>
                        <p className="m-0 text-[13px] text-muted">
                          {r.typeLabel} · {r.due ? (k === "bugun" || k === "yarin" ? time(r.due) : `${dayLabel(r.due)} ${time(r.due)}`) : "tarih yok"}
                          {all && r.owner ? ` · ${r.owner}` : ""}
                          {r.link ? (
                            <>
                              {" · "}
                              <Link href={r.link.href} className="text-accent">
                                {r.link.label || "Kaydı aç"}
                              </Link>
                            </>
                          ) : null}
                        </p>
                        {r.body ? <p className="m-0 mt-0.5 line-clamp-2 text-[13px] text-text">{r.body}</p> : null}
                      </div>
                      {doneFor !== r.id ? (
                        <span className="flex flex-wrap gap-1.5">
                          <Button size="sm" variant="ghost" disabled={pending} onClick={() => run(() => rescheduleActivity(r.id, shift(r.due, 1)), "Yarına alındı.")} title="Aynı saatte yarına al">
                            <CalendarClock /> Yarın
                          </Button>
                          <Button size="sm" variant="ghost" disabled={pending} onClick={() => run(() => rescheduleActivity(r.id, nextMonday(r.due)), "Pazartesiye alındı.")}>
                            Pzt
                          </Button>
                          <Button size="sm" disabled={pending} onClick={() => setDoneFor(r.id)}>
                            <Check /> Tamamla
                          </Button>
                        </span>
                      ) : null}
                    </div>
                    {doneFor === r.id ? (
                      <div className="mt-2 grid gap-2 pl-7">
                        <label className="grid gap-1 text-[13px] text-muted">
                          Sonuç (isteğe bağlı)
                          <textarea id={`yapilacak-sonuc-${r.id}`} rows={2} value={result} onChange={(e) => setResult(e.target.value)} placeholder="Arandı, teklif istedi; ulaşılamadı…" className="block w-full rounded-[9px] border border-line bg-surface px-3 py-2 text-[14px] text-ink focus:border-accent focus:outline-none pointer-coarse:text-[16px]" />
                        </label>
                        <div className="flex flex-wrap gap-2">
                          <Button size="sm" variant="primary" disabled={pending} onClick={() => run(() => completeActivity(r.id, result), "Tamamlandı.", () => (setDoneFor(null), setResult("")))}>
                            Tamamla
                          </Button>
                          {r.link ? (
                            <Button size="sm" disabled={pending} onClick={() => run(() => completeActivity(r.id, result), "Tamamlandı; sonraki adımı kayıttan planlayın.", () => router.push(r.link!.href))}>
                              Tamamla, kayda git
                            </Button>
                          ) : null}
                          <Button size="sm" variant="ghost" onClick={() => setDoneFor(null)}>
                            Vazgeç
                          </Button>
                        </div>
                      </div>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          </section>
        ))
      ) : (
        <div className="grid place-items-center gap-2 rounded-card border border-line bg-surface px-6 py-14 text-center">
          <Check className="size-6 text-good" aria-hidden />
          <p className="m-0 font-medium text-ink">Yapılacak bir şey yok</p>
          <p className="m-0 max-w-[48ch] text-[14px] text-muted">Fırsat ya da kişi kartında &quot;Planla&quot; ile arama, toplantı ve takip görevi ekleyin; burada teslim zamanına göre sıralanır.</p>
        </div>
      )}
    </div>
  );
}
