import Image from "next/image";
import Link from "next/link";
import { getProducts } from "@/lib/content";
import { iconFor } from "@/lib/icons";
import { SectionHead } from "@/components/site/SectionHead";
import { StaggerGroup, StaggerItem } from "@/components/ui/Reveal";
import { cardCls, cardHoverCls, sectionY } from "@/components/site/styles";
import { cn } from "@/lib/utils";

export async function ProductsGrid() {
  const products = await getProducts();
  return (
    <section className={cn("bg-soft", sectionY)}>
      <div className="container-g">
        <SectionHead
          title="Ürünlerimiz"
          lead="Ajans deneyimimizi işletmeniz için çalışan yazılımlara dönüştürdük."
          action={{ href: "/urunler", label: "Tüm Ürünler" }}
        />
        <StaggerGroup className="mt-10 grid gap-4 sm:grid-cols-2 md:gap-5 lg:grid-cols-4">
          {products.map((p) => {
            const Icon = iconFor(p.icon);
            return (
              <StaggerItem key={p.slug} className="h-full">
                <Link href={`/urunler/${p.slug}`} className={cn(cardCls, cardHoverCls, "group flex h-full flex-col overflow-hidden")}>
                  {/* App Store tarzı dikey kapak */}
                  <div className="relative aspect-[4/5] overflow-hidden bg-navy">
                    <Image
                      src={p.cover.src}
                      alt={p.cover.alt}
                      fill
                      sizes="(min-width: 1280px) 290px, (min-width: 1024px) 23vw, (min-width: 640px) 45vw, 90vw"
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                    />
                  </div>
                  <div className="p-5">
                    <h3 className="flex items-center gap-2 text-[17px] font-medium text-heading" lang="en">
                      <Icon aria-hidden className="size-[18px] text-brand" strokeWidth={1.9} />
                      {p.name}
                    </h3>
                    <p className="mt-1 text-[14px] text-muted">{p.tagline}</p>
                  </div>
                </Link>
              </StaggerItem>
            );
          })}
        </StaggerGroup>
      </div>
    </section>
  );
}
