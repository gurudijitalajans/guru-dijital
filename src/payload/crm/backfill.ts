import { createLocalReq, type Payload, type PayloadRequest } from "payload";
import { bookingToCrm, leadToCrm } from "./automation";

/**
 * CRM'den önce gelmiş talep ve randevuları CRM'e aktarır (kişi, fırsat,
 * görev, toplantı). Yalnız henüz kişiye bağlanmamış kayıtlara dokunur; tekrar
 * çalıştırmak güvenlidir. Canlıda "crm" geçişi bir kez çağırır.
 */
export async function backfillCrm(payload: Payload, migrationReq?: PayloadRequest) {
  /* Geçiş içinde çalışırken aynı işlem (req) kullanılır: yeni tablolar ancak o işlemde görünür */
  const req = migrationReq ?? (await createLocalReq({}, payload));
  const leads = await payload.find({ collection: "leads", where: { contact: { exists: false } }, sort: "createdAt", limit: 1000, depth: 0, pagination: false, overrideAccess: true, req });
  for (const lead of leads.docs) await leadToCrm(req, lead);
  const bookings = await payload.find({ collection: "bookings", where: { contact: { exists: false } }, sort: "createdAt", limit: 1000, depth: 0, pagination: false, overrideAccess: true, req });
  for (const b of bookings.docs) await bookingToCrm(req, b);
  return { leads: leads.docs.length, bookings: bookings.docs.length };
}
