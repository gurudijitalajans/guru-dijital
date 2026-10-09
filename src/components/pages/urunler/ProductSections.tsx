import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check, Minus } from "lucide-react";
import type { ProductView } from "@/lib/content";
import { IconByName } from "@/lib/icons";
import { Btn } from "@/components/site/Btn";
import { SectionHead } from "@/components/site/SectionHead";
import { cardCls, cardHoverCls, cardTextCls, cardTitleCls, iconBoxCls, sectionY } from "@/components/site/styles";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/ui/Reveal";
import { cn } from "@/lib/utils";

/* Ürün sayfası bölümleri. Hepsi sunucu bileşeni; içerik getProducts() ile gelir. */

/** Bölümler yapışkan menünün altında kalmasın */
export const anchorCls = "scroll-mt-[124px] lg:scroll-mt-[140px]";

/** Başlıktaki *yıldızlı* kelime bir kademe kalın yazılır (renk yok) */
export function renderHeadline(text: string) {
  return text
    .split(/(\*[^*]+\*)/g)
    .filter(Boolean)
    .map((part, i) =>
      part.startsWith("*") && part.endsWith("*") ? (
        <span key={i} className="font-medium">
          {part.slice(1, -1)}
        </span>
      ) : (
        part
      )
    );
}

/* ---------------- Giriş: solda metin, sağda marka görseli ---------------- */
export function ProductHero({ product, hasTour }: { product: ProductView; hasTour: boolean }) {
  /* Alt boşluk görsel gölgesinin (~50px) tamamını içerir: yapışkan alt menünün beyaz zemini gölgeyi düz çizgiyle kesmez */
  return (
    <section id="genel-bakis" className={cn(anchorCls, "pb-14 pt-10 md:pb-16 md:pt-14")}>
      <div className="container-g grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.12fr)] lg:gap-14">
        <Reveal>
          <p className="inline-flex items-center gap-2.5 rounded-full bg-chip py-1.5 pl-1.5 pr-4 text-[14px] font-medium text-heading">
            <span className="grid size-7 place-items-center rounded-full bg-white text-brand shadow-[0_0_0_1px_rgb(1_20_65/0.06)]" aria-hidden>
              <IconByName name={product.icon} className="size-4" strokeWidth={2} />
            </span>
            <span lang="en">{product.hero.eyebrow}</span>
          </p>
          <h1 className="mt-5 text-balance text-[34px] font-normal leading-[1.12] tracking-[-0.035em] text-heading sm:text-[44px] lg:text-[50px]">
            {renderHeadline(product.hero.headline)}
          </h1>
          <p className="mt-5 max-w-xl text-[16px] leading-relaxed text-muted md:text-[17px]">{product.hero.sub}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Btn href="#demo" variant="primary" size="lg" arrow data-umami-event="teklif-al" data-umami-event-konum="urun-giris">
              {product.hero.ctaLabel}
            </Btn>
            {hasTour && (
              <Btn href="#urun-turu" variant="light" size="lg">
                Ürün Turunu İzleyin
              </Btn>
            )}
          </div>
          {product.trust.length > 0 && (
            <ul className="mt-8 grid gap-2.5 sm:flex sm:flex-wrap sm:gap-x-6">
              {product.trust.map((t) => (
                <li key={t} className="flex items-center gap-2.5 text-[14.5px] text-body">
                  <span className="grid size-5 shrink-0 place-items-center rounded-full bg-brand text-white" aria-hidden>
                    <Check className="size-3" strokeWidth={3} />
                  </span>
                  {t}
                </li>
              ))}
            </ul>
          )}
        </Reveal>
        {/* LCP görseli: Reveal'e sarılmaz, preload edilir */}
        <div className="overflow-hidden rounded-[24px] shadow-[0_28px_56px_-34px_rgb(1_20_65/0.6)] sm:rounded-[28px]">
          <Image
            src={product.heroVisual.src}
            alt={product.heroVisual.alt}
            width={product.heroVisual.w}
            height={product.heroVisual.h}
            preload
            sizes="(min-width: 1248px) 640px, (min-width: 1024px) 52vw, calc(100vw - 32px)"
            className="block h-auto w-full"
          />
        </div>
      </div>
    </section>
  );
}

