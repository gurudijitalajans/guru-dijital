"use client";

import { useEffect } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";
import { LiquidImage } from "@/components/fx/LiquidImage";
import { RotatingBadge } from "@/components/fx/RotatingBadge";
import { cn } from "@/lib/utils";

/**
 * HeroCollage: hero'nun sağ sütununda yüzen üç iş karesi + dönen rozet.
 *
 * - Kareler alttan üste clip-path ile açılır (mount'ta, gecikmeli).
 * - İmleç parallax'ı: window pointermove → -1..1 normalize edilmiş konum,
 *   yay (spring) ile yumuşatılır; her kare kendi derinliğine göre kayar.
 *   Yalnız pointer:fine ve reduced-motion kapalıyken dinlenir (matchMedia
 *   yalnız useEffect'te okunur; SSR ve ilk istemci render'ı birebir aynı).
 * - Görseller dekoratif (alt=""); rozet erişilebilir bir link olarak kalır.
 */

const EASE = [0.22, 1, 0.36, 1] as const;

type Frame = {
  src: string;
  className: string;
  depth: number;
};

const FRAMES: Frame[] = [
  {
    src: "/work/ambalaj-etiket.webp",
    className: "left-0 top-[6%] w-[62%] aspect-[16/9] rotate-[-3deg]",
    depth: 0.4,
  },
  {
    src: "/work/web-mockup-dark.webp",
    className: "right-0 top-[36%] w-[58%] aspect-[8/7] rotate-[2deg]",
    depth: 0.7,
  },
  {
    src: "/work/instagram-post-kare.webp",
    className: "left-[6%] bottom-[4%] w-[40%] aspect-[4/3] rotate-[-1deg]",
    depth: 1,
  },
];

function CollageFrame({
  frame,
  index,
  sx,
  sy,
}: {
  frame: Frame;
  index: number;
  sx: MotionValue<number>;
  sy: MotionValue<number>;
}) {
  const x = useTransform(sx, (v) => v * 14 * frame.depth);
  const y = useTransform(sy, (v) => v * 10 * frame.depth);

  return (
    <motion.div
      className={cn("absolute will-change-transform", frame.className)}
      style={{ x, y }}
      initial={{ clipPath: "inset(100% 0 0 0)", opacity: 0 }}
      animate={{ clipPath: "inset(0 0 0 0)", opacity: 1 }}
      transition={{ duration: 0.9, delay: 0.9 + index * 0.15, ease: EASE }}
    >
      <LiquidImage
        src={frame.src}
        alt=""
        sizes="320px"
        className="h-full w-full rounded-2xl border border-fg/10 shadow-[0_30px_80px_-30px_color-mix(in_oklab,var(--color-ink)_45%,transparent)]"
      />
    </motion.div>
  );
}

export function HeroCollage({ className }: { className?: string }) {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 120, damping: 18 });
  const sy = useSpring(my, { stiffness: 120, damping: 18 });

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    let attached = false;

    const onMove = (e: PointerEvent) => {
      mx.set((e.clientX / window.innerWidth) * 2 - 1);
      my.set((e.clientY / window.innerHeight) * 2 - 1);
    };
    const attach = () => {
      if (attached) return;
      window.addEventListener("pointermove", onMove, { passive: true });
      attached = true;
    };
    const detach = () => {
      if (!attached) return;
      window.removeEventListener("pointermove", onMove);
      mx.set(0);
      my.set(0);
      attached = false;
    };
    const sync = () => {
      if (fine.matches && !reduce.matches) attach();
      else detach();
    };
    sync();
    fine.addEventListener("change", sync);
    reduce.addEventListener("change", sync);
    return () => {
      fine.removeEventListener("change", sync);
      reduce.removeEventListener("change", sync);
      detach();
    };
  }, [mx, my]);

  return (
    <div
      className={cn(
        /* Genişlik: sütuna sığar, yükseklik hero'nun dikey boşluğunu aşmaz
           (4/5 oran → yükseklik = genişlik * 1.25 ≤ 100svh - 15rem). */
        "relative aspect-[4/5] w-[min(100%,calc((100svh_-_15rem)*0.8))] max-w-[520px] justify-self-end",
        className
      )}
    >
      {FRAMES.map((frame, i) => (
        <CollageFrame key={frame.src} frame={frame} index={i} sx={sx} sy={sy} />
      ))}

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 1.55, ease: EASE }}
        className="absolute -bottom-5 right-[8%] z-10"
      >
        <RotatingBadge size={116} />
      </motion.div>
    </div>
  );
}
