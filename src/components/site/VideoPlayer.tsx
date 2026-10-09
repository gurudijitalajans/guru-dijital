"use client";

import { useRef, useState } from "react";
import { Play } from "lucide-react";
import { Logo } from "@/components/site/Logo";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/utils";

export type VideoPlayerProps = {
  src?: string | null;
  poster?: string | null;
  /** Oynat düğmesinin erişilebilir adı, ör. "Guru CRM ürün turunu oynat" */
  label: string;
  /** Umami olayında hangi video olduğu */
  trackName?: string;
  className?: string;
};

/**
 * Marka çerçeveli video oynatıcı. Video yalnız oynat düğmesine basınca yüklenir
 * (preload="none"); o zamana kadar kapak karesi görünür. İlk oynatmadan sonra
 * tarayıcının kendi kontrolleri açılır, duraklatınca da kaybolmaz.
 * Video yoksa ışık yelpazesi ve logo kapak olarak kalır.
 */
export function VideoPlayer({ src, poster, label, trackName, className }: VideoPlayerProps) {
  const ref = useRef<HTMLVideoElement>(null);
  const [started, setStarted] = useState(false);

  const start = () => {
    const v = ref.current;
    if (!v) return;
    setStarted(true);
    track("video-izlendi", { video: trackName ?? label });
    v.play().catch(() => setStarted(false));
  };

  return (
    <div
      className={cn(
        "guru-beam relative mx-auto aspect-video w-full overflow-hidden rounded-[20px] shadow-[0_30px_60px_-34px_rgb(1_20_65/0.6)]",
        className
      )}
    >
      {src ? (
        <>
          <video
            ref={ref}
            src={src}
            poster={poster ?? undefined}
            preload="none"
            playsInline
            controls={started}
            onEnded={() => setStarted(false)}
            className="absolute inset-0 size-full object-cover"
          >
            Tarayıcınız video oynatmayı desteklemiyor.
          </video>
          {!started && (
            /* Sarmalayıcı overflow-hidden: odak halkası içeri çekilir, köşeleri karta uyar */
            <button
              type="button"
              onClick={start}
              aria-label={label}
              className="group absolute inset-0 grid place-items-center rounded-[inherit] focus-visible:outline-white focus-visible:outline-offset-[-8px]"
            >
              {/* Lacivert disk + beyaz halka: kapak açık (ürün arayüzü) ya da koyu (marka ışığı) olsun, düğme her zemin üstünde seçilir */}
              <span className="grid size-16 place-items-center rounded-full bg-navy text-white shadow-[0_0_0_6px_rgb(255_255_255/0.92),0_18px_40px_-12px_rgb(1_20_65/0.55)] transition-transform duration-300 group-hover:scale-105 md:size-20 md:shadow-[0_0_0_8px_rgb(255_255_255/0.92),0_18px_40px_-12px_rgb(1_20_65/0.55)]">
                <Play aria-hidden className="ml-1 size-6 fill-current md:size-7" />
              </span>
            </button>
          )}
        </>
      ) : (
        <div className="absolute inset-0 grid place-items-center">
          <Logo tone="white" height={64} />
        </div>
      )}
    </div>
  );
}
