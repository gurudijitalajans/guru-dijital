"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@payloadcms/ui";
import { useTenantSelection } from "@payloadcms/plugin-multi-tenant/client";
import { can as canIn, isAdminUser, isTenantAdmin, type Module } from "../business/roles";

/**
 * Payload içerik ekranının menüsü: en üstte yeni panele dönüş, sonra sitenin
 * sayfaları (yalnız Guru Dijital). Buradaki kayıtlar Payload'un kendi menü gruplarında tekrar
 * görünmez (admin.group: false); kalan gruplar altta durur.
 */
const PAGES = [
  { href: "/admin/globals/home-page", label: "Ana Sayfa" },
  { href: "/admin/globals/about-page", label: "Hakkımızda" },
  { href: "/admin/collections/services", label: "Hizmetler" },
  { href: "/admin/collections/products", label: "Ürünler" },
  { href: "/admin/collections/references", label: "Referanslar" },
  { href: "/admin/collections/posts", label: "Blog yazıları" },
];

/* Payload'un menü gruplarındaki kayıtlar: hangi modüle bağlı (menünün tek süzgeci burası) */
const SLUG_MODULE: Record<string, Module> = {
  leads: "crm", bookings: "crm", deals: "crm", contacts: "crm", companies: "crm", quotes: "crm", activities: "crm",
  projects: "ops", tasks: "ops", templates: "ops",
  conversations: "chat", knowledge: "chat", "chatbot-config": "chat",
  team: "site", "case-studies": "site", testimonials: "site", references: "site", services: "site", products: "site", posts: "site",
  media: "site", categories: "site", "payload-folders": "site", "global-home-page": "site", "global-about-page": "site", "global-site-settings": "site",
};
type TenantInfo = { id: string; slug: string; modules: string[] };
/* Günlük kayıtlar yeni panelde (/panel): Payload'un menüsünde gösterilmez, eski adresleri panele yönlenir (next.config.ts) */
const IN_PANEL = new Set(["leads", "bookings", "deals", "contacts", "companies", "quotes", "activities", "projects", "tasks", "conversations"]);

const Icon = ({ d }: { d: string }) => (
  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

export function PanelNav() {
  const pathname = usePathname();
  const { user } = useAuth();
  /* Yetki üstteki işletme seçicisinde seçili işletmeye göre */
  const { selectedTenantID } = useTenantSelection();
  const scoped = isAdminUser(user) ? undefined : selectedTenantID;
  /* Seçili işletmenin açık modülleri: Guru yöneticisi her şeye yetkili olsa da menü işletmenin modüllerini gösterir */
  const [tenant, setTenant] = useState<TenantInfo | null>(null);
  useEffect(() => {
    /* Seçim yokken eski bilgi kullanılmaz (tenantHas işletme kimliğini karşılaştırır) */
    if (!selectedTenantID) return;
    let live = true;
    fetch(`/api/tenants/${selectedTenantID}?depth=0`, { credentials: "same-origin" })
      .then((r) => (r.ok ? r.json() : null))
      .then((t) => live && setTenant(t ? { id: String(t.id), slug: t.slug, modules: t.modules ?? [] } : null))
      .catch(() => live && setTenant(null));
    return () => {
      live = false;
    };
  }, [selectedTenantID]);
  const tenantHas = (m: Module) => !tenant || String(tenant.id) !== String(selectedTenantID) || (m === "site" ? tenant.slug === "guru" : tenant.modules.includes(m));
  const can = (u: unknown, m: Module) => canIn(u, m, scoped) && tenantHas(m);
  const tenantAdmin = isTenantAdmin(user, scoped);
  /* Payload'un gruplarındaki kayıtlar da aynı kurala göre: yetkisi olmayan bağlantı ve boş kalan grup gizlenir */
  const visible = (key: string) => {
    if (SLUG_MODULE[key]) return can(user, SLUG_MODULE[key]);
    if (key === "business-config") return tenantAdmin && can(user, "business");
    if (key === "site-connection") return can(user, "crm") || can(user, "chat");
    if (key === "users") return tenantAdmin;
    return true;
  };
  const hiddenIds = Object.keys(SLUG_MODULE)
    .concat(["business-config", "site-connection", "users"])
    .filter((k) => !visible(k) || IN_PANEL.has(k))
    .map((k) => `#nav-${k}`);
  const navCss = hiddenIds.length
    ? `${hiddenIds.join(",")}{display:none!important}.nav-group:not(:has(.nav__link:not(${hiddenIds.join(",")}))){display:none!important}${visible("payload-folders") ? "" : ".browse-by-folder-button{display:none!important}"}`
    : "";
  /* Sitedeki "Bu sayfayı düzenle" bağlantısı için işaret: yalnız panele girmiş tarayıcıda olur, kimlik bilgisi taşımaz */
  useEffect(() => {
    document.cookie = "guru-panel=1; path=/; max-age=2592000; samesite=lax";
  }, []);
  const isActive = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname === href || pathname.startsWith(href + "/"));
  return (
    <div className="guru-nav">
      {navCss ? <style>{navCss}</style> : null}
      {/* Günlük işler yeni panelde; burada site içeriği, medya ve ayarlar */}
      <a href="/panel" className="guru-nav__main guru-nav__new">
        <Icon d="M19 12H5M11 18l-6-6 6-6" />
        Panele dön
      </a>
      {can(user, "site") && (
        <>
        <p className="guru-nav__label">Sayfalar</p>
        <ul className="guru-nav__list">
          {PAGES.map((p) => (
            <li key={p.href}>
              <Link href={p.href} className="guru-nav__link" aria-current={isActive(p.href) ? "page" : undefined}>
                {p.label}
              </Link>
            </li>
          ))}
        </ul>
        </>
      )}
    </div>
  );
}
