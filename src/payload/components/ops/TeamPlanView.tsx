import Link from "next/link";
import { redirect } from "next/navigation";
import { can } from "../../business/roles";
import { DefaultTemplate } from "@payloadcms/next/templates";
import { Gutter } from "@payloadcms/ui";
import type { AdminViewServerProps } from "payload";
import { daysAgoIso } from "../../utils";
import { businessDays, dayOf, mondayOf, shiftDays } from "../../ops/dates";
import { taskCode } from "../../ops/stages";

/**
 * Panel > Ekip planı (/admin/ekip-plani). Haftalık doluluk (görevlerin tahmini
 * saatleri başlangıç-teslim arasındaki iş günlerine eşit dağıtılır), haftanın
 * zaman çizelgesi ve süreç sağlığı (son 30 günde zamanında biten iş oranı).
 */
type T = { id: number | string; seq?: number | null; title: string; stage: string; startDate?: string | null; dueDate?: string | null; hours?: number | null; assignee?: unknown; completedAt?: string | null; project?: unknown };
const idOf = (v: unknown) => (v && typeof v === "object" ? (v as { id: number | string }).id : (v as number | string | undefined));
const dayFmt = new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "short", timeZone: "UTC" });
const wdFmt = new Intl.DateTimeFormat("tr-TR", { weekday: "short", timeZone: "UTC" });
const weekFmt = new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "long", timeZone: "UTC" });
const nf = new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 1 });

/** Görevin [başlangıç, teslim] aralığı; eksikse tek gün */
function span(t: T, today: string): [string, string] {
  const due = t.dueDate ? dayOf(t.dueDate) : t.startDate ? dayOf(t.startDate) : today;
  const start = t.startDate ? dayOf(t.startDate) : due;
  return start <= due ? [start, due] : [due, due];
}

