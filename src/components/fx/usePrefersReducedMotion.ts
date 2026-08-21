"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void) {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

/**
 * SSR güvenli reduced-motion okuması. Sunucu anlık görüntüsü her zaman false
 * olduğundan hydration, SSR HTML'iyle birebir aynı başlar; gerçek tercih
 * hydration sonrası tek re-render ile devreye girer (mismatch üretmez).
 * Effect içinde setState gerektirmediği için react-hooks/set-state-in-effect
 * kuralına da takılmaz.
 */
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => false
  );
}
