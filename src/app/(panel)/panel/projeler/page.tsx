import type { Metadata } from "next";
import { requireModule } from "@/panel/context";
import { PageHeader } from "@/panel/ui/page-header";
import { ProjectsView, type ProjectRow, type ProjectDetail } from "@/panel/ops/ProjectsView";
import { dayOf } from "@/payload/ops/dates";

export const metadata: Metadata = { title: "Projeler" };
export const dynamic = "force-dynamic";

const nameOf = (v: unknown) => (v && typeof v === "object" ? ((v as { name?: string; title?: string }).name ?? (v as { title?: string }).title ?? "") : "");
const idOf = (v: unknown) => (v && typeof v === "object" ? ((v as { id?: number }).id ?? null) : ((v as number | null | undefined) ?? null));

/** Projeler: ilerleme (görevlerden), geciken görev, teslim; ayrıntıda görevler ve hızlı görev */
export default async function ProjectsPage({ searchParams }: { searchParams: Promise<{ proje?: string; yeni?: string; firsat?: string }> }) {
  const ctx = await requireModule("ops");
  const sp = await searchParams;
  const today = dayOf(new Date());
  const [res, team, templates, deals, who] = await Promise.all([
    ctx.find("projects", { sort: "-createdAt", limit: 500, depth: 1 }),
    ctx.team(),
    ctx.find("templates", { sort: "name", limit: 100 }),
    ctx.has("crm") ? ctx.find("deals", { where: { stage: { in: ["kazanildi", "teklif", "gorusme"] } }, sort: "-updatedAt", limit: 200 }) : Promise.resolve({ docs: [] as unknown[] }),
    ctx.names(),
  ]);
  const ids = (res.docs as { id: number }[]).map((p) => p.id);
  const tasks = ids.length ? await ctx.find("tasks", { where: { project: { in: ids } }, limit: 5000, select: { project: true, stage: true, dueDate: true } }) : { docs: [] };
  const stats = new Map<number, { total: number; done: number; late: number }>();
  for (const t of tasks.docs as { project?: unknown; stage: string; dueDate?: string | null }[]) {
    const pid = idOf(t.project);
    if (!pid) continue;
    const s = stats.get(pid) ?? { total: 0, done: 0, late: 0 };
    s.total++;
    if (t.stage === "tamam") s.done++;
    else if (t.dueDate && dayOf(t.dueDate) < today) s.late++;
    stats.set(pid, s);
  }
  type Raw = { id: number; title: string; status: string; company?: unknown; contact?: unknown; owner?: unknown; deal?: unknown; startDate?: string | null; dueDate?: string | null; description?: string | null; completedAt?: string | null };
  const rows: ProjectRow[] = (res.docs as Raw[]).map((p) => {
    const s = stats.get(p.id) ?? { total: 0, done: 0, late: 0 };
    return { id: p.id, title: p.title, status: p.status, who: nameOf(p.company) || nameOf(p.contact), owner: who(p.owner), due: p.dueDate ? dayOf(p.dueDate) : null, late: Boolean(p.dueDate && p.status === "aktif" && dayOf(p.dueDate) < today), total: s.total, done: s.done, lateTasks: s.late };
  });

  let detail: ProjectDetail | null = null;
  if (sp.proje) {
    const p = (await ctx.findByID("projects", sp.proje, 1)) as Raw | null;
    if (p) {
      const list = await ctx.find("tasks", { where: { project: { equals: p.id } }, sort: "dueDate", limit: 200, depth: 1 });
      detail = {
        id: p.id,
        title: p.title,
        status: p.status,
        who: nameOf(p.company) || nameOf(p.contact),
        owner: idOf(p.owner),
        ownerName: who(p.owner),
        deal: idOf(p.deal) ? { id: idOf(p.deal)!, title: nameOf(p.deal) } : null,
        startDate: p.startDate ? dayOf(p.startDate) : "",
        dueDate: p.dueDate ? dayOf(p.dueDate) : "",
        description: p.description ?? "",
        tasks: (list.docs as { id: number; seq?: number | null; title: string; stage: string; dueDate?: string | null; assignee?: unknown }[]).map((t) => ({
          id: t.id,
          code: t.seq ? `G-${t.seq}` : "",
          title: t.title,
          stage: t.stage,
          due: t.dueDate ? dayOf(t.dueDate) : null,
          late: Boolean(t.dueDate && t.stage !== "tamam" && dayOf(t.dueDate) < today),
          assignee: who(t.assignee),
        })),
      };
    }
  }
  const fromDeal = sp.yeni && sp.firsat ? Number(sp.firsat) : null;

  return (
    <>
      <PageHeader title="Projeler" description="Müşteri işleri ve iç projeler. Şablonla açılan projenin adımları görev olur; ilerleme görevlerden hesaplanır." />
      <ProjectsView
        rows={rows}
        detail={detail}
        team={team.map((m) => ({ id: m.id, name: m.name }))}
        templates={(templates.docs as { id: number; name: string }[]).map((t) => ({ id: t.id, name: t.name }))}
        deals={(deals.docs as { id: number; title: string }[]).map((d) => ({ id: d.id, title: d.title }))}
        me={ctx.user.id}
        canDelete={ctx.isTenantAdmin}
        startNew={Boolean(sp.yeni)}
        fromDeal={fromDeal}
      />
    </>
  );
}
