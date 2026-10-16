"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";

type Shot = { src: string; alt: string; w: number; h: number };

const read = (el: HTMLElement): Shot => ({
  src: el.dataset.zoom ?? "",
  alt: el.dataset.zoomAlt ?? "",
  w: Number(el.dataset.zoomW) || 1600,
  h: Number(el.dataset.zoomH) || 1000,
});

/**
 * Sayfadaki [data-zoom] görselleri tıklanınca tam ekran açar. Aynı kök içindeki
 * görseller sırayla gezilir (oklar, klavye, kaydırma). Esc ile kapanır.
 */
export function LightboxRoot({ children, className }: { children: ReactNode; className?: string }) {
  const root = useRef<HTMLDivElement>(null);
  const [shots, setShots] = useState<Shot[]>([]);
  const [index, setIndex] = useState<number | null>(null);
  const opener = useRef<HTMLElement | null>(null);

  const open = useCallback((el: HTMLElement) => {
    const all = [...(root.current?.querySelectorAll<HTMLElement>("[data-zoom]") ?? [])];
    /* Aynı görsel sayfada iki kez varsa bir kez gezilir */
    const seen = new Set<string>();
    const list = all.map(read).filter((s) => (seen.has(s.src) ? false : (seen.add(s.src), true)));
    opener.current = el;
    setShots(list);
    setIndex(Math.max(0, list.findIndex((s) => s.src === el.dataset.zoom)));
  }, []);

  useEffect(() => {
    const node = root.current;
    if (!node) return;
    const target = (e: Event) => (e.target as HTMLElement).closest<HTMLElement>("[data-zoom]");
    const onClick = (e: MouseEvent) => {
      const el = target(e);
      if (el && node.contains(el)) {
        e.preventDefault();
        open(el);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Enter" && e.key !== " ") return;
      const el = target(e);
      if (el && el === e.target) {
        e.preventDefault();
        open(el);
      }
    };
    node.addEventListener("click", onClick);
    node.addEventListener("keydown", onKey);
    return () => {
      node.removeEventListener("click", onClick);
      node.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const close = useCallback(() => {
    setIndex(null);
    opener.current?.focus({ preventScroll: true });
  }, []);

  return (
    <div ref={root} className={className}>
      {children}
      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {index !== null && shots[index] && (
              <Viewer shots={shots} index={index} onIndex={setIndex} onClose={close} />
            )}
          </AnimatePresence>,
          document.body
        )}
    </div>
  );
}

function Viewer({ shots, index, onIndex, onClose }: { shots: Shot[]; index: number; onIndex: (i: number) => void; onClose: () => void }) {
  const shot = shots[index];
  const many = shots.length > 1;
  const closeBtn = useRef<HTMLButtonElement>(null);
  const touch = useRef<number | null>(null);
  const go = useCallback((d: number) => onIndex((index + d + shots.length) % shots.length), [index, onIndex, shots.length]);

  useEffect(() => {
    const html = document.documentElement;
    const prev = html.style.overflow;
    html.style.overflow = "hidden";
    closeBtn.current?.focus({ preventScroll: true });
    return () => {
      html.style.overflow = prev;
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (many && e.key === "ArrowRight") go(1);
      else if (many && e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, many, onClose]);

  const navBtn =
    "absolute top-1/2 z-10 grid size-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white backdrop-blur transition-colors hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-white";

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      data-lightbox=""
      aria-label={shot.alt || "Görsel"}
      className="fixed inset-0 z-[190] flex flex-col bg-[rgb(0_12_44/0.92)] backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      onTouchStart={(e) => (touch.current = e.touches[0]?.clientX ?? null)}
      onTouchEnd={(e) => {
        const x0 = touch.current;
        touch.current = null;
        const x1 = e.changedTouches[0]?.clientX;
        if (many && x0 !== null && x1 !== undefined && Math.abs(x1 - x0) > 50) go(x1 < x0 ? 1 : -1);
      }}
    >
      {/* Yatay telefonda çentik / Dynamic Island payı (viewportFit: cover) */}
      <div className="flex items-center justify-between gap-4 pb-3 pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] pt-[max(0.75rem,env(safe-area-inset-top))] text-white sm:pl-[max(1.5rem,env(safe-area-inset-left))] sm:pr-[max(1.5rem,env(safe-area-inset-right))]">
        <p className="text-[14px] tabular-nums text-white/70">{many ? `${index + 1} / ${shots.length}` : ""}</p>
        <button
          ref={closeBtn}
          type="button"
          onClick={onClose}
          aria-label="Kapat"
          className="grid size-11 place-items-center rounded-full bg-white/10 transition-colors hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-white"
        >
          <X className="size-5" aria-hidden />
        </button>
      </div>
      <div
        className="relative flex min-h-0 flex-1 items-center justify-center px-4 pb-4 [--lb-gx:2rem] sm:px-20 sm:[--lb-gx:10rem]"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={shot.src}
            className="relative max-h-full max-w-[min(1600px,100%)]"
            /* Kutu, görsel alanının gerçek genişliğine göre (telefonda px-4, sm+ yan oklar için px-20) ve
               1600px sınırıyla boyutlanır: oran korunur, telefonda görsel sayfadakinden küçük açılmaz */
            style={{ aspectRatio: `${shot.w} / ${shot.h}`, height: `min(100%, calc(min(1600px, 100vw - var(--lb-gx)) * ${shot.h / shot.w}))` }}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          >
            <Image src={shot.src} alt={shot.alt} fill sizes="(min-width: 1700px) 1600px, 100vw" className="rounded-xl object-contain sm:rounded-2xl" />
          </motion.div>
        </AnimatePresence>
        {many && (
          <>
            <button type="button" onClick={() => go(-1)} aria-label="Önceki görsel" className={cn(navBtn, "hidden sm:left-[max(1.25rem,env(safe-area-inset-left))] sm:grid")}>
              <ChevronLeft className="size-6" aria-hidden />
            </button>
            <button type="button" onClick={() => go(1)} aria-label="Sonraki görsel" className={cn(navBtn, "hidden sm:right-[max(1.25rem,env(safe-area-inset-right))] sm:grid")}>
              <ChevronRight className="size-6" aria-hidden />
            </button>
          </>
        )}
      </div>
      {/* Telefonda yan oklar yok (görsel alanı dar): geçiş düğmeleri görselin altında */}
      {many && (
        <div className="flex justify-center gap-3 pb-3 sm:hidden">
          <button type="button" onClick={() => go(-1)} aria-label="Önceki görsel" className="grid size-11 place-items-center rounded-full bg-white/10 text-white transition-colors active:bg-white/20 focus-visible:outline-2 focus-visible:outline-white">
            <ChevronLeft className="size-6" aria-hidden />
          </button>
          <button type="button" onClick={() => go(1)} aria-label="Sonraki görsel" className="grid size-11 place-items-center rounded-full bg-white/10 text-white transition-colors active:bg-white/20 focus-visible:outline-2 focus-visible:outline-white">
            <ChevronRight className="size-6" aria-hidden />
          </button>
        </div>
      )}
      {shot.alt && <p className="px-[max(1.5rem,env(safe-area-inset-left))] pb-[max(1.25rem,env(safe-area-inset-bottom))] text-center text-[14px] text-white/75">{shot.alt}</p>}
    </motion.div>
  );
}
