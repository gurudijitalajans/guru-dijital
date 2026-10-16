import { createElement, type CSSProperties } from "react";
import { GLYPHS, type GlyphName } from "@/lib/glyphs";
import { DEFAULT_ICON } from "@/lib/icon-names";
import { cn } from "@/lib/utils";
import { iconBoxCls } from "./styles";

const isGlyph = (v: unknown): v is GlyphName => typeof v === "string" && v in GLYPHS;

type GlyphProps = {
  name: string | null | undefined;
  className?: string;
  style?: CSSProperties;
  strokeWidth?: number;
  /** Kapalı biçimlerin dolgusu (çift ton); çizgi rengi currentColor */
  fill?: string;
  fillOpacity?: number;
};

/** Çift ton ikon: lacivert çizgi + yarı saydam mavi dolgu. Şekiller src/lib/glyphs.ts'ten. */
export function Glyph({ name, className, style, strokeWidth = 1.8, fill = "#3f8cf0", fillOpacity = 0.42 }: GlyphProps) {
  const parts = GLYPHS[isGlyph(name) ? name : DEFAULT_ICON];
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={cn("shrink-0", className)} style={style}>
      {parts.map(([tag, a, closed], i) =>
        closed ? createElement(tag, { key: `f${i}`, ...a, fill, fillOpacity, stroke: "none" }) : null
      )}
      <g fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
        {parts.map(([tag, a], i) => createElement(tag, { key: i, ...a }))}
      </g>
    </svg>
  );
}

/** Genel ikon kutusu: açık degrade zemin, çift ton ikon (özellikler, değerler, ekip) */
export function GlyphChip({ name, className }: { name: string | null | undefined; className?: string }) {
  return (
    <span aria-hidden className={cn(iconBoxCls, "shrink-0", className)}>
      <Glyph name={name} className="size-6" strokeWidth={1.7} />
    </span>
  );
}

/* Hizmet karosu: ürün simgeleriyle aynı yapı (degrade + üstte parlama + altta gölge), Guru işareti yok */
const TILE_BG =
  "radial-gradient(75% 75% at 25% 8%, rgb(255 255 255 / 0.42), rgb(255 255 255 / 0) 55%)," +
  "radial-gradient(70% 70% at 70% 105%, rgb(1 20 65 / 0.4), rgb(1 20 65 / 0))," +
  "linear-gradient(162deg, #3d7fe8 0%, #12419b 55%, #011441 100%)";

/** Hizmet ikonu: lacivert degrade karo, beyaz çizgi + açık mavi dolgu */
export function ServiceIcon({ name, size = 44, className }: { name: string | null | undefined; size?: number; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn("grid shrink-0 place-items-center rounded-[22.6%] text-white", className)}
      style={{
        width: size,
        height: size,
        backgroundImage: TILE_BG,
        boxShadow: `inset 0 0 0 1px rgb(255 255 255 / 0.2), 0 ${Math.round(size * 0.07)}px ${Math.round(size * 0.14)}px -${Math.round(size * 0.04)}px rgb(1 20 65 / 0.4)`,
      }}
    >
      <Glyph
        name={name}
        strokeWidth={2}
        fill="#9fd3ff"
        fillOpacity={0.45}
        style={{ width: "53%", height: "53%", filter: "drop-shadow(0 1px 1.5px rgb(1 20 65 / 0.3))" }}
      />
    </span>
  );
}
