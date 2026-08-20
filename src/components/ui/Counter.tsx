"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "motion/react";

/** Counts up when scrolled into view. Supports decimal targets (54.5). */
export function Counter({
  value,
  duration = 1.8,
  prefix = "",
  suffix = "",
  className,
}: {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const [display, setDisplay] = useState("0");
  const decimals = value % 1 === 0 ? 0 : 1;

  useEffect(() => {
    if (!inView) return;
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / (duration * 1000));
      const eased = 1 - Math.pow(2, -10 * t); // easeOutExpo
      const current = value * (t === 1 ? 1 : eased);
      setDisplay(
        current.toLocaleString("tr-TR", {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        })
      );
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value, duration, decimals]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {display}
      {suffix}
    </span>
  );
}
