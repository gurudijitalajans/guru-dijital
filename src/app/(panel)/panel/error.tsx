"use client";

import Link from "next/link";
import { useEffect } from "react";
import { RotateCcw, TriangleAlert } from "lucide-react";
import { Button } from "@/panel/ui/button";

/** Bir sayfanın sorgusu hata verirse menü yerinde kalır; Türkçe açıklama ve yeniden deneme */
export default function PanelError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <div className="mx-auto grid max-w-md place-items-center gap-3 py-20 text-center">
      <span className="grid size-16 place-items-center rounded-full bg-bad-soft text-bad">
        <TriangleAlert className="size-7" aria-hidden />
      </span>
      <h1 className="m-0 text-[22px] font-semibold text-ink">Bu sayfa şu an açılamadı</h1>
      <p className="m-0 text-muted">Veritabanına ulaşırken bir sorun oldu. Çoğu zaman birkaç saniye sonra tekrar denemek yeterli.</p>
      <div className="mt-2 flex flex-wrap justify-center gap-2">
        <Button variant="primary" onClick={reset}>
          <RotateCcw /> Tekrar dene
        </Button>
        <Button asChild variant="secondary">
          <Link href="/panel">Ana sayfa</Link>
        </Button>
      </div>
      {error.digest ? <p className="m-0 text-[12px] text-muted">Hata kodu: {error.digest}</p> : null}
    </div>
  );
}
