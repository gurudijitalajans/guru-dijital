import type { Metadata } from "next";
import { getPanelContext } from "@/panel/context";
import { PageHeader } from "@/panel/ui/page-header";
import { AccountForms } from "@/panel/auth/AccountForms";
import { Tercihler } from "@/panel/bildirim/Tercihler";
import { getNotifyPrefs } from "@/panel/bildirim/actions";

export const metadata: Metadata = { title: "Hesabım" };
export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const ctx = await getPanelContext();
  return (
    <>
      <PageHeader title="Hesabım" description="Adınız, giriş e-postanız, parolanız ve bildirim tercihleriniz." />
      <AccountForms name={ctx.user.name} email={ctx.user.email} />
      <Tercihler initial={await getNotifyPrefs()} />
    </>
  );
}
