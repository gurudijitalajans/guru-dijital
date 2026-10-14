import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { FileText } from "lucide-react";
import { getPanelContext } from "@/panel/context";
import { cms } from "@/lib/cms";
import { PageHeader } from "@/panel/ui/page-header";
import { Card, CardHeader, Empty, Stat } from "@/panel/ui/card";
import { Button } from "@/panel/ui/button";
import { SummaryNow } from "@/panel/exec/SummaryNow";
import { change, periodMetrics, periodOf, snapshot } from "@/payload/business/metrics";
import { businessConfigOf } from "@/payload/business/collections";
import { dayOf } from "@/payload/ops/dates";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Yönetim özeti" };
export const dynamic = "force-dynamic";

const money = new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 });
const nf = new Intl.NumberFormat("tr-TR");
const monthShort = new Intl.DateTimeFormat("tr-TR", { month: "short", timeZone: "UTC" });
const PERIODS = [
  { key: "bu-ay", label: "Bu ay" },
  { key: "gecen-ay", label: "Geçen ay" },
  { key: "30-gun", label: "Son 30 gün" },
];

/** Önceki döneme göre fark: yüzde ya da yok */
const delta = (now: number, before: number) => {
  const c = change(now, before);
  return c === null || c === 0 ? undefined : { dir: c > 0 ? ("up" as const) : ("down" as const), text: `%${Math.abs(c)}` };
};

/**
 * Yönetim özeti: seçili dönemin sonuçları (önceki döneme göre), aylık hedef,
 * son altı ayın kazanılan işi, gelir kaynağı ve modül özetleri. Hesaplar
 * mevcut yönetici panosu, ay sonu raporu ve sabah özetiyle aynı.
 */
