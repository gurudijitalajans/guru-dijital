"use client";

import { useEffect, useState } from "react";
import { $getNodeByKey } from "lexical";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { ImageOff, Trash2 } from "lucide-react";
import { mediaThumbs, relationLabels, type Thumb } from "../actions";
import { useForm } from "../state";

/** Metnin içindeki görsel: küçük resim, açıklama ve kaldır düğmesi */
export function UploadView({ id, nodeKey }: { id: number; nodeKey: string }) {
  const { slug, readOnly } = useForm();
  const [editor] = useLexicalComposerContext();
  const [m, setM] = useState<Thumb | null>(null);
  useEffect(() => {
    let live = true;
    void mediaThumbs(slug, [id]).then((r) => live && setM(r[0] ?? null));
    return () => {
      live = false;
    };
  }, [slug, id]);
  return (
    <figure className="relative m-0 inline-flex max-w-full flex-col gap-1 rounded-[10px] border border-line bg-sunken p-2">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {m?.thumb ? <img src={m.thumb} alt={m.alt} className="max-h-60 max-w-full rounded-[6px] object-contain" /> : <ImageOff className="m-6 size-6 text-muted" />}
      <figcaption className="text-[12px] text-muted">{m?.alt ?? "Görsel"}</figcaption>
      {!readOnly ? (
        <button
          type="button"
          aria-label="Görseli metinden kaldır"
          onClick={() => editor.update(() => $getNodeByKey(nodeKey)?.remove())}
          className="absolute top-2 right-2 grid size-9 place-items-center rounded-full border border-line bg-surface text-muted hover:text-bad"
        >
          <Trash2 className="size-4" />
        </button>
      ) : null}
    </figure>
  );
}

/** Başka bir kayda bağlantı kartı (yalnız gösterilir; Payload'daki gibi korunur) */
export function RelationView({ relationTo, value }: { relationTo: string; value: unknown }) {
  const { slug } = useForm();
  const [label, setLabel] = useState<string | null>(null);
  useEffect(() => {
    let live = true;
    const id = Number(value);
    if (id) void relationLabels(slug, relationTo, [id]).then((r) => live && setLabel(r[0]?.label ?? null));
    return () => {
      live = false;
    };
  }, [slug, relationTo, value]);
  return <div className="my-2 inline-flex rounded-[9px] border border-line bg-sunken px-3 py-2 text-[14px] text-ink">{label ?? `${relationTo} #${String(value)}`}</div>;
}
