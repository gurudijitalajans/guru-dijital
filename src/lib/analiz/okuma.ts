import "server-only";
import type { Payload } from "payload";
import { poolOf } from "./depo";

/**
 * Analiz sayfasının sorguları (Postgres, ga_events + CRM tabloları). Tüm
 * günler İstanbul saatine göre. Ziyaretçi sayısı çerezsiz ölçümde günlük tekildir
 * (aynı kişi farklı günlerde ayrı sayılır); oturum sekme başına sayılır.
 */
export type Range = { from: string; to: string };
export type Totals = { sessions: number; visitors: number; pageviews: number; bounces: number; duration: number };
/** site: yalnız site formlarından gelenler (kaynak bilgisi olan); oran oturuma bununla bölünür */
export type CRM = { leads: number; bookings: number; site: number; won: number; wonValue: number };
export type Funnel = { sessions: number; offer: number; cta: number; form: number; conv: number };
export type Row = { k: string; n: number; m?: number };

/** Ziyaretçinin bir harekete geçtiğini gösteren tıklamalar (huni: "Harekete geçti") */
export const CTA_EVENTS = ["teklif-al", "toplanti-planla", "iletisim", "bize-yazin", "giris-ana-buton", "giris-ikinci-buton", "kapanis-ana-buton", "kapanis-ikinci-buton", "whatsapp", "telefon", "e-posta", "sohbet-ac"];

const n = (v: unknown) => Number(v ?? 0) || 0;
const TZ = `'Europe/Istanbul'`;

export async function hasTable(payload: Payload) {
  const pool = poolOf(payload);
  if (!pool) return false;
  const r = await pool.query(`SELECT to_regclass('public.ga_events') AS t`).catch(() => ({ rows: [{ t: null }] }));
  return Boolean(r.rows[0]?.t);
}

