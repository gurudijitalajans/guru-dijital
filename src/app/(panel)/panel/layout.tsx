import type { Where } from "payload";
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
  /* Bekleyen sayısı gelen kutusundaki Bekleyen süzgeciyle aynı: spam ve ertelenmiş kayıt sayılmaz */
  const now = new Date().toISOString();
  const waiting: Where = { and: [{ or: [{ spam: { equals: false } }, { spam: { exists: false } }] }, { or: [{ snoozedUntil: { exists: false } }, { snoozedUntil: { less_than_equal: now } }] }] };
  /* Yapılacaklar: bana ait, bugün bitmesi gereken ya da geciken açık işler (İstanbul günü) */
  const endOfToday = `${new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Istanbul" }).format(new Date())}T23:59:59+03:00`;
  const [convs, leads, books, todo] = await Promise.all([
    ctx.has("chat") ? ctx.count("conversations", { and: [{ needsReply: { equals: true } }, waiting] }) : 0,
    ctx.has("crm") ? ctx.count("leads", { and: [{ status: { equals: "yeni" } }, waiting] }) : 0,
    ctx.has("crm") ? ctx.count("bookings", { status: { equals: "bekliyor" } }) : 0,
    ctx.has("crm") ? ctx.count("activities", { and: [{ done: { equals: false } }, { owner: { equals: ctx.user.id } }, { type: { in: ["gorev", "arama", "toplanti", "eposta"] } }, { dueAt: { less_than_equal: new Date(endOfToday).toISOString() } }] }) : 0,
  ]);
  for (const g of nav)
    for (const it of g.items) {
      if (it.id === "inbox") it.count = convs + leads + books;
      if (it.id === "todo") it.count = todo;
    }
  const toShell = (t: TenantOption): ShellTenant => ({ id: t.id, name: t.name, detail: detail(t) });
  const row = tenantRow(ctx.user, ctx.tenant.id);
  const role = ctx.isGuruAdmin ? "Guru yöneticisi" : row?.role === "yonetici" ? "İşletme yöneticisi" : "Ekip üyesi";
  return (
    <Shell nav={nav} tenant={toShell(ctx.tenant)} tenants={ctx.tenants.map(toShell)} user={{ name: ctx.user.name, initials: initials(ctx.user.name), role }}>
      {children}
    </Shell>
  );
}
