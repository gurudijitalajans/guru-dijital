"use client";

import { useState } from "react";

/** Yönetici panosunda: sabah özetini beklemeden şimdi gönder */
export function SummaryButton() {
  const [state, setState] = useState<"" | "busy" | string>("");
  return (
    <span className="guru-exec__send">
      <button
        type="button"
        className="guru-plan__nav"
        disabled={state === "busy"}
        onClick={async () => {
          setState("busy");
          const r = await fetch("/api/yonetici/sabah-ozeti", { method: "POST", credentials: "same-origin" }).catch(() => null);
          const j = (await r?.json().catch(() => null)) as { sent?: number; reason?: string } | null;
          setState(j?.sent ? `${j.sent} kişiye gönderildi` : (j?.reason ?? "Gönderilemedi"));
        }}
      >
        {state === "busy" ? "Gönderiliyor…" : "Sabah özetini şimdi gönder"}
      </button>
      {state && state !== "busy" ? <small role="status">{state}</small> : null}
    </span>
  );
}
