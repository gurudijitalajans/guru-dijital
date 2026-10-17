"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Maximize2 } from "lucide-react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Fields, Sheet, SheetSection } from "../ui/sheet";
import { contactValue } from "../ui/contact-link";
import { Akis } from "./Akis";
import { peekRecord, type Peek } from "./actions";

/** Herhangi bir sayfadan kaydı yan panelde açan bağlantı: ?panel=firsat-12 (kisi-5, firma-3) */
export const peekHref = (kind: "firsat" | "kisi" | "firma", id: number | string) => `?panel=${kind}-${id}`;

/**
 * Kayıt yan paneli (Twenty'deki gibi): adres satırında ?panel= varsa fırsat,
 * kişi ya da firma sayfadan ayrılmadan sağda açılır; bilgiler ve birleşik akış
 * (not, planla, tamamla) buradan yapılır. "Tam sayfa" asıl ekrana götürür.
 */
export function KayitPaneli() {
  const sp = useSearchParams();
  const router = useRouter();
  const path = usePathname();
  const raw = sp.get("panel") ?? "";
  const m = /^(firsat|kisi|firma)-(\d+)$/.exec(raw);
  const [data, setData] = useState<{ key: string; peek: Peek | null } | null>(null);

  const load = useCallback(async () => {
    if (!m) return;
    const peek = await peekRecord(m[1], Number(m[2]));
    setData({ key: raw, peek });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [raw]);
  useEffect(() => {
    if (!m) return;
    const t = setTimeout(() => void load(), 0);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [raw]);

  const close = () => {
    const next = new URLSearchParams(sp.toString());
    next.delete("panel");
    router.replace(`${path}${next.toString() ? `?${next}` : ""}`, { scroll: false });
  };
  const current = data && data.key === raw ? data.peek : undefined;
  const open = Boolean(m);

  return (
    <Sheet open={open} onOpenChange={(o) => !o && close()} title={current?.title ?? (current === null ? "Kayıt bulunamadı" : "Yükleniyor…")} description={current?.subtitle}>
      {current === undefined ? (
        <p className="mt-6 text-[14px] text-muted">Kayıt açılıyor…</p>
      ) : current === null ? (
        <p className="mt-6 text-[14px] text-muted">Bu kayıt silinmiş ya da bu işletmeye ait değil.</p>
      ) : (
        <>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Badge tone="info">{current.badge}</Badge>
            <span className="flex-1" />
            <Button size="sm" asChild>
              <Link href={current.href}>
                <Maximize2 /> Tam sayfa
              </Link>
            </Button>
          </div>
          <SheetSection title="Bilgiler">
            <Fields rows={current.fields.map(([k, v]) => [k, contactValue(k, v)] as [string, React.ReactNode])} />
          </SheetSection>
          <Akis
            items={current.feed}
            target={current.kind === "firsat" ? { deal: current.id } : current.kind === "kisi" ? { contact: current.id } : { company: current.id }}
            team={current.team}
            me={current.me}
            onChanged={load}
          />
        </>
      )}
    </Sheet>
  );
}
