import { draftMode } from "next/headers";

/**
 * Panelin canlı önizlemesi açık mı? Açıksa (Next taslak modu, yalnız giriş
 * yapmış kullanıcı /onizleme üzerinden açabilir) sayfalar yayınlanmamış
 * taslakları da gösterir. İstek dışı çağrılarda (derleme, statik parametre)
 * draftMode hata verir: önizleme kapalı sayılır.
 */
export async function isPreview(): Promise<boolean> {
  try {
    return (await draftMode()).isEnabled;
  } catch {
    return false;
  }
}
