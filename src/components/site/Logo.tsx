import Image from "next/image";
import { cn } from "@/lib/utils";

/* Logo oranı: 335.61 x 147.33 (Guru logo.pdf'ten kırpıldı) */
const RATIO = 335.61 / 147.33;

export type LogoProps = {
  /** "navy": açık zemin, "white": koyu/mavi zemin */
  tone?: "navy" | "white";
  /** piksel cinsinden yükseklik */
  height?: number;
  className?: string;
  priority?: boolean;
};

export function Logo({ tone = "navy", height = 34, className, priority }: LogoProps) {
  return (
    <Image
      src={tone === "white" ? "/brand/logo-white.svg" : "/brand/logo-navy.svg"}
      alt="Guru Dijital Ajans"
      width={Math.round(height * RATIO)}
      height={height}
      preload={priority}
      className={cn("block h-auto", className)}
      style={{ width: Math.round(height * RATIO) }}
    />
  );
}
