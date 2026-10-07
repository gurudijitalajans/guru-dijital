import Image from "next/image";
import { cn } from "@/lib/utils";
import type { WorkImage } from "./service-showcase";

const frameCls = "relative overflow-hidden rounded-2xl bg-soft md:rounded-[20px]";

/**
 * Hizmet galerisi (yuvarlak köşeli, çizgisiz).
 * Mobil: ana görsel tam genişlik, iki yan görsel ikili ızgara.
 * md+: ana görsel solda (7/12), iki yan görsel sağda üst üste; yan kareler
 * satır yüksekliğini ana görselden alır (md:aspect-auto). Ek görseller altta
 * tam genişlikte, doğal oranla basılır.
 */
export function ServiceGallery({ images, className }: { images: WorkImage[]; className?: string }) {
  if (images.length === 0) return null;
  const [main, ...rest] = images;
  const sides = rest.slice(0, 2);
  const extras = rest.slice(2);

  return (
    <div className={cn("grid gap-3 md:gap-4", className)}>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-12 md:grid-rows-2 md:gap-4">
        <div
          className={cn(
            frameCls,
            "col-span-2 aspect-[4/3]",
            sides.length > 0 ? "md:col-span-7 md:row-span-2" : "md:col-span-12 md:aspect-[21/9]"
          )}
        >
          <Image
            src={main.src}
            alt={main.alt}
            fill
            preload
            sizes={sides.length > 0 ? "(min-width: 1280px) 700px, (min-width: 768px) 58vw, 100vw" : "(min-width: 1280px) 1200px, 100vw"}
            className="object-cover"
            style={main.position ? { objectPosition: main.position } : undefined}
          />
        </div>
        {sides.map((img) => (
          <div
            key={img.src}
            className={cn(
              frameCls,
              "aspect-[4/3] md:aspect-auto md:col-span-5",
              sides.length === 1 && "col-span-2 md:row-span-2"
            )}
          >
            {/* Yan görseller ilk ekranda: geç yüklenirse LCP adayı olurken boş kalır */}
            <Image
              src={img.src}
              alt={img.alt}
              fill
              loading="eager"
              sizes="(min-width: 1280px) 500px, (min-width: 768px) 42vw, 50vw"
              className="object-cover"
              style={img.position ? { objectPosition: img.position } : undefined}
            />
          </div>
        ))}
      </div>
      {extras.map((img) => (
        <div key={img.src} className={frameCls} style={{ aspectRatio: `${img.w} / ${img.h}` }}>
          <Image
            src={img.src}
            alt={img.alt}
            fill
            sizes="(min-width: 1280px) 1200px, 100vw"
            className="object-cover"
          />
        </div>
      ))}
    </div>
  );
}
