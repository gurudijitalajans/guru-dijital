"use client";

import Link from "next/link";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@payloadcms/ui";
import { useTenantSelection } from "@payloadcms/plugin-multi-tenant/client";
import { can as canIn, isAdminUser, isTenantAdmin } from "../business/roles";

/**
 * Menünün başı (kullanıcının modüllerine göre): pano, yönetici panosu, satış hattı, görev panosu, ekip planı, sohbetler, veri aktarma, ekip, ziyaretçi analizi ve sitenin sayfaları, site haritası
 * sırasıyla. Buradaki kayıtlar Payload'un kendi menü gruplarında tekrar
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
  const can = (u: unknown, m: Parameters<typeof canIn>[1]) => canIn(u, m, scoped);
  /* Sitedeki "Bu sayfayı düzenle" bağlantısı için işaret: yalnız panele girmiş tarayıcıda olur, kimlik bilgisi taşımaz */
  useEffect(() => {
    document.cookie = "guru-panel=1; path=/; max-age=2592000; samesite=lax";
  }, []);
  const isActive = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname === href || pathname.startsWith(href + "/"));
  return (
    <div className="guru-nav">
      <Link href="/admin" className="guru-nav__main" aria-current={isActive("/admin") ? "page" : undefined}>
        <Icon d="M3 10.5 12 3l9 7.5V21h-6v-6H9v6H3z" />
        Pano
      </Link>
      {(isAdminUser(user) || (isTenantAdmin(user, scoped) && can(user, "business"))) && (
        <Link href="/admin/yonetici" className="guru-nav__main" aria-current={isActive("/admin/yonetici") ? "page" : undefined}>
          <Icon d="M3 3v18h18M7 15l4-4 3 3 5-6" />
          Yönetici panosu
        </Link>
      )}
      {can(user, "crm") && (
        <Link href="/admin/satis-hatti" className="guru-nav__main" aria-current={isActive("/admin/satis-hatti") ? "page" : undefined}>
          <Icon d="M4 4h4v16H4zM10 4h4v10h-4zM16 4h4v6h-4z" />
          Satış hattı
        </Link>
      )}
      {can(user, "ops") && (
        <Link href="/admin/operasyon" className="guru-nav__main" aria-current={isActive("/admin/operasyon") ? "page" : undefined}>
          <Icon d="M9 11l3 3 8-8M20 12v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h9" />
          Görev panosu
        </Link>
      )}
      {can(user, "ops") && (
        <Link href="/admin/ekip-plani" className="guru-nav__main" aria-current={isActive("/admin/ekip-plani") ? "page" : undefined}>
          <Icon d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />
          Ekip planı
        </Link>
      )}
      {can(user, "chat") && (
        <Link href="/admin/sohbetler" className="guru-nav__main" aria-current={isActive("/admin/sohbetler") ? "page" : undefined}>
          <Icon d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z" />
          Sohbetler
        </Link>
      )}
      {can(user, "crm") && (
        <Link href="/admin/veri-aktar" className="guru-nav__main" aria-current={isActive("/admin/veri-aktar") ? "page" : undefined}>
          <Icon d="M12 3v12M7 10l5 5 5-5M4 21h16" />
          Veri aktar
        </Link>
      )}
      {isTenantAdmin(user, scoped) && (
        <Link href="/admin/ekip" className="guru-nav__main" aria-current={isActive("/admin/ekip") ? "page" : undefined}>
          <Icon d="M16 19v-1a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v1M9 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM22 19v-1a4 4 0 0 0-3-3.9M16 4.1a3 3 0 0 1 0 5.8" />
          Ekibim
        </Link>
      )}
      {can(user, "site") && (
        <Link href="/admin/analiz" className="guru-nav__main" aria-current={isActive("/admin/analiz") ? "page" : undefined}>
          <Icon d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
          Ziyaretçi Analizi
        </Link>
      )}
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
