"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Dialog, DropdownMenu } from "radix-ui";
import { ArrowLeft, Ban, Bot, CalendarCheck, CalendarClock, Clock, FileText, Info, Mail, MailOpen, MessageCircle, RotateCcw, Search, Send, StickyNote, Trash2, UserPlus, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Fields } from "../ui/sheet";
import { contactValue } from "../ui/contact-link";
import {
  addInternalNote,
  assignConversation,
  bookingSlots,
  bulkInbox,
  deleteInboxItem,
  getThread,
  linkToContact,
  listInbox,
  markUnread,
  replyByEmail,
  replyChat,
  rescheduleBooking,
  retryDelivery,
  setConversation,
  setSpam,
  setStatus,
  snoozeItems,
  type InboxFilter,
  type InboxKind,
  type InboxPage,
  type Thread,
} from "./actions";

/* Sunucudaki sayfa boyuyla aynı (actions.ts) */
const INBOX_PAGE = 40;
const TZ = "Europe/Istanbul";
const stamp = (iso: string) => {
  const d = new Date(iso);
  const sameDay = new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(d) === new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(new Date());
  return new Intl.DateTimeFormat("tr-TR", sameDay ? { timeZone: TZ, hour: "2-digit", minute: "2-digit" } : { timeZone: TZ, day: "numeric", month: "short" }).format(d);
};
const money = new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 });
const KIND_ICON: Record<InboxKind, React.ComponentType<{ className?: string }>> = { sohbet: MessageCircle, talep: FileText, randevu: CalendarCheck };
const KIND_LABEL: Record<InboxKind, string> = { sohbet: "Sohbet", talep: "Site formu", randevu: "Randevu" };

export type FilterDef = { key: InboxFilter; label: string };

/** Erteleme kısayolları (tarayıcı saatiyle): 1 saat, yarın 09:00, gelecek pazartesi 09:00 */
function snoozePresets(): [string, string][] {
  const now = new Date();
  const at9 = (d: Date) => {
    d.setHours(9, 0, 0, 0);
    return d;
  };
  const tomorrow = at9(new Date(now.getTime() + 86400000));
  const monday = at9(new Date(now.getTime() + (((8 - now.getDay()) % 7 || 7) * 86400000)));
  return [
    ["1 saat sonra", new Date(now.getTime() + 3600000).toISOString()],
    ["Yarın 09:00", tomorrow.toISOString()],
    ["Gelecek hafta (Pzt 09:00)", monday.toISOString()],
  ];
}

const menuItem = "flex min-h-9 cursor-pointer items-center gap-2 rounded-[7px] px-2.5 text-[14px] text-ink outline-none data-[highlighted]:bg-sunken";
const menuBox = "z-50 min-w-[200px] rounded-[10px] border border-line bg-surface p-1.5 shadow-pop";

function SnoozeMenu({ disabled, snoozed, onPick }: { disabled?: boolean; snoozed?: string | null; onPick: (iso: string | null) => void }) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <Button size="sm" disabled={disabled}>
          <Clock /> Ertele
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content align="end" sideOffset={6} className={menuBox}>
          {snoozePresets().map(([l, iso]) => (
            <DropdownMenu.Item key={l} className={menuItem} onSelect={() => onPick(iso)}>
              {l}
            </DropdownMenu.Item>
          ))}
          {snoozed ? (
            <DropdownMenu.Item className={menuItem} onSelect={() => onPick(null)}>
              Ertelemeyi kaldır
            </DropdownMenu.Item>
          ) : null}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

/** Adres satırı: seçili kayıt ve süzgeç paylaşılabilir, sayfa sunucuya yeniden gitmeden güncellenir */
const writeUrl = (filter: InboxFilter, key: string) => {
  const p = new URLSearchParams();
  if (filter !== "bekleyen") p.set("f", filter);
  if (key) p.set("s", key);
  window.history.replaceState(null, "", `/panel/gelen${p.toString() ? `?${p}` : ""}`);
};

