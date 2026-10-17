"use server";

import { getPanelContext } from "../context";
import { TASK_STAGES, PRIORITIES } from "@/payload/ops/stages";
import { sessionLost } from "../errors";

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
    const lost = sessionLost(e);
    if (lost) return lost as never;
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
    const lost = sessionLost(e);
    if (lost) return lost as never;
    return fail(e);
  }
}

/** Kontrol listesini baştan yazar: madde ekleme, silme ve yeniden adlandırma (en çok 30 madde) */
export async function setChecklist(id: number, items: { text: string; done: boolean }[]): Promise<Result> {
  try {
    const ctx = await ops();
    const list = items
      .map((c) => ({ text: String(c.text ?? "").trim().slice(0, 200), done: Boolean(c.done) }))
      .filter((c) => c.text)
      .slice(0, 30);
    return (await ctx.update("tasks", id, { checklist: list })) ? { ok: true } : { ok: false, error: "Görev bulunamadı." };
  } catch (e) {
    const lost = sessionLost(e);
    if (lost) return lost as never;
    return fail(e);
  }
}

/** Görevi kalıcı siler (yalnız işletme yöneticisi) */
export async function deleteTask(id: number): Promise<Result> {
  try {
    const ctx = await ops();
    if (!ctx.isTenantAdmin) return { ok: false, error: "Görevi yalnız işletme yöneticisi silebilir." };
    return (await ctx.remove("tasks", id)) ? { ok: true } : { ok: false, error: "Görev bulunamadı." };
  } catch (e) {
    const lost = sessionLost(e);
    if (lost) return lost as never;
    return fail(e);
  }
}

/** Projeyi siler; withTasks ise görevleri de silinir, değilse görevler projesiz kalır */
export async function deleteProject(id: number, withTasks: boolean): Promise<Result> {
  try {
    const ctx = await ops();
    if (!ctx.isTenantAdmin) return { ok: false, error: "Projeyi yalnız işletme yöneticisi silebilir." };
    if (!(await ctx.findByID("projects", id, 0))) return { ok: false, error: "Proje bulunamadı." };
    const tasks = await ctx.find("tasks", { where: { project: { equals: id } }, limit: 1000, select: { id: true } });
    for (const t of tasks.docs) {
      if (withTasks) await ctx.remove("tasks", t.id);
      else await ctx.update("tasks", t.id, { project: null });
    }
    return (await ctx.remove("projects", id)) ? { ok: true } : { ok: false, error: "Proje bulunamadı." };
  } catch (e) {
    const lost = sessionLost(e);
    if (lost) return lost as never;
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
    const lost = sessionLost(e);
    if (lost) return lost as never;
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
    const lost = sessionLost(e);
    if (lost) return lost as never;
    return fail(e);
  }
}

export type ProjectInput = { title: string; company?: number | null; contact?: number | null; deal?: number | null; template?: number | null; startDate?: string | null; dueDate?: string | null; owner?: number | null; description?: string | null; status?: string };
const PROJECT_STATUS = ["aktif", "beklemede", "tamamlandi", "iptal"];

/** Yeni proje: şablon seçilirse adımlar görev olur (koleksiyon kancası); fırsattan açılırsa başlık, kişi ve firma fırsattan */
export async function createProject(d: ProjectInput): Promise<Result> {
  try {
    const ctx = await ops();
    if (!d.title?.trim() && !d.deal) return { ok: false, error: "Proje adını yazın." };
    if (!(await validAssignee(ctx, d.owner))) return { ok: false, error: "Sorumlu bu işletmenin ekibinde değil." };
    for (const [col, v] of [["deals", d.deal], ["companies", d.company], ["contacts", d.contact], ["templates", d.template]] as const) {
      if (v && !(await ctx.findByID(col, v, 0))) return { ok: false, error: "Bağlı kayıt bulunamadı." };
    }
    const doc = (await ctx.create("projects", {
      title: d.title?.trim().slice(0, 200) || "",
      company: d.company || undefined,
      contact: d.contact || undefined,
      deal: d.deal || undefined,
      template: d.template || undefined,
      startDate: day(d.startDate) ?? undefined,
      dueDate: day(d.dueDate) ?? undefined,
      owner: d.owner || ctx.user.id,
      description: d.description?.trim() || undefined,
      status: "aktif",
    })) as { id: number };
    return { ok: true, id: doc.id };
  } catch (e) {
    const lost = sessionLost(e);
    if (lost) return lost as never;
    return fail(e);
  }
}

export async function updateProject(id: number, d: Partial<ProjectInput>): Promise<Result> {
  try {
    const ctx = await ops();
    if (d.owner !== undefined && !(await validAssignee(ctx, d.owner))) return { ok: false, error: "Sorumlu bu işletmenin ekibinde değil." };
    const data: Record<string, unknown> = {};
    if (d.title !== undefined) {
      if (!d.title.trim()) return { ok: false, error: "Proje adı boş olamaz." };
      data.title = d.title.trim().slice(0, 200);
    }
    if (d.dueDate !== undefined) data.dueDate = day(d.dueDate);
    if (d.startDate !== undefined) data.startDate = day(d.startDate);
    if (d.owner !== undefined) data.owner = d.owner || null;
    if (d.description !== undefined) data.description = d.description?.trim() || null;
    if (d.status !== undefined) {
      if (!PROJECT_STATUS.includes(d.status)) return { ok: false, error: "Geçersiz durum." };
      data.status = d.status;
    }
    return (await ctx.update("projects", id, data)) ? { ok: true, id } : { ok: false, error: "Proje bulunamadı." };
  } catch (e) {
    const lost = sessionLost(e);
    if (lost) return lost as never;
    return fail(e);
  }
}
