import "server-only";
import type { Field, Payload, SanitizedPermissions, TypedUser } from "payload";
import type { CField, Option, UiKind } from "./types";

/**
 * Payload alan ayarlarından panelin alan tanımı. Yalnız düz veri: etiket,
 * açıklama, seçenekler, sınırlar. Gizli ve sistem alanları atlanır; yetkisi
 * olmayan alan salt okunur (okuma yetkisi yoksa hiç gösterilmez).
 */
/*
 * Payload yetki tablosunu sadeleştirir: izin verilen işlem `true` (ya da
 * { permission: true, where }), verilmeyen işlem hiç yer almaz; her şeyi
 * serbest olan alan ya da alan grubu tek başına `true` olur.
 */
type OpPerm = true | { permission?: boolean; where?: unknown };
type FieldPerm = true | { read?: OpPerm; update?: OpPerm; create?: OpPerm; fields?: Perms; blocks?: unknown };
type Perms = true | Record<string, FieldPerm> | undefined;
const allowed = (p: unknown, op: string): boolean => p === true || Boolean( (p && typeof p === "object" && ((p as Record<string, unknown>)[op] === true || ((p as Record<string, { permission?: boolean }>)[op]?.permission ?? false) === true)));
const permOf = (perms: Perms, name: string): FieldPerm | undefined => (perms === true ? true : perms?.[name]);
const childOf = (perm: FieldPerm | undefined, perms: Perms): Perms => (perm === true ? true : perm ? (perm.fields ?? true) : perms);

const SKIP = new Set(["id", "createdAt", "updatedAt", "_status", "tenant", "folder", "deletedAt"]);
const UI: Record<string, UiKind> = {
  "/payload/components/TextHelper#TextHelper": "textHelper",
  "/payload/components/PageMap#PageMap": "pageMap",
  "/payload/components/channels/EmbedCode#EmbedCode": "embedCode",
  "/payload/components/channels/KnowledgeTools#KnowledgeTools": "knowledgeTools",
};

/** Payload'da etiket metin, dil nesnesi ya da işlev olabilir */
export function txt(v: unknown): string | undefined {
  if (typeof v === "string") return v;
  if (v && typeof v === "object") {
    const o = v as Record<string, unknown>;
    const s = o.tr ?? o.en ?? Object.values(o)[0];
    return typeof s === "string" ? s : undefined;
  }
  if (typeof v === "function") {
    try {
      const r = (v as (a: unknown) => unknown)({ t: (k: string) => k, i18n: { language: "tr" } });
      return typeof r === "string" ? r : undefined;
    } catch {
      return undefined;
    }
  }
  return undefined;
}

const human = (name: string) => name.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toLocaleUpperCase("tr-TR"));
const options = (o: unknown[]): Option[] => o.map((x) => (typeof x === "string" ? { label: x, value: x } : { label: txt((x as { label: unknown }).label) ?? String((x as { value: string }).value), value: String((x as { value: string }).value) }));

