import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { PostBody, postHeadings } from "@/components/blog/PostBody";
import { PostCard } from "@/components/blog/PostCard";
import { ClosingCta } from "@/components/site/ClosingCta";
import { SectionHead } from "@/components/site/SectionHead";
import { sectionY } from "@/components/site/styles";
import { Reveal } from "@/components/ui/Reveal";
import { formatDate, getPostBySlug, getPublishedPosts, mediaSrc, readingMinutes, toCard } from "@/lib/blog";
import { site } from "@/lib/data";
import { pageMetadata } from "@/lib/seo";
import { cn } from "@/lib/utils";
import type { Category, Media, User } from "@/payload-types";

type Props = { params: Promise<{ slug: string }> };

export const revalidate = 600;

export async function generateStaticParams() {
  return (await getPublishedPosts()).filter((p) => p.slug).map((p) => ({ slug: p.slug as string }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: "Yazı bulunamadı", robots: { index: false } };
  const cover = mediaSrc(typeof post.cover === "object" ? (post.cover as Media) : null, "wide");
  return pageMetadata({
    title: post.seo?.title || post.title,
    description: post.seo?.description || post.excerpt,
    path: `/blog/${slug}`,
    image: cover ? { url: cover.url, width: cover.width, height: cover.height, alt: cover.alt } : undefined,
  });
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const category = typeof post.category === "object" ? (post.category as Category | null) : null;
  const author = typeof post.author === "object" ? (post.author as User | null) : null;
  /* Kapak 1024px genişlikte basılır: 2x ekranda keskin kalsın diye özgün dosya kaynak olur */
  const cover = mediaSrc(typeof post.cover === "object" ? (post.cover as Media) : null, "original");
  const minutes = readingMinutes(post.content);
  const headings = postHeadings(post.content);
  const others = (await getPublishedPosts(4))
    .filter((p) => p.slug !== slug)
    .slice(0, 3)
    .map(toCard);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.publishedAt ?? post.createdAt,
    dateModified: post.updatedAt,
    mainEntityOfPage: `${site.url}/blog/${slug}`,
    ...(cover ? { image: `${site.url}${cover.url}` } : {}),
    author: { "@type": "Organization", name: site.name },
    publisher: { "@type": "Organization", name: site.name, logo: { "@type": "ImageObject", url: `${site.url}/icon.png` } },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />

      <article>
        <header className="pb-8 pt-10 text-center md:pb-10 md:pt-14">
          <div className="container-g">
            <Reveal>
              <Link
                href="/blog"
                className="inline-flex min-h-11 items-center gap-1.5 text-[14px] font-medium text-muted transition-colors hover:text-brand"
              >
                <ArrowLeft aria-hidden className="size-4" />
                Tüm yazılar
              </Link>
              {category && (
                <p className="mt-3 flex items-center justify-center gap-2 text-[13px] font-medium text-brand">
                  <span className="size-1.5 rounded-full bg-brand" aria-hidden />
                  {category.title}
                </p>
              )}
              <h1 className="mx-auto mt-3 max-w-4xl text-balance text-[32px] font-normal leading-[1.14] tracking-[-0.03em] text-heading sm:text-[42px] lg:text-[48px]">
                {post.title}
              </h1>
              <p className="mt-5 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-[14px] text-muted">
                {post.publishedAt && <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>}
                <span aria-hidden>·</span>
                <span>{minutes} dk okuma</span>
                {author?.name && (
                  <>
                    <span aria-hidden>·</span>
                    <span>{author.name}</span>
                  </>
                )}
              </p>
            </Reveal>
          </div>
        </header>

        {cover && (
          <div className="container-g">
            <div className="relative aspect-[16/9] overflow-hidden rounded-[20px] bg-soft lg:aspect-[21/9]">
              <Image
                src={cover.url}
                alt={cover.alt}
                fill
                preload
                sizes="(min-width: 1280px) 1200px, calc(100vw - 32px)"
                className="object-cover"
              />
            </div>
          </div>
        )}

        {/* Gövde ve kenar sütunu sayfanın tam genişliğinde; metin satırı ~75 karakterde kalır */}
        <div className="container-g grid gap-10 pb-4 pt-10 md:pt-14 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-16">
          <div className="min-w-0">
            {/* Dar ekranda içindekiler metnin başında, açılır kutuda */}
            {headings.length > 2 && (
              <details className="mb-8 rounded-2xl bg-soft p-5 lg:hidden">
                <summary className="text-[14px] font-semibold text-heading">İçindekiler</summary>
                <ol className="mt-3 grid gap-1">
                  {headings.map((h) => (
                    <li key={h.id}>
                      <a href={`#${h.id}`} className="block py-1.5 text-[14.5px] text-body hover:text-brand">
                        {h.text}
                      </a>
                    </li>
                  ))}
                </ol>
              </details>
            )}
            <PostBody data={post.content} className="prose-guru max-w-[720px]" />
          </div>
          <aside className="hidden min-w-0 lg:block">
            <div className="grid gap-4 lg:sticky lg:top-28">
              {headings.length > 2 && (
                <nav aria-label="İçindekiler" className="rounded-2xl bg-soft p-5 lg:max-h-[calc(100dvh-24rem)] lg:overflow-y-auto lg:overscroll-contain">
                  <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-muted">İçindekiler</p>
                  <ol className="mt-3 grid gap-1">
                    {headings.map((h) => (
                      <li key={h.id}>
                        <a href={`#${h.id}`} className="block rounded-lg px-2 py-1.5 text-[14px] leading-snug text-body transition-colors hover:bg-white hover:text-brand">
                          {h.text}
                        </a>
                      </li>
                    ))}
                  </ol>
                </nav>
              )}
              <div className="rounded-2xl bg-navy p-5 text-white">
                <p className="text-[17px] font-medium leading-snug">Bu konuda destek mi lazım?</p>
                <p className="mt-2 text-[14px] leading-relaxed text-white/75">Markanız için nasıl uygulanacağını ücretsiz ilk görüşmede birlikte planlayalım.</p>
                <Link href="/iletisim" className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-5 text-[14.5px] font-medium text-navy transition-colors hover:bg-ice">
                  İletişime geçin
                  <ArrowRight aria-hidden className="size-4" />
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </article>

      {others.length > 0 && (
        <section className={`bg-soft ${sectionY} mt-8 md:mt-10`}>
          <div className="container-g">
            <SectionHead title="Diğer Yazılar" action={{ href: "/blog", label: "Tüm yazılar" }} />
            {/* Tek yazı yatay kartla, ikisi iki sütunda: üç sütunlu ızgarada boş sütun kalmaz */}
            <div className={cn("fill-odd-sm mt-10 grid gap-5 md:gap-6", others.length === 2 ? "sm:grid-cols-2" : others.length > 2 && "sm:grid-cols-2 lg:grid-cols-3")}>
              {others.map((p) => (
                <PostCard key={p.slug} post={p} as="h3" layout={others.length === 1 ? "wide" : "card"} />
              ))}
            </div>
          </div>
        </section>
      )}

      <ClosingCta
        title="Bu Konuyu Markanız İçin Konuşalım"
        lead="Yazıdaki adımları kendi hedeflerinize göre birlikte uyarlayalım; ilk görüşme ücretsiz."
      />
    </>
  );
}
