"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

/* Footer'ın en alt satırı (telif + yasal bağlantılar) */
const FOOT_ROW = 'footer nav[aria-label="Alt bağlantılar"]';

/**
 * Sağ alttaki yüzen düğmelerin (WhatsApp, sohbet balonu) kenara çekilmesi gereken anlar:
 * - 1360px altında (düğmeler içerik sütununun kenarına binebilir) bir form ya da [data-hide-floats] ekrandayken: tarih seçici, gönder
 *   düğmesi gibi alanların üstüne binmesinler
 * - sayfa sonunda footer'ın alt bağlantı satırı ekrandayken: son bağlantılar (Çerez
 *   tercihleri vb.) düğmelerin altında kalıp tıklanamaz olmasın
 */
export function useFloatsAway() {
  const pathname = usePathname();
  const [away, setAway] = useState(false);
  useEffect(() => {
    const forms = new Set<Element>();
    let foot = false;
    const update = () => setAway(foot || (forms.size > 0 && window.innerWidth < 1360));
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.target.matches(FOOT_ROW)) foot = e.isIntersecting;
        else if (e.isIntersecting) forms.add(e.target);
        else forms.delete(e.target);
      }
      update();
    });
    const t = window.setTimeout(() => document.querySelectorAll(`main form, [data-hide-floats], ${FOOT_ROW}`).forEach((el) => io.observe(el)), 300);
    window.addEventListener("resize", update);
    return () => {
      window.clearTimeout(t);
      io.disconnect();
      window.removeEventListener("resize", update);
    };
  }, [pathname]);
  return away;
}

/* Yüzen düğmelerin konumu ve görünürlüğü. Mobilde alt eylem çubuğu görünürken (MobileCtaBar html'e
   data-cta-bar koyar) onun üstüne çıkar, çubuk yokken ekranın altına iner; ikisi de
   ana ekran çubuğu (safe-area) payını içerir. lg ve üstünde çubuk yok. */
export const floatPos = {
  /* tek düğme ya da yığının alttaki (sohbet) */
  low: "bottom-[calc(1rem+env(safe-area-inset-bottom))] max-lg:[html[data-cta-bar]_&]:bottom-[calc(88px+env(safe-area-inset-bottom))] lg:bottom-6",
  /* sohbet balonunun üstündeki WhatsApp düğmesi (56 + 16 px yukarıda) */
  high: "bottom-[calc(5.5rem+env(safe-area-inset-bottom))] max-lg:[html[data-cta-bar]_&]:bottom-[calc(160px+env(safe-area-inset-bottom))] lg:bottom-[96px]",
  right: "right-[max(1rem,env(safe-area-inset-right))] lg:right-6",
  /* Mobilde hero geçilene kadar gizli (MobileCtaBar html'e data-floats koyar); varsayılan
     gizli olduğu için yüklenirken bir görünüp kaybolmaz */
  wait: "max-lg:[html:not([data-floats])_&]:pointer-events-none max-lg:[html:not([data-floats])_&]:translate-y-4 max-lg:[html:not([data-floats])_&]:opacity-0",
};
