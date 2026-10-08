import Image from "next/image";
import Link from "next/link";
import { Check } from "lucide-react";
import { getProducts } from "@/lib/content";
import { iconFor } from "@/lib/icons";
import { Btn } from "@/components/site/Btn";
import { StaggerGroup, StaggerItem } from "@/components/ui/Reveal";
import { cardCls, cardTextCls, iconBoxCls } from "@/components/site/styles";
import { cn } from "@/lib/utils";

/**
 * Ürün vitrini: yazılım ürünleri, md+ iki sütunlu sade kartlar.
 *
 * Server component; belirme animasyonu client StaggerGroup/Item'da. Her kart
 * ürünün marka görselini gösterir, ad, kısa açıklama, üç madde ve
 * "Ürünü İncele" / "Demo Talep Et" butonları taşır. İlk ekran görüntüsü sayfanın
 * LCP adayı olduğu için preload edilir; ikinci kart md+ ilk ekranda: eager.
 * Ürün adları İngilizce: lang="en" büyük harf dönüşümünde noktalı İ oluşmasını önler.
 */
export async function ProductsShowcase() {
  const products = await getProducts();
  return (
    <StaggerGroup stagger={0.08} className="grid gap-5 md:grid-cols-2 md:gap-6">
      {products.map((p, i) => {
        const Icon = iconFor(p.icon);
        const href = `/urunler/${p.slug}`;
        return (
          <StaggerItem key={p.slug} className="h-full">
            <article className={cn(cardCls, "group flex h-full flex-col overflow-hidden")}>
              <Link href={href} aria-label={`${p.name} ürün sayfası`} className="block overflow-hidden bg-navy">
                {/* Marka ışık yelpazesiyle ürün giriş görseli */}
                <Image
                  src={p.heroVisual.src}
                  alt={p.heroVisual.alt}
                  width={p.heroVisual.w}
                  height={p.heroVisual.h}
                  /* Next 16: preload ile loading birlikte verilmez */
                  preload={i === 0}
                  loading={i === 0 ? undefined : i === 1 ? "eager" : "lazy"}
                  sizes="(min-width: 1248px) 570px, (min-width: 768px) calc(50vw - 60px), calc(100vw - 64px)"
                  className="block h-auto w-full transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                />
              </Link>

              <div className="flex flex-1 flex-col p-6 md:p-7">
                <div className="flex items-center gap-3.5">
                  <span className={iconBoxCls} aria-hidden>
                    <Icon className="size-5" strokeWidth={1.8} />
                  </span>
                  <div className="min-w-0">
                    <h2 lang="en" className="text-[22px] font-medium leading-tight tracking-[-0.02em] text-heading">
                      {p.name}
                    </h2>
                    <p className="mt-0.5 text-[14px] text-muted">{p.tagline}</p>
                  </div>
                </div>

                <p className={cn(cardTextCls, "mt-4 text-[15px] text-body")}>{p.desc}</p>

                <ul className="mt-4 space-y-2">
                  {p.highlights.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-[14.5px] text-body">
                      <Check aria-hidden className="mt-[3px] size-4 shrink-0 text-brand" strokeWidth={2.2} />
                      {f}
                    </li>
                  ))}
                </ul>

                <div className="mt-auto flex flex-col gap-3 pt-7 sm:flex-row">
                  <Btn href={href} variant="primary" arrow>
                    Ürünü İncele
                  </Btn>
                  <Btn href={`${href}#demo`} variant="light">
                    Demo Talep Et
                  </Btn>
                </div>
              </div>
            </article>
          </StaggerItem>
        );
      })}
    </StaggerGroup>
  );
}
