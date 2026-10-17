import type { Metadata } from "next";
import Link from "next/link";
import { requireModule } from "@/panel/context";
import { cms, getSiteInfo } from "@/lib/cms";
import { PageHeader } from "@/panel/ui/page-header";
import { Card, CardHeader, Empty } from "@/panel/ui/card";
import { BarList } from "@/panel/ui/period";
import { Button } from "@/panel/ui/button";
import { eventLabel } from "@/lib/analytics";
import { kanalAdi, KANALLAR } from "@/lib/analiz/kanal";
import { aktar } from "@/lib/analiz/depo";
import { redisConfigured } from "@/lib/analiz/tampon";
import { hasTable, report, type Report } from "@/lib/analiz/okuma";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Analiz" };
export const dynamic = "force-dynamic";

const PERIODS = [7, 30, 90];
const nf = new Intl.NumberFormat("tr-TR");
const money = new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 });
const dayFmt = new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "short", timeZone: "UTC" });
const DEVICE: Record<string, string> = { masaustu: "Masaüstü", mobil: "Mobil", tablet: "Tablet" };
const regionName = (() => {
  try {
    const dn = new Intl.DisplayNames(["tr"], { type: "region" });
    return (c: string) => (c && c.length === 2 ? (dn.of(c.toUpperCase()) ?? c) : c);
  } catch {
    return (c: string) => c;
  }
})();
const pct = (a: number, b: number) => (b > 0 ? (a / b) * 100 : 0);
/* Oranlar: sayaç ile CRM ayrı kaynaktan sayıldığı için pay paydayı aşabilir; %100'de kesilir */
const share = (a: number, b: number) => Math.min(100, pct(a, b));
const fmtPct = (v: number) => `%${v.toLocaleString("tr-TR", { maximumFractionDigits: 1 })}`;
const fmtDur = (s: number) => (Math.round(s) >= 60 ? `${Math.floor(s / 60)} dk ${Math.round(s) % 60} sn` : `${Math.round(s)} sn`);
const istDay = (d: Date) => new Date(d.getTime() + 3 * 3600000).toISOString().slice(0, 10);
const startOf = (day: string) => new Date(`${day}T00:00:00+03:00`).toISOString();

/** Karşılaştırma: yön (ok) ve iyi/kötü (renk) ayrı; hemen çıkmada artış kötüdür */
function Delta({ now, before, lowerIsBetter = false, pp = false }: { now: number; before: number; lowerIsBetter?: boolean; pp?: boolean }) {
  if (!before && !now) return null;
  if (!before) return <span className="text-[12px] text-muted">önceki dönemde yok</span>;
  const d = pp ? now - before : ((now - before) / before) * 100;
  if (Math.abs(d) < 0.5) return <span className="text-[12px] text-muted">değişmedi</span>;
  const good = lowerIsBetter ? d < 0 : d > 0;
  return (
    <span className={cn("rounded-full px-1.5 py-px text-[12px] font-medium", good ? "bg-good-soft text-good" : "bg-bad-soft text-bad")}>
      {d > 0 ? "↑" : "↓"} {pp ? `${Math.abs(d).toLocaleString("tr-TR", { maximumFractionDigits: 1 })} puan` : fmtPct(Math.abs(d))}
    </span>
  );
}

function Kpi({ label, value, delta, href }: { label: string; value: string; delta: React.ReactNode; href?: string }) {
  const body = (
    <>
      <div className="text-[13px] text-muted">{label}</div>
      <div className="tabular mt-0.5 text-[24px] font-semibold leading-tight text-ink">{value}</div>
      <div className="mt-1 min-h-5">{delta}</div>
    </>
  );
  const cls = "min-w-0 rounded-card border border-line bg-surface px-4 py-3.5 no-underline";
  return href ? (
    <Link href={href} className={cn(cls, "block hover:border-accent")}>
      {body}
    </Link>
  ) : (
    <div className={cls}>{body}</div>
  );
}

