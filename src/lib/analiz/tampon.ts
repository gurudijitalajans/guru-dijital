import "server-only";
import { createHash } from "crypto";

/**
 * Olay tamponu: Upstash Redis (REST, ek paket yok). Her sayfa görüntülemesini
 * doğrudan Neon'a yazmak ücretsiz işlem kotasını (100 CU-saat) aşıp CMS'i,
 * formları ve paneli durdurabileceği için olaylar önce burada birikir; aktarım
 * (günlük cron ya da Analiz sayfası açılınca) topluca veritabanına yazar.
 *
 * Ortam değişkenleri: Vercel Marketplace'teki Upstash entegrasyonu
 * KV_REST_API_URL + KV_REST_API_TOKEN ya da UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN ekler.
 */
const URL_ = () => process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || "";
const TOKEN = () => process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || "";
export const redisConfigured = () => Boolean(URL_() && TOKEN());

export const QUEUE = "analiz:q";

/** Komutları tek istekte çalıştırır; her komutun sonucunu döndürür */
export async function redis(cmds: (string | number)[][]): Promise<unknown[]> {
  const res = await fetch(`${URL_()}/pipeline`, {
    method: "POST",
    headers: { Authorization: `Bearer ${TOKEN()}`, "Content-Type": "application/json" },
    body: JSON.stringify(cmds),
    cache: "no-store",
    signal: AbortSignal.timeout(5000),
  });
  if (!res.ok) throw new Error(`Redis ${res.status}`);
  const out = (await res.json()) as { result?: unknown; error?: string }[];
  return out.map((r) => {
    if (r.error) throw new Error(`Redis: ${r.error}`);
    return r.result;
  });
}

/* Günlük tuz: ziyaretçi özeti her gün değişir, günler arası kişi izlenemez. 48 saat sonra silinir. */
let saltCache: { day: string; salt: string } | null = null;
export async function dailySalt(day: string): Promise<string> {
  if (saltCache?.day === day) return saltCache.salt;
  let salt: string;
  if (redisConfigured()) {
    const fresh = createHash("sha256").update(`${Math.random()}${Date.now()}`).digest("hex").slice(0, 32);
    const [, got] = await redis([
      ["SET", `analiz:tuz:${day}`, fresh, "NX", "EX", 172800],
      ["GET", `analiz:tuz:${day}`],
    ]);
    salt = String(got ?? fresh);
  } else {
    /* Yerel geliştirme: Redis yokken gizli anahtardan türetilir */
    salt = createHash("sha256").update(`tuz:${day}:${process.env.PAYLOAD_SECRET ?? "yerel"}`).digest("hex").slice(0, 32);
  }
  saltCache = { day, salt };
  return salt;
}

/** Günlük ziyaretçi özeti: o günün tuzu + IP + tarayıcı bilgisi (geri döndürülemez, ertesi gün değişir) */
export async function visitorId(headers: Headers): Promise<string> {
  const ua = headers.get("user-agent") ?? "";
  const ip = (headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || headers.get("x-real-ip") || "0";
  const day = new Date(Date.now() + 3 * 3600000).toISOString().slice(0, 10);
  return createHash("sha256").update(`${await dailySalt(day)}|${ip}|${ua}`).digest("hex").slice(0, 16);
}
