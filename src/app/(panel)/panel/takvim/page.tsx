import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getPanelContext } from "@/panel/context";
import { PageHeader } from "@/panel/ui/page-header";
import { Button } from "@/panel/ui/button";
import { DoneToggle } from "@/panel/calendar/DoneToggle";
import { dayOf, mondayOf, shiftDays } from "@/payload/ops/dates";
import { activityLabel } from "@/payload/crm/stages";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Takvim" };
export const dynamic = "force-dynamic";

const TZ = "Europe/Istanbul";
const wd = new Intl.DateTimeFormat("tr-TR", { timeZone: "UTC", weekday: "short" });
const dm = new Intl.DateTimeFormat("tr-TR", { timeZone: "UTC", day: "numeric", month: "short" });
const long = new Intl.DateTimeFormat("tr-TR", { timeZone: "UTC", day: "numeric", month: "long" });
const hm = new Intl.DateTimeFormat("tr-TR", { timeZone: TZ, hour: "2-digit", minute: "2-digit" });
const noon = (d: string) => new Date(`${d}T12:00:00Z`);
const istDay = (iso: string) => new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(new Date(iso));
const nameOf = (v: unknown) => (v && typeof v === "object" ? ((v as { name?: string; title?: string }).name ?? (v as { title?: string }).title ?? "") : "");
const idOf = (v: unknown) => (v && typeof v === "object" ? ((v as { id?: number }).id ?? null) : ((v as number | null | undefined) ?? null));

type Kind = "randevu" | "crm" | "teslim" | "proje";
type Ev = { key: string; day: string; time: string; title: string; detail: string; href: string; kind: Kind; activity?: { id: number; done: boolean } };
const STYLE: Record<Kind, string> = {
  randevu: "border-l-accent bg-accent-soft",
  crm: "border-l-good bg-good-soft",
  teslim: "border-l-warn bg-warn-soft",
  proje: "border-l-bad bg-bad-soft",
};
const KIND_LABEL: Record<Kind, string> = { randevu: "Randevu", crm: "CRM görevi", teslim: "Görev teslimi", proje: "Proje teslimi" };

/**
 * Takvim: haftanın randevuları (CRM), arama ve toplantılar (CRM), görev ve
 * proje teslimleri (Operasyon). Telefonda günler alt alta.
 */
