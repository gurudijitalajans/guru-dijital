"use client";

import { useInView } from "motion/react";
import { useCallback, useEffect, useRef } from "react";

/** Varsayılan karakter havuzu — scramble sırasında rastgele seçilir. */
const DEFAULT_CHARSET = "abcdefghijklmnoprstuvyzXO#%&*+=0123456789";

export type ScrambleProps = {
  /** Çözülecek nihai metin (Türkçe karakterler desteklenir). */
  text: string;
  className?: string;
  /** Scramble sırasında kullanılacak karakter havuzu. */
  charset?: string;
  /** Çözülme süresi (saniye). */
  duration?: number;
  /** Görünüme girdikten sonra bekleme (saniye). */
  delay?: number;
  /** true: yalnızca ilk görünümde oynar; false: her girişte tekrar oynar. */
  once?: boolean;
  /** Render edilecek etiket. */
  as?: "span" | "p" | "div";
};

/**
 * Scramble — metin şifre-çözme (decrypt) efekti.
 * - HYDRATION: SSR ve ilk istemci render'ında DÜZ NİHAİ METİN basılır; efekt
 *   yalnızca mount + görünüme girme sonrası başlar (birebir eşleşme garantili).
 * - Ara kareler React state'i yerine text node'un `data`sına imperatif yazılır:
 *   kare başına re-render yok, react-hooks/set-state-in-effect ihlali yok.
 *   (textContent yerine `Text.data` mutasyonu — React'in sahip olduğu text
 *   node korunur, prop değişiminde React güncellemeye devam edebilir.)
 * - Görünüme girince rAF döngüsüyle karakterler soldan sağa rastgele
 *   karakterlerden geçerek çözülür (ease-out cephe ilerleyişi).
 * - Reduced-motion tercihi mount sonrası matchMedia ile okunur; varsa efekt
 *   hiç oynamaz, metin düz kalır.
 * - Türkçe karakterler (ğüşıöçİ) Array.from ile code-point bazlı işlenir.
 * - Erişilebilirlik: kapsayıcıda aria-label={text}; karışık ara kareler
 *   ekran okuyucudan gizlenir (aria-hidden iç span — yapı hep aynı).
 */
export function Scramble({
  text,
  className,
  charset = DEFAULT_CHARSET,
  duration = 0.9,
  delay = 0,
  once = true,
  as = "span",
}: ScrambleProps) {
  // Değişken JSX etiketi için tip daraltma (runtime'da p/div de olabilir).
  const Tag = as as "span";

  const ref = useRef<HTMLSpanElement>(null);
  const innerRef = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once, margin: "-10% 0px" });

  const playedRef = useRef(false);
  const rafRef = useRef(0);
  const timeoutRef = useRef<number | undefined>(undefined);

  // Ara kareyi DOM'a yazar; React'in text node'unu silmeden `data` günceller.
  const writeFrame = useCallback((value: string) => {
    const el = innerRef.current;
    if (!el) return;
    const node = el.firstChild;
    if (node && node.nodeType === Node.TEXT_NODE) {
      (node as Text).data = value;
    } else {
      el.textContent = value;
    }
  }, []);

  useEffect(() => {
    if (!inView) {
      // once=false: görünümden çıkınca tekrar oynayabilsin.
      if (!once) playedRef.current = false;
      return;
    }
    if (playedRef.current) return;
    playedRef.current = true;

    // Reduced-motion mount sonrası okunur — DOM hiç değişmez, efekt atlanır.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Grapheme/code-point bazlı bölme: "ğüşıöçİ" gibi karakterler bozulmaz.
    const glyphs = Array.from(text);
    const pool = Array.from(charset);
    if (glyphs.length === 0 || pool.length === 0) return;

    const total = Math.max(duration, 0.01) * 1000;
    let start = 0;

    const step = (now: number) => {
      if (!start) start = now;
      const p = Math.min((now - start) / total, 1);
      // ease-out: çözülme cephesi başta hızlı, sonda yumuşak ilerler.
      const eased = 1 - Math.pow(1 - p, 3);
      const front = Math.floor(eased * glyphs.length);

      if (p >= 1) {
        writeFrame(text);
        return;
      }

      let out = "";
      for (let i = 0; i < glyphs.length; i++) {
        const ch = glyphs[i];
        // Boşluklar scramble edilmez → satır kırılımı ve genişlik stabil kalır.
        if (i < front || /\s/.test(ch)) {
          out += ch;
        } else {
          // Rastgelelik yalnızca burada (rAF içinde) — SSR'a asla sızmaz.
          out += pool[Math.floor(Math.random() * pool.length)];
        }
      }
      writeFrame(out);
      rafRef.current = requestAnimationFrame(step);
    };

    timeoutRef.current = window.setTimeout(() => {
      rafRef.current = requestAnimationFrame(step);
    }, delay * 1000);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.clearTimeout(timeoutRef.current);
      // Yarıda kesilirse (unmount / görünümden çıkış / prop değişimi) düz metne dön.
      writeFrame(text);
    };
  }, [inView, text, charset, duration, delay, once, writeFrame]);

  return (
    <Tag ref={ref} className={className} aria-label={text}>
      <span aria-hidden ref={innerRef}>
        {text}
      </span>
    </Tag>
  );
}
