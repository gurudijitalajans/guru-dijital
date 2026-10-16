import Link from "next/link";
import { Brand } from "@/panel/auth/Brand";

/** Giriş, parola sıfırlama, parola belirleme: üstte markanın ışık bandı, kart bandın alt kenarına biner */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-dvh bg-bg">
      <div className="guru-beam flex h-[260px] items-start justify-center px-4 pt-12 sm:h-[340px] sm:pt-16">
        <Brand />
      </div>
      <div className="relative -mt-[136px] px-4 pb-10 sm:-mt-[170px]">
        <div className="mx-auto w-full max-w-[400px]">
          <div className="rounded-[18px] border border-line bg-surface p-6 shadow-[0_24px_60px_-24px_rgb(1_20_65/0.45)] sm:p-7">{children}</div>
          <p className="mt-6 text-center text-[12px] text-muted">
            Guru Dijital Ajans ·{" "}
            <Link href="/" className="text-muted underline underline-offset-2">
              Siteye dön
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