/** Günlük oturum: çubuklar bu dönem, kesikli çizgi önceki dönem (aynı gün sırasıyla) */
function DailyChart({ days, cur, prev }: { days: string[]; cur: Map<string, number>; prev: number[] }) {
  const W = 720;
  const H = 180;
  const pad = { l: 34, r: 8, t: 10, b: 24 };
  const vals = days.map((d) => cur.get(d) ?? 0);
  /* Eksenin üstü yuvarlak, ikiye bölünebilen sayıya çıkar (21 değil 40, ara çizgi 20) */
  const raw = Math.max(4, ...vals, ...prev);
  const unit = 10 ** Math.floor(Math.log10(raw));
  const max = [2, 4, 6, 8, 10].map((m) => m * unit).find((m) => m >= raw) ?? 10 * unit;
  const step = (W - pad.l - pad.r) / days.length;
  const y = (v: number) => pad.t + (H - pad.t - pad.b) * (1 - v / max);
  const ticks = [0, max / 2, max];
  const every = Math.ceil(days.length / 8);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full" role="img" aria-label={`Günlük oturum: ${days.map((d, i) => `${d} ${vals[i]}`).join(", ")}`}>
      {ticks.map((t) => (
        <g key={t}>
          <line x1={pad.l} x2={W - pad.r} y1={y(t)} y2={y(t)} stroke="var(--line)" strokeWidth="1" />
          <text x={pad.l - 6} y={y(t) + 4} textAnchor="end" fontSize="11" fill="var(--muted)">
            {nf.format(t)}
          </text>
        </g>
      ))}
      {vals.map((v, i) => (
        <rect key={days[i]} x={pad.l + i * step + step * 0.18} y={y(v)} width={step * 0.64} height={Math.max(0, H - pad.b - y(v))} rx="2" fill="var(--accent)">
          <title>{`${dayFmt.format(new Date(`${days[i]}T12:00:00Z`))}: ${v} oturum`}</title>
        </rect>
      ))}
      {prev.length ? <polyline fill="none" stroke="var(--muted)" strokeDasharray="4 4" strokeWidth="1.5" points={prev.slice(0, days.length).map((v, i) => `${pad.l + i * step + step / 2},${y(v)}`).join(" ")} /> : null}
      {days.map((d, i) =>
        i % every === 0 ? (
          <text key={d} x={pad.l + i * step + step / 2} y={H - 6} textAnchor="middle" fontSize="11" fill="var(--muted)">
            {dayFmt.format(new Date(`${d}T12:00:00Z`))}
          </text>
        ) : null,
      )}
    </svg>
  );
}

function FunnelCard({ r }: { r: Report }) {
  const all = r.crmNow.leads + r.crmNow.bookings;
  const steps = [
    { label: "Oturum", v: r.funnel.sessions, hint: "Siteye gelen her ziyaret" },
    { label: "Hizmet ya da ürün sayfası", v: r.funnel.offer, hint: "En az bir hizmet veya ürün sayfası açıldı" },
    { label: "Harekete geçti", v: r.funnel.cta, hint: "Teklif Al, Toplantı Planla, WhatsApp, telefon, sohbet" },
    { label: "Form başlatıldı", v: r.funnel.form, hint: "Bir formun alanına yazmaya başladı" },
    { label: "Talep ya da randevu", v: r.crmNow.site, hint: all > r.crmNow.site ? `Site formlarından; panel ve kanallarla birlikte ${nf.format(all)}` : "Site formlarından gelen kayıt" },
    { label: "Kazanılan iş", v: r.crmNow.won, hint: r.crmNow.wonValue ? money.format(r.crmNow.wonValue) : "Dönemde kapanan fırsat" },
  ];
  const top = Math.max(1, steps[0].v);
  return (
    <Card>
      <CardHeader title="Dönüşüm hunisi" />
      <ol className="m-0 grid list-none gap-3 p-4">
        {steps.map((s, i) => {
          const prevV = i ? steps[i - 1].v : 0;
          const drop = i && prevV ? 100 - share(s.v, prevV) : 0;
          return (
            <li key={s.label} className="grid gap-1">
              <div className="flex items-baseline justify-between gap-3 text-[14px]">
                <span className="min-w-0 text-ink">{s.label}</span>
                <span className="tabular shrink-0 font-semibold text-ink">
                  {nf.format(s.v)} <span className="font-normal text-muted">{i ? fmtPct(share(s.v, top)) : ""}</span>
                </span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-sunken" aria-hidden>
                <div className="h-full rounded-full bg-accent" style={{ width: `${Math.max(s.v ? 1.5 : 0, share(s.v, top))}%` }} />
              </div>
              <div className="flex justify-between gap-3 text-[12px] text-muted">
                <span>{s.hint}</span>
                {i && prevV && drop > 0 ? <span className="text-bad">önceki adımdan %{Math.round(drop)} kayıp</span> : null}
              </div>
            </li>
          );
        })}
      </ol>
    </Card>
  );
}

