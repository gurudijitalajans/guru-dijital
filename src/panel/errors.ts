/**
 * Sunucu işlemlerinde oturum düşerse getPanelContext giriş ekranına
 * yönlendirme fırlatır (NEXT_REDIRECT). İşlemlerin catch bloğu bunu sıradan
 * hata gibi yakalayıp ekrana "NEXT_REDIRECT" yazıyordu. Bunun yerine sayfa
 * yerinde kalır (yazılanlar kaybolmaz) ve anlaşılır bir mesaj döner.
 */
export const SESSION_LOST = "Oturumunuz sona erdi. Yeni bir sekmede tekrar giriş yapın, sonra bu sayfada yeniden kaydedin; yazdıklarınız burada duruyor.";

export function sessionLost(e: unknown): { ok: false; error: string } | null {
  const digest = (e as { digest?: unknown } | null)?.digest;
  return typeof digest === "string" && digest.startsWith("NEXT_REDIRECT") ? { ok: false, error: SESSION_LOST } : null;
}
