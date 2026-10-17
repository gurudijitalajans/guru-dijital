import Link from "next/link";
import type { Metadata } from "next";
import { requireModule } from "@/panel/context";
import { PageHeader } from "@/panel/ui/page-header";
import { DealsView, type BoardDeal, type DealDetail } from "@/panel/deals/DealsView";
import { stageLabel } from "@/payload/crm/stages";
import { buildFeed } from "@/panel/crm/feed";
import { daysAgoIso } from "@/payload/utils";

export const metadata: Metadata = { title: "Fırsatlar" };
export const dynamic = "force-dynamic";

const nameOf = (v: unknown) => (v && typeof v === "object" ? ((v as { name?: string }).name ?? "") : "");
const idOf = (v: unknown) => (v && typeof v === "object" ? ((v as { id?: number }).id ?? null) : ((v as number | null | undefined) ?? null));
const dateFmt = new Intl.DateTimeFormat("tr-TR", { timeZone: "Europe/Istanbul", day: "numeric", month: "short", year: "numeric" });
const QUOTE: Record<string, string> = { taslak: "Taslak", gonderildi: "Gönderildi", kabul: "Kabul", red: "Red" };

/** Fırsatlar: açık fırsatlar aşama sütunlarında; kazanılan ve kaybedilenler son 30 gün */
export default async function DealsPage({ searchParams }: { searchParams: Promise<{ firsat?: string; gorunum?: string }> }) {
  const ctx = await requireModule("crm");
  const sp = await searchParams;
  const [res, openActs, who] = await Promise.all([
    ctx.find("deals", { where: { or: [{ stage: { in: ["aday", "gorusme", "teklif"] } }, { closedAt: { greater_than_equal: daysAgoIso(30) } }] }, sort: "order", limit: 500, depth: 1 }),
    /* Açık görevler: kartta "Geciken görev" ve "Görev yok" rozetleri */
    ctx.find("activities", { where: { and: [{ done: { equals: false } }, { deal: { exists: true } }, { type: { in: ["gorev", "arama", "toplanti", "eposta"] } }] }, limit: 1000, select: { deal: true, dueAt: true } }),
    ctx.names(),
  ]);
  const nowIso = new Date().toISOString();
  const lateSet = new Set((openActs.docs as { deal?: unknown; dueAt?: string | null }[]).filter((a) => a.dueAt && a.dueAt <= nowIso).map((a) => String(idOf(a.deal))));
  const taskSet = new Set((openActs.docs as { deal?: unknown }[]).map((a) => String(idOf(a.deal))));
  const deals: BoardDeal[] = (res.docs as { id: number; title: string; stage: string; value?: number | null; order?: number | null; contact?: unknown; company?: unknown; owner?: unknown; expectedClose?: string | null; updatedAt: string; closedAt?: string | null; stageChangedAt?: string | null; createdAt: string }[]).map((d) => ({
    id: d.id,
    title: d.title,
    stage: d.stage,
    value: d.value ?? 0,
    order: d.order ?? null,
    who: nameOf(d.company) || nameOf(d.contact),
    owner: idOf(d.owner),
    ownerName: who(d.owner),
    expectedClose: d.expectedClose ?? null,
    updatedAt: d.updatedAt,
    closedAt: d.closedAt ?? null,
    lateTask: lateSet.has(String(d.id)),
    noTask: !taskSet.has(String(d.id)),
    stageSince: d.stageChangedAt ?? d.createdAt,
  }));

  let detail: DealDetail | null = null;
  if (sp.firsat) {
    const d = (await ctx.findByID("deals", sp.firsat, 1)) as {
      id: number; title: string; stage: string; value?: number | null; service?: string | null; notes?: string | null; lostReason?: string | null; expectedClose?: string | null; contact?: unknown; company?: unknown; owner?: unknown; lead?: unknown; createdAt: string;
    } | null;
    if (d) {
      const [feed, quotes, projects] = await Promise.all([
        buildFeed({ deal: d.id }),
        ctx.find("quotes", { where: { deal: { equals: d.id } }, sort: "-createdAt", limit: 10 }),
        ctx.has("ops") ? ctx.find("projects", { where: { deal: { equals: d.id } }, limit: 5 }) : Promise.resolve({ docs: [] as unknown[] }),
      ]);
      const contact = d.contact && typeof d.contact === "object" ? (d.contact as { id: number; name: string; email?: string | null; phone?: string | null }) : null;
      detail = {
        id: d.id,
        title: d.title,
        stage: d.stage,
        stageLabel: stageLabel(d.stage),
        value: d.value ?? 0,
        service: d.service ?? "",
        notes: d.notes ?? "",
        lostReason: d.lostReason ?? "",
        expectedClose: d.expectedClose ? d.expectedClose.slice(0, 10) : "",
        who: nameOf(d.company) || nameOf(d.contact),
        contact: contact ? { id: contact.id, name: contact.name, email: contact.email ?? "", phone: contact.phone ?? "" } : null,
        company: d.company && typeof d.company === "object" ? { id: (d.company as { id: number }).id, name: nameOf(d.company) } : null,
        ownerName: who(d.owner),
        ownerId: idOf(d.owner),
        created: dateFmt.format(new Date(d.createdAt)),
        leadKey: idOf(d.lead) ? `t${idOf(d.lead)}` : null,
        feed,
        quotes: (quotes.docs as { id: number; number?: string | null; title: string; total?: number | null; status: string }[]).map((q) => ({ id: q.id, number: q.number ?? "", title: q.title, total: q.total ?? 0, status: QUOTE[q.status] ?? q.status })),
        projects: (projects.docs as { id: number; title: string }[]).map((p) => ({ id: p.id, title: p.title })),
      };
    }
  }

  return (
    <>
      <PageHeader
        title="Fırsatlar"
        description="Kartı sürükleyerek aşamasını değiştirin. Pano ve liste aynı kayıtları gösterir."
        actions={
          <Link href="/panel/firsatlar/analiz" className="text-[14px] font-medium text-accent">
            Kazanma ve kaybetme analizi
          </Link>
        }
      />
      <DealsView deals={deals} detail={detail} me={ctx.user.id} hasOps={ctx.has("ops")} canDelete={ctx.isTenantAdmin} team={(await ctx.team()).map((m) => ({ id: m.id, name: m.name }))} initialView={sp.gorunum === "liste" ? "liste" : "pano"} />
    </>
  );
}