export async function report(payload: Payload, cur: Range, prev: Range, tenant: number) {
  const pool = poolOf(payload)!;
  const q = async (sql: string, vals: unknown[]) => (await pool.query(sql, vals)).rows;
  const totals = async (r: Range): Promise<Totals> => {
    const [x] = await q(
      `WITH s AS (SELECT sid, min(ts) a, max(ts) b, count(*) FILTER (WHERE kind='pv') pv, count(*) FILTER (WHERE kind='ev') ev, max(vid) vid
         FROM ga_events WHERE ts >= $1 AND ts < $2 GROUP BY sid)
       SELECT count(*) sessions, count(DISTINCT vid) visitors, coalesce(sum(pv),0) pageviews,
              count(*) FILTER (WHERE pv <= 1 AND ev = 0) bounces,
              coalesce(avg(extract(epoch FROM b - a)) FILTER (WHERE pv > 1 OR ev > 0), 0) duration
       FROM s`,
      [r.from, r.to],
    );
    return { sessions: n(x.sessions), visitors: n(x.visitors), pageviews: n(x.pageviews), bounces: n(x.bounces), duration: n(x.duration) };
  };
  const crm = async (r: Range): Promise<CRM> => {
    const [x] = await q(
      `SELECT (SELECT count(*) FROM leads WHERE tenant_id = $3 AND created_at >= $1 AND created_at < $2) leads,
              (SELECT count(*) FROM bookings WHERE tenant_id = $3 AND created_at >= $1 AND created_at < $2) bookings,
              (SELECT count(*) FROM leads WHERE tenant_id = $3 AND created_at >= $1 AND created_at < $2 AND kaynak_kanal IS NOT NULL)
                + (SELECT count(*) FROM bookings WHERE tenant_id = $3 AND created_at >= $1 AND created_at < $2 AND kaynak_kanal IS NOT NULL) site,
              (SELECT count(*) FROM deals WHERE tenant_id = $3 AND stage = 'kazanildi' AND closed_at >= $1 AND closed_at < $2) won,
              (SELECT coalesce(sum(value),0) FROM deals WHERE tenant_id = $3 AND stage = 'kazanildi' AND closed_at >= $1 AND closed_at < $2) won_value`,
      [r.from, r.to, tenant],
    );
    return { leads: n(x.leads), bookings: n(x.bookings), site: n(x.site), won: n(x.won), wonValue: n(x.won_value) };
  };
  const series = async (r: Range) =>
    (await q(`SELECT to_char(ts AT TIME ZONE ${TZ}, 'YYYY-MM-DD') d, count(DISTINCT sid) s, count(*) FILTER (WHERE kind='pv') p FROM ga_events WHERE ts >= $1 AND ts < $2 GROUP BY 1 ORDER BY 1`, [r.from, r.to])).map((x) => ({ d: String(x.d), s: n(x.s), p: n(x.p) }));
  const group = async (sql: string) => (await q(sql, [cur.from, cur.to])).map((x) => ({ k: String(x.k ?? ""), n: n(x.n), m: x.m === undefined ? undefined : n(x.m) }));
  const W = `ts >= $1 AND ts < $2`;

  const [now, before, crmNow, crmBefore, daily, dailyPrev, channels, campaigns, refs, pages, landings, events, devices, browsers, oses, countries, cities, funnelRow, leadsByChannel, revenueByChannel, live, livePages] = await Promise.all([
    totals(cur),
    totals(prev),
    crm(cur),
    crm(prev),
    series(cur),
    series(prev),
    group(`SELECT coalesce(channel,'dogrudan') k, count(DISTINCT sid) n FROM ga_events WHERE entry AND ${W} GROUP BY 1 ORDER BY 2 DESC`),
    group(`SELECT utm_source || ' / ' || utm_campaign k, count(DISTINCT sid) n FROM ga_events WHERE entry AND utm_campaign IS NOT NULL AND ${W} GROUP BY 1 ORDER BY 2 DESC LIMIT 10`),
    group(`SELECT ref k, count(DISTINCT sid) n FROM ga_events WHERE entry AND ref IS NOT NULL AND ${W} GROUP BY 1 ORDER BY 2 DESC LIMIT 10`),
    group(`SELECT path k, count(*) n, count(DISTINCT sid) m FROM ga_events WHERE kind='pv' AND ${W} GROUP BY 1 ORDER BY 2 DESC LIMIT 12`),
    group(`SELECT path k, count(DISTINCT sid) n FROM ga_events WHERE entry AND ${W} GROUP BY 1 ORDER BY 2 DESC LIMIT 10`),
    group(`SELECT name k, count(*) n, count(DISTINCT sid) m FROM ga_events WHERE kind='ev' AND ${W} GROUP BY 1 ORDER BY 2 DESC LIMIT 20`),
    group(`SELECT device k, count(DISTINCT sid) n FROM ga_events WHERE ${W} GROUP BY 1 ORDER BY 2 DESC`),
    group(`SELECT browser k, count(DISTINCT sid) n FROM ga_events WHERE ${W} GROUP BY 1 ORDER BY 2 DESC LIMIT 6`),
    group(`SELECT os k, count(DISTINCT sid) n FROM ga_events WHERE ${W} GROUP BY 1 ORDER BY 2 DESC LIMIT 6`),
    group(`SELECT country k, count(DISTINCT sid) n FROM ga_events WHERE country IS NOT NULL AND ${W} GROUP BY 1 ORDER BY 2 DESC LIMIT 8`),
    group(`SELECT city k, count(DISTINCT sid) n FROM ga_events WHERE city IS NOT NULL AND ${W} GROUP BY 1 ORDER BY 2 DESC LIMIT 8`),
    q(
      `WITH s AS (SELECT sid,
          bool_or(kind='pv' AND (path LIKE '/hizmetler/%' OR path LIKE '/urunler/%')) offer,
          bool_or(kind='ev' AND name = ANY($3)) cta,
          bool_or(kind='ev' AND name = 'form-basladi') form,
          bool_or(kind='ev' AND name IN ('talep-gonderildi','randevu-alindi')) conv
        FROM ga_events WHERE ${W} GROUP BY sid)
       SELECT count(*) sessions, count(*) FILTER (WHERE offer) offer, count(*) FILTER (WHERE cta) cta, count(*) FILTER (WHERE form) form, count(*) FILTER (WHERE conv) conv FROM s`,
      [cur.from, cur.to, CTA_EVENTS],
    ),
    q(`SELECT coalesce(k,'bilinmiyor') k, sum(n) n FROM (SELECT kaynak_kanal::text k, count(*) n FROM leads WHERE tenant_id = $3 AND created_at >= $1 AND created_at < $2 GROUP BY 1 UNION ALL SELECT kaynak_kanal::text k, count(*) n FROM bookings WHERE tenant_id = $3 AND created_at >= $1 AND created_at < $2 GROUP BY 1) x GROUP BY 1`, [cur.from, cur.to, tenant]),
    q(`SELECT coalesce(l.kaynak_kanal::text,'bilinmiyor') k, coalesce(sum(d.value),0) v, count(*) n FROM deals d LEFT JOIN leads l ON l.id = d.lead_id WHERE d.tenant_id = $3 AND d.stage = 'kazanildi' AND d.closed_at >= $1 AND d.closed_at < $2 GROUP BY 1`, [cur.from, cur.to, tenant]),
    q(`SELECT count(DISTINCT sid) n FROM ga_events WHERE ts > now() - interval '5 minutes'`, []),
    q(`SELECT path k, count(DISTINCT sid) n FROM ga_events WHERE ts > now() - interval '5 minutes' AND kind='pv' GROUP BY 1 ORDER BY 2 DESC LIMIT 5`, []),
  ]);
  const f = funnelRow[0] ?? {};
  return {
    now,
    before,
    crmNow,
    crmBefore,
    daily,
    dailyPrev,
    channels,
    campaigns,
    refs,
    pages,
    landings,
    events,
    devices,
    browsers,
    oses,
    countries,
    cities,
    funnel: { sessions: n(f.sessions), offer: n(f.offer), cta: n(f.cta), form: n(f.form), conv: n(f.conv) } as Funnel,
    leadsByChannel: new Map(leadsByChannel.map((x) => [String(x.k), n(x.n)])),
    revenueByChannel: new Map(revenueByChannel.map((x) => [String(x.k), { v: n(x.v), n: n(x.n) }])),
    live: n(live[0]?.n),
    livePages: livePages.map((x) => ({ k: String(x.k), n: n(x.n) })),
  };
}
export type Report = Awaited<ReturnType<typeof report>>;
