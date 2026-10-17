import Link from "next/link";
import type { Metadata } from "next";
import { getPanelContext } from "@/panel/context";
import { PageHeader } from "@/panel/ui/page-header";
import { Card, CardHeader, Empty, Stat } from "@/panel/ui/card";
import { Badge, type Tone } from "@/panel/ui/badge";
import { dayKey, daysAgoIso } from "@/payload/utils";
import { OPEN_STAGES } from "@/payload/crm/stages";
import { taskCode } from "@/payload/ops/stages";
import { Checklist } from "@/panel/ui/checklist";
import { onboardingSteps } from "@/payload/setup/checklists";
import { cms } from "@/lib/cms";

export const metadata: Metadata = { title: "Ana sayfa" };
export const dynamic = "force-dynamic";

const TZ = "Europe/Istanbul";
const money = new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 });
const nf = new Intl.NumberFormat("tr-TR");
const dayFmt = new Intl.DateTimeFormat("tr-TR", { timeZone: TZ, day: "numeric", month: "long", weekday: "long" });
const timeFmt = new Intl.DateTimeFormat("tr-TR", { timeZone: TZ, hour: "2-digit", minute: "2-digit" });
const shortFmt = new Intl.DateTimeFormat("tr-TR", { timeZone: TZ, day: "numeric", month: "short" });

function greeting(now: Date) {
  const h = Number(new Intl.DateTimeFormat("tr-TR", { timeZone: TZ, hour: "numeric", hourCycle: "h23" }).format(now));
  return h < 11 ? "Günaydın" : h < 18 ? "İyi günler" : "İyi akşamlar";
}

const RANK: Record<Tone, number> = { bad: 0, info: 1, warn: 2, good: 3, plain: 4 };
type Row = { key: string; title: string; detail: string; href: string; tone: Tone; badge: string; at: string };
type Today = { key: string; time: string; title: string; detail: string; href: string; tone: Tone };
const nameOf = (v: unknown) => (v && typeof v === "object" ? ((v as { name?: string; title?: string }).name ?? (v as { title?: string }).title ?? "") : "");
const idOf = (v: unknown) => (v && typeof v === "object" ? ((v as { id?: number }).id ?? null) : ((v as number | null | undefined) ?? null));

/**
 * Ana sayfa: "Bugün neyle ilgilenmeliyim?" Önce bekleyenler (yanıt bekleyen
 * sohbet, yeni talep, geciken görev, uzun süredir dokunulmayan fırsat), yanında
 * bugünün takvimi, üstte seçili işletmenin birkaç sayısı. Her bölüm yalnız
 * açık modülde görünür.
 */
