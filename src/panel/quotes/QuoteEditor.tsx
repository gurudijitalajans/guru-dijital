"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ArrowLeft, FileText, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { findContacts } from "../deals/actions";
import { saveQuote, setQuoteStatus, type QuoteItemInput } from "./actions";
import { QUOTE_STATUS } from "./QuotesList";

export type DealOption = { id: number; title: string; contact: { id: number; name: string } | null; company: { id: number; name: string } | null; value: number; service: string };
export type EditorQuote = {
  id: number | null;
  number: string;
  title: string;
  deal: number | null;
  contact: { id: number; name: string } | null;
  company: { id: number; name: string } | null;
  items: QuoteItemInput[];
  notes: string;
  terms: string;
  issueDate: string;
  validUntil: string;
  status: string;
};

const money = new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", minimumFractionDigits: 2 });
const round = (n: number) => Math.round(n * 100) / 100;
/* Koleksiyondaki hesapla aynı: kalem tutarı ve KDV ayrı ayrı yuvarlanmadan toplanır */
const totals = (items: QuoteItemInput[]) => {
  let subtotal = 0;
  let vat = 0;
  for (const i of items) {
    const line = (Number(i.qty) || 0) * (Number(i.unitPrice) || 0);
    subtotal += line;
    vat += (line * Number(i.vatRate || 0)) / 100;
  }
  return { subtotal: round(subtotal), vat: round(vat), total: round(subtotal + vat) };
};
const field = "block w-full rounded-[9px] border border-line bg-surface px-3 min-h-10 text-[14px] text-ink focus:border-accent focus:outline-none";
const num = (v: string) => Number(v.replace(/\./g, "").replace(",", ".")) || 0;

