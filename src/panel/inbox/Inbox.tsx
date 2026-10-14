"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { ArrowLeft, Bot, CalendarCheck, FileText, MessageCircle, Send } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Fields } from "../ui/sheet";
import { getThread, listInbox, replyChat, setConversation, setStatus, type InboxFilter, type InboxItem, type InboxKind, type Thread } from "./actions";

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

/** Adres satırı: seçili kayıt ve süzgeç paylaşılabilir, sayfa sunucuya yeniden gitmeden güncellenir */
const writeUrl = (filter: InboxFilter, key: string) => {
  const p = new URLSearchParams();
  if (filter !== "bekleyen") p.set("f", filter);
  if (key) p.set("s", key);
  window.history.replaceState(null, "", `/panel/gelen${p.toString() ? `?${p}` : ""}`);
};

export function Inbox({ filters, initialFilter, initialItems, initialThread }: { filters: FilterDef[]; initialFilter: InboxFilter; initialItems: InboxItem[]; initialThread: Thread | null }) {
  const [filter, setFilter] = useState<InboxFilter>(initialFilter);
  const [items, setItems] = useState(initialItems);
  const [thread, setThread] = useState<Thread | null>(initialThread);
  const [key, setKey] = useState(initialThread?.key ?? "");
  const [reply, setReply] = useState("");
  const [pending, start] = useTransition();
  const endRef = useRef<HTMLDivElement>(null);

  const reloadList = useCallback(async (f: InboxFilter) => setItems(await listInbox(f)), []);
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

  const pickFilter = (f: InboxFilter) => {
    setFilter(f);
    writeUrl(f, key);
    start(() => reloadList(f));
  };
  const open = (k: string) => {
    setKey(k);
    setReply("");
    writeUrl(filter, k);
    start(() => reloadThread(k));
  };
  const back = () => {
    setKey("");
    setThread(null);
    writeUrl(filter, "");
  };
  const run = (job: () => Promise<{ ok: boolean; error?: string }>, done: string) =>
    start(async () => {
      const r = await job();
      if (!r.ok) return void toast.error(r.error ?? "İşlem yapılamadı.");
      toast.success(done);
      await Promise.all([reloadThread(key), reloadList(filter)]);
    });
  const send = () => {
    if (!thread || !reply.trim()) return;
    const text = reply;
    setReply("");
    run(() => replyChat(thread.id, text), "Yanıt gönderildi.");
  };

  return (
    <div className="grid min-h-[520px] overflow-hidden rounded-card border border-line bg-surface md:h-[calc(100dvh-190px)] md:grid-cols-[300px_minmax(0,1fr)] xl:grid-cols-[320px_minmax(0,1fr)_280px]">
      {/* Liste */}
      <aside className={cn("flex min-h-0 flex-col border-line md:border-r", key && "hidden md:flex")} aria-label="Gelen kutusu">
        <div className="flex flex-wrap gap-1.5 border-b border-line p-3" role="group" aria-label="Süzgeç">
          {filters.map((f) => (
            <button key={f.key} type="button" aria-pressed={filter === f.key} onClick={() => pickFilter(f.key)} className={cn("min-h-8.5 pointer-coarse:min-h-11 rounded-full border border-line px-3 text-[13px]", filter === f.key ? "border-accent bg-accent-soft text-accent" : "text-text hover:border-accent")}>
              {f.label}
            </button>
          ))}
        </div>
        <ul className="m-0 min-h-0 flex-1 list-none overflow-y-auto p-0">
          {items.length ? (
            items.map((it) => {
              const Icon = KIND_ICON[it.kind];
              return (
                <li key={it.key} className="border-b border-line">
                  <button type="button" onClick={() => open(it.key)} aria-current={it.key === key ? "true" : undefined} className={cn("block w-full px-3.5 py-3 text-left hover:bg-sunken", it.key === key && "bg-accent-soft hover:bg-accent-soft")}>
                    <span className="flex items-center gap-2">
                      <Icon className="size-4 shrink-0 text-muted" aria-label={KIND_LABEL[it.kind]} />
                      <span className="min-w-0 flex-1 truncate font-medium text-ink">{it.title}</span>
                      <span className="tabular shrink-0 text-[12px] text-muted">{stamp(it.at)}</span>
                    </span>
                    <span className="mt-0.5 block truncate text-[13px] text-muted">{it.preview || KIND_LABEL[it.kind]}</span>
                    <span className="mt-1.5 block">
                      <Badge tone={it.tone} dot={it.waiting}>
                        {it.label}
                      </Badge>
                    </span>
                  </button>
                </li>
              );
            })
          ) : (
            <li className="px-4 py-6 text-[14px] text-muted">{filter === "bekleyen" ? "Bekleyen bir şey yok. Yeni sohbet, talep ya da randevu geldiğinde burada görünür." : "Bu süzgeçte kayıt yok."}</li>
          )}
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
                {thread.kind === "sohbet" ? (
                  <>
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
                    onPick={(v, l) => run(() => setStatus("randevu", thread.id, v), `Randevu: ${l}.`)}
                  />
                )}
              </div>
            </header>

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
                    )}
                  >
                    {m.role !== "sistem" ? (
                      <span className={cn("mb-0.5 block text-[11px]", m.role === "ekip" ? "opacity-80" : "text-muted")}>
                        {m.role === "ziyaretci" ? thread.title : m.role === "bot" ? "Asistan" : (m.author ?? "Ekip")} · {stamp(m.at)}
                        {m.unanswered ? " · asistan yanıtlayamadı" : ""}
                      </span>
                    ) : null}
                    {m.text}
                  </div>
                ))}
                <div ref={endRef} />
              </div>
            </div>

            {thread.kind === "sohbet" ? (
              <form
                className="border-t border-line p-3"
                onSubmit={(e) => {
                  e.preventDefault();
                  send();
                }}
              >
                {thread.canned.length ? (
                  <div className="mb-2 flex flex-wrap gap-1.5">
                    {thread.canned.map((c) => (
                      <button key={c.label} type="button" onClick={() => setReply((r) => (r ? `${r} ${c.text}` : c.text))} className="min-h-8 rounded-full border border-line px-3 text-[13px] hover:border-accent">
                        {c.label}
                      </button>
                    ))}
                  </div>
                ) : null}
                <div className="flex items-end gap-2">
                  <label className="min-w-0 flex-1">
                    <span className="sr-only">Yanıt</span>
                    <textarea
                      id="gelen-yanit"
                      rows={2}
                      value={reply}
                      onChange={(e) => setReply(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          send();
                        }
                      }}
                      placeholder={thread.status === "kapali" ? "Sohbet kapandı; yazarsanız yeniden açılır." : "Yanıt yazın (Enter gönderir, Shift+Enter yeni satır)"}
                      className="block max-h-40 w-full resize-y rounded-[9px] border border-line bg-surface px-3 py-2 text-[14px] text-ink placeholder:text-muted focus:border-accent focus:outline-none"
                    />
                  </label>
                  <Button type="submit" variant="primary" disabled={pending || !reply.trim()} aria-label="Gönder">
                    <Send /> <span className="hidden sm:inline">Gönder</span>
                  </Button>
                </div>
                <p className="mt-1.5 mb-0 text-[12px] text-muted">Yazdığınızda asistan bu sohbette susar; ziyaretçi yanıtı birkaç saniye içinde görür.</p>
              </form>
            ) : (
              <div className="border-t border-line px-4 py-3 text-[13px] text-muted">
                {thread.kind === "talep" ? "Talebe e-posta ya da telefonla dönün, sonra durumunu güncelleyin. Durum, bağlı fırsatın aşamasını da değiştirir." : "Randevuyu onaylayın ya da iptal edin; takvim ve CRM kaydı birlikte güncellenir."}
              </div>
            )}
          </>
        ) : (
          <div className="grid flex-1 place-items-center p-6 text-center text-muted">Soldan bir kayıt seçin.</div>
        )}
      </section>

      {/* Kişi ve CRM bilgisi */}
      {thread ? (
        <aside className="hidden min-h-0 overflow-y-auto border-l border-line px-4 py-4 xl:block" aria-label="Kişi bilgisi">
          <h3 className="mt-0 mb-2 text-[12px] font-semibold uppercase tracking-[0.07em] text-muted">Bilgiler</h3>
          <Fields rows={thread.fields} />
          <h3 className="mt-5 mb-2 text-[12px] font-semibold uppercase tracking-[0.07em] text-muted">Kişi</h3>
          {thread.contact ? (
            <>
              <p className="m-0 font-medium text-ink">{thread.contact.name}</p>
              <p className="m-0 text-[13px] break-words text-muted">{[thread.contact.email, thread.contact.phone].filter(Boolean).join(" · ")}</p>
              <Link href={`/panel/kisiler?kisi=${thread.contact.id}`} className="mt-1.5 inline-block text-[14px] text-accent">
                Kişi kaydını aç
              </Link>
            </>
          ) : (
            <p className="m-0 text-[14px] text-muted">CRM kaydı yok.</p>
          )}
          {thread.deals.length ? (
            <>
              <h3 className="mt-5 mb-2 text-[12px] font-semibold uppercase tracking-[0.07em] text-muted">Fırsatlar</h3>
              <ul className="m-0 list-none p-0">
                {thread.deals.map((d) => (
                  <li key={d.id} className="mb-1.5">
                    <a href={`/panel/firsatlar?firsat=${d.id}`} className="block rounded-[8px] border border-line px-3 py-2 no-underline hover:border-accent">
                      <span className="block truncate font-medium text-ink">{d.title}</span>
                      <span className="text-[13px] text-muted">
                        {d.stage} · <span className="tabular">{money.format(d.value)}</span>
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </>
          ) : null}
          {thread.links.length ? (
            <div className="mt-5 flex flex-col gap-1">
              {thread.links.map((l) =>
                l.href.startsWith("/panel") ? (
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
