import type { Metadata } from "next";
import { ArrowRight, Check, Mail, MapPin, Phone } from "lucide-react";
import { InstagramIcon, WhatsAppIcon } from "@/components/ui/icons";
import { PageHero } from "@/components/layout/PageHero";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { StaggerGroup, StaggerItem, Reveal } from "@/components/ui/Reveal";
import { Scramble } from "@/components/fx/Scramble";
import { Spotlight } from "@/components/fx/Spotlight";
import { RotatingBadge } from "@/components/fx/RotatingBadge";
import { VelocityMarquee } from "@/components/fx/VelocityMarquee";
import { ContactForm } from "@/components/pages/ContactForm";
import { ContactFaq } from "@/components/pages/ContactFaq";
import { MeetingScheduler } from "@/components/pages/MeetingScheduler";
import { site } from "@/lib/data";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "İletişim",
  description:
    "Projenizi konuşalım: e-posta, Instagram, iletişim formu veya toplantı planlayarak Guru Dijital'e ulaşın. İlk görüşme ücretsiz, aynı gün dönüş yapıyoruz.",
  path: "/iletisim",
});

type ContactItem = {
  label: string;
  value: string;
  href: string;
  external?: boolean;
  icon: React.ReactNode;
};

function buildContactItems(): ContactItem[] {
  const items: ContactItem[] = [
    {
      label: "E-posta",
      value: site.email,
      href: `mailto:${site.email}`,
      icon: <Mail className="size-5" strokeWidth={2} />,
    },
    {
      label: "Instagram",
      value: "@gurudijital",
      href: site.instagram,
      external: true,
      icon: <InstagramIcon className="size-5" />,
    },
  ];

  // Aşağıdaki bilgiler data.ts'te doldurulduğunda otomatik görünür.
  if (site.phone) {
    items.push({
      label: "Telefon",
      value: site.phone,
      href: `tel:${site.phone.replace(/\s/g, "")}`,
      icon: <Phone className="size-5" strokeWidth={2} />,
    });
  }
  if (site.whatsapp) {
    items.push({
      label: "WhatsApp",
      value: site.whatsapp,
      href: `https://wa.me/${site.whatsapp.replace(/\D/g, "")}`,
      external: true,
      icon: <WhatsAppIcon className="size-5" />,
    });
  }
  if (site.address) {
    items.push({
      label: "Adres",
      value: site.address,
      href: `https://maps.google.com/?q=${encodeURIComponent(site.address)}`,
      external: true,
      icon: <MapPin className="size-5" strokeWidth={2} />,
    });
  }

  return items;
}

const externalAttrs = (item: ContactItem) =>
  item.external ? { target: "_blank", rel: "noopener noreferrer" } : {};

/* Masaüstü kanal sütununun altındaki "ne bekleyebilirsiniz" kartı */
const expectations = [
  "Aynı gün dönüş",
  "İlk keşif görüşmesi ücretsiz",
  "Yaklaşık 30 dakikalık çevrim içi görüşme",
];

/* PageHeroV2 eyebrow'u runtime'da ReactNode kabul eder (div içinde {eyebrow});
   tip yüzeyi string olduğundan güvenli daraltmayla geçilir. */
const heroEyebrow = (
  <Scramble text="İletişim" duration={1} />
) as unknown as string;

