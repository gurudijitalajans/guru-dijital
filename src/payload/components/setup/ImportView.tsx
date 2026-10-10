import { redirect } from "next/navigation";
import { DefaultTemplate } from "@payloadcms/next/templates";
import { Gutter } from "@payloadcms/ui";
import type { AdminViewServerProps } from "payload";
import { canReq } from "../../business/roles";
import { scopeOf } from "../tenant-scope";
import { ImportTool } from "./ImportTool";

/** Panel > Veri aktar (/admin/veri-aktar): Excel ya da CSV'den kişi, firma ve fırsat */
export async function ImportView({ initPageResult, params, searchParams }: AdminViewServerProps) {
  const { req, permissions, visibleEntities, locale } = initPageResult;
  if (!req.user) redirect("/admin/login?redirect=%2Fadmin%2Fveri-aktar");
  if (!canReq(req, "crm")) redirect("/admin");
  const scope = await scopeOf(req.payload, req.user);
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
              <h1>Veri aktar</h1>
              <p>{scope.name ? `${scope.name} · ` : ""}Excel ya da CSV dosyasından kişi, firma ve fırsat. Önce önizleyin, sonra aktarın.</p>
            </div>
          </header>
          <ImportTool />
        </div>
      </Gutter>
    </DefaultTemplate>
  );
}
