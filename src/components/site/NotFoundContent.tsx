import { Btn } from "@/components/site/Btn";

/** 404 içeriği: hem site içindeki notFound() hem de eşleşmeyen adresler (global 404) kullanır. */
export function NotFoundContent() {
  return (
    <section className="flex min-h-[64svh] items-center py-20 text-center md:py-28">
      <div className="container-g">
        <p
          aria-hidden
          className="select-none text-[96px] font-light leading-none tracking-[-0.06em] text-brand sm:text-[136px] lg:text-[160px]"
        >
          404
        </p>
        <h1 className="mx-auto mt-6 max-w-3xl text-balance text-[32px] font-normal leading-[1.12] tracking-[-0.035em] text-heading sm:text-[44px]">
          Sayfa Bulunamadı
        </h1>
        <p className="mx-auto mt-4 max-w-md text-[16px] leading-relaxed text-muted">
          Aradığınız sayfa kaldırılmış ya da adresi değişmiş olabilir. Ana sayfadan devam edebilir veya
          bize yazabilirsiniz.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Btn href="/" variant="primary" size="lg" arrow>
            Ana Sayfa
          </Btn>
          <Btn href="/iletisim" variant="light" size="lg">
            İletişim
          </Btn>
        </div>
      </div>
    </section>
  );
}
