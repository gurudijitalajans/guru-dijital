"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { usePathname, useRouter } from "next/navigation";
import { RefreshRouteOnSave } from "@payloadcms/live-preview-react";
import { Pencil } from "lucide-react";

/**
 * Panel kullanıcısı için sitedeki küçük araçlar; ziyaretçi hiçbirini görmez.
 * - Önizleme (taslak modu): panelin yan yana önizlemesinde kaydedince sayfa
 *   kendini yeniler; panel dışında açıldıysa üstte "önizlemeden çık" bandı.
 * - Giriş yapmışken: sol altta "Bu sayfayı düzenle" (panelin ilgili formuna gider).
 * Giriş kontrolü yalnız panelin bıraktığı işaret çerezi varsa yapılır; diğer
 * ziyaretçiler için hiçbir istek atılmaz.
 */
/* Tarayıcı değerleri: sunucuda boş, istemcide gerçek (hydration güvenli, effect içinde setState yok) */
const noop = () => () => {};
const getOrigin = () => window.location.origin;
const getInFrame = () => window.self !== window.top;

export function PanelBar({ preview }: { preview: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const origin = useSyncExternalStore(noop, getOrigin, () => "");
  const inFrame = useSyncExternalStore(noop, getInFrame, () => true);
  const [editor, setEditor] = useState(false);

  useEffect(() => {
    if (!document.cookie.split("; ").some((c) => c === "guru-panel=1")) return;
    let alive = true;
    fetch("/api/users/me", { credentials: "same-origin" })
      .then((r) => (r.ok ? r.json() : null))
      .then((j: { user?: unknown } | null) => {
        if (alive) setEditor(Boolean(j?.user));
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  return (
    <>
      {preview && origin && <RefreshRouteOnSave refresh={() => router.refresh()} serverURL={origin} />}
      {preview && !inFrame && (
        <div className="fixed inset-x-0 top-0 z-[120] flex items-center justify-center gap-3 bg-navy px-4 py-2 text-[13px] text-white">
          <span>Önizleme: yayınlanmamış taslaklar da görünüyor.</span>
          <a href={`/onizleme/cik?yol=${encodeURIComponent(pathname)}`} className="font-medium underline underline-offset-2">
            Önizlemeden çık
          </a>
        </div>
      )}
      {editor && !inFrame && (
        <a
          href={`/panel-duzenle?yol=${encodeURIComponent(pathname)}`}
          className="fixed bottom-[88px] left-4 z-[110] inline-flex lg:bottom-4 min-h-11 items-center gap-2 rounded-full bg-navy px-4 text-[14px] font-medium text-white shadow-[0_12px_30px_-12px_rgb(1_20_65/0.6)] transition-colors hover:bg-brand"
        >
          <Pencil aria-hidden className="size-4" strokeWidth={2} />
          Bu sayfayı düzenle
        </a>
      )}
    </>
  );
}
