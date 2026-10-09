import type { Payload, PayloadRequest } from "payload";
import type { Usage } from "@/payload-types";

/**
 * İşletme ve ay başına sayaçlar (İstanbul ayı). Okuyup yazar; aynı anda gelen
 * iki mesajda bir sayım kaçabilir, faturaya değil kotaya ve rapora yöneliktir.
 */
type Counter = "conversations" | "visitorMessages" | "chatLeads" | "formLeads" | "aiCalls" | "inputTokens" | "outputTokens" | "cacheReadTokens";

export const monthKey = (d = new Date()) => new Date(d.getTime() + 3 * 3600000).toISOString().slice(0, 7);

async function rowOf(payload: Payload, tenant: number | string, req?: PayloadRequest): Promise<Usage> {
  const month = monthKey();
  const found = await payload.find({ collection: "usage", where: { and: [{ tenant: { equals: tenant } }, { month: { equals: month } }] }, limit: 1, depth: 0, req, overrideAccess: true });
  if (found.docs[0]) return found.docs[0];
  return payload.create({ collection: "usage", data: { tenant: Number(tenant), month }, req, overrideAccess: true });
}

export async function addUsage(payload: Payload, tenant: number | string, add: Partial<Record<Counter, number>>, req?: PayloadRequest) {
  try {
    const row = await rowOf(payload, tenant, req);
    const data: Partial<Record<Counter, number>> = {};
    for (const [k, v] of Object.entries(add) as [Counter, number][]) data[k] = (row[k] ?? 0) + (v ?? 0);
    await payload.update({ collection: "usage", id: row.id, data, req, overrideAccess: true });
  } catch (err) {
    payload.logger.error({ err }, "Kullanım sayacı yazılamadı");
  }
}

export async function usageThisMonth(payload: Payload, tenant: number | string): Promise<Usage | null> {
  const r = await payload.find({ collection: "usage", where: { and: [{ tenant: { equals: tenant } }, { month: { equals: monthKey() } }] }, limit: 1, depth: 0, overrideAccess: true });
  return r.docs[0] ?? null;
}
