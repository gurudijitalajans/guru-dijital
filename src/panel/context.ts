import "server-only";
import { cache } from "react";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import type { CollectionSlug, PayloadRequest, Where } from "payload";
import type { Tenant, User } from "@/payload-types";
import { cms } from "@/lib/cms";
import { can as canIn, isAdminUser, isTenantAdmin, tenantRow, type Module } from "@/payload/business/roles";

/**
 * Yeni panelin (/panel) tek giriş noktası: oturum, seçili işletme ve modül
 * yetkisi. Payload'un girişi, yetki kuralları ve çok kiracılı eklentisi aynen
 * kullanılır; panel yalnız ekranları değiştirir.
 *
 * Veri okumanın kuralı: her sorgu kullanıcının kendi yetkisiyle
 * (overrideAccess: false) ve seçili işletmeyle süzülerek çalışır. Yerel API
 * yetkiyi kendiliğinden atlar; bu yüzden sorgular yalnız `ctx.find` ve
 * `ctx.count` üzerinden yapılır.
 */

export const TENANT_COOKIE = "payload-tenant";

/** Giriş ekranı; girişten sonra dönülecek panel adresiyle (yalnız /panel altı) */
export const loginHref = (path?: string | null) => (path && path.startsWith("/panel") && path !== "/panel" ? `/giris?sonra=${encodeURIComponent(path)}` : "/giris");

export type TenantOption = { id: number; name: string; slug: string; modules: string[] };

export type PanelContext = {
  user: User;
  isGuruAdmin: boolean;
  tenant: TenantOption;
  tenants: TenantOption[];
  isGuruTenant: boolean;
  isTenantAdmin: boolean;
  /** Seçili işletmede açık ve kullanıcıya verilmiş modül */
  has: (m: Module) => boolean;
  find: <C extends CollectionSlug>(collection: C, args?: { where?: Where; sort?: string; limit?: number; page?: number; depth?: number; select?: Record<string, boolean> }) => ReturnType<Awaited<ReturnType<typeof cms>>["find"]>;
  count: (collection: CollectionSlug, where?: Where) => Promise<number>;
  findByID: <C extends CollectionSlug>(collection: C, id: number | string, depth?: number) => Promise<unknown | null>;
  /** Seçili işletmede yeni kayıt (işletme zorla atanır), kullanıcının yetkisiyle */
  create: (collection: CollectionSlug, data: Record<string, unknown>) => Promise<unknown>;
  /** Seçili işletmenin ekibi (görev sorumlusu ve ekip yükü için): yalnız ad ve haftalık saat */
  team: () => Promise<{ id: number; name: string; weeklyHours: number }[]>;
  /** Kişi adı çözücü (ekip + Guru yöneticileri). İlişki doldurma yetkiye takılabildiği için adlar buradan okunur */
  names: () => Promise<(v: unknown) => string>;
  /** Yalnız seçili işletmenin kaydı güncellenir; değilse null */
  update: (collection: CollectionSlug, id: number | string, data: Record<string, unknown>) => Promise<unknown | null>;
};

const toOption = (t: Tenant): TenantOption => ({ id: t.id, name: t.name, slug: t.slug, modules: (t.modules ?? []) as string[] });

