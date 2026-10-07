import { productExtras } from "@/lib/product-extras";

/**
 * product-extras.ts yedeğini panel alanlarına çevirir (seed ve tek seferlik
 * güncelleme betiği ortak kullanır). Görseller verilen yükleyiciyle medyaya
 * aktarılır; paket ürünleri adresten kimliğe çevrilir.
 */
type Upload = (img: { src: string; alt: string }) => Promise<number>;

export async function productExtrasData(slug: string, mediaFor: Upload, idBySlug: Record<string, number>) {
  const x = productExtras[slug];
  if (!x) return null;
  const rows = (list: string[]) => list.map((text) => ({ text }));
  const showcase = [];
  for (const s of x.showcase) {
    showcase.push({
      eyebrow: s.eyebrow,
      title: s.title,
      desc: s.desc,
      bullets: rows(s.bullets),
      image: await mediaFor({ src: s.image.src, alt: s.image.alt }),
    });
  }
  return {
    heroVisual: await mediaFor({ src: x.heroVisual.src, alt: x.heroVisual.alt }),
    /* Paylaşım görseli yüklenmez: medya webp'ye çevirir; varsayılan hazır jpg kullanılır */
    trust: rows(x.trust),
    tour: { show: true, title: x.video.title, videoUrl: x.video.src },
    showcase,
    comparison: { before: rows(x.comparison.before), after: rows(x.comparison.after) },
    included: x.included.map((i) => ({ icon: i.icon, title: i.title, desc: i.desc })),
    bundle: (x.bundle ?? []).map((s) => idBySlug[s]).filter((id): id is number => typeof id === "number"),
  };
}
