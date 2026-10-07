/**
 * Site formlarının panele gönderimi (istemci tarafı).
 *
 * - "saved": kayıt panele düştü.
 * - "error": sunucu talebi reddetti (eksik alan, dolu saat, hız sınırı);
 *   mesaj kullanıcıya gösterilir.
 * - "fallback": panel ulaşılamadı (ağ hatası, panelin olmadığı bir ortam);
 *   form eski yönteme, e-posta uygulamasıyla göndermeye döner.
 */
export type SubmitResult =
  | { kind: "saved" }
  | { kind: "fallback" }
  | { kind: "error"; message: string; code?: string };

export async function postForm(path: string, body: Record<string, string>): Promise<SubmitResult> {
  try {
    const res = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) return { kind: "saved" };
    if (res.status === 400 || res.status === 409 || res.status === 429) {
      const json = (await res.json().catch(() => ({}))) as { error?: string; code?: string };
      return { kind: "error", message: json.error ?? "Gönderilemedi, lütfen tekrar deneyin.", code: json.code };
    }
    return { kind: "fallback" };
  } catch {
    return { kind: "fallback" };
  }
}