export default function IletisimPage() {
  const contactItems = buildContactItems();

  return (
    <>
      <PageHero
        eyebrow={heroEyebrow}
        title="Projenizi *konuşalım*"
        sub="Fikrinizi, hedefinizi ya da aklınızdaki soruyu yazın; aynı gün dönüş yapalım. İlk görüşme her zaman ücretsiz."
      >
        {/* Sıfır yükseklikli relative kanca: rozet başlığın sağ boşluğuna asılır */}
        <div className="relative hidden lg:block" aria-hidden={false}>
          <div className="absolute -top-44 right-0">
            <RotatingBadge
              size={100}
              href="#iletisim-form"
              label="Forma gidin: Projenizi konuşalım"
            />
          </div>
        </div>
      </PageHero>

      {/* İletişim kanalları + form */}
      <section id="iletisim-form" className="scroll-mt-28 pb-20 md:pb-28">
        <div className="container-g grid items-start gap-6 lg:grid-cols-[0.85fr_1.15fr] lg:gap-14">
          {/* Mobil/tablet: kanallar kompakt çip satırı, form ilk ekranda kalır */}
          <ul className="flex flex-wrap gap-2 lg:hidden" aria-label="İletişim kanalları">
            {contactItems.map((item) => (
              <li key={item.label}>
                <a
                  href={item.href}
                  {...externalAttrs(item)}
                  className="inline-flex min-h-11 items-center gap-2 rounded-full border border-fg/15 bg-card px-4 text-sm font-medium text-fg transition-colors duration-300 hover:border-guru/40 active:border-guru/60"
                >
                  <span className="text-guru-text" aria-hidden>
                    {item.icon}
                  </span>
                  <span className="sr-only">{item.label}: </span>
                  {item.value}
                </a>
              </li>
            ))}
          </ul>

          {/* Masaüstü: kanal kartları */}
          <StaggerGroup className="hidden flex-col gap-4 lg:flex">
            {contactItems.map((item) => (
              <StaggerItem key={item.label}>
                <Spotlight
                  className="overflow-hidden rounded-3xl"
                  size={360}
                  opacity={0.09}
                >
                  <a
                    href={item.href}
                    {...externalAttrs(item)}
                    className="group flex min-h-[96px] items-center gap-4 rounded-3xl border border-fg/10 bg-card p-6 transition-colors duration-300 hover:border-guru/40"
                  >
                    <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-guru/12 text-guru transition-colors duration-300 group-hover:bg-guru group-hover:text-ink">
                      {item.icon}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-xs font-semibold uppercase tracking-[0.14em] text-fg/50">
                        {item.label}
                      </span>
                      <span className="mt-1.5 block break-all text-[15px] font-semibold text-fg md:text-base">
                        {item.value}
                      </span>
                    </span>
                  </a>
                </Spotlight>
              </StaggerItem>
            ))}
            <StaggerItem>
              <div className="relative overflow-hidden rounded-3xl border border-fg/10 bg-band p-6 text-fg shadow-[0_0_50px_rgba(16,216,108,0.07)] md:p-7">
                <div className="grain-blob -right-16 -top-16 h-48 w-48 opacity-40" aria-hidden />
                <p className="relative text-lg font-bold leading-snug tracking-tight">
                  Ne bekleyebilirsiniz?
                </p>
                <ul className="relative mt-4 space-y-2.5 text-sm leading-relaxed text-fg/70">
                  {expectations.map((text) => (
                    <li key={text} className="flex items-start gap-2.5">
                      <Check
                        className="mt-1 size-4 shrink-0 text-guru-text"
                        strokeWidth={2.4}
                        aria-hidden
                      />
                      {text}
                    </li>
                  ))}
                </ul>
                <a
                  href="#toplanti"
                  className="group relative mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-guru-text transition-colors duration-300 hover:text-guru"
                >
                  Ya da doğrudan toplantı planlayın
                  <ArrowRight
                    className="size-4 shrink-0 transition-transform duration-300 group-hover:translate-x-1"
                    strokeWidth={2.2}
                  />
                </a>
              </div>
            </StaggerItem>
          </StaggerGroup>

          <Reveal className="min-w-0" delay={0.1}>
            <ContactForm />
          </Reveal>
        </div>
      </section>

      {/* Toplantı planlama */}
      <section id="toplanti" className="scroll-mt-28 pb-20 md:pb-28">
        <div className="container-g">
          <SectionHeading
            center
            dark
            eyebrow="Toplantı Planla"
            title="Ya da doğrudan toplantı *planlayın*"
            sub="Size uygun günü ve saati seçin; talebinize aynı gün onay dönüşü yapalım."
          />
          <div className="mt-12 md:mt-16">
            <Reveal>
              <MeetingScheduler />
            </Reveal>
          </div>
        </div>
      </section>

      {/* Mini SSS */}
      <section className="pb-24 md:pb-32">
        <div className="container-g">
          <SectionHeading
            center
            dark
            eyebrow="Sık Sorulanlar"
            title="Aklınıza takılan *sorular*"
            sub="Kısa cevaplar; detayları keşif görüşmesinde birlikte netleştiririz."
          />
          <div className="mt-12 md:mt-16">
            <Reveal>
              <ContactFaq />
            </Reveal>
          </div>
        </div>

        {/* Dekoratif velocity şeridi: düşük opaklık, tamamen süsleme */}
        <div
          aria-hidden
          className="mt-16 select-none py-4 md:mt-20"
        >
          <VelocityMarquee baseVelocity={0.6}>
            {Array.from({ length: 3 }, (_, i) => (
              <span
                key={i}
                className="mx-5 inline-flex items-center gap-5 text-sm font-semibold uppercase tracking-[0.22em] text-fg/20 md:text-base"
              >
                projenizi konuşalım
                <span className="text-guru/35">✦</span>
                aynı gün dönüş
                <span className="text-guru/35">✦</span>
              </span>
            ))}
          </VelocityMarquee>
        </div>
      </section>
    </>
  );
}
