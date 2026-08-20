import type { Metadata } from "next";
import { Globe, Mail, MapPin, Phone } from "lucide-react";
import { InstagramIcon, WhatsAppIcon } from "@/components/ui/icons";
import { PageHero } from "@/components/layout/PageHero";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { StaggerGroup, StaggerItem, Reveal } from "@/components/ui/Reveal";
import { ContactForm } from "@/components/pages/ContactForm";
import { ContactFaq } from "@/components/pages/ContactFaq";
import { site } from "@/lib/data";

export const metadata: Metadata = {
  title: "İletişim",
  description:
    "Projenizi konuşalım: e-posta, Instagram veya iletişim formu üzerinden Guru Dijital'e ulaşın. Aynı gün dönüş yapıyoruz.",
};

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
    {
      label: "Web",
      value: site.url.replace(/^https?:\/\/(www\.)?/, ""),
      href: site.url,
      external: true,
      icon: <Globe className="size-5" strokeWidth={2} />,
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

export default function IletisimPage() {
  const contactItems = buildContactItems();

  return (
    <>
      <PageHero
        eyebrow="İletişim"
        title="Projenizi *konuşalım*"
        sub="Fikrinizi, hedefinizi ya da aklınızdaki soruyu yazın; aynı gün dönüş yapalım. İlk görüşme her zaman ücretsiz."
      />

      {/* İletişim kanalları + form */}
      <section className="pb-20 md:pb-28">
        <div className="container-g grid items-start gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-14">
          <StaggerGroup className="flex flex-col gap-4">
            {contactItems.map((item) => (
              <StaggerItem key={item.label}>
                <a
                  href={item.href}
                  {...(item.external
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : {})}
                  className="group flex items-center gap-4 rounded-3xl border border-ink/8 bg-white p-6 shadow-card transition-colors duration-300 hover:border-guru/40"
                >
                  <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-guru/10 text-guru-deep transition-colors duration-300 group-hover:bg-guru group-hover:text-ink">
                    {item.icon}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-xs font-semibold uppercase tracking-[0.14em] text-smoke">
                      {item.label}
                    </span>
                    <span className="mt-1 block truncate font-semibold text-ink">
                      {item.value}
                    </span>
                  </span>
                </a>
              </StaggerItem>
            ))}
            <StaggerItem>
              <div className="relative overflow-hidden rounded-3xl bg-coal p-6 text-paper md:p-7">
                <div className="grain-blob -right-16 -top-16 h-48 w-48 opacity-40" aria-hidden />
                <p className="relative text-lg font-bold leading-snug tracking-tight">
                  unlock the <span className="text-guru">next</span> level
                </p>
                <p className="relative mt-2 text-sm leading-relaxed text-paper/60">
                  Markanızı bir sonraki seviyeye taşımak için tek mesaj yeter.
                </p>
              </div>
            </StaggerItem>
          </StaggerGroup>

          <Reveal delay={0.1}>
            <ContactForm />
          </Reveal>
        </div>
      </section>

      {/* Mini SSS */}
      <section className="pb-24 md:pb-32">
        <div className="container-g">
          <SectionHeading
            center
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
      </section>
    </>
  );
}