export function toClientFields(fields: Field[], perms: Perms, canEdit: boolean, prefix = ""): CField[] {
  const out: CField[] = [];
  fields.forEach((raw, i) => {
    const f = raw as Field & { name?: string; label?: unknown; admin?: Record<string, unknown>; required?: boolean; hidden?: boolean };
    const admin = (f.admin ?? {}) as Record<string, unknown> & { components?: { Field?: unknown }; hidden?: boolean; disabled?: boolean };
    if (f.hidden || admin.hidden || admin.disabled) return;
    if ("name" in f && f.name && SKIP.has(f.name)) return;
    const perm = "name" in f && f.name ? permOf(perms, f.name) : undefined;
    if (perm !== undefined && !allowed(perm, "read")) return;
    const readOnly = Boolean(admin.readOnly) || !canEdit || (perm !== undefined && !allowed(perm, "update"));
    const key = `${prefix}${"name" in f && f.name ? f.name : `_${i}`}`;
    const base = {
      key,
      label: txt(f.label) ?? ("name" in f && f.name ? human(f.name) : ""),
      description: txt(admin.description),
      readOnly: readOnly || undefined,
      sidebar: admin.position === "sidebar" || undefined,
      width: typeof admin.width === "string" ? admin.width : undefined,
    };
    const childPerms = childOf(perm, perms);
    switch (f.type) {
      case "text":
      case "textarea":
      case "email":
      case "code":
      case "json": {
        if (admin.components?.Field) return;
        const t = f as { maxLength?: number; hasMany?: boolean };
        if (t.hasMany) return void out.push({ ...base, kind: "unsupported", name: f.name });
        out.push({ ...base, kind: f.type, name: f.name, required: f.required || undefined, maxLength: t.maxLength, placeholder: txt(admin.placeholder) });
        return;
      }
      case "number": {
        const n = f as { min?: number; max?: number; hasMany?: boolean };
        if (n.hasMany) return void out.push({ ...base, kind: "unsupported", name: f.name });
        out.push({ ...base, kind: "number", name: f.name, required: f.required || undefined, min: n.min, max: n.max, placeholder: txt(admin.placeholder) });
        return;
      }
      case "checkbox":
        out.push({ ...base, kind: "checkbox", name: f.name });
        return;
      case "date": {
        const d = admin.date as { pickerAppearance?: string } | undefined;
        out.push({ ...base, kind: "date", name: f.name, required: f.required || undefined, time: d?.pickerAppearance === "dayAndTime" || undefined });
        return;
      }
      case "select":
      case "radio":
        out.push({ ...base, kind: f.type, name: f.name, required: f.required || undefined, options: options((f as { options: unknown[] }).options), hasMany: (f as { hasMany?: boolean }).hasMany || undefined });
        return;
      case "upload":
        out.push({ ...base, kind: "upload", name: f.name, required: f.required || undefined, hasMany: (f as { hasMany?: boolean }).hasMany || undefined });
        return;
      case "relationship": {
        const r = f as { relationTo: string | string[]; hasMany?: boolean };
        if (Array.isArray(r.relationTo)) return void out.push({ ...base, kind: "unsupported", name: f.name });
        out.push({ ...base, kind: "relationship", name: f.name, required: f.required || undefined, relationTo: r.relationTo, hasMany: r.hasMany || undefined });
        return;
      }
      case "richText":
        out.push({ ...base, kind: "richText", name: f.name, required: f.required || undefined });
        return;
      case "group": {
        const g = f as { name?: string; fields: Field[] };
        if (!g.name) return void out.push({ ...base, kind: "row", fields: toClientFields(g.fields, perms, canEdit, prefix) });
        out.push({ ...base, kind: "group", name: g.name, fields: toClientFields(g.fields, childPerms, canEdit && !readOnly, `${key}.`) });
        return;
      }
      case "row":
      case "collapsible": {
        const c = f as { fields: Field[] };
        out.push({ ...base, kind: f.type, fields: toClientFields(c.fields, perms, canEdit, prefix), collapsed: (admin.initCollapsed as boolean) || undefined });
        return;
      }
      case "tabs": {
        const t = f as unknown as { tabs: { name?: string; label?: unknown; description?: unknown; fields: Field[] }[] };
        out.push({
          ...base,
          kind: "tabs",
          tabs: t.tabs.map((tab) => {
            const tp = tab.name ? permOf(perms, tab.name) : undefined;
            return {
              label: txt(tab.label) ?? (tab.name ? human(tab.name) : ""),
              name: tab.name,
              description: txt(tab.description),
              fields: tab.name ? toClientFields(tab.fields, childOf(tp, perms), canEdit && (tp === undefined || allowed(tp, "update")), `${prefix}${tab.name}.`) : toClientFields(tab.fields, perms, canEdit, prefix),
            };
          }),
        });
        return;
      }
      case "array": {
        const a = f as { name: string; fields: Field[]; labels?: { singular?: unknown }; minRows?: number; maxRows?: number };
        out.push({
          ...base,
          kind: "array",
          name: a.name,
          fields: toClientFields(a.fields, childPerms, canEdit && !readOnly, ""),
          singular: txt(a.labels?.singular) ?? "Satır",
          minRows: a.minRows,
          maxRows: a.maxRows,
          required: f.required || undefined,
        });
        return;
      }
      case "ui": {
        const c = admin.components?.Field as { path?: string; clientProps?: Record<string, unknown> } | string | undefined;
        const path = typeof c === "string" ? c : c?.path;
        const component = path ? UI[path] : undefined;
        if (component) out.push({ ...base, kind: "ui", component, props: (typeof c === "object" && c?.clientProps) || {} });
        return;
      }
      default:
        if ("name" in f && f.name) out.push({ ...base, kind: "unsupported", name: f.name });
    }
  });
  return out;
}

