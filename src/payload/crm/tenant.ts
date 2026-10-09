import type { CollectionConfig, Field, PayloadRequest } from "payload";
import { isAdmin, isLoggedIn } from "../access";

/**
 * Çok kiracılı yapıya hazırlık: CRM, Operation ve Chatbot kayıtlarının her
 * biri bir işletmeye (tenant) bağlıdır. Bugün tek işletme Guru Dijital; ürün
 * müşteriye satıldığında her müşterinin verisi ayrı kalır. Alan adı "tenant"
 * Payload'un çok kiracılı eklentisiyle uyumludur.
 */
export const DEFAULT_TENANT = { name: "Guru Dijital", slug: "guru" };

export const Tenants: CollectionConfig = {
  slug: "tenants",
  labels: { singular: "İşletme", plural: "İşletmeler" },
  /* Tek işletme varken menüde gizli; ürün müşteriye satılınca açılır */
  admin: { useAsTitle: "name", group: "Ayarlar", hidden: true, description: "Paneli kullanan işletmeler. Bugün yalnız Guru Dijital." },
  access: { read: isLoggedIn, create: isAdmin, update: isAdmin, delete: isAdmin },
  fields: [
    { name: "name", type: "text", label: "İşletme adı", required: true },
    { name: "slug", type: "text", label: "Kısa ad", required: true, unique: true, index: true },
  ],
};

/** Varsayılan işletmenin kimliği; yoksa oluşturur. Aynı istek (req) üzerinden çalışır. */
export async function defaultTenantId(req: PayloadRequest): Promise<number> {
  const found = await req.payload.find({ collection: "tenants", where: { slug: { equals: DEFAULT_TENANT.slug } }, limit: 1, depth: 0, req, overrideAccess: true });
  if (found.docs[0]) return found.docs[0].id;
  const created = await req.payload.create({ collection: "tenants", data: DEFAULT_TENANT, req, overrideAccess: true });
  return created.id;
}

export const tenantField: Field = {
  name: "tenant",
  type: "relationship",
  relationTo: "tenants",
  label: "İşletme",
  index: true,
  admin: { position: "sidebar", hidden: true },
  hooks: {
    beforeValidate: [async ({ value, req }) => value ?? (await defaultTenantId(req))],
  },
};
