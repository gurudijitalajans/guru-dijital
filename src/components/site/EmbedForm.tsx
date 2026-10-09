"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Müşteri sitesine gömülen talep formu (guru-site.js, data-guru-form). Talep
 * işletmenin CRM'ine kişi, fırsat ve ilk dönüş göreviyle düşer. Çerçeve
 * yüksekliğini içeriğe göre ayarlaması için sayfaya bildirir.
 */
export type EmbedFormConfig = {
  key: string;
  page: string;
  accent: string;
  title: string;
  askPhone: boolean;
  topics: string[];
  successText: string;
  consentText: string;
  privacyUrl: string;
};

const field = "w-full min-h-11 rounded-xl border border-line bg-white px-3.5 py-2.5 text-[15px] text-heading outline-none placeholder:text-muted focus:border-brand";

export function EmbedForm({ cfg }: { cfg: EmbedFormConfig }) {
  const ref = useRef<HTMLDivElement>(null);
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  /* Çerçeve yüksekliği içerikle değişir */
  useEffect(() => {
    const el = ref.current;
    if (!el || window.parent === window) return;
    const post = () => window.parent.postMessage({ guru: "form-yukseklik", h: Math.ceil(el.getBoundingClientRect().height) + 4 }, "*");
    post();
    const ro = new ResizeObserver(post);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setBusy(true);
    setError("");
    try {
      const r = await fetch("/api/leads/gonder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          k: cfg.key,
          name: fd.get("name"),
          email: fd.get("email"),
          phone: fd.get("phone") ?? "",
          service: fd.get("topic") ?? "",
          subject: fd.get("topic") ? `Site formu: ${fd.get("topic")}` : "Site formu",
          message: fd.get("message"),
          source: cfg.page,
          consent: fd.get("consent") === "on",
          website: fd.get("website") ?? "",
        }),
      });
      const j = (await r.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
      if (!r.ok || !j?.ok) throw new Error(j?.error ?? "Gönderilemedi. Lütfen tekrar deneyin.");
      setSent(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div ref={ref} className="p-1">
      {sent ? (
        <div className="rounded-2xl bg-soft p-6 text-[15.5px] text-heading" role="status">
          {cfg.successText}
        </div>
      ) : (
        <form onSubmit={submit} className="grid gap-3" noValidate={false}>
          {cfg.title ? <h2 className="text-[20px] font-medium text-heading">{cfg.title}</h2> : null}
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="grid gap-1 text-[13.5px] text-body">
              Ad Soyad
              <input name="name" required maxLength={120} autoComplete="name" className={field} />
            </label>
            <label className="grid gap-1 text-[13.5px] text-body">
              E-posta
              <input name="email" type="email" required maxLength={160} autoComplete="email" className={field} />
            </label>
            {cfg.askPhone ? (
              <label className="grid gap-1 text-[13.5px] text-body">
                Telefon
                <input name="phone" type="tel" maxLength={40} autoComplete="tel" className={field} />
              </label>
            ) : null}
            {cfg.topics.length ? (
              <label className="grid gap-1 text-[13.5px] text-body">
                Konu
                <select name="topic" className={field} defaultValue="">
                  <option value="">Seçin</option>
                  {cfg.topics.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}
          </div>
          <label className="grid gap-1 text-[13.5px] text-body">
            Mesajınız
            <textarea name="message" required rows={4} maxLength={4000} className={`${field} resize-y`} />
          </label>
          {/* Bal küpü: insanlar görmez */}
          <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
          {cfg.consentText ? (
            <label className="flex items-start gap-2.5 text-[13.5px] leading-snug text-body">
              <input name="consent" type="checkbox" required className="mt-0.5 size-5 shrink-0" />
              <span>
                {cfg.consentText}{" "}
                {cfg.privacyUrl ? (
                  <a href={cfg.privacyUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
                    Aydınlatma metni
                  </a>
                ) : null}
              </span>
            </label>
          ) : null}
          {error ? (
            <p className="text-[13.5px] text-red-700" role="alert">
              {error}
            </p>
          ) : null}
          <button type="submit" disabled={busy} style={{ backgroundColor: cfg.accent }} className="min-h-11 justify-self-start rounded-full px-6 text-[15px] font-medium text-white disabled:opacity-60">
            {busy ? "Gönderiliyor…" : "Gönder"}
          </button>
        </form>
      )}
    </div>
  );
}
