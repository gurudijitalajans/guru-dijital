import { redirect } from "next/navigation";
import { DefaultTemplate } from "@payloadcms/next/templates";
import { Gutter } from "@payloadcms/ui";
import type { AdminViewServerProps } from "payload";
import { daysAgoIso } from "../../utils";
import { TaskBoard, type BoardTask } from "./TaskBoard";

/**
 * Panel > Görev panosu (/admin/operasyon). Yapılacak, Devam, Kontrol, Tamam
 * sütunları; Tamam son 14 günle sınırlı. ?is=<iş no> ile tek işin görevleri.
 */
const nameOf = (v: unknown, key = "name") => (v && typeof v === "object" ? String((v as Record<string, unknown>)[key] ?? "") : "");

export async function TaskBoardView({ initPageResult, params, searchParams }: AdminViewServerProps) {
  const { req, permissions, visibleEntities, locale } = initPageResult;
  if (!req.user) redirect("/admin/login?redirect=%2Fadmin%2Foperasyon");

  const [res, projects, users] = await Promise.all([
    req.payload.find({
      collection: "tasks",
      where: { or: [{ stage: { not_equals: "tamam" } }, { completedAt: { greater_than_equal: daysAgoIso(14) } }] },
      sort: "order",
      limit: 1000,
      depth: 1,
      pagination: false,
      req,
    }),
    req.payload.find({ collection: "projects", where: { status: { in: ["aktif", "beklemede"] } }, sort: "title", limit: 200, depth: 0, pagination: false, req, select: { title: true } }),
    req.payload.find({ collection: "users", limit: 100, depth: 0, pagination: false, req, select: { name: true } }),
  ]);

  const tasks: BoardTask[] = res.docs.map((t) => ({
    id: t.id,
    seq: t.seq ?? null,
    title: t.title,
    stage: t.stage,
    priority: t.priority,
    order: t.order ?? null,
    dueDate: t.dueDate ?? null,
    project: t.project && typeof t.project === "object" ? { id: t.project.id, title: t.project.title } : null,
    assignee: t.assignee && typeof t.assignee === "object" ? { id: t.assignee.id, name: nameOf(t.assignee) } : null,
    checklist: { done: (t.checklist ?? []).filter((c) => c.done).length, total: (t.checklist ?? []).length },
    updatedAt: t.updatedAt,
  }));
  const project = typeof searchParams?.is === "string" ? searchParams.is : "";

  return (
    <DefaultTemplate
      i18n={req.i18n}
      locale={locale}
      params={params}
      payload={req.payload}
      permissions={permissions}
      searchParams={searchParams}
      user={req.user ?? undefined}
      visibleEntities={visibleEntities}
    >
      <Gutter>
        <TaskBoard
          tasks={tasks}
          me={req.user.id}
          projects={projects.docs.map((p) => ({ id: p.id, title: p.title }))}
          users={users.docs.map((u) => ({ id: u.id, name: u.name }))}
          initialProject={project}
        />
      </Gutter>
    </DefaultTemplate>
  );
}
