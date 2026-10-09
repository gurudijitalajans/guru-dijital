import { EmbedForm } from "@/components/site/EmbedForm";
import { embedContext } from "@/lib/embed";

/** Müşteri sitesindeki talep formunun çerçevesi (data-guru-form) */
export const dynamic = "force-dynamic";

export default async function EmbedFormPage({ searchParams }: { searchParams: Promise<{ k?: string; p?: string }> }) {
  const { k, p } = await searchParams;
  const ctx = await embedContext(k);
  if (ctx === "izin-yok") return <p className="p-4 text-[14px] text-muted">Bu form yalnız işletmenin kendi sitesinde açılır.</p>;
  if (!ctx || !ctx.form.enabled) return null;
  return <EmbedForm cfg={{ key: ctx.key, page: (p ?? "").slice(0, 200), accent: ctx.accent, ...ctx.form }} />;
}
