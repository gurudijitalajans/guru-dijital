import { announcement } from "@/lib/data";

/** Sayfanın en üstünde ince lacivert duyuru bandı (EDME'deki siyah bandın marka karşılığı). */
export function AnnounceBar() {
  return (
    <div className="bg-navy px-4 py-2.5 text-center text-[13px] leading-snug tracking-[0.01em] text-white/90 sm:text-[14px]">
      {announcement}
    </div>
  );
}
