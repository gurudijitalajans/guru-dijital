"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { consentOf } from "./CookieConsent";
import { oturum } from "@/lib/analiz/oturum";
import type { OlayDetail } from "@/lib/analytics";

/**
 * Guru'nun kendi çerezsiz sayacı. Sayfa görüntülemelerini, track() olaylarını,
 * data-olay işaretli tıklamaları ve form başlatmayı /api/o ucuna toplu gönderir.
 * Çerez ve yerel depolama kullanmaz. Ziyaretçi çerez tercihinde "Analitik"i
 * reddettiyse ya da tarayıcısında "takip etme" açıksa hiç göndermez.
 */
type E = { k: "pv" | "ev"; n?: string; p: string; t?: string; d?: Record<string, string | number>; ts: number };

let queue: E[] = [];
let sentAtif = false;
let timer: number | null = null;

function allowed() {
  const nav = navigator as Navigator & { globalPrivacyControl?: boolean };
  if (nav.doNotTrack === "1" || nav.globalPrivacyControl) return false;
  const c = consentOf();
  return !c || c.includes("analitik");
}

function flush() {
  if (timer !== null) {
    window.clearTimeout(timer);
    timer = null;
  }
  if (!queue.length) return;
  if (!allowed()) {
    queue = [];
    return;
  }
  const s = oturum();
  const body = JSON.stringify({ s: s.sid, ...(sentAtif ? {} : { a: s.atif }), e: queue.splice(0, 25) });
  sentAtif = true;
  const blob = new Blob([body], { type: "text/plain" });
  if (!navigator.sendBeacon?.("/api/o", blob)) void fetch("/api/o", { method: "POST", body, keepalive: true }).catch(() => null);
  if (queue.length) flush();
}

function push(e: Omit<E, "ts" | "p"> & { p?: string }) {
  queue.push({ ...e, p: e.p ?? window.location.pathname, ts: Date.now() });
  if (timer === null) timer = window.setTimeout(flush, 1500);
}

export function Sayac() {
  const path = usePathname();

  /* Sayfa görüntüleme: başlık güncellensin diye kısa gecikmeyle */
  useEffect(() => {
    oturum();
    const t = window.setTimeout(() => push({ k: "pv", t: document.title }), 250);
    return () => window.clearTimeout(t);
  }, [path]);

  useEffect(() => {
    const onOlay = (ev: Event) => {
      const d = (ev as CustomEvent<OlayDetail>).detail;
      if (d?.name) push({ k: "ev", n: d.name, d: d.data });
    };
    /* data-olay="ad" + data-olay-<özellik> işaretli tıklamalar; işaretsiz telefon/e-posta/WhatsApp bağlantıları da */
    const onClick = (ev: MouseEvent) => {
      const el = (ev.target as HTMLElement | null)?.closest?.("[data-olay],a[href]") as HTMLElement | null;
      if (!el) return;
      const name = el.dataset.olay;
      if (name) {
        const props: Record<string, string> = {};
        for (const [k, v] of Object.entries(el.dataset)) if (k.startsWith("olay") && k !== "olay" && v) props[k.slice(4).toLocaleLowerCase("tr-TR")] = v;
        push({ k: "ev", n: name, d: props });
        return;
      }
      const href = el.getAttribute("href") ?? "";
      if (href.startsWith("tel:")) push({ k: "ev", n: "telefon" });
      else if (href.startsWith("mailto:")) push({ k: "ev", n: "e-posta" });
      else if (/^https?:\/\/(wa\.me|api\.whatsapp\.com)\//.test(href)) push({ k: "ev", n: "whatsapp" });
    };
    /* Form başlatma: bir formun alanına ilk odaklanma (huni adımı) */
    const started = new WeakSet<HTMLFormElement>();
    const onFocus = (ev: FocusEvent) => {
      const form = (ev.target as HTMLElement | null)?.closest?.("form");
      if (!form || started.has(form)) return;
      started.add(form);
      push({ k: "ev", n: "form-basladi", d: { form: form.getAttribute("aria-label") || form.id || "form" } });
    };
    const onHide = () => {
      if (document.visibilityState === "hidden") flush();
    };
    window.addEventListener("guru-olay", onOlay);
    document.addEventListener("click", onClick, { capture: true });
    document.addEventListener("focusin", onFocus);
    document.addEventListener("visibilitychange", onHide);
    window.addEventListener("pagehide", flush);
    return () => {
      window.removeEventListener("guru-olay", onOlay);
      document.removeEventListener("click", onClick, { capture: true });
      document.removeEventListener("focusin", onFocus);
      document.removeEventListener("visibilitychange", onHide);
      window.removeEventListener("pagehide", flush);
    };
  }, []);

  return null;
}
