"use client";

import { motion, useMotionValue, useSpring } from "motion/react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const EASE = [0.22, 1, 0.36, 1] as const;

type CursorMode = "default" | "hover" | "view";

/**
 * Özel imleç: 8px yeşil nokta + 36px karışım halkası (mix-blend-difference).
 * - Yalnızca pointer:fine + reduced-motion kapalıyken render edilir.
 * - Hover hedefleri (a, button, [data-cursor]) halkayı 2.2x büyütür.
 * - [data-cursor="view"] hedefinde halka dolar ve "İncele" yazısı belirir.
 * - Event delegation ile çalışır; tüm listener'lar cleanup'lıdır.
 */
export function CustomCursor() {
  const [enabled, setEnabled] = useState(false);
  const [visible, setVisible] = useState(false);
  const [mode, setMode] = useState<CursorMode>("default");
  const [pressed, setPressed] = useState(false);

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const ringX = useSpring(x, { stiffness: 320, damping: 28, mass: 0.6 });
  const ringY = useSpring(y, { stiffness: 320, damping: 28, mass: 0.6 });

  useEffect(() => {
    const finePointer = window.matchMedia("(pointer: fine)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setEnabled(finePointer.matches && !reducedMotion.matches);
    sync();
    finePointer.addEventListener("change", sync);
    reducedMotion.addEventListener("change", sync);
    return () => {
      finePointer.removeEventListener("change", sync);
      reducedMotion.removeEventListener("change", sync);
    };
  }, []);

  useEffect(() => {
    if (!enabled) return;

    // Native imleci gizle (cleanup'ta geri gelir).
    const style = document.createElement("style");
    style.textContent =
      "html.gd-cursor, html.gd-cursor * { cursor: none !important; }";
    document.head.appendChild(style);
    document.documentElement.classList.add("gd-cursor");

    const onMove = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      setVisible(true);
    };

    const onOver = (e: MouseEvent) => {
      const target = e.target;
      if (!(target instanceof Element)) return;
      if (target.closest('[data-cursor="view"]')) {
        setMode("view");
      } else if (target.closest("a, button, [data-cursor]")) {
        setMode("hover");
      } else {
        setMode("default");
      }
    };

    const onDown = () => setPressed(true);
    const onUp = () => setPressed(false);
    const onLeave = () => setVisible(false);
    const onEnter = () => setVisible(true);

    document.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseover", onOver, { passive: true });
    document.addEventListener("mousedown", onDown);
    document.addEventListener("mouseup", onUp);
    document.documentElement.addEventListener("mouseleave", onLeave);
    document.documentElement.addEventListener("mouseenter", onEnter);

    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onOver);
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("mouseup", onUp);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      document.documentElement.removeEventListener("mouseenter", onEnter);
      document.documentElement.classList.remove("gd-cursor");
      style.remove();
    };
  }, [enabled, x, y]);

  if (!enabled) return null;

  const ringScale =
    mode === "default" ? (pressed ? 0.85 : 1) : pressed ? 1.9 : 2.2;

  return (
    <>
      {/* Halka */}
      <motion.div
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[120] -ml-[18px] -mt-[18px] size-9"
        style={{ x: ringX, y: ringY }}
        animate={{ opacity: visible ? 1 : 0 }}
        transition={{ duration: 0.2 }}
      >
        <motion.div
          className={cn(
            "absolute inset-0 rounded-full border-[1.5px]",
            mode === "view"
              ? "border-transparent bg-guru"
              : "border-paper mix-blend-difference"
          )}
          animate={{ scale: ringScale }}
          transition={{ type: "spring", stiffness: 300, damping: 22 }}
        />
        <motion.span
          className="absolute inset-0 flex items-center justify-center whitespace-nowrap text-[10px] font-semibold tracking-tight text-ink"
          initial={{ opacity: 0 }}
          animate={{ opacity: mode === "view" ? 1 : 0, scale: mode === "view" ? 1 : 0.6 }}
          transition={{ duration: 0.25, ease: EASE }}
        >
          İncele
        </motion.span>
      </motion.div>

      {/* Nokta */}
      <motion.div
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[121] -ml-1 -mt-1 size-2 rounded-full bg-guru"
        style={{ x, y, boxShadow: "0 0 10px rgb(16 216 108 / 0.8)" }}
        animate={{
          opacity: visible && mode !== "view" ? 1 : 0,
          scale: pressed ? 0.7 : 1,
        }}
        transition={{ duration: 0.15 }}
      />
    </>
  );
}
