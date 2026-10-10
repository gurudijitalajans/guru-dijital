"use client";

import { useState } from "react";

/* İşletme seçicisinin çerezi: demo işletmesine geçip panoyu (bu sayfa) baştan yükler */
const open = (id: number | string) => {
  document.cookie = `payload-tenant=${id}; path=/; samesite=lax`;
  window.location.reload();
};

export function DemoButton({ id }: { id: number | string | null }) {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const run = async (reset: boolean) => {
    if (reset && !window.confirm("Demo işletmesindeki tüm kayıtlar silinip örnek veriyle yeniden kurulacak. Devam edilsin mi?")) return;
    setBusy(true);
    setMsg(reset ? "Sıfırlanıyor…" : "Kuruluyor…");
    const r = await fetch("/api/tenants/demo", { method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ reset }) }).catch(() => null);
    const j = (await r?.json().catch(() => null)) as { ok?: boolean; id?: number; error?: string } | null;
    if (j?.ok && j.id) return open(j.id);
    setMsg(j?.error ?? "İşlem yapılamadı.");
    setBusy(false);
  };
  return (
    <div className="guru-crm__row">
      {id ? (
        <>
          <button type="button" className="guru-crm__save" disabled={busy} onClick={() => open(id)}>
            Demo işletmesini aç
          </button>
          <button type="button" className="guru-plan__nav" disabled={busy} onClick={() => run(true)}>
            Sıfırla
          </button>
        </>
      ) : (
        <button type="button" className="guru-crm__save" disabled={busy} onClick={() => run(false)}>
          Demo işletmesini kur
        </button>
      )}
      {msg ? (
        <span className="guru-home__meta" role="status">
          {msg}
        </span>
      ) : null}
    </div>
  );
}
