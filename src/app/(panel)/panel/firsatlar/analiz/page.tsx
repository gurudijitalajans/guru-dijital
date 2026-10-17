import type { Metadata } from "next";
import Link from "next/link";
import { requireModule } from "@/panel/context";
import { PageHeader } from "@/panel/ui/page-header";
import { Card, CardHeader } from "@/panel/ui/card";
import { cn } from "@/lib/utils";
import { DEAL_STAGES, SOURCES } from "@/payload/crm/stages";
import { daysAgoIso } from "@/payload/utils";

export const metadata: Metadata = { title: "Kazanma ve kaybetme" };
export const dynamic = "force-dynamic";

const PERIODS: [string, string, number][] = [
  ["30", "Son 30 gün", 30],
  ["90", "Son 90 gün", 90],
  ["365", "Son 12 ay", 365],
];
const OPEN = ["aday", "gorusme", "teklif"] as const;
const LABEL: Record<string, string> = Object.fromEntries(DEAL_STAGES.map((s) => [s.value, s.label]));
const BY_LABEL: Record<string, string> = Object.fromEntries(DEAL_STAGES.map((s) => [s.label, s.value]));
const SOURCE: Record<string, string> = Object.fromEntries(SOURCES.map((s) => [s.value, s.label]));
const tl = (n: number) => new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 }).format(n);
const pct = (a: number, b: number) => (b ? `%${Math.round((a / b) * 100)}` : "—");
const days = (ms: number) => (ms <= 0 ? "—" : ms < 86400000 ? "1 günden az" : `${(ms / 86400000).toFixed(ms < 864000000 ? 1 : 0).replace(".", ",")} gün`);
const idOf = (v: unknown) => (v && typeof v === "object" ? ((v as { id?: number }).id ?? null) : ((v as number | null | undefined) ?? null));

type Deal = { id: number; stage: string; value?: number | null; owner?: unknown; contact?: unknown; createdAt: string; closedAt?: string | null; lostReason?: string | null; stageChangedAt?: string | null };
type Move = { deal: number; from: string; to: string; at: string };

/**
 * Kazanma ve kaybetme analizi (Kommo'daki Win-Loss): fırsatların aşama geçiş
 * kayıtlarından ("Aşama: Aday → Görüşme") aşama başına giren, ilerleyen,
 * kaybedilen ve bekleyen fırsatlar; aşamada ortalama süre, kazanma oranı,
 * kayıp sebepleri ve sorumlu bazında sonuçlar.
 */
