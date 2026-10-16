"use client";

import { Dialog } from "radix-ui";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Sağdan açılan kayıt paneli: liste kaybolmadan kaydın ayrıntısı. Esc ve
 * dışarı tıklama kapatır; odak panelin içinde kalır (Radix Dialog).
 */
export function Sheet({ open, onOpenChange, title, description, children, className }: { open: boolean; onOpenChange: (o: boolean) => void; title: string; description?: string; children: React.ReactNode; className?: string }) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-overlay" />
        <Dialog.Content
          className={cn("fixed inset-y-0 right-0 z-50 flex w-full max-w-[560px] flex-col bg-surface shadow-pop pt-[env(safe-area-inset-top,0px)] focus:outline-none", className)}
          aria-describedby={description ? undefined : undefined}
        >
          <div className="flex items-start justify-between gap-3 border-b border-line px-5 py-4">
            <div className="min-w-0">
              <Dialog.Title className="m-0 text-[20px] font-semibold text-ink">{title}</Dialog.Title>
              {description ? <Dialog.Description className="mt-0.5 mb-0 text-muted">{description}</Dialog.Description> : <Dialog.Description className="sr-only">{title} ayrıntısı</Dialog.Description>}
            </div>
            <Dialog.Close className="grid size-10 shrink-0 place-items-center rounded-[9px] text-muted hover:bg-sunken hover:text-ink" aria-label="Kapat">
              <X className="size-5" />
            </Dialog.Close>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-6">{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export function SheetSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="mt-5 mb-2 text-[12px] font-semibold text-muted">{title}</h3>
      {children}
    </section>
  );
}

export function Fields({ rows }: { rows: [string, React.ReactNode][] }) {
  return (
    <dl className="m-0 grid grid-cols-[110px_minmax(0,1fr)] gap-x-3 gap-y-1.5 text-[14px]">
      {rows.map(([k, v]) => (
        <div key={k} className="contents">
          <dt className="text-muted">{k}</dt>
          <dd className="m-0 break-words text-ink">{v || <span className="text-muted">Yok</span>}</dd>
        </div>
      ))}
    </dl>
  );
}
