import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Tema-duyarlı marka logosu: iki sürüm de render edilir, görünürlüğü
 * globals.css'teki .logo-dark-theme / .logo-light-theme kuralları yönetir
 * (JS yok, hydration nötr, tema geçişinde anında değişir).
 */
export function BrandLogo({
  className,
  priority = false,
}: {
  className?: string;
  priority?: boolean;
}) {
  const shared = { width: 720, height: 306, priority } as const;
  return (
    <>
      {/* Gece: beyaz logo */}
      <Image
        src="/logo-light.png"
        alt="Guru Dijital Ajans"
        {...shared}
        sizes="(min-width: 768px) 120px, 100px"
        className={cn("logo-dark-theme", className)}
      />
      {/* Gündüz: koyu logo */}
      <Image
        src="/logo-dark.png"
        alt=""
        aria-hidden
        {...shared}
        sizes="(min-width: 768px) 120px, 100px"
        className={cn("logo-light-theme", className)}
      />
    </>
  );
}
