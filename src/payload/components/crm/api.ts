/* Panel bileşenlerinin REST yardımcıları (aynı kaynak, oturum çereziyle) */
type Where = Record<string, Record<string, string | number | boolean>>;

export function listUrl(collection: string, where: Where, opts: { sort?: string; limit?: number; depth?: number } = {}) {
  const p = new URLSearchParams();
  for (const [field, ops] of Object.entries(where)) for (const [op, v] of Object.entries(ops)) p.set(`where[${field}][${op}]`, String(v));
  p.set("sort", opts.sort ?? "-createdAt");
  p.set("limit", String(opts.limit ?? 50));
  p.set("depth", String(opts.depth ?? 0));
  return `/api/${collection}?${p}`;
}

export async function getDocs<T>(url: string): Promise<T[]> {
  const r = await fetch(url, { credentials: "same-origin" });
  if (!r.ok) return [];
  const j = (await r.json()) as { docs?: T[] };
  return j.docs ?? [];
}

export async function send(method: "POST" | "PATCH", url: string, body: unknown) {
  const r = await fetch(url, { method, credentials: "same-origin", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  if (!r.ok) {
    const j = (await r.json().catch(() => null)) as { errors?: { message?: string }[] } | null;
    throw new Error(j?.errors?.[0]?.message ?? "Kaydedilemedi. Lütfen tekrar deneyin.");
  }
  return r.json();
}

const TZ = "Europe/Istanbul";
export const fmtStamp = (v: string) =>
  new Intl.DateTimeFormat("tr-TR", { timeZone: TZ, day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(v));
export const fmtDay = (v: string) => new Intl.DateTimeFormat("tr-TR", { timeZone: TZ, day: "numeric", month: "short", year: "numeric" }).format(new Date(v));
export const fmtMoney = (n: number | null | undefined, digits = 0) =>
  new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", minimumFractionDigits: digits, maximumFractionDigits: digits }).format(n ?? 0);
