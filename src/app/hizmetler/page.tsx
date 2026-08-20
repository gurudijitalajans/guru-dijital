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
                  className="group relative block rounded-3xl border border-ink/8 bg-white p-6 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-guru/40 hover:shadow-soft md:p-8"
                >
                  <div className="flex flex-col gap-6 md:flex-row md:items-center md:gap-10">
                    {/* Numara + ikon + metin */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-4 md:gap-5">
                        <span
                          className="headline-outline text-4xl font-extrabold leading-none md:text-5xl"
                          aria-hidden
                        >
                          {s.no}
                        </span>
                        <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-ink/5 text-ink transition-colors duration-300 group-hover:bg-guru md:size-12">
                          <Icon className="size-5 md:size-6" strokeWidth={1.8} />
                        </span>
                      </div>
                      <h2 className="mt-5 text-2xl font-semibold tracking-tight md:text-3xl">
                        {s.title}
                      </h2>
                      <p className="mt-3 max-w-xl text-sm leading-relaxed text-smoke md:text-base">
                        {s.short}
                      </p>
                      <div className="mt-5 flex flex-wrap gap-2">
                        {s.keywords.map((k) => (
                          <span
                            key={k}
                            className="rounded-full border border-ink/10 px-3 py-1 text-xs font-medium text-smoke transition-colors duration-300 group-hover:border-guru/30"
                          >
                            {k}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Görsel önizleme */}
                    <div className="relative aspect-[16/9] w-full shrink-0 overflow-hidden rounded-2xl border border-ink/8 md:aspect-[4/3] md:w-60 lg:w-72">
                      <Image
                        src={s.images[0].src}
                        alt={s.images[0].alt}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(min-width: 1024px) 288px, (min-width: 768px) 240px, 100vw"
                      />
                    </div>

                    {/* Ok */}
                    <span className="absolute right-6 top-6 flex size-11 items-center justify-center rounded-full border border-ink/10 text-ink transition-all duration-300 group-hover:border-guru group-hover:bg-guru md:static md:size-12 md:shrink-0">
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
