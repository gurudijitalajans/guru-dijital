"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

/**
 * Dosya tarayıcıda okunur (CSV ya da XLSX), ilk satır başlık sayılır ve
 * sütunlar Türkçe/İngilizce başlıklardan kendiliğinden eşleşir. Satırlar
 * /api/contacts/ice-aktar ucuna gider: önce önizleme (dryRun), sonra aktarma.
 */
type Field = "name" | "email" | "phone" | "title" | "company" | "notes" | "tags" | "dealTitle" | "dealValue" | "dealStage" | "expectedClose" | "service";
const FIELDS: { key: Field; label: string; words: string[] }[] = [
  { key: "name", label: "Ad Soyad", words: ["ad soyad", "adı soyadı", "ad", "adı", "isim", "kişi", "ilgili kişi", "yetkili", "müşteri", "müşteri adı", "name", "full name", "contact"] },
  { key: "email", label: "E-posta", words: ["e-posta", "eposta", "e posta", "email", "e-mail", "mail"] },
  { key: "phone", label: "Telefon", words: ["telefon", "tel", "gsm", "cep", "cep telefonu", "phone", "mobile"] },
  { key: "title", label: "Görevi", words: ["görevi", "görev", "unvan", "ünvan", "pozisyon", "title", "job title"] },
  { key: "company", label: "Firma", words: ["firma", "şirket", "kurum", "firma adı", "company", "organization"] },
  { key: "notes", label: "Notlar", words: ["not", "notlar", "açıklama", "notes", "note"] },
  { key: "tags", label: "Etiketler", words: ["etiket", "etiketler", "tags", "tag"] },
  { key: "dealTitle", label: "Fırsat adı", words: ["fırsat", "fırsat adı", "iş", "deal", "deal name", "opportunity"] },
  { key: "dealValue", label: "Fırsat tutarı", words: ["tutar", "değer", "bütçe", "fiyat", "value", "amount"] },
  { key: "dealStage", label: "Fırsat aşaması", words: ["aşama", "durum", "stage", "status"] },
  { key: "expectedClose", label: "Tahmini kapanış", words: ["kapanış", "tahmini kapanış", "kapanış tarihi", "close date"] },
  { key: "service", label: "Hizmet / ürün", words: ["hizmet", "ürün", "service", "product"] },
];
/* Excel'in "CSV UTF-8" çıktısındaki BOM ilk başlığa yapışır */
const norm = (v: string) => v.replace(/^\uFEFF/, "").toLocaleLowerCase("tr-TR").replace(/[_]+/g, " ").replace(/\s+/g, " ").trim();

type Summary = { ok: boolean; dryRun?: boolean; error?: string; contactsNew?: number; contactsUpdated?: number; companiesNew?: number; dealsNew?: number; skipped?: { row: number; reason: string }[] };

/* CSV: ayırıcı (; , sekme) ilk satırdan; tırnaklı alanlar ve satır içi satır sonları desteklenir */
function parseCsv(text: string): string[][] {
  const first = text.split(/\r?\n/, 1)[0] ?? "";
  const delim = [";", ",", "\t"].sort((a, b) => first.split(b).length - first.split(a).length)[0];
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"' && text[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (c === '"') q = false;
      else cell += c;
    } else if (c === '"') q = true;
    else if (c === delim) {
      row.push(cell);
      cell = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else cell += c;
  }
  if (cell || row.length) {
    row.push(cell);
    rows.push(row);
  }
  return rows.filter((r) => r.some((x) => x.trim()));
}

/* Türkçe Excel'in CSV'si çoğu zaman Windows-1254: UTF-8 bozuk görünürse onunla okunur */
function decode(buf: ArrayBuffer) {
  const utf = new TextDecoder("utf-8").decode(buf).replace(/^﻿/, "");
  return utf.includes("�") ? new TextDecoder("windows-1254").decode(buf) : utf;
}

const cellText = (v: unknown) => (v instanceof Date ? v.toISOString().slice(0, 10) : v === null || v === undefined ? "" : String(v));

const SAMPLE = "Ad Soyad;E-posta;Telefon;Firma;Görevi;Fırsat adı;Tutar;Aşama;Tahmini kapanış\nAyşe Yılmaz;ayse@ornek.com;0532 000 00 00;Örnek Ltd.;Pazarlama müdürü;Web sitesi yenileme;45.000;Teklif;31.12.2026\n";

