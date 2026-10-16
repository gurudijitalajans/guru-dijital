"use server";

import { getPanelContext } from "../context";
import { sessionLost } from "../errors";

/** Takvimden CRM görevini (arama, toplantı, görev) tamamlandı işaretler */
export async function completeActivity(id: number, done: boolean): Promise<{ ok: boolean; error?: string }> {
  const ctx = await getPanelContext();
  if (!ctx.has("crm")) return { ok: false, error: "Yetki yok." };
  try {
    return (await ctx.update("activities", id, { done })) ? { ok: true } : { ok: false, error: "Kayıt bulunamadı." };
  } catch (e) {
    const lost = sessionLost(e);
    if (lost) return lost as never;
    return { ok: false, error: e instanceof Error ? e.message : "Kaydedilemedi." };
  }
}
