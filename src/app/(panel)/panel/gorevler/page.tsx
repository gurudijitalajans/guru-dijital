import type { Metadata } from "next";
import { requireModule } from "@/panel/context";
import { PageHeader } from "@/panel/ui/page-header";
import { TasksView, type BoardTask, type TaskDetail } from "@/panel/ops/TasksView";
import { daysAgoIso } from "@/payload/utils";
import { dayOf } from "@/payload/ops/dates";

export const metadata: Metadata = { title: "Görevler" };
export const dynamic = "force-dynamic";

const idOf = (v: unknown) => (v && typeof v === "object" ? ((v as { id?: number }).id ?? null) : ((v as number | null | undefined) ?? null));
const titleOf = (v: unknown) => (v && typeof v === "object" ? ((v as { title?: string; name?: string }).title ?? (v as { name?: string }).name ?? "") : "");

/** Görevler: açık görevler aşama sütunlarında, Tamam sütununda son 14 gün */
export default async function TasksPage({ searchParams }: { searchParams: Promise<{ gorev?: string; gorunum?: string }> }) {
  const ctx = await requireModule("ops");
  const sp = await searchParams;
  const [res, projects, team, who] = await Promise.all([
    ctx.find("tasks", { where: { or: [{ stage: { not_equals: "tamam" } }, { completedAt: { greater_than_equal: daysAgoIso(14) } }] }, sort: "order", limit: 1000, depth: 1 }),
    ctx.find("projects", { where: { status: { in: ["aktif", "beklemede"] } }, sort: "title", limit: 200 }),
    ctx.team(),
    ctx.names(),
  ]);
  const today = dayOf(new Date());
  type Raw = { id: number; seq?: number | null; title: string; stage: string; order?: number | null; priority: string; dueDate?: string | null; startDate?: string | null; hours?: number | null; assignee?: unknown; project?: unknown; checklist?: { text?: string; done?: boolean | null }[] | null; updatedAt: string; completedAt?: string | null };
  const tasks: BoardTask[] = (res.docs as Raw[]).map((t) => {
    const list = t.checklist ?? [];
    return {
      id: t.id,
      code: t.seq ? `G-${t.seq}` : "",
      title: t.title,
      stage: t.stage,
      order: t.order ?? null,
      priority: t.priority,
      due: t.dueDate ? dayOf(t.dueDate) : null,
      late: Boolean(t.dueDate && t.stage !== "tamam" && dayOf(t.dueDate) < today),
      hours: t.hours ?? null,
      assignee: idOf(t.assignee),
      assigneeName: who(t.assignee),
      project: idOf(t.project),
      projectTitle: titleOf(t.project),
      checks: [list.filter((c) => c.done).length, list.length],
      updatedAt: t.updatedAt,
    };
  });

  let detail: TaskDetail | null = null;
  if (sp.gorev) {
    const t = (await ctx.findByID("tasks", sp.gorev, 1)) as (Raw & { description?: string | null; startedAt?: string | null; createdAt: string }) | null;
    if (t) {
      detail = {
        id: t.id,
        code: t.seq ? `G-${t.seq}` : "",
        title: t.title,
        stage: t.stage,
        priority: t.priority,
        startDate: t.startDate ? dayOf(t.startDate) : "",
        dueDate: t.dueDate ? dayOf(t.dueDate) : "",
        hours: t.hours ?? null,
        assignee: idOf(t.assignee),
        project: idOf(t.project),
        projectTitle: titleOf(t.project),
        description: t.description ?? "",
        checklist: (t.checklist ?? []).map((c) => ({ text: c.text ?? "", done: Boolean(c.done) })),
        late: Boolean(t.dueDate && t.stage !== "tamam" && dayOf(t.dueDate) < today),
      };
    }
  }

  return (
    <>
      <PageHeader title="Görevler" description="Kartı sürükleyerek aşamasını değiştirin. Tamam'a yalnız Kontrol'den ve kontrol listesi bitince geçilir." />
      <TasksView
        tasks={tasks}
        detail={detail}
        me={ctx.user.id}
        canDelete={ctx.isTenantAdmin}
        team={team.map((m) => ({ id: m.id, name: m.name }))}
        projects={(projects.docs as { id: number; title: string }[]).map((p) => ({ id: p.id, title: p.title }))}
        initialView={sp.gorunum === "liste" ? "liste" : "pano"}
      />
    </>
  );
}
