import Image from "next/image";
import type { IconName } from "@/lib/icon-names";
import { IconByName } from "@/lib/icons";
import { cn } from "@/lib/utils";

/* Ürünlerin uygulama simgeleri (public/products/icons): aynı g silueti, başında ürüne özgü oyuk */
const ICONS = new Set(["guru-chatbot", "guru-crm", "guru-operation", "guru-business"]);
export const productIconSrc = (slug: string) => (ICONS.has(slug) ? `/products/icons/${slug}.svg` : null);

/**
 * Ürün simgesi; simgesi olmayan (panelden yeni eklenen) üründe genel ikon kutusuna düşer.
 * Dekoratiftir (ürün adı yanında yazılıdır): alt boş, aria-hidden.
 */
export function ProductIcon({ slug, icon, size, className }: { slug: string; icon: IconName; size: number; className?: string }) {
  const src = productIconSrc(slug);
  if (!src)
    return (
      <span aria-hidden style={{ width: size, height: size }} className={cn("grid shrink-0 place-items-center rounded-[22.6%] bg-chip text-brand", className)}>
        <IconByName name={icon} className="size-[45%]" strokeWidth={1.9} />
      </span>
    );
  return (
    <Image
      src={src}
      alt=""
      aria-hidden
      width={size}
      height={size}
      unoptimized
      className={cn("shrink-0 rounded-[22.6%] shadow-[0_6px_14px_-8px_rgb(1_20_65/0.5)]", className)}
    />
  );
}
