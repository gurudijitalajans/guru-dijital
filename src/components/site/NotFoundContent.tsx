import Link from "next/link";
import { Btn } from "@/components/site/Btn";

/* Kaybolan ziyaretçiye en çok aranan sayfalar */
const QUICK = [
  { href: "/hizmetler", label: "Hizmetlerimiz" },
  { href: "/urunler", label: "Ürünlerimiz" },
  { href: "/referanslar", label: "Referanslarımız" },
  { href: "/hakkimizda", label: "Hakkımızda" },
];

/** 404 içeriği: hem site içindeki notFound() hem de eşleşmeyen adresler (global 404) kullanır. */
export function NotFoundContent() {
  return (
    <section className="flex min-h-[56svh] items-center py-14 text-center md:min-h-[64svh] md:py-28">
      <div className="container-g">
        <p
          aria-hidden
          className="select-none text-[96px] font-light leading-none tracking-[-0.06em] text-brand sm:text-[136px] lg:text-[160px]"
        >
          404
        </p>
        <h1 className="mx-auto mt-6 max-w-3xl text-balance text-[32px] font-normal leading-[1.12] tracking-[-0.035em] text-heading sm:text-[44px]">
          Sayfa bulunamadı
        </h1>
        <p className="mx-auto mt-4 max-w-md text-balance text-[16px] leading-relaxed text-muted">
          Aradığınız sayfa kaldırılmış ya da adresi değişmiş olabilir. Ana sayfadan devam edebilir veya
          bize yazabilirsiniz.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Btn href="/" variant="primary" size="lg" arrow className="w-full max-w-xs sm:w-auto">
            Ana Sayfa
          </Btn>
          <Btn href="/iletisim" variant="light" size="lg" className="w-full max-w-xs sm:w-auto">
            İletişim
          </Btn>
        </div>
        <nav aria-label="Sık ziyaret edilen sayfalar" className="mt-10">
          <ul className="flex flex-wrap items-center justify-center gap-2">
            {QUICK.map((q) => (
              <li key={q.href}>
                <Link
                  href={q.href}
                  className="inline-flex min-h-11 items-center rounded-full bg-soft px-4 text-[14px] font-medium text-heading transition-colors hover:text-brand"
                >
                  {q.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </section>
  );
}
