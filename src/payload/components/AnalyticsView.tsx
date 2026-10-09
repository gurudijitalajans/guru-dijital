import Link from "next/link";
import { redirect } from "next/navigation";
import { can } from "../business/roles";
import { DefaultTemplate } from "@payloadcms/next/templates";
import { Gutter } from "@payloadcms/ui";
import type { AdminViewServerProps } from "payload";
import { getOverview, type DayPoint, type MetricRow, type Totals } from "@/lib/umami";
import { daysAgoIso } from "../utils";
import { eventLabel } from "@/lib/analytics";

/**
 * Panel > Ziyaretçi Analizi (/admin/analiz).
 * Umami'den ziyaretçi, görüntüleme, kaynak ve cihaz verisi; panelden de aynı
 * dönemdeki talep ve randevu sayıları (dönüşüm). Umami bağlı değilse kurulum
 * adımları ve yalnız panel verisi gösterilir.
 */

const PERIODS = [7, 30, 90] as const;
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
const fmtDuration = (seconds: number) => {
  const s = Math.round(seconds);
  return s >= 60 ? `${Math.floor(s / 60)} dk ${s % 60} sn` : `${s} sn`;
};

function Change({ now, before, invert = false }: { now: number; before: number | null | undefined; invert?: boolean }) {
  if (before === null || before === undefined || before === 0) return null;
  const diff = ((now - before) / before) * 100;
  if (Math.abs(diff) < 0.5) return <span className="guru-ana__chg">değişim yok</span>;
  const good = invert ? diff < 0 : diff > 0;
  return (
    <span className={`guru-ana__chg ${good ? "is-up" : "is-down"}`}>
      {diff > 0 ? "↑" : "↓"} {fmtPct(Math.abs(diff))} önceki döneme göre
    </span>
  );
}

function Kpis({ t, p, conversions }: { t: Totals; p: Totals | null; conversions: number }) {
  const bounce = pct(t.bounces, t.visits);
  const bounceBefore = p ? pct(p.bounces, p.visits) : null;
  const avg = t.visits > 0 ? t.totaltime / t.visits : 0;
  const avgBefore = p && p.visits > 0 ? p.totaltime / p.visits : null;
  const cards = [
    { label: "Ziyaretçi", value: nf.format(t.visitors), chg: <Change now={t.visitors} before={p?.visitors} /> },
    { label: "Ziyaret", value: nf.format(t.visits), chg: <Change now={t.visits} before={p?.visits} /> },
    { label: "Sayfa görüntüleme", value: nf.format(t.pageviews), chg: <Change now={t.pageviews} before={p?.pageviews} /> },
    { label: "Hemen çıkma", value: fmtPct(bounce), chg: <Change now={bounce} before={bounceBefore} invert /> },
    { label: "Ort. ziyaret süresi", value: fmtDuration(avg), chg: <Change now={avg} before={avgBefore} /> },
    {
      label: "Dönüşüm (talep + randevu)",
      value: fmtPct(pct(conversions, t.visitors)),
      chg: <span className="guru-ana__chg">{nf.format(conversions)} talep ve randevu</span>,
    },
  ];
  return (
    <div className="guru-ana__kpis">
      {cards.map((c) => (
        <div key={c.label} className="guru-ana__kpi">
          <span className="guru-ana__kpi-label">{c.label}</span>
          <span className="guru-ana__kpi-value">{c.value}</span>
          {c.chg}
        </div>
      ))}
    </div>
  );
}

