import type { Metadata } from "next";
import Link from "next/link";
import { requireModule } from "@/panel/context";
import { cms } from "@/lib/cms";
import { PageHeader } from "@/panel/ui/page-header";
import { Card, CardHeader, Stat } from "@/panel/ui/card";
import { BarList, PeriodLinks } from "@/panel/ui/period";
import { getOverview, type DayPoint, type Totals } from "@/lib/umami";
import { eventLabel } from "@/lib/analytics";
import { daysAgoIso } from "@/payload/utils";

export const metadata: Metadata = { title: "Ziyaretçi analizi" };
export const dynamic = "force-dynamic";

const PERIODS = [7, 30, 90];
const nf = new Intl.NumberFormat("tr-TR");
const dayFmt = new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "short", timeZone: "UTC" });
const DEVICE: Record<string, string> = { desktop: "Masaüstü", laptop: "Dizüstü", mobile: "Mobil", tablet: "Tablet" };
const regionName = (() => {
  try {
    const dn = new Intl.DisplayNames(["tr"], { type: "region" });
    return (code: string) => (code && code.length === 2 ? (dn.of(code.toUpperCase()) ?? code) : code);
  } catch {
    return (code: string) => code;
  }
})();
const pct = (a: number, b: number) => (b > 0 ? (a / b) * 100 : 0);
const fmtPct = (v: number) => `%${v.toLocaleString("tr-TR", { maximumFractionDigits: 1 })}`;
const fmtDur = (s: number) => (Math.round(s) >= 60 ? `${Math.floor(s / 60)} dk ${Math.round(s) % 60} sn` : `${Math.round(s)} sn`);
/** Önceki döneme göre fark (hemen çıkmada düşüş iyidir) */
const delta = (now: number, before: number | null | undefined) => {
  if (!before) return undefined;
  const d = ((now - before) / before) * 100;
  return Math.abs(d) < 0.5 ? undefined : { dir: d > 0 ? ("up" as const) : ("down" as const), text: fmtPct(Math.abs(d)) };
};

/**
 * Ziyaretçi analizi (Guru Dijital'in sitesi, Umami): ziyaretçi, görüntüleme,
 * hemen çıkma, süre, dönüşüm; günlük grafik, sayfalar, kaynaklar, olaylar,
 * cihazlar, ülkeler. Umami bağlı değilse kurulum adımları.
 */
