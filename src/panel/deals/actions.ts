"use server";

import { getPanelContext } from "../context";
import { DEAL_STAGES } from "@/payload/crm/stages";
import { sessionLost } from "../errors";

/**
 * Fırsat işlemleri: aşama ve sıra (sürükle bırak), düzenleme, yeni fırsat,
 * not ve arama planı. Hepsi seçili işletmede ve kullanıcının yetkisiyle;
 * aşama değişikliğinin kayıt notu ve talep durumu kancalarla yazılır.
 */
type Result = { ok: boolean; error?: string; id?: number };
const STAGES = DEAL_STAGES.map((s) => s.value as string);
const fail = (e: unknown): Result => ({ ok: false, error: e instanceof Error && e.message ? e.message : "İşlem yapılamadı." });

async function crm() {
  const ctx = await getPanelContext();
  if (!ctx.has("crm")) throw new Error("Yetki yok.");
  return ctx;
}

export async function moveDeal(id: number, stage: string, order: number, lostReason?: string): Promise<Result> {
  try {
    const ctx = await crm();
    if (!STAGES.includes(stage)) return { ok: false, error: "Geçersiz aşama." };
    const data: Record<string, unknown> = { stage, order: Number.isFinite(order) ? order : undefined };
    if (stage === "kaybedildi" && lostReason?.trim()) data.lostReason = lostReason.trim().slice(0, 2000);
    /* Yeniden açılan fırsatın eski kayıp sebebi analizde sayılmasın */
    if (stage !== "kaybedildi") data.lostReason = null;
    return (await ctx.update("deals", id, data)) ? { ok: true } : { ok: false, error: "Fırsat bulunamadı." };
  } catch (e) {
    const lost = sessionLost(e);
    if (lost) return lost as never;
    return fail(e);
  }
}

export type DealInput = { title: string; value?: number | null; expectedClose?: string | null; service?: string | null; notes?: string | null; contact?: number | null; company?: number | null; stage?: string; owner?: number | null };
const clean = (d: DealInput) => ({
  title: d.title.trim().slice(0, 200),
  value: d.value === null || d.value === undefined || Number.isNaN(Number(d.value)) ? null : Math.max(0, Number(d.value)),
  expectedClose: d.expectedClose ? new Date(`${d.expectedClose.slice(0, 10)}T12:00:00Z`).toISOString() : null,
  service: d.service?.trim().slice(0, 160) || null,
  notes: d.notes?.trim().slice(0, 4000) || null,
  ...(d.owner !== undefined ? { owner: d.owner || null } : {}),
});

export async function updateDeal(id: number, d: DealInput): Promise<Result> {
  try {
    const ctx = await crm();
    if (!d.title?.trim()) return { ok: false, error: "Fırsat adı boş olamaz." };
    /* Kişi, firma ve sorumlu seçili işletmeden olmalı; undefined gelen alan değişmez */
    if (d.contact && !(await ctx.findByID("contacts", d.contact, 0))) return { ok: false, error: "Kişi bulunamadı." };
    if (d.company && !(await ctx.findByID("companies", d.company, 0))) return { ok: false, error: "Firma bulunamadı." };
    if (d.owner && !(await ctx.team()).some((m) => m.id === Number(d.owner))) return { ok: false, error: "Sorumlu bu işletmenin ekibinde değil." };
    const links = { ...(d.contact !== undefined ? { contact: d.contact || null } : {}), ...(d.company !== undefined ? { company: d.company || null } : {}) };
    return (await ctx.update("deals", id, { ...clean(d), ...links })) ? { ok: true } : { ok: false, error: "Fırsat bulunamadı." };
  } catch (e) {
    const lost = sessionLost(e);
    if (lost) return lost as never;
    return fail(e);
  }
}

/** Fırsatı ve ona bağlı not ve görevleri kalıcı siler (yalnız işletme yöneticisi); teklif ve projeler kalır */
export async function deleteDeal(id: number): Promise<Result> {
  try {
    const ctx = await crm();
    if (!ctx.isTenantAdmin) return { ok: false, error: "Fırsatı yalnız işletme yöneticisi silebilir." };
    if (!(await ctx.findByID("deals", id, 0))) return { ok: false, error: "Fırsat bulunamadı." };
    const acts = await ctx.find("activities", { where: { deal: { equals: id } }, limit: 2000, select: { id: true } });
    for (const a of acts.docs) await ctx.remove("activities", a.id);
    return (await ctx.remove("deals", id)) ? { ok: true } : { ok: false, error: "Fırsat bulunamadı." };
  } catch (e) {
    const lost = sessionLost(e);
    if (lost) return lost as never;
    return fail(e);
  }
}

export async function createDeal(d: DealInput): Promise<Result> {
  try {
    const ctx = await crm();
    if (!d.title?.trim()) return { ok: false, error: "Fırsat adı yazın." };
    const stage = d.stage && ["aday", "gorusme", "teklif"].includes(d.stage) ? d.stage : "aday";
    /* Kişi seçildiyse seçili işletmenin kişisi olmalı */
    if (d.contact && !(await ctx.findByID("contacts", d.contact, 0))) return { ok: false, error: "Kişi bulunamadı." };
    const doc = (await ctx.create("deals", { ...clean(d), stage, contact: d.contact || undefined, owner: ctx.user.id })) as { id: number };
    return { ok: true, id: doc.id };
  } catch (e) {
    const lost = sessionLost(e);
    if (lost) return lost as never;
    return fail(e);
  }
}



export async function findContacts(q: string): Promise<{ id: number; name: string; detail: string }[]> {
  const ctx = await getPanelContext();
  if (!ctx.has("crm") || q.trim().length < 2) return [];
  const r = await ctx.find("contacts", { where: { or: [{ name: { like: q.trim() } }, { email: { like: q.trim() } }] }, limit: 8, depth: 1 });
  return (r.docs as { id: number; name: string; email?: string | null; company?: { name?: string } | number | null }[]).map((c) => ({
    id: c.id,
    name: c.name,
    detail: [typeof c.company === "object" ? c.company?.name : null, c.email].filter(Boolean).join(" · "),
  }));
}

export async function findCompanies(q: string): Promise<{ id: number; name: string; detail: string }[]> {
  const ctx = await getPanelContext();
  if (!ctx.has("crm") || q.trim().length < 2) return [];
  const r = await ctx.find("companies", { where: { name: { like: q.trim() } }, limit: 8 });
  return (r.docs as { id: number; name: string; sector?: string | null }[]).map((c) => ({ id: c.id, name: c.name, detail: c.sector ?? "" }));
}
