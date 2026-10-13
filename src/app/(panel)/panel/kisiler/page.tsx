import type { Metadata } from "next";
import Link from "next/link";
import type { Where } from "payload";
import { requireModule } from "@/panel/context";
import { PageHeader } from "@/panel/ui/page-header";
import { Button } from "@/panel/ui/button";
import { PeopleView, type CompanyRow, type PersonRow, type Selected } from "@/panel/people/PeopleView";
import { SOURCES, stageLabel, activityLabel } from "@/payload/crm/stages";

export const metadata: Metadata = { title: "Kişiler ve firmalar" };
export const dynamic = "force-dynamic";

const SOURCE = Object.fromEntries(SOURCES.map((s) => [s.value, s.label]));
const PAGE = 50;
const dateFmt = new Intl.DateTimeFormat("tr-TR", { timeZone: "Europe/Istanbul", day: "numeric", month: "short", year: "numeric" });
const nameOf = (v: unknown) => (v && typeof v === "object" ? (v as { name?: string }).name ?? "" : "");
const idOf = (v: unknown) => (v && typeof v === "object" ? (v as { id?: number }).id : (v as number | undefined));

type SP = Promise<{ q?: string; gorunum?: string; sayfa?: string; kisi?: string; firma?: string }>;

/** Kişiler ve firmalar: arama, iki görünüm, satıra tıklayınca sağdan ayrıntı */
export default async function PeoplePage({ searchParams }: { searchParams: SP }) {
  const ctx = await requireModule("crm");
  const sp = await searchParams;
  const q = (sp.q ?? "").trim().slice(0, 80);
  const view = sp.gorunum === "firmalar" ? "firmalar" : "kisiler";
  const page = Math.max(1, Number(sp.sayfa) || 1);

  const like = (fields: string[]): Where | undefined => (q ? { or: fields.map((f) => ({ [f]: { like: q } })) } : undefined);
  const [people, companies] = await Promise.all([
    view === "kisiler" ? ctx.find("contacts", { where: like(["name", "email", "phone", "title"]), sort: "name", limit: PAGE, page, depth: 1 }) : null,
    view === "firmalar" ? ctx.find("companies", { where: like(["name", "sector", "email"]), sort: "name", limit: PAGE, page }) : null,
  ]);
  const [contactTotal, companyTotal] = await Promise.all([ctx.count("contacts"), ctx.count("companies")]);

  const personRows: PersonRow[] = (people?.docs ?? []).map((d) => {
    const c = d as { id: number; name: string; title?: string | null; email?: string | null; phone?: string | null; company?: unknown; source?: string | null };
    return { id: c.id, name: c.name, title: c.title ?? "", email: c.email ?? "", phone: c.phone ?? "", company: nameOf(c.company), source: c.source ? (SOURCE[c.source] ?? c.source) : "" };
  });
  const companyRows: CompanyRow[] = (companies?.docs ?? []).map((d) => {
    const c = d as { id: number; name: string; sector?: string | null; email?: string | null; phone?: string | null; website?: string | null };
    return { id: c.id, name: c.name, sector: c.sector ?? "", email: c.email ?? "", phone: c.phone ?? "", website: c.website ?? "" };
  });

  /* Açık kayıt (adres satırında ?kisi= ya da ?firma=): seçili işletmede ve yetkiyle okunur */
  let selected: Selected | null = null;
  if (sp.kisi) {
    const c = (await ctx.findByID("contacts", sp.kisi, 1)) as { id: number; name: string; title?: string | null; email?: string | null; phone?: string | null; company?: unknown; source?: string | null; notes?: string | null; tags?: string[] | null; createdAt: string } | null;
    if (c) {
      const [deals, acts] = await Promise.all([
        ctx.find("deals", { where: { contact: { equals: c.id } }, sort: "-updatedAt", limit: 10 }),
        ctx.find("activities", { where: { contact: { equals: c.id } }, sort: "-createdAt", limit: 8 }),
      ]);
      selected = {
        kind: "person",
        id: c.id,
        title: c.name,
        subtitle: [c.title, nameOf(c.company)].filter(Boolean).join(" · ") || "Bireysel müşteri",
        fields: [
          ["E-posta", c.email ?? ""],
          ["Telefon", c.phone ?? ""],
          ["Firma", nameOf(c.company)],
          ["Kaynak", c.source ? (SOURCE[c.source] ?? c.source) : ""],
          ["Etiketler", (c.tags ?? []).join(", ")],
          ["Eklenme", dateFmt.format(new Date(c.createdAt))],
        ],
        notes: c.notes ?? "",
        companyId: idOf(c.company) ?? null,
        deals: deals.docs.map((x) => {
          const d = x as { id: number; title: string; stage: string; value?: number | null };
          return { id: d.id, title: d.title, stage: stageLabel(d.stage), value: d.value ?? 0 };
        }),
        timeline: acts.docs.map((x) => {
          const a = x as { id: number; title: string; type: string; createdAt: string };
          return { id: a.id, title: a.title, detail: `${activityLabel(a.type)} · ${dateFmt.format(new Date(a.createdAt))}` };
        }),
        editHref: `/panel/duzenle/contacts/${c.id}`,
      };
    }
  } else if (sp.firma) {
    const c = (await ctx.findByID("companies", sp.firma, 0)) as { id: number; name: string; sector?: string | null; email?: string | null; phone?: string | null; website?: string | null; address?: string | null; taxOffice?: string | null; taxNumber?: string | null; notes?: string | null } | null;
    if (c) {
      const [members, deals] = await Promise.all([
        ctx.find("contacts", { where: { company: { equals: c.id } }, sort: "name", limit: 20 }),
        ctx.find("deals", { where: { company: { equals: c.id } }, sort: "-updatedAt", limit: 10 }),
      ]);
      selected = {
        kind: "company",
        id: c.id,
        title: c.name,
        subtitle: c.sector || "Firma",
        fields: [
          ["E-posta", c.email ?? ""],
          ["Telefon", c.phone ?? ""],
          ["Web sitesi", c.website ?? ""],
          ["Adres", c.address ?? ""],
          ["Vergi", [c.taxOffice, c.taxNumber].filter(Boolean).join(" / ")],
        ],
        notes: c.notes ?? "",
        companyId: null,
        people: members.docs.map((x) => {
          const p = x as { id: number; name: string; title?: string | null };
          return { id: p.id, name: p.name, title: p.title ?? "" };
        }),
        deals: deals.docs.map((x) => {
          const d = x as { id: number; title: string; stage: string; value?: number | null };
          return { id: d.id, title: d.title, stage: stageLabel(d.stage), value: d.value ?? 0 };
        }),
        timeline: [],
        editHref: `/panel/duzenle/companies/${c.id}`,
      };
    }
  }

  const total = view === "kisiler" ? (people?.totalDocs ?? 0) : (companies?.totalDocs ?? 0);
  return (
    <>
      <PageHeader
        title="Kişiler ve firmalar"
        description={`${contactTotal.toLocaleString("tr-TR")} kişi · ${companyTotal.toLocaleString("tr-TR")} firma`}
        actions={
          <>
            <Button asChild>
              <Link href="/panel/ayarlar/veri-aktar" prefetch={false}>
                Excel&apos;den aktar
              </Link>
            </Button>
            <Button asChild variant="primary">
              <Link href={view === "kisiler" ? "/panel/duzenle/contacts" : "/panel/duzenle/companies"} prefetch={false}>
                {view === "kisiler" ? "Yeni kişi" : "Yeni firma"}
              </Link>
            </Button>
          </>
        }
      />
      <PeopleView view={view} q={q} page={page} pages={Math.max(1, Math.ceil(total / PAGE))} total={total} people={personRows} companies={companyRows} selected={selected} />
    </>
  );
}
