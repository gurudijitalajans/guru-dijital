import { ChatWidget } from "@/components/site/ChatWidget";
import { embedContext } from "@/lib/embed";

/** Müşteri sitesindeki sohbet balonunun çerçevesi (guru-site.js açar) */
export const dynamic = "force-dynamic";

export default async function EmbedChat({ searchParams }: { searchParams: Promise<{ k?: string; p?: string; g?: string }> }) {
  const { k, p, g } = await searchParams;
  const ctx = await embedContext(k);
  if (!ctx || ctx === "izin-yok" || !ctx.chat.enabled) return null;
  return <ChatWidget info={ctx.chat} embed={{ key: ctx.key, page: (p ?? "").slice(0, 200), accent: ctx.accent, desktop: g === "d" }} />;
}
