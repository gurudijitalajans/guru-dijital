"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { createContext, useCallback, useContext, useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { ArrowUpRight, ExternalLink, ImageOff, Plus, Search, Trash2, X } from "lucide-react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Badge, type Tone } from "../ui/badge";
import { Card, Empty } from "../ui/card";
import { Sheet } from "../ui/sheet";
import { MediaPicker } from "../media/MediaPicker";
import { deleteItem, saveItem, setPublished } from "./actions";
import { PUBLISHABLE, SIMPLE, type FieldDef, type PublishKey, type SimpleKey, type Stat } from "./kinds";
import { cn } from "@/lib/utils";

export type PageCard = { title: string; detail: string; updated: string; edit: string; view: string | null };
export type PublishRow = { id: number; title: string; status: "yayinda" | "degisiklik" | "taslak"; updated: string; order: number | null; view: string | null; edit: string };
export type SimpleRow = { id: number; values: Record<string, unknown>; thumb: string };
type MediaValue = { id: number; alt: string; thumb: string } | null;

const STATUS: Record<PublishRow["status"], { label: string; tone: Tone }> = {
  yayinda: { label: "Yayında", tone: "good" },
  degisiklik: { label: "Yayında, yayınlanmamış değişiklik var", tone: "warn" },
  taslak: { label: "Taslak", tone: "plain" },
};

/** Canlıda görseller tarayıcıdan doğrudan Blob'a yüklenir */
const ClientUpload = createContext(false);

function useParams() {
  const router = useRouter();
  const path = usePathname();
  const params = useSearchParams();
  return useCallback(
    (patch: Record<string, string | null>) => {
      const next = new URLSearchParams(params.toString());
      for (const [k, v] of Object.entries(patch)) {
        if (v) next.set(k, v);
        else next.delete(k);
      }
      router.push(`${path}${next.toString() ? `?${next}` : ""}`, { scroll: false });
    },
    [router, path, params],
  );
}

const TAB_LABELS: [string, string][] = [["sayfalar", "Sayfalar"], ...Object.entries(PUBLISHABLE).map(([k, v]) => [k, v.label] as [string, string]), ...Object.entries(SIMPLE).map(([k, v]) => [k, v.label] as [string, string])];

export function ContentView({ tab, counts, pages, publish, simple, open, canDelete, clientUpload }: { tab: string; counts: Record<string, number>; pages: PageCard[]; publish: PublishRow[]; simple: SimpleRow[]; open: string | null; canDelete: boolean; clientUpload: boolean }) {
  const set = useParams();
  return (
    <ClientUpload.Provider value={clientUpload}>
      <nav aria-label="İçerik türü" className="mb-4 flex flex-wrap gap-2">
        {TAB_LABELS.map(([k, label]) => (
          <button
            key={k}
            type="button"
            aria-current={tab === k ? "page" : undefined}
            onClick={() => set({ tur: k === "sayfalar" ? null : k, kayit: null })}
            className={cn("inline-flex min-h-10 items-center gap-1.5 rounded-full border px-3.5 text-[14px]", tab === k ? "border-accent bg-accent-soft text-ink" : "border-line bg-surface text-muted hover:text-ink")}
          >
            {label}
            {k in counts ? <span className="tabular text-[12px] text-muted">{counts[k]}</span> : null}
          </button>
        ))}
      </nav>
      {tab === "sayfalar" ? <Pages pages={pages} /> : tab in PUBLISHABLE ? <PublishList kind={tab as PublishKey} rows={publish} /> : <SimpleList kind={tab as SimpleKey} rows={simple} open={open} canDelete={canDelete} />}
    </ClientUpload.Provider>
  );
}

function EditLink({ href, children = "Düzenle" }: { href: string; children?: React.ReactNode }) {
  /* İçerik ekranında açılanlar ok işaretli; panelin kendi düzenleyicisi işaretsiz */
  const outside = href.startsWith("/admin");
  return (
    <Button asChild size="sm">
      <Link href={href} prefetch={false} title={outside ? "İçerik ekranında açılır" : undefined}>
        {children}
        {outside ? <ArrowUpRight /> : null}
      </Link>
    </Button>
  );
}

