"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { selectTenant } from "../actions";

/**
 * Satış sunumu için demo işletmesi (yalnız Guru yöneticisi): kur, aç,
 * sıfırla. Sıfırlama iki adımlı onayla (tarayıcı onay penceresi kullanılmaz).
 */
export function DemoBox({ demoId }: { demoId: number | null }) {
  const router = useRouter();
  const [confirm, setConfirm] = useState(false);
  const [pending, start] = useTransition();
  const open = (id: number) =>
    start(async () => {
      const r = await selectTenant(id);
      if (!r.ok) return void toast.error("Demo işletmesi açılamadı.");
      router.push("/panel");
      router.refresh();
    });
  const build = (reset: boolean) =>
    start(async () => {
      const res = await fetch("/api/tenants/demo", { method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ reset }) }).catch(() => null);
      const j = (await res?.json().catch(() => null)) as { ok?: boolean; id?: number; error?: string } | null;
      setConfirm(false);
      if (!j?.ok || !j.id) return void toast.error(j?.error ?? "Demo işletmesi kurulamadı.");
      toast.success(reset ? "Demo işletmesi sıfırlandı." : "Demo işletmesi kuruldu.");
      const sel = await selectTenant(j.id);
      if (sel.ok) {
        router.push("/panel");
        router.refresh();
      }
    });
  return (
    <div className="flex flex-wrap items-center gap-2">
      {demoId ? (
        <>
          <Button variant="primary" disabled={pending} onClick={() => open(demoId)}>
            Demo işletmesini aç
          </Button>
          {confirm ? (
            <>
              <span className="text-[13px] text-warn">Tüm demo kayıtları silinip baştan kurulur.</span>
              <Button variant="danger" disabled={pending} onClick={() => build(true)}>
                {pending ? "Sıfırlanıyor…" : "Evet, sıfırla"}
              </Button>
              <Button variant="ghost" disabled={pending} onClick={() => setConfirm(false)}>
                Vazgeç
              </Button>
            </>
          ) : (
            <Button disabled={pending} onClick={() => setConfirm(true)}>
              Sıfırla
            </Button>
          )}
        </>
      ) : (
        <Button variant="primary" disabled={pending} onClick={() => build(false)}>
          {pending ? "Kuruluyor…" : "Demo işletmesini kur"}
        </Button>
      )}
    </div>
  );
}
