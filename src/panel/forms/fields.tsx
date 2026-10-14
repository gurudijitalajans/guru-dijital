"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { ArrowDown, ArrowUp, ChevronDown, ImageOff, Plus, Trash2 } from "lucide-react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { MediaPicker } from "../media/MediaPicker";
import { countOf, mediaThumbs, quickCreate, relationLabels, relationOptions, type RelOption, type Thumb } from "./actions";
import { toast } from "sonner";
import { rowId, useForm } from "./state";
import type { CField } from "./types";
import { cn } from "@/lib/utils";

/**
 * Alan çizicisi: Payload alan türlerinin panel karşılıkları. Değerler nokta
 * yollu tek bir nesnede durur; hata ve gizli alan bilgisi sunucudan gelir.
 */
/* Metin editörü yalnız gerektiğinde yüklenir */
const RichTextField = dynamic(() => import("./richtext/RichText").then((m) => m.RichTextField), { ssr: false, loading: () => <div className="min-h-[360px] animate-pulse rounded-[12px] border border-line bg-sunken" /> });

const fieldCls = "rounded-[9px] border border-line bg-surface px-3 text-[14px] text-ink focus:border-accent focus:outline-none disabled:bg-sunken disabled:text-muted";
const pathOf = (base: string, f: CField) => `${base}${f.key}`;
const domId = (path: string) => `f-${path.replace(/\./g, "__")}`;

export function FieldList({ fields, base = "" }: { fields: CField[]; base?: string }) {
  return (
    <div className="grid gap-4">
      {fields.map((f) => (
        <FieldView key={f.key} f={f} base={base} />
      ))}
    </div>
  );
}

function Shell({ f, path, children, inline }: { f: CField; path: string; children: React.ReactNode; inline?: boolean }) {
  const { errors } = useForm();
  const err = errors[path];
  const required = "required" in f && f.required;
  if (inline) return <div>{children}{err ? <p className="mt-1 mb-0 text-[13px] text-bad">{err}</p> : null}</div>;
  return (
    <div className="grid min-w-0 gap-1">
      {f.label ? (
        <label htmlFor={domId(path)} className="text-[14px] text-muted">
          {f.label}
          {required ? <span className="text-bad" aria-hidden="true"> *</span> : null}
        </label>
      ) : null}
      {children}
      {err ? (
        <p className="m-0 text-[13px] text-bad" role="alert">
          {err}
        </p>
      ) : f.description ? (
        <p className="m-0 text-[12px] text-muted">{f.description}</p>
      ) : null}
    </div>
  );
}