export function Inbox({ filters, initialFilter, initialPage, initialThread, me, canDelete = false }: { filters: FilterDef[]; initialFilter: InboxFilter; initialPage: InboxPage; initialThread: Thread | null; me: number; canDelete?: boolean }) {
  const [filter, setFilter] = useState<InboxFilter>(initialFilter);
  const [items, setItems] = useState(initialPage.items);
  const [more, setMore] = useState(initialPage.more);
  const [q, setQ] = useState("");
  const [limit, setLimit] = useState(INBOX_PAGE);
  const [info, setInfo] = useState(false);
  const [thread, setThread] = useState<Thread | null>(initialThread);
  const [key, setKey] = useState(initialThread?.key ?? "");
  const [reply, setReply] = useState("");
  const [pending, start] = useTransition();
  const [confirm, setConfirm] = useState(false);
  /* Toplu seçim */
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkConfirm, setBulkConfirm] = useState(false);
  const router = useRouter();
  const endRef = useRef<HTMLDivElement>(null);

  /* Liste her zaman güncel süzgeç, arama ve sayfa boyuyla okunur (yoklama da) */
  const params = useRef({ q: "", limit: INBOX_PAGE });
  const reloadList = useCallback(async (f: InboxFilter) => {
    const r = await listInbox(f, params.current);
    setItems(r.items);
    setMore(r.more);
  }, []);
  const reloadThread = useCallback(async (k: string) => {
    if (!k) return setThread(null);
    const t = await getThread(k);
    setThread((old) => (old && t && old.key === t.key && old.messages.length === t.messages.length && old.status === t.status && old.label === t.label ? old : t));
  }, []);

  /* Yeni mesajlar için yoklama: liste 6, açık sohbet 4 saniyede bir (sekme görünürken) */
  useEffect(() => {
    const t = setInterval(() => document.visibilityState === "visible" && void reloadList(filter), 6000);
    return () => clearInterval(t);
  }, [filter, reloadList]);
  useEffect(() => {
    if (!key || thread?.kind !== "sohbet") return;
    const t = setInterval(() => document.visibilityState === "visible" && void reloadThread(key), 4000);
    return () => clearInterval(t);
  }, [key, thread?.kind, reloadThread]);
  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [thread?.key, thread?.messages.length]);

  const toggleSel = (k: string) =>
    setSelected((cur) => {
      const next = new Set(cur);
      if (next.has(k)) next.delete(k);
      else next.add(k);
      return next;
    });
  const pickFilter = (f: InboxFilter) => {
    setFilter(f);
    setSelected(new Set());
    setLimit(INBOX_PAGE);
    params.current = { q, limit: INBOX_PAGE };
    writeUrl(f, key);
    start(() => reloadList(f));
  };
  /* Arama: yazmayı bırakınca (300 ms) ilk sayfa yeniden okunur */
  const firstSearch = useRef(true);
  useEffect(() => {
    if (firstSearch.current) {
      firstSearch.current = false;
      return;
    }
    const t = setTimeout(() => {
      setLimit(INBOX_PAGE);
      params.current = { q, limit: INBOX_PAGE };
      start(() => reloadList(filter));
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);
  const loadMore = () => {
    const next = limit + INBOX_PAGE;
    setLimit(next);
    params.current = { q, limit: next };
    start(() => reloadList(filter));
  };
  const open = useCallback(
    (k: string) => {
      setKey(k);
      setReply("");
      setConfirm(false);
      setInfo(false);
      writeUrl(filter, k);
      start(() => reloadThread(k));
    },
    [filter, reloadThread],
  );
  /* Bildirim ya da arama paletinden gelen ?s= değişikliği (sayfa açıkken) kaydı açar */
  const sp = useSearchParams();
  const urlKey = sp.get("s") ?? "";
  useEffect(() => {
    if (!urlKey || urlKey === key) return;
    const t = setTimeout(() => open(urlKey), 0);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlKey]);
  const back = () => {
    setKey("");
    setThread(null);
    writeUrl(filter, "");
  };
  /* Her işlemden sonra kayıt, liste ve menüdeki bekleyen sayısı tazelenir */
  const run = (job: () => Promise<{ ok: boolean; error?: string }>, done: string) =>
    start(async () => {
      const r = await job();
      if (!r.ok) return void toast.error(r.error ?? "İşlem yapılamadı.");
      toast.success(done);
      await Promise.all([reloadThread(key), reloadList(filter)]);
      router.refresh();
    });
  const bulk = (job: (keys: string[]) => Promise<{ ok: boolean; error?: string }>, done: string) => {
    const keys = [...selected];
    run(async () => {
      const r = await job(keys);
      if (r.ok) {
        setSelected(new Set());
        setBulkConfirm(false);
        if (keys.includes(key)) back();
      }
      return r;
    }, done);
  };
  const selKinds = new Set(items.filter((it) => selected.has(it.key)).map((it) => it.kind));
  const remove = () =>
    thread &&
    start(async () => {
      const r = await deleteInboxItem(thread.kind, thread.id);
      setConfirm(false);
      if (!r.ok) return void toast.error(r.error ?? "Silinemedi.");
      toast.success(`${KIND_LABEL[thread.kind]} silindi.`);
      back();
      await reloadList(filter);
    });
  const assign = (v: string) => thread && run(() => assignConversation(thread.id, v ? Number(v) : null), v ? "Sohbet atandı." : "Atama kaldırıldı.");

  return (
    <div className="relative grid min-h-[520px] grid-cols-[minmax(0,1fr)] overflow-hidden rounded-card border border-line bg-surface md:h-[calc(100dvh-190px)] md:grid-cols-[300px_minmax(0,1fr)] xl:grid-cols-[320px_minmax(0,1fr)_280px]">
      {/* Liste */}
      <aside className={cn("flex min-h-0 min-w-0 flex-col border-line md:border-r", key && "hidden md:flex")} aria-label="Gelen kutusu">
        <div className="border-b border-line px-3 pt-3">
          <label className="relative block">
            <span className="sr-only">Gelen kutusunda ara</span>
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" aria-hidden />
            <input
              id="gelen-ara"
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Ad, e-posta, telefon ya da mesaj"
              className="block min-h-10 w-full rounded-[9px] border border-line bg-surface pr-3 pl-9 text-[14px] text-ink placeholder:text-muted focus:border-accent focus:outline-none pointer-coarse:text-[16px]"
            />
          </label>
        </div>
        <div className="flex gap-1.5 overflow-x-auto border-b border-line p-3 [scrollbar-width:none] md:flex-wrap" role="group" aria-label="Süzgeç">
          {filters.map((f) => (
            <button key={f.key} type="button" aria-pressed={filter === f.key} onClick={() => pickFilter(f.key)} className={cn("min-h-8.5 shrink-0 pointer-coarse:min-h-11 rounded-full border border-line px-3 text-[13px]", filter === f.key ? "border-accent bg-accent-soft text-accent" : "text-text hover:border-accent")}>
              {f.label}
            </button>
          ))}
        </div>
        {selected.size ? (
          <div className="grid gap-2 border-b border-line bg-accent-soft/60 px-3 py-2.5" role="toolbar" aria-label="Seçili kayıtlar">
            <div className="flex items-center justify-between gap-2 text-[13px]">
              <span className="font-medium text-ink">{selected.size} seçili</span>
              <span className="flex gap-3">
                <button type="button" className="text-accent" onClick={() => setSelected(new Set(items.map((it) => it.key)))}>
                  Tümünü seç
                </button>
                <button type="button" className="text-muted hover:text-ink" onClick={() => setSelected(new Set())}>
                  Seçimi kaldır
                </button>
              </span>
            </div>
            {bulkConfirm ? (
              <div className="flex flex-wrap items-center gap-2 text-[13px] text-ink">
                {selected.size} kayıt kalıcı olarak silinsin mi?
                <Button size="sm" variant="danger" disabled={pending} onClick={() => bulk((k) => bulkInbox(k, "sil"), `${selected.size} kayıt silindi.`)}>
                  Evet, sil
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setBulkConfirm(false)}>
                  Vazgeç
                </Button>
              </div>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {selKinds.has("sohbet") ? (
                  <DropdownMenu.Root>
                    <DropdownMenu.Trigger asChild>
                      <Button size="sm" disabled={pending}>
                        <UserPlus /> Ata
                      </Button>
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Portal>
                      <DropdownMenu.Content align="start" sideOffset={6} className={menuBox}>
                        <DropdownMenu.Item className={menuItem} onSelect={() => bulk((k) => bulkInbox(k, "ata", me), "Sohbetler size atandı.")}>
                          Bana ata
                        </DropdownMenu.Item>
                        <DropdownMenu.Item className={menuItem} onSelect={() => bulk((k) => bulkInbox(k, "ata", null), "Atamalar kaldırıldı.")}>
                          Atamayı kaldır
                        </DropdownMenu.Item>
                      </DropdownMenu.Content>
                    </DropdownMenu.Portal>
                  </DropdownMenu.Root>
                ) : null}
                {selKinds.has("sohbet") ? (
                  <Button size="sm" disabled={pending} onClick={() => bulk((k) => bulkInbox(k, "kapat"), "Sohbetler kapatıldı.")}>
                    Kapat
                  </Button>
                ) : null}
                {selKinds.has("sohbet") || selKinds.has("talep") ? <SnoozeMenu disabled={pending} onPick={(iso) => bulk((k) => snoozeItems(k, iso), iso ? "Ertelendi." : "Erteleme kaldırıldı.")} /> : null}
                {selKinds.has("sohbet") ? (
                  <Button size="sm" disabled={pending} onClick={() => bulk((k) => markUnread(k), "Okunmadı olarak işaretlendi.")}>
                    <MailOpen /> Okunmadı
                  </Button>
                ) : null}
                {selKinds.has("sohbet") || selKinds.has("talep") ? (
                  <Button size="sm" disabled={pending} onClick={() => bulk((k) => setSpam(k, filter !== "spam"), filter === "spam" ? "Spam'den çıkarıldı." : "Spam olarak işaretlendi.")}>
                    <Ban /> {filter === "spam" ? "Spam değil" : "Spam"}
                  </Button>
                ) : null}
                {canDelete ? (
                  <Button size="sm" variant="danger" disabled={pending} onClick={() => setBulkConfirm(true)}>
                    <Trash2 /> Sil
                  </Button>
                ) : null}
              </div>
            )}
          </div>
        ) : null}
        <ul className="m-0 min-h-0 flex-1 list-none overflow-y-auto p-0">
          {items.length ? (
            items.map((it) => {
              const Icon = KIND_ICON[it.kind];
              return (
                <li key={it.key} className={cn("flex border-b border-line", selected.has(it.key) && "bg-accent-soft/40")}>
                  <label className="grid w-10 shrink-0 cursor-pointer place-items-start justify-center pt-3.5" title="Seç">
                    <span className="sr-only">{it.title} kaydını seç</span>
                    <input type="checkbox" checked={selected.has(it.key)} onChange={() => toggleSel(it.key)} className="size-4 accent-[var(--accent)]" />
                  </label>
                  <button type="button" onClick={() => open(it.key)} aria-current={it.key === key ? "true" : undefined} className={cn("block min-w-0 flex-1 py-3 pr-3.5 text-left hover:bg-sunken", it.key === key && "bg-accent-soft hover:bg-accent-soft")}>
                    <span className="flex items-center gap-2">
                      <Icon className="size-4 shrink-0 text-muted" aria-label={KIND_LABEL[it.kind]} />
                      <span className="min-w-0 flex-1 truncate font-medium text-ink">{it.title}</span>
                      <span className="tabular shrink-0 text-[12px] text-muted">{stamp(it.at)}</span>
                    </span>
                    <span className="mt-0.5 block truncate text-[13px] text-muted">{it.preview || KIND_LABEL[it.kind]}</span>
                    <span className="mt-1.5 flex min-w-0 items-center gap-2">
                      <Badge tone={it.tone} dot={it.waiting}>
                        {it.label}
                      </Badge>
                      {it.snoozed ? (
                        <span className="inline-flex shrink-0 items-center gap-1 text-[12px] text-muted">
                          <Clock className="size-3" aria-hidden /> {it.snoozed}
                        </span>
                      ) : null}
                      {it.assignee ? <span className="truncate text-[12px] text-muted">{it.assignee}</span> : null}
                    </span>
                  </button>
                </li>
              );
            })
          ) : (
            <li className="px-4 py-6 text-[14px] text-muted">{q.trim() ? `"${q.trim()}" için kayıt bulunamadı.` : filter === "bekleyen" ? "Bekleyen bir şey yok. Yeni sohbet, talep ya da randevu geldiğinde burada görünür." : filter === "benim" ? "Size atanmış sohbet yok." : filter === "ertelenen" ? "Ertelenmiş kayıt yok." : filter === "spam" ? "Spam yok." : "Bu süzgeçte kayıt yok."}</li>
          )}
          {more ? (
            <li className="p-3">
              <Button size="sm" className="w-full justify-center" disabled={pending} onClick={loadMore}>
                Daha fazla yükle
              </Button>
            </li>
          ) : null}
        </ul>
      </aside>

      {/* Yazışma */}
      <section className={cn("flex min-h-0 min-w-0 flex-col", !key && "hidden md:flex")} aria-label="Ayrıntı">
        {thread ? (
          <>
            <header className="flex flex-wrap items-start justify-between gap-3 border-b border-line px-4 py-3">
              <div className="flex min-w-0 items-start gap-2">
                <button type="button" onClick={back} className="grid size-10 shrink-0 place-items-center rounded-[9px] border border-line md:hidden" aria-label="Listeye dön">
                  <ArrowLeft className="size-4" />
                </button>
                <div className="min-w-0">
                  <h2 className="m-0 truncate text-[17px] font-semibold text-ink">{thread.title}</h2>
                  <p className="m-0 truncate text-[13px] text-muted">{thread.subtitle}</p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                    <Badge tone="plain">{KIND_LABEL[thread.kind]}</Badge>
                    <Badge tone={thread.tone} dot={thread.tone === "bad"}>
                      {thread.label}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="ghost" className="xl:hidden" onClick={() => setInfo(true)} aria-label="Kişi ve kayıt bilgisi">
                  <Info /> Bilgiler
                </Button>
                {thread.kind === "sohbet" ? (
                  <>
                    <label className="flex items-center gap-1.5 text-[13px] text-muted">
                      <span className="sr-only sm:not-sr-only">Sorumlu</span>
                      <select
                        id="gelen-sorumlu"
                        value={thread.assignee ?? ""}
                        disabled={pending}
                        onChange={(e) => assign(e.target.value)}
                        className="min-h-8.5 max-w-[160px] rounded-[9px] border border-line bg-surface px-2 text-[13px] text-ink pointer-coarse:min-h-11"
                      >
                        <option value="">Atanmadı</option>
                        {thread.team.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.id === me ? `${t.name} (ben)` : t.name}
                          </option>
                        ))}
                      </select>
                    </label>
                    {thread.status === "bot" ? (
                      <Button size="sm" disabled={pending} onClick={() => run(() => setConversation(thread.id, "devral"), "Sohbeti devraldınız; asistan susar.")}>
                        Devral
                      </Button>
                    ) : thread.status === "ekip" ? (
                      <Button size="sm" disabled={pending} onClick={() => run(() => setConversation(thread.id, "asistan"), "Sohbet asistana geri verildi.")}>
                        <Bot /> Asistana ver
                      </Button>
                    ) : null}
                    {thread.status !== "kapali" ? (
                      <Button size="sm" disabled={pending} onClick={() => run(() => setConversation(thread.id, "kapat"), "Sohbet kapatıldı.")}>
                        Kapat
                      </Button>
                    ) : (
                      <Button size="sm" disabled={pending} onClick={() => run(() => setConversation(thread.id, "ac"), "Sohbet yeniden açıldı.")}>
                        Yeniden aç
                      </Button>
                    )}
                  </>
                ) : thread.kind === "talep" ? (
                  <StatusPicker
                    value={thread.status}
                    disabled={pending}
                    options={[["yeni", "Yeni"], ["iletisim", "İletişime geçildi"], ["teklif", "Teklif verildi"], ["kazanildi", "Kazanıldı"], ["kaybedildi", "Kaybedildi"]]}
                    onPick={(v, l) => run(() => setStatus("talep", thread.id, v), `Talep: ${l}. Bağlı fırsat da güncellendi.`)}
                  />
                ) : (
                  <StatusPicker
                    value={thread.status}
                    disabled={pending}
                    options={[["bekliyor", "Onay bekliyor"], ["onaylandi", "Onayla"], ["tamamlandi", "Tamamlandı"], ["iptal", "İptal et"]]}
                    onPick={(v, l) => run(() => setStatus("randevu", thread.id, v), `Randevu: ${l}.${v === "onaylandi" || v === "iptal" ? " Ziyaretçiye e-posta gitti." : ""}`)}
                  />
                )}
                {thread.kind === "randevu" && thread.status !== "iptal" ? <Reschedule id={thread.id} disabled={pending} run={run} /> : null}
                {thread.kind !== "randevu" ? <SnoozeMenu disabled={pending} snoozed={thread.snoozedUntil} onPick={(iso) => run(() => snoozeItems([thread.key], iso), iso ? "Ertelendi; zamanı gelince Bekleyen'e döner." : "Erteleme kaldırıldı.")} /> : null}
                {thread.kind === "sohbet" ? (
                  <Button size="sm" disabled={pending} onClick={() => run(() => markUnread([thread.key]), "Okunmadı olarak işaretlendi.")}>
                    <MailOpen /> Okunmadı
                  </Button>
                ) : null}
                {thread.kind !== "randevu" ? (
                  <Button size="sm" variant="ghost" disabled={pending} onClick={() => run(() => setSpam([thread.key], !thread.spam), thread.spam ? "Spam'den çıkarıldı." : thread.kind === "talep" ? "Spam olarak işaretlendi; otomatik açılan fırsat silindi." : "Spam olarak işaretlendi.")}>
                    <Ban /> {thread.spam ? "Spam değil" : "Spam"}
                  </Button>
                ) : null}
                {canDelete && !confirm ? (
                  <Button size="sm" variant="ghost" disabled={pending} onClick={() => setConfirm(true)} aria-label={`${KIND_LABEL[thread.kind]} kaydını sil`}>
                    <Trash2 /> Sil
                  </Button>
                ) : null}
              </div>
              {confirm ? (
                <div className="flex w-full flex-wrap items-center gap-2 rounded-[10px] border border-line bg-sunken px-3 py-2" role="alert">
                  <span className="text-[14px] text-ink">
                    {thread.kind === "sohbet" ? "Sohbet ve tüm mesajları" : thread.kind === "talep" ? "Talep" : "Randevu"} kalıcı olarak silinsin mi?
                    {thread.kind !== "sohbet" ? <span className="block text-[13px] text-muted">CRM&apos;deki kişi ve fırsat kalır; onları ayrıca silebilirsiniz.</span> : null}
                  </span>
                  <span className="ml-auto flex gap-2">
                    <Button size="sm" variant="danger" disabled={pending} onClick={remove}>
                      Evet, sil
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setConfirm(false)}>
                      Vazgeç
                    </Button>
                  </span>
                </div>
              ) : null}
            </header>

            {thread.duplicates.length ? (
              <div className="grid gap-1.5 border-b border-line bg-warn-soft/60 px-4 py-2.5 text-[13px] text-ink" role="note">
                {thread.duplicates.map((d) => (
                  <div key={d.id} className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span className="min-w-0 flex-1">
                      Bu kişi CRM&apos;de zaten olabilir: <b className="font-semibold">{d.name}</b>
                      {d.detail ? <span className="text-muted"> · {d.detail}</span> : null}
                    </span>
                    <Button size="sm" disabled={pending} onClick={() => run(() => linkToContact(thread.key, d.id), `${d.name} ile birleştirildi.`)}>
                      Bu kişiye bağla
                    </Button>
                  </div>
                ))}
              </div>
            ) : null}

            <div className="min-h-0 flex-1 overflow-y-auto bg-bg px-4 py-4" aria-live="polite">
              <div className="flex flex-col gap-2.5">
                {thread.messages.map((m) => (
                  <div
                    key={m.id}
                    className={cn(
                      "max-w-[80%] whitespace-pre-wrap rounded-[12px] px-3 py-2 text-[14px]",
                      m.role === "ziyaretci" && "self-start border border-line bg-surface text-ink",
                      m.role === "bot" && "self-start bg-sunken text-ink",
                      m.role === "ekip" && "self-end bg-accent text-accent-ink",
                      m.role === "sistem" && "self-center bg-transparent py-0.5 text-center text-[12px] text-muted",
                      m.role === "not" && "self-end border border-dashed border-warn/50 bg-warn-soft text-ink",
                    )}
                  >
                    {m.role !== "sistem" ? (
                      <span className={cn("mb-0.5 flex items-center gap-1 text-[11px]", m.role === "ekip" ? "opacity-80" : "text-muted")}>
                        {m.role === "not" ? <StickyNote className="size-3" aria-hidden /> : null}
                        {m.role === "ziyaretci" ? thread.title : m.role === "bot" ? "Asistan" : (m.author ?? "Ekip")} · {stamp(m.at)}
                        {m.role === "not" ? " · iç not, müşteri görmez" : ""}
                        {m.unanswered ? " · asistan yanıtlayamadı" : ""}
                      </span>
                    ) : null}
                    {m.text}
                    {m.deliveryError ? (
                      <span className="mt-1.5 flex flex-wrap items-center gap-2 rounded-[8px] bg-surface/90 px-2 py-1 text-[12px] text-bad">
                        Gönderilemedi: {m.deliveryError}
                        <button type="button" className="inline-flex items-center gap-1 font-medium text-accent" disabled={pending} onClick={() => run(() => retryDelivery(Number(m.id)), "Mesaj yeniden gönderildi.")}>
                          <RotateCcw className="size-3" aria-hidden /> Tekrar dene
                        </button>
                      </span>
                    ) : null}
                  </div>
                ))}
                <div ref={endRef} />
              </div>
            </div>

            <Composer key={thread.key} thread={thread} me={me} pending={pending} reply={reply} setReply={setReply} run={run} />
          </>
        ) : (
          <div className="grid flex-1 place-items-center p-6 text-center text-muted">Soldan bir kayıt seçin.</div>
        )}
      </section>

      {/* Kişi ve CRM bilgisi */}
      {thread ? (
        <aside
          className={cn(
            "min-h-0 overflow-y-auto border-l border-line bg-surface px-4 py-4 xl:static xl:block xl:w-auto xl:shadow-none",
            info ? "absolute inset-y-0 right-0 z-20 block w-[min(320px,92%)] shadow-[-12px_0_32px_rgba(1,20,65,.12)]" : "hidden",
          )}
          aria-label="Kişi bilgisi"
        >
          <div className="mb-2 flex items-center justify-between">
            <h3 className="m-0 text-[12px] font-semibold text-muted">Bilgiler</h3>
            <button type="button" onClick={() => setInfo(false)} className="grid size-9 place-items-center rounded-[8px] text-muted hover:bg-sunken xl:hidden" aria-label="Bilgileri kapat">
              <X className="size-4" />
            </button>
          </div>
          <Fields rows={thread.fields.map(([k, v]) => [k, contactValue(k, v)] as [string, React.ReactNode])} />
          <h3 className="mt-5 mb-2 text-[12px] font-semibold text-muted">Kişi</h3>
          {thread.contact ? (
            <>
              <p className="m-0 font-medium text-ink">{thread.contact.name}</p>
              <p className="m-0 flex flex-col text-[13px] break-words text-muted">
                {thread.contact.email ? contactValue("E-posta", thread.contact.email) : null}
                {thread.contact.phone ? contactValue("Telefon", thread.contact.phone) : null}
              </p>
              <Link href={`/panel/gelen?${new URLSearchParams({ ...(filter !== "bekleyen" ? { f: filter } : {}), s: thread.key, panel: `kisi-${thread.contact.id}` })}`} scroll={false} className="mt-1.5 inline-block text-[14px] text-accent">
                Kişi kaydını aç
              </Link>
            </>
          ) : (
            <p className="m-0 text-[14px] text-muted">CRM kaydı yok.</p>
          )}
          {thread.deals.length ? (
            <>
              <h3 className="mt-5 mb-2 text-[12px] font-semibold text-muted">Fırsatlar</h3>
              <ul className="m-0 list-none p-0">
                {thread.deals.map((d) => (
                  <li key={d.id} className="mb-1.5">
                    <Link href={`/panel/gelen?${new URLSearchParams({ ...(filter !== "bekleyen" ? { f: filter } : {}), s: thread.key, panel: `firsat-${d.id}` })}`} scroll={false} className="block rounded-[8px] border border-line px-3 py-2 no-underline hover:border-accent">
                      <span className="block truncate font-medium text-ink">{d.title}</span>
                      <span className="text-[13px] text-muted">
                        {d.stage} · <span className="tabular">{money.format(d.value)}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          ) : null}
          {thread.links.length ? (
            <div className="mt-5 flex flex-col gap-1">
              {thread.links.map((l) =>
                /* Yalnız gelen kutusu içi bağlantılar yerinde açılır; diğer panel sayfaları (ör. Tüm alanları düzenle) normal bağlantı */
                l.href.startsWith("/panel/gelen?") ? (
                  <button key={l.label} type="button" onClick={() => open(new URL(l.href, "http://x").searchParams.get("s") ?? "")} className="text-left text-[14px] text-accent">
                    {l.label}
                  </button>
                ) : (
                  <a key={l.label} href={l.href} className="text-[14px] text-accent">
                    {l.label}
                  </a>
                ),
              )}
            </div>
          ) : null}
        </aside>
      ) : null}
    </div>
  );
}

function StatusPicker({ value, options, disabled, onPick }: { value: string; options: [string, string][]; disabled?: boolean; onPick: (v: string, label: string) => void }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Durum">
      <span className="text-[12px] text-muted">Durumu değiştir:</span>
      {options
        .filter(([v]) => v !== value)
        .map(([v, l]) => (
          <Button key={v} size="sm" variant={v === "onaylandi" || v === "iletisim" ? "primary" : "secondary"} disabled={disabled} onClick={() => onPick(v, l)}>
            {l}
          </Button>
        ))}
    </div>
  );
}

