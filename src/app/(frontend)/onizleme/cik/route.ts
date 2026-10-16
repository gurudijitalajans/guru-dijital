import { draftMode } from "next/headers";
import { redirect } from "next/navigation";
import { sitePath } from "@/lib/safe-path";

/** Önizleme modundan çıkar ve sayfanın yayındaki hâline döner. */
export async function GET(req: Request) {
  const raw = new URL(req.url).searchParams.get("yol") ?? "/";
  /* Yalnız site içi yol (açık yönlendirmeye karşı) */
  const path = sitePath(raw);
  (await draftMode()).disable();
  redirect(path);
}
