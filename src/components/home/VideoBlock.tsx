"use client";

import { useRef, useState } from "react";
import { Play } from "lucide-react";
import { SectionHead } from "@/components/site/SectionHead";
import { Reveal } from "@/components/ui/Reveal";
import { Logo } from "@/components/site/Logo";

export const VIDEO_SRC = "/video/guru-tanitim.mp4";
export const VIDEO_POSTER = "/video/guru-tanitim-poster.jpg";

/**
 * "Bizi Tanıyın": Remotion ile üretilen tanıtım videosu. Video yalnız oynat
 * düğmesine basınca yüklenir (preload="none"); kapak karesi poster olarak görünür.
 * Poster/video henüz yoksa marka ışık yelpazesi ve logo kapak olarak kalır.
 */
export function VideoBlock({ hasVideo, title, lead }: { hasVideo: boolean; title: string; lead: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  const start = () => {
    const v = ref.current;
    if (!v) return;
    setPlaying(true);
    v.play().catch(() => setPlaying(false));
  };

  return (
    <section className="py-16 md:py-[72px]">
      <div className="container-g">
        <SectionHead
          center
          title={title}
          lead={lead}
        />
        <Reveal className="mt-10">
          <div className="guru-beam relative mx-auto aspect-video w-full overflow-hidden rounded-[20px] shadow-[0_30px_60px_-34px_rgb(1_20_65/0.6)]">
            {hasVideo ? (
              <>
                <video
                  ref={ref}
                  src={VIDEO_SRC}
                  poster={VIDEO_POSTER}
                  preload="none"
                  playsInline
                  controls={playing}
                  onEnded={() => setPlaying(false)}
                  onPause={() => setPlaying(false)}
                  onPlay={() => setPlaying(true)}
                  className="absolute inset-0 size-full object-cover"
                >
                  Tarayıcınız video oynatmayı desteklemiyor.
                </video>
                {!playing && (
                  <button
                    type="button"
                    onClick={start}
                    aria-label="Tanıtım videosunu oynat"
                    className="group absolute inset-0 grid place-items-center"
                  >
                    <span className="grid size-20 place-items-center rounded-full bg-white text-navy shadow-[0_0_0_12px_rgb(255_255_255/0.25)] transition-transform duration-300 group-hover:scale-105 md:size-24">
                      <Play aria-hidden className="ml-1 size-8 fill-current" />
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
        </Reveal>
      </div>
    </section>
  );
}
