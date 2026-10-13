"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { Copy, FolderPlus, ImageUp, Search, Trash2 } from "lucide-react";
import type { MediaUse } from "@/payload/media-usage";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Empty } from "../ui/card";
import { Fields, Sheet, SheetSection } from "../ui/sheet";
import { createFolder, deleteMedia, updateMedia } from "./actions";
import { uploadOne } from "./upload";
import { cn } from "@/lib/utils";

export type MediaItem = { id: number; alt: string; filename: string; thumb: string; width: number; height: number };
export type MediaDetail = { id: number; alt: string; filename: string; preview: string; url: string; size: number; width: number; height: number; created: string; folder: number | null; focalX: number | null; focalY: number | null; uses: MediaUse[] };
type Folder = { id: number; name: string };

const kb = (n: number) =>
  n >= 1024 * 1024 ? `${(n / 1024 / 1024).toLocaleString("tr-TR", { maximumFractionDigits: 1 })} MB` : n >= 1024 ? `${Math.round(n / 1024).toLocaleString("tr-TR")} KB` : `${n.toLocaleString("tr-TR")} bayt`;
function useParams() {
  const router = useRouter();
  const path = usePathname();
  const params = useSearchParams();
  return useCallback(
    (patch: Record<string, string | null>, replace = false) => {
      const next = new URLSearchParams(params.toString());
      for (const [k, v] of Object.entries(patch)) {
        if (v) next.set(k, v);
        else next.delete(k);
      }
      const url = `${path}${next.toString() ? `?${next}` : ""}`;
      if (replace) router.replace(url, { scroll: false });
      else router.push(url, { scroll: false });
    },
    [router, path, params],
  );
}

