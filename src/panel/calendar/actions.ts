"use server";

import { getPanelContext } from "../context";

/** Takvimden CRM görevini (arama, toplantı, görev) tamamlandı işaretler */
export async function completeActivity(id: number, done: boolean): Promise<{ ok: boolean; error?: string }> {
  const ctx = await getPanelContext();
  if (!ctx.has("crm")) return { ok: false, error: "Yetki yok." };
  try {
    return (await ctx.update("activities", id, { done })) ? { ok: true } : { ok: false, error: "Kayıt bulunamadı." };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Kaydedilemedi." };
  }
}
