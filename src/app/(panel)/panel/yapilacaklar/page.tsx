import type { Metadata } from "next";
import { requireModule } from "@/panel/context";
import { PageHeader } from "@/panel/ui/page-header";
import { Yapilacaklar, type TodoRow } from "@/panel/crm/Yapilacaklar";
import { activityLabel } from "@/payload/crm/stages";

export const metadata: Metadata = { title: "Yapılacaklar" };
export const dynamic = "force-dynamic";

const nameOf = (v: unknown) => (v && typeof v === "object" ? ((v as { name?: string; title?: string }).title ?? (v as { name?: string }).name ?? "") : "");
const idOf = (v: unknown) => (v && typeof v === "object" ? ((v as { id?: number }).id ?? null) : ((v as number | null | undefined) ?? null));

/** CRM yapılacakları: arama, toplantı, e-posta ve görevler teslim zamanına göre gruplu */
export default async function TodoPage({ searchParams }: { searchParams: Promise<{ kim?: string }> }) {
  const ctx = await requireModule("crm");
  const sp = await searchParams;
  const all = sp.kim === "herkes";
  const [res, who] = await Promise.all([
    ctx.find("activities", {
      where: { and: [{ done: { equals: false } }, { type: { in: ["gorev", "arama", "toplanti", "eposta"] } }, ...(all ? [] : [{ owner: { equals: ctx.user.id } }])] },
      sort: "dueAt",
      limit: 500,
      depth: 1,
    }),
    ctx.names(),
  ]);
  const rows: TodoRow[] = (res.docs as { id: number; type: string; title: string; body?: string | null; dueAt?: string | null; owner?: unknown; deal?: unknown; contact?: unknown }[]).map((a) => ({
    id: a.id,
    type: a.type,
    typeLabel: activityLabel(a.type),
    title: a.title,
    body: a.body && a.body !== a.title ? a.body : "",
    due: a.dueAt ?? null,
    owner: who(a.owner),
    link: idOf(a.deal) ? { href: `/panel/firsatlar?firsat=${idOf(a.deal)}`, label: nameOf(a.deal) } : idOf(a.contact) ? { href: `/panel/kisiler?kisi=${idOf(a.contact)}`, label: nameOf(a.contact) } : null,
  }));
  return (
    <>
      <PageHeader title="Yapılacaklar" description="Aramalar, toplantılar ve takip görevleri teslim zamanına göre. Tamamlarken sonucu yazın; fırsatın akışına işlenir." />
      <Yapilacaklar rows={rows} all={all} />
    </>
  );
}
