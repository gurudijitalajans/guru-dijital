import Image from "next/image";
import Link from "next/link";
import { products } from "@/lib/data";
import { StaggerGroup, StaggerItem } from "@/components/ui/Reveal";
import { GlowBorder } from "@/components/fx/GlowBorder";
import { Spotlight } from "@/components/fx/Spotlight";
import { GButton } from "@/components/ui/Button";

/**
 * ProductsShowcase — işletmeye yönelik yazılım ürünlerinin 2x2 dev kart vitrini.
 *
 * Server component: animasyon ve etkileşim tamamı client alt bileşenlerde
 * (StaggerGroup/Item, GlowBorder, Spotlight). Kart hover'ı `group/card`
 * adlı grupla izlenir; GButton'un kendi isimsiz `group`u ile çakışmaz.
 * Her kart ürünün mockup ekranını gösterir ve ürün sayfasına bağlanır.
 */
export function ProductsShowcase() {
  return (
    <StaggerGroup
      stagger={0.1}
      className="grid grid-cols-1 gap-5 md:gap-6 lg:grid-cols-2 xl:gap-8"
    >
      {products.map((p) => {
        const Icon = p.icon;
        const href = `/urunler/${p.slug}`;
        return (
          <StaggerItem key={p.slug} className="h-full">
            <GlowBorder radius="1.5rem" className="group/card h-full">
              <Spotlight
                className="h-full overflow-hidden rounded-[calc(1.5rem-1px)]"
                opacity={0.08}
              >
                <article className="flex h-full flex-col p-5 sm:p-7 lg:p-8">
                  {/* Ürün mockup ekranı */}
                  <Link
                    href={href}
                    aria-label={`${p.name} ürün sayfası`}
                    data-cursor
                    className="relative block overflow-hidden rounded-2xl border border-fg/10 bg-band"
                  >
                    <div
                      aria-hidden
                      className="pointer-events-none absolute inset-x-8 -top-10 h-24 rounded-full bg-guru/25 blur-3xl opacity-0 transition-opacity duration-500 group-hover/card:opacity-100"
                    />
                    {/* SVG kaynak: next/image olduğu gibi sunar (optimize etmez) */}
                    <Image
                      src={p.image}
                      alt={p.imageAlt}
                      width={1600}
                      height={1100}
                      sizes="(min-width: 1024px) 560px, 100vw"
                      className="relative block h-auto w-full transition-transform duration-700 ease-out group-hover/card:scale-[1.03]"
                    />
                  </Link>

                  {/* Ad + ikon */}
                  <div className="mt-6 flex items-center gap-4">
                    <span
                      className="grid size-12 shrink-0 place-items-center rounded-xl bg-guru/12 text-guru transition-colors duration-300 group-hover/card:bg-guru group-hover/card:text-ink md:size-14"
                      aria-hidden
                    >
                      <Icon className="size-6 md:size-7" strokeWidth={1.8} />
                    </span>
                    <div className="min-w-0">
                      <h2 className="text-2xl font-extrabold tracking-[-0.03em] text-fg md:text-3xl">
                        <Link href={href} className="transition-colors hover:text-guru">
                          {p.name}
                        </Link>
                      </h2>
                      <p className="mt-0.5 text-sm font-medium text-fg/70 md:text-base">
                        {p.tagline}
                      </p>
                    </div>
                  </div>

                  <p className="mt-4 max-w-lg text-sm leading-relaxed text-fg/55">
                    {p.desc}
                  </p>

                  {/* Üç özellik maddesi */}
                  <ul className="mt-5 space-y-2.5 border-t border-fg/10 pt-5">
                    {p.features.map((f) => (
                      <li
                        key={f}
                        className="flex items-center gap-3 text-sm text-fg/70"
                      >
                        <span
                          className="size-1.5 shrink-0 rounded-full bg-guru shadow-[0_0_8px_rgb(16_216_108/0.6)]"
                          aria-hidden
                        />
                        {f}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-auto flex flex-col gap-3 pt-7 sm:flex-row">
                    <GButton
                      href={href}
                      variant="dark"
                      className="w-full border border-fg/15 sm:w-auto"
                    >
                      Ürünü İncele
                    </GButton>
                    <GButton
                      href={`${href}#demo`}
                      variant="outline"
                      className="w-full sm:w-auto"
                    >
                      Demo Talep Et
                    </GButton>
                  </div>
                </article>
              </Spotlight>
            </GlowBorder>
          </StaggerItem>
        );
      })}
    </StaggerGroup>
  );
}
