import { cookies } from "next/headers";
import type { Payload, Where } from "payload";
import { isAdminUser, tenantRow } from "../business/roles";

/**
 * Panel ekranlarının işletme kapsamı. Sunucu tarafındaki yerel sorgular
 * yetkiyi atlar; bu yüzden her ekran işletmeye bağlı koleksiyonları burada
 * hesaplanan süzgeçle sorgular. Seçili işletme: işletme seçicisinin çerezi
 * (üyeyse ya da Guru yöneticisiyse), yoksa kullanıcının ilk işletmesi, Guru
 * yöneticisinde Guru Dijital.
 */
export type Scope = { tenantId: number; T: Where; w: (x?: Where) => Where; isGuru: boolean; name: string };

export async function scopeOf(payload: Payload, user: unknown): Promise<Scope> {
  const guru = (await payload.find({ collection: "tenants", where: { slug: { equals: "guru" } }, limit: 1, depth: 0, overrideAccess: true })).docs[0];
  const cookie = (await cookies()).get("payload-tenant")?.value;
  let id: number | undefined;
  if (cookie && (isAdminUser(user) || tenantRow(user, cookie))) id = Number(cookie);
  if (!id) {
    const first = tenantRow(user);
    const t = first?.tenant;
    id = t ? Number(typeof t === "object" ? (t as { id: number }).id : t) : isAdminUser(user) ? guru?.id : undefined;
  }
  const tenantId = id ?? -1;
  const doc = tenantId > 0 ? await payload.findByID({ collection: "tenants", id: tenantId, depth: 0, overrideAccess: true }).catch(() => null) : null;
  const T: Where = { tenant: { equals: tenantId } };
  return { tenantId, T, w: (x) => (x ? { and: [x, T] } : T), isGuru: Boolean(guru && guru.id === tenantId), name: doc?.name ?? "" };
}
