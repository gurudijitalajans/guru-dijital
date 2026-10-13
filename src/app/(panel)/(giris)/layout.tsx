import Link from "next/link";
import { Brand } from "@/panel/auth/Brand";

/** Giriş, parola sıfırlama, parola belirleme: menüsüz, ortalanmış tek kart */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="grid min-h-dvh place-items-center bg-bg px-4 py-10">
      <div className="w-full max-w-[400px]">
        <Brand />
        <div className="mt-6 rounded-[16px] border border-line bg-surface p-6 shadow-pop sm:p-7">{children}</div>
        <p className="mt-6 text-center text-[12px] text-muted">
          Guru Dijital Ajans ·{" "}
          <Link href="/" className="text-muted underline underline-offset-2">
            Siteye dön
          </Link>
        </p>
      </div>
    </main>
  );
}
