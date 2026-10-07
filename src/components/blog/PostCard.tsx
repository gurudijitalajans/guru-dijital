import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cardCls, cardHoverCls } from "@/components/site/styles";
import { formatDate, type PostCardData } from "@/lib/blog";
import { cn } from "@/lib/utils";

/**
 * Blog kartı: kapak, kategori, tarih ve okuma süresi, başlık, özet. Çizgisiz, ince halkalı kart.
 * priority: sayfanın LCP görseli (preload); eager: ilk satırdaki diğer kartlar (geç yüklenmesin).
 */
export function PostCard({ post, priority = false, eager = false }: { post: PostCardData; priority?: boolean; eager?: boolean }) {
  const href = `/blog/${post.slug}`;
  return (
    <article className={cn(cardCls, cardHoverCls, "group flex h-full flex-col overflow-hidden")}>
      <Link href={href} tabIndex={-1} aria-hidden className="relative block aspect-[16/10] overflow-hidden bg-soft">
        {post.cover ? (
          <Image
            src={post.cover.url}
            alt=""
            fill
            preload={priority}
            /* Next 16: preload ile loading birlikte verilmez */
            loading={priority ? undefined : eager ? "eager" : "lazy"}
            sizes="(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
          />
        ) : (
          <div className="guru-beam absolute inset-0" />
        )}
      </Link>
      <div className="flex flex-1 flex-col p-6">
        <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-muted">
          {post.category && (
            <span className="rounded-full bg-chip px-2.5 py-0.5 font-medium text-heading">{post.category.title}</span>
          )}
          {post.publishedAt && <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>}
          <span aria-hidden>·</span>
          <span>{post.readingMinutes} dk okuma</span>
        </p>
        <h2 className="mt-3 text-[19px] font-medium leading-snug tracking-[-0.015em] text-heading">
          <Link href={href} className="transition-colors hover:text-brand">
            {post.title}
          </Link>
        </h2>
        <p className="mt-2 text-[14.5px] leading-relaxed text-muted">{post.excerpt}</p>
        <Link
          href={href}
          className="mt-auto inline-flex min-h-11 items-center gap-1.5 pt-4 text-[14.5px] font-medium text-heading transition-colors hover:text-brand"
        >
          Devamını oku
          <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-0.5" />
          <span className="sr-only">: {post.title}</span>
        </Link>
      </div>
    </article>
  );
}