export default async function ExecPage({ searchParams }: { searchParams: Promise<{ donem?: string }> }) {
  const ctx = await getPanelContext();
  if (!ctx.has("business") || !ctx.isTenantAdmin) redirect("/panel");
  const sp = await searchParams;
  const key = PERIODS.some((p) => p.key === sp.donem) ? sp.donem! : "bu-ay";
  const period = periodOf(key);
  const payload = await cms();
  const q = { payload, tenant: ctx.tenant.id };

  /* Son altı ayın kazanılan işi: tek sorgu, aya göre toplanır */
  const today = dayOf(new Date());
  const [y, m] = today.split("-").map(Number);
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(Date.UTC(y, m - 1 - (5 - i), 1));
    return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
  });
  const sixFrom = new Date(`${months[0]}-01T00:00:00+03:00`).toISOString();

  const [now, before, snap, settings, wonSix] = await Promise.all([
    periodMetrics(q, period),
    periodMetrics(q, period.prev),
    snapshot(q),
    businessConfigOf(payload, ctx.tenant.id),
    ctx.find("deals", { where: { and: [{ stage: { equals: "kazanildi" } }, { closedAt: { greater_than_equal: sixFrom } }] }, limit: 2000, select: { value: true, closedAt: true } }),
  ]);
  const byMonth = new Map(months.map((k) => [k, 0]));
  for (const d of wonSix.docs as { value?: number | null; closedAt?: string | null }[]) {
    if (!d.closedAt) continue;
    const k = dayOf(d.closedAt).slice(0, 7);
    if (byMonth.has(k)) byMonth.set(k, (byMonth.get(k) ?? 0) + (d.value ?? 0));
  }
  const series = months.map((k) => ({ k, label: monthShort.format(new Date(`${k}-15T12:00:00Z`)), v: byMonth.get(k) ?? 0 }));

  const target = key !== "30-gun" ? (settings.monthlyTarget ?? 0) : 0;
  const targetPct = target ? Math.min(100, Math.round((now.wonValue / target) * 100)) : 0;
  const chat = ctx.has("chat");
  const ops = ctx.has("ops");
  const reportMonth = key === "gecen-ay" ? period.from && dayOf(new Date(new Date(period.from).getTime() + 86400000 * 2)).slice(0, 7) : today.slice(0, 7);

  const stats: React.ComponentProps<typeof Stat>[] = [
    { label: "Kazanılan iş", value: money.format(now.wonValue), hint: `${nf.format(now.wonCount)} fırsat`, delta: delta(now.wonValue, before.wonValue) },
    { label: "Talep ve randevu", value: nf.format(now.leads + now.bookings), hint: `${nf.format(now.leads)} talep, ${nf.format(now.bookings)} randevu`, delta: delta(now.leads + now.bookings, before.leads + before.bookings) },
    ...(ops ? [{ label: "Aktif müşteri", value: nf.format(snap.activeCustomers), hint: `${nf.format(snap.activeProjects)} süren proje` }] : [{ label: "Açık satış hattı", value: money.format(snap.openPipeline), hint: `${nf.format(snap.openDeals)} fırsat` }]),
    ...(chat ? [{ label: "Asistanda çözülen", value: now.botResolvedPct === null ? "Veri yok" : `%${now.botResolvedPct}`, hint: `${nf.format(now.conversations)} sohbet` }] : [{ label: "Gönderilen teklif", value: nf.format(now.quotesSent), hint: money.format(now.quotesValue) }]),
  ];

  /* Grafik ölçüsü: en yüksek ay yukarı yuvarlanır */
  const W = 560, H = 220, padL = 52, padB = 26, padT = 18;
  const peak = Math.max(1, ...series.map((s) => s.v), target);
  const stepRaw = peak / 3;
  const mag = 10 ** Math.floor(Math.log10(stepRaw));
  const step = Math.ceil(stepRaw / mag) * mag;
  const top = step * 3;
  const yOf = (v: number) => padT + (H - padT - padB) * (1 - v / top);
  const bw = (W - padL - 8) / series.length;
  const short = (v: number) => (v >= 1_000_000 ? `${nf.format(Math.round(v / 100_000) / 10)} mn` : v >= 1000 ? `${nf.format(Math.round(v / 1000))} bin` : nf.format(v));

  return (
    <>
      <PageHeader
        title="Yönetim özeti"
        description={`${ctx.tenant.name} · ${period.label} · tutarlar KDV hariç, kazanılan fırsatlardan`}
        actions={
          <>
            <div className="inline-flex rounded-[9px] border border-line bg-sunken p-[3px]" role="group" aria-label="Dönem">
              {PERIODS.map((p) => (
                <Link key={p.key} href={p.key === "bu-ay" ? "/panel/ozet" : `/panel/ozet?donem=${p.key}`} aria-current={key === p.key ? "page" : undefined} className={cn("grid min-h-8.5 pointer-coarse:min-h-11 place-items-center rounded-[7px] px-3 font-medium text-muted no-underline", key === p.key && "bg-surface text-ink shadow-sm")}>
                  {p.label}
                </Link>
              ))}
            </div>
            <Button asChild size="sm">
              <a href={`/api/yonetici/rapor?ay=${reportMonth}`} target="_blank" rel="noreferrer">
                <FileText /> Ay sonu raporu
              </a>
            </Button>
            <SummaryNow />
          </>
        }
      />

      <div className="mb-4 grid grid-cols-2 gap-3 xl:grid-cols-4">
        {stats.map((s) => (
          <Stat key={s.label} {...s} />
        ))}
      </div>

      {target ? (
        <Card className="mb-4 px-4 py-3.5">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <span className="font-medium text-ink">Aylık hedef</span>
            <span className="tabular text-[14px] text-muted">
              {money.format(now.wonValue)} / {money.format(target)} · %{targetPct}
            </span>
          </div>
          <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-sunken" role="img" aria-label={`Hedefin %${targetPct} kadarı`}>
            <div className={cn("h-full rounded-full", targetPct >= 100 ? "bg-good" : "bg-accent")} style={{ width: `${targetPct}%` }} />
          </div>
        </Card>
      ) : (
        <p className="mb-4 text-[14px] text-muted">
          Aylık hedef girilmedi.{" "}
          <Link href="/panel/duzenle/business-config" prefetch={false} className="text-accent">
            Yönetim özeti ayarlarından
          </Link>{" "}
          ekleyince ilerleme burada görünür.
        </p>
      )}

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <Card>
          <CardHeader title="Kazanılan İş" action={<span className="text-[13px] text-muted">son 6 ay</span>} />
          <div className="px-4 pt-3 pb-4">
            <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full" role="img" aria-label={`Aylara göre kazanılan iş: ${series.map((s) => `${s.label} ${money.format(s.v)}`).join(", ")}`}>
              {[0, 1, 2, 3].map((i) => (
                <g key={i}>
                  <line x1={padL} x2={W - 4} y1={yOf(step * i)} y2={yOf(step * i)} stroke="var(--line)" />
                  <text x={padL - 8} y={yOf(step * i) + 4} textAnchor="end" fontSize="11" fill="var(--muted)">
                    {short(step * i)}
                  </text>
                </g>
              ))}
              {target ? (
                <g>
                  <line x1={padL} x2={W - 4} y1={yOf(target)} y2={yOf(target)} stroke="var(--warn)" strokeDasharray="4 4" />
                  <text x={W - 6} y={yOf(target) - 5} textAnchor="end" fontSize="11" fill="var(--warn)">
                    hedef
                  </text>
                </g>
              ) : null}
              {series.map((s, i) => {
                const x = padL + i * bw + bw * 0.2;
                const last = i === series.length - 1;
                return (
                  <g key={s.k}>
                    <rect x={x} y={yOf(s.v)} width={bw * 0.6} height={Math.max(0, H - padB - yOf(s.v))} rx="4" fill={last ? "var(--accent)" : "var(--accent-soft)"} />
                    <text x={x + bw * 0.3} y={H - 8} textAnchor="middle" fontSize="11" fill="var(--muted)">
                      {s.label}
                    </text>
                    {s.v ? (
                      <text x={x + bw * 0.3} y={yOf(s.v) - 6} textAnchor="middle" fontSize="11" fill={last ? "var(--ink)" : "var(--muted)"} fontWeight={last ? 600 : 400}>
                        {short(s.v)}
                      </text>
                    ) : null}
                  </g>
                );
              })}
            </svg>
          </div>
        </Card>

        <Card>
          <CardHeader title="Gelir Kaynağı" action={<span className="text-[13px] text-muted">{period.label.toLocaleLowerCase("tr-TR")}</span>} />
          {now.revenueBySource.length ? (
            <ul className="m-0 grid list-none gap-3 p-4">
              {now.revenueBySource.map((r) => {
                const pct = now.wonValue ? Math.round((r.value / now.wonValue) * 100) : 0;
                return (
                  <li key={r.label}>
                    <div className="flex items-baseline justify-between gap-2 text-[14px]">
                      <span className="text-ink">{r.label}</span>
                      <span className="tabular text-muted">
                        {money.format(r.value)} · %{pct}
                      </span>
                    </div>
                    <div className="mt-1 h-2 overflow-hidden rounded-full bg-sunken">
                      <div className="h-full rounded-full bg-accent" style={{ width: `${pct}%` }} />
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <Empty>Bu dönemde kazanılan iş yok. Talepler: {nf.format(now.leadsFromForm)} site formu, {nf.format(now.leadsFromChat)} sohbet.</Empty>
          )}
        </Card>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Card>
          <CardHeader title="Satış" action={<Link href="/panel/firsatlar" className="text-[14px] text-accent">Fırsatlar</Link>} />
          <dl className="m-0 grid grid-cols-[minmax(0,1fr)_auto] gap-x-3 gap-y-2 px-4 py-3 text-[14px]">
            <dt className="text-muted">Açık satış hattı</dt>
            <dd className="tabular m-0 text-ink">{money.format(snap.openPipeline)}</dd>
            <dt className="text-muted">Yanıt bekleyen teklif</dt>
            <dd className="tabular m-0 text-ink">
              {nf.format(snap.pendingQuotes)} · {money.format(snap.pendingQuotesValue)}
            </dd>
            <dt className="text-muted">Kazanılan / kaybedilen</dt>
            <dd className="tabular m-0 text-ink">
              {nf.format(now.wonCount)} / {nf.format(now.lostCount)}
            </dd>
          </dl>
        </Card>
        {ops ? (
          <Card>
            <CardHeader title="Operasyon" action={<Link href="/panel/ekip-yuku" className="text-[14px] text-accent">Ekip yükü</Link>} />
            <dl className="m-0 grid grid-cols-[minmax(0,1fr)_auto] gap-x-3 gap-y-2 px-4 py-3 text-[14px]">
              <dt className="text-muted">Açık görev</dt>
              <dd className="tabular m-0 text-ink">{nf.format(snap.openTasks)}</dd>
              <dt className="text-muted">Geciken</dt>
              <dd className={cn("tabular m-0", snap.lateTasks ? "text-bad" : "text-ink")}>{nf.format(snap.lateTasks)}</dd>
              <dt className="text-muted">Zamanında teslim</dt>
              <dd className="tabular m-0 text-ink">{now.onTimePct === null ? "Veri yok" : `%${now.onTimePct}`}</dd>
              <dt className="text-muted">Teslim edilen proje</dt>
              <dd className="tabular m-0 text-ink">
                {nf.format(now.projectsDone)}
                {now.avgDeliveryDays !== null ? ` · ort. ${now.avgDeliveryDays} gün` : ""}
              </dd>
            </dl>
          </Card>
        ) : null}
        {chat ? (
          <Card>
            <CardHeader title="Sohbet" action={<Link href="/panel/gelen?f=sohbet" className="text-[14px] text-accent">Gelen kutusu</Link>} />
            <dl className="m-0 grid grid-cols-[minmax(0,1fr)_auto] gap-x-3 gap-y-2 px-4 py-3 text-[14px]">
              <dt className="text-muted">Sohbet</dt>
              <dd className="tabular m-0 text-ink">{nf.format(now.conversations)}</dd>
              <dt className="text-muted">Ekibe aktarılan</dt>
              <dd className="tabular m-0 text-ink">{nf.format(now.handoffs)}</dd>
              <dt className="text-muted">Talep ya da randevuya dönen</dt>
              <dd className="tabular m-0 text-ink">{nf.format(now.chatConverted)}</dd>
            </dl>
          </Card>
        ) : null}
      </div>

      {now.wonDeals.length ? (
        <Card className="mt-4">
          <CardHeader title="Dönemin En Büyük İşleri" />
          <ul className="m-0 list-none p-0">
            {now.wonDeals.slice(0, 5).map((d) => (
              <li key={d.id} className="border-b border-line last:border-0">
                <Link href={`/panel/firsatlar?firsat=${d.id}`} className="flex min-h-12 items-center gap-3 px-4 py-2 no-underline hover:bg-sunken">
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium text-ink">{d.title}</span>
                    <span className="block truncate text-[13px] text-muted">{[d.who, d.source].filter(Boolean).join(" · ")}</span>
                  </span>
                  <span className="tabular text-ink">{money.format(d.value)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}
    </>
  );
}
