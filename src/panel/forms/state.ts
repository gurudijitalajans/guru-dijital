"use client";

import { createContext, useContext } from "react";

/** Nokta yollu değer okuma ve değiştirilmiş kopya üretme ("faq.items.0.q") */
export function getAt(obj: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((o, k) => (o && typeof o === "object" ? (o as Record<string, unknown>)[k] : undefined), obj);
}

export function setAt<T>(obj: T, path: string, value: unknown): T {
  const [head, ...rest] = path.split(".");
  const isIndex = /^\d+$/.test(head);
  const base: Record<string, unknown> | unknown[] = Array.isArray(obj) ? [...obj] : obj && typeof obj === "object" ? { ...(obj as Record<string, unknown>) } : isIndex ? [] : {};
  const cur = (base as Record<string, unknown>)[head];
  (base as Record<string, unknown>)[head] = rest.length ? setAt(cur, rest.join("."), value) : value;
  return base as T;
}

/** Yeni dizi satırının kimliği (Payload'un satır kimliği biçiminde) */
export const rowId = () => Array.from(crypto.getRandomValues(new Uint8Array(12)), (b) => b.toString(16).padStart(2, "0")).join("");

export type FormApi = {
  slug: string;
  values: Record<string, unknown>;
  get: (path: string) => unknown;
  set: (path: string, value: unknown) => void;
  errors: Record<string, string>;
  hidden: Set<string>;
  readOnly: boolean;
  clientUpload: boolean;
};

export const FormCtx = createContext<FormApi | null>(null);
export const useForm = () => {
  const f = useContext(FormCtx);
  if (!f) throw new Error("FormCtx yok");
  return f;
};
