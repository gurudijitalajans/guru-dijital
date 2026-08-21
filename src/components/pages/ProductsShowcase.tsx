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
 */
export function ProductsShowcase() {
  return (
    <StaggerGroup
      stagger={0.1}
      className="grid grid-cols-1 gap-5 md:gap-6 lg:grid-cols-2 xl:gap-8"
    >
      {products.map((p) => {
        const Icon = p.icon;
        return (
          <StaggerItem key={p.slug} className="h-full">
            <GlowBorder radius="1.5rem" className="group/card h-full">
              <Spotlight
                className="h-full overflow-hidden rounded-[calc(1.5rem-1px)]"
                opacity={0.08}
              >
                <article className="flex h-full flex-col p-7 sm:p-8 lg:p-10">
                  {/* Üst satır: ikon rozeti + Yakında pili */}
                  <div className="flex items-start justify-between gap-4">
                    <span
                      className="grid size-14 shrink-0 place-items-center rounded-2xl bg-guru/12 text-guru transition-colors duration-300 group-hover/card:bg-guru group-hover/card:text-ink md:size-16"
                      aria-hidden
                    >
                      <Icon className="size-7 md:size-8" strokeWidth={1.8} />
                    </span>
                    {p.comingSoon && (
                      <span className="inline-flex items-center gap-2 rounded-full border border-guru/40 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-guru">
                        <span
                          className="size-1.5 rounded-full bg-guru motion-safe:animate-pulse"
                          aria-hidden
                        />
                        Yakında
                      </span>
                    )}
                  </div>

                  {/* Ad + tagline + kısa açıklama */}
                  <h2 className="mt-6 text-2xl font-extrabold tracking-[-0.03em] text-paper md:text-3xl">
                    {p.name}
                  </h2>
                  <p className="mt-2 text-base font-medium text-paper/80">
                    {p.tagline}
                  </p>
                  <p className="mt-3 max-w-md text-sm leading-relaxed text-paper/55">
                    {p.desc}
                  </p>

                  {/* Üç özellik maddesi */}
                  <ul className="mt-6 space-y-2.5 border-t border-paper/10 pt-6">
                    {p.features.map((f) => (
                      <li
                        key={f}
                        className="flex items-center gap-3 text-sm text-paper/70"
                      >
                        <span
                          className="size-1.5 shrink-0 rounded-full bg-guru shadow-[0_0_8px_rgb(16_216_108/0.6)]"
                          aria-hidden
                        />
                        {f}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-auto pt-8">
                    <GButton
                      href="/iletisim"
                      variant="dark"
                      className="w-full border border-paper/15 sm:w-auto"
                    >
                      Haberdar Et
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
