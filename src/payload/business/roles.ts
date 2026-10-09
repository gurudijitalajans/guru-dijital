import type { Access, CollectionConfig, GlobalConfig } from "payload";

/**
 * Rol bazlı yetki. Yönetici her şeyi görür. Ekip üyesi yalnız işaretlenen
 * modüllerle çalışır: Site içeriği, Guru CRM, Guru Chatbot, Guru Operation.
 * Modülü olmayan kullanıcı o menü grubunu ve ekranları görmez, kayıtlarını
 * okuyamaz (site içeriğinde yalnız düzenleyemez; yayındaki içerik herkese açık).
 * Rol ve modüller oturum anahtarına yazılır (veritabanına ek sorgu yok).
 */
export const MODULES = [
  { label: "Site içeriği", value: "site" },
  { label: "Guru CRM (satış)", value: "crm" },
  { label: "Guru Chatbot (sohbetler)", value: "chat" },
  { label: "Guru Operation (işler ve görevler)", value: "ops" },
] as const;
export type Module = (typeof MODULES)[number]["value"];
const ALL: Module[] = MODULES.map((m) => m.value);

type U = { role?: string | null; modules?: string[] | null } | null | undefined;

export function userModules(user: unknown): Module[] {
  const u = user as U;
  if (!u) return [];
  if (u.role === "admin") return ALL;
  /* Modül seçilmemiş eski ekip üyesi: yalnız site içeriği */
  const m = (u.modules ?? []).filter((x): x is Module => (ALL as string[]).includes(x));
  return m.length ? m : ["site"];
}
export const can = (user: unknown, mod: Module) => userModules(user).includes(mod);
export const isAdminUser = (user: unknown) => (user as U)?.role === "admin";

type AnyAccess = Access | undefined;
const wrap =
  (fn: AnyAccess, allowed: (user: unknown) => boolean): Access =>
  (args) =>
    allowed(args.req.user) ? (fn ? fn(args) : Boolean(args.req.user)) : false;

/**
 * Koleksiyonu modüle bağlar. privateRead: kayıtlar herkese kapalıysa (CRM,
 * sohbet, operasyon) okuma da modül ister; readAlso: yalnız okuyabilen diğer
 * modüller (ör. operasyon ekibi işin firmasını görebilsin).
 */
export function guardCollection(c: CollectionConfig, mod: Module, opts: { privateRead?: boolean; readAlso?: Module[] } = {}): CollectionConfig {
  const a = c.access ?? {};
  const readers = (user: unknown) => can(user, mod) || (opts.readAlso ?? []).some((m) => can(user, m));
  const hidden = c.admin?.hidden;
  return {
    ...c,
    access: {
      ...a,
      ...(opts.privateRead ? { read: wrap(a.read, readers) } : {}),
      create: wrap(a.create, (u) => can(u, mod)),
      update: wrap(a.update, (u) => can(u, mod)),
      delete: wrap(a.delete, (u) => can(u, mod)),
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
    access: { ...a, update: wrap(a.update as AnyAccess, ok) as never },
    admin: { ...g.admin, hidden: ({ user }) => !ok(user) },
  };
}