/** Günlük ziyaretçi (koyu) ve görüntüleme (açık) sütunları; çizgisiz, yalnız sütun */
function Chart({ series }: { series: DayPoint[] }) {
  const max = Math.max(1, ...series.map((d) => d.pageviews));
  const W = 1000;
  const H = 220;
  const slot = W / series.length;
  const bar = Math.max(2, slot * 0.62);
  const labelEvery = Math.ceil(series.length / 8);
  return (
    <figure className="guru-ana__chart">
      <svg viewBox={`0 0 ${W} ${H + 28}`} role="img" aria-label="Günlük ziyaretçi ve sayfa görüntüleme">
        {series.map((d, i) => {
          const x = i * slot + (slot - bar) / 2;
          const hp = (d.pageviews / max) * H;
          const hv = (d.visitors / max) * H;
          return (
            <g key={d.day}>
              <title>{`${dayFmt.format(new Date(`${d.day}T00:00:00Z`))}: ${nf.format(d.visitors)} ziyaretçi, ${nf.format(d.pageviews)} görüntüleme`}</title>
              <rect x={x} y={H - hp} width={bar} height={hp} rx={Math.min(4, bar / 3)} fill="#cfe0f6" />
              <rect x={x} y={H - hv} width={bar} height={hv} rx={Math.min(4, bar / 3)} fill="#2a6aca" />
              {i % labelEvery === 0 && (
                <text x={x + bar / 2} y={H + 20} textAnchor="middle" fontSize="13" fill="#6b7487">
                  {dayFmt.format(new Date(`${d.day}T00:00:00Z`))}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      <figcaption className="guru-ana__legend">
        <span>
          <i style={{ background: "#2a6aca" }} /> Ziyaretçi
        </span>
        <span>
          <i style={{ background: "#cfe0f6" }} /> Sayfa görüntüleme
        </span>
      </figcaption>
    </figure>
  );
}

function List({ title, rows, format = (s) => s, empty }: { title: string; rows: MetricRow[]; format?: (s: string) => string; empty: string }) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <section className="guru-ana__list">
      <h3>{title}</h3>
      {rows.length === 0 ? (
        <p className="guru-ana__muted">{empty}</p>
      ) : (
        <ul>
          {rows.map((r) => (
            <li key={r.label}>
              <span className="guru-ana__bar" style={{ width: `${(r.value / max) * 100}%` }} aria-hidden />
              <span className="guru-ana__row-label">{format(r.label)}</span>
              <span className="guru-ana__row-value">{nf.format(r.value)}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function Setup({ hasId }: { hasId: boolean }) {
  return (
    <section className="guru-ana__setup">
      <h3>Ziyaretçi analizini bağlayın</h3>
      <p className="guru-ana__muted">
        Umami çerez kullanmayan, kişisel veri toplamayan açık kaynak bir analiz aracıdır; KVKK açısından çerez izni
        bandı gerektirmez. Bağlantı bir kez kurulur:
      </p>
      <ol>
        <li>
          Guru adına bir Umami hesabı açın: <b>Umami Cloud</b> (ücretsiz başlangıç planı) ya da Guru&apos;nun kendi
          sunucusuna kurulu Umami.
        </li>
        <li>
          Umami&apos;de siteyi ekleyin ve <b>Website ID</b> değerini{" "}
          <Link href="/admin/globals/site-settings">Site Ayarları &gt; Ziyaretçi analizi</Link> alanına yapıştırıp
          sayımı açın. {hasId ? "(Site kimliği girilmiş.)" : ""}
        </li>
        <li>
          Umami&apos;de bir <b>API anahtarı</b> oluşturun; sunucu ortam değişkenlerine <code>UMAMI_API_URL</code> (Cloud
          için <code>https://api.umami.is/v1</code>) ve <code>UMAMI_API_KEY</code> olarak ekleyin. Bu ekran o zaman
          dolar.
        </li>
      </ol>
    </section>
  );
}

export async function AnalyticsView({ initPageResult, params, searchParams }: AdminViewServerProps) {
  const { req, permissions, visibleEntities, locale } = initPageResult;
  /* Özel panel ekranları varsayılan olarak herkese açıktır: giriş zorunlu */
  if (!req.user) redirect("/admin/login?redirect=%2Fadmin%2Fanaliz");
  /* Modülü olmayan kullanıcı panoya döner */
  if (!can(req.user, "site")) redirect("/admin");

  const days = PERIODS.find((p) => String(p) === String(searchParams?.gun)) ?? 30;
  const settings = await req.payload.findGlobal({ slug: "site-settings", depth: 0, req });
  const websiteId = settings.analytics?.websiteId ?? "";
  const since = daysAgoIso(days);
  const [result, leads, bookings] = await Promise.all([
    getOverview(websiteId, days),
    req.payload.count({ collection: "leads", where: { createdAt: { greater_than_equal: since } }, req }),
    req.payload.count({ collection: "bookings", where: { createdAt: { greater_than_equal: since } }, req }),
  ]);
  const conversions = leads.totalDocs + bookings.totalDocs;

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
        <div className="guru-ana">
          <header className="guru-ana__head">
            <div>
              <h1>Ziyaretçi Analizi</h1>
              <p className="guru-ana__muted">Son {days} gün · Türkiye saatiyle</p>
            </div>
            <nav className="guru-ana__periods" aria-label="Dönem">
              {PERIODS.map((p) => (
                <Link key={p} href={`/admin/analiz?gun=${p}`} className={p === days ? "is-active" : undefined}>
                  {p} gün
                </Link>
              ))}
            </nav>
          </header>

          <div className="guru-ana__panel-row">
            <Link href="/admin/collections/leads" className="guru-ana__mini">
              <b>{nf.format(leads.totalDocs)}</b> talep
            </Link>
            <Link href="/admin/collections/bookings" className="guru-ana__mini">
              <b>{nf.format(bookings.totalDocs)}</b> randevu talebi
            </Link>
            <span className="guru-ana__muted">bu dönemde sitedeki formlardan geldi</span>
          </div>

          {result.ok ? (
            <>
              <Kpis t={result.data.totals} p={result.data.previous} conversions={conversions} />
              <Chart series={result.data.series} />
              <div className="guru-ana__grid">
                <List title="En çok görüntülenen sayfalar" rows={result.data.pages} empty="Bu dönemde görüntüleme yok." />
                <List title="Ziyaretçilerin geldiği yerler" rows={result.data.referrers} empty="Bu dönemde yönlendiren site yok." />
                <List
                  title="Olaylar (form ve buton tıklamaları)"
                  rows={result.data.events}
                  format={eventLabel}
                  empty="Henüz olay yok. Form gönderimleri ve öne çıkan buton tıklamaları burada listelenir."
                />
                <List title="Cihazlar" rows={result.data.devices} format={(s) => DEVICE[s] ?? s} empty="Veri yok." />
                <List title="Ülkeler" rows={result.data.countries} format={regionName} empty="Veri yok." />
              </div>
            </>
          ) : result.reason === "not-configured" ? (
            <Setup hasId={Boolean(websiteId)} />
          ) : (
            <section className="guru-ana__setup">
              <h3>Umami&apos;ye ulaşılamadı</h3>
              <p className="guru-ana__muted">
                Bağlantı ayarlarını kontrol edin. Ayrıntı: <code>{result.message}</code>
              </p>
            </section>
          )}
        </div>
      </Gutter>
    </DefaultTemplate>
  );
}
