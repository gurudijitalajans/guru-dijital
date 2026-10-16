import "server-only";
import type { Payload } from "payload";
import { aktar, poolOf } from "./depo";
import { visitorId } from "./tampon";

/**
 * Talep ya da randevu geldiğinde kaynağı sunucuda bulur: aynı ziyaretçinin
 * (günlük özet) son 24 saatteki giriş kayıtlarından son "doğrudan olmayan"
 * kanal seçilir (Shopify'ın varsayılan atıf modeli gibi). Sayfa tam yenilense
 * de (bellekteki kaynak kaybolsa da) böylece reklamdan gelen talep reklama yazılır.
 */
export async function kaynakFromVisit(payload: Payload, headers: Headers) {
  const pool = poolOf(payload);
  if (!pool) return null;
  const vid = await visitorId(headers);
  await aktar(payload).catch(() => null);
  const { rows } = await pool.query(
    `SELECT channel, utm_source, utm_medium, utm_campaign, ref, path, props FROM ga_events
     WHERE vid = $1 AND entry AND ts > now() - interval '24 hours' ORDER BY ts DESC LIMIT 20`,
    [vid],
  );
  if (!rows.length) return null;
  const pick = rows.find((r) => r.channel && r.channel !== "dogrudan") ?? rows[0];
  const p = (pick.props ?? {}) as Record<string, string | undefined>;
  const s = (v: unknown) => (typeof v === "string" && v ? v : undefined);
  return {
    kanal: s(pick.channel) ?? "dogrudan",
    utmSource: s(pick.utm_source),
    utmMedium: s(pick.utm_medium),
    utmCampaign: s(pick.utm_campaign),
    utmTerm: p.utm_term,
    utmContent: p.utm_content,
    ref: s(pick.ref),
    giris: s(pick.path),
    gclid: p.gclid,
    gbraid: p.gbraid,
    wbraid: p.wbraid,
    fbclid: p.fbclid,
    msclkid: p.msclkid,
  };
}
