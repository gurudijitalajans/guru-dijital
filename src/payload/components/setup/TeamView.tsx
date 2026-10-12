import { redirect } from "next/navigation";
import { DefaultTemplate } from "@payloadcms/next/templates";
import { Gutter } from "@payloadcms/ui";
import type { AdminViewServerProps, Where } from "payload";
import { isAdminUser, isTenantAdminReq, MODULES } from "../../business/roles";
import { scopeOf } from "../tenant-scope";
import { TeamTool, type Member } from "./TeamTool";

/** Panel > Ekibim (/admin/ekip): işletmenin kullanıcıları ve davet. İşletme yöneticisi ve Guru yöneticisi. */
export async function TeamView({ initPageResult, params, searchParams }: AdminViewServerProps) {
  const { req, permissions, visibleEntities, locale } = initPageResult;
  if (!req.user) redirect("/admin/login?redirect=%2Fadmin%2Fekip");
  if (!isTenantAdminReq(req)) redirect("/admin");
  const scope = await scopeOf(req.payload, req.user);
  const viewerIsGuru = isAdminUser(req.user);
  /* Guru yöneticileri işletme satırı olmadan her işletmeye erişir: Guru Dijital'in ekibinde ayrıca listelenir */
  const where: Where = scope.isGuru ? { or: [{ "tenants.tenant": { equals: scope.tenantId } }, { role: { equals: "admin" } }] } : { "tenants.tenant": { equals: scope.tenantId } };
  const [users, tenant, editors] = await Promise.all([
    req.payload.find({ collection: "users", where, sort: "name", limit: 500, depth: 0, pagination: false, req, overrideAccess: true }),
    req.payload.findByID({ collection: "tenants", id: scope.tenantId, depth: 0, req, overrideAccess: true }),
    /* Hiçbir işletmeye eklenmemiş kullanıcılar (girince hiçbir şey göremez): yalnız Guru yöneticisine */
    viewerIsGuru
      ? req.payload.find({ collection: "users", where: { role: { equals: "editor" } }, sort: "name", limit: 1000, depth: 0, pagination: false, req, overrideAccess: true })
      : Promise.resolve({ docs: [] as never[] }),
  ]);
  const orphans = editors.docs.filter((u) => !(u.tenants ?? []).length).map((u) => ({ id: u.id, name: u.name, email: u.email }));
  const open = new Set<string>([...(tenant.modules ?? []), ...(scope.isGuru ? ["site"] : [])]);
  const members: Member[] = users.docs.map((u) => {
    const row = (u.tenants ?? []).find((r) => String(typeof r.tenant === "object" ? r.tenant?.id : r.tenant) === String(scope.tenantId));
    return { id: u.id, name: u.name, email: u.email, role: u.role === "admin" ? "guru" : (row?.role ?? "uye"), modules: (row?.modules ?? []) as string[], pending: Boolean(u.invitePending), self: u.id === req.user!.id };
  });

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
        <div className="guru-pipe guru-plan">
          <header className="guru-pipe__head">
            <div>
              <h1>Ekibim</h1>
              <p>
                {tenant.name} · {members.length} kişi. Davet ettiğiniz kişi e-postadaki bağlantıdan parolasını belirler.
              </p>
            </div>
          </header>
          <TeamTool
            members={members}
            modules={MODULES.filter((m) => open.has(m.value)).map((m) => ({ value: m.value, label: m.label }))}
            emailReady={Boolean(process.env.RESEND_API_KEY)}
            canEditUsers={viewerIsGuru}
            orphans={orphans}
          />
        </div>
      </Gutter>
    </DefaultTemplate>
  );
}