/* ---------------- Öne çıkan ekranlar: görsel ve metin dönüşümlü ---------------- */
export function ShowcaseRows({ product }: { product: ProductView }) {
  if (product.showcase.length === 0) return null;
  return (
    <div className="grid gap-16 md:gap-24">
      {product.showcase.map((s, i) => {
        const flip = i % 2 === 1;
        return (
          <div key={s.title} className="grid items-center gap-8 lg:grid-cols-12 lg:gap-14">
            <Reveal className={cn("lg:col-span-7", flip && "lg:order-2")}>
              <div className="overflow-hidden rounded-[22px] shadow-[0_0_0_1px_rgb(1_20_65/0.06),0_30px_60px_-44px_rgb(1_20_65/0.6)]">
                <Image
                  src={s.image.src}
                  alt={s.image.alt}
                  width={s.image.w}
                  height={s.image.h}
                  /* İlk satır ilk ekrana yakın: geç yüklenmesin */
                  loading={i === 0 ? "eager" : "lazy"}
                  sizes="(min-width: 1248px) 700px, (min-width: 1024px) 56vw, calc(100vw - 32px)"
                  className="block h-auto w-full"
                />
              </div>
            </Reveal>
            {/* Tek sütunda (lg altı) metin satırı ~75 karakteri aşmasın */}
            <Reveal className={cn("max-w-2xl lg:col-span-5 lg:max-w-none", flip && "lg:order-1")} delay={0.06}>
              {s.eyebrow && (
                <p className="mb-3 inline-flex items-center gap-2 text-[13px] font-medium text-brand">
                  <span className="grid size-6 place-items-center rounded-full bg-chip text-[12px] tabular-nums text-brand" aria-hidden>
                    {i + 1}
                  </span>
                  {s.eyebrow}
                </p>
              )}
              <h3 className="text-balance text-[26px] font-medium leading-[1.2] tracking-[-0.02em] text-heading md:text-[30px]">
                {s.title}
              </h3>
              <p className="mt-4 text-[16px] leading-relaxed text-body">{s.desc}</p>
              {s.bullets.length > 0 && (
                <ul className="mt-6 grid gap-3">
                  {s.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-3 text-[15.5px] text-body">
                      <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-chip text-brand" aria-hidden>
                        <Check className="size-3" strokeWidth={3} />
                      </span>
                      {b}
                    </li>
                  ))}
                </ul>
              )}
            </Reveal>
          </div>
        );
      })}
    </div>
  );
}

/* ---------------- Ve daha fazlası: ikonlu özellik kartları ---------------- */
export function FeatureGrid({ product }: { product: ProductView }) {
  if (product.features.length === 0) return null;
  return (
    <StaggerGroup className="grid gap-4 sm:grid-cols-2 md:gap-5 lg:grid-cols-3">
      {product.features.map((f) => {
        return (
          <StaggerItem key={f.title} className="h-full">
            <article className={cn(cardCls, "h-full p-5 sm:p-6 md:p-7")}>
              <div className="flex items-center gap-3.5 sm:flex-col sm:items-start sm:gap-5">
                <span className={cn(iconBoxCls, "shrink-0")} aria-hidden>
                  <IconByName name={f.icon} className="size-5" strokeWidth={1.8} />
                </span>
                <h3 className={cardTitleCls}>{f.title}</h3>
              </div>
              <p className={cn(cardTextCls, "mt-3")}>{f.desc}</p>
            </article>
          </StaggerItem>
        );
      })}
    </StaggerGroup>
  );
}

