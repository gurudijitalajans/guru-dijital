import type { Access, CollectionConfig, GlobalConfig, PayloadRequest } from "payload";

/**
 * Rol ve modül yetkisi (çok kiracılı).
 * - Guru yöneticisi (role: admin): tüm işletmeler, tüm modüller, site içeriği.
 * - İşletme kullanıcısı: her işletmedeki satırında rolü (yönetici ya da üye)
 *   ve modülleri durur. İşletme yöneticisi o işletmenin açık modüllerinin
 *   hepsini alır ve ekibini yönetir; üye yalnız işaretlenen modülleri görür.
 * Yetki, paneldeki seçili işletmeye göre hesaplanır (işletme seçicisinin
 * çerezi); kayıtların işletmeye göre süzülmesini çok kiracılı eklenti yapar.
 * Bu dosya istemci bileşenlerinde de kullanılır: sunucuya özel içe aktarım yok.
 */
export const MODULES = [
  { label: "Site içeriği (yalnız Guru Dijital)", value: "site" },
  { label: "Guru CRM", value: "crm" },
  { label: "Guru Chatbot", value: "chat" },
  { label: "Guru Operation", value: "ops" },
  { label: "Guru Business (yönetici panosu ve raporlar)", value: "business" },
] as const;
export type Module = (typeof MODULES)[number]["value"];
const ALL: Module[] = MODULES.map((m) => m.value);

type Id = number | string;
type Row = { tenant?: unknown; role?: string | null; modules?: string[] | null };
type U = { role?: string | null; tenants?: Row[] | null } | null | undefined;
const tid = (v: unknown) => String(v && typeof v === "object" ? (v as { id?: Id }).id : v);

export const isAdminUser = (user: unknown) => (user as U)?.role === "admin";
const rowsOf = (user: unknown) => ((user as U)?.tenants ?? []) as Row[];

/** Kullanıcının o işletmedeki satırı; işletme verilmezse ilk satır */
export function tenantRow(user: unknown, tenant?: unknown): Row | undefined {
  const rows = rowsOf(user);
  if (tenant === undefined || tenant === null || tenant === "") return rows[0];
  return rows.find((r) => tid(r.tenant) === tid(tenant));
}

/**
 * Kullanıcının modülleri. İşletme verilirse o işletmedeki, verilmezse tüm
 * işletmelerindeki modüllerin birleşimi (menüde gizleme gibi işletmenin
 * bilinmediği yerler için).
 */
export function userModules(user: unknown, tenant?: unknown): Module[] {
  if (!user) return [];
  if (isAdminUser(user)) return ALL;
  const rows = tenant === undefined ? rowsOf(user) : [tenantRow(user, tenant)].filter(Boolean);
  const set = new Set<string>();
  for (const r of rows as Row[]) for (const m of r.modules ?? []) set.add(m);
  return ALL.filter((m) => set.has(m));
}
export const can = (user: unknown, mod: Module, tenant?: unknown) => userModules(user, tenant).includes(mod);
export const isTenantAdmin = (user: unknown, tenant?: unknown) =>
  isAdminUser(user) || (tenant === undefined ? rowsOf(user).some((r) => r.role === "yonetici") : tenantRow(user, tenant)?.role === "yonetici");

/** İşletme seçicisinin çerezi (eklentinin "payload-tenant" çerezi) */
export function selectedTenant(req: Pick<PayloadRequest, "headers" | "user">): string | undefined {
  const raw = req.headers?.get("cookie") ?? "";
  const m = raw.match(/(?:^|;\s*)payload-tenant=([^;]+)/);
  const cookie = m ? decodeURIComponent(m[1]) : "";
  if (cookie && (isAdminUser(req.user) || tenantRow(req.user, cookie))) return cookie;
  const first = tenantRow(req.user);
  return first ? tid(first.tenant) : undefined;
}
/** İstekteki seçili işletmeye göre modül yetkisi */
export const canReq = (req: Pick<PayloadRequest, "headers" | "user">, mod: Module) => can(req.user, mod, isAdminUser(req.user) ? undefined : selectedTenant(req));
export const isTenantAdminReq = (req: Pick<PayloadRequest, "headers" | "user">) => isTenantAdmin(req.user, isAdminUser(req.user) ? undefined : selectedTenant(req));

type AnyAccess = Access | undefined;
const wrap =
  (fn: AnyAccess, allowed: (req: PayloadRequest) => boolean): Access =>
  (args) =>
    allowed(args.req) ? (fn ? fn(args) : Boolean(args.req.user)) : false;

/**
 * Koleksiyonu modüle bağlar. privateRead: kayıtlar herkese kapalıysa (CRM,
 * sohbet, operasyon) okuma da modül ister; readAlso: yalnız okuyabilen diğer
 * modüller (ör. operasyon ekibi işin firmasını görebilsin).
 */
export function guardCollection(c: CollectionConfig, mod: Module, opts: { privateRead?: boolean; readAlso?: Module[] } = {}): CollectionConfig {
  const a = c.access ?? {};
  const readers = (req: PayloadRequest) => canReq(req, mod) || (opts.readAlso ?? []).some((m) => canReq(req, m));
  const hidden = c.admin?.hidden;
  return {
    ...c,
    access: {
      ...a,
      ...(opts.privateRead ? { read: wrap(a.read, readers) } : {}),
      create: wrap(a.create, (req) => canReq(req, mod)),
      update: wrap(a.update, (req) => canReq(req, mod)),
      delete: wrap(a.delete, (req) => canReq(req, mod)),
    },
    admin: {
      ...c.admin,
      hidden: (args) => !can(args.user, mod) || (typeof hidden === "function" ? hidden(args) : Boolean(hidden)),
    },
  };
}

export function guardGlobal(g: GlobalConfig, mod: Module | "admin"): GlobalConfig {
  const a = g.access ?? {};
  const ok = (u: unknown) => (mod === "admin" ? isAdminUser(u) : can(u, mod));
  return {
    ...g,
    access: { ...a, update: wrap(a.update as AnyAccess, (req) => (mod === "admin" ? isAdminUser(req.user) : canReq(req, mod))) as never },
    admin: { ...g.admin, hidden: ({ user }) => !ok(user) },
  };
}