export function QuoteEditor({ quote, deals }: { quote: EditorQuote; deals: DealOption[] }) {
  const router = useRouter();
  const [q, setQ] = useState(quote);
  const [synced, setSynced] = useState(quote);
  if (synced !== quote) {
    setSynced(quote);
    setQ(quote);
  }
  const [cq, setCq] = useState("");
  const [hits, setHits] = useState<{ id: number; name: string; detail: string }[]>([]);
  const [pending, start] = useTransition();
  const t = totals(q.items);
  const set = (patch: Partial<EditorQuote>) => setQ((x) => ({ ...x, ...patch }));
  const setItem = (i: number, patch: Partial<QuoteItemInput>) => set({ items: q.items.map((it, k) => (k === i ? { ...it, ...patch } : it)) });

  const pickDeal = (id: string) => {
    const d = deals.find((x) => x.id === Number(id));
    set({ deal: d?.id ?? null, ...(d ? { contact: d.contact ?? q.contact, company: d.company ?? q.company } : {}) });
  };
  const searchContact = (v: string) => {
    setCq(v);
    if (v.trim().length < 2) return setHits([]);
    start(async () => setHits(await findContacts(v)));
  };
  const save = (status?: string) =>
    start(async () => {
      const r = await saveQuote(q.id, { title: q.title, deal: q.deal, contact: q.contact?.id ?? null, company: q.company?.id ?? null, items: q.items, notes: q.notes, terms: q.terms, issueDate: q.issueDate, validUntil: q.validUntil, ...(status ? { status } : {}) });
      if (!r.ok || !r.id) return void toast.error(r.error ?? "Kaydedilemedi.");
      toast.success(q.id ? "Kaydedildi." : "Teklif kaydedildi; numarası verildi.");
      if (!q.id) router.replace(`/panel/teklifler/${r.id}`);
      else router.refresh();
    });
  const status = (s: string) =>
    q.id &&
    start(async () => {
      const r = await setQuoteStatus(q.id!, s);
      if (!r.ok) return void toast.error(r.error ?? "Kaydedilemedi.");
      toast.success(s === "gonderildi" ? "Gönderildi olarak işaretlendi; fırsat Teklif aşamasına geçer." : s === "kabul" ? "Kabul edildi; fırsat Kazanıldı aşamasına geçer." : `Durum: ${QUOTE_STATUS[s][1]}`);
      router.refresh();
    });
  const [tone, label] = QUOTE_STATUS[q.status] ?? ["plain", q.status];

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        save();
      }}
    >
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <Link href="/panel/teklifler" className="mb-2 inline-flex min-h-8 items-center gap-1 text-[14px] text-accent no-underline">
            <ArrowLeft className="size-4" /> Teklifler
          </Link>
          <h1 className="m-0 text-[26px] font-semibold leading-tight text-ink">{q.id ? `Teklif ${q.number}` : "Yeni teklif"}</h1>
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <Badge tone={tone}>{label}</Badge>
            {!q.id ? <span className="text-[13px] text-muted">Numara kaydedince verilir.</span> : null}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {q.id ? (
            <Button asChild>
              <a href={`/api/quotes/${q.id}/yazdir`} target="_blank" rel="noreferrer">
                <FileText /> Belgeyi aç
              </a>
            </Button>
          ) : null}
          <Button type="submit" variant="primary" disabled={pending}>
            {pending ? "Kaydediliyor…" : "Kaydet"}
          </Button>
        </div>
      </div>

      {q.id ? (
        <div className="mb-4 flex flex-wrap items-center gap-1.5 rounded-card border border-line bg-surface px-3 py-2.5" role="group" aria-label="Durum">
          <span className="mr-1 text-[13px] text-muted">Durum:</span>
          {Object.entries(QUOTE_STATUS).map(([k, [, l]]) => (
            <Button key={k} type="button" size="sm" variant={q.status === k ? "primary" : "secondary"} aria-pressed={q.status === k} disabled={pending} onClick={() => q.status !== k && status(k)}>
              {l}
            </Button>
          ))}
          <span className="ml-auto text-[12px] text-muted">Gönderildi: fırsat Teklif aşamasına; Kabul: Kazanıldı&apos;ya geçer.</span>
        </div>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="grid min-w-0 gap-4">
          <section className="rounded-card border border-line bg-surface p-4">
            <label className="grid gap-1 text-[13px] text-muted">
              Teklif konusu
              <input id="teklif-konu" required value={q.title} onChange={(e) => set({ title: e.target.value })} placeholder="Sosyal medya yönetimi, 12 aylık" className={field} />
            </label>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <label className="grid gap-1 text-[13px] text-muted">
                Fırsat
                <select id="teklif-firsat" value={q.deal ?? ""} onChange={(e) => pickDeal(e.target.value)} className={field}>
                  <option value="">Fırsat yok</option>
                  {deals.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.title}
                    </option>
                  ))}
                </select>
              </label>
              <div className="grid gap-1 text-[13px] text-muted">
                <label htmlFor="teklif-kisi">Kişi</label>
                {q.contact ? (
                  <div className="flex min-h-10 items-center justify-between gap-2 rounded-[9px] border border-line px-3">
                    <span className="truncate text-[14px] text-ink">{q.contact.name}</span>
                    <button type="button" className="text-[13px] text-accent" onClick={() => set({ contact: null })}>
                      Değiştir
                    </button>
                  </div>
                ) : (
                  <>
                    <input id="teklif-kisi" value={cq} onChange={(e) => searchContact(e.target.value)} placeholder="Ad ya da e-posta yazın" className={field} autoComplete="off" />
                    {hits.length ? (
                      <ul className="m-0 list-none overflow-hidden rounded-[9px] border border-line p-0">
                        {hits.map((h) => (
                          <li key={h.id}>
                            <button
                              type="button"
                              onClick={() => {
                                set({ contact: { id: h.id, name: h.name } });
                                setHits([]);
                                setCq("");
                              }}
                              className="flex min-h-10 w-full items-center justify-between gap-2 px-3 text-left hover:bg-sunken"
                            >
                              <span className="text-[14px] text-ink">{h.name}</span>
                              <span className="truncate text-[12px] text-muted">{h.detail}</span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </>
                )}
              </div>
            </div>
            {q.company ? <p className="mt-2 mb-0 text-[13px] text-muted">Firma: {q.company.name}</p> : <p className="mt-2 mb-0 text-[13px] text-muted">Firma boşsa kişinin firması kullanılır.</p>}
          </section>

          <section className="rounded-card border border-line bg-surface">
            <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
              <h2 className="m-0 text-[16px] font-semibold text-ink">Kalemler</h2>
              <Button type="button" size="sm" onClick={() => set({ items: [...q.items, { description: "", qty: 1, unit: "Adet", unitPrice: 0, vatRate: "20" }] })}>
                <Plus /> Kalem ekle
              </Button>
            </div>
            <div className="grid gap-3 p-4">
              {q.items.map((it, i) => (
                <fieldset key={i} className="m-0 grid min-w-0 gap-2 rounded-[9px] border border-line p-3 sm:grid-cols-[minmax(0,1fr)_80px_90px_120px_80px_auto] sm:items-end">
                  <legend className="sr-only">Kalem {i + 1}</legend>
                  <label className="grid gap-1 text-[12px] text-muted">
                    Açıklama
                    <input id={`kalem-${i}-aciklama`} value={it.description} onChange={(e) => setItem(i, { description: e.target.value })} className={field} />
                  </label>
                  <label className="grid gap-1 text-[12px] text-muted">
                    Miktar
                    <input id={`kalem-${i}-miktar`} inputMode="decimal" value={String(it.qty)} onChange={(e) => setItem(i, { qty: num(e.target.value) })} className={cn(field, "tabular")} />
                  </label>
                  <label className="grid gap-1 text-[12px] text-muted">
                    Birim
                    <input id={`kalem-${i}-birim`} value={it.unit} onChange={(e) => setItem(i, { unit: e.target.value })} className={field} />
                  </label>
                  <label className="grid gap-1 text-[12px] text-muted">
                    Birim fiyat (₺)
                    <input id={`kalem-${i}-fiyat`} inputMode="decimal" value={String(it.unitPrice)} onChange={(e) => setItem(i, { unitPrice: num(e.target.value) })} className={cn(field, "tabular")} />
                  </label>
                  <label className="grid gap-1 text-[12px] text-muted">
                    KDV
                    <select id={`kalem-${i}-kdv`} value={it.vatRate} onChange={(e) => setItem(i, { vatRate: e.target.value })} className={field}>
                      {["20", "10", "1", "0"].map((v) => (
                        <option key={v} value={v}>
                          %{v}
                        </option>
                      ))}
                    </select>
                  </label>
                  <div className="flex items-center justify-between gap-2 sm:justify-end">
                    <span className="tabular text-[14px] text-ink sm:hidden">{money.format((Number(it.qty) || 0) * (Number(it.unitPrice) || 0))}</span>
                    <button type="button" disabled={q.items.length < 2} onClick={() => set({ items: q.items.filter((_, k) => k !== i) })} className="grid size-10 place-items-center rounded-[9px] text-muted hover:bg-sunken hover:text-bad disabled:opacity-30" aria-label={`Kalem ${i + 1} sil`}>
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </fieldset>
              ))}
            </div>
          </section>

          <section className="grid gap-3 rounded-card border border-line bg-surface p-4">
            <label className="grid gap-1 text-[13px] text-muted">
              Açıklama (belgede kalemlerin altında: kapsam, teslim süresi, dahil olmayanlar)
              <textarea id="teklif-aciklama" rows={4} value={q.notes} onChange={(e) => set({ notes: e.target.value })} className={cn(field, "py-2")} />
            </label>
            <label className="grid gap-1 text-[13px] text-muted">
              Koşullar
              <textarea id="teklif-kosullar" rows={3} value={q.terms} onChange={(e) => set({ terms: e.target.value })} className={cn(field, "py-2")} />
            </label>
          </section>
        </div>

        <aside className="grid content-start gap-4">
          <section className="rounded-card border border-line bg-surface p-4">
            <h2 className="mt-0 mb-3 text-[16px] font-semibold text-ink">Toplam</h2>
            <dl className="m-0 grid grid-cols-[minmax(0,1fr)_auto] gap-y-1.5 text-[14px]">
              <dt className="text-muted">Ara toplam</dt>
              <dd className="tabular m-0 text-ink">{money.format(t.subtotal)}</dd>
              <dt className="text-muted">KDV</dt>
              <dd className="tabular m-0 text-ink">{money.format(t.vat)}</dd>
              <dt className="border-t border-line pt-2 font-semibold text-ink">Genel toplam</dt>
              <dd className="tabular m-0 border-t border-line pt-2 text-[18px] font-semibold text-ink">{money.format(t.total)}</dd>
            </dl>
          </section>
          <section className="grid gap-3 rounded-card border border-line bg-surface p-4">
            <label className="grid gap-1 text-[13px] text-muted">
              Teklif tarihi
              <input id="teklif-tarih" type="date" value={q.issueDate} onChange={(e) => set({ issueDate: e.target.value })} className={field} />
            </label>
            <label className="grid gap-1 text-[13px] text-muted">
              Geçerlilik
              <input id="teklif-gecerlilik" type="date" value={q.validUntil} onChange={(e) => set({ validUntil: e.target.value })} className={field} />
            </label>
          </section>
          {q.deal ? (
            <Link href={`/panel/firsatlar?firsat=${q.deal}`} className="text-[14px] text-accent">
              Fırsatı aç
            </Link>
          ) : null}
        </aside>
      </div>
    </form>
  );
}
