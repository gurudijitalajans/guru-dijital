"use server";

import type { PayloadRequest } from "payload";
import { headers } from "next/headers";
import { cms } from "@/lib/cms";
import { getPanelContext } from "../context";

/**
 * Medya işlemleri: açıklama ve klasör, yeni klasör, silme. Medya Guru
 * Dijital'in sitesine ait (işletmeye bağlı değil); yalnız site modülü açık
 * kullanıcı. Yetki Payload'un kurallarıyla (silme yalnız yönetici) ve
 * kullanılan görseli silmeyen kancayla denetlenir. Yükleme tarayıcıdan
 * Payload'un yükleme ucuna gider (büyük dosya Vercel sınırına takılmasın).
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

export async function updateMedia(id: number, d: { alt: string; folder: number | null }): Promise<Result> {
  try {
    const { payload, opts } = await site();
    const alt = d.alt.trim().slice(0, 300);
    if (!alt) return { ok: false, error: "Alternatif metin boş olamaz." };
    await payload.update({ collection: "media", id, data: { alt, folder: d.folder || null }, ...opts });
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

export async function createFolder(name: string): Promise<Result> {
  try {
    const { payload, opts } = await site();
    const n = name.trim().slice(0, 80);
    if (!n) return { ok: false, error: "Klasör adı yazın." };
    const doc = await payload.create({ collection: "payload-folders", data: { name: n, folderType: ["media"] }, ...opts });
    return { ok: true, id: doc.id };
  } catch (e) {
    return fail(e);
  }
}

export async function deleteMedia(id: number): Promise<Result> {
  try {
    const { ctx, payload, opts } = await site();
    if (!ctx.isGuruAdmin) return { ok: false, error: "Görseli yalnız yönetici silebilir." };
    await payload.delete({ collection: "media", id, ...opts });
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

/**
 * Tarayıcıdan Blob'a giden orijinal dosya: Payload görseli webp'ye çevirip
 * yeni adla yazar, orijinali silmez. Yalnız az önce açılan kaydın klasöründe,
 * aynı adlı ama farklı uzantılı dosya silinir.
 */
export async function discardOriginal(id: number, pathname: string): Promise<Result> {
  try {
    const { payload, opts } = await site();
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (!token) return { ok: true };
    const doc = await payload.findByID({ collection: "media", id, depth: 0, ...opts });
    if (!doc.url || !doc.filename) return { ok: false, error: "Dosya doğrulanamadı." };
    /* Blob'da her yükleme kendi klasöründe: "<klasör>/<ad>.webp" */
    const own = new URL(doc.url).pathname.slice(1);
    const dir = own.slice(0, own.lastIndexOf("/"));
    const file = pathname.slice(dir.length + 1);
    const stem = (n: string) => n.replace(/\.[^.]+$/, "");
    const valid = dir && pathname.startsWith(`${dir}/`) && !file.includes("/") && file !== doc.filename && stem(file) === stem(doc.filename) && Date.now() - new Date(doc.createdAt).getTime() < 10 * 60_000;
    if (!valid) return { ok: false, error: "Dosya doğrulanamadı." };
    const { del } = await import("@vercel/blob");
    await del(new URL(`/${pathname}`, doc.url).toString(), { token });
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}