export default async function CalendarPage({ searchParams }: { searchParams: Promise<{ hafta?: string }> }) {
  const ctx = await getPanelContext();
  const crm = ctx.has("crm");
  const ops = ctx.has("ops");
  if (!crm && !ops) redirect("/panel");
  const sp = await searchParams;
  const today = dayOf(new Date());
  const monday = mondayOf(sp.hafta && /^\d{4}-\d{2}-\d{2}$/.test(sp.hafta) ? sp.hafta : today);
  const days = Array.from({ length: 7 }, (_, i) => shiftDays(monday, i));
  const from = new Date(`${days[0]}T00:00:00+03:00`).toISOString();
  const to = new Date(`${days[6]}T23:59:59+03:00`).toISOString();
  const noonFrom = `${days[0]}T00:00:00.000Z`;
  const noonTo = `${days[6]}T23:59:59.000Z`;
  const none = Promise.resolve({ docs: [] as unknown[] });

  const [books, acts, tasks, projects, who] = await Promise.all([
    crm ? ctx.find("bookings", { where: { and: [{ date: { greater_than_equal: noonFrom } }, { date: { less_than_equal: noonTo } }, { status: { in: ["bekliyor", "onaylandi", "tamamlandi"] } }] }, sort: "date", limit: 300 }) : none,
    crm ? ctx.find("activities", { where: { and: [{ dueAt: { greater_than_equal: from } }, { dueAt: { less_than_equal: to } }, { type: { not_in: ["not", "sistem"] } }, { booking: { exists: false } }] }, sort: "dueAt", limit: 300, depth: 1 }) : none,
    ops ? ctx.find("tasks", { where: { and: [{ dueDate: { greater_than_equal: noonFrom } }, { dueDate: { less_than_equal: noonTo } }] }, limit: 300, depth: 1 }) : none,
    ops ? ctx.find("projects", { where: { and: [{ dueDate: { greater_than_equal: noonFrom } }, { dueDate: { less_than_equal: noonTo } }, { status: { in: ["aktif", "beklemede"] } }] }, limit: 100, depth: 1 }) : none,
    ctx.names(),
  ]);

  const events: Ev[] = [
    ...(books.docs as { id: number; name: string; date: string; time: string; topic?: string | null; status: string }[]).map((b) => ({
      key: `b${b.id}`, day: dayOf(b.date), time: b.time, title: `${b.name}${b.status === "bekliyor" ? " (onay bekliyor)" : ""}`, detail: b.topic ?? "Randevu", href: `/panel/gelen?s=r${b.id}`, kind: "randevu" as const,
    })),
    ...(acts.docs as { id: number; type: string; title: string; dueAt: string; done?: boolean | null; deal?: unknown; contact?: unknown }[]).map((a) => ({
      key: `a${a.id}`, day: istDay(a.dueAt), time: hm.format(new Date(a.dueAt)), title: a.title, detail: [activityLabel(a.type), nameOf(a.deal) || nameOf(a.contact)].filter(Boolean).join(" · "),
      href: idOf(a.deal) ? `/panel/firsatlar?firsat=${idOf(a.deal)}` : idOf(a.contact) ? `/panel/kisiler?kisi=${idOf(a.contact)}` : `/panel/duzenle/activities/${a.id}`,
      kind: "crm" as const, activity: { id: a.id, done: Boolean(a.done) },
    })),
    ...(tasks.docs as { id: number; seq?: number | null; title: string; dueDate: string; stage: string; project?: unknown; assignee?: unknown }[]).map((t) => ({
      key: `t${t.id}`, day: dayOf(t.dueDate), time: "Teslim", title: `${t.seq ? `G-${t.seq} ` : ""}${t.title}${t.stage === "tamam" ? " (tamam)" : ""}`, detail: [nameOf(t.project), who(t.assignee)].filter(Boolean).join(" · "), href: `/panel/gorevler?gorev=${t.id}`, kind: "teslim" as const,
    })),
    ...(projects.docs as { id: number; title: string; dueDate: string; company?: unknown }[]).map((p) => ({
      key: `p${p.id}`, day: dayOf(p.dueDate), time: "Proje", title: p.title, detail: nameOf(p.company) || "Proje teslimi", href: `/panel/projeler?proje=${p.id}`, kind: "proje" as const,
    })),
  ].sort((a, b) => a.time.localeCompare(b.time, "tr"));

  const byDay = new Map(days.map((d) => [d, events.filter((e) => e.day === d)]));
  const isThisWeek = days.includes(today);
  const kinds = (Object.keys(STYLE) as Kind[]).filter((k) => (k === "randevu" || k === "crm" ? crm : ops));

  return (
    <>
      <PageHeader
        title="Takvim"
        description={`${long.format(noon(days[0]))} - ${long.format(noon(days[6]))} haftası`}
        actions={
          <>
            <Button asChild size="sm">
              <Link href={`/panel/takvim?hafta=${shiftDays(monday, -7)}`} aria-label="Önceki hafta">
                <ChevronLeft /> Önceki
              </Link>
            </Button>
            {!isThisWeek ? (
              <Button asChild size="sm">
                <Link href="/panel/takvim">Bu hafta</Link>
              </Button>
            ) : null}
            <Button asChild size="sm">
              <Link href={`/panel/takvim?hafta=${shiftDays(monday, 7)}`} aria-label="Sonraki hafta">
                Sonraki <ChevronRight />
              </Link>
            </Button>
          </>
        }
      />
      <div className="mb-3 flex flex-wrap gap-3 text-[13px] text-muted">
        {kinds.map((k) => (
          <span key={k} className="inline-flex items-center gap-1.5">
            <span className={cn("size-3 rounded-[3px] border-l-[3px]", STYLE[k])} aria-hidden />
            {KIND_LABEL[k]}
          </span>
        ))}
      </div>
      {/* 7 sütun yalnız geniş ekranda; tablette günler yatay kaydırılan şeritte (sütun en az 190px) */}
      <div className="grid gap-2.5 md:snap-x md:auto-cols-[minmax(190px,1fr)] md:grid-flow-col md:overflow-x-auto md:pb-2 xl:auto-cols-auto xl:grid-flow-row xl:grid-cols-7 xl:overflow-visible xl:pb-0">
        {days.map((d) => {
          const list = byDay.get(d) ?? [];
          const weekend = noon(d).getUTCDay() % 6 === 0;
          return (
            <section key={d} aria-label={long.format(noon(d))} className={cn("min-w-0 snap-start rounded-card border border-line bg-surface md:min-h-[260px]", weekend && "bg-sunken", d === today && "border-accent")}>
              <header className={cn("flex items-baseline justify-between gap-2 border-b border-line px-3 py-2", d === today ? "text-accent" : "text-ink")}>
                <span className="font-semibold capitalize">{wd.format(noon(d))}</span>
                <span className="tabular text-[13px] text-muted">{d === today ? "Bugün" : dm.format(noon(d))}</span>
              </header>
              <ul className="m-0 grid list-none grid-cols-[minmax(0,1fr)] gap-1.5 p-1.5">
                {list.map((e) => (
                  <li key={e.key} className={cn("flex min-w-0 items-start gap-2 rounded-[8px] border-l-[3px] px-2 py-1.5 text-[13px]", STYLE[e.kind], e.activity?.done && "opacity-60")}>
                    {e.activity ? <DoneToggle id={e.activity.id} done={e.activity.done} label={e.title} /> : null}
                    <a href={e.href} className="min-w-0 flex-1 no-underline">
                      <span className="tabular block text-[11px] text-muted">{e.time}</span>
                      <span className={cn("block font-medium break-words hyphens-auto text-ink", e.activity?.done && "line-through")}>{e.title}</span>
                      {e.detail ? <span className="block truncate text-muted">{e.detail}</span> : null}
                    </a>
                  </li>
                ))}
                {list.length === 0 ? <li className="hidden px-2 py-2 text-[13px] text-muted lg:block">Boş</li> : null}
              </ul>
            </section>
          );
        })}
      </div>
      {events.length === 0 ? <p className="mt-3 text-[14px] text-muted">Bu hafta randevu, arama ya da teslim yok.</p> : null}
    </>
  );
}
