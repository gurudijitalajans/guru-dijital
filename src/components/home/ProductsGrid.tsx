import Image from "next/image";
import Link from "next/link";
import { products } from "@/lib/data";
import { SectionHead } from "@/components/site/SectionHead";
import { StaggerGroup, StaggerItem } from "@/components/ui/Reveal";
import { cardCls, cardHoverCls, sectionY } from "@/components/site/styles";
import { cn } from "@/lib/utils";

export function ProductsGrid() {
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
            const Icon = p.icon;
            return (
              <StaggerItem key={p.slug} className="h-full">
                <Link href={`/urunler/${p.slug}`} className={cn(cardCls, cardHoverCls, "group flex h-full flex-col overflow-hidden")}>
                  <div className="bg-[#e9eff8] px-4 pt-4">
                    <Image
                      src={p.image}
                      alt={p.imageAlt}
                      width={1600}
                      height={1100}
                      sizes="(min-width: 1024px) 280px, (min-width: 640px) 45vw, 90vw"
                      className="block h-auto w-full rounded-t-lg shadow-[0_10px_24px_-14px_rgb(1_20_65/0.6)] transition-transform duration-500 group-hover:-translate-y-1"
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