export default async function WinLossPage({ searchParams }: { searchParams: Promise<{ donem?: string }> }) {
  const ctx = await requireModule("crm");
  const sp = await searchParams;
  const period = PERIODS.find((p) => p[0] === sp.donem) ?? PERIODS[1];
  const since = daysAgoIso(period[2]);

  const [dealsRes, movesRes, who] = await Promise.all([
    ctx.find("deals", { where: { or: [{ createdAt: { greater_than_equal: since } }, { closedAt: { greater_than_equal: since } }, { stage: { in: [...OPEN] } }] }, limit: 3000, depth: 1 }),
    ctx.find("activities", { where: { and: [{ type: { equals: "sistem" } }, { title: { like: "Aşama:" } }, { createdAt: { greater_than_equal: since } }] }, sort: "createdAt", limit: 5000 }),
    ctx.names(),
  ]);
  const deals = dealsRes.docs as Deal[];
  const byId = new Map(deals.map((d) => [d.id, d]));
  const moves: Move[] = [];
  for (const a of movesRes.docs as { deal?: unknown; title: string; createdAt: string }[]) {
    const m = /^Aşama: (.+?) → (.+)$/.exec(a.title);
    const deal = idOf(a.deal);
    if (!m || !deal || !BY_LABEL[m[1]] || !BY_LABEL[m[2]]) continue;
    moves.push({ deal, from: BY_LABEL[m[1]], to: BY_LABEL[m[2]], at: a.createdAt });
  }

  /* Aşama başına: giren, ilerleyen, kaybedilen, bekleyen, ortalama süre */
  const createdIn = deals.filter((d) => d.createdAt >= since);
  /* Fırsatın açıldığı aşama: ilk geçişin çıkış aşaması, geçiş yoksa bugünkü aşaması */
  const firstStage = (d: Deal) => moves.find((m) => m.deal === d.id)?.from ?? d.stage;
  const rows = OPEN.map((st, i) => {
    const entered = moves.filter((m) => m.to === st).length + createdIn.filter((d) => firstStage(d) === st).length;
    const forward = moves.filter((m) => m.from === st && (OPEN.indexOf(m.to as (typeof OPEN)[number]) > i || m.to === "kazanildi")).length;
    const lost = moves.filter((m) => m.from === st && m.to === "kaybedildi").length;
    const now = deals.filter((d) => d.stage === st);
    /* Aşamada geçen süre: aşamadan çıkış anı - aşamaya giriş anı (önceki geçiş ya da fırsatın açılışı) */
    const spans: number[] = [];
    for (const m of moves.filter((x) => x.from === st)) {
      const before = moves.filter((x) => x.deal === m.deal && x.to === st && x.at <= m.at).pop();
      const deal = byId.get(m.deal);
      const start = before?.at ?? (deal && firstStage(deal) === st ? deal.createdAt : undefined);
      if (start) spans.push(new Date(m.at).getTime() - new Date(start).getTime());
    }
    const avg = spans.length ? spans.reduce((a, b) => a + b, 0) / spans.length : 0;
    return { st, entered, forward, lost, now: now.length, nowValue: now.reduce((a, d) => a + (d.value ?? 0), 0), avg };
  });

  const won = deals.filter((d) => d.stage === "kazanildi" && d.closedAt && d.closedAt >= since);
  const lost = deals.filter((d) => d.stage === "kaybedildi" && d.closedAt && d.closedAt >= since);
  const wonValue = won.reduce((a, d) => a + (d.value ?? 0), 0);
  const cycle = won.length ? won.reduce((a, d) => a + (new Date(d.closedAt!).getTime() - new Date(d.createdAt).getTime()), 0) / won.length : 0;

  /* Kayıp sebepleri: "Bütçe yetersiz: açıklama" biçiminde, iki noktadan önceki kısım */
  const reasons = new Map<string, number>();
  for (const d of lost) {
    const r = (d.lostReason ?? "").split(":")[0].trim() || "Sebep yazılmadı";
    reasons.set(r, (reasons.get(r) ?? 0) + 1);
  }
  const reasonRows = [...reasons.entries()].sort((a, b) => b[1] - a[1]);

  /* Sorumlu ve kaynak bazında */
  const groupBy = (key: (d: Deal) => string) => {
    const m = new Map<string, { won: number; wonValue: number; lost: number; open: number; openValue: number }>();
    const get = (k: string) => {
      if (!m.has(k)) m.set(k, { won: 0, wonValue: 0, lost: 0, open: 0, openValue: 0 });
      return m.get(k)!;
    };
    for (const d of won) {
      const g = get(key(d));
      g.won++;
      g.wonValue += d.value ?? 0;
    }
    for (const d of lost) get(key(d)).lost++;
    for (const d of deals.filter((x) => OPEN.includes(x.stage as (typeof OPEN)[number]))) {
      const g = get(key(d));
      g.open++;
      g.openValue += d.value ?? 0;
    }
    return [...m.entries()].sort((a, b) => b[1].wonValue - a[1].wonValue || b[1].open - a[1].open);
  };
  const owners = groupBy((d) => who(d.owner) || "Atanmadı");
  const sources = groupBy((d) => {
    const s = d.contact && typeof d.contact === "object" ? (d.contact as { source?: string | null }).source : null;
    return s ? (SOURCE[s] ?? s) : "Bilinmiyor";
  });
  const maxEntered = Math.max(1, ...rows.map((r) => r.entered));

  return (
    <>
      <PageHeader
        title="Kazanma ve kaybetme"
        description="Fırsatların aşama geçişlerinden: hangi aşamada takılıyor, neden kaybediliyor, kim ne kazandırıyor."
        actions={
          <Link href="/panel/firsatlar" className="text-[14px] text-accent">
            Fırsat panosuna dön
          </Link>
        }
      />
      <div className="mb-4 flex rounded-[10px] border border-line bg-surface p-0.5" role="tablist" aria-label="Dönem" style={{ width: "fit-content" }}>
        {PERIODS.map(([k, l]) => (
          <Link key={k} href={`?donem=${k}`} role="tab" aria-selected={period[0] === k} className={cn("min-h-9 rounded-[8px] px-3 py-1.5 text-[14px] no-underline", period[0] === k ? "bg-accent-soft font-medium text-accent" : "text-text hover:text-ink")}>
            {l}
          </Link>
        ))}
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          ["Kazanılan", `${won.length}`, tl(wonValue)],
          ["Kaybedilen", `${lost.length}`, lost.length ? `${reasonRows[0]?.[0] ?? ""} en sık` : "kayıp yok"],
          ["Kazanma oranı", pct(won.length, won.length + lost.length), "kapanan fırsatlarda"],
          ["Ortalama satış süresi", days(cycle), "açılıştan kazanmaya"],
        ].map(([t, v, d]) => (
          <Card key={t} className="p-4">
            <p className="m-0 text-[13px] text-muted">{t}</p>
            <p className="tabular m-0 mt-1 text-[26px] leading-tight font-semibold text-ink">{v}</p>
            <p className="m-0 text-[13px] text-muted">{d}</p>
          </Card>
        ))}
      </div>

      <Card className="mb-4">
        <CardHeader title="Aşamalar" />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-[14px]">
            <thead>
              <tr className="text-left text-[12px] text-muted">
                <th className="px-4 py-2.5 font-semibold">Aşama</th>
                <th className="px-4 py-2.5 font-semibold">Giren</th>
                <th className="px-4 py-2.5 text-right font-semibold">İlerleyen</th>
                <th className="px-4 py-2.5 text-right font-semibold">Kaybedilen</th>
                <th className="px-4 py-2.5 text-right font-semibold">Şu an</th>
                <th className="px-4 py-2.5 text-right font-semibold">Aşamada ortalama</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.st} className="border-t border-line">
                  <td className="px-4 py-3 font-medium text-ink">{LABEL[r.st]}</td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-2">
                      <span className="tabular w-8 text-ink">{r.entered}</span>
                      <span className="h-2 flex-1 rounded-full bg-sunken">
                        <span className="block h-2 rounded-full bg-accent" style={{ width: `${(r.entered / maxEntered) * 100}%` }} />
                      </span>
                    </span>
                  </td>
                  <td className="tabular px-4 py-3 text-right text-ink">
                    {r.forward} <span className="text-muted">({pct(r.forward, r.entered)})</span>
                  </td>
                  <td className="tabular px-4 py-3 text-right text-bad">
                    {r.lost} <span className="text-muted">({pct(r.lost, r.entered)})</span>
                  </td>
                  <td className="tabular px-4 py-3 text-right text-ink">
                    {r.now} <span className="text-muted">· {tl(r.nowValue)}</span>
                  </td>
                  <td className="tabular px-4 py-3 text-right text-ink">{days(r.avg)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="m-0 border-t border-line px-4 py-2.5 text-[12px] text-muted">Giren: dönemde aşamaya geçen ya da o aşamada açılan fırsatlar. İlerleyen: sonraki aşamaya ya da Kazanıldı&apos;ya geçen.</p>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Kayıp sebepleri" />
          {reasonRows.length ? (
            <ul className="m-0 list-none p-0">
              {reasonRows.map(([r, n]) => (
                <li key={r} className="flex items-center gap-3 border-b border-line px-4 py-2.5 last:border-b-0">
                  <span className="min-w-0 flex-1 truncate text-ink">{r}</span>
                  <span className="h-2 w-24 rounded-full bg-sunken">
                    <span className="block h-2 rounded-full bg-bad" style={{ width: `${(n / lost.length) * 100}%` }} />
                  </span>
                  <span className="tabular w-16 text-right text-[13px] text-muted">
                    {n} · {pct(n, lost.length)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="m-0 px-4 py-6 text-[14px] text-muted">Bu dönemde kaybedilen fırsat yok.</p>
          )}
        </Card>
        {[
          ["Sorumlu", owners],
          ["Kaynak", sources],
        ].map(([title, list]) => (
          <Card key={title as string}>
            <CardHeader title={`${title as string} bazında`} />
            <div className="overflow-x-auto">
              <table className="w-full min-w-[420px] border-collapse text-[14px]">
                <thead>
                  <tr className="text-left text-[12px] text-muted">
                    <th className="px-4 py-2 font-semibold">{title as string}</th>
                    <th className="px-4 py-2 text-right font-semibold">Kazanılan</th>
                    <th className="px-4 py-2 text-right font-semibold">Kaybedilen</th>
                    <th className="px-4 py-2 text-right font-semibold">Açık</th>
                  </tr>
                </thead>
                <tbody>
                  {(list as ReturnType<typeof groupBy>).map(([k, v]) => (
                    <tr key={k} className="border-t border-line">
                      <td className="px-4 py-2.5 text-ink">{k}</td>
                      <td className="tabular px-4 py-2.5 text-right text-ink">
                        {v.won} <span className="text-muted">· {tl(v.wonValue)}</span>
                      </td>
                      <td className="tabular px-4 py-2.5 text-right text-ink">{v.lost}</td>
                      <td className="tabular px-4 py-2.5 text-right text-ink">
                        {v.open} <span className="text-muted">· {tl(v.openValue)}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}
