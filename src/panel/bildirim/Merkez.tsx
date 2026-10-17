"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Bell, CalendarCheck, CheckCheck, ClipboardCheck, FileText, MessageCircle, AtSign, ListChecks, Settings2, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { markRead, markUnreadNotification, pageNotifications, removeNotifications, type Bildirim } from "./actions";

const ICON: Record<string, React.ComponentType<{ className?: string }>> = { talep: FileText, randevu: CalendarCheck, sohbet: MessageCircle, gorev: ListChecks, kontrol: ClipboardCheck, bahsetme: AtSign };
const when = (iso: string) => new Intl.DateTimeFormat("tr-TR", { timeZone: "Europe/Istanbul", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(iso));

type Data = { items: Bildirim[]; more: boolean; unread: number; total: number };

export function Merkez({ initial }: { initial: Data }) {
  const router = useRouter();
  const [data, setData] = useState(initial);
  const [only, setOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [pending, start] = useTransition();

  /* Sayfa 1..page yeniden okunur: işlem sonrası liste ve sayılar tutarlı kalır */
  const reload = async (o = only, upTo = page) => {
    const pages = await Promise.all(Array.from({ length: upTo }, (_, i) => pageNotifications(i + 1, o)));
    const last = pages[pages.length - 1];
    setData({ items: pages.flatMap((p) => p.items), more: last.more, unread: last.unread, total: last.total });
    router.refresh();
  };
  const act = (job: () => Promise<{ ok: boolean }>, done?: string) =>
    start(async () => {
      const r = await job();
      if (!r.ok) return void toast.error("İşlem yapılamadı.");
      if (done) toast.success(done);
      await reload();
    });
  const pickFilter = (o: boolean) => {
    setOnly(o);
    setPage(1);
    start(() => reload(o, 1));
  };
  const loadMore = () => {
    const next = page + 1;
    setPage(next);
    start(async () => {
      const r = await pageNotifications(next, only);
      setData((d) => ({ ...r, items: [...d.items, ...r.items] }));
    });
  };
  const anyRead = data.items.some((n) => n.read);

  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex rounded-[10px] border border-line bg-surface p-0.5" role="tablist" aria-label="Süzgeç">
          {[
            [false, `Tümü`],
            [true, `Okunmamış${data.unread ? ` (${data.unread})` : ""}`],
          ].map(([o, l]) => (
            <button key={String(o)} type="button" role="tab" aria-selected={only === o} onClick={() => pickFilter(o as boolean)} className={cn("min-h-9 rounded-[8px] px-3 text-[14px]", only === o ? "bg-accent-soft font-medium text-accent" : "text-text hover:text-ink")}>
              {l as string}
            </button>
          ))}
        </div>
        <span className="ml-auto flex flex-wrap gap-2">
          {data.unread ? (
            <Button size="sm" disabled={pending} onClick={() => act(() => markRead(), "Hepsi okundu olarak işaretlendi.")}>
              <CheckCheck /> Tümünü okundu yap
            </Button>
          ) : null}
          {anyRead ? (
            <Button size="sm" disabled={pending} onClick={() => act(() => removeNotifications(), "Okunan bildirimler silindi.")}>
              <Trash2 /> Okunanları temizle
            </Button>
          ) : null}
          <Button size="sm" variant="ghost" asChild>
            <Link href="/panel/hesap#bildirimler">
              <Settings2 /> Tercihler
            </Link>
          </Button>
        </span>
      </div>

      <div className="overflow-hidden rounded-card border border-line bg-surface">
        {data.items.length ? (
          <ul className="m-0 list-none p-0">
            {data.items.map((n) => {
              const Icon = ICON[n.kind] ?? Bell;
              return (
                <li key={n.id} className={cn("group flex items-start gap-3 border-b border-line px-4 py-3 last:border-b-0", !n.read && "bg-accent-soft/40")}>
                  <span className={cn("mt-0.5 grid size-9 shrink-0 place-items-center rounded-[9px]", n.read ? "bg-sunken text-muted" : "bg-accent-soft text-accent")} aria-hidden>
                    <Icon className="size-4" />
                  </span>
                  <Link href={n.href} onClick={() => !n.read && void markRead(n.id)} className="min-w-0 flex-1 no-underline">
                    <span className="flex items-center gap-2">
                      <span className={cn("min-w-0 truncate text-[15px] text-ink", !n.read && "font-semibold")}>{n.title}</span>
                      {n.count > 1 ? <span className="tabular shrink-0 rounded-full bg-sunken px-1.5 text-[12px] text-muted" title={`${n.count} hareket`}>×{n.count}</span> : null}
                    </span>
                    {n.body ? <span className="line-clamp-2 block text-[14px] text-text">{n.body}</span> : null}
                    <span className="block text-[12px] text-muted">{when(n.at)}</span>
                  </Link>
                  <span className="flex shrink-0 gap-1">
                    <button type="button" disabled={pending} onClick={() => act(() => (n.read ? markUnreadNotification(n.id) : markRead(n.id)))} className="min-h-9 rounded-[8px] px-2 text-[13px] text-accent hover:bg-sunken">
                      {n.read ? "Okunmadı yap" : "Okundu"}
                    </button>
                    <button type="button" disabled={pending} onClick={() => act(() => removeNotifications(n.id))} className="grid size-9 place-items-center rounded-[8px] text-muted hover:bg-sunken hover:text-ink" aria-label={`Bildirimi sil: ${n.title}`}>
                      <X className="size-4" />
                    </button>
                  </span>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="grid place-items-center gap-2 px-6 py-14 text-center">
            <Bell className="size-6 text-muted" aria-hidden />
            <p className="m-0 font-medium text-ink">{only ? "Okunmamış bildirim yok" : "Bildirim yok"}</p>
            <p className="m-0 max-w-[46ch] text-[14px] text-muted">Yeni talep, randevu, ekibe aktarılan sohbet, size atanan görev ve notta sizden bahsedilmesi burada görünür.</p>
          </div>
        )}
        {data.more ? (
          <div className="border-t border-line p-3">
            <Button size="sm" className="w-full justify-center" disabled={pending} onClick={loadMore}>
              Daha fazla yükle
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
