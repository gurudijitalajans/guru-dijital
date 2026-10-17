"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Popover } from "radix-ui";
import { Bell, X } from "lucide-react";
import { listNotifications, markRead, removeNotifications, type Bildirim } from "./actions";
import { cn } from "@/lib/utils";

const rel = (iso: string) => {
  const m = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 1) return "şimdi";
  if (m < 60) return `${m} dk önce`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} sa önce`;
  return new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "short", timeZone: "Europe/Istanbul" }).format(new Date(iso));
};

/** Üst çubuktaki bildirim zili: okunmamış sayısı, son 30 bildirim, okundu yap, sil, okunanları temizle. Dakikada bir yenilenir. */
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
  /* Silme anında listeden düşer, sonra sunucudan tazelenir */
  const remove = (id?: number) => {
    setData((d) => {
      const gone = d.items.filter((n) => (id ? n.id === id : n.read));
      return { unread: d.unread - gone.filter((n) => !n.read).length, items: d.items.filter((n) => !gone.includes(n)) };
    });
    void removeNotifications(id).then(load);
  };
  const anyRead = data.items.some((n) => n.read);

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
            <span className="flex flex-wrap justify-end gap-x-3">
              {data.unread ? (
                <button type="button" className="text-[13px] text-accent" onClick={() => void markRead().then(load)}>
                  Tümünü okundu yap
                </button>
              ) : null}
              {anyRead ? (
                <button type="button" className="text-[13px] text-muted hover:text-ink" onClick={() => remove()}>
                  Okunanları temizle
                </button>
              ) : null}
            </span>
          </div>
          {data.items.length ? (
            <ul className="m-0 max-h-[60vh] list-none overflow-y-auto p-0 pb-1">
              {data.items.map((n) => (
                <li key={n.id} className="group relative">
                  <Link
                    href={n.href}
                    onClick={() => {
                      setOpen(false);
                      if (!n.read) void markRead(n.id).then(load);
                    }}
                    className={cn("flex gap-3 py-2.5 pr-11 pl-4 no-underline hover:bg-sunken", !n.read && "bg-accent-soft/50")}
                  >
                    <span className={cn("mt-1.5 size-2 shrink-0 rounded-full", n.read ? "bg-transparent" : "bg-accent")} aria-hidden />
                    <span className="min-w-0 flex-1">
                      <span className="block text-[14px] font-medium text-ink">
                        {n.title}
                        {n.count > 1 ? <span className="tabular ml-1.5 rounded-full bg-sunken px-1.5 text-[11px] font-normal text-muted">×{n.count}</span> : null}
                      </span>
                      {n.body ? <span className="line-clamp-2 block text-[13px] text-muted">{n.body}</span> : null}
                      <span className="block text-[12px] text-muted">{rel(n.at)}</span>
                    </span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => remove(n.id)}
                    className="absolute top-2 right-2 grid size-8 place-items-center rounded-[8px] text-muted opacity-60 group-hover:opacity-100 hover:bg-surface hover:text-ink focus-visible:opacity-100 pointer-coarse:opacity-100"
                    aria-label={`Bildirimi sil: ${n.title}`}
                  >
                    <X className="size-4" />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="m-0 px-4 pb-4 text-[14px] text-muted">Henüz bildirim yok. Yeni talep, randevu, ekibe aktarılan sohbet ve size atanan görevler burada görünür.</p>
          )}
          <Link href="/panel/bildirimler" onClick={() => setOpen(false)} className="block border-t border-line px-4 py-2.5 text-center text-[13px] font-medium text-accent no-underline hover:bg-sunken">
            Tüm bildirimler ve tercihler
          </Link>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
