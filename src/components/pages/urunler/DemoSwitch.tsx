"use client";

import { useId, useState, useSyncExternalStore, type KeyboardEvent, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Reveal } from "@/components/ui/Reveal";

/* lg breakpoint izleyici, hydration güvenli: SSR anlık görüntüsü true → sunucu
   iki sütunlu düzeni (her iki yöntem) basar; JS yoksa mobilde de ikisi alt alta
   çalışır. Hydration sonrası gerçek matchMedia değeriyle lg altında sekmeli tek
   panel render edilir. Effect içinde setState yok. */
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
  { key: "form", label: "Formu Doldurun" },
  { key: "meeting", label: "Toplantı Planlayın" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export type DemoSwitchProps = {
  /** İletişim formu (ContactForm) */
  form: ReactNode;
  /** Toplantı planlayıcı (MeetingScheduler) */
  scheduler: ReactNode;
};

function StepTitle({ n, children }: { n: number; children: ReactNode }) {
  return (
    <h3 className="mb-4 inline-flex items-center gap-3 text-[16px] font-medium tracking-[-0.01em] text-heading">
      <span className="grid size-7 shrink-0 place-items-center rounded-full bg-chip text-[13px] font-medium text-brand">
        {n}
      </span>
      {children}
    </h3>
  );
}

/**
 * DemoSwitch: demo bölümünde iki yöntemi sunar.
 *
 * - lg+: iki sütun (form ve toplantı planlayıcı yan yana).
 * - lg altı: role=tablist ile "Formu Doldurun" / "Toplantı Planlayın" seçimi;
 *   yalnız seçili panel render edilir (form id'leri çift basılmaz, sayfa
 *   uzunluğu tek panel kadar). Sekmeler en az 44px, ok tuşlarıyla gezilebilir.
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
      <div className="mt-10 grid items-start gap-8 md:mt-12 lg:grid-cols-2 lg:gap-6">
        {/* min-w-0: takvim çipleri gibi geniş içerikler grid hücresini taşırmasın */}
        <Reveal className="min-w-0">
          <StepTitle n={1}>Formu doldurun</StepTitle>
          {form}
        </Reveal>
        <Reveal delay={0.08} className="min-w-0">
          <StepTitle n={2}>Ya da toplantı planlayın</StepTitle>
          {scheduler}
        </Reveal>
      </div>
    );
  }

  return (
    <div className="mt-8 min-w-0 md:mt-10">
      <div
        role="tablist"
        aria-label="Demo yöntemi"
        className="mx-auto mb-6 grid max-w-md grid-cols-2 gap-1 rounded-full bg-white p-1 shadow-[0_0_0_1px_rgb(1_20_65/0.09)]"
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
                "min-h-11 rounded-full px-3 text-[14px] font-medium transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
                active ? "bg-navy text-white" : "text-body hover:text-heading"
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
