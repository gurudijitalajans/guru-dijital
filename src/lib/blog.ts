import "server-only";
import { cache } from "react";
import { cms } from "@/lib/cms";
import type { Category, Media, Post } from "@/payload-types";

/* Blog verisi panelden okunur; veritabanına ulaşılamazsa boş liste döner
   ve sayfalar "henüz yazı yok" durumunu gösterir. */

export type PostCardData = {
  slug: string;
  title: string;
  excerpt: string;
  publishedAt: string | null;
  category: { title: string; slug: string } | null;
  cover: { url: string; alt: string; width: number; height: number } | null;
  readingMinutes: number;
};

const asMedia = (m: Post["cover"]): Media | null => (m && typeof m === "object" ? m : null);
const asCategory = (c: Post["category"]): Category | null => (c && typeof c === "object" ? c : null);

/** Kart ve kapak için uygun boyut: varsa "card"/"wide", yoksa orijinal */
/** size "original": yüklenen dosyanın kendisi (ör. 2x ekranda 1024px kapak için 2048px kaynak) */
export function mediaSrc(m: Media | null, size: "card" | "wide" | "original" = "card") {
  if (!m?.url) return null;
  const s = size === "original" ? null : m.sizes?.[size];
  const pick = s?.url ? s : m;
  return {
    url: pick.url as string,
    width: (pick.width ?? m.width ?? 1600) as number,
    height: (pick.height ?? m.height ?? 900) as number,
    alt: m.alt,
  };
}

/** Lexical içerikteki metinden yaklaşık okuma süresi (dakikada ~200 kelime) */
export function readingMinutes(content: Post["content"]): number {
  let words = 0;
  const walk = (node: unknown) => {
    if (!node || typeof node !== "object") return;
    const n = node as { text?: string; children?: unknown[] };
    if (typeof n.text === "string") words += n.text.split(/\s+/).filter(Boolean).length;
    n.children?.forEach(walk);
  };
  walk(content?.root);
  return Math.max(1, Math.round(words / 200));
}

export function toCard(p: Post): PostCardData {
  const cat = asCategory(p.category);
  return {
    slug: p.slug ?? String(p.id),
    title: p.title,
    excerpt: p.excerpt,
    publishedAt: p.publishedAt ?? null,
    category: cat ? { title: cat.title, slug: cat.slug ?? "" } : null,
    cover: mediaSrc(asMedia(p.cover)),
    readingMinutes: readingMinutes(p.content),
  };
}

export const getPublishedPosts = cache(async (limit = 60): Promise<Post[]> => {
  try {
    const payload = await cms();
    const res = await payload.find({
      collection: "posts",
      where: { _status: { equals: "published" } },
      sort: "-publishedAt",
      limit,
      depth: 1,
    });
    return res.docs;
  } catch {
    return [];
  }
});

export const getPostBySlug = cache(async (slug: string): Promise<Post | null> => {
  try {
    const payload = await cms();
    const res = await payload.find({
      collection: "posts",
      where: { and: [{ slug: { equals: slug } }, { _status: { equals: "published" } }] },
      limit: 1,
      depth: 2,
    });
    return res.docs[0] ?? null;
  } catch {
    return null;
  }
});

const dateFmt = new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Istanbul" });
export const formatDate = (iso: string | null) => (iso ? dateFmt.format(new Date(iso)) : "");
