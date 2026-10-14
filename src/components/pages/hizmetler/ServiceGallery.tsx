import Image from "next/image";
import { VideoPlayer } from "@/components/site/VideoPlayer";
import { zoomCls, zoomProps } from "@/components/ui/zoom";
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
  /* Dikey ilk yan görsel (kapak) tek başına sağda; değilse iki yan görsel */
  const sides = rest[0] && rest[0].h > rest[0].w ? rest.slice(0, 1) : rest.slice(0, 2);
  const after = rest.slice(sides.length);
  /* Altta: bant biçimliler (en az 2:1) tam genişlikte, diğerleri üç sütunlu ızgarada (öne çıkan ekranlar) */
  const extras = after.filter((img) => img.w / img.h >= 2);
  const tiles = after.filter((img) => img.w / img.h < 2);
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
              {...zoomProps(main)}
              className={cn(
                frameCls,
                zoomCls,
                "col-span-2 aspect-[4/3]",
                wide ? "md:col-span-12 md:aspect-[21/9]" : "md:col-span-8 md:row-span-2",
                /* Tek yan görselde (16:10 kart + 4:5 afiş) 8/12 ile 4/12 aynı boya gelir: ikisi de kırpılmaz */
                sides.length === 1 && "md:aspect-[16/10]"
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
            {...zoomProps(img)}
            className={cn(
              frameCls,
              zoomCls,
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
      {tiles.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2 md:gap-4 lg:grid-cols-3">
          {tiles.map((img) => (
            <div key={img.src} {...zoomProps(img)} className={cn(frameCls, zoomCls, "sm:[&:last-child:nth-child(odd)]:col-span-2 lg:[&:last-child:nth-child(odd)]:col-span-1")} style={{ aspectRatio: `${img.w} / ${img.h}` }}>
              <Image src={img.src} alt={img.alt} fill sizes="(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw" className="object-cover" />
            </div>
          ))}
        </div>
      )}
      {extras.map((img) => (
        <div key={img.src} {...zoomProps(img)} className={cn(frameCls, zoomCls)} style={{ aspectRatio: `${img.w} / ${img.h}` }}>
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
