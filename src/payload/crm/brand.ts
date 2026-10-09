import type { PayloadRequest } from "payload";
import { site } from "@/lib/data";
import { isGuruTenant } from "./tenant";

/**
 * Teklif belgesi, ay sonu raporu ve e-postalarda görünecek işletme kimliği.
 * İşletmenin "Belge ve e-posta bilgileri"nden; Guru Dijital'de boş alanlar
 * sitenin kendi bilgileri ve logosuyla dolar.
 */
export type Brand = { name: string; shortName: string; logo: string | null; email: string; phone: string; address: string; website: string; tax: string };

export async function brandOf(req: PayloadRequest, tenant: unknown): Promise<Brand> {
  const id = tenant && typeof tenant === "object" ? (tenant as { id: number }).id : (tenant as number);
  const t = await req.payload.findByID({ collection: "tenants", id, depth: 1, req, overrideAccess: true }).catch(() => null);
  const p = t?.profile ?? {};
  const logo = p.logo && typeof p.logo === "object" ? (p.logo.url ?? null) : null;
  const tax = [p.taxOffice, p.taxNumber].filter(Boolean).join(" / ");
  if (await isGuruTenant(req, id)) {
    const s = await req.payload.findGlobal({ slug: "site-settings", depth: 0, req, overrideAccess: true }).catch(() => null);
    return {
      name: p.legalName || site.name,
      shortName: site.shortName,
      logo: logo ?? "/brand/logo-navy.svg",
      email: p.email || s?.contact?.email || site.email,
      phone: p.phone || s?.contact?.phone || "",
      address: p.address || s?.contact?.address || "",
      website: p.website || site.url,
      tax,
    };
  }
  return { name: p.legalName || t?.name || "", shortName: t?.name || "", logo, email: p.email || "", phone: p.phone || "", address: p.address || "", website: p.website || "", tax };
}
