"use server";

import { headers } from "next/headers";
import type { PayloadRequest } from "payload";
import { cms } from "@/lib/cms";
import { getPanelContext } from "../context";
import { sessionLost } from "../errors";

export type Bildirim = { id: number; title: string; body: string; href: string; read: boolean; at: string };

async function me() {
  const ctx = await getPanelContext();
  const payload = await cms();
  const req = { headers: await headers(), user: ctx.user } as unknown as Partial<PayloadRequest>;
  return { ctx, payload, opts: { user: ctx.user, req, overrideAccess: false } as const };
}

/** Kişinin son bildirimleri ve okunmamış sayısı (yalnız kendi bildirimleri) */
export async function listNotifications(): Promise<{ unread: number; items: Bildirim[] }> {
  try {
    const { payload, opts } = await me();
    const [list, unread] = await Promise.all([
      payload.find({ collection: "notifications", sort: "-createdAt", limit: 20, depth: 0, ...opts }),
      payload.count({ collection: "notifications", where: { read: { equals: false } }, ...opts }),
    ]);
    return {
      unread: unread.totalDocs,
      items: list.docs.map((n) => ({ id: n.id, title: n.title, body: n.body ?? "", href: n.href ?? "/panel", read: Boolean(n.read), at: n.createdAt })),
    };
  } catch (e) {
    if (sessionLost(e)) return { unread: 0, items: [] };
    return { unread: 0, items: [] };
  }
}

/** Okundu işaretle: id verilirse o bildirim, verilmezse hepsi */
export async function markRead(id?: number): Promise<{ ok: boolean }> {
  try {
    const { payload, opts } = await me();
    await payload.update({ collection: "notifications", where: id ? { id: { equals: id } } : { read: { equals: false } }, data: { read: true }, ...opts });
    return { ok: true };
  } catch {
    return { ok: false };
  }
}
