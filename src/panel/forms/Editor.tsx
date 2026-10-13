"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { ArrowLeft, ExternalLink, Monitor, PanelRightClose, PanelRightOpen, Smartphone, Tablet } from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { FieldList } from "./fields";
import { conditions, saveDoc } from "./actions";
import { editorHref } from "./entities";
import { FormCtx, getAt, setAt, type FormApi } from "./state";
import type { CField } from "./types";
import { cn } from "@/lib/utils";

const fmt = new Intl.DateTimeFormat("tr-TR", { timeZone: "Europe/Istanbul", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
const DEVICES = [
  { key: "masaustu", label: "Masaüstü", width: 0, icon: Monitor },
  { key: "tablet", label: "Tablet", width: 820, icon: Tablet },
  { key: "telefon", label: "Telefon", width: 390, icon: Smartphone },
] as const;

type Props = {
  slug: string;
  id: number | null;
  title: string;
  back: string;
  fields: CField[];
  initial: Record<string, unknown>;
  hidden: string[];
  operation: "create" | "update";
  drafts: boolean;
  published: boolean | null;
  canEdit: boolean;
  previewPath: string | null;
  clientUpload: boolean;
  updatedAt: string | null;
  /** Formda koşullu alan var mı (yoksa sunucuya sorulmaz) */
  conditional: boolean;
};

/**
 * Panelin içerik düzenleyicisi: solda form, sağda sitenin canlı önizlemesi.
 * Kaydedince önizleme kendini yeniler (sitedeki RefreshRouteOnSave). Taslaklı
 * içerikte "Taslak kaydet" yayındakini değiştirmez, "Yayınla" yayına alır.
 */
export function Editor(p: Props) {
  const router = useRouter();
  const [values, setValues] = useState<Record<string, unknown>>(p.initial);
  const [saved, setSaved] = useState(() => JSON.stringify(p.initial));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hidden, setHidden] = useState(() => new Set(p.hidden));
  const [updatedAt, setUpdatedAt] = useState(p.updatedAt);
  const [published, setPublished] = useState(p.published);
  const [preview, setPreview] = useState(Boolean(p.previewPath));
  const [device, setDevice] = useState<(typeof DEVICES)[number]["key"]>("masaustu");
  const [pending, start] = useTransition();
  const frame = useRef<HTMLIFrameElement>(null);
  const dirty = JSON.stringify(values) !== saved;

  const set = useCallback((path: string, v: unknown) => {
    setValues((s) => setAt(s, path, v));
    setErrors((e) => {
      if (!Object.keys(e).some((k) => k === path || k.startsWith(`${path}.`))) return e;
      return Object.fromEntries(Object.entries(e).filter(([k]) => k !== path && !k.startsWith(`${path}.`)));
    });
  }, []);

  /* Koşullu alanlar sunucuda Payload'un kuralıyla hesaplanır */
  const hasConditions = p.conditional;
  useEffect(() => {
    if (!hasConditions) return;
    const t = setTimeout(() => {
      void conditions(p.slug, values, p.operation).then((h) => setHidden(new Set(h)));
    }, 400);
    return () => clearTimeout(t);
  }, [values, p.slug, p.operation, hasConditions]);

  /* Kaydedilmemiş değişiklik varken sayfadan çıkış uyarısı */
  useEffect(() => {
    if (!dirty) return;
    const h = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [dirty]);

  const save = useCallback(
    (mode: "save" | "draft" | "publish") =>
      start(async () => {
        const r = await saveDoc(p.slug, p.id, values, mode);
        if (!r.ok) {
          setErrors(Object.fromEntries((r.errors ?? []).map((e) => [e.path, e.message])));
          toast.error(r.error);
          return;
        }
        setErrors({});
        setSaved(JSON.stringify(values));
        setUpdatedAt(r.updatedAt ?? new Date().toISOString());
        if (mode === "publish") setPublished(true);
        toast.success(mode === "draft" ? "Taslak kaydedildi; yayındaki sayfa değişmedi." : mode === "publish" ? "Yayınlandı." : "Kaydedildi; site güncellendi.");
        frame.current?.contentWindow?.postMessage({ type: "payload-document-event" }, window.location.origin);
        if (!p.id && r.id) router.replace(editorHref(p.slug, r.id));
        else router.refresh();
      }),
    [p.slug, p.id, values, router],
  );

  /* Cmd/Ctrl+S */
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        if (p.canEdit && !pending) save(p.drafts ? "draft" : "save");
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [save, p.canEdit, p.drafts, pending]);

  const api: FormApi = useMemo(
    () => ({ slug: p.slug, values, get: (path) => getAt(values, path), set, errors, hidden, readOnly: !p.canEdit, clientUpload: p.clientUpload }),
    [p.slug, values, set, errors, hidden, p.canEdit, p.clientUpload],
  );
  const main = p.fields.filter((f) => !f.sidebar);
  const side = p.fields.filter((f) => f.sidebar);
  const width = DEVICES.find((d) => d.key === device)!.width;
  const errorCount = Object.keys(errors).length;

  return (
    <FormCtx.Provider value={api}>
      <div className="sticky top-0 z-20 -mx-4 -mt-5 mb-4 flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-line bg-bg/95 px-4 py-3 backdrop-blur lg:-mx-7 lg:-mt-6 lg:px-7">
        <Button asChild variant="ghost" size="icon">
          <Link href={p.back} aria-label="Geri">
            <ArrowLeft />
          </Link>
        </Button>
        <div className="min-w-0 flex-1">
          <h1 className="m-0 truncate text-[20px] font-semibold text-ink">{p.title}</h1>
          <div className="flex flex-wrap items-center gap-2 text-[12px] text-muted">
            {p.drafts ? <Badge tone={published ? "good" : "plain"} dot>{published ? "Yayında" : "Taslak"}</Badge> : null}
            {dirty ? <span className="text-warn">Kaydedilmemiş değişiklik</span> : updatedAt ? <span>Son kayıt {fmt.format(new Date(updatedAt))}</span> : null}
            {errorCount ? <span className="text-bad">{`${errorCount} alanda hata`}</span> : null}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {p.previewPath ? (
            <Button type="button" variant="ghost" onClick={() => setPreview((v) => !v)} aria-pressed={preview} className="max-xl:hidden">
              {preview ? <PanelRightClose /> : <PanelRightOpen />}
              Önizleme
            </Button>
          ) : null}
          {p.previewPath ? (
            <Button asChild variant="ghost" size="icon">
              <a href={`/onizleme?yol=${encodeURIComponent(p.previewPath)}`} target="_blank" rel="noreferrer" aria-label="Sitede yeni sekmede aç">
                <ExternalLink />
              </a>
            </Button>
          ) : null}
          {p.canEdit ? (
            p.drafts ? (
              <>
                <Button type="button" onClick={() => save("draft")} disabled={pending}>
                  Taslak kaydet
                </Button>
                <Button type="button" variant="primary" onClick={() => save("publish")} disabled={pending}>
                  {published ? "Değişiklikleri yayınla" : "Yayınla"}
                </Button>
              </>
            ) : (
              <Button type="button" variant="primary" onClick={() => save("save")} disabled={pending || !dirty}>
                Kaydet
              </Button>
            )
          ) : (
            <Badge>Yalnız görüntüleme</Badge>
          )}
        </div>
      </div>

      <div className={cn("grid gap-6", preview && p.previewPath && "xl:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]")}>
        <form
          className="grid min-w-0 content-start gap-5"
          onSubmit={(e) => {
            e.preventDefault();
            save(p.drafts ? "draft" : "save");
          }}
        >
          {side.length ? (
            <section className="grid gap-4 rounded-[14px] border border-line bg-surface p-4">
              <h2 className="m-0 text-[12px] font-semibold uppercase tracking-[0.07em] text-muted">Ayarlar</h2>
              <FieldList fields={side} />
            </section>
          ) : null}
          <section className="min-w-0 rounded-[14px] border border-line bg-surface p-4 sm:p-5">
            <FieldList fields={main} />
          </section>
        </form>

        {preview && p.previewPath ? (
          <aside className="sticky top-[84px] hidden h-[calc(100dvh-110px)] min-w-0 flex-col overflow-hidden rounded-[14px] border border-line bg-sunken xl:flex" aria-label="Canlı önizleme">
            <div className="flex items-center justify-between gap-2 border-b border-line bg-surface px-3 py-2">
              <span className="truncate text-[13px] text-muted">{p.drafts ? "Önizleme: taslak kaydedince yenilenir" : "Önizleme: kaydedince yenilenir"}</span>
              <div className="flex gap-1" role="group" aria-label="Ekran genişliği">
                {DEVICES.map((d) => (
                  <Button key={d.key} type="button" size="icon" variant={device === d.key ? "secondary" : "ghost"} aria-label={d.label} aria-pressed={device === d.key} onClick={() => setDevice(d.key)} className="size-9">
                    <d.icon />
                  </Button>
                ))}
              </div>
            </div>
            <div className="min-h-0 flex-1 overflow-auto">
              <iframe ref={frame} title="Sitenin önizlemesi" src={`/onizleme?yol=${encodeURIComponent(p.previewPath)}`} className="mx-auto block h-full border-0 bg-white" style={{ width: width ? `${width}px` : "100%" }} />
            </div>
          </aside>
        ) : null}
      </div>
    </FormCtx.Provider>
  );
}
