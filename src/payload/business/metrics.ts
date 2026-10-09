import type { Payload, PayloadRequest, Where } from "payload";
import { SOURCES } from "../crm/stages";
import { dayOf } from "../ops/dates";

/**
 * Guru Business göstergeleri: yönetici panosu, ay sonu raporu ve sabah özeti
 * aynı hesapları kullanır. Tutarlar KDV hariç, kazanılan fırsatın tutarıdır.
 * Dönemler İstanbul saatine göre.
 */

export type Range = { from: string; to: string };
export type Period = Range & { key: string; label: string; prev: Range };

const TZ = "Europe/Istanbul";
const monthStart = (y: number, m: number) => new Date(`${y}-${String(m).padStart(2, "0")}-01T00:00:00+03:00`).toISOString();
const monthLabel = (y: number, m: number) => new Intl.DateTimeFormat("tr-TR", { month: "long", year: "numeric", timeZone: TZ }).format(new Date(Date.UTC(y, m - 1, 15)));

export function periodOf(key: string): Period {
  const [y, m] = dayOf(new Date()).split("-").map(Number);
  const month = (yy: number, mm: number, k: string): Period => {
    const py = mm === 1 ? yy - 1 : yy;
    const pm = mm === 1 ? 12 : mm - 1;
    const ny = mm === 12 ? yy + 1 : yy;
    const nm = mm === 12 ? 1 : mm + 1;
    return { key: k, label: monthLabel(yy, mm), from: monthStart(yy, mm), to: monthStart(ny, nm), prev: { from: monthStart(py, pm), to: monthStart(yy, mm) } };
  };
  const ay = key.match(/^ay:(\d{4})-(\d{2})$/);
  if (ay) return month(Number(ay[1]), Number(ay[2]), key);
  if (key === "gecen-ay") return month(m === 1 ? y - 1 : y, m === 1 ? 12 : m - 1, key);
  if (key === "30-gun") {
    const to = new Date().toISOString();
    const from = new Date(Date.now() - 30 * 86400000).toISOString();
    return { key, label: "Son 30 gün", from, to, prev: { from: new Date(Date.now() - 60 * 86400000).toISOString(), to: from } };
  }
  return month(y, m, "bu-ay");
}

/* Her hesap bir işletme için: tenant zorunlu */
type Q = { payload: Payload; req?: PayloadRequest; tenant: number | string };
const scoped = (q: Q) => (x?: Where): Where => (x ? { and: [x, { tenant: { equals: q.tenant } }] } : { tenant: { equals: q.tenant } });
const base = (q: Q) => ({ req: q.req, overrideAccess: true, pagination: false as const, limit: 5000 });
const inRange = (field: string, r: Range) => ({ and: [{ [field]: { greater_than_equal: r.from } }, { [field]: { less_than: r.to } }] });
const sourceLabel = (v?: string | null) => SOURCES.find((s) => s.value === v)?.label ?? "Elle eklendi";

export async function periodMetrics(q: Q, r: Range) {
  const { payload } = q;
  const w = scoped(q);
  const [won, lost, leads, bookings, convs, quotes, tasksDone, projectsDone] = await Promise.all([
    payload.find({ collection: "deals", where: w({ and: [{ stage: { equals: "kazanildi" } }, inRange("closedAt", r)] }), depth: 1, ...base(q) }),
    payload.count({ collection: "deals", where: w({ and: [{ stage: { equals: "kaybedildi" } }, inRange("closedAt", r)] }), req: q.req, overrideAccess: true }),
    payload.find({ collection: "leads", where: w(inRange("createdAt", r)), depth: 0, select: { source: true }, ...base(q) }),
    payload.count({ collection: "bookings", where: w(inRange("createdAt", r)), req: q.req, overrideAccess: true }),
    payload.find({ collection: "conversations", where: w(inRange("createdAt", r)), depth: 0, select: { handedOffAt: true, lead: true, booking: true }, ...base(q) }),
    payload.find({ collection: "quotes", where: w({ and: [{ status: { in: ["gonderildi", "kabul", "red"] } }, inRange("issueDate", r)] }), depth: 0, select: { subtotal: true }, ...base(q) }),
    payload.find({ collection: "tasks", where: w(inRange("completedAt", r)), depth: 0, select: { completedAt: true, dueDate: true }, ...base(q) }),
    payload.find({ collection: "projects", where: w(inRange("completedAt", r)), depth: 0, select: { startDate: true, completedAt: true, createdAt: true }, ...base(q) }),
  ]);

  const wonDeals = won.docs.map((d) => {
    const contact = d.contact && typeof d.contact === "object" ? d.contact : null;
    const company = d.company && typeof d.company === "object" ? d.company : null;
    return { id: d.id, title: d.title, value: d.value ?? 0, closedAt: d.closedAt ?? "", who: company?.name ?? contact?.name ?? "", source: sourceLabel(contact?.source) };
  });
  const bySource = new Map<string, { value: number; count: number }>();
  for (const d of wonDeals) {
    const row = bySource.get(d.source) ?? { value: 0, count: 0 };
    row.value += d.value;
    row.count++;
    bySource.set(d.source, row);
  }
  const chatLeads = leads.docs.filter((l) => (l.source ?? "").startsWith("Sohbet")).length;
  const handed = convs.docs.filter((c) => c.handedOffAt).length;
  const withDue = tasksDone.docs.filter((t) => t.dueDate && t.completedAt);
  const onTime = withDue.filter((t) => dayOf(t.completedAt!) <= dayOf(t.dueDate!)).length;
  const delivery = projectsDone.docs
    .map((p) => (Date.parse(p.completedAt!) - Date.parse(p.startDate ?? p.createdAt)) / 86400000)
    .filter((v) => v >= 0);

  return {
    wonValue: wonDeals.reduce((s, d) => s + d.value, 0),
    wonCount: wonDeals.length,
    wonDeals: wonDeals.sort((a, b) => b.value - a.value),
    lostCount: lost.totalDocs,
    revenueBySource: [...bySource.entries()].map(([label, v]) => ({ label, ...v })).sort((a, b) => b.value - a.value),
    leads: leads.docs.length,
    leadsFromChat: chatLeads,
    leadsFromForm: leads.docs.length - chatLeads,
    bookings: bookings.totalDocs,
    conversations: convs.docs.length,
    handoffs: handed,
    botResolvedPct: convs.docs.length ? Math.round(((convs.docs.length - handed) / convs.docs.length) * 100) : null,
    chatConverted: convs.docs.filter((c) => c.lead || c.booking).length,
    quotesSent: quotes.docs.length,
    quotesValue: quotes.docs.reduce((s, x) => s + (x.subtotal ?? 0), 0),
    tasksDone: tasksDone.docs.length,
    onTimePct: withDue.length ? Math.round((onTime / withDue.length) * 100) : null,
    projectsDone: projectsDone.docs.length,
    avgDeliveryDays: delivery.length ? Math.round(delivery.reduce((a, b) => a + b, 0) / delivery.length) : null,
  };
}
export type PeriodMetrics = Awaited<ReturnType<typeof periodMetrics>>;

