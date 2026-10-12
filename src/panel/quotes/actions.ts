"use server";

import { getPanelContext } from "../context";

/**
 * Teklif kaydı. Toplamlar, teklif numarası (işletme ön eki-yıl-sıra) ve
 * durum değişince fırsatın aşaması koleksiyon kancalarında hesaplanır.
 */
export type QuoteItemInput = { description: string; qty: number; unit: string; unitPrice: number; vatRate: string };
export type QuoteInput = { title: string; deal?: number | null; contact?: number | null; company?: number | null; items: QuoteItemInput[]; notes?: string; terms?: string; issueDate?: string; validUntil?: string; status?: string };
type Result = { ok: boolean; error?: string; id?: number };
const VAT = ["20", "10", "1", "0"];
const STATUS = ["taslak", "gonderildi", "kabul", "red"];
const day = (v?: string) => (v && /^\d{4}-\d{2}-\d{2}/.test(v) ? `${v.slice(0, 10)}T12:00:00.000Z` : undefined);

export async function saveQuote(id: number | null, d: QuoteInput): Promise<Result> {
  const ctx = await getPanelContext();
  if (!ctx.has("crm")) return { ok: false, error: "Yetki yok." };
  if (!d.title?.trim()) return { ok: false, error: "Teklif konusunu yazın." };
  const items = (d.items ?? [])
    .map((i) => ({ description: String(i.description ?? "").trim().slice(0, 300), qty: Math.max(0, Number(i.qty) || 0), unit: String(i.unit ?? "").trim().slice(0, 30) || "Adet", unitPrice: Math.max(0, Number(i.unitPrice) || 0), vatRate: VAT.includes(String(i.vatRate)) ? String(i.vatRate) : "20" }))
    .filter((i) => i.description);
  if (!items.length) return { ok: false, error: "En az bir kalem ekleyin." };
  /* Bağlı kayıtlar seçili işletmenin olmalı */
  for (const [col, v] of [["deals", d.deal], ["contacts", d.contact], ["companies", d.company]] as const) {
    if (v && !(await ctx.findByID(col, v, 0))) return { ok: false, error: "Bağlı kayıt bulunamadı." };
  }
  const data = {
    title: d.title.trim().slice(0, 200),
    deal: d.deal || null,
    contact: d.contact || null,
    company: d.company || null,
    items,
    notes: d.notes?.trim().slice(0, 4000) || null,
    terms: d.terms?.trim().slice(0, 4000) || null,
    ...(day(d.issueDate) ? { issueDate: day(d.issueDate) } : {}),
    ...(day(d.validUntil) ? { validUntil: day(d.validUntil) } : {}),
    ...(d.status && STATUS.includes(d.status) ? { status: d.status } : {}),
  };
  try {
    if (id) return (await ctx.update("quotes", id, data)) ? { ok: true, id } : { ok: false, error: "Teklif bulunamadı." };
    const doc = (await ctx.create("quotes", { ...data, owner: ctx.user.id })) as { id: number };
    return { ok: true, id: doc.id };
  } catch (e) {
    return { ok: false, error: e instanceof Error && e.message ? e.message : "Kaydedilemedi." };
  }
}

export async function setQuoteStatus(id: number, status: string): Promise<Result> {
  const ctx = await getPanelContext();
  if (!ctx.has("crm") || !STATUS.includes(status)) return { ok: false, error: "Geçersiz işlem." };
  try {
    return (await ctx.update("quotes", id, { status })) ? { ok: true, id } : { ok: false, error: "Teklif bulunamadı." };
  } catch (e) {
    return { ok: false, error: e instanceof Error && e.message ? e.message : "Kaydedilemedi." };
  }
}