function FieldView({ f, base }: { f: CField; base: string }) {
  const form = useForm();
  const path = pathOf(base, f);
  if (form.hidden.has(path)) return null;
  const ro = form.readOnly || f.readOnly;
  const value = "name" in f ? form.get(path) : undefined;
  const set = (v: unknown) => form.set(path, v);
  const invalid = form.errors[path] ? true : undefined;

  switch (f.kind) {
    case "text":
    case "email":
    case "code":
    case "json":
      return (
        <Shell f={f} path={path}>
          <Input id={domId(path)} type={f.kind === "email" ? "email" : "text"} value={typeof value === "string" ? value : value == null ? "" : JSON.stringify(value)} onChange={(e) => set(e.target.value)} maxLength={f.maxLength} placeholder={f.placeholder} disabled={ro} aria-invalid={invalid} className={cn(invalid && "border-bad")} />
          {f.maxLength && typeof value === "string" && value.length > f.maxLength * 0.8 ? <span className="tabular text-right text-[12px] text-muted">{`${value.length}/${f.maxLength}`}</span> : null}
        </Shell>
      );
    case "textarea":
      return (
        <Shell f={f} path={path}>
          <textarea id={domId(path)} value={String(value ?? "")} onChange={(e) => set(e.target.value)} maxLength={f.maxLength} rows={3} disabled={ro} aria-invalid={invalid} className={cn(fieldCls, "min-h-20 py-2 leading-relaxed", invalid && "border-bad")} />
          {f.maxLength && String(value ?? "").length > f.maxLength * 0.8 ? <span className="tabular text-right text-[12px] text-muted">{`${String(value ?? "").length}/${f.maxLength}`}</span> : null}
        </Shell>
      );
    case "number":
      return (
        <Shell f={f} path={path}>
          <Input id={domId(path)} type="number" inputMode="decimal" value={value === null || value === undefined ? "" : String(value)} min={f.min} max={f.max} onChange={(e) => set(e.target.value === "" ? null : Number(e.target.value))} disabled={ro} aria-invalid={invalid} className={cn(invalid && "border-bad")} />
        </Shell>
      );
    case "checkbox":
      return (
        <Shell f={f} path={path} inline>
          <label className="flex min-h-10 items-start gap-2.5 text-[14px]">
            <input id={domId(path)} type="checkbox" checked={Boolean(value)} onChange={(e) => set(e.target.checked)} disabled={ro} className="mt-0.5 size-5 shrink-0 accent-[var(--accent)]" />
            <span>
              <span className="text-ink">{f.label}</span>
              {f.description ? <span className="block text-[12px] text-muted">{f.description}</span> : null}
            </span>
          </label>
        </Shell>
      );
    case "date":
      return (
        <Shell f={f} path={path}>
          <Input
            id={domId(path)}
            type={f.time ? "datetime-local" : "date"}
            value={toLocalInput(value, Boolean(f.time))}
            onChange={(e) => set(e.target.value ? new Date(f.time ? e.target.value : `${e.target.value}T12:00:00`).toISOString() : null)}
            disabled={ro}
          />
        </Shell>
      );
    case "select":
    case "radio":
      if (f.hasMany) {
        const arr = Array.isArray(value) ? (value as string[]) : [];
        return (
          <Shell f={f} path={path}>
            <div className="flex flex-wrap gap-2" id={domId(path)}>
              {f.options.map((o) => {
                const on = arr.includes(o.value);
                return (
                  <label key={o.value} className={cn("inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-full border px-3 text-[14px]", on ? "border-accent bg-accent-soft text-ink" : "border-line text-muted")}>
                    <input type="checkbox" className="sr-only" checked={on} disabled={ro} onChange={() => set(on ? arr.filter((x) => x !== o.value) : [...arr, o.value])} />
                    {o.label}
                  </label>
                );
              })}
            </div>
          </Shell>
        );
      }
      return (
        <Shell f={f} path={path}>
          <select id={domId(path)} value={String(value ?? "")} onChange={(e) => set(e.target.value || null)} disabled={ro} className={cn(fieldCls, "min-h-10")}>
            {!f.required || !value ? <option value="">Seçin</option> : null}
            {f.options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </Shell>
      );
    case "upload":
      return (
        <Shell f={f} path={path}>
          <UploadInput path={path} value={value} hasMany={Boolean(f.hasMany)} readOnly={Boolean(ro)} />
        </Shell>
      );
    case "relationship":
      return (
        <Shell f={f} path={path}>
          <RelationInput path={path} value={value} relationTo={f.relationTo} hasMany={Boolean(f.hasMany)} readOnly={Boolean(ro)} />
        </Shell>
      );
    case "richText":
      return (
        <Shell f={f} path={path}>
          <RichTextField id={domId(path)} value={value} onChange={set} readOnly={Boolean(ro)} invalid={invalid} />
        </Shell>
      );
    case "group":
      return (
        <fieldset className="m-0 grid min-w-0 gap-3 rounded-[12px] border border-line p-4">
          <legend className="px-1 text-[15px] font-semibold text-ink">{f.label}</legend>
          {f.description ? <p className="-mt-1 mb-0 text-[13px] text-muted">{f.description}</p> : null}
          <FieldList fields={f.fields} base={base} />
        </fieldset>
      );
    case "row":
      return (
        <div className="grid min-w-0 gap-4 sm:grid-cols-[repeat(auto-fit,minmax(180px,1fr))]">
          {f.fields.map((c) => (
            <FieldView key={c.key} f={c} base={base} />
          ))}
        </div>
      );
    case "collapsible":
      return (
        <details open={!f.collapsed} className="group rounded-[12px] border border-line">
          <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-2 px-4 text-[15px] font-semibold text-ink">
            {f.label}
            <ChevronDown className="size-4 text-muted transition-transform group-open:rotate-180" />
          </summary>
          <div className="border-t border-line p-4">
            <FieldList fields={f.fields} base={base} />
          </div>
        </details>
      );
    case "tabs":
      return <TabsView f={f} base={base} />;
    case "array":
      return <ArrayView f={f} path={path} />;
    case "ui":
      if (f.component === "textHelper") return <TextHelper {...(f.props as HelperProps)} base={base} />;
      if (f.component === "embedCode") return <EmbedCode />;
      if (f.component === "knowledgeTools") return <KnowledgeTools />;
      return <PageMap {...(f.props as { page: string; active: string[]; note?: string })} />;
    case "unsupported":
      return (
        <Shell f={f} path={path}>
          <p className="m-0 text-[13px] text-muted">Bu alan şimdilik panelde düzenlenemiyor.</p>
        </Shell>
      );
  }
}

function toLocalInput(v: unknown, time: boolean) {
  if (typeof v !== "string" || !v) return "";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return "";
  const p = (n: number) => String(n).padStart(2, "0");
  const day = `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
  return time ? `${day}T${p(d.getHours())}:${p(d.getMinutes())}` : day;
}

/** Bir alan listesinin içindeki veri yolları (sekmede hata işareti için) */
function dataPaths(fields: CField[], base: string): string[] {
  return fields.flatMap((f) => {
    if (f.kind === "row" || f.kind === "collapsible" || f.kind === "group") return [...("name" in f ? [`${base}${f.key}`] : []), ...dataPaths(f.fields, base)];
    if (f.kind === "tabs") return f.tabs.flatMap((t) => dataPaths(t.fields, base));
    return "name" in f ? [`${base}${f.key}`] : [];
  });
}

function TabsView({ f, base }: { f: Extract<CField, { kind: "tabs" }>; base: string }) {
  const { errors } = useForm();
  const [active, setActive] = useState(0);
  const errPaths = Object.keys(errors);
  const flagged = f.tabs.map((t) => {
    const paths = dataPaths(t.fields, base);
    return errPaths.some((e) => paths.some((p) => e === p || e.startsWith(`${p}.`)));
  });
  const tab = f.tabs[Math.min(active, f.tabs.length - 1)];
  return (
    <div className="min-w-0">
      <div role="tablist" className="-mx-1 mb-4 flex gap-1 overflow-x-auto border-b border-line px-1">
        {f.tabs.map((t, i) => (
          <button
            key={t.label}
            type="button"
            role="tab"
            aria-selected={i === active}
            onClick={() => setActive(i)}
            className={cn("relative -mb-px inline-flex min-h-11 shrink-0 items-center gap-1.5 border-b-2 px-3 text-[14px] font-medium", i === active ? "border-accent text-ink" : "border-transparent text-muted hover:text-ink")}
          >
            {t.label}
            {flagged[i] ? <span className="size-2 rounded-full bg-bad" aria-label="hatalı alan var" /> : null}
          </button>
        ))}
      </div>
      {tab.description ? <p className="mt-0 mb-3 text-[13px] text-muted">{tab.description}</p> : null}
      <div role="tabpanel">
        <FieldList fields={tab.fields} base={base} />
      </div>
    </div>
  );
}

function rowSummary(fields: CField[], row: Record<string, unknown>): string {
  for (const f of fields) {
    if ((f.kind === "text" || f.kind === "textarea") && typeof row[f.name] === "string" && row[f.name]) return String(row[f.name]).slice(0, 80);
    if (f.kind === "row") {
      const s = rowSummary(f.fields, row);
      if (s) return s;
    }
  }
  return "";
}

function ArrayView({ f, path }: { f: Extract<CField, { kind: "array" }>; path: string }) {
  const form = useForm();
  const rows = (Array.isArray(form.get(path)) ? form.get(path) : []) as Record<string, unknown>[];
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const ro = form.readOnly || f.readOnly;
  const keyOf = (r: Record<string, unknown>, i: number) => String(r.id ?? i);
  const isOpen = (r: Record<string, unknown>, i: number) => open[keyOf(r, i)] ?? rows.length <= 3;
  const move = (i: number, d: number) => {
    const next = [...rows];
    const [x] = next.splice(i, 1);
    next.splice(i + d, 0, x);
    form.set(path, next);
  };
  const err = form.errors[path];
  /* Tek metin alanlı listeler (konular, adresler, anahtar kelimeler): akordeonsuz, doğrudan yazılır */
  const only = f.fields.length === 1 && (f.fields[0].kind === "text" || f.fields[0].kind === "email") ? f.fields[0] : null;
  if (only && "name" in only) {
    const add = () => form.set(path, [...rows, { id: rowId(), [only.name]: "" }]);
    return (
      <div className="grid min-w-0 gap-2">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-[15px] font-semibold text-ink">{f.label}</span>
          <span className="tabular text-[12px] text-muted">{rows.length}</span>
        </div>
        {f.description ? <p className="-mt-1 mb-0 text-[12px] text-muted">{f.description}</p> : null}
        {err ? <p className="m-0 text-[13px] text-bad">{err}</p> : null}
        {rows.map((r, i) => {
          const p = `${path}.${i}.${only.name}`;
          const e = form.errors[p];
          return (
            <div key={keyOf(r, i)} className="grid gap-1">
              <div className="flex items-center gap-1">
                <Input
                  id={domId(p)}
                  value={String(r[only.name] ?? "")}
                  onChange={(ev) => form.set(p, ev.target.value)}
                  placeholder={only.placeholder ?? `${f.singular} ${i + 1}`}
                  aria-label={`${f.singular} ${i + 1}`}
                  aria-invalid={e ? true : undefined}
                  disabled={ro}
                  autoFocus={!r[only.name] && i === rows.length - 1 && rows.length > 0}
                  onKeyDown={(ev) => {
                    if (ev.key === "Enter") {
                      ev.preventDefault();
                      add();
                    }
                  }}
                  className={cn("min-w-0 flex-1", e && "border-bad")}
                />
                {!ro ? (
                  <>
                    <Button type="button" size="icon" variant="ghost" aria-label="Yukarı taşı" disabled={i === 0} onClick={() => move(i, -1)}>
                      <ArrowUp />
                    </Button>
                    <Button type="button" size="icon" variant="ghost" aria-label={`${f.singular} ${i + 1} sil`} onClick={() => form.set(path, rows.filter((_, j) => j !== i))}>
                      <Trash2 />
                    </Button>
                  </>
                ) : null}
              </div>
              {e ? <p className="m-0 text-[13px] text-bad">{e}</p> : null}
            </div>
          );
        })}
        {!ro && (f.maxRows === undefined || rows.length < f.maxRows) ? (
          <Button type="button" size="sm" className="justify-self-start" onClick={add}>
            <Plus />
            {`${f.singular} ekle`}
          </Button>
        ) : null}
      </div>
    );
  }
  return (
    <div className="grid min-w-0 gap-2">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-[15px] font-semibold text-ink">{f.label}</span>
        <span className="tabular text-[12px] text-muted">{rows.length}</span>
      </div>
      {f.description ? <p className="-mt-1 mb-0 text-[12px] text-muted">{f.description}</p> : null}
      {err ? <p className="m-0 text-[13px] text-bad">{err}</p> : null}
      {rows.map((r, i) => {
        const k = keyOf(r, i);
        const summary = rowSummary(f.fields, r);
        const rowErr = Object.keys(form.errors).some((e) => e.startsWith(`${path}.${i}.`));
        return (
          <div key={k} className={cn("min-w-0 rounded-[12px] border bg-surface", rowErr ? "border-bad" : "border-line")}>
            <div className="flex items-center gap-1 pr-1.5">
              <button type="button" onClick={() => setOpen((o) => ({ ...o, [k]: !isOpen(r, i) }))} aria-expanded={isOpen(r, i)} className="flex min-h-11 min-w-0 flex-1 items-center gap-2 px-3 text-left">
                <ChevronDown className={cn("size-4 shrink-0 text-muted transition-transform", isOpen(r, i) && "rotate-180")} />
                <span className="tabular shrink-0 text-[13px] text-muted">{`${f.singular} ${i + 1}`}</span>
                <span className="min-w-0 truncate text-[14px] text-ink">{summary}</span>
              </button>
              {!ro ? (
                <>
                  <Button type="button" size="icon" variant="ghost" aria-label="Yukarı taşı" disabled={i === 0} onClick={() => move(i, -1)}>
                    <ArrowUp />
                  </Button>
                  <Button type="button" size="icon" variant="ghost" aria-label="Aşağı taşı" disabled={i === rows.length - 1} onClick={() => move(i, 1)}>
                    <ArrowDown />
                  </Button>
                  <Button type="button" size="icon" variant="ghost" aria-label={`${f.singular} ${i + 1} sil`} disabled={f.minRows !== undefined && rows.length <= f.minRows} onClick={() => form.set(path, rows.filter((_, j) => j !== i))}>
                    <Trash2 />
                  </Button>
                </>
              ) : null}
            </div>
            {isOpen(r, i) ? (
              <div className="border-t border-line p-3.5">
                <FieldList fields={f.fields} base={`${path}.${i}.`} />
              </div>
            ) : null}
          </div>
        );
      })}
      {!ro && (f.maxRows === undefined || rows.length < f.maxRows) ? (
        <Button
          type="button"
          size="sm"
          className="justify-self-start"
          onClick={() => {
            const id = rowId();
            form.set(path, [...rows, { id }]);
            setOpen((o) => ({ ...o, [id]: true }));
          }}
        >
          <Plus />
          {`${f.singular} ekle`}
        </Button>
      ) : null}
    </div>
  );
}

/* ---------- Görsel ---------- */

const thumbCache = new Map<number, Thumb>();

function useThumbs(slug: string, ids: number[]) {
  const key = ids.join(",");
  const [, bump] = useState(0);
  useEffect(() => {
    const missing = key ? key.split(",").map(Number).filter((id) => !thumbCache.has(id)) : [];
    if (!missing.length) return;
    let live = true;
    void mediaThumbs(slug, missing).then((r) => {
      r.forEach((t) => thumbCache.set(t.id, t));
      if (live) bump((n) => n + 1);
    });
    return () => {
      live = false;
    };
  }, [slug, key]);
  return ids.map((id) => thumbCache.get(id) ?? null);
}

const idOf = (v: unknown) => (v && typeof v === "object" ? (v as { id: number }).id : typeof v === "number" ? v : Number(v) || null);

function UploadInput({ path, value, hasMany, readOnly }: { path: string; value: unknown; hasMany: boolean; readOnly: boolean }) {
  const form = useForm();
  const [picking, setPicking] = useState(false);
  const ids = (hasMany ? (Array.isArray(value) ? value : []) : value ? [value] : []).map(idOf).filter((x): x is number => Boolean(x));
  const thumbs = useThumbs(form.slug, ids);
  return (
    <div className="flex flex-wrap items-center gap-3" id={domId(path)}>
      {ids.length ? (
        ids.map((id, i) => (
          <div key={id} className="relative">
            <span className="grid size-24 place-items-center overflow-hidden rounded-[10px] border border-line bg-sunken">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {thumbs[i]?.thumb ? <img src={thumbs[i]!.thumb} alt={thumbs[i]!.alt} className="size-full object-cover" /> : <ImageOff className="size-5 text-muted" />}
            </span>
            {thumbs[i]?.width ? <span className="tabular mt-1 block text-center text-[11px] text-muted">{`${thumbs[i]!.width}×${thumbs[i]!.height}`}</span> : null}
            {!readOnly ? (
              <button type="button" onClick={() => form.set(path, hasMany ? ids.filter((x) => x !== id) : null)} className="absolute -top-2 -right-2 grid size-7 pointer-coarse:size-10 place-items-center rounded-full border border-line bg-surface text-muted hover:text-bad" aria-label="Görseli kaldır">
                ×
              </button>
            ) : null}
          </div>
        ))
      ) : (
        <span className="grid size-24 place-items-center rounded-[10px] border border-dashed border-line text-[12px] text-muted">Görsel yok</span>
      )}
      {!readOnly ? (
        <Button type="button" size="sm" onClick={() => setPicking(true)}>
          {hasMany ? "Görsel ekle" : ids.length ? "Değiştir" : "Görsel seç"}
        </Button>
      ) : null}
      {picking ? (
        <MediaPicker
          clientUpload={form.clientUpload}
          onClose={() => setPicking(false)}
          onPick={(m) => {
            form.set(path, hasMany ? [...ids, m.id] : m.id);
            setPicking(false);
          }}
        />
      ) : null}
    </div>
  );
}

/* ---------- İlişki ---------- */

function RelationInput({ path, value, relationTo, hasMany, readOnly }: { path: string; value: unknown; relationTo: string; hasMany: boolean; readOnly: boolean }) {
  const form = useForm();
  const ids = useMemo(() => (hasMany ? (Array.isArray(value) ? value : []) : value ? [value] : []).map(idOf).filter((x): x is number => Boolean(x)), [value, hasMany]);
  const [q, setQ] = useState("");
  const [opts, setOpts] = useState<RelOption[] | null>(null);
  const [known, setKnown] = useState<Record<number, string>>({});
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  /* Arama yazıldıkça sunucudan (en çok 50 kayıt) */
  useEffect(() => {
    if (!open) return;
    let live = true;
    const t = setTimeout(() => void relationOptions(form.slug, relationTo, q).then((r) => live && setOpts(r)), q ? 220 : 0);
    return () => {
      live = false;
      clearTimeout(t);
    };
  }, [form.slug, relationTo, q, open]);
  const idsKey = ids.join(",");
  useEffect(() => {
    if (!idsKey) return;
    let live = true;
    void relationLabels(form.slug, relationTo, idsKey.split(",").map(Number)).then((r) => live && setKnown((k) => ({ ...k, ...Object.fromEntries(r.map((o) => [o.value, o.label])) })));
    return () => {
      live = false;
    };
  }, [form.slug, relationTo, idsKey]);
  const label = (id: number) => known[id] ?? opts?.find((o) => o.value === id)?.label ?? `#${id}`;
  const choose = (o: RelOption) => {
    setKnown((k) => ({ ...k, [o.value]: o.label }));
    form.set(path, hasMany ? [...ids, o.value] : o.value);
    setQ("");
    setOpen(false);
  };
  const create = async () => {
    const name = q.trim();
    if (!name) return;
    setBusy(true);
    const r = await quickCreate(form.slug, relationTo, name);
    setBusy(false);
    if (r.ok && r.option) choose(r.option);
    else toast.error(r.error ?? "Eklenemedi.");
  };
  const choices = (opts ?? []).filter((o) => !ids.includes(o.value));
  const exact = (opts ?? []).some((o) => o.label.toLocaleLowerCase("tr-TR") === q.trim().toLocaleLowerCase("tr-TR"));

  return (
    <div className="relative grid gap-2" id={domId(path)}>
      {ids.length ? (
        <div className="flex flex-wrap gap-2">
          {ids.map((id) => (
            <span key={id} className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-line bg-sunken pr-1 pl-3 text-[14px] text-ink">
              {label(id)}
              {!readOnly ? (
                <button type="button" onClick={() => form.set(path, hasMany ? ids.filter((x) => x !== id) : null)} className="grid size-7 pointer-coarse:size-10 place-items-center rounded-full text-muted hover:text-bad" aria-label={`${label(id)} kaldır`}>
                  ×
                </button>
              ) : null}
            </span>
          ))}
        </div>
      ) : null}
      {!readOnly && (hasMany || !ids.length) ? (
        <div className="relative">
          <Input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onBlur={() => setTimeout(() => setOpen(false), 160)}
            onKeyDown={(e) => {
              if (e.key === "Escape") setOpen(false);
              if (e.key === "Enter") {
                e.preventDefault();
                if (choices[0] && (exact || !q.trim())) choose(choices[0]);
                else if (q.trim()) void create();
              }
            }}
            placeholder={hasMany ? "Ara ve ekle…" : "Ara ve seç…"}
            role="combobox"
            aria-expanded={open}
            aria-autocomplete="list"
            className="w-full"
          />
          {open ? (
            <ul role="listbox" className="absolute top-full right-0 left-0 z-30 mt-1 max-h-64 overflow-auto rounded-[10px] border border-line bg-surface p-1 shadow-pop">
              {opts === null ? <li className="px-3 py-2 text-[13px] text-muted">Yükleniyor…</li> : null}
              {choices.map((o) => (
                <li key={o.value}>
                  <button type="button" role="option" aria-selected={false} onMouseDown={(e) => e.preventDefault()} onClick={() => choose(o)} className="flex min-h-10 w-full items-center rounded-[7px] px-3 text-left text-[14px] text-ink hover:bg-accent-soft">
                    {o.label}
                  </button>
                </li>
              ))}
              {opts !== null && !choices.length && !q.trim() ? <li className="px-3 py-2 text-[13px] text-muted">Henüz kayıt yok. Adını yazıp ekleyebilirsiniz.</li> : null}
              {q.trim() && !exact ? (
                <li>
                  <button type="button" disabled={busy} onMouseDown={(e) => e.preventDefault()} onClick={() => void create()} className="flex min-h-10 w-full items-center gap-2 rounded-[7px] px-3 text-left text-[14px] font-medium text-accent hover:bg-accent-soft">
                    <Plus className="size-4" />
                    {busy ? "Ekleniyor…" : `“${q.trim()}” adıyla yeni ekle`}
                  </button>
                </li>
              ) : null}
            </ul>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

/* ---------- Yardımcılar (veri tutmayan alanlar) ---------- */

type HelperProps = { target: string; mode: "accent" | "count"; source?: "references" | "services"; words?: boolean };
const TR_COUNT = ["sıfır", "bir", "iki", "üç", "dört", "beş", "altı", "yedi", "sekiz", "dokuz", "on"];

/** Metin alanının altında "sitede böyle görünür" ve kalın/sayı düğmeleri */
function TextHelper({ target, mode, source, words }: HelperProps & { base: string }) {
  const form = useForm();
  /* Hedef, belgenin kökünden tam yol (Payload'daki gibi) */
  const path = target;
  const text = String(form.get(path) ?? "");
  const [count, setCount] = useState<number | null>(null);
  useEffect(() => {
    if (mode !== "count" || !source) return;
    let live = true;
    void countOf(form.slug, source).then((n) => live && setCount(n));
    return () => {
      live = false;
    };
  }, [mode, source, form.slug]);
  if (form.readOnly) return null;
  const el = () => document.getElementById(domId(path)) as HTMLInputElement | HTMLTextAreaElement | null;

  const makeBold = () => {
    const e = el();
    let s = e?.selectionStart ?? text.length;
    let end = e?.selectionEnd ?? text.length;
    if (s === end) {
      while (s > 0 && !/\s/.test(text[s - 1])) s--;
      while (end < text.length && !/\s/.test(text[end])) end++;
    }
    const plain = text.replace(/\*/g, "");
    const off = (i: number) => text.slice(0, i).split("*").length - 1;
    const ps = s - off(s);
    const pe = end - off(end);
    if (pe <= ps) return;
    form.set(path, `${plain.slice(0, ps)}*${plain.slice(ps, pe)}*${plain.slice(pe)}`);
    e?.focus();
  };
  const insertCount = () => {
    const e = el();
    const s = e?.selectionStart ?? text.length;
    const end = e?.selectionEnd ?? text.length;
    form.set(path, `${text.slice(0, s)}{sayı}${text.slice(end)}`);
    e?.focus();
  };
  const shown = count === null ? "…" : words ? (TR_COUNT[count] ?? String(count)) : String(count);
  const preview =
    mode === "accent"
      ? text.split(/(\*[^*]+\*)/g).filter(Boolean).map((p, i) => (p.startsWith("*") && p.endsWith("*") ? <b key={i}>{p.slice(1, -1)}</b> : <span key={i}>{p}</span>))
      : text.split("{sayı}").flatMap((p, i, all) => (i < all.length - 1 ? [<span key={i}>{p}</span>, <b key={`n${i}`}>{shown}</b>] : [<span key={i}>{p}</span>]));

  return (
    <div className="-mt-2 grid gap-2">
      <div className="flex flex-wrap gap-2">
        {mode === "accent" ? (
          <>
            <Button type="button" size="sm" onMouseDown={(e) => e.preventDefault()} onClick={makeBold}>
              Seçili kelimeyi kalın yap
            </Button>
            {text.includes("*") ? (
              <Button type="button" size="sm" variant="ghost" onClick={() => form.set(path, text.replace(/\*/g, ""))}>
                Kalınlığı kaldır
              </Button>
            ) : null}
          </>
        ) : (
          <Button type="button" size="sm" onMouseDown={(e) => e.preventDefault()} onClick={insertCount}>
            {source === "services" ? "Hizmet sayısını ekle" : "Referans sayısını ekle"}
          </Button>
        )}
      </div>
      {text ? (
        <p className="m-0 rounded-[9px] bg-sunken px-3 py-2 text-[14px] text-ink">
          <span className="mr-2 text-[12px] text-muted">Sitede:</span>
          {preview}
        </p>
      ) : null}
    </div>
  );
}

const PAGES: Record<string, string[]> = {
  urun: ["Giriş", "Ürün turu videosu", "Öne çıkan ekranlar", "Ve daha fazlası", "Pakete dahil ürünler", "Bugün / Guru ile", "Nasıl çalışır", "Kullanım senaryoları", "Sayılar bandı", "Neler dahil", "Entegrasyonlar", "Sık sorulan sorular", "Demo talebi"],
  "urun-dis": ["Ana sayfa ürün kartı", "Ürünler sayfası kartı", "Sosyal medya paylaşımı", "Arama sonucu"],
};

/** Sekmenin başında "sayfada nerede" krokisi */
function PageMap({ page, active, note }: { page: string; active: string[]; note?: string }) {
  return (
    <div className="rounded-[12px] border border-line bg-sunken p-3">
      <p className="mt-0 mb-2 text-[12px] font-semibold uppercase tracking-[0.07em] text-muted">{note ?? "Sayfada nerede"}</p>
      <ol className="m-0 flex list-none flex-wrap gap-1.5 p-0">
        {(PAGES[page] ?? []).map((r) => (
          <li key={r} className={cn("rounded-full px-2.5 py-1 text-[12px]", active.includes(r) ? "bg-accent text-white" : "bg-surface text-muted")}>
            {r}
          </li>
        ))}
      </ol>
    </div>
  );
}

/* ---------- Site bağlantısı ve sohbet asistanı araçları ---------- */

function CopyButton({ text }: { text: string }) {
  const [done, setDone] = useState(false);
  return (
    <Button
      type="button"
      size="sm"
      onClick={() =>
        void navigator.clipboard.writeText(text).then(() => {
          setDone(true);
          setTimeout(() => setDone(false), 2000);
        })
      }
    >
      {done ? "Kopyalandı" : "Kopyala"}
    </Button>
  );
}

function CodeLine({ code }: { code: string }) {
  return (
    <div className="flex min-w-0 items-center gap-2 rounded-[10px] border border-line bg-sunken p-2 pl-3">
      <code className="min-w-0 flex-1 overflow-x-auto font-mono text-[12px] whitespace-nowrap text-ink">{code}</code>
      <CopyButton text={code} />
    </div>
  );
}

/** Sitenize eklenecek kod (site anahtarı kaydedince üretilir) */
function EmbedCode() {
  const form = useForm();
  const key = form.get("siteKey") as string | undefined;
  const base = useSyncExternalStore(
    () => () => {},
    () => window.location.origin,
    () => "",
  );
  if (!key) return <p className="m-0 rounded-[10px] bg-sunken px-3 py-2 text-[14px] text-muted">Kaydedince site anahtarı üretilir ve kod burada görünür.</p>;
  const script = `<script src="${base}/guru-site.js" data-key="${key}" async></script>`;
  return (
    <section className="grid gap-2 rounded-[12px] border border-accent/40 bg-accent-soft/40 p-4">
      <h3 className="m-0 text-[15px] font-semibold text-ink">Sitenize Ekleyin</h3>
      <p className="m-0 text-[13px] text-muted">
        1. Bu satırı sitenizin her sayfasına, kapanış <code>&lt;/body&gt;</code> etiketinden önce ekleyin. Sohbet asistanı açıksa sağ altta balon çıkar.
      </p>
      <CodeLine code={script} />
      <p className="m-0 text-[13px] text-muted">2. Talep formunun görüneceği yere bu kutuyu koyun. Gelen talepler kişi, fırsat ve ilk dönüş göreviyle düşer.</p>
      <CodeLine code="<div data-guru-form></div>" />
      <p className="m-0 text-[13px] text-muted">
        Aşağıya sitenizin adresini eklemeyi unutmayın: balon ve form yalnız oradan açılır.{" "}
        <a href={`/gomulu/onizleme?k=${encodeURIComponent(key)}`} target="_blank" rel="noopener noreferrer" className="text-accent">
          Deneme sayfasında önizleyin
        </a>
      </p>
    </section>
  );
}

type KResult = { ok: boolean; error?: string; pages?: number; added?: number; updated?: number; empty?: number; parts?: number };

/** Bilgi tabanını siteden ve belgeden doldurma */
function KnowledgeTools() {
  const [busy, setBusy] = useState<"" | "site" | "belge">("");
  const [msg, setMsg] = useState("");
  const crawl = async () => {
    setBusy("site");
    setMsg("Site taranıyor; birkaç dakika sürebilir…");
    const r = await fetch("/api/knowledge/site-tara", { method: "POST", credentials: "same-origin" }).catch(() => null);
    const j = (await r?.json().catch(() => null)) as KResult | null;
    setMsg(j?.ok ? `${j.pages} sayfa okundu: ${j.added} yeni, ${j.updated} güncellendi${j.empty ? `, ${j.empty} sayfada metin yoktu` : ""}.` : (j?.error ?? "Tarama yapılamadı."));
    setBusy("");
  };
  const upload = async (file: File) => {
    setBusy("belge");
    setMsg(`${file.name} okunuyor…`);
    const fd = new FormData();
    fd.append("file", file);
    const r = await fetch("/api/knowledge/belge", { method: "POST", credentials: "same-origin", body: fd }).catch(() => null);
    const j = (await r?.json().catch(() => null)) as KResult | null;
    setMsg(j?.ok ? `${file.name}: ${j.parts} bilgi kaydı eklendi.` : (j?.error ?? "Belge okunamadı."));
    setBusy("");
  };
  return (
    <section className="grid gap-2.5 rounded-[12px] border border-line bg-sunken p-4">
      <h3 className="m-0 text-[15px] font-semibold text-ink">Bilgi Tabanını Doldurun</h3>
      <p className="m-0 text-[13px] text-muted">Asistan yalnız bilgi tabanındakini bilir. Sitenizi tarayın ya da broşür, fiyat listesi gibi belgeleri yükleyin.</p>
      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" size="sm" variant="primary" onClick={crawl} disabled={Boolean(busy)}>
          {busy === "site" ? "Taranıyor…" : "Siteyi tara"}
        </Button>
        <label className={cn("inline-flex min-h-8 cursor-pointer items-center rounded-[9px] border border-line bg-surface px-2.5 text-[13px] font-medium text-ink hover:border-accent", busy && "pointer-events-none opacity-50")}>
          Belge yükle
          <input type="file" className="sr-only" accept=".pdf,.txt,.md,application/pdf,text/plain,text/markdown" disabled={Boolean(busy)} onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void upload(f);
            e.target.value = "";
          }} />
        </label>
        <Link href="/panel/kayitlar/knowledge" className="text-[13px] text-accent">
          Bilgi tabanını aç
        </Link>
      </div>
      <p className="m-0 text-[12px] text-muted">PDF, TXT ya da MD; en çok 4 MB.</p>
      {msg ? (
        <p className="m-0 text-[13px] text-ink" role="status">
          {msg}
        </p>
      ) : null}
    </section>
  );
}