export function MediaView({ items, total, page, pages, q, folder, folders, selected, canDelete, clientUpload }: { items: MediaItem[]; total: number; page: number; pages: number; q: string; folder: number | "yok" | null; folders: Folder[]; selected: MediaDetail | null; canDelete: boolean; clientUpload: boolean }) {
  const set = useParams();
  const router = useRouter();
  const [term, setTerm] = useState(q);
  const [busy, setBusy] = useState<{ done: number; total: number } | null>(null);
  const [drag, setDrag] = useState(false);
  const [newFolder, setNewFolder] = useState<string | null>(null);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (term === q) return;
    const t = setTimeout(() => set({ q: term.trim() || null, sayfa: null }, true), 300);
    return () => clearTimeout(t);
  }, [term, q, set]);

  const send = async (list: FileList | File[]) => {
    const files = [...list].filter((f) => f.type.startsWith("image/"));
    if (!files.length) return void toast.error("Yalnız görsel dosyaları yüklenebilir.");
    const target = typeof folder === "number" ? folder : null;
    setBusy({ done: 0, total: files.length });
    let ok = 0;
    let last = 0;
    for (const f of files) {
      try {
        last = await uploadOne(f, target, clientUpload);
        ok++;
      } catch (e) {
        toast.error(`${f.name}: ${e instanceof Error ? e.message : "yüklenemedi"}`);
      }
      setBusy((b) => (b ? { ...b, done: b.done + 1 } : b));
    }
    setBusy(null);
    if (ok) {
      toast.success(ok === 1 ? "Görsel yüklendi. Alternatif metni kontrol edin." : `${ok} görsel yüklendi.`);
      if (ok === 1) set({ gorsel: String(last), sayfa: null });
      else router.refresh();
    }
  };

  const addFolder = async () => {
    const r = await createFolder(newFolder ?? "");
    if (!r.ok) return void toast.error(r.error);
    setNewFolder(null);
    toast.success("Klasör açıldı.");
    set({ klasor: String(r.id), sayfa: null });
  };

  const chip = (active: boolean) =>
    cn("inline-flex min-h-10 items-center rounded-full border px-3.5 text-[14px]", active ? "border-accent bg-accent-soft text-ink" : "border-line bg-surface text-muted hover:text-ink");

  return (
    <div
      onDragOver={(e) => {
        if (!e.dataTransfer.types.includes("Files")) return;
        e.preventDefault();
        setDrag(true);
      }}
      onDragLeave={(e) => {
        if (e.currentTarget === e.target) setDrag(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        setDrag(false);
        if (e.dataTransfer.files.length) void send(e.dataTransfer.files);
      }}
      className={cn("rounded-[14px]", drag && "outline-2 outline-dashed outline-accent outline-offset-4")}
    >
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <label className="relative min-w-0 flex-1 basis-[240px]">
          <span className="sr-only">Görsel ara</span>
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" />
          <Input value={term} onChange={(e) => setTerm(e.target.value)} placeholder="Açıklama ya da dosya adı" className="w-full pl-9" />
        </label>
        <input ref={input} type="file" accept="image/*" multiple className="sr-only" tabIndex={-1} onChange={(e) => e.target.files && void send(e.target.files).then(() => (e.target.value = ""))} />
        <Button variant="primary" onClick={() => input.current?.click()} disabled={Boolean(busy)}>
          <ImageUp />
          {busy ? `Yükleniyor ${busy.done}/${busy.total}` : "Görsel yükle"}
        </Button>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2" role="group" aria-label="Klasör">
        <button type="button" className={chip(folder === null)} onClick={() => set({ klasor: null, sayfa: null })}>
          Tümü
        </button>
        {folders.map((f) => (
          <button key={f.id} type="button" className={chip(folder === f.id)} onClick={() => set({ klasor: String(f.id), sayfa: null })}>
            {f.name}
          </button>
        ))}
        <button type="button" className={chip(folder === "yok")} onClick={() => set({ klasor: "yok", sayfa: null })}>
          Klasörsüz
        </button>
        {newFolder === null ? (
          <Button variant="ghost" onClick={() => setNewFolder("")}>
            <FolderPlus />
            Yeni klasör
          </Button>
        ) : (
          <form
            className="flex items-center gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              void addFolder();
            }}
          >
            <Input autoFocus value={newFolder} onChange={(e) => setNewFolder(e.target.value)} placeholder="Klasör adı" aria-label="Klasör adı" className="w-44" />
            <Button type="submit">Aç</Button>
            <Button type="button" variant="ghost" onClick={() => setNewFolder(null)}>
              Vazgeç
            </Button>
          </form>
        )}
      </div>

      {items.length ? (
        <ul className="m-0 grid list-none grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-3 p-0">
          {items.map((m) => (
            <li key={m.id} className="min-w-0">
              <button
                type="button"
                onClick={() => set({ gorsel: String(m.id) })}
                className={cn("group block w-full overflow-hidden rounded-[12px] border bg-surface text-left hover:border-accent", selected?.id === m.id ? "border-accent" : "border-line")}
              >
                <span className="block aspect-[4/3] bg-sunken">
                  {/* Küçük boy zaten üretilmiş; görüntü iyileştirici gereksiz */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {m.thumb ? <img src={m.thumb} alt="" loading="lazy" className="size-full object-cover" /> : null}
                </span>
                <span className="block px-2.5 py-2">
                  <span className="block truncate text-[13px] font-medium text-ink">{m.alt}</span>
                  <span className="tabular block truncate text-[12px] text-muted">{m.width && m.height ? `${m.width}×${m.height}` : m.filename}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <Empty>{q || folder ? "Bu aramaya uyan görsel yok." : "Henüz görsel yok. Dosyaları buraya sürükleyin ya da Görsel yükle'ye basın."}</Empty>
      )}

      {pages > 1 ? (
        <div className="mt-4 flex items-center justify-between gap-2 text-[14px] text-muted">
          <span className="tabular">
            {total.toLocaleString("tr-TR")} görsel · {page}/{pages}
          </span>
          <div className="flex gap-2">
            <Button disabled={page <= 1} onClick={() => set({ sayfa: page > 2 ? String(page - 1) : null })}>
              Önceki
            </Button>
            <Button disabled={page >= pages} onClick={() => set({ sayfa: String(page + 1) })}>
              Sonraki
            </Button>
          </div>
        </div>
      ) : null}

      {selected ? <MediaSheet key={selected.id} m={selected} folders={folders} canDelete={canDelete} onClose={() => set({ gorsel: null })} /> : null}
    </div>
  );
}

function MediaSheet({ m, folders, canDelete, onClose }: { m: MediaDetail; folders: Folder[]; canDelete: boolean; onClose: () => void }) {
  const router = useRouter();
  const [alt, setAlt] = useState(m.alt);
  const [folder, setFolder] = useState<number | null>(m.folder);
  const [focal, setFocal] = useState<{ x: number; y: number }>({ x: m.focalX ?? 50, y: m.focalY ?? 50 });
  const [confirm, setConfirm] = useState(false);
  const [pending, start] = useTransition();
  const dirty = alt.trim() !== m.alt || folder !== m.folder || focal.x !== (m.focalX ?? 50) || focal.y !== (m.focalY ?? 50);

  const save = () =>
    start(async () => {
      const r = await updateMedia(m.id, { alt, folder, focalX: focal.x, focalY: focal.y });
      if (!r.ok) return void toast.error(r.error);
      toast.success("Kaydedildi.");
      router.refresh();
    });
  const remove = () =>
    start(async () => {
      const r = await deleteMedia(m.id);
      if (!r.ok) {
        setConfirm(false);
        return void toast.error(r.error);
      }
      toast.success("Görsel silindi.");
      onClose();
      router.refresh();
    });

  return (
    <Sheet open onOpenChange={(o) => !o && onClose()} title={m.alt || "Görsel"} description={m.filename}>
      {m.preview ? (
        <div className="mt-4 grid gap-1.5">
          <div className="overflow-hidden rounded-[12px] border border-line bg-sunken">
            {/* Odak noktası: görsel kırpılınca bu nokta görünür kalır (sitede object-position) */}
            <button
              type="button"
              aria-label="Odak noktasını seçin"
              className="relative mx-auto block cursor-crosshair"
              onClick={(e) => {
                const b = e.currentTarget.getBoundingClientRect();
                setFocal({ x: Math.round(((e.clientX - b.left) / b.width) * 100), y: Math.round(((e.clientY - b.top) / b.height) * 100) });
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={m.preview} alt={m.alt} className="block max-h-[320px] w-auto max-w-full object-contain" />
              <span className="pointer-events-none absolute size-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-accent/60 shadow-[0_0_0_2px_rgb(0_0_0/0.35)]" style={{ left: `${focal.x}%`, top: `${focal.y}%` }} aria-hidden="true" />
            </button>
          </div>
          <p className="m-0 text-[12px] text-muted">{`Odak noktası: görselde tıkladığınız yer kırpılınca görünür kalır (${focal.x}%, ${focal.y}%).`}</p>
        </div>
      ) : null}

      <SheetSection title="Bilgiler">
        <Fields
          rows={[
            ["Ölçü", m.width && m.height ? <span className="tabular">{`${m.width}×${m.height} piksel`}</span> : ""],
            ["Boyut", m.size ? <span className="tabular">{kb(m.size)}</span> : ""],
            ["Eklenme", m.created],
            [
              "Adres",
              m.url ? (
                <button
                  type="button"
                  className="inline-flex min-h-8 items-center gap-1.5 text-accent hover:underline"
                  onClick={() => {
                    void navigator.clipboard.writeText(new URL(m.url, location.origin).toString()).then(() => toast.success("Adres kopyalandı."));
                  }}
                >
                  <Copy className="size-3.5" />
                  Adresi kopyala
                </button>
              ) : (
                ""
              ),
            ],
          ]}
        />
      </SheetSection>

      <SheetSection title="Düzenle">
        <form
          className="grid gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            save();
          }}
        >
          <label className="grid gap-1 text-[14px]">
            <span className="text-muted">Alternatif metin</span>
            <Input value={alt} onChange={(e) => setAlt(e.target.value)} maxLength={300} required />
            <span className="text-[12px] text-muted">Görseli göremeyen ziyaretçi ve arama motorları için kısa açıklama.</span>
          </label>
          <label className="grid gap-1 text-[14px]">
            <span className="text-muted">Klasör</span>
            <select value={folder ?? ""} onChange={(e) => setFolder(Number(e.target.value) || null)} className="min-h-10 rounded-[9px] border border-line bg-surface px-3 text-[14px] text-ink focus:border-accent focus:outline-none">
              <option value="">Klasörsüz</option>
              {folders.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
          </label>
          <div className="flex flex-wrap items-center gap-2">
            <Button type="submit" variant="primary" disabled={!dirty || pending}>
              Kaydet
            </Button>
            {focal.x !== 50 || focal.y !== 50 ? (
              <Button type="button" variant="ghost" onClick={() => setFocal({ x: 50, y: 50 })}>
                Odağı ortala
              </Button>
            ) : null}
          </div>
        </form>
      </SheetSection>

      <SheetSection title="Kullanıldığı Yerler">
        {m.uses.length ? (
          <ul className="m-0 grid list-none gap-1.5 p-0">
            {m.uses.map((u) => (
              <li key={`${u.href}-${u.label}`}>
                <Link href={u.href} prefetch={false} className="flex min-h-10 items-center justify-between gap-3 rounded-[9px] border border-line px-3 text-ink no-underline hover:border-accent">
                  <span className="min-w-0 truncate">{u.label}</span>
                  <Badge>{u.where}</Badge>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="m-0 text-[14px] text-muted">Sitede kullanılmıyor.</p>
        )}
      </SheetSection>

      {canDelete ? (
        <div className="mt-6 border-t border-line pt-4">
          {m.uses.length ? (
            <p className="m-0 text-[13px] text-muted">Kullanılan görsel silinemez; önce kullanıldığı yerlerden kaldırın.</p>
          ) : confirm ? (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[14px] text-ink">Görsel kalıcı olarak silinsin mi?</span>
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
              Görseli sil
            </Button>
          )}
        </div>
      ) : null}
    </Sheet>
  );
}
