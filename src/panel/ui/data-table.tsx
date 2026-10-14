"use client";

import { flexRender, getCoreRowModel, getSortedRowModel, useReactTable, type ColumnDef, type SortingState } from "@tanstack/react-table";
import { ArrowDown, ArrowUp } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Panelin ortak listesi (TanStack Table): sıralanabilir başlıklar, satıra
 * tıklayınca kaydı açar, klavyeyle de çalışır (Enter). Geniş tablolar kendi
 * kutusunda yatay kayar; sayfa kaymaz.
 */
export type MobileRow = { title: string; detail?: string; meta?: React.ReactNode };

export function DataTable<T>({ columns, data, onRowClick, rowLabel, empty, minWidth = 640, mobile }: { columns: ColumnDef<T, unknown>[]; data: T[]; onRowClick?: (row: T) => void; rowLabel?: (row: T) => string; empty?: React.ReactNode; minWidth?: number; /** Telefonda tablo yerine kart listesi */ mobile?: (row: T) => MobileRow }) {
  /* TanStack Table'ın döndürdüğü işlevler React Compiler ile önbelleğe alınamaz */
  "use no memo";
  const [sorting, setSorting] = useState<SortingState>([]);
  const table = useReactTable({ data, columns, state: { sorting }, onSortingChange: setSorting, getCoreRowModel: getCoreRowModel(), getSortedRowModel: getSortedRowModel() });
  const rows = table.getRowModel().rows;
  return (
    <>
    {mobile ? (
      <ul data-mobile-list className="m-0 list-none overflow-hidden rounded-card border border-line bg-surface p-0 md:hidden">
        {rows.length ? (
          rows.map((r) => {
            const m = mobile(r.original);
            return (
              <li key={r.id} className="border-b border-line last:border-0">
                <button type="button" onClick={onRowClick ? () => onRowClick(r.original) : undefined} className="flex min-h-14 w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-sunken">
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium text-ink">{m.title}</span>
                    {m.detail ? <span className="block truncate text-[13px] text-muted">{m.detail}</span> : null}
                  </span>
                  {m.meta}
                </button>
              </li>
            );
          })
        ) : (
          <li className="px-4 py-6 text-muted">{empty ?? "Kayıt yok."}</li>
        )}
      </ul>
    ) : null}
    <div className={cn("overflow-x-auto rounded-card border border-line bg-surface", mobile && "hidden md:block")}>
      <table className="w-full border-collapse text-[14px]" style={{ minWidth }}>
        <thead>
          {table.getHeaderGroups().map((hg) => (
            <tr key={hg.id}>
              {hg.headers.map((h) => {
                const sort = h.column.getIsSorted();
                return (
                  <th key={h.id} scope="col" className="border-b border-line bg-sunken px-4 py-2.5 text-left text-[12px] font-medium uppercase tracking-[0.05em] text-muted">
                    {h.column.getCanSort() ? (
                      <button type="button" onClick={h.column.getToggleSortingHandler()} className="inline-flex items-center gap-1 uppercase hover:text-ink pointer-coarse:min-h-11">
                        {flexRender(h.column.columnDef.header, h.getContext())}
                        {sort === "asc" ? <ArrowUp className="size-3" aria-label="artan" /> : sort === "desc" ? <ArrowDown className="size-3" aria-label="azalan" /> : null}
                      </button>
                    ) : (
                      flexRender(h.column.columnDef.header, h.getContext())
                    )}
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>
        <tbody>
          {rows.length ? (
            rows.map((r) => (
              <tr
                key={r.id}
                tabIndex={onRowClick ? 0 : undefined}
                aria-label={rowLabel ? rowLabel(r.original) : undefined}
                onClick={onRowClick ? () => onRowClick(r.original) : undefined}
                onKeyDown={onRowClick ? (e) => e.key === "Enter" && onRowClick(r.original) : undefined}
                className={cn("border-b border-line last:border-0", onRowClick && "cursor-pointer hover:bg-sunken focus-visible:bg-sunken")}
              >
                {r.getVisibleCells().map((c) => (
                  <td key={c.id} className="px-4 py-2.5 align-middle">
                    {flexRender(c.column.columnDef.cell, c.getContext())}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} className="px-4 py-6 text-muted">
                {empty ?? "Kayıt yok."}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
    </>
  );
}
