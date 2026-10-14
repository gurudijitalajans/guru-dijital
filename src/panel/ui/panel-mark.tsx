import { cn } from "@/lib/utils";

/**
 * Guru Panel işareti: guru logosunun "g" simgesi, mavi ışık gradyanlı
 * yuvarlatılmış karonun içinde (sitenin anahtar görselindeki çapraz ışık).
 */
export function PanelMark({ size = 28, className }: { size?: number; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn("relative grid shrink-0 place-items-center overflow-hidden", className)}
      style={{
        width: size,
        height: size,
        borderRadius: Math.round(size * 0.3),
        background: "linear-gradient(140deg, #44a1f1 0%, #2a6aca 38%, #12419b 70%, #011441 100%)",
        boxShadow: "inset 0 1px 0 rgb(255 255 255 / 0.28), 0 6px 14px -8px rgb(42 106 202 / 0.9)",
      }}
    >
      <span className="absolute -top-1/2 -left-1/4 h-full w-[150%] rotate-[-22deg] bg-gradient-to-b from-white/30 to-transparent" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/brand/mark-white.svg" alt="" className="relative" style={{ width: size * 0.62, height: size * 0.62 }} />
    </span>
  );
}
