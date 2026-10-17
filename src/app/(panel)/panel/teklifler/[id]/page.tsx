import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireModule } from "@/panel/context";
import { QuoteEditor, type EditorQuote, type DealOption } from "@/panel/quotes/QuoteEditor";

export const metadata: Metadata = { title: "Teklif" };
export const dynamic = "force-dynamic";

const nameOf = (v: unknown) => (v && typeof v === "object" ? ((v as { name?: string }).name ?? "") : "");
const idOf = (v: unknown) => (v && typeof v === "object" ? ((v as { id?: number }).id ?? null) : ((v as number | null | undefined) ?? null));
const day = (v?: string | null) => (v ? new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Istanbul" }).format(new Date(v)) : "");
/* Yeni teklifin tarihleri: bugün ve 15 gün sonrası (koleksiyon varsayılanıyla aynı) */
function defaultDates() {
  const now = new Date();
  return { issue: day(now.toISOString()), valid: day(new Date(now.getTime() + 15 * 86400000).toISOString()) };
}
const DEFAULT_TERMS = "Bu teklif geçerlilik tarihine kadar geçerlidir. Ödeme ve teslim koşulları sözleşmede netleşir.";

/** Teklif düzenleyici: /panel/teklifler/yeni (?firsat= ile fırsattan) ve /panel/teklifler/:id */
export default async function QuotePage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ firsat?: string }> }) {
  const ctx = await requireModule("crm");
  const { id } = await params;
  const sp = await searchParams;
  const deals = await ctx.find("deals", { where: { stage: { in: ["aday", "gorusme", "teklif", "kazanildi"] } }, sort: "-updatedAt", limit: 300, depth: 1 });
  const dealOptions: DealOption[] = (deals.docs as { id: number; title: string; contact?: unknown; company?: unknown; value?: number | null; service?: string | null }[]).map((d) => ({
    id: d.id,
    title: d.title,
    contact: idOf(d.contact) ? { id: idOf(d.contact)!, name: nameOf(d.contact) } : null,
    company: idOf(d.company) ? { id: idOf(d.company)!, name: nameOf(d.company) } : null,
    value: d.value ?? 0,
    service: d.service ?? "",
  }));

  let quote: EditorQuote;
  if (id === "yeni") {
    const from = sp.firsat ? dealOptions.find((d) => d.id === Number(sp.firsat)) : undefined;
    const dates = defaultDates();
    quote = {
      id: null,
      number: "",
      title: from ? `${from.service || from.title} teklifi` : "",
      deal: from?.id ?? null,
      contact: from?.contact ?? null,
      company: from?.company ?? null,
      items: [{ description: from?.service || from?.title || "", qty: 1, unit: "Adet", unitPrice: from?.value ?? 0, vatRate: "20" }],
      notes: "",
      terms: DEFAULT_TERMS,
      issueDate: dates.issue,
      validUntil: dates.valid,
      status: "taslak",
    };
  } else {
    const q = (await ctx.findByID("quotes", id, 1)) as {
      id: number; number?: string | null; title: string; deal?: unknown; contact?: unknown; company?: unknown; items?: { description: string; qty: number; unit?: string | null; unitPrice: number; vatRate: string }[] | null; notes?: string | null; terms?: string | null; issueDate?: string | null; validUntil?: string | null; status: string; sentAt?: string | null; viewedAt?: string | null; respondedAt?: string | null; customerNote?: string | null;
    } | null;
    if (!q) notFound();
    quote = {
      id: q.id,
      number: q.number ?? "",
      title: q.title,
      deal: idOf(q.deal),
      contact: idOf(q.contact) ? { id: idOf(q.contact)!, name: nameOf(q.contact) } : null,
      company: idOf(q.company) ? { id: idOf(q.company)!, name: nameOf(q.company) } : null,
      items: (q.items ?? []).map((i) => ({ description: i.description, qty: i.qty, unit: i.unit ?? "Adet", unitPrice: i.unitPrice, vatRate: i.vatRate })),
      notes: q.notes ?? "",
      terms: q.terms ?? "",
      issueDate: day(q.issueDate),
      validUntil: day(q.validUntil),
      status: q.status,
      sentAt: q.sentAt ?? null,
      viewedAt: q.viewedAt ?? null,
      respondedAt: q.respondedAt ?? null,
      customerNote: q.customerNote ?? "",
      email: (q.contact && typeof q.contact === "object" ? (q.contact as { email?: string | null }).email : null) || (q.company && typeof q.company === "object" ? (q.company as { email?: string | null }).email : null) || "",
    };
    /* Kapanmış fırsata bağlı teklif: seçenekte de görünsün */
    if (quote.deal && !dealOptions.some((d) => d.id === quote.deal) && q.deal && typeof q.deal === "object") dealOptions.unshift({ id: quote.deal, title: (q.deal as { title: string }).title, contact: quote.contact, company: quote.company, value: 0, service: "" });
  }
  return <QuoteEditor quote={quote} deals={dealOptions} canDelete={ctx.isTenantAdmin} />;
}
