import { getPanelContext, type TenantOption } from "@/panel/context";
import { visibleNav } from "@/panel/nav";
import { Shell, type ShellTenant } from "@/panel/shell/Shell";
import { tenantRow } from "@/payload/business/roles";

const MODULE_NAMES: Record<string, string> = { crm: "CRM", chat: "Sohbet", ops: "Operasyon", business: "Raporlar" };
const detail = (t: TenantOption) => (t.slug === "guru" ? "Web sitesi ve tüm modüller" : t.modules.map((m) => MODULE_NAMES[m]).filter(Boolean).join(", ") || "Modül açık değil");
const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toLocaleUpperCase("tr-TR"))
    .join("");

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const ctx = await getPanelContext();
  const nav = visibleNav({ has: ctx.has, isTenantAdmin: ctx.isTenantAdmin });
  /* Gelen kutusunda bekleyen: yanıt bekleyen sohbet, yeni talep, onay bekleyen randevu */
  const [convs, leads, books] = await Promise.all([
    ctx.has("chat") ? ctx.count("conversations", { needsReply: { equals: true } }) : 0,
    ctx.has("crm") ? ctx.count("leads", { status: { equals: "yeni" } }) : 0,
    ctx.has("crm") ? ctx.count("bookings", { status: { equals: "bekliyor" } }) : 0,
  ]);
  for (const g of nav) for (const it of g.items) if (it.id === "inbox") it.count = convs + leads + books;
  const toShell = (t: TenantOption): ShellTenant => ({ id: t.id, name: t.name, detail: detail(t) });
  const row = tenantRow(ctx.user, ctx.tenant.id);
  const role = ctx.isGuruAdmin ? "Guru yöneticisi" : row?.role === "yonetici" ? "İşletme yöneticisi" : "Ekip üyesi";
  return (
    <Shell nav={nav} tenant={toShell(ctx.tenant)} tenants={ctx.tenants.map(toShell)} user={{ name: ctx.user.name, initials: initials(ctx.user.name), role }}>
      {children}
    </Shell>
  );
}
