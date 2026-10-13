import type { Metadata } from "next";
import { requireModule } from "@/panel/context";
import { PageHeader } from "@/panel/ui/page-header";
import { ImportPanel } from "@/panel/setup/ImportPanel";

export const metadata: Metadata = { title: "Veri aktarma" };
export const dynamic = "force-dynamic";

/** Excel ya da CSV'den kişi, firma ve fırsat: önce önizleme, sonra aktarma */
export default async function ImportPage() {
  const ctx = await requireModule("crm");
  return (
    <>
      <PageHeader title="Veri aktarma" description={`${ctx.tenant.name} · Excel ya da CSV dosyasından kişi, firma ve fırsat. Önce önizleyin, sonra aktarın.`} />
      <ImportPanel />
    </>
  );
}
