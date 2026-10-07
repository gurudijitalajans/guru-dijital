import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import { process } from "@/lib/data";
import { getServices } from "@/lib/content";
import { iconFor } from "@/lib/icons";
import { pageMetadata } from "@/lib/seo";
import { cn, countWord } from "@/lib/utils";
import { Btn } from "@/components/site/Btn";
import { PageIntro } from "@/components/site/PageIntro";
import { SectionHead } from "@/components/site/SectionHead";
import {
  cardCls,
  cardHoverCls,
  cardTextCls,
  cardTitleCls,
  iconBoxCls,
  sectionY,
} from "@/components/site/styles";
import { StaggerGroup, StaggerItem } from "@/components/ui/Reveal";
import { ClosingCta } from "@/components/site/ClosingCta";

/* Açıklama hizmet adlarından üretilir: panelde hizmet eklenip çıkarılınca güncel kalır */
export async function generateMetadata(): Promise<Metadata> {
  const services = await getServices();
  const names = services.map((s) => s.title.toLocaleLowerCase("tr-TR"));
  const list = names.length > 1 ? `${names.slice(0, -1).join(", ")} ve ${names.at(-1)}` : names.join("");
  return pageMetadata({
    title: "Hizmetler",
    description: `${list.charAt(0).toLocaleUpperCase("tr-TR")}${list.slice(1)}: markanızı büyüten ${countWord(services.length)} başlıkta entegre çözümler.`,
    path: "/hizmetler",
  });
}

export default async function HizmetlerPage() {
  const services = await getServices();
  return (
    <>
      <PageIntro
        eyebrow="Hizmetlerimiz"
        title={`Markanızı büyüten ${countWord(services.length)} hizmet, tek ekip`}
        lead="Sosyal medyadan web tasarıma, dijital pazarlamadan videoya kadar markanızın ihtiyaç duyduğu işleri aynı masada planlıyor, tek ekiple yönetiyoruz."
      >
        <Btn href="/iletisim" size="lg" arrow>
          Teklif Al
        </Btn>
        <Btn href="/iletisim#toplanti" variant="light" size="lg">
          Toplantı Planla
        </Btn>
      </PageIntro>

      {/* Hizmet kartları: görsel, ikon, başlık, kısa açıklama, İncele */}
      <section className="pb-16 md:pb-[72px]" aria-label="Hizmet listesi">
        <div className="container-g">
          <StaggerGroup className="grid gap-4 sm:grid-cols-2 md:gap-5 lg:grid-cols-3">
            {services.map((s, i) => {
              const Icon = iconFor(s.icon);
              const img = s.card;
              return (
                <StaggerItem key={s.slug} className="h-full">
                  <Link
                    href={`/hizmetler/${s.slug}`}
                    className={cn(cardCls, cardHoverCls, "group flex h-full flex-col p-2.5")}
                  >
                    {img && (
                      <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-soft">
                        <Image
                          src={img.src}
                          alt={img.alt}
                          fill
                          sizes="(min-width: 1280px) 390px, (min-width: 1024px) 31vw, (min-width: 640px) 48vw, 100vw"
                          preload={i === 0}
                          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                          style={img.position ? { objectPosition: img.position } : undefined}
                        />
                      </div>
                    )}
                    <div className="flex flex-1 flex-col gap-3 px-3.5 pb-4 pt-5 md:px-4">
                      <div className="flex items-center justify-between">
                        <span className={iconBoxCls} aria-hidden>
                          <Icon className="size-5" strokeWidth={1.8} />
                        </span>
                        <span className="text-[13px] font-medium tabular-nums text-muted" aria-hidden>
                          {s.no}
                        </span>
                      </div>
                      <h2 className={cn(cardTitleCls, "mt-1 text-[19px]")}>{s.title}</h2>
                      <p className={cardTextCls}>{s.short}</p>
                      <span className="mt-auto inline-flex min-h-11 items-center gap-1.5 pt-1 text-[14px] font-medium text-heading transition-colors group-hover:text-brand">
                        İncele
                        <ArrowRight
                          aria-hidden
                          className="size-4 transition-transform duration-300 group-hover:translate-x-0.5"
                        />
                      </span>
                    </div>
                  </Link>
                </StaggerItem>
              );
            })}
          </StaggerGroup>
        </div>
      </section>

      {/* Çalışma biçimi: process verisi, sade numaralı kartlar */}
      <section className={cn(sectionY, "bg-soft")}>
        <div className="container-g">
          <SectionHead
            title="Nasıl Çalışıyoruz"
            lead="Hangi hizmetle başlarsanız başlayın, süreç aynı netlikte ilerler: önce dinliyor, sonra planlıyor, üretiyor ve ölçüyoruz."
          />
          <StaggerGroup className="mt-10 grid gap-4 sm:grid-cols-2 md:gap-5 lg:grid-cols-4">
            {process.map((step) => (
              <StaggerItem key={step.no} className="h-full">
                <article className={cn(cardCls, "flex h-full flex-col gap-3 p-6 md:p-7")}>
                  <span
                    className="grid size-11 place-items-center rounded-xl bg-chip text-[15px] font-medium tabular-nums text-brand"
                    aria-hidden
                  >
                    {step.no}
                  </span>
                  <h3 className={cn(cardTitleCls, "mt-2")}>
                    <span className="sr-only">{step.no}. </span>
                    {step.title}
                  </h3>
                  <p className={cardTextCls}>{step.desc}</p>
                </article>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </section>

      <ClosingCta
        title="Tanışalım"
        lead="Markanızı ve hedeflerinizi dinleyelim; hangi hizmetlerle başlamanın doğru olduğunu birlikte belirleyelim."
      />
    </>
  );
}
