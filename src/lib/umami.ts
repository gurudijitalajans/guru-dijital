import "server-only";

/**
 * Umami API istemcisi (yalnız sunucu; panel ekranları kullanır).
 *
 * Bağlantı ortam değişkenleriyle kurulur, gizli bilgiler veritabanına yazılmaz:
 *   UMAMI_API_URL   Umami Cloud: https://api.umami.is/v1
 *                   Kendi sunucunuz: https://analiz.alanadiniz.com/api
 *   UMAMI_API_KEY   Ayarlar > API anahtarları (Cloud'da tek yöntem)
 *   UMAMI_USERNAME / UMAMI_PASSWORD  API anahtarı yoksa kendi sunucunuzda giriş
 * Site kimliği (website ID) panelin Site Ayarları > Ziyaretçi analizi alanındadır.
 *
 * Hem Umami v3 (sayılar düz, "comparison" ayrı) hem v2 ({ value, prev })
 * yanıt biçimleri desteklenir.
 */

export type DayPoint = { day: string; pageviews: number; visitors: number };
export type MetricRow = { label: string; value: number };
export type Totals = { pageviews: number; visitors: number; visits: number; bounces: number; totaltime: number };
export type Overview = {
  totals: Totals;
  previous: Totals | null;
  series: DayPoint[];
  pages: MetricRow[];
  referrers: MetricRow[];
  devices: MetricRow[];
  countries: MetricRow[];
  events: MetricRow[];
};
export type UmamiResult = { ok: true; data: Overview } | { ok: false; reason: "not-configured" | "error"; message?: string };

const TZ = "Europe/Istanbul";

export function umamiConfigured() {
  const url = process.env.UMAMI_API_URL;
  const key = process.env.UMAMI_API_KEY;
  const user = process.env.UMAMI_USERNAME;
  const pass = process.env.UMAMI_PASSWORD;
  return Boolean(url && (key || (user && pass)));
}

/* ---- kimlik doğrulama ---- */
let token: { value: string; at: number } | null = null;