export function ImportTool() {
  const [fileName, setFileName] = useState("");
  const [rows, setRows] = useState<string[][]>([]);
  const [map, setMap] = useState<Partial<Record<Field, number>>>({});
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Summary | null>(null);
  const [error, setError] = useState("");
  const headers = rows[0] ?? [];
  const body = rows.slice(1);

  const read = async (file: File) => {
    setError("");
    setResult(null);
    try {
      let data: string[][];
      if (/\.xlsx$/i.test(file.name)) {
        const { readSheet } = await import("read-excel-file/browser");
        data = ((await readSheet(file)) as unknown[][]).map((r) => r.map(cellText));
      } else if (/\.(csv|txt)$/i.test(file.name)) {
        data = parseCsv(decode(await file.arrayBuffer()));
      } else {
        throw new Error("CSV ya da XLSX dosyası seçin. Eski .xls dosyasını Excel'de \"Farklı kaydet > .xlsx\" ile çevirin.");
      }
      if (data.length < 2) throw new Error("Dosyada başlık satırı ve en az bir kayıt olmalı.");
      setFileName(file.name);
      setRows(data);
      const auto: Partial<Record<Field, number>> = {};
      data[0].forEach((h, i) => {
        const f = FIELDS.find((x) => x.words.includes(norm(h)));
        if (f && auto[f.key] === undefined) auto[f.key] = i;
      });
      setMap(auto);
    } catch (e) {
      setRows([]);
      setError((e as Error).message || "Dosya okunamadı.");
    }
  };

  const mapped = useMemo(
    () =>
      body.map((r) => {
        const o: Partial<Record<Field, string>> = {};
        for (const f of FIELDS) if (map[f.key] !== undefined) o[f.key] = (r[map[f.key]!] ?? "").trim();
        return o;
      }),
    [body, map],
  );

  const send = async (dryRun: boolean) => {
    setBusy(true);
    setError("");
    try {
      const r = await fetch("/api/contacts/ice-aktar", { method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ rows: mapped, dryRun }) });
      const j = (await r.json().catch(() => null)) as Summary | null;
      if (!r.ok || !j?.ok) throw new Error(j?.error ?? "Aktarılamadı.");
      setResult(j);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const canSend = map.name !== undefined || map.email !== undefined;

  return (
    <div className="guru-import">
      <section className="guru-home__panel">
        <div className="guru-home__panel-head">
          <h2>1. Dosyayı Seçin</h2>
          <a href={`data:text/csv;charset=utf-8,${encodeURIComponent("﻿" + SAMPLE)}`} download="ornek-kisiler.csv">
            Örnek dosyayı indirin
          </a>
        </div>
        <label className="guru-crm__due">
          <span>CSV ya da XLSX; ilk satır sütun başlıkları. Bir seferde en çok 1000 satır.</span>
          <input type="file" accept=".csv,.txt,.xlsx" onChange={(e) => e.target.files?.[0] && read(e.target.files[0])} />
        </label>
        {error ? (
          <p className="guru-crm__error" role="alert">
            {error}
          </p>
        ) : null}
      </section>

      {rows.length > 1 && (
        <section className="guru-home__panel">
          <div className="guru-home__panel-head">
            <h2>2. Sütunları Eşleştirin</h2>
            <span className="guru-home__meta">
              {fileName} · {body.length} kayıt
            </span>
          </div>
          <div className="guru-import__map">
            {FIELDS.map((f) => (
              <label key={f.key} className="guru-crm__due">
                <span>{f.label}</span>
                <select value={map[f.key] ?? ""} onChange={(e) => setMap((m) => ({ ...m, [f.key]: e.target.value === "" ? undefined : Number(e.target.value) }))}>
                  <option value="">Kullanma</option>
                  {headers.map((h, i) => (
                    <option key={i} value={i}>
                      {h || `Sütun ${i + 1}`}
                    </option>
                  ))}
                </select>
              </label>
            ))}
          </div>
          <p className="guru-home__meta">Fırsat adı ya da tutarı doluysa satır için fırsat da açılır. Aynı e-postalı kişi zaten varsa yalnız boş alanları doldurulur.</p>
          <div className="guru-import__table">
            <table>
              <thead>
                <tr>
                  {FIELDS.filter((f) => map[f.key] !== undefined).map((f) => (
                    <th key={f.key}>{f.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {mapped.slice(0, 5).map((r, i) => (
                  <tr key={i}>
                    {FIELDS.filter((f) => map[f.key] !== undefined).map((f) => (
                      <td key={f.key}>{r[f.key]}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="guru-crm__row">
            {!canSend ? <small className="guru-crm__error">En az Ad Soyad ya da E-posta sütununu eşleştirin.</small> : null}
            <button type="button" className="guru-plan__nav" disabled={busy || !canSend} onClick={() => send(true)}>
              Önizle
            </button>
            <button type="button" className="guru-crm__save" disabled={busy || !canSend || !result?.dryRun} onClick={() => send(false)}>
              {busy ? "Çalışıyor…" : "Aktar"}
            </button>
          </div>
        </section>
      )}

      {result && (
        <section className="guru-home__panel" role="status">
          <div className="guru-home__panel-head">
            <h2>{result.dryRun ? "3. Önizleme: Aktarınca Olacaklar" : "Aktarıldı"}</h2>
            {!result.dryRun ? <Link href="/admin/collections/contacts">Kişileri açın</Link> : null}
          </div>
          <ul className="guru-home__stages guru-import__sum">
            <li>
              <span>Yeni kişi</span>
              <b>{result.contactsNew}</b>
            </li>
            <li>
              <span>Güncellenen kişi</span>
              <b>{result.contactsUpdated}</b>
            </li>
            <li>
              <span>Yeni firma</span>
              <b>{result.companiesNew}</b>
            </li>
            <li>
              <span>Yeni fırsat</span>
              <b>{result.dealsNew}</b>
            </li>
          </ul>
          {result.skipped?.length ? (
            <details>
              <summary>{result.skipped.length} satır atlanacak</summary>
              <ul className="guru-import__skip">
                {result.skipped.slice(0, 100).map((s) => (
                  <li key={s.row}>
                    Satır {s.row}: {s.reason}
                  </li>
                ))}
              </ul>
            </details>
          ) : null}
          {result.dryRun ? <p className="guru-home__meta">Sayılar uygunsa &ldquo;Aktar&rdquo;a basın.</p> : null}
        </section>
      )}
    </div>
  );
}
