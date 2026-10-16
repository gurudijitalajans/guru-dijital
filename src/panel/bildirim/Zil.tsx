"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Popover } from "radix-ui";
import { Bell } from "lucide-react";
import { listNotifications, markRead, type Bildirim } from "./actions";
import { cn } from "@/lib/utils";

const rel = (iso: string) => {
  const m = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 1) return "şimdi";
  if (m < 60) return `${m} dk önce`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} sa önce`;
  return new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "short", timeZone: "Europe/Istanbul" }).format(new Date(iso));
};

/** Üst çubuktaki bildirim zili: okunmamış sayısı, son 20 bildirim, tümünü okundu yap. Dakikada bir yenilenir. */
export function Zil() {
  const [data, setData] = useState<{ unread: number; items: Bildirim[] }>({ unread: 0, items: [] });
  const [open, setOpen] = useState(false);
  const load = useCallback(() => void listNotifications().then(setData).catch(() => null), []);
  useEffect(() => {
    load();
    const t = window.setInterval(() => document.visibilityState === "visible" && load(), 60000);
    return () => window.clearInterval(t);
  }, [load]);
  useEffect(() => {
    if (open) load();
  }, [open, load]);

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button type="button" className="relative grid size-10 shrink-0 place-items-center rounded-[9px] border border-line bg-surface text-ink hover:border-accent pointer-coarse:size-11" aria-label={data.unread ? `Bildirimler, ${data.unread} okunmamış` : "Bildirimler"}>
          <Bell className="size-[18px]" aria-hidden />
          {data.unread ? <span className="tabular absolute -top-1.5 -right-1.5 grid min-w-5 place-items-center rounded-full bg-bad px-1 text-[11px] font-semibold leading-5 text-white">{data.unread > 99 ? "99+" : data.unread}</span> : null}
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content align="end" sideOffset={8} className="z-50 w-[min(380px,calc(100vw-24px))] overflow-hidden rounded-[14px] border border-line bg-surface shadow-pop">
          <div className="flex items-center justify-between gap-2 px-4 py-3">
            <span className="font-semibold text-ink">Bildirimler</span>
            {data.unread ? (
              <button type="button" className="text-[13px] text-accent" onClick={() => void markRead().then(load)}>
                Tümünü okundu yap
              </button>
            ) : null}
          </div>
          {data.items.length ? (
            <ul className="m-0 max-h-[60vh] list-none overflow-y-auto p-0 pb-1">
              {data.items.map((n) => (
                <li key={n.id}>
                  <Link
                    href={n.href}
                    onClick={() => {
                      setOpen(false);
                      if (!n.read) void markRead(n.id).then(load);
                    }}
                    className={cn("flex gap-3 px-4 py-2.5 no-underline hover:bg-sunken", !n.read && "bg-accent-soft/50")}
                  >
                    <span className={cn("mt-1.5 size-2 shrink-0 rounded-full", n.read ? "bg-transparent" : "bg-accent")} aria-hidden />
                    <span className="min-w-0 flex-1">
                      <span className="block text-[14px] font-medium text-ink">{n.title}</span>
                      {n.body ? <span className="line-clamp-2 block text-[13px] text-muted">{n.body}</span> : null}
                      <span className="block text-[12px] text-muted">{rel(n.at)}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="m-0 px-4 pb-4 text-[14px] text-muted">Henüz bildirim yok. Yeni talep, randevu, ekibe aktarılan sohbet ve size atanan görevler burada görünür.</p>
          )}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
