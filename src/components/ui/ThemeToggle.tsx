"use client";

import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Gündüz/gece anahtarı. İkon görünürlüğü tamamen CSS'e bırakılır
 * (.theme-icon-* + html.light kuralları): SSR ile ilk istemci render'ı
 * birebir aynıdır, state yoktur, hydration riski sıfırdır.
 * Tercih localStorage("guru-theme") ile kalıcıdır; ilk boyamadan önce
 * layout'taki inline script uygular (flash yok).
 */
export function ThemeToggle({ className }: { className?: string }) {
  const toggle = () => {
    const root = document.documentElement;
    const toLight = !root.classList.contains("light");
    root.classList.toggle("light", toLight);
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
      aria-label="Gündüz / gece modunu değiştir"
      data-cursor
      className={cn(
        "relative flex size-11 items-center justify-center rounded-full border border-fg/25 text-fg/80 transition-colors duration-300 hover:border-guru hover:text-guru",
        className
      )}
    >
      <Sun className="theme-icon-sun size-[18px]" strokeWidth={2} />
      <Moon className="theme-icon-moon size-[18px]" strokeWidth={2} />
    </button>
  );
}
