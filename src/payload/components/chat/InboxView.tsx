import Link from "next/link";
import { redirect } from "next/navigation";
import { scopeOf } from "../tenant-scope";
import { canReq } from "../../business/roles";
import { DefaultTemplate } from "@payloadcms/next/templates";
import { Gutter } from "@payloadcms/ui";
import type { AdminViewServerProps } from "payload";
import { aiConfigured } from "../../chat/ai";
import { chatConfigOf } from "../../chat/collections";
import { Inbox } from "./Inbox";

/** Panel > Sohbetler (/admin/sohbetler): sitedeki sohbetlerin gelen kutusu. ?id=<sohbet> ile açılır. */
export async function InboxView({ initPageResult, params, searchParams }: AdminViewServerProps) {
  const { req, permissions, visibleEntities, locale } = initPageResult;
  if (!req.user) redirect("/admin/login?redirect=%2Fadmin%2Fsohbetler");
  /* Modülü olmayan kullanıcı panoya döner */
  if (!canReq(req, "chat")) redirect("/admin");
  /* İşletmeye bağlı sorgular seçili işletmeyle süzülür */
  const scope = await scopeOf(req.payload, req.user);
  const settings = await chatConfigOf(req.payload, scope.tenantId);
  const canned = (settings.cannedReplies ?? []).map((c) => ({ label: c.label, text: c.text }));
  const initial = typeof searchParams?.id === "string" ? searchParams.id : "";

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
        <div className="guru-pipe guru-inbox-page">
          <header className="guru-pipe__head">
            <div>
              <h1>Sohbetler</h1>
              <p>
                {!settings.enabled
                  ? "Sohbet balonu sitede kapalı. Chatbot ayarlarından açabilirsiniz."
                  : aiConfigured()
                    ? "Asistan yanıtlıyor; bilmediği ya da ekibi isteyen sohbetler burada yanıt bekler."
                    : "Yapay zekâ bağlı değil: sitedeki her sohbet doğrudan buraya düşer."}
              </p>
            </div>
            <nav className="guru-pipe__tools" aria-label="Sohbet bağlantıları">
              <Link className="guru-plan__nav" href="/admin/sohbet-raporu">
                Sohbet raporu
              </Link>
              <Link className="guru-plan__nav" href="/admin/collections/chatbot-config">
                Ayarlar
              </Link>
              <Link className="guru-plan__nav" href="/admin/collections/knowledge">
                Bilgi tabanı
              </Link>
            </nav>
          </header>
          <Inbox canned={canned} initialId={initial} tenantId={scope.tenantId} />
        </div>
      </Gutter>
    </DefaultTemplate>
  );
}
