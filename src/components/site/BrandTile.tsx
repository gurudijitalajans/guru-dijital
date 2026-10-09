import Image from "next/image";
import type { ReferenceView } from "@/lib/content";
import { cn } from "@/lib/utils";

/* Logosu panelde yüklü marka gri tonda logo, yüklü olmayan marka farklı yazı
   biçimleriyle adı yazılarak gösterilir; kartlar her durumda aynı boyda.
   İtalik yok: Outfit'in italik kesimi yüklü değil, tarayıcı sahte eğim çizer. */
const STYLES = [
  "text-[17px] font-semibold tracking-[-0.02em]",
  "text-[12.5px] font-normal uppercase tracking-[0.22em]",
  "text-[13px] font-semibold uppercase tracking-[0.12em]",
  "text-[18px] font-light tracking-[0.04em]",
  "text-[18px] font-bold tracking-[-0.04em]",
];

/* Türkçeye özgü harf yoksa İngilizce büyük harf kuralı: "Clinic P" → CLINIC P (CLİNİC P değil) */
const TR_CHARS = /[çğıöşüÇĞİÖŞÜ]/;

export function BrandTile({ brand, index }: { brand: ReferenceView; index: number }) {
  return (
    <li className="group grid h-[84px] place-items-center rounded-2xl bg-white px-4 shadow-[0_0_0_1px_rgb(1_20_65/0.07)] transition-shadow duration-300 hover:shadow-[0_0_0_1px_rgb(42_106_202/0.22),0_18px_36px_-24px_rgb(1_20_65/0.45)] md:h-24">
      {brand.logo ? (
        <Image
          src={brand.logo.src}
          alt={brand.name}
          width={brand.logo.w}
          height={brand.logo.h}
          sizes="160px"
          className="max-h-9 w-auto max-w-[140px] object-contain opacity-70 grayscale transition duration-300 group-hover:opacity-100 group-hover:grayscale-0"
        />
      ) : (
        <span
          lang={TR_CHARS.test(brand.name) ? undefined : "en"}
          className={cn("text-balance text-center leading-tight text-[#5d6782] transition-colors duration-300 group-hover:text-heading", STYLES[index % STYLES.length])}
        >
          {brand.name}
        </span>
      )}
    </li>
  );
}
