"use server";

import { getPanelContext } from "../context";
import { TASK_STAGES, PRIORITIES } from "@/payload/ops/stages";

/**
 * Görev işlemleri: aşama ve sıra (sürükle bırak), kontrol listesi, düzenleme
 * ve yeni görev. Kurallar koleksiyonda (Tamam'a yalnız Kontrol'den ve liste
 * bitince; sorumluya bildirim); buradan gelen hata kullanıcıya aynen gösterilir.
 */
type Result = { ok: boolean; error?: string; id?: number };
const STAGES = TASK_STAGES.map((s) => s.value as string);
const PRIOS = PRIORITIES.map((p) => p.value as string);
const fail = (e: unknown): Result => ({ ok: false, error: e instanceof Error && e.message ? e.message : "İşlem yapılamadı." });
const day = (v?: string | null) => (v && /^\d{4}-\d{2}-\d{2}/.test(v) ? `${v.slice(0, 10)}T12:00:00.000Z` : null);

async function ops() {
  const ctx = await getPanelContext();
  if (!ctx.has("ops")) throw new Error("Yetki yok.");
  return ctx;
}

/** Sorumlu seçili işletmenin ekibinden olmalı */
async function validAssignee(ctx: Awaited<ReturnType<typeof ops>>, id: number | null | undefined) {
  if (!id) return true;
  return (await ctx.team()).some((m) => m.id === Number(id));
}

export async function moveTask(id: number, stage: string, order: number): Promise<Result> {
  try {
    const ctx = await ops();
    if (!STAGES.includes(stage)) return { ok: false, error: "Geçersiz aşama." };
    return (await ctx.update("tasks", id, { stage, order: Number.isFinite(order) ? order : undefined })) ? { ok: true } : { ok: false, error: "Görev bulunamadı." };
  } catch (e) {
    return fail(e);
  }
}

export async function toggleCheck(id: number, index: number, done: boolean): Promise<Result> {
  try {
    const ctx = await ops();
    const t = (await ctx.findByID("tasks", id, 0)) as { checklist?: { id?: string; text: string; done?: boolean | null }[] | null } | null;
    if (!t) return { ok: false, error: "Görev bulunamadı." };
    const list = (t.checklist ?? []).map((c, i) => ({ ...c, done: i === index ? done : Boolean(c.done) }));
    await ctx.update("tasks", id, { checklist: list });
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

export type TaskInput = { title: string; project?: number | null; assignee?: number | null; startDate?: string | null; dueDate?: string | null; hours?: number | null; priority?: string; description?: string | null; checklist?: string[] };

export async function updateTask(id: number, d: TaskInput): Promise<Result> {
  try {
    const ctx = await ops();
    if (!d.title?.trim()) return { ok: false, error: "Görev adı boş olamaz." };
    if (!(await validAssignee(ctx, d.assignee))) return { ok: false, error: "Sorumlu bu işletmenin ekibinde değil." };
    if (d.project && !(await ctx.findByID("projects", d.project, 0))) return { ok: false, error: "Proje bulunamadı." };
    const r = await ctx.update("tasks", id, {
      title: d.title.trim().slice(0, 200),
      project: d.project || null,
      assignee: d.assignee || null,
      startDate: day(d.startDate),
      dueDate: day(d.dueDate),
      hours: d.hours === null || d.hours === undefined || Number.isNaN(Number(d.hours)) ? null : Math.max(0, Number(d.hours)),
      priority: d.priority && PRIOS.includes(d.priority) ? d.priority : "normal",
      description: d.description?.trim().slice(0, 4000) || null,
    });
    return r ? { ok: true } : { ok: false, error: "Görev bulunamadı." };
  } catch (e) {
    return fail(e);
  }
}

export async function createTask(d: TaskInput): Promise<Result> {
  try {
    const ctx = await ops();
    if (!d.title?.trim()) return { ok: false, error: "Görev adı yazın." };
    if (!(await validAssignee(ctx, d.assignee))) return { ok: false, error: "Sorumlu bu işletmenin ekibinde değil." };
    if (d.project && !(await ctx.findByID("projects", d.project, 0))) return { ok: false, error: "Proje bulunamadı." };
    const doc = (await ctx.create("tasks", {
      title: d.title.trim().slice(0, 200),
      project: d.project || undefined,
      assignee: d.assignee || undefined,
      startDate: day(d.startDate) ?? undefined,
      dueDate: day(d.dueDate) ?? undefined,
      hours: d.hours ? Math.max(0, Number(d.hours)) : undefined,
      priority: d.priority && PRIOS.includes(d.priority) ? d.priority : "normal",
      description: d.description?.trim() || undefined,
      checklist: (d.checklist ?? []).map((text) => text.trim()).filter(Boolean).slice(0, 30).map((text) => ({ text, done: false })),
      stage: "yapilacak",
    })) as { id: number };
    return { ok: true, id: doc.id };
  } catch (e) {
    return fail(e);
  }
}
