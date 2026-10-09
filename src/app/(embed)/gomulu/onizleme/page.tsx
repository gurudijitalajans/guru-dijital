import Script from "next/script";
import { embedContext } from "@/lib/embed";

/**
 * Panelden "Deneme sayfasında önizleyin": müşterinin sitesini taklit eden boş
 * bir sayfaya aynı kod eklenir; balon ve form burada gerçek hâliyle çalışır.
 */
export const dynamic = "force-dynamic";

export default async function EmbedPreview({ searchParams }: { searchParams: Promise<{ k?: string }> }) {
  const { k } = await searchParams;
  const ctx = await embedContext(k);
  if (!ctx || ctx === "izin-yok") return <p className="p-6">Site anahtarı bulunamadı.</p>;
  return (
    <main className="min-h-dvh bg-white px-4 py-10" style={{ background: "#fff" }}>
      <div className="mx-auto grid max-w-3xl gap-6">
        <p className="text-[13px] uppercase tracking-[0.08em] text-muted">Deneme sayfası · {ctx.tenantName}</p>
        <h1 className="text-[32px] font-medium text-heading">Sitenizde böyle görünür</h1>
        <p className="text-body">
          Sağ altta sohbet balonu{ctx.chat.enabled ? "" : " (Chatbot ayarlarında kapalı olduğu için görünmüyor)"}, aşağıda talep formu
          {ctx.form.enabled ? "" : " (kapalı)"} var. Buradan gönderilenler gerçek kayıt olarak panele düşer.
        </p>
        <div data-guru-form className="rounded-2xl border border-line p-4" />
      </div>
      <Script src="/guru-site.js" data-key={ctx.key} strategy="afterInteractive" />
    </main>
  );
}