export default async function VisitorsPage({ searchParams }: { searchParams: Promise<{ gun?: string }> }) {
  const ctx = await requireModule("site");
  const sp = await searchParams;
  const days = PERIODS.find((d) => String(d) === sp.gun) ?? 30;
  const payload = await cms();
  const settings = await payload.findGlobal({ slug: "site-settings", depth: 0 });
  const websiteId = settings.analytics?.websiteId ?? "";
  const since = daysAgoIso(days);
  const [result, leads, bookings] = await Promise.all([getOverview(websiteId, days), ctx.count("leads", { createdAt: { greater_than_equal: since } }), ctx.count("bookings", { createdAt: { greater_than_equal: since } })]);
  const conversions = leads + bookings;

  return (
    <>
      <PageHeader title="Ziyaretçi analizi" description={`Guru Dijital sitesi · son ${days} gün · Türkiye saatiyle`} actions={<PeriodLinks base="/panel/ziyaretci" options={PERIODS} current={days} />} />
      <p className="mb-4 text-[14px] text-muted">
        Bu dönemde sitedeki formlardan{" "}
        <Link href="/panel/gelen?f=talep" className="text-accent">
          {nf.format(leads)} talep
        </Link>{" "}
        ve{" "}
        <Link href="/panel/gelen?f=randevu" className="text-accent">
          {nf.format(bookings)} randevu talebi
        </Link>{" "}
        geldi.
      </p>
      {result.ok ? (
        <>
          <Kpis t={result.data.totals} p={result.data.previous} conversions={conversions} />
          <Card className="mb-4">
            <CardHeader title="Günlük Ziyaret" />
            <Chart series={result.data.series} />
          </Card>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <Card>
              <CardHeader title="En Çok Görüntülenen Sayfalar" />
              <BarList rows={result.data.pages} empty="Bu dönemde görüntüleme yok." />
            </Card>
            <Card>
              <CardHeader title="Gelinen Yerler" />
              <BarList rows={result.data.referrers} empty="Bu dönemde yönlendiren site yok." />
            </Card>
            <Card>
              <CardHeader title="Olaylar" />
              <BarList rows={result.data.events} format={eventLabel} empty="Henüz olay yok. Form gönderimleri ve öne çıkan buton tıklamaları burada listelenir." />
            </Card>
            <Card>
              <CardHeader title="Cihazlar" />
              <BarList rows={result.data.devices} format={(s) => DEVICE[s] ?? s} empty="Veri yok." />
            </Card>
            <Card>
              <CardHeader title="Ülkeler" />
              <BarList rows={result.data.countries} format={regionName} empty="Veri yok." />
            </Card>
          </div>
        </>
      ) : result.reason === "not-configured" ? (
        <Card className="max-w-[760px] px-5 py-4">
          <h2 className="mt-0 mb-2 text-[17px] font-semibold text-ink">Ziyaretçi Analizini Bağlayın</h2>
          <p className="mt-0 text-[14px] text-muted">Umami çerez kullanmayan, kişisel veri toplamayan açık kaynak bir analiz aracıdır; KVKK açısından çerez izni bandı gerektirmez. Bağlantı bir kez kurulur:</p>
          <ol className="m-0 grid gap-2 pl-5 text-[14px] text-ink">
            <li>Guru adına bir Umami hesabı açın: Umami Cloud (ücretsiz başlangıç planı) ya da kendi sunucunuza kurulu Umami.</li>
            <li>
              Umami&apos;de siteyi ekleyin; Website ID değerini{" "}
              <Link href="/panel/duzenle/site-settings" prefetch={false} className="text-accent">
                Site ayarları &gt; Ziyaretçi analizi
              </Link>{" "}
              alanına yapıştırıp sayımı açın.{websiteId ? " (Site kimliği girilmiş.)" : ""}
            </li>
            <li>
              Umami&apos;de bir API anahtarı oluşturun; Vercel&apos;in ortam değişkenlerine <code className="rounded bg-sunken px-1.5 font-mono text-[13px]">UMAMI_API_URL</code> (Cloud için https://api.umami.is/v1) ve{" "}
              <code className="rounded bg-sunken px-1.5 font-mono text-[13px]">UMAMI_API_KEY</code> olarak ekleyin. Bu ekran o zaman dolar.
            </li>
          </ol>
        </Card>
      ) : (
        <Card className="px-5 py-4">
          <h2 className="mt-0 mb-1 text-[17px] font-semibold text-ink">Umami&apos;ye Ulaşılamadı</h2>
          <p className="m-0 text-[14px] text-muted">
            Bağlantı ayarlarını kontrol edin. Ayrıntı: <code className="font-mono text-[13px]">{result.message}</code>
          </p>
        </Card>
      )}
    </>
  );
}

function Kpis({ t, p, conversions }: { t: Totals; p: Totals | null; conversions: number }) {
  const bounce = pct(t.bounces, t.visits);
  const bounceBefore = p ? pct(p.bounces, p.visits) : null;
  const avg = t.visits > 0 ? t.totaltime / t.visits : 0;
  const avgBefore = p && p.visits > 0 ? p.totaltime / p.visits : null;
  const b = delta(bounce, bounceBefore);
  return (
    <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
      <Stat label="Ziyaretçi" value={nf.format(t.visitors)} delta={delta(t.visitors, p?.visitors)} hint="önceki döneme göre" />
      <Stat label="Ziyaret" value={nf.format(t.visits)} delta={delta(t.visits, p?.visits)} />
      <Stat label="Sayfa görüntüleme" value={nf.format(t.pageviews)} delta={delta(t.pageviews, p?.pageviews)} />
      {/* Hemen çıkmada artış kötüdür: yön renk için tersine çevrilir */}
      <Stat label="Hemen çıkma" value={fmtPct(bounce)} delta={b ? { dir: b.dir === "up" ? "down" : "up", text: `${b.dir === "up" ? "+" : "-"}${b.text}` } : undefined} />
      <Stat label="Ort. ziyaret süresi" value={fmtDur(avg)} delta={delta(avg, avgBefore)} />
      <Stat label="Dönüşüm" value={fmtPct(pct(conversions, t.visitors))} hint={`${nf.format(conversions)} talep ve randevu`} />
    </div>
  );
}

/** Günlük ziyaretçi (koyu) ve görüntüleme (açık) sütunları; ölçek en yüksek güne göre */
function Chart({ series }: { series: DayPoint[] }) {
  const max = Math.max(1, ...series.map((d) => d.pageviews));
  const W = 1000, H = 220, padL = 44;
  const slot = (W - padL) / Math.max(1, series.length);
  const bar = Math.max(2, slot * 0.62);
  const every = Math.ceil(series.length / 8);
  const ticks = [0, Math.round(max / 2), max];
  const y = (v: number) => H - (v / max) * (H - 10);
  return (
    <figure className="m-0 px-4 pt-3 pb-4">
      <svg viewBox={`0 0 ${W} ${H + 28}`} className="block h-auto w-full" role="img" aria-label="Günlük ziyaretçi ve sayfa görüntüleme">
        {ticks.map((v) => (
          <g key={v}>
            <line x1={padL} x2={W} y1={y(v)} y2={y(v)} stroke="var(--line)" />
            <text x={padL - 8} y={y(v) + 4} textAnchor="end" fontSize="12" fill="var(--muted)">
              {nf.format(v)}
            </text>
          </g>
        ))}
        {series.map((d, i) => {
          const x = padL + i * slot + (slot - bar) / 2;
          return (
            <g key={d.day}>
              <title>{`${dayFmt.format(new Date(`${d.day}T00:00:00Z`))}: ${nf.format(d.visitors)} ziyaretçi, ${nf.format(d.pageviews)} görüntüleme`}</title>
              <rect x={x} y={y(d.pageviews)} width={bar} height={H - y(d.pageviews)} rx={Math.min(3, bar / 3)} fill="var(--accent-soft)" />
              <rect x={x} y={y(d.visitors)} width={bar} height={H - y(d.visitors)} rx={Math.min(3, bar / 3)} fill="var(--accent)" />
              {i % every === 0 ? (
                <text x={x + bar / 2} y={H + 20} textAnchor="middle" fontSize="12" fill="var(--muted)">
                  {dayFmt.format(new Date(`${d.day}T00:00:00Z`))}
                </text>
              ) : null}
            </g>
          );
        })}
      </svg>
      <figcaption className="mt-1 flex gap-4 text-[13px] text-muted">
        <span className="inline-flex items-center gap-1.5">
          <i className="size-3 rounded-[3px] bg-accent" aria-hidden /> Ziyaretçi
        </span>
        <span className="inline-flex items-center gap-1.5">
          <i className="size-3 rounded-[3px] bg-accent-soft" aria-hidden /> Sayfa görüntüleme
        </span>
      </figcaption>
    </figure>
  );
}
