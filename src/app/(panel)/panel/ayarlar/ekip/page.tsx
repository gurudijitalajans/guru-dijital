import type { Metadata } from "next";
import { redirect } from "next/navigation";
import type { Where } from "payload";
import { getPanelContext } from "@/panel/context";
import { PageHeader } from "@/panel/ui/page-header";
import { TeamPanel, type Member } from "@/panel/setup/TeamPanel";
import { MODULES } from "@/payload/business/roles";
import { cms } from "@/lib/cms";

export const metadata: Metadata = { title: "Ekip ve yetkiler" };
export const dynamic = "force-dynamic";

/** Seçili işletmenin kullanıcıları ve davet. İşletme yöneticisi ve Guru yöneticisi. */
export default async function TeamPage() {
  const ctx = await getPanelContext();
  if (!ctx.isTenantAdmin) redirect("/panel/ayarlar");
  const payload = await cms();
  /* Guru yöneticileri işletme satırı olmadan her işletmeye erişir: Guru Dijital'in ekibinde ayrıca listelenir */
  const where: Where = ctx.isGuruTenant ? { or: [{ "tenants.tenant": { equals: ctx.tenant.id } }, { role: { equals: "admin" } }] } : { "tenants.tenant": { equals: ctx.tenant.id } };
  const [users, editors] = await Promise.all([
    payload.find({ collection: "users", where, sort: "name", limit: 500, depth: 0, pagination: false, overrideAccess: true }),
    ctx.isGuruAdmin ? payload.find({ collection: "users", where: { role: { equals: "editor" } }, sort: "name", limit: 1000, depth: 0, pagination: false, overrideAccess: true }) : Promise.resolve({ docs: [] as never[] }),
  ]);
  const orphans = editors.docs.filter((u) => !(u.tenants ?? []).length).map((u) => ({ id: u.id, name: u.name, email: u.email }));
  const open = new Set<string>([...ctx.tenant.modules, ...(ctx.isGuruTenant ? ["site"] : [])]);
  const members: Member[] = users.docs.map((u) => {
    const row = (u.tenants ?? []).find((r) => String(typeof r.tenant === "object" ? r.tenant?.id : r.tenant) === String(ctx.tenant.id));
    return { id: u.id, name: u.name, email: u.email, role: u.role === "admin" ? "guru" : (row?.role ?? "uye"), modules: (row?.modules ?? []) as string[], pending: Boolean(u.invitePending), self: u.id === ctx.user.id };
  });
  return (
    <>
      <PageHeader title="Ekip ve yetkiler" description={`${ctx.tenant.name} · ${members.length} kişi. Davet ettiğiniz kişi e-postadaki bağlantıdan parolasını belirler.`} />
      <TeamPanel
        members={members}
        modules={MODULES.filter((m) => open.has(m.value)).map((m) => ({ value: m.value, label: m.label }))}
        emailReady={Boolean(process.env.RESEND_API_KEY)}
        canEditUsers={ctx.isGuruAdmin}
        orphans={orphans}
      />
    </>
  );
}
