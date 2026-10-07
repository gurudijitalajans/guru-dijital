import type { Metadata } from "next";
import type { ReactNode } from "react";
import { CalendarClock, Mail, MapPin, Phone } from "lucide-react";
import { InstagramIcon, WhatsAppIcon } from "@/components/ui/icons";
import { PageIntro } from "@/components/site/PageIntro";
import { SectionHead } from "@/components/site/SectionHead";
import { sectionY } from "@/components/site/styles";
import { Reveal } from "@/components/ui/Reveal";
import { ContactForm } from "@/components/pages/ContactForm";
import { ContactFaq } from "@/components/pages/ContactFaq";
import { MeetingScheduler } from "@/components/pages/MeetingScheduler";
import { getSiteInfo, type SiteInfo } from "@/lib/cms";
import { pageMetadata } from "@/lib/seo";
import { cn } from "@/lib/utils";

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
  icon: ReactNode;
};

function buildContactItems(site: SiteInfo): ContactItem[] {
  const items: ContactItem[] = [
    {
      label: "E-posta",
      value: site.email,
      href: `mailto:${site.email}`,
      icon: <Mail className="size-4" strokeWidth={2} />,
    },
    {
      label: "Instagram",
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
      value: site.phone,
      href: `tel:${site.phone.replace(/\s/g, "")}`,
      icon: <Phone className="size-4" strokeWidth={2} />,
    });
  }
  if (site.whatsapp) {
    items.push({
      label: "WhatsApp",
      value: site.whatsapp,
      href: `https://wa.me/${site.whatsapp.replace(/\D/g, "")}`,
      external: true,
      icon: <WhatsAppIcon className="size-4" />,
    });
  }
  if (site.address) {
    items.push({
      label: "Adres",
      value: site.address,
      href: `https://maps.google.com/?q=${encodeURIComponent(site.address)}`,
      external: true,
      icon: <MapPin className="size-4" strokeWidth={2} />,
    });
  }

  return items;
}

/* Sade iletişim çipi: beyaz hap, ince halka, mavi ikon; 44px dokunma hedefi */
const chipCls =
  "inline-flex min-h-11 max-w-full items-center gap-2 rounded-full bg-white px-4 text-[14.5px] font-medium text-heading shadow-[0_0_0_1px_rgb(1_20_65/0.1)] transition-[color,box-shadow] duration-300 hover:text-brand hover:shadow-[0_0_0_1px_rgb(42_106_202/0.45)]";

export default async function IletisimPage() {
  const contactItems = buildContactItems(await getSiteInfo());

  return (
    <>
      <PageIntro
        eyebrow="İletişim"
        title="Tanışalım"
        lead="Fikrinizi, hedefinizi ya da aklınızdaki soruyu yazın; aynı gün dönüş yapalım. İlk görüşme ücretsiz."
        className="pb-8 md:pb-10"
      >
        <ul className="flex flex-wrap justify-center gap-2" aria-label="İletişim kanalları">
          {contactItems.map((item) => (
            <li key={item.label} className="max-w-full">
              <a
                href={item.href}
                {...(item.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                className={chipCls}
              >
                <span className="shrink-0 text-brand" aria-hidden>
                  {item.icon}
                </span>
                <span className="sr-only">{item.label}: </span>
                <span className="truncate">{item.value}</span>
              </a>
            </li>
          ))}
          <li>
            <a href="#toplanti" className={chipCls}>
              <CalendarClock className="size-4 shrink-0 text-brand" strokeWidth={2} aria-hidden />
              Toplantı planlayın
            </a>
          </li>
        </ul>
      </PageIntro>

      {/* Form: ilk ekranda, ortalanmış */}
      <section id="iletisim-form" className="pb-16 md:pb-[72px]">
        <div className="container-g">
          <Reveal className="mx-auto max-w-3xl" delay={0.05}>
            <ContactForm />
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
              lead="Size uygun günü ve saati seçin; talebinize aynı gün onay dönüşü yapalım."
            />
          </Reveal>
          <Reveal className="mt-10" delay={0.05}>
            <MeetingScheduler />
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
          <Reveal className="mx-auto mt-10 max-w-5xl" delay={0.05}>
            <ContactFaq />
          </Reveal>
        </div>
      </section>
    </>
  );
}
