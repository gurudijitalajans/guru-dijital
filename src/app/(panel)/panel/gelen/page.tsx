import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getPanelContext } from "@/panel/context";
import { PageHeader } from "@/panel/ui/page-header";
import { Inbox, type FilterDef } from "@/panel/inbox/Inbox";
import { getThread, listInbox, type InboxFilter } from "@/panel/inbox/actions";

export const metadata: Metadata = { title: "Gelen kutusu" };
export const dynamic = "force-dynamic";

/** Gelen kutusu: sohbet (Chatbot), talep ve randevu (CRM) tek listede */
export default async function InboxPage({ searchParams }: { searchParams: Promise<{ f?: string; s?: string }> }) {
  const ctx = await getPanelContext();
  const chat = ctx.has("chat");
  const crm = ctx.has("crm");
  if (!chat && !crm) redirect("/panel");
  const sp = await searchParams;
  const filters: FilterDef[] = [
    { key: "bekleyen", label: "Bekleyen" },
    ...(chat ? [{ key: "benim" as const, label: "Bana atanan" }, { key: "sohbet" as const, label: "Sohbetler" }] : []),
    ...(crm ? [{ key: "talep" as const, label: "Talepler" }, { key: "randevu" as const, label: "Randevular" }] : []),
    { key: "kapanan", label: "Kapanan" },
    { key: "ertelenen", label: "Ertelenen" },
    { key: "spam", label: "Spam" },
    { key: "tumu", label: "Tümü" },
  ];
  const filter = (filters.some((f) => f.key === sp.f) ? sp.f : "bekleyen") as InboxFilter;
  const [page, thread] = await Promise.all([listInbox(filter), sp.s ? getThread(sp.s) : Promise.resolve(null)]);
  return (
    <>
      <PageHeader title="Gelen kutusu" description={chat && crm ? "Sitedeki sohbetler, form talepleri ve randevular tek listede." : chat ? "Sitedeki sohbetler." : "Form talepleri ve randevular tek listede."} />
      <Inbox filters={filters} initialFilter={filter} initialPage={page} me={ctx.user.id} initialThread={thread} canDelete={ctx.isTenantAdmin} />
    </>
  );
}
