import { Play, Quote } from "lucide-react";
import Image from "next/image";
import type { TestimonialView } from "@/lib/content";
import { SectionHead } from "@/components/site/SectionHead";
import { StaggerGroup, StaggerItem } from "@/components/ui/Reveal";
import { cardCls, sectionY } from "@/components/site/styles";
import { cn } from "@/lib/utils";

/** Video yorum: .mp4 sayfada oynar, YouTube/Vimeo yeni sekmede açılır */
function VideoQuote({ url, poster, name }: { url: string; poster: string | null; name: string }) {
  if (/\.mp4(\?|$)/i.test(url))
    return (
      <video controls preload="none" poster={poster ?? undefined} className="aspect-[4/5] w-full rounded-xl bg-navy object-cover" aria-label={`${name} video yorumu`}>
        <source src={url} type="video/mp4" />
      </video>
    );
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="group relative grid aspect-[4/5] w-full place-items-center overflow-hidden rounded-xl bg-navy" aria-label={`${name} video yorumunu izleyin`}>
      {poster && <Image src={poster} alt="" fill sizes="(min-width: 1280px) 340px, (min-width: 768px) 24vw, calc(100vw - 88px)" className="object-cover opacity-90 transition-transform duration-500 group-hover:scale-[1.03]" />}
      <span className="relative grid size-16 place-items-center rounded-full bg-white/95 text-navy shadow-lg transition-transform group-hover:scale-105">
        <Play className="ml-1 size-6" fill="currentColor" aria-hidden />
      </span>
    </a>
  );
}

/* Yorumlar panelden; yayın izni işaretlenmemiş yorumun metni yazılmaz, kart iskelet olarak görünür. */
export function QuotesBlock({ title, lead, items }: { title: string; lead: string; items: TestimonialView[] }) {
  return (
    <section className={cn("bg-soft", sectionY)}>
      <div className="container-g">
        <SectionHead title={title} lead={lead} />
        <StaggerGroup className="mt-10 grid gap-4 md:grid-cols-3 md:gap-5">
          {items.map((t, i) => (
            <StaggerItem key={i} className="h-full">
              <figure className={cn(cardCls, "flex h-full flex-col gap-3 p-6")}>
                {t.videoUrl ? (
                  <VideoQuote url={t.videoUrl} poster={t.photo?.src ?? null} name={t.name} />
                ) : (
                  <Quote aria-hidden className="size-6 text-brand" strokeWidth={1.8} />
                )}
                {t.quote ? (
                  <blockquote className="text-[15px] leading-relaxed text-body">{t.quote}</blockquote>
                ) : (
                  <div aria-hidden className="space-y-2.5 py-1">
                    {[96, 88, 92, 60 + i * 9].map((w) => (
                      <div key={w} className="h-2.5 rounded-full bg-[#e8edf5]" style={{ width: `${w}%` }} />
                    ))}
                  </div>
                )}
                <figcaption className="mt-auto flex items-center gap-3 pt-3">
                  {t.photo ? (
                    <Image
                      src={t.photo.src}
                      alt=""
                      width={40}
                      height={40}
                      className="size-10 shrink-0 rounded-full bg-soft object-cover"
                    />
                  ) : (
                    <span aria-hidden className="size-10 shrink-0 rounded-full bg-gradient-to-br from-[#cef0fe] to-[#3888e7]" />
                  )}
                  <span>
                    <b className="block text-[14px] font-medium text-heading">{t.name}</b>
                    <span className="text-[12.5px] text-muted">{[t.title, t.company].filter(Boolean).join(" · ")}</span>
                  </span>
                </figcaption>
              </figure>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </div>
    </section>
  );
}
