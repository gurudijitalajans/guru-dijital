/**
 * Panel düzenleyicisinin alan tanımı: Payload'un alan ayarlarından sunucuda
 * üretilir, istemciye düz veri olarak gider (işlev yok). Koşullu görünürlük,
 * doğrulama ve yetki sunucuda Payload'un kendi kurallarıyla çalışır.
 */
export type Option = { label: string; value: string };

type Base = { key: string; label: string; description?: string; readOnly?: boolean; sidebar?: boolean; width?: string };

export type CField =
  | (Base & { kind: "text" | "textarea" | "email" | "code" | "json"; name: string; required?: boolean; maxLength?: number; placeholder?: string })
  | (Base & { kind: "number"; name: string; required?: boolean; min?: number; max?: number; placeholder?: string })
  | (Base & { kind: "checkbox"; name: string })
  | (Base & { kind: "date"; name: string; required?: boolean; time?: boolean })
  | (Base & { kind: "select" | "radio"; name: string; required?: boolean; options: Option[]; hasMany?: boolean })
  | (Base & { kind: "upload"; name: string; required?: boolean; hasMany?: boolean })
  | (Base & { kind: "relationship"; name: string; required?: boolean; relationTo: string; hasMany?: boolean })
  | (Base & { kind: "richText"; name: string; required?: boolean })
  | (Base & { kind: "group"; name: string; fields: CField[] })
  | (Base & { kind: "row" | "collapsible"; fields: CField[]; collapsed?: boolean })
  | (Base & { kind: "tabs"; tabs: { label: string; name?: string; description?: string; fields: CField[] }[] })
  | (Base & { kind: "array"; name: string; fields: CField[]; singular: string; minRows?: number; maxRows?: number; required?: boolean })
  | (Base & { kind: "ui"; component: "textHelper" | "pageMap"; props: Record<string, unknown> })
  | (Base & { kind: "unsupported"; name: string });

export type FieldError = { path: string; message: string };

export type EditorEntity = { slug: string; type: "global" | "collection"; id: number | null };