/** Oturum yoksa Payload'un giriş ekranına, sonra panele geri */
export const getPanelContext = cache(async (): Promise<PanelContext> => {
  const payload = await cms();
  const h = await headers();
  const { user } = await payload.auth({ headers: h });
  if (!user || user.collection !== "users") redirect(loginHref(h.get("x-panel-path")));
  const u = user as unknown as User;
  const guruAdmin = isAdminUser(u);

  /* Kullanıcının işletmeleri: Guru yöneticisi hepsini görür */
  const ids = guruAdmin ? null : (u.tenants ?? []).map((r) => (typeof r.tenant === "object" ? r.tenant?.id : r.tenant)).filter(Boolean);
  const list = await payload.find({
    collection: "tenants",
    where: ids ? { id: { in: ids } } : undefined,
    sort: "name",
    limit: 500,
    depth: 0,
    pagination: false,
    overrideAccess: true,
  });
  const tenants = list.docs.filter((t) => t.status !== "askida" || guruAdmin).map(toOption);
  if (!tenants.length) redirect("/giris?durum=isletme-yok");

  /* Seçili işletme: çerez (üye olduğu ya da Guru yöneticisi), yoksa Guru Dijital ya da ilk işletme */
  const jar = await cookies();
  const raw = Number(jar.get(TENANT_COOKIE)?.value);
  const tenant =
    tenants.find((t) => t.id === raw) ?? (guruAdmin ? tenants.find((t) => t.slug === "guru") : undefined) ?? tenants[0];
  const isGuruTenant = tenant.slug === "guru";

  const has = (m: Module) => {
    if (!canIn(u, m, guruAdmin ? undefined : tenant.id)) return false;
    return m === "site" ? isGuruTenant : tenant.modules.includes(m);
  };

  /* Payload'un yetki kuralları seçili işletmeyi çerezden okur: isteğe başlıkları veriyoruz */
  const req = { headers: h, user: u } as unknown as Partial<PayloadRequest>;
  const scoped = (where?: Where): Where => ({ and: [{ tenant: { equals: tenant.id } }, ...(where ? [where] : [])] });
  /* Kaydı yetkiyle okur; başka işletmenin kaydı yokmuş gibi döner */
  const own = async (collection: CollectionSlug, id: number | string, depth: number) => {
    const doc = await payload.findByID({ collection, id, depth, user: u, req, overrideAccess: false }).catch(() => null);
    const t = doc && (doc as { tenant?: unknown }).tenant;
    const tid = t && typeof t === "object" ? (t as { id: number }).id : t;
    return doc && String(tid) === String(tenant.id) ? doc : null;
  };

  /* Ad haritası: işletme ekibi ve tüm Guru yöneticileri (işletme satırları yoktur) */
  const people = cache(async () => {
    const r = await payload.find({
      collection: "users",
      where: { or: [{ "tenants.tenant": { equals: tenant.id } }, { role: { equals: "admin" } }] },
      limit: 500,
      depth: 0,
      pagination: false,
      overrideAccess: true,
      select: { name: true },
    });
    return new Map(r.docs.map((x) => [x.id, x.name]));
  });

  return {
    user: u,
    isGuruAdmin: guruAdmin,
    tenant,
    tenants,
    isGuruTenant,
    isTenantAdmin: isTenantAdmin(u, guruAdmin ? undefined : tenant.id),
    has,
    find: ((collection: CollectionSlug, args: { where?: Where; sort?: string; limit?: number; page?: number; depth?: number; select?: Record<string, boolean> } = {}) =>
      payload.find({
        collection,
        where: scoped(args.where),
        sort: args.sort,
        limit: args.limit ?? 50,
        page: args.page,
        depth: args.depth ?? 0,
        ...(args.select ? { select: args.select as never } : {}),
        user: u,
        req,
        overrideAccess: false,
      })) as PanelContext["find"],
    count: async (collection, where) =>
      (await payload.count({ collection, where: scoped(where), user: u, req, overrideAccess: false })).totalDocs,
    findByID: (collection, id, depth = 1) => own(collection, id, depth),
    team: cache(async () => {
      /* Guru Dijital'in ekibinde Guru yöneticileri de var (işletme satırları olmadan her işletmeye erişirler) */
      const r = await payload.find({
        collection: "users",
        where: { or: [{ "tenants.tenant": { equals: tenant.id } }, ...(isGuruTenant ? [{ role: { equals: "admin" } }] : [])] },
        sort: "name",
        limit: 300,
        depth: 0,
        pagination: false,
        overrideAccess: true,
        select: { name: true, weeklyHours: true },
      });
      return r.docs.map((x) => ({ id: x.id, name: x.name, weeklyHours: x.weeklyHours ?? 40 }));
    }),
    names: async () => {
      const map = await people();
      return (v: unknown) => {
        if (v && typeof v === "object" && (v as { name?: string }).name) return (v as { name: string }).name;
        const id = v && typeof v === "object" ? (v as { id?: number }).id : (v as number | null | undefined);
        return id ? (map.get(Number(id)) ?? "") : "";
      };
    },
    create: (collection, data) => payload.create({ collection, data: { ...data, tenant: tenant.id } as never, user: u, req, overrideAccess: false }),
    update: async (collection, id, data) => {
      if (!(await own(collection, id, 0))) return null;
      const { tenant: _drop, ...rest } = data;
      void _drop;
      return payload.update({ collection, id, data: rest as never, user: u, req, overrideAccess: false });
    },
  };
});

/** Sayfanın modülü kapalıysa ana sayfaya */
export async function requireModule(m: Module) {
  const ctx = await getPanelContext();
  if (!ctx.has(m)) redirect("/panel");
  return ctx;
}

export const userHasTenant = (user: User, id: number) => isAdminUser(user) || Boolean(tenantRow(user, id));
