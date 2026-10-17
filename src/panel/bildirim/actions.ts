"use server";

import { headers } from "next/headers";
import type { PayloadRequest, Where } from "payload";
import { cms } from "@/lib/cms";
import { getPanelContext } from "../context";
import { sessionLost } from "../errors";

export type Bildirim = { id: number; title: string; body: string; href: string; read: boolean; at: string };

async function me() {
  const ctx = await getPanelContext();
  const payload = await cms();
  const req = { headers: await headers(), user: ctx.user } as unknown as Partial<PayloadRequest>;
  /* Seçili işletmenin bildirimleri ve işletmesiz (genel) olanlar; başka işletmenin kaydı karışmaz */
  const scope: Where = { or: [{ tenant: { equals: ctx.tenant.id } }, { tenant: { exists: false } }] };
  return { ctx, payload, scope, opts: { user: ctx.user, req, overrideAccess: false } as const };
}

/** Kişinin son bildirimleri ve okunmamış sayısı (yalnız kendi bildirimleri) */
export async function listNotifications(): Promise<{ unread: number; items: Bildirim[] }> {
  try {
    const { payload, scope, opts } = await me();
    const [list, unread] = await Promise.all([
      payload.find({ collection: "notifications", where: scope, sort: "-createdAt", limit: 30, depth: 0, ...opts }),
      payload.count({ collection: "notifications", where: { and: [scope, { read: { equals: false } }] }, ...opts }),
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
    const { payload, scope, opts } = await me();
    await payload.update({ collection: "notifications", where: id ? { id: { equals: id } } : { and: [scope, { read: { equals: false } }] }, data: { read: true }, ...opts });
    return { ok: true };
  } catch {
    return { ok: false };
  }
}

/** Bildirimi siler: id verilirse o bildirim, verilmezse okunmuş olanların hepsi (yalnız kendi bildirimleri) */
export async function removeNotifications(id?: number): Promise<{ ok: boolean }> {
  try {
    const { payload, scope, opts } = await me();
    await payload.delete({ collection: "notifications", where: id ? { id: { equals: id } } : { and: [scope, { read: { equals: true } }] }, ...opts });
    return { ok: true };
  } catch {
    return { ok: false };
  }
}
