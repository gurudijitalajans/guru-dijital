"use server";

import type { CollectionSlug, Field, GlobalSlug, PayloadRequest, TypedUser } from "payload";
import { headers } from "next/headers";
import { cms } from "@/lib/cms";
import { getPanelContext } from "../context";
import { ENTITIES } from "./entities";
import { hiddenPaths } from "./schema";
import type { FieldError } from "./types";

/**
 * Panel düzenleyicisinin sunucu işlemleri: kaydet (taslak ya da yayın),
 * koşullu alanlar, ilişki seçenekleri ve görsel küçük resimleri. Hepsi
 * kullanıcının yetkisiyle; Payload'un doğrulaması ve kancaları aynen çalışır.
 */
async function access(slug: string) {
  const def = ENTITIES[slug];
  if (!def) throw new Error("Bu içerik panelde düzenlenemiyor.");
  const ctx = await getPanelContext();
  if (!ctx.has(def.module) || (def.adminOnly && !ctx.isGuruAdmin)) throw new Error("Yetki yok.");
  const payload = await cms();
  const req = { headers: await headers(), user: ctx.user } as unknown as Partial<PayloadRequest>;
  return { def, ctx, payload, opts: { user: ctx.user, req, overrideAccess: false } as const };
}

function fieldsOf(payload: Awaited<ReturnType<typeof cms>>, slug: string, type: "global" | "collection"): Field[] {
  return type === "global" ? (payload.config.globals.find((g) => g.slug === slug)?.fields ?? []) : (payload.collections[slug as CollectionSlug]?.config.fields ?? []);
}

export type SaveResult = { ok: boolean; id?: number; error?: string; errors?: FieldError[]; updatedAt?: string };

export async function saveDoc(slug: string, id: number | null, data: Record<string, unknown>, mode: "save" | "draft" | "publish"): Promise<SaveResult> {
  try {
    const { def, payload, opts } = await access(slug);
    if (def.type === "global") {
      const doc = await payload.updateGlobal({ slug: slug as GlobalSlug, data: data as never, depth: 0, ...opts });
      return { ok: true, updatedAt: (doc as { updatedAt?: string }).updatedAt };
    }
    const collection = slug as CollectionSlug;
    const drafts = Boolean(payload.collections[collection]?.config.versions?.drafts);
    const body = drafts ? { ...data, _status: mode === "publish" ? "published" : "draft" } : data;
    const draft = drafts && mode !== "publish";
    const doc = id
      ? await payload.update({ collection, id, data: body as never, depth: 0, draft, ...opts })
      : await payload.create({ collection, data: body as never, depth: 0, draft, ...opts });
    return { ok: true, id: doc.id as number, updatedAt: (doc as { updatedAt?: string }).updatedAt };
  } catch (e) {
    const err = e as { message?: string; data?: { errors?: { path?: string; message?: string }[] } };
    const errors = (err.data?.errors ?? []).filter((x) => x.path).map((x) => ({ path: String(x.path), message: x.message ?? "Geçersiz değer." }));
    return { ok: false, error: errors.length ? "Kaydedilemedi: işaretli alanları düzeltin." : err.message || "Kaydedilemedi.", errors };
  }
}

export async function conditions(slug: string, data: Record<string, unknown>, operation: "create" | "update"): Promise<string[]> {
  const { def, ctx, payload } = await access(slug);
  return hiddenPaths(fieldsOf(payload, slug, def.type), data, data, ctx.user as unknown as TypedUser, operation);
}

export type RelOption = { value: number; label: string };

export async function relationOptions(slug: string, relationTo: string, q: string): Promise<RelOption[]> {
  const { payload, opts } = await access(slug);
  const conf = payload.collections[relationTo as CollectionSlug]?.config;
  if (!conf) return [];
  const title = conf.admin?.useAsTitle ?? "id";
  const t = q.trim().slice(0, 80);
  const r = await payload.find({ collection: relationTo as CollectionSlug, where: t && title !== "id" ? { [title]: { like: t } } : undefined, limit: 50, depth: 0, sort: title !== "id" ? title : undefined, ...opts });
  return r.docs.map((d) => ({ value: d.id as number, label: String((d as unknown as Record<string, unknown>)[title] ?? d.id) }));
}

export async function relationLabels(slug: string, relationTo: string, ids: number[]): Promise<RelOption[]> {
  if (!ids.length) return [];
  const { payload, opts } = await access(slug);
  const conf = payload.collections[relationTo as CollectionSlug]?.config;
  if (!conf) return [];
  const title = conf.admin?.useAsTitle ?? "id";
  const r = await payload.find({ collection: relationTo as CollectionSlug, where: { id: { in: ids.slice(0, 100) } }, limit: 100, depth: 0, ...opts });
  return r.docs.map((d) => ({ value: d.id as number, label: String((d as unknown as Record<string, unknown>)[title] ?? d.id) }));
}

export type Thumb = { id: number; alt: string; thumb: string; width: number; height: number };

export async function mediaThumbs(slug: string, ids: number[]): Promise<Thumb[]> {
  if (!ids.length) return [];
  const { payload, opts } = await access(slug);
  const r = await payload.find({ collection: "media", where: { id: { in: ids.slice(0, 200) } }, limit: 200, depth: 0, ...opts });
  return r.docs.map((m) => ({ id: m.id, alt: m.alt, thumb: m.sizes?.thumbnail?.url || m.thumbnailURL || m.url || "", width: m.width ?? 0, height: m.height ?? 0 }));
}

/** Metin yardımcısı: {sayı} yer tutucusunun gerçek değeri */
export async function countOf(slug: string, source: "references" | "services"): Promise<number> {
  const { payload, opts } = await access(slug);
  return (await payload.count({ collection: source, ...opts })).totalDocs;
}

export async function deleteDoc(slug: string, id: number): Promise<SaveResult> {
  try {
    const { def, ctx, payload, opts } = await access(slug);
    if (def.type !== "collection") return { ok: false, error: "Bu içerik silinemez." };
    if (!ctx.isGuruAdmin) return { ok: false, error: "Kaydı yalnız yönetici silebilir." };
    await payload.delete({ collection: slug as CollectionSlug, id, ...opts });
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error && e.message ? e.message : "Silinemedi." };
  }
}

/** Taslağı bırakıp kaydın yayındaki hâline dön (yalnız taslaklı koleksiyon) */
export async function unpublishDoc(slug: string, id: number): Promise<SaveResult> {
  try {
    const { def, payload, opts } = await access(slug);
    if (def.type !== "collection") return { ok: false, error: "Geçersiz işlem." };
    const collection = slug as CollectionSlug;
    const latest = (await payload.findByID({ collection, id, depth: 0, draft: true, ...opts })) as unknown as Record<string, unknown>;
    const rest = Object.fromEntries(Object.entries(latest).filter(([k]) => !["id", "createdAt", "updatedAt", "_status"].includes(k)));
    await payload.update({ collection, id, data: { ...rest, _status: "draft" } as never, draft: false, depth: 0, ...opts });
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error && e.message ? e.message : "Yayından kaldırılamadı." };
  }
}
