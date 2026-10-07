import { SectionHead } from "@/components/site/SectionHead";
import { VideoPlayer } from "@/components/site/VideoPlayer";
import { Reveal } from "@/components/ui/Reveal";

export const VIDEO_SRC = "/video/guru-tanitim.mp4";
export const VIDEO_POSTER = "/video/guru-tanitim-poster.jpg";

/** "Bizi Tanıyın": Remotion ile üretilen ajans tanıtım videosu (oynatıcı: VideoPlayer). */
export function VideoBlock({ hasVideo, title, lead }: { hasVideo: boolean; title: string; lead: string }) {
  return (
    <section className="py-16 md:py-[72px]">
      <div className="container-g">
        <SectionHead center title={title} lead={lead} />
        <Reveal className="mt-10">
          <VideoPlayer
            src={hasVideo ? VIDEO_SRC : null}
            poster={VIDEO_POSTER}
            label="Tanıtım videosunu oynat"
            trackName="ajans-tanitim"
          />
        </Reveal>
      </div>
    </section>
  );
}
