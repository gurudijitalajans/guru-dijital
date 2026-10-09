import type { Payload, PayloadRequest, Where } from "payload";

/**
 * Bir medya kaydının sitede kullanıldığı yerler: hangi hizmet, ürün, yazı,
 * ekip ya da referans kaydında ve Hakkımızda'daki ödüllerde. Medya formunda
 * listelenir; kullanılan görsel silinmeye çalışılınca uyarı verir.
 */
export type MediaUse = { label: string; where: string; href: string };

const COLLECTIONS: { slug: "services" | "products" | "posts" | "team" | "references" | "testimonials"; title: string; kind: string; fields: string[] }[] = [
  { slug: "services", title: "title", kind: "Hizmet", fields: ["cardImage", "gallery.image"] },
  { slug: "products", title: "name", kind: "Ürün", fields: ["heroVisual", "tour.poster", "showcase.image", "cover", "screenshot", "ogImage"] },
  { slug: "posts", title: "title", kind: "Blog yazısı", fields: ["cover"] },
  { slug: "team", title: "name", kind: "Ekip", fields: ["photo"] },
  { slug: "references", title: "name", kind: "Referans", fields: ["logo"] },
  { slug: "testimonials", title: "name", kind: "Müşteri yorumu", fields: ["photo"] },
];

export async function findMediaUsage(payload: Payload, id: string | number, req?: PayloadRequest): Promise<MediaUse[]> {
  const uses: MediaUse[] = [];
  await Promise.all(
    COLLECTIONS.map(async (c) => {
      const where: Where = { or: c.fields.map((f) => ({ [f]: { equals: id } })) };
      const res = await payload.find({ collection: c.slug, where, depth: 0, limit: 50, pagination: false, req });
      for (const doc of res.docs as unknown as Record<string, unknown>[]) {
        uses.push({ label: String(doc[c.title] ?? doc.id), where: c.kind, href: `/admin/collections/${c.slug}/${doc.id}` });
      }
    })
  );
  const about = (await payload.findGlobal({ slug: "about-page", depth: 0, req })) as { awards?: { items?: { title?: string; image?: unknown }[] } };
  for (const a of about.awards?.items ?? []) {
    if (a.image === id || String(a.image) === String(id)) uses.push({ label: a.title ?? "Ödül", where: "Hakkımızda > Ödüller", href: "/admin/globals/about-page" });
  }
  return uses;
}
