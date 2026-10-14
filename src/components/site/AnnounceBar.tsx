"use client";

import { useEffect, useState } from "react";

const EVERY = 15_000;

/**
 * Sayfanın en üstünde ince lacivert duyuru bandı. Birden fazla cümle varsa
 * 15 saniyede bir yumuşak geçişle sıradakine döner; üzerine gelince ya da
 * sekme arka plandayken durur. Hareket azaltma tercihinde geçiş animasyonsuz.
 * Ekran okuyucu için tüm cümleler tek listede (görünen metin aria-hidden).
 */
export function AnnounceBar({ messages }: { messages: string[] }) {
  const list = messages.filter(Boolean);
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (list.length < 2 || paused) return;
    const t = window.setInterval(() => {
      if (!document.hidden) setI((n) => (n + 1) % list.length);
    }, EVERY);
    return () => window.clearInterval(t);
  }, [list.length, paused]);

  if (!list.length) return null;
  return (
    <div
      className="relative bg-navy px-3 py-2.5 text-center text-[12px] leading-snug text-white/90 min-[400px]:text-[12.5px] sm:px-4 sm:text-[14px] sm:tracking-[0.01em]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <p className="sr-only">{list.join(" ")}</p>
      {/* Tüm cümleler üst üste: bant yüksekliği en uzun cümleye göre sabit, sayfa zıplamaz */}
      <div className="grid" aria-hidden>
        {list.map((m, n) => (
          <span
            key={n}
            className={`[grid-area:1/1] transition-[opacity,transform] duration-700 ease-out motion-reduce:transition-none ${n === i ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-1 opacity-0"}`}
          >
            {m}
          </span>
        ))}
      </div>
    </div>
  );
}
