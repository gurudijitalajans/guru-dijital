import { draftMode } from "next/headers";
import { redirect } from "next/navigation";
import { sitePath } from "@/lib/safe-path";
import { cms } from "@/lib/cms";

/**
 * Panelin canlı önizlemesi buradan açılır: /onizleme?yol=/hizmetler/web-tasarim
 * Yalnız panele giriş yapmış kullanıcı için taslak modu açılır, sonra sayfaya
 * yönlendirilir. Giriş yoksa sayfanın yayındaki hâli açılır.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const raw = url.searchParams.get("yol") ?? "/";
  /* Yalnız site içi yol (açık yönlendirmeye karşı) */
  const path = sitePath(raw);
  const payload = await cms();
  const { user } = await payload.auth({ headers: req.headers });
  if (user) (await draftMode()).enable();
  redirect(path);
}