function Pages({ pages }: { pages: PageCard[] }) {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-3">
      {pages.map((p) => (
        <Card key={p.title} className="flex flex-col gap-3 p-4">
          <div className="min-w-0">
            <h2 className="m-0 text-[16px] font-semibold text-ink">{p.title}</h2>
            <p className="mt-1 mb-0 text-[14px] text-muted">{p.detail}</p>
            {p.updated ? <p className="mt-2 mb-0 text-[12px] text-muted">Son kayıt: {p.updated}</p> : null}
          </div>
          <div className="mt-auto flex flex-wrap gap-2">
            <EditLink href={p.edit} />
            {p.view ? (
              <Button asChild size="sm" variant="ghost">
                <a href={p.view} target="_blank" rel="noreferrer">
                  Sitede gör
                  <ExternalLink />
                </a>
              </Button>
            ) : null}
          </div>
        </Card>
      ))}
    </div>
  );
}

function SearchBox({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <label className="relative min-w-0 flex-1 basis-[220px]">
      <span className="sr-only">{placeholder}</span>
      <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" />
      <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full pl-9" />
    </label>
  );
}

const match = (q: string, ...parts: unknown[]) => {
  const t = q.trim().toLocaleLowerCase("tr-TR");
  return !t || parts.map((p) => String(p ?? "")).join(" ").toLocaleLowerCase("tr-TR").includes(t);
};

