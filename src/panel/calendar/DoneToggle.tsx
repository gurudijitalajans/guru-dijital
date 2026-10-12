"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { completeActivity } from "./actions";

/** Takvimdeki CRM görevini işaretleme kutusu */
export function DoneToggle({ id, done, label }: { id: number; done: boolean; label: string }) {
  const router = useRouter();
  const [on, setOn] = useState(done);
  const [pending, start] = useTransition();
  return (
    <input
      type="checkbox"
      checked={on}
      disabled={pending}
      aria-label={`${label}: ${on ? "yapıldı" : "yapılmadı"}`}
      onChange={(e) => {
        const next = e.target.checked;
        setOn(next);
        start(async () => {
          const r = await completeActivity(id, next);
          if (!r.ok) {
            setOn(!next);
            return void toast.error(r.error ?? "Kaydedilemedi.");
          }
          toast.success(next ? "Yapıldı olarak işaretlendi." : "Yeniden açıldı.");
          router.refresh();
        });
      }}
      className="mt-0.5 size-4 shrink-0 accent-[var(--accent)]"
    />
  );
}
