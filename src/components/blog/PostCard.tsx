import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cardCls, cardHoverCls } from "@/components/site/styles";
import { formatDate, type PostCardData } from "@/lib/blog";
import { cn } from "@/lib/utils";

type PostCardProps = {
  post: PostCardData;
  /** sayfanın LCP görseli (preload) */
  priority?: boolean;
  /** ilk satırdaki diğer kartlar (geç yüklenmesin) */
  eager?: boolean;
  /** wide: tek yazı gösterilirken md+ yatay kart (kapak solda) */
  layout?: "card" | "wide";
  /** başlık düzeyi: listede h2, bir bölümün içinde h3 */
  as?: "h2" | "h3";
};

/**
 * Blog kartı: kapak, kategori, tarih ve okuma süresi, başlık, özet. Çizgisiz, ince halkalı kart.
 * Kategori ayrı satırda durur; tarih ile okuma süresi bölünmez, ayraç nokta satır sonunda kalmaz.
 */
export function PostCard({ post, priority = false, eager = false, layout = "card", as: H = "h2" }: PostCardProps) {
  const href = `/blog/${post.slug}`;
  const wide = layout === "wide";
  return (
    <article
      className={cn(
        cardCls,
        cardHoverCls,
        "group flex h-full flex-col overflow-hidden",
        wide && "md:grid md:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]"
      )}
    >
      <Link
        href={href}
        tabIndex={-1}
        aria-hidden
        className={cn("relative block aspect-[16/10] overflow-hidden bg-soft", wide && "md:aspect-auto md:min-h-72")}
      >
        {post.cover ? (
          <Image
            src={post.cover.url}
            alt=""
            fill
            preload={priority}
            /* Next 16: preload ile loading birlikte verilmez */
            loading={priority ? undefined : eager ? "eager" : "lazy"}
            sizes={wide ? "(min-width: 1024px) 600px, (min-width: 768px) 55vw, 100vw" : "(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw"}
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
          />
        ) : (
          <div className="guru-beam absolute inset-0" />
        )}
      </Link>
      <div className={cn("flex flex-1 flex-col p-6", wide && "md:justify-center md:p-8 lg:p-10")}>
        {post.category && (
          <span className="mb-3 w-fit rounded-full bg-chip px-2.5 py-0.5 text-[13px] font-medium text-heading">{post.category.title}</span>
        )}
        <p className="text-[13px] text-muted">
          <span className="whitespace-nowrap">
            {post.publishedAt && (
              <>
                <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
                <span aria-hidden> · </span>
              </>
            )}
            {post.readingMinutes} dk okuma
          </span>
        </p>
        <H className={cn("mt-2 text-pretty text-[19px] font-medium leading-snug tracking-[-0.015em] text-heading", wide && "md:text-[24px]")}>
          <Link href={href} className="transition-colors hover:text-brand">
            {post.title}
          </Link>
        </H>
        <p className="mt-2 text-pretty text-[14.5px] leading-relaxed text-muted">{post.excerpt}</p>
        <Link
          href={href}
          className={cn(
            "mt-auto inline-flex min-h-11 w-fit items-center gap-1.5 pt-4 text-[14.5px] font-medium text-heading transition-colors hover:text-brand",
            wide && "md:mt-6"
          )}
        >
          Devamını oku
          <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-0.5" />
          <span className="sr-only">: {post.title}</span>
        </Link>
      </div>
    </article>
  );
}
