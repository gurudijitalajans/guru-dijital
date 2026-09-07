"use client";

import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

const THEME_COLOR = { light: "#f6f7f6", dark: "#0e100f" } as const;

/**
 * Gündüz/gece anahtarı. İkon ve erişilebilir etiket görünürlüğü tamamen
 * CSS'e bırakılır (.theme-icon-* + html.light kuralları): SSR ile ilk
 * istemci render'ı birebir aynıdır, state yoktur, hydration riski sıfırdır.
 * Ekran okuyucu, o an görünür olan sr-only metni okur; böylece düğme
 * mevcut durumu ve yapacağı işi bildirir.
 * Tercih localStorage("guru-theme") ile kalıcıdır; ilk boyamadan önce
 * layout'taki inline script uygular (flash yok) ve tarayıcı çubuğu rengi
 * (meta theme-color) temayla birlikte güncellenir.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const toggle = () => {
    const root = document.documentElement;
    const toLight = !root.classList.contains("light");
    root.classList.toggle("light", toLight);
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", toLight ? THEME_COLOR.light : THEME_COLOR.dark);
    try {
      localStorage.setItem("guru-theme", toLight ? "light" : "dark");
    } catch {
      /* gizli mod: tercih bu oturumda sınıf üzerinden yaşar */
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      data-cursor
      className={cn(
        "relative flex size-11 items-center justify-center rounded-full border border-fg/25 text-fg/80 transition-colors duration-300 hover:border-guru hover:text-guru",
        className
      )}
    >
      <Sun className="theme-icon-sun size-[18px]" strokeWidth={2} aria-hidden />
      <Moon className="theme-icon-moon size-[18px]" strokeWidth={2} aria-hidden />
      {/* Gece modunda güneş görünür: eylem "gündüze geç"; gündüzde tersi */}
      <span className="theme-icon-sun sr-only">Gündüz moduna geç</span>
      <span className="theme-icon-moon sr-only">Gece moduna geç</span>
    </button>
  );
}
