"use client";

import { useEffect, useState } from "react";
import { useField } from "@payloadcms/ui";

/**
 * Bir metin alanının hemen altında: sitede nasıl görüneceğinin önizlemesi ve
 * yazım kuralı yerine düğmeler.
 * - mode "accent": "Seçili kelimeyi kalın yap" (alanda *kelime* olarak saklanır)
 * - mode "count": "Sayıyı ekle" ({sayı} yer tutucusu; önizlemede gerçek sayı)
 * Veri tutmaz (ui alanı); hedef alanı yolu ile okur ve yazar.
 */
type Props = { target: string; mode: "accent" | "count"; source?: "references" | "services"; words?: boolean };

const TR_COUNT = ["sıfır", "bir", "iki", "üç", "dört", "beş", "altı", "yedi", "sekiz", "dokuz", "on"];
const inputId = (path: string) => `field-${path.replace(/\./g, "__")}`;

export function TextHelper({ target, mode, source, words }: Props) {
  const { value, setValue } = useField<string>({ path: target });
  const [count, setCount] = useState<number | null>(null);
  const text = value ?? "";

  useEffect(() => {
    if (mode !== "count" || !source) return;
    let alive = true;
    fetch(`/api/${source}?limit=1&depth=0`, { credentials: "same-origin" })
      .then((r) => (r.ok ? r.json() : null))
      .then((j: { totalDocs?: number } | null) => {
        if (alive && typeof j?.totalDocs === "number") setCount(j.totalDocs);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [mode, source]);

  const selection = () => {
    const el = document.getElementById(inputId(target)) as HTMLInputElement | HTMLTextAreaElement | null;
    return { el, start: el?.selectionStart ?? text.length, end: el?.selectionEnd ?? text.length };
  };

  const makeBold = () => {
    const { el, start, end } = selection();
    let s = start;
    let e = end;
    /* Seçim yoksa imlecin bulunduğu kelime */
    if (s === e) {
      while (s > 0 && !/\s/.test(text[s - 1])) s--;
      while (e < text.length && !/\s/.test(text[e])) e++;
    }
    const plain = text.replace(/\*/g, "");
    const offset = (i: number) => text.slice(0, i).split("*").length - 1;
    const ps = s - offset(s);
    const pe = e - offset(e);
    if (pe <= ps) return;
    /* Tek kalın bölüm: öncekiler kaldırılır */
    setValue(`${plain.slice(0, ps)}*${plain.slice(ps, pe)}*${plain.slice(pe)}`);
    el?.focus();
  };

  const insertCount = () => {
    const { el, start, end } = selection();
    setValue(`${text.slice(0, start)}{sayı}${text.slice(end)}`);
    el?.focus();
  };

  const shownCount = count === null ? "…" : words ? (TR_COUNT[count] ?? String(count)) : String(count);
  const preview =
    mode === "accent"
      ? text.split(/(\*[^*]+\*)/g).filter(Boolean).map((part, i) =>
          part.startsWith("*") && part.endsWith("*") ? <b key={i}>{part.slice(1, -1)}</b> : <span key={i}>{part}</span>
        )
      : text.split("{sayı}").flatMap((part, i, all) => (i < all.length - 1 ? [<span key={i}>{part}</span>, <b key={`n${i}`}>{shownCount}</b>] : [<span key={i}>{part}</span>]));

  return (
    <div className="guru-helper">
      <div className="guru-helper__actions">
        {mode === "accent" ? (
          <>
            <button type="button" onClick={makeBold}>
              Seçili kelimeyi kalın yap
            </button>
            {text.includes("*") && (
              <button type="button" onClick={() => setValue(text.replace(/\*/g, ""))}>
                Kalınlığı kaldır
              </button>
            )}
          </>
        ) : (
          <button type="button" onClick={insertCount}>
            {source === "services" ? "Hizmet sayısını ekle" : "Referans sayısını ekle"}
          </button>
        )}
      </div>
      {text && (
        <p className="guru-helper__preview">
          <span>Sitede:</span> {preview}
        </p>
      )}
    </div>
  );
}
