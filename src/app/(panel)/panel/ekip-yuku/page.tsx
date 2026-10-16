import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { requireModule } from "@/panel/context";
import { PageHeader } from "@/panel/ui/page-header";
import { Stat } from "@/panel/ui/card";
import { Badge } from "@/panel/ui/badge";
import { Button } from "@/panel/ui/button";
import { computeLoad, weeksFrom, type LoadTask } from "@/panel/ops/load";
import { dayOf, shiftDays } from "@/payload/ops/dates";
import { daysAgoIso } from "@/payload/utils";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Ekip yükü" };
export const dynamic = "force-dynamic";

const WEEKS = 4;
const nf = new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 1 });
const dFmt = new Intl.DateTimeFormat("tr-TR", { timeZone: "UTC", day: "numeric", month: "short" });
const fmt = (d: string) => dFmt.format(new Date(`${d}T12:00:00Z`));
const weekLabel = (days: string[]) => (days.length ? `${fmt(days[0])} - ${fmt(days[days.length - 1])}` : "");
const tone = (ratio: number) => (ratio > 1 ? "bad" : ratio > 0.85 ? "warn" : "good");
const BAR: Record<string, string> = { good: "bg-good", warn: "bg-warn", bad: "bg-bad" };

/**
 * Ekip yükü: kişi başına bu hafta ve sonraki üç haftanın planlanan saati,
 * haftalık kapasitesine göre. Satırı açınca saatin hangi görevlerden geldiği.
 */
