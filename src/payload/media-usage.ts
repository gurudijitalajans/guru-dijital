import type { Field, Payload, PayloadRequest } from "payload";

/**
 * Bir medya kaydının kullanıldığı yerler. Payload yapılandırması gezilerek
 * medyaya bağlı TÜM alanlar bulunur (görsel alanları, iç içe grup, dizi, blok,
 * sekme ve zengin metindeki görseller); yeni bir alan eklendiğinde ayrıca
 * listeye yazmak gerekmez. Medya formunda listelenir, kullanılan görselin
 * silinmesini engeller ve Medya ekranındaki "Kullanılmayanlar" görünümünü kurar.
 */
export type MediaUse = { label: string; where: string; href: string };

type AnyField = Field & { name?: string; type: string; relationTo?: string | string[]; hasMany?: boolean; fields?: Field[]; tabs?: { name?: string; fields: Field[] }[]; blocks?: { slug: string; fields: Field[] }[] };

const isMediaUpload = (f: AnyField) => (f.type === "upload" || f.type === "relationship") && (f.relationTo === "media" || (Array.isArray(f.relationTo) && f.relationTo.includes("media")));
const idOf = (v: unknown): string | null => {
  if (v === null || v === undefined || v === "") return null;
  if (typeof v === "object") {
    const o = v as { id?: unknown; value?: unknown; relationTo?: string };
    if (o.relationTo && o.relationTo !== "media") return null;
    return idOf(o.value ?? o.id);
  }
  return String(v);
};

/** Lexical gövdesindeki görsel düğümleri */
function richUploads(node: unknown, out: Set<string>) {
  if (!node || typeof node !== "object") return;
  const n = node as { type?: string; relationTo?: string; value?: unknown; root?: unknown; children?: unknown[] };
  if (n.type === "upload" && (!n.relationTo || n.relationTo === "media")) {
    const id = idOf(n.value);
    if (id) out.add(id);
  }
  if (n.root) richUploads(n.root, out);
  if (Array.isArray(n.children)) for (const c of n.children) richUploads(c, out);
}

/** Alan tanımlarına göre veriyi gezer, medya kimliklerini toplar */
function collect(fields: Field[], data: unknown, out: Set<string>) {
  if (!data || typeof data !== "object") return;
  const d = data as Record<string, unknown>;
  for (const raw of fields) {
    const f = raw as AnyField;
    if (isMediaUpload(f) && f.name) {
      const v = d[f.name];
      for (const x of Array.isArray(v) ? v : [v]) {
        const id = idOf(x);
        if (id) out.add(id);
      }
    } else if (f.type === "richText" && f.name) richUploads(d[f.name], out);
    else if (f.type === "group" && f.fields) collect(f.fields, f.name ? d[f.name] : d, out);
    else if (f.type === "array" && f.fields && f.name) for (const item of (d[f.name] as unknown[]) ?? []) collect(f.fields, item, out);
    else if (f.type === "blocks" && f.blocks && f.name)
      for (const item of (d[f.name] as { blockType?: string }[]) ?? []) {
        const b = f.blocks.find((x) => x.slug === item?.blockType);
        if (b) collect(b.fields, item, out);
      }
    else if (f.type === "tabs" && f.tabs) for (const t of f.tabs) collect(t.fields, t.name ? d[t.name] : d, out);
    else if ((f.type === "row" || f.type === "collapsible") && f.fields) collect(f.fields, d, out);
  }
}

/** Alan tanımında medya alanı var mı (yoksa koleksiyon hiç okunmaz) */
function hasMedia(fields: Field[]): boolean {
  return fields.some((raw) => {
    const f = raw as AnyField;
    if (isMediaUpload(f) || f.type === "richText") return true;
    if (f.fields && hasMedia(f.fields)) return true;
    if (f.tabs?.some((t) => hasMedia(t.fields))) return true;
    if (f.blocks?.some((b) => hasMedia(b.fields))) return true;
    return false;
  });
}

const SKIP = new Set(["media", "payload-folders", "payload-preferences", "payload-migrations", "payload-locked-documents", "audit-log", "usage"]);
const KIND: Record<string, string> = {
  services: "Hizmet",
  products: "Ürün",
  posts: "Blog yazısı",
  team: "Ekip",
  references: "Referans",
  testimonials: "Müşteri yorumu",
  "case-studies": "Vaka çalışması",
  tenants: "İşletme logosu",
  categories: "Kategori",
  users: "Kullanıcı",
};

/** Tüm kullanımlar: medya kimliği → kullanıldığı yerler */
export async function mediaUsageMap(payload: Payload, req?: PayloadRequest): Promise<Map<string, MediaUse[]>> {
  const map = new Map<string, MediaUse[]>();
  const add = (ids: Set<string>, use: MediaUse) => {
    for (const id of ids) map.set(id, [...(map.get(id) ?? []), use]);
  };
  for (const c of payload.config.collections) {
    if (SKIP.has(c.slug) || !hasMedia(c.fields)) continue;
    const drafts = Boolean((c.versions as { drafts?: unknown } | undefined)?.drafts);
    const res = await payload.find({ collection: c.slug as never, depth: 0, limit: 2000, pagination: false, req, overrideAccess: true, ...(drafts ? { draft: true } : {}) }).catch(() => null);
    const title = c.admin?.useAsTitle ?? "id";
    for (const doc of (res?.docs ?? []) as Record<string, unknown>[]) {
      const ids = new Set<string>();
      collect(c.fields, doc, ids);
      if (ids.size) add(ids, { label: String(doc[title] ?? doc.name ?? doc.title ?? doc.id), where: KIND[c.slug] ?? c.slug, href: c.slug === "tenants" ? "/panel/ayarlar" : `/panel/duzenle/${c.slug}/${doc.id}` });
    }
  }
  for (const g of payload.config.globals) {
    if (!hasMedia(g.fields)) continue;
    const doc = await payload.findGlobal({ slug: g.slug as never, depth: 0, req, overrideAccess: true }).catch(() => null);
    const ids = new Set<string>();
    collect(g.fields, doc, ids);
    const label = typeof g.label === "string" ? g.label : g.slug;
    if (ids.size) add(ids, { label, where: "Sayfa ayarı", href: `/panel/duzenle/${g.slug}` });
  }
  return map;
}

export async function findMediaUsage(payload: Payload, id: string | number, req?: PayloadRequest): Promise<MediaUse[]> {
  return (await mediaUsageMap(payload, req)).get(String(id)) ?? [];
}
