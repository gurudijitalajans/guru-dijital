"use client";

import Link from "next/link";
import { useRef, useState } from "react";

/** Chatbot ayarlarının yanında: bilgi tabanını siteden ve belgeden doldurma */
type Result = { ok: boolean; error?: string; pages?: number; added?: number; updated?: number; empty?: number; parts?: number; chars?: number };

export function KnowledgeTools() {
  const [busy, setBusy] = useState<"" | "site" | "belge">("");
  const [msg, setMsg] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const crawl = async () => {
    setBusy("site");
    setMsg("Site taranıyor; birkaç dakika sürebilir…");
    const r = await fetch("/api/knowledge/site-tara", { method: "POST", credentials: "same-origin" }).catch(() => null);
    const j = (await r?.json().catch(() => null)) as Result | null;
    setMsg(j?.ok ? `${j.pages} sayfa okundu: ${j.added} yeni, ${j.updated} güncellendi${j.empty ? `, ${j.empty} sayfada metin yoktu` : ""}.` : (j?.error ?? "Tarama yapılamadı."));
    setBusy("");
  };
  const upload = async (file: File) => {
    setBusy("belge");
    setMsg(`${file.name} okunuyor…`);
    const fd = new FormData();
    fd.append("file", file);
    const r = await fetch("/api/knowledge/belge", { method: "POST", credentials: "same-origin", body: fd }).catch(() => null);
    const j = (await r?.json().catch(() => null)) as Result | null;
    setMsg(j?.ok ? `${file.name}: ${j.parts} bilgi kaydı eklendi.` : (j?.error ?? "Belge okunamadı."));
    setBusy("");
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div className="guru-quote guru-ops__deal">
      <p className="guru-ops__deal-title">Bilgi tabanını doldurun</p>
      <p className="guru-crm__hint">Asistan yalnız bilgi tabanındakini bilir. Sitenizi tarayın ya da broşür, fiyat listesi gibi belgeleri yükleyin.</p>
      <button type="button" className="guru-crm__save" onClick={crawl} disabled={Boolean(busy)}>
        {busy === "site" ? "Taranıyor…" : "Siteyi tara"}
      </button>
      <label className="guru-crm__due">
        <span>Belge yükle (PDF, TXT, MD; en çok 4 MB)</span>
        <input ref={fileRef} type="file" accept=".pdf,.txt,.md,application/pdf,text/plain,text/markdown" disabled={Boolean(busy)} onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
      </label>
      {msg ? (
        <p className="guru-crm__hint" role="status">
          {msg}
        </p>
      ) : null}
      <Link href="/admin/collections/knowledge">Bilgi tabanını aç</Link>
    </div>
  );
}
