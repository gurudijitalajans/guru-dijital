import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { LoginForm } from "@/panel/auth/forms";
import { safeNext } from "@/panel/auth/safe";
import { cms } from "@/lib/cms";

export const metadata: Metadata = { title: "Giriş" };
export const dynamic = "force-dynamic";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ sonra?: string; cikis?: string; durum?: string }> }) {
  const sp = await searchParams;
  /* İşletmesi olmayan (ya da işletmesi askıya alınmış) hesap panele giremez: oturum kapatılıp açıklama gösterilir */
  const noTenant = sp.durum === "isletme-yok";
  const loggedOut = sp.cikis === "1" || noTenant;
  /* Zaten girişliyse doğrudan panele */
  if (!loggedOut) {
    const { user } = await (await cms()).auth({ headers: await headers() });
    if (user) redirect(safeNext(sp.sonra));
  }
  return <LoginForm next={sp.sonra ?? null} loggedOut={loggedOut && !noTenant} noTenant={noTenant} />;
}
