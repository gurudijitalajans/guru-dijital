import { NextResponse } from "next/server";
import { cms } from "@/lib/cms";
import { isAdminUser } from "@/payload/business/roles";

/**
 * Acil durum kapısı: Guru yöneticisinin tarayıcısında bir gün boyunca
 * Payload'un içerik ekranı (/admin) yönlendirmesiz açılır. ?kapat=1 kapatır.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const { user } = await (await cms()).auth({ headers: req.headers });
  if (!user || !isAdminUser(user)) return NextResponse.redirect(new URL("/panel", url));
  const close = url.searchParams.get("kapat") === "1";
  const res = NextResponse.redirect(new URL(close ? "/panel/ayarlar" : "/admin", url));
  res.cookies.set("guru-klasik", close ? "" : "1", { path: "/", httpOnly: true, sameSite: "lax", secure: url.protocol === "https:", maxAge: close ? 0 : 86400 });
  return res;
}
