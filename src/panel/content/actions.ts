"use server";

import type { PayloadRequest } from "payload";
import { headers } from "next/headers";
import { cms } from "@/lib/cms";
import { getPanelContext } from "../context";
import { PUBLISHABLE, SIMPLE, type PublishKey, type SimpleKey } from "./kinds";

/**
 * Site içeriği işlemleri: basit kayıtların (ekip, referans, yorum, vaka)
 * kaydı ve silinmesi, hizmet/ürün/yazının yayına alınması. Yalnız site
 * modülü açık kullanıcı; Payload'un yetki kuralları ve sayfa yenileme
 * kancaları aynen çalışır.
 */
type Result = { ok: boolean; error?: string; id?: number };
const fail = (e: unknown): Result => ({ ok: false, error: e instanceof Error && e.message ? e.message : "İşlem yapılamadı." });

async function site() {
  const ctx = await getPanelContext();
  if (!ctx.has("site")) throw new Error("Yetki yok.");
  const payload = await cms();
  const req = { headers: await headers(), user: ctx.user } as unknown as Partial<PayloadRequest>;
  return { ctx, payload, opts: { user: ctx.user, req, overrideAccess: false } as const };
}

/** Yalnız türün alanları, türüne göre temizlenmiş */
function clean(kind: SimpleKey, raw: Record<string, unknown>) {
  const out: Record<string, unknown> = {};
  for (const f of SIMPLE[kind].fields) {
    const v = raw[f.name];
    if (f.type === "text" || f.type === "textarea") out[f.name] = typeof v === "string" && v.trim() ? v.trim().slice(0, f.max ?? 300) : null;
    else if (f.type === "number") out[f.name] = v === "" || v === null || v === undefined || !Number.isFinite(Number(v)) ? null : Number(v);
    else if (f.type === "checkbox") out[f.name] = Boolean(v);
    else if (f.type === "media") out[f.name] = Number(v) || null;
    else if (f.type === "stats")
      out[f.name] = (Array.isArray(v) ? v : []).slice(0, 8).map((s) => {
        const r = s as Record<string, unknown>;
        return {
          label: String(r.label ?? "").trim().slice(0, 120),
          value: Number(r.value) || 0,
          prefix: String(r.prefix ?? "").trim().slice(0, 12) || null,
          suffix: String(r.suffix ?? "").trim().slice(0, 12) || null,
          featured: Boolean(r.featured),
        };
      });
  }
  for (const f of SIMPLE[kind].fields) if ("required" in f && f.required && !out[f.name]) throw new Error(`${f.label} boş olamaz.`);
  return out;
}

export async function saveItem(kind: SimpleKey, id: number | null, raw: Record<string, unknown>): Promise<Result> {
  try {
    if (!(kind in SIMPLE)) return { ok: false, error: "Geçersiz tür." };
    const { payload, opts } = await site();
    const data = clean(kind, raw);
    const collection = SIMPLE[kind].collection;
    const doc = id ? await payload.update({ collection, id, data: data as never, ...opts }) : await payload.create({ collection, data: data as never, ...opts });
    return { ok: true, id: doc.id };
  } catch (e) {
    return fail(e);
  }
}

export async function deleteItem(kind: SimpleKey, id: number): Promise<Result> {
  try {
    if (!(kind in SIMPLE)) return { ok: false, error: "Geçersiz tür." };
    const { ctx, payload, opts } = await site();
    if (!ctx.isGuruAdmin) return { ok: false, error: "Kaydı yalnız yönetici silebilir." };
    await payload.delete({ collection: SIMPLE[kind].collection, id, ...opts });
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

/**
 * Yayına al ya da yayından kaldır. Kaydın en son taslağı esas alınır:
 * içerik ekranında kaydedilmiş ama yayınlanmamış değişiklik kaybolmaz.
 */
export async function setPublished(kind: PublishKey, id: number, publish: boolean): Promise<Result> {
  try {
    if (!(kind in PUBLISHABLE)) return { ok: false, error: "Geçersiz tür." };
    const { payload, opts } = await site();
    const collection = PUBLISHABLE[kind].collection;
    const latest = (await payload.findByID({ collection, id, depth: 0, draft: true, ...opts })) as unknown as Record<string, unknown>;
    const rest = Object.fromEntries(Object.entries(latest).filter(([key]) => !["id", "createdAt", "updatedAt", "_status"].includes(key)));
    await payload.update({ collection, id, data: { ...rest, _status: publish ? "published" : "draft" } as never, draft: false, ...opts });
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

export type MediaPick = { id: number; alt: string; thumb: string };

/** Görsel seçici: son yüklenenler ya da arama */
export async function listMedia(q: string): Promise<MediaPick[]> {
  const { payload, opts } = await site();
  const t = q.trim().slice(0, 80);
  const r = await payload.find({ collection: "media", where: t ? { or: [{ alt: { like: t } }, { filename: { like: t } }] } : undefined, sort: "-createdAt", limit: 60, depth: 0, ...opts });
  return r.docs.map((m) => ({ id: m.id, alt: m.alt, thumb: m.sizes?.thumbnail?.url || m.thumbnailURL || m.url || "" }));
}
