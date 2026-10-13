"use client";

import { useEffect, useRef, useState } from "react";
import { Dialog } from "radix-ui";
import { toast } from "sonner";
import { ImageUp, Search, X } from "lucide-react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { listMedia, type MediaPick } from "../content/actions";
import { uploadOne } from "./upload";

/** Medyadan görsel seçici: arama, son yüklenenler, yeni yükleme */
export function MediaPicker({ onClose, onPick, clientUpload }: { onClose: () => void; onPick: (m: MediaPick) => void; clientUpload: boolean }) {
  const [q, setQ] = useState("");
  const [items, setItems] = useState<MediaPick[] | null>(null);
  const [busy, setBusy] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => {
    let live = true;
    const t = setTimeout(() => void listMedia(q).then((r) => live && setItems(r)), q ? 250 : 0);
    return () => {
      live = false;
      clearTimeout(t);
    };
  }, [q]);

  const send = async (file: File) => {
    if (!file.type.startsWith("image/")) return void toast.error("Yalnız görsel dosyaları yüklenebilir.");
    setBusy(true);
    try {
      const id = await uploadOne(file, null, clientUpload);
      const fresh = await listMedia("");
      const m = fresh.find((x) => x.id === id);
      if (m) onPick(m);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Görsel yüklenemedi.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog.Root open onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[60] bg-overlay" />
        <Dialog.Content className="fixed inset-x-3 top-[6vh] z-[70] mx-auto flex max-h-[88vh] max-w-[760px] flex-col rounded-[14px] bg-surface shadow-pop focus:outline-none">
          <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
            <Dialog.Title className="m-0 text-[18px] font-semibold text-ink">Görsel seçin</Dialog.Title>
            <Dialog.Description className="sr-only">Medyadan bir görsel seçin ya da yenisini yükleyin</Dialog.Description>
            <Dialog.Close className="grid size-10 place-items-center rounded-[9px] text-muted hover:bg-sunken hover:text-ink" aria-label="Kapat">
              <X className="size-5" />
            </Dialog.Close>
          </div>
          <div className="flex flex-wrap items-center gap-2 px-4 pt-3">
            <label className="relative min-w-0 flex-1 basis-[220px]">
              <span className="sr-only">Görsel ara</span>
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Görsel ara" className="w-full pl-9" />
            </label>
            <input ref={input} type="file" accept="image/*" className="sr-only" tabIndex={-1} onChange={(e) => e.target.files?.[0] && void send(e.target.files[0])} />
            <Button type="button" onClick={() => input.current?.click()} disabled={busy}>
              <ImageUp />
              {busy ? "Yükleniyor" : "Yeni yükle"}
            </Button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto p-4">
            {items === null ? (
              <p className="m-0 text-[14px] text-muted">Görseller yükleniyor…</p>
            ) : items.length ? (
              <ul className="m-0 grid list-none grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-2 p-0">
                {items.map((m) => (
                  <li key={m.id}>
                    <button type="button" onClick={() => onPick(m)} className="block w-full overflow-hidden rounded-[10px] border border-line text-left hover:border-accent" title={m.alt}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={m.thumb} alt="" loading="lazy" className="block aspect-[4/3] w-full bg-sunken object-cover" />
                      <span className="block truncate px-2 py-1.5 text-[12px] text-ink">{m.alt}</span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="m-0 text-[14px] text-muted">Bu aramaya uyan görsel yok.</p>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

