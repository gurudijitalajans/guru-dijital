import type { Metadata } from "next";
import { Headset, Layers, ShieldCheck, UserCheck } from "lucide-react";
import { PageIntro } from "@/components/site/PageIntro";
import { SectionHead } from "@/components/site/SectionHead";
import { ClosingCta } from "@/components/site/ClosingCta";
import { ProductsShowcase } from "@/components/pages/ProductsShowcase";
import { StaggerGroup, StaggerItem } from "@/components/ui/Reveal";
import { cardCls, cardTextCls, cardTitleCls, iconBoxCls, sectionY } from "@/components/site/styles";
import { pageMetadata } from "@/lib/seo";
import { cn } from "@/lib/utils";

/* Başlık 51 karakter (kök şablon eklenmez), açıklama 150 karakter; canonical + OG tek yerden. */
export const metadata: Metadata = pageMetadata({
  title: "Guru Ürünleri | Chatbot, CRM, Operation ve Business",
  absoluteTitle: true,
  description:
    "Guru Chatbot, CRM, Operation ve Business: müşteri iletişimi, satış ve operasyonu tek çatıda yöneten işletme yazılımlarımızı keşfedin, demo talep edin.",
  path: "/urunler",
});

/* "Neden Guru" maddeleri yalnız ürün SSS'lerinde zaten taahhüt edilen
   konulara dayanır (products-content.ts): ortak veri tabanı, kurulum ve
   eğitim, şifreli saklama ve rol bazlı yetki, Türkçe destek. */
const reasons = [
  {
    icon: Layers,
    title: "Birlikte Çalışan Modüller",
    desc: "Her ürün tek başına çalışır; birlikte kullandığınızda aynı veri tabanını paylaşır. Bir modüle giren kayıt diğerinde hazır bekler.",
  },
  {
    icon: UserCheck,
    title: "Kurulum ve Eğitim Bizden",
    desc: "Kurulumu sizinle birlikte yapar, ekibinize canlı eğitim verir ve ilk haftalarda kullanımı yakından izleriz.",
  },
  {
    icon: ShieldCheck,
    title: "Verileriniz Güvende",
    desc: "Veriler şifreli olarak saklanır; rol bazlı yetkiyle kimin neyi göreceğini siz belirlersiniz. KVKK akışlarını birlikte kurgularız.",
  },
  {
    icon: Headset,
    title: "Türkçe Destek",
    desc: "Türkçe teknik destek ve düzenli güncellemeler aboneliğinize dahildir; sorularınız için ayrı bir ücret ödemezsiniz.",
  },
];

export default function UrunlerPage() {
  return (
    <>
      <PageIntro
        eyebrow="Ürünlerimiz"
        title="İşletmenizi büyüten yazılım ürünleri"
        lead="Ajans deneyimimizi işletmeniz için çalışan yazılımlara dönüştürdük. Müşteri iletişimi, satış ve operasyonu tek çatıda yönetin."
      />

      {/* Ürün vitrini: dört ürün, md+ iki sütun */}
      <section className="pb-16 md:pb-[72px]">
        <div className="container-g">
          <ProductsShowcase />
        </div>
      </section>

      {/* Neden Guru yazılımları: açık bant, dört kısa madde */}
      <section className={cn("bg-soft", sectionY)}>
        <div className="container-g">
          <SectionHead
            title="Neden Guru Yazılımları"
            lead="Ajans deneyimimizden doğan yazılımlar; kurulumdan desteğe kadar her adımda yanınızdayız."
          />
          <StaggerGroup className="mt-10 grid gap-4 sm:grid-cols-2 md:gap-5 lg:grid-cols-4">
            {reasons.map((r) => {
              const Icon = r.icon;
              return (
                <StaggerItem key={r.title} className="h-full">
                  <div className={cn(cardCls, "h-full p-5 sm:p-6")}>
                    <div className="flex items-center gap-3.5 sm:flex-col sm:items-start sm:gap-5">
                      <span className={cn(iconBoxCls, "shrink-0")} aria-hidden>
                        <Icon className="size-5" strokeWidth={1.8} />
                      </span>
                      <h3 className={cardTitleCls}>{r.title}</h3>
                    </div>
                    <p className={cn(cardTextCls, "mt-3")}>{r.desc}</p>
                  </div>
                </StaggerItem>
              );
            })}
          </StaggerGroup>
        </div>
      </section>

      {/* Kapanış */}
      <ClosingCta
        title="İşletmenize özel bir çözüm mü gerekiyor?"
        lead="İhtiyacınızı dinleyelim; size uygun ürünü ve kurulumu birlikte planlayalım."
      />
    </>
  );
}
