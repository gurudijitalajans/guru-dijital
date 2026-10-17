"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Search } from "lucide-react";
import { DataTable } from "../ui/data-table";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Fields, Sheet, SheetSection } from "../ui/sheet";
import { contactValue } from "../ui/contact-link";
import { cn } from "@/lib/utils";
import { Akis } from "../crm/Akis";
import type { FeedItem } from "../crm/feed";

export type PersonRow = { id: number; name: string; title: string; email: string; phone: string; company: string; source: string };
export type CompanyRow = { id: number; name: string; sector: string; email: string; phone: string; website: string };
type DealLine = { id: number; title: string; stage: string; value: number };
export type Selected = {
  kind: "person" | "company";
  id: number;
  title: string;
  subtitle: string;
  fields: [string, string][];
  notes: string;
  companyId: number | null;
  deals: DealLine[];
  people?: { id: number; name: string; title: string }[];
  feed: FeedItem[];
  editHref: string;
};

const money = new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 });

const personCols: ColumnDef<PersonRow, unknown>[] = [
  {
    accessorKey: "name",
    header: "Ad",
    cell: ({ row }) => (
      <div className="min-w-0">
        <div className="font-medium text-ink">{row.original.name}</div>
        {row.original.title ? <div className="text-[13px] text-muted">{row.original.title}</div> : null}
      </div>
    ),
  },
  { accessorKey: "company", header: "Firma", cell: ({ getValue }) => (getValue() as string) || <span className="text-muted">Firma yok</span> },
  { accessorKey: "email", header: "E-posta", cell: ({ getValue }) => <span className="[overflow-wrap:anywhere]">{getValue() as string}</span> },
  { accessorKey: "phone", header: "Telefon", cell: ({ getValue }) => <span className="tabular whitespace-nowrap">{getValue() as string}</span> },
  { accessorKey: "source", header: "Kaynak", cell: ({ getValue }) => (getValue() ? <Badge>{getValue() as string}</Badge> : null) },
];
const companyCols: ColumnDef<CompanyRow, unknown>[] = [
  { accessorKey: "name", header: "Firma", cell: ({ getValue }) => <span className="font-medium text-ink">{getValue() as string}</span> },
  { accessorKey: "sector", header: "Sektör" },
  { accessorKey: "email", header: "E-posta", cell: ({ getValue }) => <span className="[overflow-wrap:anywhere]">{getValue() as string}</span> },
  { accessorKey: "phone", header: "Telefon", cell: ({ getValue }) => <span className="tabular whitespace-nowrap">{getValue() as string}</span> },
];

/** Adres satırını değiştirir: arama, görünüm, sayfa ve açık kayıt paylaşılabilir bir bağlantıda durur */
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

