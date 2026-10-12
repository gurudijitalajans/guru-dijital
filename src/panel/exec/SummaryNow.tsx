"use client";

import { useTransition } from "react";
import { Mail } from "lucide-react";
import { toast } from "sonner";
import { Button } from "../ui/button";

/** Sabah özetini beklemeden şimdi gönderir (mevcut uç: yalnız yönetici, seçili işletme) */
export function SummaryNow() {
  const [pending, start] = useTransition();
  return (
    <Button
      size="sm"
      disabled={pending}
      onClick={() =>
        start(async () => {
          const r = await fetch("/api/yonetici/sabah-ozeti", { method: "POST", credentials: "same-origin" }).catch(() => null);
          const j = (await r?.json().catch(() => null)) as { ok?: boolean; sent?: number; reason?: string; error?: string } | null;
          if (j?.sent) toast.success(`Sabah özeti ${j.sent} kişiye gönderildi.`);
          else toast.error(j?.reason ?? j?.error ?? "Gönderilemedi.");
        })
      }
    >
      <Mail /> {pending ? "Gönderiliyor…" : "Sabah özetini şimdi gönder"}
    </Button>
  );
}
