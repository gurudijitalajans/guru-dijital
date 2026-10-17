import { SectionHead } from "@/components/site/SectionHead";
import { VideoPlayer } from "@/components/site/VideoPlayer";
import { Reveal } from "@/components/ui/Reveal";
import { videoUrl } from "@/lib/video";

export const VIDEO_SRC = "/video/guru-tanitim-v2.mp4";
export const VIDEO_POSTER = "/video/guru-tanitim-poster.jpg";

/** "Bizi Tanıyın": Remotion ile üretilen ajans tanıtım videosu (oynatıcı: VideoPlayer). */
export function VideoBlock({ hasVideo, title, lead }: { hasVideo: boolean; title: string; lead: string }) {
  return (
    <section className="py-12 md:py-14">
      <div className="container-g">
        <SectionHead center title={title} lead={lead} />
        <Reveal className="mt-10">
          <VideoPlayer
            src={hasVideo ? videoUrl(VIDEO_SRC) : null}
            poster={videoUrl(VIDEO_POSTER)}
            label="Tanıtım videosunu oynat"
            trackName="ajans-tanitim"
            /* Kısa ekranda (yatay telefon, alçak dizüstü) video yapışkan menünün altında tümüyle görünsün */
            className="max-w-[calc((100svh-var(--header-h)-2rem)*16/9)]"
          />
        </Reveal>
      </div>
    </section>
  );
}
