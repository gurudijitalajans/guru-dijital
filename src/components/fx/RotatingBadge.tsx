"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * RotatingBadge — amphora tarzı dönen çember yazı rozeti.
 * SVG textPath üzerinde sürekli yavaşça dönen metin + ortada ok;
 * tamamı /iletisim linki. Hover'da dönüş hızlanır, ok 45° döner.
 * Saf CSS animasyonu (SSR güvenli, JS yok); reduced-motion'da durağan.
 */
export function RotatingBadge({
  className,
  size = 128,
  href = "/iletisim",
  label = "Teklif al: Projeni konuşalım",
}: {
  className?: string;
  size?: number;
  href?: string;
  label?: string;
}) {
  const text = "Guru Dijital Ajans ✦ Unlock the next level ✦ ";
  return (
    <Link
      href={href}
      aria-label={label}
      data-cursor
      className={cn(
        "group relative inline-block rounded-full outline-offset-4",
        className
      )}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 100 100"
        className="size-full animate-[spin_18s_linear_infinite] transition-[animation-duration] [animation-play-state:running] group-hover:animate-[spin_6s_linear_infinite] motion-reduce:animate-none"
        aria-hidden
      >
        <defs>
          <path
            id="guru-badge-circle"
            d="M 50,50 m -38,0 a 38,38 0 1,1 76,0 a 38,38 0 1,1 -76,0"
          />
        </defs>
        <text className="fill-fg/70 text-[7px] font-semibold uppercase tracking-[0.12em]">
          {/* textLength: metni çember uzunluğuna kilitler, kesilme/bindirme olmaz */}
          <textPath href="#guru-badge-circle" textLength={237} lengthAdjust="spacingAndGlyphs">
            {text}
          </textPath>
        </text>
      </svg>
      <span
        className="absolute inset-0 m-auto grid size-[38%] place-items-center rounded-full bg-guru text-ink shadow-[0_0_30px_rgb(16_216_108/0.4)] transition-transform duration-500 ease-out group-hover:rotate-45 group-hover:scale-110"
        aria-hidden
      >
        <ArrowUpRight className="size-[55%]" strokeWidth={2.2} />
      </span>
    </Link>
  );
}
