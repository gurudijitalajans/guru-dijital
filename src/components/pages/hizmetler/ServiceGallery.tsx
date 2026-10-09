import Image from "next/image";
import { VideoPlayer } from "@/components/site/VideoPlayer";
import { cn } from "@/lib/utils";
import type { WorkImage } from "./service-showcase";

const frameCls = "relative overflow-hidden rounded-2xl bg-soft md:rounded-[20px]";

export type GalleryVideo = { src: string; poster: string; label: string; trackName: string };

/**
 * Hizmet galerisi (yuvarlak köşeli, çizgisiz).
 * Mobil: ana kare tam genişlik, iki yan görsel ikili ızgara.
 * md+: ana kare solda (8/12), iki yan görsel sağda üst üste; yan kareler
 * satır yüksekliğini ana kareden alır (md:aspect-auto). 8/4 bölünme yan
 * kareleri kaynak görsellere yakın orana (~4:3) getirir; aşırı kırpılmazlar.
 * Video verilirse ana kare videodur (16:9, içerik kırpılmaz) ve görsellerin
 * ilk ikisi yana geçer. Bant biçimli ek görseller altta tam genişlikte, doğal oranla basılır.
 */
export function ServiceGallery({ images, video, className }: { images: WorkImage[]; video?: GalleryVideo; className?: string }) {
  if (images.length === 0 && !video) return null;
  const main = video ? null : (images[0] ?? null);
  const rest = video ? images : images.slice(1);
  const sides = rest.slice(0, 2);
  /* Altta tam genişlik yalnız bant biçimli görsellere (en az 2:1, ör. logo şeridi):
     4:3 bir görsel tam genişlikte girişi ekran boyu uzatır */
  const extras = rest.slice(2).filter((img) => img.w / img.h >= 2);
  const wide = sides.length === 0;

  return (
    <div className={cn("grid gap-3 md:gap-4", className)}>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-12 md:grid-rows-2 md:gap-4">
        {video ? (
          <div className={cn("col-span-2", wide ? "md:col-span-12" : "md:col-span-8 md:row-span-2")}>
            <VideoPlayer
              src={video.src}
              poster={video.poster}
              label={video.label}
              trackName={video.trackName}
              className="rounded-2xl shadow-none md:rounded-[20px]"
            />
          </div>
        ) : (
          main && (
            <div
              className={cn(
                frameCls,
                "col-span-2 aspect-[4/3]",
                wide ? "md:col-span-12 md:aspect-[21/9]" : "md:col-span-8 md:row-span-2"
              )}
            >
              <Image
                src={main.src}
                alt={main.alt}
                fill
                preload
                sizes={wide ? "(min-width: 1280px) 1200px, 100vw" : "(min-width: 1280px) 800px, (min-width: 768px) 66vw, 100vw"}
                className="object-cover"
                style={main.position ? { objectPosition: main.position } : undefined}
              />
            </div>
          )
        )}
        {sides.map((img) => (
          <div
            key={img.src}
            className={cn(
              frameCls,
              "aspect-[4/3] md:col-span-4 md:aspect-auto",
              sides.length === 1 && "col-span-2 md:row-span-2"
            )}
          >
            {/* Yan görseller ilk ekranda: geç yüklenirse LCP adayı olurken boş kalır */}
            <Image
              src={img.src}
              alt={img.alt}
              fill
              loading="eager"
              sizes="(min-width: 1280px) 400px, (min-width: 768px) 34vw, 50vw"
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