function PublishList({ kind, rows }: { kind: PublishKey; rows: PublishRow[] }) {
  const k = PUBLISHABLE[kind];
  const router = useRouter();
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState<number | null>(null);
  const [, start] = useTransition();
  const shown = rows.filter((r) => match(q, r.title));

  const toggle = (r: PublishRow, publish: boolean) => {
    setBusy(r.id);
    start(async () => {
      const res = await setPublished(kind, r.id, publish);
      setBusy(null);
      if (!res.ok) return void toast.error(res.error);
      toast.success(publish ? "Yayına alındı." : "Yayından kaldırıldı; sitede görünmüyor.");
      router.refresh();
    });
  };

  return (
    <>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <SearchBox value={q} onChange={setQ} placeholder={`${k.singular} ara`} />
        <Button asChild variant="primary">
          <Link href={`/admin/collections/${k.collection}/create`} prefetch={false}>
            <Plus />
            {`Yeni ${k.singular.toLocaleLowerCase("tr-TR")}`}
          </Link>
        </Button>
      </div>
      {shown.length ? (
        <ul className="m-0 grid list-none gap-2 p-0">
          {shown.map((r) => (
            <li key={r.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-[12px] border border-line bg-surface px-4 py-3">
              <div className="min-w-0 flex-1 basis-[240px]">
                <div className="truncate font-medium text-ink">{r.title}</div>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-[12px] text-muted">
                  <Badge tone={STATUS[r.status].tone} dot>
                    {STATUS[r.status].label}
                  </Badge>
                  <span>Son kayıt {r.updated}</span>
                  {r.order !== null ? <span className="tabular">Sıra {r.order}</span> : null}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {r.status === "taslak" ? (
                  <Button size="sm" variant="primary" disabled={busy === r.id} onClick={() => toggle(r, true)}>
                    Yayınla
                  </Button>
                ) : (
                  <>
                    {r.status === "degisiklik" ? (
                      <Button size="sm" variant="primary" disabled={busy === r.id} onClick={() => toggle(r, true)}>
                        Değişiklikleri yayınla
                      </Button>
                    ) : null}
                    <Button size="sm" disabled={busy === r.id} onClick={() => toggle(r, false)}>
                      Yayından kaldır
                    </Button>
                  </>
                )}
                <EditLink href={r.edit} />
                {r.view ? (
                  <Button asChild size="sm" variant="ghost">
                    <a href={r.view} target="_blank" rel="noreferrer" aria-label={`${r.title}: sitede gör`}>
                      <ExternalLink />
                    </a>
                  </Button>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <Empty>{q ? "Bu aramaya uyan kayıt yok." : `Henüz ${k.label.toLocaleLowerCase("tr-TR")} yok.`}</Empty>
      )}
    </>
  );
}

function SimpleList({ kind, rows, open, canDelete }: { kind: SimpleKey; rows: SimpleRow[]; open: string | null; canDelete: boolean }) {
  const k = SIMPLE[kind];
  const set = useParams();
  const [q, setQ] = useState("");
  const shown = rows.filter((r) => match(q, r.values[k.titleField], k.subField ? r.values[k.subField] : ""));
  const selected = open === "yeni" ? null : rows.find((r) => String(r.id) === open);
  const flag = k.flag;

  return (
    <>
      {k.note ? <p className="mt-0 mb-3 text-[14px] text-muted">{k.note}</p> : null}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <SearchBox value={q} onChange={setQ} placeholder={`${k.singular} ara`} />
        <Button variant="primary" onClick={() => set({ kayit: "yeni" })}>
          <Plus />
          {`Yeni ${k.singular.toLocaleLowerCase("tr-TR")}`}
        </Button>
      </div>
      {shown.length ? (
        <ul className="m-0 grid list-none grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-2 p-0">
          {shown.map((r) => (
            <li key={r.id} className="min-w-0">
              <button
                type="button"
                onClick={() => set({ kayit: String(r.id) })}
                className={cn("flex min-h-16 w-full items-center gap-3 rounded-[12px] border bg-surface p-2.5 text-left hover:border-accent", open === String(r.id) ? "border-accent" : "border-line")}
              >
                {k.media ? (
                  <span className="grid size-12 shrink-0 place-items-center overflow-hidden rounded-[9px] bg-sunken text-[12px] text-muted">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {r.thumb ? <img src={r.thumb} alt="" loading="lazy" className="size-full object-cover" /> : <ImageOff className="size-5" aria-label="Görsel yok" />}
                  </span>
                ) : null}
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium text-ink">{String(r.values[k.titleField] ?? "Adsız")}</span>
                  {k.subField && r.values[k.subField] ? <span className="block truncate text-[13px] text-muted">{String(r.values[k.subField])}</span> : null}
                  {flag ? (
                    <span className="mt-1 block">
                      <Badge tone={r.values[flag.field] ? "good" : "plain"}>{r.values[flag.field] ? flag.on : flag.off}</Badge>
                    </span>
                  ) : null}
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <Empty>{q ? "Bu aramaya uyan kayıt yok." : `Henüz kayıt yok. ${k.singular} eklemek için Yeni'ye basın.`}</Empty>
      )}
      {open && (open === "yeni" || selected) ? <SimpleSheet key={open} kind={kind} row={selected ?? null} canDelete={canDelete} onClose={() => set({ kayit: null })} /> : null}
    </>
  );
}

const initial = (fields: FieldDef[], row: SimpleRow | null) =>
  Object.fromEntries(fields.map((f) => [f.name, row ? row.values[f.name] : f.type === "checkbox" ? (f.defaultValue ?? false) : f.type === "stats" ? [] : f.type === "number" ? 10 : f.type === "media" ? null : ""]));

function SimpleSheet({ kind, row, canDelete, onClose }: { kind: SimpleKey; row: SimpleRow | null; canDelete: boolean; onClose: () => void }) {
  const k = SIMPLE[kind];
  const router = useRouter();
  const set = useParams();
  const [values, setValues] = useState<Record<string, unknown>>(() => initial(k.fields, row));
  const [confirm, setConfirm] = useState(false);
  const [pending, start] = useTransition();
  const put = (name: string, v: unknown) => setValues((s) => ({ ...s, [name]: v }));

  const save = () =>
    start(async () => {
      const data = Object.fromEntries(Object.entries(values).map(([n, v]) => [n, v && typeof v === "object" && !Array.isArray(v) && "id" in v ? (v as { id: number }).id : v]));
      const r = await saveItem(kind, row?.id ?? null, data);
      if (!r.ok) return void toast.error(r.error);
      toast.success(row ? "Kaydedildi; site birkaç saniye içinde güncellenir." : `${k.singular} eklendi.`);
      if (!row && r.id) set({ kayit: String(r.id) });
      router.refresh();
    });
  const remove = () =>
    start(async () => {
      const r = await deleteItem(kind, row!.id);
      if (!r.ok) {
        setConfirm(false);
        return void toast.error(r.error);
      }
      toast.success("Silindi.");
      onClose();
      router.refresh();
    });

  return (
    <Sheet open onOpenChange={(o) => !o && onClose()} title={row ? String(row.values[k.titleField] ?? k.singular) : `Yeni ${k.singular.toLocaleLowerCase("tr-TR")}`} description={k.label}>
      <form
        className="mt-4 grid gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          save();
        }}
      >
        {k.fields.map((f) => (
          <FieldInput key={f.name} f={f} value={values[f.name]} onChange={(v) => put(f.name, v)} />
        ))}
        <div className="flex flex-wrap gap-2">
          <Button type="submit" variant="primary" disabled={pending}>
            {row ? "Kaydet" : "Ekle"}
          </Button>
          <Button type="button" variant="ghost" onClick={onClose}>
            Vazgeç
          </Button>
        </div>
      </form>
      {row && canDelete ? (
        <div className="mt-6 border-t border-line pt-4">
          {confirm ? (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[14px] text-ink">Kayıt kalıcı olarak silinsin mi?</span>
              <Button variant="danger" onClick={remove} disabled={pending}>
                Evet, sil
              </Button>
              <Button variant="ghost" onClick={() => setConfirm(false)}>
                Vazgeç
              </Button>
            </div>
          ) : (
            <Button variant="danger" onClick={() => setConfirm(true)}>
              <Trash2 />
              Sil
            </Button>
          )}
        </div>
      ) : null}
    </Sheet>
  );
}

const labelCls = "grid gap-1 text-[14px]";
const hintCls = "text-[12px] text-muted";

function FieldInput({ f, value, onChange }: { f: FieldDef; value: unknown; onChange: (v: unknown) => void }) {
  if (f.type === "checkbox")
    return (
      <label className="flex min-h-10 items-start gap-2.5 text-[14px]">
        <input type="checkbox" checked={Boolean(value)} onChange={(e) => onChange(e.target.checked)} className="mt-0.5 size-5 accent-[var(--accent)]" />
        <span>
          <span className="text-ink">{f.label}</span>
          {f.hint ? <span className={cn("block", hintCls)}>{f.hint}</span> : null}
        </span>
      </label>
    );
  if (f.type === "media") return <MediaField label={f.label} hint={f.hint} value={value as MediaValue} onChange={onChange} />;
  if (f.type === "stats") return <StatsField label={f.label} hint={f.hint} value={(value as Stat[]) ?? []} onChange={onChange} />;
  const required = "required" in f && f.required;
  return (
    <label className={labelCls}>
      <span className="text-muted">
        {f.label}
        {required ? <span aria-hidden="true"> *</span> : null}
      </span>
      {f.type === "textarea" ? (
        <>
          <textarea
            value={String(value ?? "")}
            onChange={(e) => onChange(e.target.value)}
            maxLength={f.max}
            required={required}
            rows={4}
            className="min-h-24 rounded-[9px] border border-line bg-surface px-3 py-2 text-[14px] text-ink focus:border-accent focus:outline-none"
          />
          {f.max ? <span className={cn(hintCls, "tabular text-right")}>{`${String(value ?? "").length}/${f.max}`}</span> : null}
        </>
      ) : (
        <Input
          type={f.type === "number" ? "number" : "text"}
          inputMode={f.type === "number" ? "numeric" : undefined}
          value={value === null || value === undefined ? "" : String(value)}
          onChange={(e) => onChange(e.target.value)}
          maxLength={f.type === "text" ? f.max : undefined}
          placeholder={f.type === "text" ? f.placeholder : undefined}
          required={required}
        />
      )}
      {f.hint ? <span className={hintCls}>{f.hint}</span> : null}
    </label>
  );
}

function MediaField({ label, hint, value, onChange }: { label: string; hint?: string; value: MediaValue; onChange: (v: MediaValue) => void }) {
  const [open, setOpen] = useState(false);
  const clientUpload = useContext(ClientUpload);
  return (
    <div className={labelCls}>
      <span className="text-muted">{label}</span>
      <div className="flex items-center gap-3">
        <span className="grid size-20 shrink-0 place-items-center overflow-hidden rounded-[10px] border border-line bg-sunken text-[12px] text-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {value?.thumb ? <img src={value.thumb} alt={value.alt} className="size-full object-cover" /> : "Görsel yok"}
        </span>
        <div className="flex flex-wrap gap-2">
          <Button type="button" size="sm" onClick={() => setOpen(true)}>
            {value ? "Değiştir" : "Görsel seç"}
          </Button>
          {value ? (
            <Button type="button" size="sm" variant="ghost" onClick={() => onChange(null)}>
              Kaldır
            </Button>
          ) : null}
        </div>
      </div>
      {hint ? <span className={hintCls}>{hint}</span> : null}
      {open ? (
        <MediaPicker
          clientUpload={clientUpload}
          onClose={() => setOpen(false)}
          onPick={(m) => {
            onChange(m);
            setOpen(false);
          }}
        />
      ) : null}
    </div>
  );
}

function StatsField({ label, hint, value, onChange }: { label: string; hint?: string; value: Stat[]; onChange: (v: Stat[]) => void }) {
  const rows = useMemo(() => value ?? [], [value]);
  const edit = (i: number, patch: Partial<Stat>) => onChange(rows.map((r, j) => (j === i ? { ...r, ...patch } : r)));
  return (
    <fieldset className="m-0 grid gap-2 border-0 p-0">
      <legend className="mb-1 p-0 text-[14px] text-muted">{label}</legend>
      {rows.map((r, i) => (
        <div key={i} className="grid gap-2 rounded-[10px] border border-line p-2.5">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2">
            <Input value={r.label ?? ""} onChange={(e) => edit(i, { label: e.target.value })} placeholder="Etiket (ör. Randevu artışı)" aria-label={`Sonuç ${i + 1} etiketi`} />
            <Button type="button" variant="ghost" size="icon" aria-label={`Sonuç ${i + 1} sil`} onClick={() => onChange(rows.filter((_, j) => j !== i))}>
              <X />
            </Button>
          </div>
          <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,2fr)_minmax(0,1fr)] gap-2">
            <Input value={r.prefix ?? ""} onChange={(e) => edit(i, { prefix: e.target.value })} placeholder="Ön ek" aria-label={`Sonuç ${i + 1} ön ek`} />
            <Input type="number" inputMode="decimal" value={Number.isFinite(r.value) ? String(r.value) : ""} onChange={(e) => edit(i, { value: Number(e.target.value) })} placeholder="Değer" aria-label={`Sonuç ${i + 1} değer`} />
            <Input value={r.suffix ?? ""} onChange={(e) => edit(i, { suffix: e.target.value })} placeholder="Ek (%)" aria-label={`Sonuç ${i + 1} ek`} />
          </div>
          <label className="flex min-h-8 items-center gap-2 text-[13px] text-ink">
            <input type="checkbox" checked={Boolean(r.featured)} onChange={(e) => edit(i, { featured: e.target.checked })} className="size-4 accent-[var(--accent)]" />
            Kartta göster
          </label>
        </div>
      ))}
      {rows.length < 8 ? (
        <Button type="button" size="sm" className="justify-self-start" onClick={() => onChange([...rows, { label: "", value: 0 }])}>
          <Plus />
          Sonuç ekle
        </Button>
      ) : null}
      {hint ? <span className={hintCls}>{hint}</span> : null}
    </fieldset>
  );
}