export default async function TeamLoadPage({ searchParams }: { searchParams: Promise<{ hafta?: string }> }) {
  const ctx = await requireModule("ops");
  const sp = await searchParams;
  const today = dayOf(new Date());
  const startDay = sp.hafta && /^\d{4}-\d{2}-\d{2}$/.test(sp.hafta) ? sp.hafta : today;
  const weeks = weeksFrom(startDay, WEEKS);

  const [team, open, done30, lateOpen] = await Promise.all([
    ctx.team(),
    ctx.find("tasks", { where: { stage: { not_equals: "tamam" } }, limit: 2000, depth: 1 }),
    ctx.find("tasks", { where: { completedAt: { greater_than_equal: daysAgoIso(30) } }, limit: 2000, select: { completedAt: true, dueDate: true } }),
    ctx.count("tasks", { and: [{ stage: { not_equals: "tamam" } }, { dueDate: { less_than: `${today}T00:00:00.000Z` } }] }),
  ]);
  const { byPerson, unassigned } = computeLoad(open.docs as LoadTask[], weeks, today);

  const withDue = (done30.docs as { completedAt?: string | null; dueDate?: string | null }[]).filter((t) => t.dueDate && t.completedAt);
  const onTime = withDue.filter((t) => dayOf(t.completedAt!) <= dayOf(t.dueDate!)).length;
  const rate = withDue.length ? Math.round((onTime / withDue.length) * 100) : null;
  const noEstimate = [...byPerson.values()].reduce((a, p) => a + p.noEstimate, 0);
  const over = team.filter((m) => (byPerson.get(m.id)?.hours[0] ?? 0) > m.weeklyHours).length;

  const prev = shiftDays(weeks[0].monday, -7);
  const next = shiftDays(weeks[0].monday, 7);
  const isCurrent = weeks[0].days.includes(today) || weeks[0].monday <= today && today <= shiftDays(weeks[0].monday, 6);

  return (
    <>
      <PageHeader
        title="Ekip yükü"
        description="Görevin tahmini saati başlangıç ile teslim arasındaki iş günlerine eşit dağıtılır. Kapasite kişinin haftalık çalışma saatidir."
        actions={
          <>
            <Button asChild size="sm">
              <Link href={`/panel/ekip-yuku?hafta=${prev}`} aria-label="Önceki hafta">
                <ChevronLeft /> Önceki
              </Link>
            </Button>
            {!isCurrent ? (
              <Button asChild size="sm">
                <Link href="/panel/ekip-yuku">Bu hafta</Link>
              </Button>
            ) : null}
            <Button asChild size="sm">
              <Link href={`/panel/ekip-yuku?hafta=${next}`} aria-label="Sonraki hafta">
                Sonraki <ChevronRight />
              </Link>
            </Button>
          </>
        }
      />

      <div className="mb-4 grid grid-cols-2 gap-3 xl:grid-cols-4">
        <Stat label="Zamanında teslim" value={rate === null ? "Veri yok" : `%${rate}`} hint={`son 30 gün, ${withDue.length} görev`} />
        <Stat label="Geciken açık görev" value={nf.format(lateOpen)} hint="teslim tarihi geçti" />
        <Stat label="Kapasitesi aşılan" value={nf.format(over)} hint={`kişi, ${weekLabel(weeks[0].days)}`} />
        <Stat label="Saati girilmemiş görev" value={nf.format(noEstimate)} hint="yüke sayılmıyor" />
      </div>

      <section className="overflow-x-auto rounded-card border border-line bg-surface">
        <div className="min-w-[640px]">
          <div className="grid grid-cols-[minmax(150px,1.2fr)_repeat(4,minmax(0,1fr))] border-b border-line bg-sunken text-[12px] font-medium text-muted">
            <div className="px-4 py-2.5">Kişi</div>
            {weeks.map((w, i) => (
              <div key={w.monday} className={cn("px-3 py-2.5 tabular", i === 0 && "text-ink")}>
                {weekLabel(w.days)}
              </div>
            ))}
          </div>
          {team.length ? (
            team.map((m) => {
              const row = byPerson.get(m.id);
              return (
                <details key={m.id} className="group border-b border-line last:border-0">
                  <summary className="grid cursor-pointer list-none grid-cols-[minmax(150px,1.2fr)_repeat(4,minmax(0,1fr))] items-center hover:bg-sunken [&::-webkit-details-marker]:hidden">
                    <div className="flex min-w-0 items-center gap-2 px-4 py-3">
                      <ChevronDown className="size-4 shrink-0 text-muted transition-transform group-open:rotate-180" aria-hidden />
                      <span className="min-w-0">
                        <span className="block truncate font-medium text-ink">{m.name}</span>
                        <span className="block text-[12px] text-muted">
                          {row ? `${row.tasks.length} görev` : "Görev yok"} · {m.weeklyHours} sa/hafta
                        </span>
                      </span>
                    </div>
                    {weeks.map((w, i) => {
                      const h = row?.hours[i] ?? 0;
                      const ratio = m.weeklyHours ? h / m.weeklyHours : 0;
                      const t = tone(ratio);
                      return (
                        <div key={w.monday} className="px-3 py-3">
                          <span className="tabular text-[13px] text-ink">
                            {nf.format(h)} <span className="text-muted">/ {m.weeklyHours} sa</span>
                          </span>
                          <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-sunken" role="img" aria-label={`%${Math.round(ratio * 100)} dolu`}>
                            <div className={cn("h-full rounded-full", BAR[t])} style={{ width: `${Math.min(100, ratio * 100)}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </summary>
                  <div className="border-t border-line bg-bg py-2">
                    {row?.tasks.length ? (
                      <ul className="m-0 list-none p-0">
                        {row.tasks.map((t) => (
                          <li key={t.id}>
                            {/* Başlıktaki hafta sütunlarıyla aynı ızgara: saatler doğru haftanın altında */}
                            <Link href={`/panel/gorevler?gorev=${t.id}`} className="grid grid-cols-[minmax(150px,1.2fr)_repeat(4,minmax(0,1fr))] items-center no-underline hover:bg-surface">
                              <span className="min-w-0 truncate py-1.5 pr-3 pl-10 text-[14px] text-ink">
                                <span className="font-mono text-[12px] text-muted">{t.code}</span> {t.title}
                                {t.project ? <span className="text-muted"> · {t.project}</span> : null}
                              </span>
                              {t.hasEstimate ? (
                                t.share.map((h, i) => (
                                  <span key={i} className={cn("tabular px-3 py-1.5 text-[13px]", h ? "text-ink" : "text-muted")}>
                                    {h ? `${nf.format(h)} sa` : "·"}
                                  </span>
                                ))
                              ) : (
                                <span className="col-span-4 px-3 py-1.5">
                                  <Badge tone="warn">Saat girilmedi</Badge>
                                </span>
                              )}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="m-0 px-4 py-1.5 text-[14px] text-muted">Bu haftalarda görevi yok.</p>
                    )}
                  </div>
                </details>
              );
            })
          ) : (
            <p className="m-0 px-4 py-6 text-muted">Bu işletmede ekip üyesi yok. Ayarlar &gt; Ekip ve yetkiler&apos;den davet edin.</p>
          )}
        </div>
      </section>
      <p className="mt-3 flex flex-wrap items-center gap-2 text-[13px] text-muted">
        <Badge tone="good">%85 altı</Badge>
        <Badge tone="warn">%85 üstü</Badge>
        <Badge tone="bad">Kapasite aşıldı, iş dağıtılmalı</Badge>
        {unassigned.length ? (
          <Link href="/panel/gorevler" className="ml-auto text-accent">
            {unassigned.length} görevin sorumlusu yok
          </Link>
        ) : null}
      </p>
    </>
  );
}