export async function TeamPlanView({ initPageResult, params, searchParams }: AdminViewServerProps) {
  const { req, permissions, visibleEntities, locale } = initPageResult;
  if (!req.user) redirect("/admin/login?redirect=%2Fadmin%2Fekip-plani");
  /* Modülü olmayan kullanıcı panoya döner */
  if (!can(req.user, "ops")) redirect("/admin");

  const today = dayOf(new Date());
  const asked = typeof searchParams?.hafta === "string" && /^\d{4}-\d{2}-\d{2}$/.test(searchParams.hafta) ? searchParams.hafta : today;
  const monday = mondayOf(asked);
  const week = businessDays(monday, shiftDays(monday, 4));

  const [users, open, weekTasks, done30, lateOpen] = await Promise.all([
    req.payload.find({ collection: "users", limit: 100, depth: 0, pagination: false, req, select: { name: true, weeklyHours: true } }),
    req.payload.find({ collection: "tasks", where: { stage: { not_equals: "tamam" } }, limit: 2000, depth: 0, pagination: false, req }),
    req.payload.find({
      collection: "tasks",
      where: { and: [{ or: [{ dueDate: { greater_than_equal: `${monday}T00:00:00.000Z` } }, { stage: { not_equals: "tamam" } }] }] },
      limit: 2000,
      depth: 1,
      pagination: false,
      req,
    }),
    req.payload.find({ collection: "tasks", where: { completedAt: { greater_than_equal: daysAgoIso(30) } }, limit: 2000, depth: 0, pagination: false, req, select: { completedAt: true, dueDate: true } }),
    req.payload.count({ collection: "tasks", where: { and: [{ stage: { not_equals: "tamam" } }, { dueDate: { less_than: `${today}T00:00:00.000Z` } }] }, req }),
  ]);

  /* Doluluk: kişi başına bu haftaya düşen saat */
  const load = new Map<string, { hours: number; tasks: number; noEstimate: number }>();
  for (const t of open.docs as T[]) {
    const who = idOf(t.assignee);
    if (!who) continue;
    const [s, e] = span(t, today);
    const days = businessDays(s, e);
    const inWeek = days.filter((d) => week.includes(d)).length;
    if (!inWeek) continue;
    const row = load.get(String(who)) ?? { hours: 0, tasks: 0, noEstimate: 0 };
    row.tasks++;
    if (t.hours) row.hours += (t.hours * inWeek) / Math.max(1, days.length);
    else row.noEstimate++;
    load.set(String(who), row);
  }

  /* Zaman çizelgesi: bu haftayla kesişen görevler, sorumluya göre */
  const lanes = (weekTasks.docs as T[])
    .map((t) => {
      const [s, e] = span(t, today);
      const from = week.findIndex((d) => d >= s);
      const toIdx = [...week].reverse().findIndex((d) => d <= e);
      const to = toIdx < 0 ? -1 : week.length - 1 - toIdx;
      return { t, from, to, s, e };
    })
    .filter((x) => x.from >= 0 && x.to >= x.from && x.s <= week[week.length - 1] && x.e >= week[0])
    .sort((a, b) => a.from - b.from || a.to - b.to);
  const userName = new Map(users.docs.map((u) => [String(u.id), u.name]));
  const groups = new Map<string, typeof lanes>();
  for (const l of lanes) {
    const k = String(idOf(l.t.assignee) ?? "");
    groups.set(k, [...(groups.get(k) ?? []), l]);
  }

  const withDue = (done30.docs as T[]).filter((t) => t.dueDate && t.completedAt);
  const onTime = withDue.filter((t) => dayOf(t.completedAt!) <= dayOf(t.dueDate!)).length;
  const rate = withDue.length ? Math.round((onTime / withDue.length) * 100) : null;

  return (
    <DefaultTemplate
      i18n={req.i18n}
      locale={locale}
      params={params}
      payload={req.payload}
      permissions={permissions}
      searchParams={searchParams}
      user={req.user ?? undefined}
      visibleEntities={visibleEntities}
    >
      <Gutter>
        <div className="guru-pipe guru-plan">
          <header className="guru-pipe__head">
            <div>
              <h1>Ekip planı</h1>
              <p>{weekFmt.format(new Date(`${week[0]}T12:00:00Z`))} haftası (pazartesiden cumaya)</p>
            </div>
            <nav className="guru-pipe__tools" aria-label="Hafta">
              <Link className="guru-plan__nav" href={`/admin/ekip-plani?hafta=${shiftDays(monday, -7)}`}>
                ← Önceki
              </Link>
              <Link className="guru-plan__nav" href="/admin/ekip-plani">
                Bu hafta
              </Link>
              <Link className="guru-plan__nav" href={`/admin/ekip-plani?hafta=${shiftDays(monday, 7)}`}>
                Sonraki →
              </Link>
            </nav>
          </header>

          <div className="guru-home__cards guru-plan__cards">
            <div className="guru-home__card">
              <span className="guru-home__value">{rate === null ? "Yok" : `%${rate}`}</span>
              <span className="guru-home__label">Zamanında biten</span>
              <span className="guru-home__hint">{withDue.length ? `son 30 günde ${withDue.length} görevden ${onTime}` : "son 30 günde teslim tarihli görev bitmedi"}</span>
            </div>
            <Link href="/admin/operasyon" className="guru-home__card">
              <span className="guru-home__value">{lateOpen.totalDocs}</span>
              <span className="guru-home__label">Geciken görev</span>
              <span className="guru-home__hint">teslim tarihi geçmiş, açık</span>
            </Link>
            <Link href="/admin/operasyon" className="guru-home__card">
              <span className="guru-home__value">{open.docs.filter((t) => t.stage === "kontrol").length}</span>
              <span className="guru-home__label">Onay bekleyen</span>
              <span className="guru-home__hint">Kontrol aşamasında</span>
            </Link>
          </div>

          <section className="guru-home__panel">
            <div className="guru-home__panel-head">
              <h2>Ekip kapasitesi</h2>
              <span className="guru-home__meta">tahmini saat / haftalık çalışma saati</span>
            </div>
            <ul className="guru-plan__cap">
              {users.docs.map((u) => {
                const row = load.get(String(u.id)) ?? { hours: 0, tasks: 0, noEstimate: 0 };
                const cap = u.weeklyHours ?? 40;
                const pct = cap > 0 ? Math.round((row.hours / cap) * 100) : 0;
                const tone = pct > 100 ? "is-over" : pct >= 85 ? "is-full" : "";
                return (
                  <li key={u.id} className={tone}>
                    <span className="guru-plan__who">{u.name}</span>
                    <span className="guru-plan__bar" aria-hidden>
                      <span style={{ width: `${Math.min(pct, 100)}%` }} />
                    </span>
                    <span className="guru-plan__pct">%{pct}</span>
                    <small>
                      {nf.format(row.hours)} / {cap} saat · {row.tasks} görev
                      {row.noEstimate ? ` · ${row.noEstimate} görevde tahmin yok` : ""}
                      {pct > 100 ? " · aşırı yük" : ""}
                    </small>
                  </li>
                );
              })}
            </ul>
          </section>

          <section className="guru-home__panel">
            <div className="guru-home__panel-head">
              <h2>Haftanın çizelgesi</h2>
              <Link href="/admin/operasyon">Görev panosu</Link>
            </div>
            {lanes.length === 0 ? (
              <p className="guru-home__empty">Bu hafta planlanmış görev yok.</p>
            ) : (
              <div className="guru-plan__scroll">
                <div className="guru-plan__grid" role="table" aria-label="Haftanın çizelgesi">
                  <div className="guru-plan__head" role="row">
                    <span role="columnheader">Görev</span>
                    {week.map((d) => (
                      <span key={d} role="columnheader" className={d === today ? "is-today" : undefined}>
                        {wdFmt.format(new Date(`${d}T12:00:00Z`))} {dayFmt.format(new Date(`${d}T12:00:00Z`))}
                      </span>
                    ))}
                  </div>
                  {[...groups.entries()].map(([who, rows]) => (
                    <div key={who || "yok"} className="guru-plan__group" role="rowgroup">
                      <p className="guru-plan__lane">{userName.get(who) ?? "Atanmamış"}</p>
                      {rows.map(({ t, from, to, e }) => {
                        const late = t.stage !== "tamam" && e < today;
                        return (
                          <div key={t.id} className="guru-plan__row" role="row">
                            <Link role="cell" href={`/admin/collections/tasks/${t.id}`} className="guru-plan__task">
                              <small>{taskCode(t.seq)}</small> {t.title}
                            </Link>
                            {week.map((d, i) => (
                              <span key={d} role="cell" className={`guru-plan__cell${d === today ? " is-today" : ""}`}>
                                {i === from ? (
                                  <span
                                    className={`guru-plan__span guru-plan__span--${t.stage}${late ? " is-late" : ""}`}
                                    style={{ width: `calc(${(to - from + 1) * 100}% + ${(to - from) * 4 - 8}px)` }}
                                    title={`${t.title}${late ? " (gecikti)" : ""}`}
                                  />
                                ) : null}
                              </span>
                            ))}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            )}
            <p className="guru-home__meta guru-plan__legend">
              <span className="guru-plan__key guru-plan__span--yapilacak" /> Yapılacak <span className="guru-plan__key guru-plan__span--devam" /> Devam{" "}
              <span className="guru-plan__key guru-plan__span--kontrol" /> Kontrol <span className="guru-plan__key guru-plan__span--tamam" /> Tamam{" "}
              <span className="guru-plan__key is-late" /> Gecikti
            </p>
          </section>
        </div>
      </Gutter>
    </DefaultTemplate>
  );
}
