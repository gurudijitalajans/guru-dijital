import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { createLocalReq, getAccessResults, type CollectionSlug, type Field, type GlobalSlug, type TypedUser } from "payload";
import { requireModule } from "@/panel/context";
import { Editor } from "@/panel/forms/Editor";
import { ENTITIES } from "@/panel/forms/entities";
import { defaultsFor, fieldPerms, hasConditions, hiddenPaths, toClientFields, txt } from "@/panel/forms/schema";
import { cms } from "@/lib/cms";

export const dynamic = "force-dynamic";

type Params = Promise<{ slug: string; id?: string[] }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  return { title: ENTITIES[slug]?.label ?? "Düzenle" };
}

/**
 * Panelin genel düzenleyicisi: alanlar Payload'un ayarlarından çizilir,
 * yanında sitenin canlı önizlemesi. /panel/duzenle/home-page,
 * /panel/duzenle/services/12, /panel/duzenle/services (yeni kayıt).
 */
export default async function EditPage({ params }: { params: Params }) {
  const { slug, id: idParts } = await params;
  const def = ENTITIES[slug];
  if (!def) notFound();
  const ctx = await requireModule(def.module);
  if (def.adminOnly && !ctx.isGuruAdmin) redirect("/panel");
  const payload = await cms();
  const user = ctx.user as unknown as TypedUser;
  const req = await createLocalReq({ user }, payload);
  const access = fieldPerms(await getAccessResults({ req }), def.type, slug);
  const opts = { user, overrideAccess: false } as const;

  let fields: Field[];
  let doc: Record<string, unknown> | null;
  let label = def.label;
  let drafts = false;
  const id = idParts?.[0] ? Number(idParts[0]) : null;
  if (def.type === "global") {
    const g = payload.config.globals.find((x) => x.slug === slug);
    if (!g) notFound();
    fields = g.fields;
    doc = (await payload.findGlobal({ slug: slug as GlobalSlug, depth: 0, ...opts })) as unknown as Record<string, unknown>;
  } else {
    const c = payload.collections[slug as CollectionSlug]?.config;
    if (!c) notFound();
    fields = c.fields;
    drafts = Boolean(c.versions?.drafts);
    label = txt(c.labels?.singular) ?? def.label;
    doc = id ? ((await payload.findByID({ collection: slug as CollectionSlug, id, depth: 0, draft: drafts, ...opts }).catch(() => null)) as Record<string, unknown> | null) : null;
    if (id && !doc) notFound();
    if (!id && !access.canCreate) redirect(def.back);
  }
  const data = doc ?? (await defaultsFor(fields, user, payload));
  const operation = def.type === "global" || id ? "update" : "create";
  const title = def.type === "global" ? def.label : doc ? String(doc[def.titleField ?? "id"] ?? label) : `Yeni ${label.toLocaleLowerCase("tr-TR")}`;
  const published = drafts && doc ? await isPublished(payload, slug as CollectionSlug, id!) : null;

  return (
    <Editor
      slug={slug}
      id={id}
      title={title}
      back={def.back}
      fields={toClientFields(fields, access.perms, access.canEdit)}
      initial={data}
      hidden={hiddenPaths(fields, data, data, user, operation)}
      operation={operation}
      drafts={drafts}
      published={published}
      canEdit={access.canEdit}
      previewPath={def.preview?.(data) ?? null}
      clientUpload={Boolean(process.env.BLOB_READ_WRITE_TOKEN)}
      updatedAt={(doc?.updatedAt as string | undefined) ?? null}
      conditional={hasConditions(fields)}
    />
  );
}

/** Kaydın yayındaki hâli var mı (taslak ayrı tutulur) */
async function isPublished(payload: Awaited<ReturnType<typeof cms>>, collection: CollectionSlug, id: number) {
  const main = await payload.findByID({ collection, id, depth: 0, overrideAccess: true, draft: false }).catch(() => null);
  return (main as { _status?: string } | null)?._status === "published";
}
