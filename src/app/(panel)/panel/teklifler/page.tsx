import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { requireModule } from "@/panel/context";
import { PageHeader } from "@/panel/ui/page-header";
import { Button } from "@/panel/ui/button";
import { QuotesList, type QuoteRow } from "@/panel/quotes/QuotesList";

export const metadata: Metadata = { title: "Teklifler" };
export const dynamic = "force-dynamic";

const nameOf = (v: unknown) => (v && typeof v === "object" ? ((v as { name?: string }).name ?? "") : "");

export default async function QuotesPage() {
  const ctx = await requireModule("crm");
  const res = await ctx.find("quotes", { sort: "-createdAt", limit: 500, depth: 1 });
  const rows: QuoteRow[] = (res.docs as { id: number; number?: string | null; title: string; company?: unknown; contact?: unknown; total?: number | null; status: string; issueDate?: string | null; validUntil?: string | null }[]).map((q) => ({
    id: q.id,
    number: q.number ?? "",
    title: q.title,
    who: nameOf(q.company) || nameOf(q.contact),
    total: q.total ?? 0,
    status: q.status,
    issueDate: q.issueDate ?? null,
    validUntil: q.validUntil ?? null,
  }));
  return (
    <>
      <PageHeader
        title="Teklifler"
        description="Kalem kalem teklif; toplamlar ve teklif numarası kendiliğinden. Gönderildi ve Kabul durumu bağlı fırsatın aşamasını da değiştirir."
        actions={
          <Button asChild variant="primary">
            <Link href="/panel/teklifler/yeni">
              <Plus /> Yeni teklif
            </Link>
          </Button>
        }
      />
      <QuotesList rows={rows} />
    </>
  );
}