export function PeopleView({ view, q, page, pages, total, people, companies, selected, team = [], me = 0 }: { view: "kisiler" | "firmalar"; q: string; page: number; pages: number; total: number; people: PersonRow[]; companies: CompanyRow[]; selected: Selected | null; team?: { id: number; name: string }[]; me?: number }) {
  const set = useParams();
  const [term, setTerm] = useState(q);
  useEffect(() => {
    if (term === q) return;
    const t = setTimeout(() => set({ q: term.trim() || null, sayfa: null }, true), 300);
    return () => clearTimeout(t);
  }, [term, q, set]);

  return (
    <>
      <div className="mb-3.5 flex flex-wrap items-center gap-2">
        <div className="inline-flex rounded-[9px] border border-line bg-sunken p-[3px]" role="group" aria-label="Görünüm">
          {(["kisiler", "firmalar"] as const).map((v) => (
            <button
              key={v}
              type="button"
              aria-pressed={view === v}
              onClick={() => set({ gorunum: v === "kisiler" ? null : v, sayfa: null, kisi: null, firma: null })}
              className={cn("min-h-8.5 pointer-coarse:min-h-11 rounded-[7px] px-3 font-medium text-muted", view === v && "bg-surface text-ink shadow-sm")}
            >
              {v === "kisiler" ? "Kişiler" : "Firmalar"}
            </button>
          ))}
        </div>
        <label className="relative min-w-[180px] flex-1 sm:max-w-[360px]">
          <span className="sr-only">Ara</span>
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" aria-hidden />
          <Input id="kisi-ara" value={term} onChange={(e) => setTerm(e.target.value)} placeholder={view === "kisiler" ? "Ad, e-posta ya da telefon ara" : "Firma ya da sektör ara"} className="w-full pl-9" />
        </label>
        <span className="text-[13px] text-muted tabular">{total.toLocaleString("tr-TR")} kayıt</span>
      </div>

      {view === "kisiler" ? (
        <DataTable columns={personCols} data={people} mobile={(r) => ({ title: r.name, detail: [r.company, r.phone || r.email].filter(Boolean).join(" · ") })} onRowClick={(r) => set({ kisi: String(r.id), firma: null })} rowLabel={(r) => `${r.name} kaydını aç`} empty={q ? "Aramaya uyan kişi yok." : "Henüz kişi yok. Excel'den aktarabilir ya da yeni kişi ekleyebilirsiniz."} />
      ) : (
        <DataTable columns={companyCols} data={companies} mobile={(r) => ({ title: r.name, detail: [r.sector, r.phone || r.email].filter(Boolean).join(" · ") })} onRowClick={(r) => set({ firma: String(r.id), kisi: null })} rowLabel={(r) => `${r.name} kaydını aç`} empty={q ? "Aramaya uyan firma yok." : "Henüz firma yok."} />
      )}

      {pages > 1 ? (
        <nav className="mt-3 flex items-center justify-end gap-2" aria-label="Sayfalar">
          <Button size="sm" disabled={page <= 1} onClick={() => set({ sayfa: page > 2 ? String(page - 1) : null })}>
            Önceki
          </Button>
          <span className="text-[13px] text-muted tabular">
            {page} / {pages}
          </span>
          <Button size="sm" disabled={page >= pages} onClick={() => set({ sayfa: String(page + 1) })}>
            Sonraki
          </Button>
        </nav>
      ) : null}

      <Sheet open={Boolean(selected)} onOpenChange={(o) => !o && set({ kisi: null, firma: null })} title={selected?.title ?? ""} description={selected?.subtitle}>
        {selected ? (
          <>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button asChild variant="primary" size="sm">
                <a href={selected.editHref}>Düzenle</a>
              </Button>
              {selected.companyId ? (
                <Button size="sm" onClick={() => set({ firma: String(selected.companyId), kisi: null })}>
                  Firmayı aç
                </Button>
              ) : null}
            </div>
            <SheetSection title="Bilgiler">
              <Fields rows={selected.fields.map(([k, v]) => [k, typeof v === "string" ? contactValue(k, v) : v] as [string, React.ReactNode])} />
            </SheetSection>
            {selected.people ? (
              <SheetSection title={`Kişiler (${selected.people.length})`}>
                {selected.people.length ? (
                  <ul className="m-0 list-none p-0">
                    {selected.people.map((p) => (
                      <li key={p.id}>
                        <button type="button" onClick={() => set({ kisi: String(p.id), firma: null })} className="flex min-h-10 w-full items-center justify-between gap-3 rounded-[8px] px-2 text-left hover:bg-sunken">
                          <span className="font-medium text-ink">{p.name}</span>
                          <span className="text-[13px] text-muted">{p.title}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="m-0 text-[14px] text-muted">Bu firmaya bağlı kişi yok.</p>
                )}
              </SheetSection>
            ) : null}
            <SheetSection title={`Fırsatlar (${selected.deals.length})`}>
              {selected.deals.length ? (
                <ul className="m-0 list-none p-0">
                  {selected.deals.map((d) => (
                    <li key={d.id}>
                      <a href={`/panel/firsatlar?firsat=${d.id}`} className="flex min-h-10 items-center justify-between gap-3 rounded-[8px] px-2 no-underline hover:bg-sunken">
                        <span className="min-w-0 truncate font-medium text-ink">{d.title}</span>
                        <span className="flex shrink-0 items-center gap-2">
                          <Badge>{d.stage}</Badge>
                          <span className="tabular text-[13px] text-muted">{money.format(d.value)}</span>
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="m-0 text-[14px] text-muted">Fırsat yok.</p>
              )}
            </SheetSection>
            {selected.notes ? (
              <SheetSection title="Notlar">
                <p className="m-0 whitespace-pre-wrap text-[14px] text-ink">{selected.notes}</p>
              </SheetSection>
            ) : null}
            <Akis items={selected.feed} target={selected.kind === "person" ? { contact: selected.id } : { company: selected.id }} team={team} me={me} />
          </>
        ) : null}
      </Sheet>
    </>
  );
}
