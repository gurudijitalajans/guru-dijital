"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import legal from "@/content/legal.json";
import { cn } from "@/lib/utils";
import { Glyph } from "./Glyph";

/**
 * Çerez onayı (kendi bileşenimiz). KVKK Çerez Rehberi'ne uygun: önceden işaretli kutu yok,
 * "Tümünü kabul et" ile "Yalnız zorunlu" aynı ağırlıkta, tercih her zaman alt bilgideki
 * "Çerez tercihleri" bağlantısından değiştirilebilir. Seçim "guru-cerez-tercihi" çerezinde
 * 180 gün saklanır (eski vanilla-cookieconsent kaydı da okunur: categories + revision).
 * Guru'nun çerezsiz sayacı (Sayac.tsx) "analitik" reddedilmedikçe sayar; reklam ve
 * ölçüm etiketleri (Etiketler.tsx) yalnız ilgili onayla yüklenir.
 */
type Banner = { title: string; text: string; acceptAll: string; rejectAll: string; prefs: string; save: string; categories: Record<string, { title: string; desc: string }> };
const B = (legal as unknown as { _banner: Banner })._banner;

const COOKIE = "guru-cerez-tercihi";
const REVISION = 1;
const DAYS = 180;
const OPEN_EVENT = "guru:cerez-tercihleri";
type Cat = "zorunlu" | "analitik" | "pazarlama";
const OPTIONAL: Cat[] = ["analitik", "pazarlama"];

/** Kayıtlı onay (geçerli sürümdeyse kategoriler), yoksa null */
export function consentOf(): Cat[] | null {
  if (typeof document === "undefined") return null;
  const raw = document.cookie.split("; ").find((c) => c.startsWith(`${COOKIE}=`));
  if (!raw) return null;
  try {
    const v = JSON.parse(decodeURIComponent(raw.slice(COOKIE.length + 1))) as { categories?: string[]; revision?: number };
    if (v.revision !== REVISION || !Array.isArray(v.categories)) return null;
    return v.categories.filter((c): c is Cat => c === "zorunlu" || c === "analitik" || c === "pazarlama");
  } catch {
    return null;
  }
}

function save(cats: Cat[]) {
  const value = encodeURIComponent(JSON.stringify({ categories: cats, revision: REVISION, consentTimestamp: new Date().toISOString() }));
  document.cookie = `${COOKIE}=${value}; Max-Age=${DAYS * 86400}; Path=/; SameSite=Lax${location.protocol === "https:" ? "; Secure" : ""}`;
  /* Ölçüm ve reklam etiketleri tercihi bu olaydan öğrenir (sayfa yenilenmeden) */
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: cats }));
}

/** Tercih kaydedilince yayınlanan olay */
export const CONSENT_EVENT = "guru:onay";

const btn = "inline-flex min-h-11 items-center justify-center rounded-full px-5 text-[14.5px] font-medium transition-colors";
const solid = cn(btn, "bg-navy text-white hover:bg-brand");
const light = cn(btn, "bg-white text-heading shadow-[0_0_0_1px_rgb(1_20_65/0.12)] hover:text-brand hover:shadow-[0_0_0_1px_rgb(42_106_202/0.45)]");

function Switch({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={() => onChange(!on)}
      className={cn("relative h-7 w-12 shrink-0 rounded-full transition-colors", on ? "bg-brand" : "bg-[#cfd8e6]")}
    >
      <span className={cn("absolute top-1 size-5 rounded-full bg-white shadow-[0_1px_3px_rgb(1_20_65/0.3)] transition-[left]", on ? "left-6" : "left-1")} />
    </button>
  );
}