/** Şu anki durum (döneme bağlı olmayan) */
export async function snapshot(q: Q) {
  const { payload } = q;
  const w = scoped(q);
  const today = dayOf(new Date());
  const startToday = new Date(`${today}T00:00:00+03:00`).toISOString();
  const endToday = new Date(`${today}T23:59:59+03:00`).toISOString();
  const c = (collection: Parameters<Payload["count"]>[0]["collection"], where: Where) =>
    payload.count({ collection, where: w(where), req: q.req, overrideAccess: true }).then((r) => r.totalDocs);
  const [openDeals, newLeads, waitingChats, openTasks, lateTasks, review, activeProjects, crmToday, opsToday, meetings, pendingQuotes] = await Promise.all([
    payload.find({ collection: "deals", where: w({ stage: { in: ["aday", "gorusme", "teklif"] } }), depth: 0, select: { value: true }, ...base(q) }),
    c("leads", { status: { equals: "yeni" } }),
    c("conversations", { needsReply: { equals: true } }),
    c("tasks", { stage: { not_equals: "tamam" } }),
    c("tasks", { and: [{ stage: { not_equals: "tamam" } }, { dueDate: { less_than: startToday } }] }),
    c("tasks", { stage: { equals: "kontrol" } }),
    payload.find({ collection: "projects", where: w({ status: { equals: "aktif" } }), depth: 0, select: { company: true, contact: true }, ...base(q) }),
    c("activities", { and: [{ done: { equals: false } }, { dueAt: { less_than_equal: endToday } }] }),
    c("tasks", { and: [{ stage: { not_equals: "tamam" } }, { dueDate: { greater_than_equal: startToday } }, { dueDate: { less_than_equal: endToday } }] }),
    c("bookings", { and: [{ slot: { like: today } }, { status: { in: ["bekliyor", "onaylandi"] } }] }),
    payload.find({ collection: "quotes", where: w({ status: { equals: "gonderildi" } }), depth: 0, select: { subtotal: true }, ...base(q) }),
  ]);
  const customers = new Set(activeProjects.docs.map((p) => `${p.company ?? ""}|${p.company ? "" : (p.contact ?? p.id)}`));
  return {
    openPipeline: openDeals.docs.reduce((s, d) => s + (d.value ?? 0), 0),
    openDeals: openDeals.docs.length,
    pendingQuotes: pendingQuotes.docs.length,
    pendingQuotesValue: pendingQuotes.docs.reduce((s, x) => s + (x.subtotal ?? 0), 0),
    newLeads,
    waitingChats,
    openTasks,
    lateTasks,
    review,
    activeProjects: activeProjects.docs.length,
    activeCustomers: customers.size,
    todayWork: crmToday + opsToday,
    todayMeetings: meetings,
  };
}
export type Snapshot = Awaited<ReturnType<typeof snapshot>>;

export const money = (n: number) => new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 }).format(n);
export const change = (now: number, before: number) => (before > 0 ? Math.round(((now - before) / before) * 100) : null);
