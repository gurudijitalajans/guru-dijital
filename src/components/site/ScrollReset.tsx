"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Sayfa değişince pencerenin en üstüne anında döner. Next yalnız yeni
 * bölümün başına kaydırır; üstteki duyuru bandı ve yapışkan menü yüzünden
 * sayfa birkaç piksel aşağıdan açılıyordu. Adreste #bölüm varsa dokunmaz.
 */
export function ScrollReset() {
  const pathname = usePathname();
  useEffect(() => {
    if (window.location.hash) return;
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);
  return null;
}
