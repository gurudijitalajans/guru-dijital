import "server-only";
import { businessDays, dayOf, mondayOf, shiftDays } from "@/payload/ops/dates";

/**
 * Ekip yükü hesabı (mevcut Ekip planıyla aynı kural): görevin tahmini saati
 * başlangıç ile teslim arasındaki iş günlerine eşit dağıtılır; bir haftaya
 * düşen pay o haftanın yüküdür. Tarihi olmayan görev bugüne sayılır.
 */
export type LoadTask = { id: number; seq?: number | null; title: string; stage: string; startDate?: string | null; dueDate?: string | null; hours?: number | null; assignee?: unknown; project?: unknown };
export type WeekLoad = { monday: string; days: string[] };
export type PersonLoad = { hours: number[]; tasks: { id: number; code: string; title: string; project: string; share: number[]; due: string | null; hasEstimate: boolean }[]; noEstimate: number };

const idOf = (v: unknown) => (v && typeof v === "object" ? (v as { id: number }).id : (v as number | undefined));
const nameOf = (v: unknown) => (v && typeof v === "object" ? ((v as { title?: string }).title ?? "") : "");

export function weeksFrom(startDay: string, count: number): WeekLoad[] {
  const first = mondayOf(startDay);
  return Array.from({ length: count }, (_, i) => {
    const monday = shiftDays(first, i * 7);
    return { monday, days: businessDays(monday, shiftDays(monday, 4)) };
  });
}

export function span(t: LoadTask, today: string): [string, string] {
  const due = t.dueDate ? dayOf(t.dueDate) : t.startDate ? dayOf(t.startDate) : today;
  const start = t.startDate ? dayOf(t.startDate) : due;
  return start <= due ? [start, due] : [due, due];
}

export function computeLoad(tasks: LoadTask[], weeks: WeekLoad[], today: string) {
  const byPerson = new Map<number, PersonLoad>();
  const unassigned: LoadTask[] = [];
  for (const t of tasks) {
    const who = idOf(t.assignee);
    if (!who) {
      unassigned.push(t);
      continue;
    }
    const [s, e] = span(t, today);
    const days = businessDays(s, e);
    const per = weeks.map((w) => days.filter((d) => w.days.includes(d)).length);
    if (!per.some(Boolean)) continue;
    const row = byPerson.get(who) ?? { hours: weeks.map(() => 0), tasks: [], noEstimate: 0 };
    const share = per.map((n) => (t.hours ? (t.hours * n) / Math.max(1, days.length) : 0));
    share.forEach((h, i) => (row.hours[i] += h));
    if (!t.hours) row.noEstimate++;
    row.tasks.push({ id: t.id, code: t.seq ? `G-${t.seq}` : "", title: t.title, project: nameOf(t.project), share, due: t.dueDate ? dayOf(t.dueDate) : null, hasEstimate: Boolean(t.hours) });
    byPerson.set(who, row);
  }
  return { byPerson, unassigned };
}
