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

/** Lexical gövdesinde bu görsele bağlı upload düğümü var mı */
function usesInRichText(node: unknown, id: string | number): boolean {
  if (!node || typeof node !== "object") return false;
  const n = node as { type?: string; value?: unknown; root?: unknown; children?: unknown[] };
  if (n.type === "upload") {
    const v = n.value && typeof n.value === "object" ? (n.value as { id?: unknown }).id : n.value;
    if (String(v) === String(id)) return true;
  }
  if (n.root && usesInRichText(n.root, id)) return true;
  return Array.isArray(n.children) && n.children.some((c) => usesInRichText(c, id));
}

export async function findMediaUsage(payload: Payload, id: string | number, req?: PayloadRequest): Promise<MediaUse[]> {
  const uses: MediaUse[] = [];
  await Promise.all(
    COLLECTIONS.map(async (c) => {
      const where: Where = { or: c.fields.map((f) => ({ [f]: { equals: id } })) };
      const res = await payload.find({ collection: c.slug, where, depth: 0, limit: 50, pagination: false, req });
      for (const doc of res.docs as unknown as Record<string, unknown>[]) {
        uses.push({ label: String(doc[c.title] ?? doc.id), where: c.kind, href: `/panel/duzenle/${c.slug}/${doc.id}` });
      }
    })
  );
  /* Blog gövdesine (zengin metin) eklenen görseller: upload düğümleri taranır */
  const posts = await payload.find({ collection: "posts", depth: 0, limit: 1000, pagination: false, req, select: { title: true, content: true } as never });
  for (const p of posts.docs as unknown as { id: number; title?: string; content?: unknown }[]) {
    if (usesInRichText(p.content, id)) uses.push({ label: p.title ?? String(p.id), where: "Blog yazısı (metin içi)", href: `/panel/duzenle/posts/${p.id}` });
  }
  /* İşletme logosu: teklif belgesi ve yönetici raporunda kullanılır */
  const tenants = await payload.find({ collection: "tenants", where: { "profile.logo": { equals: id } }, depth: 0, limit: 50, pagination: false, req, overrideAccess: true });
  for (const t of tenants.docs as unknown as { id: number; name?: string }[]) uses.push({ label: t.name ?? String(t.id), where: "İşletme logosu", href: "/panel/ayarlar" });
  const about = (await payload.findGlobal({ slug: "about-page", depth: 0, req })) as { awards?: { items?: { title?: string; image?: unknown }[] } };
  for (const a of about.awards?.items ?? []) {
    if (a.image === id || String(a.image) === String(id)) uses.push({ label: a.title ?? "Ödül", where: "Hakkımızda > Ödüller", href: "/panel/duzenle/about-page" });
  }
  return uses;
}
