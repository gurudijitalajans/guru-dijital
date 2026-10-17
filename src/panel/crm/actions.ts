"use server";

import { getPanelContext } from "../context";
import { sessionLost } from "../errors";
import type { FeedTarget } from "./feed";

/**
 * Akış işlemleri: etkinlik planla (tarih ve saatle), tamamla (sonuçla),
 * ertele, not ekle, kendi notunu düzenle ve sil. Hepsi seçili işletmede.
 */
type Result = { ok: boolean; error?: string; id?: number };
const TYPES = ["gorev", "arama", "toplanti", "eposta"];
const fail = (e: unknown): Result => {
  const lost = sessionLost(e);
  if (lost) return lost as never;
  return { ok: false, error: e instanceof Error && e.message ? e.message : "İşlem yapılamadı." };
};
const idOf = (v: unknown) => (v && typeof v === "object" ? ((v as { id?: number }).id ?? null) : ((v as number | null | undefined) ?? null));

async function crm() {
  const ctx = await getPanelContext();
  if (!ctx.has("crm")) throw new Error("Yetki yok.");
  return ctx;
}

/** Hedef seçili işletmenin kaydı olmalı; fırsatın kişisi ve firması etkinliğe de yazılır */
async function links(ctx: Awaited<ReturnType<typeof crm>>, t: FeedTarget) {
  if (t.deal) {
    const d = (await ctx.findByID("deals", t.deal, 0)) as { id: number; contact?: unknown; company?: unknown } | null;
    if (!d) throw new Error("Fırsat bulunamadı.");
    return { deal: d.id, contact: idOf(d.contact), company: idOf(d.company) };
  }
  if (t.contact) {
    const c = (await ctx.findByID("contacts", t.contact, 0)) as { id: number; company?: unknown } | null;
    if (!c) throw new Error("Kişi bulunamadı.");
    return { contact: c.id, company: idOf(c.company) };
  }
  if (t.company && (await ctx.findByID("companies", t.company, 0))) return { company: t.company };
  throw new Error("Kayıt bulunamadı.");
}

export async function planActivity(t: FeedTarget, d: { type: string; title: string; dueAt: string; owner?: number | null }): Promise<Result> {
  try {
    const ctx = await crm();
    const title = d.title.trim().slice(0, 120);
    if (!title) return { ok: false, error: "Ne yapılacağını yazın." };
    if (!TYPES.includes(d.type)) return { ok: false, error: "Geçersiz tür." };
    const due = new Date(d.dueAt);
    if (Number.isNaN(due.getTime())) return { ok: false, error: "Tarih ve saat seçin." };
    if (d.owner && !(await ctx.team()).some((m) => m.id === d.owner)) return { ok: false, error: "Sorumlu bu işletmenin ekibinde değil." };
    const doc = (await ctx.create("activities", { ...(await links(ctx, t)), type: d.type, title, dueAt: due.toISOString(), done: false, owner: d.owner || ctx.user.id })) as { id: number };
    return { ok: true, id: doc.id };
  } catch (e) {
    return fail(e);
  }
}

export async function completeActivity(id: number, result: string): Promise<Result> {
  try {
    const ctx = await crm();
    return (await ctx.update("activities", id, { done: true, result: result.trim().slice(0, 2000) || null })) ? { ok: true } : { ok: false, error: "Görev bulunamadı." };
  } catch (e) {
    return fail(e);
  }
}

export async function reopenActivity(id: number): Promise<Result> {
  try {
    const ctx = await crm();
    return (await ctx.update("activities", id, { done: false })) ? { ok: true } : { ok: false, error: "Görev bulunamadı." };
  } catch (e) {
    return fail(e);
  }
}

export async function rescheduleActivity(id: number, dueAt: string): Promise<Result> {
  try {
    const ctx = await crm();
    const due = new Date(dueAt);
    if (Number.isNaN(due.getTime())) return { ok: false, error: "Geçersiz tarih." };
    return (await ctx.update("activities", id, { dueAt: due.toISOString() })) ? { ok: true } : { ok: false, error: "Görev bulunamadı." };
  } catch (e) {
    return fail(e);
  }
}

export async function addFeedNote(t: FeedTarget, text: string): Promise<Result> {
  try {
    const ctx = await crm();
    const body = text.trim().slice(0, 4000);
    if (!body) return { ok: false, error: "Not boş." };
    await ctx.create("activities", { ...(await links(ctx, t)), type: "not", title: body.split("\n")[0].slice(0, 120), body, done: true, owner: ctx.user.id });
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

/** Not düzenleme ve silme: notu yazan ya da işletme yöneticisi */
async function ownNote(ctx: Awaited<ReturnType<typeof crm>>, id: number) {
  const a = (await ctx.findByID("activities", id, 0)) as { id: number; type: string; owner?: unknown } | null;
  if (!a || a.type !== "not") throw new Error("Not bulunamadı.");
  if (idOf(a.owner) !== ctx.user.id && !ctx.isTenantAdmin) throw new Error("Yalnız kendi notunuzu değiştirebilirsiniz.");
  return a;
}

export async function editNote(id: number, text: string): Promise<Result> {
  try {
    const ctx = await crm();
    await ownNote(ctx, id);
    const body = text.trim().slice(0, 4000);
    if (!body) return { ok: false, error: "Not boş." };
    await ctx.update("activities", id, { body, title: body.split("\n")[0].slice(0, 120) });
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

export async function deleteNote(id: number): Promise<Result> {
  try {
    const ctx = await crm();
    await ownNote(ctx, id);
    return (await ctx.purge("activities", id)) ? { ok: true } : { ok: false, error: "Not bulunamadı." };
  } catch (e) {
    return fail(e);
  }
}
