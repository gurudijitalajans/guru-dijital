import type { Payload, PayloadRequest } from "payload";
import { chatConfigOf } from "../chat/collections";
import { businessConfigOf } from "../business/collections";
import { siteConnectionOf } from "../channels/collections";

/**
 * İşletmenin tek kayıtlık ayarları (Chatbot ayarları, Yönetici ayarları, Site
 * bağlantısı). Kayıt yoksa ayar sayfası "Yeni oluştur" formu gibi açılıyordu;
 * işletme açılırken (ve eski işletmeler için geçişte) baştan oluşturulur.
 * Tekrar çalıştırmak güvenlidir: var olan kayda dokunulmaz.
 */
export async function ensureTenantSettings(payload: Payload, tenant: number | string, req?: PayloadRequest) {
  await chatConfigOf(payload, tenant, req);
  await businessConfigOf(payload, tenant, req);
  await siteConnectionOf(payload, tenant, req);
}

/**
 * İşletme silinirken ayar kayıtları da silinir. Çok kiracılı eklenti bu tek
 * kayıtlık ayarları silmiyor, yalnız işletme bağını boşaltıyordu (demo
 * sıfırlamasında sahipsiz kayıtlar birikiyordu).
 */
export async function deleteTenantSettings(payload: Payload, tenant: number | string, req?: PayloadRequest) {
  for (const collection of ["chatbot-config", "business-config", "site-connection"] as const) {
    await payload.delete({ collection, where: { tenant: { equals: tenant } }, req, overrideAccess: true });
  }
}
