import "server-only";
import type { Payload } from "payload";
import { QUEUE, redis, redisConfigured } from "./tampon";

/**
 * Ölçüm verisinin kalıcı deposu: Postgres'te `ga_events` tablosu (geçiş
 * 20261016_140000_analiz). Yerel SQLite'ta tablo yoktur; ekran bunu söyler.
 */
export type Row = {
  ts: string;
  sid: string;
  vid: string;
  kind: "pv" | "ev";
  name?: string | null;
  path: string;
  title?: string | null;
  entry?: boolean;
  channel?: string | null;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  ref?: string | null;
  country?: string | null;
  region?: string | null;
  city?: string | null;
  device?: string | null;
  browser?: string | null;
  os?: string | null;
  props?: Record<string, string | number> | null;
};

type Pool = { query: (text: string, values?: unknown[]) => Promise<{ rows: Record<string, unknown>[] }> };
export function poolOf(payload: Payload): Pool | null {
  const p = (payload.db as unknown as { pool?: Pool; name?: string }).pool;
  return p && typeof p.query === "function" ? p : null;
}

const COLS = ["ts", "sid", "vid", "kind", "name", "path", "title", "entry", "channel", "utm_source", "utm_medium", "utm_campaign", "ref", "country", "region", "city", "device", "browser", "os", "props"] as const;

export async function insertRows(pool: Pool, rows: Row[]) {
  for (let i = 0; i < rows.length; i += 500) {
    const part = rows.slice(i, i + 500);
    const values: unknown[] = [];
    const tuples = part.map((r) => {
      const base = values.length;
      for (const c of COLS) values.push(c === "props" ? (r.props ? JSON.stringify(r.props) : null) : c === "entry" ? Boolean(r.entry) : ((r as Record<string, unknown>)[c] ?? null));
      return `(${COLS.map((_, j) => `$${base + j + 1}`).join(",")})`;
    });
    await pool.query(`INSERT INTO ga_events (${COLS.join(",")}) VALUES ${tuples.join(",")}`, values);
  }
}

/**
 * Tampondaki olayları veritabanına aktarır. Aynı anda iki aktarım çalışmasın diye
 * kısa bir kilit alınır. 400 günden eski ham olaylar silinir (geçen yılla kıyas için 13 ay).
 */
export async function aktar(payload: Payload): Promise<{ moved: number; skipped?: string }> {
  const pool = poolOf(payload);
  if (!pool) return { moved: 0, skipped: "Postgres yok" };
  if (!redisConfigured()) return { moved: 0, skipped: "Tampon yok" };
  const [lock] = await redis([["SET", "analiz:kilit", "1", "NX", "EX", 60]]);
  if (lock !== "OK") return { moved: 0, skipped: "Başka bir aktarım sürüyor" };
  let moved = 0;
  try {
    for (let round = 0; round < 50; round++) {
      const [list] = (await redis([["LRANGE", QUEUE, 0, 999]])) as [string[]];
      if (!list?.length) break;
      const rows = list.map((s) => {
        try {
          return JSON.parse(s) as Row;
        } catch {
          return null;
        }
      }).filter((r): r is Row => Boolean(r?.ts && r.sid && r.path));
      if (rows.length) await insertRows(pool, rows);
      await redis([["LTRIM", QUEUE, list.length, -1]]);
      moved += rows.length;
      if (list.length < 1000) break;
    }
    if (moved) await pool.query(`DELETE FROM ga_events WHERE ts < now() - interval '400 days'`);
  } finally {
    await redis([["DEL", "analiz:kilit"]]).catch(() => null);
  }
  return { moved };
}