/** Yeni kayıt için varsayılan değerler (işlev olanlar sunucuda çalışır) */
export async function defaultsFor(fields: Field[], user: TypedUser, payload: Payload): Promise<Record<string, unknown>> {
  const out: Record<string, unknown> = {};
  for (const raw of fields) {
    const f = raw as Field & { name?: string; defaultValue?: unknown; fields?: Field[]; tabs?: { name?: string; fields: Field[] }[] };
    if (f.type === "tabs") {
      for (const tab of f.tabs ?? []) {
        if (tab.name) out[tab.name] = await defaultsFor(tab.fields, user, payload);
        else Object.assign(out, await defaultsFor(tab.fields, user, payload));
      }
      continue;
    }
    if ((f.type === "row" || f.type === "collapsible" || (f.type === "group" && !f.name)) && f.fields) {
      Object.assign(out, await defaultsFor(f.fields, user, payload));
      continue;
    }
    if (!f.name || SKIP.has(f.name)) continue;
    if (f.type === "group" && f.fields) {
      out[f.name] = await defaultsFor(f.fields, user, payload);
      continue;
    }
    let v = f.defaultValue;
    if (typeof v === "function") v = await (v as (a: unknown) => unknown)({ user, locale: "tr", req: { payload, user } });
    if (v !== undefined) out[f.name] = v;
  }
  return out;
}

/** Koşulu tutmayan alanların yolları (Payload'un admin.condition kuralı) */
export function hiddenPaths(fields: Field[], data: Record<string, unknown>, sibling: Record<string, unknown>, user: TypedUser, operation: "create" | "update", prefix = ""): string[] {
  const out: string[] = [];
  fields.forEach((raw, i) => {
    const f = raw as Field & { name?: string; admin?: { condition?: (d: unknown, s: unknown, c: unknown) => boolean }; fields?: Field[]; tabs?: { name?: string; fields: Field[] }[] };
    const key = `${prefix}${f.name ?? `_${i}`}`;
    const cond = f.admin?.condition;
    if (cond) {
      let ok = true;
      try {
        ok = Boolean(cond(data, sibling, { user, operation, path: key }));
      } catch {
        ok = true;
      }
      if (!ok) return void out.push(key);
    }
    if (f.type === "tabs") {
      for (const tab of f.tabs ?? []) {
        const s = tab.name ? ((sibling[tab.name] as Record<string, unknown>) ?? {}) : sibling;
        out.push(...hiddenPaths(tab.fields, data, s, user, operation, tab.name ? `${prefix}${tab.name}.` : prefix));
      }
    } else if ((f.type === "row" || f.type === "collapsible" || (f.type === "group" && !f.name)) && f.fields) {
      out.push(...hiddenPaths(f.fields, data, sibling, user, operation, prefix));
    } else if (f.type === "group" && f.name && f.fields) {
      out.push(...hiddenPaths(f.fields, data, (sibling[f.name] as Record<string, unknown>) ?? {}, user, operation, `${key}.`));
    } else if (f.type === "array" && f.name && f.fields) {
      const rows = (sibling[f.name] as Record<string, unknown>[]) ?? [];
      rows.forEach((row, r) => out.push(...hiddenPaths(f.fields!, data, row ?? {}, user, operation, `${key}.${r}.`)));
    }
  });
  return out;
}

/** Yetki ağacından bu varlığın alan izinleri */
export function fieldPerms(perms: SanitizedPermissions, type: "global" | "collection", slug: string): { perms: Perms; canEdit: boolean; canCreate: boolean; canDelete: boolean } {
  const p = (type === "global" ? perms.globals?.[slug as never] : perms.collections?.[slug as never]) as true | { fields?: Perms } | undefined;
  return { perms: p === true ? true : p?.fields, canEdit: allowed(p, "update"), canCreate: allowed(p, "create"), canDelete: allowed(p, "delete") };
}

/** Alanlardan birinde admin.condition var mı */
export function hasConditions(fields: Field[]): boolean {
  return fields.some((raw) => {
    const f = raw as Field & { admin?: { condition?: unknown }; fields?: Field[]; tabs?: { fields: Field[] }[] };
    return Boolean(f.admin?.condition) || (f.fields ? hasConditions(f.fields) : false) || (f.tabs ? f.tabs.some((t) => hasConditions(t.fields)) : false);
  });
}
