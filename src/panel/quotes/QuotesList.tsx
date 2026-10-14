"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { DataTable } from "../ui/data-table";
import { Input } from "../ui/input";
import { Badge, type Tone } from "../ui/badge";

export type QuoteRow = { id: number; number: string; title: string; who: string; total: number; status: string; issueDate: string | null; validUntil: string | null };
export const QUOTE_STATUS: Record<string, [Tone, string]> = { taslak: ["plain", "Taslak"], gonderildi: ["info", "Gönderildi"], kabul: ["good", "Kabul"], red: ["bad", "Red"] };
const money = new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 });
const dFmt = new Intl.DateTimeFormat("tr-TR", { timeZone: "Europe/Istanbul", day: "numeric", month: "short", year: "numeric" });
const expired = (q: QuoteRow) => q.status === "gonderildi" && q.validUntil !== null && new Date(q.validUntil).getTime() < Date.now();

const cols: ColumnDef<QuoteRow, unknown>[] = [
  { accessorKey: "number", header: "No", cell: ({ getValue }) => <span className="whitespace-nowrap font-mono text-[13px] text-ink">{getValue() as string}</span> },
  { accessorKey: "title", header: "Teklif", cell: ({ getValue }) => <span className="font-medium text-ink">{getValue() as string}</span> },
  { accessorKey: "who", header: "Firma ya da kişi" },
  { accessorKey: "total", header: "Tutar (KDV dahil)", cell: ({ getValue }) => <span className="tabular whitespace-nowrap">{money.format(getValue() as number)}</span> },
  {
    accessorKey: "status",
    header: "Durum",
    cell: ({ row }) => {
      const [tone, label] = QUOTE_STATUS[row.original.status] ?? ["plain", row.original.status];
      return expired(row.original) ? <Badge tone="warn">Süresi geçti</Badge> : <Badge tone={tone}>{label}</Badge>;
    },
  },
  { accessorKey: "issueDate", header: "Tarih", cell: ({ getValue }) => (getValue() ? <span className="tabular whitespace-nowrap">{dFmt.format(new Date(getValue() as string))}</span> : null) },
];

export function QuotesList({ rows }: { rows: QuoteRow[] }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string>("");
  const term = q.trim().toLocaleLowerCase("tr-TR");
  const visible = useMemo(() => rows.filter((r) => (!status || r.status === status) && (!term || `${r.number} ${r.title} ${r.who}`.toLocaleLowerCase("tr-TR").includes(term))), [rows, status, term]);
  const waiting = rows.filter((r) => r.status === "gonderildi");
  return (
    <>
      <div className="mb-3.5 flex flex-wrap items-center gap-2">
        <label className="relative min-w-[180px] flex-1 sm:max-w-[300px]">
          <span className="sr-only">Teklif ara</span>
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" aria-hidden />
          <Input id="teklif-ara" value={q} onChange={(e) => setQ(e.target.value)} placeholder="No, konu ya da firma ara" className="w-full pl-9" />
        </label>
        {[["", "Tümü"], ...Object.entries(QUOTE_STATUS).map(([k, [, l]]) => [k, l])].map(([k, l]) => (
          <button key={k || "tumu"} type="button" aria-pressed={status === k} onClick={() => setStatus(k)} className={cn("min-h-8.5 pointer-coarse:min-h-11 rounded-full border border-line px-3 text-[13px]", status === k ? "border-accent bg-accent-soft text-accent" : "hover:border-accent")}>
            {l}
          </button>
        ))}
        <span className="text-[13px] text-muted">
          <span className="tabular">{waiting.length}</span> teklif yanıt bekliyor · <span className="tabular">{money.format(waiting.reduce((a, r) => a + r.total, 0))}</span>
        </span>
      </div>
      <DataTable
        columns={cols}
        data={visible}
        onRowClick={(r) => router.push(`/panel/teklifler/${r.id}`)}
        rowLabel={(r) => `${r.number} teklifini aç`}
        mobile={(r) => ({ title: `${r.number} ${r.title}`.trim(), detail: [r.who, money.format(r.total)].filter(Boolean).join(" · "), meta: <Badge tone={expired(r) ? "warn" : (QUOTE_STATUS[r.status]?.[0] ?? "plain")}>{expired(r) ? "Süresi geçti" : (QUOTE_STATUS[r.status]?.[1] ?? r.status)}</Badge> })}
        empty={q || status ? "Bu süzgeçte teklif yok." : "Henüz teklif yok. Fırsatın ayrıntısından ya da Yeni teklif ile hazırlayın."}
      />
    </>
  );
}
