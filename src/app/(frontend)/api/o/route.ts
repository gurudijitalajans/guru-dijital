import { cms } from "@/lib/cms";
import { kanalOf, type Atif, ATIF_KEYS } from "@/lib/analiz/kanal";
import { BOT_RE, cihazOf } from "@/lib/analiz/cihaz";
import { QUEUE, redis, redisConfigured, visitorId } from "@/lib/analiz/tampon";
import { insertRows, poolOf, type Row } from "@/lib/analiz/depo";

/**
 * Sitenin çerezsiz sayacı (POST /api/o, navigator.sendBeacon). Kişisel veri
 * saklanmaz: IP ve tarayıcı bilgisi yalnız o günün tuzuyla özetlenip (vid) atılır,
 * konum Vercel'in ülke/şehir başlıklarından gelir. Olaylar Redis tamponuna yazılır.
 * Panele girişli ekip (payload-token çerezi) ve botlar sayılmaz.
 */
export const dynamic = "force-dynamic";

const ok = () => new Response(null, { status: 204, headers: { "Cache-Control": "no-store" } });
const S = (v: unknown, max: number) => (typeof v === "string" && v ? v.slice(0, max) : null);
const ALLOWED = /^(localhost|127\.0\.0\.1|guru-dijital-pied\.vercel\.app|(www\.)?gurudijital\.com)$/;

type In = { k?: string; n?: string; p?: string; t?: string; d?: Record<string, unknown>; ts?: number };

export async function POST(req: Request) {
  try {
    const ua = req.headers.get("user-agent") ?? "";
    if (!ua || BOT_RE.test(ua)) return ok();
    if (/(^|;\s*)payload-token=/.test(req.headers.get("cookie") ?? "")) return ok();
    const origin = req.headers.get("origin") ?? req.headers.get("referer") ?? "";
    const host = (() => {
      try {
        return new URL(origin).hostname;
      } catch {
        return "";
      }
    })();
    if (!ALLOWED.test(host)) return ok();
    const raw = await req.text();
    if (raw.length > 8000) return ok();
    const body = JSON.parse(raw) as { s?: string; a?: Atif; e?: In[] };
    const sid = S(body.s, 24);
    if (!sid || !/^[a-z0-9]+$/.test(sid) || !Array.isArray(body.e)) return ok();

    const now = Date.now();
    const vid = await visitorId(req.headers);
    const { device, browser, os } = cihazOf(ua);
    const geo = {
      country: S(req.headers.get("x-vercel-ip-country"), 2),
      region: S(req.headers.get("x-vercel-ip-country-region"), 10),
      city: (() => {
        const c = req.headers.get("x-vercel-ip-city");
        try {
          return c ? decodeURIComponent(c).slice(0, 80) : null;
        } catch {
          return null;
        }
      })(),
    };
    /* Giriş bilgisi yalnız oturumun ilk gönderiminde gelir; ilk sayfa görüntülemesi "giriş" satırıdır */
    const atif: Atif | null = body.a && typeof body.a === "object" ? Object.fromEntries(ATIF_KEYS.map((k) => [k, S((body.a as Record<string, unknown>)[k], 150)]).filter(([, v]) => v)) : null;
    let entryDone = !atif;
    const rows: Row[] = [];
    for (const e of body.e.slice(0, 25)) {
      const kind = e.k === "ev" ? "ev" : "pv";
      const path = S(e.p, 300);
      if (!path || !path.startsWith("/")) continue;
      const name = kind === "ev" ? S(e.n, 64) : null;
      if (kind === "ev" && (!name || !/^[a-z0-9-]+$/.test(name))) continue;
      const props = e.d && typeof e.d === "object" ? Object.fromEntries(Object.entries(e.d).slice(0, 8).map(([k, v]) => [k.slice(0, 32), typeof v === "number" ? v : String(v).slice(0, 120)])) : null;
      const ts = typeof e.ts === "number" && Math.abs(now - e.ts) < 6 * 3600000 ? new Date(e.ts).toISOString() : new Date(now).toISOString();
      const entry = !entryDone && kind === "pv";
      if (entry) entryDone = true;
      rows.push({
        ts, sid, vid, kind, name, path, title: S(e.t, 160), entry,
        ...(entry && atif ? { channel: kanalOf(atif), utm_source: atif.utm_source ?? null, utm_medium: atif.utm_medium ?? null, utm_campaign: atif.utm_campaign ?? null, ref: atif.ref ?? null } : {}),
        ...geo, device, browser, os,
        /* Giriş satırında reklam tıklama kimlikleri de tutulur: talep geldiğinde kaynağı eşleştirmek için */
        props: entry && atif ? { ...(props ?? {}), ...Object.fromEntries(["gclid", "gbraid", "wbraid", "fbclid", "msclkid", "utm_term", "utm_content"].map((k) => [k, (atif as Record<string, string | undefined>)[k]]).filter(([, v]) => v)) } : props,
      });
    }
    if (!rows.length) return ok();
    if (redisConfigured()) {
      await redis([["RPUSH", QUEUE, ...rows.map((r) => JSON.stringify(r))]]);
    } else if (process.env.NODE_ENV !== "production") {
      /* Yerel geliştirme: tampon yoksa doğrudan yazılır (yalnız Postgres) */
      const pool = poolOf(await cms());
      if (pool) await insertRows(pool, rows);
    }
    return ok();
  } catch (err) {
    console.error("[analiz] /api/o", err);
    return ok();
  }
}
