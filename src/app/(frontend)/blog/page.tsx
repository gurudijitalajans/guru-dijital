import type { Metadata } from "next";
import { PostCard } from "@/components/blog/PostCard";
import { Btn } from "@/components/site/Btn";
import { ClosingCta } from "@/components/site/ClosingCta";
import { PageIntro } from "@/components/site/PageIntro";
import { StaggerGroup, StaggerItem } from "@/components/ui/Reveal";
import { getPublishedPosts, toCard } from "@/lib/blog";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Blog",
  description:
    "Sosyal medya, dijital pazarlama, web tasarım ve işletme yazılımları üzerine Guru Dijital ekibinden uygulanabilir notlar ve rehberler.",
  path: "/blog",
});

/* Panelde yazı değişince sayfa hook ile yenilenir; bu süre yalnız yedek. */
export const revalidate = 600;

export default async function BlogPage() {
  const posts = (await getPublishedPosts()).map(toCard);

  return (
    <>
      <PageIntro
        eyebrow="Blog"
        title="Dijital büyüme üzerine notlar"
        lead="Sosyal medyadan web sitelerine, reklamdan yazılıma: markaların her gün karşılaştığı sorulara kısa ve uygulanabilir cevaplar."
      />

      <section className="pb-16 md:pb-[72px]">
        <div className="container-g">
          {posts.length > 0 ? (
            <StaggerGroup className="grid gap-5 sm:grid-cols-2 md:gap-6 lg:grid-cols-3">
              {posts.map((p, i) => (
                <StaggerItem key={p.slug} className="h-full">
                  <PostCard post={p} priority={i === 0} />
                </StaggerItem>
              ))}
            </StaggerGroup>
          ) : (
            <div className="mx-auto max-w-xl rounded-2xl bg-soft px-6 py-14 text-center">
              <p className="text-[17px] font-medium text-heading">Henüz yayınlanmış yazı yok</p>
              <p className="mt-2 text-[15px] text-muted">Bu arada hizmetlerimize göz atabilir ya da bize yazabilirsiniz.</p>
              <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Btn href="/hizmetler" variant="primary">Hizmetlerimiz</Btn>
                <Btn href="/iletisim" variant="light">İletişim</Btn>
              </div>
            </div>
          )}
        </div>
      </section>

      <ClosingCta
        title="Markanız için birlikte plan yapalım"
        lead="Okuduklarınızı markanıza nasıl uygulayacağınızı konuşalım; ilk görüşme ücretsiz."
      />
    </>
  );
}
