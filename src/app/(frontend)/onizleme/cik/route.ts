import { draftMode } from "next/headers";
import { redirect } from "next/navigation";

/** Önizleme modundan çıkar ve sayfanın yayındaki hâline döner. */
export async function GET(req: Request) {
  const raw = new URL(req.url).searchParams.get("yol") ?? "/";
  const path = raw.startsWith("/") && !raw.startsWith("//") ? raw : "/";
  (await draftMode()).disable();
  redirect(path);
}
