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
    return (await ctx.update("deals", id, data)) ? { ok: true } : { ok: false, error: "Fırsat bulunamadı." };
  } catch (e) {
    const lost = sessionLost(e);
    if (lost) return lost as never;
    return fail(e);
  }
}

export type DealInput = { title: string; value?: number | null; expectedClose?: string | null; service?: string | null; notes?: string | null; contact?: number | null; stage?: string; owner?: number | null };
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
    return (await ctx.update("deals", id, clean(d))) ? { ok: true } : { ok: false, error: "Fırsat bulunamadı." };
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

export async function addNote(dealId: number, text: string): Promise<Result> {
  try {
    const ctx = await crm();
    const body = text.trim().slice(0, 4000);
    if (!body) return { ok: false, error: "Not boş." };
    const deal = (await ctx.findByID("deals", dealId, 0)) as { id: number; contact?: unknown } | null;
    if (!deal) return { ok: false, error: "Fırsat bulunamadı." };
    await ctx.create("activities", { type: "not", title: body.split("\n")[0].slice(0, 120), body, deal: deal.id, done: true, owner: ctx.user.id });
    return { ok: true };
  } catch (e) {
    const lost = sessionLost(e);
    if (lost) return lost as never;
    return fail(e);
  }
}

/** Ertesi iş günü 10:00 (İstanbul) için arama görevi */
export async function scheduleCall(dealId: number): Promise<Result> {
  try {
    const ctx = await crm();
    const deal = (await ctx.findByID("deals", dealId, 0)) as { id: number; title: string } | null;
    if (!deal) return { ok: false, error: "Fırsat bulunamadı." };
    const d = new Date();
    do d.setUTCDate(d.getUTCDate() + 1);
    while (d.getUTCDay() === 0 || d.getUTCDay() === 6);
    d.setUTCHours(7, 0, 0, 0);
    await ctx.create("activities", { type: "arama", title: `Ara: ${deal.title}`.slice(0, 120), deal: deal.id, dueAt: d.toISOString(), done: false, owner: ctx.user.id });
    return { ok: true };
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