async function authHeader(force = false): Promise<string> {
  const key = process.env.UMAMI_API_KEY;
  if (key) return `Bearer ${key}`;
  if (!force && token && Date.now() - token.at < 6 * 60 * 60 * 1000) return `Bearer ${token.value}`;
  const res = await fetch(`${process.env.UMAMI_API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ username: process.env.UMAMI_USERNAME, password: process.env.UMAMI_PASSWORD }),
    cache: "no-store",
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`Umami girişi başarısız (${res.status})`);
  const json = (await res.json()) as { token?: string; requiresTwoFactor?: boolean };
  if (!json.token) throw new Error(json.requiresTwoFactor ? "Umami hesabında iki adımlı doğrulama açık; API anahtarı kullanın." : "Umami giriş yanıtında token yok");
  token = { value: json.token, at: Date.now() };
  return `Bearer ${token.value}`;
}

/* ---- kısa süreli önbellek: panel her açıldığında API'yi yormasın ---- */
const memo = new Map<string, { at: number; data: unknown }>();
const TTL = 2 * 60 * 1000;

async function get<T>(path: string, query: Record<string, string | number>): Promise<T> {
  const qs = new URLSearchParams(Object.entries(query).map(([k, v]) => [k, String(v)])).toString();
  const url = `${process.env.UMAMI_API_URL}${path}?${qs}`;
  const hit = memo.get(url);
  if (hit && Date.now() - hit.at < TTL) return hit.data as T;

  const call = async (auth: string) =>
    fetch(url, { headers: { Accept: "application/json", Authorization: auth }, cache: "no-store", signal: AbortSignal.timeout(8000) });
  let res = await call(await authHeader());
  if (res.status === 401 && !process.env.UMAMI_API_KEY) res = await call(await authHeader(true));
  if (!res.ok) throw new Error(`Umami ${path} yanıtı ${res.status}`);
  const data = (await res.json()) as T;
  memo.set(url, { at: Date.now(), data });
  return data;
}

/* ---- yanıt normalleştirme ---- */
type V2Num = { value?: number; prev?: number };
const num = (v: unknown): number => (typeof v === "number" ? v : typeof v === "object" && v ? Number((v as V2Num).value ?? 0) : 0);
const prevNum = (v: unknown): number | null => (typeof v === "object" && v && "prev" in v ? Number((v as V2Num).prev ?? 0) : null);
const FIELDS = ["pageviews", "visitors", "visits", "bounces", "totaltime"] as const;

function totalsFrom(raw: Record<string, unknown>): { totals: Totals; previous: Totals | null } {
  const totals = Object.fromEntries(FIELDS.map((f) => [f, num(raw[f])])) as Totals;
  const cmp = raw.comparison as Record<string, unknown> | undefined;
  if (cmp) return { totals, previous: Object.fromEntries(FIELDS.map((f) => [f, num(cmp[f])])) as Totals };
  /* v2: her alan { value, prev } */
  const prev = FIELDS.map((f) => prevNum(raw[f]));
  return { totals, previous: prev.every((p) => p !== null) ? (Object.fromEntries(FIELDS.map((f, i) => [f, prev[i] as number])) as Totals) : null };
}

const rows = (raw: unknown, limit = 8): MetricRow[] =>
  (Array.isArray(raw) ? raw : [])
    .map((r: { x?: string | null; y?: number }) => ({ label: r.x || "(doğrudan)", value: Number(r.y ?? 0) }))
    .slice(0, limit);

/** Belirtilen gün sayısı için özet: bugün dahil son N gün, Türkiye saatiyle */
export async function getOverview(websiteId: string, days: number): Promise<UmamiResult> {
  if (!umamiConfigured()) return { ok: false, reason: "not-configured" };
  if (!websiteId) return { ok: false, reason: "not-configured", message: "Site Ayarları'nda Umami site kimliği boş." };

  const endAt = Date.now();
  const startAt = endAt - days * 24 * 60 * 60 * 1000;
  const base = `/websites/${websiteId}`;
  const range = { startAt, endAt };

  try {
    const metric = async (type: string, fallback?: string) => {
      try {
        return await get<unknown>(`${base}/metrics`, { ...range, type, limit: 10 });
      } catch (err) {
        /* v2 "path" yerine "url" kullanır */
        if (fallback) return get<unknown>(`${base}/metrics`, { ...range, type: fallback, limit: 10 });
        throw err;
      }
    };
    const [stats, pv, pages, referrers, devices, countries, events] = await Promise.all([
      get<Record<string, unknown>>(`${base}/stats`, { ...range, compare: "prev" }),
      get<{ pageviews?: { x: string; y: number }[]; sessions?: { x: string; y: number }[] }>(`${base}/pageviews`, {
        ...range,
        unit: "day",
        timezone: TZ,
      }),
      metric("path", "url"),
      metric("referrer"),
      metric("device"),
      metric("country"),
      metric("event").catch(() => []),
    ]);

    /* Günlük seri: boş günler sıfırla doldurulur */
    const byDay = new Map<string, DayPoint>();
    const dayKey = (d: Date) => new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(d);
    for (let i = days - 1; i >= 0; i--) {
      const k = dayKey(new Date(endAt - i * 24 * 60 * 60 * 1000));
      byDay.set(k, { day: k, pageviews: 0, visitors: 0 });
    }
    for (const p of pv.pageviews ?? []) {
      const k = String(p.x).slice(0, 10);
      const d = byDay.get(k);
      if (d) d.pageviews = Number(p.y);
    }
    for (const s of pv.sessions ?? []) {
      const k = String(s.x).slice(0, 10);
      const d = byDay.get(k);
      if (d) d.visitors = Number(s.y);
    }

    return {
      ok: true,
      data: {
        ...totalsFrom(stats),
        series: [...byDay.values()],
        pages: rows(pages),
        referrers: rows(referrers),
        devices: rows(devices, 4),
        countries: rows(countries, 6),
        events: rows(events),
      },
    };
  } catch (err) {
    return { ok: false, reason: "error", message: err instanceof Error ? err.message : String(err) };
  }
}
