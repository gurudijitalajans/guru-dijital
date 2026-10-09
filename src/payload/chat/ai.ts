/**
 * Claude Messages API (fetch ile; ek paket yok). Anahtar yalnız sunucu ortam
 * değişkeninde: ANTHROPIC_API_KEY. Yoksa asistan kapalı sayılır ve mesajlar
 * doğrudan ekibe düşer.
 * Yerel deneme için CHAT_FAKE=1 (yalnız geliştirmede): yapay zekâya gitmeden
 * kurallı sahte yanıt üretir; uçtan uca akış anahtarsız denenebilir.
 */

export type Block =
  | { type: "text"; text: string }
  | { type: "tool_use"; id: string; name: string; input: Record<string, unknown> }
  | { type: "tool_result"; tool_use_id: string; content: string; is_error?: boolean };
export type Msg = { role: "user" | "assistant"; content: string | Block[] };
export type Tool = { name: string; description: string; input_schema: Record<string, unknown> };
type Reply = { content: Block[]; stop_reason: string; usage?: Record<string, number> };

const fake = () => process.env.CHAT_FAKE === "1" && process.env.NODE_ENV !== "production";
export const aiConfigured = () => Boolean(process.env.ANTHROPIC_API_KEY) || fake();

export async function claude(opts: { model: string; system: string; messages: Msg[]; tools: Tool[]; maxTokens?: number }): Promise<Reply> {
  if (fake()) return fakeReply(opts.messages);
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY ?? "",
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: opts.model,
      max_tokens: opts.maxTokens ?? 700,
      /* Bilgi tabanı her mesajda aynı: önbelleğe alınır, maliyet düşer */
      system: [{ type: "text", text: opts.system, cache_control: { type: "ephemeral" } }],
      messages: opts.messages,
      tools: opts.tools,
    }),
    signal: AbortSignal.timeout(30000),
  });
  if (!res.ok) throw new Error(`Claude API ${res.status}: ${(await res.text()).slice(0, 300)}`);
  return (await res.json()) as Reply;
}

/* ---- Yerel sahte yanıt (CHAT_FAKE=1) ---- */
function lastUserText(messages: Msg[]): { text: string; toolResult: boolean } {
  const m = messages[messages.length - 1];
  if (typeof m.content === "string") return { text: m.content, toolResult: false };
  const tr = m.content.find((b) => b.type === "tool_result");
  if (tr && tr.type === "tool_result") return { text: tr.content, toolResult: true };
  const t = m.content.find((b) => b.type === "text");
  return { text: t && t.type === "text" ? t.text : "", toolResult: false };
}
function fakeReply(messages: Msg[]): Reply {
  const { text, toolResult } = lastUserText(messages);
  const say = (t: string): Reply => ({ content: [{ type: "text", text: t }], stop_reason: "end_turn" });
  const tool = (name: string, input: Record<string, unknown>): Reply => ({
    content: [{ type: "tool_use", id: `fake_${Date.now()}`, name, input }],
    stop_reason: "tool_use",
  });
  if (toolResult) return say(`(Deneme) İşlem sonucu: ${text}\n<konu>Fiyat ve teklif</konu>`);
  const t = text.toLocaleLowerCase("tr-TR");
  const email = text.match(/[^\s@]+@[^\s@]+\.[^\s@]+/)?.[0];
  if (t.includes("insan") || t.includes("temsilci")) return tool("ekibe_aktar", { neden: "musteri_istedi", ozet: "Ziyaretçi ekiple konuşmak istedi." });
  if (t.includes("bilmiyor")) return tool("ekibe_aktar", { neden: "bilgi_yok", ozet: "Bilgi tabanında yanıt yok." });
  if (t.includes("boş saat")) return tool("bos_saatler", {});
  if (email && t.includes("teklif")) return tool("talep_birak", { ad: "Sohbet Deneme", eposta: email, hizmet: "Web Tasarım", mesaj: "Sohbetten teklif isteği (deneme)" });
  return say(`(Deneme yanıtı) Sorunuzu aldım: "${text.slice(0, 80)}". Hizmetlerimiz için /hizmetler sayfasına bakabilirsiniz.\n<konu>Diğer</konu>`);
}
