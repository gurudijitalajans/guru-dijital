"use client";

import { $getSelection, $isRangeSelection, $isTextNode, DecoratorNode, ElementNode, type EditorConfig, type LexicalNode, type NodeKey, type SerializedElementNode, type SerializedLexicalNode, type Spread } from "lexical";
import { UploadView, RelationView } from "./views";

/**
 * Payload'un Lexical düğümleriyle birebir aynı biçimde saklanan düğümler:
 * sitedeki RichText çizicisi kaydı değişmeden okur.
 *   link / autolink  { fields: { linkType, url, newTab, doc }, id }
 *   upload           { relationTo, value, fields, id }
 *   relationship     { relationTo, value }
 */
export type LinkFields = { linkType?: "custom" | "internal"; url?: string; newTab?: boolean; doc?: unknown; [k: string]: unknown };
type SerializedLink = Spread<{ fields: LinkFields; id?: string }, SerializedElementNode>;

export class PLinkNode extends ElementNode {
  __fields: LinkFields;
  __id?: string;

  static getType() {
    return "link";
  }
  static clone(n: PLinkNode) {
    return new PLinkNode(n.__fields, n.__id, n.__key);
  }
  constructor(fields: LinkFields = { linkType: "custom", url: "", newTab: false }, id?: string, key?: NodeKey) {
    super(key);
    this.__fields = fields;
    this.__id = id;
  }
  createDOM(config: EditorConfig) {
    const a = document.createElement("a");
    a.href = this.__fields.url ?? "#";
    if (this.__fields.newTab) a.target = "_blank";
    a.className = config.theme.link ?? "";
    return a;
  }
  updateDOM(prev: PLinkNode, dom: HTMLAnchorElement) {
    if (prev.__fields.url !== this.__fields.url) dom.href = this.__fields.url ?? "#";
    if (prev.__fields.newTab !== this.__fields.newTab) dom.target = this.__fields.newTab ? "_blank" : "";
    return false;
  }
  static importJSON(s: SerializedLink): PLinkNode {
    const n = new PLinkNode(s.fields ?? {}, s.id);
    n.setFormat(s.format);
    n.setIndent(s.indent);
    n.setDirection(s.direction);
    return n;
  }
  exportJSON(): SerializedLink {
    return { ...super.exportJSON(), type: this.getType(), fields: this.__fields, ...(this.__id ? { id: this.__id } : {}), version: 3 };
  }
  getFields() {
    return this.getLatest().__fields;
  }
  setFields(f: LinkFields) {
    this.getWritable().__fields = f;
  }
  isInline() {
    return true;
  }
  canBeEmpty() {
    return false;
  }
  canInsertTextBefore() {
    return false;
  }
  canInsertTextAfter() {
    return false;
  }
}

export class PAutoLinkNode extends PLinkNode {
  static getType() {
    return "autolink";
  }
  static clone(n: PAutoLinkNode) {
    return new PAutoLinkNode(n.__fields, n.__id, n.__key);
  }
  static importJSON(s: SerializedLink): PAutoLinkNode {
    const n = new PAutoLinkNode(s.fields ?? {}, s.id);
    n.setFormat(s.format);
    n.setIndent(s.indent);
    n.setDirection(s.direction);
    return n;
  }
}

export const $isLink = (n: LexicalNode | null | undefined): n is PLinkNode => n instanceof PLinkNode;

/** Seçili metni bağlantı yapar (fields) ya da bağlantıyı kaldırır (null) */
export function $setLink(fields: LinkFields | null) {
  const sel = $getSelection();
  if (!$isRangeSelection(sel)) return;
  const nodes = sel.extract();
  if (fields === null) {
    const seen = new Set<string>();
    for (const n of nodes) {
      const p = $isLink(n) ? n : n.getParent();
      if (!$isLink(p) || seen.has(p.getKey())) continue;
      seen.add(p.getKey());
      for (const c of p.getChildren()) p.insertBefore(c);
      p.remove();
    }
    return;
  }
  let link: PLinkNode | null = null;
  let lastParent: LexicalNode | null = null;
  for (const n of nodes) {
    const p = n.getParent();
    if ($isLink(p)) {
      p.setFields(fields);
      continue;
    }
    if ($isLink(n)) {
      n.setFields(fields);
      continue;
    }
    if (!$isTextNode(n)) continue;
    if (!link || p !== lastParent || n.getPreviousSibling() !== link) {
      link = new PLinkNode(fields);
      n.insertBefore(link);
    }
    link.append(n);
    lastParent = p;
  }
}

type UploadData = { relationTo: string; value: number | string; fields?: Record<string, unknown> | null; id?: string };
type SerializedUpload = Spread<UploadData & { format?: string }, SerializedLexicalNode>;

export class UploadNode extends DecoratorNode<React.ReactElement> {
  __data: UploadData;
  static getType() {
    return "upload";
  }
  static clone(n: UploadNode) {
    return new UploadNode(n.__data, n.__key);
  }
  constructor(data: UploadData, key?: NodeKey) {
    super(key);
    this.__data = data;
  }
  static importJSON(s: SerializedUpload & { value: unknown }) {
    const v = s.value && typeof s.value === "object" ? (s.value as { id: number }).id : (s.value as number);
    return new UploadNode({ relationTo: s.relationTo, value: v, fields: s.fields ?? null, id: s.id });
  }
  exportJSON(): SerializedUpload {
    return { type: "upload", version: 3, format: "", relationTo: this.__data.relationTo, value: this.__data.value, fields: this.__data.fields ?? null, ...(this.__data.id ? { id: this.__data.id } : {}) };
  }
  createDOM() {
    const d = document.createElement("div");
    d.className = "my-3";
    return d;
  }
  updateDOM() {
    return false;
  }
  isInline() {
    return false;
  }
  decorate() {
    return <UploadView id={Number(this.__data.value)} nodeKey={this.getKey()} />;
  }
}

type RelData = { relationTo: string; value: unknown };
export class RelationshipNode extends DecoratorNode<React.ReactElement> {
  __data: RelData;
  static getType() {
    return "relationship";
  }
  static clone(n: RelationshipNode) {
    return new RelationshipNode(n.__data, n.__key);
  }
  constructor(data: RelData, key?: NodeKey) {
    super(key);
    this.__data = data;
  }
  static importJSON(s: Spread<RelData, SerializedLexicalNode>) {
    const v = s.value && typeof s.value === "object" ? (s.value as { id: unknown }).id : s.value;
    return new RelationshipNode({ relationTo: s.relationTo, value: v });
  }
  exportJSON() {
    return { type: "relationship", version: 2, format: "", relationTo: this.__data.relationTo, value: this.__data.value };
  }
  createDOM() {
    return document.createElement("div");
  }
  updateDOM() {
    return false;
  }
  decorate() {
    return <RelationView relationTo={this.__data.relationTo} value={this.__data.value} />;
  }
}