/* ---------------- Bugün / Guru ile ---------------- */
export function ComparisonBlock({ product }: { product: ProductView }) {
  const { before, after } = product.comparison;
  if (before.length === 0 && after.length === 0) return null;
  return (
    <section className={sectionY}>
      <div className="container-g">
        <SectionHead
          center
          title={`${product.name} ile Neler Değişir`}
          lead="Bugün yaşanan dağınıklığı ve ürünle birlikte kurulan düzeni yan yana koyduk."
        />
        <div className="mx-auto mt-10 grid max-w-5xl gap-4 md:grid-cols-2 md:gap-5">
          <Reveal className="h-full">
            <div className="h-full rounded-[22px] bg-soft p-6 md:p-8">
              <p className="text-[14px] font-medium text-muted">Bugün</p>
              <ul className="mt-5 grid gap-4">
                {before.map((b) => (
                  <li key={b} className="flex items-start gap-3 text-[15.5px] leading-relaxed text-body">
                    <span className="mt-px grid size-6 shrink-0 place-items-center rounded-full bg-white text-muted" aria-hidden>
                      <Minus className="size-3.5" strokeWidth={2.4} />
                    </span>
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
          <Reveal className="h-full" delay={0.08}>
            <div className="relative isolate h-full overflow-hidden rounded-[22px] bg-navy p-6 md:p-8">
              {/* Geniş katman: parlak şerit kartın kenarına itilir, maddeler koyu zeminde kalır */}
              <div aria-hidden className="guru-beam absolute left-1/2 top-0 -z-10 h-full w-[1500px] max-w-none -translate-x-1/2" />
              <p className="text-[14px] font-medium text-white/80">
                <span lang="en">{product.name}</span> ile
              </p>
              <ul className="mt-5 grid gap-4">
                {after.map((a) => (
                  <li key={a} className="flex items-start gap-3 text-[15.5px] leading-relaxed text-white">
                    <span className="mt-px grid size-6 shrink-0 place-items-center rounded-full bg-white text-brand" aria-hidden>
                      <Check className="size-3.5" strokeWidth={3} />
                    </span>
                    {a}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ---------------- Neler dahil ---------------- */
export function IncludedGrid({ product }: { product: ProductView }) {
  if (product.included.length === 0) return null;
  return (
    <StaggerGroup className="grid gap-4 sm:grid-cols-2 md:gap-5 lg:grid-cols-4">
      {product.included.map((x) => {
        return (
          <StaggerItem key={x.title} className="h-full">
            <div className={cn(cardCls, "h-full p-5 sm:p-6")}>
              <div className="flex items-center gap-3.5 sm:flex-col sm:items-start sm:gap-5">
                <span className={cn(iconBoxCls, "shrink-0")} aria-hidden>
                  <IconByName name={x.icon} className="size-5" strokeWidth={1.8} />
                </span>
                <h3 className={cardTitleCls}>{x.title}</h3>
              </div>
              <p className={cn(cardTextCls, "mt-3")}>{x.desc}</p>
            </div>
          </StaggerItem>
        );
      })}
    </StaggerGroup>
  );
}

/* ---------------- Ürün kartı (paket modülleri ve diğer ürünler) ---------------- */
export function ProductCardLink({ product, cta = "İncele" }: { product: ProductView; cta?: string }) {
  return (
    <Link href={`/urunler/${product.slug}`} className={cn(cardCls, cardHoverCls, "group flex h-full flex-col overflow-hidden")}>
      <div className="relative aspect-[4/5] overflow-hidden bg-navy">
        <Image
          src={product.cover.src}
          alt={product.cover.alt}
          fill
          sizes="(min-width: 1024px) 390px, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
        />
      </div>
      <div className="flex flex-1 flex-col p-5 md:p-6">
        <h3 lang="en" className="flex items-center gap-2 text-[18px] font-medium text-heading">
          <IconByName name={product.icon} aria-hidden className="size-[18px] text-brand" strokeWidth={1.9} />
          {product.name}
        </h3>
        <p className="mt-1 text-[14px] text-muted">{product.tagline}</p>
        <p className={cn(cardTextCls, "mt-3")}>{product.desc}</p>
        <span className="mt-auto inline-flex min-h-11 items-center gap-1.5 pt-3 text-[14px] font-medium text-heading transition-colors group-hover:text-brand">
          {cta}
          <ArrowRight aria-hidden className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}
