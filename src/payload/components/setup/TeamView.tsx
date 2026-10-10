import { redirect } from "next/navigation";
import { DefaultTemplate } from "@payloadcms/next/templates";
import { Gutter } from "@payloadcms/ui";
import type { AdminViewServerProps } from "payload";
import { isAdminUser, isTenantAdminReq, MODULES } from "../../business/roles";
import { scopeOf } from "../tenant-scope";
import { TeamTool, type Member } from "./TeamTool";

/** Panel > Ekibim (/admin/ekip): işletmenin kullanıcıları ve davet. İşletme yöneticisi ve Guru yöneticisi. */
export async function TeamView({ initPageResult, params, searchParams }: AdminViewServerProps) {
  const { req, permissions, visibleEntities, locale } = initPageResult;
  if (!req.user) redirect("/admin/login?redirect=%2Fadmin%2Fekip");
  if (!isTenantAdminReq(req)) redirect("/admin");
  const scope = await scopeOf(req.payload, req.user);
  const [users, tenant] = await Promise.all([
    req.payload.find({ collection: "users", where: { "tenants.tenant": { equals: scope.tenantId } }, sort: "name", limit: 500, depth: 0, pagination: false, req, overrideAccess: true }),
    req.payload.findByID({ collection: "tenants", id: scope.tenantId, depth: 0, req, overrideAccess: true }),
  ]);
  const open = new Set<string>([...(tenant.modules ?? []), ...(scope.isGuru ? ["site"] : [])]);
  const members: Member[] = users.docs.map((u) => {
    const row = (u.tenants ?? []).find((r) => String(typeof r.tenant === "object" ? r.tenant?.id : r.tenant) === String(scope.tenantId));
    return { id: u.id, name: u.name, email: u.email, role: row?.role ?? "uye", modules: (row?.modules ?? []) as string[], pending: Boolean(u.invitePending), self: u.id === req.user!.id };
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
            canEditUsers={isAdminUser(req.user)}
          />
        </div>
      </Gutter>
    </DefaultTemplate>
  );
}