export function CookieConsentBanner() {
  const [banner, setBanner] = useState(false);
  const [prefs, setPrefs] = useState(false);
  const [choice, setChoice] = useState<Record<Cat, boolean>>({ zorunlu: true, analitik: false, pazarlama: false });
  const dialogRef = useRef<HTMLDivElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);

  /* İlk açılışta kayıt yoksa bant; kayıt varsa analitik bayrağı eşitlenir */
  useEffect(() => {
    const c = consentOf();
    if (c) save(c);
    const t = window.setTimeout(() => setBanner(!c), 0);
    const open = () => {
      const now = consentOf() ?? ["zorunlu"];
      setChoice({ zorunlu: true, analitik: now.includes("analitik"), pazarlama: now.includes("pazarlama") });
      returnFocus.current = document.activeElement as HTMLElement | null;
      setPrefs(true);
    };
    window.addEventListener(OPEN_EVENT, open);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener(OPEN_EVENT, open);
    };
  }, []);

  const decide = useCallback((cats: Cat[]) => {
    save(cats);
    setBanner(false);
    setPrefs(false);
    returnFocus.current?.focus?.();
  }, []);
  const closePrefs = useCallback(() => {
    setPrefs(false);
    returnFocus.current?.focus?.();
  }, []);

  /* Tercih penceresi: Escape kapatır, Tab pencerede döner, sayfa kaymaz */
  useEffect(() => {
    if (!prefs) return;
    const root = document.documentElement;
    const prev = root.style.overflow;
    root.style.overflow = "hidden";
    /* Odak pencerenin kendisinde (kapat düğmesinde halka belirmesin); Tab ilk öğeye geçer */
    dialogRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closePrefs();
      if (e.key === "Tab" && dialogRef.current) {
        const f = dialogRef.current.querySelectorAll<HTMLElement>("a, button");
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      root.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [prefs, closePrefs]);

  const all: Cat[] = ["zorunlu", ...OPTIONAL];
  const selected = (): Cat[] => all.filter((c) => choice[c]);

  return (
    <>
      {banner && !prefs && (
        <section
          aria-label={B.title}
          data-float=""
          className="fixed inset-x-3 bottom-3 z-[70] max-h-[calc(100dvh-1.5rem)] overflow-y-auto overscroll-contain rounded-[22px] bg-white p-5 sm:max-h-[calc(100dvh-3rem)] shadow-[0_0_0_1px_rgb(1_20_65/0.07),0_30px_70px_-24px_rgb(1_20_65/0.5)] sm:inset-x-auto sm:bottom-6 sm:left-6 sm:w-[420px] sm:p-6 [@media(max-height:480px)]:p-4 [@media(max-height:480px)]:sm:w-[560px]"
        >
          <div className="flex items-center gap-3">
            <span aria-hidden className="grid size-10 shrink-0 place-items-center rounded-xl bg-[linear-gradient(160deg,#f3f8ff,#e3efff)] text-[#0a2463] [@media(max-height:480px)]:hidden">
              <Glyph name="shield" className="size-[22px]" strokeWidth={1.7} />
            </span>
            <h2 className="text-[17px] font-medium tracking-[-0.01em] text-heading">{B.title}</h2>
          </div>
          <p className="mt-3 text-[14px] leading-relaxed text-muted [@media(max-height:480px)]:mt-2 [@media(max-height:480px)]:text-[13px]">
            {B.text}{" "}
            <Link href="/yasal/cerez-politikasi" className="font-medium text-brand underline-offset-2 hover:underline">
              Çerez Politikası
            </Link>
          </p>
          {/* Kabul ve ret aynı ağırlıkta (KVKK Çerez Rehberi) */}
          <div className="mt-5 grid grid-cols-1 gap-2 min-[340px]:grid-cols-2">
            <button type="button" className={cn(solid, "max-[374px]:px-3")} onClick={() => decide(all)}>
              {B.acceptAll}
            </button>
            <button type="button" className={cn(solid, "max-[374px]:px-3")} onClick={() => decide(["zorunlu"])}>
              {B.rejectAll}
            </button>
          </div>
          <button
            type="button"
            onClick={() => window.dispatchEvent(new Event(OPEN_EVENT))}
            className="mx-auto mt-2 flex min-h-10 items-center text-[14px] font-medium text-heading underline-offset-4 hover:text-brand hover:underline"
          >
            {B.prefs}
          </button>
        </section>
      )}

      {prefs && (
        <div className="fixed inset-0 z-[140] grid place-items-end bg-[rgb(1_20_65/0.45)] p-3 backdrop-blur-[2px] sm:place-items-center sm:p-6" onMouseDown={(e) => e.target === e.currentTarget && closePrefs()}>
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="cerez-baslik"
            tabIndex={-1}
            className="flex max-h-[min(720px,calc(100dvh-24px))] w-full max-w-[560px] flex-col overflow-hidden rounded-[24px] bg-white shadow-[0_40px_90px_-30px_rgb(1_20_65/0.6)] outline-none"
          >
            <div className="flex items-center justify-between gap-4 px-6 pb-3 pt-6">
              <h2 id="cerez-baslik" className="text-[20px] font-medium tracking-[-0.015em] text-heading">
                Çerez tercihleri
              </h2>
              <button type="button" aria-label="Kapat" onClick={closePrefs} className="-mr-2 grid size-11 place-items-center rounded-full text-heading transition-colors hover:bg-soft">
                <X className="size-5" strokeWidth={1.8} />
              </button>
            </div>
            <div className="overflow-y-auto px-6 pb-2">
              <p className="text-[14.5px] leading-relaxed text-muted">
                Hangi depolama araçlarına izin verdiğinizi seçin. Ayrıntılar{" "}
                <Link href="/yasal/cerez-politikasi" className="font-medium text-brand underline-offset-2 hover:underline">Çerez Politikası</Link> ve{" "}
                <Link href="/yasal/kvkk-aydinlatma-metni" className="font-medium text-brand underline-offset-2 hover:underline">KVKK Aydınlatma Metni</Link>&apos;nde.
              </p>
              <ul className="mt-5 grid gap-2.5">
                {all.map((c) => (
                  <li key={c} className={cn("flex items-start gap-4 rounded-2xl bg-soft p-4", c === "zorunlu" && "max-[399px]:flex-col max-[399px]:gap-2")}>
                    <div className="min-w-0 flex-1">
                      <p className="text-[15.5px] font-medium text-heading">{B.categories[c].title}</p>
                      <p className="mt-1 text-[13.5px] leading-relaxed text-muted">{B.categories[c].desc}</p>
                    </div>
                    {c === "zorunlu" ? (
                      <span className="mt-0.5 shrink-0 rounded-full bg-white px-3 py-1 max-[399px]:mt-0 text-[12.5px] font-medium text-heading shadow-[0_0_0_1px_rgb(1_20_65/0.08)]">Her zaman açık</span>
                    ) : (
                      <Switch on={choice[c]} onChange={(v) => setChoice((s) => ({ ...s, [c]: v }))} label={B.categories[c].title} />
                    )}
                  </li>
                ))}
              </ul>
            </div>
            <div className="grid gap-2 px-6 pb-6 pt-5 sm:grid-cols-3">
              <button type="button" className={solid} onClick={() => decide(all)}>
                {B.acceptAll}
              </button>
              <button type="button" className={solid} onClick={() => decide(["zorunlu"])}>
                {B.rejectAll}
              </button>
              <button type="button" className={light} onClick={() => decide(selected())}>
                {B.save}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/** Alt bilgideki "Çerez tercihleri" bağlantısı */
export function CookiePrefsButton({ className }: { className?: string }) {
  return (
    <button type="button" className={className} onClick={() => window.dispatchEvent(new Event(OPEN_EVENT))}>
      Çerez tercihleri
    </button>
  );
}