function ChannelTable({ r }: { r: Report }) {
  const keys = new Set<string>([...r.channels.map((c) => c.k), ...r.leadsByChannel.keys(), ...r.revenueByChannel.keys()]);
  const rows = [...keys]
    .map((k) => ({ k, s: r.channels.find((c) => c.k === k)?.n ?? 0, l: r.leadsByChannel.get(k) ?? 0, rev: r.revenueByChannel.get(k)?.v ?? 0 }))
    .sort((a, b) => b.s - a.s || b.l - a.l);
  if (!rows.length) return <Empty>Bu dönemde kanal verisi yok.</Empty>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-[14px]">
        <thead>
          <tr className="text-left text-[12px] text-muted">
            <th className="px-4 py-2 font-medium">Kanal</th>
            <th className="px-3 py-2 text-right font-medium">Oturum</th>
            <th className="px-3 py-2 text-right font-medium">Talep ve randevu</th>
            <th className="px-3 py-2 text-right font-medium">Dönüşüm</th>
            <th className="px-4 py-2 text-right font-medium">Kazanılan gelir</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((x) => (
            <tr key={x.k} className="odd:bg-sunken/50">
              <td className="px-4 py-2 text-ink">{x.k === "bilinmiyor" ? "Kaynağı bilinmeyen (eski ya da sayaçsız)" : kanalAdi(x.k)}</td>
              <td className="tabular px-3 py-2 text-right">{nf.format(x.s)}</td>
              <td className="tabular px-3 py-2 text-right">{nf.format(x.l)}</td>
              <td className="tabular px-3 py-2 text-right text-muted">{x.s ? fmtPct(share(x.l, x.s)) : "-"}</td>
              <td className="tabular px-4 py-2 text-right">{x.rev ? money.format(x.rev) : "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ---- İzleme kodları sekmesi ---- */
async function TagsTab() {
  const info = await getSiteInfo();
  const z = info.izleme ?? {};
  const items = [
    { name: "Guru ölçümü (çerezsiz)", on: true, detail: redisConfigured() ? "Açık · tampon bağlı" : "Açık · tampon (Upstash) bağlı değil", consent: "Onay gerekmez; Analitik reddedilirse sayılmaz" },
    { name: "Meta Pixel", on: Boolean(z.metaPixelId), detail: z.metaPixelId ?? "Kimlik girilmedi", consent: "Pazarlama onayı" },
    { name: "Google Ads", on: Boolean(z.googleAdsId), detail: z.googleAdsId ? `${z.googleAdsId} · ${[z.adsTalep && "talep", z.adsRandevu && "randevu", z.adsIletisim && "iletişim"].filter(Boolean).join(", ") || "dönüşüm etiketi yok"}` : "Kimlik girilmedi", consent: "Pazarlama onayı" },
    { name: "Google Analytics 4", on: Boolean(z.ga4Id), detail: z.ga4Id ?? "Kimlik girilmedi", consent: "Pazarlama onayı" },
    { name: "Google Tag Manager", on: Boolean(z.gtmId), detail: z.gtmId ?? "Kimlik girilmedi", consent: "Pazarlama onayı" },
    { name: "TikTok Pixel", on: Boolean(z.tiktokPixelId), detail: z.tiktokPixelId ?? "Kimlik girilmedi", consent: "Pazarlama onayı" },
    { name: "LinkedIn Insight", on: Boolean(z.linkedinPartnerId), detail: z.linkedinPartnerId ?? "Kimlik girilmedi", consent: "Pazarlama onayı" },
    { name: "Microsoft Clarity", on: Boolean(z.clarityId), detail: z.clarityId ?? "Kimlik girilmedi", consent: "Analitik onayı" },
    { name: "Özel head kodu", on: Boolean(z.customHead), detail: z.customHead ? `${z.customHead.length} karakter` : "Boş", consent: z.customHeadConsent === "analitik" ? "Analitik onayı" : "Pazarlama onayı" },
  ];
  return (
    <div className="grid gap-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((it) => (
          <div key={it.name} className="min-w-0 rounded-card border border-line bg-surface p-4">
            <div className="flex items-center justify-between gap-2">
              <span className="font-semibold text-ink">{it.name}</span>
              <span className={cn("rounded-full px-2 py-0.5 text-[12px] font-medium", it.on ? "bg-good-soft text-good" : "bg-sunken text-muted")}>{it.on ? "Bağlı" : "Bağlı değil"}</span>
            </div>
            <p className="mt-1 mb-0 truncate font-mono text-[13px] text-muted">{it.detail}</p>
            <p className="mt-1 mb-0 text-[12px] text-muted">{it.consent}</p>
          </div>
        ))}
      </div>
      <div>
        <Button asChild variant="primary">
          <Link href="/panel/duzenle/site-settings">Kodları düzenle</Link>
        </Button>
      </div>
      <Card>
        <CardHeader title="Site olayları etiketlere nasıl gider" />
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-[14px]">
            <thead>
              <tr className="text-left text-[12px] text-muted">
                <th className="px-4 py-2 font-medium">Site olayı</th>
                <th className="px-3 py-2 font-medium">Meta</th>
                <th className="px-3 py-2 font-medium">Google Ads</th>
                <th className="px-3 py-2 font-medium">GA4</th>
                <th className="px-4 py-2 font-medium">TikTok</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Talep gönderildi", "Lead", "Dönüşüm: talep etiketi", "generate_lead", "SubmitForm"],
                ["Randevu alındı", "Schedule", "Dönüşüm: randevu etiketi", "randevu_alindi", "SubmitForm"],
                ["Telefon, WhatsApp, e-posta tıklaması", "Contact", "Dönüşüm: iletişim etiketi", "telefon / whatsapp / e_posta", "Contact"],
                ["Diğer tıklamalar (Teklif Al, Toplantı Planla)", "Özel olay", "Yok", "teklif_al, toplanti_planla", "Yok"],
              ].map((r) => (
                <tr key={r[0]} className="odd:bg-sunken/50">
                  {r.map((c, i) => (
                    <td key={i} className={cn("px-3 py-2", i === 0 && "px-4 text-ink")}>
                      {c}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="m-0 px-4 py-3 text-[13px] text-muted">Her olay tüm etiketlere aynı olay kimliğiyle gider; ileride sunucudan Meta Conversions API eklendiğinde aynı kimlikle tekilleştirilir.</p>
      </Card>
    </div>
  );
}

/** Bu dönem ve kıyas dönemi (İstanbul günleriyle); geçen yıl seçiliyse 365 gün geri */
function rangesFor(days: number, yoy: boolean) {
  const now = Date.now();
  const today = istDay(new Date(now));
  const fromDay = istDay(new Date(now - (days - 1) * 86400000));
  const cur = { from: startOf(fromDay), to: new Date(now).toISOString() };
  const len = now - new Date(cur.from).getTime();
  const shift = (iso: string, ms: number) => new Date(new Date(iso).getTime() - ms).toISOString();
  const prev = yoy ? { from: shift(cur.from, 365 * 86400000), to: shift(cur.to, 365 * 86400000) } : { from: shift(cur.from, len), to: cur.from };
  return { today, fromDay, cur, prev };
}

export default async function AnalyticsPage({ searchParams }: { searchParams: Promise<{ gun?: string; kiyas?: string; sekme?: string }> }) {
  const ctx = await requireModule("site");
  const sp = await searchParams;
  const days = PERIODS.find((d) => String(d) === sp.gun) ?? 30;
  const yoy = sp.kiyas === "yil";
  const tab = sp.sekme === "kodlar" ? "kodlar" : "genel";
  const qs = (o: Record<string, string | number | undefined>) => {
    const p = new URLSearchParams();
    const all = { gun: days, kiyas: yoy ? "yil" : undefined, sekme: tab === "kodlar" ? "kodlar" : undefined, ...o };
    for (const [k, v] of Object.entries(all)) if (v !== undefined && v !== "") p.set(k, String(v));
    return `/panel/analiz?${p.toString()}`;
  };
  const tabs = (
    <div className="mb-4 inline-flex rounded-[9px] border border-line bg-sunken p-[3px]" role="tablist" aria-label="Analiz bölümleri">
      {[
        ["genel", "Genel bakış"],
        ["kodlar", "İzleme kodları"],
      ].map(([k, l]) => (
        <Link key={k} href={qs({ sekme: k === "kodlar" ? "kodlar" : "" })} role="tab" aria-selected={tab === k} className={cn("grid min-h-8.5 pointer-coarse:min-h-11 place-items-center rounded-[7px] px-3 font-medium text-muted no-underline", tab === k && "bg-surface text-ink shadow-sm")}>
          {l}
        </Link>
      ))}
    </div>
  );

  if (tab === "kodlar")
    return (
      <>
        <PageHeader title="Analiz" description="Reklam ve ölçüm etiketleri, çerez onayına bağlı" />
        {tabs}
        <TagsTab />
      </>
    );

  const payload = await cms();
  if (!(await hasTable(payload)))
    return (
      <>
        <PageHeader title="Analiz" />
        {tabs}
        <Card>
          <CardHeader title="Ölçüm tablosu bu ortamda yok" />
          <Empty>Ziyaretçi ölçümü canlı Postgres veritabanında çalışır (yerel SQLite geliştirme ortamında tablo kurulmaz). Canlı panelde bu ekran dolar.</Empty>
        </Card>
      </>
    );

  /* Tampondaki son olaylar ekran açılınca aktarılır (canlı görünüm ve bugünün sayıları güncel olsun) */
  await aktar(payload).catch(() => null);
  const { today, fromDay, cur, prev } = rangesFor(days, yoy);
  const r = await report(payload, cur, prev, ctx.tenant.id);
  const dayList = Array.from({ length: days }, (_, i) => istDay(new Date(new Date(`${fromDay}T12:00:00Z`).getTime() + i * 86400000))).filter((d) => d <= today);
  const curMap = new Map(r.daily.map((d) => [d.d, d.s]));
  const prevVals = r.dailyPrev.map((d) => d.s);
  /* Oran: siteden gelen talep ve randevu / oturum. Panelden, WhatsApp'tan ya da elle girilen kayıtlar
     sayılmaz (yoksa oran %100'ü aşar); sayaç tamponu gecikirse diye %100'de kesilir */
  const rate = share(r.crmNow.site, r.now.sessions);
  const ratePrev = share(r.crmBefore.site, r.before.sessions);
  const bounce = pct(r.now.bounces, r.now.sessions);
  const bouncePrev = pct(r.before.bounces, r.before.sessions);
  const kiyas = yoy ? "geçen yılın aynı dönemi" : "önceki dönem";
  const total = (rows: { n: number }[]) => rows.reduce((a, b) => a + b.n, 0);

  return (
    <>
      <PageHeader
        title="Analiz"
        description={`Guru Dijital sitesi · son ${days} gün, ${kiyas} ile · Türkiye saatiyle`}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full bg-good-soft px-3 py-1.5 text-[13px] font-medium text-good">
              <span className="size-2 rounded-full bg-good" aria-hidden /> Şu an {nf.format(r.live)} ziyaretçi
            </span>
            <div className="inline-flex rounded-[9px] border border-line bg-sunken p-[3px]" role="group" aria-label="Dönem">
              {PERIODS.map((d) => (
                <Link key={d} href={qs({ gun: d })} aria-current={days === d ? "page" : undefined} className={cn("grid min-h-8.5 pointer-coarse:min-h-11 place-items-center rounded-[7px] px-3 font-medium text-muted no-underline", days === d && "bg-surface text-ink shadow-sm")}>
                  {d} gün
                </Link>
              ))}
            </div>
            <div className="inline-flex rounded-[9px] border border-line bg-sunken p-[3px]" role="group" aria-label="Karşılaştırma">
              {[
                ["", "Önceki dönem"],
                ["yil", "Geçen yıl"],
              ].map(([k, l]) => (
                <Link key={l} href={qs({ kiyas: k })} aria-current={(k === "yil") === yoy ? "page" : undefined} className={cn("grid min-h-8.5 pointer-coarse:min-h-11 place-items-center rounded-[7px] px-3 font-medium text-muted no-underline", (k === "yil") === yoy && "bg-surface text-ink shadow-sm")}>
                  {l}
                </Link>
              ))}
            </div>
          </div>
        }
      />
      {tabs}
      {!redisConfigured() && process.env.NODE_ENV === "production" ? (
        <p className="mb-4 rounded-card bg-warn-soft px-4 py-3 text-[14px] text-warn">Ölçüm tamponu (Upstash Redis) bağlı değil; site şu an ziyaret saymıyor. Vercel &gt; Storage &gt; Upstash for Redis eklenince sayım başlar.</p>
      ) : null}

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <Kpi label="Ziyaretçi" value={nf.format(r.now.visitors)} delta={<Delta now={r.now.visitors} before={r.before.visitors} />} />
        <Kpi label="Oturum" value={nf.format(r.now.sessions)} delta={<Delta now={r.now.sessions} before={r.before.sessions} />} />
        <Kpi label="Dönüşüm oranı" value={fmtPct(rate)} delta={<Delta now={rate} before={ratePrev} pp />} />
        <Kpi label="Talep" value={nf.format(r.crmNow.leads)} delta={<Delta now={r.crmNow.leads} before={r.crmBefore.leads} />} href="/panel/gelen?f=talep" />
        <Kpi label="Randevu" value={nf.format(r.crmNow.bookings)} delta={<Delta now={r.crmNow.bookings} before={r.crmBefore.bookings} />} href="/panel/gelen?f=randevu" />
        <Kpi label="Kazanılan gelir" value={money.format(r.crmNow.wonValue)} delta={<Delta now={r.crmNow.wonValue} before={r.crmBefore.wonValue} />} href="/panel/firsatlar" />
      </div>
      <div className="mt-3 grid grid-cols-3 gap-3">
        <Kpi label="Sayfa görüntüleme" value={nf.format(r.now.pageviews)} delta={<Delta now={r.now.pageviews} before={r.before.pageviews} />} />
        <Kpi label="Hemen çıkma" value={fmtPct(bounce)} delta={<Delta now={bounce} before={bouncePrev} lowerIsBetter pp />} />
        <Kpi label="Ortalama süre" value={fmtDur(r.now.duration)} delta={<Delta now={r.now.duration} before={r.before.duration} />} />
      </div>

      <Card className="mt-4">
        <CardHeader title="Günlük oturum" action={<span className="text-[12px] text-muted">Kesikli çizgi: {kiyas}</span>} />
        <div className="p-4">{r.now.sessions || r.before.sessions ? <DailyChart days={dayList} cur={curMap} prev={prevVals} /> : <Empty>Bu dönemde henüz ziyaret yok. Sayaç yeni kuruldu; ilk ziyaretler birkaç dakika içinde görünür.</Empty>}</div>
      </Card>

      <div className="mt-4 grid items-start gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <FunnelCard r={r} />
        <Card>
          <CardHeader title="Kanal performansı" />
          <ChannelTable r={r} />
        </Card>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Card>
          <CardHeader title="En çok görüntülenen sayfalar" />
          <BarList rows={r.pages.map((x) => ({ label: x.k, value: x.n, note: `${nf.format(x.m ?? 0)} oturum` }))} empty="Henüz görüntüleme yok." note={(x) => x.note} />
        </Card>
        <Card>
          <CardHeader title="Giriş sayfaları" />
          <BarList rows={r.landings.map((x) => ({ label: x.k, value: x.n }))} empty="Henüz giriş yok." />
        </Card>
        <Card>
          <CardHeader title="Olaylar" />
          <BarList rows={r.events.map((x) => ({ label: eventLabel(x.k), value: x.n, note: `${nf.format(x.m ?? 0)} oturumda` }))} empty="Henüz olay yok." note={(x) => x.note} />
        </Card>
        <Card>
          <CardHeader title="Yönlendiren siteler" />
          <BarList rows={r.refs.map((x) => ({ label: x.k, value: x.n }))} empty="Yönlendiren site yok." />
        </Card>
        <Card>
          <CardHeader title="Kampanyalar (UTM)" />
          <BarList rows={r.campaigns.map((x) => ({ label: x.k, value: x.n }))} empty="UTM'li bağlantıyla gelen ziyaret yok. Reklam ve paylaşım bağlantılarına utm_source ve utm_campaign ekleyin." />
        </Card>
        <Card>
          <CardHeader title="Şu an sitede" action={<span className="text-[12px] text-muted">son 5 dakika</span>} />
          <BarList rows={r.livePages.map((x) => ({ label: x.k, value: x.n }))} empty="Şu an sitede kimse yok." />
        </Card>
        <Card>
          <CardHeader title="Cihaz" />
          <BarList rows={r.devices.map((x) => ({ label: DEVICE[x.k] ?? x.k, value: x.n, note: fmtPct(pct(x.n, total(r.devices))) }))} empty="Veri yok." note={(x) => x.note} />
        </Card>
        <Card>
          <CardHeader title="Şehir" />
          <BarList rows={r.cities.map((x) => ({ label: x.k, value: x.n }))} empty="Veri yok." />
        </Card>
        <Card>
          <CardHeader title="Ülke ve tarayıcı" />
          <BarList rows={[...r.countries.map((x) => ({ label: regionName(x.k), value: x.n })), ...r.browsers.map((x) => ({ label: `Tarayıcı: ${x.k}`, value: x.n }))]} empty="Veri yok." />
        </Card>
      </div>
      <p className="mt-4 text-[12px] text-muted">
        Ölçüm çerezsizdir: kişi saklanmaz, ziyaretçi her gün yeniden sayılır. Botlar ve panele giriş yapmış ekip sayılmaz. {"Talep, randevu ve gelir CRM'den gelir; kanalları formla birlikte kaydedilen kaynak bilgisinden."} Kanallar: {Object.values(KANALLAR).join(", ")}.
      </p>
    </>
  );
}
