import type { Metadata } from "next";
import type { ReactNode } from "react";
import { InstagramIcon, WhatsAppIcon } from "@/components/ui/icons";
import { Glyph } from "@/components/site/Glyph";
import { PageIntro } from "@/components/site/PageIntro";
import { SectionHead } from "@/components/site/SectionHead";
import { sectionY } from "@/components/site/styles";
import { Reveal } from "@/components/ui/Reveal";
import { ContactForm } from "@/components/pages/ContactForm";
import { ContactFaq } from "@/components/pages/ContactFaq";
import { MeetingScheduler } from "@/components/pages/MeetingScheduler";
import { getSiteInfo, type SiteInfo } from "@/lib/cms";
import { getServices } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";
import { cn } from "@/lib/utils";

export const metadata: Metadata = pageMetadata({
  title: "İletişim",
  description:
    "Projenizi konuşalım: e-posta, WhatsApp, telefon, iletişim formu veya toplantı planlayarak Guru Dijital'e ulaşın. İlk görüşme ücretsiz, aynı gün dönüş yapıyoruz.",
  path: "/iletisim",
});

type ContactItem = {
  label: string;
  /** Umami olay adı (src/lib/analytics.ts EVENTS) */
  event: string;
  value: string;
  href: string;
  external?: boolean;
  icon: ReactNode;
};

function buildContactItems(site: SiteInfo): ContactItem[] {
  const items: ContactItem[] = [
    {
      label: "E-posta",
      event: "e-posta",
      value: site.email,
      href: `mailto:${site.email}`,
      icon: <Glyph name="mail" className="size-[18px]" />,
    },
    {
      label: "Instagram",
      event: "instagram",
      value: `@${site.instagram.replace(/\/+$/, "").split("/").pop() || "gurudijital"}`,
      href: site.instagram,
      external: true,
      icon: <InstagramIcon className="size-4" />,
    },
  ];

  // Aşağıdaki bilgiler panelin Site Ayarları'nda doldurulduğunda otomatik görünür.
  if (site.phone) {
    items.push({
      label: "Telefon",
      event: "telefon",
      value: site.phone,
      href: `tel:${site.phone.replace(/\s/g, "")}`,
      icon: <Glyph name="phone" className="size-[18px]" />,
    });
  }
  if (site.whatsapp) {
    items.push({
      label: "WhatsApp",
      event: "whatsapp",
      value: site.phone || site.whatsapp,
      href: `https://wa.me/${site.whatsapp.replace(/\D/g, "")}`,
      external: true,
      icon: <WhatsAppIcon className="size-4" />,
    });
  }
  if (site.address) {
    items.push({
      label: "Adres",
      event: "adres",
      value: site.address,
      href: `https://maps.google.com/?q=${encodeURIComponent(site.address)}`,
      external: true,
      icon: <Glyph name="map-pin" className="size-[18px]" />,
    });
  }

  const order = ["WhatsApp", "E-posta", "Telefon", "Instagram", "Adres"];
  return items.sort((a, b) => order.indexOf(a.label) - order.indexOf(b.label));
}

export default async function IletisimPage() {
  const [info, services] = await Promise.all([getSiteInfo(), getServices()]);
  const contactItems = buildContactItems(info);
  const serviceRefs = services.map((s) => ({ slug: s.slug, title: s.title }));

  return (
    <>
      <PageIntro
        eyebrow="İletişim"
        title="Bize ulaşın"
        lead="Fikrinizi, hedefinizi ya da aklınızdaki soruyu yazın; aynı gün dönüş yapalım. İlk görüşme ücretsiz."
        className="pb-8 md:pb-10"
      />

      {/* Form ve doğrudan iletişim: sayfanın tam genişliğinde, geniş ekranda yan yana */}
      <section id="iletisim-form" className="pb-16 md:pb-[72px]">
        {/* İki kart geniş ekranda eşit boyda: form kutusu uzar, metin alanı boşluğu doldurur */}
        <div className="container-g grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-8">
          <Reveal className="h-full min-w-0">
            <aside className="relative flex h-full flex-col overflow-hidden rounded-3xl bg-navy p-6 text-white md:p-8">
              <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-brand/40 blur-3xl" />
              <h2 className="relative text-[22px] font-medium leading-snug tracking-[-0.02em] md:text-[26px]">Doğrudan ulaşın</h2>
              <p className="relative mt-2 text-[15px] leading-relaxed text-white/75">
                Hangi kanal size kolaysa oradan yazın. Hafta içi 09.00-18.00 arasında aynı gün dönüş yapıyoruz.
              </p>
              <ul className="relative mb-6 mt-6 grid gap-2.5" aria-label="İletişim kanalları">
                {contactItems.map((item) => (
                  <li key={item.label}>
                    <a
                      href={item.href}
                      {...(item.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                      data-umami-event={item.event}
                      data-umami-event-konum="iletisim"
                      className="group flex min-h-14 items-center gap-3.5 rounded-2xl bg-white/[0.07] px-4 py-3 transition-colors hover:bg-white/[0.14]"
                    >
                      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white text-brand" aria-hidden>
                        {item.icon}
                      </span>
                      <span className="min-w-0 leading-tight">
                        <span className="block text-[12.5px] text-white/60">{item.label}</span>
                        {/* Adres uzun olabilir: kırılır; diğer kanallar tek satır */}
                        <span className={cn("block text-[15.5px] font-medium", item.label === "Adres" ? "break-words" : "truncate")}>{item.value}</span>
                      </span>
                    </a>
                  </li>
                ))}
                <li>
                  <a href="#toplanti" className="group flex min-h-14 items-center gap-3.5 rounded-2xl bg-white/[0.07] px-4 py-3 transition-colors hover:bg-white/[0.14]">
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white text-brand" aria-hidden>
                      <Glyph name="calendar-clock" className="size-[18px]" />
                    </span>
                    <span className="leading-tight">
                      <span className="block text-[12.5px] text-white/60">Görüntülü görüşme</span>
                      <span className="block text-[15.5px] font-medium">Toplantı planlayın</span>
                    </span>
                  </a>
                </li>
              </ul>
              <p className="relative mt-auto border-t border-white/10 pt-5 text-[13.5px] leading-relaxed text-white/65">
                Google Partner (2025 · 2026). Teklif ve ilk görüşme ücretsizdir; bilgileriniz yalnız size dönüş yapmak için kullanılır.
              </p>
            </aside>
          </Reveal>
          <Reveal delay={0.05} className="h-full min-w-0">
            <ContactForm services={serviceRefs} className="h-full" />
          </Reveal>
        </div>
      </section>

      {/* Toplantı planlama */}
      <section id="toplanti" className={cn("bg-soft", sectionY)}>
        <div className="container-g">
          <Reveal>
            <SectionHead
              center
              title="Toplantı Planlayın"
              lead="Size uygun günü ve saati seçin; 30 dakikalık ücretsiz görüşmenin Google Meet bağlantısını e-postanıza gönderelim."
            />
          </Reveal>
          <Reveal delay={0.05} className="mt-10 min-w-0">
            <MeetingScheduler wide />
          </Reveal>
        </div>
      </section>

      {/* Sık sorulanlar */}
      <section className={sectionY}>
        <div className="container-g">
          <Reveal>
            <SectionHead
              center
              title="Sık Sorulan Sorular"
              lead="Kısa cevaplar; ayrıntıları tanışma görüşmesinde birlikte netleştiririz."
            />
          </Reveal>
          <Reveal className="mt-10" delay={0.05}>
            <ContactFaq />
          </Reveal>
        </div>
      </section>
    </>
  );
}
