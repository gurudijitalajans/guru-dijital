import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { services } from "@/lib/data";
import { PageHero } from "@/components/layout/PageHero";
import { CTASection } from "@/components/sections/CTASection";
import { Reveal } from "@/components/ui/Reveal";

export const metadata: Metadata = {
  title: "Hizmetler",
  description:
    "Sosyal medya yönetimi, grafik tasarım, içerik üretimi, web tasarım, dijital pazarlama ve video tasarımı — markanızı büyüten altı başlıkta entegre dijital çözümler.",
};

export default function HizmetlerPage() {
  return (
    <>
      <PageHero
        eyebrow="Hizmetlerimiz"
        title="Markanızı bir üst seviyeye taşıyan *hizmetler*"
        sub="Stratejiden üretime, yayından ölçüme; altı başlıkta uçtan uca dijital çözümler sunuyoruz. Her hizmeti tek başına ya da entegre bir bütün olarak markanız için kurguluyoruz."
      />

      {/* Hizmet listesi */}
      <section className="pb-20 md:pb-28">
        <div className="container-g flex flex-col gap-5 md:gap-6">
          {services.map((s, i) => {
            const Icon = s.icon;
            return (
              <Reveal key={s.slug} delay={Math.min(i * 0.08, 0.24)}>
                <Link
                  href={`/hizmetler/${s.slug}`}
                  className="group relative block rounded-3xl border border-paper/10 bg-carbon p-6 transition-all duration-300 hover:-translate-y-1 hover:border-guru/40 hover:shadow-[0_0_50px_rgba(16,216,108,0.07)] md:p-8"
                >
                  <div className="flex flex-col gap-6 md:flex-row md:items-center md:gap-10">
                    {/* Numara + ikon + metin */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-4 md:gap-5">
                        <span
                          className="headline-outline-light text-4xl font-extrabold leading-none md:text-5xl"
                          aria-hidden
                        >
                          {s.no}
                        </span>
                        <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-paper/10 text-paper transition-colors duration-300 group-hover:bg-guru group-hover:text-ink md:size-12">
                          <Icon className="size-5 md:size-6" strokeWidth={1.8} />
                        </span>
                      </div>
                      <h2 className="mt-5 text-2xl font-semibold tracking-tight md:text-3xl">
                        {s.title}
                      </h2>
                      <p className="mt-3 max-w-xl text-sm leading-relaxed text-paper/60 md:text-base">
                        {s.short}
                      </p>
                      <div className="mt-5 flex flex-wrap gap-2">
                        {s.keywords.map((k) => (
                          <span
                            key={k}
                            className="rounded-full border border-paper/15 px-3 py-1 text-xs font-medium text-paper/60 transition-colors duration-300 group-hover:border-guru/30"
                          >
                            {k}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Görsel önizleme */}
                    <div className="relative aspect-[16/9] w-full shrink-0 overflow-hidden rounded-2xl border border-paper/10 md:aspect-[4/3] md:w-60 lg:w-72">
                      <Image
                        src={s.images[0].src}
                        alt={s.images[0].alt}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(min-width: 1024px) 288px, (min-width: 768px) 240px, 100vw"
                      />
                    </div>

                    {/* Ok */}
                    <span className="absolute right-6 top-6 flex size-11 items-center justify-center rounded-full border border-paper/15 text-paper transition-all duration-300 group-hover:border-guru group-hover:bg-guru group-hover:text-ink md:static md:size-12 md:shrink-0">
                      <ArrowUpRight className="size-5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </section>

      <CTASection />
    </>
  );
}
