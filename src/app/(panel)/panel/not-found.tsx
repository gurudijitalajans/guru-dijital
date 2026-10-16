import Link from "next/link";
import { SearchX } from "lucide-react";
import { Button } from "@/panel/ui/button";

/** Panel içinde bulunamayan sayfa ya da silinmiş kayıt: menü yerinde kalır */
export default function PanelNotFound() {
  return (
    <div className="mx-auto grid max-w-md place-items-center gap-3 py-20 text-center">
      <span className="grid size-16 place-items-center rounded-full bg-accent-soft text-accent">
        <SearchX className="size-7" aria-hidden />
      </span>
      <h1 className="m-0 text-[22px] font-semibold text-ink">Bu sayfa bulunamadı</h1>
      <p className="m-0 text-muted">Adres değişmiş ya da kayıt silinmiş olabilir. Aradığınızı üstteki arama kutusuyla (⌘K) bulabilirsiniz.</p>
      <Button asChild variant="primary" className="mt-2">
        <Link href="/panel">Ana sayfaya dön</Link>
      </Button>
    </div>
  );
}
