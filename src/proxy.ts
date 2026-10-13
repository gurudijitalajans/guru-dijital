import { NextResponse, type NextRequest } from "next/server";

/**
 * Panel sayfasının adresini isteğe ekler: oturum yoksa giriş ekranı kişiyi
 * girişten sonra istediği sayfaya (ör. bildirimdeki bir talebe) geri götürür.
 */
export function proxy(request: NextRequest) {
  const headers = new Headers(request.headers);
  headers.set("x-panel-path", request.nextUrl.pathname + request.nextUrl.search);
  return NextResponse.next({ request: { headers } });
}

export const config = { matcher: "/panel/:path*" };
