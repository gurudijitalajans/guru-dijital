import type { Field, SelectField } from "payload";
import { ICON_OPTIONS } from "@/lib/icon-names";
import { slugify } from "./utils";

/* Hizmet ve ürün koleksiyonlarının ortak alanları */

export const slugField = (from: string, base: string): Field => ({
  name: "slug",
  type: "text",
  label: "Adres (slug)",
  unique: true,
  index: true,
  admin: {
    position: "sidebar",
    description: `Sayfa adresi: ${base}/adres. Yayındaki bir adresi değiştirmek eski bağlantıları kırar.`,
  },
  hooks: {
    beforeValidate: [
      ({ value, data }) => (value ? slugify(value) : data?.[from] ? slugify(String(data[from])) : value),
    ],
  },
});

export const orderField: Field = {
  name: "order",
  type: "number",
  label: "Sıra",
  defaultValue: 10,
  admin: { position: "sidebar", description: "Küçük sayı önce gelir (menü, kartlar, alt bilgi)." },
};

export const iconField = (opts: { name?: string; label?: string; width?: string } = {}): SelectField => ({
  name: opts.name ?? "icon",
  type: "select",
  label: opts.label ?? "İkon",
  required: true,
  defaultValue: "sparkles",
  options: ICON_OPTIONS.map((o) => ({ label: o.label, value: o.value })),
  admin: opts.width ? { width: opts.width } : { position: "sidebar" },
});

/** Tek metin alanlı liste (paragraflar, maddeler, etiketler) */
export const textList = (
  name: string,
  label: string,
  item: string,
  opts: { textarea?: boolean; minRows?: number; maxRows?: number; description?: string } = {}
): Field => ({
  name,
  type: "array",
  label,
  labels: { singular: item, plural: label },
  minRows: opts.minRows,
  maxRows: opts.maxRows,
  admin: { description: opts.description, initCollapsed: false },
  fields: [
    opts.textarea
      ? { name: "text", type: "textarea", label: item, required: true }
      : { name: "text", type: "text", label: item, required: true },
  ],
});

export const faqField: Field = {
  name: "faq",
  type: "array",
  label: "Sık sorulan sorular",
  labels: { singular: "Soru", plural: "Sorular" },
  admin: { description: "Sayfada iki sütunlu akordeon olarak görünür ve arama motorlarına SSS olarak bildirilir." },
  fields: [
    { name: "q", type: "text", label: "Soru", required: true },
    { name: "a", type: "textarea", label: "Cevap", required: true },
  ],
};

export const titleDescList = (name: string, label: string, item: string, description?: string): Field => ({
  name,
  type: "array",
  label,
  labels: { singular: item, plural: label },
  admin: { description },
  fields: [
    { name: "title", type: "text", label: "Başlık", required: true },
    { name: "desc", type: "textarea", label: "Açıklama", required: true },
  ],
});
