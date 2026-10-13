import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import type { CollectionSlug, Field, Where } from "payload";
import { Plus } from "lucide-react";
import { getPanelContext } from "@/panel/context";
import { PageHeader } from "@/panel/ui/page-header";
import { Button } from "@/panel/ui/button";
import { RecordList, type ListRow } from "@/panel/forms/RecordList";
import { canOpen, editorHref, ENTITIES } from "@/panel/forms/entities";
import { txt } from "@/panel/forms/schema";
import { cms } from "@/lib/cms";

export const dynamic = "force-dynamic";
const PAGE = 50;
const dateFmt = new Intl.DateTimeFormat("tr-TR", { timeZone: "Europe/Istanbul", day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

type Params = Promise<{ slug: string }>;
type SP = Promise<{ q?: string; sayfa?: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  return { title: ENTITIES[slug]?.list?.title ?? "Kayıtlar" };
}

/** Alan adından düz alan ayarı (satır ve sekmelerin içi dahil) */
function findField(fields: Field[], name: string): Field | undefined {
  for (const f of fields) {
    const x = f as Field & { name?: string; fields?: Field[]; tabs?: { name?: string; fields: Field[] }[] };
    if (x.name === name) return f;
    if ((x.type === "row" || x.type === "collapsible") && x.fields) {
      const r = findField(x.fields, name);
      if (r) return r;
    }
    if (x.type === "tabs") for (const t of x.tabs ?? []) if (!t.name) { const r = findField(t.fields, name); if (r) return r; }
  }
  return undefined;
}

function cell(f: Field | undefined, v: unknown): string {
  if (v === null || v === undefined || v === "") return "";
  const x = f as (Field & { options?: unknown[] }) | undefined;
  if (x?.type === "checkbox") return v ? "Evet" : "Hayır";
  if (x?.type === "date" || (typeof v === "string" && /^\d{4}-\d{2}-\d{2}T/.test(v))) return dateFmt.format(new Date(String(v)));
  if ((x?.type === "select" || x?.type === "radio") && x.options) {
    const label = (val: unknown) => {
      const o = x.options!.find((o) => (typeof o === "string" ? o : (o as { value: string }).value) === val);
      return o ? (typeof o === "string" ? o : (txt((o as { label: unknown }).label) ?? String(val))) : String(val);
    };
    return Array.isArray(v) ? v.map(label).join(", ") : label(v);
  }
  if (typeof v === "number") return v.toLocaleString("tr-TR");
  if (typeof v === "object") {
    if (Array.isArray(v)) return v.map((i) => cell(undefined, i)).join(", ");
    const o = v as Record<string, unknown>;
    return String(o.name ?? o.title ?? o.email ?? o.id ?? "");
  }
  return String(v).slice(0, 160);
}

/** Ayar kayıtlarının listesi: arama, sayfa, satıra tıklayınca düzenleyici */
export default async function RecordsPage({ params, searchParams }: { params: Params; searchParams: SP }) {
  const { slug } = await params;
  const def = ENTITIES[slug];
  if (!def?.list) notFound();
  const ctx = await getPanelContext();
  if (!canOpen(def, ctx) || (def.list.adminOnly && !ctx.isGuruAdmin)) redirect("/panel");
  const sp = await searchParams;
  const q = (sp.q ?? "").trim().slice(0, 80);
  const page = Math.max(1, Number(sp.sayfa) || 1);
  const payload = await cms();
  const conf = payload.collections[slug as CollectionSlug]?.config;
  if (!conf) notFound();

  const and: Where[] = [];
  if (def.tenanted) and.push({ tenant: { equals: ctx.tenant.id } });
  if (q && def.list.search?.length) and.push({ or: def.list.search.map((f) => ({ [f]: { like: q } })) });
  const r = await payload.find({ collection: slug as CollectionSlug, where: and.length ? { and } : undefined, sort: def.list.sort, limit: PAGE, page, depth: 1, user: ctx.user, overrideAccess: false });

  const cols = def.list.columns.map((name) => {
    const f = findField(conf.fields, name);
    const label = name === "createdAt" ? "Oluşturuldu" : name === "updatedAt" ? "Güncellendi" : (txt((f as { label?: unknown } | undefined)?.label) ?? name);
    return { name, label, f };
  });
  const rows: ListRow[] = r.docs.map((d) => {
    const doc = d as unknown as Record<string, unknown>;
    return { id: doc.id as number, href: editorHref(slug, doc.id as number), cells: cols.map((c) => cell(c.f, doc[c.name])) };
  });

  return (
    <>
      <PageHeader
        title={def.list.title}
        description={`${def.tenanted ? `${ctx.tenant.name} · ` : ""}${r.totalDocs.toLocaleString("tr-TR")} kayıt. ${def.list.description ?? ""}`}
        actions={
          def.list.canCreate ? (
            <Button asChild variant="primary">
              <Link href={editorHref(slug)}>
                <Plus />
                {`Yeni ${def.label.toLocaleLowerCase("tr-TR")}`}
              </Link>
            </Button>
          ) : null
        }
      />
      <RecordList headers={cols.map((c) => c.label)} rows={rows} q={q} page={page} pages={Math.max(1, r.totalPages)} searchable={Boolean(def.list.search?.length)} />
    </>
  );
}