type Mode = "yanit" | "not" | "eposta";
type Popup = { type: "/" | "@"; query: string; from: number; to: number } | null;
const firstName = (s: string) => s.trim().split(/\s+/)[0] ?? "";

/**
 * Yazı kutusu. Sohbette Yanıt (müşteriye) ya da İç not; talep ve randevuda
 * E-posta ya da İç not. "/" hazır yanıtları açar ({ad} müşterinin adıyla
 * dolar), iç notta "@" ekip arkadaşını seçer ve ona bildirim gider.
 */
function Composer({ thread, me, pending, reply, setReply, run }: { thread: Thread; me: number; pending: boolean; reply: string; setReply: (v: string | ((cur: string) => string)) => void; run: (job: () => Promise<{ ok: boolean; error?: string }>, done: string) => void }) {
  const chat = thread.kind === "sohbet";
  const [mode, setMode] = useState<Mode>(chat ? "yanit" : "eposta");
  const [subject, setSubject] = useState(thread.kind === "talep" ? "Talebiniz hakkında" : "Randevunuz hakkında");
  const [mentions, setMentions] = useState<{ id: number; name: string }[]>([]);
  const [popup, setPopup] = useState<Popup>(null);
  const [hi, setHi] = useState(0);
  const box = useRef<HTMLTextAreaElement>(null);

  const fill = (t: string) => t.replace(/\{ad\}/gi, firstName(thread.title)).replace(/\{adsoyad\}/gi, thread.title);
  const options =
    popup?.type === "/"
      ? thread.canned.filter((c) => `${c.label} ${c.text}`.toLocaleLowerCase("tr").includes(popup.query.toLocaleLowerCase("tr"))).map((c) => ({ key: c.label, label: c.label, detail: fill(c.text), value: fill(c.text) }))
      : popup?.type === "@"
        ? thread.team.filter((t) => t.id !== me && t.name.toLocaleLowerCase("tr").includes(popup.query.toLocaleLowerCase("tr"))).map((t) => ({ key: String(t.id), label: t.name, detail: "", value: `@${t.name} `, id: t.id }))
        : [];

  const onType = (v: string, caret: number) => {
    setReply(v);
    const m = /(^|\s)([/@])([^\s/@]*)$/.exec(v.slice(0, caret));
    if (m && (m[2] === "/" ? thread.canned.length > 0 : mode === "not")) {
      setPopup({ type: m[2] as "/" | "@", query: m[3], from: caret - m[3].length - 1, to: caret });
      setHi(0);
    } else setPopup(null);
  };
  const pick = (o: { value: string; label: string; id?: number }) => {
    if (!popup) return;
    const next = reply.slice(0, popup.from) + o.value + reply.slice(popup.to);
    setReply(next);
    if (o.id) setMentions((cur) => (cur.some((x) => x.id === o.id) ? cur : [...cur, { id: o.id!, name: o.label }]));
    setPopup(null);
    requestAnimationFrame(() => {
      const pos = popup.from + o.value.length;
      box.current?.focus();
      box.current?.setSelectionRange(pos, pos);
    });
  };

  const send = () => {
    const text = reply.trim();
    if (!text || pending) return;
    setReply("");
    setPopup(null);
    const restore = <T extends { ok: boolean }>(r: T) => {
      if (!r.ok) setReply((cur) => cur || text);
      return r;
    };
    if (mode === "yanit") run(async () => restore(await replyChat(thread.id, text)), "Yanıt gönderildi.");
    else if (mode === "not") {
      const ids = mentions.filter((m) => text.includes(`@${m.name}`)).map((m) => m.id);
      run(async () => restore(await addInternalNote(thread.key, text, ids)), ids.length ? "Not eklendi; bahsettiğiniz kişilere bildirim gitti." : "Not eklendi.");
      setMentions([]);
    } else run(async () => restore(await replyByEmail(thread.key, subject, text)), `E-posta ${thread.replyTo} adresine gönderildi.`);
  };

  const modes: [Mode, string, React.ComponentType<{ className?: string }>][] = chat
    ? [["yanit", "Yanıt", Send], ["not", "İç not", StickyNote]]
    : [["eposta", "E-posta", Mail], ["not", "İç not", StickyNote]];
  const hint =
    mode === "not"
      ? "Not yalnız ekipte görünür. @ ile ekip arkadaşınızı anın, bildirim alır."
      : mode === "eposta"
        ? `Markalı e-posta ${thread.replyTo || "kişinin adresine"} gider; yanıtlar sizin adresinize gelir.`
        : "Yazdığınızda asistan bu sohbette susar; ziyaretçi yanıtı birkaç saniye içinde görür.";

  return (
    <form
      className={cn("relative border-t border-line p-3", mode === "not" && "bg-warn-soft/40")}
      onSubmit={(e) => {
        e.preventDefault();
        send();
      }}
    >
      <div className="mb-2 flex flex-wrap items-center gap-1.5">
        <div className="flex rounded-[9px] border border-line bg-surface p-0.5" role="tablist" aria-label="Yazı türü">
          {modes.map(([k, l, Icon]) => (
            <button key={k} type="button" role="tab" aria-selected={mode === k} onClick={() => setMode(k)} className={cn("inline-flex min-h-8 items-center gap-1.5 rounded-[7px] px-2.5 text-[13px]", mode === k ? "bg-accent-soft font-medium text-accent" : "text-text hover:text-ink")}>
              <Icon className="size-3.5" /> {l}
            </button>
          ))}
        </div>
        {mode !== "not"
          ? thread.canned.map((c) => (
              <button key={c.label} type="button" title={fill(c.text)} onClick={() => setReply((r) => (r ? `${r} ${fill(c.text)}` : fill(c.text)))} className="min-h-8 rounded-full border border-line bg-surface px-3 text-[13px] hover:border-accent">
                {c.label}
              </button>
            ))
          : null}
        {thread.canned.length && mode !== "not" ? <span className="text-[12px] text-muted">ya da &quot;/&quot; yazın</span> : null}
      </div>
      {mode === "eposta" ? (
        <label className="mb-2 block">
          <span className="sr-only">Konu</span>
          <input id="gelen-konu" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Konu" className="block min-h-9 w-full rounded-[9px] border border-line bg-surface px-3 text-[14px] text-ink focus:border-accent focus:outline-none pointer-coarse:text-[16px]" />
        </label>
      ) : null}
      {popup && options.length ? (
        <ul className="absolute right-3 bottom-[calc(100%-8px)] left-3 z-10 m-0 max-h-56 list-none overflow-y-auto rounded-[10px] border border-line bg-surface p-1 shadow-pop" role="listbox" aria-label={popup.type === "/" ? "Hazır yanıtlar" : "Ekip"}>
          {options.map((o, i) => (
            <li key={o.key} role="option" aria-selected={i === hi}>
              <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => pick(o)} className={cn("block w-full rounded-[7px] px-2.5 py-1.5 text-left", i === hi ? "bg-sunken" : "hover:bg-sunken")}>
                <span className="block text-[14px] font-medium text-ink">{popup.type === "@" ? `@${o.label}` : o.label}</span>
                {o.detail ? <span className="line-clamp-2 block text-[12px] text-muted">{o.detail}</span> : null}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      <div className="flex items-end gap-2">
        <label className="min-w-0 flex-1">
          <span className="sr-only">{mode === "not" ? "İç not" : mode === "eposta" ? "E-posta" : "Yanıt"}</span>
          <textarea
            id="gelen-yanit"
            ref={box}
            rows={mode === "eposta" ? 4 : 2}
            value={reply}
            onChange={(e) => onType(e.target.value, e.target.selectionStart ?? e.target.value.length)}
            onBlur={() => setTimeout(() => setPopup(null), 150)}
            onKeyDown={(e) => {
              if (popup && options.length) {
                if (e.key === "ArrowDown") return void (e.preventDefault(), setHi((h) => (h + 1) % options.length));
                if (e.key === "ArrowUp") return void (e.preventDefault(), setHi((h) => (h - 1 + options.length) % options.length));
                if (e.key === "Enter" || e.key === "Tab") return void (e.preventDefault(), pick(options[Math.min(hi, options.length - 1)]));
                if (e.key === "Escape") return void (e.preventDefault(), setPopup(null));
              }
              /* Sohbet ve notta Enter gönderir; e-postada Cmd/Ctrl+Enter */
              if (e.key === "Enter" && !e.shiftKey && (mode !== "eposta" || e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                send();
              }
            }}
            placeholder={mode === "not" ? "İç not yazın; @ ile ekip arkadaşını anın" : mode === "eposta" ? "E-posta metni (Cmd+Enter gönderir)" : thread.status === "kapali" ? "Sohbet kapandı; yazarsanız yeniden açılır." : "Yanıt yazın (Enter gönderir, Shift+Enter yeni satır)"}
            className="block max-h-48 w-full resize-y rounded-[9px] border border-line bg-surface px-3 py-2 text-[14px] text-ink placeholder:text-muted focus:border-accent focus:outline-none pointer-coarse:text-[16px]"
          />
        </label>
        <Button type="submit" variant="primary" disabled={pending || !reply.trim() || (mode === "eposta" && !subject.trim())} aria-label={mode === "not" ? "Notu ekle" : "Gönder"}>
          {mode === "not" ? <StickyNote /> : <Send />} <span className="hidden sm:inline">{mode === "not" ? "Not ekle" : "Gönder"}</span>
        </Button>
      </div>
      <p className="mt-1.5 mb-0 text-[12px] text-muted">{hint}</p>
    </form>
  );
}

/** Randevunun gün ve saatini değiştir: takvimdeki boş saatler; ziyaretçiye yeni saat e-postası gider */
function Reschedule({ id, disabled, run }: { id: number; disabled: boolean; run: (job: () => Promise<{ ok: boolean; error?: string }>, done: string) => void }) {
  const [open, setOpen] = useState(false);
  const [plan, setPlan] = useState<Awaited<ReturnType<typeof bookingSlots>> | null>(null);
  const [day, setDay] = useState("");
  const [loading, start] = useTransition();
  const load = () => {
    setOpen(true);
    start(async () => {
      const p = await bookingSlots(id);
      setPlan(p);
      setDay(p.gunler?.find((g) => g.saatler.some((x) => !x.dolu))?.gun ?? "");
    });
  };
  const dayFmt = (k: string) => new Intl.DateTimeFormat("tr-TR", { timeZone: "UTC", weekday: "short", day: "numeric", month: "short" }).format(new Date(`${k}T12:00:00Z`));
  const g = plan?.gunler?.find((x) => x.gun === day);
  return (
    <>
      <Button size="sm" disabled={disabled} onClick={load}>
        <CalendarClock /> Saati değiştir
      </Button>
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-overlay" />
          <Dialog.Content className="fixed top-1/2 left-1/2 z-50 max-h-[90dvh] w-[min(520px,calc(100%-32px))] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-[12px] border border-line bg-surface p-5 shadow-pop focus:outline-none">
            <Dialog.Title className="m-0 text-[18px] font-semibold text-ink">Randevunun saatini değiştir</Dialog.Title>
            <Dialog.Description className="mt-1 mb-3 text-[14px] text-muted">Çalışma takvimindeki boş saatler. Kaydedince ziyaretçiye yeni saatle e-posta gider.</Dialog.Description>
            {loading && !plan ? <p className="text-[14px] text-muted">Saatler yükleniyor…</p> : null}
            {plan && !plan.ok ? <p className="text-[14px] text-bad">{plan.error}</p> : null}
            {plan?.gunler ? (
              <>
                <div className="mb-3 flex gap-1.5 overflow-x-auto pb-1" role="radiogroup" aria-label="Gün">
                  {plan.gunler.map((x) => (
                    <button key={x.gun} type="button" role="radio" aria-checked={day === x.gun} onClick={() => setDay(x.gun)} className={cn("min-h-9 shrink-0 rounded-full border px-3 text-[13px]", day === x.gun ? "border-accent bg-accent-soft text-accent" : "border-line text-text hover:border-accent")}>
                      {dayFmt(x.gun)}
                    </button>
                  ))}
                </div>
                {g?.not ? <p className="mb-2 text-[13px] text-muted">{g.not}</p> : null}
                <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-4">
                  {(g?.saatler ?? []).map((x) => {
                    const current = plan.current === `${day} ${x.s}`;
                    return (
                      <Button
                        key={x.s}
                        size="sm"
                        variant={current ? "primary" : "secondary"}
                        disabled={x.dolu || current || disabled}
                        onClick={() => {
                          setOpen(false);
                          run(() => rescheduleBooking(id, day, x.s), `Randevu ${dayFmt(day)} ${x.s} olarak değişti.`);
                        }}
                        className="justify-center"
                      >
                        {x.s}
                        {x.dolu ? <span className="sr-only"> dolu</span> : null}
                      </Button>
                    );
                  })}
                </div>
              </>
            ) : null}
            <div className="mt-4 flex justify-end">
              <Button onClick={() => setOpen(false)}>Kapat</Button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
