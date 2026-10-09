import type { CollectionAfterChangeHook, CollectionAfterDeleteHook, CollectionConfig, Field, GlobalConfig } from "payload";
import { isAdmin } from "../access";

/**
 * İşlem geçmişi: panelde kim, ne zaman, neyi oluşturdu, değiştirdi ya da
 * sildi; kim giriş yaptı. Yalnız yönetici okur, kimse düzenleyemez. Sitedeki
 * ziyaretçi işlemleri (form, sohbet) kişi olmadığı için yazılmaz; onlar CRM
 * ve sohbet kayıtlarında zaten durur.
 */

export const AuditLog: CollectionConfig = {
  slug: "audit-log",
  labels: { singular: "İşlem kaydı", plural: "İşlem geçmişi" },
  admin: {
    useAsTitle: "summary",
    group: "Ayarlar",
    defaultColumns: ["summary", "user", "createdAt"],
    description: "Paneldeki her değişiklik ve giriş: kim, ne zaman, ne yaptı. Yalnız yöneticiler görür.",
    hidden: ({ user }) => (user as { role?: string } | null)?.role !== "admin",
  },
  defaultSort: "-createdAt",
  access: { read: isAdmin, create: () => false, update: () => false, delete: isAdmin },
  fields: [
    { name: "summary", type: "text", label: "İşlem" },
    { name: "user", type: "relationship", relationTo: "users", label: "Kim" },
    {
      name: "action",
      type: "select",
      label: "Tür",
      index: true,
      options: [
        { label: "Oluşturdu", value: "olusturdu" },
        { label: "Değiştirdi", value: "degistirdi" },
        { label: "Sildi", value: "sildi" },
        { label: "Giriş yaptı", value: "giris" },
      ],
    },
    { name: "target", type: "text", label: "Bölüm", index: true },
    { name: "docId", type: "text", label: "Kayıt" },
    { name: "fields", type: "text", label: "Değişen alanlar" },
  ],
};

/* Değişen üst düzey alanların etiketleri (satır, sekme ve katlanır gruplar açılarak) */
function labelMap(fields: Field[], out = new Map<string, string>()) {
  for (const f of fields) {
    if ("name" in f && f.name) {
      const l = "label" in f && typeof f.label === "string" ? f.label : f.name;
      out.set(f.name, l);
    } else if (f.type === "row" || f.type === "collapsible") labelMap(f.fields, out);
    else if (f.type === "tabs") for (const t of f.tabs) labelMap(t.fields, out);
  }
  return out;
}

/* İlişkiler bazen kayıt, bazen kimlik olarak gelir: karşılaştırmadan önce kimliğe indirilir */
const norm = (v: unknown): unknown => {
  if (Array.isArray(v)) return v.map(norm);
  if (v && typeof v === "object") {
    const o = v as Record<string, unknown>;
    if ("id" in o && ("updatedAt" in o || "createdAt" in o)) return o.id;
    return Object.fromEntries(Object.entries(o).filter(([k]) => k !== "id").map(([k, x]) => [k, norm(x)]));
  }
  return v ?? null;
};
const same = (a: unknown, b: unknown) => JSON.stringify(norm(a)) === JSON.stringify(norm(b));

const SKIP_KEYS = new Set(["tenant", "updatedAt", "createdAt", "id", "order", "label", "lastText", "lastMessageAt", "visitorMessages", "_status"]);
const SKIP = new Set(["audit-log", "tenants", "chat-messages", "payload-preferences", "payload-locked-documents", "payload-migrations", "payload-kv"]);

/** Koleksiyona işlem geçmişi kancalarını ekler */
export function withAudit(c: CollectionConfig): CollectionConfig {
  if (SKIP.has(c.slug)) return c;
  const labels = labelMap(c.fields);
  const singular = typeof c.labels?.singular === "string" ? c.labels.singular : c.slug;
  const titleKey = (c.admin?.useAsTitle as string | undefined) ?? "title";
  const titleOf = (doc: Record<string, unknown>) => String(doc[titleKey] ?? doc.name ?? doc.title ?? doc.id ?? "").slice(0, 120);

  const afterChange: CollectionAfterChangeHook = async ({ doc, previousDoc, operation, req }) => {
    /* Otomasyonun kendi yazdıkları (aşama kaydı, görev) kayda geçmez: yalnız kişinin işlemi */
    if (!req.user || req.context?.crmSkip) return;
    let changed: string[] = [];
    if (operation === "update" && previousDoc) {
      changed = Object.keys(doc).filter((k) => !SKIP_KEYS.has(k) && labels.has(k) && !same(doc[k], previousDoc[k]));
      if (!changed.length) return;
    }
    const names = changed.map((k) => labels.get(k)!).slice(0, 6);
    await req.payload
      .create({
        collection: "audit-log",
        data: {
          user: req.user.id,
          action: operation === "create" ? "olusturdu" : "degistirdi",
          target: singular,
          docId: String(doc.id),
          summary: `${singular}: ${titleOf(doc)} ${operation === "create" ? "oluşturuldu" : "değiştirildi"}`,
          fields: names.join(", "),
        },
        req,
        overrideAccess: true,
      })
      .catch(() => {});
  };
  const afterDelete: CollectionAfterDeleteHook = async ({ doc, req }) => {
    if (!req.user) return;
    await req.payload
      .create({
        collection: "audit-log",
        data: { user: req.user.id, action: "sildi", target: singular, docId: String(doc.id), summary: `${singular}: ${titleOf(doc)} silindi` },
        req,
        overrideAccess: true,
      })
      .catch(() => {});
  };
  return { ...c, hooks: { ...c.hooks, afterChange: [...(c.hooks?.afterChange ?? []), afterChange], afterDelete: [...(c.hooks?.afterDelete ?? []), afterDelete] } };
}

export const BusinessSettings: GlobalConfig = {
  slug: "business-settings",
  label: "Yönetici ayarları",
  admin: { group: "Ayarlar" },
  access: { read: isAdmin, update: isAdmin },
  fields: [
    {
      name: "monthlyTarget",
      type: "number",
      label: "Aylık hedef (₺, KDV hariç)",
      min: 0,
      admin: { description: "Yönetici panosunda bu ay kazanılan işin hedefe oranı görünür. Boşsa hedef çubuğu gösterilmez." },
    },
    {
      name: "summaryEnabled",
      type: "checkbox",
      label: "Hafta içi her sabah özet e-postası gönder",
      defaultValue: true,
      admin: { description: "Saat 08:00 civarı yöneticilere: dünkü talepler, bekleyen sohbetler, bugünkü işler, gecikenler." },
    },
    {
      name: "summaryRecipients",
      type: "array",
      label: "Ek alıcılar",
      labels: { singular: "Alıcı", plural: "Alıcılar" },
      admin: { description: "Yöneticilere ek olarak özeti alacak adresler." },
      fields: [{ name: "email", type: "email", label: "E-posta", required: true }],
    },
  ],
};