export default async function PanelHome() {
  const ctx = await getPanelContext();
  const now = new Date();
  const today = dayKey(now);
  const startToday = new Date(`${today}T00:00:00+03:00`).toISOString();
  const endToday = new Date(`${today}T23:59:59+03:00`).toISOString();
  const monthStart = new Date(`${today.slice(0, 7)}-01T00:00:00+03:00`).toISOString();
  const staleBefore = daysAgoIso(7);
  const crm = ctx.has("crm");
  const chat = ctx.has("chat");
  const ops = ctx.has("ops");
  const none = Promise.resolve({ docs: [] as unknown[], totalDocs: 0 });

  const [waiting, leads, late, stale, openDeals, won, newLeads, todayActs, todayBookings, todayTasks, openTasks, lateActs] = await Promise.all([
    chat ? ctx.find("conversations", { where: { needsReply: { equals: true } }, sort: "-lastMessageAt", limit: 6 }) : none,
    crm ? ctx.find("leads", { where: { status: { equals: "yeni" } }, sort: "-createdAt", limit: 6 }) : none,
    ops ? ctx.find("tasks", { where: { and: [{ stage: { not_equals: "tamam" } }, { dueDate: { less_than: startToday } }] }, sort: "dueDate", limit: 6, depth: 1 }) : none,
    crm ? ctx.find("deals", { where: { and: [{ stage: { in: OPEN_STAGES } }, { updatedAt: { less_than: staleBefore } }] }, sort: "updatedAt", limit: 6, depth: 1 }) : none,
    crm ? ctx.find("deals", { where: { stage: { in: OPEN_STAGES } }, limit: 500, select: { value: true } }) : none,
    crm ? ctx.find("deals", { where: { and: [{ stage: { equals: "kazanildi" } }, { closedAt: { greater_than_equal: monthStart } }] }, limit: 500, select: { value: true } }) : none,
    crm ? ctx.count("leads", { createdAt: { greater_than_equal: daysAgoIso(7) } }) : Promise.resolve(0),
    crm ? ctx.find("activities", { where: { and: [{ done: { equals: false } }, { dueAt: { greater_than_equal: startToday } }, { dueAt: { less_than_equal: endToday } }, { booking: { exists: false } }] }, sort: "dueAt", limit: 8, depth: 1 }) : none,
    crm ? ctx.find("bookings", { where: { and: [{ slot: { like: today } }, { status: { in: ["bekliyor", "onaylandi"] } }] }, sort: "slot", limit: 8 }) : none,
    ops ? ctx.find("tasks", { where: { and: [{ stage: { not_equals: "tamam" } }, { dueDate: { greater_than_equal: startToday } }, { dueDate: { less_than_equal: endToday } }] }, limit: 8, depth: 1 }) : none,
    ops ? ctx.count("tasks", { stage: { not_equals: "tamam" } }) : Promise.resolve(0),
    /* Dünden kalan CRM işleri (arama, takip, ilk dönüş): ertesi gün kaybolmasın */
    crm ? ctx.find("activities", { where: { and: [{ done: { equals: false } }, { dueAt: { less_than: startToday } }, { type: { not_in: ["not", "sistem"] } }, { booking: { exists: false } }] }, sort: "dueAt", limit: 6, depth: 1 }) : none,
  ]);

  /* İlgilenmeniz gerekenler */
  const rows: Row[] = [];
  for (const d of waiting.docs as { id: number; name?: string | null; lastText?: string | null; lastMessageAt?: string | null; updatedAt: string }[])
    rows.push({ key: `c${d.id}`, title: `${d.name || "Ziyaretçi"} yanıt bekliyor`, detail: d.lastText ?? "", href: `/panel/gelen?s=s${d.id}`, tone: "bad", badge: "Yanıt bekliyor", at: d.lastMessageAt ?? d.updatedAt });
  for (const d of leads.docs as { id: number; name: string; service?: string | null; subject?: string | null; createdAt: string }[])
    rows.push({ key: `l${d.id}`, title: `${d.name} talep bıraktı`, detail: [d.service || d.subject, shortFmt.format(new Date(d.createdAt))].filter(Boolean).join(" · "), href: `/panel/gelen?s=t${d.id}`, tone: "info", badge: "Yeni talep", at: d.createdAt });
  for (const d of late.docs as { id: number; title: string; seq?: number | null; dueDate?: string | null; project?: unknown }[])
    rows.push({ key: `t${d.id}`, title: `${taskCode(d.seq)} ${d.title}`.trim(), detail: [nameOf(d.project), d.dueDate ? `teslim ${shortFmt.format(new Date(d.dueDate))}` : null].filter(Boolean).join(" · "), href: `/panel/gorevler?gorev=${d.id}`, tone: "bad", badge: "Gecikti", at: d.dueDate ?? "" });
  for (const a of lateActs.docs as { id: number; title: string; dueAt?: string | null; contact?: unknown; deal?: unknown }[])
    rows.push({ key: `ga${a.id}`, title: a.title, detail: [nameOf(a.deal) || nameOf(a.contact), a.dueAt ? shortFmt.format(new Date(a.dueAt)) : null].filter(Boolean).join(" · "), href: idOf(a.deal) ? `?panel=firsat-${idOf(a.deal)}` : idOf(a.contact) ? `?panel=kisi-${idOf(a.contact)}` : `/panel/duzenle/activities/${a.id}`, tone: "bad", badge: "Gecikti", at: a.dueAt ?? "" });
  for (const d of stale.docs as { id: number; title: string; value?: number | null; updatedAt: string; company?: unknown; contact?: unknown }[]) {
    const days = Math.floor((now.getTime() - new Date(d.updatedAt).getTime()) / 86400000);
    rows.push({ key: `d${d.id}`, title: d.title, detail: [nameOf(d.company) || nameOf(d.contact), d.value ? money.format(d.value) : null].filter(Boolean).join(" · "), href: `?panel=firsat-${d.id}`, tone: "warn", badge: `${days} gündür dokunulmadı`, at: d.updatedAt });
  }

  /* Bugün */
  const agenda: Today[] = [];
  for (const b of todayBookings.docs as { id: number; name: string; time: string; topic?: string | null; status: string }[])
    agenda.push({ key: `b${b.id}`, time: b.time, title: `${b.name} ile görüşme`, detail: b.topic ?? "Randevu", href: `/panel/gelen?s=r${b.id}`, tone: b.status === "onaylandi" ? "good" : "warn" });
  for (const a of todayActs.docs as { id: number; title: string; dueAt?: string | null; contact?: unknown; deal?: unknown }[])
    agenda.push({ key: `a${a.id}`, time: a.dueAt ? timeFmt.format(new Date(a.dueAt)) : "Gün içinde", title: a.title, detail: nameOf(a.deal) || nameOf(a.contact) || "CRM görevi", href: idOf(a.deal) ? `?panel=firsat-${idOf(a.deal)}` : idOf(a.contact) ? `?panel=kisi-${idOf(a.contact)}` : `/panel/duzenle/activities/${a.id}`, tone: "info" });
  for (const t of todayTasks.docs as { id: number; title: string; seq?: number | null; project?: unknown }[])
    agenda.push({ key: `t${t.id}`, time: "Teslim", title: `${taskCode(t.seq)} ${t.title}`.trim(), detail: nameOf(t.project) || "Operasyon görevi", href: `/panel/gorevler?gorev=${t.id}`, tone: "warn" });
  agenda.sort((a, b) => a.time.localeCompare(b.time, "tr"));

  /* Sayılar: açık modüllere göre en çok dört */
  const sum = (docs: unknown[]) => (docs as { value?: number | null }[]).reduce((a, d) => a + (d.value ?? 0), 0);
  const stats: React.ComponentProps<typeof Stat>[] = [];
  if (crm) stats.push({ label: "Açık fırsat", value: money.format(sum(openDeals.docs)), hint: `${nf.format(openDeals.docs.length)} fırsat` });
  if (crm) stats.push({ label: "Bu ay kazanılan", value: money.format(sum(won.docs)), hint: `${nf.format(won.docs.length)} fırsat` });
  if (chat) stats.push({ label: "Yanıt bekleyen sohbet", value: nf.format(waiting.totalDocs), hint: "ekipten yanıt bekliyor" });
  if (crm) stats.push({ label: "Yeni talep", value: nf.format(newLeads as number), hint: "son 7 gün" });
  if (ops) stats.push({ label: "Açık görev", value: nf.format(openTasks as number), hint: `${nf.format(late.totalDocs)} tanesi gecikmiş` });

  const first = ctx.user.name.split(" ")[0];
  /* Yeni müşteri işletmesinin kurulum adımları: yalnız işletme yöneticisine, hepsi bitince kalkar */
  const setup = !ctx.isGuruTenant && ctx.isTenantAdmin ? await onboardingSteps(await cms(), ctx.tenant.id, ctx.has) : [];
  const setupOpen = setup.some((s) => !s.done);
  const nothingOn = !crm && !chat && !ops;

  return (
    <>
      <PageHeader title={`${greeting(now)} ${first}`} description={`${ctx.tenant.name} · ${dayFmt.format(now)}`} />

      {setupOpen ? (
        <div className="mb-4">
          <Checklist title="Kuruluma Başlayın" items={setup} note="Her adım kendiliğinden işaretlenir; hepsi bitince bu liste kalkar." />
        </div>
      ) : null}

      {nothingOn ? (
        <Card>
          <Empty>Bu işletmede size açık bir modül yok. İşletme yöneticinizden yetki isteyin.</Empty>
        </Card>
      ) : (
        <>
          {stats.length ? <div className="mb-4 grid grid-cols-2 gap-3 xl:grid-cols-4">{stats.slice(0, 4).map((s) => <Stat key={s.label} {...s} />)}</div> : null}
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
            <Card>
              <CardHeader title="İlgilenmeniz Gerekenler" action={<Badge className="tabular">{nf.format(rows.length)}</Badge>} />
              {/* En önemli sekiz kayıt: sırası yanıt bekleyen, gecikmiş, yeni talep, bekleyen fırsat */}
              {rows.length ? (
                <ul className="m-0 list-none p-0">
                  {[...rows].sort((a, b) => RANK[a.tone] - RANK[b.tone]).slice(0, 8).map((r) => (
                    <li key={r.key} className="border-b border-line last:border-0">
                      <Link href={r.href} prefetch={false} scroll={false} className="flex min-h-13 items-center gap-3 px-4 py-2.5 no-underline hover:bg-sunken">
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-medium text-ink">{r.title}</span>
                          {r.detail ? <span className="block truncate text-[13px] text-muted">{r.detail}</span> : null}
                        </span>
                        <Badge tone={r.tone} dot>
                          {r.badge}
                        </Badge>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <Empty>Bekleyen bir şey yok. Yeni talep, yanıt bekleyen sohbet ya da geciken iş olduğunda burada görünür.</Empty>
              )}
            </Card>
            <Card>
              <CardHeader title="Bugün" />
              {agenda.length ? (
                <ul className="m-0 list-none p-0">
                  {agenda.map((a) => (
                    <li key={a.key} className="border-b border-line last:border-0">
                      <Link href={a.href} prefetch={false} scroll={false} className="flex min-h-13 items-center gap-3 px-4 py-2.5 no-underline hover:bg-sunken">
                        <Badge tone={a.tone} className="tabular min-w-14 justify-center">
                          {a.time}
                        </Badge>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-medium text-ink">{a.title}</span>
                          <span className="block truncate text-[13px] text-muted">{a.detail}</span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <Empty>Bugün için randevu, arama ya da teslim yok.</Empty>
              )}
            </Card>
          </div>
        </>
      )}
    </>
  );
}
