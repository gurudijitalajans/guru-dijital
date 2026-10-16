import Image from "next/image";
import type { IconName } from "@/lib/icon-names";
import { cn } from "@/lib/utils";
import { ServiceIcon } from "./Glyph";

/* Ürünlerin uygulama simgeleri (public/products/icons): aynı g silueti, başında ürüne özgü oyuk */
const ICONS = new Set(["guru-chatbot", "guru-crm", "guru-operation", "guru-business"]);
/* v: simge değişince artır (tarayıcı önbelleği eskisini göstermesin) */
const V = 2;
export const productIconSrc = (slug: string) => (ICONS.has(slug) ? `/products/icons/${slug}.svg?v=${V}` : null);

/**
 * Ürün simgesi; simgesi olmayan (panelden yeni eklenen) üründe seçilen ikonla lacivert karoya düşer.
 * Dekoratiftir (ürün adı yanında yazılıdır): alt boş, aria-hidden.
 */
export function ProductIcon({ slug, icon, size, className }: { slug: string; icon: IconName; size: number; className?: string }) {
  const src = productIconSrc(slug);
  if (!src) return <ServiceIcon name={icon} size={size} className={className} />;
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
