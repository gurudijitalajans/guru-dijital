import { redirect } from "next/navigation";
import { scopeOf } from "../tenant-scope";
import { canReq } from "../../business/roles";
import { DefaultTemplate } from "@payloadcms/next/templates";
import { Gutter } from "@payloadcms/ui";
import type { AdminViewServerProps } from "payload";
import { daysAgoIso } from "../../utils";
import { PipelineBoard, type BoardDeal } from "./PipelineBoard";

/**
 * Panel > Satış hattı (/admin/satis-hatti). Açık fırsatlar aşama sütunlarında;
 * kart sürüklenerek ya da karttaki aşama seçiciyle (telefonda) taşınır.
 * Kazanılan ve kaybedilenler son 30 günle sınırlı.
 */
const name = (v: unknown) => (v && typeof v === "object" ? ((v as { name?: string }).name ?? "") : "");

export async function SalesPipeline({ initPageResult, params, searchParams }: AdminViewServerProps) {
  const { req, permissions, visibleEntities, locale } = initPageResult;
  if (!req.user) redirect("/admin/login?redirect=%2Fadmin%2Fsatis-hatti");
  /* Modülü olmayan kullanıcı panoya döner */
  if (!canReq(req, "crm")) redirect("/admin");
  /* İşletmeye bağlı sorgular seçili işletmeyle süzülür */
  const scope = await scopeOf(req.payload, req.user);
  const { w } = scope;

  const res = await req.payload.find({
    collection: "deals",
    where: w({ or: [{ stage: { in: ["aday", "gorusme", "teklif"] } }, { closedAt: { greater_than_equal: daysAgoIso(30) } }] }),
    sort: "order",
    limit: 500,
    depth: 1,
    pagination: false,
    req,
  });
  const today = new Date().toISOString();
  const tasks = await req.payload.find({
    collection: "activities",
    where: w({ and: [{ done: { equals: false } }, { deal: { exists: true } }, { dueAt: { less_than_equal: today } }] }),
    limit: 500,
    depth: 0,
    pagination: false,
    req,
  });
  const late = new Set(tasks.docs.map((t) => String(typeof t.deal === "object" ? t.deal?.id : t.deal)));

  const deals: BoardDeal[] = res.docs.map((d) => ({
    id: d.id,
    title: d.title,
    stage: d.stage,
    value: d.value ?? null,
    order: d.order ?? null,
    contact: name(d.contact),
    company: name(d.company),
    owner: typeof d.owner === "object" && d.owner ? { id: d.owner.id, name: d.owner.name } : null,
    expectedClose: d.expectedClose ?? null,
    updatedAt: d.updatedAt,
    late: late.has(String(d.id)),
  }));

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
        <PipelineBoard deals={deals} me={req.user.id} />
      </Gutter>
    </DefaultTemplate>
  );
}
