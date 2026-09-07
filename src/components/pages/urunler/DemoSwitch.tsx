"use client";

import { useId, useState, useSyncExternalStore, type KeyboardEvent, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Reveal } from "@/components/ui/Reveal";

/* lg breakpoint izleyici, hydration güvenli (ProcessRail deseni): SSR anlık
   görüntüsü true → sunucu iki sütunlu grid'i (her iki form) basar; JS yoksa
   mobilde de iki form alt alta çalışır. Hydration sonrası gerçek matchMedia
   değeriyle lg altında sekmeli tek form render edilir. Effect'te setState yok. */
const LG_QUERY = "(min-width: 1024px)";

function subscribeLg(onChange: () => void) {
  const mq = window.matchMedia(LG_QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

function useIsLg(): boolean {
  return useSyncExternalStore(
    subscribeLg,
    () => window.matchMedia(LG_QUERY).matches,
    () => true
  );
}

const TABS = [
  { key: "form", label: "Formu doldurun" },
  { key: "meeting", label: "Toplantı planlayın" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export type DemoSwitchProps = {
  /** İletişim formu (ContactForm) */
  form: ReactNode;
  /** Toplantı planlayıcı (MeetingScheduler) */
  scheduler: ReactNode;
};

/**
 * DemoSwitch: demo bölümünde iki yöntemi sunar.
 *
 * - lg+: mevcut iki sütun (form + toplantı planlayıcı yan yana).
 * - lg altı: role=tablist ile "Formu doldurun" / "Toplantı planlayın" seçimi;
 *   yalnız seçili panel render edilir (form id'leri çift basılmaz, sayfa
 *   uzunluğu tek form kadar). Sekmeler min 44px dokunma hedefi, ok tuşlarıyla
 *   gezilebilir.
 */
export function DemoSwitch({ form, scheduler }: DemoSwitchProps) {
  const isLg = useIsLg();
  const [tab, setTab] = useState<TabKey>("form");
  const id = useId();

  function onKeyDown(e: KeyboardEvent<HTMLButtonElement>) {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    const next: TabKey = tab === "form" ? "meeting" : "form";
    setTab(next);
    document.getElementById(`${id}-tab-${next}`)?.focus();
  }

  if (isLg) {
    return (
      <div className="mt-12 grid items-start gap-8 md:mt-16 lg:grid-cols-2 lg:gap-10">
        {/* min-w-0: takvim çipleri gibi geniş içerikler grid hücresini viewport dışına taşırmasın */}
        <Reveal className="min-w-0">
          <h3 className="mb-4 inline-flex items-center gap-3 text-base font-semibold tracking-tight text-fg">
            <span className="grid size-7 shrink-0 place-items-center rounded-full bg-guru/12 text-xs font-bold text-guru-text">
              1
            </span>
            Formu doldurun
          </h3>
          {form}
        </Reveal>
        <Reveal delay={0.1} className="min-w-0">
          <h3 className="mb-4 inline-flex items-center gap-3 text-base font-semibold tracking-tight text-fg">
            <span className="grid size-7 shrink-0 place-items-center rounded-full bg-guru/12 text-xs font-bold text-guru-text">
              2
            </span>
            Ya da toplantı planlayın
          </h3>
          {scheduler}
        </Reveal>
      </div>
    );
  }

  return (
    <div className="mt-10 min-w-0 md:mt-14">
      <div
        role="tablist"
        aria-label="Demo yöntemi"
        className="mb-6 grid grid-cols-2 gap-1 rounded-full border border-fg/15 bg-card p-1"
      >
        {TABS.map((t) => {
          const active = t.key === tab;
          return (
            <button
              key={t.key}
              type="button"
              role="tab"
              id={`${id}-tab-${t.key}`}
              aria-selected={active}
              aria-controls={`${id}-panel-${t.key}`}
              tabIndex={active ? 0 : -1}
              onClick={() => setTab(t.key)}
              onKeyDown={onKeyDown}
              className={cn(
                "min-h-11 rounded-full px-3 text-sm font-semibold transition-colors duration-300",
                active ? "bg-guru text-ink" : "text-fg/70 hover:text-fg"
              )}
            >
              {t.label}
            </button>
          );
        })}
      </div>
      <div
        role="tabpanel"
        id={`${id}-panel-${tab}`}
        aria-labelledby={`${id}-tab-${tab}`}
        className="min-w-0"
      >
        {tab === "form" ? form : scheduler}
      </div>
    </div>
  );
}
