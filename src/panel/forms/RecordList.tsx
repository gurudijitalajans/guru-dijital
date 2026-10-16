"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Empty } from "../ui/card";

export type ListRow = { id: number; href: string; cells: string[] };

/** Ayar kayıtları tablosu: masaüstünde tablo, telefonda kart; arama adres satırında */
export function RecordList({ headers, rows, q, page, pages, searchable }: { headers: string[]; rows: ListRow[]; q: string; page: number; pages: number; searchable: boolean }) {
  const router = useRouter();
  const path = usePathname();
  const params = useSearchParams();
  const [term, setTerm] = useState(q);
  const go = (patch: Record<string, string | null>) => {
    const next = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(patch)) {
      if (v) next.set(k, v);
      else next.delete(k);
    }
    router.replace(`${path}${next.toString() ? `?${next}` : ""}`, { scroll: false });
  };
  useEffect(() => {
    if (term === q) return;
    const t = setTimeout(() => go({ q: term.trim() || null, sayfa: null }), 300);
    return () => clearTimeout(t);
  });

  return (
    <>
      {searchable ? (
        <label className="relative mb-3 block max-w-[420px]">
          <span className="sr-only">Ara</span>
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" />
          <Input value={term} onChange={(e) => setTerm(e.target.value)} placeholder="Ara" className="w-full pl-9" />
        </label>
      ) : null}
      {rows.length ? (
        <>
          <div className="hidden overflow-x-auto rounded-[14px] border border-line bg-surface md:block">
            <table className="w-full border-collapse text-[14px]">
              <thead>
                <tr className="border-b border-line text-left text-[12px] text-muted">
                  {headers.map((h) => (
                    <th key={h} className="px-4 py-3 font-semibold">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="cursor-pointer border-b border-line last:border-0 hover:bg-sunken" onClick={() => router.push(r.href)}>
                    {r.cells.map((c, i) => (
                      <td key={i} className="max-w-[360px] truncate px-4 py-3 text-ink">
                        {i === 0 ? (
                          <Link href={r.href} className="font-medium text-ink no-underline">
                            {c || "Adsız"}
                          </Link>
                        ) : (
                          c
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <ul className="m-0 grid list-none gap-2 p-0 md:hidden">
            {rows.map((r) => (
              <li key={r.id}>
                <Link href={r.href} className="block rounded-[12px] border border-line bg-surface px-4 py-3 no-underline">
                  <span className="block truncate font-medium text-ink">{r.cells[0] || "Adsız"}</span>
                  <span className="block truncate text-[13px] text-muted">{r.cells.slice(1).filter(Boolean).join(" · ")}</span>
                </Link>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <Empty>{q ? "Bu aramaya uyan kayıt yok." : "Henüz kayıt yok."}</Empty>
      )}
      {pages > 1 ? (
        <div className="mt-4 flex items-center justify-end gap-2">
          <span className="tabular mr-auto text-[13px] text-muted">{`${page}/${pages}`}</span>
          <Button disabled={page <= 1} onClick={() => go({ sayfa: page > 2 ? String(page - 1) : null })}>
            Önceki
          </Button>
          <Button disabled={page >= pages} onClick={() => go({ sayfa: String(page + 1) })}>
            Sonraki
          </Button>
        </div>
      ) : null}
    </>
  );
}
