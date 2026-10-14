import Link from "next/link";
import type { Metadata } from "next";
import { PostCard } from "@/components/blog/PostCard";
import { Btn } from "@/components/site/Btn";
import { ClosingCta } from "@/components/site/ClosingCta";
import { PageIntro } from "@/components/site/PageIntro";
import { StaggerGroup, StaggerItem } from "@/components/ui/Reveal";
import { getPublishedPosts, toCard } from "@/lib/blog";
import { pageMetadata } from "@/lib/seo";
import { cn } from "@/lib/utils";

export const metadata: Metadata = pageMetadata({
  title: "Blog",
  description:
    "Sosyal medya, dijital pazarlama, web tasarım ve işletme yazılımları üzerine Guru Dijital ekibinden uygulanabilir notlar ve rehberler.",
  path: "/blog",
});

/* Panelde yazı değişince sayfa hook ile yenilenir; bu süre yalnız yedek. */
export const revalidate = 600;

const PER_PAGE = 9;

export default async function BlogPage({ searchParams }: { searchParams: Promise<{ sayfa?: string }> }) {
  const all = (await getPublishedPosts()).map(toCard);
  /* Sayfa başına 9 yazı: üç sütun, üç satır */
  const pages = Math.max(1, Math.ceil(all.length / PER_PAGE));
  const page = Math.min(pages, Math.max(1, Number((await searchParams).sayfa) || 1));
  const posts = all.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <>
      <PageIntro
        eyebrow="Blog"
        title="Dijital büyüme üzerine notlar"
        lead="Sosyal medyadan web sitelerine, reklamdan yazılıma: markaların her gün karşılaştığı sorulara kısa ve uygulanabilir cevaplar."
      />

      <section className="pb-14 md:pb-16">
        <div className="container-g">
          {posts.length > 0 ? (
            <>
              <StaggerGroup className="fill-odd-sm grid gap-5 sm:grid-cols-2 md:gap-6 lg:grid-cols-3">
                {posts.map((p, i) => (
                  <StaggerItem key={p.slug} className="h-full">
                    <PostCard post={p} priority={i === 0} eager={i < 3} layout="card" />
                  </StaggerItem>
                ))}
              </StaggerGroup>
              {pages > 1 && (
                <nav aria-label="Blog sayfaları" className="mt-10 flex flex-wrap items-center justify-center gap-2">
                  {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
                    <Link
                      key={n}
                      href={n === 1 ? "/blog" : `/blog?sayfa=${n}`}
                      aria-current={n === page ? "page" : undefined}
                      className={cn(
                        "inline-grid size-11 place-items-center rounded-full text-[15px] font-medium transition-colors",
                        n === page ? "bg-navy text-white" : "bg-soft text-heading hover:text-brand"
                      )}
                    >
                      {n}
                    </Link>
                  ))}
                </nav>
              )}
            </>
          ) : (
            <div className="mx-auto max-w-xl rounded-2xl bg-soft px-6 py-14 text-center">
              <p className="text-[17px] font-medium text-heading">Henüz yayınlanmış yazı yok</p>
              <p className="mt-2 text-[15px] text-muted">Bu arada hizmetlerimize göz atabilir ya da bize yazabilirsiniz.</p>
              <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Btn href="/hizmetler" variant="primary" className="w-full max-w-xs sm:w-auto">Hizmetlerimiz</Btn>
                <Btn href="/iletisim" variant="light" className="w-full max-w-xs sm:w-auto">İletişim</Btn>
              </div>
            </div>
          )}
        </div>
      </section>

      <ClosingCta after="white"
        title="Markanızı Birlikte Planlayalım"
        lead="Okuduklarınızı markanıza nasıl uygulayacağınızı konuşalım; ilk görüşme ücretsiz."
      />
    </>
  );
}
