import type { Access, FieldAccess, Where } from "payload";

/* Rol modeli: "admin" (yönetici) her şeyi yapar; "editor" içerik ve
   müşteri kayıtlarıyla çalışır, kullanıcı ve silme işlemleri yöneticide. */
export type Role = "admin" | "editor";

type MaybeUser = { role?: Role | null } | null | undefined;
const roleOf = (user: unknown) => (user as MaybeUser)?.role;

export const isLoggedIn: Access = ({ req }) => Boolean(req.user);
export const isAdmin: Access = ({ req }) => roleOf(req.user) === "admin";
export const isAdminField: FieldAccess = ({ req }) => roleOf(req.user) === "admin";
export const isLoggedInField: FieldAccess = ({ req }) => Boolean(req.user);

/** Ziyaretçi yalnız yayındaki kaydı görür; panel kullanıcısı taslakları da. */
export const publishedOrLoggedIn: Access = ({ req }) => {
  if (req.user) return true;
  const where: Where = { _status: { equals: "published" } };
  return where;
};

/** Yönetici herkesi, editör yalnız kendi hesabını günceller. */
export const adminOrSelf: Access = ({ req }) => {
  if (!req.user) return false;
  if (roleOf(req.user) === "admin") return true;
  const where: Where = { id: { equals: req.user.id } };
  return where;
};
