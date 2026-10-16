"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { usePathname, useRouter } from "next/navigation";
import { RefreshRouteOnSave } from "@payloadcms/live-preview-react";
import { Pencil } from "lucide-react";

/**
 * Panel kullanıcısı için sitedeki küçük araçlar; ziyaretçi hiçbirini görmez.
 * - Önizleme (taslak modu): panelin yan yana önizlemesinde kaydedince sayfa
 *   kendini yeniler; panel dışında açıldıysa sol altta "önizlemeden çık" bandı.
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
      {/* Sol altta tek yığın: önizleme bandı ve düzenle düğmesi. Üstte tam genişlik bant yapışkan
          menünün üstüne biniyordu; burada içerik akışını ve sağdaki yüzen düğmeleri etkilemez.
          z-[46]: yüzen düğmeler düzeyinde, mobil menü (75) ve çerez bandı (70) üstte kalır.
          Mobil alt çubuk açıkken onun üstüne çıkar (html[data-cta-bar]). */}
      {((preview && !inFrame) || (editor && !inFrame)) && (
        <div
          data-float=""
          className="fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] left-[max(1rem,env(safe-area-inset-left))] z-[46] flex max-w-[calc(100vw-6.5rem)] flex-col items-start gap-2 transition-[bottom] duration-300 max-lg:[html[data-cta-bar]_&]:bottom-[calc(88px+env(safe-area-inset-bottom))]"
        >
          {preview && !inFrame && (
            <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 rounded-2xl bg-navy px-4 py-2 text-[13px] text-white shadow-[0_12px_30px_-12px_rgb(1_20_65/0.6)]">
              <span>Önizleme: yayınlanmamış taslaklar da görünüyor.</span>
              <a href={`/onizleme/cik?yol=${encodeURIComponent(pathname)}`} className="inline-flex min-h-7 items-center font-medium underline underline-offset-2">
                Önizlemeden çık
              </a>
            </div>
          )}
          {editor && !inFrame && (
            <a
              href={`/panel-duzenle?yol=${encodeURIComponent(pathname)}`}
              className="inline-flex min-h-11 items-center gap-2 rounded-full bg-navy px-4 text-[14px] font-medium text-white shadow-[0_12px_30px_-12px_rgb(1_20_65/0.6)] transition-colors hover:bg-brand"
            >
              <Pencil aria-hidden className="size-4" strokeWidth={2} />
              Bu sayfayı düzenle
            </a>
          )}
        </div>
      )}
    </>
  );
}
