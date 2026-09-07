"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(pointer: coarse)";

function subscribe(onChange: () => void) {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

/**
 * SSR güvenli kaba işaretçi (dokunmatik) okuması; usePrefersReducedMotion ile
 * aynı desen. Sunucu anlık görüntüsü her zaman false: ilk render SSR ile
 * birebir aynı başlar, gerçek değer hydration sonrası tek re-render ile gelir.
 */
export function useCoarsePointer(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => false
  );
}
